import {FilteringExpression, FilteringLogic} from "./filtering-expression.interface";
import { FilteringStrategy, IFilteringStrategy} from "./filtering-strategy";

export const filteringStateDefaults = {
    logic: FilteringLogic.And,
    strategy: new FilteringStrategy()
};

export declare interface FilteringState {
    expressions: FilteringExpression[];
    logic?: FilteringLogic;
    strategy?: IFilteringStrategy;
}
