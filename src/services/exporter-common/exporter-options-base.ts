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

    constructor(fileName: string, private _fileExtension: string) {
        this.setFileName(fileName);
    }

    private setFileName(fileName: string): void {
        this._fileName = fileName + (fileName.endsWith(this._fileExtension) === false ? this._fileExtension : "");
    }

    get fileName() {
        return this._fileName;
    }

    set fileName(value) {
        this.setFileName(value);
    }

}
