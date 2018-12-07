import { Component, Input, HostBinding, ChangeDetectionStrategy } from '@angular/core';
import { IgxSummaryResult } from './grid-summary';
import { IgxColumnComponent } from '../column.component';
import { GridBaseAPIService } from '../api.service';
import { IgxGridBaseComponent } from '../grid-base.component';
import { DisplayDensity } from '../../core/density';
import { DataType } from '../../data-operations/data-util';
import { IgxSummaryRowComponent } from './summary-row.component';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: 'igx-grid-summary-cell',
    templateUrl: './summary-cell.component.html'
})
export class IgxSummaryCellComponent {

    @Input()
    public summaryResults: IgxSummaryResult[];

    @Input()
    public column: IgxColumnComponent;

    @Input()
    public row: IgxSummaryRowComponent;

    @Input()
    public firstCellIndentation = 0;

    @Input()
    public hasSummary = false;

    @Input()
    public density;

    constructor(private gridAPI: GridBaseAPIService<IgxGridBaseComponent>) {
    }

    @HostBinding('class')
    get styleClasses(): string {
        const defaultClasses = ['igx-grid-summary--cell'];
        const classList = {
            'igx-grid-summary': this.density === DisplayDensity.comfortable,
            'igx-grid-summary--fw': this.column.width !== null,
            'igx-grid-summary--empty': !this.column.hasSummary,
            'igx-grid-summary--compact': this.density === DisplayDensity.compact,
            'igx-grid-summary--cosy': this.density === DisplayDensity.cosy,
            'igx-grid-summary--pinned': this.column.pinned,
            'igx-grid-summary--pinned-last': this.column.isLastPinned
        };
        Object.entries(classList).forEach(([className, value]) => {
            if (value) {
                defaultClasses.push(className);
            }
        });
        return defaultClasses.join(' ');
    }

    @Input()
    @HostBinding('attr.data-rowIndex')
    public rowIndex: number;

    @HostBinding('attr.data-visibleIndex')
    get visibleColumnIndex(): number {
        return this.column.visibleIndex;
    }

    @HostBinding('attr.tabindex')
    public tabindex = 0;

    @HostBinding('attr.aria-describedby')
    public get describeby() {
        return `Summary_${this.column.field}`;
    }

    @HostBinding('style.min-width')
    @HostBinding('style.max-width')
    @HostBinding('style.flex-basis')
    get width() {
        const hasVerticalScroll = !this.grid.verticalScrollContainer.dc.instance.notVirtual;
        const colWidth = this.column.width;
        const isPercentageWidth = colWidth && typeof colWidth === 'string' && colWidth.indexOf('%') !== -1;

        if (colWidth && !isPercentageWidth) {
            let cellWidth = this.isLastUnpinned && hasVerticalScroll ?
                parseInt(colWidth, 10) - 18 + '' : colWidth;

            if (typeof cellWidth !== 'string' || cellWidth.endsWith('px') === false) {
                cellWidth += 'px';
            }

            return cellWidth;
        } else {
            return colWidth;
        }
    }

    get gridID(): any {
        return this.row.gridID;
    }

    get grid(): any {
        return this.gridAPI.get(this.gridID);
    }

    get isLastUnpinned() {
        const unpinnedColumns = this.grid.unpinnedColumns;
        return unpinnedColumns[unpinnedColumns.length - 1] === this.column;
    }

    get columnDatatype(): DataType {
        return this.column.dataType;
    }

    get itemHeight() {
        return this.column.grid.defaultRowHeight;
    }
}
