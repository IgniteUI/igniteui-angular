import { IFilteringState } from './filtering-state.interface';

import { IGroupByResult, IgxSorting } from './sorting-strategy';

import { IPagingState, PagingError } from './paging-state.interface';

import { IGroupByExpandState, IGroupByKey } from './groupby-expand-state.interface';
import { IGroupByRecord } from './groupby-record.interface';
import { IGroupingState } from './groupby-state.interface';
import { ISortingExpression } from './sorting-expression.interface';

export enum DataType {
    String = 'string',
    Number = 'number',
    Boolean = 'boolean',
    Date = 'date'
}
export class DataUtil {
    public static sort<T>(data: T[], expressions: ISortingExpression []): T[] {
        const sorting = new IgxSorting();
        return sorting.sort(data, expressions);
    }
    public static group<T>(data: T[], state: IGroupingState): IGroupByResult {
        const sorting = new IgxSorting();
        return sorting.groupBy(data, state.expressions);
    }
    public static restoreGroups(groupData: IGroupByResult, state: IGroupingState, groupsRecords: any[] = []): any[] {
        if (state.expressions.length === 0) {
            return groupData.data;
        }
        return this.restoreGroupsRecursive(groupData, 1, state.expressions.length, state.expansion, state.defaultExpanded, groupsRecords);
    }
    private static restoreGroupsRecursive(
        groupData: IGroupByResult, level: number, depth: number,
        expansion: IGroupByExpandState[], defaultExpanded: boolean, groupsRecords): any[] {
        let i = 0;
        let j: number;
        let result = [];
        // empty the array without changing reference
        groupsRecords.splice(0, groupsRecords.length);
        if (level !== depth) {
            groupData.data = this.restoreGroupsRecursive(groupData, level + 1, depth, expansion, defaultExpanded, groupsRecords);
        }
        while (i < groupData.data.length) {
            const g = level === depth ? groupData.metadata[i] :
                groupData.data[i].groupParent;
            for (j = i + 1; j < groupData.data.length; j++) {
                const h = level === depth ? groupData.metadata[j] :
                    groupData.data[j].groupParent;
                if (h && g !== h && g.level === h.level) {
                    break;
                }
            }
            const hierarchy = this.getHierarchy(g);
            const expandState: IGroupByExpandState = expansion.find((state) =>
                this.isHierarchyMatch(state.hierarchy || [{ fieldName: g.expression.fieldName, value: g.value }], hierarchy));
            const expanded = expandState ? expandState.expanded : defaultExpanded;
            result.push(g);
            groupsRecords.push(g);

            g['groups'] = groupData.data.slice(i, j).filter((e) =>
                e.records && e.records.length && e.level === g.level + 1);
            while (groupsRecords.length) {
                if (groupsRecords[0].level + 1 > level) {
                    groupsRecords.shift();
                } else {
                    break;
                }
            }
            if (expanded) {
                result = result.concat(groupData.data.slice(i, j));
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
        if (!state.strategy) {
            return data;
        }
        return state.strategy.filter(data, state.expressionsTree);
    }
    public static getHierarchy(gRow: IGroupByRecord): Array<IGroupByKey> {
        const hierarchy: Array<IGroupByKey> = [];
        if (gRow !== undefined && gRow.expression) {
            hierarchy.push({ fieldName: gRow.expression.fieldName, value: gRow.value });
            while (gRow.groupParent) {
                gRow = gRow.groupParent;
                hierarchy.unshift({ fieldName: gRow.expression.fieldName, value: gRow.value });
            }
        }
        return hierarchy;
    }

    public static isHierarchyMatch(h1: Array<IGroupByKey>, h2: Array<IGroupByKey>): boolean {
        if (h1.length !== h2.length) {
            return false;
        }
        return h1.every((level, index): boolean => {
            return level.fieldName === h2[index].fieldName && level.value === h2[index].value;
        });
    }
}
