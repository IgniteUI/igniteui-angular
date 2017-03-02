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
export class DataContainer {
    public data: any[];
    /**
     * processed data
     */
    public transformedData: any[];
    public state: DataState = {
    };
    constructor (data: any[] = []) {
        this.data = data;
        this.transformedData = data;
    }
    public process(state?: DataState): DataContainer {
        if (state) {
            this.state = state;
        }
        this.transformedData = this.data;
        // apply data operations
        this.transformedData = DataUtil.process(this.data, this.state);
        return this;
    }
    protected accessData (dataAccess: DataAccess) {
        let res;
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
    public getIndexOfRecord (record: Object, dataAccess: DataAccess = DataAccess.OriginalData): number {
        let data = this.accessData(dataAccess);
        return data.indexOf(record);
    }
    public getRecordByIndex (index: number, dataAccess: DataAccess = DataAccess.OriginalData): Object {
        let data = this.accessData(dataAccess);
        return data[index];
    }
    public getRecordInfoByKeyValue (fieldName: string, value: any, dataAccess: DataAccess = DataAccess.OriginalData): RecordInfo {
        let data = this.accessData(dataAccess),
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
    public addRecord (record: Object, at?: number): void {
        let data = this.accessData(DataAccess.OriginalData);
        if (at === null || at === undefined) {
            data.push(record);
        } else {
            data.splice(at, 0, record);
        }
    }
    public deleteRecord(record: Object): boolean {
        let index: number = this.getIndexOfRecord(record, DataAccess.OriginalData);
        return this.deleteRecordByIndex(index);
    }
    public deleteRecordByIndex(index: number): boolean {
        let data = this.accessData(DataAccess.OriginalData);
        return data.splice(index, 1).length === 1;
    }
    public updateRecordByIndex(index: number, newProperties: Object): Object {
        let dataAccess: DataAccess = DataAccess.OriginalData,
            foundRec = this.getRecordByIndex(index, dataAccess);
        if (!foundRec) {
            return undefined;
        }
        return Object.assign(foundRec, newProperties);
    }
}
