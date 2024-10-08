import { IFilteringOperation } from './filtering-condition';
import { IExpressionTree } from './filtering-expressions-tree';

/* mustCoerceToInt */
export enum FilteringLogic {
    And,
    Or
}

/* tsPlainInterface */
/* marshalByValue */
/**
 * Represents filtering expressions.
 */
export declare interface IFilteringExpression {
    fieldName: string;
    condition?: IFilteringOperation;
    conditionName?: string;
    searchVal?: any;
    searchTree?: IExpressionTree;
    ignoreCase?: boolean;
}
