import { Component } from '@angular/core';
import { NgFor } from '@angular/common';
import { IgxButtonDirective, IgxComboComponent, IgxDropDownComponent, IgxDropDownItemComponent, IgxDropDownItemNavigationDirective, IgxLabelDirective, IgxSelectComponent, IgxSelectItemComponent, IgxToggleActionDirective } from 'igniteui-angular';

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
export class SizingDropDownComponent {
    public data = data;
}
