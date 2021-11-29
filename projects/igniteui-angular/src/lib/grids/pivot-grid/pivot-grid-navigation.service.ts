import { IgxGridNavigationService } from '../grid-navigation.service';
import { Injectable } from '@angular/core';
import { IgxPivotGridComponent } from './pivot-grid.component';
import { HEADER_KEYS } from '../../core/utils';

@Injectable()
export class IgxPivotGridNavigationService extends IgxGridNavigationService {
    public grid: IgxPivotGridComponent;

    public get lastRowDimensionsIndex() {
        return this.grid.rowDimensions.length - 1;
    }

    public focusOutRowHeader() {
        this.activeNode.isRowDimensionHeader = false;
    }

    public headerNavigation(event: KeyboardEvent) {
        const key = event.key.toLowerCase();
        const ctrl = event.ctrlKey;
        if (!HEADER_KEYS.has(key)) {
            return;
        }
        event.preventDefault();

        if (this.activeNode.isRowDimensionHeader) {
            const newActiveNode = {
                row: this.activeNode.row, column: this.activeNode.column, level: null,
                mchCache: null,
                layout: null,
                isRowDimensionHeader: this.activeNode.isRowDimensionHeader
            }

            if ((key.includes('left') || key === 'home') && this.activeNode.column > 0) {
                newActiveNode.column = ctrl || key === 'home' ? 0 : this.activeNode.column - 1;
            }
            if ((key.includes('right') || key === 'end') && this.activeNode.column < this.lastRowDimensionsIndex) {
                newActiveNode.column = ctrl || key === 'end' ? this.lastRowDimensionsIndex : this.activeNode.column + 1;
            }
            if ((key.includes('up')) && this.activeNode.row > 0) {
                newActiveNode.row = ctrl ? 0 : this.activeNode.row - 1;
            }
            if ((key.includes('down')) && this.activeNode.row < this.findLastDataRowIndex()) {
                newActiveNode.row = ctrl ? this.findLastDataRowIndex() : this.activeNode.row + 1;
            }
            this.setActiveNode(newActiveNode);
            this.grid.navigateTo(newActiveNode.row);
        } else {
            super.headerNavigation(event);
        }
    }
}
