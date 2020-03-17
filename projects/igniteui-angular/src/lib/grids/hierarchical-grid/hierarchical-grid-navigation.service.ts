import { IgxGridNavigationService } from '../grid-navigation.service';
import { IgxHierarchicalGridComponent } from './hierarchical-grid.component';
import { first } from 'rxjs/operators';
import { ISelectionNode } from '../selection/selection.service';
import { isIE, SUPPORTED_KEYS } from '../../core/utils';
import { FilterMode } from '../common/enums';
import { IgxColumnComponent } from '../columns/column.component';
import { Injectable } from '@angular/core';
import { IgxHierarchicalRowComponent } from './hierarchical-row.component';
import { IgxChildGridRowComponent } from './child-grid-row.component';
import { IgxRowDirective, IgxGridBaseDirective } from '../grid';
import { GridType } from '../common/grid.interface';
import { IPathSegment } from './hierarchical-grid-base.directive';
import { isNumber } from 'util';

@Injectable()
export class IgxHierarchicalGridNavigationService extends IgxGridNavigationService {
    public grid: IgxHierarchicalGridComponent;


    dispatchEvent(event: KeyboardEvent) {
        const key = event.key.toLowerCase();
        if (!this.activeNode || !(SUPPORTED_KEYS.has(key) || (key === 'tab' && this.grid.crudService.cell))) { return; }

        const targetGrid = this.getClosestElemByTag(event.target, 'igx-hierarchical-grid');
        if (targetGrid !== this.grid.nativeElement) {
            return;
        }

        if (this.activeNode && event.altKey) {             
            const row = this.grid.getRowByIndex(this.activeNode.row) as IgxHierarchicalRowComponent;
            if (row.added) {
                return;
            }
            const collapse = row.expanded && (key === 'left' || key === 'arrowleft' || key === 'up' || key === 'arrowup');
            const expand = !row.expanded && (key === 'right' || key === 'arrowright' || key === 'down' || key === 'arrowdown');
            if (collapse) {
                this.grid.gridAPI.set_row_expansion_state(row.rowID, false, event);
            } else if (expand) {
                this.grid.gridAPI.set_row_expansion_state(row.rowID, true, event);
            }
            return;
        }
        super.dispatchEvent(event);
    }

