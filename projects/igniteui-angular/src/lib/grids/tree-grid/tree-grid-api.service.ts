import { GridBaseAPIService } from '../api.service';
import { IgxTreeGridComponent } from './tree-grid.component';
import { DataType } from '../../data-operations/data-util';
import { ITreeGridRecord } from './tree-grid.interfaces';
import { HierarchicalTransaction, TransactionType, State } from '../../services/public_api';
import { Injectable } from '@angular/core';
import { ColumnType } from '../common/column.interface';
import { mergeObjects } from '../../core/utils';
import { IgxGridSelectionService } from '../selection/selection.service';

@Injectable()
export class IgxTreeGridAPIService extends GridBaseAPIService<IgxTreeGridComponent> {

    private rowsToBeSelected: Set<any>;
    private rowsToBeIndeterminate: Set<any>;

    public get selectionService(): IgxGridSelectionService {
        return this.grid.selectionService;
    }

    public get_all_data(transactions?: boolean): any[] {
        const grid = this.grid;
        const data = transactions ? grid.dataWithAddedInTransactionRows : grid.flatData;
        return data ? data : [];
    }

    public get_summary_data() {
        const grid = this.grid;
        const data = grid.processedRootRecords.filter(row => row.isFilteredOutParent === undefined || row.isFilteredOutParent === false)
            .map(rec => rec.data);
        if (grid.transactions.enabled) {
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

    public emitRowSelectionEvent(newSelection, added, removed, event?): boolean {
        const currSelection = this.selectionService.getSelectedRows();
        if (this.selectionService.areEqualCollections(currSelection, newSelection)) {
            return;
        }

        const args = {
            oldSelection: currSelection, newSelection,
            added, removed, event, cancel: false
        };

        this.calculateRowsNewSelectionState(args);

        args.newSelection = Array.from(this.rowsToBeSelected);

        // retrieve rows/parents/children which has been added/removed from the selection
        this.handleAddedAndRemovedArgs(args);

        this.grid.onRowSelectionChange.emit(args);

        if (args.cancel) {
            return;
        }

        // if args.newSelection hasn't been modified
        if (this.selectionService.areEqualCollections(Array.from(this.rowsToBeSelected), args.newSelection)) {
            this.selectionService.rowSelection = new Set(this.rowsToBeSelected);
            this.selectionService.indeterminateRows = new Set(this.rowsToBeIndeterminate);
            this.selectionService.clearHeaderCBState();
            this.selectionService.selectedRowsChange.next();
        } else {
            // select the rows within the modified args.newSelection with no event
            this.cascadeSelectRowsWithNoEvent(args.newSelection, true);
        }
    }

    public updateCascadeSelectionOnFilterAndCRUD(
        parents: Set<any>,
        firstExecution: boolean = true,
        visibleRowIDs?: any[],
        crudRowID?: any) {
        if (firstExecution) {
            // if the tree grid has flat structure
            // do not explicitly handle the selection state of the rows
            if (!parents.size) {
                return;
            }
            visibleRowIDs = this.selectionService.getRowIDs(this.selectionService.allData);
            this.rowsToBeSelected = new Set(this.selectionService.rowSelection);
            this.rowsToBeIndeterminate = new Set(this.selectionService.indeterminateRows);
            if (crudRowID) {
                this.selectionService.rowSelection.delete(crudRowID);
            }
        }
        if (!parents.size) {
            this.selectionService.rowSelection = new Set(this.rowsToBeSelected);
            this.selectionService.indeterminateRows = new Set(this.rowsToBeIndeterminate);
            // TO DO: emit selectionChangeD event, calculate its args through the handleAddedAndRemovedArgs method
            this.selectionService.clearHeaderCBState();
            this.selectionService.selectedRowsChange.next();
            return;
        }
        const newParents = new Set<any>();
        parents.forEach(parent => {
            this.handleRowSelectionState(parent, visibleRowIDs);
            if (parent && parent.parent) {
                newParents.add(parent.parent);
            }
        });
        this.updateCascadeSelectionOnFilterAndCRUD(newParents, false, visibleRowIDs);
    }

    cascadeSelectRowsWithNoEvent(rowIDs: any[], clearPrevSelection?: boolean): void {
        if (clearPrevSelection) {
            this.selectionService.indeterminateRows.clear();
            this.selectionService.rowSelection.clear();
            this.calculateRowsNewSelectionState({ added: rowIDs, removed: [] });
        } else {
            const oldSelection = this.selectionService.getSelectedRows();
            const newSelection = [...oldSelection, ...rowIDs];
            const args = { oldSelection, newSelection };

            // retrieve only the rows without their parents/children which has to be added to the selection
            this.handleAddedAndRemovedArgs(args);

            this.calculateRowsNewSelectionState(args);
        }
        this.selectionService.rowSelection = new Set(this.rowsToBeSelected);
        this.selectionService.indeterminateRows = new Set(this.rowsToBeIndeterminate);
        this.selectionService.clearHeaderCBState();
        this.selectionService.selectedRowsChange.next();
    }

    cascadeDeselectRowsWithNoEvent(rowIDs: any[]): void {
        const args = { added: [], removed: rowIDs };
        this.calculateRowsNewSelectionState(args);

        this.selectionService.rowSelection = new Set(this.rowsToBeSelected);
        this.selectionService.indeterminateRows = new Set(this.rowsToBeIndeterminate);
        this.selectionService.clearHeaderCBState();
        this.selectionService.selectedRowsChange.next();
    }

    public allow_expansion_state_change(rowID, expanded): boolean {
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
                expandedStates.set(record.rowID, true);
            }
        }
        grid.expansionStates = expandedStates;

        if (grid.rowEditable) {
            grid.endEdit(true);
        }
    }

