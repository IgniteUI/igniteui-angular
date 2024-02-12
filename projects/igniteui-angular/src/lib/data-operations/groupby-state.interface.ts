import { IGroupByExpandState } from './groupby-expand-state.interface';
import { IGroupingExpression } from './grouping-expression.interface';

/* marshalByValue */
export interface IGroupingState {
    expressions: IGroupingExpression[];
    expansion: IGroupByExpandState[];
    defaultExpanded: boolean;
}
