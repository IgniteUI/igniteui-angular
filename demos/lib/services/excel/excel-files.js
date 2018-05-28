import { ExcelStrings } from "./excel-strings";
var RootRelsFile = (function () {
    function RootRelsFile() {
    }
    RootRelsFile.prototype.writeElement = function (folder, worksheetData) {
        folder.file(".rels", ExcelStrings.getRels());
    };
    return RootRelsFile;
}());
export { RootRelsFile };
var AppFile = (function () {
    function AppFile() {
    }
    AppFile.prototype.writeElement = function (folder, worksheetData) {
        folder.file("app.xml", ExcelStrings.getApp());
    };
    return AppFile;
}());
export { AppFile };
var CoreFile = (function () {
    function CoreFile() {
    }
    CoreFile.prototype.writeElement = function (folder, worksheetData) {
        folder.file("core.xml", ExcelStrings.getCore());
    };
    return CoreFile;
}());
export { CoreFile };
var WorkbookRelsFile = (function () {
    function WorkbookRelsFile() {
    }
    WorkbookRelsFile.prototype.writeElement = function (folder, worksheetData) {
        var hasSharedStrings = worksheetData.isEmpty === false;
        folder.file("workbook.xml.rels", ExcelStrings.getWorkbookRels(hasSharedStrings));
    };
    return WorkbookRelsFile;
}());
export { WorkbookRelsFile };
var ThemeFile = (function () {
    function ThemeFile() {
    }
    ThemeFile.prototype.writeElement = function (folder, worksheetData) {
        folder.file("theme1.xml", ExcelStrings.getTheme());
    };
    return ThemeFile;
}());
export { ThemeFile };
var WorksheetFile = (function () {
    function WorksheetFile() {
    }
    WorksheetFile.prototype.writeElement = function (folder, worksheetData) {
        var sheetData = [];
        var cols = [];
        var dimension;
        var dictionary = worksheetData.dataDictionary;
        var freezePane = "";
        if (worksheetData.isEmpty) {
            sheetData.push("<sheetData/>");
            dimension = "A1";
        }
        else {
            sheetData.push("<sheetData>");
            var height = worksheetData.options.rowHeight;
            var rowHeight = height ? " ht=\"" + height + "\" customHeight=\"1\"" : "";
            sheetData.push("<row r=\"1\"" + rowHeight + ">");
            for (var i = 0; i < worksheetData.columnCount; i++) {
                var column = ExcelStrings.getExcelColumn(i) + 1;
                var value = dictionary.saveValue(worksheetData.keys[i], i, true);
                sheetData.push("<c r=\"" + column + "\" t=\"s\"><v>" + value + "</v></c>");
            }
            sheetData.push("</row>");
            for (var i = 1; i < worksheetData.rowCount; i++) {
                sheetData.push("<row r=\"" + (i + 1) + "\"" + rowHeight + ">");
                for (var j = 0; j < worksheetData.columnCount; j++) {
                    var cellData = WorksheetFile.getCellData(worksheetData, i, j);
                    sheetData.push(cellData);
                }
                sheetData.push("</row>");
            }
            sheetData.push("</sheetData>");
            dimension = "A1:" + ExcelStrings.getExcelColumn(worksheetData.columnCount - 1) + worksheetData.rowCount;
            cols.push("<cols>");
            for (var i = 0; i < worksheetData.columnCount; i++) {
                var width = dictionary.columnWidths[i];
                var widthInTwips = worksheetData.options.columnWidth ?
                    worksheetData.options.columnWidth :
                    Math.max(((width / 96) * 14.4), WorksheetFile.MIN_WIDTH);
                cols.push("<col min=\"" + (i + 1) + "\" max=\"" + (i + 1) + "\" width=\"" + widthInTwips + "\" customWidth=\"1\"/>");
            }
            cols.push("</cols>");
            if (worksheetData.indexOfLastPinnedColumn !== -1 &&
                !worksheetData.options.ignorePinning &&
                !worksheetData.options.ignoreColumnsOrder) {
                var frozenColumnCount = worksheetData.indexOfLastPinnedColumn + 1;
                var firstCell = ExcelStrings.getExcelColumn(frozenColumnCount) + "1";
                freezePane = "<pane xSplit=\"" + frozenColumnCount + "\" topLeftCell=\"" + firstCell + "\" activePane=\"topRight\" state=\"frozen\"/>";
            }
        }
        var hasTable = !worksheetData.isEmpty && worksheetData.options.exportAsTable;
        folder.file("sheet1.xml", ExcelStrings.getSheetXML(dimension, freezePane, cols.join(""), sheetData.join(""), hasTable));
    };
    WorksheetFile.getCellData = function (worksheetData, row, column) {
        var dictionary = worksheetData.dataDictionary;
        var columnName = ExcelStrings.getExcelColumn(column) + (row + 1);
        var columnHeader = worksheetData.keys[column];
        var cellValue = worksheetData.isSpecialData ?
            worksheetData.data[row - 1] :
            worksheetData.data[row - 1][columnHeader];
        var savedValue = dictionary.saveValue(cellValue, column, false);
        var isSavedAsString = savedValue !== -1;
        var value = isSavedAsString ? savedValue : (cellValue === undefined ? "" : cellValue);
        var type = isSavedAsString ? " t=\"s\"" : "";
        var format = isSavedAsString ? "" : " s=\"1\"";
        return "<c r=\"" + columnName + "\"" + type + format + "><v>" + value + "</v></c>";
    };
    WorksheetFile.MIN_WIDTH = 8.34;
    return WorksheetFile;
}());
export { WorksheetFile };
var StyleFile = (function () {
    function StyleFile() {
    }
    StyleFile.prototype.writeElement = function (folder, worksheetData) {
        folder.file("styles.xml", ExcelStrings.getStyles(worksheetData.dataDictionary && worksheetData.dataDictionary.hasNonStringValues));
    };
    return StyleFile;
}());
export { StyleFile };
var WorkbookFile = (function () {
    function WorkbookFile() {
    }
    WorkbookFile.prototype.writeElement = function (folder, worksheetData) {
        folder.file("workbook.xml", ExcelStrings.getWorkbook());
    };
    return WorkbookFile;
}());
export { WorkbookFile };
var ContentTypesFile = (function () {
    function ContentTypesFile() {
    }
    ContentTypesFile.prototype.writeElement = function (folder, worksheetData) {
        folder.file("[Content_Types].xml", ExcelStrings.getContentTypesXML(!worksheetData.isEmpty, worksheetData.options.exportAsTable));
    };
    return ContentTypesFile;
}());
export { ContentTypesFile };
var SharedStringsFile = (function () {
    function SharedStringsFile() {
    }
    SharedStringsFile.prototype.writeElement = function (folder, worksheetData) {
        var dict = worksheetData.dataDictionary;
        var sortedValues = dict.getKeys();
        var sharedStrings = new Array(sortedValues.length);
        for (var _i = 0, sortedValues_1 = sortedValues; _i < sortedValues_1.length; _i++) {
            var value = sortedValues_1[_i];
            sharedStrings[dict.getSanitizedValue(value)] = "<si><t>" + value + "</t></si>";
        }
        folder.file("sharedStrings.xml", ExcelStrings.getSharedStringXML(dict.stringsCount, sortedValues.length, sharedStrings.join("")));
    };
    return SharedStringsFile;
}());
export { SharedStringsFile };
var TablesFile = (function () {
    function TablesFile() {
    }
    TablesFile.prototype.writeElement = function (folder, worksheetData) {
        var columnCount = worksheetData.columnCount;
        var lastColumn = ExcelStrings.getExcelColumn(columnCount - 1) + worksheetData.rowCount;
        var dimension = "A1:" + lastColumn;
        var values = worksheetData.keys;
        var sortString = "";
        var tableColumns = "<tableColumns count=\"" + columnCount + "\">";
        for (var i = 0; i < columnCount; i++) {
            var value = values[i];
            tableColumns += "<tableColumn id=\"" + (i + 1) + "\" name=\"" + value + "\"/>";
        }
        tableColumns += "</tableColumns>";
        if (worksheetData.sort) {
            var sortingExpression = worksheetData.sort;
            var sc = ExcelStrings.getExcelColumn(values.indexOf(sortingExpression.fieldName));
            var dir = sortingExpression.dir - 1;
            sortString = "<sortState ref=\"A2:" + lastColumn + "\"><sortCondition descending=\"" + dir + "\" ref=\"" + sc + "1:" + sc + "15\"/></sortState>";
        }
        folder.file("table1.xml", ExcelStrings.getTablesXML(dimension, tableColumns, sortString));
    };
    return TablesFile;
}());
export { TablesFile };
var WorksheetRelsFile = (function () {
    function WorksheetRelsFile() {
    }
    WorksheetRelsFile.prototype.writeElement = function (folder, worksheetData) {
        folder.file("sheet1.xml.rels", ExcelStrings.getWorksheetRels());
    };
    return WorksheetRelsFile;
}());
export { WorksheetRelsFile };
