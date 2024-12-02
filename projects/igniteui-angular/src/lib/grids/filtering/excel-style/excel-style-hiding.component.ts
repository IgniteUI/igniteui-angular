import { Component } from '@angular/core';
import { BaseFilteringComponent } from './base-filtering.component';
import { IgxIconComponent } from '../../../icon/icon.component';
import { NgIf } from '@angular/common';

/**
 * A component used for presenting Excel style column hiding UI.
 */
@Component({
    selector: 'igx-excel-style-hiding',
    templateUrl: './excel-style-hiding.component.html',
    imports: [NgIf, IgxIconComponent]
})
export class IgxExcelStyleHidingComponent {
    constructor(public esf: BaseFilteringComponent) { }
}
