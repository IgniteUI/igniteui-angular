import { IFilteringOperation } from './filtering-condition';

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
    condition: IFilteringOperation;
    searchVal?: any;   
    ignoreCase?: boolean;
}
