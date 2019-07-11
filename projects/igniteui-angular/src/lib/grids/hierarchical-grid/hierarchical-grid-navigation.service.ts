import { IgxGridNavigationService } from '../grid-navigation.service';
import { IgxHierarchicalGridComponent } from './hierarchical-grid.component';
import { first } from 'rxjs/operators';
import { FilterMode } from '../grid-base.component';
import { IgxColumnComponent } from '../../grids/column.component';
import { ISelectionNode } from '../../core/grid-selection';
import { isIE } from '../../core/utils';

export class IgxHierarchicalGridNavigationService extends IgxGridNavigationService {
    public grid: IgxHierarchicalGridComponent;

    protected getCellSelector(visibleIndex?: number, isSummary = false) {
        return isSummary ? 'igx-grid-summary-cell' : 'igx-hierarchical-grid-cell';
    }

    protected getRowSelector() {
        return 'igx-hierarchical-grid-row';
    }

    protected getRowByIndex(index) {
        const selector = this.getRowSelector();
        const rows = Array.from(this.grid.nativeElement.querySelectorAll(
            `${selector}[data-rowindex="${index}"]`));
        let row;
        rows.forEach((r) => {
            const parentGrid = this.getClosestElemByTag(r, 'igx-hierarchical-grid');
            if (parentGrid && parentGrid.getAttribute('id') === this.grid.id) {
                row = r;
            }
        });
        return row;
    }

    private getChildContainer(grid?) {
        const currGrid = grid || this.grid;
        return currGrid.nativeElement.parentNode.parentNode.parentNode;
    }

    private getChildGridRowContainer(grid?) {
        const currGrid = grid || this.grid;
        return currGrid.nativeElement.parentNode.parentNode;
    }

    private getChildGrid(childGridID, grid) {
        const cgrid = grid.hgridAPI.getChildGrids(true).filter((g) => g.id === childGridID)[0];
        return cgrid;
    }

    private _isScrolledToBottom(grid) {
        const scrollTop = grid.verticalScrollContainer.getVerticalScroll().scrollTop;
        const scrollHeight = grid.verticalScrollContainer.getVerticalScroll().scrollHeight;
        return scrollHeight === 0 || Math.round(scrollTop + grid.verticalScrollContainer.igxForContainerSize) === scrollHeight;
    }
    private getIsChildAtIndex(index) {
        return this.grid.isChildGridRecord(this.grid.verticalScrollContainer.igxForOf[index]);
    }

    public getCellElementByVisibleIndex(rowIndex, visibleColumnIndex, isSummary = false) {
        const cellSelector = this.getCellSelector(visibleColumnIndex, isSummary);
        if (isSummary) {
            const summaryRow = this.grid.summariesRowList.toArray()[0].nativeElement;
            return summaryRow.querySelector(
                `${cellSelector}[data-visibleIndex="${visibleColumnIndex}"]`);
        }
        const row = this.getRowByIndex(rowIndex);
        return row.querySelector(
            `${cellSelector}[data-rowindex="${rowIndex}"][data-visibleIndex="${visibleColumnIndex}"]`);
    }

    public navigateUp(rowElement, selectedNode: ISelectionNode) {
        const prevElem = rowElement.previousElementSibling;
        const visibleColumnIndex = selectedNode.column;
        const currentRowIndex = selectedNode.row;
        if (prevElem) {
            const nodeName = prevElem.children[0].nodeName.toLowerCase();
            const isElemChildGrid = nodeName.toLowerCase() === 'igx-child-grid-row';
            if (isElemChildGrid) {
                this.focusPrevChild(prevElem, visibleColumnIndex, this.grid);
            } else {
                if (this.grid.parent !== null) {
                    // currently navigating in child grid
                    this._navigateUpInChild(rowElement, currentRowIndex, visibleColumnIndex);
                } else {
                    super.navigateUp(rowElement, selectedNode);
                }
            }
        } else if (currentRowIndex !== 0) {
            // handle scenario when prev item is child grid but is not yet in view
            const isPrevChildGrid = this.getIsChildAtIndex(currentRowIndex - 1);
            if (!isPrevChildGrid) {
                super.navigateUp(rowElement, selectedNode);
            } else {
                this.scrollGrid(this.grid, -rowElement.offsetHeight,
                    () => {
                        rowElement = this.getRowByIndex(currentRowIndex);
                        this.navigateUp(rowElement, selectedNode);
                    });
            }
        } else if (this.grid.parent !== null &&
            currentRowIndex === 0) {
            // move to prev row in sibling layout or parent
            this.focusPrev(visibleColumnIndex);
        }
    }
    public navigateDown(rowElement, selectedNode: ISelectionNode) {
        const nextElem = rowElement.nextElementSibling;
        const visibleColumnIndex = selectedNode.column;
        const currentRowIndex = selectedNode.row;
        if (nextElem) {
            // next elem is in DOM
            const nodeName = nextElem.children[0].nodeName.toLowerCase();
            const isNextElemChildGrid = nodeName.toLowerCase() === 'igx-child-grid-row';
            if (isNextElemChildGrid) {
                this.focusNextChild(nextElem, visibleColumnIndex, this.grid);
            } else {
                if (this.grid.parent !== null) {
                    // currently navigating in child grid
                    this._navigateDownInChild(rowElement, currentRowIndex, visibleColumnIndex);
                } else {
                    super.navigateDown(rowElement, selectedNode);
                }
            }
        } else if (currentRowIndex !== this.grid.verticalScrollContainer.igxForOf.length - 1) {
            // scroll next in view
            super.navigateDown(rowElement, selectedNode);
        } else if (this.grid.parent !== null &&
            currentRowIndex === this.grid.verticalScrollContainer.igxForOf.length - 1) {
            // move to next row in sibling layout or in parent
            this.focusNext(visibleColumnIndex);
        }
    }

