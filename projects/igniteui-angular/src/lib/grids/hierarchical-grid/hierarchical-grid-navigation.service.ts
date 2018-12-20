import { IgxGridNavigationService } from '../grid-navigation.service';
import { IgxHierarchicalGridComponent } from './hierarchical-grid.component';
import { first } from 'rxjs/operators';

export class IgxHierarchicalGridNavigationService extends IgxGridNavigationService {
    public grid: IgxHierarchicalGridComponent;

    get parentVerticalDisplayContainerElement() {
        return this.grid.parent ? this.grid.parent.verticalScrollContainer.dc.instance._viewContainer.element.nativeElement : null;
    }

    protected getCellSelector(visibleIndex?: number) {
       return 'igx-hierarchical-grid-cell';
    }

    protected getRowSelector() {
        return 'igx-hierarchical-grid-row';
    }

    protected getRowByIndex(index) {
        const selector = this.getRowSelector();
        const rows = this.grid.nativeElement.querySelectorAll(
            `${selector}[data-rowindex="${index}"]`);
        let row;
         rows.forEach((r) => {
           if (r.closest('igx-hierarchical-grid').getAttribute('id') === this.grid.id) {
                row = r;
           }
        });
        return row;
    }

    private getChildContainer(grid?) {
        const currGrid = grid || this.grid;
        return currGrid.nativeElement.parentNode.parentNode.parentNode;
    }

    private getChildGridRowContainer() {
        return this.grid.nativeElement.parentNode.parentNode;
    }

    private getChildGrid(childGridID, grid) {
        const cgrid = grid.hgridAPI.getChildGrids(true).filter((g) => g.id === childGridID)[0];
        return cgrid;
    }

    private isAtBottom(grid) {
        return grid.verticalScrollContainer.state.startIndex +
         grid.verticalScrollContainer.state.chunkSize >= grid.verticalScrollContainer.igxForOf.length;
    }
    private getIsChildAtIndex(index) {
        return this.grid.isChildGridRecord(this.grid.verticalScrollContainer.igxForOf[index]);
    }

    public getCellElementByVisibleIndex(rowIndex, visibleColumnIndex) {
        const cellSelector = this.getCellSelector(visibleColumnIndex);
        const row = this.getRowByIndex(rowIndex);
        return row.querySelector(
            `${cellSelector}[data-rowindex="${rowIndex}"][data-visibleIndex="${visibleColumnIndex}"]`);
    }

