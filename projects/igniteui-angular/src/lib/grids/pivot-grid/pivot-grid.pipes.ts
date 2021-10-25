import { Pipe, PipeTransform } from '@angular/core';
import { cloneArray } from '../../core/utils';
import { DataUtil } from '../../data-operations/data-util';
import { FilteringExpressionsTree, IFilteringExpressionsTree } from '../../data-operations/filtering-expressions-tree';
import { IFilteringStrategy } from '../../data-operations/filtering-strategy';
import { IPivotConfiguration, IPivotKeys } from './pivot-grid.interface';
import { PivotColumnDimensionsStrategy, PivotRowDimensionsStrategy } from '../../data-operations/pivot-strategy';
import { PivotUtil } from './pivot-util';
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
        pivotKeys: IPivotKeys = {aggregations: 'aggregations', records: 'records', children: 'children', level: 'level'}
    ): any[] {
       const rowStrategy = config.rowStrategy ||  PivotRowDimensionsStrategy.instance();
       return rowStrategy.process(collection.slice(0), config.rows, config.values, pivotKeys);
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
        pivotKeys: IPivotKeys = {aggregations: 'aggregations', records: 'records', children: 'children', level: 'level'}
    ): any[] {
        const data = collection.slice(0);
        let totalLlv = 0;
        let prevDim;
        for (const row of config.rows) {
            const lvl = PivotUtil.getDimensionDepth(row);
            totalLlv += lvl;
            PivotUtil.flattenHierarchy(data, config, row, expansionStates, pivotKeys, totalLlv, prevDim);
            prevDim = row;
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
        pivotKeys: IPivotKeys = {aggregations: 'aggregations', records: 'records', children: 'children', level: 'level'}
    ): any[] {
        const colStrategy = config.columnStrategy ||  PivotColumnDimensionsStrategy.instance();
        return colStrategy.process(collection, config.columns, config.values, pivotKeys);
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
        expressionsTree: IFilteringExpressionsTree,
        filterStrategy: IFilteringStrategy,
        advancedExpressionsTree: IFilteringExpressionsTree): any[] {

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
