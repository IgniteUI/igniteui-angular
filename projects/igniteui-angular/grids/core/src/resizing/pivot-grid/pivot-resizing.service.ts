import { Injectable } from '@angular/core';
import { IgxColumnResizingService } from '../resizing.service';
import { ColumnType } from 'igniteui-angular/core';
import { PivotRowHeaderGroupType } from '../../pivot-grid.interface';


/**
 * @hidden
 * @internal
 */
@Injectable()
export class IgxPivotColumnResizingService extends IgxColumnResizingService {
    /**
     * @hidden
     */
    public rowHeaderGroup!: PivotRowHeaderGroupType;

    /**
     * @hidden
     */
    public override getColumnHeaderRenderedWidth() {
        const headerWidth = this.rowHeaderGroup.header.nativeElement.getBoundingClientRect().width;
        // A collapsed or summary header spans several dimensions, but only the first one is resized.
        const rowDimWidth = this.rowHeaderGroup.grid.rowDimensionWidthToPixels(this.rowHeaderGroup.parent.rootDimension);
        return rowDimWidth < headerWidth ? rowDimWidth : headerWidth;
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
