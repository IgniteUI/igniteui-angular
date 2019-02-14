import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { IGridEditEventArgs } from '../grids/grid-base.component';


export interface GridSelectionRange {
    rowStart: number;
    rowEnd: number;
    columnStart: string | number;
    columnEnd: string | number;
}

export interface ISelectionNode {
    row: number;
    column: number;
}

interface ISelectionKeyboardState {
    lastPassedNode: null | ISelectionNode;
    node: null | ISelectionNode;
    shift: boolean;
}

interface ISelectionPointerState extends ISelectionKeyboardState {
    ctrl: boolean;
}

type SelectionState = ISelectionKeyboardState | ISelectionPointerState;


// TODO: Refactor - export in a separate file

export class IgxRow {

    constructor(public id: any, public index: number, public data: any) {}
}

export class IgxCell {

    primaryKey: any;

    constructor(
        public id,
        public rowIndex: number,
        public column,
        public value: any,
        public editValue: any,
        public rowData: any) {}

    castToNumber(): void {
        if (this.column.dataType === 'number' && !this.column.inlineEditorTemplate) {
            const v = parseFloat(this.editValue);
            this.editValue = !isNaN(v) && isFinite(v) ? v : 0;
        }
    }

    clone(): IgxCell {
        return new IgxCell(this.id, this.rowIndex, this.column, this.value, this.editValue, this.rowData);
    }

    createEditEventArgs(): IGridEditEventArgs {
        return {
            rowID: this.id.rowID,
            cellID: this.id,
            oldValue: this.value,
            newValue: this.editValue,
            cancel: false
        };
    }
}

@Injectable()
export class IgxGridCRUDService {

    grid;
    cell: IgxCell | null = null;
    row: IgxRow | null = null;
    cellEditDone = new Subject<IgxCell>();
    rowEditDone = new Subject<IgxRow>();
    rowState;

    inEditMode = false;

    createEditEventArgs(): IGridEditEventArgs {
        return {
            rowID: this.cell.id.rowID,
            cellID: this.cell.id,
            oldValue: this.cell.value,
            cancel: false
        };
    }

    createCell(cell): IgxCell {
        return new IgxCell(cell.cellID, cell.rowIndex, cell.column, cell.value, cell.value, cell.row.rowData);
    }

    createRow(cell: IgxCell): IgxRow {
        return new IgxRow(cell.id.rowID, cell.rowIndex, cell.rowData);
    }

    sameRow(rowID): boolean {
        return this.row.id === rowID;
    }

    get rowEditing(): boolean {
        return this.grid.rowEditable;
    }

    get primaryKey(): any {
        return this.grid.primaryKey;
    }

    beginRowEdit() {
        // emit onRowEditEnter
        this.row = this.createRow(this.cell);
        const args = {
            rowID: this.row.id,
            oldValue: this.row.data,
            cancel: false
        };
        this.grid.onRowEditEnter.emit(args);
        if (args.cancel) {
            this.endRowEdit();
            return;
        }
        this.rowState = this.grid.transactions.getAggregatedValue(this.row.id, true);
        this.grid.transactions.startPending();
        this.grid.openRowOverlay(this.row.id);
    }

    commitRowEdit() {
        this.grid.endRowTransaction(true, this.row.id);
        this.endRowEdit();
    }

    endRowEdit() {
        this.row = null;
    }

    begin(cell): void {
        this.cell = this.createCell(cell);
        this.cell.primaryKey = this.primaryKey;
        const args = this.createEditEventArgs();

        this.grid.onCellEditEnter.emit(args);

        if (args.cancel) {
            this.end();
            return;
        }

        this.inEditMode = true;

        if (this.rowEditing) {
            if (!this.row) {
                this.beginRowEdit();
                return;
            }

            if (this.row && !this.sameRow(this.cell.id.rowID)) {
                this.commitRowEdit();
                this.beginRowEdit();
                return;
            }
        }
    }

    commit() {
        if (!this.inEditMode) {
            return;
        }
        this.cell.castToNumber();
        this.grid.gridAPI.update_cell(this.cell);
    }

