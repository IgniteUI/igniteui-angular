import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IgxCheckboxComponent } from 'igniteui-angular';
import { defineComponents, IgcCheckboxComponent} from "igniteui-webcomponents";
import { Properties, PropertyChangeService, PropertyPanelConfig } from '../properties-panel/property-change.service';

defineComponents(IgcCheckboxComponent);

@Component({
    selector: 'app-checkbox-showcase-sample',
    styleUrls: ['checkbox-showcase.sample.scss'],
    templateUrl: 'checkbox-showcase.sample.html',
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    standalone: true,
    imports: [IgxCheckboxComponent]
})
export class CheckboxShowcaseSampleComponent {
    public panelConfig : PropertyPanelConfig = {
        indeterminate: {
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
        checked: {
            control: {
                type: 'boolean',
                defaultValue: false
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
        name: {
            control: {
                type: 'text'
            }
        },
        value: {
            control: {
                type: 'text'
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
}
