import { IGroupByRecord } from './groupby-record.interface';
import { ISortingExpression } from './sorting-expression.interface';
import { IgxSorting } from './sorting-strategy';

export interface IGroupByResult {
    data: any[];
    metadata: IGroupByRecord[];
}

export class IgxGrouping extends IgxSorting {
    public groupBy(data: any[], expressions: ISortingExpression[], rowHeight: number, groupsRecords?: any[]): IGroupByResult {
        const metadata: IGroupByRecord[] = [];
        const grouping = this.groupDataRecursive(data, expressions, 0, null, metadata, rowHeight, groupsRecords);
        return {
            data: grouping,
            metadata: metadata
        };
    }
}

