import { IFilteringState } from "./filtering-state.interface";
import { ISortingState } from "./sorting-state.interface";
import { IPagingState } from "./paging-state.interface";
import { IDataState } from "./data-state.interface";
import { IGroupingState } from "./groupby-state.interface";
export declare enum DataType {
    String = "string",
    Number = "number",
    Boolean = "boolean",
    Date = "date",
}
export declare class DataUtil {
    static mergeDefaultProperties(target: object, defaults: object): object;
    static getFilteringConditionsForDataType(dataType: DataType): {
        [name: string]: (value: any, searchVal?: any, ignoreCase?: boolean) => void;
    };
    static getListOfFilteringConditionsForDataType(dataType: DataType): string[];
    static sort<T>(data: T[], state: ISortingState): T[];
    static group<T>(data: T[], state: IGroupingState): T[];
    static restoreGroups<T>(data: T[], state: IGroupingState): T[];
    private static restoreGroupsRecursive(data, level, depth, expansion, defaultExpanded);
    static page<T>(data: T[], state: IPagingState): T[];
    static filter<T>(data: T[], state: IFilteringState): T[];
    static process<T>(data: T[], state: IDataState): T[];
}
