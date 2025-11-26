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

    constructor(fileName: string) {
        super(fileName, '.pdf');
    }
}
