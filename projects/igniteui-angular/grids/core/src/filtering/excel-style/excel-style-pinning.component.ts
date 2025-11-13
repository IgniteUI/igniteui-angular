import { Component } from '@angular/core';
import { BaseFilteringComponent } from './base-filtering.component';
import { NgClass } from '@angular/common';
import { IgxIconComponent } from 'igniteui-angular/icon';

/**
 * A component used for presenting Excel style column pinning UI.
 */
@Component({
    selector: 'igx-excel-style-pinning',
    templateUrl: './excel-style-pinning.component.html',
    imports: [NgClass, IgxIconComponent]
})
export class IgxExcelStylePinningComponent {
    constructor(public esf: BaseFilteringComponent) { }
}
