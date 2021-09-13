import { Injectable } from '@angular/core';
import { first } from 'rxjs/operators';
import { IGridEditDoneEventArgs, IGridEditEventArgs, IgxGridBaseDirective, IRowDataEventArgs } from '../grid/public_api';
import { IgxRowDirective } from '../row.directive';
import { GridType } from './grid.interface';
import { Subject } from 'rxjs';
import { isEqual } from '../../core/utils';

export class IgxEditRow {
    public transactionState: any;
    public state: any;
    public newData: any;

    constructor(public id: any, public index: number, public data: any, public grid: IgxGridBaseDirective & GridType) { }

    public createEditEventArgs(includeNewValue = true, event?: Event): IGridEditEventArgs {
        const args: IGridEditEventArgs = {
            rowID: this.id,
            rowData: this.data,
            oldValue: this.data,
            cancel: false,
            owner: this.grid,
            isAddRow: false,
            event
        };
        if (includeNewValue) {
            args.newValue = this.newData ?? this.data;
        }
        return args;
    }

    public createDoneEditEventArgs(cachedRowData: any, event?: Event): IGridEditDoneEventArgs {
        const updatedData = this.grid.transactions.enabled ?
            this.grid.transactions.getAggregatedValue(this.id, true) : this.grid.gridAPI.getRowData(this.id);
        const rowData = updatedData ?? this.grid.gridAPI.getRowData(this.id);
        const args: IGridEditDoneEventArgs = {
            rowID: this.id,
            rowData,
            oldValue: cachedRowData,
            newValue: updatedData,
            owner: this.grid,
            isAddRow: false,
            event
        };

        return args;
    }

    public getClassName() {
        return this.constructor.name;
    }
}

export class IgxAddRow extends IgxEditRow {
    public isAddRow = true;

    constructor(public id: any,
        public index: number,
        public data: any,
        public recordRef: any,
        public grid: IgxGridBaseDirective & GridType) {
        super(id, index, data, grid);
    }

    public createEditEventArgs(includeNewValue = true, event?: Event): IGridEditEventArgs {
        const args = super.createEditEventArgs(includeNewValue, event);
        args.oldValue = null;
        args.isAddRow = true;
        return args;
    }

    public createDoneEditEventArgs(cachedRowData: any, event?: Event): IGridEditDoneEventArgs {
        const args = super.createDoneEditEventArgs(null, event);
        args.isAddRow = true;
        return args;
    }
}

export interface IgxAddRowParent {
    rowID: string;
    index: number;
    asChild: boolean;
    isPinned: boolean;
}

export class IgxCell {
    public primaryKey: any;
    public state: any;

    constructor(
        public id,
        public rowIndex: number,
        public column,
        public value: any,
        public editValue: any,
        public rowData: any,
        public grid: IgxGridBaseDirective & GridType) { }

    public castToNumber(value: any): any {
        if (this.column.dataType === 'number' && !this.column.inlineEditorTemplate) {
            const v = parseFloat(value);
            return !isNaN(v) && isFinite(v) ? v : 0;
        }
        return value;
    }

    public createEditEventArgs(includeNewValue = true, event?: Event): IGridEditEventArgs {
        const args: IGridEditEventArgs = {
            rowID: this.id.rowID,
            cellID: this.id,
            rowData: this.rowData,
            oldValue: this.value,
            cancel: false,
            column: this.column,
            owner: this.grid,
            event
        };
        if (includeNewValue) {
            args.newValue = this.castToNumber(this.editValue);
        }
        return args;
    }

    public createDoneEditEventArgs(value: any, event?: Event): IGridEditDoneEventArgs {
        const updatedData = this.grid.transactions.enabled ?
            this.grid.transactions.getAggregatedValue(this.id.rowID, true) : this.rowData;
        const rowData = updatedData === null ? this.grid.gridAPI.getRowData(this.id.rowID) : updatedData;
        const args: IGridEditDoneEventArgs = {
            rowID: this.id.rowID,
            cellID: this.id,
            // rowData - should be the updated/committed rowData - this effectively should be the newValue
            // the only case we use this.rowData directly, is when there is no rowEditing or transactions enabled
            rowData,
            oldValue: this.value,
            newValue: value,
            column: this.column,
            owner: this.grid,
            event
        };
        return args;
    }
}

