import { IgxGridNavigationService } from '../grid-navigation.service';
import { IgxHierarchicalGridComponent } from './hierarchical-grid.component';
import { first } from 'rxjs/operators';
import { SUPPORTED_KEYS, NAVIGATION_KEYS } from '../../core/utils';
import { Injectable } from '@angular/core';
import { IgxChildGridRowComponent } from './child-grid-row.component';
import { IgxRowDirective, IgxGridBaseDirective } from '../grid/public_api';
import { GridType } from '../common/grid.interface';
import { IPathSegment } from './hierarchical-grid-base.directive';

@Injectable()
export class IgxHierarchicalGridNavigationService extends IgxGridNavigationService {
    public grid: IgxHierarchicalGridComponent;

    protected _pendingNavigation = false;


    public dispatchEvent(event: KeyboardEvent) {
        const key = event.key.toLowerCase();
        if (!this.activeNode || !(SUPPORTED_KEYS.has(key) || (key === 'tab' && this.grid.crudService.cell)) &&
            !this.grid.crudService.rowEditingBlocked && !this.grid.crudService.rowInEditMode) {
            return;
        }

        const targetGrid = this.getClosestElemByTag(event.target, 'igx-hierarchical-grid');
        if (targetGrid !== this.grid.nativeElement) {
            return;
        }

        if (this._pendingNavigation && NAVIGATION_KEYS.has(key)) {
            // In case focus needs to be moved from one grid to another, however there is a pending scroll operation
            // which is an async operation, any additional navigation keys should be ignored
            // untill operation complete.
            event.preventDefault();
            return;
        }
        super.dispatchEvent(event);
    }

    public navigateInBody(rowIndex, visibleColIndex, cb: (arg: any) => void = null): void {
        const rec = this.grid.dataView[rowIndex];
        if (rec && this.grid.isChildGridRecord(rec)) {
             // target is child grid
            const virtState = this.grid.verticalScrollContainer.state;
             const inView = rowIndex >= virtState.startIndex && rowIndex <= virtState.startIndex + virtState.chunkSize;
             const isNext =  this.activeNode.row < rowIndex;
             const targetLayoutIndex = isNext ? null : this.grid.childLayoutKeys.length - 1;
             if (inView) {
                this._moveToChild(rowIndex, visibleColIndex, isNext, targetLayoutIndex, cb);
            } else {
                let scrollAmount = this.grid.verticalScrollContainer.getScrollForIndex(rowIndex, !isNext);
                scrollAmount += isNext ? 1 : -1;
                this.grid.verticalScrollContainer.getScroll().scrollTop = scrollAmount;
                this._pendingNavigation = true;
                this.grid.verticalScrollContainer.chunkLoad.pipe(first()).subscribe(() => {
                    this._moveToChild(rowIndex, visibleColIndex, isNext, targetLayoutIndex, cb);
                    this._pendingNavigation = false;
                });
            }
            return;
        }

        const isLast = rowIndex === this.grid.dataView.length;
        if ((rowIndex === -1 || isLast) &&
            this.grid.parent !== null) {
            // reached end of child grid
            const nextSiblingIndex = this.nextSiblingIndex(isLast);
            if (nextSiblingIndex !== null) {
                this.grid.parent.navigation._moveToChild(this.grid.childRow.index, visibleColIndex, isLast, nextSiblingIndex, cb);
            } else {
                this._moveToParent(isLast, visibleColIndex, cb);
            }
            return;
        }

        if (this.grid.parent) {
            const isNext = this.activeNode && typeof this.activeNode.row === 'number' ? rowIndex > this.activeNode.row : false;
            const cbHandler = (args) => {
                this._handleScrollInChild(rowIndex, isNext);
                cb(args);
            };
            if (!this.activeNode) {
                this.activeNode = { row: null, column: null };
            }
            super.navigateInBody(rowIndex, visibleColIndex, cbHandler);
            return;
        }

        if (!this.activeNode) {
            this.activeNode = { row: null, column: null };
        }
        super.navigateInBody(rowIndex, visibleColIndex, cb);
    }

