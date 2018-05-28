import { ISortingExpression } from "./sorting-expression.interface";
import { ISortingStrategy, SortingStrategy } from "./sorting-strategy";
export declare const SortingStateDefaults: {
    strategy: SortingStrategy;
};
export interface ISortingState {
    expressions: ISortingExpression[];
    strategy?: ISortingStrategy;
}
