import { IDataState } from './data-state.interface';
import { DataUtil } from './data-util';
import { FilteringLogic, IFilteringExpression } from './filtering-expression.interface';
import { IFilteringState } from './filtering-state.interface';
import { FilteringStrategy, IFilteringStrategy } from './filtering-strategy';
import { IPagingState, PagingError } from './paging-state.interface';
import { IRecordInfo } from './record-info.interface';
import { ISortingExpression, SortingDirection } from './sorting-expression.interface';
import { ISortingState } from './sorting-state.interface';
import { ISortingStrategy, SortingStrategy } from './sorting-strategy';

/**
 * @hidden
 */
export enum DataAccess {
    OriginalData,
    TransformedData
}

/**
 * @hidden
 */
export class DataContainer {
    public data: any[];
    /**
     * processed data
     */
    public transformedData: any[];
    public state: IDataState = {
    };
    constructor(data: any[] = []) {
        this.data = data;
        this.transformedData = data;
    }
    public process(state?: IDataState): DataContainer {
        if (state) {
            this.state = state;
        }
        this.transformedData = this.data;
        // apply data operations
        this.transformedData = DataUtil.process(this.data, this.state);
        return this;
    }
    // CRUD operations
    // access data records
    public getIndexOfRecord(record: object, dataAccess: DataAccess = DataAccess.OriginalData): number {
        const data = this.accessData(dataAccess);
        return data.indexOf(record);
    }
    public getRecordByIndex(index: number, dataAccess: DataAccess = DataAccess.OriginalData): object {
        const data = this.accessData(dataAccess);
        return data[index];
    }
    public getRecordInfoByKeyValue(fieldName: string,
                                   value: any,
                                   dataAccess: DataAccess = DataAccess.OriginalData): IRecordInfo {
        const data = this.accessData(dataAccess);
        const len = data.length;
        const res: IRecordInfo = {index: -1, record: undefined};
        let i;
        for (i = 0; i < len; i++) {
            if (data[i][fieldName] === value) {
                res.index = i;
                res.record = data[i];
                break;
            }
        }
        return res;
    }
    public addRecord(record: object, at?: number): void {
        const data = this.accessData(DataAccess.OriginalData);
        if (at === null || at === undefined) {
            data.push(record);
        } else {
            data.splice(at, 0, record);
        }
    }
    public deleteRecord(record: object): boolean {
        const index: number = this.getIndexOfRecord(record, DataAccess.OriginalData);
        return this.deleteRecordByIndex(index);
    }
    public deleteRecordByIndex(index: number): boolean {
        const data = this.accessData(DataAccess.OriginalData);
        return data.splice(index, 1).length === 1;
    }
    public updateRecordByIndex(index: number, newProperties: object): object {
        const dataAccess: DataAccess = DataAccess.OriginalData;
        const foundRec = this.getRecordByIndex(index, dataAccess);
        if (!foundRec) {
            return undefined;
        }
        return Object.assign(foundRec, newProperties);
    }
    protected accessData(dataAccess: DataAccess) {
        let res;
        switch (dataAccess) {
            case DataAccess.OriginalData:
            res = this.data;
            break;
            case DataAccess.TransformedData:
            res = this.transformedData;
            break;
        }
        return res;
    }
}
