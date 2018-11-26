import { ISortingExpression } from './sorting-expression.interface';

export interface IGroupingExpression extends ISortingExpression {
    groupingComparer?: (a: any, b: any) => number;
}
