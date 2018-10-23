import { Injectable } from '@angular/core';
import { IgxGridComponent } from './grid.component';
import { first } from 'rxjs/operators';
import { IgxColumnComponent } from './column.component';

enum MoveDirection {
    LEFT = 'left',
    RIGHT = 'right'
}
@Injectable()
export class IgxGridNavigationService {
    public grid: IgxGridComponent;

    get displayContainerWidth() {
        return parseInt(this.grid.parentVirtDir.dc.instance._viewContainer.element.nativeElement.offsetWidth, 10);
    }

    get displayContainerScrollLeft() {
        return parseInt(this.grid.parentVirtDir.getHorizontalScroll().scrollLeft, 10);
    }

    get verticalDisplayContainerElement() {
        return this.grid.verticalScrollContainer.dc.instance._viewContainer.element.nativeElement;
    }

    public horizontalScroll(rowIndex) {
        return this.grid.dataRowList.find((row) => row.index === rowIndex).virtDirRow;
    }

    public getColumnUnpinnedIndex(visibleColumnIndex: number) {
        const column = this.grid.unpinnedColumns.find((col) => !col.columnGroup && col.visibleIndex === visibleColumnIndex);
        return this.grid.pinnedColumns.length ? this.grid.unpinnedColumns.filter((c) => !c.columnGroup).indexOf(column) :
            visibleColumnIndex;

    }

    public isColumnFullyVisible(visibleColumnIndex: number) {
        const horizontalScroll = this.grid.dataRowList.first.virtDirRow.getHorizontalScroll();
        if (!horizontalScroll.clientWidth ||
            this.grid.columnList.filter(c => !c.columnGroup).find((column) => column.visibleIndex === visibleColumnIndex).pinned) {
            return true;
        }
        const index = this.getColumnUnpinnedIndex(visibleColumnIndex);
        return this.displayContainerWidth >=
            this.grid.dataRowList.first.virtDirRow.getColumnScrollLeft(index + 1) -
            this.displayContainerScrollLeft;
    }

    public isColumnPartiallyVisible(visibleColumnIndex) {
        const index = this.getColumnUnpinnedIndex(visibleColumnIndex);
        // getColumnScrollLeft(index) gives the left border of the cell and getColumnScrollLeft(index + 1) gives the right border
        return (this.displayContainerWidth >
            this.grid.dataRowList.first.virtDirRow.getColumnScrollLeft(index) -
            this.displayContainerScrollLeft) &&
            (this.displayContainerWidth < this.grid.dataRowList.first.virtDirRow.getColumnScrollLeft(index + 1) -
                this.displayContainerScrollLeft);
    }

