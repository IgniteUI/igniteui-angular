import { Inject, Pipe, PipeTransform } from '@angular/core';
import { IGridSortingStrategy, IGridGroupingStrategy, cloneArray, DataUtil, FilteringExpressionsTree, FilterUtil, IFilteringExpressionsTree, IFilteringStrategy, IGridMergeStrategy, IGroupByExpandState, IGroupingExpression, ISortingExpression, IGroupByResult, ColumnType, IMergeByResult } from 'igniteui-angular/core';
import { GridCellMergeMode, RowPinningPosition, GridType, IGX_GRID_BASE } from 'igniteui-angular/grids/core';

/**
 * @hidden
 */
@Pipe({
    name: 'gridSort',
    standalone: true
})
export class IgxGridSortingPipe implements PipeTransform {

    constructor(@Inject(IGX_GRID_BASE) private grid: GridType) { }

    public transform(collection: any[], sortExpressions: ISortingExpression[], groupExpressions: IGroupingExpression[], sorting: IGridSortingStrategy,
        id: string, pipeTrigger: number, pinned?): any[] {
        let result: any[];
        const expressions = groupExpressions.concat(sortExpressions);
        if (!expressions.length) {
            result = collection;
        } else {
            result = DataUtil.sort(cloneArray(collection), expressions, sorting, this.grid);
        }
        this.grid.setFilteredSortedData(result, pinned);

        return result;
    }
}

/**
 * @hidden
 */
@Pipe({
    name: 'gridGroupBy',
    standalone: true
})
export class IgxGridGroupingPipe implements PipeTransform {

    constructor(@Inject(IGX_GRID_BASE) private grid: GridType) { }

    public transform(collection: any[], expression: IGroupingExpression | IGroupingExpression[],
        expansion: IGroupByExpandState | IGroupByExpandState[],
        groupingStrategy: IGridGroupingStrategy, defaultExpanded: boolean,
        id: string, groupsRecords: any[], _pipeTrigger: number): IGroupByResult {

        const state = { expressions: [], expansion: [], defaultExpanded };
        state.expressions = this.grid.groupingExpressions;
        let result: IGroupByResult;
        const fullResult: IGroupByResult = { data: [], metadata: [] };

        if (!state.expressions.length) {
            // empty the array without changing reference
            groupsRecords.splice(0, groupsRecords.length);
            result = {
                data: collection,
                metadata: collection
            };
        } else {
            state.expansion = this.grid.groupingExpansionState;
            state.defaultExpanded = this.grid.groupsExpanded;
            result = DataUtil.group(cloneArray(collection), state, groupingStrategy, this.grid, groupsRecords, fullResult);
        }
        this.grid.groupingFlatResult = result.data;
        this.grid.groupingResult = fullResult.data;
        this.grid.groupingMetadata = fullResult.metadata;
        return result;
    }
}

@Pipe({
    name: 'gridCellMerge',
    standalone: true
})
export class IgxGridCellMergePipe implements PipeTransform {

    constructor(@Inject(IGX_GRID_BASE) private grid: GridType) { }

    public transform(collection: any, colsToMerge: ColumnType[], mergeMode: GridCellMergeMode, mergeStrategy: IGridMergeStrategy, _pipeTrigger: number) {
        if (colsToMerge.length === 0) {
            return collection;
        }
        const result = DataUtil.merge(collection, colsToMerge, mergeStrategy, [], this.grid);
        return result;
    }
}

@Pipe({
    name: 'gridUnmergeActive',
    standalone: true
})
export class IgxGridUnmergeActivePipe implements PipeTransform {

    constructor(@Inject(IGX_GRID_BASE) private grid: GridType) { }

