import { IActiveNode, IgxGridNavigationService } from '../grid-navigation.service';
import { Injectable } from '@angular/core';
import { IgxPivotGridComponent } from './pivot-grid.component';
import { HEADER_KEYS, ROW_COLLAPSE_KEYS, ROW_EXPAND_KEYS } from '../../core/utils';
import { PivotUtil } from './pivot-util';
import { IgxPivotRowDimensionMrlRowComponent } from './pivot-row-dimension-mrl-row.component';
import { IMultiRowLayoutNode } from '../public_api';
import { SortingDirection } from '../../data-operations/sorting-strategy';
import { take, timeout } from 'rxjs/operators';
import { IPivotDimension, IPivotGridRecord, PivotSummaryPosition } from './pivot-grid.interface';

@Injectable()
export class IgxPivotGridNavigationService extends IgxGridNavigationService {
    public override grid: IgxPivotGridComponent;
    public isRowHeaderActive = false;
    public isRowDimensionHeaderActive = false;

    public get lastRowDimensionsIndex() {
        return this.grid.visibleRowDimensions.length - 1;
    }

    public get lastRowDimensionMRLRowIndex() {
        return this.grid.verticalRowDimScrollContainers.first.igxGridForOf.length - 1;
    }

    public focusOutRowHeader() {
        this.isRowHeaderActive = false;
        this.isRowDimensionHeaderActive = false;
    }

