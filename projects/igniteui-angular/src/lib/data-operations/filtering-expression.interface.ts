import { IFilteringOperation } from './filtering-condition';

export enum FilteringLogic {
    And,
    Or
}

/**
 * Represents base expressions.
 */
export declare interface IExpression {
    fieldName: string;
    condition: IFilteringOperation;
    searchVal?: any;
}

/**
 * Represents filtering expressions.
 */
export declare interface IFilteringExpression extends IExpression {
    ignoreCase?: boolean;
}
