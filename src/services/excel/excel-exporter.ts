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
        let hasSkippedColumns = false;

        const data = new Array<any>();

        for (const column of columnList) {
            const columnHeader = column.header !== "" ? column.header : column.field;
            const columnArgs = new ColumnExportingEventArgs(columnHeader, column.index);
            const exportColumn = (options === undefined || options.exportHiddenColumns === undefined) ?
                                    true : (options.exportHiddenColumns === true) ? true : !column.hidden;

            if (exportColumn) {
                this.onColumnExport.emit(columnArgs);
            }

            if (exportColumn && !columnArgs.cancel) {
                columns.push({
					header: columnArgs.header,
					name: column.field
				});
            } else {
                hasSkippedColumns = true;
            }
        }

        const exportFilteredRows = !options.exportFilteredRows &&
                                    grid.filteringExpressions !== undefined &&
                                    grid.filteringExpressions.length > 0;

        const exportAllPages = options.exportCurrentlyVisiblePageOnly && grid.paging;

        const useRowList = exportFilteredRows || exportAllPages;

        if (useRowList) {
            for (const row of grid.rowList.toArray()) {
                this.ExportRow(data, row.rowData, row.index, hasSkippedColumns, columns);
            }
        } else {
            let index = -1;

            for (const gridRowData of grid.data) {
                this.ExportRow(data, gridRowData, ++index, hasSkippedColumns, columns);
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
        a.href = IgxExcelExporterService.DATA_URL_PREFIX + data;

        const e = document.createEvent("MouseEvents");
        e.initMouseEvent("click", true, false, window,
        0, 0, 0, 0, 0, false, false, false, false, 0, null);

        a.dispatchEvent(e);
    }

    private ExportRow(data: any[], gridRowData: any, index: number, hasSkippedColumns: boolean, columns: any[]) {
        const rowData = hasSkippedColumns ?
                columns.reduce((a, e) => {
                    a[e.header] = gridRowData[e.name];
                    return a;
                }, {}) :
                JSON.parse(JSON.stringify(gridRowData));

        const rowArgs = new RowExportingEventArgs(rowData, index);
        this.onRowExport.emit(rowArgs);

        if (!rowArgs.cancel) {
            data.push(rowData);
        }
    }
}
