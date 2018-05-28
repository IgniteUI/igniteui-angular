import { FilteringLogic, IFilteringExpression } from "./filtering-expression.interface";
export interface IFilteringStrategy {
    filter(data: any[], expressions: IFilteringExpression[], logic?: FilteringLogic): any[];
}
export declare class FilteringStrategy implements IFilteringStrategy {
    filter<T>(data: T[], expressions: IFilteringExpression[], logic?: FilteringLogic): T[];
    findMatch(rec: object, expr: IFilteringExpression, index: number): boolean;
    matchRecordByExpressions(rec: object, expressions: IFilteringExpression[], index: number, logic?: FilteringLogic): boolean;
}
