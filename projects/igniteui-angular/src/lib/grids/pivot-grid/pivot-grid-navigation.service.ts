import { IActiveNode, IgxGridNavigationService } from '../grid-navigation.service';
import { Injectable } from '@angular/core';
import { IgxPivotGridComponent } from './pivot-grid.component';
import { HEADER_KEYS } from '../../core/utils';
import { IgxPivotRowDimensionMrlRowComponent } from './pivot-row-dimension-mrl-row.component';
import { IMultiRowLayoutNode } from '../public_api';

@Injectable()
export class IgxPivotGridNavigationService extends IgxGridNavigationService {
    public override grid: IgxPivotGridComponent;
    protected _isRowHeaderActive = false;
    protected _isRowDimensionHeaderActive = false;

    public set isRowHeaderActive(value: boolean) {
        this._isRowHeaderActive = value;
    }
    public get isRowHeaderActive() {
        return this._isRowHeaderActive;
    }

    public set isRowDimensionHeaderActive(value: boolean) {
        this._isRowDimensionHeaderActive = value;
    }
    public get isRowDimensionHeaderActive() {
        return this._isRowDimensionHeaderActive;
    }

    public get lastRowDimensionsIndex() {
        return this.grid.visibleRowDimensions.length - 1;
    }

    public focusOutRowHeader() {
        this.isRowHeaderActive = false;
        this.isRowDimensionHeaderActive = false;
    }

    public override handleNavigation(event: KeyboardEvent) {
        if (this.isRowHeaderActive) {
            const key = event.key.toLowerCase();
            const ctrl = event.ctrlKey;
            if (!HEADER_KEYS.has(key)) {
                return;
            }
            event.preventDefault();

            const newActiveNode: IActiveNode = {
                row: this.activeNode.row,
                column: this.activeNode.column,
                level: null,
                mchCache: null,
                layout: this.activeNode.layout
            }

            let verticalContainer;
            if (this.grid.horizontalRowDimensions) {
                let newPosition = {
                    row: this.activeNode.row,
                    column: this.activeNode.column,
                    layout: this.activeNode.layout
                };
                verticalContainer = this.grid.verticalRowDimScrollContainers.first;
                if (key.includes('left')) {
                    newPosition = this.getNextHorizontalPosition(true, ctrl);
                }
                if (key.includes('right')) {
                    newPosition = this.getNextHorizontalPosition(false, ctrl);
                }
                if (key.includes('up') || key === 'home') {
                    newPosition = this.getNextVerticalPosition(true, ctrl || key === 'home', key === 'home');
                }

                if (key.includes('down') || key === 'end') {
                    newPosition = this.getNextVerticalPosition(false, ctrl || key === 'end', key === 'end');
                }

                newActiveNode.row = newPosition.row;
                newActiveNode.column = newPosition.column;
                newActiveNode.layout = newPosition.layout;
            } else {
                if ((key.includes('left') || key === 'home') && this.activeNode.column > 0) {
                    newActiveNode.column = ctrl || key === 'home' ? 0 : this.activeNode.column - 1;
                }
                if ((key.includes('right') || key === 'end') && this.activeNode.column < this.lastRowDimensionsIndex) {
                    newActiveNode.column = ctrl || key === 'end' ? this.lastRowDimensionsIndex : this.activeNode.column + 1;
                }

                verticalContainer = this.grid.verticalRowDimScrollContainers.toArray()[newActiveNode.column];
                if (key.includes('up') && this.activeNode.row > 0) {
                    newActiveNode.row = ctrl ? 0 : this.activeNode.row - 1;
                } else if (key.includes('up')) {
                    newActiveNode.row = 0;
                    newActiveNode.column = newActiveNode.layout.colStart - 1;
                    newActiveNode.layout = null;
                    this.isRowDimensionHeaderActive = true;
                    this.isRowHeaderActive = false;
                    this.grid.theadRow.nativeElement.focus();
                }

                if (key.includes('down') && this.activeNode.row < this.findLastDataRowIndex()) {
                    newActiveNode.row = ctrl ? verticalContainer.igxForOf.length - 1 : Math.min(this.activeNode.row + 1, verticalContainer.igxForOf.length - 1);
                }

                if (key.includes('left') || key.includes('right')) {
                    const prevRIndex = this.activeNode.row;
                    const prevScrContainer = this.grid.verticalRowDimScrollContainers.toArray()[this.activeNode.column];
                    const src = prevScrContainer.getScrollForIndex(prevRIndex);
                    newActiveNode.row = this.activeNode.mchCache && this.activeNode.mchCache.level === newActiveNode.column ?
                        this.activeNode.mchCache.visibleIndex :
                        verticalContainer.getIndexAtScroll(src);
                    newActiveNode.mchCache = {
                        visibleIndex: this.activeNode.row,
                        level: this.activeNode.column
                    };
                }
            }

            this.setActiveNode(newActiveNode);
            if (verticalContainer.isIndexOutsideView(newActiveNode.row)) {
                verticalContainer.scrollTo(newActiveNode.row);
            }
        } else {
            super.handleNavigation(event);
        }
    }

