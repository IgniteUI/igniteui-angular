import { EventEmitter, Injectable, NgZone } from '@angular/core';
import { Subject } from 'rxjs';
import { PlatformUtil } from '../../core/utils';
import { FilteringExpressionsTree } from '../../data-operations/filtering-expressions-tree';
import { GridPagingMode } from '../common/enums';
import { IRowSelectionEventArgs } from '../common/events';
import { GridType } from '../common/grid.interface';
import {
    GridSelectionRange,
    IColumnSelectionState,
    IMultiRowLayoutNode,
    ISelectionKeyboardState,
    ISelectionNode,
    ISelectionPointerState,
    SelectionState
} from '../common/types';
import { PivotUtil } from '../pivot-grid/pivot-util';


@Injectable()
export class IgxGridSelectionService {
    public grid: GridType;
    public dragMode = false;
    public activeElement: ISelectionNode | null;
    public keyboardState = {} as ISelectionKeyboardState;
    public pointerState = {} as ISelectionPointerState;
    public columnsState = {} as IColumnSelectionState;

    public selection = new Map<number, Set<number>>();
    public temp = new Map<number, Set<number>>();
    public rowSelection: Set<any> = new Set<any>();
    public indeterminateRows: Set<any> = new Set<any>();
    public columnSelection: Set<string> = new Set<string>();
    /**
     * @hidden @internal
     */
    public selectedRowsChange = new Subject();

    /**
     * Toggled when a pointerdown event is triggered inside the grid body (cells).
     * When `false` the drag select behavior is disabled.
     */
    private pointerEventInGridBody = false;

    private allRowsSelected: boolean;
    private _lastSelectedNode: ISelectionNode;
    private _ranges: Set<string> = new Set<string>();
    private _selectionRange: Range;

    /**
     * Returns the current selected ranges in the grid from both
     * keyboard and pointer interactions
     */
    public get ranges(): GridSelectionRange[] {

        // The last action was keyboard + shift selection -> add it
        this.addKeyboardRange();

        const ranges = Array.from(this._ranges).map(range => JSON.parse(range));

        // No ranges but we have a focused cell -> add it
        if (!ranges.length && this.activeElement && this.grid.isCellSelectable) {
            ranges.push(this.generateRange(this.activeElement));
        }

        return ranges;
    }

    public get primaryButton(): boolean {
        return this.pointerState.primaryButton;
    }

    public set primaryButton(value: boolean) {
        this.pointerState.primaryButton = value;
    }

    constructor(private zone: NgZone, protected platform: PlatformUtil) {
        this.initPointerState();
        this.initKeyboardState();
        this.initColumnsState();
    }

    /**
     * Resets the keyboard state
     */
    public initKeyboardState(): void {
        this.keyboardState.node = null;
        this.keyboardState.shift = false;
        this.keyboardState.range = null;
        this.keyboardState.active = false;
    }

    /**
     * Resets the pointer state
     */
    public initPointerState(): void {
        this.pointerState.node = null;
        this.pointerState.ctrl = false;
        this.pointerState.shift = false;
        this.pointerState.range = null;
        this.pointerState.primaryButton = true;
    }

    /**
     * Resets the columns state
     */
    public initColumnsState(): void {
        this.columnsState.field = null;
        this.columnsState.range = [];
    }

    /**
     * Adds a single node.
     * Single clicks | Ctrl + single clicks on cells is the usual case.
     */
    public add(node: ISelectionNode, addToRange = true): void {
        if (this.selection.has(node.row)) {
            this.selection.get(node.row).add(node.column);
        } else {
            this.selection.set(node.row, new Set<number>()).get(node.row).add(node.column);
        }

        if (addToRange) {
            this._ranges.add(JSON.stringify(this.generateRange(node)));
        }
    }

    /**
     * Adds the active keyboard range selection (if any) to the `ranges` meta.
     */
    public addKeyboardRange(): void {
        if (this.keyboardState.range) {
            this._ranges.add(JSON.stringify(this.keyboardState.range));
        }
    }

    public remove(node: ISelectionNode): void {
        if (this.selection.has(node.row)) {
            this.selection.get(node.row).delete(node.column);
        }
        if (this.isActiveNode(node)) {
            this.activeElement = null;
        }
        this._ranges.delete(JSON.stringify(this.generateRange(node)));
    }