    public shouldPerformVerticalScroll(index, visibleColumnIndex = -1, isNext?) {
        const targetRec = this.grid.dataView[index];
        if (this.grid.isChildGridRecord(targetRec)) {
            const scrollAmount = this.grid.verticalScrollContainer.getScrollForIndex(index, !isNext);
            const currScroll = this.grid.verticalScrollContainer.getScroll().scrollTop;
            const shouldScroll = !isNext ? scrollAmount > currScroll : currScroll < scrollAmount;
            return shouldScroll;
        } else {
            return super.shouldPerformVerticalScroll(index, visibleColumnIndex);
        }
    }

    public focusTbody(event) {
        if (!this.activeNode || this.activeNode.row === null) {
            this.activeNode = {
                row: 0,
                column: 0
            };

            this.grid.navigateTo(0, 0, (obj) => {
                this.grid.clearCellSelection();
                obj.target.activate(event);
            });

        } else {
            super.focusTbody(event);
        }
    }

    protected nextSiblingIndex(isNext) {
        const layoutKey = this.grid.childRow.layout.key;
        const layoutIndex = this.grid.parent.childLayoutKeys.indexOf(layoutKey);
        const nextIndex = isNext ? layoutIndex + 1 : layoutIndex - 1;
        if (nextIndex <= this.grid.parent.childLayoutKeys.length - 1 && nextIndex > -1) {
            return nextIndex;
        } else {
            return null;
        }
    }

    /**
     * Handles scrolling in child grid and ensures target child row is in main grid view port.
     *
     * @param rowIndex The row index which should be in view.
     * @param isNext  Optional. Whether we are navigating to next. Used to determine scroll direction.
     * @param cb  Optional.Callback function called when operation is complete.
     */
    protected _handleScrollInChild(rowIndex: number, isNext?: boolean, cb?: () => void) {
        const shouldScroll = this.shouldPerformVerticalScroll(rowIndex, -1, isNext);
        if (shouldScroll) {
            this.grid.navigation.performVerticalScrollToCell(rowIndex, -1, () => {
                this.positionInParent(rowIndex, isNext, cb);
            });
        } else {
            this.positionInParent(rowIndex, isNext, cb);
        }
    }

    /**
     *
     * @param rowIndex Row index that should come in view.
     * @param isNext  Whether we are navigating to next. Used to determine scroll direction.
     * @param cb  Optional.Callback function called when operation is complete.
     */
    protected positionInParent(rowIndex, isNext, cb?: () => void) {
        const rowObj = this.grid.getRowByIndex(rowIndex);
        if (!rowObj) {
            if (cb) {
                cb();
            }
            return;
        }
        const positionInfo = this.getPositionInfo(rowObj, isNext);
        if (!positionInfo.inView) {
            // stop event from triggering multiple times before scrolling is complete.
            this._pendingNavigation = true;
            const scrollableGrid = isNext ? this.getNextScrollableDown(this.grid) : this.getNextScrollableUp(this.grid);
            scrollableGrid.grid.verticalScrollContainer.recalcUpdateSizes();
            scrollableGrid.grid.verticalScrollContainer.addScrollTop(positionInfo.offset);
            scrollableGrid.grid.verticalScrollContainer.chunkLoad.pipe(first()).subscribe(() => {
                this._pendingNavigation = false;
                if (cb) {
                    cb();
                }
            });
        } else {
            if (cb) {
                cb();
            }
        }
    }

