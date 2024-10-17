import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { IgxSwitchComponent } from 'igniteui-angular';
import { defineComponents, IgcSwitchComponent} from "igniteui-webcomponents";
import { PropertyPanelConfig } from '../properties-panel/properties-panel.component';
import { PropertyChangeService } from '../properties-panel/property-change.service';

defineComponents(IgcSwitchComponent);

@Component({
    selector: 'app-switch-showcase-sample',
    styleUrls: ['switch-showcase.sample.scss'],
    templateUrl: 'switch-showcase.sample.html',
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    standalone: true,
    imports: [IgxSwitchComponent]
})
export class SwitchShowcaseSampleComponent implements OnInit {
    public panelConfig : PropertyPanelConfig = {
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

    constructor(private propertyChangeService : PropertyChangeService) {}

    public ngOnInit() {
        this.propertyChangeService.setPanelConfig(this.panelConfig);
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
