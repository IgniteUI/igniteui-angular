import { Injectable } from '@angular/core';
import { ColumnType } from '../../common/grid.interface';
import { PivotRowHeaderGroupType } from '../../pivot-grid/pivot-grid.interface';
import { IgxColumnResizingService } from '../resizing.service';


/**
 * @hidden
 * @internal
 */
@Injectable()
export class IgxPivotColumnResizingService extends IgxColumnResizingService {
    /**
     * @hidden
     */
    public rowHeaderGroup: PivotRowHeaderGroupType;

    /**
     * @hidden
     */
    public getColumnHeaderRenderedWidth() {
        return this.rowHeaderGroup.header.nativeElement.getBoundingClientRect().width;
    }

    protected _handlePixelResize(diff: number, column: ColumnType) {
        const pivotRow = this.rowHeaderGroup.intRow as any;
        const rowDimIndex = pivotRow.rowDimensionData.findIndex(x => x.column === this.column);
        const rowDim = pivotRow.grid.pivotConfiguration.rows[rowDimIndex];
        if (!rowDim) return;

        const currentColWidth = parseFloat(column.width);
        const colMinWidth = column.minWidthPx;
        const colMaxWidth = column.maxWidthPx;
        if (currentColWidth + diff < colMinWidth) {
            rowDim.width = colMinWidth + 'px';
        } else if (colMaxWidth && (currentColWidth + diff > colMaxWidth)) {
            rowDim.width = colMaxWidth + 'px';
        } else {
            rowDim.width = (currentColWidth + diff) + 'px';
        }
        
        // Notify the grid to reflow, to update if horizontal scrollbar needs to be rendered/removed.
        this.column.grid.notifyChanges(true);
    }

    protected _handlePercentageResize(diff: number, column: ColumnType) { }
}
