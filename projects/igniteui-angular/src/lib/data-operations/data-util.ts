import { IFilteringState } from './filtering-state.interface';

import { IgxSorting, IgxDataRecordSorting } from './sorting-strategy';
import { IGroupByResult, IgxGrouping } from './grouping-strategy';

import { IPagingState, PagingError } from './paging-state.interface';

import { IGroupByExpandState, IGroupByKey } from './groupby-expand-state.interface';
import { IGroupByRecord } from './groupby-record.interface';
import { IGroupingState } from './groupby-state.interface';
import { TreeGridFilteringStrategy } from '../grids/tree-grid/tree-grid.filtering.pipe';
import { ISortingExpression } from './sorting-expression.interface';
import { FilteringStrategy } from './filtering-strategy';
import { ITreeGridRecord } from '../grids/tree-grid';
import { cloneValue, mergeObjects } from '../core/utils';
import { Transaction, TransactionType, HierarchicalTransaction } from '../services/transaction/transaction';

/**
 * @hidden
 */
export enum DataType {
    String = 'string',
    Number = 'number',
    Boolean = 'boolean',
    Date = 'date'
}

/**
 * @hidden
 */
export class DataUtil {
    public static sort<T>(data: T[], expressions: ISortingExpression[], sorting: IgxSorting = new IgxSorting()): T[] {
        return sorting.sort(data, expressions);
    }

    public static treeGridSort(hierarchicalData: ITreeGridRecord[],
        expressions: ISortingExpression[],
        parent?: ITreeGridRecord): ITreeGridRecord[] {
        let res: ITreeGridRecord[] = [];
        hierarchicalData.forEach((hr: ITreeGridRecord) => {
            const rec: ITreeGridRecord = DataUtil.cloneTreeGridRecord(hr);
            rec.parent = parent;
            if (rec.children) {
                rec.children = DataUtil.treeGridSort(rec.children, expressions, rec);
            }
            res.push(rec);
        });

        res = DataUtil.sort(res, expressions, new IgxDataRecordSorting());

        return res;
    }

    public static cloneTreeGridRecord(hierarchicalRecord: ITreeGridRecord) {
        const rec: ITreeGridRecord = {
            rowID: hierarchicalRecord.rowID,
            data: hierarchicalRecord.data,
            children: hierarchicalRecord.children,
            isFilteredOutParent: hierarchicalRecord.isFilteredOutParent,
            level: hierarchicalRecord.level,
            expanded: hierarchicalRecord.expanded
        };
        return rec;
    }

    public static group<T>(data: T[], state: IGroupingState): IGroupByResult {
        const grouping = new IgxGrouping();
        return grouping.groupBy(data, state.expressions);
    }
    public static restoreGroups(groupData: IGroupByResult, state: IGroupingState, groupsRecords: any[] = []): any[] {
        if (state.expressions.length === 0) {
            return groupData.data;
        }
        return this.restoreGroupsIterative(groupData, state, groupsRecords);
    }
    private static restoreGroupsIterative(groupData: IGroupByResult,
            state: IGroupingState, groupsRecords: any[]): any[] {
        const metadata = groupData.metadata;
        const result = [], added = [];
        let chain: any[];
        let i = 0, j;
        let pointer: IGroupByRecord;
        let expanded: boolean;
        // empty the array without changing reference
        groupsRecords.splice(0, groupsRecords.length);
        for (i = 0; i < metadata.length;) {
            chain = [metadata[i]];
            pointer = metadata[i].groupParent;
            // break off if the parent is already added
            while (pointer && added[0] !== pointer) {
                chain.push(pointer);
                added.shift();
                pointer = pointer.groupParent;
            }
            for (j = chain.length - 1; j >= 0; j--) {
                if (!chain[j].level) {
                    groupsRecords.push(chain[j]);
                } else {
                    const p = chain[j + 1] || added[added.length - 1];
                    if (p['groups']) {
                        p['groups'].push(chain[j]);
                    } else {
                        p['groups'] = [chain[j]];
                    }
                }
                result.push(chain[j]);
                added.unshift(chain[j]);
                const hierarchy = this.getHierarchy(chain[j]);
                const expandState: IGroupByExpandState = state.expansion.find((s) =>
                    this.isHierarchyMatch(s.hierarchy || [{ fieldName: chain[j].expression.fieldName, value: chain[j].value }], hierarchy));
                expanded = expandState ? expandState.expanded : state.defaultExpanded;
                if (!expanded) {
                    break;
                }
            }
            added.shift();
            j = Math.max(j, 0);
            const start = chain[j].records.findIndex(r => r === groupData.data[i]);
            const end = Math.min(metadata.length - i + start, chain[j].records.length);
            if (expanded) {
                result.push(...chain[j].records.slice(start, end));
            }
            i += end - start;
        }
        return result;
    }
    public static page<T>(data: T[], state: IPagingState): T[] {
        if (!state) {
            return data;
        }
        const len = data.length;
        const index = state.index;
        const res = [];
        const recordsPerPage = state.recordsPerPage;
        state.metadata = {
            countPages: 0,
            countRecords: data.length,
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
    public static filter<T>(data: T[], state: IFilteringState): T[] {
        if (!state.strategy) {
            state.strategy = new FilteringStrategy();
        }
        return state.strategy.filter(data, state.expressionsTree);
    }

    public static treeGridFilter(data: ITreeGridRecord[], state: IFilteringState): ITreeGridRecord[] {
        if (!state.strategy) {
            state.strategy = new TreeGridFilteringStrategy();
        }
        return state.strategy.filter(data, state.expressionsTree);
    }

    public static getHierarchy(gRow: IGroupByRecord): Array<IGroupByKey> {
        const hierarchy: Array<IGroupByKey> = [];
        if (gRow !== undefined && gRow.expression) {
            hierarchy.push({ fieldName: gRow.expression.fieldName, value: gRow.value });
            while (gRow.groupParent) {
                gRow = gRow.groupParent;
                hierarchy.unshift({ fieldName: gRow.expression.fieldName, value: gRow.value });
            }
        }
        return hierarchy;
    }

    public static isHierarchyMatch(h1: Array<IGroupByKey>, h2: Array<IGroupByKey>): boolean {
        if (h1.length !== h2.length) {
            return false;
        }
        return h1.every((level, index): boolean => {
            return level.fieldName === h2[index].fieldName && level.value === h2[index].value;
        });
    }

    /**
     * Merges all changes from provided transactions into provided data collection
     * @param data Collection to merge
     * @param transactions Transactions to merge into data
     * @param primaryKey Primary key of the collection, if any
     * @param deleteRows Should delete rows with DELETE transaction type from data
     * @returns Provided data collections updated with all provided transactions
     */
    public static mergeTransactions<T>(data: T[], transactions: Transaction[], primaryKey?: any, deleteRows: boolean = false): T[] {
        data.forEach((item: any, index: number) => {
            const rowId = primaryKey ? item[primaryKey] : item;
            const transaction = transactions.find(t => t.id === rowId);
            if (transaction && transaction.type === TransactionType.UPDATE) {
                data[index] = transaction.newValue;
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
        deleteRows: boolean = false): any[] {

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
                            collection[updateIndex] = mergeObjects(cloneValue(collection[updateIndex]), transaction.newValue);
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
