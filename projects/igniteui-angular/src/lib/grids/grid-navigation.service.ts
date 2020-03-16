import { Injectable } from '@angular/core';
import { first } from 'rxjs/operators';
import { IgxForOfDirective } from '../directives/for-of/for_of.directive';
import { GridType } from './common/grid.interface';
import { NAVIGATION_KEYS, ROW_COLLAPSE_KEYS, ROW_EXPAND_KEYS, SUPPORTED_KEYS, HORIZONTAL_NAV_KEYS } from '../core/utils';
import { IgxGridBaseDirective } from './grid-base.directive';
import { IMultiRowLayoutNode } from './selection/selection.service';
import { GridKeydownTargetType } from './common/enums';

export interface IActiveNode {
    gridID?: string;
    row: number;
    column?: number;
    layout?: IMultiRowLayoutNode;
}

/** @hidden */
@Injectable()
export class IgxGridNavigationService {
    public grid: IgxGridBaseDirective & GridType;
    public activeNode: IActiveNode;

    dispatchEvent(event: KeyboardEvent) {
        const key = event.key.toLowerCase();
        if (!this.activeNode || !(SUPPORTED_KEYS.has(key) || (key === 'tab' && this.grid.crudService.cell))) { return; }
        const shift = event.shiftKey;
        const ctrl = event.ctrlKey;
        let colIndex = this.activeNode.column, rowIndex = this.activeNode.row;

        const type = this.isDataRow(rowIndex) ? GridKeydownTargetType.dataCell :
            this.isDataRow(rowIndex, true) ? GridKeydownTargetType.summaryCell : GridKeydownTargetType.groupRow;
        this.emitKeyDown(type, rowIndex, event);
        if (event.altKey) {
            this.handleAlt(key, event);
            return;
        }
        if (this.isDataRow(this.activeNode.row)) {
            this.grid.selectionService.keyboardStateOnKeydown(this.activeNode, shift, shift && key === 'tab');
        }
        if (this.grid.crudService.cell && NAVIGATION_KEYS.has(key)) {
            const col = this.grid.getColumnByVisibleIndex(this.activeNode.column);
            if (col.inlineEditorTemplate) { return; }
            if (['date', 'boolean'].indexOf(col.dataType) > -1) { return; }
            return;
        }
        switch (key) {
            case 'tab':
                this.handleEditing(shift, event);
                break;
            case 'end':
                rowIndex = ctrl ? this.findLastDataRowIndex() : this.activeNode.row;
                colIndex = this.lastColumnIndex;
                break;
            case 'home':
                rowIndex = ctrl ? this.findFirstDataRowIndex() : this.activeNode.row;
                colIndex = 0;
                break;
            case 'arrowleft':
            case 'left':
                colIndex  = ctrl ? 0 : this.activeNode.column - 1;
                break;
            case 'arrowright':
            case 'right':
                colIndex = ctrl ? this.lastColumnIndex : this.activeNode.column + 1;
                break;
            case 'arrowup':
            case 'up':
                colIndex =  this.activeNode.column !== undefined ?   this.activeNode.column : 0;
                rowIndex = ctrl ? this.findFirstDataRowIndex() : this.activeNode.row - 1;
                break;
            case 'arrowdown':
            case 'down':
                colIndex =  this.activeNode.column !== undefined ?   this.activeNode.column : 0;
                rowIndex  = ctrl ? this.findLastDataRowIndex() : this.activeNode.row + 1;
                break;
            case 'enter':
            case 'f2':
                const cell = this.grid.getCellByColumnVisibleIndex(this.activeNode.row, this.activeNode.column);
                this.grid.crudService.enterEditMode(cell);
                break;
            case 'escape':
            case 'esc':
                this.grid.crudService.exitEditMode();
                break;
            case ' ':
            case 'spacebar':
            case 'space':
                if (this.grid.isRowSelectable) {
                    const rowObj = this.grid.getRowByIndex(this.activeNode.row);
                    rowObj && rowObj.selected ? this.grid.selectionService.deselectRow(rowObj.rowID, event) :
                    this.grid.selectionService.selectRowById(rowObj.rowID, false, event);
                }
                break;
            default:
                return;
        }
        if (NAVIGATION_KEYS.has(key)) {
            event.preventDefault();
            this.navigateInBody(rowIndex, colIndex, (obj) => { obj.target.activate(); });
        }
        this.grid.cdr.detectChanges();
    }

    summaryNav(event) {
        this.horizontalNav(event, event.key.toLowerCase(), this.grid.dataView.length);
    }

    headerNavigation(event) {
        const key = event.key.toLowerCase();
        if (key === 'esc') {
            this.grid.filteringRow.close();
            return;
        }
        this.horizontalNav(event, key, -1);
    }

