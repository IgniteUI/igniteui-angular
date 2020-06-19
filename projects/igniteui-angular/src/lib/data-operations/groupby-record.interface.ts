import { ISortingExpression } from './sorting-expression.interface';
import { IgxColumnComponent } from '../grids/columns/column.component';

/**
 * @hidden
 */
export class GroupedRecords extends Array<any> {}

export interface IGroupByRecord {
    expression: ISortingExpression;
    level: number;
    records: GroupedRecords;
    value: any;
    groupParent: IGroupByRecord;
    groups?: IGroupByRecord[];
    height: number;
    column?: IgxColumnComponent;
 }
