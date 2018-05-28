import { ExportUtilities } from "../exporter-common/export-utilities";
var WorksheetDataDictionary = (function () {
    function WorksheetDataDictionary(columnCount, columnWidth) {
        this.hasNonStringValues = false;
        this._dictionary = {};
        this._widthsDictionary = {};
        this._counter = 0;
        this.dirtyKeyCollections();
        this._calculateColumnWidth = !columnWidth;
        this._columnWidths = new Array(columnCount);
        this._columnTypeInfo = new Array(columnCount);
        if (!this._calculateColumnWidth) {
            this._columnWidths.fill(columnWidth);
        }
        this.stringsCount = 0;
    }
    Object.defineProperty(WorksheetDataDictionary.prototype, "columnWidths", {
        get: function () {
            return this._columnWidths;
        },
        enumerable: true,
        configurable: true
    });
    WorksheetDataDictionary.prototype.saveValue = function (value, column, isHeader) {
        if (this._columnTypeInfo[column] === undefined && isHeader === false) {
            this._columnTypeInfo[column] = typeof value === "string" ||
                typeof value === "boolean" ||
                value instanceof Date;
        }
        var sanitizedValue = "";
        var isSavedAsString = this._columnTypeInfo[column] || isHeader;
        if (isSavedAsString) {
            sanitizedValue = this.sanitizeValue(value);
            if (this._dictionary[sanitizedValue] === undefined) {
                this._dictionary[sanitizedValue] = this._counter++;
                this.dirtyKeyCollections();
            }
            this.stringsCount++;
        }
        else {
            this.hasNonStringValues = true;
        }
        if (this._calculateColumnWidth) {
            var width = this.getTextWidth(value);
            var maxWidth = Math.max(this._columnWidths[column] || 0, width);
            this._columnWidths[column] = maxWidth;
        }
        return isSavedAsString ? this.getSanitizedValue(sanitizedValue) : -1;
    };
    WorksheetDataDictionary.prototype.getValue = function (value) {
        return this.getSanitizedValue(this.sanitizeValue(value));
    };
    WorksheetDataDictionary.prototype.getSanitizedValue = function (sanitizedValue) {
        return this._dictionary[sanitizedValue];
    };
    WorksheetDataDictionary.prototype.getKeys = function () {
        if (!this._keysAreValid) {
            this._keys = Object.keys(this._dictionary);
            this._keysAreValid = true;
        }
        return this._keys;
    };
    WorksheetDataDictionary.prototype.getTextWidth = function (value) {
        if (this._widthsDictionary[value] === undefined) {
            var context = this.getContext();
            var metrics = context.measureText(value);
            this._widthsDictionary[value] = metrics.width + WorksheetDataDictionary.TEXT_PADDING;
        }
        return this._widthsDictionary[value];
    };
    WorksheetDataDictionary.prototype.getContext = function () {
        if (!this._context) {
            var canvas = document.createElement("canvas");
            this._context = canvas.getContext("2d");
            this._context.font = WorksheetDataDictionary.DEFAULT_FONT;
        }
        return this._context;
    };
    WorksheetDataDictionary.prototype.sanitizeValue = function (value) {
        if (ExportUtilities.hasValue(value) === false) {
            return "";
        }
        else {
            var stringValue = String(value);
            return stringValue.replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&apos;");
        }
    };
    WorksheetDataDictionary.prototype.dirtyKeyCollections = function () {
        this._keysAreValid = false;
    };
    WorksheetDataDictionary.DEFAULT_FONT = "11pt Calibri";
    WorksheetDataDictionary.TEXT_PADDING = 5;
    return WorksheetDataDictionary;
}());
export { WorksheetDataDictionary };
