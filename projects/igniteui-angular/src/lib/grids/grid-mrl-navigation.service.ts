import { Injectable } from '@angular/core';
import { IgxGridBaseComponent, FilterMode } from './grid-base.component';
import { first } from 'rxjs/operators';
import { IgxColumnComponent } from './column.component';
import { IgxGridNavigationService } from './grid-navigation.service';
import { ISelectionNode } from '../core/grid-selection';

/** @hidden */
@Injectable()
export class IgxGridMRLNavigationService extends IgxGridNavigationService {
    public grid: IgxGridBaseComponent;

    public navigateUp(rowElement, selectedNode: ISelectionNode) {
        this.focusCellUpFromLayout(rowElement, selectedNode);
    }

    public navigateDown(rowElement, selectedNode: ISelectionNode) {
        this.focusCellDownFromLayout(rowElement, selectedNode);
    }

    public isColumnFullyVisible(visibleColumnIndex: number) {
        const column = this.grid.columnList.filter(c => !c.columnGroup).find((col) => col.visibleIndex === visibleColumnIndex);
        const forOfDir =  this.grid.headerContainer;
        const horizontalScroll = forOfDir.getHorizontalScroll();
        if (!horizontalScroll.clientWidth || (column && column.pinned)) {
            return true;
        } else if (column) {
            if (this.isParentColumnFullyVisible(column)) { return true; }
            const scrollPos = this.getChildColumnScrollPositions(visibleColumnIndex);
            return this.displayContainerWidth >= scrollPos.rightScroll - this.displayContainerScrollLeft &&
            this.displayContainerScrollLeft <= scrollPos.leftScroll;
        }
        return false;
    }
    private isParentColumnFullyVisible(parent: IgxColumnComponent): boolean {
        const forOfDir = this.grid.dataRowList.length > 0 ? this.grid.dataRowList.first.virtDirRow : this.grid.headerContainer;
        const horizontalScroll = forOfDir.getHorizontalScroll();
        if (!horizontalScroll.clientWidth || parent.pinned) { return true; }
        const index = forOfDir.igxForOf.indexOf(parent);
        return this.displayContainerWidth >= forOfDir.getColumnScrollLeft(index + 1) - this.displayContainerScrollLeft &&
            this.displayContainerScrollLeft <= forOfDir.getColumnScrollLeft(index);
    }

    public isColumnLeftFullyVisible(visibleColumnIndex: number) {
        const forOfDir = this.grid.headerContainer;
        const horizontalScroll = forOfDir.getHorizontalScroll();
        const column = this.grid.columnList.filter(c => !c.columnGroup).find((col) => col.visibleIndex === visibleColumnIndex);
        if (!horizontalScroll.clientWidth || column.pinned) {
            return true;
        }
        if (this.isParentColumnFullyVisible(column)) { return true; }
        const scrollPos = this.getChildColumnScrollPositions(visibleColumnIndex);
        return this.displayContainerScrollLeft <= scrollPos.leftScroll;
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
    }

