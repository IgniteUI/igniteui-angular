import fontData from './noto-sans-arabic.json'
/**
 * Base64-encoded Noto Sans Arabic font data (Regular weight).
 *
 * This font provides comprehensive support for Arabic script and related languages,
 * including Arabic, Persian/Farsi, Urdu, Pashto, and Kurdish (Sorani).
 *
 * @remarks
 * This constant is used with `IgxPdfExporterOptions.customFont` to enable
 * Arabic and related right-to-left (RTL) scripts in exported PDF documents.
 *
 * The font uses the SIL Open Font License 1.1.
 * Source: https://fonts.google.com/noto/specimen/Noto+Sans+Arabic
 *
 * @example
 * ```typescript
 * const options = new IgxPdfExporterOptions('MyExport');
 * options.customFont = {
 *   name: 'Noto Sans Arabic',
 *   data: NOTO_SANS_ARABIC_BASE64,
 *   bold: { data: NOTO_SANS_ARABIC_BOLD_BASE64 }
 * };
 * ```
 */
export const NOTO_SANS_ARABIC_BASE64 = fontData.normal;

/**
 * Base64-encoded Noto Sans Arabic Bold font data.
 *
 * This is the bold variant of the Noto Sans Arabic font, used for headers and emphasized text
 * in PDF exports with Arabic script support.
 *
 * @remarks
 * Pair this with `NOTO_SANS_ARABIC_BASE64` in the `IgxPdfExporterOptions.customFont.bold` property
 * to ensure consistent rendering of both regular and bold Arabic text.
 *
 * @see NOTO_SANS_ARABIC_BASE64
 */
export const NOTO_SANS_ARABIC_BOLD_BASE64 = fontData.bold;
