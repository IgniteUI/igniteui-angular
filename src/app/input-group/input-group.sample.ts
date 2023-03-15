import { Component, Inject, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { UntypedFormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IgxButtonDirective } from '../../../projects/igniteui-angular/src/lib/directives/button/button.directive';
import { IgxCheckboxComponent } from '../../../projects/igniteui-angular/src/lib/checkbox/checkbox.component';
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
import { ButtonGroupAlignment, IButtonGroupEventArgs, IgxButtonGroupComponent } from '../../../projects/igniteui-angular/src/lib/buttonGroup/buttonGroup.component';

import { defineComponents, IgcInputComponent, IgcIconComponent } from 'igniteui-webcomponents';
import { IgxInputGroupType, IGX_INPUT_GROUP_TYPE } from '../../../projects/igniteui-angular/src/lib/input-group/public_api';
import { DisplayDensity, DisplayDensityToken, IDisplayDensityOptions } from '../../../projects/igniteui-angular/src/lib/core/displayDensity';

defineComponents(IgcInputComponent, IgcIconComponent);

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
    imports: [FormsModule, IgxButtonGroupComponent, IgxSwitchComponent, IgxInputGroupComponent, IgxLabelDirective, IgxIconComponent, IgxPrefixDirective, IgxInputDirective, NgIf, IgxSuffixDirective, IgxHintDirective, IgxMaskDirective, IgxDatePickerComponent, IgxPickerToggleComponent, IgxPickerClearComponent, IgxSelectComponent, IgxSelectItemComponent, IgxCheckboxComponent, IgxButtonDirective, ReactiveFormsModule, NgFor]
})
export class InputGroupSampleComponent implements OnInit, AfterViewInit {

    @ViewChild('igcInput')
    private igcInput: ElementRef;
    public inputValue: any;
    public isRequired = false;
    public isDisabled = false;
    public alignment: ButtonGroupAlignment = ButtonGroupAlignment.vertical;
    public density: DisplayDensity = 'cosy';

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

    public getSize() {
        if(this.density === 'comfortable') {
            return 'large'
        }

        if(this.density === 'cosy') {
            return 'medium'
        }

        if(this.density === 'compact') {
            return 'small'
        }
    }

    public isOutlined() {
        return this.inputType === 'border'
    }

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
            {
                selected: this.inputType === 'line',
                type: 'line',
                label: 'Line',
                togglable: true
            },
            {
                selected: true,
                type: 'box',
                label: 'Box',
                togglable: true,
            },
            {
                selected: this.inputType === 'border',
                type: 'border',
                label: 'Border',
                togglable: true,
            },
            {
                selected: this.inputType === 'search',
                type: 'search',
                label: 'Search',
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
        this.igcInput.nativeElement.removeAttribute('outlined');
        if(currentType === 'border') {
            this.igcInput.nativeElement.setAttribute('outlined', 'true');
        }
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
