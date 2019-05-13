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
        this.focusCellUpFromLayout(cell);
    }

    public navigateDown(rowElement, currentRowIndex, visibleColumnIndex, cell?) {
        this.focusCellDownFromLayout(cell);
    }

    public isColumnFullyVisible(visibleColumnIndex: number) {
        const forOfDir =  this.grid.headerContainer;
        const horizontalScroll = forOfDir.getHorizontalScroll();
        const column = this.grid.columnList.filter(c => !c.columnGroup).find((col) => col.visibleIndex === visibleColumnIndex);
        if (!horizontalScroll.clientWidth || column.pinned) {
            return true;
        }
        return this.displayContainerWidth >= forOfDir.getColumnScrollLeft(column.parent.visibleIndex) - this.displayContainerScrollLeft;
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
            if (!(this.isColumnFullyVisible(nextElementColumn.visibleIndex) &&
             this.isColumnLeftFullyVisible(nextElementColumn.visibleIndex))) {
                this.grid.nativeElement.focus({ preventScroll: true });
                this.grid.parentVirtDir.onChunkLoad
                .pipe(first())
                .subscribe(() => {
                    const nextCell = cell.row.cells.find(currCell => currCell.column === nextElementColumn);
                    nextCell.nativeElement.focus({ preventScroll: true });
                });
                this.horizontalScroll(cell.rowIndex).scrollTo(nextElementColumn.parent.visibleIndex);
            } else {
                const nextCell = cell.row.cells.find(currCell => currCell.column === nextElementColumn);
                nextCell.nativeElement.focus();
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
            if (!this.isColumnLeftFullyVisible(prevElementColumn.visibleIndex)) {
                this.grid.nativeElement.focus({ preventScroll: true });
                this.grid.parentVirtDir.onChunkLoad
                .pipe(first())
                .subscribe(() => {
                    const nextCell = cell.row.cells.find(currCell => currCell.column === prevElementColumn);
                    nextCell.nativeElement.focus({ preventScroll: true });
                });
                this.horizontalScroll(cell.rowIndex).scrollTo(prevElementColumn.parent.visibleIndex);
            } else {
                const nextCell = cell.row.cells.find(currCell => currCell.column === prevElementColumn);
                nextCell.nativeElement.focus();
            }
        } else {
            // end of layout reached
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
                            prevRow.cells.toArray()[columnIndex].nativeElement.focus({ preventScroll: true });
                        }
                    });
                this.grid.verticalScrollContainer.scrollTo(prevIndex);
            } else {
                prevRow = this.grid.getRowByIndex(prevIndex);
                if (prevRow && prevRow.cells) {
                    prevRow.cells.toArray()[columnIndex].nativeElement.focus({ preventScroll: true });
                }
            }
            return;
        }
        upperElement.focus({ preventScroll: true });
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
                            nextRow.cells.toArray()[columnIndex].nativeElement.focus({ preventScroll: true });
                        }
                    });
                this.grid.verticalScrollContainer.scrollTo(nextIndex);
            } else {
                nextRow = this.grid.getRowByIndex(nextIndex);
                if (nextRow && nextRow.cells) {
                    nextRow.cells.toArray()[columnIndex].nativeElement.focus({ preventScroll: true });
                }
            }
            return;
        }
        nextElement.focus({ preventScroll: true });
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
            if (!this.isColumnFullyVisible(nextElementColumn.visibleIndex)) {
                this.grid.nativeElement.focus({ preventScroll: true });
                this.grid.parentVirtDir.onChunkLoad
                .pipe(first())
                .subscribe(() => {
                    nextElement = element.nextElementSibling.children[columnIndex];
                    nextElement.focus({ preventScroll: true });
                });
                this.horizontalScroll(cell.rowIndex).scrollTo(nextElementColumn.parent.visibleIndex);
                return;
            } else {
                nextElement = element.nextElementSibling.children[columnIndex];
            }
        }
        nextElement.focus();
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
                    prevElement.focus({ preventScroll: true });
                });
                this.horizontalScroll(cell.rowIndex).scrollTo(prevElementColumn.parent.visibleIndex);
                return;
            } else {
                prevElement = element.previousElementSibling.children[columnIndex];
            }
        }
        prevElement.focus();
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

        if (!this.isColumnFullyVisible(nextElementColumn.index)) {
            this.grid.nativeElement.focus({ preventScroll: true });
            this.grid.parentVirtDir.onChunkLoad
            .pipe(first())
            .subscribe(() => {
                const allBlocks = rowElement.querySelectorAll(this.getColumnLayoutSelector());
                allBlocks[allBlocks.length - 1].children[indexInLayout].focus({ preventScroll: true });
            });
            this.horizontalScroll(rowIndex).scrollTo(nextElementColumn.parent.visibleIndex);
            return;
        } else {
            const allBlocks = rowElement.querySelectorAll(this.getColumnLayoutSelector());
            allBlocks[allBlocks.length - 1].children[indexInLayout].focus({ preventScroll: true });
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

        if (!this.isColumnLeftFullyVisible(nextElementColumn.index)) {
            this.grid.nativeElement.focus({ preventScroll: true });
            this.grid.parentVirtDir.onChunkLoad
            .pipe(first())
            .subscribe(() => {
                const allBlocks = rowElement.querySelectorAll(this.getColumnLayoutSelector());
                allBlocks[0].children[indexInLayout].focus({ preventScroll: true });
            });
            this.horizontalScroll(rowIndex).scrollTo(nextElementColumn.parent.visibleIndex);
            return;
        } else {
            const allBlocks = rowElement.querySelectorAll(this.getColumnLayoutSelector());
            allBlocks[0].children[indexInLayout].focus({ preventScroll: true });
        }
    }

    protected getColumnLayoutSelector() {
        return '.igx-grid__mrl-block';
    }
}
