import { ISortingExpression } from "./sorting-expression.interface";
export interface ISortingStrategy {
    sort: (data: any[], expressions: ISortingExpression[]) => any[];
    groupBy: (data: any[], expressions: ISortingExpression[]) => any[];
    compareValues: (a: any, b: any) => number;
}
export declare class SortingStrategy implements ISortingStrategy {
    sort(data: any[], expressions: ISortingExpression[]): any[];
    groupBy(data: any[], expressions: ISortingExpression[]): any[];
    compareValues(a: any, b: any): 0 | 1 | -1;
    protected compareObjects(obj1: object, obj2: object, key: string, reverse: number, ignoreCase: boolean): number;
    protected arraySort<T>(data: T[], compareFn?: any): T[];
    private groupedRecordsByExpression<T>(data, index, expression);
    private sortByFieldExpression<T>(data, expression);
    private sortDataRecursive<T>(data, expressions, expressionIndex?);
    private groupDataRecursive<T>(data, expressions, level, parent);
}