    public override async handleNavigation(event: KeyboardEvent) {
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

            if (event.altKey) {
                this.handleAlt(key, event);
                return;
            }

            let verticalContainer;
            if (this.grid.hasHorizontalLayout) {
                let newPosition = {
                    row: this.activeNode.row,
                    column: this.activeNode.column,
                    layout: this.activeNode.layout
                };
                verticalContainer = this.grid.verticalRowDimScrollContainers.first;
                if (key.includes('left')) {
                    newPosition = await this.getNextHorizontalPosition(true, ctrl);
                }
                if (key.includes('right')) {
                    newPosition = await this.getNextHorizontalPosition(false, ctrl);
                }
                if (key.includes('up') || key === 'home') {
                    newPosition = await this.getNextVerticalPosition(true, ctrl || key === 'home', key === 'home');
                }

                if (key.includes('down') || key === 'end') {
                    newPosition = await this.getNextVerticalPosition(false, ctrl || key === 'end', key === 'end');
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
                if (key.includes('up')) {
                    if (ctrl) {
                        newActiveNode.row = 0;
                    } else if (this.activeNode.row > 0) {
                        newActiveNode.row = this.activeNode.row - 1;
                    } else {
                        newActiveNode.row = -1;
                        newActiveNode.column = newActiveNode.layout ? newActiveNode.layout.colStart - 1 : 0;
                        newActiveNode.layout = null;
                        this.isRowDimensionHeaderActive = true;
                        this.isRowHeaderActive = false;
                        this.grid.theadRow.nativeElement.focus();
                    }
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
            if (!this.grid.hasHorizontalLayout && verticalContainer.isIndexOutsideView(newActiveNode.row)) {
                verticalContainer.scrollTo(newActiveNode.row);
            }
        } else {
            super.handleNavigation(event);
        }
    }

    public override handleAlt(key: string, event: KeyboardEvent): void {
        event.preventDefault();

        let rowData, dimIndex;
        if (!this.grid.hasHorizontalLayout) {
            dimIndex = this.activeNode.column;
            const scrContainer = this.grid.verticalRowDimScrollContainers.toArray()[dimIndex];
            rowData = scrContainer.igxGridForOf[this.activeNode.row];
        } else {
            const mrlRow = this.grid.rowDimensionMrlRowsCollection.find(mrl => mrl.rowIndex === this.activeNode.row);
            rowData = mrlRow.rowGroup[this.activeNode.layout.rowStart - 1];
            dimIndex = this.activeNode.layout.colStart - 1;
        }
        const dimension = this.grid.visibleRowDimensions[dimIndex];
        const expansionRowKey = PivotUtil.getRecordKey(rowData, dimension);
        const isExpanded = this.grid.expansionStates.get(expansionRowKey) ?? true;

        let prevCellLayout;
        if (this.grid.hasHorizontalLayout) {
            const parentRow = this.grid.rowDimensionMrlRowsCollection.find(row => row.rowIndex === this.activeNode.row);
            prevCellLayout = this.getNextVerticalColumnIndex(
                parentRow,
                Math.min(parentRow.rowGroup.length, this.activeNode.layout.rowStart),
                this.activeNode.layout.colStart);
        }

        if (ROW_EXPAND_KEYS.has(key) && !isExpanded) {
            this.grid.gridAPI.set_row_expansion_state(expansionRowKey, true, event)
        } else if (ROW_COLLAPSE_KEYS.has(key) && isExpanded) {
            this.grid.gridAPI.set_row_expansion_state(expansionRowKey, false, event)
        }

        if ((ROW_EXPAND_KEYS.has(key) && !isExpanded) || (ROW_COLLAPSE_KEYS.has(key) && isExpanded)) {
            this.onRowToggle(!isExpanded, dimension, rowData, prevCellLayout);
        }
        this.updateActiveNodeLayout();
        this.grid.notifyChanges();
    }

    public updateActiveNodeLayout() {
        if (this.grid.hasHorizontalLayout) {
            const mrlRow = this.grid.rowDimensionMrlRowsCollection.find(row => row.rowIndex === this.activeNode.row);
            const activeCell = mrlRow.contentCells.toArray()[this.activeNode.column];
            this.activeNode.layout = activeCell.layout;
        }
    }

    /** Update active cell when toggling row expand when horizontal summaries have position set to top */
    public onRowToggle(newExpandState: boolean, dimension: IPivotDimension, rowData: IPivotGridRecord, prevCellLayout: IMultiRowLayoutNode){
        if (this.grid.hasHorizontalLayout &&
            rowData.totalRecordDimensionName !== dimension.memberName &&
            dimension.horizontalSummary && this.grid.pivotUI.horizontalSummariesPosition === PivotSummaryPosition.Top) {
            const maxActiveRow = Math.min(this.lastRowDimensionMRLRowIndex, this.activeNode.row);
            const parentRowUpdated = this.grid.rowDimensionMrlRowsCollection.find(row => row.rowIndex === maxActiveRow);
            const maxRowEnd = parentRowUpdated.rowGroup.length + 1;
            const nextRowStart = Math.max(1, this.activeNode.layout.rowStart + (!newExpandState ? -1 : 1));
            const curValidRowStart = Math.min(parentRowUpdated.rowGroup.length, nextRowStart);
            // Get current cell layout, because the actineNode the rowStart might be different, based on where we come from(might be smaller cell).

            const curCellLayout = this.getNextVerticalColumnIndex(parentRowUpdated, curValidRowStart, this.activeNode.layout.colStart);
            const nextBlock = (!newExpandState && prevCellLayout.rowStart === 1) || (newExpandState &&  prevCellLayout.rowEnd >= maxRowEnd);
            this.activeNode.row += nextBlock ? (!newExpandState ? -1 : 1) : 0;
            this.activeNode.column = curCellLayout.columnVisibleIndex;
            this.activeNode.layout = curCellLayout;
        }
    }

    public override async headerNavigation(event: KeyboardEvent) {
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

            if (ctrl) {
                const dimIndex = this.activeNode.column;
                const dim = this.grid.visibleRowDimensions[dimIndex];
                if (this.activeNode.row === -1) {
                    if (key.includes('down') || key.includes('up')) {
                        let newSortDirection = SortingDirection.None;
                        if (key.includes('down')) {
                            newSortDirection = (dim.sortDirection === SortingDirection.Desc) ? SortingDirection.None : SortingDirection.Desc;
                        } else if (key.includes('up')) {
                            newSortDirection = (dim.sortDirection === SortingDirection.Asc) ? SortingDirection.None : SortingDirection.Asc;
                        }
                        this.grid.sortDimension(dim, newSortDirection);
                        return;
                    }
                }
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
                if (this.grid.hasHorizontalLayout) {
                    this.activeNode.row = 0;
                    this.activeNode.layout = {
                        rowStart: 1,
                        rowEnd: 2,
                        colStart: newActiveNode.column + 1,
                        colEnd: newActiveNode.column + 2,
                        columnVisibleIndex: newActiveNode.column
                    };

                    const newPosition = await this.getNextVerticalPosition(true, ctrl || key === 'home', key === 'home');
                    newActiveNode.row = 0;
                    newActiveNode.column = newPosition.column;
                    newActiveNode.layout = newPosition.layout;
                } else {
                    const verticalContainer = this.grid.verticalRowDimScrollContainers.toArray()[newActiveNode.column];
                    newActiveNode.row = ctrl ? verticalContainer.igxForOf.length - 1 : 0;
                }

                this.isRowDimensionHeaderActive = false;
                this.isRowHeaderActive = true;
                this.grid.rowDimensionContainer.toArray()[this.grid.hasHorizontalLayout ? 0 : newActiveNode.column].nativeElement.focus();
            }

            this.setActiveNode(newActiveNode);
        } else if (key.includes('left') && this.activeNode.column === 0 && this.grid.pivotUI.showRowHeaders) {
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

    public async getNextVerticalPosition(previous, ctrl, homeEnd) {
        const parentRow = this.grid.rowDimensionMrlRowsCollection.find(row => row.rowIndex === this.activeNode.row);
        const maxRowEnd = parentRow.rowGroup.length + 1;
        const curValidRowStart = Math.min(parentRow.rowGroup.length, this.activeNode.layout.rowStart);
        // Get current cell layout, because the actineNode the rowStart might be different, based on where we come from(might be smaller cell).
        const curCellLayout = this.getNextVerticalColumnIndex(parentRow, curValidRowStart, this.activeNode.layout.colStart);
        const nextBlock = (previous && curCellLayout.rowStart === 1) || (!previous && curCellLayout.rowEnd === maxRowEnd);
        if (nextBlock &&
            ((previous && this.activeNode.row === 0) ||
            (!previous && this.activeNode.row === this.lastRowDimensionMRLRowIndex))) {
            if (previous && this.grid.pivotUI.showRowHeaders) {
                this.isRowDimensionHeaderActive = true;
                this.isRowHeaderActive = false;
                this.grid.theadRow.nativeElement.focus();
                return  { row: -1, column: this.activeNode.layout.colStart - 1, layout: this.activeNode.layout };
            }
            return { row: this.activeNode.row, column: this.activeNode.column, layout: this.activeNode.layout };
        }

        const nextMRLRowIndex = previous ?
            (ctrl ? 0 : this.activeNode.row - 1) :
            (ctrl ? this.lastRowDimensionMRLRowIndex : this.activeNode.row + 1) ;
        let nextRow = nextBlock || ctrl ? this.grid.rowDimensionMrlRowsCollection.find(row => row.rowIndex === nextMRLRowIndex) : parentRow;
        if (!nextRow) {
            const nextDataViewIndex = previous ?
                (ctrl ? 0 : parentRow.rowGroup[curCellLayout.rowStart - 1].dataIndex - 1) :
                (ctrl ? this.grid.dataView.length - 1 : parentRow.rowGroup[curCellLayout.rowEnd - 2].dataIndex + 1);
            await this.scrollToNextHorizontalDimRow(nextDataViewIndex);
            nextRow = nextBlock || ctrl ? this.grid.rowDimensionMrlRowsCollection.find(row => row.rowIndex === nextMRLRowIndex) : parentRow;
        }

        const nextRowStart = nextBlock ?
            (previous ? nextRow.rowGroup.length : 1) :
            (previous ? curCellLayout.rowStart - 1 : curCellLayout.rowEnd);
        const maxColEnd = Math.max(...nextRow.contentCells.map(cell => cell.layout.colEnd));
        const nextColumnLayout = this.getNextVerticalColumnIndex(
            nextRow,
            ctrl ? (previous ? 1 : nextRow.rowGroup.length) : nextRowStart,
            homeEnd ? (previous ? 1 : maxColEnd - 1) : this.activeNode.layout.colStart
        );

        const nextDataViewIndex = previous ?
            nextRow.rowGroup[nextColumnLayout.rowStart - 1].dataIndex:
            nextRow.rowGroup[nextColumnLayout.rowEnd - 2].dataIndex;
        await this.scrollToNextHorizontalDimRow(nextDataViewIndex);

        return {
            row: nextBlock || ctrl ? nextMRLRowIndex : this.activeNode.row,
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

    public async getNextHorizontalPosition(previous, ctrl) {
        const parentRow = this.grid.rowDimensionMrlRowsCollection.find(row => row.rowIndex === this.activeNode.row);
        const maxColEnd = Math.max(...parentRow.contentCells.map(cell => cell.layout.colEnd));
        // Get current cell layout, because the actineNode the rowStart might be different, based on where we come from(might be smaller cell).
        const curCellLayout = this.getNextVerticalColumnIndex(parentRow, this.activeNode.layout.rowStart, this.activeNode.layout.colStart);

        if ((previous && curCellLayout.colStart === 1) || (!previous && curCellLayout.colEnd === maxColEnd)) {
            return { row: this.activeNode.row, column: this.activeNode.column, layout: this.activeNode.layout };
        }

        const nextColStartNormal = curCellLayout.colStart + (previous ? -1 : curCellLayout.colEnd - curCellLayout.colStart);
        const nextColumnLayout = this.getNextVerticalColumnIndex(
            parentRow,
            this.activeNode.layout.rowStart,
            ctrl ? (previous ? 1 : maxColEnd - 1) : nextColStartNormal
        );

        const nextDataViewIndex = parentRow.rowGroup[nextColumnLayout.rowStart - 1].dataIndex
        await this.scrollToNextHorizontalDimRow(nextDataViewIndex);

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

    private async scrollToNextHorizontalDimRow(nextDataViewIndex: number) {
        const verticalContainer = this.grid.verticalScrollContainer;
        if (verticalContainer.isIndexOutsideView(nextDataViewIndex)) {
            verticalContainer.scrollTo(nextDataViewIndex);
            await new Promise((resolve) => {
                this.grid.gridScroll.pipe(take(1), timeout({ first: 10000 })).subscribe({
                    next: (value) => resolve(value),
                    error: (err) => resolve(err)
                });
            });
        }
    }


    private getNextVerticalColumnIndex(nextRow: IgxPivotRowDimensionMrlRowComponent, newRowStart, newColStart) {
        const nextCell = nextRow.contentCells.find(cell => {
            return cell.layout.rowStart <= newRowStart && newRowStart < cell.layout.rowEnd &&
                cell.layout.colStart <= newColStart && newColStart < cell.layout.colEnd;
        });
        return nextCell.layout;
    }
}