    public navigateTop(visibleColumnIndex) {
        if (this.grid.parent !== null) {
            // navigating in child
            const verticalScroll = this.grid.verticalScrollContainer.getVerticalScroll();
            const cellSelector = this.getCellSelector(visibleColumnIndex);

            if (verticalScroll.scrollTop === 0) {
                this._focusScrollCellInView(visibleColumnIndex);
            } else {
                this.scrollGrid(this.grid, 'top',
                    () => {
                        const cells = this.grid.nativeElement.querySelectorAll(
                            `${cellSelector}[data-visibleIndex="${visibleColumnIndex}"]`);
                        if (cells.length > 0) {
                            this._focusScrollCellInView(visibleColumnIndex);
                        }
                    });
            }

        } else {
            super.navigateTop(visibleColumnIndex);
        }
    }

    public navigateBottom(visibleColumnIndex) {
        // handle scenario where last index is child grid
        // in that case focus cell in last data row
        const lastIndex = this.grid.verticalScrollContainer.igxForOf.length - 1;
        if (this.getIsChildAtIndex(lastIndex)) {
            const targetIndex = lastIndex - 1;
            const scrTopPosition = this.grid.verticalScrollContainer.getScrollForIndex(targetIndex, true);
            const verticalScroll = this.grid.verticalScrollContainer.getVerticalScroll();
            const cellSelector = this.getCellSelector(visibleColumnIndex);
            if (verticalScroll.scrollTop === scrTopPosition) {
                const cells = this.getRowByIndex(targetIndex).querySelectorAll(
                    `${cellSelector}[data-visibleIndex="${visibleColumnIndex}"]`);
                cells[cells.length - 1].focus();
            } else {
                this.scrollGrid(this.grid, scrTopPosition - verticalScroll.scrollTop,
                    () => {
                        const cells = this.getRowByIndex(targetIndex).querySelectorAll(
                            `${cellSelector}[data-visibleIndex="${visibleColumnIndex}"]`);
                        if (cells.length > 0) { cells[cells.length - 1].focus(); }
                    });
            }
        } else  if (this.grid.parent !== null) {
            const childContainer = this.grid.nativeElement.parentNode.parentNode;
            const diff =
            childContainer.getBoundingClientRect().bottom - this.grid.rootGrid.tbody.nativeElement.getBoundingClientRect().bottom;
            const endIsVisible = diff < 0;
            const scrollable = this.getNextScrollableDown(this.grid);
            if (!endIsVisible) {
                this.scrollGrid(scrollable.grid, diff,
                    () => super.navigateBottom(visibleColumnIndex));
            } else {
                super.navigateBottom(visibleColumnIndex);
            }
        } else {
            super.navigateBottom(visibleColumnIndex);
        }
    }
    public goToLastCell() {
        // handle scenario where last index is child grid
        // in that case focus last cell in last data row
        const lastIndex = this.grid.verticalScrollContainer.igxForOf.length - 1;
        if (this.getIsChildAtIndex(lastIndex)) {
            const targetIndex = lastIndex - 1;
            const scrTopPosition = this.grid.verticalScrollContainer.getScrollForIndex(targetIndex, true);
            const verticalScroll = this.grid.verticalScrollContainer.getVerticalScroll();
            if (verticalScroll.scrollTop === scrTopPosition) {
                this.onKeydownEnd(targetIndex);
            } else {
                this.scrollGrid(this.grid, scrTopPosition - verticalScroll.scrollTop,
                    () => {
                        this.onKeydownEnd(targetIndex);
                    });
            }
        } else {
            super.goToLastCell();
        }
    }

