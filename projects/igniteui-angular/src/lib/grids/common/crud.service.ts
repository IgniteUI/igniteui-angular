import { Injectable } from '@angular/core';
import { first } from 'rxjs/operators';
import { IGridEditDoneEventArgs, IGridEditEventArgs, IgxGridBaseDirective, IRowDataEventArgs } from '../grid/public_api';
import { IgxRowDirective } from '../row.directive';
import { GridType } from './grid.interface';

export class IgxRow {
    public transactionState: any;
    public state: any;
    public newData: any;
    public isAddRow: boolean;

    constructor(public id: any, public index: number, public data: any, public grid: IgxGridBaseDirective & GridType) { }

    public createEditEventArgs(includeNewValue = true, event?: Event): IGridEditEventArgs {
        const args: IGridEditEventArgs = {
            rowID: this.id,
            rowData: this.data,
            oldValue: this.data,
            cancel: false,
            owner: this.grid,
            isAddRow: this.isAddRow || false,
            event
        };
        if (includeNewValue) {
            args.newValue = this.newData;
        }
        return args;
    }

    public createDoneEditEventArgs(cachedRowData: any, event?: Event): IGridEditDoneEventArgs {
        const updatedData = this.grid.transactions.enabled ?
            this.grid.transactions.getAggregatedValue(this.id, true) : this.grid.gridAPI.getRowData(this.id);
        const rowData = updatedData === null ? this.grid.gridAPI.getRowData(this.id) : updatedData;
        const args: IGridEditDoneEventArgs = {
            rowID: this.id,
            rowData,
            oldValue: cachedRowData,
            newValue: updatedData,
            owner: this.grid,
            isAddRow: this.isAddRow || false,
            event
        };

        return args;
    }
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

@Injectable()
export class IgxGridCRUDService {

    public grid: IgxGridBaseDirective & GridType;
    public cell: IgxCell | null = null;
    public row: IgxRow | null = null;
    public isInCompositionMode = false;
    public cancelAddMode = false;


    /**
     * @hidden @interal
     */
    // TODO: Consider changing the modifier to protected or private.
    public addRowParent = null;

    private _cellEditingBlocked = false;
    private _rowEditingBlocked = false;

    public createCell(cell): IgxCell {
        return new IgxCell(cell.cellID, cell.rowIndex, cell.column, cell.value, cell.value, cell.intRow.rowData, cell.grid);
    }

    public createRow(cell: IgxCell): IgxRow {
        return new IgxRow(cell.id.rowID, cell.rowIndex, cell.rowData, cell.grid);
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

    /**
     * @hidden @internal
     */
     public get rowInEditMode(): IgxRowDirective<IgxGridBaseDirective & GridType> {
        const editRowState = this.row;
        return editRowState !== null ? this.grid.rowList.find(e => e.rowID === editRowState.id) : null;
    }

    public get rowEditing(): boolean {
        return this.grid.rowEditable;
    }

    public get primaryKey(): any {
        return this.grid.primaryKey;
    }

    public get cellEditingBlocked() {
        return this._cellEditingBlocked;
    }

    public set cellEditingBlocked(val: boolean) {
        this._cellEditingBlocked = val;
    }

    public get rowEditingBlocked() {
        return this._rowEditingBlocked;
    }

    public set rowEditingBlocked(val: boolean) {
        this._rowEditingBlocked = val;
    }


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
            if (cell?.intRow.addRow) {
                this.beginAddRow(cell, event);
                return;
            }
            /** Changing the reference with the new editable cell */
            const newCell = this.createCell(cell);
            if (this.rowEditing) {
                const canceled = this.beginRowEdit(newCell, event);
                if (!canceled) {
                    this.beginCellEdit(newCell, event);
                }

            } else {
                this.beginCellEdit(newCell, event);
            }
        }
    }

