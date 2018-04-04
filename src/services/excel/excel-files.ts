import { IExcelFile } from "./excel-interfaces";
import { ExcelStrings } from "./excel-strings";
import { WorksheetData } from "./worksheet-data";

import * as JSZip from "jszip/dist/jszip";

export class RootRelsFile implements IExcelFile {
    public writeElement(folder: JSZip, worksheetData: WorksheetData) {
        folder.file(".rels", ExcelStrings.getRels());
    }
}

export class AppFile implements IExcelFile {
    public writeElement(folder: JSZip, worksheetData: WorksheetData) {
        folder.file("app.xml", ExcelStrings.getApp());
    }
}

export class CoreFile implements IExcelFile {
    public writeElement(folder: JSZip, worksheetData: WorksheetData) {
        folder.file("core.xml", ExcelStrings.getCore());
    }
}

export class WorkbookRelsFile implements IExcelFile {
    public writeElement(folder: JSZip, worksheetData: WorksheetData) {
        const hasSharedStrings = worksheetData.isEmpty === false;
        folder.file("workbook.xml.rels", ExcelStrings.getWorkbookRels(hasSharedStrings));
    }
}

export class ThemeFile implements IExcelFile {
    public writeElement(folder: JSZip, worksheetData: WorksheetData) {
        folder.file("theme1.xml", ExcelStrings.getTheme());
    }
}

export class WorksheetFile implements IExcelFile {
    private static MIN_WIDTH = 8.34;

    public writeElement(folder: JSZip, worksheetData: WorksheetData) {
        const sheetData = [];
        const cols = [];
        let dimension: string;
        const dictionary = worksheetData.dataDictionary;
        let freezePane = "";

        if (worksheetData.isEmpty) {
            sheetData.push("<sheetData/>");
            dimension = "A1";
        } else {
            sheetData.push("<sheetData>");
            const height =  worksheetData.options.rowHeight;
            const rowHeight = height ? " ht=\"" + height + "\" customHeight=\"1\"" : "";

            sheetData.push(`<row r="1"${rowHeight}>`);
            for (let i = 0; i < worksheetData.columnCount; i++) {
                const column = ExcelStrings.getExcelColumn(i) + 1;
                const value = dictionary.saveValue(worksheetData.keys[i], i);
                sheetData.push(`<c r="${column}" t="s"><v>${value}</v></c>`);
            }
            sheetData.push("</row>");

            for (let i = 1; i < worksheetData.rowCount; i++) {
                sheetData.push(`<row r="${(i + 1)}"${rowHeight}>`);

                for (let j = 0; j < worksheetData.columnCount; j++) {
                    const column = ExcelStrings.getExcelColumn(j) + (i + 1);

                    const cellValue = worksheetData.data[i - 1][worksheetData.keys[j]];
                    let stringValue = "";
                    if (worksheetData.isSpecialData) {
                        stringValue = String(worksheetData.data[i - 1]);
                    } else if (cellValue !== undefined && cellValue !== null) {
                        stringValue = String(cellValue);
                    }
                    const value = dictionary.saveValue(stringValue, j);

                    sheetData.push(`<c r="${column}" t="s"><v>${value}</v></c>`);
                }
                sheetData.push("</row>");
            }
            sheetData.push("</sheetData>");
            dimension = "A1:" + ExcelStrings.getExcelColumn(worksheetData.columnCount - 1) + worksheetData.rowCount;

            cols.push("<cols>");
            for (let i = 0; i < worksheetData.columnCount; i++) {
                const width = dictionary.columnWidths[i];
                // Use the width provided in the options if it exists
                const widthInTwips = worksheetData.options.columnWidth ?
                                    worksheetData.options.columnWidth :
                                    Math.max(((width / 96) * 14.4), WorksheetFile.MIN_WIDTH);

                cols.push(`<col min="${(i + 1)}" max="${(i + 1)}" width="${widthInTwips}" customWidth="1"/>`);
            }
            cols.push("</cols>");

            if (worksheetData.indexOfLastPinnedColumn !== -1 &&
                !worksheetData.options.ignorePinning &&
                !worksheetData.options.ignoreColumnsOrder) {
                const frozenColumnCount = worksheetData.indexOfLastPinnedColumn + 1;
                const firstCell = ExcelStrings.getExcelColumn(frozenColumnCount) + "1";
                freezePane = `<pane xSplit="${frozenColumnCount}" topLeftCell="${firstCell}" activePane="topRight" state="frozen"/>`;
            }
        }
        folder.file("sheet1.xml", ExcelStrings.getSheetXML(dimension, freezePane, cols.join(""), sheetData.join("")));
    }
}

export class StyleFile implements IExcelFile {
    public writeElement(folder: JSZip, worksheetData: WorksheetData) {
        folder.file("styles.xml", ExcelStrings.getStyles());
    }
}

export class WorkbookFile implements IExcelFile {
    public writeElement(folder: JSZip, worksheetData: WorksheetData) {
        folder.file("workbook.xml", ExcelStrings.getWorkbook());
    }
}

export class ContentTypesFile implements IExcelFile {
    public writeElement(folder: JSZip, worksheetData: WorksheetData) {
        folder.file("[Content_Types].xml", ExcelStrings.getContentTypesXML(!worksheetData.isEmpty));
    }
}

export class SharedStringsFile implements IExcelFile {
    public writeElement(folder: JSZip, worksheetData: WorksheetData) {
        const dict = worksheetData.dataDictionary;
        const sortedValues = dict.getKeys();
        const sharedStrings = new Array<string>(sortedValues.length);

        for (const value of sortedValues) {
            sharedStrings[dict.getSanitizedValue(value)] = "<si><t>" + value + "</t></si>";
        }

        folder.file("sharedStrings.xml", ExcelStrings.getSharedStringXML(
                        worksheetData.columnCount * worksheetData.rowCount,
                        sortedValues.length,
                        sharedStrings.join(""))
                    );
    }
}

export class TablesFile implements IExcelFile {
    public writeElement(folder: JSZip, worksheetData: WorksheetData) {
        const columnCount = worksheetData.columnCount;
        const dimension = "A1:" + ExcelStrings.getExcelColumn(columnCount - 1) + worksheetData.rowCount;
        const values = worksheetData.keys;

        let tableColumns = "<tableColumns count=\"" + columnCount + "\">";
        for (let i = 0; i < columnCount; i++) {
            const value =  values[i];
            tableColumns += "<tableColumn id=\"" + (i + 1) + "\" name=\"" + value + "\"/>";
        }

        tableColumns += "</tableColumns>";

        folder.file("table1.xml", ExcelStrings.getTablesXML(dimension, tableColumns));
    }
}

export class WorksheetRelsFile implements IExcelFile {
    public writeElement(folder: JSZip, worksheetData: WorksheetData) {
        folder.file("sheet1.xml.rels", ExcelStrings.getWorksheetRels());
    }
}
