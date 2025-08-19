import { Inject, Pipe, PipeTransform } from '@angular/core';
import { cloneArray } from '../../core/utils';
import { DataUtil } from '../../data-operations/data-util';
import { IGroupByExpandState } from '../../data-operations/groupby-expand-state.interface';
import { IGroupByResult } from '../../data-operations/grouping-result.interface';
import { IFilteringExpressionsTree, FilteringExpressionsTree } from '../../data-operations/filtering-expressions-tree';
import { IGroupingExpression } from '../../data-operations/grouping-expression.interface';
import { ColumnType, GridType, IGX_GRID_BASE } from '../common/grid.interface';
import { FilterUtil, IFilteringStrategy } from '../../data-operations/filtering-strategy';
import { ISortingExpression } from '../../data-operations/sorting-strategy';
import { IGridSortingStrategy, IGridGroupingStrategy } from '../common/strategy';
import { GridCellMergeMode } from '../common/enums';
import { IGridMergeStrategy } from '../../data-operations/merge-strategy';

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
        if (!pinned && this.grid.isPinningToStart) {
            activeRowIndexes = activeRowIndexes.map(x => x - this.grid.pinnedRecordsCount);
        }
        const result = cloneArray(collection) as any;
        activeRowIndexes = activeRowIndexes.filter((val, idx, arr) => arr.indexOf(val) === idx).filter(x => !isNaN(x));
        const rootsToUpdate = [];
        activeRowIndexes.forEach(index => {
            const target = collection[index];
            colsToMerge.forEach(col => {
                const colMeta = target.cellMergeMeta.get(col.field);
                const root = colMeta.root || target;
                rootsToUpdate.push(root);
            });
        });

        rootsToUpdate.forEach(x => {
            const index = result.indexOf(x);
            const colKeys = [...x.cellMergeMeta.keys()];
            const cols = colsToMerge.filter(x => colKeys.indexOf(x.field) !== -1);
            for (const col of cols) {
                const rs = x.cellMergeMeta.get(col.field).rowSpan;
                let childData = x.cellMergeMeta.get(col.field).childRecords;
                const childRecs = childData.map(x => x.recordRef);
                const isDate = col?.dataType === 'date' || col?.dataType === 'dateTime';
                const isTime = col?.dataType === 'time' || col?.dataType === 'dateTime';
                const res = this.grid.mergeStrategy.merge(
                    [x.recordRef, ...childRecs],
                    col.field,
                    col.mergingComparer,
                    [],
                    activeRowIndexes,
                    isDate,
                    isTime,
                    this.grid);
                result.splice(index, index + rs, ...res);
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
