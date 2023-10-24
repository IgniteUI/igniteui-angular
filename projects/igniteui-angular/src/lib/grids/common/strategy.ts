import { cloneArray, parseDate, resolveNestedPath } from '../../core/utils';
import { IGroupByExpandState } from '../../data-operations/groupby-expand-state.interface';
import { IGroupByRecord } from '../../data-operations/groupby-record.interface';
import { IGroupingState } from '../../data-operations/groupby-state.interface';
import { IGroupingExpression } from '../../data-operations/grouping-expression.interface';
import { IGroupByResult } from '../../data-operations/grouping-result.interface';
import { getHierarchy, isHierarchyMatch } from '../../data-operations/operations';
import { DefaultSortingStrategy, ISortingExpression } from '../../data-operations/sorting-strategy';
import { GridType } from './grid.interface';

const DATE_TYPE = 'date';
const TIME_TYPE = 'time';
const DATE_TIME_TYPE = 'dateTime';
const STRING_TYPE = 'string';

export interface IGridSortingStrategy {
    sort(data: any[], expressions: ISortingExpression[], grid?: GridType): any[];
}

export interface IGridGroupingStrategy extends IGridSortingStrategy {
    groupBy(data: any[], state: IGroupingState, grid?: any, groupsRecords?: any[], fullResult?: IGroupByResult): IGroupByResult;
}

export class IgxSorting implements IGridSortingStrategy {
    public sort(data: any[], expressions: ISortingExpression[], grid?: GridType): any[] {
        return this.sortDataRecursive(data, expressions, 0, grid);
    }

    protected groupDataRecursive(
        data: any[],
        state: IGroupingState,
        level: number,
        parent: IGroupByRecord,
        metadata: IGroupByRecord[],
        grid: GridType = null,
        groupsRecords: any[] = [],
        fullResult: IGroupByResult = { data: [], metadata: [] }
    ): any[] {
        const expressions = state.expressions;
        const expansion = state.expansion;
        let i = 0;
        let result = [];
        while (i < data.length) {
            const column = grid ? grid.getColumnByName(expressions[level].fieldName) : null;
            const isDate = column?.dataType === DATE_TYPE || column?.dataType === DATE_TIME_TYPE;
            const isTime = column?.dataType === TIME_TYPE || column?.dataType === DATE_TIME_TYPE;
            const isString = column?.dataType === STRING_TYPE;
            const group = this.groupedRecordsByExpression(data, i, expressions[level], isDate, isTime, isString);
            const groupRow: IGroupByRecord = {
                expression: expressions[level],
                level,
                records: cloneArray(group),
                value: this.getFieldValue(group[0], expressions[level].fieldName, isDate, isTime),
                groupParent: parent,
                groups: [],
                height: grid ? grid.renderedRowHeight : null,
                column
            };
            if (parent) {
                parent.groups.push(groupRow);
            } else {
                groupsRecords.push(groupRow);
            }
            const hierarchy = getHierarchy(groupRow);
            const expandState: IGroupByExpandState = expansion.find((s) =>
                isHierarchyMatch(
                    s.hierarchy || [{ fieldName: groupRow.expression.fieldName, value: groupRow.value }],
                    hierarchy,
                    expressions
                ));
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

    protected getFieldValue<T>(obj: T, key: string, isDate: boolean = false, isTime: boolean = false) {
        let resolvedValue = resolveNestedPath(obj, key);
        const date = parseDate(resolvedValue);
        if (date && isDate && isTime) {
            resolvedValue = date;
        } else if (date && isDate && !isTime) {
            resolvedValue = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
        } else if (date && isTime && !isDate) {
            resolvedValue = new Date(new Date().setHours(date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()));
        }
        return resolvedValue;
    }

    private groupedRecordsByExpression<T>(
        data: T[],
        index: number,
        expression: IGroupingExpression,
        isDate: boolean = false,
        isTime: boolean = false,
        isString: boolean,
        groupingComparer?: (a: any, b: any, currRec: any, groupRec: any) => number
    ): T[] {
        const res = [];
        const key = expression.fieldName;
        const len = data.length;
        const groupRecord = data[index];
        let groupval = this.getFieldValue(groupRecord, key, isDate, isTime);
        res.push(groupRecord);
        index++;
        const comparer = expression.groupingComparer || groupingComparer || DefaultSortingStrategy.instance().compareValues;
        for (let i = index; i < len; i++) {
            const currRec = data[i];
            let fieldValue = this.getFieldValue(currRec, key, isDate, isTime);
            if (expression.ignoreCase && isString) {
                // when column's dataType is string but the value is number
                fieldValue = fieldValue?.toString().toLowerCase();
                groupval = groupval?.toString().toLowerCase();
            }
            if (comparer(fieldValue, groupval, currRec, groupRecord) === 0) {
                res.push(currRec);
            } else {
                break;
            }
        }
        return res;
    }

    private sortDataRecursive<T>(
        data: T[],
        expressions: ISortingExpression[],
        expressionIndex: number = 0,
        grid: GridType
    ): T[] {
        let i: number;
        let j: number;
        let gbData: T[];
        let gbDataLen: number;
        const exprsLen = expressions.length;
        const dataLen = data.length;

        expressionIndex = expressionIndex || 0;
        if (expressionIndex >= exprsLen || dataLen <= 1) {
            return data;
        }
        const expr = expressions[expressionIndex];
        if (!expr.strategy) {
            expr.strategy = DefaultSortingStrategy.instance() as any;
        }
        const column = grid?.getColumnByName(expr.fieldName);
        const isDate = column?.dataType === DATE_TYPE || column?.dataType === DATE_TIME_TYPE;
        const isTime = column?.dataType === TIME_TYPE || column?.dataType === DATE_TIME_TYPE;
        const isString = column?.dataType === STRING_TYPE;
        data = expr.strategy.sort(data, expr.fieldName, expr.dir, expr.ignoreCase, this.getFieldValue, isDate, isTime, grid);
        if (expressionIndex === exprsLen - 1) {
            return data;
        }
        // in case of multiple sorting
        for (i = 0; i < dataLen; i++) {
            gbData = this.groupedRecordsByExpression(data, i, expr, isDate, isTime, isString, column?.groupingComparer);
            gbDataLen = gbData.length;
            if (gbDataLen > 1) {
                gbData = this.sortDataRecursive(gbData, expressions, expressionIndex + 1, grid);
            }
            for (j = 0; j < gbDataLen; j++) {
                data[i + j] = gbData[j];
            }
            i += gbDataLen - 1;
        }
        return data;
    }
}

export class IgxGrouping extends IgxSorting implements IGridGroupingStrategy {
    public groupBy(data: any[], state: IGroupingState, grid?: any,
        groupsRecords?: any[], fullResult: IGroupByResult = { data: [], metadata: [] }): IGroupByResult {
        const metadata: IGroupByRecord[] = [];
        const grouping = this.groupDataRecursive(data, state, 0, null, metadata, grid, groupsRecords, fullResult);
        grid?.groupingPerformedSubject.next();
        return {
            data: grouping,
            metadata
        };
    }
}

export class NoopSortingStrategy implements IGridSortingStrategy {
    private static _instance: NoopSortingStrategy = null;

    private constructor() { }

    public static instance() {
        return this._instance || (this._instance = new NoopSortingStrategy());
    }

    public sort(data: any[]): any[] {
        return data;
    }
}

export class IgxDataRecordSorting extends IgxSorting {

    protected override getFieldValue(obj: any, key: string, isDate: boolean = false, isTime: boolean = false): any {
        return super.getFieldValue(obj.data, key, isDate, isTime);
    }
}
