import { Injectable } from '@angular/core';
import { IgxGridBaseComponent } from './grid-base.component';
import { first } from 'rxjs/operators';
import { IgxColumnComponent } from './column.component';
import { IgxGridNavigationService } from './grid-navigation.service';
import { ISelectionNode } from '../core/grid-selection';


export interface IStartNavigationCell {
    rowStart: number;
    colStart: number;
    direction: NavigationDirection;
}

export enum NavigationDirection {
    horizontal = 'horizontal',
    vertical = 'vertical'
}


/** @hidden */
@Injectable()
export class IgxGridMRLNavigationService extends IgxGridNavigationService {

    /**
     * @hidden
     * @internal
     */
    public startNavigationCell: IStartNavigationCell;

    public grid: IgxGridBaseComponent;


    private resetStartNavigationCell(colStart, rowStart, dir) {
        this.startNavigationCell = {
            colStart: colStart,
            rowStart: rowStart,
            direction: dir
        };
    }

    private applyNavigationCell(colStart, rowStart, navDirection) {
        const oppositeDir = navDirection === NavigationDirection.vertical ?
            NavigationDirection.horizontal : NavigationDirection.vertical;
        if (this.startNavigationCell && this.startNavigationCell.direction !== navDirection) {
            this.startNavigationCell.direction = oppositeDir;
        } else {
            this.resetStartNavigationCell(colStart, rowStart, oppositeDir);
        }

        return navDirection === NavigationDirection.vertical ?
            this.startNavigationCell.colStart : this.startNavigationCell.rowStart;
    }

    public navigateUp(rowElement, selectedNode: ISelectionNode) {
        this.focusCellUpFromLayout(rowElement, selectedNode);
    }

