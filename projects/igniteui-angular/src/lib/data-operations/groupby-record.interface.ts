import { ColumnType } from '../grids/common/grid.interface';
import { ISortingExpression } from './sorting-strategy';

/**
 * @hidden
 */
export class GroupedRecords extends Array<any> {}

export interface IGroupByRecord {
    expression: ISortingExpression;
    level: number;
    /* alternateType: any[] */
    records: GroupedRecords;
    value: any;
    groupParent: IGroupByRecord;
    groups?: IGroupByRecord[];
    height: number;
    column?: ColumnType;
 }
