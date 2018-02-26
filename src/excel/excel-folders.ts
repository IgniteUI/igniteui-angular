import {
	ExcelFileTypes,
	ExcelFolderTypes
} from "./excel-enums";

import { IExcelFolder } from "./excel-interfaces";
import { WorksheetData } from "./worksheet-data";

export class RootExcelFolder implements IExcelFolder {
	public get folderName() {
		return  "";
	}

	ChildFiles(data: WorksheetData) {
		return [ExcelFileTypes.ContentTypesFile];
	}

	ChildFolders(data: WorksheetData) {
		return [
			ExcelFolderTypes.RootRelsExcelFolder,
			ExcelFolderTypes.DocPropsExcelFolder,
			ExcelFolderTypes.XLExcelFolder
		];
	}
}

export class RootRelsExcelFolder implements IExcelFolder {
	public get folderName() {
		return  "_rels";
	}

	ChildFiles(data: WorksheetData) {
		return [ExcelFileTypes.RootRelsFile];
	}

	ChildFolders(data: WorksheetData) {
		return [];
	}
}

export class DocPropsExcelFolder implements IExcelFolder {
	public get folderName() {
		return  "docProps";
	}

	ChildFiles(data: WorksheetData) {
		return [
			ExcelFileTypes.AppFile,
			ExcelFileTypes.CoreFile
		];
	}

	ChildFolders(data: WorksheetData) {
		return [];
	}
}

export class XLExcelFolder implements IExcelFolder {
	public get folderName() {
		return  "xl";
	}

	ChildFiles(data: WorksheetData) {
		var retVal = [
			ExcelFileTypes.StyleFile,
			ExcelFileTypes.WorkbookFile
		];

		if (data.cachedValues && data.cachedValues.length > 0) {
			retVal.push(ExcelFileTypes.SharedStringsFile);
		}

		return retVal;
	}

	ChildFolders(data: WorksheetData) {
		return [
			ExcelFolderTypes.XLRelsExcelFolder,
			ExcelFolderTypes.ThemeExcelFolder,
			ExcelFolderTypes.WorksheetsExcelFolder
		];
	}
}

export class XLRelsExcelFolder implements IExcelFolder {
	public get folderName() {
		return  "_rels";
	}

	ChildFiles(data: WorksheetData) {
		return [ExcelFileTypes.WorkbookRelsFile];
	}

	ChildFolders(data: WorksheetData) {
		return [];
	}
}

export class ThemeExcelFolder implements IExcelFolder {
	public get folderName() {
		return  "theme";
	}

	ChildFiles(data: WorksheetData) {
		return [ExcelFileTypes.ThemeFile];
	}

	ChildFolders(data: WorksheetData) {
		return [];
	}
}

export class WorksheetsExcelFolder implements IExcelFolder {
	public get folderName() {
		return  "worksheets";
	}

	ChildFiles(data: WorksheetData) {
		return [ExcelFileTypes.WorksheetFile];
	}

	ChildFolders(data: WorksheetData) {
		return [];
	}
}