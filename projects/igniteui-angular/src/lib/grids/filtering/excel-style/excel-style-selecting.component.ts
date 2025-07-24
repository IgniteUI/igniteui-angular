import { Component, inject } from '@angular/core';
import { BaseFilteringComponent } from './base-filtering.component';
import { IgxIconComponent } from '../../../icon/icon.component';
import { NgClass } from '@angular/common';

/**
 * A component used for presenting Excel style conditional filter UI.
 */
@Component({
    selector: 'igx-excel-style-selecting',
    templateUrl: './excel-style-selecting.component.html',
    imports: [NgClass, IgxIconComponent]
})
export class IgxExcelStyleSelectingComponent {
    public esf = inject(BaseFilteringComponent);
}