    public get_row_expansion_state(record: ITreeGridRecord): boolean {
        const grid = this.grid;
        const states = grid.expansionStates;
        const expanded = states.get(record.rowID);

        if (expanded !== undefined) {
            return expanded;
        } else {
            return record.children && record.children.length && record.level < grid.expansionDepth;
        }
    }

    public should_apply_number_style(column: ColumnType): boolean {
        return column.dataType === DataType.Number && column.visibleIndex !== 0;
    }

    public deleteRowById(rowID: any) {
        const treeGrid = this.grid;
        const flatDataWithCascadeOnDeleteAndTransactions =
            treeGrid.primaryKey &&
            treeGrid.foreignKey &&
            treeGrid.cascadeOnDelete &&
            treeGrid.transactions.enabled;

        if (flatDataWithCascadeOnDeleteAndTransactions) {
            treeGrid.transactions.startPending();
        }

        super.deleteRowById(rowID);

        if (flatDataWithCascadeOnDeleteAndTransactions) {
            treeGrid.transactions.endPending(true);
        }
    }

    public deleteRowFromData(rowID: any, index: number) {
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
                        super.deleteRowById(child.rowID);
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
                },
                    collection[index]
                );
            } else {
                collection.splice(index, 1);
            }
        }
    }

    public get_selected_children(record: ITreeGridRecord, selectedRowIDs: any[]) {
        const grid = this.grid;
        if (!record.children || record.children.length === 0) {
            return;
        }
        for (const child of record.children) {
            if (grid.selectionService.isRowSelected(child.rowID)) {
                selectedRowIDs.push(child.rowID);
            }
            this.get_selected_children(child, selectedRowIDs);
        }
    }

    public row_deleted_transaction(rowID: any): boolean {
        return this.row_deleted_parent(rowID) || super.row_deleted_transaction(rowID);
    }

    public get_rec_by_id(rowID) {
        return this.grid.records.get(rowID);
    }

    public addRowToData(data: any, parentRowID?: any) {
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
            this.grid.summaryService.clearSummaryCache({ rowID: parentRecord.rowID });
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

    protected update_row_in_array(value: any, rowID: any, index: number) {
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
    protected updateData(
        grid: IgxTreeGridComponent,
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
                const state: State = grid.transactions.getState(node.rowID);
                if (state && state.type === TransactionType.DELETE) {
                    return true;
                }
                node = node.parent;
            }
        }
        return false;
    }

    /**
     * retrieve the rows which should be added/removed to/from the old selection
     */
    private handleAddedAndRemovedArgs(args: any) {
        args.removed = args.oldSelection.filter(x => args.newSelection.indexOf(x) < 0);
        args.added = args.newSelection.filter(x => args.oldSelection.indexOf(x) < 0);
    }


    /**
     * adds to rowsToBeProcessed set all visible children of the rows which was initially within the rowsToBeProcessed set
     *
     * @param rowsToBeProcessed set of the rows (without their parents/children) to be selected/deselected
     * @param visibleRowIDs list of all visible rowIds
     * @returns a new set with all direct parents of the rows within rowsToBeProcessed set
     */
    private collectRowsChildrenAndDirectParents(rowsToBeProcessed: Set<any>, visibleRowIDs: any[]): Set<any> {
        const processedRowsParents = new Set<any>();
        Array.from(rowsToBeProcessed).forEach((rowID) => {
            const rowTreeRecord = this.get_rec_by_id(rowID);
            const rowAndAllChildren = this.get_all_children(rowTreeRecord);
            rowAndAllChildren.forEach(row => {
                if (visibleRowIDs.indexOf(row.rowID) >= 0) {
                    rowsToBeProcessed.add(row.rowID);
                }
            });
            if (rowTreeRecord && rowTreeRecord.parent) {
                processedRowsParents.add(rowTreeRecord.parent);
            }
        });
        return processedRowsParents;
    }


    /**
     * populates the rowsToBeSelected and rowsToBeIndeterminate sets
     * with the rows which will be eventually in selected/indeterminate state
     */
    private calculateRowsNewSelectionState(args: any) {
        this.rowsToBeSelected = new Set<any>();
        this.rowsToBeIndeterminate = new Set<any>();

        const visibleRowIDs = this.selectionService.getRowIDs(this.selectionService.allData);
        const oldSelection = args.oldSelection ? args.oldSelection : this.selectionService.getSelectedRows();
        const oldIndeterminateRows = this.selectionService.getIndeterminateRows();

        const removed = new Set(args.removed);
        const added = new Set(args.added);

        if (removed && removed.size) {
            let removedRowsParents = new Set<any>();

            removedRowsParents = this.collectRowsChildrenAndDirectParents(removed, visibleRowIDs);

            oldSelection.forEach(x => {
                if (!removed.has(x)) {
                    this.rowsToBeSelected.add(x);
                }
            });

            oldIndeterminateRows.forEach(x => {
                if (!removed.has(x)) {
                    this.rowsToBeIndeterminate.add(x);
                }
            });

            Array.from(removedRowsParents).forEach((parent) => {
                this.handleParentSelectionState(parent, visibleRowIDs);
            });
        }

        if (added && added.size) {
            let addedRowsParents = new Set<any>();

            addedRowsParents = this.collectRowsChildrenAndDirectParents(added, visibleRowIDs);

            if (!this.rowsToBeSelected.size && !removed.size) {
                oldSelection.forEach(x => this.rowsToBeSelected.add(x));
            }

            added.forEach(x => this.rowsToBeSelected.add(x));

            if (!this.rowsToBeIndeterminate.size && !removed.size) {
                oldIndeterminateRows.forEach(x => {
                    if (!this.rowsToBeSelected.has(x)) {
                        this.rowsToBeIndeterminate.add(x);
                    }
                });
            } else {
                added.forEach(x => {
                    this.rowsToBeIndeterminate.delete(x);
                });
            }

            Array.from(addedRowsParents).forEach((parent) => {
                this.handleParentSelectionState(parent, visibleRowIDs);
            });
        }
    }

    /**
     * recursively handle the selection state of the direct and indirect parents
     */
    private handleParentSelectionState(treeRow: ITreeGridRecord, visibleRowIDs: any[]) {
        if (!treeRow) {
            return;
        }
        this.handleRowSelectionState(treeRow, visibleRowIDs);
        if (treeRow.parent) {
            this.handleParentSelectionState(treeRow.parent, visibleRowIDs);
        }
    }

    /**
     * Handle the selection state of a given row based the selection states of its direct children
     */
    private handleRowSelectionState(treeRow: ITreeGridRecord, visibleRowIDs: any[]) {
        let visibleChildren = [];
        if (treeRow && treeRow.children) {
            visibleChildren = treeRow.children.filter(child => visibleRowIDs.indexOf(child.rowID) >= 0);
        }
        if (visibleChildren.length) {
            if (visibleChildren.every(row => this.rowsToBeSelected.has(row.rowID))) {
                this.rowsToBeSelected.add(treeRow.rowID);
                this.rowsToBeIndeterminate.delete(treeRow.rowID);
            } else if (visibleChildren.some(row => this.rowsToBeSelected.has(row.rowID) || this.rowsToBeIndeterminate.has(row.rowID))) {
                this.rowsToBeIndeterminate.add(treeRow.rowID);
                this.rowsToBeSelected.delete(treeRow.rowID);
            } else {
                this.rowsToBeIndeterminate.delete(treeRow.rowID);
                this.rowsToBeSelected.delete(treeRow.rowID);
            }
        } else {
            // if the children of the row has been deleted and the row was selected do not change its state
            if (this.selectionService.isRowSelected(treeRow.rowID)) {
                this.rowsToBeSelected.add(treeRow.rowID);
                this.rowsToBeIndeterminate.delete(treeRow.rowID);
            } else {
                this.rowsToBeSelected.delete(treeRow.rowID);
                this.rowsToBeIndeterminate.delete(treeRow.rowID);
            }
        }
    }

    private get_all_children(record: ITreeGridRecord): any[] {
        const children = [];
        if (record && record.children && record.children.length) {
            for (const child of record.children) {
                children.push(...this.get_all_children(child));
                children.push(child);
            }
        }
        return children;
    }
}
