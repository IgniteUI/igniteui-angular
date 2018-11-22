import { IGroupByExpandState } from './groupby-expand-state.interface';
import { ISortingExpression } from './sorting-expression.interface';
import { ISortingStrategy} from './sorting-strategy';
import { IGroupingExpression } from './grouping-expression.interface';

export interface IGroupingState {
    expressions: IGroupingExpression[];
    expansion: IGroupByExpandState[];
    defaultExpanded: boolean;
}
