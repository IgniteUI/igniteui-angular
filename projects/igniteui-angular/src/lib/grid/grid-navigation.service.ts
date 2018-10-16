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
        return this.grid.pinnedColumns.length ?
            this.grid.unpinnedColumns.filter((c) => !c.columnGroup).indexOf(column) :
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

    public isColumnLeftPartiallyVisible(visibleColumnIndex) {
        const index = this.getColumnUnpinnedIndex(visibleColumnIndex + 1);
        return (!this.isColumnLeftFullyVisible(visibleColumnIndex)) && this.displayContainerScrollLeft <
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

    public onKeydownArrowRight(element, rowIndex, visibleColumnIndex) {
        if (this.grid.unpinnedColumns[this.grid.unpinnedColumns.length - 1].visibleIndex === visibleColumnIndex) {
            return;
        }
        let addedIndex = 0;
        const isRowInEditMode = this.isRowInEditMode(rowIndex);
        const rowInEditMode = this.grid.rowInEditMode;
        const inEditMode = this.grid.rowEditable &&
            (rowInEditMode ? rowInEditMode.cells.find(c => c.visibleColumnIndex === visibleColumnIndex).inEditMode : false);
        if (inEditMode) {
            addedIndex = this.isColumnEditable(visibleColumnIndex + 1) ?
                0 :
                this.findNextEditable(MoveDirection.RIGHT, visibleColumnIndex + 1);
        }
        // if next column is fully visible or is pinned
        if (addedIndex === -1 && this.grid.rowEditTabs) {
            this.grid.rowEditTabs.first.element.nativeElement.focus();
            return;
        }
        const targetIndex = visibleColumnIndex + 1 + addedIndex;
        if (this.isColumnFullyVisible(targetIndex)) {
            if (element.classList.contains('igx-grid__th--pinned-last')) {
                if (isRowInEditMode) {
                    const target = this.grid.nativeElement.querySelector(
                        `igx-grid-cell[data-rowindex="${rowIndex}"][data-visibleIndex="${targetIndex}"]`);
                    if (target) {
                        target.focus();
                    } else {
                        this.grid.parentVirtDir.onChunkLoad
                        .pipe(first())
                        .subscribe(() => {
                            this.grid.nativeElement.querySelector(
                                `igx-grid-cell[data-rowindex="${rowIndex}"][data-visibleIndex="${targetIndex}"]`).focus();
                        });
                        this.grid.parentVirtDir.getHorizontalScroll().scrollLeft =
                        this.grid.dataRowList.first.virtDirRow.getColumnScrollLeft(this.getColumnUnpinnedIndex(targetIndex));
                    }
                } else if (this.isColumnLeftFullyVisible(targetIndex + 1)) {
                    element.nextElementSibling.firstElementChild.focus();
                } else {
                    this.grid.parentVirtDir.getHorizontalScroll().scrollLeft = 0;
                    this.grid.parentVirtDir.onChunkLoad
                        .pipe(first())
                        .subscribe(() => {
                            element.nextElementSibling.firstElementChild.focus();
                        });
                }
            } else {
                const targetElement = isRowInEditMode ?
                    this.grid.nativeElement.querySelector(
                        `igx-grid-cell[data-rowindex="${rowIndex}"][data-visibleIndex="${targetIndex}"]`) :
                    element.nextElementSibling;
                targetElement.focus();
            }
        } else {
            let scrollAmount = 0;
            (document.activeElement as any).blur();
            if (this.isColumnPartiallyVisible(targetIndex)) { // if next column is not partially visible
                scrollAmount = this.calcPartialScroll(rowIndex, targetIndex);
            } else if (this.isColumnPartiallyVisible(visibleColumnIndex)) { // if current column is partially visible
                scrollAmount = this.calcPartialScroll(rowIndex, visibleColumnIndex) +
                    parseInt(this.grid.columnList.filter(c => !c.columnGroup)
                        .find((column) => column.visibleIndex === targetIndex).width, 10);
            } else { // If next column is not visible
                if (isRowInEditMode) {
                    scrollAmount = this.grid.dataRowList.first.virtDirRow.getColumnScrollLeft(this.getColumnUnpinnedIndex(targetIndex));
                } else {
                    scrollAmount = parseInt(this.grid.columnList.filter(c => !c.columnGroup)
                        .find((column) => column.visibleIndex === targetIndex).width, 10);
                }
            }

            this.grid.parentVirtDir.onChunkLoad
                .pipe(first())
                .subscribe(() => {
                    const currentCell = !this.isRowInEditMode(rowIndex) ?
                        this.grid.nativeElement.querySelector(
                            `igx-grid-cell[data-rowindex="${rowIndex}"][data-visibleIndex="${visibleColumnIndex}"]`).nextElementSibling :
                        this.grid.nativeElement.querySelector(
                            `igx-grid-cell[data-rowindex="${rowIndex}"][data-visibleIndex="${targetIndex}"]`);
                    currentCell.focus();
                });
            this.grid.parentVirtDir.getHorizontalScroll().scrollLeft += scrollAmount;
        }
    }

    public onKeydownArrowLeft(element, rowIndex, visibleColumnIndex) {
        if (visibleColumnIndex === 0) {
            return;
        }
        let addedIndex = 0;
        const rowInEditMode = this.grid.rowInEditMode;
        const inEditMode = this.grid.rowEditable &&
            (rowInEditMode ? rowInEditMode.cells.find(c => c.visibleColumnIndex === visibleColumnIndex).inEditMode : false);
        if (inEditMode) {
            addedIndex = this.isColumnEditable(visibleColumnIndex - 1) ?
                0 :
                this.findNextEditable(MoveDirection.LEFT, visibleColumnIndex - 1);
        }
        if (addedIndex === -1) {
            this.grid.rowEditTabs.last.element.nativeElement.focus();
            return;
        }
        const targetIndex = visibleColumnIndex - 1 - addedIndex;
        const index = this.getColumnUnpinnedIndex(targetIndex);
        if (!element.previousElementSibling && this.grid.pinnedColumns.length) {
            if (index === - 1 && !this.isRowInEditMode(rowIndex)) {
                element.parentNode.previousElementSibling.focus();
            } else {
                const target = this.grid.nativeElement.querySelector(
                    `igx-grid-cell[data-rowindex="${rowIndex}"][data-visibleIndex="${targetIndex}"]`);
                target.focus();
            }
        } else if (!this.isColumnLeftFullyVisible(targetIndex)) {
            (document.activeElement as any).blur();
            this.grid.parentVirtDir.onChunkLoad
                .pipe(first())
                .subscribe(() => {
                    const currentCell = this.grid.nativeElement.querySelector(
                        `igx-grid-cell[data-rowindex="${rowIndex}"][data-visibleIndex="${targetIndex + 1}"]`);
                    currentCell.previousElementSibling.focus();
                });
            this.grid.parentVirtDir.getHorizontalScroll().scrollLeft =
                this.grid.dataRowList.first.virtDirRow.getColumnScrollLeft(index);
        } else {
            const targetElement = this.isRowInEditMode(rowIndex) ?
                this.grid.nativeElement.querySelector(
                    `igx-grid-cell[data-rowindex="${rowIndex}"][data-visibleIndex="${targetIndex}"]`) :
                element.previousElementSibling;
            targetElement.focus();
        }

    }

    public onKeydownHome(rowIndex) {
        const rowElement = this.grid.dataRowList.find((row) => row.index === rowIndex).nativeElement;
        const firstCell = rowElement.querySelector('igx-grid-cell');
        if (this.grid.pinnedColumns.length || this.displayContainerScrollLeft === 0) {
            firstCell.focus();
        } else {
            this.horizontalScroll(rowIndex).scrollTo(0);
            this.grid.parentVirtDir.onChunkLoad
                .pipe(first())
                .subscribe(() => {
                    firstCell.focus();
                });
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
            this.horizontalScroll(rowIndex).scrollTo(this.getColumnUnpinnedIndex(index));
            this.grid.parentVirtDir.onChunkLoad
                .pipe(first())
                .subscribe(() => {
                    lastCell.focus();
                });
        }

    }

    public navigateTop(visibleColumnIndex) {
        const verticalScroll = this.grid.verticalScrollContainer.getVerticalScroll();
        if (verticalScroll.scrollTop === 0) {
            const cells = this.grid.nativeElement.querySelectorAll(
                `igx-grid-cell[data-visibleIndex="${visibleColumnIndex}"]`);
            cells[0].focus();
        } else {
            (document.activeElement as any).blur();
            this.grid.verticalScrollContainer.scrollTo(0);
            this.grid.verticalScrollContainer.onChunkLoad
                .pipe(first()).subscribe(() => {
                    const cells = this.grid.nativeElement.querySelectorAll(
                        `igx-grid-cell[data-visibleIndex="${visibleColumnIndex}"]`);
                    cells[0].focus();
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
            (document.activeElement as any).blur();
            this.grid.verticalScrollContainer.scrollTo(this.grid.verticalScrollContainer.igxForOf.length - 1);
            this.grid.verticalScrollContainer.onChunkLoad
                .pipe(first()).subscribe(() => {
                    const cells = this.grid.nativeElement.querySelectorAll(
                        `igx-grid-cell[data-visibleIndex="${visibleColumnIndex}"]`);
                    cells[cells.length - 1].focus();
                });
        }
    }

    public navigateUp(rowElement, currentRowIndex, visibleColumnIndex) {
        if (currentRowIndex === 0) {
            return;
        }
        const containerTopOffset = parseInt(this.verticalDisplayContainerElement.style.top, 10);
        if ((!!Math.abs(containerTopOffset) && (this.grid.rowList.first.index === currentRowIndex - 1 ||
            this.grid.rowList.first.index === currentRowIndex)) ||
            (!Math.abs(containerTopOffset) && this.grid.rowList.first.index >= currentRowIndex)) {
            (document.activeElement as any).blur();
            let scrollAmount = 0;
            const rowHeight =  this.grid.verticalScrollContainer.getSizeAt(currentRowIndex - 1);
            if (this.grid.rowList.first.index === currentRowIndex && containerTopOffset < 0) {
                scrollAmount =  -rowHeight - Math.abs(containerTopOffset);
            } else {
                scrollAmount = containerTopOffset < 0 ? containerTopOffset :
                    -rowHeight + Math.abs(containerTopOffset);
            }
            this.grid.verticalScrollContainer.addScrollTop(scrollAmount);
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
            const index = this.getColumnUnpinnedIndex(visibleColumnIndex);
            const cells = currentRowEl.previousElementSibling.querySelectorAll(`igx-grid-cell`);
            const firstVisibleIndex = parseInt(cells[0].getAttribute('data-visibleIndex'), 10);
            const lastVisibleIndex = parseInt(cells[cells.length - 1].getAttribute('data-visibleIndex'), 10);
            const middle = (firstVisibleIndex + lastVisibleIndex) / 2;
            if (middle > visibleColumnIndex && !this.isColumnLeftFullyVisible(visibleColumnIndex)) {
                this.grid.parentVirtDir.getHorizontalScroll().scrollLeft =
                    this.grid.dataRowList.first.virtDirRow.getColumnScrollLeft(visibleColumnIndex);
            } else if (middle < visibleColumnIndex && !this.isColumnFullyVisible(visibleColumnIndex)) {
                this.grid.parentVirtDir.getHorizontalScroll().scrollLeft =
                    (this.grid.dataRowList.first.virtDirRow.getColumnScrollLeft(index + 1) -
                        this.displayContainerWidth);
            }
            this.grid.parentVirtDir.onChunkLoad
                .pipe(first())
                .subscribe(() => {
                    currentRowEl.previousElementSibling
                        .querySelector(`igx-grid-cell[data-visibleIndex="${visibleColumnIndex}"]`).focus();
                });
        }
    }

    public navigateDown(rowElement, currentRowIndex, visibleColumnIndex, tabKey = false) {
        if (!rowElement.nextElementSibling) {
            return;
        }
        const rowHeight = this.grid.verticalScrollContainer.getSizeAt(currentRowIndex + 1);
        const containerHeight = this.grid.calcHeight ? Math.ceil(this.grid.calcHeight) : null;
        const targetEndTopOffset = rowElement.nextElementSibling.offsetTop + rowHeight +
            parseInt(this.verticalDisplayContainerElement.style.top, 10);
        if (containerHeight && containerHeight < targetEndTopOffset) {
            (document.activeElement as any).blur();
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
                    this.focusNextElement(rowElement, visibleColumnIndex, tabKey);
                });
        } else {
            (document.activeElement as any).blur();
            this.focusNextElement(rowElement, visibleColumnIndex, tabKey);
        }
    }

    private focusNextElement(rowElement, visibleColumnIndex, tabKey = false) {
        if (rowElement.nextElementSibling.tagName.toLowerCase() === 'igx-grid-groupby-row') {
            rowElement.nextElementSibling.focus();
        } else {
            if (tabKey && rowElement.nextElementSibling.querySelector('.igx-grid__cbx-selection')) {
                rowElement.nextElementSibling.querySelector('.igx-grid__cbx-selection').querySelector('.igx-checkbox__input').focus();
                return;
            }
            if (this.isColumnFullyVisible(visibleColumnIndex) && this.isColumnLeftFullyVisible(visibleColumnIndex)) {
                rowElement.nextElementSibling.querySelector(`igx-grid-cell[data-visibleIndex="${visibleColumnIndex}"]`).focus();
                return;
            }
            const cells = rowElement.nextElementSibling.querySelectorAll(`igx-grid-cell`);
            const firstVisibleIndex = parseInt(cells[0].getAttribute('data-visibleIndex'), 10);
            const lastVisibleIndex = parseInt(cells[cells.length - 1].getAttribute('data-visibleIndex'), 10);
            const middle = (firstVisibleIndex + lastVisibleIndex) / 2;
            if (middle > visibleColumnIndex && !this.isColumnLeftFullyVisible(visibleColumnIndex)) {
                this.horizontalScroll(this.grid.dataRowList.first.index).getHorizontalScroll().scrollLeft =
                    this.grid.dataRowList.first.virtDirRow.getColumnScrollLeft(visibleColumnIndex);
            } else if (middle < visibleColumnIndex && !this.isColumnFullyVisible(visibleColumnIndex)) {
                this.horizontalScroll(this.grid.dataRowList.first.index).getHorizontalScroll().scrollLeft =
                    (this.grid.dataRowList.first.virtDirRow.getColumnScrollLeft(visibleColumnIndex + 1) -
                        this.displayContainerWidth);
            }
            this.grid.parentVirtDir.onChunkLoad
                .pipe(first())
                .subscribe(() => {
                    rowElement.nextElementSibling.querySelector(`igx-grid-cell[data-visibleIndex="${visibleColumnIndex}"]`).focus();
                });
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
                    const rowIndex = parseInt(rows[rows.length - 1].getAttribute('data-rowIndex'), 10);
                    this.onKeydownEnd(rowIndex);
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
                this.navigateDown(currentRowEl, rowIndex, 0, true);
            }
        } else {
            const cell = currentRowEl.querySelector(`igx-grid-cell[data-visibleIndex="${visibleColumnIndex}"]`);
            if (cell) {
                this.onKeydownArrowRight(cell, rowIndex, visibleColumnIndex);
            }
        }
    }

    public performShiftTabKey(currentRowEl, rowIndex, visibleColumnIndex) {
        if (visibleColumnIndex === 0) {
            if (currentRowEl.querySelector('.igx-grid__cbx-selection')) {
                currentRowEl.querySelector('.igx-grid__cbx-selection').querySelector('.igx-checkbox__input').focus();
            } else {
                if (this.isRowInEditMode(rowIndex)) {
                    this.grid.rowEditTabs.last.element.nativeElement.focus();
                    return;
                }
                this.navigateUp(currentRowEl, rowIndex,
                    this.grid.unpinnedColumns[this.grid.unpinnedColumns.length - 1].visibleIndex);
            }
        } else {
            const cell = currentRowEl.querySelector(`igx-grid-cell[data-visibleIndex="${visibleColumnIndex}"]`);
            if (cell) {
                this.onKeydownArrowLeft(cell, rowIndex, visibleColumnIndex);
            }
        }
    }

    private calcPartialScroll(rowIndex, visibleColumnIndex) {
        const index = this.getColumnUnpinnedIndex(visibleColumnIndex);
        return this.horizontalScroll(rowIndex).getColumnScrollLeft(index) +
            parseInt(
                this.grid.columnList.filter(c => !c.columnGroup).find((column) => column.visibleIndex === visibleColumnIndex).width,
                10) -
            this.displayContainerWidth - this.horizontalScroll(rowIndex).getHorizontalScroll().scrollLeft;
    }
}
