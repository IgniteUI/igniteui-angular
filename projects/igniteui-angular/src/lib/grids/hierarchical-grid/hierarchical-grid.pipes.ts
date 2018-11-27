import { Pipe, PipeTransform } from '@angular/core';
import { cloneArray } from '../../core/utils';
import { IGroupByResult } from '../../data-operations/grouping-strategy';
import { GridBaseAPIService } from '../api.service';
import { IgxHierarchicalGridComponent } from './hierarchical-grid.component';

/**
 *@hidden
 */
@Pipe({
    name: 'gridHierarchical',
    pure: true
})
export class IgxGridHierarchicalPipe implements PipeTransform {

    constructor(private gridAPI: GridBaseAPIService<IgxHierarchicalGridComponent>) { }

    public transform(
        collection: any,
        state = [],
        id: string,
        primaryKey: any,
        childKeys: string[],
        pipeTrigger: number
        ): any[] {
        if (childKeys.length === 0) {
            return collection;
        }
        const grid: IgxHierarchicalGridComponent = this.gridAPI.get(id);
        const result = this.addHierarchy(grid, cloneArray(collection), state, primaryKey, childKeys);

        grid.dataInitialized = true;
        return result;
    }

    public addHierarchy<T>(grid, data: T[], state, primaryKey, childKeys: string[]): T[] {
        const result = [];
        const layoutsExpanded = grid.childLayoutList
            .map(item => item.childrenExpanded ? 1 : 0)
            .reduce((prev, cur) => prev + cur, 0);

        data.forEach((v) => {
            result.push(v);
            childKeys.forEach((childKey) => {
                if (v[childKey] && grid.isExpanded(v)) {
                    result.push({ rowID: primaryKey ? v[primaryKey] : v, childGridData: v[childKey], key: childKey });
                } else if (v[childKey] && !grid.dataInitialized && layoutsExpanded) {
                    result.push({ rowID: primaryKey ? v[primaryKey] : v, childGridData: v[childKey], key: childKey });
                    state.push({ rowID: primaryKey ? v[primaryKey] : v });
                }
            });
        });
        return result;
    }
}
