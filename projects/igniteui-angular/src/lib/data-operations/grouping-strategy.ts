import { IGroupByRecord } from './groupby-record.interface';
import { IgxSorting, IGridSortingStrategy } from './sorting-strategy';
import { IGroupingState } from './groupby-state.interface';
import { IGroupByResult } from './grouping-result.interface';


export interface IGridGroupingStrategy extends IGridSortingStrategy {
    groupBy(data: any[], state: IGroupingState, grid?: any, groupsRecords?: any[], fullResult?: IGroupByResult): IGroupByResult;
}

export class IgxGrouping extends IgxSorting implements IGridGroupingStrategy {
    public groupBy(data: any[], state: IGroupingState, grid?: any,
        groupsRecords?: any[], fullResult: IGroupByResult = { data: [], metadata: [] }): IGroupByResult {
        const metadata: IGroupByRecord[] = [];
        const grouping = this.groupDataRecursive(data, state, 0, null, metadata, grid, groupsRecords, fullResult);
        return {
            data: grouping,
            metadata
        };
    }
}

