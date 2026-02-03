import fontData from './noto-sans.json';

/**
 * Base64-encoded Noto Sans font data (Regular weight).
 *
 * This font provides extended Latin, Cyrillic, and Greek character support.
 * For CJK (Chinese, Japanese, Korean) character support, use a CJK-specific font
 * such as Noto Sans CJK or Arial Unicode MS.
 *
 * @remarks
 * This constant is used with `IgxPdfExporterOptions.customFont` to enable
 * non-Latin characters in exported PDF documents.
 *
 * @example
 * ```typescript
 * const options = new IgxPdfExporterOptions('MyExport');
 * options.customFont = {
 *   name: 'Noto Sans',
 *   data: NOTO_SANS_BASE64,
 *   bold: { data: NOTO_SANS_BOLD_BASE64 }
 * };
 * ```
 */
export const NOTO_SANS_BASE64 = fontData.normal;

/**
 * Base64-encoded Noto Sans Bold font data.
 *
 * This is the bold variant of the Noto Sans font, used for headers and emphasized text
 * in PDF exports.
 *
 * @remarks
 * Pair this with `NOTO_SANS_BASE64` in the `IgxPdfExporterOptions.customFont.bold` property
 * to ensure consistent rendering of both regular and bold text.
 *
 * @see NOTO_SANS_BASE64
 */
export const NOTO_SANS_BOLD_BASE64 = fontData.bold;
