import { Injectable } from '@angular/core';
import { IgxGridBaseComponent, FilterMode } from './grid-base.component';
import { first } from 'rxjs/operators';
import { IgxColumnComponent } from './column.component';
import { IgxGridGroupByRowComponent } from './grid/groupby-row.component';
import { IgxGridCellComponent } from './tree-grid';
import { IgxGridNavigationService } from './grid-navigation.service';

/** @hidden */
@Injectable()
export class IgxGridMRLNavigationService extends IgxGridNavigationService {
    public grid: IgxGridBaseComponent;

    public navigateUp(rowElement, currentRowIndex, visibleColumnIndex, cell?) {
        if (cell) {
            this.focusCellUpFromLayout(cell);
        } else {
            super.navigateUp(rowElement, currentRowIndex, visibleColumnIndex);
        }
    }

    public navigateDown(rowElement, currentRowIndex, visibleColumnIndex, cell?) {
        if (cell) {
            this.focusCellDownFromLayout(cell);
        } else {
            super.navigateDown(rowElement, currentRowIndex, visibleColumnIndex);
        }

    }

    public isColumnFullyVisible(visibleColumnIndex: number) {
        const forOfDir =  this.grid.headerContainer;
        const horizontalScroll = forOfDir.getHorizontalScroll();
        const column = this.grid.columnList.filter(c => !c.columnGroup).find((col) => col.visibleIndex === visibleColumnIndex);
        if (!horizontalScroll.clientWidth || (column && column.pinned)) {
            return true;
        } else if (column) {
            return this.displayContainerWidth >= forOfDir.getColumnScrollLeft(column.parent.visibleIndex) - this.displayContainerScrollLeft;
        }
        return false;
    }

    public isColumnLeftFullyVisible(visibleColumnIndex: number) {
        const forOfDir = this.grid.headerContainer;
        const horizontalScroll = forOfDir.getHorizontalScroll();
        const column = this.grid.columnList.filter(c => !c.columnGroup).find((col) => col.visibleIndex === visibleColumnIndex);
        if (!horizontalScroll.clientWidth || column.pinned) {
            return true;
        }
        return this.displayContainerScrollLeft <= forOfDir.getColumnScrollLeft(column.parent.visibleIndex);
    }

    public onKeydownArrowRight(element, rowIndex, visibleColumnIndex, isSummary = false, cell?) {
        this.focusNextCellFromLayout(cell);
    }

    public onKeydownArrowLeft(element, rowIndex, visibleColumnIndex, isSummary = false, cell?) {
        this.focusPrevCellFromLayout(cell);
    }

    public performTab(currentRowEl, rowIndex, visibleColumnIndex, isSummaryRow = false, cell?) {
        const nextElementColumn = cell.grid.columns.find(x => !x.columnGroup && x.visibleIndex === cell.column.visibleIndex + 1);
        if (nextElementColumn) {
            let nextCell = cell.row.cells.find(currCell => currCell.column === nextElementColumn);
            if (!nextCell) {
                this.grid.nativeElement.focus({ preventScroll: true });
                this.grid.parentVirtDir.onChunkLoad
                .pipe(first())
                .subscribe(() => {
                    nextCell = cell.row.cells.find(currCell => currCell.column === nextElementColumn);
                    this._focusCell(nextCell.nativeElement);
                });
                const hScroll = this.horizontalScroll(cell.rowIndex);
                const scrIndex = hScroll.igxForOf.indexOf(nextElementColumn.parent);
                hScroll.scrollTo(scrIndex);
            } else {
                this._focusCell(nextCell.nativeElement);
            }
        } else {
            // end of layout reached
            if (this.isRowInEditMode(rowIndex)) {
                this.grid.rowEditTabs.first.element.nativeElement.focus();
                return;
            }
            super.navigateDown(currentRowEl, rowIndex, 0, cell);
        }
    }

