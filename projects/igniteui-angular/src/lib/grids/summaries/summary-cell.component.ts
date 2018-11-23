import { Component, Input, HostBinding } from '@angular/core';
import { IgxSummaryResult } from './grid-summary';

@Component({
    selector: 'igx-grid-summary-cell',
    templateUrl: './summary-cell.component.html'
})
export class IgxSummaryCellComponent {

    @Input()
    public summaryResults: IgxSummaryResult[];

    @Input()
    public columnDatatype = 'string';

    @HostBinding('style.min-height.px')
    h = 32;
}
