import { Component, Inject, OnInit, AfterViewInit } from '@angular/core';
import { UntypedFormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
    IgxInputGroupType,
    ButtonGroupAlignment,
    DisplayDensityToken,
    IDisplayDensityOptions,
    IButtonGroupEventArgs,
    IGX_INPUT_GROUP_TYPE,
    DisplayDensity
} from 'igniteui-angular';
import { IgxButtonDirective } from '../../../projects/igniteui-angular/src/lib/directives/button/button.directive';
import { IgxCheckboxComponent, IgxCheckboxRequiredDirective } from '../../../projects/igniteui-angular/src/lib/checkbox/checkbox.component';
import { IgxSelectItemComponent } from '../../../projects/igniteui-angular/src/lib/select/select-item.component';
import { IgxSelectComponent } from '../../../projects/igniteui-angular/src/lib/select/select.component';
import { IgxPickerToggleComponent, IgxPickerClearComponent } from '../../../projects/igniteui-angular/src/lib/date-common/picker-icons.common';
import { IgxDatePickerComponent } from '../../../projects/igniteui-angular/src/lib/date-picker/date-picker.component';
import { IgxMaskDirective } from '../../../projects/igniteui-angular/src/lib/directives/mask/mask.directive';
import { IgxHintDirective } from '../../../projects/igniteui-angular/src/lib/directives/hint/hint.directive';
import { IgxSuffixDirective } from '../../../projects/igniteui-angular/src/lib/directives/suffix/suffix.directive';
import { NgIf, NgFor } from '@angular/common';
import { IgxInputDirective } from '../../../projects/igniteui-angular/src/lib/directives/input/input.directive';
import { IgxPrefixDirective } from '../../../projects/igniteui-angular/src/lib/directives/prefix/prefix.directive';
import { IgxIconComponent } from '../../../projects/igniteui-angular/src/lib/icon/icon.component';
import { IgxLabelDirective } from '../../../projects/igniteui-angular/src/lib/directives/label/label.directive';
import { IgxInputGroupComponent } from '../../../projects/igniteui-angular/src/lib/input-group/input-group.component';
import { IgxSwitchComponent } from '../../../projects/igniteui-angular/src/lib/switch/switch.component';
import { IgxButtonGroupComponent } from '../../../projects/igniteui-angular/src/lib/buttonGroup/buttonGroup.component';

interface Selection {
    selected: boolean;
    type?: IgxInputGroupType;
    label: string | DisplayDensity;
    togglable: boolean;
}

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'app-input-group-sample',
    styleUrls: ['input-group.sample.scss'],
    templateUrl: 'input-group.sample.html',
    providers: [{ provide: IGX_INPUT_GROUP_TYPE, useValue: 'box' }],
    standalone: true,
    imports: [FormsModule, IgxButtonGroupComponent, IgxSwitchComponent, IgxInputGroupComponent, IgxLabelDirective, IgxIconComponent, IgxPrefixDirective, IgxInputDirective, NgIf, IgxSuffixDirective, IgxHintDirective, IgxMaskDirective, IgxDatePickerComponent, IgxPickerToggleComponent, IgxPickerClearComponent, IgxSelectComponent, IgxSelectItemComponent, IgxCheckboxComponent, IgxCheckboxRequiredDirective, IgxButtonDirective, ReactiveFormsModule, NgFor]
})
export class InputGroupSampleComponent implements OnInit, AfterViewInit {
    public inputValue: any;
    public isRequired = true;
    public isDisabled = false;
    public alignment: ButtonGroupAlignment = ButtonGroupAlignment.vertical;
    public density: DisplayDensity = 'comfortable';
    public displayDensities: Selection[];
    public inputType: IgxInputGroupType = null;
    public inputTypes: Selection[];
    public items: string[] = ['Orange', 'Apple', 'Banana', 'Mango'];

    public myForm = this.fb.group({
      myTextField: [],
      myTextField2: ['', Validators.required],
      mySelectField: []
    });
    public date = new Date();

    constructor(
        @Inject(DisplayDensityToken)
        public displayDensityOptions: IDisplayDensityOptions,
        private fb: UntypedFormBuilder,
        @Inject(IGX_INPUT_GROUP_TYPE) public TOKEN: IgxInputGroupType
    ) {
        this.myForm.disable();
    }

    public ngOnInit(): void {
        this.displayDensities = [
            {
                label: 'comfortable',
                selected: this.density === 'comfortable',
                togglable: true,
            },
            {
                label: 'cosy',
                selected: this.density === 'cosy',
                togglable: true,
            },
            {
                label: 'compact',
                selected: this.density === 'compact',
                togglable: true,
            },
        ];

        this.inputTypes = [
            { selected: true, type: 'line', label: 'Line', togglable: true },
            {
                selected: this.inputType === 'border',
                type: 'border',
                label: 'Border',
                togglable: true,
            },
            {
                selected: this.inputType === 'box',
                type: 'box',
                label: 'Box',
                togglable: true,
            },
        ];
    }

    public ngAfterViewInit() {
        console.log(`The InputGroupToken set for all material themed components
            (that have no explicit type set on component OR sample lv) is: `,
        this.TOKEN);
    }

    public selectDensity(event: IButtonGroupEventArgs) {
        this.density = this.displayDensities[event.index].label as DisplayDensity;
    }

    public selectInputType(event: IButtonGroupEventArgs) {
        const currentType = this.inputTypes[event.index].type;
        this.inputType = currentType;
        console.log('New type set is = ', currentType);
    }

    public enableText() {
      this.myForm.get('myTextField').enable();
      this.myForm.get('myTextField2').enable();
    }

    public disableText() {
      this.myForm.get('myTextField').disable();
      this.myForm.get('myTextField2').disable();
    }

    public enableSelect() {
      this.myForm.get('mySelectField').enable();
    }

    public disableSelect() {
      this.myForm.get('mySelectField').disable();
    }

    public enableForm() {
      this.myForm.enable();
    }

    public disableForm() {
      this.myForm.disable();
    }
}
