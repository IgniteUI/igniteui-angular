import { Component } from '@angular/core';
import { BaseFilteringComponent } from './base-filtering.component';

/**
 * A component used for presenting Excel style conditional filter UI.
 */
@Component({
    selector: 'igx-excel-style-selecting',
    templateUrl: './excel-style-selecting.component.html'
})
export class IgxExcelStyleSelectingComponent {
    constructor(public esf: BaseFilteringComponent) { }
}
