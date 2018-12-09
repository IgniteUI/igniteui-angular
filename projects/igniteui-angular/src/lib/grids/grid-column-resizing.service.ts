import { Injectable, NgZone } from '@angular/core';
import { isFirefox } from '../core/utils';
import { IgxColumnComponent } from './column.component';

/** @hidden */
@Injectable()
export class IgxColumnResizingService {

    private pinnedMaxWidth: string;

    /**
     *@hidden
     */
    public startResizePos: number;
    /**
     * Indicates that a column is currently being resized.
     */
    public isColumnResizing: boolean;
    /**
     *@hidden
     */
    public resizeCursor: string = null;
    /**
     *@hidden
     */
    public showResizer = false;
    /**
     *@hidden
     */
    public resizerHeight: number;
    /**
     *@hidden
     */
    public resizeEndTimeout = isFirefox() ? 200 : 0;
    /**
     * The column being resized.
     */
    public column: IgxColumnComponent;

    constructor(private zone: NgZone) { }


    /**
     * Returns the minimal possible width to which the column can be resized.
     */
    get restrictResizeMin(): number {
        const actualMinWidth = parseFloat(this.column.minWidth);
        const defaultMinWidth = parseFloat(this.column.defaultMinWidth);

        let minWidth = Number.isNaN(actualMinWidth) || actualMinWidth < defaultMinWidth ? defaultMinWidth : actualMinWidth;
        minWidth = minWidth < parseFloat(this.column.width) ? minWidth : parseFloat(this.column.width);

        return minWidth - this.column.headerCell.elementRef.nativeElement.getBoundingClientRect().width;
    }

    /**
     * Returns the maximal possible width to which the column can be resized.
     */
    get restrictResizeMax(): number {
        const actualWidth = this.column.headerCell.elementRef.nativeElement.getBoundingClientRect().width;

        if (this.column.pinned) {
            const pinnedMaxWidth = this.pinnedMaxWidth =
                this.column.grid.calcPinnedContainerMaxWidth - this.column.grid.getPinnedWidth(true) + actualWidth;

            if (this.column.maxWidth && parseFloat(this.column.maxWidth) < pinnedMaxWidth) {
                this.pinnedMaxWidth = this.column.maxWidth;

                return parseFloat(this.column.maxWidth) - actualWidth;
            } else {
                return pinnedMaxWidth - actualWidth;
            }
        } else {
            if (this.column.maxWidth) {
                return parseFloat(this.column.maxWidth) - actualWidth;
            } else {
                return Number.MAX_SAFE_INTEGER;
            }
        }
    }

    /**
     * Autosizes the column to the longest currently visible cell value, including the header cell.
     * If the column has a predifined maxWidth and the autosized column width will become bigger than it,
     * then the column is sized to its maxWidth.
     * If the column is pinned and the autosized column width will cause the pinned area to become bigger
     * than the maximum allowed pinned area width (80% of the total grid width), autosizing will be deismissed.
     */
    public autosizeColumnOnDblClick() {
        if (this.column.resizable) {
            const currentColWidth = this.column.headerCell.elementRef.nativeElement.getBoundingClientRect().width;

            const size = this.column.getLargestCellWidth();

            if (this.column.pinned) {
                const newPinnedWidth = this.column.grid.getPinnedWidth(true) - currentColWidth + parseFloat(size);

                if (newPinnedWidth <= this.column.grid.calcPinnedContainerMaxWidth) {
                    this.column.width = size;
                }
            } else if (this.column.maxWidth && (parseFloat(size) > parseFloat(this.column.maxWidth))) {
                this.column.width = parseFloat(this.column.maxWidth) + 'px';
            } else if (parseFloat(size) < parseFloat(this.column.defaultMinWidth)) {
                this.column.width = this.column.defaultMinWidth + 'px';
            } else {
                this.column.width = size;
            }

            this.zone.run(() => {});

            this.column.grid.reflow();
            this.column.grid.onColumnResized.emit({
                column: this.column,
                prevWidth: currentColWidth.toString(),
                newWidth: this.column.width
            });
        }
    }

    /**
     * Resizes the column regaridng to the column minWidth and maxWidth.
     */
    public resizeColumn(event: MouseEvent) {
        this.isColumnResizing = false;

        this.showResizer = false;
        const diff = event.clientX - this.startResizePos;

        if (this.column.resizable) {
            let currentColWidth = parseFloat(this.column.width);

            const actualMinWidth = parseFloat(this.column.minWidth);
            const defaultMinWidth = parseFloat(this.column.defaultMinWidth);

            let colMinWidth = Number.isNaN(actualMinWidth) || actualMinWidth < defaultMinWidth ? defaultMinWidth : actualMinWidth;
            const colMaxWidth = this.column.pinned ? parseFloat(this.pinnedMaxWidth) : parseFloat(this.column.maxWidth);

            const actualWidth = this.column.headerCell.elementRef.nativeElement.getBoundingClientRect().width;

            currentColWidth = Number.isNaN(currentColWidth) || (currentColWidth < actualWidth) ? actualWidth : currentColWidth;
            colMinWidth = colMinWidth < currentColWidth ? colMinWidth : currentColWidth;

            if (currentColWidth + diff < colMinWidth) {
                this.column.width = colMinWidth + 'px';
            } else if (colMaxWidth && (currentColWidth + diff > colMaxWidth)) {
                this.column.width = colMaxWidth + 'px';
            } else {
                this.column.width = (currentColWidth + diff) + 'px';
            }

            this.zone.run(() => {});
            this.column.grid.reflow();

            if (currentColWidth !== parseFloat(this.column.width)) {
                this.column.grid.onColumnResized.emit({
                    column: this.column,
                    prevWidth: currentColWidth.toString(),
                    newWidth: this.column.width
                });
            }
        }
    }
}
