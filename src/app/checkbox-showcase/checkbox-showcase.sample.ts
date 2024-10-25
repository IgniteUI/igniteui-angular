import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, OnInit } from '@angular/core';
import { IgxCheckboxComponent } from 'igniteui-angular';
import { defineComponents, IgcCheckboxComponent} from "igniteui-webcomponents";
import { PropertyChangeService, PropertyPanelConfig } from '../properties-panel/property-change.service';

defineComponents(IgcCheckboxComponent);

@Component({
    selector: 'app-checkbox-showcase-sample',
    styleUrls: ['checkbox-showcase.sample.scss'],
    templateUrl: 'checkbox-showcase.sample.html',
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    standalone: true,
    imports: [IgxCheckboxComponent]
})
export class CheckboxShowcaseSampleComponent implements OnInit {
    private propertyChangeService = inject(PropertyChangeService);
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

    public ngOnInit() {
        this.propertyChangeService.setPanelConfig(this.panelConfig);
    }

    protected get indeterminate() {
        return this.propertyChangeService.getProperty('indeterminate');
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

    protected get name() {
        return this.propertyChangeService.getProperty('name');
    }

    protected get value() {
        return this.propertyChangeService.getProperty('value');
    }

}
