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
        const grid: IgxHierarchicalGridComponent = this.gridAPI.grid;
        const result = this.addHierarchy(grid, cloneArray(collection), state, primaryKey, childKeys);

        return result;
    }

    public addHierarchy<T>(grid, data: T[], state, primaryKey, childKeys: string[]): T[] {
        const result = [];

        data.forEach((v) => {
            result.push(v);
            const childGridsData = {};
            childKeys.forEach((childKey) => {
                const childData = v[childKey] ? v[childKey] : null;
                childGridsData[childKey] = childData;
            });
            if (grid.isExpanded(v)) {
                result.push({ rowID: primaryKey ? v[primaryKey] : v, childGridsData: childGridsData});
            }
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

        if (!this.gridAPI.grid.paging) {
            return collection;
        }

        const state = {
            index: page,
            recordsPerPage: perPage
        };

        const result: any[] = DataUtil.page(cloneArray(collection), state);
        this.gridAPI.grid.pagingState = state;
        return result;
    }
}
