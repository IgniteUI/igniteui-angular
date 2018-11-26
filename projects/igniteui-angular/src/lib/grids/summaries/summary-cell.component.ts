import { Component, Input, HostBinding } from '@angular/core';
import { IgxSummaryResult } from './grid-summary';
import { IgxColumnComponent } from '../grid';

@Component({
    selector: 'igx-grid-summary-cell',
    templateUrl: './summary-cell.component.html'
})
export class IgxSummaryCellComponent {

    @Input()
    public summaryResults: IgxSummaryResult[];

    @Input()
    public column: IgxColumnComponent;

    @Input()
    @HostBinding('attr.data-rowIndex')
    public rowIndex: number;

    @HostBinding('attr.data-visibleIndex')
    get visibleColumnIndex(): number {
        return this.column.visibleIndex;
    }

    @HostBinding('style.min-height.px')
    get minHeight() {
        return this.column.grid.summaryService.calculateMaxSummaryHeight();
    }

    @HostBinding('attr.tabindex')
    public tabindex = 0;

    get columnDatatype() {
        return this.column.dataType;
    }
}
