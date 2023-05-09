import { GridBaseAPIService } from '../api.service';
import { GridColumnDataType, DataUtil } from '../../data-operations/data-util';
import { ITreeGridRecord } from './tree-grid.interfaces';
import { HierarchicalTransaction, TransactionType, State } from '../../services/public_api';
import { Injectable } from '@angular/core';
import { cloneArray, mergeObjects } from '../../core/utils';
import { IFilteringExpressionsTree } from '../../data-operations/filtering-expressions-tree';
import { TreeGridFilteringStrategy } from './tree-grid.filtering.strategy';
import { ColumnType, GridType } from '../common/grid.interface';
import { ISortingExpression } from '../../data-operations/sorting-strategy';
import { IgxDataRecordSorting } from '../common/strategy';
import { FilterUtil } from '../../data-operations/filtering-strategy';

@Injectable()
export class IgxTreeGridAPIService extends GridBaseAPIService<GridType> {

    public override get_all_data(transactions?: boolean): any[] {
        const grid = this.grid;
        let data = grid && grid.flatData ? grid.flatData : [];
        data = transactions ? grid.dataWithAddedInTransactionRows : data;
        return data;
    }

    public override get_summary_data() {
        const grid = this.grid;
        const data = grid.processedRootRecords?.filter(row => row.isFilteredOutParent === undefined || row.isFilteredOutParent === false)
            .map(rec => rec.data);
        if (data && grid.transactions.enabled) {
            const deletedRows = grid.transactions.getTransactionLog().filter(t => t.type === TransactionType.DELETE).map(t => t.id);
            deletedRows.forEach(rowID => {
                const tempData = grid.primaryKey ? data.map(rec => rec[grid.primaryKey]) : data;
                const index = tempData.indexOf(rowID);
                if (index !== -1) {
                    data.splice(index, 1);
                }
            });
        }
        return data;
    }

    public override allow_expansion_state_change(rowID, expanded): boolean {
        const grid = this.grid;
        const row = grid.records.get(rowID);
        if (row.expanded === expanded ||
            ((!row.children || !row.children.length) && (!grid.loadChildrenOnDemand ||
                (grid.hasChildrenKey && !row.data[grid.hasChildrenKey])))) {
            return false;
        }
        return true;
    }

    public expand_path_to_record(record: ITreeGridRecord) {
        const grid = this.grid;
        const expandedStates = grid.expansionStates;

        while (record.parent) {
            record = record.parent;
            const expanded = this.get_row_expansion_state(record);

            if (!expanded) {
                expandedStates.set(record.key, true);
            }
        }
        grid.expansionStates = expandedStates;

        if (grid.rowEditable) {
            grid.gridAPI.crudService.endEdit(false);
        }
    }

    public override get_row_expansion_state(record: ITreeGridRecord): boolean {
        const grid = this.grid;
        const states = grid.expansionStates;
        const expanded = states.get(record.key);

        if (expanded !== undefined) {
            return expanded;
        } else {
            return record.children && record.children.length && record.level < grid.expansionDepth;
        }
    }

    public override should_apply_number_style(column: ColumnType): boolean {
        return column.dataType === GridColumnDataType.Number && column.visibleIndex !== 0;
    }

    public override deleteRowById(rowID: any): any {
        const treeGrid = this.grid;
        const flatDataWithCascadeOnDeleteAndTransactions =
            treeGrid.primaryKey &&
            treeGrid.foreignKey &&
            treeGrid.cascadeOnDelete &&
            treeGrid.transactions.enabled;

        if (flatDataWithCascadeOnDeleteAndTransactions) {
            treeGrid.transactions.startPending();
        }

        const record = super.deleteRowById(rowID);

        if (flatDataWithCascadeOnDeleteAndTransactions) {
            treeGrid.transactions.endPending(true);
        }

        return record;
    }

    public override deleteRowFromData(rowID: any, index: number) {
        const treeGrid = this.grid;
        const record = treeGrid.records.get(rowID);

        if (treeGrid.primaryKey && treeGrid.foreignKey) {
            index = treeGrid.primaryKey ?
                treeGrid.data.map(c => c[treeGrid.primaryKey]).indexOf(rowID) :
                treeGrid.data.indexOf(rowID);
            super.deleteRowFromData(rowID, index);

            if (treeGrid.cascadeOnDelete) {
                if (record && record.children) {
                    for (const child of record.children) {
                        super.deleteRowById(child.key);
                    }
                }
            }
        } else {
            const collection = record.parent ? record.parent.data[treeGrid.childDataKey] : treeGrid.data;
            index = treeGrid.primaryKey ?
                collection.map(c => c[treeGrid.primaryKey]).indexOf(rowID) :
                collection.indexOf(rowID);

            const selectedChildren = [];
            this.get_selected_children(record, selectedChildren);
            if (selectedChildren.length > 0) {
                treeGrid.deselectRows(selectedChildren);
            }

            if (treeGrid.transactions.enabled) {
                const path = treeGrid.generateRowPath(rowID);
                treeGrid.transactions.add({
                    id: rowID,
                    type: TransactionType.DELETE,
                    newValue: null,
                    path
                } as HierarchicalTransaction,
                    collection[index]
                );
            } else {
                collection.splice(index, 1);
            }
            this.grid.validation.clear(rowID);
        }
    }

    public get_selected_children(record: ITreeGridRecord, selectedRowIDs: any[]) {
        const grid = this.grid;
        if (!record.children || record.children.length === 0) {
            return;
        }
        for (const child of record.children) {
            if (grid.selectionService.isRowSelected(child.key)) {
                selectedRowIDs.push(child.key);
            }
            this.get_selected_children(child, selectedRowIDs);
        }
    }

