import { ExportUtilities } from "../exporter-common/export-utilities";
var CharSeparatedValueData = (function () {
    function CharSeparatedValueData(_data, valueDelimiter) {
        this._data = _data;
        this._headerRecord = "";
        this._dataRecords = "";
        this._eor = "\r\n";
        this._escapeCharacters = ["\r", "\n", "\r\n"];
        this._delimiterLength = 1;
        this._isSpecialData = false;
        this.setDelimiter(valueDelimiter);
    }
    CharSeparatedValueData.prototype.prepareData = function () {
        if (!this._data || this._data.length === 0) {
            return "";
        }
        var keys = ExportUtilities.getKeysFromData(this._data);
        if (keys.length === 0) {
            return "";
        }
        this._isSpecialData = ExportUtilities.isSpecialData(this._data);
        this._escapeCharacters.push(this._delimiter);
        this._headerRecord = this.processHeaderRecord(keys, this._escapeCharacters);
        this._dataRecords = this.processDataRecords(this._data, keys, this._escapeCharacters);
        return this._headerRecord + this._dataRecords;
    };
    CharSeparatedValueData.prototype.processField = function (value, escapeChars) {
        var safeValue = ExportUtilities.hasValue(value) ? String(value) : "";
        if (escapeChars.some(function (v) { return safeValue.includes(v); })) {
            safeValue = "\"" + safeValue + "\"";
        }
        return safeValue + this._delimiter;
    };
    CharSeparatedValueData.prototype.processHeaderRecord = function (keys, escapeChars) {
        var recordData = "";
        for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
            var keyName = keys_1[_i];
            recordData += this.processField(keyName, this._escapeCharacters);
        }
        return recordData.slice(0, -this._delimiterLength) + this._eor;
    };
    CharSeparatedValueData.prototype.processRecord = function (record, keys, escapeChars) {
        var recordData = "";
        for (var _i = 0, keys_2 = keys; _i < keys_2.length; _i++) {
            var keyName = keys_2[_i];
            var value = (record[keyName] !== undefined) ? record[keyName] : this._isSpecialData ? record : "";
            recordData += this.processField(value, this._escapeCharacters);
        }
        return recordData.slice(0, -this._delimiterLength) + this._eor;
    };
    CharSeparatedValueData.prototype.processDataRecords = function (currentData, keys, escapeChars) {
        var dataRecords = "";
        for (var _i = 0, currentData_1 = currentData; _i < currentData_1.length; _i++) {
            var row = currentData_1[_i];
            dataRecords += this.processRecord(row, keys, escapeChars);
        }
        return dataRecords;
    };
    CharSeparatedValueData.prototype.setDelimiter = function (value) {
        this._delimiter = value;
        this._delimiterLength = value.length;
    };
    return CharSeparatedValueData;
}());
export { CharSeparatedValueData };
