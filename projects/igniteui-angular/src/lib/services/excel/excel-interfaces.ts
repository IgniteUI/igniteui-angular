import {
    ExcelFileTypes,
    ExcelFolderTypes
} from './excel-enums';

import { WorksheetData } from './worksheet-data';

/** @hidden */
export interface IExcelFile {
    writeElement(folder: Object, data: WorksheetData): void;
}

/** @hidden */
export interface IExcelFolder {
    folderName: string;

    childFiles(data: WorksheetData): ExcelFileTypes[];
    childFolders(data: WorksheetData): ExcelFolderTypes[];
}
