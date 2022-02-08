import { Inject, Pipe, PipeTransform } from '@angular/core';
import { cloneArray } from '../../core/utils';
import { DataUtil } from '../../data-operations/data-util';
import { FilteringExpressionsTree, IFilteringExpressionsTree } from '../../data-operations/filtering-expressions-tree';
import { IFilteringStrategy } from '../../data-operations/filtering-strategy';
import { DEFAULT_PIVOT_KEYS, IPivotConfiguration, IPivotDimension, IPivotGridGroupRecord, IPivotGridRecord, IPivotKeys, PivotDimensionType } from './pivot-grid.interface';
import {
    DefaultPivotSortingStrategy, DimensionValuesFilteringStrategy, PivotColumnDimensionsStrategy,
    PivotRowDimensionsStrategy
} from '../../data-operations/pivot-strategy';
import { PivotUtil } from './pivot-util';
import { FilteringLogic } from '../../data-operations/filtering-expression.interface';
import { ISortingExpression, SortingDirection } from '../../data-operations/sorting-strategy';
import { GridType, IGX_GRID_BASE } from '../common/grid.interface';
import { GridBaseAPIService } from '../api.service';
import { IgxGridBaseDirective } from '../grid-base.directive';
import { IGridSortingStrategy } from '../common/strategy';
import { IGroupByResult } from '../../data-operations/grouping-result.interface';
import { IGroupingExpression } from '../../data-operations/grouping-expression.interface';

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
        __?
    ): IPivotGridRecord[] {
        const pivotKeys = config.pivotKeys || DEFAULT_PIVOT_KEYS;
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

    constructor(@Inject(IGX_GRID_BASE) private grid?: GridType) { }

    public transform(
        collection: IPivotGridRecord[],
        config: IPivotConfiguration,
        expansionStates: Map<any, boolean>,
        defaultExpand: boolean,
        _pipeTrigger?: number,
        __?,
    ): IPivotGridRecord[] {
        const enabledRows = config.rows.filter(x => x.enabled);
        const data = collection ? cloneArray(collection, true) : [];
        for (const row of enabledRows) {
            PivotUtil.flattenGroups(data, row, expansionStates, defaultExpand);
        }
        const finalData = config.columnStrategy ? data : data.filter(x => x.dimensions.length === enabledRows.length);

        if (this.grid) {
            this.grid.setFilteredSortedData(finalData, false);
        }
        return finalData;
    }
}

/**
 * @hidden
 */
@Pipe({
    name: 'pivotGridCellMerging',
    pure: true
})
export class IgxPivotCellMergingPipe implements PipeTransform {
    constructor(@Inject(IGX_GRID_BASE) private grid: GridType) { }
    public transform(
        collection: IPivotGridRecord[],
        config: IPivotConfiguration,
        dim: IPivotDimension,
        pivotKeys: IPivotKeys,
        _pipeTrigger?: number
    ): IPivotGridGroupRecord[] {
        if (collection.length === 0 || config.rows.length === 0) return collection;
        const data: IPivotGridGroupRecord[] = collection ? cloneArray(collection, true) : [];
        const res: IPivotGridGroupRecord[] = [];

        const enabledRows = config.rows.filter(x => x.enabled);

        const prevDims = enabledRows.filter((d, ind) => ind < enabledRows.indexOf(dim));
        let groupData: IPivotGridGroupRecord[] = [];
        let prevDim;
        let prevDimRoot;
        let prevId;
        const index = config.rows.indexOf(dim);
        for (let rec of data) {
            const currentDim = rec.dimensions[index];
            const id = PivotUtil.getRecordKey(rec, currentDim);
            if (groupData.length > 0 && prevId !== id) {
                const h = groupData.length > 1 ? groupData.length * this.grid.renderedRowHeight : undefined;
                groupData[0].height = h;
                groupData[0].rowSpan = groupData.length;
                res.push(groupData[0]);
                groupData = [];
            }
            groupData.push(rec);
            prevDim = currentDim;
            prevDimRoot = dim;
            prevId = id;
        }
        if (groupData.length > 0) {
            const h = groupData.length > 1 ? groupData.length * this.grid.rowHeight + (groupData.length - 1) + 1 : undefined;
            groupData[0].height = h;
            groupData[0].rowSpan = groupData.length;
            res.push(groupData[0]);
        }
        return res;
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
        collection: IPivotGridRecord[],
        config: IPivotConfiguration,
        _: Map<any, boolean>,
        _pipeTrigger?: number,
        __?
    ): IPivotGridRecord[] {
        const pivotKeys = config.pivotKeys || DEFAULT_PIVOT_KEYS;
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
        const expressionsTree = PivotUtil.buildExpressionTree(config);

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
        collection: IPivotGridRecord[],
        expressions: ISortingExpression[],
        sorting: IGridSortingStrategy,
        pipeTrigger: number
    ): IPivotGridRecord[] {
        let result: IPivotGridRecord[];

        if (!expressions.length) {
            result = collection;
        } else {
            result = PivotUtil.sort(cloneArray(collection, true), expressions, sorting);
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