    public navigateDown(rowElement, selectedNode: ISelectionNode) {
        this.focusCellDownFromLayout(rowElement, selectedNode);
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

    public onKeydownArrowRight(element, selectedNode: ISelectionNode) {
        this.focusNextCellFromLayout(element, selectedNode);
    }

    public onKeydownArrowLeft(element, selectedNode: ISelectionNode) {
        this.focusPrevCellFromLayout(element, selectedNode);
    }
    public get gridOrderedColumns(): IgxColumnComponent[] {
        return [...this.grid.pinnedColumns, ...this.grid.unpinnedColumns].filter(c => !c.columnGroup)
        .sort((a, b) => a.visibleIndex - b.visibleIndex);
    }

    public performTab(currentRowEl, selectedNode: ISelectionNode) {
        const visibleColumnIndex = selectedNode.layout.columnVisibleIndex;
        const nextElementColumn = this.grid.columns.find(x => !x.columnGroup && x.visibleIndex === visibleColumnIndex + 1);
        const rowIndex = selectedNode.row;
        const row = this.grid.getRowByIndex(rowIndex);
        this._moveFocusToCell(currentRowEl, nextElementColumn, row, selectedNode, 'next');
        if (nextElementColumn) {
            this.resetStartNavigationCell(nextElementColumn.colStart, nextElementColumn.rowStart, null);
        }
    }

    protected _moveFocusToCell(currentRowEl, nextElementColumn, row, selectedNode, dir) {
        if (nextElementColumn) {
            let nextCell = row.cells.find(currCell => currCell.column === nextElementColumn);
            if (!nextCell) {
                this.grid.nativeElement.focus({ preventScroll: true });
                this.grid.parentVirtDir.onChunkLoad
                .pipe(first())
                .subscribe(() => {
                    nextCell = row.cells.find(currCell => currCell.column === nextElementColumn);
                    if (this.grid.rowEditable && this.isRowInEditMode(row.index)) {
                        if (dir === 'next') {
                            this.moveNextEditable(nextCell.nativeElement, selectedNode);
                        } else {
                            this.movePreviousEditable(nextCell.nativeElement, selectedNode);
                        }
                        return;
                    }
                    this._focusCell(nextCell.nativeElement);
                });
                const hScroll = this.horizontalScroll(row.index);
                const scrIndex = hScroll.igxForOf.indexOf(nextElementColumn.parent);
                hScroll.scrollTo(scrIndex);
            } else {
                if (this.grid.rowEditable && this.isRowInEditMode(row.index)) {
                    if (dir === 'next') {
                        this.moveNextEditable(nextCell.nativeElement, { row: row.index, column: selectedNode.layout.columnVisibleIndex});
                    } else {
                        this.movePreviousEditable(nextCell.nativeElement,
                             { row: row.index, column: selectedNode.layout.columnVisibleIndex});
                    }
                    return;
                }
                this._focusCell(nextCell.nativeElement);
            }
        } else {
            // end of layout reached
            if (this.isRowInEditMode(row.index)) {
                if (dir === 'next') {
                    this.grid.rowEditTabs.first.element.nativeElement.focus();
                } else {
                    this.grid.rowEditTabs.last.element.nativeElement.focus();
                }
                return;
            }
            if (dir === 'next') {
                super.navigateDown(currentRowEl, {row: row.index, column: 0});
            } else {
                let lastVisibleIndex = 0;
                this.grid.unpinnedColumns.forEach((col) => {
                    lastVisibleIndex = Math.max(lastVisibleIndex, col.visibleIndex);
                });
                super.navigateUp(currentRowEl, {row: row.index, column: lastVisibleIndex});
            }
        }
    }

    public performShiftTabKey(currentRowEl, selectedNode: ISelectionNode) {
        const visibleColumnIndex = selectedNode.layout.columnVisibleIndex;
        const rowIndex = selectedNode.row;
        const row = this.grid.getRowByIndex(rowIndex);
        const prevElementColumn =
         this.grid.columns.find(x => !x.columnGroup && x.visibleIndex === visibleColumnIndex - 1 && !x.hidden);
         this._moveFocusToCell(currentRowEl, prevElementColumn, row, selectedNode, 'prev');
        if (prevElementColumn) {
            this.resetStartNavigationCell(prevElementColumn.colStart, prevElementColumn.rowStart, null);
        }
    }

    private focusCellUpFromLayout(rowElement, selectedNode: ISelectionNode) {
        const isGroupRow = rowElement.tagName.toLowerCase() === 'igx-grid-groupby-row';
        const currentRowStart = selectedNode.layout ?  selectedNode.layout.rowStart : 1;
        const currentColStart = this.applyNavigationCell(selectedNode.layout ? selectedNode.layout.colStart : 1,
            currentRowStart,
            NavigationDirection.vertical);
        const parentIndex = selectedNode.column;
        const columnLayout = this.grid.columns.find( x => x.columnLayout && x.visibleIndex === parentIndex);
        let element;
        if (!isGroupRow) {
            const cell = this.grid.getRowByIndex(selectedNode.row).cells
            .find(x => x.visibleColumnIndex === selectedNode.layout.columnVisibleIndex);
            element = cell.nativeElement.parentElement;
        }

        // element up is from the same layout
        let upperElementColumn = columnLayout.children.find(c =>
            (c.rowEnd === currentRowStart || c.rowStart + c.gridRowSpan === currentRowStart)  &&
            c.colStart <= currentColStart &&
            (currentColStart < c.colEnd || currentColStart < c.colStart + c.gridColumnSpan));

        const columnIndex = columnLayout.children.toArray().indexOf(upperElementColumn);
        const upperElement = element ? element.children[columnIndex] : null;

        if (!upperElement) {
            const layoutRowEnd = this.grid.multiRowLayoutRowSize + 1;
            upperElementColumn = columnLayout.children.find(c =>
                (c.rowEnd === layoutRowEnd || c.rowStart + c.gridRowSpan === layoutRowEnd) &&
                c.colStart <= currentColStart &&
                (currentColStart < c.colEnd || currentColStart < c.colStart + c.gridColumnSpan));

            const prevIndex = selectedNode.row - 1;
            let prevRow;
            const containerTopOffset = parseInt(this.verticalDisplayContainerElement.style.top, 10);
            if (prevIndex >= 0 && (!rowElement.previousElementSibling ||
                rowElement.previousElementSibling.offsetTop < Math.abs(containerTopOffset))) {
                this.grid.nativeElement.focus({ preventScroll: true });
                this.grid.verticalScrollContainer.onChunkLoad
                    .pipe(first())
                    .subscribe(() => {
                        prevRow = this.grid.getRowByIndex(prevIndex);
                        if (prevRow && prevRow.cells) {
                            this._focusCell(upperElementColumn.cells.find((c) => c.rowIndex === prevRow.index).nativeElement);
                        } else if (prevRow) {
                            prevRow.nativeElement.focus({ preventScroll: true });
                        }
                    });
                this.grid.verticalScrollContainer.scrollTo(prevIndex);
            } else {
                prevRow = this.grid.getRowByIndex(prevIndex);
                if (prevRow && prevRow.cells) {
                    this._focusCell(upperElementColumn.cells.find((c) => c.rowIndex === prevRow.index).nativeElement);
                } else if (prevRow) {
                    prevRow.nativeElement.focus({ preventScroll: true });
                }
            }
            return;
        }
        this._focusCell(upperElement);
    }

    private focusCellDownFromLayout(rowElement, selectedNode: ISelectionNode) {
        const isGroupRow = rowElement.tagName.toLowerCase() === 'igx-grid-groupby-row';
        const parentIndex = selectedNode.column;
        const columnLayout = this.grid.columns.find( x => x.columnLayout && x.visibleIndex === parentIndex);
        const currentRowEnd = selectedNode.layout ? selectedNode.layout.rowEnd || selectedNode.layout.rowStart + 1 : 2;
        const currentColStart = this.applyNavigationCell(selectedNode.layout ? selectedNode.layout.colStart : 1,
            selectedNode.layout ? selectedNode.layout.rowStart : 1,
            NavigationDirection.vertical);
        let element;
        if (!isGroupRow) {
            const cell = this.grid.getRowByIndex(selectedNode.row).cells
            .find(x => x.visibleColumnIndex === selectedNode.layout.columnVisibleIndex);
            element = cell.nativeElement.parentElement;
        }

        // element down is from the same layout
        let nextElementColumn = columnLayout.children.find(c => c.rowStart === currentRowEnd &&
            c.colStart <= currentColStart &&
            (currentColStart < c.colEnd || currentColStart < c.colStart + c.gridColumnSpan));

        const columnIndex = columnLayout.children.toArray().indexOf(nextElementColumn);
        const nextElement = element ? element.children[columnIndex] : null;

        if (!nextElement) {

            nextElementColumn = columnLayout.children.find(c => c.rowStart === 1 &&
                c.colStart <= currentColStart &&
                (currentColStart < c.colEnd || currentColStart < c.colStart + c.gridColumnSpan));

            const nextIndex = selectedNode.row + 1;
            let nextRow;

            const rowHeight = this.grid.verticalScrollContainer.getSizeAt(nextIndex);
            const containerHeight = this.grid.calcHeight ? Math.ceil(this.grid.calcHeight) : 0;
            const targetEndTopOffset = rowElement.nextElementSibling ?
            rowElement.nextElementSibling.offsetTop + rowHeight + parseInt(this.verticalDisplayContainerElement.style.top, 10) :
                containerHeight + rowHeight;
            if (containerHeight && containerHeight < targetEndTopOffset) {
                this.grid.nativeElement.focus({ preventScroll: true });
                this.grid.verticalScrollContainer.onChunkLoad
                    .pipe(first())
                    .subscribe(() => {
                        nextRow = this.grid.getRowByIndex(nextIndex);
                        if (nextRow && nextRow.cells) {
                            this._focusCell(nextElementColumn.cells.find((c) => c.rowIndex === nextRow.index).nativeElement);
                        } else if (nextRow) {
                            nextRow.nativeElement.focus({ preventScroll: true });
                        }
                    });
                    this.grid.verticalScrollContainer.scrollTo(nextIndex);
            } else {
                nextRow = this.grid.getRowByIndex(nextIndex);
                if (nextRow && nextRow.cells) {
                    this._focusCell(nextElementColumn.cells.find((c) => c.rowIndex === nextRow.index).nativeElement);
                } else if (nextRow) {
                    nextRow.nativeElement.focus({ preventScroll: true });
                }
            }
            return;
        }
        this._focusCell(nextElement);
    }

    private focusNextCellFromLayout(cellElement, selectedNode: ISelectionNode) {
        const parentIndex = selectedNode.column;
        const columnLayout = this.grid.columns.find( x => x.columnLayout && x.visibleIndex === parentIndex);
        const currentColEnd = selectedNode.layout.colEnd || selectedNode.layout.colStart + 1;
        const currentRowStart = this.applyNavigationCell(selectedNode.layout.colStart,
            selectedNode.layout.rowStart,
            NavigationDirection.horizontal);
        const rowIndex = selectedNode.row;
        const element = cellElement.parentElement;
        // next element is from the same layout
        let nextElementColumn = columnLayout.children.find(c => c.colStart === currentColEnd &&
            c.rowStart <= currentRowStart &&
            (currentRowStart < c.rowEnd || currentRowStart < c.rowStart + c.gridRowSpan));

        let columnIndex = columnLayout.children.toArray().indexOf(nextElementColumn);
        let nextElement = element.children[columnIndex];

        if (!nextElement) {
            // try extracting first element from the next layout
            const nextLayout = this.grid.columns.find(c => c.columnLayout && !c.hidden && c.visibleIndex === columnLayout.visibleIndex + 1);
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
                const hScroll = this.horizontalScroll(rowIndex);
                const scrIndex = hScroll.igxForOf.indexOf(nextElementColumn.parent);
                hScroll.scrollTo(scrIndex);
                return;
            } else {
                nextElement = element.nextElementSibling.children[columnIndex];
            }
        }
        this._focusCell(nextElement);
    }