    public performShiftTabKey(currentRowEl, rowIndex, visibleColumnIndex, isSummaryRow = false, cell?) {
        const prevElementColumn =
         cell.grid.columns.find(x => !x.columnGroup && x.visibleIndex === cell.column.visibleIndex - 1 && !x.hidden);
        if (prevElementColumn) {
            let nextCell = cell.row.cells.find(currCell => currCell.column === prevElementColumn);
            if (!nextCell) {
                this.grid.nativeElement.focus({ preventScroll: true });
                this.grid.parentVirtDir.onChunkLoad
                .pipe(first())
                .subscribe(() => {
                    nextCell = cell.row.cells.find(currCell => currCell.column === prevElementColumn);
                    this._focusCell(nextCell.nativeElement);
                });
                const hScroll = this.horizontalScroll(cell.rowIndex);
                const scrIndex = hScroll.igxForOf.indexOf(prevElementColumn.parent);
                hScroll.scrollTo(scrIndex);
            } else {
                this._focusCell(nextCell.nativeElement);
            }
        } else {
            // end of layout reached
            if (this.isRowInEditMode(rowIndex)) {
                this.grid.rowEditTabs.last.element.nativeElement.focus();
                return;
            }
            let lastVisibleIndex = 0;
            cell.grid.unpinnedColumns.forEach((col) => {
                lastVisibleIndex = Math.max(lastVisibleIndex, col.visibleIndex);
            });
            super.navigateUp(currentRowEl, rowIndex, lastVisibleIndex, cell);
        }
    }

    private focusCellUpFromLayout(cell, isSummary = false) {
        const columnLayout = cell.column.parent;
        const element = cell.nativeElement.parentElement;

        const currentRowStart = cell.rowStart;
        const currentColStart = cell.colStart;

        // element up is from the same layout
        let upperElementColumn = columnLayout.children.find(c =>
            (c.rowEnd === currentRowStart || c.rowStart + c.gridRowSpan === currentRowStart)  &&
            c.colStart <= currentColStart &&
            (currentColStart < c.colEnd || currentColStart < c.colStart + c.gridColumnSpan));

        let columnIndex = columnLayout.children.toArray().indexOf(upperElementColumn);
        const upperElement = element.children[columnIndex];

        if (!upperElement) {
            const layoutRowEnd = this.grid.multiRowLayoutRowSize + 1;
            upperElementColumn = columnLayout.children.find(c =>
                (c.rowEnd === layoutRowEnd || c.rowStart + c.gridRowSpan === layoutRowEnd) &&
                c.colStart <= currentColStart &&
                (currentColStart < c.colEnd || currentColStart < c.colStart + c.gridColumnSpan));
            columnIndex = this.grid.columns.filter(c => !c.columnLayout && !c.parent.hidden).indexOf(upperElementColumn);

            const prevIndex = cell.row.index - 1;
            let prevRow;
            const rowElement = cell.row.nativeElement;
            const containerTopOffset = parseInt(this.verticalDisplayContainerElement.style.top, 10);
            if (prevIndex >= 0 && (!rowElement.previousElementSibling ||
                rowElement.previousElementSibling.offsetTop < Math.abs(containerTopOffset))) {
                this.grid.nativeElement.focus({ preventScroll: true });
                this.grid.verticalScrollContainer.onChunkLoad
                    .pipe(first())
                    .subscribe(() => {
                        prevRow = this.grid.getRowByIndex(prevIndex);
                        if (prevRow && prevRow.cells) {
                            this._focusCell(prevRow.cells.toArray()[columnIndex].nativeElement);
                        } else if (prevRow) {
                            prevRow.nativeElement.focus({ preventScroll: true });
                        }
                    });
                this.grid.verticalScrollContainer.scrollTo(prevIndex);
            } else {
                prevRow = this.grid.getRowByIndex(prevIndex);
                if (prevRow && prevRow.cells) {
                    this._focusCell(prevRow.cells.toArray()[columnIndex].nativeElement);
                } else if (prevRow) {
                    prevRow.nativeElement.focus({ preventScroll: true });
                }
            }
            return;
        }
        this._focusCell(upperElement);
    }

