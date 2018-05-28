import { EventEmitter } from "@angular/core";
import { IgxExporterOptionsBase } from "./exporter-options-base";
export interface IRowExportingEventArgs {
    rowData: any;
    rowIndex: number;
    cancel: boolean;
}
export interface IColumnExportingEventArgs {
    header: string;
    columnIndex: number;
    cancel: boolean;
}
export declare abstract class IgxBaseExporter {
    private _columnList;
    protected _indexOfLastPinnedColumn: number;
    protected _sort: any;
    onRowExport: EventEmitter<IRowExportingEventArgs>;
    onColumnExport: EventEmitter<IColumnExportingEventArgs>;
    export(grid: any, options: IgxExporterOptionsBase): void;
    exportData(data: any[], options: IgxExporterOptionsBase): void;
    protected abstract exportDataImplementation(data: any[], options: IgxExporterOptionsBase): void;
    private exportRow(data, rowData, index, isSpecialData);
    private prepareData(grid, options);
    private resetDefaults();
}
