import { IgxExporterOptionsBase } from '../exporter-common/exporter-options-base';

/**
 * Objects of this class are used to configure the PDF exporting process.
 */
export class IgxPdfExporterOptions extends IgxExporterOptionsBase {
    /**
     * Specifies the page orientation. (portrait or landscape, landscape by default)
     * ```typescript
     * let pageOrientation = this.exportOptions.pageOrientation;
     * this.exportOptions.pageOrientation = 'portrait';
     * ```
     *
     * @memberof IgxPdfExporterOptions
     */
    public pageOrientation: 'portrait' | 'landscape' = 'landscape';

    /**
     * Specifies the page size. (a4, a3, letter, legal, etc., a4 by default)
     * ```typescript
     * let pageSize = this.exportOptions.pageSize;
     * this.exportOptions.pageSize = 'letter';
     * ```
     *
     * @memberof IgxPdfExporterOptions
     */
    public pageSize: string = 'a4';

    /**
     * Specifies whether to show table borders. (True by default)
     * ```typescript
     * let showTableBorders = this.exportOptions.showTableBorders;
     * this.exportOptions.showTableBorders = false;
     * ```
     *
     * @memberof IgxPdfExporterOptions
     */
    public showTableBorders = true;

    /**
     * Specifies the font size for the table content. (10 by default)
     * ```typescript
     * let fontSize = this.exportOptions.fontSize;
     * this.exportOptions.fontSize = 12;
     * ```
     *
     * @memberof IgxPdfExporterOptions
     */
    public fontSize = 10;

    /**
     * Custom font configuration for Unicode character support in PDF exports.
     *
     * By default, the PDF exporter uses the built-in Helvetica font, which only supports
     * basic Latin characters. If your data contains non-Latin characters (such as Cyrillic,
     * Chinese, Japanese, Arabic, Hebrew, or special symbols), you must provide a custom
     * TrueType font (TTF) that includes the required character glyphs.
     *
     * The font data must be provided as a Base64-encoded string of the TTF file contents.
     * You can optionally provide a separate bold variant for header styling.
     *
     * @remarks
     * To convert a TTF file to Base64, you can use Node.js:
     * ```javascript
     * const fs = require('fs');
     * const fontData = fs.readFileSync('path/to/font.ttf');
     * const base64 = fontData.toString('base64');
     * fs.writeFileSync('font-base64.ts', `export const MY_FONT = '${base64}';`);
     * ```
     *
     * Or use an online Base64 encoder tool to convert your TTF file.
     *
     * @example
     * Basic usage with a single font (used for both normal and bold text):
     * ```typescript
     * import { NOTO_SANS_REGULAR } from './fonts/noto-sans';
     *
     * const options = new IgxPdfExporterOptions('Export');
     * options.customFont = {
     *     name: 'NotoSans',
     *     data: NOTO_SANS_REGULAR
     * };
     * this.pdfExporter.export(this.grid, options);
     * ```
     *
     * @example
     * Usage with separate normal and bold font variants:
     * ```typescript
     * import { NOTO_SANS_REGULAR, NOTO_SANS_BOLD } from './fonts/noto-sans';
     *
     * const options = new IgxPdfExporterOptions('Export');
     * options.customFont = {
     *     name: 'NotoSans',
     *     data: NOTO_SANS_REGULAR,
     *     bold: {
     *         name: 'NotoSans-Bold',
     *         data: NOTO_SANS_BOLD
     *     }
     * };
     * this.pdfExporter.export(this.grid, options);
     * ```
     *
     * @example
     * Recommended fonts for Unicode support:
     * - Noto Sans: Covers most Unicode scripts (https://fonts.google.com/noto)
     * - Arial Unicode MS: Comprehensive Unicode coverage
     * - Source Han Sans: Excellent CJK (Chinese, Japanese, Korean) support
     *
     * @memberof IgxPdfExporterOptions
     */
    public customFont?: PdfUnicodeFont;

    constructor(fileName: string) {
        super(fileName, '.pdf');
    }
}

/**
 * Font configuration interface for PDF export with Unicode character support.
 *
 * This interface defines the structure for providing custom TrueType fonts (TTF)
 * to the PDF exporter. Custom fonts are required when exporting data that contains
 * non-Latin characters, as the default Helvetica font only supports basic Latin characters.
 *
 * @remarks
 * The font data must be Base64-encoded TTF file contents. Both the normal and optional
 * bold variants should be from the same font family for consistent styling.
 *
 * If the bold variant is not provided, the normal font will be used for both
 * regular text and headers (which are typically rendered in bold).
 *
 * @example
 * Minimal configuration:
 * ```typescript
 * const font: PdfUnicodeFont = {
 *     name: 'MyFont',
 *     data: 'AAEAAAATAQAABAAwR0...' // Base64-encoded TTF data
 * };
 * ```
 *
 * @example
 * Full configuration with bold variant:
 * ```typescript
 * const font: PdfUnicodeFont = {
 *     name: 'MyFont-Regular',
 *     data: 'AAEAAAATAQAABAAwR0...', // Base64-encoded regular TTF
 *     bold: {
 *         name: 'MyFont-Bold',
 *         data: 'BBFAAAAUBQAACAAxS1...' // Base64-encoded bold TTF
 *     }
 * };
 * ```
 */
export interface PdfUnicodeFont {
    /**
     * Base64-encoded font data from a TrueType Font (TTF) file.
     *
     * This should be the complete TTF file contents encoded as a Base64 string.
     * The font must include glyphs for all characters that may appear in your grid data.
     *
     * @remarks
     * To convert a TTF file to Base64 in Node.js:
     * ```javascript
     * const base64Data = require('fs').readFileSync('font.ttf').toString('base64');
     * ```
     */
    data: string;

    /**
     * The font family name to register with the PDF library.
     *
     * This name is used internally by jsPDF to reference the font. It should be
     * a simple identifier without spaces (e.g., 'NotoSans', 'ArialUnicode').
     *
     * @remarks
     * The name does not need to match the actual font's internal name, but using
     * a descriptive name helps with debugging and maintenance.
     */
    name: string;

    /**
     * Optional bold variant of the font for styling headers and emphasized text.
     *
     * If provided, this font will be used for table headers and any other text
     * that should appear in bold. If not provided, the normal font specified
     * by `data` and `name` will be used for all text, including headers.
     *
     * @remarks
     * For best visual results, use the bold variant from the same font family
     * as the regular font.
     */
    bold?: {
        /**
         * Base64-encoded font data from a bold TrueType Font (TTF) file.
         */
        data: string;

        /**
         * The font family name for the bold variant.
         *
         * This should be different from the regular font name to avoid conflicts
         * (e.g., 'NotoSans-Bold' vs 'NotoSans').
         */
        name: string;
    };
}
