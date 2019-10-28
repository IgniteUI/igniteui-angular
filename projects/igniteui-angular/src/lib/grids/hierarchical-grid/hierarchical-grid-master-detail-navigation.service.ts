import { IgxHierarchicalGridComponent } from './hierarchical-grid.component';
import { IgxGridNavigationService } from '../grid-navigation.service';
import { ISelectionNode } from '../../core/grid-selection';

export class IgxHierarchicalGridMasterDetailNavigationService extends IgxGridNavigationService {
    public grid: IgxHierarchicalGridComponent;

    protected getRowSelector() {
        return 'igx-hierarchical-grid-row';
    }
    protected getCellSelector(visibleIndex?: number, isSummary = false) {
        return isSummary ? 'igx-grid-summary-cell' : 'igx-hierarchical-grid-cell';
    }

    public navigateUp(rowElement, selectedNode: ISelectionNode) {
        if (this.grid.isChildGridRecord(this.grid.dataView[selectedNode.row - 1])) {
                this.focusDetailsRow(selectedNode.row - 1);
        } else {
            super.navigateUp(rowElement, selectedNode);
        }
    }

    public navigateDown(rowElement, selectedNode: ISelectionNode) {
        if ( this.grid.isChildGridRecord(this.grid.dataView[selectedNode.row + 1])) {
                    this.focusDetailsRow(selectedNode.row + 1);
        } else {
            super.navigateDown(rowElement, selectedNode);
        }
    }

    protected focusDetailsRow(index, lastChild?) {
        this.grid.wheelHandler();
        if (this.shouldPerformVerticalScroll(index, -1)) {
            this.performVerticalScrollToCell(index, -1,
                () => {
                    this._applyFocus(index, lastChild);
                 });
        } else {
            this._applyFocus(index, lastChild);
        }
    }

    private _applyFocus(index, lastChild?) {
        let target = this.getRowByIndex(index, '') as any;
        if (lastChild) {
            const focusable = target.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (focusable.length > 0 ) {
                target =  focusable[focusable.length - 1];
            }
        }
        target.focus();
    }

    public shouldPerformVerticalScroll(targetRowIndex: number, visibleColumnIndex: number): boolean {
        const containerTopOffset = parseInt(this.verticalDisplayContainerElement.style.top, 10);
        const targetRow =  this.getRowByIndex(targetRowIndex, '') as any;
        const rowHeight = this.grid.verticalScrollContainer.getSizeAt(targetRowIndex);
        const containerHeight = this.grid.calcHeight ? Math.ceil(this.grid.calcHeight) : 0;
        const targetEndTopOffset = targetRow ? targetRow.offsetTop + rowHeight + containerTopOffset :
            containerHeight + rowHeight;
        if (!targetRow || targetRow.offsetTop < Math.abs(containerTopOffset)
            || containerHeight && containerHeight < targetEndTopOffset) {
            return true;
        } else {
            return false;
        }
    }

    public performTab(currentRowEl, selectedNode: ISelectionNode) {
        const visibleColumnIndex = selectedNode.column;
        const isLastColumn = this.grid.unpinnedColumns[this.grid.unpinnedColumns.length - 1].visibleIndex === visibleColumnIndex;
        if (isLastColumn && this.grid.isChildGridRecord(this.grid.dataView[selectedNode.row + 1])) {
                this.focusDetailsRow(selectedNode.row + 1);
        } else {
            super.performTab(currentRowEl, selectedNode);
        }
    }

    public performShiftTabKey(currentRowEl, selectedNode: ISelectionNode) {
        const isFirstColumn = selectedNode.column === 0;
        if (isFirstColumn && this.grid.isChildGridRecord(this.grid.dataView[selectedNode.row - 1])) {
            this.focusDetailsRow(selectedNode.row - 1, true);
    } else {
        super.performShiftTabKey(currentRowEl, selectedNode);
    }
    }
}