    end(): void {
        this.cell = null;
        this.inEditMode = false;
    }


    isInEditMode(rowIndex: number, columnIndex: number): boolean {
        if (!this.cell) {
            return false;
        }
        return this.cell.column.index === columnIndex && this.cell.rowIndex === rowIndex;
    }
}


@Injectable()
export class IgxGridSelectionService {

    dragMode = false;
    keyboardState = {} as ISelectionKeyboardState;
    pointerState = {} as ISelectionPointerState;


    selection = new Map<number, Set<number>>();
    _ranges: Set<string> = new Set<string>();


    get ranges(): GridSelectionRange[] {
        return Array.from(this._ranges).map(range => JSON.parse(range));
    }

    constructor() {
        this.initPointerState();
        this.initKeyboardState();
    }

    initKeyboardState(): void {
        this.keyboardState.lastPassedNode = null;
        this.keyboardState.node = null;
        this.keyboardState.shift = false;
    }

    initPointerState(): void {
        this.pointerState.node = null;
        this.pointerState.ctrl = false;
        this.pointerState.shift = false;
    }

    resetState(): void {
        this.dragMode = false;
        this.initPointerState();
        this.initKeyboardState();
    }

    add(node: ISelectionNode): void {
        this.selection.has(node.row) ? this.selection.get(node.row).add(node.column) :
            this.selection.set(node.row, new Set<number>()).get(node.row).add(node.column);

        this._ranges.add(JSON.stringify({
            rowStart: node.row,
            rowEnd: node.row,
            columnStart: node.column,
            columnEnd: node.column
        }));
    }

    remove(node: ISelectionNode): void {

        const { row, column } = node;
        const item = this.selection.get(row);

        if (!item) {
            return;
        }

        this.selection.get(row).delete(column);
        if (!this.selection.get(row).size) {
            this.selection.delete(row);
        }

        this._ranges.delete(JSON.stringify({
            rowStart: row,
            rowEnd: row,
            columnStart: column,
            columnEnd: column
        }));

    }

    selected(node: ISelectionNode): boolean {
        return (this.selection.has(node.row) && this.selection.get(node.row).has(node.column));
    }

    addRangeMeta(node: ISelectionNode, state: SelectionState) {
        const { rowStart, rowEnd, columnStart, columnEnd } = this.generateRange(node, state);

        this._ranges.add(JSON.stringify({
            rowStart,
            rowEnd,
            columnStart,
            columnEnd
        }));
    }

    generateRange(node: ISelectionNode, state: SelectionState): GridSelectionRange {
        const { row, column } = state.node;
        const rowStart = Math.min(node.row, row);
        const rowEnd = Math.max(node.row, row);
        const columnStart = Math.min(node.column, column);
        const columnEnd = Math.max(node.column, column);

        return { rowStart, rowEnd, columnStart, columnEnd };
    }

    keyboardDownShiftKey(node: ISelectionNode, shift: boolean, shiftTab: boolean) {
        this.initPointerState();
        if (!this.keyboardState.shift && shift) {
            this.keyboardState.shift = !shiftTab;
            this.keyboardState.node = node;
        } else if (this.keyboardState.shift && !shift) {
            this.initKeyboardState();
            this.clear();
        }
    }

    pointerDownShiftKey(node: ISelectionNode): void {
        this.initKeyboardState();
        this.clear();
        this.dragSelect(node, this.pointerState);
        this.addRangeMeta(node, this.pointerState);
    }


    dragSelect(node: ISelectionNode, state: SelectionState): void {

        const { rowStart, rowEnd, columnStart, columnEnd } = this.generateRange(node, state);

        if (!this.pointerState.ctrl) {
            this.selection.clear();
        }

        for (let i = rowStart; i <= rowEnd; i++) {
            for (let j = columnStart as number; j <= columnEnd; j++) {
                this.selection.has(i) ? this.selection.get(i).add(j) :
                    this.selection.set(i, new Set<number>()).get(i).add(j);
            }
        }
    }

    clear(): void {
        this.selection.clear();
        this._ranges.clear();
    }
}
