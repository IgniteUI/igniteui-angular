import { Inject, Pipe, PipeTransform } from '@angular/core';
import { cloneArray, resolveNestedPath } from '../../core/utils';
import { DataUtil } from '../../data-operations/data-util';
import { GridPagingMode } from '../common/enums';
import { GridType, IGX_GRID_BASE } from '../common/grid.interface';

/**
 * @hidden
 */
@Pipe({
    name: 'gridHierarchical',
    standalone: true
})
export class IgxGridHierarchicalPipe implements PipeTransform {

    constructor(@Inject(IGX_GRID_BASE) private grid: GridType) { }

    public transform(
        collection: any,
        state = new Map<any, boolean>(),
        id: string,
        primaryKey: any,
        childKeys: string[],
        _pipeTrigger: number
    ): any[] {
        if (childKeys.length === 0) {
            return collection;
        }
        if (this.grid.verticalScrollContainer.isRemote) {
            return collection;
        }
        const result = this.addHierarchy(this.grid, cloneArray(collection), state, primaryKey, childKeys);

        return result;
    }

    public addHierarchy<T>(grid, data: T[], state, primaryKey, childKeys: string[]): T[] {
        const result = [];

        data.forEach((v) => {
            result.push(v);
            const childGridsData = {};
            childKeys.forEach((childKey) => {
                if (!v[childKey]) {
                    v[childKey] = [];
                }
                const hasNestedPath = childKey?.includes('.');
                const childData = !hasNestedPath ? v[childKey] : resolveNestedPath(v, childKey);
                childGridsData[childKey] = childData;
            });
            if (grid.gridAPI.get_row_expansion_state(v)) {
                result.push({ rowID: primaryKey ? v[primaryKey] : v, childGridsData });
            }
        });
        return result;
    }
}

/**
 * @hidden
 */
@Pipe({
    name: 'gridHierarchicalPaging',
    standalone: true
})
export class IgxGridHierarchicalPagingPipe implements PipeTransform {

    constructor(@Inject(IGX_GRID_BASE) private grid: GridType) { }

    public transform(collection: any[], enabled: boolean, page = 0, perPage = 15, _id: string, _pipeTrigger: number): any[] {
        if (!enabled || this.grid.pagingMode !== GridPagingMode.Local) {
            return collection;
        }

        const state = {
            index: page,
            recordsPerPage: perPage
        };

        const total = this.grid._totalRecords >= 0 ? this.grid._totalRecords : collection.length;
        const result: any[] = DataUtil.page(cloneArray(collection), state, total);
        this.grid.pagingState = state;
        return result;

    }
}
