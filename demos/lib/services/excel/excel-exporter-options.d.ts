import { IgxExporterOptionsBase } from "../exporter-common/exporter-options-base";
export declare class IgxExcelExporterOptions extends IgxExporterOptionsBase {
    private _columnWidth;
    private _rowHeight;
    ignorePinning: boolean;
    exportAsTable: boolean;
    constructor(fileName: string);
    columnWidth: number;
    rowHeight: number;
}