    private focusPrevCellFromLayout(cellElement, selectedNode: ISelectionNode) {
        const parentIndex = selectedNode.column;
        const columnLayout = this.grid.columns.find( x => x.columnLayout && x.visibleIndex === parentIndex);
        const currentColStart = selectedNode.layout.colStart;
        const currentRowStart = this.applyNavigationCell(currentColStart,
            selectedNode.layout.rowStart,
            NavigationDirection.horizontal);
        const rowIndex = selectedNode.row;

        // previous element is from the same layout
        let prevElementColumn = columnLayout.children
        .find(c => (c.colEnd === currentColStart || c.colStart + c.gridColumnSpan === currentColStart ) &&
            c.rowStart <= currentRowStart &&
            (currentRowStart < c.rowEnd || currentRowStart < c.rowStart + c.gridRowSpan));

        let columnIndex = columnLayout.children.toArray().indexOf(prevElementColumn);
        const element = cellElement.parentElement;
        let prevElement = element.children[columnIndex];

        if (!prevElement) {
            // try extracting first element from the previous layout
            const prevLayout = this.grid.columns.find(c => c.columnLayout && !c.hidden && c.visibleIndex === columnLayout.visibleIndex - 1);
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
                const hScroll = this.horizontalScroll(rowIndex);
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
        const layouts = this.grid.columns.filter(c => c.columnLayout && !c.hidden).sort((a, b) => a.visibleIndex - b.visibleIndex);
        const lastLayout = layouts[layouts.length - 1];
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
        const hScroll = this.horizontalScroll(rowIndex);
        const scrIndex = hScroll.igxForOf.indexOf(col.parent);
        this.grid.parentVirtDir.onChunkLoad
            .pipe(first())
            .subscribe(() => {
                this._focusCell(this.getCellElementByVisibleIndex(rowIndex, visibleColumnIndex, isSummary));
            });
        hScroll.scrollTo(scrIndex);
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