    private focusCellDownFromLayout(cell, isSummary = false) {
        const columnLayout = cell.column.parent;
        const element = cell.nativeElement.parentElement;

        const currentRowEnd = cell.rowEnd || cell.rowStart + cell.gridRowSpan;
        const currentColStart = cell.colStart;

        // element down is from the same layout
        let nextElementColumn = columnLayout.children.find(c => c.rowStart === currentRowEnd &&
            c.colStart <= currentColStart &&
            (currentColStart < c.colEnd || currentColStart < c.colStart + c.gridColumnSpan));

        let columnIndex = columnLayout.children.toArray().indexOf(nextElementColumn);
        const nextElement = element.children[columnIndex];

        if (!nextElement) {

            nextElementColumn = columnLayout.children.find(c => c.rowStart === 1 &&
                c.colStart <= currentColStart &&
                (currentColStart < c.colEnd || currentColStart < c.colStart + c.gridColumnSpan));
            columnIndex = this.grid.columns.filter(c => !c.columnLayout && !c.parent.hidden).indexOf(nextElementColumn);

            const nextIndex = cell.row.index + 1;
            let nextRow;

            const rowHeight = this.grid.verticalScrollContainer.getSizeAt(cell.row.index + 1);
            const containerHeight = this.grid.calcHeight ? Math.ceil(this.grid.calcHeight) : 0;
            const targetEndTopOffset = cell.row.nativeElement.nextElementSibling ?
            cell.row.nativeElement.nextElementSibling.offsetTop + rowHeight + parseInt(this.verticalDisplayContainerElement.style.top, 10) :
                containerHeight + rowHeight;
            if (containerHeight && containerHeight < targetEndTopOffset) {
                this.grid.nativeElement.focus({ preventScroll: true });
                this.grid.verticalScrollContainer.onChunkLoad
                    .pipe(first())
                    .subscribe(() => {
                        nextRow = this.grid.getRowByIndex(nextIndex);
                        if (nextRow && nextRow.cells) {
                            this._focusCell(nextRow.cells.toArray()[columnIndex].nativeElement);
                        } else if (nextRow) {
                            nextRow.nativeElement.focus({ preventScroll: true });
                        }
                    });
                    this.grid.verticalScrollContainer.scrollTo(nextIndex);
            } else {
                nextRow = this.grid.getRowByIndex(nextIndex);
                if (nextRow && nextRow.cells) {
                    this._focusCell(nextRow.cells.toArray()[columnIndex].nativeElement);
                } else if (nextRow) {
                    nextRow.nativeElement.focus({ preventScroll: true });
                }
            }
            return;
        }
        this._focusCell(nextElement);
    }

    private focusNextCellFromLayout(cell, isSummary = false) {
        const columnLayout = cell.column.parent;
        const element = cell.nativeElement.parentElement;

        const currentColEnd = cell.colEnd || cell.colStart + cell.gridColumnSpan;
        const currentRowStart = cell.rowStart;

        // next element is from the same layout
        let nextElementColumn = columnLayout.children.find(c => c.colStart === currentColEnd &&
            c.rowStart <= currentRowStart &&
            (currentRowStart < c.rowEnd || currentRowStart < c.rowStart + c.gridRowSpan));

        let columnIndex = columnLayout.children.toArray().indexOf(nextElementColumn);
        let nextElement = element.children[columnIndex];

        if (!nextElement) {
            // try extracting first element from the next layout
            const currentLayoutIndex = this.grid.columns.filter(c => c.columnLayout && !c.hidden).indexOf(columnLayout);
            const nextLayout = this.grid.columns.filter(c => c.columnLayout && !c.hidden)[currentLayoutIndex + 1];
            if (!nextLayout) {
                // reached the end
                return null;
            }
            // first element is from the next layout
            nextElementColumn = nextLayout.children.find(c => c.colStart === 1 &&
                c.rowStart <= currentRowStart &&
                (currentRowStart < c.rowEnd || currentRowStart < c.rowStart + c.gridRowSpan));

            columnIndex = nextLayout.children.toArray().indexOf(nextElementColumn);

            if (element.classList.contains('igx-grid__td--pinned-last')) {
                nextElement = element.nextElementSibling.children[0].children[columnIndex];
            } else if (!this.isColumnFullyVisible(nextElementColumn.visibleIndex)) {
                this.grid.nativeElement.focus({ preventScroll: true });
                this.grid.parentVirtDir.onChunkLoad
                .pipe(first())
                .subscribe(() => {
                    nextElement = element.nextElementSibling.children[columnIndex];
                    this._focusCell(nextElement);
                });
                const hScroll = this.horizontalScroll(cell.rowIndex);
                const scrIndex = hScroll.igxForOf.indexOf(nextElementColumn.parent);
                hScroll.scrollTo(scrIndex);
                return;
            } else {
                nextElement = element.nextElementSibling.children[columnIndex];
            }
        }
        this._focusCell(nextElement);
    }

