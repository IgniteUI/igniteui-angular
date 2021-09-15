import { Pipe, PipeTransform } from '@angular/core';
import { cloneArray } from '../../core/utils';
import { DataUtil } from '../../data-operations/data-util';
import { FilteringExpressionsTree, IFilteringExpressionsTree } from '../../data-operations/filtering-expressions-tree';
import { IFilteringStrategy } from '../../data-operations/filtering-strategy';
import { IGroupingExpression } from '../../data-operations/grouping-expression.interface';
import { SortingDirection } from '../../data-operations/sorting-expression.interface';
import { DefaultSortingStrategy } from '../../data-operations/sorting-strategy';
import { GridBaseAPIService } from '../api.service';
import { IgxPivotGridComponent } from './pivot-grid.component';
import { IPivotDimension, IPivotValue } from './pivot-grid.interface';

/**
 * @hidden
 */
@Pipe({
    name: 'gridPivotRow',
    pure: true
})
export class IgxPivotRowPipe implements PipeTransform {

    constructor(private gridAPI: GridBaseAPIService<IgxPivotGridComponent>) { }

    public transform(
        collection: any,
        rows: IPivotDimension[],
        values?: IPivotValue[]
    ): any[] {

        const result: any[] = collection.slice();
        let groupingExpressions: IGroupingExpression[] = [];

        // group the data in a way using the rows.member declarations in a groupingComparer
        for (const row of rows) {
            groupingExpressions = groupingExpressions.concat(this.buildGroupingExpressions(row));
        }

        // need to extend the grouping and improve the groupingComparer function capabilities
        const sorted = DataUtil.sort(result, groupingExpressions);
        const groupResult = DataUtil
            .group(sorted, { defaultExpanded: true, expansion: [], expressions: groupingExpressions });

        // go around the data and aggregate by the specified values, aggregations should be
        // stored into the groups
        for (const val of values) {
            this.applyAggregation(groupResult.data, val);
        }

        return groupResult.data;
    }

    private buildGroupingExpressions(row: IPivotDimension): IGroupingExpression[] {
        let groupingExpressions: IGroupingExpression[] = [{
            fieldName: row.name,
            dir: SortingDirection.Asc,
            groupingComparer: (a, b) => DefaultSortingStrategy.instance()
                .compareValues(row.member.call(this, a), row.member.call(this, b))
        }];
        if (row.childLevels) {
            for (const childRow of row.childLevels) {
                groupingExpressions = groupingExpressions.concat(this.buildGroupingExpressions(childRow));
            }
        }
        return groupingExpressions;
    }

    private applyAggregation(data: any[], val: IPivotValue): void {
        for (const record of data) {
            if (record.groups) {
                this.applyAggregation(record.groups, val);
                record[val.member] = val.aggregate(record.records.map(r => r[val.member]));
            } else if (record.records) {
                record[val.member] = val.aggregate(record.records.map(r => r[val.member]));
            }
        }
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

    constructor(private gridAPI: GridBaseAPIService<IgxPivotGridComponent>) { }

    public transform(
        collection: any,
        columns: IPivotDimension[],
        values?: IPivotValue[]
    ): any[] {
        return collection;
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

    constructor(private gridAPI: GridBaseAPIService<IgxPivotGridComponent>) { }

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