    public isColumnLeftFullyVisible(visibleColumnIndex) {
        const horizontalScroll = this.grid.dataRowList.first.virtDirRow.getHorizontalScroll();
        if (!horizontalScroll.clientWidth ||
            this.grid.columnList.filter(c => !c.columnGroup).find((column) => column.visibleIndex === visibleColumnIndex).pinned) {
            return true;
        }
        const index = this.getColumnUnpinnedIndex(visibleColumnIndex);
        return this.displayContainerScrollLeft <=
            this.grid.dataRowList.first.virtDirRow.getColumnScrollLeft(index);
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

    public isColumnLeftPartiallyVisible(visibleColumnIndex) {
        const index = this.getColumnUnpinnedIndex(visibleColumnIndex + 1);
        return (!this.isColumnLeftFullyVisible(visibleColumnIndex)) && this.displayContainerScrollLeft <
            this.grid.dataRowList.first.virtDirRow.getColumnScrollLeft(index);
    }

    public getCellElementByVisibleIndex(rowIndex, visibleColumnIndex) {
        return this.grid.nativeElement.querySelector(
            `igx-grid-cell[data-rowindex="${rowIndex}"][data-visibleIndex="${visibleColumnIndex}"]`);
    }

    public getScrollToNextEditableColumn(startIndex, endIndex) {
        let amount = 0;
        this.gridOrderedColumns.filter(e => e.visibleIndex > startIndex && e.visibleIndex <= endIndex)
        .map(e => {
            amount += parseInt(e.width, 10);
        });
        return amount;
    }

    public onKeydownArrowRight(element, rowIndex, visibleColumnIndex) {
        if (this.grid.unpinnedColumns[this.grid.unpinnedColumns.length - 1].visibleIndex === visibleColumnIndex) {
            return;
        }
        if (this.isColumnFullyVisible(visibleColumnIndex + 1)) { // if next column is fully visible or is pinned
            if (element.classList.contains('igx-grid__th--pinned-last')) {
                if (this.isColumnLeftFullyVisible(visibleColumnIndex + 1)) {
                    element.nextElementSibling.firstElementChild.focus();
                } else {
                    this.grid.nativeElement.focus({preventScroll: true});
                    this.grid.parentVirtDir.onChunkLoad
                        .pipe(first())
                        .subscribe(() => {
                            element.nextElementSibling.firstElementChild.focus();
                        });
                this.grid.parentVirtDir.getHorizontalScroll().scrollLeft = 0;
                }
            } else {
                element.nextElementSibling.focus();
            }
        } else {
            let scrollAmount = 0;
            this.grid.nativeElement.focus({preventScroll: true});
            if (this.isColumnPartiallyVisible(visibleColumnIndex + 1)) { // if next column is not partially visible
                scrollAmount = this.calcPartialScroll(rowIndex, visibleColumnIndex + 1);
            } else if (this.isColumnPartiallyVisible(visibleColumnIndex)) { // if current column is partially visible
                scrollAmount = this.calcPartialScroll(rowIndex, visibleColumnIndex) +
                    parseInt(this.grid.columnList.filter(c => !c.columnGroup)
                        .find((column) => column.visibleIndex === visibleColumnIndex + 1).width, 10);
            } else { // If next column is not visible
                scrollAmount = parseInt(this.grid.columnList.filter(c => !c.columnGroup)
                    .find((column) => column.visibleIndex === visibleColumnIndex + 1).width, 10);
            }
            this.grid.parentVirtDir.onChunkLoad
                .pipe(first())
                .subscribe(() => {
                    const currentCell = this.getCellElementByVisibleIndex(rowIndex, visibleColumnIndex);
                    currentCell.nextElementSibling.focus();
                });
            this.grid.parentVirtDir.getHorizontalScroll().scrollLeft += scrollAmount;
        }
    }

    public onKeydownArrowLeft(element, rowIndex, visibleColumnIndex) {
        if (visibleColumnIndex === 0) {
            return;
        }
        const index = this.getColumnUnpinnedIndex(visibleColumnIndex - 1);
        if (!element.previousElementSibling && this.grid.pinnedColumns.length && index === - 1) {
            element.parentNode.previousElementSibling.focus();
        } else if (!this.isColumnLeftFullyVisible(visibleColumnIndex - 1)) {
            this.grid.nativeElement.focus({preventScroll: true});
            this.grid.parentVirtDir.onChunkLoad
                .pipe(first())
                .subscribe(() => {
                    const currentCell = this.getCellElementByVisibleIndex(rowIndex, visibleColumnIndex);
                    currentCell.previousElementSibling.focus();
                });
            this.grid.parentVirtDir.getHorizontalScroll().scrollLeft =
                this.grid.dataRowList.first.virtDirRow.getColumnScrollLeft(index);
        } else {
            element.previousElementSibling.focus();
        }

    }

    public movePreviousEditable(element, rowIndex, visibleColumnIndex) {
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
            this.grid.nativeElement.focus();
            this.grid.parentVirtDir.onChunkLoad
                .pipe(first())
                .subscribe(() => {
                    this.getCellElementByVisibleIndex(rowIndex, editableIndex).focus(); // focus after scroll
                });
            this.grid.parentVirtDir.getHorizontalScroll().scrollLeft =
                this.grid.dataRowList.first.virtDirRow.getColumnScrollLeft(this.getColumnUnpinnedIndex(editableIndex));
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
            if (element.classList.contains('igx-grid__th--pinned-last')) { // If this is pinned
                if (this.isColumnLeftFullyVisible(editableIndex)) { // If next column is fully visible LEFT
                    this.getCellElementByVisibleIndex(rowIndex, editableIndex).focus(); // focus
                } else { // if NOT fully visible, perform scroll
                    this.grid.parentVirtDir.onChunkLoad
                    .pipe(first())
                    .subscribe(() => {
                        this.getCellElementByVisibleIndex(rowIndex, editableIndex).focus(); // Focus cell when loaded v
                    });
                    this.grid.dataRowList.first.virtDirRow.scrollTo(this.getColumnUnpinnedIndex(editableIndex)); // scroll to cell ^
                }
            } else { // cell is next cell
                this.getCellElementByVisibleIndex(rowIndex, editableIndex).focus();
            }
        } else {
            let scrollAmount = 0;
            this.grid.nativeElement.focus();
            if (this.isColumnPartiallyVisible(editableIndex)) { // if next column is partially visible
                scrollAmount = this.calcPartialScroll(rowIndex, editableIndex); // scroll by nextColumn.width
            } else if (this.isColumnPartiallyVisible(visibleColumnIndex)) { // if this column is partially visible, scroll both
                // scroll by currentCell.width + width of cells between editable + editableCell.width
                scrollAmount = this.calcPartialScroll(rowIndex, visibleColumnIndex) +
                this.getScrollToNextEditableColumn(visibleColumnIndex, editableIndex);
            } else { // If next column is not visible at all
                // scroll by width of cells between this & editable + editableCell.width
                scrollAmount = this.getScrollToNextEditableColumn(visibleColumnIndex, editableIndex);
            }
            this.grid.parentVirtDir.onChunkLoad // perform scroll
                .pipe(first())
                .subscribe(() => {
                    this.getCellElementByVisibleIndex(rowIndex, editableIndex).focus(); // after scroll, focus target
                });
            this.grid.parentVirtDir.getHorizontalScroll().scrollLeft += scrollAmount; // scroll by amount
        }
    }
    public onKeydownHome(rowIndex) {
        const rowElement = this.grid.dataRowList.find((row) => row.index === rowIndex).nativeElement;
        const firstCell = rowElement.querySelector('igx-grid-cell');
        if (this.grid.pinnedColumns.length || this.displayContainerScrollLeft === 0) {
            firstCell.focus();
        } else {
            this.grid.parentVirtDir.onChunkLoad
                .pipe(first())
                .subscribe(() => {
                    this.grid.nativeElement.focus({preventScroll: true});
                    firstCell.focus();
                });
            this.horizontalScroll(rowIndex).scrollTo(0);
        }
    }

