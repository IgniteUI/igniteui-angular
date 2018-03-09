export class IgxExcelExporterOptions {
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

    public get columnWidth(): number {
        return this._columnWidth;
    }
    public set columnWidth(value: number) {
        if (value < 0) {
            throw Error("Invalid value for column width!");
        }

        this._columnWidth = value;
    }

    public get rowHeight(): number {
        return this._rowHeight;
    }
    public set rowHeight(value: number) {
        if (value < 0) {
            throw Error("Invalid value for row height");
        }

        this._rowHeight = value;
    }
}
