import { FilteringExpression, FilteringLogic } from "./filtering-expression.interface";
import { FilteringCondition } from "./filtering-condition";
import { FilteringState } from "./filtering-state.interface";
import { IFilteringStrategy, FilteringStrategy } from "./filtering-strategy";

import { SortingExpression, SortingDirection } from "./sorting-expression.interface";
import {SortingState} from "./sorting-state.interface";
import {ISortingStrategy, SortingStrategy} from "./sorting-strategy";

import {PagingState, PagingError} from "./paging-state.interface";

import {DataState} from "./data-state.interface";
import {DataUtil} from "./data-util";

/**
 * 
 */
export class DataContainer {
    /**
     * 
     */
    data: any[];
    /**
     *
     * The total number of records that is available.
     */
    total: number;
    /**
     * processed data
     */
    transformedData: any[];
    /**
     * 
     */
    state: DataState = {
    };
    constructor (data: any[] = [], total?: number) {
        this.data = data;
        this.transformedData = data;
        if (total !== undefined && total !== null) {
            this.total = total;
        }
    }
    process(state?: DataState): DataContainer {
        if (state) {
            this.state = state;
        }
        this.transformedData = this.data;
        // apply data operations
        this.transformedData = DataUtil.process(this.data, this.state);
        return this;
    }
}