export abstract class IgxExporterOptionsBase {
    /**
     * Specifies whether hidden columns should be exported.
     * ```typescript
     * let ignoreColumnsVisibility = this.exportOptions.ignoreColumnsVisibility;
     * this.exportOptions.ignoreColumnsVisibility = true;
     * ```
     *
     * @memberof exporter options base
     */
    public ignoreColumnsVisibility = false;

    /**
     * Specifies whether filtered out rows should be exported.
     * ```typescript
     * let ignoreFiltering = this.exportOptions.ignoreFiltering;
     * this.exportOptions.ignoreFiltering = true;
     * ```
     *
     * @memberof exporter options base
     */
    public ignoreFiltering = false;

    /**
     * Specifies if the exporter should ignore the current column order in the grid.
     * ```typescript
     * let ignoreColumnsOrder = this.exportOptions.ignoreColumnsOrder;
     * this.exportOptions.ignoreColumnsOrder = true;
     * ```
     *
     * @memberof exporter options base
     */
    public ignoreColumnsOrder = false;

    /**
     * Specifies whether the exported data should be sorted as in the provided grid.
     * When you export grouped data, setting ignoreSorting to true will cause
     * the grouping to fail because it relies on the sorting of the records.
     * ```typescript
     * let ignoreSorting = this.exportOptions.ignoreSorting;
     * this.exportOptions.ignoreSorting = true;
     * ```
     *
     * @memberof exporter options base
     */
    public ignoreSorting = false;

    /**
     * Specifies whether the exported data should be grouped as in the provided grid.
     * ```typescript
     * let ignoreGrouping = this.exportOptions.ignoreGrouping;
     * this.exportOptions.ignoreGrouping = true;
     * ```
     *
     * @memberof exporter options base
     */
    public ignoreGrouping = false;

    /**
     * Specifies whether the exported data should include multi column headers as in the provided grid.
     * ```typescript
     * let ignoreMultiColumnHeaders = this.exportOptions.ignoreMultiColumnHeaders;
     * this.exportOptions.ignoreMultiColumnHeaders = true;
     * ```
     *
     * @memberof exporter options base
     */
    public ignoreMultiColumnHeaders = false;

    /**
     * Specifies whether the exported data should include column summaries.
     * ```typescript
     * let exportSummaries = this.exportOptions.exportSummaries;
     * this.exportOptions.exportSummaries = true;
     * ```
     *
     * @memberof exporter options base
     */
    public exportSummaries = true;

    /**
     * Specifies whether the exported data should have frozen headers.
     * ```typescript
     * let freezeHeaders = this.exportOptions.freezeHeaders;
     * this.exportOptions.freezeHeaders = true;
     * ```
     *
     * @memberof exporter options base
     */
    public freezeHeaders = false;

    /**
     * Specifies whether the headers should be exported if there is no data.
     * ```typescript
     * let alwaysExportHeaders = this.exportOptions.alwaysExportHeaders;
     * this.exportOptions.alwaysExportHeaders = false;
     * ```
     *
     * @memberof exporter options base
     */
     public alwaysExportHeaders = true;

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
     * @memberof exporter options base
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
     * @memberof exporter options base
     */
    public set fileName(value) {
        this.setFileName(value);
    }

}
