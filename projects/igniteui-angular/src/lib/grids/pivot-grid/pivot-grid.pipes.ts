import { Pipe, PipeTransform } from '@angular/core';
import { cloneArray } from '../../core/utils';
import { DataUtil } from '../../data-operations/data-util';
import { FilteringExpressionsTree, IFilteringExpressionsTree } from '../../data-operations/filtering-expressions-tree';
import { IFilteringStrategy } from '../../data-operations/filtering-strategy';
import { IPivotConfiguration, IPivotKeys } from './pivot-grid.interface';
import { DefaultPivotSortingStrategy, DimensionValuesFilteringStrategy, PivotColumnDimensionsStrategy,
     PivotRowDimensionsStrategy } from '../../data-operations/pivot-strategy';
import { PivotUtil } from './pivot-util';
import { FilteringLogic } from '../../data-operations/filtering-expression.interface';
import { ISortingExpression, SortingDirection } from '../../data-operations/sorting-strategy';
import { GridType } from '../common/grid.interface';
import { GridBaseAPIService } from '../api.service';
import { IgxGridBaseDirective } from '../grid-base.directive';
import { IGridSortingStrategy } from '../common/strategy';
/**
 * @hidden
 */
@Pipe({
    name: 'pivotGridRow',
    pure: true
})
export class IgxPivotRowPipe implements PipeTransform {

    constructor() { }

    public transform(
        collection: any,
        config: IPivotConfiguration,
        _: Map<any, boolean>,
        _pipeTrigger?: number,
        __?,
        pivotKeys: IPivotKeys = { aggregations: 'aggregations', records: 'records', children: 'children', level: 'level' }
    ): any[] {
        const enabledRows = config.rows.filter(x => x.enabled);
        const rowStrategy = config.rowStrategy || PivotRowDimensionsStrategy.instance();
        const data = cloneArray(collection, true);
        return rowStrategy.process(data, enabledRows, config.values, pivotKeys);
    }
}

/**
 * @hidden
 */
@Pipe({
    name: 'pivotGridRowExpansion',
    pure: true
})
export class IgxPivotRowExpansionPipe implements PipeTransform {

    constructor() { }

    public transform(
        collection: any[],
        config: IPivotConfiguration,
        expansionStates: Map<any, boolean>,
        _pipeTrigger?: number,
        __?,
        pivotKeys: IPivotKeys = { aggregations: 'aggregations', records: 'records', children: 'children', level: 'level' }
    ): any[] {
        const enabledRows = config.rows.filter(x => x.enabled);
        const data = collection ? cloneArray(collection, true) : [];
        let totalLlv = 0;
        const prevDims = [];
        for (const row of enabledRows) {
            const lvl = PivotUtil.getDimensionDepth(row);
            totalLlv += lvl;
            PivotUtil.flattenHierarchy(data, config, row, expansionStates, pivotKeys, totalLlv, prevDims, 0);
            prevDims.push(row);
        }
        this.cleanState(data, pivotKeys);
        return data;
    }

    private cleanState(data, pivotKeys) {
        data.forEach(rec => {
            const keys = Object.keys(rec);
            //remove all record keys from final data since we don't need them anymore.
            keys.forEach(k => {
                if (k.indexOf(pivotKeys.records) !== -1) {
                    delete rec[k];
                }
            });
        });
    }
}


/**
 * @hidden
 */
@Pipe({
    name: 'pivotGridColumn',
    pure: true
})
export class IgxPivotColumnPipe implements PipeTransform {

    public transform(
        collection: any,
        config: IPivotConfiguration,
        _: Map<any, boolean>,
        _pipeTrigger?: number,
        __?,
        pivotKeys: IPivotKeys = { aggregations: 'aggregations', records: 'records', children: 'children', level: 'level' }
    ): any[] {
        const enabledColumns = config.columns.filter(x => x.enabled);
        const enabledValues = config.values.filter(x => x.enabled);

        const colStrategy = config.columnStrategy || PivotColumnDimensionsStrategy.instance();
        const data = cloneArray(collection, true);
        return colStrategy.process(data, enabledColumns, enabledValues, pivotKeys);
    }
}

/**
 * @hidden
 */
@Pipe({
    name: 'pivotGridFilter',
    pure: true
})
export class IgxPivotGridFilterPipe implements PipeTransform {
    constructor(private gridAPI: GridBaseAPIService<IgxGridBaseDirective & GridType>) { }
    public transform(collection: any[],
        config: IPivotConfiguration,
        filterStrategy: IFilteringStrategy,
        advancedExpressionsTree: IFilteringExpressionsTree,
        _filterPipeTrigger: number,
        _pipeTrigger: number): any[] {
        const allDimensions = config.rows.concat(config.columns).concat(config.filters).filter(x => x !== null);
        const enabledDimensions = allDimensions.filter(x => x && x.enabled);

        const expressionsTree = new FilteringExpressionsTree(FilteringLogic.And);
        // add expression trees from all filters
        PivotUtil.flatten(enabledDimensions).forEach(x => {
            if (x.filters) {
                expressionsTree.filteringOperands.push(x.filters);
            }
        });
        const state = {
            expressionsTree,
            strategy: filterStrategy || new DimensionValuesFilteringStrategy(),
            advancedExpressionsTree
        };

        if (FilteringExpressionsTree.empty(state.expressionsTree) && FilteringExpressionsTree.empty(state.advancedExpressionsTree)) {
            return collection;
        }

        const result = DataUtil.filter(cloneArray(collection, true), state, this.gridAPI.grid);

        return result;
    }
}


/**
 * @hidden
 */
@Pipe({
    name: 'pivotGridColumnSort',
    pure: true
})
export class IgxPivotGridColumnSortingPipe implements PipeTransform {

    public transform(
        collection: any[],
        expressions: ISortingExpression[],
        sorting: IGridSortingStrategy,
        pipeTrigger: number,
        pivotKeys: IPivotKeys = { aggregations: 'aggregations', records: 'records', children: 'children', level: 'level' }
    ): any[] {
        let result: any[];

        if (!expressions.length) {
            result = collection;
        } else {
            result = PivotUtil.sort(cloneArray(collection, true), expressions, sorting, pivotKeys);
        }
        return result;
    }
}

/**
 * @hidden
 */
 @Pipe({
    name: 'pivotGridSort',
    pure: true
})
export class IgxPivotGridSortingPipe implements PipeTransform {
    constructor(private gridAPI: GridBaseAPIService<IgxGridBaseDirective & GridType>) { }
    public transform(collection: any[], config: IPivotConfiguration, sorting: IGridSortingStrategy,
        id: string, pipeTrigger: number, pinned?): any[] {
        let result: any[];
        const allDimensions = config.rows;
        const enabledDimensions = allDimensions.filter(x => x && x.enabled);
        const expressions: ISortingExpression[] = [];
        PivotUtil.flatten(enabledDimensions).forEach(x => {
            if (x.sortDirection) {
                expressions.push({
                    dir: x.sortDirection,
                    fieldName: x.memberName,
                    strategy: DefaultPivotSortingStrategy.instance()
                });
            } else {
                expressions.push({
                    dir: SortingDirection.None,
                    fieldName: x.memberName,
                    strategy: DefaultPivotSortingStrategy.instance()
                });
            }
        });
        if (!expressions.length) {
            result = collection;
        } else {
            result = DataUtil.sort(cloneArray(collection, true), expressions, sorting, this.gridAPI.grid);
        }

        return result;
    }
}