export class IgxCellCrudState {
    public grid: IgxGridBaseDirective & GridType;
    public cell: IgxCell | null = null;
    public row: IgxEditRow | null = null;
    public isInCompositionMode = false;

    public createCell(cell): IgxCell {
        // cell.rowData ?? cell.row.data covers the cases, where
        // 1. cell is an instance og IgxGridCellComponent
        // 2. cell is an instance of IgxGridCell
        // Note: if at some point we are going to get rid of using 1), then see test 'should allow adding row to empty grid':
        // cell.row.data will return a { data; rowID } object here, and test will fail
        return this.cell = new IgxCell(cell.cellID || cell.id, cell.row.index, cell.column, cell.value, cell.value,
            cell.rowData ?? cell.row.data, cell.grid);
    }

    public createRow(cell: IgxCell): IgxEditRow {
        return this.row = new IgxEditRow(cell.id.rowID, cell.rowIndex, cell.rowData, cell.grid);
    }

    public sameRow(rowID): boolean {
        return this.row && this.row.id === rowID;
    }

    public sameCell(cell: IgxCell): boolean {
        return (this.cell.id.rowID === cell.id.rowID &&
            this.cell.id.columnID === cell.id.columnID);
    }

    public get cellInEditMode(): boolean {
        return !!this.cell;
    }

    public beginCellEdit(event?: Event) {
        const args = this.cell.createEditEventArgs(false, event);
        this.grid.cellEditEnter.emit(args);

        if (args.cancel) {
            this.endCellEdit();
        }

    }

    public cellEdit(event?: Event) {
        const args = this.cell.createEditEventArgs(true, event);
        this.grid.cellEdit.emit(args);
        return args;
    }

    public updateCell(exit: boolean, event?: Event): IGridEditEventArgs {
        if (!this.cell) {
            return;
        }

        let doneArgs;
        if (isEqual(this.cell.value, this.cell.editValue)) {
            doneArgs = this.exitCellEdit(event);
            return doneArgs;
        }

        const args = this.cellEdit(event);
        if (args.cancel) {
            return args;
        }

        this.grid.gridAPI.update_cell(this.cell);

        doneArgs = this.cellEditDone(event, false);
        if (exit) {
            doneArgs = this.exitCellEdit(event);
        }

        return { ...args, ...doneArgs };
    }

    public cellEditDone(event, addRow: boolean): IGridEditDoneEventArgs {
        const newValue = this.cell.castToNumber(this.cell.editValue);
        const doneArgs = this.cell.createDoneEditEventArgs(newValue, event);
        this.grid.cellEditDone.emit(doneArgs);
        if (addRow) {
            doneArgs.rowData = this.row.data;
        }
        return doneArgs;
    }

    /** Exit cell edit mode */
    public exitCellEdit(event?: Event): IGridEditDoneEventArgs {
        if (!this.cell) {
            return;
        }

        const newValue = this.cell.castToNumber(this.cell.editValue);
        const args = this.cell?.createDoneEditEventArgs(newValue, event);

        this.cell.value = newValue;

        this.grid.cellEditExit.emit(args);
        this.endCellEdit();
        return args;
    }

    /** Clears cell editing state */
    public endCellEdit() {
        this.cell = null;
    }

    /** Returns whether the targeted cell is in edit mode */
    public targetInEdit(rowIndex: number, columnIndex: number): boolean {
        if (!this.cell) {
            return false;
        }
        const res = this.cell.column.index === columnIndex && this.cell.rowIndex === rowIndex;
        return res;
    }
}
export class IgxRowCrudState extends IgxCellCrudState {
    public row: IgxEditRow | null = null;
    public closeRowEditingOverlay = new Subject();

    private _rowEditingBlocked = false;

    public get primaryKey(): any {
        return this.grid.primaryKey;
    }

    public get rowInEditMode(): IgxRowDirective<IgxGridBaseDirective & GridType> {
        const editRowState = this.row;
        return editRowState !== null ? this.grid.rowList.find(e => e.rowID === editRowState.id) : null;
    }

    public get rowEditing(): boolean {
        return this.grid.rowEditable;
    }

