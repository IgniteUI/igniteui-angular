import { Injectable, NgZone } from '@angular/core';
import { IgxColumnComponent } from '../columns/column.component';

/**
 * @hidden
 * @internal
 */
@Injectable()
export class IgxColumnResizingService {

    /**
     * @hidden
     */
    public startResizePos: number;
    /**
     * Indicates that a column is currently being resized.
     */
    public isColumnResizing: boolean;
    /**
     * @hidden
     */
    public resizeCursor: string = null;
    /**
     * @hidden
     */
    public showResizer = false;
    /**
     * The column being resized.
     */
    public column: IgxColumnComponent;

    constructor(private zone: NgZone) { }

    /**
     * @hidden
     */
    get resizerHeight(): number {
        let height = this.column.grid.getVisibleContentHeight();

        // Column height multiplier in case there are Column Layouts. The resizer height need to take into account rowStart.
        let columnHeightMultiplier = 1;
        if (this.column.columnLayoutChild) {
            columnHeightMultiplier = this.column.grid.multiRowLayoutRowSize - this.column.rowStart + 1;
        }

        if (this.column.level !== 0) {
            height -= this.column.topLevelParent.headerGroup.height - this.column.headerGroup.height * columnHeightMultiplier;
        }

        return height;
    }

    /**
     * Returns the minimal possible width to which the column can be resized.
     */
    get restrictResizeMin(): number {
        const actualWidth = this.column.headerCell.elementRef.nativeElement.getBoundingClientRect().width;
        const minWidth = this.column.minWidthPx < actualWidth ? this.column.minWidthPx : actualWidth;

        return actualWidth - minWidth;
    }

    /**
     * Returns the maximal possible width to which the column can be resized.
     */
    get restrictResizeMax(): number {
        const actualWidth = this.column.headerCell.elementRef.nativeElement.getBoundingClientRect().width;
        const maxWidth = this.column.maxWidthPx;
        if (this.column.maxWidth) {
            return maxWidth - actualWidth;
        } else {
            return Number.MAX_SAFE_INTEGER;
        }
    }

    /**
     * Autosizes the column to the longest currently visible cell value, including the header cell.
     * If the column has a predifined maxWidth and the autosized column width will become bigger than it,
     * then the column is sized to its maxWidth.
     */
    public autosizeColumnOnDblClick() {
        const currentColWidth = this.column.headerCell.elementRef.nativeElement.getBoundingClientRect().width;
        const isPercentageWidth = this.column.width && typeof this.column.width === 'string' && this.column.width.indexOf('%') !== -1;
        let size = this.column.getAutoSize();
        if (this.column.maxWidth && (parseFloat(size) > this.column.maxWidthPx)) {
            size = isPercentageWidth ? this.column.maxWidthPercent + '%' : this.column.maxWidthPx + 'px';
        } else if (parseFloat(size) < this.column.minWidthPx) {
            size = isPercentageWidth ? this.column.minWidthPercent + '%' : this.column.minWidthPx + 'px';
        }
        this.column.width = size;

        this.zone.run(() => {});

        this.column.grid.onColumnResized.emit({
            column: this.column,
            prevWidth: currentColWidth.toString(),
            newWidth: this.column.width
        });
    }

    /**
     * Resizes the column regaridng to the column minWidth and maxWidth.
     */
    public resizeColumn(event: MouseEvent) {
        this.showResizer = false;
        const diff = event.clientX - this.startResizePos;

        const colWidth = this.column.width;
        const isPercentageWidth = colWidth && typeof colWidth === 'string' && colWidth.indexOf('%') !== -1;
        let currentColWidth = parseFloat(colWidth);
        const actualWidth = this.column.headerCell.elementRef.nativeElement.getBoundingClientRect().width;
        currentColWidth = Number.isNaN(currentColWidth) ? parseFloat(actualWidth) : currentColWidth;

        if (isPercentageWidth) {
            this._handlePercentageResize(diff, this.column);
        } else {
            this._handlePixelResize(diff, this.column);
        }


        this.zone.run(() => {});

        if (currentColWidth !== parseFloat(this.column.width)) {
            this.column.grid.onColumnResized.emit({
                column: this.column,
                prevWidth: isPercentageWidth ? currentColWidth + '%' : currentColWidth + 'px',
                newWidth: this.column.width
            });
        }

        this.isColumnResizing = false;
    }

