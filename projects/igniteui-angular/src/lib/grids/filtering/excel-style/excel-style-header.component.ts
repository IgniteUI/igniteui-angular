import { Component, Input } from '@angular/core';
import { IgxGridExcelStyleFilteringComponent } from './grid.excel-style-filtering.component';

@Component({
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
