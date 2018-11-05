import { IFilteringState } from './filtering-state.interface';
import { IPagingState } from './paging-state.interface';
import { ISortingState } from './sorting-state.interface';

/**
 * @hidden
 */
export interface IDataState {
    filtering?: IFilteringState;
    sorting?: ISortingState;
    paging?: IPagingState;
}
