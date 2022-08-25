import { ISortingExpression } from './sorting-strategy';

export interface IGroupingExpression extends ISortingExpression {
    /* blazorSuppress */
    groupingComparer?: (a: any, b: any) => number;
}
