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
    condition?: IFilteringOperation | null;
    conditionName?: string | null;
    searchVal?: any;
    searchTree?: IExpressionTree | null;
    ignoreCase?: boolean;
}