    public isInMap(node: ISelectionNode): boolean {
        return (this.selection.has(node.row) && this.selection.get(node.row).has(node.column)) ||
            (this.temp.has(node.row) && this.temp.get(node.row).has(node.column));
    }

    public selected(node: ISelectionNode): boolean {
        return (this.isActiveNode(node) && this.grid.isCellSelectable) || this.isInMap(node);
    }

    public isActiveNode(node: ISelectionNode): boolean {
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

    public isActiveLayout(current: IMultiRowLayoutNode, target: IMultiRowLayoutNode): boolean {
        return current.columnVisibleIndex === target.columnVisibleIndex;
    }

    public addRangeMeta(node: ISelectionNode, state?: SelectionState): void {
        this._ranges.add(JSON.stringify(this.generateRange(node, state)));
    }

    public removeRangeMeta(node: ISelectionNode, state?: SelectionState): void {
        this._ranges.delete(JSON.stringify(this.generateRange(node, state)));
    }

    /**
     * Generates a new selection range from the given `node`.
     * If `state` is passed instead it will generate the range based on the passed `node`
     * and the start node of the `state`.
     */
    public generateRange(node: ISelectionNode, state?: SelectionState): GridSelectionRange {
        this._lastSelectedNode = node;

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
    public keyboardStateOnKeydown(node: ISelectionNode, shift: boolean, shiftTab: boolean): void {
        this.keyboardState.active = true;
        this.initPointerState();
        this.keyboardState.shift = shift && !shiftTab;
        if (!this.grid.navigation.isDataRow(node.row)) {
            return;
        }
        // Kb navigation with shift and no previous node.
        // Clear the current selection init the start node.
        if (this.keyboardState.shift && !this.keyboardState.node) {
            this.clear();
            this.keyboardState.node = Object.assign({}, node);
        }
    }

    public keyboardStateOnFocus(node: ISelectionNode, emitter: EventEmitter<GridSelectionRange>, dom): void {
        const kbState = this.keyboardState;

        // Focus triggered by keyboard navigation
        if (kbState.active) {
            if (this.platform.isChromium) {
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

    public pointerDown(node: ISelectionNode, shift: boolean, ctrl: boolean): void {
        this.addKeyboardRange();
        this.initKeyboardState();
        this.pointerState.ctrl = ctrl;
        this.pointerState.shift = shift;
        this.pointerEventInGridBody = true;
        document.body.addEventListener('pointerup', this.pointerOriginHandler);

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

    public pointerDownShiftKey(node: ISelectionNode): void {
        this.clear();
        this.selectRange(node, this.pointerState);
    }

    public mergeMap(target: Map<number, Set<number>>, source: Map<number, Set<number>>): void {
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

    public pointerEnter(node: ISelectionNode, event: PointerEvent): boolean {
        // https://www.w3.org/TR/pointerevents/#the-button-property
        this.dragMode = (event.buttons === 1 && (event.button === -1 || event.button === 0)) && this.pointerEventInGridBody;
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

        if (this.pointerState.ctrl) {
            this.selectRange(node, this.pointerState, this.temp);
        } else {
            this.dragSelect(node, this.pointerState);
        }
        return true;
    }

    public pointerUp(node: ISelectionNode, emitter: EventEmitter<GridSelectionRange>, firedOutsideGrid?: boolean): boolean {
        if (this.dragMode || firedOutsideGrid) {
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

        if (this.pointerEventInGridBody) {
            this.add(node);
        }
        return false;
    }

    public selectRange(node: ISelectionNode, state: SelectionState, collection: Map<number, Set<number>> = this.selection): void {
        if (collection === this.temp) {
            collection.clear();
        }
        const { rowStart, rowEnd, columnStart, columnEnd } = this.generateRange(node, state);
        for (let i = rowStart; i <= rowEnd; i++) {
            for (let j = columnStart as number; j <= columnEnd; j++) {
                if (collection.has(i)) {
                    collection.get(i).add(j);
                } else {
                    collection.set(i, new Set<number>()).get(i).add(j);
                }
            }
        }
    }

    public dragSelect(node: ISelectionNode, state: SelectionState): void {
        if (!this.pointerState.ctrl) {
            this.selection.clear();
        }
        this.selectRange(node, state);
    }

    public clear(clearAcriveEl = false): void {
        if (clearAcriveEl) {
            this.activeElement = null;
        }
        this.selection.clear();
        this.temp.clear();
        this._ranges.clear();
    }

    public clearTextSelection(): void {
        const selection = window.getSelection();
        if (selection.rangeCount) {
            this._selectionRange = selection.getRangeAt(0);
            this._selectionRange.collapse(true);
            selection.removeAllRanges();
        }
    }

    public restoreTextSelection(): void {
        const selection = window.getSelection();
        if (!selection.rangeCount) {
            selection.addRange(this._selectionRange || document.createRange());
        }
    }

    public getSelectedRowsData() {
        if (this.grid.isPivot) {
            return this.grid.dataView.filter(r => {
                const keys = r.dimensions.map(d => PivotUtil.getRecordKey(r, d));
                return keys.some(k => this.isPivotRowSelected(k));
            });
        }
        if(this.rowSelection.size && (this.grid as any).totalItemCount || this.grid.pagingMode === GridPagingMode.Remote) {
            if(!this.grid.primaryKey) {
                return Array.from(this.rowSelection);
            }
            const selection = [];
            this.rowSelection.forEach(rID =>  {
                const rData = this.grid.gridAPI.get_all_data(true).find(row => this.getRecordKey(row) === rID);
                const partialRowData = {};
                partialRowData[this.grid.primaryKey] = rID;
                selection.push(rData ? rData : partialRowData);
            });
            return selection;
        }
        return this.rowSelection.size ? this.grid.gridAPI.get_all_data(true).filter(row => this.rowSelection.has(this.getRecordKey(row))) : [];
    }

    /** Returns array of the selected row id's. */
    public getSelectedRows(): Array<any> {
        return this.rowSelection.size ? Array.from(this.rowSelection.keys()) : [];
    }

    /** Returns array of the rows in indeterminate state. */
    public getIndeterminateRows(): Array<any> {
        return this.indeterminateRows.size ? Array.from(this.indeterminateRows.keys()) : [];
    }

    /** Clears row selection, if filtering is applied clears only selected rows from filtered data. */
    public clearRowSelection(event?): void {
        const selectedRows = this.getSelectedRowsData();
        const removedRec = this.isFilteringApplied() ?
            this.allData.filter(row => this.isRowSelected(this.getRecordKey(row))) : selectedRows;
        const newSelection = this.isFilteringApplied() ? selectedRows.filter(x => !removedRec.includes(x)) : [];
        this.emitRowSelectionEvent(newSelection, [], removedRec, event, selectedRows);
    }

    /** Select all rows, if filtering is applied select only from filtered data. */
    public selectAllRows(event?) {
        const addedRows = this.allData.filter((row) => !this.isRowSelected(this.getRecordKey(row)));
        const selectedRows = this.getSelectedRowsData();
        const newSelection = this.rowSelection.size ? selectedRows.concat(addedRows) : addedRows;
        this.indeterminateRows.clear();
        this.emitRowSelectionEvent(newSelection, addedRows, [], event, selectedRows);
    }

    /** Select the specified row and emit event. */
    public selectRowById(rowID, clearPrevSelection?, event?): void {
        if (!(this.grid.isRowSelectable || this.grid.isPivot) || this.isRowDeleted(rowID)) {
            return;
        }
        clearPrevSelection = !this.grid.isMultiRowSelectionEnabled || clearPrevSelection;
        if (this.grid.isPivot) {
            this.selectPivotRowById(rowID, clearPrevSelection, event);
            return;
        }
        const selectedRows = this.getSelectedRowsData();
        const newSelection = clearPrevSelection ? [this.getRowDataById(rowID)] : this.rowSelection.has(rowID) ?
            selectedRows : [...selectedRows, this.getRowDataById(rowID)];
        const removed = clearPrevSelection ? selectedRows : [];
        this.emitRowSelectionEvent(newSelection, [this.getRowDataById(rowID)], removed, event, selectedRows);
    }

    public selectPivotRowById(rowID, clearPrevSelection: boolean, event?): void {
        const selectedRows = this.getSelectedRows();
        const newSelection = clearPrevSelection ? [rowID] : this.rowSelection.has(rowID) ? selectedRows : [...selectedRows, rowID];
        const added = this.getPivotRowsByIds([rowID]);
        const removed = this.getPivotRowsByIds(clearPrevSelection ? selectedRows : []);
        this.emitRowSelectionEventPivotGrid(selectedRows, newSelection, added, removed, event);
    }

    /** Deselect the specified row and emit event. */
    public deselectRow(rowID, event?): void {
        if (!this.isRowSelected(rowID)) {
            return;
        }
        if(this.grid.isPivot) {
            this.deselectPivotRowByID(rowID, event);
            return;
        }
        const selectedRows = this.getSelectedRowsData();
        const newSelection = selectedRows.filter(r =>  this.getRecordKey(r) !== rowID);
        if (this.rowSelection.size && this.rowSelection.has(rowID)) {
            this.emitRowSelectionEvent(newSelection, [], [this.getRowDataById(rowID)], event, selectedRows);
        }
    }

    public deselectPivotRowByID(rowID, event?) {
        if (this.rowSelection.size && this.rowSelection.has(rowID)) {
            const currSelection = this.getSelectedRows();
            const newSelection = currSelection.filter(r => r !== rowID);
            const removed  = this.getPivotRowsByIds([rowID]);
            this.emitRowSelectionEventPivotGrid(currSelection, newSelection, [], removed, event);
        }
    }

    private emitRowSelectionEventPivotGrid(currSelection, newSelection, added, removed, event) {
        if (this.areEqualCollections(currSelection, newSelection)) {
            return;
        }
        const currSelectedRows = this.getSelectedRowsData();
        const args: IRowSelectionEventArgs = {
            owner: this.grid,
            oldSelection: currSelectedRows,
            newSelection: this.getPivotRowsByIds(newSelection),
            added,
            removed,
            event,
            cancel: false,
            allRowsSelected: this.areAllRowSelected(newSelection)
        };
        this.grid.rowSelectionChanging.emit(args);
        if (args.cancel) {
            this.clearHeaderCBState();
            return;
        }
        this.selectRowsWithNoEvent(newSelection, true);
    }

    /** Select the specified rows and emit event. */
    public selectRows(keys: any[], clearPrevSelection?: boolean, event?): void {
        if (!this.grid.isMultiRowSelectionEnabled) {
            return;
        }

        let rowsToSelect = keys.filter(x => !this.isRowDeleted(x) && !this.rowSelection.has(x));
        if (!rowsToSelect.length && !clearPrevSelection) {
            // no valid/additional rows to select and no clear
            return;
        }

        const selectedRows = this.getSelectedRowsData();
        rowsToSelect = this.grid.primaryKey ? rowsToSelect.map(r => this.getRowDataById(r)) : rowsToSelect;
        const newSelection = clearPrevSelection ? rowsToSelect : [...selectedRows, ...rowsToSelect];
        const keysAsSet = new Set(rowsToSelect);
        const removed = clearPrevSelection ? selectedRows.filter(x => !keysAsSet.has(x)) : [];
        this.emitRowSelectionEvent(newSelection, rowsToSelect, removed, event, selectedRows);
    }

    public deselectRows(keys: any[], event?): void {
        if (!this.rowSelection.size) {
            return;
        }
        let rowsToDeselect = keys.filter(x => this.rowSelection.has(x));
        if (!rowsToDeselect.length) {
            return;
        }
        const selectedRows = this.getSelectedRowsData();
        rowsToDeselect = this.grid.primaryKey ? rowsToDeselect.map(r => this.getRowDataById(r)) : rowsToDeselect;
        const keysAsSet = new Set(rowsToDeselect);
        const newSelection = selectedRows.filter(r => !keysAsSet.has(r));
        this.emitRowSelectionEvent(newSelection, [], rowsToDeselect, event, selectedRows);
    }

    /** Select specified rows. No event is emitted. */
    public selectRowsWithNoEvent(rowIDs: any[], clearPrevSelection?): void {
        if (clearPrevSelection) {
            this.rowSelection.clear();
        }
        rowIDs.forEach(rowID => this.rowSelection.add(rowID));
        this.clearHeaderCBState();
        this.selectedRowsChange.next();
    }

    /** Deselect specified rows. No event is emitted. */
    public deselectRowsWithNoEvent(rowIDs: any[]): void {
        this.clearHeaderCBState();
        rowIDs.forEach(rowID => this.rowSelection.delete(rowID));
        this.selectedRowsChange.next();
    }

    public isRowSelected(rowID): boolean {
        return this.rowSelection.size > 0 && this.rowSelection.has(rowID);
    }

    public isPivotRowSelected(rowID): boolean {
        let contains = false;
        this.rowSelection.forEach(x => {
            const correctRowId = rowID.replace(x,'');
            if (rowID.includes(x) && (correctRowId === '' || correctRowId.startsWith('_')) ) {
                contains = true;
                return;
            }
        });
        return this.rowSelection.size > 0 && contains;
    }

    public isRowInIndeterminateState(rowID): boolean {
        return this.indeterminateRows.size > 0 && this.indeterminateRows.has(rowID);
    }

    /** Select range from last selected row to the current specified row. */
    public selectMultipleRows(rowID, rowData, event?): void {
        this.clearHeaderCBState();
        if (!this.rowSelection.size || this.isRowDeleted(rowID)) {
            this.selectRowById(rowID);
            return;
        }
        const gridData = this.allData;
        const lastRowID = this.getSelectedRows()[this.rowSelection.size - 1];
        const currIndex = gridData.indexOf(this.getRowDataById(lastRowID));
        const newIndex = gridData.indexOf(rowData);
        const rows = gridData.slice(Math.min(currIndex, newIndex), Math.max(currIndex, newIndex) + 1);
        const currSelection = this.getSelectedRowsData();
        const added = rows.filter(r => !this.isRowSelected(this.getRecordKey(r)));
        const newSelection = currSelection.concat(added);
        this.emitRowSelectionEvent(newSelection, added, [], event, currSelection);
    }

    public areAllRowSelected(newSelection?): boolean {
        if (!this.grid.data && !newSelection) {
            return false;
        }
        if (this.allRowsSelected !== undefined && !newSelection) {
            return this.allRowsSelected;
        }
        const selectedData = newSelection ? newSelection : [...this.rowSelection]
        const allData = this.getRowIDs(this.allData);
        const unSelectedRows = allData.filter(row => !selectedData.includes(row));
        return this.allRowsSelected = this.allData.length > 0 && unSelectedRows.length === 0;
    }

    public hasSomeRowSelected(): boolean {
        const filteredData = this.isFilteringApplied() ?
            this.getRowIDs(this.grid.filteredData).some(rID => this.isRowSelected(rID)) : true;
        return this.rowSelection.size > 0 && filteredData && !this.areAllRowSelected();
    }

    public get filteredSelectedRowIds(): any[] {
        return this.isFilteringApplied() ?
            this.getRowIDs(this.allData).filter(rowID => this.isRowSelected(rowID)) :
            this.getSelectedRows().filter(rowID => !this.isRowDeleted(rowID));
    }

    public emitRowSelectionEvent(newSelection, added, removed, event?, currSelection?): boolean {
        currSelection = currSelection ?? this.getSelectedRowsData();
        if (this.areEqualCollections(currSelection, newSelection)) {
            return;
        }
        const args: IRowSelectionEventArgs = {
            owner: this.grid,
            oldSelection: currSelection,
            newSelection,
            added, removed,
            event, cancel: false,
            allRowsSelected: this.areAllRowSelected(newSelection.map(r =>  this.getRecordKey(r)))
        };

        this.grid.rowSelectionChanging.emit(args);
        if (args.cancel) {
            this.clearHeaderCBState();
            return;
        }
        this.selectRowsWithNoEvent(args.newSelection.map(r => this.getRecordKey(r)), true);
    }

    public getPivotRowsByIds(ids: any[]) {
        return this.grid.dataView.filter(r => {
            const keys = r.dimensions.map(d => PivotUtil.getRecordKey(r, d));
            return new Set(ids.concat(keys)).size < ids.length + keys.length;
        });
    }

    public getRowDataById(rowID): any {
        if (!this.grid.primaryKey) {
            return rowID;
        }
        const rowIndex = this.getRowIDs(this.grid.gridAPI.get_all_data(true)).indexOf(rowID);
        return rowIndex < 0 ? rowID : this.grid.gridAPI.get_all_data(true)[rowIndex];
    }

    public clearHeaderCBState(): void {
        this.allRowsSelected = undefined;
    }

    public getRowIDs(data): Array<any> {
        return this.grid.primaryKey && data.length ? data.map(rec => rec[this.grid.primaryKey]) : data;
    }

    public getRecordKey(record) {
        return this.grid.primaryKey ? record[this.grid.primaryKey] : record;
    }

    /** Clear rowSelection and update checkbox state */
    public clearAllSelectedRows(): void {
        this.rowSelection.clear();
        this.indeterminateRows.clear();
        this.clearHeaderCBState();
        this.selectedRowsChange.next();
    }

    /** Returns all data in the grid, with applied filtering and sorting and without deleted rows. */
    public get allData(): Array<any> {
        let allData;
        if (this.isFilteringApplied() || this.grid.sortingExpressions.length) {
            allData = this.grid.pinnedRecordsCount ? this.grid._filteredSortedUnpinnedData : this.grid.filteredSortedData;
        } else {
            allData = this.grid.gridAPI.get_all_data(true);
        }
        return allData.filter(rData => !this.isRowDeleted(this.grid.gridAPI.get_row_id(rData)));
    }

    /** Returns array of the selected columns fields. */
    public getSelectedColumns(): Array<any> {
        return this.columnSelection.size ? Array.from(this.columnSelection.keys()) : [];
    }

    public isColumnSelected(field: string): boolean {
        return this.columnSelection.size > 0 && this.columnSelection.has(field);
    }

    /** Select the specified column and emit event. */
    public selectColumn(field: string, clearPrevSelection?, selectColumnsRange?, event?): void {
        const stateColumn = this.columnsState.field ? this.grid.getColumnByName(this.columnsState.field) : null;
        if (!event || !stateColumn || stateColumn.visibleIndex < 0 || !selectColumnsRange) {
            this.columnsState.field = field;
            this.columnsState.range = [];

            const newSelection = clearPrevSelection ? [field] : this.getSelectedColumns().indexOf(field) !== -1 ?
                this.getSelectedColumns() : [...this.getSelectedColumns(), field];
            const removed = clearPrevSelection ? this.getSelectedColumns().filter(colField => colField !== field) : [];
            const added = this.isColumnSelected(field) ? [] : [field];
            this.emitColumnSelectionEvent(newSelection, added, removed, event);
        } else if (selectColumnsRange) {
            this.selectColumnsRange(field, event);
        }
    }

    /** Select specified columns. And emit event. */
    public selectColumns(fields: string[], clearPrevSelection?, selectColumnsRange?, event?): void {
        const columns = fields.map(f => this.grid.getColumnByName(f)).sort((a, b) => a.visibleIndex - b.visibleIndex);
        const stateColumn = this.columnsState.field ? this.grid.getColumnByName(this.columnsState.field) : null;
        if (!stateColumn || stateColumn.visibleIndex < 0 || !selectColumnsRange) {
            this.columnsState.field = columns[0] ? columns[0].field : null;
            this.columnsState.range = [];

            const added = fields.filter(colField => !this.isColumnSelected(colField));
            const removed = clearPrevSelection ? this.getSelectedColumns().filter(colField => fields.indexOf(colField) === -1) : [];
            const newSelection = clearPrevSelection ? fields : this.getSelectedColumns().concat(added);

            this.emitColumnSelectionEvent(newSelection, added, removed, event);
        } else {
            const filedStart = stateColumn.visibleIndex >
                columns[columns.length - 1].visibleIndex ? columns[0].field : columns[columns.length - 1].field;
            this.selectColumnsRange(filedStart, event);
        }
    }

    /** Select range from last clicked column to the current specified column. */
    public selectColumnsRange(field: string, event): void {
        const currIndex = this.grid.getColumnByName(this.columnsState.field).visibleIndex;
        const newIndex = this.grid.columnToVisibleIndex(field);
        const columnsFields = this.grid.visibleColumns
            .filter(c => !c.columnGroup)
            .sort((a, b) => a.visibleIndex - b.visibleIndex)
            .slice(Math.min(currIndex, newIndex), Math.max(currIndex, newIndex) + 1)
            .filter(col => col.selectable).map(col => col.field);
        const removed = [];
        const oldAdded = [];
        const added = columnsFields.filter(colField => !this.isColumnSelected(colField));
        this.columnsState.range.forEach(f => {
            if (columnsFields.indexOf(f) === -1) {
                removed.push(f);
            } else {
                oldAdded.push(f);
            }
        });
        this.columnsState.range = columnsFields.filter(colField => !this.isColumnSelected(colField) || oldAdded.indexOf(colField) > -1);
        const newSelection = this.getSelectedColumns().concat(added).filter(c => removed.indexOf(c) === -1);
        this.emitColumnSelectionEvent(newSelection, added, removed, event);
    }

    /** Select specified columns. No event is emitted. */
    public selectColumnsWithNoEvent(fields: string[], clearPrevSelection?): void {
        if (clearPrevSelection) {
            this.columnSelection.clear();
        }
        fields.forEach(field => {
            this.columnSelection.add(field);
        });
    }

    /** Deselect the specified column and emit event. */
    public deselectColumn(field: string, event?): void {
        this.initColumnsState();
        const newSelection = this.getSelectedColumns().filter(c => c !== field);
        this.emitColumnSelectionEvent(newSelection, [], [field], event);
    }

    /** Deselect specified columns. No event is emitted. */
    public deselectColumnsWithNoEvent(fields: string[]): void {
        fields.forEach(field => this.columnSelection.delete(field));
    }

    /** Deselect specified columns. And emit event. */
    public deselectColumns(fields: string[], event?): void {
        const removed = this.getSelectedColumns().filter(colField => fields.indexOf(colField) > -1);
        const newSelection = this.getSelectedColumns().filter(colField => fields.indexOf(colField) === -1);

        this.emitColumnSelectionEvent(newSelection, [], removed, event);
    }

    public emitColumnSelectionEvent(newSelection, added, removed, event?): boolean {
        const currSelection = this.getSelectedColumns();
        if (this.areEqualCollections(currSelection, newSelection)) {
            return;
        }

        const args = {
            oldSelection: currSelection, newSelection,
            added, removed, event, cancel: false
        };
        this.grid.columnSelectionChanging.emit(args);
        if (args.cancel) {
            return;
        }
        this.selectColumnsWithNoEvent(args.newSelection, true);
    }

    /** Clear columnSelection */
    public clearAllSelectedColumns(): void {
        this.columnSelection.clear();
    }

    protected areEqualCollections(first, second): boolean {
        return first.length === second.length && new Set(first.concat(second)).size === first.length;
    }

    /**
     * (╯°□°）╯︵ ┻━┻
     * Chrome and Chromium don't care about the active
     * range after keyboard navigation, thus this.
     */
    private _moveSelectionChrome(node: Node) {
        const selection = window.getSelection();
        selection.removeAllRanges();
        const range = new Range();
        range.selectNode(node);
        range.collapse(true);
        selection.addRange(range);
    }

    private isFilteringApplied(): boolean {
        return !FilteringExpressionsTree.empty(this.grid.filteringExpressionsTree) ||
            !FilteringExpressionsTree.empty(this.grid.advancedFilteringExpressionsTree);
    }

    private isRowDeleted(rowID): boolean {
        return this.grid.gridAPI.row_deleted_transaction(rowID);
    }

    private pointerOriginHandler = (event) => {
        this.pointerEventInGridBody = false;
        document.body.removeEventListener('pointerup', this.pointerOriginHandler);

        const targetTagName = event.target.tagName.toLowerCase();
        if (targetTagName !== 'igx-grid-cell' && targetTagName !== 'igx-tree-grid-cell') {
            this.pointerUp(this._lastSelectedNode, this.grid.rangeSelected, true);
        }
    };
}
