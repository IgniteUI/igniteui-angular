import { Component } from '@angular/core';
import { BaseFilteringComponent } from './base-filtering.component';

/**
 * A component used for presenting Excel style column pinning UI.
 */
@Component({
    selector: 'igx-excel-style-pinning',
    templateUrl: './excel-style-pinning.component.html'
})
export class IgxExcelStylePinningComponent {
    constructor(public esf: BaseFilteringComponent) { }
}
