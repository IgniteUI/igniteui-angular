import { Injectable } from '@angular/core';


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

@Injectable()
export class IgxGridSelectionService {

    dragMode = false;
    keyboardState = {} as ISelectionKeyboardState;
    pointerState = {} as ISelectionPointerState;


    // startNode;
    // ctrlEnabled = false;
    // shiftEnabled = false;
    // kbShiftEnabled = false;
    // kbNode = null;

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
        if (!this.keyboardState.shift && shift) {
            this.keyboardState.shift = !shiftTab;
            this.keyboardState.node = node;
        } else if (this.keyboardState.shift && !shift) {
            this.initKeyboardState();
        }
    }

    pointerDownShiftKey(node: ISelectionNode): void {
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
