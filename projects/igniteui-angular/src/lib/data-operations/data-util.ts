import { IgxFilteringOperand,
    IgxBooleanFilteringOperand,
    IgxDateFilteringOperand,
    IgxNumberFilteringOperand,
    IgxStringFilteringOperand } from './filtering-condition';
import { FilteringLogic, IFilteringExpression } from './filtering-expression.interface';
import { filteringStateDefaults, IFilteringState } from './filtering-state.interface';
import { FilteringStrategy, IFilteringStrategy } from './filtering-strategy';

import { ISortingExpression, SortingDirection } from './sorting-expression.interface';
import { ISortingState, SortingStateDefaults } from './sorting-state.interface';
import { ISortingStrategy, SortingStrategy } from './sorting-strategy';

import { IPagingState, PagingError } from './paging-state.interface';

import { IDataState } from './data-state.interface';
import { IGroupByExpandState } from './groupby-expand-state.interface';
import { IGroupByRecord } from './groupby-record.interface';
import { IGroupingState } from './groupby-state.interface';

export enum DataType {
    String = 'string',
    Number = 'number',
    Boolean = 'boolean',
    Date = 'date'
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
        return state.strategy.groupBy(data, state.expressions);
    }
    public static restoreGroups<T>(data: T[], state: IGroupingState): T[] {
        DataUtil.mergeDefaultProperties(state, SortingStateDefaults);
        if (state.expressions.length === 0) {
            return data;
        }
        return this.restoreGroupsRecursive(data, 1, state.expressions.length, state.expansion, state.defaultExpanded);
    }
    private static restoreGroupsRecursive(
            data: any[], level: number, depth: number,
            expansion: IGroupByExpandState[], defaultExpanded: boolean): any[] {
        let i = 0;
        let j: number;
        let result = [];
        if (level !== depth) {
            data = this.restoreGroupsRecursive(data, level + 1, depth, expansion, defaultExpanded);
        }
        while (i < data.length) {
            const g = data[i]['__groupParent'];
            for (j = i + 1; j < data.length; j++) {
                const h = data[j]['__groupParent'];
                if (g !== h && g.level === h.level) {
                    break;
                }
            }
            const hierarchy = this.getHierarchy(g);
            const expandState: IGroupByExpandState = expansion.find((state) =>
                state.fieldName === g.expression.fieldName && state.value === g.value && this.isHierarchyMatch(state.hierarchy, hierarchy));
            const expanded = expandState ? expandState.expanded : defaultExpanded;
            result.push(g);
            if (expanded) {
                result = result.concat(data.slice(i, j));
            }
            i = j;
        }
        return result;
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
    public static filter<T>(data: T[], state: IFilteringState): T[] {
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

    public static getHierarchy(gRow: IGroupByRecord): Array<Map<string, any>> {
        const hierarchy = [];
        let kValPair = new Map();
        kValPair.set(gRow.expression.fieldName, gRow.value);
        hierarchy.push(kValPair);
        while (gRow.__groupParent) {
            gRow = gRow.__groupParent;
            kValPair = new Map();
            kValPair.set(gRow.expression.fieldName, gRow.value);
            hierarchy.unshift(kValPair);
        }
        return hierarchy;
    }

    public static isHierarchyMatch(h1: Array<Map<string, any>>, h2: Array<Map<string, any>>): boolean {
        let res;
        if (h1.length !== h2.length) {
            return false;
        } else {
            for (let i = 0; i < h1.length; i++) {
                res = h1[0].keys().next().value === h2[0].keys().next().value &&
                    h1[0].values().next().value === h2[0].values().next().value;
                if (!res) {
                    break;
                }
            }
            return res;
        }
    }
}
