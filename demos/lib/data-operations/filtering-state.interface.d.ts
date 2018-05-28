import { FilteringLogic, IFilteringExpression } from "./filtering-expression.interface";
import { FilteringStrategy, IFilteringStrategy } from "./filtering-strategy";
export declare const filteringStateDefaults: {
    logic: FilteringLogic;
    strategy: FilteringStrategy;
};
export interface IFilteringState {
    expressions: IFilteringExpression[];
    logic?: FilteringLogic;
    strategy?: IFilteringStrategy;
}
