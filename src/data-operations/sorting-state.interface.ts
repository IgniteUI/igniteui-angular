import { SortingDirection, SortingExpression } from "./sorting-expression.interface";
import {ISortingStrategy, SortingStrategy} from "./sorting-strategy";

export const SortingStateDefaults = {
    strategy: new SortingStrategy()
};

export interface SortingState {
    expressions: SortingExpression[];
    strategy?: ISortingStrategy;
}
