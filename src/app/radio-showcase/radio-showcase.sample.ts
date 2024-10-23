import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IgxRadioComponent, IgxRadioGroupDirective, RadioGroupAlignment } from 'igniteui-angular';
import { defineComponents, IgcRadioComponent, IgcRadioGroupComponent} from "igniteui-webcomponents";
import { PropertyChangeService, PropertyPanelConfig } from '../properties-panel/property-change.service';

defineComponents(IgcRadioComponent, IgcRadioGroupComponent);

@Component({
    selector: 'app-radio-showcase-sample',
    styleUrls: ['radio-showcase.sample.scss'],
    templateUrl: 'radio-showcase.sample.html',
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    standalone: true,
    imports: [IgxRadioComponent, IgxRadioGroupDirective, CommonModule]
})
export class RadioShowcaseSampleComponent implements OnInit {
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

    constructor(private propertyChangeService : PropertyChangeService) {}

    public ngOnInit() {
        this.propertyChangeService.setPanelConfig(this.panelConfig);
    }

    private alignmentMap = {
        vertical: RadioGroupAlignment.vertical,
        horizontal: RadioGroupAlignment.horizontal,
    };

    public get alignment(): RadioGroupAlignment {
        const alignment = this.propertyChangeService.getProperty('alignment');
        return this.alignmentMap[alignment] || RadioGroupAlignment.vertical;
    }

    protected get required() {
        return this.propertyChangeService.getProperty('required');
    }

    protected get disabled() {
        return this.propertyChangeService.getProperty('disabled');
    }

    protected get invalid() {
        return this.propertyChangeService.getProperty('invalid');
    }

    protected get checked() {
        return this.propertyChangeService.getProperty('checked');
    }

    protected get labelPosition() {
        return this.propertyChangeService.getProperty('labelPosition');
    }
}
