import { Component, Input } from '@angular/core';
import { IgxSummaryResult } from './grid';

@Component({
    selector: 'igx-grid-summary-row',
    templateUrl: './summary-row.component.html'
})
export class IgxSummaryRowComponent {
    @Input()
    public summaries: Map<string, IgxSummaryResult[]>;
}
