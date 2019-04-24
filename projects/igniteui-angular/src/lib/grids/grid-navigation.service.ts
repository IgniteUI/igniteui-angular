import { Injectable } from '@angular/core';
import { IgxGridBaseComponent, FilterMode } from './grid-base.component';
import { first } from 'rxjs/operators';
import { IgxColumnComponent } from './column.component';
import { IgxGridGroupByRowComponent } from './grid/groupby-row.component';
import { IgxGridCellComponent } from './tree-grid';

enum MoveDirection {
    LEFT = 'left',
    RIGHT = 'right'
}

/** @hidden */
@Injectable()
export class IgxGridNavigationService {
    public grid: IgxGridBaseComponent;

    get displayContainerWidth() {
        return Math.round(this.grid.parentVirtDir.dc.instance._viewContainer.element.nativeElement.offsetWidth);
    }

    get displayContainerScrollLeft() {
        return Math.round(this.grid.parentVirtDir.getHorizontalScroll().scrollLeft);
    }

    get verticalDisplayContainerElement() {
        return this.grid.verticalScrollContainer.dc.instance._viewContainer.element.nativeElement;
    }

    public horizontalScroll(rowIndex) {
        let rowComp = this.grid.dataRowList.find((row) => row.index === rowIndex);
        if (!rowComp) {
            rowComp = this.grid.summariesRowList.find((row) => row.index === rowIndex);
        }
        return rowComp.virtDirRow;
    }

    public getColumnUnpinnedIndex(visibleColumnIndex: number, cell?: IgxGridCellComponent) {
        if (this.grid.hasColumnLayouts) {
            return this.grid.unpinnedColumns.filter((c) => c.columnLayout).indexOf(cell.column.parent);
        }
        const column = this.grid.unpinnedColumns.find((col) => !col.columnGroup && col.visibleIndex === visibleColumnIndex);
        return this.grid.pinnedColumns.length ? this.grid.unpinnedColumns.filter((c) => !c.columnGroup).indexOf(column) :
            visibleColumnIndex;
    }

    public isColumnFullyVisible(visibleColumnIndex: number, cell?: IgxGridCellComponent) {
        let forOfDir;
        if (this.grid.dataRowList.length > 0) {
            forOfDir = this.grid.dataRowList.first.virtDirRow;
        } else {
            forOfDir = this.grid.headerContainer;
        }
        const horizontalScroll = forOfDir.getHorizontalScroll();
        const column = this.grid.hasColumnLayouts ? cell.column.parent :
            this.grid.columnList.filter(c => !c.columnGroup).find((col) => col.visibleIndex === visibleColumnIndex);
        if (!horizontalScroll.clientWidth || column.pinned) {
            return true;
        }
        if (this.grid.hasColumnLayouts) {
            return this.displayContainerWidth >= forOfDir.getColumnScrollLeft(column.visibleIndex + 1) - this.displayContainerScrollLeft;
        } else {
            const index = this.getColumnUnpinnedIndex(visibleColumnIndex);
            return this.displayContainerWidth >= forOfDir.getColumnScrollLeft(index + 1) - this.displayContainerScrollLeft;
        }
    }

    public isColumnLeftFullyVisible(visibleColumnIndex, cell?: IgxGridCellComponent) {
        let forOfDir;
        if (this.grid.dataRowList.length > 0) {
            forOfDir = this.grid.dataRowList.first.virtDirRow;
        } else {
            forOfDir = this.grid.headerContainer;
        }
        const horizontalScroll = forOfDir.getHorizontalScroll();
        const column = this.grid.hasColumnLayouts ? cell.column.parent :
            this.grid.columnList.filter(c => !c.columnGroup).find((col) => col.visibleIndex === visibleColumnIndex);
        if (!horizontalScroll.clientWidth || column.pinned) {
            return true;
        }
        if (this.grid.hasColumnLayouts) {
            return this.displayContainerScrollLeft <= forOfDir.getColumnScrollLeft(column.visibleIndex);
        } else {
            const index = this.getColumnUnpinnedIndex(visibleColumnIndex);
            return this.displayContainerScrollLeft <= forOfDir.getColumnScrollLeft(index);
        }
    }

