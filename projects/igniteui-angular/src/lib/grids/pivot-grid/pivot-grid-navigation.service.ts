import { IgxGridNavigationService } from '../grid-navigation.service';
import { Injectable } from '@angular/core';
import { IgxPivotGridComponent } from './pivot-grid.component';
import { HEADER_KEYS, ROW_COLLAPSE_KEYS, ROW_EXPAND_KEYS } from '../../core/utils';
import { PivotUtil } from './pivot-util';

@Injectable()
export class IgxPivotGridNavigationService extends IgxGridNavigationService {
    public override grid: IgxPivotGridComponent;

    public isRowHeaderActive: boolean;

    public get lastRowDimensionsIndex() {
        return this.grid.rowDimensions.length - 1;
    }

    public focusOutRowHeader() {
        this.isRowHeaderActive = false;
    }

    public override handleNavigation(event: KeyboardEvent) {
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

            if (event.altKey) {
                this.handleAlt(key, event);
                return;
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

    public override handleAlt(key: string, event: KeyboardEvent): void {
        event.preventDefault();

        let row = this.grid.gridAPI.get_row_by_index(this.activeNode.row);
        let expansionRowKey = PivotUtil.getRecordKey(row.data, row.data.dimensions[0])
        let isExpanded = this.grid.expansionStates.has(expansionRowKey) ? this.grid.expansionStates.get(expansionRowKey) : true;

        if (!isExpanded && ROW_EXPAND_KEYS.has(key)) {
            if (row.key === undefined) {
                // TODO use expanded row.expanded = !row.expanded;
                (row as any).toggle();
            } else {
                const newExpansionState = new Map<any, boolean>(this.grid.expansionStates);
                newExpansionState.set(expansionRowKey, true);
                this.grid.expansionStates = newExpansionState;
            }
        } else if (isExpanded && ROW_COLLAPSE_KEYS.has(key)) {
            if (row.key === undefined) {
                // TODO use expanded row.expanded = !row.expanded;
                (row as any).toggle();
            } else {
                const newExpansionState = new Map<any, boolean>(this.grid.expansionStates);
                newExpansionState.set(expansionRowKey, false);
                this.grid.expansionStates = newExpansionState;
            }
        }
        this.grid.notifyChanges();
    }

    public override focusTbody(event) {
        if (!this.activeNode || this.activeNode.row === null || this.activeNode.row === undefined) {
            this.activeNode = this.lastActiveNode;
        } else {
            super.focusTbody(event);
        }
    }
}
