import { Pipe, PipeTransform } from '@angular/core';
import { cloneArray } from '../../core/utils';
import { DataUtil } from '../../data-operations/data-util';
import { IGroupByExpandState } from '../../data-operations/groupby-expand-state.interface';
import { IGroupByResult, ISortingStrategy } from '../../data-operations/sorting-strategy';
import { IFilteringExpressionsTree } from '../../data-operations/filtering-expressions-tree';
import { ISortingExpression } from '../../data-operations/sorting-expression.interface';
import { IgxGridComponent } from './grid.component';
import { IgxGridBaseComponent } from '../grid-base.component';
import { GridBaseAPIService } from '../api.service';
import { IgxGridAPIService } from './grid-api.service';

/**
 *@hidden
 */
@Pipe({
    name: 'gridSort',
    pure: true
})
export class IgxGridSortingPipe implements PipeTransform {

    constructor(private gridAPI: GridBaseAPIService<IgxGridBaseComponent>) { }

    public transform(collection: any[], expressions: ISortingExpression | ISortingExpression[],
        id: string, pipeTrigger: number): any[] {
        let strategy: ISortingStrategy;
        const state = { expressions: [], strategy };
        state.expressions = this.gridAPI.get(id).sortingExpressions;

        if (!state.expressions.length) {
            return collection;
        }

        // DataUtil.sort needs a sorting strategy to start with, so it makes sense to start with the strategy from the first expression
        // sorting-strategy.ts, sortDataRecursive method then takes care and use the corresponding strategy for each expression
        strategy = expressions[0].strategy;
        state.strategy = strategy;

        return DataUtil.sort(cloneArray(collection), state);
    }
}

/**
 *@hidden
 */
@Pipe({
    name: 'gridPreGroupBy',
    pure: true
})
export class IgxGridPreGroupingPipe implements PipeTransform {
    private gridAPI: IgxGridAPIService;

    constructor(gridAPI: GridBaseAPIService<IgxGridBaseComponent>) {
        this.gridAPI = <IgxGridAPIService>gridAPI;
    }

    public transform(collection: any[], expression: ISortingExpression | ISortingExpression[],
        expansion: IGroupByExpandState | IGroupByExpandState[], defaultExpanded: boolean,
        id: string, pipeTrigger: number): IGroupByResult {

        const state = { expressions: [], expansion: [], defaultExpanded };
        const grid: IgxGridComponent = this.gridAPI.get(id);
        state.expressions = grid.groupingExpressions;

        if (!state.expressions.length) {
            return {
                data: collection,
                metadata: collection
            };
        }

        state.expansion = grid.groupingExpansionState;
        state.defaultExpanded = grid.groupsExpanded;

        return DataUtil.group(cloneArray(collection), state);
    }
}

/**
 *@hidden
 */
@Pipe({
    name: 'gridPostGroupBy',
    pure: true
})
export class IgxGridPostGroupingPipe implements PipeTransform {
    private gridAPI: IgxGridAPIService;

    constructor(gridAPI: GridBaseAPIService<IgxGridBaseComponent>) {
        this.gridAPI = <IgxGridAPIService>gridAPI;
    }

    public transform(collection: IGroupByResult, expression: ISortingExpression | ISortingExpression[],
        expansion: IGroupByExpandState | IGroupByExpandState[], defaultExpanded: boolean,
        id: string, groupsRecords: any[], pipeTrigger: number): any[] {

        const state = { expressions: [], expansion: [], defaultExpanded };
        const grid: IgxGridComponent = this.gridAPI.get(id);
        state.expressions = grid.groupingExpressions;

        if (!state.expressions.length) {
            return collection.data;
        }

        state.expansion = grid.groupingExpansionState;
        state.defaultExpanded = grid.groupsExpanded;

        return DataUtil.restoreGroups({
            data: cloneArray(collection.data),
            metadata: cloneArray(collection.metadata)
        }, state, groupsRecords);
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

    constructor(private gridAPI: GridBaseAPIService<IgxGridBaseComponent>) { }

    public transform(collection: IGroupByResult, page = 0, perPage = 15, id: string, pipeTrigger: number): IGroupByResult {

        if (!this.gridAPI.get(id).paging) {
            return collection;
        }

        const state = {
            index: page,
            recordsPerPage: perPage
        };

        const result: IGroupByResult = {
            data: DataUtil.page(cloneArray(collection.data), state),
            metadata: DataUtil.page(cloneArray(collection.metadata), state)
        };
        this.gridAPI.get(id).pagingState = state;
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

    constructor(private gridAPI: GridBaseAPIService<IgxGridBaseComponent>) { }

    public transform(collection: any[], expressionsTree: IFilteringExpressionsTree,
        id: string, pipeTrigger: number) {
        const grid = this.gridAPI.get(id);
        const state = { expressionsTree: expressionsTree };

        if (!state.expressionsTree ||
            !state.expressionsTree.filteringOperands ||
            state.expressionsTree.filteringOperands.length === 0) {
            return collection;
        }

        const result = DataUtil.filter(cloneArray(collection), state);
        grid.filteredData = result;
        return result;
    }
}
