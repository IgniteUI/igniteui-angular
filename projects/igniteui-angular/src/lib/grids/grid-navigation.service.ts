import { Injectable } from '@angular/core';
import { first} from 'rxjs/operators';
import { IgxColumnComponent } from './columns/column.component';
import { IgxForOfDirective } from '../directives/for-of/for_of.directive';
import { GridType } from './common/grid.interface';
import { FilterMode } from './common/enums';
import { SUPPORTED_KEYS, isIE, NAVIGATION_KEYS, ROW_COLLAPSE_KEYS, ROW_EXPAND_KEYS } from '../core/utils';
import { IgxGridBaseDirective } from './grid-base.directive';
import { IMultiRowLayoutNode, ISelectionNode } from './selection/selection.service';

export interface IActiveNode {
    row: number;
    column?: number;
    layout?: IMultiRowLayoutNode;
    isSummaryRow?: boolean;
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
        event.stopPropagation();

/*      // This fixes IME editing issue(#6335) that happens only on IE
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
        const lastColumnIndex = Math.max(...this.grid.visibleColumns.map(col => col.visibleIndex));
        switch (key) {
            case 'tab':
                this.handleRowEditing(shift);
                break;
            case 'end':
                this.activeNode.row = ctrl ? this.findLastDataRowIndex() : this.activeNode.row;
                this.activeNode.column = lastColumnIndex;
                break;
            case 'home':
                this.activeNode.row = ctrl ? 0 : this.activeNode.row;
                this.activeNode.column = 0;
                break;
            case 'arrowleft':
            case 'left':
                const cIndex  = ctrl ? 0 : this.activeNode.column - 1;
                this.activeNode.column = cIndex;
                break;
            case 'arrowright':
            case 'right':
                this.activeNode.column = !ctrl ? this.activeNode.column + 1 : lastColumnIndex;
                break;
            case 'arrowup':
            case 'up':
                this.activeNode.column =  this.activeNode.column !== undefined ?   this.activeNode.column : 0;
                this.activeNode.row = ctrl ? this.findFirstDataRowIndex() : this.activeNode.row - 1;
                break;
            case 'arrowdown':
            case 'down':
                this.activeNode.column =  this.activeNode.column !== undefined ?   this.activeNode.column : 0;
                this.activeNode.row  = ctrl ? this.findLastDataRowIndex() : this.activeNode.row + 1;
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
                /* if (this.grid.isRowSelectable) {
                    this.row.selected ? this.selectionService.deselectRow(this.row.rowID, event) :
                    this.selectionService.selectRowById(this.row.rowID, false, event);
                } */
                break;
            default:
                return;
        }
        if (NAVIGATION_KEYS.has(key)) {
            this.grid.navigateTo(this.activeNode.row, this.activeNode.column, (obj) => { obj.target.activate(); });
        }
        this.grid.cdr.detectChanges();
    }

    protected handleAlt(key: string, event: KeyboardEvent) {
        if (this.isToggleKey(key)) {
/*             const collapse = (this.row as any).expanded && ROW_COLLAPSE_KEYS.has(key);
            const expand = !(this.row as any).expanded && ROW_EXPAND_KEYS.has(key);
            if (expand) {
                this.gridAPI.set_row_expansion_state(this.row.rowID, true, event);
            } else if (collapse) {
                this.gridAPI.set_row_expansion_state(this.row.rowID, false, event);
            } */
            this.grid.notifyChanges();
        }
    }

    protected handleRowEditing(shift) {
        const cellI = shift ? this.grid.getPreviousCell(this.activeNode.row, this.activeNode.column, (col) => col.editable) :
        this.grid.getNextCell(this.activeNode.row, this.activeNode.column, (col) => col.editable);
        if (this.activeNode.row !== cellI.rowIndex) {
            if (this.grid.rowEditTabs.length) {
                //  TODO: make gridAPI visible for internal use and remove cast to any
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
    get displayContainerWidth() {
        return Math.round(this.grid.parentVirtDir.dc.instance._viewContainer.element.nativeElement.offsetWidth);
    }

    get displayContainerScrollLeft() {
        return Math.ceil(this.grid.headerContainer.scrollPosition);
    }

    get containerTopOffset() {
        return parseInt(this.grid.verticalScrollContainer.dc.instance._viewContainer.element.nativeElement.style.top, 10);
    }

    public horizontalScroll(rowIndex) {
        let rowComp = this.grid.dataRowList.find((row) => row.index === rowIndex) || this.grid.dataRowList.first;
        if (!rowComp) {
            rowComp = this.grid.summariesRowList.find((row) => row.index === rowIndex);
        }
        return rowComp?.virtDirRow;
    }

    public getColumnUnpinnedIndex(visibleColumnIndex: number) {
        const column = this.grid.unpinnedColumns.find((col) => !col.columnGroup && col.visibleIndex === visibleColumnIndex);
        return this.grid.pinnedColumns.length ? this.grid.unpinnedColumns.filter((c) => !c.columnGroup).indexOf(column) :
            visibleColumnIndex;
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

    private forOfDir(): IgxForOfDirective<any> {
        let forOfDir: IgxForOfDirective<any>;
        if (this.grid.dataRowList.length > 0) {
            forOfDir = this.grid.dataRowList.first.virtDirRow;
        } else {
            forOfDir = this.grid.headerContainer;
        }
        return forOfDir;
    }

    private isColumnPinned(columnIndex: number, forOfDir: IgxForOfDirective<any>): boolean {
        const horizontalScroll = forOfDir.getScroll();
        const column = this.grid.columnList.filter(c => !c.columnGroup).find((col) => col.visibleIndex === columnIndex);
        return (!horizontalScroll.clientWidth || column.pinned);
    }


    public isRowInEditMode(rowIndex): boolean {
        return this.grid.rowEditable && (this.grid.rowInEditMode && this.grid.rowInEditMode.index === rowIndex);
    }


    private findFirstDataRowIndex() {
        const dv = this.grid.dataView;
        return dv.findIndex(rec => !this.grid.isGroupByRecord(rec) && !this.grid.isDetailRecord(rec));
    }

    private findLastDataRowIndex() {
        let i = this.grid.dataView.length;
        while (i--) {
            const rec = this.grid.dataView[i];
            if (!this.grid.isGroupByRecord(rec) && !this.grid.isDetailRecord(rec)) {
                 return i;
            }
        }
    }

    public goToLastBodyElement() {
        const verticalScroll = this.grid.verticalScrollContainer.getScroll();
        if (verticalScroll.scrollHeight === 0 ||
            verticalScroll.scrollTop === verticalScroll.scrollHeight - this.grid.verticalScrollContainer.igxForContainerSize) {
            const rowIndex = this.grid.dataView.length - 1;
            const row = this.grid.nativeElement.querySelector(`[data-rowindex="${rowIndex}"]`) as HTMLElement;
            const isRowTarget = row.tagName.toLowerCase() === 'igx-grid-groupby-row' ||
            this.grid.isDetailRecord(this.grid.dataView[rowIndex]);
            if (row && isRowTarget) {
                row.focus();
                return;
            }
            const isSummary = (row && row.tagName.toLowerCase() === 'igx-grid-summary-row') ? true : false;
           // this.onKeydownEnd(rowIndex, isSummary);
        } else {
            this.grid.verticalScrollContainer.scrollTo(this.grid.dataView.length - 1);
            this.grid.verticalScrollContainer.onChunkLoad
                .pipe(first()).subscribe(() => {
                    const rowIndex = this.grid.dataView.length - 1;
                    const row = this.grid.nativeElement.querySelector(`[data-rowindex="${rowIndex}"]`) as HTMLElement;
                    const isRowTarget = row.tagName.toLowerCase() === 'igx-grid-groupby-row' ||
                    this.grid.isDetailRecord(this.grid.dataView[rowIndex]);
                    if (row && isRowTarget) {
                        row.focus();
                        return;
                    }
                    const isSummary = (row && row.tagName.toLowerCase() === 'igx-grid-summary-row') ? true : false;
                   //  this.onKeydownEnd(rowIndex, isSummary);
                });
        }
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
            this.activeNode.row = 0;
            this.activeNode.column = 0;
            this.grid.navigateTo(this.activeNode.row, this.activeNode.column);
            eventArgs.preventDefault();
        } else if (this.grid.rootSummariesEnabled) {
            this.grid.navigateTo(this.activeNode.row, this.activeNode.column);
            eventArgs.preventDefault();
        }
    }

    public navigateNextFilterCell(column: IgxColumnComponent, eventArgs) {
        const cols = this.grid.filteringService.unpinnedFilterableColumns;
        const nextFilterableIndex = cols.indexOf(column) + 1;
        if (nextFilterableIndex >= this.grid.filteringService.unpinnedFilterableColumns.length) {
            // next is not filter cell
            this.navigateFirstCellIfPossible(eventArgs);
            return;
        }
        const nextColumn = cols[nextFilterableIndex];
        const nextVisibleIndex = nextColumn.visibleIndex;
        if (!column.pinned && !this.isColumnFullyVisible(nextVisibleIndex)) {
            eventArgs.preventDefault();
            this.grid.filteringService.scrollToFilterCell(nextColumn, true);
        } else if (column === this.getLastPinnedFilterableColumn() && !this.isColumnFullyVisible(nextVisibleIndex)) {
            this.grid.filteringService.scrollToFilterCell(nextColumn, false);
            eventArgs.stopPropagation();
        }
    }

    private getLastPinnedFilterableColumn(): IgxColumnComponent {
        const pinnedFilterableColums =
            this.grid.pinnedColumns.filter(col => !(col.columnGroup) && col.filterable);
        return pinnedFilterableColums[pinnedFilterableColums.length - 1];
    }

    private getFirstPinnedFilterableColumn(): IgxColumnComponent {
        return this.grid.pinnedColumns.filter(col => !(col.columnGroup) && col.filterable)[0];
    }

    public performShiftTabKey(currentRowEl, selectedNode: ISelectionNode) {
        const rowIndex = selectedNode.row;
        const visibleColumnIndex = selectedNode.column;
        const isSummary = selectedNode.isSummaryRow;
        if (isSummary && rowIndex === 0 && visibleColumnIndex === 0 && this.grid.rowList.length) {
            this.goToLastBodyElement();
            return;
        }

        if (this.isRowInEditMode(rowIndex)) {
            // this.movePreviousEditable(rowIndex, visibleColumnIndex);
            return;
        }

        const prevIsDetailRow = rowIndex > 0 ? this.grid.isDetailRecord(this.grid.dataView[rowIndex - 1]) : false;
        if (visibleColumnIndex === 0 && prevIsDetailRow) {
            let target = currentRowEl.previousElementSibling;
            const applyFocusFunc = () => {
                    target = this.getRowByIndex(rowIndex - 1);
                    target.focus({ preventScroll: true });
            };
            if (target) {
                applyFocusFunc();
            } else {
                this.performVerticalScrollToCell(rowIndex - 1, () => {
                    applyFocusFunc();
                });
            }

            return;
        }

        if (visibleColumnIndex === 0) {
            if (rowIndex === 0 && this.grid.allowFiltering && this.grid.filterMode === FilterMode.quickFilter) {
                this.moveFocusToFilterCell();
            } else {
/*                 this.navigateUp(currentRowEl,
                    {
                        row: rowIndex,
                        column: this.grid.unpinnedColumns[this.grid.unpinnedColumns.length - 1].visibleIndex
                    }); */
            }
        } else {
/*             const cell = this.getCellElementByVisibleIndex(rowIndex, visibleColumnIndex, isSummary);
            if (cell) {
                this.onKeydownArrowLeft(cell, selectedNode);
            } */
        }
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

    public performHorizontalScrollToCell(
        rowIndex: number, visibleColumnIndex: number, isSummary: boolean = false, cb?: () => void) {
        const unpinnedIndex = this.getColumnUnpinnedIndex(visibleColumnIndex);
       this.getFocusableGrid().nativeElement.focus({ preventScroll: true });
        this.grid.parentVirtDir.onChunkLoad
            .pipe(first())
            .subscribe(() => {
                if (cb) {
                    cb();
                }
            });
        this.horizontalScroll(rowIndex).scrollTo(unpinnedIndex);
    }

    protected getFocusableGrid() {
        return this.grid;
    }

    protected getRowByIndex(index) {
        return [...this.grid.rowList, ...this.grid.summariesRowList].find(r => r.index === index)?.nativeElement;
    }

    private isToggleKey(key: string): boolean {
        return ROW_COLLAPSE_KEYS.has(key) || ROW_EXPAND_KEYS.has(key);
    }
}