    public onKeydownEnd(rowIndex) {
        const index = this.grid.unpinnedColumns[this.grid.unpinnedColumns.length - 1].visibleIndex;
        const rowElement = this.grid.dataRowList.find((row) => row.index === rowIndex).nativeElement;
        const allCells = rowElement.querySelectorAll('igx-grid-cell');
        const lastCell = allCells[allCells.length - 1];
        if (this.isColumnFullyVisible(index)) {
            lastCell.focus();
        } else {
            this.grid.parentVirtDir.onChunkLoad
                .pipe(first())
                .subscribe(() => {
                    this.grid.nativeElement.focus({preventScroll: true});
                    lastCell.focus();
                });
            this.horizontalScroll(rowIndex).scrollTo(this.getColumnUnpinnedIndex(index));
        }
    }

    public navigateTop(visibleColumnIndex) {
        const verticalScroll = this.grid.verticalScrollContainer.getVerticalScroll();
        if (verticalScroll.scrollTop === 0) {
            const cells = this.grid.nativeElement.querySelectorAll(
                `igx-grid-cell[data-visibleIndex="${visibleColumnIndex}"]`);
            cells[0].focus();
        } else {
            this.grid.nativeElement.focus({preventScroll: true});
            this.grid.verticalScrollContainer.scrollTo(0);
            this.grid.verticalScrollContainer.onChunkLoad
                .pipe(first()).subscribe(() => {
                    const cells = this.grid.nativeElement.querySelectorAll(
                        `igx-grid-cell[data-visibleIndex="${visibleColumnIndex}"]`);
                if (cells.length > 0) { cells[0].focus(); }
                });
        }
    }

