import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { IgxGridExcelStyleFilteringComponent } from './grid.excel-style-filtering.component';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: 'igx-excel-style-header',
    templateUrl: './excel-style-header.component.html'
})
export class IgxExcelStyleHeaderComponent {
    constructor(public esf: IgxGridExcelStyleFilteringComponent) { }

    @Input()
    showPinning: boolean;

    @Input()
    showSelecting: boolean;

    @Input()
    showHiding: boolean;
}
