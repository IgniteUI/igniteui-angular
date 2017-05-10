import { FilteringState } from "./filtering-state.interface";
import { IPagingState } from "./paging-state.interface";
import { SortingState } from "./sorting-state.interface";

export interface IDataState {
    filtering?: FilteringState;
    sorting?: SortingState;
    paging?: IPagingState;
}
