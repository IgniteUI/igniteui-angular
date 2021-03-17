import { Component, Inject, OnInit, AfterViewInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import {
    IgxInputGroupType,
    ButtonGroupAlignment,
    DisplayDensityToken,
    IDisplayDensityOptions,
    IButtonGroupEventArgs,
    IGX_INPUT_GROUP_TYPE,
    DisplayDensity
} from 'igniteui-angular';

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
    providers: [{provide: IGX_INPUT_GROUP_TYPE, useValue: 'box' }]
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
        private fb: FormBuilder,
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
