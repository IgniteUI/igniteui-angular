import {
    EventEmitter,
    Output
} from "@angular/core";

import { IgxGridComponent } from "../../grid/grid.component";

import {
    ColumnExportingEventArgs,
    RowExportingEventArgs
} from "./event-args";

import { ExportUtilities } from "./export-utilities";
import { IgxExporterOptionsBase } from "./exporter-options-base";

export abstract class IgxBaseExporter {
    private _columnList = [];

    @Output()
    public onRowExport = new EventEmitter<RowExportingEventArgs>();

    @Output()
    public onColumnExport = new EventEmitter<ColumnExportingEventArgs>();

    public export(grid: IgxGridComponent, options: IgxExporterOptionsBase): void {
        if (options === undefined || options === null) {
            throw Error("No options provided!");
        }

        const columns = grid.columnList.toArray();

        columns.forEach((column) => {
            const columnHeader = column.header !== "" ? column.header : column.field;
            const exportColumn = !column.hidden || options.ignoreColumnsVisibility;

            if (exportColumn) {
                this._columnList.push({
                    header: columnHeader,
                    field: column.field
                });
            }
        });

        const useRowList = !options.ignoreFiltering &&
                            grid.filteringExpressions !== undefined &&
                            grid.filteringExpressions.length > 0;

        const data = useRowList ? grid.rowList.toArray().map((r) => r.rowData) : grid.data;
        this.exportData(data, options);
    }

    public exportData(data: any[], options: IgxExporterOptionsBase): void {
        if (options === undefined || options === null) {
            throw Error("No options provided!");
        }

        if (this._columnList.length === 0) {
            const keys = ExportUtilities.getKeysFromData(data);
            this._columnList = keys.map((k) => ({ header: k, field: k}));
        }

        let columnIndex = 0;
        this._columnList.forEach((column) => {
            const columnExportArgs = new ColumnExportingEventArgs(column.header, columnIndex++);
            this.onColumnExport.emit(columnExportArgs);

            column.header = columnExportArgs.header;
            column.skip = columnExportArgs.cancel;
        });

        const dataToExport = new Array<any>();

        let rowIndex = 0;
        data.forEach((row) => {
            this.exportRow(dataToExport, row, rowIndex++);
        });

        this.exportDataImplementation(data, options);

        this._columnList = [];
    }

    protected abstract exportDataImplementation(data: any[], options: IgxExporterOptionsBase): void;

    private exportRow(data: any[], gridRowData: any, index: number) {
        const rowData = this._columnList.reduce((a, e) => {
                            if (e.skip === false) {
                                a[e.header] = gridRowData[e.field];
                            }
                            return a;
                        }, {});

        const rowArgs = new RowExportingEventArgs(rowData, index);
        this.onRowExport.emit(rowArgs);

        if (!rowArgs.cancel) {
            data.push(rowData);
        }
    }
}
