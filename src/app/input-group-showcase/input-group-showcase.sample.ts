import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgIf, NgFor } from '@angular/common';
import { defineComponents, IgcInputComponent, IgcIconComponent, registerIconFromText } from 'igniteui-webcomponents';
import { IGX_INPUT_GROUP_DIRECTIVES, IGX_INPUT_GROUP_TYPE, IgxIconComponent, IgxMaskDirective, IgxInputGroupType } from 'igniteui-angular';
import { PropertyPanelConfig, PropertyChangeService, Properties } from '../properties-panel/property-change.service';

defineComponents(IgcInputComponent, IgcIconComponent);

const face = '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M9 11.75c-.69 0-1.25.56-1.25 1.25s.56 1.25 1.25 1.25 1.25-.56 1.25-1.25-.56-1.25-1.25-1.25zm6 0c-.69 0-1.25.56-1.25 1.25s.56 1.25 1.25 1.25 1.25-.56 1.25-1.25-.56-1.25-1.25-1.25zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8 0-.29.02-.58.05-.86 2.36-1.05 4.23-2.98 5.21-5.37C11.07 8.33 14.05 10 17.42 10c.78 0 1.53-.09 2.25-.26.21.71.33 1.47.33 2.26 0 4.41-3.59 8-8 8z"/></svg>'
registerIconFromText('face', face);

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
        IgxMaskDirective,
        IgxIconComponent,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class InputGroupShowcaseSampleComponent {
    public panelConfig: PropertyPanelConfig = {
        size: {
            control: {
                type: 'button-group',
                options: ['small', 'medium', 'large'],
                defaultValue: 'medium'
            }
        },
        type: {
            control: {
                type: 'select',
                options: ['email', 'number', 'password', 'search', 'tel', 'text', 'url']
            }
        },
        inputType: {
            label: 'Choose Input Type (Material only)',
            control: {
                type: 'button-group',
                options: ['box', 'border'],
                defaultValue: 'box'
            }
        },
        required: {
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
    }

    public properties: Properties;

    constructor(private propertyChangeService: PropertyChangeService) {
        this.propertyChangeService.setPanelConfig(this.panelConfig);

        this.propertyChangeService.propertyChanges.subscribe(properties => {
            this.properties = properties;
        });
    }

    public inputType: IgxInputGroupType = 'box';

    protected get inputTypeWC() {
        const inputTypeValue = this.propertyChangeService.getProperty('inputType');
        return inputTypeValue === 'border' ? true : false;
    }

    protected get inputTypeAngular() {
        const inputTypeValue = this.propertyChangeService.getProperty('inputType');

        if (inputTypeValue === 'border') {
            this.inputType = 'border';
        } else if (inputTypeValue === 'box') {
            this.inputType = 'box';
        }

        return this.inputType;
    }
}
