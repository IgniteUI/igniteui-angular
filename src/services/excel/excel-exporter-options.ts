import { IgxExporterOptionsBase } from "../exporter-common/exporter-options-base";

export class IgxExcelExporterOptions extends IgxExporterOptionsBase {
    private _columnWidth: number;
    private _rowHeight: number;

    public ignorePinning = false;

    public exportAsTable = true;

    constructor(fileName: string) {
        super(fileName, ".xlsx");
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
            throw Error("Invalid value for row height!");
        }

        this._rowHeight = value;
    }
}
