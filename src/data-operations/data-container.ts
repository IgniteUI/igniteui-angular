import { FilteringExpression, FilteringLogic } from "./filtering-expression.interface";
import { FilteringCondition } from "./filtering-condition";
import { FilteringState } from "./filtering-state.interface";
import { IFilteringStrategy, FilteringStrategy } from "./filtering-strategy";

import { SortingExpression, SortingDirection } from "./sorting-expression.interface";
import {SortingState} from "./sorting-state.interface";
import {ISortingStrategy, SortingStrategy} from "./sorting-strategy";

import {PagingState, PagingError} from "./paging-state.interface";

import { RecordInfo } from "./record-info.interface";
import {DataState} from "./data-state.interface";
import {DataUtil} from "./data-util";



export enum DataAccess {
    OriginalData,
    TransformedData
}

/**
 * 
 */
export class DataContainer {
    /**
     * 
     */
    data: any[];
    /**
     * processed data
     */
    transformedData: any[];
    /**
     * 
     */
    state: DataState = {
    };
    constructor (data: any[] = []) {
        this.data = data;
        this.transformedData = data;
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
    protected accessData (dataAccess: DataAccess) {
        var res;
        switch(dataAccess) {
            case DataAccess.OriginalData:
               res = this.data;
               break;
            case DataAccess.TransformedData:
                res = this.transformedData;
                break;
        }
        return res;
    }
    // CRUD operations
    // access data records
    getRecordInfoByKeyValue (fieldName: string, value: any, dataAccess: DataAccess = DataAccess.OriginalData): RecordInfo {
        var data = this.accessData(dataAccess),
            len = data.length, i,
            res:RecordInfo = {index: -1, record: undefined};
        for (i = 0; i < len; i++) {
            if (data[i][fieldName] === value) {
                res.index = i;
                res.record = data[i];
                break;
            }
        }
        return res;
    }
    addRecord (record: Object, at?: number, dataAccess: DataAccess = DataAccess.OriginalData): void {
        var data = this.accessData(dataAccess);
        if (at === null || at === undefined) {
            data.push(record);
        } else {
            data.splice(at, 0, record);
        }
    }
    deleteRecord(record: Object, dataAccess: DataAccess = DataAccess.OriginalData): boolean {
        var data = this.accessData(dataAccess),
            index = data.indexOf(record);
        return this.deleteRecordByIndex(index, dataAccess);
    }
    deleteRecordByIndex(index: number, dataAccess: DataAccess = DataAccess.OriginalData): boolean {
        var data = this.accessData(dataAccess);
        return data.splice(index, 1).length === 1;
    }
    updateRecordByIndex(index: number, newProperties: Object, dataAccess: DataAccess = DataAccess.OriginalData): Object {
        var data = this.accessData(dataAccess),
            foundRec = data[index];
        if (!foundRec) {
            return false;
        }
        return Object.assign(foundRec, newProperties);
    }
}