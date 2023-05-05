import { Component } from '@angular/core';
import { DisplayDensity } from 'igniteui-angular';
import { IgxSelectItemComponent } from '../../../../projects/igniteui-angular/src/lib/select/select-item.component';
import { IgxLabelDirective } from '../../../../projects/igniteui-angular/src/lib/directives/label/label.directive';
import { IgxSelectComponent } from '../../../../projects/igniteui-angular/src/lib/select/select.component';
import { IgxDropDownItemComponent } from '../../../../projects/igniteui-angular/src/lib/drop-down/drop-down-item.component';
import { NgFor } from '@angular/common';
import { IgxDropDownComponent } from '../../../../projects/igniteui-angular/src/lib/drop-down/drop-down.component';
import { IgxDropDownItemNavigationDirective } from '../../../../projects/igniteui-angular/src/lib/drop-down/drop-down-navigation.directive';
import { IgxToggleActionDirective } from '../../../../projects/igniteui-angular/src/lib/directives/toggle/toggle.directive';
import { IgxButtonDirective } from '../../../../projects/igniteui-angular/src/lib/directives/button/button.directive';
import { IgxComboComponent } from '../../../../projects/igniteui-angular/src/lib/combo/combo.component';

const data = Array.apply(null, { length: 57 }).map((e, i) => ({
        valueKey: i,
        textKey: `Option ${i + 1}`,
        isHeader: i % 7 === 0
    }));
@Component({
    selector: 'app-display-density',
    templateUrl: 'display-density.sample.html',
    styleUrls: ['display-density.sample.scss'],
    standalone: true,
    imports: [IgxComboComponent, IgxButtonDirective, IgxToggleActionDirective, IgxDropDownItemNavigationDirective, IgxDropDownComponent, NgFor, IgxDropDownItemComponent, IgxSelectComponent, IgxLabelDirective, IgxSelectItemComponent]
})
export class DisplayDensityDropDownComponent {
    public data = data;
    public displayDensity = DisplayDensity;
}
