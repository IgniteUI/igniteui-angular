import * as JSZip from 'jszip/dist/jszip';

import { CommonModule } from "@angular/common";
import { NgModule, Directive } from "@angular/core";

import { ExcelElementsFactory } from "./excel-elements-factory";
import { ExcelFolderTypes } from './excel-enums';
import {
	IExcelFile,
	IExcelFolder
} from './excel-interfaces';

import { IgxGridComponent } from "../grid/grid.component";
import { IgxGridModule } from "../grid";

import { WorksheetData } from "./worksheet-data";

@Directive({
	selector: "igxExport"
})
export class IgxGridExcelExporterDirective {

	private static ZIP_OPTIONS = { compression: "DEFLATE", type: "base64" };

	public static Export(grid: IgxGridComponent, callback): void {
		let rowList = grid.rowList.toArray();

		let data = new Array<any>();

		for (const row of rowList) {
			data.push(row.rowData);
		}

		let worksheetData = new WorksheetData();
		worksheetData.data = data;

		let xlsx = new JSZip();

		IgxGridExcelExporterDirective.PopulateFolder(ExcelElementsFactory.getExcelFolder(ExcelFolderTypes.RootExcelFolder), xlsx, worksheetData);

		xlsx.generateAsync(IgxGridExcelExporterDirective.ZIP_OPTIONS).then(callback);
	}

	private static PopulateFolder(folder: IExcelFolder, zip: JSZip, worksheetData: WorksheetData): any {
		for (const childFolder of folder.ChildFolders(worksheetData)) {
			let folderIntance = ExcelElementsFactory.getExcelFolder(childFolder);
			let zipFolder = zip.folder(folderIntance.folderName);
			IgxGridExcelExporterDirective.PopulateFolder(folderIntance, zipFolder, worksheetData);
		}

		for (const childFile of folder.ChildFiles(worksheetData)) {
			let fileInstance = ExcelElementsFactory.getExcelFile(childFile);
			fileInstance.WriteElement(zip, worksheetData);
		}
	}
}

@NgModule({
	declarations: [IgxGridExcelExporterDirective],
	exports: [IgxGridExcelExporterDirective],
	imports: [IgxGridModule, CommonModule]
})
export class IgxGridExcelExportModule {
}

