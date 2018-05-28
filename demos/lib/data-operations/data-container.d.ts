import { IDataState } from "./data-state.interface";
import { IRecordInfo } from "./record-info.interface";
export declare enum DataAccess {
    OriginalData = 0,
    TransformedData = 1,
}
export declare class DataContainer {
    data: any[];
    transformedData: any[];
    state: IDataState;
    constructor(data?: any[]);
    process(state?: IDataState): DataContainer;
    getIndexOfRecord(record: object, dataAccess?: DataAccess): number;
    getRecordByIndex(index: number, dataAccess?: DataAccess): object;
    getRecordInfoByKeyValue(fieldName: string, value: any, dataAccess?: DataAccess): IRecordInfo;
    addRecord(record: object, at?: number): void;
    deleteRecord(record: object): boolean;
    deleteRecordByIndex(index: number): boolean;
    updateRecordByIndex(index: number, newProperties: object): object;
    protected accessData(dataAccess: DataAccess): any;
}
