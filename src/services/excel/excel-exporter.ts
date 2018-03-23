import * as JSZip from "jszip/dist/jszip";

import { CommonModule } from "@angular/common";
import { Directive, EventEmitter, Injectable, NgModule, Output } from "@angular/core";

import { ExcelElementsFactory } from "./excel-elements-factory";
import { ExcelFolderTypes } from "./excel-enums";
import { ExcelExportEndedEventArgs } from "./excel-event-args";
import { IgxExcelExporterOptions } from "./excel-exporter-options";

import {
    IExcelFile,
    IExcelFolder
} from "./excel-interfaces";

import { IgxGridComponent } from "../../grid/grid.component";
import { IgxGridModule } from "../../grid/index";
import { ColumnExportingEventArgs, RowExportingEventArgs } from "../exporter-common/event-args";
import { ExportUtilities } from "../exporter-common/export-utilities";
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
    public onExportEnded = new EventEmitter<ExcelExportEndedEventArgs>();

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

    public export(grid: IgxGridComponent, options: IgxExcelExporterOptions): void {
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
                this.exportRow(data, row.rowData, row.index, columns);
            }
        } else {
            let index = -1;

            for (const gridRowData of grid.data) {
                this.exportRow(data, gridRowData, ++index, columns);
            }
        }

        this.exportData(data, options);
    }

    public exportData(data: any[], options: IgxExcelExporterOptions): void {
        const worksheetData = new WorksheetData(data, options);
        this._xlsx = new JSZip();

        const rootFolder = ExcelElementsFactory.getExcelFolder(ExcelFolderTypes.RootExcelFolder);
        IgxExcelExporterService.PopulateFolder(rootFolder, this._xlsx, worksheetData);

        this._xlsx.generateAsync(IgxExcelExporterService.ZIP_OPTIONS).then((result) => {
            this.saveFile(result, options.fileName);

            this.onExportEnded.emit(new ExcelExportEndedEventArgs(this._xlsx));
        });
    }

    private saveFile(data: string, fileName: string): void {
        const blob = new Blob([ExportUtilities.stringToArrayBuffer(atob(data))], {
            type: ""
        });

        ExportUtilities.saveBlobToFile(blob, fileName);
    }

    private exportRow(data: any[], gridRowData: any, index: number, columns: any[]) {
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
