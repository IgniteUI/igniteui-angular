
import { GridType, PivotGridType } from '../grids/common/grid.interface';
import { DEFAULT_PIVOT_KEYS, IPivotDimension, IPivotDimensionStrategy, IPivotKeys, IPivotValue, PivotDimensionType } from '../grids/pivot-grid/pivot-grid.interface';
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
    ): any[] {
        let hierarchies;
        let data;
        const prevRowDims = [];
        let prevDim;
        let prevDimTopRecords = [];
        const currRows = cloneArray(rows, true);
        PivotUtil.assignLevels(currRows);
        for (const row of currRows) {
            if (!data) {
                // build hierarchies - groups and subgroups
                hierarchies = PivotUtil.getFieldsHierarchy(collection, [row], PivotDimensionType.Row, pivotKeys);
                // generate flat data from the hierarchies
                data = PivotUtil.processHierarchy(hierarchies, collection[0] ?? [], pivotKeys, 0, true);
                prevRowDims.push(row);
                prevDim = row;
                prevDimTopRecords = data;
            } else {
                const newData = [...data];
                const curDimTopRecords = [];
                for (let i = 0; i < newData.length; i++) {
                    const currData = newData[i][prevDim.memberName + '_' + pivotKeys.records];
                    const leafData = PivotUtil.getDirectLeafs(currData, pivotKeys);
                    const hierarchyFields = PivotUtil
                        .getFieldsHierarchy(leafData, [row], PivotDimensionType.Row, pivotKeys);
                    const siblingData = PivotUtil
                        .processHierarchy(hierarchyFields, newData[i] ?? [], pivotKeys, 0);
                    PivotUtil.processSiblingProperties(newData[i], siblingData, pivotKeys);

                    PivotUtil.processSubGroups(row, prevRowDims.slice(0), siblingData, pivotKeys);
                    if ((prevDimTopRecords[i].length != undefined && prevDimTopRecords[i].length < siblingData.length) || prevDimTopRecords.length < siblingData.length) {
                        // Add the sibling data as child records because the previous dimension contains more dense version of the previous dimension records.
                        newData[i][row.memberName + '_' + pivotKeys.records] = siblingData;
                    } else {
                        // Replace the current record with the sibling records because the current dimension is a denser version or produces the same amount of records.
                        newData.splice(i, 1, ...siblingData);
                        // Shift the prevDimTopRecords item to the right because of the previous row transforms the newData and increases the elements in newData
                        prevDimTopRecords.splice(siblingData.length, prevDimTopRecords.length - siblingData.length, ...prevDimTopRecords);
                        // Increase the index the amount of sibling record that replaces the current one. Subtract 1 because there is already i++ in the for cycle.
                        i += siblingData.length - 1;
                    }
                    // Add the current top sibling elements for the dimension
                    curDimTopRecords.push(cloneArray(siblingData, true));
                }
                data = newData;
                prevDim = row;
                prevDimTopRecords = curDimTopRecords;
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
        collection: any[],
        columns: IPivotDimension[],
        values: IPivotValue[],
        pivotKeys: IPivotKeys = DEFAULT_PIVOT_KEYS
    ): any[] {
        const res = this.processHierarchy(collection, columns, values, pivotKeys);
        return res;
    }

    private processHierarchy(collection, columns: IPivotDimension[], values, pivotKeys) {
        const result = [];
        collection.forEach(hierarchy => {
            // apply aggregations based on the created groups and generate column fields based on the hierarchies
            this.groupColumns(hierarchy, columns, values, pivotKeys);
            if (hierarchy[pivotKeys.children]) {
                let flatCols = {};
                PivotUtil.flattenColumnHierarchy(hierarchy[pivotKeys.children], values, pivotKeys).forEach(o => {
                    delete o[pivotKeys.records];
                    flatCols = { ...flatCols, ...o };
                });
                delete hierarchy[pivotKeys.children]; /* or we can keep it
                        and use when creating the columns in pivot grid instead of recreating it */
                const keys = Object.keys(hierarchy);
                //remove all record keys from final data since we don't need them anymore.
                hierarchy.processed = true;
                keys.forEach(k => {
                    if (k.indexOf(pivotKeys.records) !== -1) {
                        if (hierarchy[k] && hierarchy[k].length > 0 && k !== pivotKeys.records) {
                            const unprocessed = hierarchy[k].filter(r => !r.processed);
                            this.processHierarchy(unprocessed, columns, values, pivotKeys);
                        }
                        //delete hierarchy[k];
                    }
                    if (k === pivotKeys.level) {
                        delete hierarchy[k];
                    }
                });
                for (const property in flatCols) {
                    if (flatCols.hasOwnProperty(property)) {
                        hierarchy[property] = flatCols[property];
                    }
                }
                result.push(hierarchy);
            }
        });
        return result;
    }

    private groupColumns(hierarchy, columns, values, pivotKeys) {
        const children = hierarchy[pivotKeys.children];
        if (children) {
            this.groupColumns(children, columns, values, pivotKeys);
        } else if (hierarchy[pivotKeys.records]) {
            const leafRecords = this.getLeafs(hierarchy[pivotKeys.records], pivotKeys);
            hierarchy[pivotKeys.children] = PivotUtil.getFieldsHierarchy(leafRecords, columns, PivotDimensionType.Column, pivotKeys);
            PivotUtil.applyAggregations(hierarchy[pivotKeys.children], values, pivotKeys);
        }
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
        let resolvedValue = PivotUtil.extractValueFromDimension(this.dimension, obj) || obj[0];
        const formatAsDate = this.dimension.dataType === GridColumnDataType.Date || this.dimension.dataType === GridColumnDataType.DateTime;
        if (formatAsDate) {
            const date = parseDate(resolvedValue);
            resolvedValue = isTime && date ?
                new Date().setHours(date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()) : date;

        }
        return resolvedValue;
    }
}
