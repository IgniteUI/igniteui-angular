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
import { GridType, IGX_GRID_BASE, PivotGridType } from '../common/grid.interface';
import { IGridSortingStrategy } from '../common/strategy';
import { IgxGridBaseDirective } from '../grid-base.directive';
import { DEFAULT_PIVOT_KEYS, IPivotConfiguration, IPivotDimension, IPivotGridColumn, IPivotGridGroupRecord, IPivotGridHorizontalGroup, IPivotGridRecord, IPivotKeys, IPivotValue } from './pivot-grid.interface';
import { PivotSortUtil } from './pivot-sort-util';
import { PivotUtil } from './pivot-util';
import { IDataCloneStrategy } from '../../data-operations/data-clone-strategy';

/**
 * @hidden
 */
@Pipe({
    name: 'pivotGridRow',
    pure: true,
    standalone: true
})
export class IgxPivotRowPipe implements PipeTransform {

    constructor(@Inject(IGX_GRID_BASE) private grid?: PivotGridType) { }

    public transform(
        collection: any,
        config: IPivotConfiguration,
        cloneStrategy: IDataCloneStrategy,
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
        return rowStrategy.process(data, enabledRows, config.values, cloneStrategy, pivotKeys);
    }
}

/**
 * @hidden
 * Transforms generic array data into IPivotGridRecord[]
 */
@Pipe({
    name: 'pivotGridAutoTransform',
    pure: true,
    standalone: true
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
    pure: true,
    standalone: true
})
export class IgxPivotRowExpansionPipe implements PipeTransform {

    constructor(@Inject(IGX_GRID_BASE) private grid?: PivotGridType) { }

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
        const horizontalRowDimensions = [];
        for (const row of enabledRows) {
            if (this.grid?.hasHorizontalLayout) {
                PivotUtil.flattenGroupsHorizontally(
                    data,
                    row,
                    expansionStates,
                    defaultExpand,
                    horizontalRowDimensions,
                    this.grid.pivotUI.horizontalSummariesPosition
            );
            } else {
                PivotUtil.flattenGroups(data, row, expansionStates, defaultExpand);
            }
        }