    protected horizontalNav(event , key, rowIndex) {
        const ctrl = event.ctrlKey;
        if (!HORIZONTAL_NAV_KEYS.has(key)) { return; }

        event.preventDefault();
        this.activeNode.row = rowIndex;
        if (rowIndex > 0) { this.emitKeyDown(GridKeydownTargetType.summaryCell, this.activeNode.row, event); }

        if ((key.includes('left') || key === 'home') && this.activeNode.column > 0) {
            this.activeNode.column  = ctrl || key === 'home' ? 0 : this.activeNode.column - 1;
        }
        if ((key.includes('right') || key === 'end') && this.activeNode.column < this.lastColumnIndex) {
            this.activeNode.column = ctrl || key === 'end' ? this.lastColumnIndex : this.activeNode.column + 1;
        }
        this.performHorizontalScrollToCell(this.activeNode.column);
    }

    focusTbody() {
        if (!this.activeNode || !(this.activeNode.row < 0 || this.activeNode.row > this.grid.dataView.length - 1)) { return; }
        this.navigateInBody(this.activeNode.row = 0, this.activeNode.column = 0, (obj) => { obj.target.activate(); });
    }

    focusFirstCell(header = true) {
        this.activeNode = {row: header ? -1 : this.grid.dataView.length, column: 0};
        this.performHorizontalScrollToCell(0);
    }

    get lastColumnIndex() {
        return Math.max(...this.grid.visibleColumns.map(col => col.visibleIndex));
    }
    get displayContainerWidth() {
        return Math.round(this.grid.parentVirtDir.dc.instance._viewContainer.element.nativeElement.offsetWidth);
    }
    get displayContainerScrollLeft() {
        return Math.ceil(this.grid.headerContainer.scrollPosition);
    }
    get containerTopOffset() {
        return parseInt(this.grid.verticalScrollContainer.dc.instance._viewContainer.element.nativeElement.style.top, 10);
    }

    public isColumnFullyVisible(columnIndex: number) {
        const forOfDir: IgxForOfDirective<any> = this.forOfDir();
        if (this.isColumnPinned(columnIndex, forOfDir)) {
            return true;
        }
        const index = this.getColumnUnpinnedIndex(columnIndex);
        return this.displayContainerWidth >= forOfDir.getColumnScrollLeft(index + 1) - this.displayContainerScrollLeft &&
        this.displayContainerScrollLeft <= forOfDir.getColumnScrollLeft(index);
    }

    protected getColumnUnpinnedIndex(visibleColumnIndex: number) {
        const column = this.grid.unpinnedColumns.find((col) => !col.columnGroup && col.visibleIndex === visibleColumnIndex);
        return this.grid.pinnedColumns.length ? this.grid.unpinnedColumns.filter((c) => !c.columnGroup).indexOf(column) :
            visibleColumnIndex;
    }

    protected forOfDir(): IgxForOfDirective<any> {
        const  forOfDir = this.grid.dataRowList.length > 0 ? this.grid.dataRowList.first.virtDirRow : this.grid.headerContainer;
        return forOfDir as  IgxForOfDirective<any>;
    }

    protected handleAlt(key: string, event: KeyboardEvent) {
        event.preventDefault();
        const row = this.grid.getRowByIndex(this.activeNode.row) as any;
        if (!this.isToggleKey(key) || !row) { return; }

        if (!row.expanded && ROW_EXPAND_KEYS.has(key)) {
            this.grid.gridAPI.set_row_expansion_state(row.rowID, true, event);
        } else if (row.expanded && ROW_COLLAPSE_KEYS.has(key)) {
            this.grid.gridAPI.set_row_expansion_state(row.rowID, false, event);
        }
        this.grid.notifyChanges();
    }

    protected handleEditing(shift, event) {
        const next = shift ? this.grid.getPreviousCell(this.activeNode.row, this.activeNode.column, col => col.editable) :
        this.grid.getNextCell(this.activeNode.row, this.activeNode.column, col => col.editable);
        if (!this.grid.rowInEditMode && this.isActiveNode(next.rowIndex,  next.visibleColumnIndex)) {
            this.grid.endEdit(true);
            return;
        }
        event.preventDefault();
        if (this.grid.rowInEditMode && this.grid.rowEditTabs.length  &&
            this.activeNode.row !== next.rowIndex || this.isActiveNode(next.rowIndex,  next.visibleColumnIndex)) {
            this.grid.gridAPI.submit_value();
            shift ? this.grid.rowEditTabs.last.element.nativeElement.focus() :
                this.grid.rowEditTabs.first.element.nativeElement.focus();
            return;
        }
        this.navigateInBody(next.rowIndex,  next.visibleColumnIndex, (obj) => {
            obj.target.setEditMode(true);
            this.grid.cdr.detectChanges();
        });
    }

    public handleFilterNavigation(visibleIndex: number, previous) {
        const nextFilterableCell = previous ? this.grid.getPreviousCell(this.findFirstDataRowIndex(), visibleIndex, (col) => col.filterable)
            : this.grid.getNextCell(this.findFirstDataRowIndex(), visibleIndex, (col) => col.filterable);
        this.activeNode.column = previous ? this.activeNode.column - 1 : this.activeNode.column + 1;

        this.grid.navigateTo(nextFilterableCell.rowIndex, this.activeNode.column, () => { });
    }