    public get gridOrderedColumns(): IgxColumnComponent[] {
        return [...this.grid.pinnedColumns, ...this.grid.unpinnedColumns].filter(c => !c.columnGroup);
    }

    public isRowInEditMode(rowIndex): boolean {
        return this.grid.rowEditable && (this.grid.rowInEditMode && this.grid.rowInEditMode.index === rowIndex);
    }

    public isColumnEditable(visibleColumnIndex: number): boolean {
        const column = this.gridOrderedColumns.find(c => c.visibleIndex === visibleColumnIndex);
        return column ? column.editable : false;
    }

    public findNextEditable(direction: string, visibleColumnIndex: number) {
        const gridColumns = this.gridOrderedColumns;
        if (direction === MoveDirection.LEFT) {
            return gridColumns.splice(0, visibleColumnIndex + 1).reverse().findIndex(e => e.editable);
        } else if (direction === MoveDirection.RIGHT) {
            return gridColumns.splice(visibleColumnIndex, gridColumns.length - 1).findIndex(e => e.editable);
        }
    }

    public getCellElementByVisibleIndex(rowIndex, visibleColumnIndex, isSummary = false) {
        const cellSelector = this.getCellSelector(visibleColumnIndex, isSummary);
        return this.grid.nativeElement.querySelector(
            `${cellSelector}[data-rowindex="${rowIndex}"][data-visibleIndex="${visibleColumnIndex}"]`);
    }

    public onKeydownArrowRight(element, rowIndex, visibleColumnIndex, isSummary = false, cell?) {
        if (this.grid.unpinnedColumns[this.grid.unpinnedColumns.length - 1].visibleIndex === visibleColumnIndex) {
            return;
        }
        const next = this.nextElement(element, cell);
        if (this.isColumnFullyVisible(visibleColumnIndex + 1, cell)) { // if next column is fully visible or is pinned
            if (element.classList.contains('igx-grid__td--pinned-last') || element.classList.contains('igx-grid-summary--pinned-last')) {
                if (this.isColumnLeftFullyVisible(visibleColumnIndex + 1)) {
                    element.nextElementSibling.firstElementChild.focus({ preventScroll: true });
                } else {
                    this.grid.nativeElement.focus({ preventScroll: true });
                    this.grid.parentVirtDir.onChunkLoad
                        .pipe(first())
                        .subscribe(() => {
                            element.nextElementSibling.firstElementChild.focus({ preventScroll: true });
                        });
                    this.horizontalScroll(rowIndex).scrollTo(0);
                }
            } else {
                if (next) {
                    next.focus({ preventScroll: true });
                }
            }
        } else {
            this.grid.nativeElement.focus({ preventScroll: true });
            this.performHorizontalScrollToCell(rowIndex, visibleColumnIndex + 1, isSummary, cell);
        }
    }

    public onKeydownArrowLeft(element, rowIndex, visibleColumnIndex, isSummary = false, cell?) {
        if (visibleColumnIndex === 0 && !this.grid.hasColumnLayouts) {
            return;
        }
        const index = this.getColumnUnpinnedIndex(visibleColumnIndex - 1, cell);
        if (!element.previousElementSibling && this.grid.pinnedColumns.length && index === - 1) {
            element.parentNode.previousElementSibling.focus({ preventScroll: true });
        } else if (!this.isColumnLeftFullyVisible(visibleColumnIndex - 1, cell)) {
            this.grid.nativeElement.focus({ preventScroll: true });
            this.performHorizontalScrollToCell(rowIndex, visibleColumnIndex - 1, isSummary, cell);
        } else {
            const prev = this.prevElement(element, cell);
            if (prev) {
                prev.focus({ preventScroll: true });
            }
        }

    }

