import * as JSZip from "jszip/dist/jszip";

import {
    ExcelFileTypes,
    ExcelFolderTypes
} from "./excel-enums";

import { WorksheetData } from "./worksheet-data";

export interface IExcelFile {
    writeElement(folder: JSZip, data: WorksheetData): void;
}

export interface IExcelFolder {
    folderName: string;

    childFiles(data: WorksheetData): ExcelFileTypes[];
    childFolders(data: WorksheetData): ExcelFolderTypes[];
}
