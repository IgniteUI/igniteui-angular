
import { ColumnType, PivotGridType } from '../grids/common/grid.interface';
import { DEFAULT_PIVOT_KEYS, IPivotDimension, IPivotDimensionStrategy, IPivotGridRecord, IPivotKeys, IPivotValue, PivotDimensionType } from '../grids/pivot-grid/pivot-grid.interface';
import { PivotUtil } from '../grids/pivot-grid/pivot-util';
import { FilteringStrategy, IgxFilterItem } from './filtering-strategy';
import { cloneArray } from '../core/utils';
import { IFilteringExpressionsTree } from './filtering-expressions-tree';
import { IDataCloneStrategy } from './data-clone-strategy';

/* csSuppress */
export class NoopPivotDimensionsStrategy implements IPivotDimensionStrategy {
    private static _instance: NoopPivotDimensionsStrategy = null;

    public static instance(): NoopPivotDimensionsStrategy {
        return this._instance || (this._instance = new NoopPivotDimensionsStrategy());
    }

    public process(collection: any[], _: IPivotDimension[], __: IPivotValue[]): any[] {
        return collection;
    }
}


export class PivotRowDimensionsStrategy implements IPivotDimensionStrategy {
    private static _instance: PivotRowDimensionsStrategy = null;

    public static instance() {
        return this._instance || (this._instance = new PivotRowDimensionsStrategy());
    }

    public process(
        collection: any,
        rows: IPivotDimension[],
        values: IPivotValue[],
        cloneStrategy: IDataCloneStrategy,
        pivotKeys: IPivotKeys = DEFAULT_PIVOT_KEYS
    ): IPivotGridRecord[] {
        let hierarchies;
        let data: IPivotGridRecord[];
        const prevRowDims = [];
        const currRows = cloneArray(rows, true);
        PivotUtil.assignLevels(currRows);

        if (currRows.length === 0) {
            hierarchies = PivotUtil.getFieldsHierarchy(collection, [{ memberName: '', enabled: true }], PivotDimensionType.Row, pivotKeys, cloneStrategy);
            // generate flat data from the hierarchies
            data = PivotUtil.processHierarchy(hierarchies, pivotKeys, 0, true);
            return data;
        }

        for (const row of currRows) {
            if (!data) {
                // build hierarchies - groups and subgroups
                hierarchies = PivotUtil.getFieldsHierarchy(collection, [row], PivotDimensionType.Row, pivotKeys, cloneStrategy);
                // generate flat data from the hierarchies
                data = PivotUtil.processHierarchy(hierarchies, pivotKeys, 0, true);
                prevRowDims.push(row);
            } else {
                PivotUtil.processGroups(data, row, pivotKeys, cloneStrategy);
            }
        }
        return data;
    }
}

export class PivotColumnDimensionsStrategy implements IPivotDimensionStrategy {
    private static _instance: PivotRowDimensionsStrategy = null;

    public static instance() {
        return this._instance || (this._instance = new PivotColumnDimensionsStrategy());
    }

    public process(
        collection: IPivotGridRecord[],
        columns: IPivotDimension[],
        values: IPivotValue[],
        cloneStrategy: IDataCloneStrategy,
        pivotKeys: IPivotKeys = DEFAULT_PIVOT_KEYS
    ): any[] {
        const res = this.processHierarchy(collection, columns, values, pivotKeys, cloneStrategy);
        return res;
    }

    private processHierarchy(collection: IPivotGridRecord[], columns: IPivotDimension[], values, pivotKeys, cloneStrategy) {
        const result: IPivotGridRecord[] = [];
        collection.forEach(rec => {
            // apply aggregations based on the created groups and generate column fields based on the hierarchies
            this.groupColumns(rec, columns, values, pivotKeys, cloneStrategy);
            result.push(rec);
        });
        return result;
    }

