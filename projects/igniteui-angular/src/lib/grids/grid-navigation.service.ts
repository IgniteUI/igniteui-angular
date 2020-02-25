import { Injectable } from '@angular/core';
import { first} from 'rxjs/operators';
import { IgxColumnComponent } from './columns/column.component';
import { IgxForOfDirective } from '../directives/for-of/for_of.directive';
import { GridType } from './common/grid.interface';
import { FilterMode } from './common/enums';
import { isIE, NAVIGATION_KEYS, ROW_COLLAPSE_KEYS, ROW_EXPAND_KEYS } from '../core/utils';
import { IgxGridBaseDirective } from './grid-base.directive';
import { IMultiRowLayoutNode } from './selection/selection.service';
import { ICellPosition } from 'igniteui-angular';

export interface IActiveNode {
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
        const shift = event.shiftKey;
        const ctrl = event.ctrlKey;
/*      This fixes IME editing issue(#6335) that happens only on IE
        if (isIE() && keydownArgs.event.keyCode === 229 && event.key === 'Tab') {
            return;
        }
        const keydownArgs = { targetType: 'dataCell', target: this, event: event, cancel: false };
        this.grid.onGridKeydown.emit(keydownArgs);
        if (keydownArgs.cancel) {
            this.selectionService.clear();
            this.selectionService.keyboardState.active = true;
            return;
        } */

