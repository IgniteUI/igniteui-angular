import { IFilteringExpressionsTree } from './filtering-expressions-tree';
import { IFilteringStrategy } from './filtering-strategy';

export declare interface IFilteringState {
    expressionsTree: IFilteringExpressionsTree;
    advancedExpressionsTree?: IFilteringExpressionsTree;
    strategy?: IFilteringStrategy;
}
