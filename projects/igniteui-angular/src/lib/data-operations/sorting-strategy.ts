import { cloneArray } from '../core/utils';
import { IGroupByRecord } from './groupby-record.interface';
import { ISortingExpression, SortingDirection } from './sorting-expression.interface';
import { IGroupingExpression } from './grouping-expression.interface';
import { IGroupingState } from './groupby-state.interface';
import { DataUtil } from './data-util';
import { IGroupByExpandState } from './groupby-expand-state.interface';
import { IGroupByResult } from './grouping-result.interface';

export interface ISortingStrategy {
    sort: (data: any[],
           fieldName: string,
           dir: SortingDirection,
           ignoreCase: boolean,
           valueResolver: (obj: any, key: string) => any) => any[];
}

export class DefaultSortingStrategy implements ISortingStrategy {
    private static _instance: DefaultSortingStrategy = null;

    protected constructor() {}

    public static instance(): DefaultSortingStrategy {
        return this._instance || (this._instance = new this());
    }

    public sort(data: any[],
                fieldName: string,
                dir: SortingDirection,
                ignoreCase: boolean,
                valueResolver: (obj: any, key: string) => any) {
        const key = fieldName;
        const reverse = (dir === SortingDirection.Desc ? -1 : 1);
        const cmpFunc = (obj1, obj2) => {
            return this.compareObjects(obj1, obj2, key, reverse, ignoreCase, valueResolver);
        };
        return this.arraySort(data, cmpFunc);
    }

    public compareValues(a: any, b: any) {
        const an = (a === null || a === undefined);
        const bn = (b === null || b === undefined);
        if (an) {
            if (bn) {
                return 0;
            }
            return -1;
        } else if (bn) {
            return 1;
        }
        return a > b ? 1 : a < b ? -1 : 0;
    }

    protected compareObjects(obj1: object,
                             obj2: object,
                             key: string,
                             reverse: number,
                             ignoreCase: boolean,
                             valueResolver: (obj: any, key: string) => any) {
        let a = valueResolver(obj1, key);
        let b = valueResolver(obj2, key);
        if (ignoreCase) {
            a = a && a.toLowerCase ? a.toLowerCase() : a;
            b = b && b.toLowerCase ? b.toLowerCase() : b;
        }
        return reverse * this.compareValues(a, b);
    }

    protected arraySort(data: any[], compareFn?): any[] {
        return data.sort(compareFn);
    }
}

export class IgxSorting {
    public sort(data: any[], expressions: ISortingExpression[]): any[] {
        return this.sortDataRecursive(data, expressions);
    }

    private groupedRecordsByExpression(data: any[],
            index: number,
            expression: IGroupingExpression): any[] {
        let i;
        let groupval;
        const res = [];
        const key = expression.fieldName;
        const len = data.length;
        res.push(data[index]);
        groupval = this.getFieldValue(data[index], key);
        index++;
        const comparer = expression.groupingComparer || DefaultSortingStrategy.instance().compareValues;
        for (i = index; i < len; i++) {
            if (comparer(this.getFieldValue(data[i], key), groupval) === 0) {
                res.push(data[i]);
            } else {
                break;
            }
        }
        return res;
    }
    private sortDataRecursive<T>(data: T[],
                                 expressions: ISortingExpression[],
                                 expressionIndex: number = 0): T[] {
        let i;
        let j;
        let expr: ISortingExpression;
        let gbData;
        let gbDataLen;
        const exprsLen = expressions.length;
        const dataLen = data.length;
        expressionIndex = expressionIndex || 0;
        if (expressionIndex >= exprsLen || dataLen <= 1) {
            return data;
        }
        expr = expressions[expressionIndex];
        if (!expr.strategy) {
            expr.strategy = DefaultSortingStrategy.instance();
        }
        data = expr.strategy.sort(data, expr.fieldName, expr.dir, expr.ignoreCase, this.getFieldValue);
        if (expressionIndex === exprsLen - 1) {
            return data;
        }
        // in case of multiple sorting
        for (i = 0; i < dataLen; i++) {
            gbData = this.groupedRecordsByExpression(data, i, expr);
            gbDataLen = gbData.length;
            if (gbDataLen > 1) {
                gbData = this.sortDataRecursive(gbData, expressions, expressionIndex + 1);
            }
            for (j = 0; j < gbDataLen; j++) {
                data[i + j] = gbData[j];
            }
            i += gbDataLen - 1;
        }
        return data;
    }
    protected groupDataRecursive<T>(data: T[], state: IGroupingState, level: number,
        parent: IGroupByRecord, metadata: IGroupByRecord[], grid: any = null,
        groupsRecords: any[] = [], fullResult: IGroupByResult = { data: [], metadata: [] }): T[] {
        const expressions = state.expressions;
        const expansion = state.expansion;
        let i = 0;
        let result = [];
        while (i < data.length) {
            const group = this.groupedRecordsByExpression(data, i, expressions[level]);
            const groupRow: IGroupByRecord = {
                expression: expressions[level],
                level,
                records: cloneArray(group),
                value: group[0][expressions[level].fieldName],
                groupParent: parent,
                groups: [],
                height: grid ? grid.renderedRowHeight : null
            };
            if (parent) {
                parent.groups.push(groupRow);
            } else {
                groupsRecords.push(groupRow);
            }
            const hierarchy = DataUtil.getHierarchy(groupRow);
            const expandState: IGroupByExpandState = expansion.find((s) =>
                DataUtil.isHierarchyMatch(s.hierarchy || [{ fieldName: groupRow.expression.fieldName, value: groupRow.value }], hierarchy));
            const expanded = expandState ? expandState.expanded : state.defaultExpanded;
            let recursiveResult;
            result.push(groupRow);
            metadata.push(null);
            fullResult.data.push(groupRow);
            fullResult.metadata.push(null);
            if (level < expressions.length - 1) {
                recursiveResult = this.groupDataRecursive(group, state, level + 1, groupRow,
                    expanded ? metadata : [], grid, groupsRecords, fullResult);
                if (expanded) {
                    result = result.concat(recursiveResult);
                }
            } else {
                for (const groupItem of group) {
                    fullResult.metadata.push(groupRow);
                    fullResult.data.push(groupItem);
                }
                if (expanded) {
                    metadata.push(...fullResult.metadata.slice(fullResult.metadata.length - group.length));
                    result.push(...fullResult.data.slice(fullResult.data.length - group.length));
                }
            }
            i += group.length;
        }
        return result;
    }
    protected getFieldValue(obj: any, key: string): any {
        return obj[key];
    }
}

export class IgxDataRecordSorting extends IgxSorting {
    protected getFieldValue(obj: any, key: string): any {
        return obj.data[key];
    }
}
