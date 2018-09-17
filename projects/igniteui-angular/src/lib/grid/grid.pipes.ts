import { Pipe, PipeTransform } from '@angular/core';
import { cloneArray } from '../core/utils';
import { DataUtil } from '../data-operations/data-util';
import { IGroupByExpandState } from '../data-operations/groupby-expand-state.interface';
import { IGroupByResult } from '../data-operations/sorting-strategy';
import { ISortingExpression } from '../data-operations/sorting-expression.interface';
import { IgxGridAPIService } from './grid-api.service';
import { IGridComponent } from '../grid-common/common/grid-interfaces';
import { IGridAPIService } from '../grid-common/api.service';
import { IgxGridComponent } from './grid.component';

/**
 *@hidden
 */
@Pipe({
    name: 'gridPreGroupBy',
    pure: true
})
export class IgxGridPreGroupingPipe implements PipeTransform {
    private gridAPI: IgxGridAPIService;

    constructor(gridAPI: IGridAPIService<IGridComponent>) {
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

    constructor(gridAPI: IGridAPIService<IGridComponent>) {
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
    private gridAPI: IgxGridAPIService;

    constructor(gridAPI: IGridAPIService<IGridComponent>) {
        this.gridAPI = <IgxGridAPIService>gridAPI;
    }

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