    public override headerNavigation(event: KeyboardEvent) {
        const key = event.key.toLowerCase();
        const ctrl = event.ctrlKey;
        if (!HEADER_KEYS.has(key)) {
            return;
        }

        if (this.isRowDimensionHeaderActive) {
            event.preventDefault();

            const newActiveNode: IActiveNode = {
                row: this.activeNode.row,
                column: this.activeNode.column,
                level: null,
                mchCache: this.activeNode.mchCache,
                layout: null
            }

            if ((key.includes('left') || key === 'home') && this.activeNode.column > 0) {
                newActiveNode.column = ctrl || key === 'home' ? 0 : this.activeNode.column - 1;
            }
            if ((key.includes('right') || key === 'end') && this.activeNode.column < this.lastRowDimensionsIndex) {
                newActiveNode.column = ctrl || key === 'end' ? this.lastRowDimensionsIndex : this.activeNode.column + 1;
            } else if (key.includes('right')) {
                this.isRowDimensionHeaderActive = false;
                newActiveNode.column = 0;
                newActiveNode.level = this.activeNode.mchCache?.level || 0;
                newActiveNode.mchCache = this.activeNode.mchCache || {
                    level: 0,
                    visibleIndex: 0
                };
            }

            if (key.includes('down')) {
                if (this.grid.horizontalRowDimensions) {
                    this.activeNode.row = 0;
                    this.activeNode.layout = {
                        rowStart: 1,
                        rowEnd: 2,
                        colStart: newActiveNode.column + 1,
                        colEnd: newActiveNode.column + 2,
                        columnVisibleIndex: newActiveNode.column
                    };

                    const newPosition = this.getNextVerticalPosition(true, ctrl || key === 'home', key === 'home');
                    newActiveNode.row = 0;
                    newActiveNode.column = newPosition.column;
                    newActiveNode.layout = newPosition.layout;
                } else {
                    const verticalContainer = this.grid.verticalRowDimScrollContainers.toArray()[newActiveNode.column];
                    newActiveNode.row = ctrl ? verticalContainer.igxForOf.length - 1 : 0;
                }

                this.isRowDimensionHeaderActive = false;
                this.isRowHeaderActive = true;
                this.grid.rowDimensionContainer.toArray()[this.grid.horizontalRowDimensions ? 0 : newActiveNode.column].nativeElement.focus();
            }

            this.setActiveNode(newActiveNode);
        } else if (key.includes('left') && this.activeNode.column === 0) {
            this.isRowDimensionHeaderActive = true;
            const newActiveNode: IActiveNode = {
                row: this.activeNode.row,
                column: this.lastRowDimensionsIndex,
                level: null,
                mchCache: this.activeNode.mchCache,
                layout: null
            }

            this.setActiveNode(newActiveNode);
        } else {
            super.headerNavigation(event);
        }
    }

    public override focusTbody(event) {
        if (!this.activeNode || this.activeNode.row === null || this.activeNode.row === undefined) {
            this.activeNode = this.lastActiveNode;
        } else {
            super.focusTbody(event);
        }
    }

