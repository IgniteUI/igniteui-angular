import { ISortingExpression } from './sorting-expression.interface';

export class GroupedRecords extends Array<any> {}

export interface IGroupByRecord {
    expression: ISortingExpression;
    level: number;
    records: GroupedRecords;
    value: any;
    groupParent: IGroupByRecord;
 }
