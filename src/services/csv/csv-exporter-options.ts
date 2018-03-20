export class IgxCsvExporterOptions {
    private _columnWidth: number;
    private _rowHeight: number;

    public exportHiddenColumns: boolean;
    public exportFilteredRows: boolean;
    public exportCurrentlyVisiblePageOnly: boolean;

    constructor(public fileName: string) {
        if (fileName.endsWith(".xlsx") === false) {
            fileName += ".xlsx";
        }
    }
}