    /**
     * Moves navigation to child grid.
     *
     * @param parentRowIndex The parent row index, at which the child grid is rendered.
     * @param childLayoutIndex Optional. The index of the child row island to which the child grid belongs to. Uses first if not set.
     */
    protected _moveToChild(parentRowIndex: number, visibleColIndex: number, isNext: boolean, childLayoutIndex?: number,
                            cb?: (arg: any) => void) {
        const ri = typeof childLayoutIndex !== 'number' ?
         this.grid.childLayoutList.first : this.grid.childLayoutList.toArray()[childLayoutIndex];
        const rowId = this.grid.dataView[parentRowIndex].rowID;
        const pathSegment: IPathSegment = {
            rowID: rowId,
            rowIslandKey: ri.key
        };
        const childGrid =  this.grid.hgridAPI.getChildGrid([pathSegment]);
        const targetIndex = isNext ? 0 : childGrid.dataView.length - 1;
        const targetRec =  childGrid.dataView[targetIndex];
        if (!targetRec) {
            // if no target rec, then move on in next sibling or parent
            childGrid.navigation.navigateInBody(targetIndex, visibleColIndex, cb);
            return;
        }
        if (childGrid.isChildGridRecord(targetRec)) {
            // if target is a child grid record should move into it.
            this.grid.navigation.activeNode.row = null;
            childGrid.navigation.activeNode = { row: targetIndex, column: this.activeNode.column};
            childGrid.navigation._handleScrollInChild(targetIndex, isNext, () => {
                const targetLayoutIndex = isNext ? 0 : childGrid.childLayoutList.toArray().length - 1;
                childGrid.navigation._moveToChild(targetIndex, visibleColIndex, isNext, targetLayoutIndex, cb);
            });
            return;
        }

        const childGridNav =  childGrid.navigation;
        this.clearActivation();
        const lastVisibleIndex = childGridNav.lastColumnIndex;
        const columnIndex = visibleColIndex <= lastVisibleIndex ? visibleColIndex : lastVisibleIndex;
        childGridNav.activeNode = { row: targetIndex, column: columnIndex};
        childGrid.tbody.nativeElement.focus({preventScroll: true});
        this._pendingNavigation = false;
        childGrid.navigation._handleScrollInChild(targetIndex, isNext, () => {
            childGrid.navigateTo(targetIndex, columnIndex, cb);
        });
    }

    /**
     * Moves navigation back to parent grid.
     *
     * @param rowIndex
     */
    protected _moveToParent(isNext: boolean, columnIndex, cb?) {
        const indexInParent = this.grid.childRow.index;
        const hasNextTarget = this.hasNextTarget(this.grid.parent, indexInParent, isNext);
        if (!hasNextTarget) {
            return;
        }
        this.clearActivation();
        const targetRowIndex =  isNext ? indexInParent + 1 : indexInParent - 1;
        const lastVisibleIndex = this.grid.parent.navigation.lastColumnIndex;
        const nextColumnIndex = columnIndex <= lastVisibleIndex ? columnIndex : lastVisibleIndex;
        this._pendingNavigation = true;
        const cbFunc = (args) => {
            this._pendingNavigation = false;
            cb(args);
            args.target.grid.tbody.nativeElement.focus();
        };
        this.grid.parent.navigation.navigateInBody(targetRowIndex, nextColumnIndex, cbFunc);
    }

    /**
     * Gets information on the row position relative to the root grid view port.
     * Returns whether the row is in view and its offset.
     *
     * @param rowObj
     * @param isNext
     */
    protected getPositionInfo(rowObj: IgxRowDirective<IgxGridBaseDirective & GridType>, isNext: boolean) {
        let rowElem = rowObj.nativeElement;
        if (rowObj instanceof IgxChildGridRowComponent) {
            const childLayoutKeys = this.grid.childLayoutKeys;
            const riKey = isNext ? childLayoutKeys[0] : childLayoutKeys[childLayoutKeys.length - 1];
            const pathSegment: IPathSegment = {
                rowID: rowObj.rowData.rowID,
                rowIslandKey: riKey
            };
            const childGrid =  this.grid.hgridAPI.getChildGrid([pathSegment]);
            rowElem = childGrid.tfoot.nativeElement;
        }
        const gridBottom = this._getMinBottom(this.grid);
        const diffBottom =
        rowElem.getBoundingClientRect().bottom - gridBottom;
        const gridTop = this._getMaxTop(this.grid);
        const diffTop = rowElem.getBoundingClientRect().bottom -
        rowElem.offsetHeight - gridTop;
        const isInView = isNext ? diffBottom <= 0 : diffTop >= 0;
        const calcOffset =  isNext ? diffBottom : diffTop;

        return { inView: isInView, offset: calcOffset };
    }

