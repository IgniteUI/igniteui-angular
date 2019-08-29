import { GridBaseAPIService } from '../api.service';
import { IgxTreeGridComponent } from './tree-grid.component';
import { DataType } from '../../data-operations/data-util';
import { ITreeGridRecord } from './tree-grid.interfaces';
import { IRowToggleEventArgs } from './tree-grid.interfaces';
import { IgxColumnComponent } from '../column.component';
import { HierarchicalTransaction, TransactionType, State } from '../../services';
import { mergeObjects } from '../../core/utils';

export class IgxTreeGridAPIService extends GridBaseAPIService<IgxTreeGridComponent> {
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

    public expand_row(rowID: any) {
        const grid = this.grid;
        const expandedStates = grid.expansionStates;
        expandedStates.set(rowID, true);
        grid.expansionStates = expandedStates;
        if (grid.rowEditable) {
            grid.endEdit(true);
        }
    }

    public collapse_row(rowID: any) {
        const grid = this.grid;
        const expandedStates = grid.expansionStates;
        expandedStates.set(rowID, false);
        grid.expansionStates = expandedStates;
        if (grid.rowEditable) {
            grid.endEdit(true);
        }
    }

    public toggle_row_expansion(rowID: any) {
        const grid = this.grid;
        const expandedStates = grid.expansionStates;
        const treeRecord = grid.records.get(rowID);

        if (treeRecord) {
            const isExpanded = this.get_row_expansion_state(treeRecord);
            expandedStates.set(rowID, !isExpanded);
            grid.expansionStates = expandedStates;
        }
        if (grid.rowEditable) {
            grid.endEdit(true);
        }
    }

    // TODO: Maybe move the focus logic in the tree cell ?
    public trigger_row_expansion_toggle(row: ITreeGridRecord, expanded: boolean, event?: Event, visibleColumnIndex?) {
        const grid = this.grid;

        if (row.expanded === expanded ||
            ((!row.children || !row.children.length) && (!grid.loadChildrenOnDemand ||
            (grid.hasChildrenKey && !row.data[grid.hasChildrenKey])))) {
            return;
        }

        const args: IRowToggleEventArgs = {
            rowID: row.rowID,
            expanded: expanded,
            event: event,
            cancel: false
        };
        grid.onRowToggle.emit(args);

        if (args.cancel) {
            return;
        }
        visibleColumnIndex = visibleColumnIndex ? visibleColumnIndex : 0;
        const expandedStates = grid.expansionStates;
        expandedStates.set(row.rowID, expanded);
        grid.expansionStates = expandedStates;

        if (grid.rowEditable) {
            grid.endEdit(true);
        }

        // TODO: Leave it to grid observer
        requestAnimationFrame(() => {
            const el = this.grid.selectionService.activeElement;
            if (el) {
                const cell = this.get_cell_by_visible_index(el.row, el.column);
                if (cell) {
                    cell.nativeElement.focus();
                }
            }
        });
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

    public should_apply_number_style(column: IgxColumnComponent): boolean {
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
                if (record && record.children && record.children.length > 0) {
                    for (let i = 0; i < record.children.length; i++) {
                        const child = record.children[i];
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
                    path: path
                },
                    collection[index]
                );
            } else {
                collection.splice(index, 1);
            }
        }
    }

    /**
     * Updates related row of provided grid's data source with provided new row value
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
                path: path
            };
            grid.transactions.add(transaction, rowCurrentValue);
        } else {
            mergeObjects(rowValueInDataSource, rowNewValue);
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
}
