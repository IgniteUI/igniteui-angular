"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var filtering_condition_1 = require("./filtering-condition");
var filtering_state_interface_1 = require("./filtering-state.interface");
var sorting_state_interface_1 = require("./sorting-state.interface");
var paging_state_interface_1 = require("./paging-state.interface");
var DataType;
(function (DataType) {
    DataType[DataType["String"] = 0] = "String";
    DataType[DataType["Number"] = 1] = "Number";
    DataType[DataType["Boolean"] = 2] = "Boolean";
    DataType[DataType["Date"] = 3] = "Date";
})(DataType = exports.DataType || (exports.DataType = {}));
var DataUtil = (function () {
    function DataUtil() {
    }
    DataUtil.mergeDefaultProperties = function (target, defaults) {
        if (!defaults) {
            return target;
        }
        if (!target) {
            target = Object.assign({}, defaults);
            return target;
        }
        Object
            .keys(defaults)
            .forEach(function (key) {
            if (target[key] === undefined && defaults[key] !== undefined) {
                target[key] = defaults[key];
            }
        });
        return target;
    };
    DataUtil.getFilteringConditionsForDataType = function (dataType) {
        var dt;
        switch (dataType) {
            case DataType.String:
                dt = "string";
                break;
            case DataType.Number:
                dt = "number";
                break;
            case DataType.Boolean:
                dt = "boolean";
                break;
            case DataType.Date:
                dt = "date";
                break;
        }
        return filtering_condition_1.FilteringCondition[dt];
    };
    DataUtil.getListOfFilteringConditionsForDataType = function (dataType) {
        return Object.keys(DataUtil.getFilteringConditionsForDataType(dataType));
    };
    DataUtil.sort = function (data, state) {
        // set defaults
        DataUtil.mergeDefaultProperties(state, sorting_state_interface_1.SortingStateDefaults);
        // apply default settings for each sorting expression(if not set)
        return state.strategy.sort(data, state.expressions);
    };
    DataUtil.page = function (data, state) {
        if (!state) {
            return data;
        }
        var len = data.length;
        var index = state.index;
        var res = [];
        var recordsPerPage = state.recordsPerPage;
        state.metadata = {
            countPages: 0,
            countRecords: data.length,
            error: paging_state_interface_1.PagingError.None
        };
        if (index < 0 || isNaN(index)) {
            state.metadata.error = paging_state_interface_1.PagingError.IncorrectPageIndex;
            return res;
        }
        if (recordsPerPage <= 0 || isNaN(recordsPerPage)) {
            state.metadata.error = paging_state_interface_1.PagingError.IncorrectRecordsPerPage;
            return res;
        }
        state.metadata.countPages = Math.ceil(len / recordsPerPage);
        if (!len) {
            return data;
        }
        if (index >= state.metadata.countPages) {
            state.metadata.error = paging_state_interface_1.PagingError.IncorrectPageIndex;
            return res;
        }
        return data.slice(index * recordsPerPage, (index + 1) * recordsPerPage);
    };
    DataUtil.filter = function (data, state) {
        // set defaults
        DataUtil.mergeDefaultProperties(state, filtering_state_interface_1.filteringStateDefaults);
        if (!state.strategy) {
            return data;
        }
        return state.strategy.filter(data, state.expressions, state.logic);
    };
    DataUtil.process = function (data, state) {
        if (!state) {
            return data;
        }
        if (state.filtering) {
            data = DataUtil.filter(data, state.filtering);
        }
        if (state.sorting) {
            data = DataUtil.sort(data, state.sorting);
        }
        if (state.paging) {
            data = DataUtil.page(data, state.paging);
        }
        return data;
    };
    return DataUtil;
}());
exports.DataUtil = DataUtil;

//# sourceMappingURL=data-util.js.map