        let finalData = data;
        if (this.grid?.hasHorizontalLayout) {
            const allRowDims = PivotUtil.flatten(this.grid.rowDimensions);
            this.grid.visibleRowDimensions = allRowDims.filter((rowDim) => horizontalRowDimensions.some(targetDim => targetDim.memberName === rowDim.memberName));
        } else {
            if (this.grid) {
                this.grid.visibleRowDimensions = enabledRows;
            }
            finalData = enabledRows.length > 0 ?
            finalData.filter(x => x.dimensions.length === enabledRows.length) : finalData;
        }

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
    pure: true,
    standalone: true
})
export class IgxPivotCellMergingPipe implements PipeTransform {
    constructor(@Inject(IGX_GRID_BASE) private grid: PivotGridType) { }
    public transform(
        collection: IPivotGridRecord[],
        config: IPivotConfiguration,
        dim: IPivotDimension,
        _pipeTrigger?: number
    ): IPivotGridGroupRecord[] {
        if (collection.length === 0 || config.rows.length === 0) return collection;
        const data: IPivotGridGroupRecord[] = collection ? cloneArray(collection, true) : [];
        const res: IPivotGridGroupRecord[] = [];

        let groupData: IPivotGridGroupRecord[] = [];
        let prevId;
        const enabledRows = this.grid.hasHorizontalLayout ? (this.grid as any).visibleRowDimensions :  config.rows?.filter(x => x.enabled);
        const dimIndex = enabledRows.indexOf(dim);
        for (const rec of data) {
            let currentDim;
            if (this.grid.hasHorizontalLayout) {
                currentDim = dim;
                rec.dimensions = enabledRows;
            } else {
                currentDim = rec.dimensions[dimIndex];
            }

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
    name: "pivotGridHorizontalRowGrouping",
    standalone: true
})
export class IgxPivotGridHorizontalRowGrouping implements PipeTransform {
    constructor(@Inject(IGX_GRID_BASE) private grid: GridType) { }
    public transform(
        collection: IPivotGridRecord[],
        config: IPivotConfiguration,
        _pipeTrigger?: number,
        _regroupTrigger?: number
    ): IPivotGridRecord[][] {
        if (collection.length === 0 || config.rows.length === 0) return null;
        const data: IPivotGridRecord[] = collection ? cloneArray(collection, true) : [];
        const res: IPivotGridRecord[][] = [];

        const groupDim = config.rows.filter(dim => dim.enabled)[0];
        let curGroup = [];
        let curGroupValue = data[0].dimensionValues.get(groupDim.memberName);
        for (const [index, curRec] of data.entries()) {
            curRec.dataIndex = index;
            const curRecValue = curRec.dimensionValues.get(groupDim.memberName);
            if (curGroup.length === 0 || curRecValue === curGroupValue) {
                curGroup.push(curRec);
            } else {
                curGroup["height"] = this.grid.renderedRowHeight * curGroup.length;
                res.push(curGroup);
                curGroup = [curRec];
                curGroupValue = curRecValue;
            }
        }
        res.push(curGroup);

        return res;
    }
}

/**
 * @hidden
 */
@Pipe({
    name: "pivotGridHorizontalRowCellMerging",
    standalone: true
})
export class IgxPivotGridHorizontalRowCellMerging implements PipeTransform {
    constructor(@Inject(IGX_GRID_BASE) private grid: PivotGridType) { }
    public transform(
        collection: IPivotGridRecord[],
        config: IPivotConfiguration,
        _pipeTrigger?: number
    ): IPivotGridHorizontalGroup[] {
        if (collection.length === 0 || config.rows.length === 0) return [{
            colStart: 1,
            colSpan: 1,
            rowStart: 1,
            rowSpan: 1,
            records: collection
        }];
        const data: IPivotGridRecord[] = collection ? cloneArray(collection, true) : [];
        const res: IPivotGridHorizontalGroup[] = [];

        // Merge vertically for each row dimension.
        const verticalMergeGroups: IPivotGridHorizontalGroup[][] = [ ...data.map(_ => []) ];
        for (let dimIndex = 0; dimIndex < this.grid.visibleRowDimensions.length; dimIndex++) {
            const curDim = this.grid.visibleRowDimensions[dimIndex];
            let curGroup: IPivotGridHorizontalGroup = {
                colStart: dimIndex + 1,
                colSpan: 1,
                rowStart: 1,
                rowSpan: 1,
                value: data[0].dimensionValues.get(curDim.memberName),
                rootDimension: curDim,
                dimensions: [curDim],
                records: [data[0]]
            };
            for(let i = 1; i < data.length; i++) {
                const curRec = data[i];
                const curRecValue = curRec.dimensionValues.get(curDim.memberName);
                const previousRowCell = verticalMergeGroups[i][verticalMergeGroups[i].length - 1];
                if (curRecValue === curGroup.value && !previousRowCell) {
                    // If previousRowCell is non existing, its merged so we can push in this vertigal group as well.
                    curGroup.rowSpan++;
                    curGroup.records.push(curRec);
                } else {
                    verticalMergeGroups[curGroup.rowStart - 1].push(curGroup);
                    curGroup = {
                        colStart: dimIndex + 1,
                        colSpan: 1,
                        rowStart: curGroup.rowStart + curGroup.rowSpan,
                        rowSpan: 1,
                        value: curRec.dimensionValues.get(curDim.memberName),
                        rootDimension: curDim,
                        dimensions: [curDim],
                        records: [curRec]
                    };
                }
            }

            verticalMergeGroups[curGroup.rowStart - 1].push(curGroup);
        }

        // Merge rows in a single array
        const sortedGroups = verticalMergeGroups.reduce((prev, cur) => prev.concat(...cur), []);

        // Horizontally merge any groups that can be merged or have been
        res.push(sortedGroups[0]);
        let prevGroup = sortedGroups[0];
        for (let i = 1; i < sortedGroups.length; i++) {
            const curGroup = sortedGroups[i];
            if (curGroup.value && prevGroup.value !== curGroup.value) {
                prevGroup = curGroup;
                res.push(curGroup);
            } else {
                prevGroup.dimensions.push(curGroup.rootDimension);
                prevGroup.colSpan++;
            }
        }

        return res;
    }
}

/**
 * @hidden
 */
@Pipe({
    name: 'pivotGridColumn',
    pure: true,
    standalone: true
})
export class IgxPivotColumnPipe implements PipeTransform {

    public transform(
        collection: IPivotGridRecord[],
        config: IPivotConfiguration,
        cloneStrategy: IDataCloneStrategy,
        _: Map<any, boolean>,
        _pipeTrigger?: number,
        __?
    ): IPivotGridRecord[] {
        const pivotKeys = config.pivotKeys || DEFAULT_PIVOT_KEYS;
        const enabledColumns = config.columns?.filter(x => x.enabled) || [];
        const enabledValues = config.values?.filter(x => x.enabled) || [];

        const colStrategy = config.columnStrategy || PivotColumnDimensionsStrategy.instance();
        const data = cloneArray(collection, true);
        return colStrategy.process(data, enabledColumns, enabledValues, cloneStrategy, pivotKeys);
    }
}

/**
 * @hidden
 */
@Pipe({
    name: 'pivotGridFilter',
    pure: true,
    standalone: true
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
    pure: true,
    standalone: true
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
    pure: true,
    standalone: true
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
@Pipe({
    name: "filterPivotItems",
    standalone: true
})
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

@Pipe({
    name: 'igxPivotCellStyleClasses',
    standalone: true
})
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
