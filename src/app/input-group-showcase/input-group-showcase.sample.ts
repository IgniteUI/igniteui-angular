import { Component, Inject, OnInit, AfterViewInit, ViewChild, ElementRef, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { UntypedFormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgIf, NgFor } from '@angular/common';

import { defineComponents, IgcInputComponent, IgcIconComponent, registerIconFromText } from 'igniteui-webcomponents';
import { ButtonGroupAlignment, IButtonGroupEventArgs, IGX_BUTTON_GROUP_DIRECTIVES, IGX_DATE_PICKER_DIRECTIVES, IGX_INPUT_GROUP_DIRECTIVES, IGX_INPUT_GROUP_TYPE, IGX_SELECT_DIRECTIVES, IgxIconComponent, IgxInputGroupType, IgxMaskDirective, IgxSwitchComponent } from 'igniteui-angular';
import { SizeSelectorComponent } from '../size-selector/size-selector.component';

defineComponents(IgcInputComponent, IgcIconComponent);

const face = '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M9 11.75c-.69 0-1.25.56-1.25 1.25s.56 1.25 1.25 1.25 1.25-.56 1.25-1.25-.56-1.25-1.25-1.25zm6 0c-.69 0-1.25.56-1.25 1.25s.56 1.25 1.25 1.25 1.25-.56 1.25-1.25-.56-1.25-1.25-1.25zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8 0-.29.02-.58.05-.86 2.36-1.05 4.23-2.98 5.21-5.37C11.07 8.33 14.05 10 17.42 10c.78 0 1.53-.09 2.25-.26.21.71.33 1.47.33 2.26 0 4.41-3.59 8-8 8z"/></svg>'
registerIconFromText('face', face);

interface Selection {
    selected: boolean;
    type?: IgxInputGroupType;
    label: string;
    togglable: boolean;
}

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'app-input-group-showcase-sample',
    styleUrls: ['input-group-showcase.sample.scss'],
    templateUrl: 'input-group-showcase.sample.html',
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
export class InputGroupShowcaseSampleComponent implements OnInit, AfterViewInit {

    @ViewChild('igcInput')
    private igcInput: ElementRef;
    public inputValue: any;
    public isRequired = false;
    public isDisabled = false;
    public alignment: ButtonGroupAlignment = ButtonGroupAlignment.vertical;

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
