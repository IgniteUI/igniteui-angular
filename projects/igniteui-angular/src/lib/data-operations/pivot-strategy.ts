
import { GridType, PivotGridType } from '../grids/common/grid.interface';
import { DEFAULT_PIVOT_KEYS, IPivotDimension, IPivotDimensionStrategy, IPivotGridRecord, IPivotKeys, IPivotValue, PivotDimensionType } from '../grids/pivot-grid/pivot-grid.interface';
import { PivotUtil } from '../grids/pivot-grid/pivot-util';
import { FilteringStrategy } from './filtering-strategy';
import { GridColumnDataType } from './data-util';
import { DefaultSortingStrategy, SortingDirection } from './sorting-strategy';
import { cloneArray, parseDate } from '../core/utils';

export class NoopPivotDimensionsStrategy implements IPivotDimensionStrategy {
    private static _instance: NoopPivotDimensionsStrategy = null;

    public static instance() {
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
        values?: IPivotValue[],
        pivotKeys: IPivotKeys = DEFAULT_PIVOT_KEYS
    ): IPivotGridRecord[] {
        let hierarchies;
        let data: IPivotGridRecord[];
        const prevRowDims = [];
        let prevDim;
        const currRows = cloneArray(rows, true);
        PivotUtil.assignLevels(currRows);
        for (const row of currRows) {
            if (!data) {
                // build hierarchies - groups and subgroups
                hierarchies = PivotUtil.getFieldsHierarchy(collection, [row], PivotDimensionType.Row, pivotKeys);
                // generate flat data from the hierarchies
                data = PivotUtil.processHierarchy(hierarchies, pivotKeys, 0, true);
                prevRowDims.push(row);
                prevDim = row;
            } else {
                const newData = [...data];
                for (let i = 0; i < newData.length; i++) {
                    // const currData = newData[i].children.get(prevDim.memberName);
                    // const leafData = PivotUtil.getDirectLeafs(currData);
                    const hierarchyFields = PivotUtil
                        .getFieldsHierarchy(newData[i].records, [row], PivotDimensionType.Row, pivotKeys);
                    const siblingData = PivotUtil
                        .processHierarchy(hierarchyFields, pivotKeys, 0);
                    PivotUtil.resolveSiblingChildren(newData[i], siblingData, pivotKeys);
                    PivotUtil.processSubGroups(row, prevRowDims.slice(0), siblingData, pivotKeys);
                    newData.splice(i, 1, ...siblingData);
                    // Increase the index the amount of sibling record that replaces the current one. Subtract 1 because there is already i++ in the for cycle.
                    i += siblingData.length - 1;
                    // Add the current top sibling elements for the dimension
                }
                data = newData;
                prevDim = row;
                prevRowDims.push(row);
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
        pivotKeys: IPivotKeys = DEFAULT_PIVOT_KEYS
    ): any[] {
        const res = this.processHierarchy(collection, columns, values, pivotKeys);
        return res;
    }

    private processHierarchy(collection: IPivotGridRecord[], columns: IPivotDimension[], values, pivotKeys) {
        const result: IPivotGridRecord[] = [];
        collection.forEach(rec => {
            // apply aggregations based on the created groups and generate column fields based on the hierarchies
            this.groupColumns(rec, columns, values, pivotKeys);
            result.push(rec);
        });
        return result;
    }

    private groupColumns(rec: IPivotGridRecord, columns, values, pivotKeys) {
        const children = rec.children;
        if (children && children.size > 0) {
            children.forEach((childRecs, key) => {
                childRecs.forEach(child => {
                    this.groupColumns(child, columns, values, pivotKeys);
                })
            });
            
        }
        this.applyAggregates(rec, columns, values, pivotKeys);
    }

    private applyAggregates(rec, columns, values, pivotKeys) {
        const leafRecords = this.getLeafs(rec.records, pivotKeys);
        const hierarchy = PivotUtil.getFieldsHierarchy(leafRecords, columns, PivotDimensionType.Column, pivotKeys);
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

    private isLeaf(record, pivotKeys) {
        return !(record[pivotKeys.records] && record[pivotKeys.records].some(r => r[pivotKeys.records]));
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

    protected getFieldValue(rec: any, fieldName: string, isDate: boolean = false, isTime: boolean = false,
        grid?: PivotGridType): any {
        const config = grid.pivotConfiguration;
        const allDimensions = config.rows.concat(config.columns).concat(config.filters).filter(x => x !== null && x !== undefined);
        const enabledDimensions = allDimensions.filter(x => x && x.enabled);
        const dim = PivotUtil.flatten(enabledDimensions).find(x => x.memberName === fieldName);
        return PivotUtil.extractValueFromDimension(dim, rec);
    }
}

export class DefaultPivotSortingStrategy extends DefaultSortingStrategy {
    protected static _instance: DefaultPivotSortingStrategy = null;
    protected dimension;
    public static instance(): DefaultPivotSortingStrategy {
        return this._instance || (this._instance = new this());
    }
    public sort(data: any[],
        fieldName: string,
        dir: SortingDirection,
        ignoreCase: boolean,
        valueResolver: (obj: any, key: string, isDate?: boolean) => any,
        isDate?: boolean,
        isTime?: boolean,
        grid?: PivotGridType) {
        const key = fieldName;
        const config = grid.pivotConfiguration;
        const allDimensions = config.rows.concat(config.columns).concat(config.filters).filter(x => x !== null && x !== undefined);
        const enabledDimensions = allDimensions.filter(x => x && x.enabled);
        this.dimension = PivotUtil.flatten(enabledDimensions).find(x => x.memberName === key);
        const reverse = (dir === SortingDirection.Desc ? -1 : 1);
        const cmpFunc = (obj1, obj2) => this.compareObjects(obj1, obj2, key, reverse, ignoreCase, this.getFieldValue, isDate, isTime);
        return this.arraySort(data, cmpFunc);
    }

    protected getFieldValue(obj: any, key: string, isDate: boolean = false, isTime: boolean = false): any {
        let resolvedValue = PivotUtil.extractValueFromDimension(this.dimension, obj);
        const formatAsDate = this.dimension.dataType === GridColumnDataType.Date || this.dimension.dataType === GridColumnDataType.DateTime;
        if (formatAsDate) {
            const date = parseDate(resolvedValue);
            resolvedValue = isTime && date ?
                new Date().setHours(date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()) : date;

        }
        return resolvedValue;
    }
}
