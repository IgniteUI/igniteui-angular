import * as JSZip from "jszip/dist/jszip";

import { CommonModule } from "@angular/common";
import { Directive, EventEmitter, Injectable, NgModule, Output } from "@angular/core";

import { ExcelElementsFactory } from "./excel-elements-factory";
import { ExcelFolderTypes } from "./excel-enums";

import {
    ColumnExportingEventArgs,
    ExportEndedEventArgs,
    RowExportingEventArgs
} from "./excel-event-args";

import { IgxExcelExporterOptions } from "./excel-exporter-options";

import {
    IExcelFile,
    IExcelFolder
} from "./excel-interfaces";

import { IgxGridComponent } from "../../grid/grid.component";
import { IgxGridModule } from "../../grid/index";

import { WorksheetData } from "./worksheet-data";

@Injectable()
export class IgxExcelExporterService {

    private static ZIP_OPTIONS = { compression: "DEFLATE", type: "base64" };
    private static DATA_URL_PREFIX = "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,";

    private _xlsx: JSZip;

    @Output()
    public onRowExport = new EventEmitter<RowExportingEventArgs>();

    @Output()
    public onColumnExport = new EventEmitter<ColumnExportingEventArgs>();

    @Output()
    public onExportEnded = new EventEmitter<ExportEndedEventArgs>();

    private static PopulateFolder(folder: IExcelFolder, zip: JSZip, worksheetData: WorksheetData): any {
        for (const childFolder of folder.ChildFolders(worksheetData)) {
            const folderIntance = ExcelElementsFactory.getExcelFolder(childFolder);
            const zipFolder = zip.folder(folderIntance.folderName);
            IgxExcelExporterService.PopulateFolder(folderIntance, zipFolder, worksheetData);
        }

        for (const childFile of folder.ChildFiles(worksheetData)) {
            const fileInstance = ExcelElementsFactory.getExcelFile(childFile);
            fileInstance.WriteElement(zip, worksheetData);
        }
    }

    public Export(grid: IgxGridComponent, options: IgxExcelExporterOptions): void {
        const columnList = grid.columnList.toArray();
        const columns = new Array<any>();
        const data = new Array<any>();

        for (const column of columnList) {
            const columnHeader = column.header !== "" ? column.header : column.field;
            const columnArgs = new ColumnExportingEventArgs(columnHeader, column.index);
            const exportColumn = !column.hidden || options.exportHiddenColumns;

            if (exportColumn) {
                this.onColumnExport.emit(columnArgs);
            }

            if (exportColumn && !columnArgs.cancel) {
                columns.push({
                    header: columnArgs.header,
                    field: column.field
                });
            }
        }

        const exportFilteredRows = !options.exportFilteredRows &&
                                    grid.filteringExpressions !== undefined &&
                                    grid.filteringExpressions.length > 0;

        const exportAllPages = options.exportCurrentlyVisiblePageOnly && grid.paging;

        const useRowList = exportFilteredRows || exportAllPages;

        if (useRowList) {
            for (const row of grid.rowList.toArray()) {
                this.ExportRow(data, row.rowData, row.index, columns);
            }
        } else {
            let index = -1;

            for (const gridRowData of grid.data) {
                this.ExportRow(data, gridRowData, ++index, columns);
            }
        }

        this.ExportData(data, options);
    }

    public ExportData(data: any[], options: IgxExcelExporterOptions): void {
        const worksheetData = new WorksheetData(data, options);
        this._xlsx = new JSZip();

        const rootFolder = ExcelElementsFactory.getExcelFolder(ExcelFolderTypes.RootExcelFolder);
        IgxExcelExporterService.PopulateFolder(rootFolder, this._xlsx, worksheetData);

        this._xlsx.generateAsync(IgxExcelExporterService.ZIP_OPTIONS).then((result) => {
            this.SaveFile(result, options.fileName);

            this.onExportEnded.emit(new ExportEndedEventArgs(this._xlsx));
        });
    }

    private SaveFile(data: string, fileName: string): void {
        const a = document.createElement("a");
        a.download = fileName;
        const blob = new Blob([this.StringToArrayBuffer(atob(data))], {
            type: ""
        });

        a.href = window.URL.createObjectURL(blob);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    private StringToArrayBuffer(s: string): ArrayBuffer {
        const buf = new ArrayBuffer(s.length);
        const view = new Uint8Array(buf);
        for (let i = 0; i !== s.length; ++i) {
            /* tslint:disable no-bitwise */
            view[i] = s.charCodeAt(i) & 0xFF;
            /* tslint:enable no-bitwise */
        }
        return buf;
    }

    private ExportRow(data: any[], gridRowData: any, index: number, columns: any[]) {
        const rowData = columns.reduce((a, e) => {
                            a[e.header] = gridRowData[e.field];
                            return a;
                        }, {});

        const rowArgs = new RowExportingEventArgs(rowData, index);
        this.onRowExport.emit(rowArgs);

        if (!rowArgs.cancel) {
            data.push(rowData);
        }
    }
}
