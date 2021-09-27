import { Pipe, PipeTransform } from '@angular/core';
import { IPivotKeys } from 'igniteui-angular';
import { cloneArray, cloneValue } from '../../core/utils';
import { DataUtil } from '../../data-operations/data-util';
import { FilteringExpressionsTree, IFilteringExpressionsTree } from '../../data-operations/filtering-expressions-tree';
import { IFilteringStrategy } from '../../data-operations/filtering-strategy';
import { IPivotDimension, IPivotValue } from './pivot-grid.interface';

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
        rows: IPivotDimension[],
        values?: IPivotValue[],
        pivotKeys: IPivotKeys = {aggregations: 'aggregations', records: 'records', children: 'children', level: 'level'}
    ): any[] {
        // build hierarchies - groups and subgroups
        const hierarchies = PivotUtil.getFieldsHierarchy(collection, rows, pivotKeys);
        // apply aggregations based on the created groups
        PivotUtil.applyAggregations(hierarchies, values, pivotKeys);
        // generate flat data from the hierarchies
        const data = PivotUtil.flattenHierarchy(hierarchies, collection[0] ?? [], pivotKeys);
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
        columns: IPivotDimension[],
        values?: IPivotValue[],
        pivotKeys: IPivotKeys = {aggregations: 'aggregations', records: 'records', children: 'children', level: 'level'}
    ): any[] {
        // build hierarchies - groups and subgroups by columns
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
                result.push({...hierarchy, ...flatCols});
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
            hierarchy[pivotKeys.children] = PivotUtil.getFieldsHierarchy(leafRecords, columns, pivotKeys);
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
        return record[pivotKeys.records] && record[pivotKeys.records].some(r => r[pivotKeys.records]);
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

export class PivotUtil {
    public static getFieldsHierarchy(data: any[], columns: IPivotDimension[], pivotKeys: IPivotKeys): Map<string, any> {
        const hierarchy = new Map<string, any>();
        for (const rec of data) {
            const vals = this.extractValuesFromDimension(columns, rec);
            for (const val of vals) { // this should go in depth also vals.children
                if (hierarchy.get(val.value) != null && val.children) {
                    this.applyHierarchyChildren(hierarchy, val, rec, pivotKeys.records);
                } else {
                    hierarchy.set(val.value, cloneValue(val));
                    hierarchy.get(val.value).children = new Map<string, any>();
                    this.applyHierarchyChildren(hierarchy, val, rec, pivotKeys.records);
                }
            }
        }
        return hierarchy;
    }

    public static extractValueFromDimension(dim: IPivotDimension, recData: any) {
        return typeof dim.member === 'string' ? recData[dim.member] : dim.member.call(this, recData);
    }

    public static extractValuesFromDimension(dims: IPivotDimension[], recData: any){
        const vals = [];
        let i = 0;
        for (const col of dims) {
            const value = this.extractValueFromDimension(col, recData);
            vals.push({ value });
            if (col.childLevels != null && col.childLevels.length > 0) {
                const childValues = this.extractValuesFromDimension(col.childLevels, recData);
                vals[i].children = childValues;
            }
            i++;
        }
        return vals;
    }

    public static applyAggregations(hierarchies, values, pivotKeys) {
        hierarchies.forEach((hierarchy) => {
            const children = hierarchy[pivotKeys.children];
            if (children) {
                this.applyAggregations(children, values, pivotKeys);
                const childrenAggregations = this.collectAggregations(children, pivotKeys);
                hierarchy[pivotKeys.aggregations] = this.aggregate(childrenAggregations, values);
            } else if (hierarchy[pivotKeys.records]) {
                hierarchy[pivotKeys.aggregations] = this.aggregate(hierarchy[pivotKeys.records], values);
            }
        });
    }

    public static aggregate(records, values: IPivotValue[]) {
        const result = {};
        for (const pivotValue of values) {
            result[pivotValue.member] = pivotValue.aggregate(records.map(r => r[pivotValue.member]));
        }

        return result;
    }

    public static flattenHierarchy(hierarchies, rec, pivotKeys, level = 0) {
        let flatData = [];
        const field = this.generateFieldValue(rec);
        hierarchies.forEach((h, key) => {
            let obj = {};
            obj[field] = key;
            obj[pivotKeys.records] = h[pivotKeys.records];
            obj = {...obj, ...h[pivotKeys.aggregations]};
            obj[pivotKeys.level] = level;
            flatData.push(obj);
            if (h[pivotKeys.children]) {
                obj[pivotKeys.records] = this.flattenHierarchy(h[pivotKeys.children], rec, pivotKeys, level + 1);
                flatData = [...flatData, ...obj[pivotKeys.records]];
            }
        });

        return flatData;
    }

    public static flattenColumnHierarchy(hierarchies, values, pivotKeys) {
        let flatData = [];
        hierarchies.forEach((h, key) => {
            const obj = {};
            for (const value of values) {
                obj[key] = h[pivotKeys.aggregations][value.member];
                obj[pivotKeys.records] = h[pivotKeys.records];
                flatData.push(obj);
                if (h[pivotKeys.children]) {
                    flatData = [...flatData, ...this.flattenColumnHierarchy(h[pivotKeys.children], values, pivotKeys)];
                }
            }
        });

        return flatData;
    }

    private static generateFieldValue(rec) {
        let i = 0;
        while (Object.keys(rec).indexOf('field' + ++i) !== -1) {}
        return 'field' + i;
    }

    private static collectAggregations(children, pivotKeys) {
        const result = [];
        children.forEach(value => result.push(value[pivotKeys.aggregations]));

        return result;
    }

    private static applyHierarchyChildren(hierarchy, val, rec, recordsKey) {
        for (const child of val.children) {
            if (!hierarchy.get(val.value).children.get(child.value)) {
                hierarchy.get(val.value).children.set(child.value, child);
            }

            if (hierarchy.get(val.value).children.get(child.value)[recordsKey]) {
                hierarchy.get(val.value).children.get(child.value)[recordsKey].push(rec);
            } else {
                hierarchy.get(val.value).children.get(child.value)[recordsKey] = [rec];
            }
        }
    }
}
