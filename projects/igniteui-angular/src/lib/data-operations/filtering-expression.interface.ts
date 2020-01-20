import { IFilteringOperation } from './filtering-condition';

export enum FilteringLogic {
    And,
    Or
}

/**
 * Represents filtering expressions.
 */
export declare interface IFilteringExpression {
    fieldName: string;
    headerName?: string;
    condition: IFilteringOperation;
    searchVal?: any;
    ignoreCase?: boolean;
}
