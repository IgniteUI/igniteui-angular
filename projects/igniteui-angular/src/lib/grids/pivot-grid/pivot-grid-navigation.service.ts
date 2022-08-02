import { IgxGridNavigationService } from '../grid-navigation.service';
import { Injectable } from '@angular/core';
import { IgxPivotGridComponent } from './pivot-grid.component';
import { HEADER_KEYS } from '../../core/utils';

@Injectable()
export class IgxPivotGridNavigationService extends IgxGridNavigationService {
    public grid: IgxPivotGridComponent;

    public isRowHeaderActive: boolean;

    public get lastRowDimensionsIndex() {
        return this.grid.rowDimensions.length - 1;
    }

    public focusOutRowHeader() {
        this.isRowHeaderActive = false;
    }

    public handleNavigation(event: KeyboardEvent) {
        if (this.isRowHeaderActive) {
            const key = event.key.toLowerCase();
            const ctrl = event.ctrlKey;
            if (!HEADER_KEYS.has(key)) {
                return;
            }
            event.preventDefault();

            const newActiveNode = {
                row: this.activeNode.row, column: this.activeNode.column, level: null,
                mchCache: null,
                layout: null
            }

            if ((key.includes('left') || key === 'home') && this.activeNode.column > 0) {
                newActiveNode.column = ctrl || key === 'home' ? 0 : this.activeNode.column - 1;
            }
            if ((key.includes('right') || key === 'end') && this.activeNode.column < this.lastRowDimensionsIndex) {
                newActiveNode.column = ctrl || key === 'end' ? this.lastRowDimensionsIndex : this.activeNode.column + 1;
            }
            const verticalContainer = this.grid.verticalRowDimScrollContainers.toArray()[newActiveNode.column];
            if ((key.includes('up')) && this.activeNode.row > 0) {
                newActiveNode.row = ctrl ? 0 : this.activeNode.row - 1;
            }
            if ((key.includes('down')) && this.activeNode.row < this.findLastDataRowIndex()) {
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
            this.setActiveNode(newActiveNode);
            if (verticalContainer.isIndexOutsideView(newActiveNode.row)) {
                verticalContainer.scrollTo(newActiveNode.row);
            }
        } else {
            super.handleNavigation(event);
        }
    }

    public focusTbody(event) {
        if (!this.activeNode || this.activeNode.row === null || this.activeNode.row === undefined) {
            this.activeNode = this.lastActiveNode;
        } else {
            super.focusTbody(event);
        }
    }
}
