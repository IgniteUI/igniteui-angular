import { FilteringCondition } from "./filtering-condition";
import { FilteringLogic, IFilteringExpression } from "./filtering-expression.interface";
import { filteringStateDefaults, IFilteringState } from "./filtering-state.interface";
import { FilteringStrategy, IFilteringStrategy } from "./filtering-strategy";

import { ISortingExpression, SortingDirection } from "./sorting-expression.interface";
import { ISortingState, SortingStateDefaults } from "./sorting-state.interface";
import { ISortingStrategy, SortingStrategy } from "./sorting-strategy";

import { IPagingState, PagingError } from "./paging-state.interface";

import { IDataState } from "./data-state.interface";
import { IGroupingState } from "./groupby-state.interface";

export enum DataType {
    String = "string",
    Number = "number",
    Boolean = "boolean",
    Date = "date"
}

export class DataUtil {
    public static mergeDefaultProperties(target: object, defaults: object) {
        if (!defaults) {
            return target;
        }
        if (!target) {
            target = Object.assign({}, defaults);
            return target;
        }
        Object
            .keys(defaults)
            .forEach((key) => {
                if (target[key] === undefined && defaults[key] !== undefined) {
                    target[key] = defaults[key];
                }
            });
        return target;
    }
    public static getFilteringConditionsForDataType(dataType: DataType):
        {[name: string]: (value: any, searchVal?: any, ignoreCase?: boolean) => void} {
        return FilteringCondition[dataType];
    }
    public static getListOfFilteringConditionsForDataType(dataType: DataType): string[] {
        return Object.keys(DataUtil.getFilteringConditionsForDataType(dataType));
    }
    public static sort<T>(data: T[], state: ISortingState): T[] {
        // set defaults
        DataUtil.mergeDefaultProperties(state, SortingStateDefaults);
        // apply default settings for each sorting expression(if not set)
        return state.strategy.sort(data, state.expressions);
    }
    public static group<T>(data: T[], state: IGroupingState): T[] {
        // set defaults
        DataUtil.mergeDefaultProperties(state, SortingStateDefaults);
        // apply default settings for each grouping expression(if not set)
        return state.strategy.groupBy(data, state.expressions, state.expansion, state.defaultExpanded);
    }
    public static page<T>(data: T[], state: IPagingState): T[] {
        if (!state) {
            return data;
        }
        const len = data.length;
        const index = state.index;
        const res = [];
        const recordsPerPage = state.recordsPerPage;
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
    }
    public static filter<T>(data: T[],
                            state: IFilteringState): T[] {
        // set defaults
        DataUtil.mergeDefaultProperties(state, filteringStateDefaults);
        if (!state.strategy) {
            return data;
        }
        return state.strategy.filter(data, state.expressions, state.logic);
    }
    public static process<T>(data: T[], state: IDataState): T[] {
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
}
