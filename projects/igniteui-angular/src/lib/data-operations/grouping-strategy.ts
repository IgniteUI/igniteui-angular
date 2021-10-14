import { IgxSorting } from '../grids/common/strategy';
import { IGroupByRecord } from './groupby-record.interface';
import { IGroupingState } from './groupby-state.interface';
import { IGroupByResult } from './grouping-result.interface';

export class IgxGrouping extends IgxSorting {
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

