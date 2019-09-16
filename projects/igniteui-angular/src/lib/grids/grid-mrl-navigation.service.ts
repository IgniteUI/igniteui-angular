import { Injectable } from '@angular/core';
import { IgxGridBaseComponent } from './grid-base.component';
import { first } from 'rxjs/operators';
import { IgxColumnComponent } from './column.component';
import { IgxGridNavigationService } from './grid-navigation.service';
import { ISelectionNode } from './selection/selection.service';


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

    private startNavigationCell: IStartNavigationCell;

    public grid: IgxGridBaseComponent;

    /**
     * @hidden
     * @internal
     */
    public setStartNavigationCell(colStart: number, rowStart: number, dir: NavigationDirection) {
        this.startNavigationCell = {
            colStart: colStart,
            rowStart: rowStart,
            direction: dir
        };
    }

    private applyNavigationCell(colStart: number, rowStart: number, navDirection: NavigationDirection): number {
        const oppositeDir = navDirection === NavigationDirection.vertical ?
            NavigationDirection.horizontal : NavigationDirection.vertical;
        if (this.startNavigationCell && this.startNavigationCell.direction !== navDirection) {
            this.startNavigationCell.direction = oppositeDir;
        } else {
            this.setStartNavigationCell(colStart, rowStart, oppositeDir);
        }

        return navDirection === NavigationDirection.vertical ?
            this.startNavigationCell.colStart : this.startNavigationCell.rowStart;
    }

    public navigateUp(rowElement: HTMLElement, selectedNode: ISelectionNode) {
        this.focusCellUpFromLayout(rowElement, selectedNode);
    }

    public navigateDown(rowElement: HTMLElement, selectedNode: ISelectionNode) {
        this.focusCellDownFromLayout(rowElement, selectedNode);
    }

    public isColumnRightEdgeVisible(visibleColumnIndex: number): boolean {
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

    public isColumnLeftEdgeVisible(visibleColumnIndex: number): boolean {
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

    public onKeydownArrowRight(element: HTMLElement, selectedNode: ISelectionNode) {
        this.focusNextCellFromLayout(element, selectedNode);
    }

    public onKeydownArrowLeft(element: HTMLElement, selectedNode: ISelectionNode) {
        this.focusPrevCellFromLayout(element, selectedNode);
    }
    public get gridOrderedColumns(): IgxColumnComponent[] {
        return [...this.grid.pinnedColumns, ...this.grid.unpinnedColumns].filter(c => !c.columnGroup)
        .sort((a, b) => a.visibleIndex - b.visibleIndex);
    }

    public performTab(currentRowEl: HTMLElement, selectedNode: ISelectionNode) {
        const visibleColumnIndex = selectedNode.layout ? selectedNode.layout.columnVisibleIndex : 0;
        const nextElementColumn = this.grid.columns.find(x => !x.columnGroup && x.visibleIndex === visibleColumnIndex + 1);
        const rowIndex = selectedNode.row;
        const row = this.grid.getRowByIndex(rowIndex);
        this._moveFocusToCell(currentRowEl, nextElementColumn, row, selectedNode, 'next');
        if (nextElementColumn) {
            this.setStartNavigationCell(nextElementColumn.colStart, nextElementColumn.rowStart, null);
        }
    }

    protected _moveFocusToCell(currentRowEl: HTMLElement, nextElementColumn, row, selectedNode, dir) {
        if (nextElementColumn && row.cells) {
            let nextCell = row.cells.find(currCell => currCell.column === nextElementColumn);
            const isVisible = this.isColumnRightEdgeVisible(nextElementColumn.visibleIndex);
            if (!nextCell || !isVisible) {
                this.grid.nativeElement.focus({ preventScroll: true });
                const cb = () => {
                    nextCell = row.cells.find(currCell => currCell.column === nextElementColumn);
                    if (this.grid.rowEditable && this.isRowInEditMode(row.index)) {
                        if (dir === 'next') {
                            this.moveNextEditable(row.index, selectedNode.layout.columnVisibleIndex);
                        } else {
                            this.movePreviousEditable(row.index, selectedNode.layout.columnVisibleIndex);
                        }
                        return;
                    }
                    this._focusCell(nextCell.nativeElement);
                };
                this.performHorizontalScrollToCell(row.index, nextElementColumn.visibleIndex, false, cb);
            } else {
                if (this.grid.rowEditable && this.isRowInEditMode(row.index)) {
                    if (dir === 'next') {
                        this.moveNextEditable(row.index, selectedNode.layout.columnVisibleIndex);
                    } else {
                        this.movePreviousEditable(row.index, selectedNode.layout.columnVisibleIndex);
                    }
                    return;
                }
                this._focusCell(nextCell.nativeElement);
            }
        } else {
            // end of layout reached
            if (this.isRowInEditMode(row.index)) {
                //  TODO: make gridAPI visible for internal use and remove cast to any
                (this.grid as any).gridAPI.submit_value();
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

    public performShiftTabKey(currentRowEl: HTMLElement, selectedNode: ISelectionNode) {
        const visibleColumnIndex = selectedNode.layout ? selectedNode.layout.columnVisibleIndex : 0;
        const rowIndex = selectedNode.row;
        const row = this.grid.getRowByIndex(rowIndex);
        const prevElementColumn =
         this.grid.columns.find(x => !x.columnGroup && x.visibleIndex === visibleColumnIndex - 1 && !x.hidden);
         this._moveFocusToCell(currentRowEl, prevElementColumn, row, selectedNode, 'prev');
        if (prevElementColumn) {
            this.setStartNavigationCell(prevElementColumn.colStart, prevElementColumn.rowStart, null);
        }
    }

    private focusCellUpFromLayout(rowElement: HTMLElement, selectedNode: ISelectionNode) {
        const isGroupRow = rowElement.tagName.toLowerCase() === 'igx-grid-groupby-row';
        const currentRowStart = selectedNode.layout ?  selectedNode.layout.rowStart : 1;
        const currentColStart = this.applyNavigationCell(selectedNode.layout ? selectedNode.layout.colStart : 1,
            currentRowStart,
            NavigationDirection.vertical);
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
                this.performVerticalScrollToCell(rowIndex, upperElementColumn.visibleIndex, cb);
        } else {
            cb();
        }
    }

    private focusCellDownFromLayout(rowElement: HTMLElement, selectedNode: ISelectionNode) {
        const isGroupRow = rowElement.tagName.toLowerCase() === 'igx-grid-groupby-row';
        const parentIndex = selectedNode.column;
        const columnLayout = this.grid.columns.find( x => x.columnLayout && x.visibleIndex === parentIndex);
        const currentRowEnd = selectedNode.layout ? selectedNode.layout.rowEnd || selectedNode.layout.rowStart + 1 : 2;
        const currentColStart = this.applyNavigationCell(selectedNode.layout ? selectedNode.layout.colStart : 1,
            selectedNode.layout ? selectedNode.layout.rowStart : 1,
            NavigationDirection.vertical);
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
                this.performVerticalScrollToCell(rowIndex, nextElementColumn.visibleIndex, cb);
        } else {
            cb();
        }
    }

    private focusNextCellFromLayout(cellElement: HTMLElement, selectedNode: ISelectionNode) {
        const parentIndex = selectedNode.column;
        let columnLayout = this.grid.columns.find( x => x.columnLayout && x.visibleIndex === parentIndex);
        const currentColEnd = selectedNode.layout.colEnd || selectedNode.layout.colStart + 1;
        const currentRowStart = this.applyNavigationCell(selectedNode.layout.colStart,
            selectedNode.layout.rowStart,
            NavigationDirection.horizontal);
        const rowIndex = selectedNode.row;
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
        }
        const cb = () => {
            const nextElement = nextElementColumn.cells.find((c) => c.rowIndex === rowIndex).nativeElement;
           this._focusCell(nextElement);
        };
        if (!this.isColumnRightEdgeVisible(nextElementColumn.visibleIndex)) {
            this.grid.nativeElement.focus({ preventScroll: true });
            this.performHorizontalScrollToCell(rowIndex, nextElementColumn.visibleIndex, false, cb);
        } else {
            cb();
        }
    }

    private focusPrevCellFromLayout(cellElement: HTMLElement, selectedNode: ISelectionNode) {
        const parentIndex = selectedNode.column;
        let columnLayout = this.grid.columns.find( x => x.columnLayout && x.visibleIndex === parentIndex);
        const currentColStart = selectedNode.layout.colStart;
        const currentRowStart = this.applyNavigationCell(currentColStart,
            selectedNode.layout.rowStart,
            NavigationDirection.horizontal);
        const rowIndex = selectedNode.row;

        // check previous element is from the same layout
        let prevElementColumn = columnLayout.children
        .find(c => (c.colEnd === currentColStart || c.colStart + c.gridColumnSpan === currentColStart ) &&
            c.rowStart <= currentRowStart &&
            (currentRowStart < c.rowEnd || currentRowStart < c.rowStart + c.gridRowSpan));
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
        }

        const cb = () => {
            const prevElement = prevElementColumn.cells.find((c) => c.rowIndex === rowIndex).nativeElement;
            this._focusCell(prevElement);
        };
        if (!this.isColumnLeftEdgeVisible(prevElementColumn.visibleIndex)) {
            this.grid.nativeElement.focus({ preventScroll: true });
            this.performHorizontalScrollToCell(rowIndex, prevElementColumn.visibleIndex, false, cb);
        } else {
            cb();
        }
    }

    public onKeydownEnd(rowIndex: number, isSummary: boolean = false, cellRowStart?: number) {
        const layouts = this.grid.columns.filter(c => c.columnLayout && !c.hidden).sort((a, b) => a.visibleIndex - b.visibleIndex);
        const lastLayout = layouts[layouts.length - 1];
        const lastLayoutChildren = lastLayout.children;
        const layoutSize =  lastLayout.getInitialChildColumnSizes(lastLayoutChildren).length;
        const currentRowStart = this.applyNavigationCell(
            this.startNavigationCell ? this.startNavigationCell.colStart : 1,
            cellRowStart || this.grid.multiRowLayoutRowSize,
            NavigationDirection.horizontal);
        const nextElementColumn = lastLayout.children.find(c =>
            (c.colEnd === layoutSize + 1 || c.colStart + c.gridColumnSpan === layoutSize + 1) &&
            c.rowStart <= currentRowStart &&
            (currentRowStart < c.rowEnd || currentRowStart < c.rowStart + c.gridRowSpan));
        const indexInLayout = lastLayoutChildren.toArray().indexOf(nextElementColumn);

        const rowList = isSummary ? this.grid.summariesRowList : this.grid.dataRowList;
        let rowElement = rowList.find((row) => row.index === rowIndex);
        if (!rowElement) { return; }
        rowElement = rowElement.nativeElement;

        if (!this.isColumnRightEdgeVisible(nextElementColumn.visibleIndex)) {
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

    public onKeydownHome(rowIndex: number, isSummary: boolean = false, cellRowStart: number = 1) {
        const firstLayout = this.grid.columns.filter(c => c.columnLayout && !c.hidden)[0];
        const lastLayoutChildren = firstLayout.children.toArray();
        const currentRowStart = this.applyNavigationCell(
            this.startNavigationCell ? this.startNavigationCell.colStart : 1,
            cellRowStart,
            NavigationDirection.horizontal);
        const nextElementColumn = firstLayout.children.find(c =>
            c.colStart === 1 &&
            c.rowStart <= currentRowStart &&
            (currentRowStart < c.rowEnd || currentRowStart < c.rowStart + c.gridRowSpan));
        const indexInLayout = lastLayoutChildren.indexOf(nextElementColumn);

        const rowList = isSummary ? this.grid.summariesRowList : this.grid.dataRowList;
        let rowElement = rowList.find((row) => row.index === rowIndex);
        if (!rowElement) { return; }
        rowElement = rowElement.nativeElement;

        if (!this.isColumnLeftEdgeVisible(nextElementColumn.visibleIndex)) {
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

    protected getColumnLayoutSelector(): string {
        return '.igx-grid__mrl-block';
    }

    protected getChildColumnScrollPositions(visibleColIndex: number): { leftScroll: number, rightScroll: number } {
        const forOfDir = this.grid.dataRowList.length > 0 ? this.grid.dataRowList.first.virtDirRow : this.grid.headerContainer;
        const targetCol: IgxColumnComponent = this.getColunmByVisibleIndex(visibleColIndex);
        const parent = targetCol.parent;
        const parentVIndex = forOfDir.igxForOf.indexOf(parent);
        let leftScroll = forOfDir.getColumnScrollLeft(parentVIndex), rightScroll = 0;
        // caculate offset from parent based on target column colStart and colEnd and the resolved child column sizes.
        const childSizes = parent.getFilledChildColumnSizes(parent.children);
        const colStart = targetCol.colStart || 1;
        const colEnd = targetCol.colEnd || colStart + 1;
        for (let i = 1; i < colStart; i++) {
            leftScroll += parseInt(childSizes[i - 1], 10);
        }
        rightScroll += leftScroll;
        for (let j = colStart; j < colEnd; j++) {
            rightScroll +=  parseInt(childSizes[j - 1], 10);
        }
        return {leftScroll, rightScroll};
    }

    protected getColunmByVisibleIndex(visibleColIndex: number): IgxColumnComponent {
        visibleColIndex = visibleColIndex < 0 ? 0 : visibleColIndex;
        return this.grid.columnList.find((col) => !col.columnLayout && col.visibleIndex === visibleColIndex);
    }

    public shouldPerformVerticalScroll(rowIndex: number, visibleColumnIndex: number): boolean {
        if (this._isGroupRecordAt(rowIndex)) {
            return super.shouldPerformVerticalScroll(rowIndex, visibleColumnIndex);
       }
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

   get verticalDCTopOffset(): number {
        return parseInt(this.grid.verticalScrollContainer.dc.instance._viewContainer.element.nativeElement.style.top, 10);
    }

    private _isGroupRecordAt(rowIndex: number) {
        const record = this.grid.verticalScrollContainer.igxForOf[rowIndex];
        return record.records && record.records.length;
    }

    public performVerticalScrollToCell(rowIndex: number, visibleColumnIndex: number, cb?: () => void) {
        if (this._isGroupRecordAt(rowIndex)) {
            return super.performVerticalScrollToCell(rowIndex, visibleColumnIndex, cb);
        }
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

    public getVerticalScrollPositions(rowIndex: number, visibleColIndex: number): { rowTop: number, rowBottom: number, topOffset: number } {
        const targetCol: IgxColumnComponent = this.getColunmByVisibleIndex(visibleColIndex);
        const topOffset = (targetCol.rowStart - 1)  * this.grid.defaultRowHeight;
        const rowTop = this.grid.verticalScrollContainer.sizesCache[rowIndex] + topOffset;
        const rowBottom = rowTop + (this.grid.defaultRowHeight * targetCol.gridRowSpan);
        return { rowTop, rowBottom, topOffset };
    }

    public performHorizontalScrollToCell(
        rowIndex: number, visibleColumnIndex: number, isSummary: boolean = false, cb?: () => void) {
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
        const isPrevItem =  hScroll.getHorizontalScroll().scrollLeft > scrollPos.leftScroll;
        const containerSize = parseInt(hScroll.igxForContainerSize, 10);
        const nextScroll = isPrevItem ? scrollPos.leftScroll : scrollPos.rightScroll - containerSize;
        hScroll.getHorizontalScroll().scrollLeft = nextScroll;
    }

    protected _focusCell(cellElem: HTMLElement) {
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

    public goToFirstCell() {
        this.startNavigationCell = null;
        super.goToFirstCell();
    }

    public goToLastCell() {
        this.startNavigationCell = null;
        super.goToLastCell();
    }
}
