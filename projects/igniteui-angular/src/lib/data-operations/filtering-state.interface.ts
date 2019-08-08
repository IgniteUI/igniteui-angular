import { IFilteringExpressionsTree } from './filtering-expressions-tree';
import { FilteringStrategy, IFilteringStrategy } from './filtering-strategy';

export const filteringStateDefaults = {
    strategy: new FilteringStrategy()
};

export declare interface IFilteringState {
    expressionsTree: IFilteringExpressionsTree;
    crossFieldExpressionsTree?: IFilteringExpressionsTree;
    strategy?: IFilteringStrategy;
}