    public navigateBottom(visibleColumnIndex) {
        const verticalScroll = this.grid.verticalScrollContainer.getVerticalScroll();
        if (verticalScroll.scrollTop === verticalScroll.scrollHeight - this.grid.verticalScrollContainer.igxForContainerSize) {
            const cells = this.grid.nativeElement.querySelectorAll(
                `igx-grid-cell[data-visibleIndex="${visibleColumnIndex}"]`);
            cells[cells.length - 1].focus();
        } else {
            this.grid.nativeElement.focus({preventScroll: true});
            this.grid.verticalScrollContainer.scrollTo(this.grid.verticalScrollContainer.igxForOf.length - 1);
            this.grid.verticalScrollContainer.onChunkLoad
                .pipe(first()).subscribe(() => {
                    const cells = this.grid.nativeElement.querySelectorAll(
                        `igx-grid-cell[data-visibleIndex="${visibleColumnIndex}"]`);
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
                    if (rowElement.tagName.toLowerCase() === 'igx-grid-row') {
                        rowElement = this.grid.nativeElement.querySelector(
                            `igx-grid-row[data-rowindex="${currentRowIndex}"]`);
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

    private focusPreviousElement(currentRowEl, visibleColumnIndex) {
        if (currentRowEl.previousElementSibling.tagName.toLowerCase() === 'igx-grid-groupby-row') {
            currentRowEl.previousElementSibling.focus();
        } else {
            if (this.isColumnFullyVisible(visibleColumnIndex) && this.isColumnLeftFullyVisible(visibleColumnIndex)) {
                currentRowEl.previousElementSibling.querySelector(`igx-grid-cell[data-visibleIndex="${visibleColumnIndex}"]`).focus();
                return;
            }
            this.grid.nativeElement.focus({preventScroll: true});
            this.performHorizontalScrollToCell(currentRowEl.previousElementSibling, visibleColumnIndex);
            }
        }

    public navigateDown(rowElement, currentRowIndex, visibleColumnIndex) {
        if (!rowElement.nextElementSibling) {
            return;
        }
        const rowHeight = this.grid.verticalScrollContainer.getSizeAt(currentRowIndex + 1);
        const containerHeight = this.grid.calcHeight ? Math.ceil(this.grid.calcHeight) : null;
        const targetEndTopOffset = rowElement.nextElementSibling.offsetTop + rowHeight +
            parseInt(this.verticalDisplayContainerElement.style.top, 10);
        if (containerHeight && containerHeight < targetEndTopOffset) {
            this.grid.nativeElement.focus({preventScroll: true});
            const scrollAmount = targetEndTopOffset - containerHeight;
            this.grid.verticalScrollContainer.addScrollTop(scrollAmount);
            this.grid.verticalScrollContainer.onChunkLoad
                .pipe(first())
                .subscribe(() => {
                    if (rowElement.tagName.toLowerCase() === 'igx-grid-row') {
                        rowElement = this.grid.nativeElement.querySelector(
                            `igx-grid-row[data-rowindex="${currentRowIndex}"]`);
                    } else {
                        rowElement = rowElement = this.grid.nativeElement.querySelector(
                            `igx-grid-groupby-row[data-rowindex="${currentRowIndex}"]`);
                    }
                    this.focusNextElement(rowElement, visibleColumnIndex);
                });
        } else {
            this.grid.nativeElement.focus({preventScroll: true});
            this.focusNextElement(rowElement, visibleColumnIndex);
        }
    }

    private focusNextElement(rowElement, visibleColumnIndex) {
        if (rowElement.nextElementSibling.tagName.toLowerCase() === 'igx-grid-groupby-row') {
            rowElement.nextElementSibling.focus();
        } else {
            if (this.isColumnFullyVisible(visibleColumnIndex) && this.isColumnLeftFullyVisible(visibleColumnIndex)) {
                rowElement.nextElementSibling.querySelector(`igx-grid-cell[data-visibleIndex="${visibleColumnIndex}"]`).focus();
                return;
            }
            this.performHorizontalScrollToCell(rowElement.nextElementSibling, visibleColumnIndex);
            }
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
        if (verticalScroll.scrollTop === verticalScroll.scrollHeight - this.grid.verticalScrollContainer.igxForContainerSize) {
            const rows = this.grid.nativeElement.querySelectorAll('igx-grid-row');
            const rowIndex = parseInt(rows[rows.length - 1].getAttribute('data-rowIndex'), 10);
            this.onKeydownEnd(rowIndex);
        } else {
            this.grid.verticalScrollContainer.scrollTo(this.grid.verticalScrollContainer.igxForOf.length - 1);
            this.grid.verticalScrollContainer.onChunkLoad
                .pipe(first()).subscribe(() => {
                    const rows = this.grid.nativeElement.querySelectorAll('igx-grid-row');
                if (rows.length > 0) {
                    const rowIndex = parseInt(rows[rows.length - 1].getAttribute('data-rowIndex'), 10);
                    this.onKeydownEnd(rowIndex);
                }
                });
        }
    }

    public performTab(currentRowEl, rowIndex, visibleColumnIndex) {
        if (this.grid.unpinnedColumns[this.grid.unpinnedColumns.length - 1].visibleIndex === visibleColumnIndex) {
            if (this.isRowInEditMode(rowIndex)) {
                this.grid.rowEditTabs.first.element.nativeElement.focus();
                return;
            }
            if (this.grid.rowList.find(row => row.index === rowIndex + 1)) {
                this.navigateDown(currentRowEl, rowIndex, 0);
            }
        } else {
            const cell = currentRowEl.querySelector(`igx-grid-cell[data-visibleIndex="${visibleColumnIndex}"]`);
            if (cell) {
                if (this.grid.rowEditable && this.isRowInEditMode(rowIndex)) {
                    this.moveNextEditable(cell, rowIndex, visibleColumnIndex);
                    return;
                }
                this.onKeydownArrowRight(cell, rowIndex, visibleColumnIndex);
            }
        }
    }

    public performShiftTabKey(currentRowEl, rowIndex, visibleColumnIndex) {
        if (visibleColumnIndex === 0) {
                if (this.isRowInEditMode(rowIndex)) {
                    this.grid.rowEditTabs.last.element.nativeElement.focus();
                    return;
                }
                this.navigateUp(currentRowEl, rowIndex,
                    this.grid.unpinnedColumns[this.grid.unpinnedColumns.length - 1].visibleIndex);
        } else {
            const cell = currentRowEl.querySelector(`igx-grid-cell[data-visibleIndex="${visibleColumnIndex}"]`);
            if (cell) {
                if (this.grid.rowEditable && this.isRowInEditMode(rowIndex)) {
                    this.movePreviousEditable(cell, rowIndex, visibleColumnIndex);
                    return;
                }
                this.onKeydownArrowLeft(cell, rowIndex, visibleColumnIndex);
            }
        }
    }

    private performHorizontalScrollToCell(rowElement, visibleColumnIndex) {
        const unpinnedIndex = this.getColumnUnpinnedIndex(visibleColumnIndex);
        const cells = rowElement.querySelectorAll(`igx-grid-cell`);
        const firstVisibleIndex = parseInt(cells[0].getAttribute('data-visibleIndex'), 10);
        const lastVisibleIndex =  parseInt(cells[cells.length - 1].getAttribute('data-visibleIndex'), 10);
        const middle = (firstVisibleIndex + lastVisibleIndex) / 2;
        this.grid.parentVirtDir.onChunkLoad
        .pipe(first())
        .subscribe(() => {
            rowElement.querySelector(`igx-grid-cell[data-visibleIndex="${visibleColumnIndex}"]`).focus();
        });
        if (middle >= visibleColumnIndex && !this.isColumnLeftFullyVisible(visibleColumnIndex)) {
            this.grid.parentVirtDir.getHorizontalScroll().scrollLeft =
            this.grid.dataRowList.first.virtDirRow.getColumnScrollLeft(unpinnedIndex);
        } else if (middle < visibleColumnIndex && !this.isColumnFullyVisible(visibleColumnIndex)) {
            this.grid.parentVirtDir.getHorizontalScroll().scrollLeft =
            (this.grid.dataRowList.first.virtDirRow.getColumnScrollLeft(unpinnedIndex + 1) -
            this.displayContainerWidth);
        }
    }

    private calcPartialScroll(rowIndex, visibleColumnIndex) {
        const index = this.getColumnUnpinnedIndex(visibleColumnIndex);
        return this.horizontalScroll(rowIndex).getColumnScrollLeft(index) +
            parseInt(this.grid.columnList.filter(c => !c.columnGroup)
            .find((column) => column.visibleIndex === visibleColumnIndex).width, 10) -
            this.displayContainerWidth - this.horizontalScroll(rowIndex).getHorizontalScroll().scrollLeft;
    }
}
