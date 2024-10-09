import { IFilteringOperation } from './filtering-condition';
import { Serializable } from 'node:child_process';
import { IExpressionTree, ISerializedFilteringExpressionTree } from './filtering-expressions-tree';

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
    conditionName: string;
    searchVal?: Serializable;
    searchTree?: IExpressionTree;
    ignoreCase?: boolean;
}

export declare interface ISerializedFilteringExpression extends IFilteringExpression {
    expressionType?: string;
    searchTree?: ISerializedFilteringExpressionTree;
}
