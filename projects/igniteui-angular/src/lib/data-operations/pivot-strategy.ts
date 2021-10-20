
import { IPivotDimension, IPivotKeys, IPivotValue, PivotDimensionType } from '../grids/pivot-grid/pivot-grid.interface';
import { PivotUtil } from '../grids/pivot-grid/pivot-util';

export interface IPivotDimensionStrategy {
    process(collection: any,
        dimensions: IPivotDimension[],
        values: IPivotValue[],
        pivotKeys?: IPivotKeys): any[];
}

export class NoopPivotDimensionsStrategy implements IPivotDimensionStrategy {
    private static _instance: NoopPivotDimensionsStrategy = null;

    private constructor() {  }

    public static instance() {
        return this._instance || (this._instance = new NoopPivotDimensionsStrategy());
    }

    public process(collection: any[], _: IPivotDimension[], __: IPivotValue[]): any[] {
        return collection;
    }
}


export class PivotRowDimensionsStrategy implements IPivotDimensionStrategy {
    private static _instance: PivotRowDimensionsStrategy = null;

    private constructor() {  }

    public static instance() {
        return this._instance || (this._instance = new PivotRowDimensionsStrategy());
    }

    public process(
            collection: any,
            rows: IPivotDimension[],
            values?: IPivotValue[],
            pivotKeys: IPivotKeys =
            { aggregations: 'aggregations', records: 'records', children: 'children', level: 'level'}
        ): any[] {
            let hierarchies;
            let data;
            let prevRowField;
            for (const row of rows) {
                if (!data) {
                    // build hierarchies - groups and subgroups
                    hierarchies = PivotUtil.getFieldsHierarchy(collection, [row], PivotDimensionType.Row, pivotKeys);
                    // generate flat data from the hierarchies
                    data = PivotUtil.processHierarchy(hierarchies, collection[0] ?? [], pivotKeys, 0, true);
                    row.fieldName = hierarchies.get(hierarchies.keys().next().value).dimension.fieldName;
                    prevRowField = row.fieldName;
                } else {
                    const newData = [...data];
                    for (let i = 0; i < newData.length; i++) {
                        const hierarchyFields = PivotUtil
                            .getFieldsHierarchy(newData[i][pivotKeys.records], [row], PivotDimensionType.Row, pivotKeys);
                        const siblingData = PivotUtil
                            .processHierarchy(hierarchyFields, newData[i] ?? [], pivotKeys, 0);
                        row.fieldName = hierarchyFields.get(hierarchyFields.keys().next().value).dimension.fieldName;
                        PivotUtil.processSiblingProperties(newData[i], siblingData, pivotKeys);
                        // process combined groups
                        for (const sibling of siblingData) {
                            const childCollection = sibling[prevRowField + '_' + pivotKeys.records] || [];
                            for (const child of childCollection) {
                                child[row.fieldName] = sibling[row.fieldName];
                                child[row.fieldName + '_' + pivotKeys.level] = sibling[row.fieldName + '_' + pivotKeys.level];
                                child[row.fieldName + '_' + pivotKeys.records] = [];
                                const hierarchyFields2 = PivotUtil
                                .getFieldsHierarchy(child[pivotKeys.records], [row], PivotDimensionType.Row, pivotKeys);
                                const siblingData2 = PivotUtil
                                .processHierarchy(hierarchyFields2, child ?? [], pivotKeys, 0);
                                for(const sib of siblingData2) {
                                    child[row.fieldName + '_' + pivotKeys.records] =
                                child[row.fieldName + '_' + pivotKeys.records].concat(sib[row.fieldName + '_' + pivotKeys.records]);
                                }
                                PivotUtil.processSiblingProperties(child, siblingData2, pivotKeys);
                            }
                        }
                        newData.splice(i , 1, ...siblingData);
                        i += siblingData.length - 1;
                    }
                    data = newData;
                }
            }
            return data;
        }
    }

export class PivotColumnDimensionsStrategy implements IPivotDimensionStrategy {
    private static _instance: PivotRowDimensionsStrategy = null;

    private constructor() {  }

    public static instance() {
        return this._instance || (this._instance = new PivotColumnDimensionsStrategy());
    }

    public process(
            collection: any[],
            columns: IPivotDimension[],
            values: IPivotValue[],
            pivotKeys: IPivotKeys = {aggregations: 'aggregations', records: 'records', children: 'children', level: 'level'}
        ): any[] {
            const result = [];
            collection.forEach(hierarchy => {
                // apply aggregations based on the created groups and generate column fields based on the hierarchies
                this.groupColumns(hierarchy, columns, values, pivotKeys);
                if (hierarchy[pivotKeys.children]) {
                    let flatCols = {};
                    PivotUtil.flattenColumnHierarchy(hierarchy[pivotKeys.children], values, pivotKeys).forEach(o => {
                        delete o[pivotKeys.records];
                        flatCols = {...flatCols, ...o};
                    });
                    delete hierarchy[pivotKeys.children]; /* or we can keep it
                    and use when creating the columns in pivot grid instead of recreating it */
                    if (this.isLeaf(hierarchy, pivotKeys)) {
                        delete hierarchy[pivotKeys.records]; /* remove the helper records of the actual records so that
                    expand indicators can be rendered properly */
                    }
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
