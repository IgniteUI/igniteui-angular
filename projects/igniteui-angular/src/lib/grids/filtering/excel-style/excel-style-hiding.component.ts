import { Component } from '@angular/core';
import { BaseFilteringComponent } from './base-filtering.component';
import { IgxIconComponent } from '../../../icon/icon.component';

/**
 * A component used for presenting Excel style column hiding UI.
 */
@Component({
    selector: 'igx-excel-style-hiding',
    templateUrl: './excel-style-hiding.component.html',
    standalone: true,
    imports: [IgxIconComponent]
})
export class IgxExcelStyleHidingComponent {
    constructor(public esf: BaseFilteringComponent) { }
}
