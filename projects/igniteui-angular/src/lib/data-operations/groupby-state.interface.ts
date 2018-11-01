import { IGroupByExpandState } from './groupby-expand-state.interface';
import { ISortingExpression } from './sorting-expression.interface';
import { ISortingStrategy} from './sorting-strategy';

export interface IGroupingState {
    expressions: ISortingExpression[];
    expansion: IGroupByExpandState[];
    defaultExpanded: boolean;
}