    private groupColumns(rec: IPivotGridRecord, columns, values, pivotKeys, cloneStrategy) {
        const children = rec.children;
        if (children && children.size > 0) {
            children.forEach((childRecs) => {
                if (childRecs) {
                    childRecs.forEach(child => {
                        this.groupColumns(child, columns, values, pivotKeys, cloneStrategy);
                    })
                }
            });
        }
        this.applyAggregates(rec, columns, values, pivotKeys, cloneStrategy);
    }

    private applyAggregates(rec, columns, values, pivotKeys, cloneStrategy) {
        const leafRecords = this.getLeafs(rec.records, pivotKeys);
        const hierarchy = PivotUtil.getFieldsHierarchy(leafRecords, columns, PivotDimensionType.Column, pivotKeys, cloneStrategy);
        PivotUtil.applyAggregations(rec, hierarchy, values, pivotKeys)
    }

    private getLeafs(records, pivotKeys) {
        let leafs = [];
        for (const rec of records) {
            if (rec[pivotKeys.records]) {
                leafs = leafs.concat(this.getLeafs(rec[pivotKeys.records], pivotKeys));
            } else {
                leafs.push(rec);
            }
        }
        return leafs;
    }
}

export class DimensionValuesFilteringStrategy extends FilteringStrategy {

    /**
     * Creates a new instance of FormattedValuesFilteringStrategy.
     *
     * @param fields An array of column field names that should be formatted.
     * If omitted the values of all columns which has formatter will be formatted.
     */
    constructor(private fields?: string[]) {
        super();
    }

    protected override getFieldValue(rec: any, fieldName: string, _isDate = false, _isTime = false,
        grid?: PivotGridType): any {
        const allDimensions = grid.allDimensions;
        const enabledDimensions = allDimensions.filter(x => x && x.enabled);
        const dim :IPivotDimension = PivotUtil.flatten(enabledDimensions).find(x => x.memberName === fieldName);
        const value = dim.childLevel ? this._getDimensionValueHierarchy(dim, rec).map(x => `[` + x +`]`).join('.') : PivotUtil.extractValueFromDimension(dim, rec);
        return value;
    }

    public override getFilterItems(column: ColumnType, tree: IFilteringExpressionsTree): Promise<IgxFilterItem[]> {
        const grid = (column.grid as any);
        const enabledDimensions = grid.allDimensions.filter(x => x && x.enabled);
        const data = column.grid.gridAPI.filterDataByExpressions(tree);
        const dim = enabledDimensions.find(x => x.memberName === column.field);
        const allValuesHierarchy = PivotUtil.getFieldsHierarchy(
            data,
            [dim],
            PivotDimensionType.Column,
            grid.pivotKeys,
            grid.pivotValueCloneStrategy
        );
        const isNoop = grid.pivotConfiguration.columnStrategy instanceof NoopPivotDimensionsStrategy || grid.pivotConfiguration.rowStrategy instanceof NoopPivotDimensionsStrategy;
        const items: IgxFilterItem[] = !isNoop ? this._getFilterItems(allValuesHierarchy, grid.pivotKeys) : [{value : ''}];
        return Promise.resolve(items);
    }

    private _getFilterItems(hierarchy: Map<string, any>, pivotKeys: IPivotKeys) : IgxFilterItem[] {
        const items:  IgxFilterItem[] = [];
        hierarchy.forEach((value) => {
            const val = value.value;
            const path = val.split(pivotKeys.columnDimensionSeparator);
            const hierarchicalValue = path.length > 1 ? path.map(x => `[` + x +`]`).join('.') : val;
            const text = path[path.length -1];
            items.push({
                value: hierarchicalValue,
                label: text,
                children: this._getFilterItems(value.children, pivotKeys)
            });
        });
        return items;
    }

    private _getDimensionValueHierarchy(dim: IPivotDimension, rec: any) : string[] {
        let path = [];
        const value = PivotUtil.extractValueFromDimension(dim, rec);
        path.push(value);
        if (dim.childLevel) {
            const childVals = this._getDimensionValueHierarchy(dim.childLevel, rec);
            path = path.concat(childVals);
        }
        return path;
    }
}
