import { Pipe, PipeTransform } from '@angular/core';
import { cloneArray, cloneValue } from '../../core/utils';
import { DataUtil } from '../../data-operations/data-util';
import { FilteringExpressionsTree, IFilteringExpressionsTree } from '../../data-operations/filtering-expressions-tree';
import { IFilteringStrategy } from '../../data-operations/filtering-strategy';
import { IPivotDimension, IPivotValue } from './pivot-grid.interface';

/**
 * @hidden
 */
@Pipe({
    name: 'gridPivotRow',
    pure: true
})
export class IgxPivotRowPipe implements PipeTransform {

    constructor() { }

    public transform(
        collection: any,
        rows: IPivotDimension[],
        values?: IPivotValue[]
    ): any[] {


        // build hierarchies - groups and subgroups
        const hierarchies = PivotUtil.getFieldsHierarchy(collection, rows);
        // apply aggregations based on the created groups
        PivotUtil.applyAggregations(hierarchies, values);
        // generate flat data from the hierarchies
        const data = PivotUtil.flattenHierarchy(hierarchies, collection[0] ?? []);
        return data;
    }
}

/**
 * @hidden
 */
@Pipe({
    name: 'gridPivotColumn',
    pure: true
})
export class IgxPivotColumnPipe implements PipeTransform {

    public transform(
        collection: any,
        columns: IPivotDimension[],
        values?: IPivotValue[]
    ): any[] {
        // build hierarchies - groups and subgroups
        const hierarchies = PivotUtil.getFieldsHierarchy(collection, columns);
        // apply aggregations based on the created groups
        PivotUtil.applyAggregations(hierarchies, values);
        // generate column fields based on the hierarchies

        return [];
    }


}

/**
 * @hidden
 */
@Pipe({
    name: 'gridPivotFilter',
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
    public static getFieldsHierarchy(data: any[], columns: IPivotDimension[]): Map<string, any> {
        const hierarchy = new Map<string, any>();
        for (const rec of data) {
            const vals = this.extractValuesFromDimension(columns, rec);
            for (const val of vals) { // this should go in depth also vals.children
                if (hierarchy.get(val.value) != null && val.children) {
                    this.applyHierarchyChildren(hierarchy, val, rec);
                } else {
                    hierarchy.set(val.value, cloneValue(val));
                    hierarchy.get(val.value).children = new Map<string, any>();
                    this.applyHierarchyChildren(hierarchy, val, rec);
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

    public static applyAggregations(hierarchies, values) {
        hierarchies.forEach((hierarchy) => {
            const children = hierarchy['children'];
            if (children) {
                this.applyAggregations(children, values);
                const childrenAggregations = this.collectAggregations(children);
                hierarchy['aggregations'] = this.aggregate(childrenAggregations, values);
            } else if (hierarchy['records']) {
                hierarchy['aggregations'] = this.aggregate(hierarchy['records'], values);
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

    public static flattenHierarchy(hierarchies, rec) {
        let flatData = [];
        const field = this.generateFieldValue(rec);
        hierarchies.forEach((h, key) => {
            let obj = {};
            obj[field] = key;
            obj['records'] = h['records'];
            obj = {...obj, ...h['aggregations']};
            flatData.push(obj);
            if (h['children']) {
                flatData = [...flatData, ...this.flattenHierarchy(h['children'], rec)];
            }
        });

        return flatData;
    }

    private static generateFieldValue(rec) {
        let i = 0;
        while (Object.keys(rec).indexOf('field' + ++i) !== -1) {}
        return 'field' + i;
    }

    private static collectAggregations(children) {
        const result = [];
        children.forEach(value => result.push(value['aggregations']));

        return result;
    }

    private static applyHierarchyChildren(hierarchy, val, rec, recordsKey = 'records') {
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
