import { ExportUtilities } from "../exporter-common/export-utilities";
import { WorksheetDataDictionary } from "./worksheet-data-dictionary";
var WorksheetData = (function () {
    function WorksheetData(_data, options, indexOfLastPinnedColumn, sort) {
        this._data = _data;
        this.options = options;
        this.indexOfLastPinnedColumn = indexOfLastPinnedColumn;
        this.sort = sort;
        this.initializeData();
    }
    Object.defineProperty(WorksheetData.prototype, "data", {
        get: function () {
            return this._data;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WorksheetData.prototype, "columnCount", {
        get: function () {
            return this._columnCount;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WorksheetData.prototype, "rowCount", {
        get: function () {
            return this._rowCount;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WorksheetData.prototype, "isEmpty", {
        get: function () {
            return !this.rowCount || !this._columnCount;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WorksheetData.prototype, "keys", {
        get: function () {
            return this._keys;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WorksheetData.prototype, "isSpecialData", {
        get: function () {
            return this._isSpecialData;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WorksheetData.prototype, "dataDictionary", {
        get: function () {
            return this._dataDictionary;
        },
        enumerable: true,
        configurable: true
    });
    WorksheetData.prototype.initializeData = function () {
        if (!this._data || this._data.length === 0) {
            return;
        }
        this._keys = ExportUtilities.getKeysFromData(this._data);
        if (this._keys.length === 0) {
            return;
        }
        this._isSpecialData = ExportUtilities.isSpecialData(this._data);
        this._columnCount = this._keys.length;
        this._rowCount = this._data.length + 1;
        this._dataDictionary = new WorksheetDataDictionary(this._columnCount, this.options.columnWidth);
    };
    return WorksheetData;
}());
export { WorksheetData };
