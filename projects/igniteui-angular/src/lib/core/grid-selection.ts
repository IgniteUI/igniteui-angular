import { Injectable } from '@angular/core';
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
    node: null | ISelectionNode;
    shift: boolean;
    range: GridSelectionRange;
    active: boolean;
}

interface ISelectionPointerState extends ISelectionKeyboardState {
    ctrl: boolean;
}

type SelectionState = ISelectionKeyboardState | ISelectionPointerState;


// TODO: Refactor - export in a separate file

export class IgxRow {
    transactionState: any;
    state: any;
    newData: any;

    constructor(public id: any, public index: number, public data: any) {}

    createEditEventArgs(): IGridEditEventArgs {
        return {
            rowID: this.id,
            oldValue: { ... this.data },
            newValue: this.newData,
            cancel: false
        };
    }
}

export class IgxCell {

    primaryKey: any;
    state: any;

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

    createCell(cell): IgxCell {
        return new IgxCell(cell.cellID, cell.rowIndex, cell.column, cell.value, cell.value, cell.row.rowData);
    }

    createRow(cell: IgxCell): IgxRow {
        return new IgxRow(cell.id.rowID, cell.rowIndex, cell.rowData);
    }

    sameRow(rowID): boolean {
        return this.row.id === rowID;
    }

    sameCell(cell: IgxCell): boolean {
        return (this.cell.id.rowID === cell.id.rowID &&
            this.cell.id.columnID === cell.id.columnID);
    }

    get inEditMode(): boolean {
        return !!this.cell;
    }

    get rowEditing(): boolean {
        return this.grid.rowEditable;
    }

    get primaryKey(): any {
        return this.grid.primaryKey;
    }

    beginRowEdit() {
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
        this.row.transactionState = this.grid.transactions.getAggregatedValue(this.row.id, true);
        this.grid.transactions.startPending();
        this.grid.openRowOverlay(this.row.id);
    }


    endRowEdit() {
        this.row = null;
    }

    begin(cell): void {
        this.cell = this.createCell(cell);
        this.cell.primaryKey = this.primaryKey;
        const args = {
            cellID: this.cell.id,
            rowID: this.cell.id.rowID,
            oldValue: this.cell.value,
            cancel: false
        };

        this.grid.onCellEditEnter.emit(args);

        if (args.cancel) {
            this.end();
            return;
        }


        if (this.rowEditing) {
            if (!this.row) {
                this.beginRowEdit();
                return;
            }

            if (this.row && !this.sameRow(this.cell.id.rowID)) {
                this.grid.endEdit(true);
                this.beginRowEdit();
                return;
            }
        }
    }

    end(): void {
        this.cell = null;
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
    activeElement: ISelectionNode | null;
    keyboardState = {} as ISelectionKeyboardState;
    pointerState = {} as ISelectionPointerState;


    selection = new Map<number, Set<number>>();
    _ranges: Set<string> = new Set<string>();


    get ranges(): GridSelectionRange[] {
        if (this.keyboardState.range) {
            this._ranges.add(JSON.stringify(this.keyboardState.range));
        }
        return Array.from(this._ranges).map(range => JSON.parse(range));
    }

    constructor() {
        this.initPointerState();
        this.initKeyboardState();
    }

    initKeyboardState(): void {
        this.keyboardState.node = null;
        this.keyboardState.shift = false;
        this.keyboardState.range = null;
        this.keyboardState.active = false;
    }

    initPointerState(): void {
        this.pointerState.node = null;
        this.pointerState.ctrl = false;
        this.pointerState.shift = false;
        this.pointerState.range = null;
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

    selected(node: ISelectionNode): boolean {
        return this.isActiveNode(node) || (this.selection.has(node.row) && this.selection.get(node.row).has(node.column));
    }

    isActiveNode(node: ISelectionNode): boolean {
        if (this.activeElement) {
            return this.activeElement.column === node.column && this.activeElement.row === node.row;
        }
        return false;
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
        // Reset pointer state
        this.initPointerState();

        this.keyboardState.shift = shift && !shiftTab;

        if (this.keyboardState.shift && !this.keyboardState.node) {
            // Navigation with shift pressed. Clear the selection
            // and initialize the start node. The cell _updateCellSelection method will
            // handle the updates.
            // TODO: Move the logic from the cell here.
            this.clear();
            this.keyboardState.node = node;
        }
    }

    pointerDownShiftKey(node: ISelectionNode): void {
        this.clear();
        this.selectRange(node, this.pointerState);
    }

    selectRange(node: ISelectionNode, state: SelectionState) {
        const { rowStart, rowEnd, columnStart, columnEnd } = this.generateRange(node, state);
        for (let i = rowStart; i <= rowEnd; i++) {
            for (let j = columnStart as number; j <= columnEnd; j++) {
                this.selection.has(i) ? this.selection.get(i).add(j) :
                    this.selection.set(i, new Set<number>()).get(i).add(j);
            }
        }
    }

    dragSelect(node: ISelectionNode, state: SelectionState): void {
        if (!this.pointerState.ctrl) {
            this.selection.clear();
        }
        this.selectRange(node, state);
    }

    clear(): void {
        this.selection.clear();
        this._ranges.clear();
    }
}
