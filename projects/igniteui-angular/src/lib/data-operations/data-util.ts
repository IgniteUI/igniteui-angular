import { IGroupByResult } from './grouping-result.interface';

import { IPagingState, PagingError } from './paging-state.interface';

import { IGroupByKey } from './groupby-expand-state.interface';
import { IGroupByRecord } from './groupby-record.interface';
import { IGroupingState } from './groupby-state.interface';
import { mergeObjects, mkenum } from '../core/utils';
import { Transaction, TransactionType, HierarchicalTransaction } from '../services/transaction/transaction';
import { getHierarchy, isHierarchyMatch } from './operations';
import { GridType } from '../grids/common/grid.interface';
import { ITreeGridRecord } from '../grids/tree-grid/tree-grid.interfaces';
import { ISortingExpression } from './sorting-strategy';
import {
    IGridSortingStrategy,
    IGridGroupingStrategy,
    IgxDataRecordSorting,
    IgxSorting,
    IgxGrouping
} from '../grids/common/strategy';
import { DefaultDataCloneStrategy, IDataCloneStrategy } from '../data-operations/data-clone-strategy';
import { IGroupingExpression } from './grouping-expression.interface';

/**
 * @hidden
 */
 export const DataType = /*@__PURE__*/mkenum({
    String: 'string',
    Number: 'number',
    Boolean: 'boolean',
    Date: 'date',
    DateTime: 'dateTime',
    Time: 'time',
    Currency: 'currency',
    Percent: 'percent',
    Image: 'image'
});
export type DataType = (typeof DataType)[keyof typeof DataType];

/**
 * @hidden
 */
export const GridColumnDataType = DataType;
export type GridColumnDataType = (typeof GridColumnDataType)[keyof typeof GridColumnDataType];

/**
 * @hidden
 */
export class DataUtil {
    public static sort<T>(data: T[], expressions: ISortingExpression[], sorting: IGridSortingStrategy = new IgxSorting(),
        grid?: GridType): T[] {
        return sorting.sort(data, expressions, grid);
    }

    public static treeGridSort(hierarchicalData: ITreeGridRecord[],
        expressions: ISortingExpression[],
        sorting: IGridSortingStrategy = new IgxDataRecordSorting(),
        parent?: ITreeGridRecord,
        grid?: GridType): ITreeGridRecord[] {
        let res: ITreeGridRecord[] = [];
        hierarchicalData.forEach((hr: ITreeGridRecord) => {
            const rec: ITreeGridRecord = DataUtil.cloneTreeGridRecord(hr);
            rec.parent = parent;
            if (rec.children) {
                rec.children = DataUtil.treeGridSort(rec.children, expressions, sorting, rec, grid);
            }
            res.push(rec);
        });

        res = DataUtil.sort(res, expressions, sorting, grid);

        return res;
    }

    public static cloneTreeGridRecord(hierarchicalRecord: ITreeGridRecord) {
        const rec: ITreeGridRecord = {
            key: hierarchicalRecord.key,
            data: hierarchicalRecord.data,
            children: hierarchicalRecord.children,
            isFilteredOutParent: hierarchicalRecord.isFilteredOutParent,
            level: hierarchicalRecord.level,
            expanded: hierarchicalRecord.expanded
        };
        return rec;
    }

    public static group<T>(data: T[], state: IGroupingState, grouping: IGridGroupingStrategy = new IgxGrouping(), grid: GridType = null,
        groupsRecords: any[] = [], fullResult: IGroupByResult = { data: [], metadata: [] }): IGroupByResult {
        groupsRecords.splice(0, groupsRecords.length);
        return grouping.groupBy(data, state, grid, groupsRecords, fullResult);
    }

    public static page<T>(data: T[], state: IPagingState, dataLength?: number): T[] {
        if (!state) {
            return data;
        }
        const len = dataLength !== undefined ? dataLength : data.length;
        const index = state.index;
        const res = [];
        const recordsPerPage = dataLength !== undefined && state.recordsPerPage > dataLength ? dataLength : state.recordsPerPage;
        state.metadata = {
            countPages: 0,
            countRecords: len,
            error: PagingError.None
        };
        if (index < 0 || isNaN(index)) {
            state.metadata.error = PagingError.IncorrectPageIndex;
            return res;
        }
        if (recordsPerPage <= 0 || isNaN(recordsPerPage)) {
            state.metadata.error = PagingError.IncorrectRecordsPerPage;
            return res;
        }
        state.metadata.countPages = Math.ceil(len / recordsPerPage);
        if (!len) {
            return data;
        }
        if (index >= state.metadata.countPages) {
            state.metadata.error = PagingError.IncorrectPageIndex;
            return res;
        }
        return data.slice(index * recordsPerPage, (index + 1) * recordsPerPage);
    }

