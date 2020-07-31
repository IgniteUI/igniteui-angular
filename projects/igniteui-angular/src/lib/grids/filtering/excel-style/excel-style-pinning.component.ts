import { Component } from '@angular/core';
import { IgxGridExcelStyleFilteringComponent } from './grid.excel-style-filtering.component';

/**
 * A component used for presenting Excel style column pinning UI.
 */
@Component({
    preserveWhitespaces: false,
    selector: 'igx-excel-style-pinning',
    templateUrl: './excel-style-pinning.component.html'
})
export class IgxExcelStylePinningComponent {
    constructor(public esf: IgxGridExcelStyleFilteringComponent) { }
}
