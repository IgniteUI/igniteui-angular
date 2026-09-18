/*
 * Helpers for reading an exported PDF back. jsPDF keeps no record of what it has drawn, so
 * everything the exporter specs assert is recovered from the content streams of the produced
 * pages: each `text()` call leaves a `BT ... (text) Tj ... ET` block behind and each `rect()`
 * an `x y w h re` operator.
 *
 * Named as a spec so that the test tsconfig compiles it; it holds no tests of its own.
 */
import type { jsPDF } from 'jspdf';

/** A single `text()` call, as recovered from the content stream of the page it was drawn on. */
export interface IRenderedCell {
    /** The drawn text, with the PDF string escaping undone. */
    text: string;
    /** Offset from the left edge of the page, in points. */
    x: number;
    /** Offset from the *top* edge of the page, in points. */
    y: number;
    /** One based page number. */
    page: number;
    /** The internal jsPDF font reference, e.g. `F1` - it identifies both the font and its style. */
    font: string;
    /** The font size the text was drawn with, in points. */
    fontSize: number;
}

/** A rectangle drawn by `rect()`, as recovered from the content stream of its page. */
export interface IDrawnRectangle {
    x: number;
    y: number;
    width: number;
    height: number;
    page: number;
    /** Whether the rectangle was filled (a cell background) rather than stroked (a border). */
    filled: boolean;
}

/**
 * `SampleTestData.contactsData()` as the exporter lays it out. Two of its records have a blank
 * cell, and jsPDF writes nothing at all into the document for empty text, so those two rows come
 * back one cell short - the cell is drawn, it just has no text in it.
 */
/** The page dimensions jsPDF produces for the page sizes and orientations the exporter offers. */
export const PAGE_SIZES = {
    a4Portrait: { width: 595.28, height: 841.89 },
    a4Landscape: { width: 841.89, height: 595.28 },
    letterPortrait: { width: 612, height: 792 },
    letterLandscape: { width: 792, height: 612 },
    legalPortrait: { width: 612, height: 1008 },
    a3Portrait: { width: 841.89, height: 1190.55 },
    a5Portrait: { width: 419.53, height: 595.28 }
};


/** Undo the escaping jsPDF applies when it writes a PDF string literal. */
export const unescapePdfString = (value: string): string => value.replace(/\\([()\\])/g, '$1');

/**
 * jsPDF keeps no record of what it has drawn, so everything the assertions need is read back out
 * of the content streams of the produced pages, where every `text()` call leaves behind a
 * `BT ... (text) Tj ... ET` block.
 */
export const getRenderedCells = (pdf: jsPDF | undefined): IRenderedCell[] => {
    // `internal.pages` is one based - the element at index 0 is an unused placeholder.
    const pages = (pdf?.internal.pages ?? []) as unknown as string[][];
    const pageHeight = pdf?.internal.pageSize.getHeight() ?? 0;
    const cells: IRenderedCell[] = [];

    pages.slice(1).forEach((page, index) => {
        const textBlocks = page.join('\n').match(/BT\n[\s\S]*?\nET/g) ?? [];

        textBlocks.forEach(block => {
            const drawn = /\((?:\\.|[^()\\])*\)\s*Tj/.exec(block);
            const position = /(-?[\d.]+) (-?[\d.]+) Td/.exec(block);
            const font = /\/(\w+) ([\d.]+) Tf/.exec(block);

            if (!drawn) {
                return;
            }

            cells.push({
                text: unescapePdfString(drawn[0].replace(/\)\s*Tj$/, '').substring(1)),
                x: position ? parseFloat(position[1]) : 0,
                // PDF measures y from the bottom of the page - flip it so that the assertions can
                // read top to bottom, the way the exported table is laid out.
                y: position ? pageHeight - parseFloat(position[2]) : 0,
                page: index + 1,
                font: font ? font[1] : '',
                fontSize: font ? parseFloat(font[2]) : 0
            });
        });
    });

    return cells;
};

/** Every piece of text in the document, in the order it was drawn. */
export const getRenderedText = (pdf: jsPDF | undefined): string[] => getRenderedCells(pdf).map(cell => cell.text);

/**
 * The document laid back out as a table: the cells grouped into the rows they share a baseline
 * with, ordered down the page and then left to right. Merged header cells are centred vertically
 * over the rows they span, so they form a row of their own.
 *
 * jsPDF writes nothing into the document for empty text, so a blank cell - a null, an undefined or
 * a value the exporter could not resolve - leaves no entry in its row. A row can therefore come
 * back shorter than the header above it; `getDrawnRectangles` still shows the cell was drawn.
 */
export const getRenderedRows = (pdf: jsPDF | undefined): string[][] => {
    const rows = new Map<string, IRenderedCell[]>();

    for (const cell of getRenderedCells(pdf)) {
        // Cells of the same row are drawn at an identical baseline, so rounding only guards
        // against the floating point noise of the page height flip.
        const key = `${cell.page}:${cell.y.toFixed(2)}`;
        rows.set(key, [...(rows.get(key) ?? []), cell]);
    }

    return [...rows.values()]
        .sort((a, b) => (a[0].page - b[0].page) || (a[0].y - b[0].y))
        .map(row => [...row].sort((a, b) => a.x - b.x).map(cell => cell.text));
};

