"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var data_util_1 = require("./data-util");
var DataAccess;
(function (DataAccess) {
    DataAccess[DataAccess["OriginalData"] = 0] = "OriginalData";
    DataAccess[DataAccess["TransformedData"] = 1] = "TransformedData";
})(DataAccess = exports.DataAccess || (exports.DataAccess = {}));
var DataContainer = (function () {
    function DataContainer(data) {
        if (data === void 0) { data = []; }
        this.state = {};
        this.data = data;
        this.transformedData = data;
    }
    DataContainer.prototype.process = function (state) {
        if (state) {
            this.state = state;
        }
        this.transformedData = this.data;
        // apply data operations
        this.transformedData = data_util_1.DataUtil.process(this.data, this.state);
        return this;
    };
    // CRUD operations
    // access data records
    DataContainer.prototype.getIndexOfRecord = function (record, dataAccess) {
        if (dataAccess === void 0) { dataAccess = DataAccess.OriginalData; }
        var data = this.accessData(dataAccess);
        return data.indexOf(record);
    };
    DataContainer.prototype.getRecordByIndex = function (index, dataAccess) {
        if (dataAccess === void 0) { dataAccess = DataAccess.OriginalData; }
        var data = this.accessData(dataAccess);
        return data[index];
    };
    DataContainer.prototype.getRecordInfoByKeyValue = function (fieldName, value, dataAccess) {
        if (dataAccess === void 0) { dataAccess = DataAccess.OriginalData; }
        var data = this.accessData(dataAccess);
        var len = data.length;
        var res = { index: -1, record: undefined };
        var i;
        for (i = 0; i < len; i++) {
            if (data[i][fieldName] === value) {
                res.index = i;
                res.record = data[i];
                break;
            }
        }
        return res;
    };
    DataContainer.prototype.addRecord = function (record, at) {
        var data = this.accessData(DataAccess.OriginalData);
        if (at === null || at === undefined) {
            data.push(record);
        }
        else {
            data.splice(at, 0, record);
        }
    };
    DataContainer.prototype.deleteRecord = function (record) {
        var index = this.getIndexOfRecord(record, DataAccess.OriginalData);
        return this.deleteRecordByIndex(index);
    };
    DataContainer.prototype.deleteRecordByIndex = function (index) {
        var data = this.accessData(DataAccess.OriginalData);
        return data.splice(index, 1).length === 1;
    };
    DataContainer.prototype.updateRecordByIndex = function (index, newProperties) {
        var dataAccess = DataAccess.OriginalData;
        var foundRec = this.getRecordByIndex(index, dataAccess);
        if (!foundRec) {
            return undefined;
        }
        return Object.assign(foundRec, newProperties);
    };
    DataContainer.prototype.accessData = function (dataAccess) {
        var res;
        switch (dataAccess) {
            case DataAccess.OriginalData:
                res = this.data;
                break;
            case DataAccess.TransformedData:
                res = this.transformedData;
                break;
        }
        return res;
    };
    return DataContainer;
}());
exports.DataContainer = DataContainer;

//# sourceMappingURL=data-container.js.map
