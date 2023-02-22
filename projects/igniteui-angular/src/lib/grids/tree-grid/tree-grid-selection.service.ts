import { Injectable } from '@angular/core';
import { GridSelectionMode } from '../common/enums';
import { IgxGridSelectionService } from '../selection/selection.service';
import { ITreeGridRecord } from './tree-grid.interfaces';


@Injectable()
export class IgxTreeGridSelectionService extends IgxGridSelectionService {
    private rowsToBeSelected: Set<any>;
    private rowsToBeIndeterminate: Set<any>;

    /** Select specified rows. No event is emitted. */
    public selectRowsWithNoEvent(rowIDs: any[], clearPrevSelection?): void {
        if (this.grid && this.grid.rowSelection === GridSelectionMode.multipleCascade) {
            this.cascadeSelectRowsWithNoEvent(rowIDs, clearPrevSelection);
            return;
        }
        super.selectRowsWithNoEvent(rowIDs, clearPrevSelection);
    }

    /** Deselect specified rows. No event is emitted. */
    public deselectRowsWithNoEvent(rowIDs: any[]): void {
        if (this.grid.rowSelection === GridSelectionMode.multipleCascade) {
            this.cascadeDeselectRowsWithNoEvent(rowIDs);
            return;
        }
        super.deselectRowsWithNoEvent(rowIDs);
    }

    public emitRowSelectionEvent(newSelection, added, removed, event?): boolean {
        if (this.grid.rowSelection === GridSelectionMode.multipleCascade) {
            this.emitCascadeRowSelectionEvent(newSelection, added, removed, event);
            return;
        }

        super.emitRowSelectionEvent(newSelection, added, removed, event);
    }

    public updateCascadeSelectionOnFilterAndCRUD(
        parents: Set<any>,
        crudRowID?: any,
        visibleRowIDs: Set<any> = null) {
        if (visibleRowIDs === null) {
            // if the tree grid has flat structure
            // do not explicitly handle the selection state of the rows
            if (!parents.size) {
                return;
            }
            visibleRowIDs = new Set(this.getRowIDs(this.allData));
            this.rowsToBeSelected = new Set(this.rowSelection);
            this.rowsToBeIndeterminate = new Set(this.indeterminateRows);
            if (crudRowID) {
                this.rowSelection.delete(crudRowID);
            }
        }
        if (!parents.size) {
            this.rowSelection = new Set(this.rowsToBeSelected);
            this.indeterminateRows = new Set(this.rowsToBeIndeterminate);
            // TODO: emit selectionChangeD event, calculate its args through the handleAddedAndRemovedArgs method
            this.clearHeaderCBState();
            this.selectedRowsChange.next();
            return;
        }
        const newParents = new Set<any>();
        parents.forEach(parent => {
            this.handleRowSelectionState(parent, visibleRowIDs);
            if (parent && parent.parent) {
                newParents.add(parent.parent);
            }
        });
        this.updateCascadeSelectionOnFilterAndCRUD(newParents, null, visibleRowIDs);
    }

    private cascadeSelectRowsWithNoEvent(rowIDs: any[], clearPrevSelection?: boolean): void {
        if (clearPrevSelection) {
            this.indeterminateRows.clear();
            this.rowSelection.clear();
            this.calculateRowsNewSelectionState({ added: rowIDs, removed: [] });
        } else {
            const oldSelection = this.getSelectedRows();
            const newSelection = [...oldSelection, ...rowIDs];
            const args = { oldSelection, newSelection };

            // retrieve only the rows without their parents/children which has to be added to the selection
            this.handleAddedAndRemovedArgs(args);

            this.calculateRowsNewSelectionState(args);
        }
        this.rowSelection = new Set(this.rowsToBeSelected);
        this.indeterminateRows = new Set(this.rowsToBeIndeterminate);
        this.clearHeaderCBState();
        this.selectedRowsChange.next();
    }

    private cascadeDeselectRowsWithNoEvent(rowIDs: any[]): void {
        const args = { added: [], removed: rowIDs };
        this.calculateRowsNewSelectionState(args);

        this.rowSelection = new Set(this.rowsToBeSelected);
        this.indeterminateRows = new Set(this.rowsToBeIndeterminate);
        this.clearHeaderCBState();
        this.selectedRowsChange.next();
    }

    public get selectionService(): IgxGridSelectionService {
        return this.grid.selectionService;
    }

