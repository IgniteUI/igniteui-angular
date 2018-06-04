import { IFilteringOperation } from '../../public_api';

export enum FilteringLogic {
    And,
    Or
}

/**
 * Represents filtering expressions.
 */
export declare interface IFilteringExpression {
    fieldName: string;
    condition: IFilteringOperation;
    searchVal?: any;
    ignoreCase?: boolean;
}
