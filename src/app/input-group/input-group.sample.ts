import { Component, Inject, OnInit, AfterViewInit, ViewChild, ElementRef, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { UntypedFormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgIf, NgFor } from '@angular/common';

import { defineComponents, IgcInputComponent, IgcIconComponent } from 'igniteui-webcomponents';
import { ButtonGroupAlignment, IButtonGroupEventArgs, IGX_BUTTON_GROUP_DIRECTIVES, IGX_DATE_PICKER_DIRECTIVES, IGX_INPUT_GROUP_DIRECTIVES, IGX_INPUT_GROUP_TYPE, IGX_SELECT_DIRECTIVES, IgxIconComponent, IgxInputGroupType, IgxMaskDirective, IgxSwitchComponent } from 'igniteui-angular';
import { SizeSelectorComponent } from '../size-selector/size-selector.component';

defineComponents(IgcInputComponent, IgcIconComponent);

interface Selection {
    selected: boolean;
    type?: IgxInputGroupType;
    label: string;
    togglable: boolean;
}

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'app-input-group-sample',
    styleUrls: ['input-group.sample.scss'],
    templateUrl: 'input-group.sample.html',
    providers: [{ provide: IGX_INPUT_GROUP_TYPE, useValue: 'box' }],
    standalone: true,
    imports: [
        FormsModule,
        NgIf,
        ReactiveFormsModule,
        NgFor,
        IGX_INPUT_GROUP_DIRECTIVES,
        IGX_BUTTON_GROUP_DIRECTIVES,
        IGX_DATE_PICKER_DIRECTIVES,
        IGX_SELECT_DIRECTIVES,
        IgxMaskDirective,
        IgxIconComponent,
        IgxSwitchComponent,
        SizeSelectorComponent
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class InputGroupSampleComponent implements OnInit, AfterViewInit {

    @ViewChild('igcInput')
    private igcInput: ElementRef;
    public inputValue: any;
    public isRequired = false;
    public isDisabled = false;
    public alignment: ButtonGroupAlignment = ButtonGroupAlignment.vertical;

    public displayDensities: Selection[];
    public inputType: IgxInputGroupType = 'box';
    public inputTypes: Selection[];
    public items: string[] = ['Orange', 'Apple', 'Banana', 'Mango'];

    public myForm = this.fb.group({
        myTextField: [],
        myTextField2: ['', Validators.required],
        mySelectField: []
    });
    public date = new Date();

    public isOutlined() {
        return this.inputType === 'border'
    }

    constructor(
        private fb: UntypedFormBuilder,
        @Inject(IGX_INPUT_GROUP_TYPE) public TOKEN: IgxInputGroupType
    ) {
        this.myForm.disable();
    }

    public ngOnInit(): void {
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

    public selectInputType(event: IButtonGroupEventArgs) {
        const currentType = this.inputTypes[event.index].type;
        this.inputType = currentType;
        this.igcInput.nativeElement.removeAttribute('outlined');
        if (currentType === 'border') {
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
