import {
    ExcelFileTypes,
    ExcelFolderTypes
} from './excel-enums';

import { IExcelFolder } from './excel-interfaces';
import { WorksheetData } from './worksheet-data';

/** @hidden */
export class RootExcelFolder implements IExcelFolder {
    public get folderName() {
        return  '';
    }

    public childFiles() {
        return [ExcelFileTypes.ContentTypesFile];
    }

    public childFolders() {
        return [
            ExcelFolderTypes.RootRelsExcelFolder,
            ExcelFolderTypes.DocPropsExcelFolder,
            ExcelFolderTypes.XLExcelFolder
        ];
    }
}

/** @hidden */
export class RootRelsExcelFolder implements IExcelFolder {
    public get folderName() {
        return  '_rels';
    }

    public childFiles() {
        return [ExcelFileTypes.RootRelsFile];
    }

    public childFolders() {
        return [];
    }
}

/** @hidden */
export class DocPropsExcelFolder implements IExcelFolder {
    public get folderName() {
        return  'docProps';
    }

    public childFiles() {
        return [
            ExcelFileTypes.AppFile,
            ExcelFileTypes.CoreFile
        ];
    }

    public childFolders() {
        return [];
    }
}

/** @hidden */
export class XLExcelFolder implements IExcelFolder {
    public get folderName() {
        return  'xl';
    }

    public childFiles(data: WorksheetData) {
        const retVal = [
            ExcelFileTypes.StyleFile,
            ExcelFileTypes.WorkbookFile
        ];

        if (!data.isEmpty) {
            retVal.push(ExcelFileTypes.SharedStringsFile);
        }

        return retVal;
    }

    public childFolders(data: WorksheetData) {
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

/** @hidden */
export class XLRelsExcelFolder implements IExcelFolder {
    public get folderName() {
        return  '_rels';
    }

    public childFiles() {
        return [ExcelFileTypes.WorkbookRelsFile];
    }

    public childFolders() {
        return [];
    }
}

/** @hidden */
export class ThemeExcelFolder implements IExcelFolder {
    public get folderName() {
        return  'theme';
    }

    public childFiles() {
        return [ExcelFileTypes.ThemeFile];
    }

    public childFolders() {
        return [];
    }
}

/** @hidden */
export class WorksheetsExcelFolder implements IExcelFolder {
    public get folderName() {
        return  'worksheets';
    }

    public childFiles() {
        return [ExcelFileTypes.WorksheetFile];
    }

    public childFolders(data: WorksheetData) {
        return data.isEmpty || !data.options.exportAsTable ? [] : [ExcelFolderTypes.WorksheetsRelsExcelFolder];
    }
}

/** @hidden */
export class TablesExcelFolder implements IExcelFolder {
    public get folderName() {
        return 'tables';
    }

    public childFiles() {
        return [ExcelFileTypes.TablesFile];
    }

    public childFolders() {
        return [];
    }
}

/** @hidden */
export class WorksheetsRelsExcelFolder implements IExcelFolder {
    public get folderName() {
        return '_rels';
    }

    public childFiles() {
        return [ExcelFileTypes.WorksheetRelsFile];
    }

    public childFolders() {
        return [];
    }
}
