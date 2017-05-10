import { ISortingExpression, SortingDirection } from "./sorting-expression.interface";
import {ISortingStrategy, SortingStrategy} from "./sorting-strategy";

// tslint:disable-next-line:variable-name
export const SortingStateDefaults = {
    strategy: new SortingStrategy()
};

export interface ISortingState {
    expressions: ISortingExpression[];
    strategy?: ISortingStrategy;
}
