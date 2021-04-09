import { Injectable } from '@angular/core';
import { first } from 'rxjs/operators';
import { IGridEditDoneEventArgs, IGridEditEventArgs, IgxGridBaseDirective, IgxRowDirective, IRowDataEventArgs } from '../grid/public_api';
import { GridType } from './grid.interface';
import { Subject } from 'rxjs';
import { isEqual } from '../../core/utils';

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
export class IgxCellCrudState {
    public grid: IgxGridBaseDirective & GridType;
    public cell: IgxCell | null = null;
    public row: IgxRow | null = null;
    public isInCompositionMode = false;
    public cancelAddMode = false;

    private _cellEditingBlocked = false;

    public get cellEditingBlocked() {
        return this._cellEditingBlocked;
    }

    public set cellEditingBlocked(val) {
        this._cellEditingBlocked = val;
    }

    public createCell(cell) {
        this.cell = new IgxCell(cell.cellID, cell.rowIndex, cell.column, cell.value, cell.value, cell.row.rowData, cell.grid);
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

    public beginCellEdit(event?: Event) {
        const args = this.cell.createEditEventArgs(false, event);
        this.grid.cellEditEnter.emit(args);

        this._cellEditingBlocked = args.cancel;
        if (args.cancel) {
            this.endCellEdit();
        }

    }

    public cellEdit(event?: Event) {
        const args = this.cell.createEditEventArgs(true, event);

        if (isEqual(args.oldValue, args.newValue)) {
            return args;
        }

        this.grid.cellEdit.emit(args);
        this.cellEditingBlocked = args.cancel;
        return args;
    }

    public updateCell(exit: boolean, event?: Event): IGridEditEventArgs {
        if (!this.cell) {
            return;
        }

        const args = this.cellEdit(event);
        if (args.cancel) {
            return args;
        }

        this.grid.gridAPI.update_cell();

        let doneArgs = this.cellEditDone(event);
        if (exit) {
            doneArgs = this.exitCellEdit(event);
        }
;
        return {...args, ...doneArgs};
    }

    public cellEditDone(event): IGridEditDoneEventArgs {
        const newValue = this.cell.castToNumber(this.cell.editValue);
        const doneArgs = this.cell.createDoneEditEventArgs(newValue, event);
        this.grid.cellEditDone.emit(doneArgs);
        return doneArgs;
    }

    /** Exit cell edit mode */
    public exitCellEdit(event?: Event): IGridEditDoneEventArgs {
        const newValue = this.cell.castToNumber(this.cell.editValue);
        const args = this.cell?.createDoneEditEventArgs(newValue, event);
        if (!this.cell) {
            return args;
        }

        this.cell.value = newValue;


        this.grid.cellEditExit.emit(args);
        this.endCellEdit();
        return args;
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
}
export class IgxRowCrudState extends IgxCellCrudState {
    public row: IgxRow | null = null;
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

        if (!this.row) {
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

}

export class IgxRowAddCrudState extends IgxRowCrudState {
    /**
     * @hidden @interal
     */
    // TODO: Consider changing the modifier to protected or private.
    public addRowParent = null;

     /** Enters cell edit mode */
     public beginAddRow(cell, event?: Event) {
        this.createCell(cell);
        this.cell.primaryKey = this.primaryKey;
        cell.enterAddMode = true;
        if (!this.sameRow(this.cell.id.rowID)) {
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
        const args = this.cell.createEditEventArgs(false, event);
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
            this.grid.onRowAdded.pipe(first()).subscribe((args: IRowDataEventArgs) => {
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
            this.grid.onRowAdded.emit({ data: row.data });
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
            if (cell?.row.addRow) {
                this.beginAddRow(cell, event);
                return;
            }

            if (this.rowEditing) {
                if (this.row && !this.sameRow(this.cell?.id?.rowID)) {
                    this.rowEditingBlocked = this.endEdit(true, event);
                    if (this.rowEditingBlocked) {
                        return true;
                    }

                    this.rowEditingBlocked = false;
                    this.endRowEdit();
                }

                this.createCell(cell);
                const canceled = this.beginRowEdit(event);
                if (!canceled) {
                    this.beginCellEdit(event);
                }

            } else {
                this.createCell(cell);
                this.beginCellEdit(event);
            }
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
            this.updateCell(true, event);
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
}