    private emitCascadeRowSelectionEvent(newSelection, added, removed, event?): boolean {
        const currSelection = this.getSelectedRows();
        if (this.areEqualCollections(currSelection, newSelection)) {
            return;
        }

        const args = {
            owner: this.grid, oldSelection: this.getSelectedRowsData(), newSelection,
            added, removed, event, cancel: false
        };

        this.calculateRowsNewSelectionState(args, !!this.grid.primaryKey);
        args.newSelection = Array.from(this.allData.filter(r => this.rowsToBeSelected.has(this.grid.primaryKey ? r[this.grid.primaryKey] : r)));

        // retrieve rows/parents/children which has been added/removed from the selection
        this.handleAddedAndRemovedArgs(args);

        this.grid.rowSelectionChanging.emit(args);

        if (args.cancel) {
            return;
        }
        const newSelectionIDs = args.newSelection.map(r => this.grid.primaryKey? r[this.grid.primaryKey] : r)
        // if args.newSelection hasn't been modified
        if (this.areEqualCollections(Array.from(this.rowsToBeSelected), newSelectionIDs)) {
            this.rowSelection = new Set(this.rowsToBeSelected);
            this.indeterminateRows = new Set(this.rowsToBeIndeterminate);
            this.clearHeaderCBState();
            this.selectedRowsChange.next();
        } else {
            // select the rows within the modified args.newSelection with no event
            this.cascadeSelectRowsWithNoEvent(newSelectionIDs, true);
        }
    }


    /**
     * retrieve the rows which should be added/removed to/from the old selection
     */
    private handleAddedAndRemovedArgs(args: any) {
        const newSelectionSet = new Set(args.newSelection);
        const oldSelectionSet = new Set(args.oldSelection);
        args.removed = args.oldSelection.filter(x => !newSelectionSet.has(x));
        args.added = args.newSelection.filter(x => !oldSelectionSet.has(x));
    }

    /**
     * adds to rowsToBeProcessed set all visible children of the rows which was initially within the rowsToBeProcessed set
     *
     * @param rowsToBeProcessed set of the rows (without their parents/children) to be selected/deselected
     * @param visibleRowIDs list of all visible rowIds
     * @returns a new set with all direct parents of the rows within rowsToBeProcessed set
     */
    private collectRowsChildrenAndDirectParents(rowsToBeProcessed: Set<any>, visibleRowIDs: Set<any>, adding: boolean, shouldConvert: boolean): Set<any> {
        const processedRowsParents = new Set<any>();
        Array.from(rowsToBeProcessed).forEach((row) => {
            const rowID = shouldConvert ? row[this.grid.primaryKey] : row;
            this.selectDeselectRow(rowID, adding);
            const rowTreeRecord = this.grid.gridAPI.get_rec_by_id(rowID);
            const rowAndAllChildren = this.get_all_children(rowTreeRecord);
            rowAndAllChildren.forEach(r => {
                if (visibleRowIDs.has(r.key)) {
                    this.selectDeselectRow(r.key, adding);
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
    private calculateRowsNewSelectionState(args: any, shouldConvert = false) {
        this.rowsToBeSelected = new Set<any>(args.oldSelection ? shouldConvert ? args.oldSelection.map(r => r[this.grid.primaryKey]) : args.oldSelection : this.getSelectedRows());
        this.rowsToBeIndeterminate = new Set<any>(this.getIndeterminateRows());

        const visibleRowIDs = new Set(this.getRowIDs(this.allData));

        const removed = new Set(args.removed);
        const added = new Set(args.added);

        if (removed && removed.size) {
            let removedRowsParents = new Set<any>();

            removedRowsParents = this.collectRowsChildrenAndDirectParents(removed, visibleRowIDs, false, shouldConvert);

            Array.from(removedRowsParents).forEach((parent) => {
                this.handleParentSelectionState(parent, visibleRowIDs);
            });
        }

        if (added && added.size) {
            let addedRowsParents = new Set<any>();

            addedRowsParents = this.collectRowsChildrenAndDirectParents(added, visibleRowIDs, true, shouldConvert);

            Array.from(addedRowsParents).forEach((parent) => {
                this.handleParentSelectionState(parent, visibleRowIDs);
            });
        }
    }

    /**
     * recursively handle the selection state of the direct and indirect parents
     */
    private handleParentSelectionState(treeRow: ITreeGridRecord, visibleRowIDs: Set<any>) {
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
    private handleRowSelectionState(treeRow: ITreeGridRecord, visibleRowIDs: Set<any>) {
        let visibleChildren = [];
        if (treeRow && treeRow.children) {
            visibleChildren = treeRow.children.filter(child => visibleRowIDs.has(child.key));
        }
        if (visibleChildren.length) {
            if (visibleChildren.every(row => this.rowsToBeSelected.has(row.key))) {
                this.selectDeselectRow(treeRow.key, true);
            } else if (visibleChildren.some(row => this.rowsToBeSelected.has(row.key) || this.rowsToBeIndeterminate.has(row.key))) {
                this.rowsToBeIndeterminate.add(treeRow.key);
                this.rowsToBeSelected.delete(treeRow.key);
            } else {
                this.selectDeselectRow(treeRow.key, false);
            }
        } else {
            // if the children of the row has been deleted and the row was selected do not change its state
            if (this.isRowSelected(treeRow.key)) {
                this.selectDeselectRow(treeRow.key, true);
            } else {
                this.selectDeselectRow(treeRow.key, false);
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

    private selectDeselectRow(rowID: any, select: boolean) {
        if (select) {
            this.rowsToBeSelected.add(rowID);
            this.rowsToBeIndeterminate.delete(rowID);
        } else {
            this.rowsToBeSelected.delete(rowID);
            this.rowsToBeIndeterminate.delete(rowID);
        }
    }

}
