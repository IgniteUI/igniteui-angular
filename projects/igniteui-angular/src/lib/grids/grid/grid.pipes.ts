import { Pipe, PipeTransform } from '@angular/core';
import { cloneArray } from '../../core/utils';
import { DataUtil } from '../../data-operations/data-util';
import { IGroupByExpandState } from '../../data-operations/groupby-expand-state.interface';
import { IGroupByResult } from '../../data-operations/grouping-result.interface';
import { IFilteringExpressionsTree, FilteringExpressionsTree } from '../../data-operations/filtering-expressions-tree';
import { ISortingExpression } from '../../data-operations/sorting-expression.interface';
import { IgxGridAPIService } from './grid-api.service';
import { IgxGridComponent } from './grid.component';
import { IGroupingExpression } from '../../data-operations/grouping-expression.interface';
import { GridBaseAPIService } from '../api.service';
import { IgxGridBaseComponent, IGridDataBindable } from '../grid-base.component';
import { IFilteringStrategy } from '../../data-operations/filtering-strategy';

/**
 *@hidden
 */
@Pipe({
    name: 'gridSort',
    pure: true
})
export class IgxGridSortingPipe implements PipeTransform {
    private gridAPI: IgxGridAPIService;

    constructor(gridAPI: GridBaseAPIService<IgxGridBaseComponent & IGridDataBindable>) {
        this.gridAPI = <IgxGridAPIService>gridAPI;
    }

    public transform(collection: any[], expressions: ISortingExpression[], id: string, pipeTrigger: number): any[] {
        const grid = this.gridAPI.grid;
        let result: any[];

        if (!expressions.length) {
            result = collection;
        } else {
            result = DataUtil.sort(cloneArray(collection), expressions);
        }
        grid.filteredSortedData = result;

        return result;
    }
}

/**
 *@hidden
 */
@Pipe({
    name: 'gridGroupBy',
    pure: true
})
export class IgxGridGroupingPipe implements PipeTransform {
    private gridAPI: IgxGridAPIService;

    constructor(gridAPI: GridBaseAPIService<IgxGridBaseComponent & IGridDataBindable>) {
        this.gridAPI = <IgxGridAPIService>gridAPI;
    }

    public transform(collection: any[], expression: IGroupingExpression | IGroupingExpression[],
        expansion: IGroupByExpandState | IGroupByExpandState[], defaultExpanded: boolean,
        id: string, groupsRecords: any[], pipeTrigger: number): IGroupByResult {

        const state = { expressions: [], expansion: [], defaultExpanded };
        const grid: IgxGridComponent = this.gridAPI.grid;
        state.expressions = grid.groupingExpressions;
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
            state.expansion = grid.groupingExpansionState;
            state.defaultExpanded = grid.groupsExpanded;
            result = DataUtil.group(cloneArray(collection), state, grid, groupsRecords, fullResult);
        }
        grid.groupingFlatResult = result.data;
        grid.groupingResult = fullResult.data;
        grid.groupingMetadata = fullResult.metadata;
        return result;
    }
}

/**
 *@hidden
 */
@Pipe({
    name: 'gridPaging',
    pure: true
})
export class IgxGridPagingPipe implements PipeTransform {

    constructor(private gridAPI: GridBaseAPIService<IgxGridBaseComponent & IGridDataBindable>) { }

    public transform(collection: IGroupByResult, page = 0, perPage = 15, id: string, pipeTrigger: number): IGroupByResult {

        if (!this.gridAPI.grid.paging) {
            return collection;
        }

        const state = {
            index: page,
            recordsPerPage: perPage
        };
        DataUtil.correctPagingState(state, collection.data.length);

        const result = {
            data: DataUtil.page(cloneArray(collection.data), state),
            metadata: DataUtil.page(cloneArray(collection.metadata), state)
        };
        if (this.gridAPI.grid.page !== state.index) {
            this.gridAPI.grid.page = state.index;
        }
        this.gridAPI.grid.pagingState = state;
        return result;
    }
}

/**
 *@hidden
 */
@Pipe({
    name: 'gridFiltering',
    pure: true
})
export class IgxGridFilteringPipe implements PipeTransform {

    constructor(private gridAPI: GridBaseAPIService<IgxGridBaseComponent & IGridDataBindable>) { }

    public transform(collection: any[], expressionsTree: IFilteringExpressionsTree,
        filterStrategy: IFilteringStrategy,
        advancedExpressionsTree: IFilteringExpressionsTree, id: string, pipeTrigger: number) {
        const grid = this.gridAPI.grid;
        const state = {
            expressionsTree: expressionsTree,
            strategy: filterStrategy,
            advancedExpressionsTree: advancedExpressionsTree
        };

        if (FilteringExpressionsTree.empty(state.expressionsTree) && FilteringExpressionsTree.empty(state.advancedExpressionsTree)) {
            return collection;
        }

        const result = DataUtil.filter(cloneArray(collection), state);
        grid.filteredData = result;
        return result;
    }
}