    private focusPrevCellFromLayout(cell, isSummary = false) {
        const columnLayout = cell.column.parent;
        const element = cell.nativeElement.parentElement;
        const currentColStart = cell.colStart;
        const currentRowStart = cell.rowStart;

        // previous element is from the same layout
        let prevElementColumn = columnLayout.children
        .find(c => (c.colEnd === currentColStart || c.colStart + c.gridColumnSpan === currentColStart ) &&
            c.rowStart <= currentRowStart &&
            (currentRowStart < c.rowEnd || currentRowStart < c.rowStart + c.gridRowSpan));

        let columnIndex = columnLayout.children.toArray().indexOf(prevElementColumn);
        let prevElement = element.children[columnIndex];

        if (!prevElement) {
            // try extracting first element from the previous layout
            const currentLayoutIndex = this.grid.columns.filter(c => c.columnLayout && !c.hidden).indexOf(columnLayout);
            const prevLayout = this.grid.columns.filter(c => c.columnLayout && !c.hidden)[currentLayoutIndex - 1];
            if (!prevLayout) {
                // reached the end
                return null;
            }
            const layoutSize = prevLayout.getInitialChildColumnSizes(prevLayout.children).length;
            // first element is from the next layout
            prevElementColumn = prevLayout.children
            .find(c => (c.colEnd === layoutSize + 1 || c.colStart + c.gridColumnSpan === layoutSize + 1) &&
                c.rowStart <= currentRowStart &&
                (currentRowStart < c.rowEnd || currentRowStart < c.rowStart + c.gridRowSpan));

            columnIndex = prevLayout.children.toArray().indexOf(prevElementColumn);

            if (!this.isColumnLeftFullyVisible(prevElementColumn.visibleIndex)) {
                this.grid.nativeElement.focus({ preventScroll: true });
                this.grid.parentVirtDir.onChunkLoad
                .pipe(first())
                .subscribe(() => {
                    prevElement = element.previousElementSibling.children[columnIndex];
                    this._focusCell(prevElement);
                });
                const hScroll = this.horizontalScroll(cell.rowIndex);
                const scrIndex = hScroll.igxForOf.indexOf(prevElementColumn.parent);
                hScroll.scrollTo(scrIndex);
                return;
            } else {
                prevElement = !element.previousElementSibling && this.grid.pinnedColumns.length ?
                    element.parentNode.previousElementSibling.children[columnIndex] :
                    element.previousElementSibling.children[columnIndex];
            }
        }
        this._focusCell(prevElement);
    }

    public onKeydownEnd(rowIndex, isSummary = false, cellRowStart?) {
        const layouts = this.grid.columns.filter(c => c.columnLayout && !c.hidden).length;
        const lastLayout = this.grid.columns.filter(c => c.columnLayout && !c.hidden)[layouts - 1];
        const lastLayoutChildren = lastLayout.children;
        const layoutSize =  lastLayout.getInitialChildColumnSizes(lastLayoutChildren).length;
        const currentRowStart =  cellRowStart || this.grid.multiRowLayoutRowSize;
        const nextElementColumn = lastLayout.children.find(c =>
            (c.colEnd === layoutSize + 1 || c.colStart + c.gridColumnSpan === layoutSize + 1) &&
            c.rowStart <= currentRowStart &&
            (currentRowStart < c.rowEnd || currentRowStart < c.rowStart + c.gridRowSpan));
        const indexInLayout = lastLayoutChildren.toArray().indexOf(nextElementColumn);

        const rowList = isSummary ? this.grid.summariesRowList : this.grid.dataRowList;
        let rowElement = rowList.find((row) => row.index === rowIndex);
        if (!rowElement) { return; }
        rowElement = rowElement.nativeElement;

        if (!this.isColumnFullyVisible(nextElementColumn.parent.visibleIndex)) {
            this.grid.nativeElement.focus({ preventScroll: true });
            this.grid.parentVirtDir.onChunkLoad
            .pipe(first())
            .subscribe(() => {
                const allBlocks = rowElement.querySelectorAll(this.getColumnLayoutSelector());
                const cell = allBlocks[allBlocks.length - 1].children[indexInLayout];
                this._focusCell(cell);
            });
            const hScroll = this.horizontalScroll(rowIndex);
            const scrIndex = hScroll.igxForOf.indexOf(nextElementColumn.parent);
            hScroll.scrollTo(scrIndex);
            return;
        } else {
            const allBlocks = rowElement.querySelectorAll(this.getColumnLayoutSelector());
            const cell =  allBlocks[allBlocks.length - 1].children[indexInLayout];
            this._focusCell(cell);
        }
    }