        if (event.altKey) {
            event.preventDefault();
            this.handleAlt(key, event);
            return;
        }
        this.grid.selectionService.keyboardStateOnKeydown(this.activeNode, shift, shift && key === 'tab');
        if (key === 'tab') {
            event.preventDefault();
        }
        if (this.grid.crudService.cell) {
            if (NAVIGATION_KEYS.has(key)) {
                const col = this.grid.getColumnByVisibleIndex(this.activeNode.column);
                if (col.inlineEditorTemplate) { return; }
                if (['date', 'boolean'].indexOf(col.dataType) > -1) { return; }
                return;
            }
        }
        if (NAVIGATION_KEYS.has(key)) {
            event.preventDefault();
        }
        let colIndex = this.activeNode.column, rowIndex = this.activeNode.row;
        const lastColumnIndex = Math.max(...this.grid.visibleColumns.map(col => col.visibleIndex));
        switch (key) {
            case 'tab':
                this.handleRowEditing(shift);
                break;
            case 'end':
                rowIndex = ctrl ? this.findLastDataRowIndex() : this.activeNode.row;
                colIndex = lastColumnIndex;
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
                colIndex = ctrl ? lastColumnIndex : this.activeNode.column + 1;
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
                    rowObj.selected ? this.grid.selectionService.deselectRow(rowObj.rowID, event) :
                    this.grid.selectionService.selectRowById(rowObj.rowID, false, event);
                }
                break;
            default:
                return;
        }
        if (NAVIGATION_KEYS.has(key)) {
            if (this.isValidPosition(rowIndex, colIndex)) {
                this.grid.navigateTo(this.activeNode.row = rowIndex, this.activeNode.column = colIndex,
                    (obj) => { obj.target.activate(); });
            }
            this.grid.cdr.detectChanges();
        }
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

    public isRowInEditMode(rowIndex): boolean {
        return this.grid.rowEditable && (this.grid.rowInEditMode && this.grid.rowInEditMode.index === rowIndex);
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

    private getColumnUnpinnedIndex(visibleColumnIndex: number) {
        const column = this.grid.unpinnedColumns.find((col) => !col.columnGroup && col.visibleIndex === visibleColumnIndex);
        return this.grid.pinnedColumns.length ? this.grid.unpinnedColumns.filter((c) => !c.columnGroup).indexOf(column) :
            visibleColumnIndex;
    }

    private forOfDir(): IgxForOfDirective<any> {
        const  forOfDir = this.grid.dataRowList.length > 0 ? this.grid.dataRowList.first.virtDirRow : this.grid.headerContainer;
        return forOfDir as  IgxForOfDirective<any>;
    }

    private isColumnPinned(columnIndex: number, forOfDir: IgxForOfDirective<any>): boolean {
        const horizontalScroll = forOfDir.getScroll();
        const column = this.grid.visibleColumns.filter(c => !c.columnGroup).find(c => c.visibleIndex === columnIndex);
        return (!horizontalScroll.clientWidth || (column && column.pinned));
    }

    private findFirstDataRowIndex() {
        const dv = this.grid.dataView;
        return dv.findIndex(rec => !this.grid.isGroupByRecord(rec) && !this.grid.isDetailRecord(rec));
    }

    private findLastDataRowIndex() {
        let i = this.grid.dataView.length;
        while (i--) {
            const rec = this.grid.dataView[i];
            if (!this.grid.isGroupByRecord(rec) && !this.grid.isDetailRecord(rec) && !rec.summaries) {
                 return i;
            }
        }
    }

    protected handleAlt(key: string, event: KeyboardEvent) {
        if (this.isToggleKey(key)) {
            const row = this.grid.getRowByIndex(this.activeNode.row) as any;
            if (!row.expanded && ROW_EXPAND_KEYS.has(key)) {
                this.grid.gridAPI.set_row_expansion_state(row.rowID, true, event);
            } else if (row.expanded && ROW_COLLAPSE_KEYS.has(key)) {
                this.grid.gridAPI.set_row_expansion_state(row.rowID, false, event);
            }
            this.grid.notifyChanges();
        }
    }

    protected handleRowEditing(shift) {
        const cellI = this.getCell(this.activeNode.row, this.activeNode.column, shift);
        if ( this.isRowInEditMode(this.activeNode.row)  && this.activeNode.row !== cellI.rowIndex ||
            (this.activeNode.row === cellI.rowIndex && this.activeNode.column === cellI.visibleColumnIndex)) {
            if (this.grid.rowEditTabs.length) {
                (this.grid as any).gridAPI.submit_value();
                shift ? this.grid.rowEditTabs.last.element.nativeElement.focus() :
                this.grid.rowEditTabs.first.element.nativeElement.focus();
                return;
            }
        }
        this.activeNode.row = cellI.rowIndex;
        this.activeNode.column = cellI.visibleColumnIndex;
        this.grid.navigateTo(this.activeNode.row, this.activeNode.column, (obj) => {
            obj.target.setEditMode(true);
            this.grid.cdr.detectChanges();
        });
    }

    private getCell(rowIndex, colIndex, shift): ICellPosition {
        return shift ? this.grid.getPreviousCell(rowIndex, colIndex, col => this.isRowInEditMode(rowIndex) ? col.editable : true) :
            this.grid.getNextCell(rowIndex, colIndex, col => this.isRowInEditMode(rowIndex) ? col.editable : true);
    }

    public moveFocusToFilterCell(toStart?: boolean) {
        if (this.grid.filteringService.isFilterRowVisible) {
            this.grid.filteringService.focusFilterRowCloseButton();
            return;
        }

        const columns = this.grid.filteringService.unpinnedFilterableColumns;
        const targetIndex = toStart ? 0 : columns.length - 1;
        const visibleIndex = columns[targetIndex].visibleIndex;
        const isVisible = this.isColumnFullyVisible(visibleIndex);
        if (isVisible) {
            this.grid.filteringService.focusFilterCellChip(columns[targetIndex], false);
        } else {
            this.grid.filteringService.scrollToFilterCell(columns[targetIndex], false);
        }
    }

    public navigatePrevFilterCell(column: IgxColumnComponent, eventArgs) {
        const cols = this.grid.filteringService.unpinnedFilterableColumns;
        const prevFilterableIndex = cols.indexOf(column) - 1;
        const visibleIndex = column.visibleIndex;
        if (visibleIndex === 0 || prevFilterableIndex < 0) {
            // prev is not filter cell
            const firstFiltarableCol = this.getFirstPinnedFilterableColumn();
            if (!firstFiltarableCol || column === firstFiltarableCol) {
                eventArgs.preventDefault();
            }
            return;
        }
        const prevColumn = cols[prevFilterableIndex];
        const prevVisibleIndex = prevColumn.visibleIndex;

        if (prevFilterableIndex >= 0 && visibleIndex > 0 && !this.isColumnFullyVisible(prevVisibleIndex) && !column.pinned) {
            eventArgs.preventDefault();
            this.grid.filteringService.scrollToFilterCell(prevColumn, false);
        }
    }

    public navigateFirstCellIfPossible(eventArgs) {
        if (this.grid.rowList.length > 0) {
            this.grid.navigateTo(this.activeNode.row = 0, this.activeNode.column = 0);
            eventArgs.preventDefault();
        } else if (this.grid.rootSummariesEnabled) {
            this.grid.navigateTo(this.activeNode.row, this.activeNode.column);
            eventArgs.preventDefault();
        }
    }

    public navigateNextFilterCell(column: IgxColumnComponent, eventArgs, shift) {
        const nextFilterableCell = shift ?
        this.grid.getPreviousCell(this.findFirstDataRowIndex(), column.visibleIndex, (col) => col.filterable)
        : this.grid.getNextCell(this.findFirstDataRowIndex(), column.visibleIndex, (col) => col.filterable);
        this.grid.navigateTo(nextFilterableCell.rowIndex, nextFilterableCell.visibleColumnIndex);
    }

    private getLastPinnedFilterableColumn(): IgxColumnComponent {
        const pinnedFilterableColums =
            this.grid.pinnedColumns.filter(col => !(col.columnGroup) && col.filterable);
        return pinnedFilterableColums[pinnedFilterableColums.length - 1];
    }

    private getFirstPinnedFilterableColumn(): IgxColumnComponent {
        return this.grid.pinnedColumns.filter(col => !(col.columnGroup) && col.filterable)[0];
    }

    public shouldPerformHorizontalScroll(visibleColIndex, rowIndex = -1) {
        if (rowIndex < 0 || rowIndex > this.grid.dataView.length - 1) {
            return this.isColumnFullyVisible(visibleColIndex);
        }
        const row = this.grid.dataView[rowIndex];
        return row.expression || row.detailsData ? false : !this.isColumnFullyVisible(visibleColIndex);
    }

    public shouldPerformVerticalScroll(targetRowIndex: number): boolean {
        const targetRow = this.getRowByIndex(targetRowIndex);
        const rowHeight = this.grid.verticalScrollContainer.getSizeAt(targetRowIndex);
        const containerHeight = this.grid.calcHeight ? Math.ceil(this.grid.calcHeight) : 0;
        const targetEndTopOffset = targetRow ? targetRow.offsetTop + rowHeight + this.containerTopOffset :
            containerHeight + rowHeight;
        if (!targetRow || targetRow.offsetTop < Math.abs(this.containerTopOffset)
            || containerHeight && containerHeight < targetEndTopOffset) {
            return true;
        } else {
            return false;
        }
    }

    public performVerticalScrollToCell(rowIndex: number, cb?: () => void) {
        this.grid.verticalScrollContainer.scrollTo(rowIndex);
        this.grid.verticalScrollContainer.onChunkLoad
            .pipe(first()).subscribe(() => {
                cb();
            });
    }

    public performHorizontalScrollToCell(visibleColumnIndex: number, cb?: () => void) {
        const unpinnedIndex = this.getColumnUnpinnedIndex(visibleColumnIndex);
       this.grid.nativeElement.focus({ preventScroll: true });
        this.grid.parentVirtDir.onChunkLoad
            .pipe(first())
            .subscribe(() => {
                if (cb) {
                    cb();
                }
            });
        this.forOfDir().scrollTo(unpinnedIndex);
    }

    public getRowByIndex(index) {
        if (this.grid.hasDetails) {
            const detail = this.grid.nativeElement.querySelector(`[detail="true"][data-rowindex="${index}"]`);
            if (detail) { return detail; }
        }
        return [...this.grid.rowList, ...this.grid.summariesRowList].find(r => r.index === index)?.nativeElement;
    }

    private isValidPosition(rowIndex, colIndex) {
        const lastVisibleColIndex =  Math.max(...this.grid.visibleColumns.map(col => col.visibleIndex));
        if (rowIndex < 0 || colIndex < 0 || this.grid.dataView.length - 1 < rowIndex || lastVisibleColIndex < colIndex) {
            return false;
        }
        const row = this.grid.dataView[rowIndex];
        if (this.activeNode.column !== colIndex && (row.expression || row.detailsData) ) {
            return false;
        }
        return true;
    }

    private isToggleKey(key: string): boolean {
        return ROW_COLLAPSE_KEYS.has(key) || ROW_EXPAND_KEYS.has(key);
    }
}