/** The same as `getRenderedRows`, but kept split per page. */
export const getRenderedRowsByPage = (pdf: jsPDF | undefined): string[][][] => {
    const pageCount = (pdf?.internal.pages?.length ?? 1) - 1;
    const cells = getRenderedCells(pdf);

    return Array.from({ length: pageCount }, (_, index) => {
        const page = index + 1;
        const rows = new Map<string, IRenderedCell[]>();

        for (const cell of cells.filter(c => c.page === page)) {
            rows.set(cell.y.toFixed(2), [...(rows.get(cell.y.toFixed(2)) ?? []), cell]);
        }

        return [...rows.values()]
            .sort((a, b) => a[0].y - b[0].y)
            .map(row => [...row].sort((a, b) => a.x - b.x).map(cell => cell.text));
    });
};

/** Every rectangle in the document - the exporter draws one per cell background and per border. */
export const getDrawnRectangles = (pdf: jsPDF | undefined): IDrawnRectangle[] => {
    const pages = (pdf?.internal.pages ?? []) as unknown as string[][];
    const pageHeight = pdf?.internal.pageSize.getHeight() ?? 0;
    const rectangles: IDrawnRectangle[] = [];

    pages.slice(1).forEach((page, index) => {
        const content = page.join('\n');
        const operator = /(-?[\d.]+) (-?[\d.]+) (-?[\d.]+) (-?[\d.]+) re\s+([fS])/g;
        let match: RegExpExecArray | null;

        while ((match = operator.exec(content)) !== null) {
            const height = Math.abs(parseFloat(match[4]));

            rectangles.push({
                x: parseFloat(match[1]),
                // jsPDF writes the rectangle from its top edge measured up from the bottom of the
                // page, and gives it a negative height so that it extends downwards. Flip that
                // back to an offset from the top, so it lines up with the `y` of the cells drawn
                // inside the rectangle.
                y: pageHeight - parseFloat(match[2]),
                width: parseFloat(match[3]),
                height,
                page: index + 1,
                filled: match[5] === 'f'
            });
        }
    });

    return rectangles;
};

/** The page dimensions of the document, rounded to the two decimals jsPDF itself reports. */
export const getPageDimensions = (pdf: jsPDF | undefined) => ({
    width: Math.round((pdf?.internal.pageSize.getWidth() ?? 0) * 100) / 100,
    height: Math.round((pdf?.internal.pageSize.getHeight() ?? 0) * 100) / 100
});

/** The number of pages the exporter ended up producing. */
export const getPageCount = (pdf: jsPDF | undefined): number => (pdf?.internal.pages?.length ?? 1) - 1;

/** The internal reference jsPDF uses for a font and style pair, e.g. `F1`. */
export const getFontRef = (pdf: jsPDF | undefined, name: string, style: string): string =>
    (pdf as any)?.internal.getFont(name, style).id;

/**
 * The distinct fonts the text in the document was drawn with. Read from the content streams
 * rather than from `getRenderedCells`, so that the draws jsPDF writes as hex glyph ids - which is
 * what an embedded font produces - are counted as well.
 */
export const getUsedFontRefs = (pdf: jsPDF | undefined): Set<string> => {
    const pages = (pdf?.internal.pages ?? []) as unknown as string[][];
    const refs = new Set<string>();

    for (const page of pages.slice(1)) {
        for (const block of page.join('\n').match(/BT\n[\s\S]*?\nET/g) ?? []) {
            const font = /\/(\w+) [\d.]+ Tf/.exec(block);

            if (font && /(?:\)|>)\s*Tj/.test(block)) {
                refs.add(font[1]);
            }
        }
    }

    return refs;
};

/**
 * The number of text draws in the document. With an embedded font jsPDF writes glyph ids in hex
 * instead of readable text, and those draws never turn up in `getRenderedCells` - this counts
 * both forms, so a document set in a custom font can still be checked for what it holds.
 */
export const getTextDrawCount = (pdf: jsPDF | undefined): number => {
    const pages = (pdf?.internal.pages ?? []) as unknown as string[][];

    return pages.slice(1)
        .reduce((total, page) => total + (page.join('\n').match(/(?:\)|>)\s*Tj/g) ?? []).length, 0);
};

/**
 * The cell a header caption was drawn in. Header cells are the only ones the exporter both fills
 * and strokes, so the filled rectangles are exactly the header grid, and the one holding the
 * caption is the cell that caption heads. Use it to check that a column group is drawn over the
 * columns it spans rather than merely on the right level.
 */
export const getHeaderCellOf = (pdf: jsPDF | undefined, text: string, page = 1): IDrawnRectangle => {
    const label = getRenderedCells(pdf).find(cell => cell.page === page && cell.text === text);

    if (!label) {
        throw new Error(`No header drawn with the text '${text}' on page ${page}`);
    }

    const cell = getDrawnRectangles(pdf).find(rectangle =>
        rectangle.filled && rectangle.page === page &&
        label.x >= rectangle.x && label.x <= rectangle.x + rectangle.width &&
        label.y >= rectangle.y && label.y <= rectangle.y + rectangle.height);

    if (!cell) {
        throw new Error(`'${text}' is drawn on page ${page} but not inside a header cell`);
    }

    return cell;
};
