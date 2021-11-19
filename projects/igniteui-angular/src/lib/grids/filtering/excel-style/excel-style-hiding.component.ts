import { Component } from '@angular/core';
import { BaseFilteringComponent } from './base-filtering.component';

/**
 * A component used for presenting Excel style column hiding UI.
 */
@Component({
    selector: 'igx-excel-style-hiding',
    templateUrl: './excel-style-hiding.component.html'
})
export class IgxExcelStyleHidingComponent {
    constructor(public esf: BaseFilteringComponent) { }
}
