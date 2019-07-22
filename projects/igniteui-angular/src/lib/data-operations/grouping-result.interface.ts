import { IGroupByRecord } from './groupby-record.interface';

export interface IGroupByResult {
    data: any[];
    metadata: IGroupByRecord[];
}