    public onKeydownEnd(rowIndex, isSummary = false) {
        if (this.grid.parent && !isSummary) {
            // handle scenario where last child row might not be in view
            // parent should scroll to child grid end
            const childContainer = this.grid.nativeElement.parentNode.parentNode;
            const diffBottom =
                childContainer.getBoundingClientRect().bottom - this.grid.rootGrid.nativeElement.getBoundingClientRect().bottom;
            const row = this.grid.getRowByIndex(rowIndex).element.nativeElement;
            const rowBottom = row.getBoundingClientRect().bottom;
            const rowIsVisible = rowBottom <= this.grid.rootGrid.tbody.nativeElement.getBoundingClientRect().bottom;
            const gridTop = this._getMaxTop(this.grid);
            const diffTop = row.getBoundingClientRect().bottom -
                row.offsetHeight - gridTop;
            const endIsVisible = diffBottom <= 0;
            const topVisible = diffTop >= 0;
            if (!endIsVisible && !rowIsVisible) {
                this.scrollGrid(this.grid.parent, diffBottom, () => super.onKeydownEnd(rowIndex));
            } else if (!topVisible) {
                const scrGrid = this.grid.verticalScrollContainer.getVerticalScroll().scrollTop !== 0 ? this.grid :
                    this.getNextScrollable(this.grid).grid;
                const topGrid = scrGrid.tbody.nativeElement.getBoundingClientRect().top >
                    this.grid.rootGrid.tbody.nativeElement.getBoundingClientRect().top ? scrGrid : this.grid.rootGrid;
                this.scrollGrid(topGrid, diffTop, () => super.onKeydownEnd(rowIndex));
            } else {
                super.onKeydownEnd(rowIndex, isSummary);
            }
        } else {
            super.onKeydownEnd(rowIndex, isSummary);
        }

    }

    public goToFirstCell() {
        const verticalScroll = this.grid.verticalScrollContainer.getVerticalScroll();
        const horizontalScroll = this.grid.dataRowList.first.virtDirRow.getHorizontalScroll();
        if (verticalScroll.scrollTop === 0 && this.grid.parent) {
            // scroll parent so that current child is in view
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
        } else {
            super.goToFirstCell();
        }
    }

    public performTab(currentRowEl, selectedNode: ISelectionNode) {
        if (this.grid.rowInEditMode) {
            super.performTab(currentRowEl, selectedNode);
            return;
        }
        const rowIndex = selectedNode.row;
        const visibleColumnIndex = selectedNode.column;
        const isSummaryRow = selectedNode.isSummaryRow;
        const summaryRows = this.grid.summariesRowList.toArray();
        const hasSummaries = summaryRows.length > 0;
        const isLastDataRow = rowIndex === this.grid.verticalScrollContainer.igxForOf.length - 1;
        const nextIsDataRow = this.grid.dataRowList.find(row => row.index === rowIndex + 1);
        const isLastColumn = this.grid.unpinnedColumns[this.grid.unpinnedColumns.length - 1].visibleIndex === visibleColumnIndex;
        const isLastSummaryRow = hasSummaries && isSummaryRow;
        const nextIndex = rowIndex + 1;
        const virt = this.grid.verticalScrollContainer;
        const isNextChild = nextIndex <= virt.igxForOf.length - 1 &&
            this.grid.isChildGridRecord(virt.igxForOf[nextIndex]);
        if (!nextIsDataRow && !(isLastDataRow && hasSummaries) && isLastColumn && !isSummaryRow) {
            // navigating in child, next is not summary
            const childContainer = this.getChildGridRowContainer();
            const nextIsSiblingChild = this.grid.parent ? !!childContainer.nextElementSibling : false;
            if (nextIsSiblingChild) {
                this.focusNextChildDOMElem(childContainer, this.grid.parent);
            } else if (isNextChild) {
                const isInView = virt.state.startIndex + virt.state.chunkSize > nextIndex;
                if (!isInView) {
                    this.scrollGrid(this.grid, 'next', () => {
                        this.focusNextChildDOMElem(currentRowEl, this.grid);
                    });
                } else {
                    this.focusNextChildDOMElem(currentRowEl, this.grid);
                }
            } else {
                this.navigateDown(currentRowEl, { row: rowIndex, column: 0 });
            }
        } else if (isLastSummaryRow && isLastColumn && this.grid.parent) {
            // navigating in child summary, next is parent summary or next parent row
            const parent = this.grid.parent;
            const parentHasSummary = parent.summariesRowList.toArray().length > 0;
            const parentRowIndex = parseInt(
                this.getClosestElemByTag(currentRowEl, 'igx-child-grid-row').parentNode.getAttribute('data-rowindex'), 10);
            const isLastRowInParent = parent.verticalScrollContainer.igxForOf.length - 1 === parentRowIndex;
            // check if next is sibling
            const childRowContainer = this.getChildGridRowContainer(this.grid);
            const nextIsSiblingChild = !!childRowContainer.nextElementSibling;
            if (isLastRowInParent && parentHasSummary && !nextIsSiblingChild) {
                // next is parent summary
                const parentSummary = parent.summariesRowList.toArray()[0].nativeElement;
                parent.navigation.focusNextRow(parentSummary, 0, this.grid.rootGrid, true);
            } else {
                // next is sibling or parent
                this.focusNext(0);
            }
        } else if (isLastDataRow && hasSummaries && isLastColumn && this.grid.parent) {
            // navigating in child rows, next is child grid's summary row
            this.focusNextRow(summaryRows[0].nativeElement, 0, this.grid.parent, true);
        } else {
            super.performTab(currentRowEl, selectedNode);
        }
    }