    public navigateUp(rowElement, currentRowIndex, visibleColumnIndex) {
        const prevElem = rowElement.previousElementSibling;
        if (prevElem) {
            const nodeName =  prevElem.children[0].nodeName.toLowerCase();
            const isElemChildGrid =  nodeName.toLowerCase() === 'igx-child-grid-row';
            if (isElemChildGrid) {
                this.focusPrevChild(prevElem, visibleColumnIndex, this.grid);
            } else {
                if (this.grid.parent !== null) {
                    // currently navigating in child grid
                    this._navigateUpInChild(rowElement, currentRowIndex, visibleColumnIndex);
                } else {
                    super.navigateUp(rowElement, currentRowIndex, visibleColumnIndex);
                }
            }
        } else if (currentRowIndex !== 0) {
            // handle scenario when prev item is child grid but is not yet in view
            const isPrevChildGrid = this.getIsChildAtIndex(currentRowIndex - 1);
            if (!isPrevChildGrid) {
                super.navigateUp(rowElement, currentRowIndex, visibleColumnIndex);
            } else {
                this.scrollGrid(this.grid, -rowElement.offsetHeight,
                    () => {
                        rowElement = this.getRowByIndex(currentRowIndex);
                        this.navigateUp(rowElement, currentRowIndex, visibleColumnIndex);
                    });
            }
        } else if (this.grid.parent !== null &&
            currentRowIndex === 0) {
                // move to prev row in sibling layout or parent
                this.focusPrev(visibleColumnIndex);
        }
    }
    public navigateDown(rowElement, currentRowIndex, visibleColumnIndex) {
        const nextElem = rowElement.nextElementSibling;
        if (nextElem) {
            // next elem is in DOM
            const nodeName =  nextElem.children[0].nodeName.toLowerCase();
            const isNextElemChildGrid =  nodeName.toLowerCase() === 'igx-child-grid-row';
            if (isNextElemChildGrid) {
                this.focusNextChild(nextElem, visibleColumnIndex, this.grid);
            } else {
                if (this.grid.parent !== null) {
                    // currently navigating in child grid
                    this._navigateDownInChild(rowElement, currentRowIndex, visibleColumnIndex);
                } else {
                    super.navigateDown(rowElement, currentRowIndex, visibleColumnIndex);
                }
            }
        } else if (currentRowIndex !== this.grid.verticalScrollContainer.igxForOf.length - 1) {
             // scroll next in view
             super.navigateDown(rowElement, currentRowIndex, visibleColumnIndex);
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

    public onKeydownEnd(rowIndex) {
        if (this.grid.parent) {
            // handle scenario where last child row might not be in view
            // parent should scroll to child grid end
            const childContainer = this.grid.nativeElement.parentNode.parentNode;
            const diff =
            childContainer.getBoundingClientRect().bottom - this.grid.rootGrid.nativeElement.getBoundingClientRect().bottom;
            const endIsVisible = diff < 0;
            if (!endIsVisible) {
                this.scrollGrid(this.grid.parent, diff, () => super.onKeydownEnd(rowIndex));
            } else {
                super.onKeydownEnd(rowIndex);
            }
        } else {
            super.onKeydownEnd(rowIndex);
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

    public performTab(currentRowEl, rowIndex, visibleColumnIndex) {
        if (!this.grid.rowList.find(row => row.index === rowIndex + 1) && this.grid.parent &&
        this.grid.unpinnedColumns[this.grid.unpinnedColumns.length - 1].visibleIndex === visibleColumnIndex) {
            this.navigateDown(currentRowEl, rowIndex, 0);
        } else {
            super.performTab(currentRowEl, rowIndex, visibleColumnIndex);
        }
    }
    public performShiftTabKey(currentRowEl, rowIndex, visibleColumnIndex) {
        if (visibleColumnIndex === 0 && this.grid.parent) {
            if (rowIndex === 0 && this.grid.allowFiltering) {
                this.moveFocusToFilterCell();
            } else {
                this.navigateUp(currentRowEl, rowIndex,
                    this.grid.parent.unpinnedColumns[this.grid.parent.unpinnedColumns.length - 1].visibleIndex);
            }
        } else {
            super.performShiftTabKey(currentRowEl, rowIndex, visibleColumnIndex);
        }
    }

    private _focusScrollCellInView(visibleColumnIndex) {
        const cellSelector = this.getCellSelector(visibleColumnIndex);
        const cells = this.grid.nativeElement.querySelectorAll(
            `${cellSelector}[data-visibleIndex="${visibleColumnIndex}"]`);
        const cell = cells[0];
        const childContainer = this.grid.nativeElement.parentNode.parentNode;
        const scrTop = this.grid.parent.verticalScrollContainer.getVerticalScroll().scrollTop;
        if (scrTop === 0) {
            // cell is in view
            cell.focus({preventScroll: true});
        } else {
            // scroll parent so that cell is in view
            const dc = childContainer.parentNode.parentNode;
            const scrWith = parseInt(dc.style.top, 10);
            this.scrollGrid(this.grid.parent, scrWith , () => cell.focus({preventScroll: true}));
        }
    }

    private focusNextChild(elem, visibleColumnIndex, grid) {
        const gridElem = elem.querySelector('igx-hierarchical-grid');
        const childGridID = gridElem.getAttribute('id');
        const childGrid = this.getChildGrid(childGridID, grid);
        if (childGrid.verticalScrollContainer.state.startIndex !== 0) {
            // scroll to top
            this.scrollGrid(childGrid, 'top', () => this.focusNextRow(elem, visibleColumnIndex, childGrid));
        } else {
            this.focusNextRow(elem, visibleColumnIndex, childGrid);
        }
    }
    private focusPrevChild(elem, visibleColumnIndex, grid) {
        const gridElems = elem.querySelectorAll('igx-hierarchical-grid');
        const gridElem = gridElems[0];
        const childGridID = gridElem.getAttribute('id');
        const childGrid = this.getChildGrid(childGridID, grid);
        const vScrollState = childGrid.verticalScrollContainer.state;
        const lastIndex = childGrid.verticalScrollContainer.igxForOf.length - 1;
        if (vScrollState.startIndex + vScrollState.chunkSize  < lastIndex) {
            // scroll to end
            this.scrollGrid(childGrid, 'bottom', () => this.focusPrevRow(elem, visibleColumnIndex, childGrid, true));
        } else {
            const lastRowInChild = childGrid.getRowByIndex(lastIndex);
            const isChildGrid = lastRowInChild.nativeElement.nodeName.toLowerCase() === 'igx-child-grid-row';
            if (isChildGrid) {
                this.focusPrevChild(lastRowInChild.nativeElement.parentNode, visibleColumnIndex, grid);
            } else {
                this.focusPrevRow(lastRowInChild.nativeElement, visibleColumnIndex, childGrid, true);
            }
        }
    }

    private focusPrev(visibleColumnIndex) {
        let parentContainer = this.getChildContainer();
        let childRowContainer = this.getChildGridRowContainer();
        const prevIsSiblingChild = !!childRowContainer.previousElementSibling;
        let prev = childRowContainer.previousElementSibling || parentContainer.previousElementSibling;
        if (prev) {
            if (prevIsSiblingChild) {
                this.focusPrevChild(prev, visibleColumnIndex, this.grid.parent);
            } else {
                this.focusPrevRow(prev, visibleColumnIndex, this.grid.parent);
            }
        } else {
            this.scrollGrid(this.grid.parent, 'prev',
            () => {
            parentContainer = this.getChildContainer();
            childRowContainer = this.getChildGridRowContainer();
            prev = childRowContainer.previousElementSibling || parentContainer.previousElementSibling;
            if (prevIsSiblingChild) {
                this.focusPrevChild(prev, visibleColumnIndex, this.grid.parent);
            } else {
                this.focusPrevRow(prev, visibleColumnIndex, this.grid.parent);
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

        return { grid: currGrid, nextElement: nextElem};
    }
    private getNextScrollable(grid) {
        let currGrid = grid.parent;
        if (!currGrid) {
            return {grid: grid, prev: null };
        }
        let nonScrollable = currGrid.verticalScrollContainer.getVerticalScroll().scrollTop === 0;
        let prev = grid;
        while (nonScrollable && currGrid.parent !== null) {
            prev = currGrid;
            currGrid = currGrid.parent;
            nonScrollable = currGrid.verticalScrollContainer.getVerticalScroll().scrollTop === 0;
        }
        return {grid: currGrid, prev: prev };
    }

    private focusNext(visibleColumnIndex) {
        const parentInfo = this.getNextParentInfo(this.grid);
        const nextParentGrid = parentInfo.grid;
        let nextParentElem = parentInfo.nextElement;
        let childRowContainer = this.getChildGridRowContainer();
        const nextIsSiblingChild = !!childRowContainer.nextElementSibling;
        let next = childRowContainer.nextElementSibling || nextParentElem;
        const verticalScroll = nextParentGrid.verticalScrollContainer.getVerticalScroll();
        if (next) {
            if (nextIsSiblingChild) {
                this.focusNextChild(next, visibleColumnIndex, nextParentGrid);
            } else {
                this.focusNextRow(next, visibleColumnIndex, nextParentGrid);
            }
        } else if (verticalScroll.scrollTop !==
            verticalScroll.scrollHeight - nextParentGrid.verticalScrollContainer.igxForContainerSize ) {
            this.scrollGrid(nextParentGrid, 'next',
            () => {
                nextParentElem = parentInfo.nextElement;
                childRowContainer = this.getChildGridRowContainer();
                next = childRowContainer.nextElementSibling || nextParentElem;
                if (next && nextIsSiblingChild) {
                    this.focusNextChild(next, visibleColumnIndex, nextParentGrid);
                } else if (next) {
                    this.focusNextRow(next, visibleColumnIndex, nextParentGrid);
                }
            });
        }
    }

    private focusNextRow(elem, visibleColumnIndex, grid) {
        const cellSelector = this.getCellSelector(visibleColumnIndex);
        if (grid.navigation.isColumnFullyVisible(visibleColumnIndex) && grid.navigation.isColumnLeftFullyVisible(visibleColumnIndex)) {
            const cell =
            elem.querySelector(`${cellSelector}[data-visibleIndex="${visibleColumnIndex}"]`);
            const diff = cell.getBoundingClientRect().bottom - grid.rootGrid.nativeElement.getBoundingClientRect().bottom;
            const inView =  diff <= 0;
            if (!inView) {
                this.scrollGrid(grid, diff, () => cell.focus({ preventScroll: true }));
            } else {
                cell.focus({ preventScroll: true });
            }
        } else {
            const cellElem = elem.querySelector(`${cellSelector}`);
            const rowIndex = parseInt(cellElem.getAttribute('data-rowindex'), 10);
            grid.navigation.performHorizontalScrollToCell(rowIndex, visibleColumnIndex);
        }
    }

    private focusPrevRow(elem, visibleColumnIndex, grid, inChild?) {
        if (grid.navigation.isColumnFullyVisible(visibleColumnIndex) && grid.navigation.isColumnLeftFullyVisible(visibleColumnIndex)) {
            const cellSelector = this.getCellSelector(visibleColumnIndex);
            const cells =  elem.querySelectorAll(`${cellSelector}[data-visibleIndex="${visibleColumnIndex}"]`);
            const cell = cells[cells.length - 1];
            const scrollable = grid.verticalScrollContainer.getVerticalScroll().scrollTop !== 0 ?
            {grid: grid, prev: grid} : this.getNextScrollable(grid);
            const scrGrid = scrollable.grid;
            const scrTop = scrGrid.verticalScrollContainer.getVerticalScroll().scrollTop;
            const containerTop = scrollable.prev ? scrollable.prev.nativeElement.parentNode.parentNode.parentNode.parentNode : null;
            const top = containerTop ? parseInt(containerTop.style.top, 10) : 0;
            if (scrTop !== 0 && top < 0 && !inChild) {
                this.scrollGrid(scrGrid, top, () => cell.focus({ preventScroll: true }));
            } else {
                cell.focus({ preventScroll: true });
            }
        } else {
            this.horizontalScrollGridToIndex(grid, visibleColumnIndex, () => {
                this.focusPrevRow(elem, visibleColumnIndex, grid, inChild);
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
        grid.nativeElement.focus({preventScroll: true});
        requestAnimationFrame(() => {
            if (typeof target === 'number') {
                grid.verticalScrollContainer.addScrollTop(target);
            } else {
                switch (target) {
                    case 'top' : grid.verticalScrollContainer.scrollTo(0); break;
                    case 'bottom' : grid.verticalScrollContainer.scrollTo(grid.verticalScrollContainer.igxForOf.length - 1); break;
                    case 'next' :  grid.verticalScrollContainer.scrollNext(); break;
                    case 'prev' :  grid.verticalScrollContainer.scrollPrev(); break;
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
                () => super.navigateUp(rowElement, currentRowIndex, visibleColumnIndex));
        } else {
            super.navigateUp(rowElement, currentRowIndex, visibleColumnIndex);
        }
    }

    private _navigateDownInChild(rowElement, currentRowIndex, visibleColumnIndex) {
        const nextElem = rowElement.nextElementSibling;
        const childContainer = this.grid.nativeElement.parentNode.parentNode;
        const diff =
        childContainer.getBoundingClientRect().bottom - this.grid.rootGrid.nativeElement.getBoundingClientRect().bottom;
        const endIsVisible = diff < 0;
        if (!endIsVisible) {
            this.scrollGrid(this.grid.parent, nextElem.offsetHeight,
                () => super.navigateDown(rowElement, currentRowIndex, visibleColumnIndex));
        } else {
            super.navigateDown(rowElement, currentRowIndex, visibleColumnIndex);
        }
    }
}
