import { SortingExpression, SortingDirection } from "./sorting-expression.interface";

export interface ISortingStrategy {
    sort: (data: any[], expressions: SortingExpression[]) => any[];
    compareValues: (a: any, b: any) => number;
}

export class SortingStrategy implements ISortingStrategy {
    sort(data: any[], expressions: SortingExpression[]): any[] {
        return this.sortDataRecursive(data, expressions);
    }
    protected arraySort<T> (data: T[], compareFn?): T[] {
        return data.sort(compareFn);
    }
    private groupedRecordsByExpression<T> (data: T[], index: number, expression: SortingExpression): T[] {
        var i, res = [], cmpRes, groupval,
            key = expression.fieldName,
            len = data.length,
            cmpFunc = function (val1, val2): boolean {
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
    compareValues(a: any, b: any) {
        var an = (a === null || a === undefined),
            bn = (b === null || b === undefined);
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
    protected compareObjects(obj1: Object, obj2: Object, key: string, reverse: number, ignoreCase: boolean) {
        var a = obj1[key], b = obj2[key];
        if (ignoreCase) {
            a = a && a.toLowerCase ? a.toLowerCase() : a;
            b = b && b.toLowerCase ? b.toLowerCase() : b;
        }
        return reverse * this.compareValues(a, b);
    }
    private sortByFieldExpression<T> (data: T[], expression: SortingExpression): T[] {
        var arr = [], sortF, self = this,
            key = expression.fieldName,
            ignoreCase = expression.ignoreCase ? 
                            data[0] && (typeof data[0][key] === "string" || data[0][key] === null || data[0][key] === undefined): 
                            false,
            reverse = (expression.dir === SortingDirection.Desc? -1 : 1),
            cmpFunc = expression.compareFunction;
            cmpFunc = cmpFunc || function(obj1, obj2) {
                return self.compareObjects(obj1, obj2, key, reverse, ignoreCase);
            };
        return this.arraySort(data, cmpFunc);
    }

    private sortDataRecursive<T> (data: T[],
                            expressions: SortingExpression[],
                            expressionIndex: number = 0): T[] {
        var i, j, dataLen = data.length, expr, gbExpr, gbData, gbDataLen,
            exprsLen = expressions.length;
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