    private focusNextChildDOMElem(currentRowEl, grid) {
        const gridElem = currentRowEl.nextElementSibling.querySelector('igx-hierarchical-grid');
        const childGridID = gridElem.getAttribute('id');
        const childGrid = this.getChildGrid(childGridID, grid);
        if (childGrid.allowFiltering && childGrid.filterMode === FilterMode.quickFilter) {
            childGrid.navigation.moveFocusToFilterCell(true);
            return;
        }
        this.focusNextChild(currentRowEl.nextElementSibling, 0, grid);
    }

    public navigatePrevFilterCell(column: IgxColumnComponent, eventArgs) {
        if (column.visibleIndex === 0 && this.grid.parent) {
            eventArgs.preventDefault();
            let targetGrid = this.grid.parent;
            const prevSiblingChild = this.getChildGridRowContainer().previousElementSibling;
            if (prevSiblingChild) {
                const gridElem = prevSiblingChild.querySelectorAll('igx-hierarchical-grid')[0];
                targetGrid = this.getChildGrid(gridElem.getAttribute('id'), this.grid.parent);
            }
            this.focusPrev(targetGrid.unpinnedColumns[targetGrid.unpinnedColumns.length - 1].visibleIndex);
        } else {
            super.navigatePrevFilterCell(column, eventArgs);
        }
    }

    public navigateNextFilterCell(column: IgxColumnComponent, eventArgs) {
        const cols = this.grid.filteringService.unpinnedFilterableColumns;
        const nextFilterableIndex = cols.indexOf(column) + 1;
        if (nextFilterableIndex >= this.grid.filteringService.unpinnedFilterableColumns.length) {
            // next is not filter cell
            const dataRows = this.grid.rowList.toArray();
            const hasRows = dataRows.length !== 0;
            const summaryRows = this.grid.summariesRowList.toArray();
            const hasSummaries = summaryRows.length > 0 && summaryRows[0].summaryCells.length > 0;
            if (hasRows) {
                this.focusNextRow(dataRows[0].nativeElement, 0, this.grid, false);
            } else if (hasSummaries) {
                this.focusNextRow(summaryRows[0].nativeElement, 0, this.grid, true);
            } else {
                this.focusNext(0);
            }
            eventArgs.preventDefault();
        } else {
            super.navigateNextFilterCell(column, eventArgs);
        }
    }

    public performShiftTabKey(currentRowEl, selectedNode: ISelectionNode) {
        if (this.grid.rowInEditMode) {
            super.performShiftTabKey(currentRowEl, selectedNode);
            return;
        }
        const rowIndex = selectedNode.row;
        const visibleColumnIndex = selectedNode.column;
        const isSummary = selectedNode.isSummaryRow;
        if (visibleColumnIndex === 0 && rowIndex === 0 && this.grid.parent && !isSummary) {
            if (this.grid.allowFiltering && this.grid.filterMode === FilterMode.quickFilter) {
                this.moveFocusToFilterCell();
            } else {
                const prevSiblingChild = this.getChildGridRowContainer().previousElementSibling;
                if (prevSiblingChild) {
                    const gridElem = prevSiblingChild.querySelectorAll('igx-hierarchical-grid')[0];
                    this.performShiftTabIntoChild(gridElem, currentRowEl, rowIndex);
                } else {
                    const selNode = {
                        row: rowIndex,
                        column: this.grid.parent.unpinnedColumns[this.grid.parent.unpinnedColumns.length - 1].visibleIndex
                    };
                    this.navigateUp(currentRowEl, selNode);
                }
            }
        } else if (visibleColumnIndex === 0 && currentRowEl.previousElementSibling &&
            currentRowEl.previousElementSibling.children[0].tagName.toLowerCase() === 'igx-child-grid-row') {
            const gridElem = this.getLastGridElem(currentRowEl.previousElementSibling);
            this.performShiftTabIntoChild(gridElem, currentRowEl, rowIndex);
        } else if (visibleColumnIndex === 0 && isSummary) {
            const lastRowIndex = this.grid.verticalScrollContainer.igxForOf.length - 1;
            if (lastRowIndex === -1) {
                // no child data
                if (this.grid.allowFiltering && this.grid.filterMode === FilterMode.quickFilter) {
                    this.moveFocusToFilterCell();
                } else {
                    const selNode = {
                        row: rowIndex,
                        column: this.grid.parent.unpinnedColumns[this.grid.parent.unpinnedColumns.length - 1].visibleIndex
                    };
                    this.navigateUp(currentRowEl, selNode);
                }
            } else if (!this.getIsChildAtIndex(lastRowIndex)) {
                super.goToLastCell();
            } else {
                const scrTopPosition = this.grid.verticalScrollContainer.getScrollForIndex(lastRowIndex, true);
                const verticalScroll = this.grid.verticalScrollContainer.getVerticalScroll();
                if (verticalScroll.scrollTop === scrTopPosition || isNaN(scrTopPosition)) {
                    const closestChild = this.getLastGridElem(this.grid.getRowByIndex(lastRowIndex).nativeElement.parentElement);
                    this.performShiftTabIntoChild(closestChild, currentRowEl, rowIndex);
                } else {
                    this.scrollGrid(this.grid, scrTopPosition - verticalScroll.scrollTop,
                        () => {
                            const closestChild = this.getLastGridElem(this.grid.getRowByIndex(lastRowIndex).nativeElement.parentElement);
                            this.performShiftTabIntoChild(closestChild, currentRowEl, rowIndex);
                        });
                }
            }
        } else {
            super.performShiftTabKey(currentRowEl, selectedNode);
        }
    }

