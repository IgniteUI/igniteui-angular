import { Component } from '@angular/core';
import { IgxButtonDirective, IgxComboComponent, IgxDropDownComponent, IgxDropDownItemComponent, IgxDropDownItemNavigationDirective, IgxLabelDirective, IgxSelectComponent, IgxSelectItemComponent, IgxToggleActionDirective } from 'igniteui-angular';

// eslint-disable-next-line prefer-spread
const data = Array.apply(null, { length: 57 }).map((e, i) => ({
    valueKey: i,
    textKey: `Option ${i + 1}`,
    isHeader: i % 7 === 0
}));

@Component({
    selector: 'app-display-density',
    templateUrl: 'drop-down-size.sample.html',
    styleUrls: ['drop-down-size.sample.scss'],
    imports: [IgxComboComponent, IgxButtonDirective, IgxToggleActionDirective, IgxDropDownItemNavigationDirective, IgxDropDownComponent, IgxDropDownItemComponent, IgxSelectComponent, IgxLabelDirective, IgxSelectItemComponent]
})
export class DropDownSizeSampleComponent {
    public data = data;
}
