import * as JSZip from 'jszip/dist/jszip';

import { CommonModule } from "@angular/common";
import { NgModule, Directive, EventEmitter, Output, Injectable } from "@angular/core";

import { ExcelElementsFactory } from "./excel-elements-factory";
import { ExcelFolderTypes } from './excel-enums';

import {
	ColumnExportingEventArgs,
	ExportEndedEventArgs,
	RowExportingEventArgs
} from "./excel-event-args";

import { IgxExcelExporterOptions } from "./excel-exporter-options";

import {
	IExcelFile,
	IExcelFolder
} from './excel-interfaces';

import { IgxGridComponent } from "../../grid/grid.component";
import { IgxGridModule } from "../../grid/index"

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

	public Export(grid: IgxGridComponent, options: IgxExcelExporterOptions): void {
		let columnList = grid.columnList.toArray();
		let columns = new Array<string>();
		let hasSkippedColumns = false;

		let data = new Array<any>();

		for (const column of columnList) {
			const columnHeader = column.header !== "" ? column.header : column.field;
			var columnArgs = new ColumnExportingEventArgs(columnHeader, column.index);
			const exportColumn = !column.hidden || options.exportHiddenColumns;

			if (exportColumn) {
				this.onColumnExport.emit(columnArgs);
			}

			if (exportColumn && !columnArgs.cancel) {
				columns.push(columnHeader);
			} else {
				hasSkippedColumns = true;
			}
		}

		const exportFilteredRows = !options.exportFilteredRows &&
									grid.filteringExpressions !== undefined &&
									grid.filteringExpressions.length > 0;

		const exportAllPages = options.exportCurrentlyVisiblePageOnly && grid.paging;

		let useRowList = exportFilteredRows || exportAllPages;

		if(useRowList) {
			for (const row of grid.rowList.toArray()) {
				this.ExportRow(data, row.rowData, row.index, hasSkippedColumns, columns);
			}
		} else {
			let index = -1;

			for(const gridRowData of grid.data) {
				this.ExportRow(data, gridRowData, ++index, hasSkippedColumns, columns);
			}
		}

		this.ExportData(data, options);
	}

	public ExportData(data: any[], options: IgxExcelExporterOptions): void {
		const self = this;
		let worksheetData = new WorksheetData(data, options);
		this._xlsx = new JSZip();

		IgxExcelExporterService.PopulateFolder(ExcelElementsFactory.getExcelFolder(ExcelFolderTypes.RootExcelFolder), this._xlsx, worksheetData);

		this._xlsx.generateAsync(IgxExcelExporterService.ZIP_OPTIONS).then((data) => {
			self.SaveFile(data, options.fileName);

			self.onExportEnded.emit(new ExportEndedEventArgs(self._xlsx));
		});
	}

	private static PopulateFolder(folder: IExcelFolder, zip: JSZip, worksheetData: WorksheetData): any {
		for (const childFolder of folder.ChildFolders(worksheetData)) {
			let folderIntance = ExcelElementsFactory.getExcelFolder(childFolder);
			let zipFolder = zip.folder(folderIntance.folderName);
			IgxExcelExporterService.PopulateFolder(folderIntance, zipFolder, worksheetData);
		}

		for (const childFile of folder.ChildFiles(worksheetData)) {
			let fileInstance = ExcelElementsFactory.getExcelFile(childFile);
			fileInstance.WriteElement(zip, worksheetData);
		}
	}

	private SaveFile(data: string, fileName: string): void {
		var a = document.createElement("a");
		a.download = fileName;
		a.href = IgxExcelExporterService.DATA_URL_PREFIX + data;

		var e = document.createEvent('MouseEvents');
		e.initMouseEvent('click', true, false, window,
		0, 0, 0, 0, 0, false, false, false, false, 0, null);

		a.dispatchEvent(e);
	}

	private ExportRow(data: any[], gridRowData: any, index: number, hasSkippedColumns: boolean, columns: string[]) {
		var rowData: any = null;

		if (hasSkippedColumns) {
			rowData = columns.reduce((a, e) => (a[e] = gridRowData[e], a), {});
		} else {
			rowData = JSON.parse(JSON.stringify(gridRowData));
		}

		var rowArgs = new RowExportingEventArgs(rowData, index);
		this.onRowExport.emit(rowArgs);

		if (!rowArgs.cancel) {
			data.push(rowData);
		}
	}
}
