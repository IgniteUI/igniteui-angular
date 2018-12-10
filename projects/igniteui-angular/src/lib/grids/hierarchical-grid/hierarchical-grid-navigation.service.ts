import { IgxGridNavigationService } from '../grid-navigation.service';
import { IgxHierarchicalGridComponent } from './hierarchical-grid.component';
import { first } from 'rxjs/operators';

export class IgxHierarchicalGridNavigationService extends IgxGridNavigationService {
    public grid: IgxHierarchicalGridComponent;
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
        const cgrid = grid.hgridAPI.getChildGrids(false).filter((g) => g.id === childGridID)[0];
        return cgrid;
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
                    const childContainer = this.grid.nativeElement.parentNode.parentNode;
                    const diff = childContainer.getBoundingClientRect().top;
                    const topIsVisible = diff >= 0;
                    if (!topIsVisible) {
                        this.grid.nativeElement.focus({preventScroll: true});
                        requestAnimationFrame(() => {
                            this.grid.parent.verticalScrollContainer.addScrollTop(-prevElem.offsetHeight);
                            this.grid.parent.verticalScrollContainer.onChunkLoad
                                .pipe(first())
                                .subscribe(() => {
                                    super.navigateUp(rowElement, currentRowIndex, visibleColumnIndex);
                            });
                        });
                    } else {
                        super.navigateUp(rowElement, currentRowIndex, visibleColumnIndex);
                    }
                } else {
                    super.navigateUp(rowElement, currentRowIndex, visibleColumnIndex);
                }
            }
        } else if (currentRowIndex !== 0) {
            super.navigateUp(rowElement, currentRowIndex, visibleColumnIndex);
        } else if (this.grid.parent !== null &&
            currentRowIndex === 0) {
                // move to prev row in sibling layout or parent
                let parentContainer = this.getChildContainer();
                let childRowContainer = this.getChildGridRowContainer();
                const prevIsSiblingChild = !!childRowContainer.previousElementSibling;
                let prev = childRowContainer.previousElementSibling || parentContainer.previousElementSibling;
                if (prev) {
                    if (prevIsSiblingChild) {
                        this.focusPrevChild(prev, visibleColumnIndex, this.grid.parent);
                    } else {
                        this.focusPrev(prev, visibleColumnIndex, this.grid.parent);
                    }
                } else {
                    this.grid.parent.verticalScrollContainer.scrollPrev();
                    this.grid.parent.verticalScrollContainer.onChunkLoad
                    .pipe(first())
                    .subscribe(() => {
                        parentContainer = this.getChildContainer();
                        childRowContainer = this.getChildGridRowContainer();
                        prev = childRowContainer.previousElementSibling || parentContainer.previousElementSibling;
                        if (prevIsSiblingChild) {
                            this.focusPrevChild(prev, visibleColumnIndex, this.grid.parent);
                        } else {
                            this.focusPrev(prev, visibleColumnIndex, this.grid.parent);
                        }
                    });
                }
        }
    }

    isAtBottom(grid) {
        return grid.verticalScrollContainer.state.startIndex +
         grid.verticalScrollContainer.state.chunkSize > grid.verticalScrollContainer.igxForOf.length;
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
                    const childContainer = this.grid.nativeElement.parentNode.parentNode;
                    const diff =
                    childContainer.getBoundingClientRect().bottom - this.grid.rootGrid.nativeElement.getBoundingClientRect().bottom;
                    const endIsVisible = diff < 0;
                    if (!endIsVisible) {
                        this.grid.nativeElement.focus({preventScroll: true});
                        requestAnimationFrame(() => {
                            this.grid.parent.verticalScrollContainer.addScrollTop(nextElem.offsetHeight);
                            this.grid.parent.verticalScrollContainer.onChunkLoad
                                .pipe(first())
                                .subscribe(() => {
                                    super.navigateDown(rowElement, currentRowIndex, visibleColumnIndex);
                            });
                        });
                    } else {
                        super.navigateDown(rowElement, currentRowIndex, visibleColumnIndex);
                    }
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
                const parentContainer = this.getChildContainer();
                const childRowContainer = this.getChildGridRowContainer();
                const nextIsSiblingChild = !!childRowContainer.nextElementSibling;
                const next = childRowContainer.nextElementSibling || parentContainer.nextElementSibling;
                if (nextIsSiblingChild) {
                    this.focusNextChild(next, visibleColumnIndex, this.grid.parent);
                } else {
                    this.focusNext(next, visibleColumnIndex, this.grid.parent);
                }
        }
    }

    get parentVerticalDisplayContainerElement() {
        return this.grid.parent ? this.grid.parent.verticalScrollContainer.dc.instance._viewContainer.element.nativeElement : null;
    }

    private focusNextChild(elem, visibleColumnIndex, grid) {
        const gridElem = elem.querySelector('igx-hierarchical-grid');
        const childGridID = gridElem.getAttribute('id');
        const childGrid = this.getChildGrid(childGridID, grid);
        if (childGrid.verticalScrollContainer.state.startIndex !== 0) {
            // scroll to top
            childGrid.nativeElement.focus({preventScroll: true});
            childGrid.verticalScrollContainer.scrollTo(0);
            childGrid.verticalScrollContainer.onChunkLoad
                    .pipe(first())
                    .subscribe(() => {
                        this.focusNext(elem, visibleColumnIndex, grid);
                });
        } else {
            this.focusNext(elem, visibleColumnIndex, grid);
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
            childGrid.nativeElement.focus({preventScroll: true});
            childGrid.verticalScrollContainer.scrollTo(lastIndex);
            childGrid.verticalScrollContainer.onChunkLoad
                    .pipe(first())
                    .subscribe(() => {
                        this.focusPrev(elem, visibleColumnIndex, grid);
                });

        } else {
            this.focusPrev(elem, visibleColumnIndex, grid);
        }
    }

    private focusNext(elem, visibleColumnIndex, grid) {
        const cellSelector = this.getCellSelector(visibleColumnIndex);
        const cell =
        elem.querySelector(`${cellSelector}[data-visibleIndex="${visibleColumnIndex}"]`);
        const diff = cell.getBoundingClientRect().bottom - grid.rootGrid.nativeElement.getBoundingClientRect().bottom;
        const inView =  diff <= 0;
        if (!inView) {
            this.grid.nativeElement.focus({preventScroll: true});
            requestAnimationFrame(() => {
                grid.verticalScrollContainer.addScrollTop(diff);
                grid.verticalScrollContainer.onChunkLoad
                    .pipe(first())
                    .subscribe(() => {
                        cell.focus({ preventScroll: true });
                });
            });
        } else {
            cell.focus({ preventScroll: true });
        }
    }

    private focusPrev(elem, visibleColumnIndex, grid) {
        const cellSelector = this.getCellSelector(visibleColumnIndex);
        const cells =  elem.querySelectorAll(`${cellSelector}[data-visibleIndex="${visibleColumnIndex}"]`);
        const cell = cells[cells.length - 1];
        const diff = cell.getBoundingClientRect().top - cell.offsetHeight;
        const inView =  diff >= 0;
         if (!inView) {
            this.grid.nativeElement.focus({preventScroll: true});
            requestAnimationFrame(() => {
                grid.verticalScrollContainer.addScrollTop(diff);
                grid.verticalScrollContainer.onChunkLoad
                    .pipe(first())
                    .subscribe(() => {
                        cell.focus({ preventScroll: true });
                });
            });
        } else {
             cell.focus({ preventScroll: true });
        }
    }
}
