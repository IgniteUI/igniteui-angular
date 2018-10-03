export abstract class IgxExporterOptionsBase {
    private _fileName: string;

    /**
     * Specifies whether hidden columns should be exported.
     */
    public ignoreColumnsVisibility = false;

    /**
     * Specifies whether filtered out rows should be exported.
     */
    public ignoreFiltering = false;

    /**
     * Specifies if the exporter should ignore the current column order in the IgxGrid.
     */
    public ignoreColumnsOrder = false;

    /**
     * Specifies whether the exported data should be sorted as in the provided IgxGrid.
     */
    public ignoreSorting = false;

    constructor(fileName: string, protected _fileExtension: string) {
        this.setFileName(fileName);
    }

    private setFileName(fileName: string): void {
        this._fileName = fileName + (fileName.endsWith(this._fileExtension) === false ? this._fileExtension : '');
    }

    /**
     * Gets the file name which will be used for the exporting operation.
     */
    get fileName() {
        return this._fileName;
    }

    /**
     * Sets the file name which will be used for the exporting operation.
     */
    set fileName(value) {
        this.setFileName(value);
    }

}
