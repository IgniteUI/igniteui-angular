import { Component } from '@angular/core';
import { IgxGridExcelStyleFilteringComponent } from './grid.excel-style-filtering.component';

/**
 * A component used for presenting Excel style conditional filter UI.
 */
@Component({
    preserveWhitespaces: false,
    selector: 'igx-excel-style-selecting',
    templateUrl: './excel-style-selecting.component.html'
})
export class IgxExcelStyleSelectingComponent {
    constructor(public esf: IgxGridExcelStyleFilteringComponent) { }
}
