export declare enum FilteringLogic {
    And = 0,
    Or = 1,
}
export interface IFilteringExpression {
    fieldName: string;
    condition: (value: any, searchVal?: any, ignoreCase?: boolean) => boolean;
    searchVal?: any;
    ignoreCase?: boolean;
}
