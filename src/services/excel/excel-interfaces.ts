import * as JSZip from "jszip/dist/jszip";

import {
	ExcelFileTypes,
	ExcelFolderTypes
} from "./excel-enums";

import { WorksheetData } from "./worksheet-data";

export interface IExcelFile {
	WriteElement(folder: JSZip, data: WorksheetData): void;
}

export interface IExcelFolder {
	folderName: string;

	ChildFiles(data: WorksheetData): ExcelFileTypes[];
	ChildFolders(data: WorksheetData): ExcelFolderTypes[];
}
