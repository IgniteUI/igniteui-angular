import { Pipe } from "@angular/core";
import { cloneArray } from "../core/utils";
import { DataUtil } from "../data-operations/data-util";
import { IgxGridAPIService } from "./api.service";
var IgxGridSortingPipe = (function () {
    function IgxGridSortingPipe(gridAPI) {
        this.gridAPI = gridAPI;
    }
    IgxGridSortingPipe.prototype.transform = function (collection, expressions, id, pipeTrigger) {
        var state = { expressions: [] };
        state.expressions = this.gridAPI.get(id).sortingExpressions;
        if (!state.expressions.length) {
            return collection;
        }
        return DataUtil.sort(cloneArray(collection), state);
    };
    IgxGridSortingPipe.decorators = [
        { type: Pipe, args: [{
                    name: "gridSort",
                    pure: true
                },] },
    ];
    IgxGridSortingPipe.ctorParameters = function () { return [
        { type: IgxGridAPIService, },
    ]; };
    return IgxGridSortingPipe;
}());
export { IgxGridSortingPipe };
var IgxGridPreGroupingPipe = (function () {
    function IgxGridPreGroupingPipe(gridAPI) {
        this.gridAPI = gridAPI;
    }
    IgxGridPreGroupingPipe.prototype.transform = function (collection, expression, expansion, defaultExpanded, id, pipeTrigger) {
        var state = { expressions: [], expansion: [], defaultExpanded: defaultExpanded };
        var grid = this.gridAPI.get(id);
        state.expressions = grid.groupingExpressions;
        if (!state.expressions.length) {
            return collection;
        }
        state.expansion = grid.groupingExpansionState;
        state.defaultExpanded = grid.groupByDefaultExpanded;
        return DataUtil.group(cloneArray(collection), state);
    };
    IgxGridPreGroupingPipe.decorators = [
        { type: Pipe, args: [{
                    name: "gridPreGroupBy",
                    pure: true
                },] },
    ];
    IgxGridPreGroupingPipe.ctorParameters = function () { return [
        { type: IgxGridAPIService, },
    ]; };
    return IgxGridPreGroupingPipe;
}());
export { IgxGridPreGroupingPipe };
var IgxGridPostGroupingPipe = (function () {
    function IgxGridPostGroupingPipe(gridAPI) {
        this.gridAPI = gridAPI;
    }
    IgxGridPostGroupingPipe.prototype.transform = function (collection, expression, expansion, defaultExpanded, id, pipeTrigger) {
        var state = { expressions: [], expansion: [], defaultExpanded: defaultExpanded };
        var grid = this.gridAPI.get(id);
        state.expressions = grid.groupingExpressions;
        if (!state.expressions.length) {
            return collection;
        }
        state.expansion = grid.groupingExpansionState;
        state.defaultExpanded = grid.groupByDefaultExpanded;
        return DataUtil.restoreGroups(cloneArray(collection), state);
    };
    IgxGridPostGroupingPipe.decorators = [
        { type: Pipe, args: [{
                    name: "gridPostGroupBy",
                    pure: true
                },] },
    ];
    IgxGridPostGroupingPipe.ctorParameters = function () { return [
        { type: IgxGridAPIService, },
    ]; };
    return IgxGridPostGroupingPipe;
}());
export { IgxGridPostGroupingPipe };
var IgxGridPagingPipe = (function () {
    function IgxGridPagingPipe(gridAPI) {
        this.gridAPI = gridAPI;
    }
    IgxGridPagingPipe.prototype.transform = function (collection, page, perPage, id, pipeTrigger) {
        if (page === void 0) { page = 0; }
        if (perPage === void 0) { perPage = 15; }
        if (!this.gridAPI.get(id).paging) {
            return collection;
        }
        var state = {
            index: page,
            recordsPerPage: perPage
        };
        var result = DataUtil.page(cloneArray(collection), state);
        this.gridAPI.get(id).pagingState = state;
        return result;
    };
    IgxGridPagingPipe.decorators = [
        { type: Pipe, args: [{
                    name: "gridPaging",
                    pure: true
                },] },
    ];
    IgxGridPagingPipe.ctorParameters = function () { return [
        { type: IgxGridAPIService, },
    ]; };
    return IgxGridPagingPipe;
}());
export { IgxGridPagingPipe };
var IgxGridFilteringPipe = (function () {
    function IgxGridFilteringPipe(gridAPI) {
        this.gridAPI = gridAPI;
    }
    IgxGridFilteringPipe.prototype.transform = function (collection, expressions, logic, id, pipeTrigger) {
        var state = { expressions: [], logic: logic };
        state.expressions = this.gridAPI.get(id).filteringExpressions;
        if (!state.expressions.length) {
            return collection;
        }
        var result = DataUtil.filter(cloneArray(collection), state);
        this.gridAPI.get(id).filteredData = result;
        return result;
    };
    IgxGridFilteringPipe.decorators = [
        { type: Pipe, args: [{
                    name: "gridFiltering",
                    pure: true
                },] },
    ];
    IgxGridFilteringPipe.ctorParameters = function () { return [
        { type: IgxGridAPIService, },
    ]; };
    return IgxGridFilteringPipe;
}());
export { IgxGridFilteringPipe };
var IgxGridFilterConditionPipe = (function () {
    function IgxGridFilterConditionPipe() {
    }
    IgxGridFilterConditionPipe.prototype.transform = function (value) {
        return value.split(/(?=[A-Z])/).join(" ");
    };
    IgxGridFilterConditionPipe.decorators = [
        { type: Pipe, args: [{
                    name: "filterCondition",
                    pure: true
                },] },
    ];
    return IgxGridFilterConditionPipe;
}());
export { IgxGridFilterConditionPipe };
