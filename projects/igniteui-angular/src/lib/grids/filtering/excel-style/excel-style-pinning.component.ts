import { Component } from '@angular/core';
import { BaseFilteringComponent } from './base-filtering.component';
import { IgxIconComponent } from '../../../icon/icon.component';
import { NgClass } from '@angular/common';

/**
 * A component used for presenting Excel style column pinning UI.
 */
@Component({
    selector: 'igx-excel-style-pinning',
    templateUrl: './excel-style-pinning.component.html',
    standalone: true,
    imports: [NgClass, IgxIconComponent]
})
export class IgxExcelStylePinningComponent {
    constructor(public esf: BaseFilteringComponent) { }
}
