import { FilteringCondition } from "./filtering-condition";
import { filteringStateDefaults } from "./filtering-state.interface";
import { SortingStateDefaults } from "./sorting-state.interface";
import { PagingError } from "./paging-state.interface";
export var DataType;
(function (DataType) {
    DataType["String"] = "string";
    DataType["Number"] = "number";
    DataType["Boolean"] = "boolean";
    DataType["Date"] = "date";
})(DataType || (DataType = {}));
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
        return FilteringCondition[dataType];
    };
    DataUtil.getListOfFilteringConditionsForDataType = function (dataType) {
        return Object.keys(DataUtil.getFilteringConditionsForDataType(dataType));
    };
    DataUtil.sort = function (data, state) {
        DataUtil.mergeDefaultProperties(state, SortingStateDefaults);
        return state.strategy.sort(data, state.expressions);
    };
    DataUtil.group = function (data, state) {
        DataUtil.mergeDefaultProperties(state, SortingStateDefaults);
        return state.strategy.groupBy(data, state.expressions);
    };
    DataUtil.restoreGroups = function (data, state) {
        DataUtil.mergeDefaultProperties(state, SortingStateDefaults);
        if (state.expressions.length === 0) {
            return data;
        }
        return this.restoreGroupsRecursive(data, 1, state.expressions.length, state.expansion, state.defaultExpanded);
    };
    DataUtil.restoreGroupsRecursive = function (data, level, depth, expansion, defaultExpanded) {
        var i = 0;
        var j;
        var result = [];
        if (level !== depth) {
            data = this.restoreGroupsRecursive(data, level + 1, depth, expansion, defaultExpanded);
        }
        var _loop_1 = function () {
            var g = data[i]["__groupParent"];
            for (j = i + 1; j < data.length; j++) {
                var h = data[j]["__groupParent"];
                if (g !== h && g.level === h.level) {
                    break;
                }
            }
            var expandState = expansion.find(function (state) {
                return state.fieldName === g.expression.fieldName && state.value === g.value;
            });
            var expanded = expandState ? expandState.expanded : defaultExpanded;
            result.push(g);
            if (expanded) {
                result = result.concat(data.slice(i, j));
            }
            i = j;
        };
        while (i < data.length) {
            _loop_1();
        }
        return result;
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
            error: PagingError.None
        };
        if (index < 0 || isNaN(index)) {
            state.metadata.error = PagingError.IncorrectPageIndex;
            return res;
        }
        if (recordsPerPage <= 0 || isNaN(recordsPerPage)) {
            state.metadata.error = PagingError.IncorrectRecordsPerPage;
            return res;
        }
        state.metadata.countPages = Math.ceil(len / recordsPerPage);
        if (!len) {
            return data;
        }
        if (index >= state.metadata.countPages) {
            state.metadata.error = PagingError.IncorrectPageIndex;
            return res;
        }
        return data.slice(index * recordsPerPage, (index + 1) * recordsPerPage);
    };
    DataUtil.filter = function (data, state) {
        DataUtil.mergeDefaultProperties(state, filteringStateDefaults);
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
export { DataUtil };
