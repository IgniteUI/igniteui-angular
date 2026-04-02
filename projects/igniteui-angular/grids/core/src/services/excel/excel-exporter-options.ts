import { IgxExporterOptionsBase } from '../exporter-common/exporter-options-base';

/* csSuppress */
/**
 * Objects of this class are used to configure the Excel exporting process.
 */
export class IgxExcelExporterOptions extends IgxExporterOptionsBase {
    /**
     * Specifies if column pinning should be ignored. If ignoreColumnsOrder is set to true,
     * this option will always be considered as set to true.
     * ```typescript
     * let ignorePinning = this.exportOptions.ignorePinning;
     * this.exportOptions.ignorePinning = true;
     * ```
     *
     * @memberof IgxExcelExporterOptions
     */
    public ignorePinning = false;

    /**
     * Specifies whether the exported data should be formatted as Excel table. (True by default)
     * ```typescript
     * let exportAsTable = this.exportOptions.exportAsTable;
     * this.exportOptions.exportAsTable = false;
     * ```
     *
     * @memberof IgxExcelExporterOptions
     */
    public exportAsTable = true;

    private _columnWidth: number;
    private _rowHeight: number;
    private _worksheetName: string;

    constructor(fileName: string) {
        super(fileName, '.xlsx');
    }

    /**
     * Gets the width of the columns in the exported excel file.
     * ```typescript
     * let width = this.exportOptions.columnWidth;
     * ```
     *
     * @memberof IgxExcelExporterOptions
     */
    public get columnWidth(): number {
        return this._columnWidth;
    }

    /**
     * Sets the width of the columns in the exported excel file. If left unspecified,
     * the width of the column or the default width of the excel columns will be used.
     * ```typescript
     * this.exportOptions.columnWidth = 55;
     * ```
     *
     * @memberof IgxExcelExporterOptions
     */
    public set columnWidth(value: number) {
        if (value < 0) {
            throw Error('Invalid value for column width!');
        }

        this._columnWidth = value;
    }

    /**
     * Gets the height of the rows in the exported excel file.
     * ```typescript
     * let height = this.exportOptions.rowHeight;
     * ```
     *
     * @memberof IgxExcelExporterOptions
     */
    public get rowHeight(): number {
        return this._rowHeight;
    }

    /**
     * Sets the height of the rows in the exported excel file. If left unspecified or 0,
     * the default height of the excel rows will be used.
     * ```typescript
     * this.exportOptions.rowHeight = 25;
     * ```
     *
     * @memberof IgxExcelExporterOptions
     */
    public set rowHeight(value: number) {
        if (value < 0) {
            throw Error('Invalid value for row height!');
        }

        this._rowHeight = value;
    }

    /**
     * Gets the name of the worksheet in the exported excel file.
     * ```typescript
     * let worksheetName = this.exportOptions.worksheetName;
     * ```
     *
     * @memberof IgxExcelExporterOptions
     */
    public get worksheetName(): string {
        if (this._worksheetName === undefined || this._worksheetName === null) {
            return 'Sheet1';
        }

        return this._worksheetName;
    }

    /**
     * Sets the name of the worksheet in the exported excel file.
     * ```typescript
     * this.exportOptions.worksheetName = "Worksheet";
     * ```
     *
     * @memberof IgxExcelExporterOptions
     */
    public set worksheetName(value: string) {
        this._worksheetName = value;
    }
}
