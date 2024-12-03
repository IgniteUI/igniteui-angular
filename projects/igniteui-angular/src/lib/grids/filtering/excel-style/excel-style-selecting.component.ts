import { Component } from '@angular/core';
import { BaseFilteringComponent } from './base-filtering.component';
import { IgxIconComponent } from '../../../icon/icon.component';
import { NgIf, NgClass } from '@angular/common';

/**
 * A component used for presenting Excel style conditional filter UI.
 */
@Component({
    selector: 'igx-excel-style-selecting',
    templateUrl: './excel-style-selecting.component.html',
    imports: [NgIf, NgClass, IgxIconComponent]
})
export class IgxExcelStyleSelectingComponent {
    constructor(public esf: BaseFilteringComponent) { }
}