    public static correctPagingState(state: IPagingState, length: number) {
        const maxPage = Math.ceil(length / state.recordsPerPage) - 1;
        if (!isNaN(maxPage) && state.index > maxPage) {
            state.index = maxPage;
        }
    }

    public static getHierarchy(gRow: IGroupByRecord): Array<IGroupByKey> {
        return getHierarchy(gRow);
    }

    public static isHierarchyMatch(h1: Array<IGroupByKey>, h2: Array<IGroupByKey>, expressions: IGroupingExpression[]): boolean {
        return isHierarchyMatch(h1, h2, expressions);
    }

    /**
     * Merges all changes from provided transactions into provided data collection
     *
     * @param data Collection to merge
     * @param transactions Transactions to merge into data
     * @param primaryKey Primary key of the collection, if any
     * @param deleteRows Should delete rows with DELETE transaction type from data
     * @returns Provided data collections updated with all provided transactions
     */
    public static mergeTransactions<T>(data: T[], transactions: Transaction[], primaryKey?: any, cloneStrategy: IDataCloneStrategy = new DefaultDataCloneStrategy(), deleteRows = false): T[] {
        data.forEach((item: any, index: number) => {
            const rowId = primaryKey ? item[primaryKey] : item;
            const transaction = transactions.find(t => t.id === rowId);
            if (transaction && transaction.type === TransactionType.UPDATE) {
                data[index] = mergeObjects(cloneStrategy.clone(data[index]), transaction.newValue);
            }
        });

        if (deleteRows) {
            transactions
                .filter(t => t.type === TransactionType.DELETE)
                .forEach(t => {
                    const index = primaryKey ? data.findIndex(d => d[primaryKey] === t.id) : data.findIndex(d => d === t.id);
                    if (0 <= index && index < data.length) {
                        data.splice(index, 1);
                    }
                });
        }

        data.push(...transactions
            .filter(t => t.type === TransactionType.ADD)
            .map(t => t.newValue));

        return data;
    }

    /**
     * Merges all changes from provided transactions into provided hierarchical data collection
     *
     * @param data Collection to merge
     * @param transactions Transactions to merge into data
     * @param childDataKey Data key of child collections
     * @param primaryKey Primary key of the collection, if any
     * @param deleteRows Should delete rows with DELETE transaction type from data
     * @returns Provided data collections updated with all provided transactions
     */
    public static mergeHierarchicalTransactions(
        data: any[],
        transactions: HierarchicalTransaction[],
        childDataKey: any,
        primaryKey?: any,
        cloneStrategy: IDataCloneStrategy = new DefaultDataCloneStrategy(),
        deleteRows = false): any[] {
        for (const transaction of transactions) {
            if (transaction.path) {
                const parent = this.findParentFromPath(data, primaryKey, childDataKey, transaction.path);
                let collection: any[] = parent ? parent[childDataKey] : data;
                switch (transaction.type) {
                    case TransactionType.ADD:
                        //  if there is no parent this is ADD row at root level
                        if (parent && !parent[childDataKey]) {
                            parent[childDataKey] = collection = [];
                        }
                        collection.push(transaction.newValue);
                        break;
                    case TransactionType.UPDATE:
                        const updateIndex = collection.findIndex(x => x[primaryKey] === transaction.id);
                        if (updateIndex !== -1) {
                            collection[updateIndex] = mergeObjects(cloneStrategy.clone(collection[updateIndex]), transaction.newValue);
                        }
                        break;
                    case TransactionType.DELETE:
                        if (deleteRows) {
                            const deleteIndex = collection.findIndex(r => r[primaryKey] === transaction.id);
                            if (deleteIndex !== -1) {
                                collection.splice(deleteIndex, 1);
                            }
                        }
                        break;
                }
            } else {
                //  if there is no path this is ADD row in root. Push the newValue to data
                data.push(transaction.newValue);
            }
        }
        return data;
    }

    public static parseValue(dataType: GridColumnDataType, value: any): any {
        if (dataType === GridColumnDataType.Number || dataType === GridColumnDataType.Currency || dataType === GridColumnDataType.Percent) {
            value = parseFloat(value);
        }

        return value;
    }

    private static findParentFromPath(data: any[], primaryKey: any, childDataKey: any, path: any[]): any {
        let collection: any[] = data;
        let result: any;

        for (const id of path) {
            result = collection && collection.find(x => x[primaryKey] === id);
            if (!result) {
                break;
            }

            collection = result[childDataKey];
        }

        return result;
    }
}
