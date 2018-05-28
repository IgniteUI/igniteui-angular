import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { cloneArray } from "../core/utils";
import { SortingDirection } from "../data-operations/sorting-expression.interface";
var IgxGridAPIService = (function () {
    function IgxGridAPIService() {
        this.change = new Subject();
        this.state = new Map();
        this.summaryCacheMap = new Map();
    }
    IgxGridAPIService.prototype.register = function (grid) {
        this.state.set(grid.id, grid);
    };
    IgxGridAPIService.prototype.get = function (id) {
        return this.state.get(id);
    };
    IgxGridAPIService.prototype.get_column_by_name = function (id, name) {
        return this.get(id).columnList.find(function (col) { return col.field === name; });
    };
    IgxGridAPIService.prototype.set_summary_by_column_name = function (id, name) {
        if (!this.summaryCacheMap.get(id)) {
            this.summaryCacheMap.set(id, new Map());
        }
        var column = this.get_column_by_name(id, name);
        if (this.get(id).filteredData) {
            if (this.get(id).filteredData.length > 0) {
                this.calculateSummaries(id, column, this.get(id).filteredData.map(function (rec) { return rec[column.field]; }));
            }
            else {
                this.calculateSummaries(id, column, this.get(id).filteredData.map(function (rec) { return rec[column.field]; }));
            }
        }
        else {
            this.calculateSummaries(id, column, this.get(id).data.map(function (rec) { return rec[column.field]; }));
        }
    };
    IgxGridAPIService.prototype.get_summaries = function (id) {
        return this.summaryCacheMap.get(id);
    };
    IgxGridAPIService.prototype.remove_summary = function (id, name) {
        if (this.summaryCacheMap.has(id)) {
            if (!name) {
                this.summaryCacheMap.delete(id);
            }
            else {
                this.summaryCacheMap.get(id).delete(name);
            }
        }
    };
    IgxGridAPIService.prototype.get_row_by_key = function (id, rowSelector) {
        var primaryKey = this.get(id).primaryKey;
        if (primaryKey !== undefined && primaryKey !== null) {
            return this.get(id).dataRowList.find(function (row) { return row.rowData[primaryKey] === rowSelector; });
        }
        return this.get(id).rowList.find(function (row) { return row.index === rowSelector; });
    };
    IgxGridAPIService.prototype.get_row_by_index = function (id, rowIndex) {
        return this.get(id).rowList.find(function (row) { return row.index === rowIndex; });
    };
    IgxGridAPIService.prototype.get_cell_by_field = function (id, rowSelector, field) {
        var row = this.get_row_by_key(id, rowSelector);
        if (row && row.cells) {
            return row.cells.find(function (cell) { return cell.column.field === field; });
        }
    };
    IgxGridAPIService.prototype.notify = function (id) {
        this.get(id).eventBus.next(true);
    };
    IgxGridAPIService.prototype.get_cell_by_index = function (id, rowIndex, columnIndex) {
        var row = this.get_row_by_index(id, rowIndex);
        if (row && row.cells) {
            return row.cells.find(function (cell) { return cell.columnIndex === columnIndex; });
        }
    };
    IgxGridAPIService.prototype.get_cell_by_visible_index = function (id, rowIndex, columnIndex) {
        var row = this.get_row_by_index(id, rowIndex);
        if (row && row.cells) {
            return row.cells.find(function (cell) { return cell.visibleColumnIndex === columnIndex; });
        }
    };
    IgxGridAPIService.prototype.update = function (id, cell) {
        var index = this.get(id).data.indexOf(cell.row.rowData);
        this.get(id).data[index][cell.column.field] = cell.value;
    };
    IgxGridAPIService.prototype.update_row = function (value, id, row) {
        var index = this.get(id).data.indexOf(row.rowData);
        var args = { row: row, cell: null, currentValue: this.get(id).data[index], newValue: value };
        this.get(id).onEditDone.emit(args);
        this.get(id).data[index] = args.newValue;
    };
    IgxGridAPIService.prototype.sort = function (id, fieldName, dir, ignoreCase) {
        if (dir === SortingDirection.None) {
            this.remove_grouping_expression(id, fieldName);
        }
        var sortingState = cloneArray(this.get(id).sortingExpressions, true);
        this.prepare_sorting_expression(sortingState, fieldName, dir, ignoreCase);
        this.get(id).sortingExpressions = sortingState;
    };
    IgxGridAPIService.prototype.sort_multiple = function (id, expressions) {
        var sortingState = cloneArray(this.get(id).sortingExpressions, true);
        for (var _i = 0, expressions_1 = expressions; _i < expressions_1.length; _i++) {
            var each = expressions_1[_i];
            if (each.dir === SortingDirection.None) {
                this.remove_grouping_expression(id, each.fieldName);
            }
            this.prepare_sorting_expression(sortingState, each.fieldName, each.dir, each.ignoreCase);
        }
        this.get(id).sortingExpressions = sortingState;
    };
    IgxGridAPIService.prototype.groupBy = function (id, fieldName, dir, ignoreCase) {
        var groupingState = this.get(id).groupingExpressions;
        this.prepare_sorting_expression(groupingState, fieldName, dir, ignoreCase);
        this.get(id).groupingExpressions = groupingState;
        this.sort(id, fieldName, dir, ignoreCase);
        this.arrange_sorting_expressions(id);
    };
    IgxGridAPIService.prototype.groupBy_multiple = function (id, expressions) {
        var groupingState = this.get(id).groupingExpressions;
        for (var _i = 0, expressions_2 = expressions; _i < expressions_2.length; _i++) {
            var each = expressions_2[_i];
            this.prepare_sorting_expression(groupingState, each.fieldName, each.dir, each.ignoreCase);
        }
        this.get(id).groupingExpressions = groupingState;
        this.sort_multiple(id, expressions);
        this.arrange_sorting_expressions(id);
    };
    IgxGridAPIService.prototype.groupBy_get_expanded_for_group = function (id, groupRow) {
        var grState = this.get(id).groupingExpansionState;
        return grState.find(function (state) {
            return state.fieldName === groupRow.expression.fieldName && state.value === groupRow.value;
        });
    };
    IgxGridAPIService.prototype.groupBy_toggle_group = function (id, groupRow) {
        var grid = this.get(id);
        var expansionState = grid.groupingExpansionState;
        var state = this.groupBy_get_expanded_for_group(id, groupRow);
        if (state) {
            state.expanded = !state.expanded;
        }
        else {
            expansionState.push({
                expanded: !grid.groupByDefaultExpanded,
                value: groupRow.value,
                fieldName: groupRow.expression.fieldName
            });
        }
        this.get(id).groupingExpansionState = expansionState;
    };
    IgxGridAPIService.prototype.filter = function (id, fieldName, term, condition, ignoreCase) {
        var filteringState = this.get(id).filteringExpressions;
        if (this.get(id).paging) {
            this.get(id).page = 0;
        }
        this.prepare_filtering_expression(filteringState, fieldName, term, condition, ignoreCase);
        this.get(id).filteringExpressions = filteringState;
    };
    IgxGridAPIService.prototype.filter_multiple = function (id, expressions) {
        var filteringState = this.get(id).filteringExpressions;
        if (this.get(id).paging) {
            this.get(id).page = 0;
        }
        for (var _i = 0, expressions_3 = expressions; _i < expressions_3.length; _i++) {
            var each = expressions_3[_i];
            this.prepare_filtering_expression(filteringState, each.fieldName, each.searchVal, each.condition, each.ignoreCase);
        }
        this.get(id).filteringExpressions = filteringState;
    };
    IgxGridAPIService.prototype.filter_global = function (id, term, condition, ignoreCase) {
        var filteringState = this.get(id).filteringExpressions;
        if (this.get(id).paging) {
            this.get(id).page = 0;
        }
        for (var _i = 0, _a = this.get(id).columns; _i < _a.length; _i++) {
            var column = _a[_i];
            this.prepare_filtering_expression(filteringState, column.field, term, condition || column.filteringCondition, ignoreCase || column.filteringIgnoreCase);
        }
        this.get(id).filteringExpressions = filteringState;
    };
    IgxGridAPIService.prototype.clear_filter = function (id, fieldName) {
        var filteringState = this.get(id).filteringExpressions;
        var index = filteringState.findIndex(function (expr) { return expr.fieldName === fieldName; });
        if (index > -1) {
            filteringState.splice(index, 1);
            this.get(id).filteringExpressions = filteringState;
        }
        this.get(id).filteredData = null;
    };
    IgxGridAPIService.prototype.calculateSummaries = function (id, column, data) {
        if (!this.summaryCacheMap.get(id).get(column.field)) {
            this.summaryCacheMap.get(id).set(column.field, column.summaries.operate(data));
        }
    };
    IgxGridAPIService.prototype.clear_sort = function (id, fieldName) {
        var sortingState = this.get(id).sortingExpressions;
        var index = sortingState.findIndex(function (expr) { return expr.fieldName === fieldName; });
        if (index > -1) {
            sortingState.splice(index, 1);
            this.get(id).sortingExpressions = sortingState;
        }
    };
    IgxGridAPIService.prototype.prepare_filtering_expression = function (state, fieldName, searchVal, condition, ignoreCase) {
        var expression = state.find(function (expr) { return expr.fieldName === fieldName; });
        var newExpression = { fieldName: fieldName, searchVal: searchVal, condition: condition, ignoreCase: ignoreCase };
        if (!expression) {
            state.push(newExpression);
        }
        else {
            Object.assign(expression, newExpression);
        }
    };
    IgxGridAPIService.prototype.prepare_sorting_expression = function (state, fieldName, dir, ignoreCase) {
        if (dir === SortingDirection.None) {
            state.splice(state.findIndex(function (expr) { return expr.fieldName === fieldName; }), 1);
            return;
        }
        var expression = state.find(function (expr) { return expr.fieldName === fieldName; });
        if (!expression) {
            state.push({ fieldName: fieldName, dir: dir, ignoreCase: ignoreCase });
        }
        else {
            Object.assign(expression, { fieldName: fieldName, dir: dir, ignoreCase: ignoreCase });
        }
    };
    IgxGridAPIService.prototype.arrange_sorting_expressions = function (id) {
        var groupingState = this.get(id).groupingExpressions;
        this.get(id).sortingExpressions.sort(function (a, b) {
            var groupExprA = groupingState.find(function (expr) { return expr.fieldName === a.fieldName; });
            var groupExprB = groupingState.find(function (expr) { return expr.fieldName === b.fieldName; });
            if (groupExprA && groupExprB) {
                return groupingState.indexOf(groupExprA) > groupingState.indexOf(groupExprB) ? 1 : -1;
            }
            else if (groupExprA) {
                return -1;
            }
            else if (groupExprB) {
                return 1;
            }
            else {
                return 0;
            }
        });
    };
    IgxGridAPIService.prototype.remove_grouping_expression = function (id, fieldName) {
        var groupingExpressions = this.get(id).groupingExpressions;
        var index = groupingExpressions.findIndex(function (expr) { return expr.fieldName === fieldName; });
        if (index !== -1) {
            groupingExpressions.splice(index, 1);
        }
    };
    IgxGridAPIService.decorators = [
        { type: Injectable },
    ];
    return IgxGridAPIService;
}());
export { IgxGridAPIService };
