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
        state = new Map<any, boolean>(),
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

        data.forEach((v: any) => {
            result.push(v);
            if (v.ghostRec !== undefined) {
                v = v.recordData;
            }

            const childGridsData = {};
            childKeys.forEach((childKey) => {
                const childData = v[childKey] ? v[childKey] : null;
                childGridsData[childKey] = childData;
            });
            if (grid.gridAPI.get_row_expansion_state(v)) {
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

/**
 *@hidden
 */
@Pipe({
    name: 'gridHierarchicalRowPinning',
    pure: true
})
export class IgxGridHierarchicalRowPinning implements PipeTransform {

    constructor(private gridAPI: GridBaseAPIService<IgxHierarchicalGridComponent>) { }

    public transform(collection: any[], pinnedArea: boolean, pipeTrigger: number): any[] {
        const grid = this.gridAPI.grid;

        if (grid.hasPinnedRecords && pinnedArea) {
            return collection.filter(rec => grid.isRecordPinned(rec));
        }

        const result = collection.map((value) => {
            return grid.isRecordPinned(value) ? { recordData: value, ghostRec: true} : value;
        });
        return result;
    }
}
