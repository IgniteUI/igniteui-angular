import { IExcelFile } from "./excel-interfaces";
import { WorksheetData } from "./worksheet-data";
import * as JSZip from "jszip/dist/jszip";
export declare class RootRelsFile implements IExcelFile {
    writeElement(folder: JSZip, worksheetData: WorksheetData): void;
}
export declare class AppFile implements IExcelFile {
    writeElement(folder: JSZip, worksheetData: WorksheetData): void;
}
export declare class CoreFile implements IExcelFile {
    writeElement(folder: JSZip, worksheetData: WorksheetData): void;
}
export declare class WorkbookRelsFile implements IExcelFile {
    writeElement(folder: JSZip, worksheetData: WorksheetData): void;
}
export declare class ThemeFile implements IExcelFile {
    writeElement(folder: JSZip, worksheetData: WorksheetData): void;
}
export declare class WorksheetFile implements IExcelFile {
    private static MIN_WIDTH;
    writeElement(folder: JSZip, worksheetData: WorksheetData): void;
    private static getCellData(worksheetData, row, column);
}
export declare class StyleFile implements IExcelFile {
    writeElement(folder: JSZip, worksheetData: WorksheetData): void;
}
export declare class WorkbookFile implements IExcelFile {
    writeElement(folder: JSZip, worksheetData: WorksheetData): void;
}
export declare class ContentTypesFile implements IExcelFile {
    writeElement(folder: JSZip, worksheetData: WorksheetData): void;
}
export declare class SharedStringsFile implements IExcelFile {
    writeElement(folder: JSZip, worksheetData: WorksheetData): void;
}
export declare class TablesFile implements IExcelFile {
    writeElement(folder: JSZip, worksheetData: WorksheetData): void;
}
export declare class WorksheetRelsFile implements IExcelFile {
    writeElement(folder: JSZip, worksheetData: WorksheetData): void;
}
