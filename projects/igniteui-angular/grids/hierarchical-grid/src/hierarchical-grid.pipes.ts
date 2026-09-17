import { Pipe, PipeTransform, inject } from '@angular/core';
import { GridType, IGX_GRID_BASE } from 'igniteui-angular/grids/core';
import { cloneArray, columnFieldPath, DataUtil, resolveNestedPath } from 'igniteui-angular/core';

/**
 * @hidden
 */
@Pipe({
    name: 'gridHierarchical',
    standalone: true
})
export class IgxGridHierarchicalPipe implements PipeTransform {
    private grid = inject<GridType>(IGX_GRID_BASE);

    public transform(
        collection: any,
        state = new Map<any, boolean>(),
        _id: string,
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

    public addHierarchy<T>(grid: GridType, data: T[], _state: Map<any, boolean>, primaryKey: any, childKeys: string[]): T[] {
        const result: any[] = [];

        data.forEach((v: any) => {
            result.push(v);
            const childGridsData: any = {};
            childKeys.forEach((childKey) => {
                if (!v[childKey]) {
                    v[childKey] = [];
                }
                const hasNestedPath = childKey?.includes('.');
                const childData = !hasNestedPath ? v[childKey] : resolveNestedPath(v, columnFieldPath(childKey));
                childGridsData[childKey] = childData;
            });
            if (grid.gridAPI.get_row_expansion_state(v)) {
                result.push({ rowID: primaryKey ? v[primaryKey] : v, childGridsData, parentRowData: v });
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
    private grid = inject<GridType>(IGX_GRID_BASE);


    public transform(collection: any[], enabled: boolean, page = 0, perPage = 15, _id: string, _pipeTrigger: number): any[] {
        if (!enabled || this.grid.pagingMode !== 'local') {
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