    public movePreviousEditable(rowIndex, visibleColumnIndex) {
        const addedIndex = this.isColumnEditable(visibleColumnIndex - 1) ?
            0 :
            this.findNextEditable(MoveDirection.LEFT, visibleColumnIndex - 1);
        if (addedIndex === -1) {
            this.grid.rowEditTabs.last.element.nativeElement.focus();
            return;
        }
        const editableIndex = visibleColumnIndex - 1 - addedIndex;
        if (this.getColumnUnpinnedIndex(editableIndex) === -1 && this.grid.pinnedColumns.length) {
            // if target is NOT pinned and there are pinned columns
            // since addedIndex !== -1, there will always be a target
            this.getCellElementByVisibleIndex(rowIndex, editableIndex).focus();
        } else if (!this.isColumnLeftFullyVisible(editableIndex)) {  // if not fully visible, perform scroll
            this.grid.nativeElement.focus({ preventScroll: true });
            this.performHorizontalScrollToCell(rowIndex, editableIndex);
        } else {
            this.getCellElementByVisibleIndex(rowIndex, editableIndex).focus(); // if fully visible, just focus
        }
    }

    public moveNextEditable(element, rowIndex, visibleColumnIndex) {
        let addedIndex = 0;
        addedIndex = this.isColumnEditable(visibleColumnIndex + 1) ?
            0 :
            this.findNextEditable(MoveDirection.RIGHT, visibleColumnIndex + 1);
        if (addedIndex === -1 && this.grid.rowEditTabs) { // no previous edit column -> go to RE buttons
            this.grid.rowEditTabs.first.element.nativeElement.focus();
            return;
        }
        const editableIndex = visibleColumnIndex + 1 + addedIndex;
        if (this.isColumnFullyVisible(editableIndex)) { // If column is fully visible
            if (element.classList.contains('igx-grid__td--pinned-last')) { // If this is pinned
                if (this.isColumnLeftFullyVisible(editableIndex)) { // If next column is fully visible LEFT
                    this.getCellElementByVisibleIndex(rowIndex, editableIndex).focus(); // focus
                } else { // if NOT fully visible, perform scroll
                    this.grid.nativeElement.focus({ preventScroll: true });
                    this.performHorizontalScrollToCell(rowIndex, editableIndex);
                }
            } else { // cell is next cell
                this.getCellElementByVisibleIndex(rowIndex, editableIndex).focus();
            }
        } else {
            this.grid.nativeElement.focus({ preventScroll: true });
            this.performHorizontalScrollToCell(rowIndex, editableIndex);
        }
    }

    public onKeydownHome(rowIndex, isSummary = false) {
        const rowList = isSummary ? this.grid.summariesRowList : this.grid.dataRowList;
        let rowElement = rowList.find((row) => row.index === rowIndex);
        const cellSelector = this.getCellSelector(0, isSummary);
        if (!rowElement) { return; }
        rowElement = rowElement.nativeElement;
        let firstCell =  rowElement.querySelector(cellSelector);
        if (this.grid.pinnedColumns.length || this.displayContainerScrollLeft === 0) {
            firstCell.focus({ preventScroll: true });
        } else {
            this.grid.nativeElement.focus({ preventScroll: true });
            this.grid.parentVirtDir.onChunkLoad
                .pipe(first())
                .subscribe(() => {
                    firstCell = rowElement.querySelector(cellSelector);
                    firstCell.focus({ preventScroll: true });
                });
            this.horizontalScroll(rowIndex).scrollTo(0);
        }
    }