    public onKeydownHome(rowIndex, isSummary = false, cellRowStart = 1) {
        const firstLayout = this.grid.columns.filter(c => c.columnLayout && !c.hidden)[0];
        const lastLayoutChildren = firstLayout.children.toArray();
        const currentRowStart =  cellRowStart;
        const nextElementColumn = firstLayout.children.find(c =>
            c.colStart === 1 &&
            c.rowStart <= currentRowStart &&
            (currentRowStart < c.rowEnd || currentRowStart < c.rowStart + c.gridRowSpan));
        const indexInLayout = lastLayoutChildren.indexOf(nextElementColumn);

        const rowList = isSummary ? this.grid.summariesRowList : this.grid.dataRowList;
        let rowElement = rowList.find((row) => row.index === rowIndex);
        if (!rowElement) { return; }
        rowElement = rowElement.nativeElement;

        if (!this.isColumnLeftFullyVisible(nextElementColumn.parent.visibleIndex)) {
            this.grid.nativeElement.focus({ preventScroll: true });
            this.grid.parentVirtDir.onChunkLoad
            .pipe(first())
            .subscribe(() => {
                const allBlocks = rowElement.querySelectorAll(this.getColumnLayoutSelector());
                const cell = allBlocks[0].children[indexInLayout];
                this._focusCell(cell);
            });
            const hScroll = this.horizontalScroll(rowIndex);
            const scrIndex = hScroll.igxForOf.indexOf(nextElementColumn.parent);
            hScroll.scrollTo(scrIndex);
            return;
        } else {
            const allBlocks = rowElement.querySelectorAll(this.getColumnLayoutSelector());
            const cell =  allBlocks[0].children[indexInLayout];
            this._focusCell(cell);
        }
    }

    protected getColumnLayoutSelector() {
        return '.igx-grid__mrl-block';
    }

    protected performHorizontalScrollToCell(rowIndex, visibleColumnIndex, isSummary = false) {
        const col = this.grid.columns.find(x => !x.columnGroup && x.visibleIndex === visibleColumnIndex);
        const unpinnedIndex = this.getColumnUnpinnedIndex(col.parent.visibleIndex);
        this.grid.parentVirtDir.onChunkLoad
            .pipe(first())
            .subscribe(() => {
                this._focusCell(this.getCellElementByVisibleIndex(rowIndex, visibleColumnIndex, isSummary));
            });
        this.horizontalScroll(rowIndex).scrollTo(unpinnedIndex);
    }

    protected _focusCell(cellElem) {
        const gridBoundingClientRect = this.grid.tbody.nativeElement.getBoundingClientRect();
        const diffTop = cellElem.getBoundingClientRect().top - gridBoundingClientRect.top;
        const diffBottom = cellElem.getBoundingClientRect().bottom - gridBoundingClientRect.bottom;
        const vIndex = parseInt(cellElem.getAttribute('data-visibleIndex'), 10);
        const isPinned = this.grid.columns.find(x => !x.columnGroup && x.visibleIndex === vIndex).pinned;
        const diffLeft = !isPinned ? cellElem.getBoundingClientRect().left - this.grid.pinnedWidth - gridBoundingClientRect.left : 0;
        const diffRight = !isPinned ? cellElem.getBoundingClientRect().right - gridBoundingClientRect.right : 0;
        const horizontalVirt =  this.grid.headerContainer;
        const horizontalScroll = horizontalVirt.getHorizontalScroll();
        let shouldFocus = false;
        if (diffTop < 0) {
            // cell is above grid top - not visible
            this.grid.nativeElement.focus({ preventScroll: true });
            this.grid.verticalScrollContainer.onChunkLoad
                .pipe(first())
                .subscribe(() => {
                    cellElem.focus({ preventScroll: true });
            });
            this.grid.verticalScrollContainer.addScrollTop(diffTop);
        } else if (diffBottom > 0) {
            // cell is below grid bottom - not visible
            this.grid.nativeElement.focus({ preventScroll: true });
            this.grid.verticalScrollContainer.onChunkLoad
                .pipe(first())
                .subscribe(() => {
                    cellElem.focus({ preventScroll: true });
            });
            this.grid.verticalScrollContainer.addScrollTop(diffBottom);
        }  else {
            // cell is visible
            shouldFocus = true;
        }

        if (diffRight > 0) {
            // cell is left of grid left edge - not visible
            this.grid.nativeElement.focus({ preventScroll: true });
            this.grid.parentVirtDir.onChunkLoad
                .pipe(first())
                .subscribe(() => {
                    cellElem.focus({ preventScroll: true });
            });
            horizontalScroll.scrollLeft += diffRight;
        } else if (diffLeft < 0) {
            // cell is right of grid right edge - not visible
            this.grid.nativeElement.focus({ preventScroll: true });
            this.grid.parentVirtDir.onChunkLoad
                .pipe(first())
                .subscribe(() => {
                    cellElem.focus({ preventScroll: true });
            });
            horizontalScroll.scrollLeft += diffLeft;
        } else {
            // cell is visible
            shouldFocus = true;
        }

        if (shouldFocus) {
            cellElem.focus({ preventScroll: true });
        }
    }
}