    protected _handlePixelResize(diff: number, column: IgxColumnComponent) {
        let currentColWidth = parseFloat(column.width);
        const actualWidth = this.column.headerCell.elementRef.nativeElement.getBoundingClientRect().width;
        currentColWidth = Number.isNaN(currentColWidth) || (currentColWidth < actualWidth) ? actualWidth : currentColWidth;

        const colMinWidth = column.minWidthPx;
        const colMaxWidth = column.maxWidthPx;
        if (this.column.grid.hasColumnLayouts) {
            this.resizeColumnLayoutFor(this.column, diff);
        } else {
            if (currentColWidth + diff < colMinWidth) {
                this.column.width = colMinWidth + 'px';
            } else if (colMaxWidth && (currentColWidth + diff > colMaxWidth)) {
                this.column.width = colMaxWidth + 'px';
            } else {
                this.column.width = (currentColWidth + diff) + 'px';
            }
        }
    }

    protected _handlePercentageResize(diff: number, column: IgxColumnComponent) {
        const currentPercentWidth = parseFloat(column.width);
        const gridAvailableSize = column.grid.calcWidth;

        const diffPercentage = (diff / gridAvailableSize) * 100;
        const colMinWidth = column.minWidthPercent;
        const colMaxWidth =  column.maxWidthPercent;

        if (currentPercentWidth + diffPercentage < colMinWidth) {
            this.column.width = colMinWidth + '%';
        } else if (colMaxWidth && (currentPercentWidth + diffPercentage > colMaxWidth)) {
            this.column.width = colMaxWidth + '%';
        } else {
            this.column.width = (currentPercentWidth + diffPercentage) + '%';
        }
    }

    protected getColMinWidth(column: IgxColumnComponent) {
        let currentColWidth = parseFloat(column.width);
        const actualWidth = column.headerCell.elementRef.nativeElement.getBoundingClientRect().width;
        currentColWidth = Number.isNaN(currentColWidth) || (currentColWidth < actualWidth) ? actualWidth : currentColWidth;

        const actualMinWidth = parseFloat(column.minWidth);
        return actualMinWidth < currentColWidth ? actualMinWidth : currentColWidth;
    }

    protected resizeColumnLayoutFor(column: IgxColumnComponent, diff: number) {
        const relativeColumns = column.getResizableColUnderEnd();
        const combinedSpan = relativeColumns.reduce((acc, col) =>  acc + col.spanUsed, 0);

        // Resize first those who might reach min/max width
        let columnsToResize = [...relativeColumns];
        let updatedDiff = diff;
        let updatedCombinedSpan = combinedSpan;
        let setMinMaxCols = false;
        do {
            // Cycle them until there are not ones that reach min/max size, because the diff accumulates after each cycle.
            // This is because we can have at first 2 cols reaching min width and then after
            // recalculating the diff there might be 1 more that reaches min width.
            setMinMaxCols = false;
            let newCombinedSpan = updatedCombinedSpan;
            const newColsToResize = [];
            columnsToResize.forEach((col) => {
                const currentResizeWidth = parseFloat(col.target.calcWidth);
                const resizeScaled = (diff / updatedCombinedSpan) * col.target.gridColumnSpan;

                const minWidth = this.getColMinWidth(col.target);
                const maxWidth = parseFloat(col.target.maxWidth);
                if (currentResizeWidth + resizeScaled < minWidth) {
                    col.target.width = minWidth + 'px';
                    updatedDiff += (currentResizeWidth - minWidth);
                    newCombinedSpan -= col.spanUsed;
                    setMinMaxCols = true;
                } else if (maxWidth && (currentResizeWidth + resizeScaled > maxWidth)) {
                    col.target.width = maxWidth + 'px';
                    updatedDiff -= (maxWidth - currentResizeWidth);
                    newCombinedSpan -= col.spanUsed;
                    setMinMaxCols = true;
                } else {
                    // Save new ones that can be resized
                    newColsToResize.push(col);
                }
            });

            updatedCombinedSpan = newCombinedSpan;
            columnsToResize = newColsToResize;
        } while (setMinMaxCols);

        // Those left that don't reach min/max size resize them normally.
        columnsToResize.forEach((col) => {
            const currentResizeWidth = parseFloat(col.target.calcWidth);
            const resizeScaled = (updatedDiff / updatedCombinedSpan) * col.target.gridColumnSpan;
            col.target.width = (currentResizeWidth + resizeScaled) + 'px';
        });
    }
}
