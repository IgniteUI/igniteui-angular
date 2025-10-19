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
    public override getColumnHeaderRenderedWidth() {
        return this.rowHeaderGroup.header.nativeElement.getBoundingClientRect().width;
    }

    protected override _handlePixelResize(diff: number, column: ColumnType) {
        const rowDim = this.rowHeaderGroup.parent.rootDimension;
        if (!rowDim) return;

        const currentColWidth = parseFloat(column.width);
        const colMinWidth = column.minWidthPx;
        const colMaxWidth = column.maxWidthPx;
        let newWidth = currentColWidth;
        if (currentColWidth + diff < colMinWidth) {
            newWidth = colMinWidth;
        } else if (colMaxWidth && (currentColWidth + diff > colMaxWidth)) {
            newWidth = colMaxWidth;
        } else {
            newWidth = (currentColWidth + diff);
        }

        this.rowHeaderGroup.grid.resizeRowDimensionPixels(rowDim, newWidth);
    }

    protected override _handlePercentageResize() { }
}