    public shouldPerformHorizontalScroll(visibleColIndex, rowIndex = -1) {
        if (rowIndex < 0 || rowIndex > this.grid.dataView.length - 1) {
            return !this.isColumnFullyVisible(visibleColIndex);
        }
        const row = this.grid.dataView[rowIndex];
        return row.expression || row.detailsData ? false : !this.isColumnFullyVisible(visibleColIndex);
    }

    public shouldPerformVerticalScroll(targetRowIndex: number): boolean {
        const targetRow = this.getRowElementByIndex(targetRowIndex);
        const rowHeight = this.grid.verticalScrollContainer.getSizeAt(targetRowIndex);
        const containerHeight = this.grid.calcHeight ? Math.ceil(this.grid.calcHeight) : 0;
        const endTopOffset = targetRow ? targetRow.offsetTop + rowHeight + this.containerTopOffset : containerHeight + rowHeight;
        return !targetRow || targetRow.offsetTop < Math.abs(this.containerTopOffset)
            || containerHeight && containerHeight < endTopOffset;
    }

    public navigateInBody(rowIndex, visibleColIndex, cb: Function = null): void {
        if (!this.isValidPosition(rowIndex, visibleColIndex)) { return; }
        this.grid.navigateTo(this.activeNode.row = rowIndex, this.activeNode.column = visibleColIndex, cb);
    }

    public performVerticalScrollToCell(rowIndex: number, cb?: () => void) {
        this.grid.verticalScrollContainer.scrollTo(rowIndex);
        this.grid.verticalScrollContainer.onChunkLoad
            .pipe(first()).subscribe(() => {
                if (cb) { cb(); }
            });
    }

    public performHorizontalScrollToCell(visibleColumnIndex: number, cb?: () => void) {
        if (!this.shouldPerformHorizontalScroll(visibleColumnIndex)) { return; }
        this.grid.parentVirtDir.onChunkLoad
            .pipe(first())
            .subscribe(() => {
                if (cb) { cb(); }
            });
        this.forOfDir().scrollTo(this.getColumnUnpinnedIndex(visibleColumnIndex));
    }

    public isDataRow(rowIndex: number, includeSummary = false) {
        if (rowIndex < 0 || rowIndex > this.grid.dataView.length) { return true; }
        const curRow = this.grid.dataView[rowIndex];
        return curRow && !this.grid.isGroupByRecord(curRow) && !this.grid.isDetailRecord(curRow)
         && !curRow.childGridsData && (includeSummary || !curRow.summaries);
    }

    protected emitKeyDown(type: GridKeydownTargetType, rowIndex, event) {
        const row = this.grid.summariesRowList.toArray().concat(this.grid.rowList.toArray()).find(r => r.index === rowIndex);
        if (!row) { return; }

        const target = type === GridKeydownTargetType.groupRow ? row :
        type === GridKeydownTargetType.dataCell ? row.cells?.find(c => c.visibleColumnIndex === this.activeNode.column) :
        row.summaryCells?.find(c => c.visibleColumnIndex === this.activeNode.column);
        const keydownArgs = { targetType: type, event: event, cancel: false, target: target };
        this.grid.onGridKeydown.emit(keydownArgs);
        if (keydownArgs.cancel && type === GridKeydownTargetType.dataCell) {
            this.grid.selectionService.clear();
            this.grid.selectionService.keyboardState.active = true;
            return;
        }
    }

    private isColumnPinned(columnIndex: number, forOfDir: IgxForOfDirective<any>): boolean {
        const horizontalScroll = forOfDir.getScroll();
        const column = this.grid.visibleColumns.filter(c => !c.columnGroup).find(c => c.visibleIndex === columnIndex);
        return (!horizontalScroll.clientWidth || (column && column.pinned));
    }

    private findFirstDataRowIndex() {
        return this.grid.dataView.findIndex(rec => !this.grid.isGroupByRecord(rec) && !this.grid.isDetailRecord(rec));
    }

    private findLastDataRowIndex() {
        let i = this.grid.dataView.length;
        while (i--) {
            if (this.isDataRow(i)) {
                 return i;
            }
        }
    }

    private getRowElementByIndex(index) {
        if (this.grid.hasDetails) {
            const detail = this.grid.nativeElement.querySelector(`[detail="true"][data-rowindex="${index}"]`);
            if (detail) { return detail; }
        }
        return this.grid.rowList.toArray().concat(this.grid.summariesRowList.toArray()).find(r => r.index === index)?.nativeElement;
    }

    private isValidPosition(rowIndex: number, colIndex: number) {
        if (rowIndex < 0 || colIndex < 0 || this.grid.dataView.length - 1 < rowIndex || this.lastColumnIndex < colIndex) {
            return false;
        }
        if (this.activeNode.column !== colIndex && !this.isDataRow(rowIndex, true)) { return false; }
        return true;
    }

    private isActiveNode(rIndex: number, cIndex: number) {
        return this.activeNode ? this.activeNode.row === rIndex && this.activeNode.column === cIndex : false;
    }

    private isToggleKey(key: string): boolean {
        return ROW_COLLAPSE_KEYS.has(key) || ROW_EXPAND_KEYS.has(key);
    }
}
