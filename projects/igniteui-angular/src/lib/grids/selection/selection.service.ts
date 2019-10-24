import { Injectable, EventEmitter, NgZone } from '@angular/core';
import { IGridEditEventArgs } from '../common/events';


export interface GridSelectionRange {
    rowStart: number;
    rowEnd: number;
    columnStart: string | number;
    columnEnd: string | number;
}

export interface ISelectionNode {
    row: number;
    column: number;
    layout?: IMultiRowLayoutNode;
    isSummaryRow?: boolean;
}

export interface IMultiRowLayoutNode {
    rowStart: number;
    colStart: number;
    rowEnd: number;
    colEnd: number;
    columnVisibleIndex: number;
}

interface ISelectionKeyboardState {
    node: null | ISelectionNode;
    shift: boolean;
    range: GridSelectionRange;
    active: boolean;
}

interface ISelectionPointerState extends ISelectionKeyboardState {
    ctrl: boolean;
    primaryButton: boolean;
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

    castToNumber(value: any): any {
        if (this.column.dataType === 'number' && !this.column.inlineEditorTemplate) {
            const v = parseFloat(value);
            return !isNaN(v) && isFinite(v) ? v : 0;
        }
        return value;
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
        return this.row && this.row.id === rowID;
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
        if (this.grid.rowEditable && (this.grid.primaryKey === undefined || this.grid.primaryKey === null)) {
            console.warn('The grid must have a `primaryKey` specified when using `rowEditable`!');
        }
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
        const newCell = this.createCell(cell);
        newCell.primaryKey = this.primaryKey;
        const args = {
            cellID: newCell.id,
            rowID: newCell.id.rowID,
            oldValue: newCell.value,
            cancel: false
        };

        this.grid.onCellEditEnter.emit(args);

        if (args.cancel) {
            this.end();
            return;
        }

        if (this.rowEditing) {
            if (this.row && !this.sameRow(newCell.id.rowID)) {
                this.grid.endEdit(true);
                this.cell = newCell;
                this.beginRowEdit();
                return;
            }

            this.cell = newCell;

            if (!this.row) {
                this.beginRowEdit();
                return;
            }
        } else {
            this.cell = newCell;
            this.endRowEdit();
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
    grid;
    dragMode = false;
    activeElement: ISelectionNode | null;
    keyboardState = {} as ISelectionKeyboardState;
    pointerState = {} as ISelectionPointerState;


    selection = new Map<number, Set<number>>();
    temp = new Map<number, Set<number>>();
    _ranges: Set<string> = new Set<string>();
    _selectionRange: Range;
    rowSelection: Set<any> = new Set<any>();
    private allRowsSelected: boolean;

    /**
     * Returns the current selected ranges in the grid from both
     * keyboard and pointer interactions
     */
    get ranges(): GridSelectionRange[] {

        // The last action was keyboard + shift selection -> add it
        this.addKeyboardRange();

        const ranges = Array.from(this._ranges).map(range => JSON.parse(range));

        // No ranges but we have a focused cell -> add it
        if (!ranges.length && this.activeElement && this.grid.isCellSelectable) {
            ranges.push(this.generateRange(this.activeElement));
        }

        return ranges;
    }

    get primaryButton(): boolean {
        return this.pointerState.primaryButton;
    }

    set primaryButton(value: boolean) {
        this.pointerState.primaryButton = value;
    }

    constructor(private zone: NgZone) {
        this.initPointerState();
        this.initKeyboardState();
    }

    /**
     * Resets the keyboard state
     */
    initKeyboardState(): void {
        this.keyboardState.node = null;
        this.keyboardState.shift = false;
        this.keyboardState.range = null;
        this.keyboardState.active = false;
    }

    /**
     * Resets the pointer state
     */
    initPointerState(): void {
        this.pointerState.node = null;
        this.pointerState.ctrl = false;
        this.pointerState.shift = false;
        this.pointerState.range = null;
        this.pointerState.primaryButton = true;
    }

    /**
     * Adds a single node.
     * Single clicks | Ctrl + single clicks on cells is the usual case.
     */
    add(node: ISelectionNode, addToRange = true): void {
        this.selection.has(node.row) ? this.selection.get(node.row).add(node.column) :
            this.selection.set(node.row, new Set<number>()).get(node.row).add(node.column);

        if (addToRange) { this._ranges.add(JSON.stringify(this.generateRange(node))); }
    }

    /**
     * Adds the active keyboard range selection (if any) to the `ranges` meta.
     */
    addKeyboardRange(): void {
        if (this.keyboardState.range) {
            this._ranges.add(JSON.stringify(this.keyboardState.range));
        }
    }

    remove(node: ISelectionNode): void {
        if (this.selection.has(node.row)) {
            this.selection.get(node.row).delete(node.column);
        }
        if (this.isActiveNode(node)) {
            this.activeElement = null;
        }
        this._ranges.delete(JSON.stringify(this.generateRange(node)));
    }

    isInMap(node: ISelectionNode): boolean {
        return (this.selection.has(node.row) && this.selection.get(node.row).has(node.column)) ||
            (this.temp.has(node.row) && this.temp.get(node.row).has(node.column));
    }

    selected(node: ISelectionNode): boolean {
        return (this.isActiveNode(node) && this.grid.isCellSelectable) || this.isInMap(node);
    }

    isActiveNode(node: ISelectionNode): boolean {
        if (this.activeElement) {
            const isActive = this.activeElement.column === node.column && this.activeElement.row === node.row;
            if (this.grid.hasColumnLayouts) {
                const layout = this.activeElement.layout;
                return isActive && this.isActiveLayout(layout, node.layout);
            }
            return isActive;
        }
        return false;
    }

    isActiveLayout(current: IMultiRowLayoutNode, target: IMultiRowLayoutNode): boolean {
        return current.columnVisibleIndex === target.columnVisibleIndex;
    }

    addRangeMeta(node: ISelectionNode, state?: SelectionState): void {
        this._ranges.add(JSON.stringify(this.generateRange(node, state)));
    }

    removeRangeMeta(node: ISelectionNode, state?: SelectionState): void {
        this._ranges.delete(JSON.stringify(this.generateRange(node, state)));
    }

    /**
     * Generates a new selection range from the given `node`.
     * If `state` is passed instead it will generate the range based on the passed `node`
     * and the start node of the `state`.
     */
    generateRange(node: ISelectionNode, state?: SelectionState): GridSelectionRange {
        if (!state) {
            return {
                rowStart: node.row,
                rowEnd: node.row,
                columnStart: node.column,
                columnEnd: node.column
            };
        }

        const { row, column } = state.node;
        const rowStart = Math.min(node.row, row);
        const rowEnd = Math.max(node.row, row);
        const columnStart = Math.min(node.column, column);
        const columnEnd = Math.max(node.column, column);

        return { rowStart, rowEnd, columnStart, columnEnd };
    }

    /**
     *
     */
    keyboardStateOnKeydown(node: ISelectionNode, shift: boolean, shiftTab: boolean): void {
        this.keyboardState.active = true;
        this.initPointerState();
        this.keyboardState.shift = shift && !shiftTab;

        // Kb navigation with shift and no previous node.
        // Clear the current selection init the start node.
        if (this.keyboardState.shift && !this.keyboardState.node) {
            this.clear();
            this.keyboardState.node = node;
        }
    }

    keyboardStateOnFocus(node: ISelectionNode, emitter: EventEmitter<GridSelectionRange>, dom): void {
        const kbState = this.keyboardState;

        // Focus triggered by keyboard navigation
        if (kbState.active) {
            if (isChromium()) {
                this._moveSelectionChrome(dom);
            }
            // Start generating a range if shift is hold
            if (kbState.shift) {
                this.dragSelect(node, kbState);
                kbState.range = this.generateRange(node, kbState);
                emitter.emit(this.generateRange(node, kbState));
                return;
            }

            this.initKeyboardState();
            this.clear();
            this.add(node);
        }
    }

    pointerDown(node: ISelectionNode, shift: boolean, ctrl: boolean): void {
        this.addKeyboardRange();
        this.initKeyboardState();
        this.pointerState.ctrl = ctrl;
        this.pointerState.shift = shift;

        // No ctrl key pressed - no multiple selection
        if (!ctrl) {
            this.clear();
        }

        if (shift) {
            // No previously 'clicked' node. Use the last active node.
            if (!this.pointerState.node) {
                this.pointerState.node = this.activeElement || node;
            }
            this.pointerDownShiftKey(node);
            this.clearTextSelection();
            return;
        }

        this.removeRangeMeta(node);
        this.pointerState.node = node;
    }

    pointerDownShiftKey(node: ISelectionNode): void {
        this.clear();
        this.selectRange(node, this.pointerState);
    }

    mergeMap(target: Map<number, Set<number>>, source: Map<number, Set<number>>): void {
        const iterator = source.entries();
        let pair = iterator.next();
        let key: number;
        let value: Set<number>;

        while (!pair.done) {
            [key, value] = pair.value;
            if (target.has(key)) {
                const newValue = target.get(key);
                value.forEach(record => newValue.add(record));
                target.set(key, newValue);
            } else {
                target.set(key, value);
            }
            pair = iterator.next();
        }
    }

    pointerEnter(node: ISelectionNode, event: PointerEvent): boolean {
        // https://www.w3.org/TR/pointerevents/#the-button-property
        this.dragMode = event.buttons === 1 && event.button === -1;
        if (!this.dragMode) {
            return false;
        }
        this.clearTextSelection();

        // If the users triggers a drag-like event by first clicking outside the grid cells
        // and then enters in the grid body we may not have a initial pointer starting node.
        // Assume the first pointerenter node is where we start.
        if (!this.pointerState.node) {
            this.pointerState.node = node;
        }

        this.pointerState.ctrl ? this.selectRange(node, this.pointerState, this.temp) :
            this.dragSelect(node, this.pointerState);
        return true;
    }

    pointerUp(node: ISelectionNode, emitter: EventEmitter<GridSelectionRange>): boolean {
        if (this.dragMode) {
            this.restoreTextSelection();
            this.addRangeMeta(node, this.pointerState);
            this.mergeMap(this.selection, this.temp);
            this.zone.runTask(() => emitter.emit(this.generateRange(node, this.pointerState)));
            this.temp.clear();
            this.dragMode = false;
            return true;
        }

        if (this.pointerState.shift) {
            this.clearTextSelection();
            this.restoreTextSelection();
            this.addRangeMeta(node, this.pointerState);
            emitter.emit(this.generateRange(node, this.pointerState));
            return true;
        }

        this.add(node);
        return false;
    }

    selectRange(node: ISelectionNode, state: SelectionState, collection: Map<number, Set<number>> = this.selection): void {
        if (collection === this.temp) {
            collection.clear();
        }
        const { rowStart, rowEnd, columnStart, columnEnd } = this.generateRange(node, state);
        for (let i = rowStart; i <= rowEnd; i++) {
            for (let j = columnStart as number; j <= columnEnd; j++) {
                collection.has(i) ? collection.get(i).add(j) :
                    collection.set(i, new Set<number>()).get(i).add(j);
            }
        }
    }

    dragSelect(node: ISelectionNode, state: SelectionState): void {
        if (!this.pointerState.ctrl) {
            this.selection.clear();
        }
        this.selectRange(node, state);
    }

    clear(clearAcriveEl = false): void {
        if (clearAcriveEl) { this.activeElement = null; }
        this.selection.clear();
        this.temp.clear();
        this._ranges.clear();
    }

    clearTextSelection(): void {
        const selection = window.getSelection();
        if (selection.rangeCount) {
            this._selectionRange = selection.getRangeAt(0);
            this._selectionRange.collapse(true);
            selection.removeAllRanges();
        }
    }

    restoreTextSelection(): void {
        const selection = window.getSelection();
        if (!selection.rangeCount) {
            selection.addRange(this._selectionRange || document.createRange());
        }
    }

    /**
     * (╯°□°）╯︵ ┻━┻
     * Chrome and Chromium don't care about the active
     * range after keyboard navigation, thus this.
     */
    _moveSelectionChrome(node: Node) {
        const selection = window.getSelection();
        selection.removeAllRanges();
        const range = new Range();
        range.selectNode(node);
        range.collapse(true);
        selection.addRange(range);
    }

    /** Returns array of the selected row id's. */
    getSelectedRows(): Array<any> {
        return this.rowSelection.size ? Array.from(this.rowSelection.keys()) : [];
    }

    /** Clears row selection, if filtering is applied clears only selected rows from filtered data. */
    clearRowSelection(event?): void {
        const removedRec = this.isFilteringApplied() ?
            this.getRowIDs(this.allData).filter(rID => this.isRowSelected(rID)) : this.getSelectedRows();
        const newSelection = this.isFilteringApplied() ? this.getSelectedRows().filter(x => !removedRec.includes(x)) : [];
        this.emitRowSelectionEvent(newSelection, [], removedRec, event);
    }

    /** Select all rows, if filtering is applied select only from filtered data. */
    selectAllRows(event?) {
        const allRowIDs = this.getRowIDs(this.allData);
        const addedRows =  allRowIDs.filter((rID) => !this.isRowSelected(rID));
        const newSelection = this.rowSelection.size ? this.getSelectedRows().concat(addedRows) : addedRows;

        this.emitRowSelectionEvent(newSelection, addedRows, [], event);
    }

    /** Select the specified row and emit event. */
    selectRowById(rowID, clearPrevSelection?, event?): void {
        if (!this.grid.isRowSelectable || this.isRowDeleted(rowID)) { return; }
        clearPrevSelection = !this.grid.isMultiRowSelectionEnabled || clearPrevSelection;

        const newSelection = clearPrevSelection ? [rowID] : this.getSelectedRows().indexOf(rowID) !== -1 ?
            this.getSelectedRows() : [...this.getSelectedRows(), rowID];
        const removed = clearPrevSelection ? this.getSelectedRows() : [];
        this.emitRowSelectionEvent(newSelection, [rowID], removed, event);
    }

    /** Deselect the specified row and emit event. */
    deselectRow(rowID, event?): void {
        if (!this.isRowSelected(rowID)) { return; }
        const newSelection = this.getSelectedRows().filter(r => r !== rowID);
        if (this.rowSelection.size && this.rowSelection.has(rowID)) {
            this.emitRowSelectionEvent(newSelection, [], [rowID], event);
        }
    }

    /** Select specified rows. No event is emitted. */
    selectRowsWithNoEvent(rowIDs: any[], clearPrevSelection?): void {
        if (clearPrevSelection) { this.rowSelection.clear(); }
        rowIDs.forEach(rowID => { this.rowSelection.add(rowID); });
        this.allRowsSelected = undefined;
    }

    /** Deselect specified rows. No event is emitted. */
    deselectRowsWithNoEvent(rowIDs: any[]): void  {
        rowIDs.forEach(rowID => this.rowSelection.delete(rowID));
        this.allRowsSelected = undefined;
    }

    isRowSelected(rowID): boolean {
        return this.rowSelection.size > 0 && this.rowSelection.has(rowID);
    }

    /** Select range from last selected row to the current specified row.*/
    selectMultipleRows(rowID, rowData, event?): void  {
        this.allRowsSelected = undefined;
        if (!this.rowSelection.size || this.isRowDeleted(rowID)) {
            this.selectRowById(rowID);
            return;
        }
        const gridData = this.allData;
        const lastRowID = this.getSelectedRows()[this.rowSelection.size - 1];
        const currIndex = gridData.indexOf(this.getRowDataById(lastRowID));
        const newIndex = gridData.indexOf(rowData);
        const rows = gridData.slice(Math.min(currIndex, newIndex), Math.max(currIndex, newIndex) + 1);

        const added = this.getRowIDs(rows).filter(rID => !this.isRowSelected(rID));
        const newSelection = this.getSelectedRows().concat(added);

        this.emitRowSelectionEvent(newSelection, added, [], event);
    }

    areAllRowSelected(): boolean {
        if (!this.grid.data) { return false; }
        if (this.allRowsSelected !== undefined) { return this.allRowsSelected; }

        const dataItemsID = this.getRowIDs(this.allData);
        return this.allRowsSelected = Math.min(this.rowSelection.size, dataItemsID.length) > 0 &&
            new Set(Array.from(this.rowSelection.values()).concat(dataItemsID)).size === this.rowSelection.size;
    }

    hasSomeRowSelected(): boolean {
        const filteredData = this.isFilteringApplied() ?
            this.getRowIDs(this.grid.filteredData).some(rID => this.isRowSelected(rID)) : true;
        return this.rowSelection.size > 0 && filteredData && !this.areAllRowSelected();
    }

    public get filteredSelectedRowIds(): any[] {
        return this.isFilteringApplied() ?
            this.getRowIDs(this.allData).filter(rowID => this.isRowSelected(rowID)) :
            this.getSelectedRows().filter(rowID => !this.isRowDeleted(rowID));
    }

    public emitRowSelectionEvent(newSelection, added, removed, event?): boolean {
        const currSelection = this.getSelectedRows();
        if (this.areEqualCollections(currSelection, newSelection)) { return; }

        const args = {
            oldSelection: currSelection, newSelection: newSelection,
            added: added, removed: removed, event: event, cancel: false
        };
        this.grid.onRowSelectionChange.emit(args);
        if (args.cancel) { return; }
        this.selectRowsWithNoEvent(args.newSelection, true);
    }

    public getRowDataById(rowID): Object {
        if (!this.grid.primaryKey) { return rowID; }
        const rowIndex = this.getRowIDs(this.grid.gridAPI.get_all_data(true)).indexOf(rowID);
        return rowIndex < 0 ? {} : this.grid.gridAPI.get_all_data(true)[rowIndex];
    }

    public getRowIDs(data): Array<any> {
        return this.grid.primaryKey && data.length ? data.map(rec => rec[this.grid.primaryKey]) : data;
    }

    public clearHeaderCBState(): void  {
        this.allRowsSelected = undefined;
    }

    /**Clear rowSelection and update checkbox state*/
    public clearAllSelectedRows(): void {
        this.rowSelection.clear();
        this.clearHeaderCBState();
    }

    /** Returns all data in the grid, with applied filtering and sorting and without deleted rows. */
    public get allData(): Array<any> {
        const allData = this.isFilteringApplied() || this.grid.sortingExpressions.length ?
            this.grid.filteredSortedData : this.grid.gridAPI.get_all_data(true);
        return allData.filter(rData => !this.isRowDeleted(this.grid.gridAPI.get_row_id(rData)));
    }

    private areEqualCollections(first, second): boolean {
        return first.length === second.length && new Set(first.concat(second)).size === first.length;
    }

    private isFilteringApplied(): boolean {
        return this.grid.filteringExpressionsTree.filteringOperands.length > 0;
    }

    private isRowDeleted(rowID): boolean {
        return this.grid.gridAPI.row_deleted_transaction(rowID);
    }
}

export function isChromium(): boolean {
    return (/Chrom|e?ium/g.test(navigator.userAgent) || /Google Inc/g.test(navigator.vendor)) && !/Edge/g.test(navigator.userAgent);
}
