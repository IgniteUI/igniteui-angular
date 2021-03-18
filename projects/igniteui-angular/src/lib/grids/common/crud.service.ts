import { Injectable } from '@angular/core';
import { IGridEditDoneEventArgs, IGridEditEventArgs, IgxGridBaseDirective } from '../grid/public_api';
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

    private _cellEditingBlocked = false;
    private _rowEditingBlocked = false;

    public createCell(cell): IgxCell {
        return new IgxCell(cell.cellID, cell.rowIndex, cell.column, cell.value, cell.value, cell.row.rowData, cell.grid);
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

    public get rowInEditMode(): boolean {
        return !!this.row;
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
            const canceled = this.grid.endEdit(true, event);

            if (!canceled || !this.cell) {
                this.grid.tbody.nativeElement.focus();
            }
        } else {
            if (cell?.row.addRow) {
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

    /** Enters row edit mode */
    public beginRowEdit(newCell, event?: Event) {
        if (this.row && !this.sameRow(newCell.id.rowID)) {
            this._rowEditingBlocked = this.grid.endEdit(true, event);
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

        const canceled = this.grid.endRowTransaction(commit, this.row, event);
        if (canceled) {
            return true;
        }
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
                this.grid.endAddRow();
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

    /** Returns whether the targeted cell is in edit mode */
    public targetInEdit(rowIndex: number, columnIndex: number): boolean {
        if (!this.cell) {
            return false;
        }
        const res = this.cell.column.index === columnIndex && this.cell.rowIndex === rowIndex;
        return res;
    }
}
