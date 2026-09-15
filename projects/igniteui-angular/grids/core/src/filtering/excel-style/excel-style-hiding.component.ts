import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { BaseFilteringComponent } from './base-filtering.component';
import { IgxIconComponent } from 'igniteui-angular/icon';

/**
 * A component used for presenting Excel style column hiding UI.
 */
@Component({
    selector: 'igx-excel-style-hiding',
    templateUrl: './excel-style-hiding.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxIconComponent]
})
export class IgxExcelStyleHidingComponent {
    public esf = inject(BaseFilteringComponent);
}