    public onKeydownEnd(rowIndex, isSummary = false) {
        const index = this.grid.unpinnedColumns[this.grid.unpinnedColumns.length - 1].visibleIndex;
        const rowList = isSummary ? this.grid.summariesRowList : this.grid.dataRowList;
        let rowElement = rowList.find((row) => row.index === rowIndex);
        if (!rowElement) { return; }
        rowElement = rowElement.nativeElement;
        if (this.isColumnFullyVisible(index)) {
            const allCells = rowElement.querySelectorAll(this.getCellSelector(-1, isSummary));
            allCells[allCells.length - 1].focus({ preventScroll: true });
        } else {
            this.grid.nativeElement.focus({ preventScroll: true });
            this.grid.parentVirtDir.onChunkLoad
                .pipe(first())
                .subscribe(() => {
                    const allCells = rowElement.querySelectorAll(this.getCellSelector(-1, isSummary));
                    allCells[allCells.length - 1].focus({ preventScroll: true });
                });
            this.horizontalScroll(rowIndex).scrollTo(this.getColumnUnpinnedIndex(index));
        }
    }

    public navigateTop(visibleColumnIndex) {
        const verticalScroll = this.grid.verticalScrollContainer.getVerticalScroll();
        const cellSelector = this.getCellSelector(visibleColumnIndex);
        if (verticalScroll.scrollTop === 0) {
            const cells = this.grid.nativeElement.querySelectorAll(
                `${cellSelector}[data-visibleIndex="${visibleColumnIndex}"]`);
            cells[0].focus();
        } else {
            this.grid.nativeElement.focus({ preventScroll: true });
            this.grid.verticalScrollContainer.scrollTo(0);
            this.grid.verticalScrollContainer.onChunkLoad
                .pipe(first()).subscribe(() => {
                    const cells = this.grid.nativeElement.querySelectorAll(
                        `${cellSelector}[data-visibleIndex="${visibleColumnIndex}"]`);
                    if (cells.length > 0) { cells[0].focus(); }
                });
        }
    }

    public navigateBottom(visibleColumnIndex) {
        const verticalScroll = this.grid.verticalScrollContainer.getVerticalScroll();
        const cellSelector = this.getCellSelector(visibleColumnIndex);
        if (verticalScroll.scrollHeight === 0 ||
            verticalScroll.scrollTop === verticalScroll.scrollHeight - this.grid.verticalScrollContainer.igxForContainerSize) {
            const cells = this.grid.nativeElement.querySelectorAll(
                `${cellSelector}[data-visibleIndex="${visibleColumnIndex}"]`);
            cells[cells.length - 1].focus();
        } else {
            this.grid.nativeElement.focus({ preventScroll: true });
            this.grid.verticalScrollContainer.scrollTo(this.grid.verticalScrollContainer.igxForOf.length - 1);
            this.grid.verticalScrollContainer.onChunkLoad
                .pipe(first()).subscribe(() => {
                    const cells = this.grid.nativeElement.querySelectorAll(
                        `${cellSelector}[data-visibleIndex="${visibleColumnIndex}"]`);
                    if (cells.length > 0) { cells[cells.length - 1].focus(); }
                });
        }
    }

    public navigateUp(rowElement, currentRowIndex, visibleColumnIndex) {
        if (currentRowIndex === 0) {
            return;
        }
        const containerTopOffset = parseInt(this.verticalDisplayContainerElement.style.top, 10);
        if (!rowElement.previousElementSibling ||
            rowElement.previousElementSibling.offsetTop < Math.abs(containerTopOffset)) {
            this.grid.nativeElement.focus({ preventScroll: true });
            this.grid.verticalScrollContainer.scrollTo(currentRowIndex - 1);
            this.grid.verticalScrollContainer.onChunkLoad
                .pipe(first())
                .subscribe(() => {
                    const tag = rowElement.tagName.toLowerCase();
                    const rowSelector = this.getRowSelector();
                    if (tag === rowSelector || tag === 'igx-grid-summary-row') {
                        rowElement = this.getRowByIndex(currentRowIndex, tag);
                    } else {
                        rowElement = this.grid.nativeElement.querySelector(
                            `igx-grid-groupby-row[data-rowindex="${currentRowIndex}"]`);
                    }
                    this.focusPreviousElement(rowElement, visibleColumnIndex);
                });
        } else {
            this.focusPreviousElement(rowElement, visibleColumnIndex);
        }
    }

