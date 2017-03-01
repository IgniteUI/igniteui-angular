import { FilteringExpression, FilteringLogic } from "./filtering-expression.interface";
import { FilteringCondition } from "./filtering-condition";
import { FilteringState, filteringStateDefaults } from "./filtering-state.interface";
import { IFilteringStrategy, FilteringStrategy } from "./filtering-strategy";

import { SortingExpression, SortingDirection } from "./sorting-expression.interface";
import {SortingStateDefaults, SortingState} from "./sorting-state.interface";
import {SortingStrategy, ISortingStrategy} from "./sorting-strategy";

import {PagingState, PagingError} from "./paging-state.interface";

import {DataState} from "./data-state.interface";

export class DataUtil {
    static mergeDefaultProperties(target: Object, defaults: Object) {
        if (!defaults) {
            return target;
        }
        if (!target) {
            target = Object.assign({}, defaults);
            return target;
        }
        Object
            .keys(defaults)
            .forEach(function(key) { 
                if (target[key] === undefined && defaults[key] !== undefined) {
                    target[key] = defaults[key];
                }
            });
        return target;
    }
    static getFilteringConditionsByDataType(dataType: "string" | "number" | "boolean" | "date"| string): Array<string> {
        var conditions = FilteringCondition[dataType];
        if (!conditions) {
            return undefined;
        }
        return Object.keys(conditions);
    }
    static sort<T> (data: T[], state: SortingState): T[] {
        if (!state || !state.expressions) {
            return data;
        }
        // set defaults
        state.expressionDefaults = DataUtil.mergeDefaultProperties(state.expressionDefaults, 
                                        SortingStateDefaults.expressionDefaults);
        DataUtil.mergeDefaultProperties(state, SortingStateDefaults);
        // apply default settings for each sorting expression(if not set)
        state.expressions.forEach((expr: SortingExpression) => {
            expr.ignoreCase = expr.ignoreCase === undefined ? 
                            (state.expressionDefaults || {}).ignoreCase: expr.ignoreCase;
        });
        if (!state.strategy) {
            return data;
        }
        return state.strategy.sort(data, state.expressions);
    }
    static page<T> (data: T[], state: PagingState): T[] {
        if (!state) {
            return data;
        }
        var len = data.length,
            index = state.index,
            res = [],
            recordsPerPage = state.recordsPerPage;
        state.metadata = {
            countPages: 0,
            error: PagingError.None,
            countRecords: data.length
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
        if (index >= state.metadata.countPages) {
            state.metadata.error = PagingError.IncorrectPageIndex;
            return res;
        }
        return data.slice(index * recordsPerPage, (index + 1) * recordsPerPage);
    }
    static filter<T> (data: T[],
                    state: FilteringState): T[] {
        if (!state || !state.expressions) {
            return data;
        }
        // set defaults
        state.expressionDefaults = DataUtil.mergeDefaultProperties(state.expressionDefaults, 
                                        SortingStateDefaults.expressionDefaults);
        // set defaults
        DataUtil.mergeDefaultProperties(state, filteringStateDefaults);
        state.expressions.forEach((expr) => {
            expr.ignoreCase = expr.ignoreCase === undefined ?
                            (state.expressionDefaults || {}).ignoreCase: expr.ignoreCase;
        });
        if (!state.strategy) {
            return data;
        }
        return state.strategy.filter(data, state.expressions, state.logic);
    }
    static process<T> (data: T[], state: DataState): T[] {
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
    }
    /* CRUD operations */
    // access data records
    static getIndexOfRecord (data: any[], record: Object): number {
        data = data || [];
        return data.indexOf(record);
    }
    static getRecordByIndex (data: any[], index: number) {
        if (index < 0 || !data) {
            return undefined;
        }
        data = data || [];
        return data[index];
    }
    static getRecordInfoByKeyValue (data: any[], fieldName: string, value: any): {index: number, record: Object} {
        data = data || [];
        var len = data.length, i, res = {index: -1, record: undefined};
        for (i = 0; i < len; i++) {
            if (data[i][fieldName] === value) {
                return {
                    index: i,
                    record: data[i]
                };
            }
        }
        return res;
    }
    static addRecord (data: any[], record: Object, at?: number): boolean {
        if (!data) {
            return false;
        }
        if (at === null || at === undefined) {
            data.push(record);
        } else {
            data.splice(at, 0, record);
        }
        return true;
    }
    static deleteRecord(data: any[], record: Object): boolean {
        var index:number = this.getIndexOfRecord(data, record);
        if (index < -1) {
            return false;
        }
        return DataUtil.deleteRecordByIndex(data, index);
    }
    static deleteRecordByIndex(data: any[], index: number): boolean {
        if (!data || index < 0 || index >= data.length || !data[index]) {
            return false;
        }
        data.splice(index, 1);
        return true;
    }
    static updateRecordByIndex(data: any[], index: number, record: Object): boolean {
        var foundRec = this.getRecordByIndex(data, index);
        if (!foundRec) {
            return false;
        }
        Object.assign(foundRec, record);
        return true;
    }
}