    protected _moveFocusToCell(currentRowEl, nextElementColumn, row, selectedNode, dir) {
        if (nextElementColumn) {
            let nextCell = row.cells.find(currCell => currCell.column === nextElementColumn);
            const isVisible = this.isColumnFullyVisible(nextElementColumn.visibleIndex);
            if (!nextCell || !isVisible) {
                this.grid.nativeElement.focus({ preventScroll: true });
                const cb = () => {
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
                };
                this.performHorizontalScrollToCell(row.index, nextElementColumn.visibleIndex, false, cb);
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
    }

    private focusCellUpFromLayout(rowElement, selectedNode: ISelectionNode) {
        const isGroupRow = rowElement.tagName.toLowerCase() === 'igx-grid-groupby-row';
        const currentRowStart = selectedNode.layout ?  selectedNode.layout.rowStart : 1;
        const currentColStart = selectedNode.layout ? selectedNode.layout.colStart : 1;
        const parentIndex = selectedNode.column;
        const columnLayout = this.grid.columns.find( x => x.columnLayout && x.visibleIndex === parentIndex);
        let movePrev;
        // check if element up is from the same layout
        let upperElementColumn = columnLayout.children.find(c =>
            (c.rowEnd === currentRowStart || c.rowStart + c.gridRowSpan === currentRowStart)  &&
            c.colStart <= currentColStart &&
            (currentColStart < c.colEnd || currentColStart < c.colStart + c.gridColumnSpan));
        if (isGroupRow || !upperElementColumn) {
            // no prev row in current row layout, go to next row last rowstart
            const layoutRowEnd = this.grid.multiRowLayoutRowSize + 1;
            upperElementColumn = columnLayout.children.find(c =>
                (c.rowEnd === layoutRowEnd || c.rowStart + c.gridRowSpan === layoutRowEnd) &&
                c.colStart <= currentColStart &&
                (currentColStart < c.colEnd || currentColStart < c.colStart + c.gridColumnSpan));
            movePrev = true;
        }
        const rowIndex = movePrev ? selectedNode.row - 1 : selectedNode.row;
        if (rowIndex < 0) {
            // end of rows reached.
            return;
        }
        let prevRow;
        const cb = () => {
            prevRow = this.grid.getRowByIndex(rowIndex);
            if (prevRow && prevRow.cells) {
                this._focusCell(upperElementColumn.cells.find((c) => c.rowIndex === prevRow.index).nativeElement);
            } else if (prevRow) {
                prevRow.nativeElement.focus({ preventScroll: true });
            }
        };
        if (this.shouldPerformVerticalScroll(rowIndex, upperElementColumn.visibleIndex)) {
            this.grid.nativeElement.focus({ preventScroll: true });
                this.performVerticalScroll(rowIndex, upperElementColumn.visibleIndex, cb);
        } else {
            cb();
        }
    }

    private focusCellDownFromLayout(rowElement, selectedNode: ISelectionNode) {
        const isGroupRow = rowElement.tagName.toLowerCase() === 'igx-grid-groupby-row';
        const parentIndex = selectedNode.column;
        const columnLayout = this.grid.columns.find( x => x.columnLayout && x.visibleIndex === parentIndex);
        const currentRowEnd = selectedNode.layout ? selectedNode.layout.rowEnd || selectedNode.layout.rowStart + 1 : 2;
        const currentColStart = selectedNode.layout ? selectedNode.layout.colStart : 1;
        let moveNext;
        // check if element down is from the same layout
        let nextElementColumn = columnLayout.children.find(c => c.rowStart === currentRowEnd &&
            c.colStart <= currentColStart &&
            (currentColStart < c.colEnd || currentColStart < c.colStart + c.gridColumnSpan));
        if (isGroupRow || !nextElementColumn) {
            // no next row in current row layout, go to next row first rowstart
            nextElementColumn = columnLayout.children.find(c => c.rowStart === 1 &&
                c.colStart <= currentColStart &&
                (currentColStart < c.colEnd || currentColStart < c.colStart + c.gridColumnSpan));
            moveNext = true;
        }
        const rowIndex = moveNext ? selectedNode.row + 1 : selectedNode.row;
        if (rowIndex > this.grid.verticalScrollContainer.igxForOf.length - 1) {
            // end of rows reached.
            return;
        }
        let nextRow;
        const cb = () => {
            nextRow = this.grid.getRowByIndex(rowIndex);
            if (nextRow && nextRow.cells) {
                this._focusCell(nextElementColumn.cells.find((c) => c.rowIndex === nextRow.index).nativeElement);
            } else if (nextRow) {
                nextRow.nativeElement.focus({ preventScroll: true });
            }
        };
        if (this.shouldPerformVerticalScroll(rowIndex, nextElementColumn.visibleIndex)) {
            this.grid.nativeElement.focus({ preventScroll: true });
                this.performVerticalScroll(rowIndex, nextElementColumn.visibleIndex, cb);
        } else {
            cb();
        }
    }

    private focusNextCellFromLayout(cellElement, selectedNode: ISelectionNode) {
        const parentIndex = selectedNode.column;
        let columnLayout = this.grid.columns.find( x => x.columnLayout && x.visibleIndex === parentIndex);
        const currentColEnd = selectedNode.layout.colEnd || selectedNode.layout.colStart + 1;
        const currentRowStart = selectedNode.layout.rowStart;
        const rowIndex = selectedNode.row;
        let element = cellElement.parentElement;
        // check if next element is from the same layout
        let nextElementColumn = columnLayout.children.find(c => c.colStart === currentColEnd &&
            c.rowStart <= currentRowStart &&
            (currentRowStart < c.rowEnd || currentRowStart < c.rowStart + c.gridRowSpan));
        if (!nextElementColumn) {
            // no next column in current layout, search for next layout
            columnLayout = this.grid.columns.find(c => c.columnLayout && !c.hidden && c.visibleIndex === columnLayout.visibleIndex + 1);
            if (!columnLayout) {
                // reached the end
                return null;
            }
            // next element is from the next layout
            nextElementColumn = columnLayout.children.find(c => c.colStart === 1 &&
                c.rowStart <= currentRowStart &&
                (currentRowStart < c.rowEnd || currentRowStart < c.rowStart + c.gridRowSpan));
            element = element.nextElementSibling;
        }
        const columnIndex = columnLayout.children.toArray().indexOf(nextElementColumn);
        let nextElement = element.children[columnIndex];

        const cb = () => {
            nextElement = element.children[columnIndex];
            nextElement.focus({ preventScroll: true });
        };
        if (element.classList.contains('igx-grid__td--pinned-last')) {
            nextElement = element.nextElementSibling.children[0].children[columnIndex];
            nextElement.focus({ preventScroll: true });
        } else if (!this.isColumnFullyVisible(nextElementColumn.visibleIndex)) {
            this.grid.nativeElement.focus({ preventScroll: true });
            this.performHorizontalScrollToCell(rowIndex, nextElementColumn.visibleIndex, false, cb);
        } else {
            cb();
        }
    }

    private focusPrevCellFromLayout(cellElement, selectedNode: ISelectionNode) {
        const parentIndex = selectedNode.column;
        let columnLayout = this.grid.columns.find( x => x.columnLayout && x.visibleIndex === parentIndex);
        const currentColStart = selectedNode.layout.colStart;
        const currentRowStart = selectedNode.layout.rowStart;
        const rowIndex = selectedNode.row;

        // check previous element is from the same layout
        let prevElementColumn = columnLayout.children
        .find(c => (c.colEnd === currentColStart || c.colStart + c.gridColumnSpan === currentColStart ) &&
            c.rowStart <= currentRowStart &&
            (currentRowStart < c.rowEnd || currentRowStart < c.rowStart + c.gridRowSpan));
        let element = cellElement.parentElement;
        if (!prevElementColumn) {
            // no prev column in current layout, seacrh for prev layout
            columnLayout = this.grid.columns.find(c => c.columnLayout && !c.hidden && c.visibleIndex === columnLayout.visibleIndex - 1);
            if (!columnLayout) {
                // reached the end
                return null;
            }
            const layoutSize = columnLayout.getInitialChildColumnSizes(columnLayout.children).length;
            // first element is from the next layout
            prevElementColumn = columnLayout.children
            .find(c => (c.colEnd === layoutSize + 1 || c.colStart + c.gridColumnSpan === layoutSize + 1) &&
                c.rowStart <= currentRowStart &&
                (currentRowStart < c.rowEnd || currentRowStart < c.rowStart + c.gridRowSpan));
            element = element.previousElementSibling;
        }

        const columnIndex = columnLayout.children.toArray().indexOf(prevElementColumn);
        let prevElement = element.children[columnIndex];

        const cb = () => {
            prevElement = element.children[columnIndex];
            prevElement.focus({ preventScroll: true });
        };
        if (!this.isColumnLeftFullyVisible(prevElementColumn.visibleIndex)) {
            this.grid.nativeElement.focus({ preventScroll: true });
            this.performHorizontalScrollToCell(rowIndex, prevElementColumn.visibleIndex, false, cb);
        } else {
            cb();
        }
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
            const cb = () => {
                const allBlocks = rowElement.querySelectorAll(this.getColumnLayoutSelector());
                const cell = allBlocks[allBlocks.length - 1].children[indexInLayout];
                this._focusCell(cell);
            };
            this.performHorizontalScrollToCell(rowIndex, nextElementColumn.visibleIndex, false, cb);
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
           const cb = () => {
                const allBlocks = rowElement.querySelectorAll(this.getColumnLayoutSelector());
                const cell = allBlocks[0].children[indexInLayout];
                this._focusCell(cell);
            };
            this.performHorizontalScrollToCell(rowIndex, nextElementColumn.visibleIndex, false, cb);
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

    protected getChildColumnScrollPositions(visibleColIndex: number) {
        const forOfDir = this.grid.dataRowList.length > 0 ? this.grid.dataRowList.first.virtDirRow : this.grid.headerContainer;
        const targetCol: IgxColumnComponent = this.getColunmByVisibleIndex(visibleColIndex);
        const parent = targetCol.parent;
        const parentVIndex = forOfDir.igxForOf.indexOf(parent);
        let leftScroll = forOfDir.getColumnScrollLeft(parentVIndex), rightScroll = 0;
        parent.children.forEach((c) => {
            const rowEnd = c.rowEnd !== undefined ? c.rowEnd : c.rowStart + 1;
            const targetRowEnd = targetCol.rowEnd !== undefined ? targetCol.rowEnd : targetCol.rowStart + 1;
            if (c.rowStart >= targetCol.rowStart && rowEnd >= targetRowEnd && c.visibleIndex < targetCol.visibleIndex) {
                leftScroll += parseInt(c.calcWidth, 10);
            }
        });
        rightScroll = leftScroll + parseInt(targetCol.width, 10);
        return {leftScroll, rightScroll};
    }

    protected getColunmByVisibleIndex(visibleColIndex: number): IgxColumnComponent {
        visibleColIndex = visibleColIndex < 0 ? 0 : visibleColIndex;
        return this.grid.columnList.find((col) => !col.columnLayout && col.visibleIndex === visibleColIndex);
    }

    public shouldPerformVerticalScroll(rowIndex: number, visibleColumnIndex: number): boolean {
        if (!super.shouldPerformVerticalScroll(rowIndex, visibleColumnIndex)) {return false; }
       const targetRow = this.grid.summariesRowList.filter(s => s.index !== 0)
           .concat(this.grid.rowList.toArray()).find(r => r.index === rowIndex);
       const scrollTop =  Math.abs(this.grid.verticalScrollContainer.getVerticalScroll().scrollTop);
       const containerHeight = this.grid.calcHeight ? Math.ceil(this.grid.calcHeight) : 0;
       const scrollPos = this.getVerticalScrollPositions(rowIndex, visibleColumnIndex);
       if (!targetRow || targetRow.nativeElement.offsetTop + scrollPos.topOffset < Math.abs(this.verticalDCTopOffset)
           || containerHeight && containerHeight < scrollPos.rowBottom - scrollTop) {
           return true;
       } else {
           return false;
       }
   }

   get verticalDCTopOffset() {
        return  parseInt(this.grid.verticalScrollContainer.dc.instance._viewContainer.element.nativeElement.style.top, 10);
    }

    public performVerticalScroll(rowIndex: number, visibleColumnIndex: number, cb?) {
        const containerHeight = this.grid.calcHeight ? Math.ceil(this.grid.calcHeight) : 0;
        const scrollTop = Math.abs(this.grid.verticalScrollContainer.getVerticalScroll().scrollTop);
        const scrollPos = this.getVerticalScrollPositions(rowIndex, visibleColumnIndex);
        const targetRow = this.grid.summariesRowList.filter(s => s.index !== 0)
            .concat(this.grid.rowList.toArray()).find(r => r.index === rowIndex);
        const isPrevious =  (scrollTop > scrollPos.rowTop) && (!targetRow ||
                targetRow.nativeElement.offsetTop + scrollPos.topOffset < Math.abs(this.verticalDCTopOffset));
        const scrollAmount = isPrevious ? scrollPos.rowTop : Math.abs(scrollTop + containerHeight - scrollPos.rowBottom);

        this.grid.verticalScrollContainer.onChunkLoad
        .pipe(first()).subscribe(() => {
            cb();
        });

        if (isPrevious) {
            this.grid.verticalScrollContainer.getVerticalScroll().scrollTop = scrollAmount;
        } else {
            this.grid.verticalScrollContainer.addScrollTop(scrollAmount);
        }
    }

    public getVerticalScrollPositions(rowIndex: number, visibleColIndex: number) {
        const targetCol: IgxColumnComponent = this.getColunmByVisibleIndex(visibleColIndex);
        const topOffset = (targetCol.rowStart - 1)  * this.grid.defaultRowHeight;
        const rowTop = this.grid.verticalScrollContainer.sizesCache[rowIndex] + topOffset;
        const rowBottom = rowTop + (this.grid.defaultRowHeight * targetCol.gridRowSpan);
        return { rowTop, rowBottom, topOffset };
    }

    public performHorizontalScrollToCell(rowIndex, visibleColumnIndex, isSummary = false, cb?) {
        const scrollPos = this.getChildColumnScrollPositions(visibleColumnIndex);
        const hScroll = this.horizontalScroll(rowIndex);
        this.grid.parentVirtDir.onChunkLoad
            .pipe(first())
            .subscribe(() => {
                if (cb) {
                    cb();
                } else {
                    this._focusCell(this.getCellElementByVisibleIndex(rowIndex, visibleColumnIndex, isSummary));
                }
        });
        const nextScroll = !(this.displayContainerScrollLeft <= scrollPos.leftScroll) &&
        this.displayContainerWidth >= scrollPos.rightScroll - this.displayContainerScrollLeft ?
        scrollPos.leftScroll : scrollPos.rightScroll - this.displayContainerWidth;
        hScroll.getHorizontalScroll().scrollLeft = nextScroll;
    }

    protected _focusCell(cellElem) {
        // in case of variable row heights in mrl grid make sure cell is really in view after it has been rendered.
        const gridBoundingClientRect = this.grid.tbody.nativeElement.getBoundingClientRect();
        const diffTop = cellElem.getBoundingClientRect().top - gridBoundingClientRect.top;
        const diffBottom = cellElem.getBoundingClientRect().bottom - gridBoundingClientRect.bottom;
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
            cellElem.focus({ preventScroll: true });
        }
    }
}
