export abstract class IgxExporterOptionsBase {
    /**
     * Specifies whether hidden columns should be exported.
     * ```typescript
     * let ignoreColumnsVisibility = this.exportOptions.ignoreColumnsVisibility;
     * this.exportOptions.ignoreColumnsVisibility = true;
     * ```
     *
     * @memberof IgxExporterOptionsBase
     */
    public ignoreColumnsVisibility = false;

    /**
     * Specifies whether filtered out rows should be exported.
     * ```typescript
     * let ignoreFiltering = this.exportOptions.ignoreFiltering;
     * this.exportOptions.ignoreFiltering = true;
     * ```
     *
     * @memberof IgxExporterOptionsBase
     */
    public ignoreFiltering = false;

    /**
     * Specifies if the exporter should ignore the current column order in the IgxGrid.
     * ```typescript
     * let ignoreColumnsOrder = this.exportOptions.ignoreColumnsOrder;
     * this.exportOptions.ignoreColumnsOrder = true;
     * ```
     *
     * @memberof IgxExporterOptionsBase
     */
    public ignoreColumnsOrder = false;

    /**
     * Specifies whether the exported data should be sorted as in the provided IgxGrid.
     * When you export grouped data, setting ignoreSorting to true will cause
     * the grouping to fail because it relies on the sorting of the records.
     * ```typescript
     * let ignoreSorting = this.exportOptions.ignoreSorting;
     * this.exportOptions.ignoreSorting = true;
     * ```
     *
     * @memberof IgxExporterOptionsBase
     */
    public ignoreSorting = false;

    /**
     * Specifies whether the exported data should be grouped as in the provided IgxGrid.
     * ```typescript
     * let ignoreGrouping = this.exportOptions.ignoreGrouping;
     * this.exportOptions.ignoreGrouping = true;
     * ```
     *
     * @memberof IgxExporterOptionsBase
     */
    public ignoreGrouping = false;

    private _fileName: string;

    constructor(fileName: string, protected _fileExtension: string) {
        this.setFileName(fileName);
    }

    private setFileName(fileName: string): void {
        this._fileName = fileName + (fileName.endsWith(this._fileExtension) === false ? this._fileExtension : '');
    }

    /**
     * Gets the file name which will be used for the exporting operation.
     * ```typescript
     * let fileName = this.exportOptions.fileName;
     * ```
     *
     * @memberof IgxExporterOptionsBase
     */
    public get fileName() {
        return this._fileName;
    }

    /**
     * Sets the file name which will be used for the exporting operation.
     * ```typescript
     * this.exportOptions.fileName = 'exportedData01';
     * ```
     *
     * @memberof IgxExporterOptionsBase
     */
    public set fileName(value) {
        this.setFileName(value);
    }

}
