import { ISortingExpression } from './sorting-strategy';

export interface IGroupingExpression extends ISortingExpression {
    /* blazorSuppress */
    groupingComparer?: (a: any, b: any, currRec?: any, groupRec?: any) => number;
}
