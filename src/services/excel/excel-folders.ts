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

    childFiles(data: WorksheetData) {
        return [ExcelFileTypes.ContentTypesFile];
    }

    childFolders(data: WorksheetData) {
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

    childFiles(data: WorksheetData) {
        return [ExcelFileTypes.RootRelsFile];
    }

    childFolders(data: WorksheetData) {
        return [];
    }
}

export class DocPropsExcelFolder implements IExcelFolder {
    public get folderName() {
        return  "docProps";
    }

    childFiles(data: WorksheetData) {
        return [
            ExcelFileTypes.AppFile,
            ExcelFileTypes.CoreFile
        ];
    }

    childFolders(data: WorksheetData) {
        return [];
    }
}

export class XLExcelFolder implements IExcelFolder {
    public get folderName() {
        return  "xl";
    }

    childFiles(data: WorksheetData) {
        const retVal = [
            ExcelFileTypes.StyleFile,
            ExcelFileTypes.WorkbookFile
        ];

        if (!data.isEmpty) {
            retVal.push(ExcelFileTypes.SharedStringsFile);
        }

        return retVal;
    }

    childFolders(data: WorksheetData) {
        const retVal = [
            ExcelFolderTypes.XLRelsExcelFolder,
            ExcelFolderTypes.ThemeExcelFolder,
            ExcelFolderTypes.WorksheetsExcelFolder
        ];

        if (!data.isEmpty && data.options.exportAsTable) {
            retVal.push(ExcelFolderTypes.TablesExcelFolder);
        }

        return retVal;
    }
}

export class XLRelsExcelFolder implements IExcelFolder {
    public get folderName() {
        return  "_rels";
    }

    childFiles(data: WorksheetData) {
        return [ExcelFileTypes.WorkbookRelsFile];
    }

    childFolders(data: WorksheetData) {
        return [];
    }
}

export class ThemeExcelFolder implements IExcelFolder {
    public get folderName() {
        return  "theme";
    }

    childFiles(data: WorksheetData) {
        return [ExcelFileTypes.ThemeFile];
    }

    childFolders(data: WorksheetData) {
        return [];
    }
}

export class WorksheetsExcelFolder implements IExcelFolder {
    public get folderName() {
        return  "worksheets";
    }

    childFiles(data: WorksheetData) {
        return [ExcelFileTypes.WorksheetFile];
    }

    childFolders(data: WorksheetData) {
        return data.isEmpty || !data.options.exportAsTable ? [] : [ExcelFolderTypes.WorksheetsRelsExcelFolder];
    }
}

export class TablesExcelFolder implements IExcelFolder {
    public get folderName() {
        return "tables";
    }

    childFiles(data: WorksheetData) {
        return [ExcelFileTypes.TablesFile];
    }

    childFolders(data: WorksheetData) {
        return [];
    }
}

export class WorksheetsRelsExcelFolder implements IExcelFolder {
    public get folderName() {
        return "_rels";
    }

    childFiles(data: WorksheetData) {
        return [ExcelFileTypes.WorksheetRelsFile];
    }

    childFolders(data: WorksheetData) {
        return [];
    }
}