    public getFocusableGrid() {
        return (isIE() && this.grid.rootGrid) ? this.grid.rootGrid : this.grid;
    }

    private getLastGridElem(trContainer) {
        const children = trContainer.children;
        const closestChild = children[children.length - 1].children[0].children[0];
        return closestChild;
    }

    private performShiftTabIntoChild(gridElem, currentRowEl, rowIndex) {
        const childGridID = gridElem.getAttribute('id');
        const childGrid = this.getChildGrid(childGridID, this.grid) || this.getChildGrid(childGridID, this.grid.parent);
        const lastIndex = childGrid.unpinnedColumns[childGrid.unpinnedColumns.length - 1].visibleIndex;
        const summaryRows = childGrid.summariesRowList.toArray();
        if (summaryRows.length > 0 && summaryRows[0].summaryCells.length > 0) {
            // move focus to last summary row cell
            const summaryRow = summaryRows[0].nativeElement;
            this.focusPrevRow(summaryRow, lastIndex, childGrid, true, true);
        } else if (childGrid.rowList.toArray().length === 0 &&
            childGrid.allowFiltering && childGrid.filterMode === FilterMode.quickFilter) {
            // move to filter cell
            childGrid.navigation.moveFocusToFilterCell();
        } else {
            // move to next cell
            this.navigateUp(currentRowEl, { row: rowIndex, column: lastIndex });
        }
    }

    private _focusScrollCellInView(visibleColumnIndex) {
        const cellSelector = this.getCellSelector(visibleColumnIndex);
        const cells = this.grid.nativeElement.querySelectorAll(
            `${cellSelector}[data-visibleIndex="${visibleColumnIndex}"]`);
        const cell = cells[0];
        const childContainer = this.grid.nativeElement.parentNode.parentNode;
        const scrTop = this.grid.parent.verticalScrollContainer.getVerticalScroll().scrollTop;
        const maxScroll = this.grid.parent.verticalScrollContainer.getVerticalScroll().scrollHeight - this.grid.parent.calcHeight;
        const dc = childContainer.parentNode.parentNode;
        const scrWith = parseInt(dc.style.top, 10);
        const parentRowOffset = childContainer.parentNode.offsetTop + this.grid.nativeElement.offsetTop +
            scrWith;
        if ((scrTop === 0 && parentRowOffset < 0 ) || parentRowOffset === 0 || (scrTop === maxScroll && parentRowOffset > 0)) {
            // cell is in view
            cell.focus({ preventScroll: true });
        } else {
            // scroll parent so that cell is in view
            this.scrollGrid(this.grid.parent, parentRowOffset, () => cell.focus({ preventScroll: true }));
        }
    }

