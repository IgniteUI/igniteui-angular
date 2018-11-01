import { cloneArray } from '../core/utils';
import { IGroupByRecord } from './groupby-record.interface';
import { ISortingExpression, SortingDirection } from './sorting-expression.interface';

export interface ISortingStrategy {
    sort: (data: any[], fieldName: string, dir: SortingDirection, ignoreCase: boolean) => any[];
}

export class DefaultSortingStrategy implements ISortingStrategy {
    private static _instance: DefaultSortingStrategy = null;

    protected constructor() {}

    public static instance(): DefaultSortingStrategy {
        return this._instance || (this._instance = new this());
    }

    public sort(data: any[], fieldName: string, dir: SortingDirection, ignoreCase: boolean) {
        const key = fieldName;
        const reverse = (dir === SortingDirection.Desc ? -1 : 1);
        const cmpFunc = (obj1, obj2) => {
            return this.compareObjects(obj1, obj2, key, reverse, ignoreCase);
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

    protected compareObjects(obj1: object, obj2: object, key: string, reverse: number, ignoreCase: boolean) {
        let a = obj1[key];
        let b = obj2[key];
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

export interface IGroupByResult {
    data: any[];
    metadata: IGroupByRecord[];
}

export class IgxSorting {
    public sort(data: any[], expressions: ISortingExpression[]): any[] {
        return this.sortDataRecursive(data, expressions);
    }
    public groupBy(data: any[], expressions: ISortingExpression[]): IGroupByResult {
        const metadata: IGroupByRecord[] = [];
        const grouping = this.groupDataRecursive(data, expressions, 0, null, metadata);
        return {
            data: grouping,
            metadata: metadata
        };
    }
    private groupedRecordsByExpression<T>(data: T[], index: number, expression: ISortingExpression): T[] {
        let i;
        let groupval;
        const res = [];
        const key = expression.fieldName;
        const len = data.length;
        res.push(data[index]);
        groupval = data[index][key];
        index++;
        for (i = index; i < len; i++) {
            if (data[i][key] === groupval) {
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
        data = expr.strategy.sort(data, expr.fieldName, expr.dir, expr.ignoreCase);
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
    private groupDataRecursive<T>(data: T[], expressions: ISortingExpression[], level: number,
        parent: IGroupByRecord, metadata: IGroupByRecord[]): T[] {
        let i = 0;
        let result = [];
        while (i < data.length) {
            const group = this.groupedRecordsByExpression(data, i, expressions[level]);
            const groupRow: IGroupByRecord = {
                expression: expressions[level],
                level,
                records: cloneArray(group),
                value: group[0][expressions[level].fieldName],
                groupParent: parent
            };
            if (level < expressions.length - 1) {
                result = result.concat(this.groupDataRecursive(group, expressions, level + 1, groupRow, metadata));
            } else {
                for (const groupItem of group) {
                    metadata.push(groupRow);
                    result.push(groupItem);
                }
            }
            i += group.length;
        }
        return result;
    }
}
