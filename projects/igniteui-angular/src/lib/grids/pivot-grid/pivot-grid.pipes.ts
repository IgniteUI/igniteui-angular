import { Pipe, PipeTransform } from '@angular/core';
import { cloneArray } from '../../core/utils';
import { DataUtil } from '../../data-operations/data-util';
import { FilteringExpressionsTree, IFilteringExpressionsTree } from '../../data-operations/filtering-expressions-tree';
import { IFilteringStrategy } from '../../data-operations/filtering-strategy';
import { IPivotDimension, IPivotKeys, IPivotValue } from './pivot-grid.interface';
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
        rows: IPivotDimension[],
        values?: IPivotValue[],
        pivotKeys: IPivotKeys = {aggregations: 'aggregations', records: 'records', children: 'children', level: 'level'}
    ): any[] {
        // build hierarchies - groups and subgroups
        const hierarchies = PivotUtil.getFieldsHierarchy(collection, rows, pivotKeys);
        // apply aggregations based on the created groups
        // PivotUtil.applyAggregations(hierarchies, values, pivotKeys);
        // generate flat data from the hierarchies
        const data = PivotUtil.flattenHierarchy(hierarchies, collection[0] ?? [], rows, pivotKeys);
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
        return !(record[pivotKeys.records] && record[pivotKeys.records].some(r => r[pivotKeys.records]));
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
