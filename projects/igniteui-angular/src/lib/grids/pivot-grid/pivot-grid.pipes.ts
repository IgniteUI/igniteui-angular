import { Pipe, PipeTransform } from '@angular/core';
import { cloneArray } from '../../core/utils';
import { DataUtil } from '../../data-operations/data-util';
import { FilteringExpressionsTree, IFilteringExpressionsTree } from '../../data-operations/filtering-expressions-tree';
import { IFilteringStrategy } from '../../data-operations/filtering-strategy';
import { IPivotConfiguration, IPivotDimension, IPivotKeys } from './pivot-grid.interface';
import { PivotColumnDimensionsStrategy, PivotRowDimensionsStrategy } from '../../data-operations/pivot-strategy';
import { PivotUtil } from './pivot-util';
import { FilteringLogic } from '../../data-operations/filtering-expression.interface';
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
        pivotKeys: IPivotKeys = {aggregations: 'aggregations', records: 'records', children: 'children', level: 'level'}
    ): any[] {
        const enabledRows = config.rows.filter(x => x.enabled);
        const rowStrategy = config.rowStrategy ||  PivotRowDimensionsStrategy.instance();
        return rowStrategy.process(collection.slice(0), enabledRows, config.values, pivotKeys);
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
        pivotKeys: IPivotKeys = {aggregations: 'aggregations', records: 'records', children: 'children', level: 'level'}
    ): any[] {
        const enabledRows = config.rows.filter(x => x.enabled);
        const data = collection ? collection.slice(0) : [];
        let totalLlv = 0;
        const prevDims = [];
        for (const row of enabledRows) {
            const lvl = PivotUtil.getDimensionDepth(row);
            totalLlv += lvl;
            PivotUtil.flattenHierarchy(data, config, row, expansionStates, pivotKeys, totalLlv, prevDims, 0);
            prevDims.push(row);
        }
        return data;
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
        pivotKeys: IPivotKeys = {aggregations: 'aggregations', records: 'records', children: 'children', level: 'level'}
    ): any[] {
        const enabledColumns = config.columns.filter(x => x.enabled);
        const enabledValues = config.values.filter(x => x.enabled);

        const colStrategy = config.columnStrategy || PivotColumnDimensionsStrategy.instance();
        return colStrategy.process(collection, enabledColumns, enabledValues, pivotKeys);
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

    public transform(collection: any[],
        config: IPivotConfiguration,
        filterStrategy: IFilteringStrategy,
        advancedExpressionsTree: IFilteringExpressionsTree): any[] {

        const allDimensions = config.rows.concat(config.columns).concat(config.filters);
        const enabledDimensions = allDimensions.filter(x => x && x.enabled);

        const expressionsTree = new FilteringExpressionsTree(FilteringLogic.And);
        // add expression trees from all filters
        enabledDimensions.forEach(x => {
            if (x.filter) {
                expressionsTree.filteringOperands.push(x.filter);
            }
        });
        const state = {
            expressionsTree,
            strategy: filterStrategy,
            advancedExpressionsTree
        };

        if (FilteringExpressionsTree.empty(state.expressionsTree) && FilteringExpressionsTree.empty(state.advancedExpressionsTree)) {
            return collection;
        }

        const result = DataUtil.filter(cloneArray(collection), state);

        return result;
    }
}
