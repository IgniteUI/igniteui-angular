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

    @HostBinding('attr.tabindex')
    public tabindex = 0;

    get columnDatatype() {
        return this.column.dataType;
    }

    get itemHeight() {
        return this.column.grid.defaultRowHeight;
    }
}
