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
    reset(state?: DataState): DataContainer {
        this.state = state || {};
        this.transformedData = this.data;
        return this;
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
    /* CRUD operations */
    // access data records
    getIndexOfRecord (record: Object, data?: any[]): number {
        data = data || this.data || [];
        return data.indexOf(record);
    }
    getRecordByIndex (index: number, data?: any[]) {
        if (index < 0) {
            return undefined;
        }
        data = data || this.data || [];
        return data[index];
    }
    getRecordInfoByKeyValue (fieldName: string, value: any, data?: any[]): {index: number, record: Object} {
        data = data || this.data || [];
        var len = data.length, i, res = {index: -1, record: undefined};
        for (i = 0; i < len; i++) {
            if (data[i][fieldName] === value) {
                return {
                    index: i,
                    record: data[i]
                };
            }
        }
        return res;
    }
    addRecord (record: Object, at?: number, data?: any[]): boolean {
        data = data || this.data;
        if (!data) {
            return false;
        }
        if (at === null || at === undefined) {
            data.push(record);
        } else {
            data.splice(at, 0, record);
        }
        return true;
    }
    deleteRecord(record: Object, data?: any[]): boolean {
        data = data || this.data;
        if (!data) {
            return false;
        }
        var index:number = data.indexOf(record);
        if (index < -1) {
            return false;
        }
        return this.deleteRecordByIndex(index, data);
    }
    deleteRecordByIndex(index: number, data?: any[]): boolean {
        data = data || this.data;
        if (!data || index < 0 || index >= data.length || !data[index]) {
            return false;
        }
        data.splice(index, 1);
        return true;
    }
    updateRecordByIndex(index: number, record: Object, data?: any[]): boolean {
        data = data || this.data;
        var foundRec = this.getRecordByIndex(index, data);
        if (!foundRec) {
            return false;
        }
        Object.assign(foundRec, record);
        return true;
    }
}