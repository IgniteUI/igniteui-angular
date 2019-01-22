import { Pipe, PipeTransform } from '@angular/core';
import { cloneArray } from '../../core/utils';
import { GridBaseAPIService } from '../api.service';
import { IgxHierarchicalGridComponent } from './hierarchical-grid.component';
import { DataUtil } from '../../data-operations/data-util';

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

        return result;
    }

    public addHierarchy<T>(grid, data: T[], state, primaryKey, childKeys: string[]): T[] {
        const result = [];
        const layoutsExpanded = grid.childLayoutList.filter(item => item.shouldExpandAllChildren).length;
        const layoutsCollapsed = grid.childLayoutList.filter(item => item.shouldCollapseAllChildren).length;

        if (layoutsCollapsed) {
            // Splice it to keep the reference to the object
            state.splice(0, state.length);
        }

        data.forEach((v) => {
            result.push(v);
            childKeys.forEach((childKey) => {
                const childData = v[childKey] ? v[childKey] : null;
                if (!layoutsCollapsed && grid.isExpanded(v)) {
                    result.push({ rowID: primaryKey ? v[primaryKey] : v, childGridData: childData, key: childKey });
                } else if (layoutsExpanded) {
                    result.push({ rowID: primaryKey ? v[primaryKey] : v, childGridData: childData, key: childKey });
                    state.push({ rowID: primaryKey ? v[primaryKey] : v });
                }
            });
        });
        return result;
    }
}

/**
 *@hidden
 */
@Pipe({
    name: 'gridHierarchicalPaging',
    pure: true
})
export class IgxGridHierarchicalPagingPipe implements PipeTransform {

    constructor(private gridAPI: GridBaseAPIService<IgxHierarchicalGridComponent>) { }

    public transform(collection: any[], page = 0, perPage = 15, id: string, pipeTrigger: number): any[] {

        if (!this.gridAPI.get(id).paging) {
            return collection;
        }

        const state = {
            index: page,
            recordsPerPage: perPage
        };

        const result: any[] = DataUtil.page(cloneArray(collection), state);
        this.gridAPI.get(id).pagingState = state;
        return result;
    }
}
