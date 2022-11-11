import { Inject, Pipe, PipeTransform } from '@angular/core';
import { cloneArray, resolveNestedPath } from '../../core/utils';
import { DataUtil } from '../../data-operations/data-util';
import { FilteringExpressionsTree, IFilteringExpressionsTree } from '../../data-operations/filtering-expressions-tree';
import { DefaultPivotGridRecordSortingStrategy } from '../../data-operations/pivot-sort-strategy';
import { FilterUtil, IFilteringStrategy } from '../../data-operations/filtering-strategy';
import {
    DimensionValuesFilteringStrategy, PivotColumnDimensionsStrategy,
    PivotRowDimensionsStrategy
} from '../../data-operations/pivot-strategy';
import { ISortingExpression } from '../../data-operations/sorting-strategy';
import { GridBaseAPIService } from '../api.service';
import { GridType, IGX_GRID_BASE } from '../common/grid.interface';
import { IGridSortingStrategy } from '../common/strategy';
import { IgxGridBaseDirective } from '../grid-base.directive';
import { DEFAULT_PIVOT_KEYS, IPivotConfiguration, IPivotDimension, IPivotGridColumn, IPivotGridGroupRecord, IPivotGridRecord, IPivotKeys, IPivotValue } from './pivot-grid.interface';
import { PivotSortUtil } from './pivot-sort-util';
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
        _pipeTrigger?: number,
        __?
    ): IPivotGridRecord[] {
        const pivotKeys = config.pivotKeys || DEFAULT_PIVOT_KEYS;
        const enabledRows = config.rows?.filter(x => x.enabled) || [];
        const enabledColumns = config.columns?.filter(x => x.enabled) || [];
        const enabledValues = config.values?.filter(x => x.enabled) || [];
        if (enabledRows.length === 0 && enabledColumns.length === 0 && enabledValues.length === 0) {
            // nothing to group and aggregate by ...
            return [];
        }
        const rowStrategy = config.rowStrategy || PivotRowDimensionsStrategy.instance();
        const data = cloneArray(collection, true);
        return rowStrategy.process(data, enabledRows, config.values, pivotKeys);
    }
}

/**
 * @hidden
 * Transforms generic array data into IPivotGridRecord[]
 */
@Pipe({
    name: 'pivotGridAutoTransform',
    pure: true
})
export class IgxPivotAutoTransform implements PipeTransform {
    public transform(
        collection: any[],
        config: IPivotConfiguration,
        _pipeTrigger?: number,
        __?,
    ): IPivotGridRecord[] {
        let needsTransformation = false;
        if (collection.length > 0) {
            needsTransformation = !this.isPivotRecord(collection[0]);
        }

        if (!needsTransformation) return collection;

        const res = this.processCollectionToPivotRecord(config, collection);
        return res;
    }

    protected isPivotRecord(arg: IPivotGridRecord): arg is IPivotGridRecord {
        return !!(arg as IPivotGridRecord).aggregationValues;
    }