    public navigateInBody(rowIndex, visibleColIndex, cb: Function = null): void {
        const rec = this.grid.dataView[rowIndex];
        if (rec && this.grid.isChildGridRecord(rec)) {
             // target is child grid
            const virtState = this.grid.verticalScrollContainer.state;
             const inView = rowIndex >= virtState.startIndex && rowIndex < virtState.startIndex + virtState.chunkSize;
             const isNext =  this.activeNode.row < rowIndex;
             const targetLayoutIndex = isNext ? null : this.grid.childLayoutKeys.length - 1;
             if (inView) {
                this._moveToChild(rowIndex, isNext, targetLayoutIndex);
            } else {
                this.grid.navigation.performVerticalScrollToCell(rowIndex, () => {
                    this._moveToChild(rowIndex, isNext, targetLayoutIndex);
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
                this.activeNode.row = null;
                this.grid.parent.navigation._moveToChild(this.grid.childRow.index, isLast, nextSiblingIndex);
            } else {
                this._moveToParent(isLast, visibleColIndex, cb);
            }
            return;
        }

        if (this.grid.parent) {
            const isNext = this.activeNode && this.activeNode.row ? rowIndex > this.activeNode.row : false;
            const cbHandler = (args) => {                
                this._handleScrollInChild(rowIndex, isNext);
                cb(args);
            };
            super.navigateInBody(rowIndex, visibleColIndex, cbHandler);
            return;
        }

        if (!this.activeNode) {
            this.activeNode = { row: null, column: null };
        }
        super.navigateInBody(rowIndex, visibleColIndex, cb);
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
     * @param rowIndex The row index which should be in view.
     * @param isNext  Optional. Whether we are navigating to next. Used to determine scroll direction.
     */
    protected _handleScrollInChild(rowIndex: number, isNext?: boolean) {
        const shouldScroll = this.grid.navigation.shouldPerformVerticalScroll(rowIndex);
        if (shouldScroll) {
            this.grid.navigation.performVerticalScrollToCell(rowIndex, () => {
                this.positionInParent(rowIndex, isNext);
            });
        } else {
            this.positionInParent(rowIndex, isNext);
        }        
    }

    /**
     * 
     * @param rowIndex Row index that should come in view.
     * @param isNext  Optional. Whether we are navigating to next. Used to determine scroll direction.
     */
    protected positionInParent(rowIndex, isNext) {
        const rowObj = this.grid.getRowByIndex(rowIndex);
        const positionInfo = this.getPositionInfo(rowObj, isNext);
        if(!positionInfo.inView) {
            const scrollableGrid = isNext ? this.getNextScrollableDown(this.grid) : this.getNextScrollableUp(this.grid);
            scrollableGrid.grid.verticalScrollContainer.addScrollTop(positionInfo.offset);
        }
    }

    /**
     * Moves navigation to child grid.
     * @param parentRowIndex The parent row index, at which the child grid is rendered.
     * @param childLayoutIndex Optional. The index of the child row island to which the child grid belongs to. Uses first if not set.
    */
    protected _moveToChild(parentRowIndex: number, isNext: boolean, childLayoutIndex?: number) {
        const ri = !isNumber(childLayoutIndex) ? this.grid.childLayoutList.first : this.grid.childLayoutList.toArray()[childLayoutIndex];
        const rowId = this.grid.dataView[parentRowIndex].rowID;
        const pathSegment: IPathSegment = {
            rowID: rowId,
            rowIslandKey: ri.key
        };
        const childGrid =  this.grid.hgridAPI.getChildGrid([pathSegment]);
        const targetIndex = isNext ? 0 : childGrid.dataView.length - 1;
        const targetRec =  childGrid.dataView[targetIndex];
        if(!targetRec) {
            // if no target rec, then move on in next sibling or parent
            childGrid.navigation.navigateInBody(targetIndex, this.activeNode.column);
            return;
        }
        if (childGrid.isChildGridRecord(targetRec)) {
            // if target is a child grid record should move into it.
            this.grid.navigation.activeNode.row = null;
            childGrid.navigation.activeNode = { row: targetIndex, column: this.activeNode.column};
            childGrid.navigation._moveToChild(targetIndex, isNext);
            return;
        }
        
        const childGridNav =  childGrid.navigation;
        this.activeNode.row = null;
        childGridNav.activeNode = { row: targetIndex, column: this.activeNode.column};
        childGrid.tbody.nativeElement.focus();
        childGrid.navigation._handleScrollInChild(targetIndex, isNext)
    }

    /**
     * Moves navigation back to parent grid.
     * @param rowIndex 
     */
    protected _moveToParent(isNext: boolean, columnIndex, cb?) {
        const indexInParent = this.grid.childRow.index;
        if (this.activeNode) {
            this.activeNode.row = null;
        }
        const targetRowIndex =  isNext ? indexInParent + 1 : indexInParent - 1;
        this.grid.parent.tbody.nativeElement.focus();        
        this.grid.parent.navigation.navigateInBody(targetRowIndex, columnIndex, cb); 
    }

    /**
     * Gets information on the row position relative to the root grid view port.
     * Returns whether the row is in view and its offset.
     * @param rowObj 
     * @param isNext 
     */
    protected getPositionInfo(rowObj: IgxRowDirective<IgxGridBaseDirective & GridType>, isNext: boolean) {
        const rowElem = rowObj.nativeElement;
        const gridBottom = this._getMinBottom(this.grid);
        const diffBottom =
        rowElem.getBoundingClientRect().bottom - gridBottom;
        const gridTop = this._getMaxTop(this.grid);        
        const diffTop = rowElem.getBoundingClientRect().bottom -
        rowElem.offsetHeight - gridTop;
        const isInView = isNext ? diffBottom <= 0 : diffTop >= 0;
        const calcOffset =  isNext ? diffBottom : diffTop;

        return { inView: isInView, offset: calcOffset };
    };

    /**
     * Gets closest element by its tag name.
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

    /**
     * Gets the max top view in the current grid hierarchy.
     * @param grid 
     */
    private _getMaxTop(grid) {
        let currGrid = grid;
        let top = currGrid.tbody.nativeElement.getBoundingClientRect().top;
        while (currGrid.parent) {
            currGrid = currGrid.parent;
            top = Math.max(top, currGrid.tbody.nativeElement.getBoundingClientRect().top);
        }
        return top;
    }

    /**
     * Gets the min bottom view in the current grid hierarchy.
     * @param grid 
    */
    private _getMinBottom(grid) {
        let currGrid = grid;
        let bottom = currGrid.tbody.nativeElement.getBoundingClientRect().bottom;
        while (currGrid.parent) {
            currGrid = currGrid.parent;
            bottom = Math.min(bottom, currGrid.tbody.nativeElement.getBoundingClientRect().bottom);
        }
        return bottom;
    }

    /**
     * Finds the next grid that allows scrolling down.
     * @param grid The grid from which to begin the search.
     */
    private getNextScrollableDown(grid) {
        let currGrid = grid.parent;
        if (!currGrid) {
            return { grid: grid, prev: null };
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
        return { grid: currGrid, prev: prev };
    }

    /**
     * Finds the next grid that allows scrolling up.
     * @param grid The grid from which to begin the search.
     */
    private getNextScrollableUp(grid) {
        let currGrid = grid.parent;
        if (!currGrid) {
            return { grid: grid, prev: null };
        }
        let nonScrollable = currGrid.verticalScrollContainer.scrollPosition === 0;
        let prev = grid;
        while (nonScrollable && currGrid.parent !== null) {
            prev = currGrid;
            currGrid = currGrid.parent;
            nonScrollable = currGrid.verticalScrollContainer.scrollPosition === 0;
        }
        return { grid: currGrid, prev: prev };
    }
}
