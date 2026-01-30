import fontData from './noto-sans-cjk.json';

/**
 * Base64-encoded Noto Sans CJK font data (Regular weight).
 *
 * This font provides comprehensive support for CJK (Chinese, Japanese, Korean) characters,
 * including Hiragana, Katakana, Kanji, Hangul, and CJK Unified Ideographs, as well as
 * Latin, Cyrillic, and Greek scripts.
 *
 * @remarks
 * This is a large font file (~15-25MB when Base64-encoded). Consider loading it
 * asynchronously or on-demand to avoid impacting initial application load time.
 *
 * The font uses the SIL Open Font License 1.1.
 * Source: https://fonts.google.com/noto/specimen/Noto+Sans+JP
 *
 * This constant is used with `IgxPdfExporterOptions.customFont` to enable
 * CJK characters in exported PDF documents.
 *
 * @example
 * ```typescript
 * const options = new IgxPdfExporterOptions('MyExport');
 * options.customFont = {
 *   name: 'Noto Sans CJK',
 *   data: NOTO_SANS_CJK_BASE64,
 *   bold: { data: NOTO_SANS_CJK_BOLD_BASE64 }
 * };
 * ```
 */
export const NOTO_SANS_CJK_BASE64 = (fontData as any).normal;

/**
 * Base64-encoded Noto Sans CJK Bold font data.
 *
 * This is the bold variant of the Noto Sans CJK font, used for headers and emphasized text
 * in PDF exports with CJK character support.
 *
 * @remarks
 * Pair this with `NOTO_SANS_CJK_BASE64` in the `IgxPdfExporterOptions.customFont.bold` property
 * to ensure consistent rendering of both regular and bold CJK text.
 *
 * Like the regular weight, this is a large font file that may impact bundle size.
 *
 * @see NOTO_SANS_CJK_BASE64
 */
export const NOTO_SANS_CJK_BOLD_BASE64 = (fontData as any).bold;
