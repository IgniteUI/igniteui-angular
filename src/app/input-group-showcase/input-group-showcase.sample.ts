import {Component, CUSTOM_ELEMENTS_SCHEMA, signal, ViewChild} from '@angular/core';
import {FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import { NgIf, NgFor } from '@angular/common';
import { defineComponents, IgcInputComponent, IgcIconComponent, registerIconFromText } from 'igniteui-webcomponents';
import {
    IGX_INPUT_GROUP_DIRECTIVES,
    IGX_INPUT_GROUP_TYPE,
    IgxIconComponent,
    IgxMaskDirective,
    IgxInputGroupType,
    IgxSelectComponent, IgxSelectItemComponent, IgxInputGroupComponent
} from 'igniteui-angular';
import { PropertyPanelConfig, PropertyChangeService, Properties } from '../properties-panel/property-change.service';
import {nothing} from "lit-html";

defineComponents(IgcInputComponent, IgcIconComponent);

const face = '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M9 11.75c-.69 0-1.25.56-1.25 1.25s.56 1.25 1.25 1.25 1.25-.56 1.25-1.25-.56-1.25-1.25-1.25zm6 0c-.69 0-1.25.56-1.25 1.25s.56 1.25 1.25 1.25 1.25-.56 1.25-1.25-.56-1.25-1.25-1.25zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8 0-.29.02-.58.05-.86 2.36-1.05 4.23-2.98 5.21-5.37C11.07 8.33 14.05 10 17.42 10c.78 0 1.53-.09 2.25-.26.21.71.33 1.47.33 2.26 0 4.41-3.59 8-8 8z"/></svg>'
registerIconFromText('face', face);

@Component({

    selector: 'app-input-group-showcase-sample',
    styleUrls: ['input-group-showcase.sample.scss'],
    templateUrl: 'input-group-showcase.sample.html',
    providers: [{ provide: IGX_INPUT_GROUP_TYPE, useValue: 'box' }],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        IGX_INPUT_GROUP_DIRECTIVES,
        IgxIconComponent,
        IgxSelectComponent,
        IgxSelectItemComponent,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class InputGroupShowcaseSampleComponent {
    @ViewChild('field', { read: IgxInputGroupComponent, static: true })
    public field: IgxInputGroupComponent;

    @ViewChild('fieldTextarea', { read: IgxInputGroupComponent, static: true })
    public fieldTextarea: IgxInputGroupComponent;

    @ViewChild('fieldFile', { read: IgxInputGroupComponent, static: true })
    public fieldFile: IgxInputGroupComponent;

    @ViewChild('selectReactive', { read: IgxSelectComponent, static: true })
    public select: IgxSelectComponent;

    public reactiveForm: UntypedFormGroup;

    public required = signal(false);

    public panelConfig: PropertyPanelConfig = {
        size: {
            control: {
                type: 'button-group',
                options: ['small', 'medium', 'large'],
                defaultValue: 'medium'
            }
        },
        inputType: {
            label: 'Input Group Type (Material theme only)',
            control: {
                type: 'button-group',
                options: ['box', 'border', 'line', 'search'],
            }
        },
        type: {
            label: 'Native Inout Type ',
            control: {
                type: 'select',
                options: ['email', 'number', 'password', 'search', 'tel', 'text', 'url']
            }
        },
        label: {
            control: {
                type: 'text',
                defaultValue: 'Web address',
            }
        },
        value: {
            control: {
                type: 'text',
            }
        },
        placeholder: {
            control: {
                type: 'text',
            }
        },
        required: {
            label: 'Required',
            control: {
                type: 'boolean',
                defaultValue: false
            }
        },
        disabled: {
            control: {
                type: 'boolean',
                defaultValue: false
            }
        },
        readonly: {
            control: {
                type: 'boolean',
                defaultValue: false
            }
        },
        hidePrefix: {
            label: 'Toggle Prefix',
            control: {
                type: 'boolean',
                defaultValue: false
            }
        },
        hideSuffix: {
            label: 'Toggle Suffix',
            control: {
                type: 'boolean',
                defaultValue: false
            }
        }
    }

    public properties: Properties;

    constructor(fb: UntypedFormBuilder, private propertyChangeService: PropertyChangeService) {
        this.propertyChangeService.setPanelConfig(this.panelConfig);

        this.propertyChangeService.propertyChanges.subscribe(properties => {
            this.properties = properties;
        });

        // Initialize the form without validators
        this.reactiveForm = fb.group({
            angularSelect: [''],
            field: [''],
            fieldTextarea: [''],
            fieldFile: ['']
        });

        // Subscribe to property changes
        this.propertyChangeService.propertyChanges.subscribe(properties => {

            // Sync properties.value to the form
            this.reactiveForm.patchValue({
                angularSelect: properties.value,
                field: properties.value,
                fieldTextarea: properties.value,
                fieldFile: properties.value
            });

            this.properties = properties;
            this.updateValidators();
        });
    }

    private updateValidators() {
        // Get form controls
        const angularSelectControl = this.reactiveForm.get('angularSelect');
        const fieldControl = this.reactiveForm.get('field');
        const fieldTextareaControl = this.reactiveForm.get('fieldTextarea');
        const fieldFileControl = this.reactiveForm.get('fieldFile');

        // Check if properties.required is true and update validators
        const controls = [angularSelectControl, fieldControl, fieldTextareaControl, fieldFileControl];
        controls.forEach(control => {
            if (this.properties.required) {
                control.setValidators(Validators.required);
            } else {
                control.clearValidators();
            }
            control.updateValueAndValidity(); // Trigger validation update
        });
    }

    public inputType: IgxInputGroupType = 'box';

    protected get inputTypeWC() {
        const inputTypeValue = this.propertyChangeService.getProperty('inputType');
        return inputTypeValue === 'border';
    }

    protected get inputTypeAngular() {
        const inputTypeValue = this.propertyChangeService.getProperty('inputType');

        if (inputTypeValue === 'border') {
            this.inputType = 'border';
        } else if (inputTypeValue === 'box') {
            this.inputType = 'box';
        } else if (inputTypeValue === 'search') {
            this.inputType = 'search';
        } else if (inputTypeValue === 'line') {
            this.inputType = 'line';
        }

        return this.inputType;
    }

    public onSubmitReactive() { }

    protected readonly nothing = nothing;
}
