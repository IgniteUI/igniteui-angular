import { ExportUtilities } from '../exporter-common/export-utilities';
import { IgxPdfExporterService } from './pdf-exporter';
import { IgxPdfExporterOptions } from './pdf-exporter-options';
import { SampleTestData } from '../../../../../test-utils/sample-test-data.spec';
import { first } from 'rxjs/operators';
import { ExportRecordType, ExportHeaderType, DEFAULT_OWNER, IExportRecord, IColumnInfo, IColumnList, GRID_LEVEL_COL } from '../exporter-common/base-export-service';
import type { jsPDF } from 'jspdf';

/** A single `text()` call, as recovered from the content stream of the page it was drawn on. */
interface IRenderedCell {
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
interface IDrawnRectangle {
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
const CONTACTS_ROWS = [
    ['name', 'phone'],
    ['Terrance Orta', '770-504-2217'],
    ['Richard Mahoney LongerName'],
    ['Donna Price', '859-496-2817'],
    ['901-747-3428'],
    ['Dorothy H. Spencer', '573-394-9254']
];

/** The warning the exporter logs when it is handed a custom font it cannot use. */
const INCOMPLETE_FONT_WARNING = 'Custom font configuration is incomplete (missing name or data), falling back to helvetica';

/** The page dimensions jsPDF produces for the page sizes and orientations the exporter offers. */
const PAGE_SIZES = {
    a4Portrait: { width: 595.28, height: 841.89 },
    a4Landscape: { width: 841.89, height: 595.28 },
    letterPortrait: { width: 612, height: 792 },
    letterLandscape: { width: 792, height: 612 },
    legalPortrait: { width: 612, height: 1008 },
    a3Portrait: { width: 841.89, height: 1190.55 },
    a5Portrait: { width: 419.53, height: 595.28 }
};

/** Undo the escaping jsPDF applies when it writes a PDF string literal. */
const unescapePdfString = (value: string): string => value.replace(/\\([()\\])/g, '$1');

/**
 * jsPDF keeps no record of what it has drawn, so everything the assertions need is read back out
 * of the content streams of the produced pages, where every `text()` call leaves behind a
 * `BT ... (text) Tj ... ET` block.
 */
const getRenderedCells = (pdf: jsPDF | undefined): IRenderedCell[] => {
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
const getRenderedText = (pdf: jsPDF | undefined): string[] => getRenderedCells(pdf).map(cell => cell.text);

/**
 * The document laid back out as a table: the cells grouped into the rows they share a baseline
 * with, ordered down the page and then left to right. Merged header cells are centred vertically
 * over the rows they span, so they form a row of their own.
 *
 * jsPDF writes nothing into the document for empty text, so a blank cell - a null, an undefined or
 * a value the exporter could not resolve - leaves no entry in its row. A row can therefore come
 * back shorter than the header above it; `getDrawnRectangles` still shows the cell was drawn.
 */
const getRenderedRows = (pdf: jsPDF | undefined): string[][] => {
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
const getRenderedRowsByPage = (pdf: jsPDF | undefined): string[][][] => {
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
const getDrawnRectangles = (pdf: jsPDF | undefined): IDrawnRectangle[] => {
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
                // `rect()` is given the top edge, which jsPDF turns into the bottom one - flip it
                // back so that it matches the `y` of the cells drawn inside the rectangle.
                y: pageHeight - parseFloat(match[2]) - height,
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
const getPageDimensions = (pdf: jsPDF | undefined) => ({
    width: Math.round((pdf?.internal.pageSize.getWidth() ?? 0) * 100) / 100,
    height: Math.round((pdf?.internal.pageSize.getHeight() ?? 0) * 100) / 100
});

/** The number of pages the exporter ended up producing. */
const getPageCount = (pdf: jsPDF | undefined): number => (pdf?.internal.pages?.length ?? 1) - 1;

/** The internal reference jsPDF uses for a font and style pair, e.g. `F1`. */
const getFontRef = (pdf: jsPDF | undefined, name: string, style: string): string =>
    (pdf as any)?.internal.getFont(name, style).id;

/** The distinct fonts the text in the document was actually drawn with. */
const getUsedFontRefs = (pdf: jsPDF | undefined): Set<string> =>
    new Set(getRenderedCells(pdf).map(cell => cell.font));

describe('PDF Exporter', () => {
    let exporter: IgxPdfExporterService;
    let options: IgxPdfExporterOptions;

    beforeEach(() => {
        exporter = new IgxPdfExporterService();
        options = new IgxPdfExporterOptions('PdfExport');

        // Clear owners map between tests
        (exporter as any)._ownersMap.clear();

        // Spy the saveBlobToFile method so the files are not really created
        spyOn(ExportUtilities, 'saveBlobToFile');
    });

    /**
     * `exportData` re-wraps every element it is given as a plain `DataRecord`, so it cannot be used
     * to exercise the pivot, hierarchical, tree and summary code paths - handed export records it
     * would export the record wrappers themselves. These tests pass the already built export
     * records straight to the exporter instead, which is what a grid does.
     */
    const exportRecords = (records: IExportRecord[]) => {
        (exporter as any).options = options;
        (exporter as any).isPivotGridExport = records[0]?.type === ExportRecordType.PivotGridRecord;
        (exporter as any).exportGridRecordsData(records);
    };

    /**
     * Hands the records straight to the PDF exporter, skipping the preparation the base exporter
     * does on the way in. Only needed for the few cases the base exporter refuses to prepare at
     * all, such as a record whose owner is missing from the owners map.
     */
    const drawRecords = (records: IExportRecord[]) => {
        (exporter as any).exportDataImplementation(records, options, () => { });
    };

    it('should be created', () => {
        expect(exporter).toBeTruthy();
    });

    it('should export empty data without errors', (done) => {
        exporter.exportEnded.pipe(first()).subscribe((args) => {
            expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
            // A single, entirely blank page - there is neither a header nor a row to draw.
            expect(getPageCount(args.pdf)).toBe(1);
            expect(getRenderedText(args.pdf)).toEqual([]);
            done();
        });

        exporter.exportData([], options);
    });

    it('should export simple data successfully', (done) => {
        const simpleData = [
            { Name: 'John', Age: 30 },
            { Name: 'Jane', Age: 25 }
        ];

        exporter.exportEnded.pipe(first()).subscribe((args) => {
            expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
            expect(getRenderedRows(args.pdf)).toEqual([
                ['Name', 'Age'],
                ['John', '30'],
                ['Jane', '25']
            ]);
            done();
        });

        exporter.exportData(simpleData, options);
    });

    it('should export contacts data successfully', (done) => {
        exporter.exportEnded.pipe(first()).subscribe((args) => {
            expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
            expect(getRenderedRows(args.pdf)).toEqual(CONTACTS_ROWS);
            done();
        });

        exporter.exportData(SampleTestData.contactsData(), options);
    });

    it('should draw the header row in bold and the data rows in the regular font', (done) => {
        exporter.exportEnded.pipe(first()).subscribe((args) => {
            const cells = getRenderedCells(args.pdf);
            const headerFont = cells.filter(cell => cell.y === cells[0].y).map(cell => cell.font);
            const dataFonts = cells.filter(cell => cell.y !== cells[0].y).map(cell => cell.font);

            // Two distinct font references, one used for the header row and one for everything
            // below it - jsPDF gives a font and style pair a reference of its own.
            expect(new Set(headerFont).size).toBe(1);
            expect(new Set(dataFonts).size).toBe(1);
            expect(headerFont[0]).not.toEqual(dataFonts[0]);
            done();
        });

        exporter.exportData(SampleTestData.contactsData(), options);
    });

    it('should export with custom page orientation', (done) => {
        options.pageOrientation = 'landscape';

        exporter.exportEnded.pipe(first()).subscribe((args) => {
            expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
            expect(getPageDimensions(args.pdf)).toEqual(PAGE_SIZES.a4Landscape);
            expect(getRenderedRows(args.pdf)).toEqual(CONTACTS_ROWS);
            done();
        });

        exporter.exportData(SampleTestData.contactsData(), options);
    });

    it('should export with custom page size', (done) => {
        options.pageSize = 'letter';

        exporter.exportEnded.pipe(first()).subscribe((args) => {
            expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
            expect(getPageDimensions(args.pdf)).toEqual(PAGE_SIZES.letterLandscape);
            expect(getRenderedRows(args.pdf)).toEqual(CONTACTS_ROWS);
            done();
        });

        exporter.exportData(SampleTestData.contactsData(), options);
    });

    it('should export without table borders', (done) => {
        options.showTableBorders = false;

        exporter.exportEnded.pipe(first()).subscribe((args) => {
            expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
            // Not a single rectangle is drawn - neither the cell borders nor the header
            // background, which is the one filled rectangle a bordered export produces.
            expect(getDrawnRectangles(args.pdf)).toEqual([]);
            expect(getRenderedRows(args.pdf)).toEqual(CONTACTS_ROWS);
            done();
        });

        exporter.exportData(SampleTestData.contactsData(), options);
    });

    it('should draw a bordered cell for every header and data cell', (done) => {
        exporter.exportEnded.pipe(first()).subscribe((args) => {
            const rectangles = getDrawnRectangles(args.pdf);
            const cells = rectangles.filter(rectangle => !rectangle.filled);
            const backgrounds = rectangles.filter(rectangle => rectangle.filled);

            const headerY = Math.min(...cells.map(cell => cell.y));
            const dataCells = cells.filter(cell => cell.y !== headerY);

            // One bordered cell per column of the header row and of each of the five data rows.
            expect(cells.length).toBe(2 * 6);
            expect(dataCells.length).toBe(2 * 5);
            // All the same width, tiling the page in two columns from a single left margin, and
            // every data row the same height as the next.
            expect(new Set(cells.map(cell => cell.width)).size).toBe(1);
            expect(new Set(cells.map(cell => cell.x)).size).toBe(2);
            expect(new Set(dataCells.map(cell => cell.height)).size).toBe(1);
            // Behind them, a single filled rectangle shading the header row across both columns.
            expect(backgrounds.length).toBe(1);
            expect(backgrounds[0].width).toBe(cells[0].width * 2);
            expect(backgrounds[0].y).toBe(Math.min(...cells.map(cell => cell.y)));
            done();
        });

        exporter.exportData(SampleTestData.contactsData(), options);
    });

    it('should export with custom font size', (done) => {
        options.fontSize = 12;

        exporter.exportEnded.pipe(first()).subscribe((args) => {
            expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
            expect(getRenderedCells(args.pdf).map(cell => cell.fontSize)).toEqual(
                getRenderedCells(args.pdf).map(() => 12));
            expect(getRenderedRows(args.pdf)).toEqual(CONTACTS_ROWS);
            done();
        });

        exporter.exportData(SampleTestData.contactsData(), options);
    });

    it('should handle null and undefined values', (done) => {
        const dataWithNulls = [
            { Name: 'John', Age: null },
            { Name: undefined, Age: 25 }
        ];

        exporter.exportEnded.pipe(first()).subscribe((args) => {
            expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
            // Both rows are laid out in full, but the null and the undefined become empty text,
            // which jsPDF does not write into the document at all.
            expect(getRenderedRows(args.pdf)).toEqual([
                ['Name', 'Age'],
                ['John'],
                ['25']
            ]);
            expect(getDrawnRectangles(args.pdf).filter(rectangle => !rectangle.filled).length).toBe(2 * 3);
            done();
        });

        exporter.exportData(dataWithNulls, options);
    });

    it('should handle date values', (done) => {
        const dataWithDates = [
            { Name: 'John', BirthDate: new Date('1990-01-01') },
            { Name: 'Jane', BirthDate: new Date('1995-06-15') }
        ];

        exporter.exportEnded.pipe(first()).subscribe((args) => {
            expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
            expect(getRenderedRows(args.pdf)).toEqual([
                ['Name', 'BirthDate'],
                ['John', new Date('1990-01-01').toLocaleDateString()],
                ['Jane', new Date('1995-06-15').toLocaleDateString()]
            ]);
            done();
        });

        exporter.exportData(dataWithDates, options);
    });

    it('should export with portrait orientation', (done) => {
        options.pageOrientation = 'portrait';

        exporter.exportEnded.pipe(first()).subscribe((args) => {
            expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
            expect(getPageDimensions(args.pdf)).toEqual(PAGE_SIZES.a4Portrait);
            expect(getRenderedRows(args.pdf)).toEqual(CONTACTS_ROWS);
            done();
        });

        exporter.exportData(SampleTestData.contactsData(), options);
    });

    it('should export with various page sizes', (done) => {
        const pageSizes: [string, { width: number; height: number }][] = [
            ['a3', PAGE_SIZES.a3Portrait],
            ['a5', PAGE_SIZES.a5Portrait],
            ['legal', PAGE_SIZES.legalPortrait]
        ];
        let completed = 0;

        const exportNext = (index: number) => {
            if (index >= pageSizes.length) {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(pageSizes.length);
                done();
                return;
            }

            const [pageSize, portraitDimensions] = pageSizes[index];
            const opts = new IgxPdfExporterOptions('Test');
            opts.pageSize = pageSize as any;

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                // The exporter defaults to landscape, so the page comes out with the two
                // dimensions of the requested size the other way round.
                expect(getPageDimensions(args.pdf))
                    .toEqual({ width: portraitDimensions.height, height: portraitDimensions.width });
                expect(getRenderedRows(args.pdf)).toEqual(CONTACTS_ROWS);
                completed++;
                exportNext(completed);
            });

            exporter.exportData(SampleTestData.contactsData(), opts);
        };

        exportNext(0);
    });

    it('should export with different font sizes', (done) => {
        options.fontSize = 14;

        exporter.exportEnded.pipe(first()).subscribe((args) => {
            expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
            expect(new Set(getRenderedCells(args.pdf).map(cell => cell.fontSize))).toEqual(new Set([14]));
            expect(getRenderedRows(args.pdf)).toEqual(CONTACTS_ROWS);
            done();
        });

        exporter.exportData(SampleTestData.contactsData(), options);
    });

    it('should export large dataset requiring pagination', (done) => {
        const largeData: { Name: string; Age: number; City: string }[] = [];
        for (let i = 0; i < 100; i++) {
            largeData.push({ Name: `Person ${i}`, Age: 20 + (i % 50), City: `City ${i % 10}` });
        }

        exporter.exportEnded.pipe(first()).subscribe((args) => {
            expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);

            const pages = getRenderedRowsByPage(args.pdf);
            expect(pages.length).toBe(5);
            // Every page repeats the header row and then carries on where the previous one
            // stopped, so no record is dropped at a page break and none is drawn twice.
            expect(pages.map(page => page[0])).toEqual(pages.map(() => ['Name', 'Age', 'City']));
            expect(pages.flatMap(page => page.slice(1))).toEqual(
                largeData.map(record => [record.Name, String(record.Age), record.City]));
            done();
        });

        exporter.exportData(largeData, options);
    });

    it('should handle long text values with truncation', (done) => {
        const dataWithLongText = [
            { Name: 'John', Description: 'This is a very long description that should be truncated with ellipsis in the PDF export to fit within the cell width' },
            { Name: 'Jane', Description: 'Another extremely long text that needs to be handled properly in the PDF export without breaking the layout' }
        ];

        exporter.exportEnded.pipe(first()).subscribe((args) => {
            expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);

            const [, firstRow, secondRow] = getRenderedRows(args.pdf);
            const columnWidth = getDrawnRectangles(args.pdf)[0].width;

            for (const [description, original] of [firstRow[1], secondRow[1]]
                .map((text, index) => [text, dataWithLongText[index].Description] as const)) {
                // Cut short, marked with an ellipsis, and still a prefix of the original value.
                expect(description.endsWith('...')).toBeTrue();
                expect(description.length).toBeLessThan(original.length);
                expect(original.startsWith(description.slice(0, -3))).toBeTrue();
                expect(args.pdf!.getTextWidth(description)).toBeLessThanOrEqual(columnWidth - 10);
            }
            done();
        });

        exporter.exportData(dataWithLongText, options);
    });

    it('should export data with mixed data types', (done) => {
        const mixedData = [
            { String: 'Text', Number: 42, Boolean: true, Date: new Date('2023-01-01'), Null: null, Undefined: undefined },
            { String: 'More text', Number: 3.14, Boolean: false, Date: new Date('2023-12-31'), Null: null, Undefined: undefined }
        ];

        exporter.exportEnded.pipe(first()).subscribe((args) => {
            expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
            // Numbers, booleans and dates are all stringified; the null and undefined columns are
            // drawn as cells but hold no text.
            expect(getRenderedRows(args.pdf)).toEqual([
                ['String', 'Number', 'Boolean', 'Date', 'Null', 'Undefined'],
                ['Text', '42', 'true', new Date('2023-01-01').toLocaleDateString()],
                ['More text', '3.14', 'false', new Date('2023-12-31').toLocaleDateString()]
            ]);
            expect(getDrawnRectangles(args.pdf).filter(rectangle => !rectangle.filled).length).toBe(6 * 3);
            done();
        });

        exporter.exportData(mixedData, options);
    });

    it('should export with custom filename', (done) => {
        const customOptions = new IgxPdfExporterOptions('CustomFileName');

        exporter.exportEnded.pipe(first()).subscribe(() => {
            expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
            const callArgs = (ExportUtilities.saveBlobToFile as jasmine.Spy).calls.mostRecent().args;
            expect(callArgs[1]).toBe('CustomFileName.pdf');
            // The exporter hands over the document itself, as a PDF blob.
            expect(callArgs[0] instanceof Blob).toBeTrue();
            expect(callArgs[0].type).toBe('application/pdf');
            expect(callArgs[0].size).toBeGreaterThan(0);
            done();
        });

        exporter.exportData(SampleTestData.contactsData(), customOptions);
    });

    it('should handle empty rows in data', (done) => {
        const dataWithEmptyRows = [
            { Name: 'John', Age: 30 },
            {},
            { Name: 'Jane', Age: 25 }
        ];

        exporter.exportEnded.pipe(first()).subscribe((args) => {
            expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
            // The empty record still takes a row of its own, it simply has nothing to draw in it.
            expect(getRenderedRows(args.pdf)).toEqual([
                ['Name', 'Age'],
                ['John', '30'],
                ['Jane', '25']
            ]);
            expect(getDrawnRectangles(args.pdf).filter(rectangle => !rectangle.filled).length).toBe(2 * 4);
            done();
        });

        exporter.exportData(dataWithEmptyRows, options);
    });

    it('should emit exportEnded event with pdf object', (done) => {
        exporter.exportEnded.pipe(first()).subscribe((args) => {
            expect(args).toBeDefined();
            expect(args.pdf).toBeDefined();
            // The emitted document is the one that was saved, fully drawn by the time it arrives.
            expect(getRenderedRows(args.pdf)).toEqual(CONTACTS_ROWS);
            expect(args.pdf!.output('blob').size).toBe(
                (ExportUtilities.saveBlobToFile as jasmine.Spy).calls.mostRecent().args[0].size);
            done();
        });

        exporter.exportData(SampleTestData.contactsData(), options);
    });

    describe('Custom Font Support', () => {
        /**
         * Every rejected font configuration has to end up in the same place: nothing registered on
         * the document, both the regular and the bold font back on helvetica, and a table that is
         * drawn exactly as it would have been without a custom font at all.
         */
        const expectHelveticaFallback = (pdf: jsPDF | undefined) => {
            expect((exporter as any)._currentFontName).toBe('helvetica');
            expect((exporter as any)._currentBoldFontName).toBe('helvetica');
            expect(pdf!.getFontList().TestFont).toBeUndefined();
            expect(getUsedFontRefs(pdf)).toEqual(new Set([
                getFontRef(pdf, 'helvetica', 'normal'),
                getFontRef(pdf, 'helvetica', 'bold')
            ]));
            expect(getRenderedRows(pdf)).toEqual(CONTACTS_ROWS);
        };

        beforeEach(() => {
            // Guard against karma-parallel sharding leaving a stale spy from a skipped test
            if (jasmine.isSpy(console.warn)) {
                (console.warn as jasmine.Spy).calls.reset();
            } else {
                spyOn(console, 'warn');
            }
        });

        it('should export without custom font when customFont is not set', (done) => {
            expect(options.customFont).toBeUndefined();

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                expectHelveticaFallback(args.pdf);
                // Nothing was configured, so there is nothing to complain about either.
                expect(console.warn).not.toHaveBeenCalled();
                done();
            });

            exporter.exportData(SampleTestData.contactsData(), options);
        });

        it('should handle custom font being set to null', (done) => {
            options.customFont = null as any;

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                expectHelveticaFallback(args.pdf);
                // `null` reads as "no custom font" rather than as a broken one.
                expect(console.warn).not.toHaveBeenCalled();
                done();
            });

            exporter.exportData(SampleTestData.contactsData(), options);
        });

