export abstract class IgxExporterOptionsBase {
    /**
     * Specifies whether hidden columns should be exported.
     *
     * @memberof IgxExporterOptionsBase
     */
    public ignoreColumnsVisibility = false;

    /**
     * Specifies whether filtered out rows should be exported.
     *
     * @memberof IgxExporterOptionsBase
     */
    public ignoreFiltering = false;

    /**
     * Specifies if the exporter should ignore the current column order in the IgxGrid.
     *
     * @memberof IgxExporterOptionsBase
     */
    public ignoreColumnsOrder = false;

    /**
     * Specifies whether the exported data should be sorted as in the provided IgxGrid.
     * When you export grouped data, setting ignoreSorting to true will cause
     * the grouping to fail because it relies on the sorting of the records.
     *
     * @memberof IgxExporterOptionsBase
     */
    public ignoreSorting = false;

    /**
     * Specifies whether the exported data should be grouped as in the provided IgxGrid.
     *
     * @memberof IgxExporterOptionsBase
     */
    public ignoreGrouping = false;

    /**
     * Specifies whether the exported data should include multi column headers as in the provided IgxGrid.
     *
     * @memberof IgxExporterOptionsBase
     */
    public ignoreMultiColumnHeaders = false;

    /**
     * Specifies whether the exported data should include column summaries.
     *
     * @memberof IgxExporterOptionsBase
     */
    public exportSummaries = true;

    /**
     * Specifies whether the exported data should have frozen headers.
     *
     * @memberof IgxExporterOptionsBase
     */
    public freezeHeaders = false;

    /**
     * Specifies whether the headers should be exported if there is no data.
     *
     * @memberof IgxExporterOptionsBase
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
     *
     * @memberof IgxExporterOptionsBase
     */
    public get fileName() {
        return this._fileName;
    }

    /**
     * Sets the file name which will be used for the exporting operation.
     *
     * @memberof IgxExporterOptionsBase
     */
    public set fileName(value) {
        this.setFileName(value);
    }

}