    /**
     * Gets closest element by its tag name.
     *
     * @param sourceElem The element from which to start the search.
     * @param targetTag The target element tag name, for which to search.
     */
    protected getClosestElemByTag(sourceElem, targetTag) {
        let result = sourceElem;
        while (result !== null && result.nodeType === 1) {
            if (result.tagName.toLowerCase() === targetTag.toLowerCase()) {
                return result;
            }
            result = result.parentNode;
        }
        return null;
    }

    private clearActivation() {
        // clear if previous activation exists.
        if (this.activeNode) {
            this.activeNode.row = null;
        }
    }

    private hasNextTarget(grid, index: number, isNext: boolean) {
        const targetRowIndex =  isNext ? index + 1 : index - 1;
        const hasTargetRecord = !!grid.dataView[targetRowIndex];
        if (hasTargetRecord) {
            return true;
        } else {
            let hasTargetRecordInParent = false;
            if (grid.parent) {
                const indexInParent = grid.childRow.index;
                hasTargetRecordInParent = this.hasNextTarget(grid.parent, indexInParent, isNext);
            }
            return hasTargetRecordInParent;
        }
    }

    /**
     * Gets the max top view in the current grid hierarchy.
     *
     * @param grid
     */
    private _getMaxTop(grid) {
        let currGrid = grid;
        let top = currGrid.tbody.nativeElement.getBoundingClientRect().top;
        while (currGrid.parent) {
            currGrid = currGrid.parent;
            const pinnedRowsHeight = currGrid.hasPinnedRecords && currGrid.isRowPinningToTop ? currGrid.pinnedRowHeight : 0;
            top = Math.max(top, currGrid.tbody.nativeElement.getBoundingClientRect().top + pinnedRowsHeight);
        }
        return top;
    }

    /**
     * Gets the min bottom view in the current grid hierarchy.
     *
     * @param grid
     */
    private _getMinBottom(grid) {
        let currGrid = grid;
        let bottom = currGrid.tbody.nativeElement.getBoundingClientRect().bottom;
        while (currGrid.parent) {
            currGrid = currGrid.parent;
            const pinnedRowsHeight = currGrid.hasPinnedRecords && !currGrid.isRowPinningToTop ? currGrid.pinnedRowHeight : 0;
            bottom = Math.min(bottom, currGrid.tbody.nativeElement.getBoundingClientRect().bottom - pinnedRowsHeight);
        }
        return bottom;
    }

    /**
     * Finds the next grid that allows scrolling down.
     *
     * @param grid The grid from which to begin the search.
     */
    private getNextScrollableDown(grid) {
        let currGrid = grid.parent;
        if (!currGrid) {
            return { grid, prev: null };
        }
        let scrollTop = currGrid.verticalScrollContainer.scrollPosition;
        let scrollHeight = currGrid.verticalScrollContainer.getScroll().scrollHeight;
        let nonScrollable = scrollHeight === 0 ||
            Math.round(scrollTop + currGrid.verticalScrollContainer.igxForContainerSize) === scrollHeight;
        let prev = grid;
        while (nonScrollable && currGrid.parent !== null) {
            prev = currGrid;
            currGrid = currGrid.parent;
            scrollTop = currGrid.verticalScrollContainer.scrollPosition;
            scrollHeight = currGrid.verticalScrollContainer.getScroll().scrollHeight;
            nonScrollable = scrollHeight === 0 ||
                Math.round(scrollTop + currGrid.verticalScrollContainer.igxForContainerSize) === scrollHeight;
        }
        return { grid: currGrid, prev };
    }

    /**
     * Finds the next grid that allows scrolling up.
     *
     * @param grid The grid from which to begin the search.
     */
    private getNextScrollableUp(grid) {
        let currGrid = grid.parent;
        if (!currGrid) {
            return { grid, prev: null };
        }
        let nonScrollable = currGrid.verticalScrollContainer.scrollPosition === 0;
        let prev = grid;
        while (nonScrollable && currGrid.parent !== null) {
            prev = currGrid;
            currGrid = currGrid.parent;
            nonScrollable = currGrid.verticalScrollContainer.scrollPosition === 0;
        }
        return { grid: currGrid, prev };
    }
}
