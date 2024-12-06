import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IgxRadioComponent, IgxRadioGroupDirective, RadioGroupAlignment } from 'igniteui-angular';
import { defineComponents, IgcRadioComponent, IgcRadioGroupComponent} from "igniteui-webcomponents";
import { Properties, PropertyChangeService, PropertyPanelConfig } from '../properties-panel/property-change.service';

defineComponents(IgcRadioComponent, IgcRadioGroupComponent);

@Component({
    selector: 'app-radio-showcase-sample',
    styleUrls: ['radio-showcase.sample.scss'],
    templateUrl: 'radio-showcase.sample.html',
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    standalone: true,
    imports: [IgxRadioComponent, IgxRadioGroupDirective, CommonModule]
})
export class RadioShowcaseSampleComponent {
    public panelConfig : PropertyPanelConfig = {
        alignment: {
            control: {
                type: 'button-group',
                options: ['vertical', 'horizontal']
            }
        },
        labelPosition: {
            label: 'Label Position',
            control: {
                type: 'button-group',
                options: ['before', 'after'],
                defaultValue: 'after'
            }
        },
        checked: {
            control: {
                type: 'boolean',
                defaultValue: false
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
        invalid: {
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

    private alignmentMap = {
        vertical: RadioGroupAlignment.vertical,
        horizontal: RadioGroupAlignment.horizontal,
    };

    public get alignment(): RadioGroupAlignment {
        const alignment = this.propertyChangeService.getProperty('alignment');
        return this.alignmentMap[alignment] || RadioGroupAlignment.vertical;
    }
}