    protected processCollectionToPivotRecord(config: IPivotConfiguration, collection: any[]): IPivotGridRecord[] {
        const pivotKeys: IPivotKeys = config.pivotKeys || DEFAULT_PIVOT_KEYS;
        const enabledRows = config.rows.filter(x => x.enabled);
        const allFlat: IPivotDimension[] = PivotUtil.flatten(enabledRows);
        const result: IPivotGridRecord[] = [];
        for (const rec of collection) {
            const pivotRec: IPivotGridRecord = {
                dimensionValues: new Map<string, string>(),
                aggregationValues: new Map<string, string>(),
                children: new Map<string, IPivotGridRecord[]>(),
                dimensions: []
            };
            const keys = Object.keys(rec)
            for (const key of keys) {
                const dim = allFlat.find(x => x.memberName === key);
                if (dim) {
                    //field has matching dimension
                    pivotRec.dimensions.push(dim);
                    pivotRec.dimensionValues.set(key, rec[key]);
                } else if (key.indexOf(pivotKeys.rowDimensionSeparator + pivotKeys.records) !== -1) {
                    // field that contains child collection
                    const dimKey = key.slice(0, key.indexOf(pivotKeys.rowDimensionSeparator + pivotKeys.records));
                    const childData = rec[key];
                    const childPivotData = this.processCollectionToPivotRecord(config, childData);
                    pivotRec.children.set(dimKey, childPivotData);
                } else {
                    // an aggregation
                    pivotRec.aggregationValues.set(key, rec[key]);
                }
            }
            const flattened = PivotUtil.flatten(config.rows);
            pivotRec.dimensions.sort((x, y) => flattened.indexOf(x) - flattened.indexOf(y));
            result.push(pivotRec);
        }
        return result;
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
        const enabledRows = config.rows?.filter(x => x.enabled) || [];
        const data = collection ? cloneArray(collection, true) : [];
        for (const row of enabledRows) {
            PivotUtil.flattenGroups(data, row, expansionStates, defaultExpand);
        }
        const finalData = enabledRows.length > 0 ?
            data.filter(x => x.dimensions.length === enabledRows.length) : data;

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
        _pipeTrigger?: number
    ): IPivotGridGroupRecord[] {
        if (collection.length === 0 || config.rows.length === 0) return collection;
        const data: IPivotGridGroupRecord[] = collection ? cloneArray(collection, true) : [];
        const res: IPivotGridGroupRecord[] = [];

        const enabledRows = config.rows?.filter(x => x.enabled);
        let groupData: IPivotGridGroupRecord[] = [];
        let prevId;
        const index = enabledRows.indexOf(dim);
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
        const enabledColumns = config.columns?.filter(x => x.enabled) || [];
        const enabledValues = config.values?.filter(x => x.enabled) || [];

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

        const result = FilterUtil.filter(cloneArray(collection, true), state, this.gridAPI.grid);

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
        _pipeTrigger: number
    ): IPivotGridRecord[] {
        let result: IPivotGridRecord[];

        if (!expressions.length) {
            result = collection;
        } else {
            for (const expr of expressions) {
                expr.strategy = DefaultPivotGridRecordSortingStrategy.instance();
            }
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
    public transform(collection: any[], config: IPivotConfiguration, sorting: IGridSortingStrategy, _pipeTrigger: number): any[] {
        let result: any[];
        const allDimensions = config.rows || [];
        const enabledDimensions = allDimensions.filter(x => x && x.enabled);
        const expressions = PivotSortUtil.generateDimensionSortingExpressions(enabledDimensions);
        if (!expressions.length) {
            result = collection;
        } else {
            result = DataUtil.sort(cloneArray(collection, true), expressions, sorting, this.gridAPI.grid);
        }

        return result;
    }
}

/**
 * @hidden
 */
@Pipe({ name: "filterPivotItems" })
export class IgxFilterPivotItemsPipe implements PipeTransform {
    public transform(
        collection: (IPivotDimension | IPivotValue)[],
        filterCriteria: string,
        _pipeTrigger: number
    ): any[] {
        if (!collection) {
            return collection;
        }
        let copy = collection.slice(0);
        if (filterCriteria && filterCriteria.length > 0) {
            const filterFunc = (c) => {
                const filterText = c.member || c.memberName;
                if (!filterText) {
                    return false;
                }
                return (
                    filterText
                        .toLocaleLowerCase()
                        .indexOf(filterCriteria.toLocaleLowerCase()) >= 0 ||
                    (c.children?.some(filterFunc) ?? false)
                );
            };
            copy = collection.filter(filterFunc);
        }
        return copy;
    }
}

export interface GridStyleCSSProperty {
    [prop: string]: any;
}

@Pipe({ name: 'igxPivotCellStyleClasses' })
export class IgxPivotGridCellStyleClassesPipe implements PipeTransform {

    public transform(cssClasses: GridStyleCSSProperty, _: any, rowData: IPivotGridRecord, columnData: IPivotGridColumn, index: number, __: number): string {
        if (!cssClasses) {
            return '';
        }

        const result = [];

        for (const cssClass of Object.keys(cssClasses)) {
            const callbackOrValue = cssClasses[cssClass];
            const apply = typeof callbackOrValue === 'function' ?
                callbackOrValue(rowData, columnData, resolveNestedPath(rowData, columnData.field), index) : callbackOrValue;
            if (apply) {
                result.push(cssClass);
            }
        }

        return result.join(' ');
    }
}