    public get rowEditingBlocked() {
        return this._rowEditingBlocked;
    }

    public set rowEditingBlocked(val: boolean) {
        this._rowEditingBlocked = val;
    }

    /** Enters row edit mode */
    public beginRowEdit(event?: Event) {
        if (this.grid.rowEditable && (this.grid.primaryKey === undefined || this.grid.primaryKey === null)) {
            console.warn('The grid must have a `primaryKey` specified when using `rowEditable`!');
        }

        if (!this.row || !(this.row.getClassName() === IgxEditRow.name)) {
            if (!this.row) {
                this.createRow(this.cell);
            }
            const rowArgs = this.row.createEditEventArgs(false, event);

            this.grid.rowEditEnter.emit(rowArgs);
            if (rowArgs.cancel) {
                this.endEditMode();
                return true;
            }

            this.row.transactionState = this.grid.transactions.getAggregatedValue(this.row.id, true);
            this.grid.transactions.startPending();
            this.grid.openRowOverlay(this.row.id);
        }
    }

    public rowEdit(event: Event): IGridEditEventArgs {
        const args = this.row.createEditEventArgs(true, event);
        this.grid.rowEdit.emit(args);
        return args;
    }

    public updateRow(commit: boolean, event?: Event): IGridEditEventArgs {
        if (!this.grid.rowEditable ||
            this.grid.rowEditingOverlay &&
            this.grid.rowEditingOverlay.collapsed || !this.row) {
            return {} as IGridEditEventArgs;
        }

        let args;
        if (commit) {
            this.row.newData = this.grid.transactions.getAggregatedValue(this.row.id, true);
            this.updateRowEditData(this.row, this.row.newData);
            args = this.rowEdit(event);
            if (args.cancel) {
                delete this.row.newData;
                this.grid.transactions.clear(this.row.id);
                return args;
            }
        }

        args = this.endRowTransaction(commit, event);

        return args;
    }

    /**
     * @hidden @internal
     */
    public endRowTransaction(commit: boolean, event?: Event): IGridEditEventArgs {
        this.row.newData = this.grid.transactions.getAggregatedValue(this.row.id, true);
        let rowEditArgs = this.row.createEditEventArgs(true, event);

        let nonCancelableArgs;
        if (!commit) {
            this.grid.transactions.endPending(false);
        } else if (this.row.getClassName() === IgxEditRow.name) {
            rowEditArgs = this.grid.gridAPI.update_row(this.row, this.row.newData, event);
            nonCancelableArgs = this.rowEditDone(rowEditArgs.oldValue, event);
        } else {
            const rowAddArgs = this.row.createEditEventArgs(true, event);
            this.grid.rowAdd.emit(rowAddArgs);
            if (rowAddArgs.cancel) {
                return rowAddArgs;
            }

            this.grid.transactions.endPending(false);

            const parentId = this.getParentRowId();
            this.grid.gridAPI.addRowToData(this.row.newData ?? this.row.data, parentId);
            this.grid.triggerPipes();

            nonCancelableArgs = this.rowEditDone(null, event);
        }

        nonCancelableArgs = this.exitRowEdit(rowEditArgs.oldValue, event);

        return { ...nonCancelableArgs, ...rowEditArgs };
    }

    public rowEditDone(cachedRowData, event: Event) {
        const doneArgs = this.row.createDoneEditEventArgs(cachedRowData, event);
        this.grid.rowEditDone.emit(doneArgs);
        return doneArgs;
    }


    /** Exit row edit mode */
    public exitRowEdit(cachedRowData, event?: Event): IGridEditDoneEventArgs {
        const nonCancelableArgs = this.row.createDoneEditEventArgs(cachedRowData, event);
        this.grid.rowEditExit.emit(nonCancelableArgs);
        this.grid.closeRowEditingOverlay();

        this.endRowEdit();
        return nonCancelableArgs;
    }

    /** Clears row editing state */
    public endRowEdit() {
        this.row = null;
        this.rowEditingBlocked = false;
    }

    /** Clears cell and row editing state and closes row editing template if it is open */
    public endEditMode() {
        this.endCellEdit();
        if (this.grid.rowEditable) {
            this.endRowEdit();
            this.grid.closeRowEditingOverlay();
        }
    }

