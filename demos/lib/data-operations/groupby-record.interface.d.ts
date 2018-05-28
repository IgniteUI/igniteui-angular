import { ISortingExpression } from "./sorting-expression.interface";
export declare class GroupedRecords extends Array<any> {
}
export interface IGroupByRecord {
    expression: ISortingExpression;
    level: number;
    records: GroupedRecords;
    value: any;
    __groupParent: IGroupByRecord;
}