    public override row_deleted_transaction(rowID: any): boolean {
        return this.row_deleted_parent(rowID) || super.row_deleted_transaction(rowID);
    }

    public override get_rec_by_id(rowID) {
        return this.grid.records.get(rowID);
    }

    /**
     * Returns the index of the record in the data view by pk or -1 if not found or primaryKey is not set.
     *
     * @param pk
     * @param dataCollection
     */
    public override get_rec_index_by_id(pk: string | number, dataCollection?: any[]): number {
        dataCollection = dataCollection || this.grid.data;
        return this.grid.primaryKey ? dataCollection.findIndex(rec => rec.data[this.grid.primaryKey] === pk) : -1;
    }

    public override addRowToData(data: any, parentRowID?: any) {
        if (parentRowID !== undefined && parentRowID !== null) {

            const state = this.grid.transactions.getState(parentRowID);
            // we should not allow adding of rows as child of deleted row
            if (state && state.type === TransactionType.DELETE) {
                throw Error(`Cannot add child row to deleted parent row`);
            }

            const parentRecord = this.grid.records.get(parentRowID);

            if (!parentRecord) {
                throw Error('Invalid parent row ID!');
            }
            this.grid.summaryService.clearSummaryCache({ rowID: parentRecord.key });
            if (this.grid.primaryKey && this.grid.foreignKey) {
                data[this.grid.foreignKey] = parentRowID;
                super.addRowToData(data);
            } else {
                const parentData = parentRecord.data;
                const childKey = this.grid.childDataKey;
                if (this.grid.transactions.enabled) {
                    const rowId = this.grid.primaryKey ? data[this.grid.primaryKey] : data;
                    const path: any[] = [];
                    path.push(...this.grid.generateRowPath(parentRowID));
                    path.push(parentRowID);
                    this.grid.transactions.add({
                        id: rowId,
                        path,
                        newValue: data,
                        type: TransactionType.ADD
                    } as HierarchicalTransaction,
                        null);
                } else {
                    if (!parentData[childKey]) {
                        parentData[childKey] = [];
                    }
                    parentData[childKey].push(data);
                }
            }
        } else {
            super.addRowToData(data);
        }
    }

    public override filterDataByExpressions(expressionsTree: IFilteringExpressionsTree): any[] {
        const records = this.filterTreeDataByExpressions(expressionsTree);
        const data = [];

        this.getFlatDataFromFilteredRecords(records, data);

        return data;
    }

    public override sortDataByExpressions(data: ITreeGridRecord[], expressions: ISortingExpression[]) {
        const records: ITreeGridRecord[] = DataUtil.sort(
            cloneArray(data),
            expressions,
            this.grid.sortStrategy ?? new IgxDataRecordSorting(),
            this.grid);
        return records.map(r => r.data);
    }

    public filterTreeDataByExpressions(expressionsTree: IFilteringExpressionsTree): ITreeGridRecord[] {
        let records = this.grid.rootRecords;

        if (expressionsTree.filteringOperands.length) {
            const state = {
                expressionsTree,
                strategy: this.grid.filterStrategy ?? new TreeGridFilteringStrategy()
            };
            records = FilterUtil.filter(cloneArray(records), state, this.grid);
        }

        return records;
    }

    protected override update_row_in_array(value: any, rowID: any, index: number) {
        const grid = this.grid;
        if (grid.primaryKey && grid.foreignKey) {
            super.update_row_in_array(value, rowID, index);
        } else {
            const record = grid.records.get(rowID);
            const childData = record.parent ? record.parent.data[grid.childDataKey] : grid.data;
            index = grid.primaryKey ? childData.map(c => c[grid.primaryKey]).indexOf(rowID) :
                childData.indexOf(rowID);
            childData[index] = value;
        }
    }

    /**
     * Updates related row of provided grid's data source with provided new row value
     *
     * @param grid Grid to update data for
     * @param rowID ID of the row to update
     * @param rowValueInDataSource Initial value of the row as it is in data source
     * @param rowCurrentValue Current value of the row as it is with applied previous transactions
     * @param rowNewValue New value of the row
     */
    protected override updateData(
        grid: GridType,
        rowID: any,
        rowValueInDataSource: any,
        rowCurrentValue: any,
        rowNewValue: { [x: string]: any }) {
        if (grid.transactions.enabled) {
            const path = grid.generateRowPath(rowID);
            const transaction: HierarchicalTransaction = {
                id: rowID,
                type: TransactionType.UPDATE,
                newValue: rowNewValue,
                path
            };
            grid.transactions.add(transaction, rowCurrentValue);
        } else {
            mergeObjects(rowValueInDataSource, rowNewValue);
        }
    }

    private row_deleted_parent(rowID: any): boolean {
        const grid = this.grid;
        if (!grid) {
            return false;
        }
        if ((grid.cascadeOnDelete && grid.foreignKey) || grid.childDataKey) {
            let node = grid.records.get(rowID);
            while (node) {
                const state: State = grid.transactions.getState(node.key);
                if (state && state.type === TransactionType.DELETE) {
                    return true;
                }
                node = node.parent;
            }
        }
        return false;
    }

    private getFlatDataFromFilteredRecords(records: ITreeGridRecord[], data: any[]) {
        if (!records || records.length === 0) {
            return;
        }

        for (const record of records) {
            if (!record.isFilteredOutParent) {
                data.push(record);
            }
            this.getFlatDataFromFilteredRecords(record.children, data);
        }
    }
}
