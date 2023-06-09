import { Inject, Pipe, PipeTransform } from '@angular/core';
import { cloneArray } from '../../core/utils';
import { DataUtil } from '../../data-operations/data-util';
import { IGroupByExpandState } from '../../data-operations/groupby-expand-state.interface';
import { IGroupByResult } from '../../data-operations/grouping-result.interface';
import { IFilteringExpressionsTree, FilteringExpressionsTree } from '../../data-operations/filtering-expressions-tree';
import { IGroupingExpression } from '../../data-operations/grouping-expression.interface';
import { GridType, IGX_GRID_BASE } from '../common/grid.interface';
import { FilterUtil, IFilteringStrategy } from '../../data-operations/filtering-strategy';
import { GridPagingMode } from '../common/enums';
import { ISortingExpression } from '../../data-operations/sorting-strategy';
import { IGridSortingStrategy, IGridGroupingStrategy } from '../common/strategy';

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
        if (!enabled || this.grid.pagingMode !== GridPagingMode.Local) {
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
