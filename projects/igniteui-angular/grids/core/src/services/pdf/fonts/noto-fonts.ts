import { NOTO_SANS_BASE64, NOTO_SANS_BOLD_BASE64 } from './noto-sans';
import { NOTO_SANS_ARABIC_BASE64, NOTO_SANS_ARABIC_BOLD_BASE64 } from './noto-sans-arabic';
import { NOTO_SANS_CJK_BASE64, NOTO_SANS_CJK_BOLD_BASE64 } from './noto-sans-cjk';

/**
 * Pre-configured Noto Sans font for PDF exports
 * Supports Latin, Cyrillic, Greek, and extended Latin characters.
 * Noto Sans is licensed under the SIL Open Font License, Version 1.1.
 * See OFL.txt in this directory or http://scripts.sil.org/OFL for details.
 *
 * @example
 * ```typescript
 * import { NOTO_SANS_FONT } from 'igniteui-angular/pdf-fonts';
 *
 * const options = new IgxPdfExporterOptions('Export');
 * options.customFont = NOTO_SANS_FONT;
 * ```
 *
 * @publicApi
 */
export const NOTO_SANS_FONT = {
    data: NOTO_SANS_BASE64,
    name: 'NotoSans',
    bold: {
        data: NOTO_SANS_BOLD_BASE64,
        name: 'NotoSans-Bold'
    }
};

/**
 * Pre-configured Noto Sans CJK font for PDF exports
 * Noto Sans is licensed under the SIL Open Font License, Version 1.1.
 * See OFL.txt in this directory or http://scripts.sil.org/OFL for details.
 * @publicApi
 */
export const NOTO_SANS_CJK_FONT = {
    data: NOTO_SANS_CJK_BASE64,
    name: 'NotoSansCJK',
    bold: {
        data: NOTO_SANS_CJK_BOLD_BASE64,
        name: 'NotoSansCJK-Bold'
    }
};

/**
 * Pre-configured Noto Sans Arabic font for PDF exports
 * Noto Sans is licensed under the SIL Open Font License, Version 1.1.
 * See OFL.txt in this directory or http://scripts.sil.org/OFL for details.
 * @publicApi
 */
export const NOTO_SANS_ARABIC_FONT = {
    data: NOTO_SANS_ARABIC_BASE64,
    name: 'NotoSansArabic',
    bold: {
        data: NOTO_SANS_ARABIC_BOLD_BASE64,
        name: 'NotoSansCJK-Bold'
    }
};