    private focusNextChild(elem, visibleColumnIndex, grid) {
        const gridElem = elem.querySelector('igx-hierarchical-grid');
        const childGridID = gridElem.getAttribute('id');
        const childGrid = this.getChildGrid(childGridID, grid);

        if (childGrid.rowList.toArray().length === 0) {
            this.focusNext(visibleColumnIndex, childGrid);
            return;
        }

        // Update column index since the next child can have in general less columns than visibleColumnIndex value.
        const lastCellIndex = childGrid.unpinnedColumns[childGrid.unpinnedColumns.length - 1].visibleIndex;
        visibleColumnIndex = Math.min(lastCellIndex, visibleColumnIndex);

        if (childGrid.verticalScrollContainer.state.startIndex !== 0) {
            // scroll to top
            this.scrollGrid(childGrid, 'top', () => this.focusNextRow(elem, visibleColumnIndex, childGrid));
        } else {
            this.focusNextRow(elem, visibleColumnIndex, childGrid);
        }
    }
    private focusPrevChild(elem, visibleColumnIndex, grid) {
        const grids = [];
        const gridElems = Array.from(elem.querySelectorAll('igx-hierarchical-grid'));
        const childLevel = grid.childLayoutList.first.level;
        gridElems.forEach((hg) => {
            const parentRow = this.getClosestElemByTag(hg, 'igx-child-grid-row');
            if (parentRow && parseInt(parentRow.getAttribute('data-level'), 10) === childLevel) {
                grids.push(hg);
            }
        });
        const gridElem = grids[grids.length - 1];
        const childGridID = gridElem.getAttribute('id');
        const childGrid = this.getChildGrid(childGridID, grid);

        if (childGrid.rowList.toArray().length === 0) {
            this.focusPrev(visibleColumnIndex, childGrid);
            return;
        }

        // Update column index since the previous child can have in general less columns than visibleColumnIndex value.
        const lastCellIndex = childGrid.unpinnedColumns[childGrid.unpinnedColumns.length - 1].visibleIndex;
        visibleColumnIndex = Math.min(lastCellIndex, visibleColumnIndex);

        const isScrolledToBottom = this._isScrolledToBottom(childGrid);
        const lastIndex = childGrid.verticalScrollContainer.igxForOf.length - 1;
        if (!isScrolledToBottom) {
            // scroll to end
            this.scrollGrid(childGrid, 'bottom', () => this.focusPrevChild(elem, visibleColumnIndex, grid));
        } else {
            const lastRowInChild = childGrid.getRowByIndex(lastIndex);
            const isChildGrid = lastRowInChild.nativeElement.nodeName.toLowerCase() === 'igx-child-grid-row';
            if (isChildGrid) {
                this.focusPrevChild(lastRowInChild.nativeElement.parentNode, visibleColumnIndex, childGrid);
            } else {
                this.focusPrevRow(lastRowInChild.nativeElement, visibleColumnIndex, childGrid, true);
            }
        }
    }
    private focusPrev(visibleColumnIndex, grid?) {
        const currGrid = grid || this.grid;
        let parentContainer = this.getChildContainer(currGrid);
        let childRowContainer = this.getChildGridRowContainer(currGrid);
        const prevIsSiblingChild = !!childRowContainer.previousElementSibling;
        let prev = childRowContainer.previousElementSibling || parentContainer.previousElementSibling;
        if (prev) {
            if (prevIsSiblingChild) {
                this.focusPrevChild(prev, visibleColumnIndex, currGrid.parent);
            } else {
                this.focusPrevRow(prev, visibleColumnIndex, currGrid.parent);
            }
        } else {
            this.scrollGrid(currGrid.parent, 'prev',
                () => {
                    parentContainer = this.getChildContainer(grid);
                    childRowContainer = this.getChildGridRowContainer(grid);
                    prev = childRowContainer.previousElementSibling || parentContainer.previousElementSibling;
                    if (prevIsSiblingChild) {
                        this.focusPrevChild(prev, visibleColumnIndex, currGrid.parent);
                    } else {
                        this.focusPrevRow(prev, visibleColumnIndex, currGrid.parent);
                    }
                });
        }
    }

    private getNextParentInfo(grid) {
        // find next parent that is not at bottom
        let currGrid = grid.parent;
        let nextElem = this.getChildContainer(grid).nextElementSibling;
        while (!nextElem && currGrid.parent !== null) {
            nextElem = this.getChildContainer(currGrid).nextElementSibling;
            currGrid = currGrid.parent;
        }

        return { grid: currGrid, nextElement: nextElem };
    }
    private getNextScrollable(grid) {
        let currGrid = grid.parent;
        if (!currGrid) {
            return { grid: grid, prev: null };
        }
        let nonScrollable = currGrid.verticalScrollContainer.getVerticalScroll().scrollTop === 0;
        let prev = grid;
        while (nonScrollable && currGrid.parent !== null) {
            prev = currGrid;
            currGrid = currGrid.parent;
            nonScrollable = currGrid.verticalScrollContainer.getVerticalScroll().scrollTop === 0;
        }
        return { grid: currGrid, prev: prev };
    }