    public updateRowEditData(row: IgxEditRow, value?: any) {
        const grid = this.grid;

        const rowInEditMode = grid.gridAPI.crudService.row;
        row.newData = value ?? rowInEditMode.transactionState;


        if (rowInEditMode && row.id === rowInEditMode.id) {
            row.data = { ...row.data, ...rowInEditMode.transactionState };
            // TODO: Workaround for updating a row in edit mode through the API
        } else if (this.grid.transactions.enabled) {
            const state = grid.transactions.getState(row.id);
            row.data = state ? Object.assign({}, row.data, state.value) : row.data;
        }
    }

    protected getParentRowId() {
        return null;
    }
}

export class IgxRowAddCrudState extends IgxRowCrudState {
    public addRowParent: IgxAddRowParent = null;

    /**
     * @hidden @internal
     */
    public createAddRow(parentRow: IgxRowDirective<IgxGridBaseDirective & GridType>, asChild?: boolean) {
        this.createAddRowParent(parentRow, asChild);

        const newRec = this.grid.getEmptyRecordObjectFor(parentRow);
        const addRowIndex = this.addRowParent.index + 1;
        return this.row = new IgxAddRow(newRec.rowID, addRowIndex, newRec.data, newRec.recordRef, this.grid);
    }

    /**
     * @hidden @internal
     */
    public createAddRowParent(row: IgxRowDirective<IgxGridBaseDirective & GridType>, newRowAsChild?: boolean) {
        const rowIndex = row ? row.index : this.grid.rowList.length - 1;
        const rowId = row ? row.rowID : (rowIndex >= 0 ? this.grid.rowList.last.rowID : null);

        const isInPinnedArea = this.grid.isRecordPinnedByViewIndex(rowIndex);
        const pinIndex = this.grid.pinnedRecords.findIndex(x => x[this.primaryKey] === rowId);
        const unpinIndex = this.grid.getUnpinnedIndexById(rowId);
        this.addRowParent = {
            rowID: rowId,
            index: isInPinnedArea ? pinIndex : unpinIndex,
            asChild: newRowAsChild,
            isPinned: isInPinnedArea
        };
    }

    /**
     * @hidden @internal
     */
    public endRowTransaction(commit: boolean, event?: Event): IGridEditEventArgs {
        if (this.row && this.row.getClassName() === IgxAddRow.name) {
            this.grid.rowAdded.pipe(first()).subscribe((addRowArgs: IRowDataEventArgs) => {
                const rowData = addRowArgs.data;
                const pinnedIndex = this.grid.pinnedRecords.findIndex(x => x[this.primaryKey] === rowData[this.primaryKey]);
                // A check whether the row is in the current view
                const viewIndex = pinnedIndex !== -1 ? pinnedIndex : this._findRecordIndexInView(rowData);
                const dataIndex = this.grid.filteredSortedData.findIndex(data => data[this.primaryKey] === rowData[this.primaryKey]);
                const isInView = viewIndex !== -1 && !this.grid.navigation.shouldPerformVerticalScroll(viewIndex, 0);
                const showIndex = isInView ? -1 : dataIndex;
                this.grid.showSnackbarFor(showIndex);
            });
        }

        const args = super.endRowTransaction(commit, event);
        if (args.cancel) {
            return args;
        }

        this.endAddRow();
        if (commit) {
            this.grid.rowAddedNotifier.next({ data: args.newValue });
            this.grid.rowAdded.emit({ data: args.newValue });
        }

        return args;
    }

    /**
     * @hidden @internal
     */
    public endAddRow() {
        this.addRowParent = null;
        this.grid.triggerPipes();
    }

    /**
     * @hidden
     * @internal
     * TODO: consider changing modifier
     */
    public _findRecordIndexInView(rec) {
        return this.grid.dataView.findIndex(data => data[this.primaryKey] === rec[this.primaryKey]);
    }

    protected getParentRowId() {
        if (this.addRowParent.asChild) {
            return this.addRowParent.asChild ? this.addRowParent.rowID : undefined;;
        } else if (this.addRowParent.rowID !== null && this.addRowParent.rowID !== undefined) {
            const spawnedForRecord = this.grid.gridAPI.get_rec_by_id(this.addRowParent.rowID);
            return spawnedForRecord?.parent?.rowID;
        }
    }
}

