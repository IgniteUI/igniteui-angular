"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var data_util_1 = require("../data-util");
var COUNT_ROWS = 5;
var COUNT_COLS = 4;
var DataGenerator = (function () {
    function DataGenerator(countRows, countCols) {
        if (countRows === void 0) { countRows = COUNT_ROWS; }
        if (countCols === void 0) { countCols = COUNT_COLS; }
        this.columns = [];
        this.data = [];
        this.columns = this.generateColumns(countCols);
        this.data = this.generateData(countRows);
    }
    DataGenerator.prototype.generateArray = function (startValue, endValue) {
        var len = Math.abs(startValue - endValue);
        var decrement = startValue > endValue;
        return Array.from({ length: len + 1 }, function (e, i) { return decrement ? startValue - i : startValue + i; });
    };
    DataGenerator.prototype.getValuesForColumn = function (data, fieldName) {
        return data.map(function (x) { return x[fieldName]; });
    };
    DataGenerator.prototype.isSuperset = function (haystack, arr) {
        return arr.every(function (val) { return haystack.indexOf(val) >= 0; });
    };
    DataGenerator.prototype.generateColumns = function (countCols) {
        var i;
        var len;
        var res;
        var defaultColumns = [
            {
                fieldName: "number",
                type: data_util_1.DataType.Number
            },
            {
                fieldName: "string",
                type: data_util_1.DataType.String
            },
            {
                fieldName: "date",
                type: data_util_1.DataType.Date
            },
            {
                fieldName: "boolean",
                type: data_util_1.DataType.Boolean
            }
        ];
        if (countCols <= 0) {
            return defaultColumns;
        }
        if (countCols <= defaultColumns.length) {
            return defaultColumns.slice(0, countCols);
        }
        len = countCols - defaultColumns.length;
        res = defaultColumns;
        for (i = 0; i < len; i++) {
            res.push({
                fieldName: "col" + i,
                type: data_util_1.DataType.String
            });
        }
        return res;
    };
    DataGenerator.prototype.generateData = function (countRows) {
        var i;
        var j;
        var rec;
        var val;
        var col;
        var data = [];
        for (i = 0; i < countRows; i++) {
            rec = {};
            for (j = 0; j < this.columns.length; j++) {
                col = this.columns[j];
                switch (col.type) {
                    case data_util_1.DataType.Number:
                        val = i;
                        break;
                    case data_util_1.DataType.Date:
                        val = new Date(Date.now() + i * 24 * 60 * 60 * 1000);
                        break;
                    case data_util_1.DataType.Boolean:
                        val = !!(i % 2);
                        break;
                    default:
                        val = "row" + i + ", col" + j;
                        break;
                }
                rec[col.fieldName] = val;
            }
            data.push(rec);
        }
        return data;
    };
    return DataGenerator;
}());
exports.DataGenerator = DataGenerator;

//# sourceMappingURL=data-generator.js.map