        it('should handle custom font being set to undefined', (done) => {
            options.customFont = undefined;

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                expectHelveticaFallback(args.pdf);
                expect(console.warn).not.toHaveBeenCalled();
                done();
            });

            exporter.exportData(SampleTestData.contactsData(), options);
        });

        it('should fall back to helvetica when custom font with empty name is provided', (done) => {
            options.customFont = {
                name: '',
                data: 'someBase64Data'
            };

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                expectHelveticaFallback(args.pdf);
                expect(console.warn).toHaveBeenCalledWith(INCOMPLETE_FONT_WARNING);
                done();
            });

            exporter.exportData(SampleTestData.contactsData(), options);
        });

        it('should fall back to helvetica when custom font with empty data is provided', (done) => {
            options.customFont = {
                name: 'TestFont',
                data: ''
            };

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                expectHelveticaFallback(args.pdf);
                expect(console.warn).toHaveBeenCalledWith(INCOMPLETE_FONT_WARNING);
                done();
            });

            exporter.exportData(SampleTestData.contactsData(), options);
        });

        it('should fall back to helvetica when custom font with both empty name and data is provided', (done) => {
            options.customFont = {
                name: '',
                data: ''
            };

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                expectHelveticaFallback(args.pdf);
                expect(console.warn).toHaveBeenCalledWith(INCOMPLETE_FONT_WARNING);
                done();
            });

            exporter.exportData(SampleTestData.contactsData(), options);
        });

        it('should export with custom font and portrait orientation when font config is incomplete', (done) => {
            options.customFont = {
                name: '',
                data: ''
            };
            options.pageOrientation = 'portrait';

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                // The rejected font does not cost the export its page setup.
                expect(getPageDimensions(args.pdf)).toEqual(PAGE_SIZES.a4Portrait);
                expectHelveticaFallback(args.pdf);
                done();
            });

            exporter.exportData(SampleTestData.contactsData(), options);
        });

        it('should export with incomplete custom font and different page sizes', (done) => {
            const pageSizes: [string, { width: number; height: number }][] = [
                ['a3', PAGE_SIZES.a3Portrait],
                ['letter', PAGE_SIZES.letterPortrait]
            ];
            let completed = 0;

            const exportNext = (index: number) => {
                if (index >= pageSizes.length) {
                    expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(pageSizes.length);
                    done();
                    return;
                }

                const [pageSize, portraitDimensions] = pageSizes[index];
                const opts = new IgxPdfExporterOptions('Test');
                opts.pageSize = pageSize;
                opts.customFont = {
                    name: '',
                    data: ''
                };

                exporter.exportEnded.pipe(first()).subscribe((args) => {
                    expect(getPageDimensions(args.pdf))
                        .toEqual({ width: portraitDimensions.height, height: portraitDimensions.width });
                    expectHelveticaFallback(args.pdf);
                    completed++;
                    exportNext(completed);
                });

                exporter.exportData(SampleTestData.contactsData(), opts);
            };

            exportNext(0);
        });

        it('should export with incomplete custom font and table borders disabled', (done) => {
            options.customFont = {
                name: '',
                data: ''
            };
            options.showTableBorders = false;

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                expect(getDrawnRectangles(args.pdf)).toEqual([]);
                expectHelveticaFallback(args.pdf);
                done();
            });

            exporter.exportData(SampleTestData.contactsData(), options);
        });

        it('should handle customFont object with only name property', (done) => {
            options.customFont = {
                name: 'TestFont'
            } as any;

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                expectHelveticaFallback(args.pdf);
                expect(console.warn).toHaveBeenCalledWith(INCOMPLETE_FONT_WARNING);
                done();
            });

            exporter.exportData(SampleTestData.contactsData(), options);
        });

        it('should handle customFont object with only data property', (done) => {
            options.customFont = {
                data: 'someData'
            } as any;

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                expectHelveticaFallback(args.pdf);
                expect(console.warn).toHaveBeenCalledWith(INCOMPLETE_FONT_WARNING);
                done();
            });

            exporter.exportData(SampleTestData.contactsData(), options);
        });

        it('should handle customFont as empty object', (done) => {
            options.customFont = {} as any;

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                expectHelveticaFallback(args.pdf);
                expect(console.warn).toHaveBeenCalledWith(INCOMPLETE_FONT_WARNING);
                done();
            });

            exporter.exportData(SampleTestData.contactsData(), options);
        });

        it('should handle customFont with whitespace-only name', (done) => {
            options.customFont = {
                name: '   ',
                data: 'someData'
            };

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                expectHelveticaFallback(args.pdf);
                expect(console.warn).toHaveBeenCalledWith(INCOMPLETE_FONT_WARNING);
                done();
            });

            exporter.exportData(SampleTestData.contactsData(), options);
        });

        it('should handle customFont with whitespace-only data', (done) => {
            options.customFont = {
                name: 'TestFont',
                data: '   '
            };

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                expectHelveticaFallback(args.pdf);
                expect(console.warn).toHaveBeenCalledWith(INCOMPLETE_FONT_WARNING);
                done();
            });

            exporter.exportData(SampleTestData.contactsData(), options);
        });

        /*
         * The bold variant only comes into play once the base font configuration is accepted, so
         * with an empty name and data these three exercise the rejection path, whatever shape the
         * variant has. Covering the variant itself would take a real, parseable TTF: jsPDF reads
         * the font when it is registered and, in a browser, throws out of the first  call
         * that uses an unparseable one - outside the try/catch the exporter wraps the registration
         * in, which takes the whole export down with it.
         */
        it('should handle customFont with bold variant set to null', (done) => {
            options.customFont = {
                name: '',
                data: '',
                bold: null as any
            };

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                expectHelveticaFallback(args.pdf);
                expect(console.warn).toHaveBeenCalledWith(INCOMPLETE_FONT_WARNING);
                done();
            });

            exporter.exportData(SampleTestData.contactsData(), options);
        });

        it('should handle customFont with bold variant set to undefined', (done) => {
            options.customFont = {
                name: '',
                data: '',
                bold: undefined
            };

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                expectHelveticaFallback(args.pdf);
                expect(console.warn).toHaveBeenCalledWith(INCOMPLETE_FONT_WARNING);
                done();
            });

            exporter.exportData(SampleTestData.contactsData(), options);
        });

        it('should handle customFont with bold as empty object', (done) => {
            options.customFont = {
                name: '',
                data: '',
                bold: {} as any
            };

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                expectHelveticaFallback(args.pdf);
                expect(console.warn).toHaveBeenCalledWith(INCOMPLETE_FONT_WARNING);
                done();
            });

            exporter.exportData(SampleTestData.contactsData(), options);
        });

        it('should reset font configuration when exporting again without customFont', (done) => {
            let exportCallCount = 0;

            // First export is given a custom font it cannot use
            options.customFont = {
                name: 'CustomFont',
                data: ''
            } as any;

            const subscription = exporter.exportEnded.subscribe((args) => {
                exportCallCount++;

                if (exportCallCount === 1) {
                    expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                    expectHelveticaFallback(args.pdf);

                    // Clear customFont and export again
                    options.customFont = undefined as any;
                    exporter.exportData(SampleTestData.contactsData(), options);
                    return;
                }

                if (exportCallCount === 2) {
                    // The second export carries nothing over from the first one.
                    expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(2);
                    expectHelveticaFallback(args.pdf);
                    expect(args.pdf!.getFontList().CustomFont).toBeUndefined();
                    subscription.unsubscribe();
                    done();
                }
            });

            exporter.exportData(SampleTestData.contactsData(), options);
        });

    });

    describe('Export record types', () => {
        const pivotOwner = (columns: IColumnInfo[]): IColumnList => ({
            columns,
            columnWidths: columns.map(() => 200),
            indexOfLastPinnedColumn: -1,
            maxLevel: 0,
            maxRowLevel: 1
        });

        it('should export a pivot grid with a single row dimension', (done) => {
            const records: IExportRecord[] = [
                {
                    data: { Product: 'Product A', London: 100, Paris: 200 },
                    level: 0,
                    type: ExportRecordType.PivotGridRecord,
                    dimensionKeys: ['Product']
                },
                {
                    data: { Product: 'Product B', London: 150, Paris: 250 },
                    level: 0,
                    type: ExportRecordType.PivotGridRecord,
                    dimensionKeys: ['Product']
                }
            ];

            // One row header per record, holding the dimension value that record is drawn with.
            (exporter as any)._ownersMap.set(DEFAULT_OWNER, pivotOwner([
                {
                    header: 'Product A', field: 'Product', skip: false,
                    headerType: ExportHeaderType.RowHeader, level: 0, startIndex: 0, columnSpan: 1
                },
                {
                    header: 'Product B', field: 'Product', skip: false,
                    headerType: ExportHeaderType.RowHeader, level: 0, startIndex: 1, columnSpan: 1
                },
                {
                    header: 'London', field: 'London', skip: false,
                    headerType: ExportHeaderType.ColumnHeader, level: 0, startIndex: 0, columnSpan: 1
                },
                {
                    header: 'Paris', field: 'Paris', skip: false,
                    headerType: ExportHeaderType.ColumnHeader, level: 0, startIndex: 1, columnSpan: 1
                }
            ]));

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                // The dimension takes a column ahead of the two measures, and each record is
                // matched to the row header at its own index.
                expect(getRenderedRows(args.pdf)).toEqual([
                    ['London', 'Paris'],
                    ['Product A', '100', '200'],
                    ['Product B', '150', '250']
                ]);
                done();
            });

            exportRecords(records);
        });

        it('should resolve a row dimension value by an exact name match in the record data', (done) => {
            // There is no RowHeader/MultiRowHeader/PivotMergedHeader column, so the primary
            // (column-based) lookup can't resolve anything and the dimension value has to be read
            // straight out of the record data under the dimension key. The dimension needs a column
            // of its own, because `exportRow` rebuilds the record data out of the owner's columns,
            // but as an exact match of a dimension key it is kept out of the regular data columns.
            const records: IExportRecord[] = [
                {
                    data: { Category: 'Tools', units_sold: 42 },
                    level: 0,
                    type: ExportRecordType.PivotGridRecord,
                    dimensionKeys: ['Category']
                }
            ];

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, pivotOwner([
                {
                    header: 'Category', field: 'Category', skip: false,
                    headerType: ExportHeaderType.ColumnHeader, level: 0, startIndex: 0, columnSpan: 1
                },
                {
                    header: 'Units Sold', field: 'units_sold', skip: false,
                    headerType: ExportHeaderType.ColumnHeader, level: 0, startIndex: 1, columnSpan: 1
                }
            ]));

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                // The two column headers, then the row: the dimension cell holding the resolved
                // value and the single data cell left once the dimension column is taken out.
                expect(getRenderedText(args.pdf)).toEqual(['Category', 'Units Sold', 'Tools', '42']);
                done();
            });

            exportRecords(records);
        });

        it('should resolve a row dimension value by a fuzzy name match in the record data', (done) => {
            // The dimension key differs in case from the actual record data key and there is no
            // matching row header column, so resolution must fall through to the fuzzy match.
            const records: IExportRecord[] = [
                {
                    data: { Category: 'Tools', units_sold: 42 },
                    level: 0,
                    type: ExportRecordType.PivotGridRecord,
                    dimensionKeys: ['category']
                }
            ];

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, pivotOwner([
                {
                    header: 'Category', field: 'Category', skip: false,
                    headerType: ExportHeaderType.ColumnHeader, level: 0, startIndex: 0, columnSpan: 1
                },
                {
                    header: 'Units Sold', field: 'units_sold', skip: false,
                    headerType: ExportHeaderType.ColumnHeader, level: 0, startIndex: 1, columnSpan: 1
                }
            ]));

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                // Only an exact match of a dimension key keeps a column out of the data cells, so
                // the fuzzily matched value is rendered twice - once in the row's dimension cell
                // and once in the data cell of the column it was read from.
                expect(getRenderedText(args.pdf)).toEqual(['Category', 'Units Sold', 'Tools', 'Tools', '42']);
                done();
            });

            exportRecords(records);
        });

        it('should resolve row dimension values by position when no name match is found', (done) => {
            // Neither dimension key matches the record data by name, exact or fuzzy, and there is
            // no row header column, so resolution must fall back to positional matching among the
            // simple keys of the record.
            const records: IExportRecord[] = [
                {
                    data: { Category: 'Tools', SecondDimension: 'Alpha' },
                    level: 0,
                    type: ExportRecordType.PivotGridRecord,
                    dimensionKeys: ['MissingA', 'MissingB']
                }
            ];

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, pivotOwner([
                {
                    header: 'Category', field: 'Category', skip: false,
                    headerType: ExportHeaderType.ColumnHeader, level: 0, startIndex: 0, columnSpan: 1
                },
                {
                    header: 'Second Dimension', field: 'SecondDimension', skip: false,
                    headerType: ExportHeaderType.ColumnHeader, level: 0, startIndex: 1, columnSpan: 1
                }
            ]));

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                const renderedText = getRenderedText(args.pdf);
                // The two dimension cells take the record's simple keys in order, and the same
                // values show up again in the data cells of the columns they were read from.
                expect(renderedText).toEqual([
                    'Category', 'Second Dimension', 'Tools', 'Alpha', 'Tools', 'Alpha'
                ]);
                done();
            });

            exportRecords(records);
        });

        it('should infer the row dimensions from the record data when there are no dimension keys', (done) => {
            const records: IExportRecord[] = [
                {
                    data: { Product: 'Product A', London: 100 },
                    level: 0,
                    type: ExportRecordType.PivotGridRecord
                }
            ];

            // The row dimension column carries a matching field, so the dimension is picked up from it.
            (exporter as any)._ownersMap.set(DEFAULT_OWNER, pivotOwner([
                {
                    header: 'Product A', field: 'Product', skip: false,
                    headerType: ExportHeaderType.MultiRowHeader, level: 0, startIndex: 0, columnSpan: 1
                },
                {
                    header: 'London', field: 'London', skip: false,
                    headerType: ExportHeaderType.ColumnHeader, level: 0, startIndex: 0, columnSpan: 1
                }
            ]));

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                // The dimension takes a column of its own, filled from the row dimension column's
                // header, and the measure keeps the only header of the table.
                expect(getRenderedRows(args.pdf)).toEqual([
                    ['London'],
                    ['Product A', '100']
                ]);
                done();
            });

            exportRecords(records);
        });

        it('should fall back to the simple record keys when no row dimension column matches', (done) => {
            const records: IExportRecord[] = [
                {
                    data: { Product: 'Product A', 'City-London-Sum': 100 },
                    level: 0,
                    type: ExportRecordType.PivotGridRecord
                }
            ];

            // Neither the field nor the column group of the row dimension column appears in the
            // record data, so the exporter has to guess the dimensions from the simple keys.
            (exporter as any)._ownersMap.set(DEFAULT_OWNER, pivotOwner([
                {
                    header: 'Unmatched', field: 'Unmatched', skip: false,
                    headerType: ExportHeaderType.PivotMergedHeader, level: 0, startIndex: 0,
                    columnSpan: 1, columnGroup: 'AlsoUnmatched'
                },
                {
                    header: 'Sum', field: 'City-London-Sum', skip: false,
                    headerType: ExportHeaderType.ColumnHeader, level: 0, startIndex: 0, columnSpan: 1
                }
            ]));

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                // Only the measure key is left in the record by the time the exporter sees it, and
                // a key with a separator in it is not taken for a dimension, so the guess comes up
                // empty and the table is drawn without a row dimension column at all.
                expect(getRenderedRows(args.pdf)).toEqual([
                    ['Sum'],
                    ['100']
                ]);
                done();
            });

            exportRecords(records);
        });

        it('should export a hierarchical grid with child and grandchild islands', (done) => {
            // Every record names the island it belongs to, and the exporter keeps one column list per island.
            const rootOwner = 'root';
            const childIsland = 'childIsland';
            const grandChildIsland = 'grandChildIsland';

            const records: IExportRecord[] = [
                {
                    data: { Id: 1, Name: 'Parent 1' },
                    level: 0, type: ExportRecordType.HierarchicalGridRecord, owner: rootOwner
                },
                {
                    // Header records carry the header captions as a plain array and are skipped
                    // rather than drawn as data rows.
                    data: ['ChildId', 'Title'],
                    references: [
                        { header: 'ChildId', field: 'ChildId', skip: false },
                        { header: 'Title', field: 'Title', skip: false }
                    ] as IColumnInfo[],
                    level: 1, type: ExportRecordType.HeaderRecord, owner: childIsland
                },
                {
                    data: { ChildId: 11, Title: 'Child A' },
                    level: 1, type: ExportRecordType.HierarchicalGridRecord, owner: childIsland
                },
                {
                    data: { GrandId: 111, Label: 'Grandchild of A' },
                    level: 2, type: ExportRecordType.HierarchicalGridRecord, owner: grandChildIsland
                },
                {
                    data: { ChildId: 12, Title: 'Child B' },
                    level: 1, type: ExportRecordType.HierarchicalGridRecord, owner: childIsland
                },
                {
                    // Collapsed rows are not rendered at all.
                    data: { ChildId: 13, Title: 'Collapsed child' },
                    level: 1, type: ExportRecordType.HierarchicalGridRecord, owner: childIsland, hidden: true
                },
                {
                    data: { Id: 2, Name: 'Parent 2' },
                    level: 0, type: ExportRecordType.HierarchicalGridRecord, owner: rootOwner
                }
            ];

            const ownerFor = (fields: string[]): IColumnList => ({
                columns: fields.map((field, index) => ({
                    header: field, field, skip: false,
                    headerType: ExportHeaderType.ColumnHeader, level: 0, startIndex: index, columnSpan: 1
                })),
                columnWidths: fields.map(() => 200),
                indexOfLastPinnedColumn: -1,
                maxLevel: 0,
                maxRowLevel: 0
            });

            (exporter as any)._ownersMap.set(rootOwner, ownerFor(['Id', 'Name']));
            (exporter as any)._ownersMap.set(childIsland, ownerFor(['ChildId', 'Title']));
            (exporter as any)._ownersMap.set(grandChildIsland, ownerFor(['GrandId', 'Label']));

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                // Each island introduces itself with its own header row, its rows follow it, and
                // the export returns to the parent afterwards. The collapsed child is left out.
                expect(getRenderedRows(args.pdf)).toEqual([
                    ['Id', 'Name'],
                    ['1', 'Parent 1'],
                    ['ChildId', 'Title'],
                    ['11', 'Child A'],
                    ['GrandId', 'Label'],
                    ['111', 'Grandchild of A'],
                    ['12', 'Child B'],
                    ['2', 'Parent 2']
                ]);

                // Each level is indented one step further to the right than the one above it.
                const cells = getRenderedCells(args.pdf);
                const indentOf = (text: string) => cells.find(cell => cell.text === text)!.x;
                expect(indentOf('Parent 1')).toBeLessThan(indentOf('Child A'));
                expect(indentOf('Child A')).toBeLessThan(indentOf('Grandchild of A'));
                expect(indentOf('Parent 2')).toBe(indentOf('Parent 1'));
                expect(indentOf('Child B')).toBe(indentOf('Child A'));
                done();
            });

            exportRecords(records);
        });

        it('should skip a child island that has no columns of its own', (done) => {
            const rootOwner = 'root';
            const emptyIsland = 'islandWithoutColumns';

            const records: IExportRecord[] = [
                {
                    data: { Id: 1, Name: 'Parent 1' },
                    level: 0, type: ExportRecordType.HierarchicalGridRecord, owner: rootOwner
                },
                {
                    data: { ChildId: 11 },
                    level: 1, type: ExportRecordType.HierarchicalGridRecord, owner: emptyIsland
                }
            ];

            (exporter as any)._ownersMap.set(rootOwner, {
                columns: [
                    {
                        header: 'Id', field: 'Id', skip: false,
                        headerType: ExportHeaderType.ColumnHeader, level: 0, startIndex: 0, columnSpan: 1
                    },
                    {
                        header: 'Name', field: 'Name', skip: false,
                        headerType: ExportHeaderType.ColumnHeader, level: 0, startIndex: 1, columnSpan: 1
                    }
                ],
                columnWidths: [200, 200],
                indexOfLastPinnedColumn: -1,
                maxLevel: 0,
                maxRowLevel: 0
            } as IColumnList);
            (exporter as any)._ownersMap.set(emptyIsland, {
                columns: [],
                columnWidths: [],
                indexOfLastPinnedColumn: -1,
                maxLevel: 0,
                maxRowLevel: 0
            } as IColumnList);

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                // The island contributes neither a header row nor a data row - only the parent
                // record makes it into the document.
                expect(getRenderedRows(args.pdf)).toEqual([
                    ['Id', 'Name'],
                    ['1', 'Parent 1']
                ]);
                done();
            });

            exportRecords(records);
        });

        it('should render every shape of summary result', (done) => {
            const records: IExportRecord[] = [
                {
                    data: { Name: 'John', Age: 30 },
                    level: 0,
                    type: ExportRecordType.DataRecord
                },
                {
                    // Both a label and a value - rendered as `label: value`.
                    data: { Name: { label: 'Count', value: 2 }, Age: { label: 'Avg', value: 27.5 } },
                    level: 0,
                    type: ExportRecordType.SummaryRecord
                },
                {
                    // Only one of the two, and an empty pair that renders as nothing.
                    data: { Name: { label: 'Count' }, Age: { value: 27.5 } },
                    level: 0,
                    type: ExportRecordType.SummaryRecord
                },
                {
                    data: { Name: { label: '', value: '' }, Age: { summaryResult: 5 } },
                    level: 0,
                    type: ExportRecordType.SummaryRecord
                }
            ];

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, {
                columns: [
                    {
                        header: 'Name', field: 'Name', skip: false,
                        headerType: ExportHeaderType.ColumnHeader, level: 0, startIndex: 0, columnSpan: 1
                    },
                    {
                        header: 'Age', field: 'Age', skip: false,
                        headerType: ExportHeaderType.ColumnHeader, level: 0, startIndex: 1, columnSpan: 1
                    }
                ],
                columnWidths: [200, 200],
                indexOfLastPinnedColumn: -1,
                maxLevel: 0,
                maxRowLevel: 0
            } as IColumnList);

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                // A label and a value are joined with a colon; on their own each is rendered as it
                // stands; an empty pair and a shape the exporter does not recognise both come out
                // as an empty cell, which leaves no text in the document at all.
                expect(getRenderedRows(args.pdf)).toEqual([
                    ['Name', 'Age'],
                    ['John', '30'],
                    ['Count: 2', 'Avg: 27.5'],
                    ['Count', '27.5'],
                    ['5']
                ]);
                done();
            });

            exportRecords(records);
        });

        it('should truncate headers and cell values that do not fit their column', (done) => {
            const longText = 'A very long value that has no chance of fitting inside the column it is drawn in'.repeat(4);
            const records: IExportRecord[] = [
                {
                    data: { Description: longText, Note: longText },
                    level: 0,
                    type: ExportRecordType.DataRecord
                }
            ];

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, {
                columns: [
                    {
                        header: longText, field: 'Description', skip: false,
                        headerType: ExportHeaderType.ColumnHeader, level: 0, startIndex: 0, columnSpan: 1
                    },
                    {
                        header: longText, field: 'Note', skip: false,
                        headerType: ExportHeaderType.ColumnHeader, level: 0, startIndex: 1, columnSpan: 1
                    }
                ],
                columnWidths: [200, 200],
                indexOfLastPinnedColumn: -1,
                maxLevel: 0,
                maxRowLevel: 0
            } as IColumnList);

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);

                const [headerRow, dataRow] = getRenderedRows(args.pdf);
                const columnWidth = getDrawnRectangles(args.pdf)[0].width;

                for (const text of [...headerRow, ...dataRow]) {
                    // Every one of the four cells is cut short, marked with an ellipsis and left
                    // narrow enough to sit inside its column with the cell padding to spare.
                    expect(text.endsWith('...')).toBeTrue();
                    expect(text.length).toBeLessThan(longText.length);
                    expect(args.pdf!.getTextWidth(text)).toBeLessThanOrEqual(columnWidth - 10);
                }
                // A header is centred in its cell while a value is drawn from the left edge, so
                // the two are cut to different lengths even though they start from the same text.
                expect(headerRow[0]).not.toEqual(dataRow[0]);
                done();
            });

            exportRecords(records);
        });
    });

    describe('Pivot Grid Export', () => {
        it('should export pivot grid with single dimension', (done) => {
            const pivotData: IExportRecord[] = [
                {
                    data: { Product: 'Product A', 'City-London-Sum': 100, 'City-Paris-Sum': 200 },
                    level: 0,
                    type: ExportRecordType.PivotGridRecord,
                    dimensionKeys: ['Product']
                },
                {
                    data: { Product: 'Product B', 'City-London-Sum': 150, 'City-Paris-Sum': 250 },
                    level: 0,
                    type: ExportRecordType.PivotGridRecord,
                    dimensionKeys: ['Product']
                }
            ];

            const columns: IColumnInfo[] = [
                {
                    header: 'Product',
                    field: 'Product',
                    skip: false,
                    headerType: ExportHeaderType.PivotRowHeader,
                    startIndex: 0,
                    level: 0
                },
                // The dimension name above comes with one row header per record, each carrying
                // the value that record shows in the dimension column.
                {
                    header: 'Product A',
                    field: 'Product',
                    skip: false,
                    headerType: ExportHeaderType.RowHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1
                },
                {
                    header: 'Product B',
                    field: 'Product',
                    skip: false,
                    headerType: ExportHeaderType.RowHeader,
                    startIndex: 1,
                    level: 0,
                    columnSpan: 1
                },
                {
                    header: 'London',
                    field: 'City',
                    skip: false,
                    headerType: ExportHeaderType.MultiColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1,
                    columnGroup: 'London'
                },
                {
                    header: 'Sum',
                    field: 'City-London-Sum',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 1,
                    columnSpan: 1,
                    columnGroupParent: 'London'
                },
                {
                    header: 'Paris',
                    field: 'City',
                    skip: false,
                    headerType: ExportHeaderType.MultiColumnHeader,
                    startIndex: 1,
                    level: 0,
                    columnSpan: 1,
                    columnGroup: 'Paris'
                },
                {
                    header: 'Sum',
                    field: 'City-Paris-Sum',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 1,
                    level: 1,
                    columnSpan: 1,
                    columnGroupParent: 'Paris'
                }
            ];

            const owner: IColumnList = {
                columns: columns,
                columnWidths: [200, 200, 200],
                indexOfLastPinnedColumn: 0,
                maxLevel: 1,
                maxRowLevel: 1
            };

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, owner);

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                // The dimension name is drawn once, spanning both header levels, so it sits on a
                // baseline of its own between the city row and the aggregation row.
                expect(getRenderedRows(args.pdf)).toEqual([
                    ['London', 'Paris'],
                    ['Product'],
                    ['Sum', 'Sum'],
                    ['Product A', '100', '200'],
                    ['Product B', '150', '250']
                ]);
                done();
            });

            exportRecords(pivotData);
        });

        it('should export multi-dimensional pivot grid with multiple row dimensions', (done) => {
            const pivotData: IExportRecord[] = [
                {
                    data: { Product: 'Product A', Category: 'Category 1', 'City-London-Sum': 100, 'City-Paris-Sum': 200 },
                    level: 0,
                    type: ExportRecordType.PivotGridRecord,
                    dimensionKeys: ['Product', 'Category']
                },
                {
                    data: { Product: 'Product A', Category: 'Category 2', 'City-London-Sum': 150, 'City-Paris-Sum': 250 },
                    level: 1,
                    type: ExportRecordType.PivotGridRecord,
                    dimensionKeys: ['Product', 'Category']
                },
                {
                    data: { Product: 'Product B', Category: 'Category 1', 'City-London-Sum': 120, 'City-Paris-Sum': 220 },
                    level: 0,
                    type: ExportRecordType.PivotGridRecord,
                    dimensionKeys: ['Product', 'Category']
                }
            ];

            const columns: IColumnInfo[] = [
                {
                    header: 'Product',
                    field: 'Product',
                    skip: false,
                    headerType: ExportHeaderType.PivotRowHeader,
                    startIndex: 0,
                    level: 0
                },
                {
                    header: 'Category',
                    field: 'Category',
                    skip: false,
                    headerType: ExportHeaderType.PivotRowHeader,
                    startIndex: 1,
                    level: 1
                },
                {
                    header: 'London',
                    field: 'City',
                    skip: false,
                    headerType: ExportHeaderType.MultiColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1,
                    columnGroup: 'London'
                },
                {
                    header: 'Sum',
                    field: 'City-London-Sum',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 1,
                    columnSpan: 1,
                    columnGroupParent: 'London'
                },
                {
                    header: 'Paris',
                    field: 'City',
                    skip: false,
                    headerType: ExportHeaderType.MultiColumnHeader,
                    startIndex: 1,
                    level: 0,
                    columnSpan: 1,
                    columnGroup: 'Paris'
                },
                {
                    header: 'Sum',
                    field: 'City-Paris-Sum',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 1,
                    level: 1,
                    columnSpan: 1,
                    columnGroupParent: 'Paris'
                },
                // One row header per record and per dimension level, in record order - that is
                // what the exporter matches a record against to fill its dimension cells.
                ...['Product A', 'Product A', 'Product B'].map((header, startIndex) => ({
                    header, field: 'Product', skip: false,
                    headerType: ExportHeaderType.RowHeader, startIndex, level: 0, columnSpan: 1
                })),
                ...['Category 1', 'Category 2', 'Category 1'].map((header, startIndex) => ({
                    header, field: 'Category', skip: false,
                    headerType: ExportHeaderType.RowHeader, startIndex, level: 1, columnSpan: 1
                }))
            ];

            const owner: IColumnList = {
                columns: columns,
                columnWidths: [200, 200, 200, 200],
                indexOfLastPinnedColumn: 1,
                maxLevel: 1,
                maxRowLevel: 2
            };

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, owner);

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                // Both dimensions get a column of their own, filled per record, ahead of the two
                // aggregation columns.
                expect(getRenderedRows(args.pdf)).toEqual([
                    ['London', 'Paris'],
                    ['Product', 'Category'],
                    ['Sum', 'Sum'],
                    ['Product A', 'Category 1', '100', '200'],
                    ['Product A', 'Category 2', '150', '250'],
                    ['Product B', 'Category 1', '120', '220']
                ]);
                done();
            });

            exportRecords(pivotData);
        });

        it('should export pivot grid with row dimension headers and multi-level column headers', (done) => {
            const pivotData: IExportRecord[] = [
                {
                    data: { Product: 'Product A', 'City-London-Sum': 100, 'City-London-Avg': 50, 'City-Paris-Sum': 200 },
                    level: 0,
                    type: ExportRecordType.PivotGridRecord,
                    dimensionKeys: ['Product']
                }
            ];

            const columns: IColumnInfo[] = [
                {
                    header: 'Product',
                    field: 'Product',
                    skip: false,
                    headerType: ExportHeaderType.PivotRowHeader,
                    startIndex: 0,
                    level: 0
                },
                {
                    header: 'London',
                    field: 'City',
                    skip: false,
                    headerType: ExportHeaderType.MultiColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 2,
                    columnGroup: 'London'
                },
                {
                    header: 'Sum',
                    field: 'City-London-Sum',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 1,
                    columnSpan: 1,
                    columnGroupParent: 'London'
                },
                {
                    header: 'Avg',
                    field: 'City-London-Avg',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 1,
                    level: 1,
                    columnSpan: 1,
                    columnGroupParent: 'London'
                },
                {
                    header: 'Paris',
                    field: 'City',
                    skip: false,
                    headerType: ExportHeaderType.MultiColumnHeader,
                    startIndex: 2,
                    level: 0,
                    columnSpan: 1,
                    columnGroup: 'Paris'
                },
                {
                    header: 'Sum',
                    field: 'City-Paris-Sum',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 2,
                    level: 1,
                    columnSpan: 1,
                    columnGroupParent: 'Paris'
                },
                {
                    header: 'Product A',
                    field: 'Product',
                    skip: false,
                    headerType: ExportHeaderType.RowHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1
                }
            ];

            const owner: IColumnList = {
                columns: columns,
                columnWidths: [200, 200, 200, 200],
                indexOfLastPinnedColumn: 0,
                maxLevel: 1,
                maxRowLevel: 1
            };

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, owner);

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                // London spans two aggregations and Paris one, so the second header level is
                // wider than the first, and the dimension name spans both levels.
                expect(getRenderedRows(args.pdf)).toEqual([
                    ['London', 'Paris'],
                    ['Product'],
                    ['Sum', 'Avg', 'Sum'],
                    ['Product A', '100', '50', '200']
                ]);
                done();
            });

            exportRecords(pivotData);
        });

        it('should export pivot grid with PivotMergedHeader columns', (done) => {
            const pivotData: IExportRecord[] = [
                {
                    data: { Product: 'Product A', 'City-London-Sum': 100 },
                    level: 0,
                    type: ExportRecordType.PivotGridRecord,
                    dimensionKeys: ['Product']
                }
            ];

            const columns: IColumnInfo[] = [
                {
                    header: 'Product',
                    field: 'Product',
                    skip: false,
                    headerType: ExportHeaderType.PivotRowHeader,
                    startIndex: 0,
                    level: 0
                },
                {
                    header: '',
                    field: '',
                    skip: false,
                    headerType: ExportHeaderType.PivotMergedHeader,
                    startIndex: 0,
                    level: 0
                },
                {
                    header: 'Sum',
                    field: 'City-London-Sum',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1
                }
            ];

            const owner: IColumnList = {
                columns: columns,
                columnWidths: [200, 200],
                indexOfLastPinnedColumn: 0,
                maxLevel: 0,
                maxRowLevel: 1
            };

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, owner);

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                expect(getRenderedRows(args.pdf)).toEqual([
                    ['Product', 'Sum'],
                    ['Column1', '100']
                ]);
                done();
            });

            exportRecords(pivotData);
        });

        it('should export pivot grid when dimensionKeys are inferred from record data', (done) => {
            const pivotData: IExportRecord[] = [
                {
                    data: { Product: 'Product A', Category: 'Category 1', 'City-London-Sum': 100 },
                    level: 0,
                    type: ExportRecordType.PivotGridRecord
                    // No dimensionKeys - should be inferred
                }
            ];

            const columns: IColumnInfo[] = [
                {
                    header: 'Product',
                    field: 'Product',
                    skip: false,
                    headerType: ExportHeaderType.RowHeader,
                    startIndex: 0,
                    level: 0
                },
                {
                    header: 'Category',
                    field: 'Category',
                    skip: false,
                    headerType: ExportHeaderType.RowHeader,
                    startIndex: 1,
                    level: 1
                },
                {
                    header: 'Sum',
                    field: 'City-London-Sum',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1
                }
            ];

            const owner: IColumnList = {
                columns: columns,
                columnWidths: [200, 200, 200],
                indexOfLastPinnedColumn: 1,
                maxLevel: 0,
                maxRowLevel: 2
            };

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, owner);

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                expect(getRenderedRows(args.pdf)).toEqual([
                    ['Sum'],
                    ['100']
                ]);
                done();
            });

            exportRecords(pivotData);
        });

        it('should export pivot grid with MultiRowHeader columns', (done) => {
            const pivotData: IExportRecord[] = [
                {
                    data: { Product: 'Product A', Category: 'Category 1', 'City-London-Sum': 100 },
                    level: 0,
                    type: ExportRecordType.PivotGridRecord,
                    dimensionKeys: ['Product', 'Category']
                },
                {
                    data: { Product: 'Product A', Category: 'Category 2', 'City-London-Sum': 150 },
                    level: 1,
                    type: ExportRecordType.PivotGridRecord,
                    dimensionKeys: ['Product', 'Category']
                }
            ];

            const columns: IColumnInfo[] = [
                {
                    header: 'Product',
                    field: 'Product',
                    skip: false,
                    headerType: ExportHeaderType.PivotRowHeader,
                    startIndex: 0,
                    level: 0
                },
                {
                    header: 'Category',
                    field: 'Category',
                    skip: false,
                    headerType: ExportHeaderType.PivotRowHeader,
                    startIndex: 1,
                    level: 1
                },
                {
                    header: 'Product A',
                    field: 'Product',
                    skip: false,
                    headerType: ExportHeaderType.MultiRowHeader,
                    startIndex: 0,
                    level: 0,
                    rowSpan: 2
                },
                {
                    header: 'Category 1',
                    field: 'Category',
                    skip: false,
                    headerType: ExportHeaderType.RowHeader,
                    startIndex: 0,
                    level: 1
                },
                {
                    header: 'Category 2',
                    field: 'Category',
                    skip: false,
                    headerType: ExportHeaderType.RowHeader,
                    startIndex: 1,
                    level: 1
                },
                {
                    header: 'Sum',
                    field: 'City-London-Sum',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1
                }
            ];

            const owner: IColumnList = {
                columns: columns,
                columnWidths: [200, 200, 200],
                indexOfLastPinnedColumn: 1,
                maxLevel: 0,
                maxRowLevel: 2
            };

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, owner);

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                expect(getRenderedRows(args.pdf)).toEqual([
                    ['Product', 'Category', 'Sum'],
                    ['Product A', 'Category 1', '100'],
                    ['Product A', 'Category 2', '150']
                ]);
                done();
            });

            exportRecords(pivotData);
        });

        it('should export pivot grid with row dimension columns by level', (done) => {
            const pivotData: IExportRecord[] = [
                {
                    data: { Product: 'Product A', Category: 'Category 1', 'City-London-Sum': 100 },
                    level: 0,
                    type: ExportRecordType.PivotGridRecord,
                    dimensionKeys: ['Product', 'Category']
                },
                {
                    data: { Product: 'Product A', Category: 'Category 2', 'City-London-Sum': 150 },
                    level: 1,
                    type: ExportRecordType.PivotGridRecord,
                    dimensionKeys: ['Product', 'Category']
                }
            ];

            const columns: IColumnInfo[] = [
                {
                    header: 'Product',
                    field: 'Product',
                    skip: false,
                    headerType: ExportHeaderType.PivotRowHeader,
                    startIndex: 0,
                    level: 0
                },
                {
                    header: 'Category',
                    field: 'Category',
                    skip: false,
                    headerType: ExportHeaderType.PivotRowHeader,
                    startIndex: 1,
                    level: 1
                },
                {
                    header: 'Product A',
                    field: 'Product',
                    skip: false,
                    headerType: ExportHeaderType.RowHeader,
                    startIndex: 0,
                    level: 0
                },
                {
                    header: 'Category 1',
                    field: 'Category',
                    skip: false,
                    headerType: ExportHeaderType.RowHeader,
                    startIndex: 0,
                    level: 1
                },
                {
                    header: 'Category 2',
                    field: 'Category',
                    skip: false,
                    headerType: ExportHeaderType.RowHeader,
                    startIndex: 1,
                    level: 1
                },
                {
                    header: 'Sum',
                    field: 'City-London-Sum',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1
                }
            ];

            const owner: IColumnList = {
                columns: columns,
                columnWidths: [200, 200, 200],
                indexOfLastPinnedColumn: 1,
                maxLevel: 0,
                maxRowLevel: 2
            };

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, owner);

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                expect(getRenderedRows(args.pdf)).toEqual([
                    ['Product', 'Category', 'Sum'],
                    ['Product A', 'Category 1', '100'],
                    ['Product A', 'Category 2', '150']
                ]);
                done();
            });

            exportRecords(pivotData);
        });
    });

    describe('Hierarchical Grid Export', () => {
        it('should export hierarchical grid with child records', (done) => {
            const childOwner = 'child1';
            const childColumns: IColumnInfo[] = [
                {
                    header: 'Child Name',
                    field: 'name',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1
                },
                {
                    header: 'Child Age',
                    field: 'age',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 1,
                    level: 0,
                    columnSpan: 1
                }
            ];

            const childOwnerList: IColumnList = {
                columns: childColumns,
                columnWidths: [200, 200],
                indexOfLastPinnedColumn: -1,
                maxLevel: 0
            };

            (exporter as any)._ownersMap.set(childOwner, childOwnerList);

            const parentColumns: IColumnInfo[] = [
                {
                    header: 'Name',
                    field: 'name',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1
                },
                {
                    header: 'Age',
                    field: 'age',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 1,
                    level: 0,
                    columnSpan: 1
                }
            ];

            const parentOwner: IColumnList = {
                columns: parentColumns,
                columnWidths: [200, 200],
                indexOfLastPinnedColumn: -1,
                maxLevel: 0
            };

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, parentOwner);

            const hierarchicalData: IExportRecord[] = [
                {
                    data: { name: 'Parent 1', age: 40 },
                    level: 0,
                    type: ExportRecordType.HierarchicalGridRecord,
                    owner: DEFAULT_OWNER
                },
                {
                    data: { name: 'Child 1', age: 10 },
                    level: 1,
                    type: ExportRecordType.HierarchicalGridRecord,
                    owner: childOwner
                },
                {
                    data: { name: 'Child 2', age: 12 },
                    level: 1,
                    type: ExportRecordType.HierarchicalGridRecord,
                    owner: childOwner
                },
                {
                    data: { name: 'Parent 2', age: 45 },
                    level: 0,
                    type: ExportRecordType.HierarchicalGridRecord,
                    owner: DEFAULT_OWNER
                }
            ];

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                expect(getRenderedRows(args.pdf)).toEqual([
                    ['Name', 'Age'],
                    ['Parent 1', '40'],
                    ['Child Name', 'Child Age'],
                    ['Child 1', '10'],
                    ['Child 2', '12'],
                    ['Parent 2', '45']
                ]);
                done();
            });

            exportRecords(hierarchicalData);
        });

        it('should export hierarchical grid with multiple child levels', (done) => {
            const grandChildOwner = 'grandchild1';
            const childOwner = 'child1';

            const grandChildColumns: IColumnInfo[] = [
                {
                    header: 'Grandchild Name',
                    field: 'name',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1
                }
            ];

            const grandChildOwnerList: IColumnList = {
                columns: grandChildColumns,
                columnWidths: [200],
                indexOfLastPinnedColumn: -1,
                maxLevel: 0
            };

            (exporter as any)._ownersMap.set(grandChildOwner, grandChildOwnerList);

            const childColumns: IColumnInfo[] = [
                {
                    header: 'Child Name',
                    field: 'name',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1
                }
            ];

            const childOwnerList: IColumnList = {
                columns: childColumns,
                columnWidths: [200],
                indexOfLastPinnedColumn: -1,
                maxLevel: 0
            };

            (exporter as any)._ownersMap.set(childOwner, childOwnerList);

            const parentColumns: IColumnInfo[] = [
                {
                    header: 'Name',
                    field: 'name',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1
                }
            ];

            const parentOwner: IColumnList = {
                columns: parentColumns,
                columnWidths: [200],
                indexOfLastPinnedColumn: -1,
                maxLevel: 0
            };

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, parentOwner);

            const hierarchicalData: IExportRecord[] = [
                {
                    data: { name: 'Parent 1' },
                    level: 0,
                    type: ExportRecordType.HierarchicalGridRecord,
                    owner: DEFAULT_OWNER
                },
                {
                    data: { name: 'Child 1' },
                    level: 1,
                    type: ExportRecordType.HierarchicalGridRecord,
                    owner: childOwner
                },
                {
                    data: { name: 'Grandchild 1' },
                    level: 2,
                    type: ExportRecordType.HierarchicalGridRecord,
                    owner: grandChildOwner
                },
                {
                    data: { name: 'Grandchild 2' },
                    level: 2,
                    type: ExportRecordType.HierarchicalGridRecord,
                    owner: grandChildOwner
                }
            ];

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                expect(getRenderedRows(args.pdf)).toEqual([
                    ['Name'],
                    ['Parent 1'],
                    ['Child Name'],
                    ['Child 1'],
                    ['Grandchild Name'],
                    ['Grandchild 1'],
                    ['Grandchild 2']
                ]);
                done();
            });

            exportRecords(hierarchicalData);
        });

        it('should export hierarchical grid with multi-level headers in child grid', (done) => {
            const childOwner = 'child1';

            const childColumns: IColumnInfo[] = [
                {
                    header: 'Location',
                    field: 'location',
                    skip: false,
                    headerType: ExportHeaderType.MultiColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 2,
                    columnGroup: 'Location'
                },
                {
                    header: 'City',
                    field: 'city',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 1,
                    columnSpan: 1,
                    columnGroupParent: 'Location'
                },
                {
                    header: 'Country',
                    field: 'country',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 1,
                    level: 1,
                    columnSpan: 1,
                    columnGroupParent: 'Location'
                }
            ];

            const childOwnerList: IColumnList = {
                columns: childColumns,
                columnWidths: [200, 200],
                indexOfLastPinnedColumn: -1,
                maxLevel: 1
            };

            (exporter as any)._ownersMap.set(childOwner, childOwnerList);

            const parentColumns: IColumnInfo[] = [
                {
                    header: 'Name',
                    field: 'name',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1
                }
            ];

            const parentOwner: IColumnList = {
                columns: parentColumns,
                columnWidths: [200],
                indexOfLastPinnedColumn: -1,
                maxLevel: 0
            };

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, parentOwner);

            const hierarchicalData: IExportRecord[] = [
                {
                    data: { name: 'Parent 1' },
                    level: 0,
                    type: ExportRecordType.HierarchicalGridRecord,
                    owner: DEFAULT_OWNER
                },
                {
                    data: { city: 'London', country: 'UK' },
                    level: 1,
                    type: ExportRecordType.HierarchicalGridRecord,
                    owner: childOwner
                }
            ];

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                expect(getRenderedRows(args.pdf)).toEqual([
                    ['Name'],
                    ['Parent 1'],
                    ['Location'],
                    ['City', 'Country'],
                    ['London', 'UK']
                ]);
                done();
            });

            exportRecords(hierarchicalData);
        });
    });

    describe('Tree Grid Export', () => {
        it('should export tree grid with hierarchical levels', (done) => {
            const treeData: IExportRecord[] = [
                {
                    data: { name: 'Root 1', value: 100 },
                    level: 0,
                    type: ExportRecordType.TreeGridRecord
                },
                {
                    data: { name: 'Child 1', value: 50 },
                    level: 1,
                    type: ExportRecordType.TreeGridRecord
                },
                {
                    data: { name: 'Grandchild 1', value: 25 },
                    level: 2,
                    type: ExportRecordType.TreeGridRecord
                },
                {
                    data: { name: 'Root 2', value: 200 },
                    level: 0,
                    type: ExportRecordType.TreeGridRecord
                }
            ];

            const columns: IColumnInfo[] = [
                {
                    header: 'Name',
                    field: 'name',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1
                },
                {
                    header: 'Value',
                    field: 'value',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 1,
                    level: 0,
                    columnSpan: 1
                }
            ];

            const owner: IColumnList = {
                columns: columns,
                columnWidths: [200, 200],
                indexOfLastPinnedColumn: -1,
                maxLevel: 0
            };

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, owner);

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                // A tree grid keeps every record in one table; the nesting shows up as the
                // indent of the first cell rather than as a separate header row per level.
                expect(getRenderedRows(args.pdf)).toEqual([
                    ['Name', 'Value'],
                    ['Root 1', '100'],
                    ['Child 1', '50'],
                    ['Grandchild 1', '25'],
                    ['Root 2', '200']
                ]);
                done();
            });

            exportRecords(treeData);
        });
    });

    describe('Summary Records Export', () => {
        it('should export summary records with label and value', (done) => {
            const summaryData: IExportRecord[] = [
                {
                    data: { name: 'Total', value: { label: 'Sum', value: 500 } },
                    level: 0,
                    type: ExportRecordType.SummaryRecord
                }
            ];

            const columns: IColumnInfo[] = [
                {
                    header: 'Name',
                    field: 'name',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1
                },
                {
                    header: 'Value',
                    field: 'value',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 1,
                    level: 0,
                    columnSpan: 1
                }
            ];

            const owner: IColumnList = {
                columns: columns,
                columnWidths: [200, 200],
                indexOfLastPinnedColumn: -1,
                maxLevel: 0
            };

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, owner);

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                expect(getRenderedRows(args.pdf)).toEqual([
                    ['Name', 'Value'],
                    ['Total', 'Sum: 500']
                ]);
                done();
            });

            exportRecords(summaryData);
        });

        it('should export summary records with summaryResult property', (done) => {
            const summaryData: IExportRecord[] = [
                {
                    data: { name: 'Total', value: { summaryResult: 1000 } },
                    level: 0,
                    type: ExportRecordType.SummaryRecord
                }
            ];

            const columns: IColumnInfo[] = [
                {
                    header: 'Name',
                    field: 'name',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1
                },
                {
                    header: 'Value',
                    field: 'value',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 1,
                    level: 0,
                    columnSpan: 1
                }
            ];

            const owner: IColumnList = {
                columns: columns,
                columnWidths: [200, 200],
                indexOfLastPinnedColumn: -1,
                maxLevel: 0
            };

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, owner);

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                expect(getRenderedRows(args.pdf)).toEqual([
                    ['Name', 'Value'],
                    ['Total', '1000']
                ]);
                done();
            });

            exportRecords(summaryData);
        });
    });

    /**
     * A few of these declare a row dimension that has no column carrying its value, so their
     * dimension cell comes out empty. The base exporter rebuilds each record out of the owner's
     * `ColumnHeader` columns on the way in, which drops any key that has no column of its own, and
     * the cell is then drawn blank - a blank cell leaves no text in the document, and so no entry
     * in the row.
     */
    describe('Edge Cases and Special Scenarios', () => {
        it('should skip hidden records', (done) => {
            const dataWithHidden: IExportRecord[] = [
                {
                    data: { Name: 'Visible', Age: 30 },
                    level: 0,
                    type: ExportRecordType.DataRecord
                },
                {
                    data: { Name: 'Hidden', Age: 25 },
                    level: 0,
                    type: ExportRecordType.DataRecord,
                    hidden: true
                },
                {
                    data: { Name: 'Visible 2', Age: 35 },
                    level: 0,
                    type: ExportRecordType.DataRecord
                }
            ];

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                // The hidden record takes no row at all - it is not drawn as a blank one.
                expect(getRenderedRows(args.pdf)).toEqual([
                    ['Name', 'Age'],
                    ['Visible', '30'],
                    ['Visible 2', '35']
                ]);
                done();
            });

            exportRecords(dataWithHidden);
        });

        it('should handle pagination when data exceeds page height', (done) => {
            const largeData: IExportRecord[] = [];
            for (let i = 0; i < 50; i++) {
                largeData.push({
                    data: { Name: `Person ${i}`, Age: 20 + i, City: `City ${i % 10}` },
                    level: 0,
                    type: ExportRecordType.DataRecord
                });
            }

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);

                const pages = getRenderedRowsByPage(args.pdf);
                expect(pages.length).toBe(3);
                // The header row is repeated at the top of every page, and the rows carry on from
                // page to page in order, with none dropped at a break and none drawn twice.
                expect(pages.map(page => page[0])).toEqual(pages.map(() => ['Name', 'Age', 'City']));
                expect(pages.flatMap(page => page.slice(1))).toEqual(
                    largeData.map(record => [record.data.Name, String(record.data.Age), record.data.City]));
                // A page break only happens once a page is full, so every page but the last one
                // holds the same number of rows.
                expect(new Set(pages.slice(0, -1).map(page => page.length)).size).toBe(1);
                expect(pages[pages.length - 1].length).toBeLessThanOrEqual(pages[0].length);
                done();
            });

            exportRecords(largeData);
        });

        it('should handle pivot grid with empty row dimension fields', (done) => {
            const pivotData: IExportRecord[] = [
                {
                    data: { 'City-London-Sum': 100 },
                    level: 0,
                    type: ExportRecordType.PivotGridRecord,
                    dimensionKeys: []
                }
            ];

            const columns: IColumnInfo[] = [
                {
                    header: 'Sum',
                    field: 'City-London-Sum',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1
                }
            ];

            const owner: IColumnList = {
                columns: columns,
                columnWidths: [200],
                indexOfLastPinnedColumn: -1,
                maxLevel: 0,
                maxRowLevel: 0
            };

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, owner);

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                expect(getRenderedRows(args.pdf)).toEqual([
                    ['Sum'],
                    ['100']
                ]);
                done();
            });

            exportRecords(pivotData);
        });

        it('should handle pivot grid when no columns are defined', (done) => {
            const pivotData: IExportRecord[] = [
                {
                    data: { Product: 'Product A', Value: 100 },
                    level: 0,
                    type: ExportRecordType.PivotGridRecord
                }
            ];

            const owner: IColumnList = {
                columns: [],
                columnWidths: [],
                indexOfLastPinnedColumn: -1,
                maxLevel: 0
            };

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, owner);

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                // The owner has no columns to lay the table out with, and the record has nothing
                // left in it to derive them from either, so a single blank page comes out - with
                // the header background as the only thing drawn on it.
                expect(getPageCount(args.pdf)).toBe(1);
                expect(getRenderedRows(args.pdf)).toEqual([]);
                expect(getDrawnRectangles(args.pdf).map(rectangle => rectangle.filled)).toEqual([true]);
                done();
            });

            exportRecords(pivotData);
        });

        it('should handle pivot grid with row dimension headers longer than fields', (done) => {
            const pivotData: IExportRecord[] = [
                {
                    data: { Product: 'Product A', 'City-London-Sum': 100 },
                    level: 0,
                    type: ExportRecordType.PivotGridRecord,
                    dimensionKeys: ['Product']
                }
            ];

            const columns: IColumnInfo[] = [
                {
                    header: 'Product',
                    field: 'Product',
                    skip: false,
                    headerType: ExportHeaderType.PivotRowHeader,
                    startIndex: 0,
                    level: 0
                },
                {
                    header: 'Category',
                    field: 'Category',
                    skip: false,
                    headerType: ExportHeaderType.PivotRowHeader,
                    startIndex: 1,
                    level: 1
                },
                {
                    header: 'Sum',
                    field: 'City-London-Sum',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1
                }
            ];

            const owner: IColumnList = {
                columns: columns,
                columnWidths: [200, 200, 200],
                indexOfLastPinnedColumn: 1,
                maxLevel: 0,
                maxRowLevel: 2
            };

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, owner);

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                expect(getRenderedRows(args.pdf)).toEqual([
                    ['Product', 'Category', 'Sum'],
                    ['100']
                ]);
                done();
            });

            exportRecords(pivotData);
        });

        it('should handle pivot grid with date values in row dimensions', (done) => {
            const pivotData: IExportRecord[] = [
                {
                    data: { Date: new Date('2023-01-01'), 'City-London-Sum': 100 },
                    level: 0,
                    type: ExportRecordType.PivotGridRecord,
                    dimensionKeys: ['Date']
                }
            ];

            const columns: IColumnInfo[] = [
                {
                    header: 'Date',
                    field: 'Date',
                    skip: false,
                    headerType: ExportHeaderType.PivotRowHeader,
                    startIndex: 0,
                    level: 0
                },
                // The dimension needs a column of its own for its value to survive the record
                // rebuild the base exporter does; being an exact match of a dimension key keeps
                // it out of the data columns all the same.
                {
                    header: 'Date',
                    field: 'Date',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1
                },
                {
                    header: 'Sum',
                    field: 'City-London-Sum',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 1,
                    level: 0,
                    columnSpan: 1
                }
            ];

            const owner: IColumnList = {
                columns: columns,
                columnWidths: [200, 200],
                indexOfLastPinnedColumn: 0,
                maxLevel: 0,
                maxRowLevel: 1
            };

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, owner);

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                // A date in a dimension cell is written out in the locale's short date format
                // rather than as the raw value. `Date` appears twice in the header row because
                // the header is drawn from every column, including the one held back from the
                // data columns for being a dimension.
                expect(getRenderedRows(args.pdf)).toEqual([
                    ['Date', 'Date', 'Sum'],
                    [new Date('2023-01-01').toLocaleDateString(), '100']
                ]);
                done();
            });

            exportRecords(pivotData);
        });

        it('should handle hierarchical grid with HeaderRecord type', (done) => {
            const childOwner = 'child1';
            const childColumns: IColumnInfo[] = [
                {
                    header: 'Name',
                    field: 'name',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1
                }
            ];

            const childOwnerList: IColumnList = {
                columns: childColumns,
                columnWidths: [200],
                indexOfLastPinnedColumn: -1,
                maxLevel: 0
            };

            (exporter as any)._ownersMap.set(childOwner, childOwnerList);

            const parentColumns: IColumnInfo[] = [
                {
                    header: 'Name',
                    field: 'name',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1
                }
            ];

            const parentOwner: IColumnList = {
                columns: parentColumns,
                columnWidths: [200],
                indexOfLastPinnedColumn: -1,
                maxLevel: 0
            };

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, parentOwner);

            const hierarchicalData: IExportRecord[] = [
                {
                    data: { name: 'Parent 1' },
                    level: 0,
                    type: ExportRecordType.HierarchicalGridRecord,
                    owner: DEFAULT_OWNER
                },
                {
                    // A header record carries the header texts as an array, with `references`
                    // pointing at the columns they came from - that is how the base exporter
                    // builds the header row that introduces a child island.
                    data: childColumns.map(col => col.header),
                    level: 1,
                    type: ExportRecordType.HeaderRecord,
                    owner: childOwner,
                    references: childColumns
                },
                {
                    data: { name: 'Child 1' },
                    level: 1,
                    type: ExportRecordType.HierarchicalGridRecord,
                    owner: childOwner
                }
            ];

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                // The header record introduces the child island with its own header row, which
                // here happens to carry the same caption as the parent's.
                expect(getRenderedRows(args.pdf)).toEqual([
                    ['Name'],
                    ['Parent 1'],
                    ['Name'],
                    ['Child 1']
                ]);
                done();
            });

            exportRecords(hierarchicalData);
        });

        it('should handle hierarchical grid with empty child columns', (done) => {
            const childOwner = 'child1';
            const childOwnerList: IColumnList = {
                columns: [],
                columnWidths: [],
                indexOfLastPinnedColumn: -1,
                maxLevel: 0
            };

            (exporter as any)._ownersMap.set(childOwner, childOwnerList);

            const parentColumns: IColumnInfo[] = [
                {
                    header: 'Name',
                    field: 'name',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1
                }
            ];

            const parentOwner: IColumnList = {
                columns: parentColumns,
                columnWidths: [200],
                indexOfLastPinnedColumn: -1,
                maxLevel: 0
            };

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, parentOwner);

            const hierarchicalData: IExportRecord[] = [
                {
                    data: { name: 'Parent 1' },
                    level: 0,
                    type: ExportRecordType.HierarchicalGridRecord,
                    owner: DEFAULT_OWNER
                },
                {
                    data: { name: 'Child 1' },
                    level: 1,
                    type: ExportRecordType.HierarchicalGridRecord,
                    owner: childOwner
                }
            ];

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                expect(getRenderedRows(args.pdf)).toEqual([
                    ['Name'],
                    ['Parent 1']
                ]);
                done();
            });

            exportRecords(hierarchicalData);
        });

        it('should handle pagination with hierarchical grid', (done) => {
            const childOwner = 'child1';
            const childColumns: IColumnInfo[] = [
                {
                    header: 'Child Name',
                    field: 'name',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1
                }
            ];

            const childOwnerList: IColumnList = {
                columns: childColumns,
                columnWidths: [200],
                indexOfLastPinnedColumn: -1,
                maxLevel: 0
            };

            (exporter as any)._ownersMap.set(childOwner, childOwnerList);

            const parentColumns: IColumnInfo[] = [
                {
                    header: 'Name',
                    field: 'name',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1
                }
            ];

            const parentOwner: IColumnList = {
                columns: parentColumns,
                columnWidths: [200],
                indexOfLastPinnedColumn: -1,
                maxLevel: 0
            };

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, parentOwner);

            const hierarchicalData: IExportRecord[] = [];
            // Create many parent-child pairs to trigger pagination
            for (let i = 0; i < 30; i++) {
                hierarchicalData.push({
                    data: { name: `Parent ${i}` },
                    level: 0,
                    type: ExportRecordType.HierarchicalGridRecord,
                    owner: DEFAULT_OWNER
                });
                hierarchicalData.push({
                    data: { name: `Child ${i}` },
                    level: 1,
                    type: ExportRecordType.HierarchicalGridRecord,
                    owner: childOwner
                });
            }

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);

                const pages = getRenderedRowsByPage(args.pdf);
                expect(pages.length).toBe(5);

                // Every parent is followed by the header row of its island and then its child, in
                // order and without repetition, however the page breaks happen to fall.
                const expected: string[][] = [];
                for (let i = 0; i < 30; i++) {
                    expected.push([`Parent ${i}`], ['Child Name'], [`Child ${i}`]);
                }
                expect(pages.flat().filter(row => row[0] !== 'Name')).toEqual(expected);

                // The parent header row is only redrawn on a page that opens on a parent record,
                // so it does not appear on all five pages.
                const pagesOpeningWithHeader = pages.filter(page => page[0][0] === 'Name').length;
                expect(pagesOpeningWithHeader).toBeGreaterThan(0);
                expect(pagesOpeningWithHeader).toBeLessThan(pages.length);

                // Child rows are indented one step further than the parents they belong to.
                const cells = getRenderedCells(args.pdf);
                const xOf = (text: string) => cells.find(cell => cell.text === text)!.x;
                expect(xOf('Parent 0')).toBeLessThan(xOf('Child 0'));
                expect(xOf('Parent 29')).toBe(xOf('Parent 0'));
                done();
            });

            exportRecords(hierarchicalData);
        });
    });

    /**
     * These probe the defensive paths of the exporter with column shapes a grid would not normally
     * produce, so several of them end up with an empty row dimension cell. That is expected rather
     * than a quirk of the assertion: the base exporter rebuilds each record out of the owner's
     * `ColumnHeader` columns on the way in, so a dimension key that has no column of its own is
     * already gone by the time the PDF exporter looks for its value, and the row header columns
     * these fixtures declare do not match the record either. A blank cell is still drawn - it just
     * leaves no text in the document, and so no entry in the row.
     */
    describe('Additional Edge Cases and Error Paths', () => {
        it('should handle pivot grid with no defaultOwner', (done) => {
            const pivotData: IExportRecord[] = [
                {
                    data: { Product: 'Product A', 'City-London-Sum': 100 },
                    level: 0,
                    type: ExportRecordType.PivotGridRecord,
                    dimensionKeys: ['Product']
                }
            ];

            // Don't set DEFAULT_OWNER in the map
            (exporter as any)._ownersMap.clear();

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                // With no owner registered there are no columns to lay the table out with, so
                // the exporter falls back to the keys of the first record - including the
                // dimension key, which therefore keeps its value.
                expect(getRenderedRows(args.pdf)).toEqual([
                    ['Product', 'City-London-Sum'],
                    ['Product A', '100']
                ]);
                done();
            });

            exportRecords(pivotData);
        });

        it('should handle pivot grid dimension inference from columnGroup', (done) => {
            const pivotData: IExportRecord[] = [
                {
                    data: { Product: 'Product A', Category: 'Category 1', 'City-London-Sum': 100 },
                    level: 0,
                    type: ExportRecordType.PivotGridRecord
                    // No dimensionKeys - should be inferred
                }
            ];

            const columns: IColumnInfo[] = [
                {
                    header: 'Product',
                    field: 'Product',
                    skip: false,
                    headerType: ExportHeaderType.RowHeader,
                    startIndex: 0,
                    level: 0,
                    columnGroup: 'Product'
                },
                {
                    header: 'Category',
                    field: 'Category',
                    skip: false,
                    headerType: ExportHeaderType.RowHeader,
                    startIndex: 1,
                    level: 1,
                    columnGroupParent: 'Product'
                },
                {
                    header: 'Sum',
                    field: 'City-London-Sum',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1
                }
            ];

            const owner: IColumnList = {
                columns: columns,
                columnWidths: [200, 200, 200],
                indexOfLastPinnedColumn: 1,
                maxLevel: 0,
                maxRowLevel: 2
            };

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, owner);

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                expect(getRenderedRows(args.pdf)).toEqual([
                    ['Sum'],
                    ['100']
                ]);
                done();
            });

            exportRecords(pivotData);
        });

        it('should handle pivot grid with simple keys inference', (done) => {
            const pivotData: IExportRecord[] = [
                {
                    data: { SimpleKey: 'Value1', 'Complex-Key-With-Separators': 100, 'Another_Complex_Key': 200 },
                    level: 0,
                    type: ExportRecordType.PivotGridRecord
                    // No dimensionKeys and no matching row headers
                }
            ];

            const columns: IColumnInfo[] = [
                {
                    header: 'Sum',
                    field: 'Complex-Key-With-Separators',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1
                }
            ];

            const owner: IColumnList = {
                columns: columns,
                columnWidths: [200],
                indexOfLastPinnedColumn: -1,
                maxLevel: 0,
                maxRowLevel: 0
            };

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, owner);

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                expect(getRenderedRows(args.pdf)).toEqual([
                    ['Sum'],
                    ['100']
                ]);
                done();
            });

            exportRecords(pivotData);
        });

        it('should handle pivot grid with row dimension headers longer than fields and trim them', (done) => {
            const pivotData: IExportRecord[] = [
                {
                    data: { Product: 'Product A', 'City-London-Sum': 100 },
                    level: 0,
                    type: ExportRecordType.PivotGridRecord,
                    dimensionKeys: ['Product']
                }
            ];

            const columns: IColumnInfo[] = [
                {
                    header: 'Product',
                    field: 'Product',
                    skip: false,
                    headerType: ExportHeaderType.PivotRowHeader,
                    startIndex: 0,
                    level: 0
                },
                {
                    header: 'Category',
                    field: 'Category',
                    skip: false,
                    headerType: ExportHeaderType.PivotRowHeader,
                    startIndex: 1,
                    level: 1
                },
                {
                    header: 'SubCategory',
                    field: 'SubCategory',
                    skip: false,
                    headerType: ExportHeaderType.PivotRowHeader,
                    startIndex: 2,
                    level: 2
                },
                {
                    header: 'Sum',
                    field: 'City-London-Sum',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1
                }
            ];

            const owner: IColumnList = {
                columns: columns,
                columnWidths: [200, 200, 200, 200],
                indexOfLastPinnedColumn: 2,
                maxLevel: 0,
                maxRowLevel: 3
            };

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, owner);

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                expect(getRenderedRows(args.pdf)).toEqual([
                    ['Product', 'Category', 'Sum', 'SubCategory'],
                    ['100']
                ]);
                done();
            });

            exportRecords(pivotData);
        });

        it('should handle multi-level headers with empty headersForLevel', (done) => {
            const columns: IColumnInfo[] = [
                {
                    header: 'Name',
                    field: 'name',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1
                },
                {
                    header: 'Parent',
                    field: 'parent',
                    skip: false,
                    headerType: ExportHeaderType.MultiColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1,
                    columnGroup: 'Parent'
                },
                {
                    header: 'Child',
                    field: 'child',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 1,
                    columnSpan: 1,
                    columnGroupParent: 'Parent'
                }
            ];

            const owner: IColumnList = {
                columns: columns,
                columnWidths: [200, 200, 200],
                indexOfLastPinnedColumn: -1,
                maxLevel: 2 // Level 2 exists but no columns at that level
            };

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, owner);

            const data: IExportRecord[] = [
                {
                    data: { name: 'Test', parent: 'Parent', child: 'Child' },
                    level: 0,
                    type: ExportRecordType.DataRecord
                }
            ];

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                // The group that has no children of its own is still drawn, on the level it
                // declares, and the leaf column keeps its place underneath its own parent.
                expect(getRenderedRows(args.pdf)).toEqual([
                    ['Parent'],
                    ['Name'],
                    ['Child'],
                    ['Test', 'Child']
                ]);
                done();
            });

            exportRecords(data);
        });

        it('should handle columns with skip: true', (done) => {
            const columns: IColumnInfo[] = [
                {
                    header: 'Name',
                    field: 'name',
                    skip: true, // Should be skipped
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1
                },
                {
                    header: 'Age',
                    field: 'age',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 1,
                    level: 0,
                    columnSpan: 1
                }
            ];

            const owner: IColumnList = {
                columns: columns,
                columnWidths: [200, 200],
                indexOfLastPinnedColumn: -1,
                maxLevel: 0
            };

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, owner);

            const data: IExportRecord[] = [
                {
                    data: { name: 'John', age: 30 },
                    level: 0,
                    type: ExportRecordType.DataRecord
                }
            ];

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                // The skipped column is left out of both the header row and the data row, and
                // the remaining column takes the whole table.
                expect(getRenderedRows(args.pdf)).toEqual([
                    ['Age'],
                    ['30']
                ]);
                done();
            });

            exportRecords(data);
        });

        it('should handle GRID_LEVEL_COL column', (done) => {
            const columns: IColumnInfo[] = [
                {
                    header: 'Name',
                    field: 'name',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1
                },
                {
                    header: GRID_LEVEL_COL,
                    field: GRID_LEVEL_COL,
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 1,
                    level: 0,
                    columnSpan: 1
                }
            ];

            const owner: IColumnList = {
                columns: columns,
                columnWidths: [200, 200],
                indexOfLastPinnedColumn: -1,
                maxLevel: 0
            };

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, owner);

            const data: IExportRecord[] = [
                {
                    data: { name: 'John', [GRID_LEVEL_COL]: 0 },
                    level: 0,
                    type: ExportRecordType.DataRecord
                }
            ];

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                // The internal grid level column is never drawn, so only the real column is.
                expect(getRenderedRows(args.pdf)).toEqual([
                    ['Name'],
                    ['John']
                ]);
                done();
            });

            exportRecords(data);
        });

        it('should handle records with missing data property', (done) => {
            const data: IExportRecord[] = [
                {
                    data: { Name: 'John', Age: 30 },
                    level: 0,
                    type: ExportRecordType.DataRecord
                },
                {
                    data: undefined as any,
                    level: 0,
                    type: ExportRecordType.DataRecord
                }
            ];

            // The columns have to be declared up front - deriving them from the records would
            // trip over the record that has no data before the exporter is ever reached.
            (exporter as any)._ownersMap.set(DEFAULT_OWNER, {
                columns: [
                    {
                        header: 'Name', field: 'Name', skip: false,
                        headerType: ExportHeaderType.ColumnHeader, level: 0, startIndex: 0, columnSpan: 1
                    },
                    {
                        header: 'Age', field: 'Age', skip: false,
                        headerType: ExportHeaderType.ColumnHeader, level: 0, startIndex: 1, columnSpan: 1
                    }
                ],
                columnWidths: [200, 200],
                indexOfLastPinnedColumn: -1,
                maxLevel: 0
            } as IColumnList);

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                expect(getRenderedRows(args.pdf)).toEqual([
                    ['Name', 'Age'],
                    ['John', '30']
                ]);
                done();
            });

            exportRecords(data);
        });

        it('should handle pivot grid with fuzzy key matching', (done) => {
            const pivotData: IExportRecord[] = [
                {
                    data: { 'ProductName': 'Product A', 'City-London-Sum': 100 },
                    level: 0,
                    type: ExportRecordType.PivotGridRecord,
                    dimensionKeys: ['Product'] // Field name doesn't match exactly
                }
            ];

            const columns: IColumnInfo[] = [
                {
                    header: 'Product',
                    field: 'Product',
                    skip: false,
                    headerType: ExportHeaderType.PivotRowHeader,
                    startIndex: 0,
                    level: 0
                },
                // The key the record actually holds needs a column of its own to survive the
                // record rebuild; it is not an exact match of the dimension key, so it also stays
                // among the data columns.
                {
                    header: 'Product Name',
                    field: 'ProductName',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1
                },
                {
                    header: 'Sum',
                    field: 'City-London-Sum',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 1,
                    level: 0,
                    columnSpan: 1
                }
            ];

            const owner: IColumnList = {
                columns: columns,
                columnWidths: [200, 200],
                indexOfLastPinnedColumn: 0,
                maxLevel: 0,
                maxRowLevel: 1
            };

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, owner);

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                // `Product` does not appear in the record, but `ProductName` contains it, and the
                // fuzzy match is enough to fill the dimension cell.
                expect(getRenderedRows(args.pdf)).toEqual([
                    ['Product', 'Product Name', 'Sum'],
                    ['Product A', 'Product A', '100']
                ]);
                done();
            });

            exportRecords(pivotData);
        });

        it('should handle pivot grid with possible dimension keys by index fallback', (done) => {
            const pivotData: IExportRecord[] = [
                {
                    data: { SimpleKey1: 'Value1', SimpleKey2: 'Value2', 'Complex-Key': 100 },
                    level: 0,
                    type: ExportRecordType.PivotGridRecord,
                    dimensionKeys: ['UnknownKey'] // Key doesn't exist in data
                }
            ];

            const columns: IColumnInfo[] = [
                {
                    header: 'Unknown',
                    field: 'UnknownKey',
                    skip: false,
                    headerType: ExportHeaderType.PivotRowHeader,
                    startIndex: 0,
                    level: 0
                },
                // The two simple keys need columns of their own to reach the exporter at all.
                {
                    header: 'Simple Key 1',
                    field: 'SimpleKey1',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1
                },
                {
                    header: 'Simple Key 2',
                    field: 'SimpleKey2',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 1,
                    level: 0,
                    columnSpan: 1
                },
                {
                    header: 'Sum',
                    field: 'Complex-Key',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 2,
                    level: 0,
                    columnSpan: 1
                }
            ];

            const owner: IColumnList = {
                columns: columns,
                columnWidths: [200, 200],
                indexOfLastPinnedColumn: 0,
                maxLevel: 0,
                maxRowLevel: 1
            };

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, owner);

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                // `UnknownKey` matches nothing in the record by name, so the single dimension cell
                // falls back to the first of the record's simple keys - a key with a separator in
                // it is not considered a dimension at all.
                expect(getRenderedRows(args.pdf)).toEqual([
                    ['Unknown', 'Simple Key 1', 'Simple Key 2', 'Sum'],
                    ['Value1', 'Value1', 'Value2', '100']
                ]);
                done();
            });

            exportRecords(pivotData);
        });

        it('should handle summary records with only label', (done) => {
            const summaryData: IExportRecord[] = [
                {
                    data: { name: 'Total', value: { label: 'Sum' } },
                    level: 0,
                    type: ExportRecordType.SummaryRecord
                }
            ];

            const columns: IColumnInfo[] = [
                {
                    header: 'Name',
                    field: 'name',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1
                },
                {
                    header: 'Value',
                    field: 'value',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 1,
                    level: 0,
                    columnSpan: 1
                }
            ];

            const owner: IColumnList = {
                columns: columns,
                columnWidths: [200, 200],
                indexOfLastPinnedColumn: -1,
                maxLevel: 0
            };

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, owner);

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                expect(getRenderedRows(args.pdf)).toEqual([
                    ['Name', 'Value'],
                    ['Total', 'Sum']
                ]);
                done();
            });

            exportRecords(summaryData);
        });

        it('should handle summary records with only value', (done) => {
            const summaryData: IExportRecord[] = [
                {
                    data: { name: 'Total', value: { value: 500 } },
                    level: 0,
                    type: ExportRecordType.SummaryRecord
                }
            ];

            const columns: IColumnInfo[] = [
                {
                    header: 'Name',
                    field: 'name',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1
                },
                {
                    header: 'Value',
                    field: 'value',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 1,
                    level: 0,
                    columnSpan: 1
                }
            ];

            const owner: IColumnList = {
                columns: columns,
                columnWidths: [200, 200],
                indexOfLastPinnedColumn: -1,
                maxLevel: 0
            };

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, owner);

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                expect(getRenderedRows(args.pdf)).toEqual([
                    ['Name', 'Value'],
                    ['Total', '500']
                ]);
                done();
            });

            exportRecords(summaryData);
        });

        it('should handle pivot grid with empty PivotRowHeader columns', (done) => {
            const pivotData: IExportRecord[] = [
                {
                    data: { Product: 'Product A', 'City-London-Sum': 100 },
                    level: 0,
                    type: ExportRecordType.PivotGridRecord,
                    dimensionKeys: ['Product']
                }
            ];

            const columns: IColumnInfo[] = [
                {
                    header: '',
                    field: '',
                    skip: false,
                    headerType: ExportHeaderType.PivotRowHeader,
                    startIndex: 0,
                    level: 0
                },
                {
                    header: 'Sum',
                    field: 'City-London-Sum',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1
                }
            ];

            const owner: IColumnList = {
                columns: columns,
                columnWidths: [200, 200],
                indexOfLastPinnedColumn: 0,
                maxLevel: 0,
                maxRowLevel: 1
            };

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, owner);

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                // A row header with no caption of its own is given a generated one on the way
                // in, and that is what ends up above the dimension column.
                expect(getRenderedRows(args.pdf)).toEqual([
                    ['Column1', 'Sum'],
                    ['100']
                ]);
                done();
            });

            exportRecords(pivotData);
        });

        it('should handle hierarchical grid with owner not in map', (done) => {
            const childOwner = 'nonexistent-owner';
            const parentColumns: IColumnInfo[] = [
                {
                    header: 'Name',
                    field: 'name',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1
                }
            ];

            const parentOwner: IColumnList = {
                columns: parentColumns,
                columnWidths: [200],
                indexOfLastPinnedColumn: -1,
                maxLevel: 0
            };

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, parentOwner);
            // Don't set childOwner in map

            const hierarchicalData: IExportRecord[] = [
                {
                    data: { name: 'Parent 1' },
                    level: 0,
                    type: ExportRecordType.HierarchicalGridRecord,
                    owner: childOwner
                }
            ];

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                // The missing owner leaves the exporter without columns, so it derives them
                // from the record data and the export still produces a readable table.
                expect(getRenderedRows(args.pdf)).toEqual([
                    ['name'],
                    ['Parent 1']
                ]);
                done();
            });

            // The base exporter would throw on the missing owner long before the PDF exporter is
            // reached, so the records go in directly here.
            drawRecords(hierarchicalData);
        });

        it('should handle tree grid with undefined level', (done) => {
            const treeData: IExportRecord[] = [
                {
                    data: { name: 'Root 1', value: 100 },
                    level: undefined as any,
                    type: ExportRecordType.TreeGridRecord
                }
            ];

            const columns: IColumnInfo[] = [
                {
                    header: 'Name',
                    field: 'name',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1
                },
                {
                    header: 'Value',
                    field: 'value',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 1,
                    level: 0,
                    columnSpan: 1
                }
            ];

            const owner: IColumnList = {
                columns: columns,
                columnWidths: [200, 200],
                indexOfLastPinnedColumn: -1,
                maxLevel: 0
            };

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, owner);

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                expect(getRenderedRows(args.pdf)).toEqual([
                    ['Name', 'Value'],
                    ['Root 1', '100']
                ]);
                done();
            });

            exportRecords(treeData);
        });

        it('should handle pivot grid with columnGroupParent as non-string', (done) => {
            const pivotData: IExportRecord[] = [
                {
                    data: { Product: 'Product A', Category: 'Category 1', 'City-London-Sum': 100 },
                    level: 0,
                    type: ExportRecordType.PivotGridRecord
                }
            ];

            const columns: IColumnInfo[] = [
                {
                    header: 'Product',
                    field: 'Product',
                    skip: false,
                    headerType: ExportHeaderType.RowHeader,
                    startIndex: 0,
                    level: 0,
                    columnGroup: { id: 'product' } as any // Non-string columnGroup
                },
                {
                    header: 'Category',
                    field: 'Category',
                    skip: false,
                    headerType: ExportHeaderType.RowHeader,
                    startIndex: 1,
                    level: 1,
                    columnGroupParent: { id: 'product' } as any // Non-string columnGroupParent
                },
                {
                    header: 'Sum',
                    field: 'City-London-Sum',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1
                }
            ];

            const owner: IColumnList = {
                columns: columns,
                columnWidths: [200, 200, 200],
                indexOfLastPinnedColumn: 1,
                maxLevel: 0,
                maxRowLevel: 2
            };

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, owner);

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                expect(getRenderedRows(args.pdf)).toEqual([
                    ['Sum'],
                    ['100']
                ]);
                done();
            });

            exportRecords(pivotData);
        });

        it('should handle pivot grid with column header matching record values', (done) => {
            const pivotData: IExportRecord[] = [
                {
                    data: { Product: 'Product A', 'City-London-Sum': 100 },
                    level: 0,
                    type: ExportRecordType.PivotGridRecord,
                    dimensionKeys: ['Product']
                }
            ];

            const columns: IColumnInfo[] = [
                {
                    header: 'Product A', // Header matches value in data
                    field: 'Product',
                    skip: false,
                    headerType: ExportHeaderType.RowHeader,
                    startIndex: 0,
                    level: 0
                },
                {
                    header: 'Sum',
                    field: 'City-London-Sum',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1
                }
            ];

            const owner: IColumnList = {
                columns: columns,
                columnWidths: [200, 200],
                indexOfLastPinnedColumn: 0,
                maxLevel: 0,
                maxRowLevel: 1
            };

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, owner);

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                // The row header carries no field the record has, but its caption matches one
                // of the record's values, which is enough for it to be picked as the dimension.
                expect(getRenderedRows(args.pdf)).toEqual([
                    ['Sum'],
                    ['Product A', '100']
                ]);
                done();
            });

            exportRecords(pivotData);
        });

        it('should handle pivot grid with record index-based column selection', (done) => {
            const pivotData: IExportRecord[] = [
                {
                    data: { Product: 'Product A', 'City-London-Sum': 100 },
                    level: 0,
                    type: ExportRecordType.PivotGridRecord,
                    dimensionKeys: ['Product']
                },
                {
                    data: { Product: 'Product B', 'City-London-Sum': 200 },
                    level: 0,
                    type: ExportRecordType.PivotGridRecord,
                    dimensionKeys: ['Product']
                }
            ];

            const columns: IColumnInfo[] = [
                {
                    header: 'Product',
                    field: 'Product',
                    skip: false,
                    headerType: ExportHeaderType.PivotRowHeader,
                    startIndex: 0,
                    level: 0
                },
                {
                    header: 'Product A',
                    field: 'Product',
                    skip: false,
                    headerType: ExportHeaderType.RowHeader,
                    startIndex: 0,
                    level: 0
                },
                {
                    header: 'Product B',
                    field: 'Product',
                    skip: false,
                    headerType: ExportHeaderType.RowHeader,
                    startIndex: 1,
                    level: 0
                },
                {
                    header: 'Sum',
                    field: 'City-London-Sum',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1
                }
            ];

            const owner: IColumnList = {
                columns: columns,
                columnWidths: [200, 200],
                indexOfLastPinnedColumn: 0,
                maxLevel: 0,
                maxRowLevel: 1
            };

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, owner);

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                expect(getRenderedRows(args.pdf)).toEqual([
                    ['Product', 'Sum'],
                    ['Product A', '100'],
                    ['Product B', '200']
                ]);
                done();
            });

            exportRecords(pivotData);
        });

        it('should handle pivot grid with empty allColumns in drawDataRow', (done) => {
            const pivotData: IExportRecord[] = [
                {
                    data: { Product: 'Product A', 'City-London-Sum': 100 },
                    level: 0,
                    type: ExportRecordType.PivotGridRecord,
                    dimensionKeys: ['Product']
                }
            ];

            const columns: IColumnInfo[] = [
                {
                    header: 'Sum',
                    field: 'City-London-Sum',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1
                }
            ];

            const owner: IColumnList = {
                columns: columns,
                columnWidths: [200],
                indexOfLastPinnedColumn: -1,
                maxLevel: 0,
                maxRowLevel: 0
            };

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, owner);

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                expect(getRenderedRows(args.pdf)).toEqual([
                    ['Sum'],
                    ['100']
                ]);
                done();
            });

            exportRecords(pivotData);
        });

        it('should handle very long header text truncation', (done) => {
            const longHeaderText = 'This is a very long header text that should be truncated because it exceeds the maximum width of the column header cell in the PDF export';
            // Four columns share the page, so none of them is anywhere near wide enough for the
            // header text - a single column would simply be given the whole page and fit it.
            const fields = ['name', 'second', 'third', 'fourth'];
            const columns: IColumnInfo[] = fields.map((field, startIndex) => ({
                header: longHeaderText,
                field,
                skip: false,
                headerType: ExportHeaderType.ColumnHeader,
                startIndex,
                level: 0,
                columnSpan: 1
            }));

            const owner: IColumnList = {
                columns: columns,
                columnWidths: fields.map(() => 200),
                indexOfLastPinnedColumn: -1,
                maxLevel: 0
            };

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, owner);

            const data: IExportRecord[] = [
                {
                    data: { name: 'Test', second: 'Test', third: 'Test', fourth: 'Test' },
                    level: 0,
                    type: ExportRecordType.DataRecord
                }
            ];

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);

                const [headerRow, dataRow] = getRenderedRows(args.pdf);
                const columnWidth = getDrawnRectangles(args.pdf)[0].width;

                expect(headerRow.length).toBe(fields.length);
                for (const header of headerRow) {
                    expect(header.endsWith('...')).toBeTrue();
                    expect(longHeaderText.startsWith(header.slice(0, -3))).toBeTrue();
                    expect(args.pdf!.getTextWidth(header)).toBeLessThanOrEqual(columnWidth - 10);
                }
                // The values are short enough to be left exactly as they are.
                expect(dataRow).toEqual(['Test', 'Test', 'Test', 'Test']);
                done();
            });

            exportRecords(data);
        });

        it('should handle pivot grid with row dimension columns but no matching data', (done) => {
            const pivotData: IExportRecord[] = [
                {
                    data: { 'City-London-Sum': 100 }, // No dimension fields in data
                    level: 0,
                    type: ExportRecordType.PivotGridRecord,
                    dimensionKeys: ['Product'] // But dimensionKeys says Product exists
                }
            ];

            const columns: IColumnInfo[] = [
                {
                    header: 'Product',
                    field: 'Product',
                    skip: false,
                    headerType: ExportHeaderType.PivotRowHeader,
                    startIndex: 0,
                    level: 0
                },
                {
                    header: 'Sum',
                    field: 'City-London-Sum',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1
                }
            ];

            const owner: IColumnList = {
                columns: columns,
                columnWidths: [200, 200],
                indexOfLastPinnedColumn: 0,
                maxLevel: 0,
                maxRowLevel: 1
            };

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, owner);

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                expect(getRenderedRows(args.pdf)).toEqual([
                    ['Product', 'Sum'],
                    ['100']
                ]);
                done();
            });

            exportRecords(pivotData);
        });

        it('should handle column field as non-string gracefully', (done) => {
            // This test verifies that non-string fields are handled without crashing
            // The base exporter may filter these out, so we test with valid data structure
            const columns: IColumnInfo[] = [
                {
                    header: 'Name',
                    field: 'name',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1
                },
                {
                    header: 'Value',
                    field: 'value',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 1,
                    level: 0,
                    columnSpan: 1
                }
            ];

            const owner: IColumnList = {
                columns: columns,
                columnWidths: [200, 200],
                indexOfLastPinnedColumn: -1,
                maxLevel: 0
            };

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, owner);

            const data: IExportRecord[] = [
                {
                    data: { name: 'Test', value: 123 },
                    level: 0,
                    type: ExportRecordType.DataRecord
                }
            ];

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                expect(getRenderedRows(args.pdf)).toEqual([
                    ['Name', 'Value'],
                    ['Test', '123']
                ]);
                done();
            });

            exportRecords(data);
        });

        it('should handle empty rowDimensionHeaders fallback path', (done) => {
            const pivotData: IExportRecord[] = [
                {
                    data: { Product: 'Product A', 'City-London-Sum': 100 },
                    level: 0,
                    type: ExportRecordType.PivotGridRecord,
                    dimensionKeys: ['Product']
                }
            ];

            const columns: IColumnInfo[] = [
                {
                    header: 'Sum',
                    field: 'City-London-Sum',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1
                }
            ];

            const owner: IColumnList = {
                columns: columns,
                columnWidths: [200],
                indexOfLastPinnedColumn: -1,
                maxLevel: 0,
                maxRowLevel: 0
            };

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, owner);

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                expect(getRenderedRows(args.pdf)).toEqual([
                    ['Sum'],
                    ['100']
                ]);
                done();
            });

            exportRecords(pivotData);
        });

        it('should handle PivotMergedHeader with empty header text', (done) => {
            const pivotData: IExportRecord[] = [
                {
                    data: { Product: 'Product A', 'City-London-Sum': 100 },
                    level: 0,
                    type: ExportRecordType.PivotGridRecord,
                    dimensionKeys: ['Product']
                }
            ];

            const columns: IColumnInfo[] = [
                {
                    header: '',
                    field: '',
                    skip: false,
                    headerType: ExportHeaderType.PivotMergedHeader,
                    startIndex: 0,
                    level: 0
                },
                {
                    header: 'Sum',
                    field: 'City-London-Sum',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1
                }
            ];

            const owner: IColumnList = {
                columns: columns,
                columnWidths: [200, 200],
                indexOfLastPinnedColumn: 0,
                maxLevel: 0,
                maxRowLevel: 1
            };

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, owner);

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                expect(getRenderedRows(args.pdf)).toEqual([
                    ['Sum'],
                    ['Column1', '100']
                ]);
                done();
            });

            exportRecords(pivotData);
        });

        it('should handle resolveLayoutStartIndex with no child columns', (done) => {
            const columns: IColumnInfo[] = [
                {
                    header: 'Parent',
                    field: 'parent',
                    skip: false,
                    headerType: ExportHeaderType.MultiColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1,
                    columnGroup: 'Parent'
                    // No child columns with columnGroupParent === 'Parent'
                }
            ];

            const owner: IColumnList = {
                columns: columns,
                columnWidths: [200],
                indexOfLastPinnedColumn: -1,
                maxLevel: 1
            };

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, owner);

            const data: IExportRecord[] = [
                {
                    data: { parent: 'Value' },
                    level: 0,
                    type: ExportRecordType.DataRecord
                }
            ];

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                expect(getRenderedRows(args.pdf)).toEqual([
                    ['Parent']
                ]);
                done();
            });

            exportRecords(data);
        });

        it('should export a column group that has no group key of its own', (done) => {
            // Without a `columnGroup` the group has nothing to match its children on. Pairing it
            // with every column that has no parent used to make it its own child, and resolving
            // its layout position then recursed until the stack gave out - taking the export down
            // with it, silently, because the failure happened inside the drawing promise.
            const columns: IColumnInfo[] = [
                {
                    header: 'Location',
                    field: 'location',
                    skip: false,
                    headerType: ExportHeaderType.MultiColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 2
                },
                {
                    header: 'City',
                    field: 'city',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 1,
                    columnSpan: 1
                },
                {
                    header: 'Country',
                    field: 'country',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 1,
                    level: 1,
                    columnSpan: 1
                }
            ];

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, {
                columns,
                columnWidths: [200, 200],
                indexOfLastPinnedColumn: -1,
                maxLevel: 1
            } as IColumnList);

            const data: IExportRecord[] = [
                {
                    data: { city: 'London', country: 'UK' },
                    level: 0,
                    type: ExportRecordType.DataRecord
                }
            ];

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                // The group is treated as having no children and falls back to the first column,
                // so the two levels of headers and the row are all still drawn.
                expect(getRenderedRows(args.pdf)).toEqual([
                    ['Location'],
                    ['City', 'Country'],
                    ['London', 'UK']
                ]);
                done();
            });

            exportRecords(data);
        });

        it('should export two column groups that name each other as their parent', (done) => {
            // A cycle that spans two groups rather than one, which the group key check alone
            // would not catch.
            const columns: IColumnInfo[] = [
                {
                    header: 'First',
                    field: 'first',
                    skip: false,
                    headerType: ExportHeaderType.MultiColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1,
                    columnGroup: 'First',
                    columnGroupParent: 'Second'
                },
                {
                    header: 'Second',
                    field: 'second',
                    skip: false,
                    headerType: ExportHeaderType.MultiColumnHeader,
                    startIndex: 1,
                    level: 0,
                    columnSpan: 1,
                    columnGroup: 'Second',
                    columnGroupParent: 'First'
                },
                {
                    header: 'Value',
                    field: 'value',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 1,
                    columnSpan: 1,
                    columnGroupParent: 'First'
                }
            ];

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, {
                columns,
                columnWidths: [200, 200, 200],
                indexOfLastPinnedColumn: -1,
                maxLevel: 1
            } as IColumnList);

            const data: IExportRecord[] = [
                {
                    data: { value: 'Test' },
                    level: 0,
                    type: ExportRecordType.DataRecord
                }
            ];

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                // The export completes and every header still reaches the document.
                expect(new Set(getRenderedText(args.pdf)))
                    .toEqual(new Set(['First', 'Second', 'Value', 'Test']));

                // Neither group can be placed relative to the other, so both fall back to the
                // first column and are drawn over one another - a misplaced header rather than a
                // lost export.
                const groups = getRenderedCells(args.pdf)
                    .filter(cell => cell.text === 'First' || cell.text === 'Second');
                expect(groups.length).toBe(2);
                expect(new Set(groups.map(cell => cell.y)).size).toBe(1);

                const cells = getDrawnRectangles(args.pdf).filter(rectangle => !rectangle.filled);
                const topRow = cells.filter(rectangle => rectangle.y === Math.min(...cells.map(c => c.y)));
                expect(topRow.length).toBe(2);
                expect(topRow[0].x).toBe(topRow[1].x);
                done();
            });

            exportRecords(data);
        });

        it('should handle data with zero total columns', (done) => {
            const data: IExportRecord[] = [
                {
                    data: {},
                    level: 0,
                    type: ExportRecordType.DataRecord
                }
            ];

            const owner: IColumnList = {
                columns: [],
                columnWidths: [],
                indexOfLastPinnedColumn: -1,
                maxLevel: 0
            };

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, owner);

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                // Nothing to draw, but still a valid one page document rather than a failure.
                expect(getPageCount(args.pdf)).toBe(1);
                expect(getRenderedRows(args.pdf)).toEqual([]);
                expect(getDrawnRectangles(args.pdf).map(rectangle => rectangle.filled)).toEqual([true]);
                done();
            });

            exportRecords(data);
        });
    });
});