    private focusNext(visibleColumnIndex, grid?) {
        const currGrid = grid || this.grid;
        const parentInfo = this.getNextParentInfo(currGrid);
        const nextParentGrid = parentInfo.grid;
        let nextParentElem = parentInfo.nextElement;
        let childRowContainer = this.getChildGridRowContainer(currGrid);
        const nextIsSiblingChild = !!childRowContainer.nextElementSibling;
        let next = childRowContainer.nextElementSibling || nextParentElem;
        const verticalScroll = nextParentGrid.verticalScrollContainer.getVerticalScroll();
        if (next) {
            if (nextIsSiblingChild) {
                this.focusNextChild(next, visibleColumnIndex, nextParentGrid);
            } else {
                this.focusNextRow(next, visibleColumnIndex, grid || nextParentGrid);
            }
        } else if (verticalScroll.scrollTop !==
            verticalScroll.scrollHeight - nextParentGrid.verticalScrollContainer.igxForContainerSize) {
            this.scrollGrid(nextParentGrid, 'next',
                () => {
                    nextParentElem = parentInfo.nextElement;
                    childRowContainer = this.getChildGridRowContainer();
                    next = childRowContainer.nextElementSibling || nextParentElem;
                    if (next && nextIsSiblingChild) {
                        this.focusNextChild(next, visibleColumnIndex, nextParentGrid);
                    } else if (next) {
                        this.focusNextRow(next, visibleColumnIndex, grid || nextParentGrid);
                    }
                });
        }
    }
    private getNextScrollableDown(grid) {
        let currGrid = grid.parent;
        if (!currGrid) {
            return { grid: grid, prev: null };
        }
        let scrollTop = currGrid.verticalScrollContainer.getVerticalScroll().scrollTop;
        let scrollHeight = currGrid.verticalScrollContainer.getVerticalScroll().scrollHeight;
        let nonScrollable = scrollHeight === 0 ||
            Math.round(scrollTop + currGrid.verticalScrollContainer.igxForContainerSize) === scrollHeight;
        let prev = grid;
        while (nonScrollable && currGrid.parent !== null) {
            prev = currGrid;
            currGrid = currGrid.parent;
            scrollTop = currGrid.verticalScrollContainer.getVerticalScroll().scrollTop;
            scrollHeight = currGrid.verticalScrollContainer.getVerticalScroll().scrollHeight;
            nonScrollable = scrollHeight === 0 ||
                Math.round(scrollTop + currGrid.verticalScrollContainer.igxForContainerSize) === scrollHeight;
        }
        return { grid: currGrid, prev: prev };
    }

    private _getMinBottom(grid) {
        let currGrid = grid;
        let bottom = currGrid.tbody.nativeElement.getBoundingClientRect().bottom;
        while (currGrid.parent) {
            currGrid = currGrid.parent;
            bottom = Math.min(bottom, currGrid.tbody.nativeElement.getBoundingClientRect().bottom);
        }
        return bottom;
    }

    private _getMaxTop(grid) {
        let currGrid = grid;
        let top = currGrid.tbody.nativeElement.getBoundingClientRect().top;
        while (currGrid.parent) {
            currGrid = currGrid.parent;
            top = Math.max(top, currGrid.tbody.nativeElement.getBoundingClientRect().top);
        }
        return top;
    }

    private focusNextRow(elem, visibleColumnIndex, grid, isSummary?) {
        const cellSelector = this.getCellSelector(visibleColumnIndex, isSummary);
        if (grid.navigation.isColumnFullyVisible(visibleColumnIndex)) {
            const cell =
                elem.querySelector(`${cellSelector}[data-visibleIndex="${visibleColumnIndex}"]`);
            const closestScrollableGrid = this.getNextScrollableDown(grid).grid;
            // const diff = cell.getBoundingClientRect().bottom - grid.rootGrid.tbody.nativeElement.getBoundingClientRect().bottom;
            const gridBottom = this._getMinBottom(grid);
            const diff = cell.getBoundingClientRect().bottom - gridBottom;
            const inView = diff <= 0;
            const scrollTop = closestScrollableGrid.verticalScrollContainer.getVerticalScroll().scrollTop;
            const scrollHeight = closestScrollableGrid.verticalScrollContainer.getVerticalScroll().scrollHeight;
            const canScroll = !(scrollHeight === 0 ||
                Math.round(scrollTop + closestScrollableGrid.verticalScrollContainer.igxForContainerSize) === scrollHeight);
            if (!inView && canScroll) {
                this.scrollGrid(closestScrollableGrid, diff, () => cell.focus({ preventScroll: true }));
            } else {
                cell.focus({ preventScroll: true });
            }
        } else {
            const cellElem = elem.querySelector(`${cellSelector}`);
            const rowIndex = parseInt(cellElem.getAttribute('data-rowindex'), 10);
            grid.navigation.performHorizontalScrollToCell(rowIndex, visibleColumnIndex);
        }
    }