    public getNextVerticalPosition(previous, ctrl, homeEnd) {
        const parentRow = this.grid.rowDimensionMrlRowsCollection.toArray()[this.activeNode.row];
        const maxRowEnd = parentRow.rowGroup.length + 1;
        const curCellLayout = this.getNextVerticalColumnIndex(parentRow, this.activeNode.layout.rowStart, this.activeNode.layout.colStart);
        const nextBlock = (previous && curCellLayout.rowStart === 1) || (!previous && curCellLayout.rowEnd === maxRowEnd);
        if (nextBlock &&
            ((previous && this.activeNode.row === 0) ||
            (!previous && this.activeNode.row === this.grid.rowDimensionMrlRowsCollection.length - 1))) {
            if (previous && this.grid.pivotUI.showRowHeaders) {
                this.isRowDimensionHeaderActive = true;
                this.isRowHeaderActive = false;
                this.grid.theadRow.nativeElement.focus();
                return  { row: -1, column: this.activeNode.layout.colStart - 1, layout: this.activeNode.layout };
            }
            return { row: this.activeNode.row, column: this.activeNode.column, layout: this.activeNode.layout };
        }

        const nextRowIndex = previous ?
            (ctrl ? 0 : this.activeNode.row - 1) :
            (ctrl ? this.grid.rowDimensionMrlRowsCollection.length - 1 : this.activeNode.row + 1) ;
        const nextRow = nextBlock || ctrl ? this.grid.rowDimensionMrlRowsCollection.toArray()[nextRowIndex] : parentRow;
        const nextRowStart = nextBlock ? (previous ? nextRow.rowGroup.length : 1) : curCellLayout.rowStart  + (previous ? -1 : 1);
        const maxColEnd = Math.max(...nextRow.contentCells.map(cell => cell.layout.colEnd));
        const nextColumnLayout = this.getNextVerticalColumnIndex(
            nextRow,
            ctrl ? (previous ? 1 : nextRow.rowGroup.length) : nextRowStart,
            homeEnd ? (previous ? 1 : maxColEnd - 1) : this.activeNode.layout.colStart
        );
        return {
            row: nextBlock || ctrl ? nextRowIndex : this.activeNode.row,
            column: nextColumnLayout.columnVisibleIndex,
            layout: {
                rowStart: nextColumnLayout.rowStart,
                rowEnd: nextColumnLayout.rowEnd,
                colStart: homeEnd ? nextColumnLayout.colStart : this.activeNode.layout.colStart,
                colEnd: nextColumnLayout.colEnd,
                columnVisibleIndex: nextColumnLayout.columnVisibleIndex
            } as IMultiRowLayoutNode
        };
    }

    public getNextHorizontalPosition(previous, ctrl) {
        const parentRow = this.grid.rowDimensionMrlRowsCollection.toArray()[this.activeNode.row];
        const maxColEnd = Math.max(...parentRow.contentCells.map(cell => cell.layout.colEnd));
        const curCellLayout = this.getNextVerticalColumnIndex(parentRow, this.activeNode.layout.rowStart, this.activeNode.layout.colStart);

        if ((previous && curCellLayout.colStart === 1) || (!previous && curCellLayout.colEnd === maxColEnd)) {
            return { row: this.activeNode.row, column: this.activeNode.column, layout: this.activeNode.layout };
        }

        const nextColumnLayout = this.getNextVerticalColumnIndex(
            parentRow,
            this.activeNode.layout.rowStart,
            ctrl ? (previous ? 1 : maxColEnd - 1) : curCellLayout.colStart + (previous ? -1 : 1)
        );
        return {
            row: this.activeNode.row,
            column: nextColumnLayout.columnVisibleIndex,
            layout: {
                rowStart: this.activeNode.layout.rowStart,
                rowEnd: nextColumnLayout.rowEnd,
                colStart: nextColumnLayout.colStart,
                colEnd: nextColumnLayout.colEnd,
                columnVisibleIndex: nextColumnLayout.columnVisibleIndex
            } as IMultiRowLayoutNode
        };
    }


    private getNextVerticalColumnIndex(nextRow: IgxPivotRowDimensionMrlRowComponent, newRowStart, newColStart) {
        const nextCell = nextRow.contentCells.find(cell => {
            return cell.layout.rowStart <= newRowStart && newRowStart < cell.layout.rowEnd &&
                cell.layout.colStart <= newColStart && newColStart < cell.layout.colEnd;
        });
        return nextCell.layout;
    }
}
