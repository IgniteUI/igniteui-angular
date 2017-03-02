import { FilteringState } from "./filtering-state.interface";
import { SortingState } from "./sorting-state.interface";
import { PagingState } from "./paging-state.interface";

export interface DataState {
    filtering?: FilteringState,
    sorting?: SortingState,
    paging?: PagingState
}