import {FilteringLogic, FilteringExpression} from "./filtering-expression.interface";
import { IFilteringStrategy, FilteringStrategy} from "./filtering-strategy";

export const filteringStateDefaults = {
    logic: FilteringLogic.And,
    strategy: new FilteringStrategy()
}

export declare interface FilteringState {
    expressions: Array<FilteringExpression>;
    logic?: FilteringLogic;
    strategy?: IFilteringStrategy;
}