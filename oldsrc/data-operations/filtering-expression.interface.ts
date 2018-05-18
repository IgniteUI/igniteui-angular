import { FilteringCondition } from "./filtering-condition";
export enum FilteringLogic {
    And,
    Or
}

/**
 * Represents filtering expressions.
 */
export declare interface IFilteringExpression {
    fieldName: string;
    condition: (value: any, searchVal?: any, ignoreCase?: boolean) => boolean;
    searchVal?: any;
    ignoreCase?: boolean;
}
