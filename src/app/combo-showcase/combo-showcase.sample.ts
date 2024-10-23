import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
    IgxButtonGroupComponent,
    IgxComboAddItemDirective,
    IgxComboComponent,
    IgxComboFooterDirective,
    IgxComboHeaderDirective,
    IgxHintDirective,
    IgxIconComponent,
    IgxInputDirective,
    IgxInputGroupComponent,
    IgxLabelDirective,
    IgxPrefixDirective,
    IgxSimpleComboComponent,
    IgxSwitchComponent,
} from 'igniteui-angular';
import { SizeSelectorComponent } from '../size-selector/size-selector.component';
import { defineComponents, IgcComboComponent} from "igniteui-webcomponents";

defineComponents(IgcComboComponent);

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'combo-showcase-sample',
    templateUrl: './combo-showcase.sample.html',
    styleUrls: ['combo-showcase.sample.scss'],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    standalone: true,
    imports: [
        IgxInputGroupComponent,
        IgxInputDirective,
        FormsModule,
        IgxSimpleComboComponent,
        IgxLabelDirective,
        IgxHintDirective,
        IgxComboComponent,
        IgxComboHeaderDirective,
        IgxComboFooterDirective,
        IgxComboAddItemDirective,
        IgxPrefixDirective,
        IgxIconComponent,
        IgxSwitchComponent,
        IgxButtonGroupComponent,
        SizeSelectorComponent,
    ]
})
export class ComboShowcaseSampleComponent {
    public isDisabled = false;
    public uniqueFalsyData: any[];

    constructor(
        public cdr: ChangeDetectorRef) {
        this.uniqueFalsyData = [
            { field: 'null', value: null },
            { field: 'true', value: true },
            { field: 'false', value: false },
            { field: 'empty', value: '' },
            { field: 'undefined', value: undefined },
            { field: 'NaN', value: NaN }
        ];
    }
}
