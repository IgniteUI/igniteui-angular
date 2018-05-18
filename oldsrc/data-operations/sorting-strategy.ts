import { ISortingExpression, SortingDirection } from "./sorting-expression.interface";

export interface ISortingStrategy {
    sort: (data: any[], expressions: ISortingExpression[]) => any[];
    compareValues: (a: any, b: any) => number;
}

export class SortingStrategy implements ISortingStrategy {
    public sort(data: any[], expressions: ISortingExpression[]): any[] {
        return this.sortDataRecursive(data, expressions);
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
    protected arraySort<T>(data: T[], compareFn?): T[] {
        return data.sort(compareFn);
    }
    private groupedRecordsByExpression<T>(data: T[], index: number, expression: ISortingExpression): T[] {
        let i;
        let groupval;
        const res = [];
        const key = expression.fieldName;
        const len = data.length;
        const cmpFunc = (val1, val2): boolean => {
            return val1 === val2;
        };
        res.push(data[ index ]);
        groupval = data[ index ][ key ];
        index++;
        for (i = index; i < len; i++) {
            if (cmpFunc(data[ i ][ key ], groupval)) {
                res.push(data[ i ]);
            } else {
                break;
            }
        }
        return res;
    }
    private sortByFieldExpression<T>(data: T[], expression: ISortingExpression): T[] {

        const key = expression.fieldName;
        const ignoreCase = expression.ignoreCase ?
                            data[0] && (typeof data[0][key] === "string" ||
                                               data[0][key] === null ||
                                               data[0][key] === undefined) :
                            false;
        const reverse = (expression.dir === SortingDirection.Desc ? -1 : 1);
        const cmpFunc = (obj1, obj2) => {
            return this.compareObjects(obj1, obj2, key, reverse, ignoreCase);
        };
        return this.arraySort(data, cmpFunc);
    }

    private sortDataRecursive<T>(data: T[],
                                 expressions: ISortingExpression[],
                                 expressionIndex: number = 0): T[] {
        let i;
        let j;
        let expr;
        let gbData;
        let gbDataLen;
        const exprsLen = expressions.length;
        const dataLen = data.length;
        expressionIndex = expressionIndex || 0;
        if (expressionIndex >= exprsLen || dataLen <= 1) {
            return data;
        }
        expr = expressions[ expressionIndex ];
        data = this.sortByFieldExpression(data, expr);
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
                data[ i + j ] = gbData[ j ];
            }
            i += gbDataLen - 1;
        }
        return data;
    }
}