    protected focusPreviousElement(currentRowEl, visibleColumnIndex) {
        this.focusElem(currentRowEl.previousElementSibling, visibleColumnIndex);
    }

    public navigateDown(rowElement, currentRowIndex, visibleColumnIndex) {
        if (currentRowIndex === this.grid.verticalScrollContainer.igxForOf.length - 1) {
            return;
        }
        const rowHeight = this.grid.verticalScrollContainer.getSizeAt(currentRowIndex + 1);
        const containerHeight = this.grid.calcHeight ? Math.ceil(this.grid.calcHeight) : 0;
        const targetEndTopOffset = rowElement.nextElementSibling ?
            rowElement.nextElementSibling.offsetTop + rowHeight + parseInt(this.verticalDisplayContainerElement.style.top, 10) :
            containerHeight + rowHeight;
        this.grid.nativeElement.focus({ preventScroll: true });
        if (containerHeight && containerHeight < targetEndTopOffset) {
            const nextIndex = currentRowIndex + 1;
            this.grid.verticalScrollContainer.scrollTo(nextIndex);
            this.grid.verticalScrollContainer.onChunkLoad
                .pipe(first())
                .subscribe(() => {
                    rowElement = this.getNextRowByIndex(nextIndex);
                    this.focusElem(rowElement, visibleColumnIndex);
                });
        } else {
            this.focusNextElement(rowElement, visibleColumnIndex);
        }
    }

    protected focusElem(rowElement, visibleColumnIndex) {
        if (rowElement.tagName.toLowerCase() === 'igx-grid-groupby-row') {
            rowElement.focus();
        } else {
            const isSummaryRow = rowElement.tagName.toLowerCase() === 'igx-grid-summary-row';
            if (this.isColumnFullyVisible(visibleColumnIndex) && this.isColumnLeftFullyVisible(visibleColumnIndex)) {
                const cellSelector = this.getCellSelector(visibleColumnIndex, isSummaryRow);
                const cell = rowElement.querySelector(`${cellSelector}[data-visibleIndex="${visibleColumnIndex}"]`);
                cell.focus();
                return cell;
            }
            this.grid.nativeElement.focus({ preventScroll: true });
            this.performHorizontalScrollToCell(parseInt(
            rowElement.getAttribute('data-rowindex'), 10), visibleColumnIndex, isSummaryRow);
        }
    }

    protected focusNextElement(rowElement, visibleColumnIndex) {
        return  this.focusElem(rowElement.nextElementSibling, visibleColumnIndex);
    }

    public goToFirstCell() {
        const verticalScroll = this.grid.verticalScrollContainer.getVerticalScroll();
        const horizontalScroll = this.grid.dataRowList.first.virtDirRow.getHorizontalScroll();
        if (verticalScroll.scrollTop === 0) {
            this.onKeydownHome(this.grid.dataRowList.first.index);
        } else {
            if (!horizontalScroll.clientWidth || parseInt(horizontalScroll.scrollLeft, 10) <= 1 || this.grid.pinnedColumns.length) {
                this.navigateTop(0);
            } else {
                this.horizontalScroll(this.grid.dataRowList.first.index).scrollTo(0);
                this.grid.parentVirtDir.onChunkLoad
                    .pipe(first())
                    .subscribe(() => {
                        this.navigateTop(0);
                    });
            }
        }
    }

