import { Pipe, PipeTransform } from '@angular/core';
import { cloneArray } from '../../core/utils';
import { DataUtil, GridColumnDataType } from '../../data-operations/data-util';
import { IGroupingExpression } from '../../data-operations/grouping-expression.interface';
import { GridBaseAPIService } from '../api.service';
import { GridType } from '../common/grid.interface';
import { IgxGridBaseDirective } from '../grid-base.directive';
import { ISortingExpression } from './../../data-operations/sorting-expression.interface';
import { IgxTreeGridAPIService } from './tree-grid-api.service';
import { IgxTreeGridComponent } from './tree-grid.component';
import { ITreeGridRecord } from './tree-grid.interfaces';

/** @hidden */
class GroupByRecord {
    public key: any;
    public groups: GroupByRecord[];
    public records: any[];
}

export class ITreeGridAggregation {
    public field: string;
    public aggregate: (parent: any, children: any[]) => any;
}

/** @hidden */
@Pipe({
    name: 'treeGridGrouping'
})
export class IgxTreeGridGroupingPipe implements PipeTransform {
    private grid: IgxTreeGridComponent;

    public transform(collection: any[],
                     groupingExpressions: IGroupingExpression[],
                     groupKey: string,
                     primaryKey: string,
                     childDataKey: string,
                     aggregations?: ITreeGridAggregation[],
                     grid?: IgxTreeGridComponent
                    //   _: number
                    ): any[] {
        if (groupingExpressions.length === 0) {
            return collection;
        }

        this.grid = grid;

        const sortingExpressions: ISortingExpression[] = [];
        groupingExpressions.forEach(expr => {
            sortingExpressions.push({
                fieldName: expr.fieldName,
                dir: expr.dir,
                ignoreCase: expr.ignoreCase,
                strategy: expr.strategy
            });
        });
        const sortedCollection = DataUtil.sort(cloneArray(collection), sortingExpressions, this.grid.sortStrategy, this.grid);

        const result = [];
        const groupedRecords = this.groupByMultiple(sortedCollection, groupingExpressions);
        this.flattenGrouping(groupedRecords, groupKey, primaryKey,
            childDataKey, '', result, aggregations);

        return result;
    }

    private flattenGrouping(groupRecords: GroupByRecord[],
                            groupKey: string,
                            primaryKey: string,
                            childDataKey: string,
                            parentID: any,
                            data: any[],
                            aggregations: ITreeGridAggregation[] = []) {
        for (const groupRecord of groupRecords) {
            const parent = {};
            const children = groupRecord.records;

            parent[primaryKey] = parentID + groupRecord.key;
            parent[childDataKey] = [];

            for (const aggregation of aggregations) {
                parent[aggregation.field] = aggregation.aggregate(parent, children);
            }

            parent[groupKey] = groupRecord.key + ` (${groupRecord.records.length})`;
            data.push(parent);

            if (groupRecord.groups) {
                this.flattenGrouping(groupRecord.groups, groupKey, primaryKey, childDataKey,
                    parent[primaryKey], parent[childDataKey], aggregations);
            } else {
                parent[childDataKey] = children;
            }
        }
    }

    private groupByMultiple(array: any[], groupingExpressions: IGroupingExpression[], index = 0): GroupByRecord[] {
        const res = this.groupBy(array, groupingExpressions[index]);

        if (index + 1 < groupingExpressions.length) {
           for (const groupByRecord of res) {
                groupByRecord.groups = this.groupByMultiple(groupByRecord.records, groupingExpressions, index + 1);
            }
        }

        return res;
    }

    private groupBy(array: any[], groupingExpression: IGroupingExpression): GroupByRecord[] {
        const column = this.grid?.getColumnByName(groupingExpression.fieldName);
        const isDateTime = column?.dataType === GridColumnDataType.Date ||
            column?.dataType === GridColumnDataType.DateTime ||
            column?.dataType === GridColumnDataType.Time;
        const map: Map<any, GroupByRecord> = new Map<any, GroupByRecord>();
        for (const record of array) {
            const key = isDateTime
                ? this.grid.datePipe.transform(record[groupingExpression.fieldName])
                : record[groupingExpression.fieldName];

            let groupByRecord: GroupByRecord;

            if (map.has(key)) {
                groupByRecord = map.get(key);
            } else {
                groupByRecord = new GroupByRecord();
                groupByRecord.key = key;
                groupByRecord.records = [];
                map.set(key, groupByRecord);
            }

            groupByRecord.records.push(record);
        }

        return Array.from(map.values());
    }
}
