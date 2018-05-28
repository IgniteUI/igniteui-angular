import { PipeTransform } from "@angular/core";
import { FilteringLogic, IFilteringExpression } from "../data-operations/filtering-expression.interface";
import { IGroupByExpandState } from "../data-operations/groupby-expand-state.interface";
import { ISortingExpression } from "../data-operations/sorting-expression.interface";
import { IgxGridAPIService } from "./api.service";
export declare class IgxGridSortingPipe implements PipeTransform {
    private gridAPI;
    constructor(gridAPI: IgxGridAPIService);
    transform(collection: any[], expressions: ISortingExpression | ISortingExpression[], id: string, pipeTrigger: number): any[];
}
export declare class IgxGridPreGroupingPipe implements PipeTransform {
    private gridAPI;
    constructor(gridAPI: IgxGridAPIService);
    transform(collection: any[], expression: ISortingExpression | ISortingExpression[], expansion: IGroupByExpandState | IGroupByExpandState[], defaultExpanded: boolean, id: string, pipeTrigger: number): any[];
}
export declare class IgxGridPostGroupingPipe implements PipeTransform {
    private gridAPI;
    constructor(gridAPI: IgxGridAPIService);
    transform(collection: any[], expression: ISortingExpression | ISortingExpression[], expansion: IGroupByExpandState | IGroupByExpandState[], defaultExpanded: boolean, id: string, pipeTrigger: number): any[];
}
export declare class IgxGridPagingPipe implements PipeTransform {
    private gridAPI;
    constructor(gridAPI: IgxGridAPIService);
    transform(collection: any[], page: number, perPage: number, id: string, pipeTrigger: number): any[];
}
export declare class IgxGridFilteringPipe implements PipeTransform {
    private gridAPI;
    constructor(gridAPI: IgxGridAPIService);
    transform(collection: any[], expressions: IFilteringExpression | IFilteringExpression[], logic: FilteringLogic, id: string, pipeTrigger: number): any[];
}
export declare class IgxGridFilterConditionPipe implements PipeTransform {
    transform(value: string): string;
}