    public goToLastCell() {
        const verticalScroll = this.grid.verticalScrollContainer.getVerticalScroll();
        if (verticalScroll.scrollHeight === 0 ||
            verticalScroll.scrollTop === verticalScroll.scrollHeight - this.grid.verticalScrollContainer.igxForContainerSize) {
            const rows = this.getAllRows();
            const rowIndex = parseInt(rows[rows.length - 1].getAttribute('data-rowIndex'), 10);
            this.onKeydownEnd(rowIndex);
        } else {
            this.grid.verticalScrollContainer.scrollTo(this.grid.verticalScrollContainer.igxForOf.length - 1);
            this.grid.verticalScrollContainer.onChunkLoad
                .pipe(first()).subscribe(() => {
                    const rows = this.getAllRows();
                    if (rows.length > 0) {
                        const rowIndex = parseInt(rows[rows.length - 1].getAttribute('data-rowIndex'), 10);
                        this.onKeydownEnd(rowIndex);
                    }
                });
        }
    }

    public goToLastBodyElement() {
        const verticalScroll = this.grid.verticalScrollContainer.getVerticalScroll();
        if (verticalScroll.scrollHeight === 0 ||
            verticalScroll.scrollTop === verticalScroll.scrollHeight - this.grid.verticalScrollContainer.igxForContainerSize) {
            const rowIndex = this.grid.verticalScrollContainer.igxForOf.length - 1;
            const row = this.grid.nativeElement.querySelector(`[data-rowindex="${rowIndex}"]`);
            if (row && row.tagName.toLowerCase() === 'igx-grid-groupby-row') {
                row.focus();
                return;
            }
            const isSummary = (row && row.tagName.toLowerCase() === 'igx-grid-summary-row') ? true : false;
            this.onKeydownEnd(rowIndex, isSummary);
        } else {
            this.grid.verticalScrollContainer.scrollTo(this.grid.verticalScrollContainer.igxForOf.length - 1);
            this.grid.verticalScrollContainer.onChunkLoad
                .pipe(first()).subscribe(() => {
                    const rowIndex = this.grid.verticalScrollContainer.igxForOf.length - 1;
                    const row = this.grid.nativeElement.querySelector(`[data-rowindex="${rowIndex}"]`);
                    if (row && row.tagName.toLowerCase() === 'igx-grid-groupby-row') {
                        row.focus();
                        return;
                    }
                    const isSummary = (row && row.tagName.toLowerCase() === 'igx-grid-summary-row') ? true : false;
                    this.onKeydownEnd(rowIndex, isSummary);
                });
        }
    }

    public performTab(currentRowEl, rowIndex, visibleColumnIndex, isSummaryRow = false) {
        if (isSummaryRow && rowIndex === 0 &&
            this.grid.unpinnedColumns[this.grid.unpinnedColumns.length - 1].visibleIndex === visibleColumnIndex) {
                return;

        }
        if (this.grid.unpinnedColumns[this.grid.unpinnedColumns.length - 1].visibleIndex === visibleColumnIndex) {
            if (this.isRowInEditMode(rowIndex)) {
                this.grid.rowEditTabs.first.element.nativeElement.focus();
                return;
            }
            const rowEl = this.grid.rowList.find(row => row.index === rowIndex + 1) ?
                this.grid.rowList.find(row => row.index === rowIndex + 1) :
                this.grid.summariesRowList.find(row => row.index === rowIndex + 1);
            if (rowIndex === this.grid.verticalScrollContainer.igxForOf.length - 1 && this.grid.rootSummariesEnabled) {
                this.onKeydownHome(0, true);
                return;
            }
            if (rowEl) {
                this.navigateDown(currentRowEl, rowIndex, 0);
            }
        } else {
            const cell = this.getCellElementByVisibleIndex(rowIndex, visibleColumnIndex, isSummaryRow);
            if (cell) {
                if (this.grid.rowEditable && this.isRowInEditMode(rowIndex)) {
                    this.moveNextEditable(cell, rowIndex, visibleColumnIndex);
                    return;
                }
                this.onKeydownArrowRight(cell, rowIndex, visibleColumnIndex, isSummaryRow);
            }
        }
    }

