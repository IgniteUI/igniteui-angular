import { Pipe, PipeTransform } from '@angular/core';
import { GridColumnDataType } from '../../data-operations/data-util';
import { IGroupingExpression } from '../../data-operations/grouping-expression.interface';
import { IgxSorting } from '../../data-operations/sorting-strategy';
import { IgxTreeGridComponent } from './tree-grid.component';

const HIDDEN_FIELD_NAME = '_Igx_Hidden_Data_';

/**
 * @hidden
 * @internal
 */
class GroupByRecord {
    public key: string;
    public value: any;
    public groups: GroupByRecord[];
    public records: any[];
}

export class ITreeGridAggregation {
    public field: string;
    public aggregate: (parent: any, children: any[]) => any;
}

export class IgxGroupedTreeGridSorting extends IgxSorting {
    private static _instance: IgxGroupedTreeGridSorting = null;

    public static instance() {
        return this._instance || (this._instance = new IgxGroupedTreeGridSorting());
    }

    protected getFieldValue(obj: any, key: string, isDate: boolean = false, isTime: boolean = false): any {
        return obj.data[HIDDEN_FIELD_NAME] ?
            super.getFieldValue(obj.data[HIDDEN_FIELD_NAME], key, isDate, isTime) :
            super.getFieldValue(obj.data, key, isDate, isTime);
    }
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
                     childDataKey: string,
                     grid: IgxTreeGridComponent,
                     aggregations?: ITreeGridAggregation[]
                    ): any[] {
        if (groupingExpressions.length === 0) {
            return collection;
        }

        if (groupKey.toLowerCase() === childDataKey.toLowerCase()) {
            throw new Error('Group key and child data key cannot be the same.');
        }

        this.grid = grid;

        const result = [];
        const groupedRecords = this.groupByMultiple(collection, groupingExpressions);
        this.flattenGrouping(groupedRecords, groupKey,
            childDataKey, result, aggregations);

        return result;
    }

    private flattenGrouping(groupRecords: GroupByRecord[],
                            groupKey: string,
                            childDataKey: string,
                            data: any[],
                            aggregations: ITreeGridAggregation[] = []) {
        for (const groupRecord of groupRecords) {
            const parent = {};
            const children = groupRecord.records;

            parent[childDataKey] = [];

            for (const aggregation of aggregations) {
                parent[aggregation.field] = aggregation.aggregate(parent, children);
            }

            parent[groupKey] = groupRecord.value + ` (${groupRecord.records.length})`;
            parent[HIDDEN_FIELD_NAME] = { [groupRecord.key]: groupRecord.value };
            data.push(parent);

            if (groupRecord.groups) {
                this.flattenGrouping(groupRecord.groups, groupKey, childDataKey,
                    parent[childDataKey], aggregations);
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
        const key = groupingExpression.fieldName;
        const column = this.grid?.getColumnByName(key);
        const isDateTime = column?.dataType === GridColumnDataType.Date ||
            column?.dataType === GridColumnDataType.DateTime ||
            column?.dataType === GridColumnDataType.Time;
        const map: Map<any, GroupByRecord> = new Map<any, GroupByRecord>();
        for (const record of array) {
            const value = isDateTime
                ? this.grid.datePipe.transform(record[key])
                : record[key];

            let groupByRecord: GroupByRecord;

            if (map.has(value)) {
                groupByRecord = map.get(value);
            } else {
                groupByRecord = new GroupByRecord();
                groupByRecord.key = key;
                groupByRecord.value = value;
                groupByRecord.records = [];
                map.set(value, groupByRecord);
            }

            groupByRecord.records.push(record);
        }

        return Array.from(map.values());
    }
}
