import { EventEmitter, Output } from "@angular/core";
import { cloneObject } from "../../core/utils";
import { DataUtil } from "../../data-operations/data-util";
import { ExportUtilities } from "./export-utilities";
var IgxBaseExporter = (function () {
    function IgxBaseExporter() {
        this._indexOfLastPinnedColumn = -1;
        this._sort = null;
        this.onRowExport = new EventEmitter();
        this.onColumnExport = new EventEmitter();
    }
    IgxBaseExporter.prototype.export = function (grid, options) {
        var _this = this;
        if (options === undefined || options === null) {
            throw Error("No options provided!");
        }
        var columns = grid.columnList.toArray();
        this._columnList = new Array(columns.length);
        var hiddenColumns = [];
        var lastVisbleColumnIndex = -1;
        columns.forEach(function (column) {
            var columnHeader = column.header !== "" ? column.header : column.field;
            var exportColumn = !column.hidden || options.ignoreColumnsVisibility;
            var index = options.ignoreColumnsOrder ? column.index : column.visibleIndex;
            var columnInfo = {
                header: columnHeader,
                field: column.field,
                skip: !exportColumn,
                formatter: column.formatter
            };
            if (index !== -1) {
                _this._columnList[index] = columnInfo;
                lastVisbleColumnIndex = Math.max(lastVisbleColumnIndex, index);
            }
            else {
                hiddenColumns.push(columnInfo);
            }
            if (column.pinned && exportColumn) {
                _this._indexOfLastPinnedColumn = index;
            }
        });
        hiddenColumns.forEach(function (hiddenColumn) {
            _this._columnList[++lastVisbleColumnIndex] = hiddenColumn;
        });
        var data = this.prepareData(grid, options);
        this.exportData(data, options);
    };
    IgxBaseExporter.prototype.exportData = function (data, options) {
        var _this = this;
        if (options === undefined || options === null) {
            throw Error("No options provided!");
        }
        if (!this._columnList || this._columnList.length === 0) {
            var keys = ExportUtilities.getKeysFromData(data);
            this._columnList = keys.map(function (k) { return ({ header: k, field: k, skip: false }); });
        }
        var skippedPinnedColumnsCount = 0;
        this._columnList.forEach(function (column, index) {
            if (!column.skip) {
                var columnExportArgs = {
                    header: column.header,
                    columnIndex: index,
                    cancel: false
                };
                _this.onColumnExport.emit(columnExportArgs);
                column.header = columnExportArgs.header;
                column.skip = columnExportArgs.cancel;
                if (column.skip && index <= _this._indexOfLastPinnedColumn) {
                    skippedPinnedColumnsCount++;
                }
                if (_this._sort && _this._sort.fieldName === column.field) {
                    if (column.skip) {
                        _this._sort = null;
                    }
                    else {
                        _this._sort.fieldName = column.header;
                    }
                }
            }
        });
        this._indexOfLastPinnedColumn -= skippedPinnedColumnsCount;
        var dataToExport = new Array();
        var isSpecialData = ExportUtilities.isSpecialData(data);
        data.forEach(function (row, index) {
            _this.exportRow(dataToExport, row, index, isSpecialData);
        });
        this.exportDataImplementation(dataToExport, options);
        this.resetDefaults();
    };
    IgxBaseExporter.prototype.exportRow = function (data, rowData, index, isSpecialData) {
        var row;
        if (!isSpecialData) {
            row = this._columnList.reduce(function (a, e) {
                if (!e.skip) {
                    var rawValue = rowData[e.field];
                    a[e.header] = e.formatter ? e.formatter(rawValue) : rawValue;
                }
                return a;
            }, {});
        }
        else {
            row = rowData;
        }
        var rowArgs = {
            rowData: row,
            rowIndex: index,
            cancel: false
        };
        this.onRowExport.emit(rowArgs);
        if (!rowArgs.cancel) {
            data.push(rowArgs.rowData);
        }
    };
    IgxBaseExporter.prototype.prepareData = function (grid, options) {
        var data = grid.data;
        if (grid.filteringExpressions &&
            grid.filteringExpressions.length > 0 &&
            !options.ignoreFiltering) {
            var filteringState = {
                expressions: grid.filteringExpressions,
                logic: grid.filteringLogic
            };
            data = DataUtil.filter(data, filteringState);
        }
        if (grid.sortingExpressions &&
            grid.sortingExpressions.length > 0 &&
            !options.ignoreSorting) {
            var sortingState = {
                expressions: grid.sortingExpressions
            };
            this._sort = cloneObject(grid.sortingExpressions[0]);
            data = DataUtil.sort(data, sortingState);
        }
        return data;
    };
    IgxBaseExporter.prototype.resetDefaults = function () {
        this._columnList = [];
        this._indexOfLastPinnedColumn = -1;
        this._sort = null;
    };
    IgxBaseExporter.propDecorators = {
        "onRowExport": [{ type: Output },],
        "onColumnExport": [{ type: Output },],
    };
    return IgxBaseExporter;
}());
export { IgxBaseExporter };
