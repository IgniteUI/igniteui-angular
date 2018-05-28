import { ExcelFileTypes, ExcelFolderTypes } from "./excel-enums";
import { AppFile, ContentTypesFile, CoreFile, RootRelsFile, SharedStringsFile, StyleFile, TablesFile, ThemeFile, WorkbookFile, WorkbookRelsFile, WorksheetFile, WorksheetRelsFile } from "./excel-files";
import { DocPropsExcelFolder, RootExcelFolder, RootRelsExcelFolder, TablesExcelFolder, ThemeExcelFolder, WorksheetsExcelFolder, WorksheetsRelsExcelFolder, XLExcelFolder, XLRelsExcelFolder } from "./excel-folders";
var ExcelElementsFactory = (function () {
    function ExcelElementsFactory() {
    }
    ExcelElementsFactory.getExcelFolder = function (type) {
        switch (type) {
            case ExcelFolderTypes.RootExcelFolder:
                return new RootExcelFolder();
            case ExcelFolderTypes.RootRelsExcelFolder:
                return new RootRelsExcelFolder();
            case ExcelFolderTypes.DocPropsExcelFolder:
                return new DocPropsExcelFolder();
            case ExcelFolderTypes.XLExcelFolder:
                return new XLExcelFolder();
            case ExcelFolderTypes.XLRelsExcelFolder:
                return new XLRelsExcelFolder();
            case ExcelFolderTypes.ThemeExcelFolder:
                return new ThemeExcelFolder();
            case ExcelFolderTypes.WorksheetsExcelFolder:
                return new WorksheetsExcelFolder();
            case ExcelFolderTypes.WorksheetsRelsExcelFolder:
                return new WorksheetsRelsExcelFolder();
            case ExcelFolderTypes.TablesExcelFolder:
                return new TablesExcelFolder();
            default:
                throw new Error("Unknown excel folder type!");
        }
    };
    ExcelElementsFactory.getExcelFile = function (type) {
        switch (type) {
            case ExcelFileTypes.RootRelsFile:
                return new RootRelsFile();
            case ExcelFileTypes.AppFile:
                return new AppFile();
            case ExcelFileTypes.CoreFile:
                return new CoreFile();
            case ExcelFileTypes.WorkbookRelsFile:
                return new WorkbookRelsFile();
            case ExcelFileTypes.ThemeFile:
                return new ThemeFile();
            case ExcelFileTypes.WorksheetFile:
                return new WorksheetFile();
            case ExcelFileTypes.StyleFile:
                return new StyleFile();
            case ExcelFileTypes.WorkbookFile:
                return new WorkbookFile();
            case ExcelFileTypes.ContentTypesFile:
                return new ContentTypesFile();
            case ExcelFileTypes.SharedStringsFile:
                return new SharedStringsFile();
            case ExcelFileTypes.WorksheetRelsFile:
                return new WorksheetRelsFile();
            case ExcelFileTypes.TablesFile:
                return new TablesFile();
            default:
                throw Error("Unknown excel file type!");
        }
    };
    return ExcelElementsFactory;
}());
export { ExcelElementsFactory };