    /** Clears cell and row editing state and closes row editing template if it is open */
    public endEditMode() {
        this.endCellEdit();
        if (this.grid.rowEditable) {
            this.endRowEdit();
            this.grid.closeRowEditingOverlay();
        }
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
     public endEdit(commit = true, event?: Event) {
        let canceled = false;
        if (!this.row && !this.cell) {
            return;
        }

        if (this.row?.isAddRow) {
            canceled = this.endAdd(commit, event);
            return canceled;
        }

        if (commit) {
            canceled = this.grid.gridAPI.submit_value(event);
            if (canceled) {
                return true;
            }
        } else {
            this.exitCellEdit(event);
        }

        canceled = this.exitRowEdit(commit, event);
        this.rowEditingBlocked = canceled;
        if (canceled) {
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

    /** Enters row edit mode */
    public beginRowEdit(newCell, event?: Event) {
        if (this.row && !this.sameRow(newCell.id.rowID)) {
            this._rowEditingBlocked = this.endEdit(true, event);
            if (this.rowEditingBlocked) {
                return true;
            }

            this.cell = newCell;
            this._rowEditingBlocked = false;
            this.endRowEdit();
        }

        if (this.grid.rowEditable && (this.grid.primaryKey === undefined || this.grid.primaryKey === null)) {
            console.warn('The grid must have a `primaryKey` specified when using `rowEditable`!');
        }

        if (!this.row) {
            this.cell = newCell;
            this.row = this.createRow(this.cell);
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

    /**
     * @hidden @internal
     */
    public endRowTransaction(commit: boolean, row: IgxRow, event?: Event) {
        row.newData = this.grid.transactions.getAggregatedValue(row.id, true);
        let rowEditArgs = row.createEditEventArgs(true, event);

        if (!commit) {
            this.grid.transactions.endPending(false);
        } else {
            rowEditArgs = this.grid.gridAPI.update_row(row, row.newData, event);
            if (rowEditArgs?.cancel) {
                return true;
            }
        }

        this.endRowEdit();

        const nonCancelableArgs = row.createDoneEditEventArgs(rowEditArgs.oldValue, event);
        this.grid.rowEditExit.emit(nonCancelableArgs);
        this.grid.closeRowEditingOverlay();
    }

    /** Exit row edit mode */
    public exitRowEdit(commit: boolean, event?: Event) {
        if (!this.grid.rowEditable ||
            this.grid.rowEditingOverlay &&
            this.grid.rowEditingOverlay.collapsed || !this.row) {
            return false;
        }

        if (this.rowEditingBlocked && this.cellEditingBlocked) {
            return true;
        }

        const canceled = this.endRowTransaction(commit, this.row, event);
        if (canceled) {
            return true;
        }
    }

    /**
     * @hidden
     * @internal
     */
    public endRowEditTabStop(commit = true, event?: Event) {
        const canceled = this.endEdit(commit, event);

        if (canceled) {
            return true;
        }

        const activeCell = this.grid.navigation.activeNode;
        if (activeCell && activeCell.row !== -1) {
            this.grid.tbody.nativeElement.focus();
        }
    }

    /** Clears row editing state */
    public endRowEdit() {
        this.row = null;
        this.rowEditingBlocked = false;
    }

    public beginCellEdit(newCell, event?: Event) {
        const args = newCell.createEditEventArgs(false, event);
        this.grid.cellEditEnter.emit(args);

        this._cellEditingBlocked = args.cancel;
        if (args.cancel) {
            this.endCellEdit();
        } else {
            this.cell = newCell;
        }

    }

    /** Exit cell edit mode */
    public exitCellEdit(event?: Event): boolean {
        if (!this.cell) {
            return false;
        }

        const newValue = this.cell.castToNumber(this.cell.editValue);
        const args = this.cell?.createDoneEditEventArgs(newValue, event);
        this.cell.value = newValue;


        this.grid.cellEditExit.emit(args);
        this.endCellEdit();
        return false;
    }

    /** Clears cell editing state */
    public endCellEdit() {
        this.cell = null;
        this.cellEditingBlocked = false;
    }

    /** Returns whether the targeted cell is in edit mode */
    public targetInEdit(rowIndex: number, columnIndex: number): boolean {
        if (!this.cell) {
            return false;
        }
        const res = this.cell.column.index === columnIndex && this.cell.rowIndex === rowIndex;
        return res;
    }

    /** Enters cell edit mode */
    public beginAddRow(cell, event?: Event) {
        const newCell = this.createCell(cell);
        newCell.primaryKey = this.primaryKey;
        cell.enterAddMode = true;
        this.cell = newCell;
        if (!this.sameRow(newCell.id.rowID)) {
            this.row = this.createRow(this.cell);
            this.row.isAddRow = true;
            const rowArgs = this.row.createEditEventArgs(false, event);
            this.grid.rowEditEnter.emit(rowArgs);
            if (rowArgs.cancel) {
                this.endEditMode();
                this.endAddRow();
                return;
            }
            this.grid.openRowOverlay(this.row.id);
        }
        const args = newCell.createEditEventArgs(false, event);
        this.grid.cellEditEnter.emit(args);
        if (args.cancel) {
            this.endCellEdit();
            return;
        }
    }

    public endAdd(commit = true, event?: Event) {
        const row = this.row;
        const cell = this.cell;
        const cachedRowData = { ...row.data };
        let cancelable = false;
        if (!row && !cell) {
            return;
        }
        if (commit) {
            this.grid.rowAdded.pipe(first()).subscribe((args: IRowDataEventArgs) => {
                const rowData = args.data;
                const pinnedIndex = this.grid.pinnedRecords.findIndex(x => x[this.primaryKey] === rowData[this.primaryKey]);
                // A check whether the row is in the current view
                const viewIndex = pinnedIndex !== -1 ? pinnedIndex : this._findRecordIndexInView(rowData);
                const dataIndex = this.grid.filteredSortedData.findIndex(data => data[this.primaryKey] === rowData[this.primaryKey]);
                const isInView = viewIndex !== -1 && !this.grid.navigation.shouldPerformVerticalScroll(viewIndex, 0);
                const showIndex = isInView ? -1 : dataIndex;
                this.grid.showSnackbarFor(showIndex);
            });
            cancelable = this.grid.gridAPI.submit_add_value(event);
            if (!cancelable) {
                const args = row.createEditEventArgs(true, event);
                this.grid.rowEdit.emit(args);
                if (args.cancel) {
                    return args.cancel;
                }
                const parentId = this._getParentRecordId();
                this.grid.gridAPI.addRowToData(row.data, parentId);
                const doneArgs = row.createDoneEditEventArgs(cachedRowData, event);
                this.grid.rowEditDone.emit(doneArgs);
                this.endRowEdit();
                if (this.addRowParent.isPinned) {
                    this.grid.pinRow(row.id);
                }
            }
            this.addRowParent = null;
            this.cancelAddMode = cancelable;
        } else {
            this.exitCellEdit(event);
            this.cancelAddMode = true;
        }
        this.endRowEdit();
        this.grid.closeRowEditingOverlay();
        this.grid.pipeTriggerNotifier.next();
        if (!this.cancelAddMode) {
            this.grid.cdr.detectChanges();
            this.grid.rowAdded.emit({ data: row.data });
        }
        const nonCancelableArgs = row.createDoneEditEventArgs(cachedRowData, event);
        this.grid.rowEditExit.emit(nonCancelableArgs);
        return this.cancelAddMode;
    }

    /**
     * @hidden @internal
     */
     public endAddRow() {
        this.cancelAddMode = true;
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

    private  _getParentRecordId() {
        if (this.addRowParent.asChild) {
            return this.addRowParent.asChild ? this.addRowParent.rowID : undefined;;
        } else if (this.addRowParent.rowID !== null && this.addRowParent.rowID !== undefined) {
            const spawnedForRecord = this.grid.gridAPI.get_rec_by_id(this.addRowParent.rowID);
            return spawnedForRecord?.parent?.rowID;
        }
    }
}
