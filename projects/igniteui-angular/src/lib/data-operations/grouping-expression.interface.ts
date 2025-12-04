import { ISortingExpression } from './sorting-strategy';

/* marshalByValue */
/* tsPlainInterface */
export interface IGroupingExpression extends ISortingExpression {
    /* blazorCSSuppress */
    groupingComparer?: (a: any, b: any, currRec?: any, groupRec?: any) => number;
}
