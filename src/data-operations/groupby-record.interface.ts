import { ISortingExpression } from "./sorting-expression.interface";

export interface IGroupByRecord {
    expression: ISortingExpression,
    level: number,
    records: any[],
    value: any,
    //TODO: add groupby summaries here
 }