import { DataUtil } from '../../data-operations/data-util';
import { Pipe, PipeTransform } from '@angular/core';
import { IGridAPIService } from '../api.service';
import { IGridComponent } from './grid-interfaces';
import { ISortingExpression } from '../../data-operations/sorting-expression.interface';
import { cloneArray } from '../../core/utils';
import { IFilteringExpressionsTree } from '../../data-operations/filtering-expressions-tree';


/**
 *@hidden
 */
@Pipe({
    name: 'gridSort',
    pure: true
})
export class IgxGridSortingPipe implements PipeTransform {

    constructor(private gridAPI: IGridAPIService<IGridComponent>) { }

    public transform(collection: any[], expressions: ISortingExpression | ISortingExpression[],
        id: string, pipeTrigger: number): any[] {

        const state = { expressions: [] };
        state.expressions = this.gridAPI.get(id).sortingExpressions;

        if (!state.expressions.length) {
            return collection;
        }

        return DataUtil.sort(cloneArray(collection), state);
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

    constructor(private gridAPI: IGridAPIService<IGridComponent>) { }

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

/**
 *@hidden
 */
@Pipe({
    name: 'filterCondition',
    pure: true
})
export class IgxGridFilterConditionPipe implements PipeTransform {

    public transform(value: string): string {
        return value.split(/(?=[A-Z])/).join(' ');
    }
}
