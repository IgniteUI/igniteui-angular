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

    private getChildContainer() {
        return this.grid.nativeElement.parentNode.parentNode.parentNode;
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
         grid.verticalScrollContainer.state.chunkSize > grid.verticalScrollContainer.igxForOf.length;
    }
    private getIsChildAtIndex(index) {
        return this.grid.isChildGridRecord(this.grid.verticalScrollContainer.igxForOf[index]);
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
            currentRowIndex === this.grid.verticalScrollContainer.igxForOf.length - 1
            && !this.isAtBottom(this.grid.parent)) {
                // move to next row in sibling layout or in parent
                this.focusNext(visibleColumnIndex);
        }
    }

    private focusNextChild(elem, visibleColumnIndex, grid) {
        const gridElem = elem.querySelector('igx-hierarchical-grid');
        const childGridID = gridElem.getAttribute('id');
        const childGrid = this.getChildGrid(childGridID, grid);
        if (childGrid.verticalScrollContainer.state.startIndex !== 0) {
            // scroll to top
            this.scrollGrid(childGrid, 'top', () => this.focusNextRow(elem, visibleColumnIndex, grid));
        } else {
            this.focusNextRow(elem, visibleColumnIndex, grid);
        }
    }
    private focusPrevChild(elem, visibleColumnIndex, grid) {
        const gridElems = elem.querySelectorAll('igx-hierarchical-grid');
        const gridElem = gridElems[gridElems.length - 1];
        const childGridID = gridElem.getAttribute('id');
        const childGrid = this.getChildGrid(childGridID, grid);
        const vScrollState = childGrid.verticalScrollContainer.state;
        const lastIndex = childGrid.verticalScrollContainer.igxForOf.length - 1;
        if (vScrollState.startIndex + vScrollState.chunkSize  < lastIndex) {
            // scroll to end
            this.scrollGrid(childGrid, 'bottom', () => this.focusPrevRow(elem, visibleColumnIndex, grid));

        } else {
            this.focusPrevRow(elem, visibleColumnIndex, grid);
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

    private focusNext(visibleColumnIndex) {
        let parentContainer = this.getChildContainer();
        let childRowContainer = this.getChildGridRowContainer();
        const nextIsSiblingChild = !!childRowContainer.nextElementSibling;
        let next = childRowContainer.nextElementSibling || parentContainer.nextElementSibling;
        if (next) {
            if (nextIsSiblingChild) {
                this.focusNextChild(next, visibleColumnIndex, this.grid.parent);
            } else {
                this.focusNextRow(next, visibleColumnIndex, this.grid.parent);
            }
        } else {
            this.scrollGrid(this.grid.parent, 'prev',
            () => {
                parentContainer = this.getChildContainer();
                childRowContainer = this.getChildGridRowContainer();
                next = childRowContainer.previousElementSibling || parentContainer.previousElementSibling;
                if (nextIsSiblingChild) {
                    this.focusNextChild(next, visibleColumnIndex, this.grid.parent);
                } else {
                    this.focusNextRow(next, visibleColumnIndex, this.grid.parent);
                }
            });
        }
    }

    private focusNextRow(elem, visibleColumnIndex, grid) {
        const cellSelector = this.getCellSelector(visibleColumnIndex);
        const cell =
        elem.querySelector(`${cellSelector}[data-visibleIndex="${visibleColumnIndex}"]`);
        const diff = cell.getBoundingClientRect().bottom - grid.rootGrid.nativeElement.getBoundingClientRect().bottom;
        const inView =  diff <= 0;
        if (!inView) {
            this.scrollGrid(grid, diff, () => cell.focus({ preventScroll: true }));
        } else {
            cell.focus({ preventScroll: true });
        }
    }

    private focusPrevRow(elem, visibleColumnIndex, grid) {
        const cellSelector = this.getCellSelector(visibleColumnIndex);
        const cells =  elem.querySelectorAll(`${cellSelector}[data-visibleIndex="${visibleColumnIndex}"]`);
        const cell = cells[cells.length - 1];
        const diff = cell.getBoundingClientRect().top - cell.offsetHeight;
        const inView =  diff >= 0 || grid.verticalScrollContainer.getVerticalScroll().scrollTop === 0;
         if (!inView) {
             this.scrollGrid(grid, diff, () => cell.focus({ preventScroll: true }));
        } else {
             cell.focus({ preventScroll: true });
        }
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
        const scrTop = this.grid.parent.verticalScrollContainer.getVerticalScroll().scrollTop;
        const childContainer = this.grid.nativeElement.parentNode.parentNode;
        const diff =
            childContainer.getBoundingClientRect().top - this.grid.parent.verticalScrollContainer.getVerticalScroll().scrollTop;
        const topIsVisible = scrTop === 0 || diff >= prevElem.offsetHeight;
        if (!topIsVisible) {
            this.scrollGrid(this.grid.parent, -prevElem.offsetHeight,
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