    public moveFocusToFilterCell(toStart?: boolean) {
        const columns = this.grid.filteringService.unpinnedFilterableColumns;
        const targetIndex = toStart ? 0 : columns.length - 1;
        const visibleIndex = columns[targetIndex].visibleIndex;
        const isVisible = toStart ? this.isColumnLeftFullyVisible(visibleIndex) : this.isColumnFullyVisible(visibleIndex);
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

        if (prevFilterableIndex >= 0 && visibleIndex > 0 && !this.isColumnLeftFullyVisible(prevVisibleIndex) && !column.pinned) {
            eventArgs.preventDefault();
            this.grid.filteringService.scrollToFilterCell(prevColumn, false);
        }
    }

    public navigateNextFilterCell(column: IgxColumnComponent, eventArgs) {
        const cols = this.grid.filteringService.unpinnedFilterableColumns;
        const nextFilterableIndex = cols.indexOf(column) + 1;
        if (nextFilterableIndex >= this.grid.filteringService.unpinnedFilterableColumns.length) {
            // next is not filter cell
            if (!this.grid.filteringService.grid.filteredData || this.grid.filteringService.grid.filteredData.length > 0) {
                if (this.grid.filteringService.grid.rowList.filter(row => row instanceof IgxGridGroupByRowComponent).length > 0) {
                    eventArgs.stopPropagation();
                    return;
                }
                this.goToFirstCell();
            }
            eventArgs.preventDefault();
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

    private prevElement(element, cell) {
        if (this.grid.hasColumnLayouts) {
            const columnLayout = cell.column.parent;

            const currentColStart = cell.colStart;
            const currentRowStart = cell.rowStart;

            // previous element is from the same layout
            let prevElementColumn = columnLayout.children
            .find(c => (c.colEnd === currentColStart || c.colStart + c.gridColumnSpan === currentColStart ) &&
                c.rowStart <= currentRowStart &&
                (currentRowStart < c.rowEnd || currentRowStart < c.rowStart + c.gridRowSpan));

            let columnIndex = columnLayout.children.toArray().indexOf(prevElementColumn);
            let prevElement = element.parentElement.children[columnIndex];

            if (!prevElement) {
                // try extracting first element from the previous layout
                const currentLayoutIndex = this.grid.columns.filter(c => c.columnLayout).indexOf(columnLayout);
                const prevLayout = this.grid.columns.filter(c => c.columnLayout)[currentLayoutIndex - 1];
                if (!prevLayout) {
                    // reached the end
                    return null;
                }
                const layoutSize = prevLayout.getChildColumnSizes(prevLayout.children).length;
                // first element is from the next layout
                prevElementColumn = prevLayout.children
                .find(c => (c.colEnd === layoutSize + 1 || c.colStart + c.gridColumnSpan === layoutSize + 1) &&
                    c.rowStart <= currentRowStart &&
                    (currentRowStart < c.rowEnd || currentRowStart < c.rowStart + c.gridRowSpan));

                columnIndex = prevLayout.children.toArray().indexOf(prevElementColumn);
                prevElement = cell.nativeElement.parentElement.previousElementSibling.children[columnIndex];
            }

            return prevElement;
        } else {
            return element.previousElementSibling;
        }
    }

    private nextElement(element, cell) {
        if (this.grid.hasColumnLayouts) {
            const columnLayout = cell.column.parent;
            const layoutSize = columnLayout.getChildColumnSizes(columnLayout.children).length;

            const currentColEnd = cell.colEnd || cell.colStart + cell.gridColumnSpan;
            const currentRowStart = cell.rowStart;

            // next element is from the same layout
            let nextElementColumn = columnLayout.children.find(c => c.colStart === currentColEnd &&
                c.rowStart <= currentRowStart &&
                (currentRowStart < c.rowEnd || currentRowStart < c.rowStart + c.gridRowSpan));

            let columnIndex = columnLayout.children.toArray().indexOf(nextElementColumn);
            let nextElement = element.parentElement.children[columnIndex];

            if (!nextElement) {
                // try extracting first element from the next layout
                const currentLayoutIndex = this.grid.columns.filter(c => c.columnLayout).indexOf(columnLayout);
                const nextLayout = this.grid.columns.filter(c => c.columnLayout)[currentLayoutIndex + 1];
                if (!nextLayout) {
                    // reached the end
                    return null;
                }
                // first element is from the next layout
                nextElementColumn = nextLayout.children.find(c => c.colStart === 1 &&
                    c.rowStart <= currentRowStart &&
                    (currentRowStart < c.rowEnd || currentRowStart < c.rowStart + c.gridRowSpan));

                columnIndex = nextLayout.children.toArray().indexOf(nextElementColumn);
                nextElement = cell.nativeElement.parentElement.nextElementSibling.children[columnIndex];
            }

            return nextElement;
        } else {
            return element.nextElementSibling;
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

    public performShiftTabKey(currentRowEl, rowIndex, visibleColumnIndex, isSummary = false) {
        if (isSummary && rowIndex === 0 && visibleColumnIndex === 0 && this.grid.rowList.length) {
            this.goToLastBodyElement();
            return;
        }
        if (visibleColumnIndex === 0) {
            if (this.isRowInEditMode(rowIndex)) {
                this.grid.rowEditTabs.last.element.nativeElement.focus();
                return;
            }
            if (rowIndex === 0 && this.grid.allowFiltering && this.grid.filterMode === FilterMode.quickFilter) {
                this.moveFocusToFilterCell();
            } else {
                this.navigateUp(currentRowEl, rowIndex,
                    this.grid.unpinnedColumns[this.grid.unpinnedColumns.length - 1].visibleIndex);
            }
        } else {
            const cell = this.getCellElementByVisibleIndex(rowIndex, visibleColumnIndex, isSummary);
            if (cell) {
                if (this.grid.rowEditable && this.isRowInEditMode(rowIndex)) {
                    this.movePreviousEditable(rowIndex, visibleColumnIndex);
                    return;
                }
                this.onKeydownArrowLeft(cell, rowIndex, visibleColumnIndex, isSummary);
            }
        }
    }

    private performHorizontalScrollToCell(rowIndex, visibleColumnIndex, isSummary = false, cell?: IgxGridCellComponent) {
        const unpinnedIndex = this.getColumnUnpinnedIndex(visibleColumnIndex, cell);
        this.grid.parentVirtDir.onChunkLoad
            .pipe(first())
            .subscribe(() => {
                if (this.grid.hasColumnLayouts) {
                    const next = this.nextElement(cell.nativeElement, cell);
                    if (next) {
                        next.focus({ preventScroll: true });
                    }
                } else {
                    this.getCellElementByVisibleIndex(rowIndex, visibleColumnIndex, isSummary).focus({ preventScroll: true });
                }
            });
        this.horizontalScroll(rowIndex).scrollTo(unpinnedIndex);
    }
    protected getRowByIndex(index, selector = this.getRowSelector()) {
        return this.grid.nativeElement.querySelector(
                `${selector}[data-rowindex="${index}"]`);
    }

    protected getNextRowByIndex(nextIndex) {
        return this.grid.tbody.nativeElement.querySelector(
            `[data-rowindex="${nextIndex}"]`);
    }

    private getAllRows() {
        const selector = this.getRowSelector();
        return this.grid.nativeElement.querySelectorAll(selector);
    }

    protected getCellSelector(visibleIndex?: number, isSummary = false): string {
        return isSummary ? 'igx-grid-summary-cell' : 'igx-grid-cell';
    }

    protected getRowSelector(): string {
        return 'igx-grid-row';
    }
}