    private focusPrevRow(elem, visibleColumnIndex, grid, inChild?, isSummary?) {
        if (grid.navigation.isColumnFullyVisible(visibleColumnIndex)) {
            const cellSelector = this.getCellSelector(visibleColumnIndex, isSummary);
            const cells = elem.querySelectorAll(`${cellSelector}[data-visibleIndex="${visibleColumnIndex}"]`);
            let cell = cells[cells.length - 1];
            const rIndex = parseInt(elem.getAttribute('data-rowindex'), 10);
            const scrGrid = grid.verticalScrollContainer.getVerticalScroll().scrollTop !== 0 ? grid :
                this.getNextScrollable(grid).grid;
            const topGrid = scrGrid.tbody.nativeElement.getBoundingClientRect().top >
                grid.rootGrid.tbody.nativeElement.getBoundingClientRect().top ? scrGrid : grid.rootGrid;
            const gridTop = this._getMaxTop(grid);
            const scrTop = scrGrid.verticalScrollContainer.getVerticalScroll().scrollTop;
            const diff = cell.getBoundingClientRect().bottom -
                cell.offsetHeight - gridTop;
            if (scrTop !== 0 && diff < 0 && !inChild) {
                this.scrollGrid(scrGrid, diff, () => {
                    const el = !isSummary ? grid.navigation.getRowByIndex(rIndex) : elem;
                    cell = el.querySelectorAll(`${cellSelector}[data-visibleIndex="${visibleColumnIndex}"]`)[0];
                    cell.focus({ preventScroll: true });
                });
            } else if (diff < 0 && inChild) {
                this.scrollGrid(topGrid, diff, () => {
                    cell.focus({ preventScroll: true });
                });
            } else {
                cell.focus({ preventScroll: true });
            }
        } else {
            this.horizontalScrollGridToIndex(grid, visibleColumnIndex, () => {
                this.focusPrevRow(elem, visibleColumnIndex, grid, inChild, isSummary);
            });
        }
    }

    private horizontalScrollGridToIndex(grid, visibleColumnIndex, callBackFunc) {
        const unpinnedIndex = this.getColumnUnpinnedIndex(visibleColumnIndex);
        grid.parentVirtDir.onChunkLoad
            .pipe(first())
            .subscribe(callBackFunc);
        grid.dataRowList.toArray()[0].virtDirRow.scrollTo(unpinnedIndex);
    }
    private scrollGrid(grid, target, callBackFunc) {
        this.getFocusableGrid().nativeElement.focus({preventScroll: true});
        requestAnimationFrame(() => {
            if (typeof target === 'number') {
                grid.verticalScrollContainer.addScrollTop(target);
            } else {
                switch (target) {
                    case 'top': grid.verticalScrollContainer.scrollTo(0); break;
                    case 'bottom': grid.verticalScrollContainer.scrollTo(grid.verticalScrollContainer.igxForOf.length - 1); break;
                    case 'next': grid.verticalScrollContainer.scrollNext(); break;
                    case 'prev': grid.verticalScrollContainer.scrollPrev(); break;
                }
            }
            grid.verticalScrollContainer.onChunkLoad
                .pipe(first())
                .subscribe(callBackFunc);
        });
    }

    private _navigateUpInChild(rowElement, currentRowIndex, visibleColumnIndex) {
        const prevElem = rowElement.previousElementSibling;
        const scrollable = this.getNextScrollable(this.grid);
        const grid = scrollable.grid;
        const scrTop = grid.verticalScrollContainer.getVerticalScroll().scrollTop;
        const containerTop = scrollable.prev.nativeElement.parentNode.parentNode.parentNode.parentNode;
        const top = parseInt(containerTop.style.top, 10);
        if (scrTop !== 0 && top < 0) {
            this.scrollGrid(grid, -prevElem.offsetHeight,
                () => super.navigateUp(rowElement, { row: currentRowIndex, column: visibleColumnIndex }));
        } else {
            super.navigateUp(rowElement, { row: currentRowIndex, column: visibleColumnIndex });
        }
    }

    private _navigateDownInChild(rowElement, currentRowIndex, visibleColumnIndex) {
        const nextElem = rowElement.nextElementSibling;
        const childContainer = this.grid.nativeElement.parentNode.parentNode;
        const diff =
            childContainer.getBoundingClientRect().bottom - this.grid.rootGrid.nativeElement.getBoundingClientRect().bottom;
        const endIsVisible = diff < 0;
        const scrollable = this.getNextScrollableDown(this.grid);
        const grid = scrollable.grid;
        if (!endIsVisible) {
            this.scrollGrid(grid, nextElem.offsetHeight,
                () => super.navigateDown(rowElement, { row: currentRowIndex, column: visibleColumnIndex }));
        } else {
            super.navigateDown(rowElement, { row: currentRowIndex, column: visibleColumnIndex });
        }
    }

    private getClosestElemByTag(sourceElem, targetTag) {
        let result = sourceElem;
        while (result !== null && result.nodeType === 1) {
            if (result.tagName.toLowerCase() === targetTag.toLowerCase()) {
                return result;
            }
            result = result.parentNode;
        }
        return null;
    }
}
