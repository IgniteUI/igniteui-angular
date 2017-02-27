import { FilteringCondition, FilteringConditionArgs } from "./filtering-condition";
export enum FilteringLogic {
    And,
    Or
};

/**
 * Represents filtering expressions.
 */
export declare interface FilteringExpression {
    fieldName: string;
    //condition: (value: any, search?: any, settings?: Object, record?: Object)=> boolean;
    condition: (value: any, args: FilteringConditionArgs) => boolean;
    searchVal?: any;
    ignoreCase?: boolean
}