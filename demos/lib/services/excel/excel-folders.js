import { ExcelFileTypes, ExcelFolderTypes } from "./excel-enums";
var RootExcelFolder = (function () {
    function RootExcelFolder() {
    }
    Object.defineProperty(RootExcelFolder.prototype, "folderName", {
        get: function () {
            return "";
        },
        enumerable: true,
        configurable: true
    });
    RootExcelFolder.prototype.childFiles = function (data) {
        return [ExcelFileTypes.ContentTypesFile];
    };
    RootExcelFolder.prototype.childFolders = function (data) {
        return [
            ExcelFolderTypes.RootRelsExcelFolder,
            ExcelFolderTypes.DocPropsExcelFolder,
            ExcelFolderTypes.XLExcelFolder
        ];
    };
    return RootExcelFolder;
}());
export { RootExcelFolder };
var RootRelsExcelFolder = (function () {
    function RootRelsExcelFolder() {
    }
    Object.defineProperty(RootRelsExcelFolder.prototype, "folderName", {
        get: function () {
            return "_rels";
        },
        enumerable: true,
        configurable: true
    });
    RootRelsExcelFolder.prototype.childFiles = function (data) {
        return [ExcelFileTypes.RootRelsFile];
    };
    RootRelsExcelFolder.prototype.childFolders = function (data) {
        return [];
    };
    return RootRelsExcelFolder;
}());
export { RootRelsExcelFolder };
var DocPropsExcelFolder = (function () {
    function DocPropsExcelFolder() {
    }
    Object.defineProperty(DocPropsExcelFolder.prototype, "folderName", {
        get: function () {
            return "docProps";
        },
        enumerable: true,
        configurable: true
    });
    DocPropsExcelFolder.prototype.childFiles = function (data) {
        return [
            ExcelFileTypes.AppFile,
            ExcelFileTypes.CoreFile
        ];
    };
    DocPropsExcelFolder.prototype.childFolders = function (data) {
        return [];
    };
    return DocPropsExcelFolder;
}());
export { DocPropsExcelFolder };
var XLExcelFolder = (function () {
    function XLExcelFolder() {
    }
    Object.defineProperty(XLExcelFolder.prototype, "folderName", {
        get: function () {
            return "xl";
        },
        enumerable: true,
        configurable: true
    });
    XLExcelFolder.prototype.childFiles = function (data) {
        var retVal = [
            ExcelFileTypes.StyleFile,
            ExcelFileTypes.WorkbookFile
        ];
        if (!data.isEmpty) {
            retVal.push(ExcelFileTypes.SharedStringsFile);
        }
        return retVal;
    };
    XLExcelFolder.prototype.childFolders = function (data) {
        var retVal = [
            ExcelFolderTypes.XLRelsExcelFolder,
            ExcelFolderTypes.ThemeExcelFolder,
            ExcelFolderTypes.WorksheetsExcelFolder
        ];
        if (!data.isEmpty && data.options.exportAsTable) {
            retVal.push(ExcelFolderTypes.TablesExcelFolder);
        }
        return retVal;
    };
    return XLExcelFolder;
}());
export { XLExcelFolder };
var XLRelsExcelFolder = (function () {
    function XLRelsExcelFolder() {
    }
    Object.defineProperty(XLRelsExcelFolder.prototype, "folderName", {
        get: function () {
            return "_rels";
        },
        enumerable: true,
        configurable: true
    });
    XLRelsExcelFolder.prototype.childFiles = function (data) {
        return [ExcelFileTypes.WorkbookRelsFile];
    };
    XLRelsExcelFolder.prototype.childFolders = function (data) {
        return [];
    };
    return XLRelsExcelFolder;
}());
export { XLRelsExcelFolder };
var ThemeExcelFolder = (function () {
    function ThemeExcelFolder() {
    }
    Object.defineProperty(ThemeExcelFolder.prototype, "folderName", {
        get: function () {
            return "theme";
        },
        enumerable: true,
        configurable: true
    });
    ThemeExcelFolder.prototype.childFiles = function (data) {
        return [ExcelFileTypes.ThemeFile];
    };
    ThemeExcelFolder.prototype.childFolders = function (data) {
        return [];
    };
    return ThemeExcelFolder;
}());
export { ThemeExcelFolder };
var WorksheetsExcelFolder = (function () {
    function WorksheetsExcelFolder() {
    }
    Object.defineProperty(WorksheetsExcelFolder.prototype, "folderName", {
        get: function () {
            return "worksheets";
        },
        enumerable: true,
        configurable: true
    });
    WorksheetsExcelFolder.prototype.childFiles = function (data) {
        return [ExcelFileTypes.WorksheetFile];
    };
    WorksheetsExcelFolder.prototype.childFolders = function (data) {
        return data.isEmpty || !data.options.exportAsTable ? [] : [ExcelFolderTypes.WorksheetsRelsExcelFolder];
    };
    return WorksheetsExcelFolder;
}());
export { WorksheetsExcelFolder };
var TablesExcelFolder = (function () {
    function TablesExcelFolder() {
    }
    Object.defineProperty(TablesExcelFolder.prototype, "folderName", {
        get: function () {
            return "tables";
        },
        enumerable: true,
        configurable: true
    });
    TablesExcelFolder.prototype.childFiles = function (data) {
        return [ExcelFileTypes.TablesFile];
    };
    TablesExcelFolder.prototype.childFolders = function (data) {
        return [];
    };
    return TablesExcelFolder;
}());
export { TablesExcelFolder };
var WorksheetsRelsExcelFolder = (function () {
    function WorksheetsRelsExcelFolder() {
    }
    Object.defineProperty(WorksheetsRelsExcelFolder.prototype, "folderName", {
        get: function () {
            return "_rels";
        },
        enumerable: true,
        configurable: true
    });
    WorksheetsRelsExcelFolder.prototype.childFiles = function (data) {
        return [ExcelFileTypes.WorksheetRelsFile];
    };
    WorksheetsRelsExcelFolder.prototype.childFolders = function (data) {
        return [];
    };
    return WorksheetsRelsExcelFolder;
}());
export { WorksheetsRelsExcelFolder };