    public transform(collection: any, colsToMerge: ColumnType[], activeRowIndexes: number[], pinned: boolean, _pipeTrigger: number) {
        if (colsToMerge.length === 0) {
            return collection;
        }
        if (this.grid.hasPinnedRecords && !pinned && this.grid.pinning.rows !== RowPinningPosition.Bottom) {
            activeRowIndexes = activeRowIndexes.map(x => x - this.grid.pinnedRecordsCount);
        }
        activeRowIndexes = Array.from(new Set(activeRowIndexes)).filter(x => !isNaN(x));
        const rootsToUpdate = [];
        activeRowIndexes.forEach(index => {
            const target = collection[index];
            if (target && target.cellMergeMeta) {
                colsToMerge.forEach(col => {
                    const colMeta = target.cellMergeMeta.get(col.field);
                    const root = colMeta.root ||  (colMeta.rowSpan > 1 ? target : null);
                    if (root) {
                        rootsToUpdate.push(root);
                    }
                });
            }
        });
        const uniqueRoots =  Array.from(new Set(rootsToUpdate));
        if (uniqueRoots.length === 0) {
            // if nothing to update, return
            return collection;
        }

        let result = cloneArray(collection) as any;
        uniqueRoots.forEach(x => {
            const index = collection.indexOf(x);
            const colKeys = [...x.cellMergeMeta.keys()];
            const cols = colsToMerge.filter(col => colKeys.indexOf(col.field) !== -1);
            for (const col of cols) {
                const childData = x.cellMergeMeta.get(col.field).childRecords;
                const childRecs = childData.map(rec => rec.recordRef);
                if(childRecs.length === 0) {
                    // nothing to unmerge
                    continue;
                }
                const unmergedData = DataUtil.merge([x.recordRef, ...childRecs], [col], this.grid.mergeStrategy, activeRowIndexes.map(ri => ri - index), this.grid);
                for (let i = 0; i < unmergedData.length; i++) {
                    const unmergedRec = unmergedData[i];
                    const origRecord = result[index + i];
                    if (unmergedRec.cellMergeMeta?.get(col.field)) {
                        // clone of object, since we don't want to pollute the original fully merged collection.
                        const objCopy = {
                            recordRef: origRecord.recordRef,
                            ghostRecord: origRecord.ghostRecord,
                            cellMergeMeta: new Map<string, IMergeByResult>(origRecord.cellMergeMeta.entries())
                        };
                        // update copy with new meta from unmerged data record, but just for this column
                        objCopy.cellMergeMeta?.set(col.field, unmergedRec.cellMergeMeta.get(col.field));
                        result[index + i] = objCopy;
                    } else {
                        // this is the unmerged record, with no merge metadata
                        result[index + i] = unmergedRec;
                    }
                }
            }
        });
        return result;
    }
}

/**
 * @hidden
 */
@Pipe({
    name: 'gridPaging',
    standalone: true
})
export class IgxGridPagingPipe implements PipeTransform {

    constructor(@Inject(IGX_GRID_BASE) private grid: GridType) { }

    public transform(collection: IGroupByResult, enabled: boolean, page = 0, perPage = 15, _: number): IGroupByResult {
        if (!enabled || this.grid.pagingMode !== 'local') {
            return collection;
        }
        const state = {
            index: page,
            recordsPerPage: perPage
        };
        const total = this.grid._totalRecords >= 0 ? this.grid._totalRecords : collection.data?.length;
        DataUtil.correctPagingState(state, total);

        const result = {
            data: DataUtil.page(cloneArray(collection.data), state, total),
            metadata: DataUtil.page(cloneArray(collection.metadata), state, total)
        };
        if (this.grid.page !== state.index) {
            this.grid.page = state.index;
        }
        this.grid.pagingState = state;
        return result;
    }
}

/**
 * @hidden
 */
@Pipe({
    name: 'gridFiltering',
    standalone: true
})
export class IgxGridFilteringPipe implements PipeTransform {

    constructor(@Inject(IGX_GRID_BASE) private grid: GridType) { }

    public transform(collection: any[], expressionsTree: IFilteringExpressionsTree,
        filterStrategy: IFilteringStrategy,
        advancedExpressionsTree: IFilteringExpressionsTree, id: string, pipeTrigger: number, filteringPipeTrigger: number, pinned?) {
        const state = {
            expressionsTree,
            strategy: filterStrategy,
            advancedExpressionsTree
        };

        if (FilteringExpressionsTree.empty(state.expressionsTree) && FilteringExpressionsTree.empty(state.advancedExpressionsTree)) {
            return collection;
        }

        const result = FilterUtil.filter(cloneArray(collection), state, this.grid);
        this.grid.setFilteredData(result, pinned);
        return result;
    }
}
