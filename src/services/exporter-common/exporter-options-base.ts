export abstract class IgxExporterOptionsBase {
    private _fileName: string;

    public exportHiddenColumns: boolean;
    public exportFilteredRows: boolean;
    public exportCurrentlyVisiblePageOnly: boolean;
    public exportSummaries: boolean;
    public exportPinnedColumns: boolean;

    // public ignoreColumnsVisibility: boolean;
    // public ignoreColumnsOrder: boolean;
    // public ignoreFiltering: boolean;
    // public ignorePaging: boolean;
    // public ignoreSummaries: boolean;
    // public ignorePinning: boolean;
    // public ignoreSorting: boolean;

    constructor(fileName: string, fileExtension: string) {
        this._fileName = fileName;
    }

    private setFileName(extension: string) {
        if (this._fileName.endsWith(extension) === false) {
            return this._fileName + extension;
        }
        return this._fileName;
    }

    get fileName() {
        return this._fileName;
    }

    set fileName(value) {
        this._fileName = this.setFileName(value);
    }

}
