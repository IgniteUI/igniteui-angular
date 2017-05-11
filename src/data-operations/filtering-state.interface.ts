import { FilteringLogic, IFilteringExpression } from "./filtering-expression.interface";
import { FilteringStrategy, IFilteringStrategy } from "./filtering-strategy";

export const filteringStateDefaults = {
    logic: FilteringLogic.And,
    strategy: new FilteringStrategy()
};

export declare interface IFilteringState {
    expressions: IFilteringExpression[];
    logic?: FilteringLogic;
    strategy?: IFilteringStrategy;
}
