import { ISortingExpression } from './sorting-strategy';

export interface IGroupingExpression extends ISortingExpression {
    groupingComparer?: (a: any, b: any) => number;
}
