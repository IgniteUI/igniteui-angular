import { IFilteringOperation } from './filtering-condition';
import { Serializable } from 'node:child_process';
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
    field: string;
    condition?: IFilteringOperation;
    conditionName: string;
    searchVal?: Serializable;
    searchTree?: IExpressionTree;
    ignoreCase?: boolean;
}