@Injectable()
export class IgxGridCRUDService extends IgxRowAddCrudState {

    public enterEditMode(cell, event?: Event) {
        if (this.isInCompositionMode) {
            return;
        }

        if (this.cellInEditMode) {
            // TODO: case solely for f2/enter nav that uses enterEditMode as toggle. Refactor.
            const canceled = this.endEdit(true, event);

            if (!canceled || !this.cell) {
                this.grid.tbody.nativeElement.focus();
            }
        } else {

            this.createCell(cell);
            if (this.rowEditing) {
                if (this.row && !this.sameRow(this.cell?.id?.rowID)) {
                    this.rowEditingBlocked = this.endEdit(true, event);
                    if (this.rowEditingBlocked) {
                        return true;
                    }

                    // If enters here, @endEdit clears the new reference of the cell edit.
                    this.createCell(cell);
                    this.rowEditingBlocked = false;
                    this.endRowEdit();
                }

                const canceled = this.beginRowEdit(event);
                if (!canceled) {
                    this.beginCellEdit(event);
                }

            } else {
                this.beginCellEdit(event);
            }
        }
    }

    /**
     * Enters add row mode by creating temporary dummy so the user can fill in new row cells.
     *
     * @param parentRow Parent row after which the Add Row UI will be rendered.
     *                  If `null` will show it at the bottom after all rows (or top if there are not rows).
     * @param asChild Specifies if the new row should be added as a child to a tree row.
     * @param event Base event that triggered the add row mode.
     */
    public enterAddRowMode(parentRow: IgxRowDirective<IgxGridBaseDirective & GridType>, asChild?: boolean, event?: Event) {
        if (!this.rowEditing && (this.grid.primaryKey === undefined || this.grid.primaryKey === null)) {
            console.warn('The grid must use row edit mode to perform row adding! Please set rowEditable to true.');
            return;
        }
        this.endEdit(true, event);

        if (parentRow != null && this.grid.expansionStates.get(parentRow.rowID)) {
            this.grid.collapseRow(parentRow.rowID);
        }

        this.createAddRow(parentRow, asChild);

        this.grid.transactions.startPending();
        if (this.addRowParent.isPinned) {
            // If parent is pinned, add the new row to pinned records
            (this.grid as any)._pinnedRecordIDs.splice(this.row.index, 0, this.row.id);
        }

        this.grid.triggerPipes();
        this.grid.notifyChanges(true);

        this.grid.navigateTo(this.row.index, -1);
        const dummyRow = this.grid.gridAPI.get_row_by_index(this.row.index);
        dummyRow.triggerAddAnimation();
        dummyRow.addAnimationEnd.pipe(first()).subscribe(() => {
            const cell = dummyRow.cells.find(c => c.editable);
            if (cell) {
                this.grid.gridAPI.update_cell(this.cell);
                this.enterEditMode(cell, event);
                cell.activate();
            }
        });
    }

    /**
     * Finishes the row transactions on the current row.
     *
     * @remarks
     * If `commit === true`, passes them from the pending state to the data (or transaction service)
     * @example
     * ```html
     * <button igxButton (click)="grid.endEdit(true)">Commit Row</button>
     * ```
     * @param commit
     */
    // TODO: Implement the same representation of the method without evt emission.
    public endEdit(commit = true, event?: Event) {
        if (!this.row && !this.cell) {
            return;
        }

        let args;
        if (commit) {
            args = this.updateCell(true, event);
            if (args && args.cancel) {
                return args.cancel;
            }
        } else {
            this.exitCellEdit(event);
        }

        args = this.updateRow(commit, event);
        this.rowEditingBlocked = args.cancel;
        if (args.cancel) {
            return true;
        }

        const activeCell = this.grid.selectionService.activeElement;
        if (event && activeCell) {
            const rowIndex = activeCell.row;
            const visibleColIndex = activeCell.layout ? activeCell.layout.columnVisibleIndex : activeCell.column;
            this.grid.navigateTo(rowIndex, visibleColIndex);
        }

        return false;
    }
}
