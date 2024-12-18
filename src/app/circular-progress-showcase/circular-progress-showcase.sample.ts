import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IgxCircularProgressBarComponent } from 'igniteui-angular';
import { IgcCircularProgressComponent, defineComponents } from 'igniteui-webcomponents';
import { Properties, PropertyChangeService, PropertyPanelConfig } from '../properties-panel/property-change.service';

defineComponents(IgcCircularProgressComponent);

@Component({
    selector: 'app-circular-progress-showcase-sample',
    styleUrls: ['circular-progress-showcase.sample.scss'],
    templateUrl: 'circular-progress-showcase.sample.html',
    standalone: true,
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [IgxCircularProgressBarComponent]
})

export class CircularProgressSampleComponent {
    public panelConfig: PropertyPanelConfig = {
        indeterminate: {
            control: {
                type: 'boolean',
                defaultValue: false
            }
        },
        hideLabel: {
            label: 'Hide Label',
            control: {
                type: 'boolean',
                defaultValue: false
            }
        },
        value: {
            control: {
                type: 'number',
                defaultValue: 66
            }
        },
        animationDuration: {
            label: 'Animation Duration',
            control: {
                type: 'number',
                defaultValue: 300
            }
        },
        variant: {
            label: 'Variant (WebComponents)',
            control: {
                type: 'select',
                options: ['primary', 'info', 'success', 'warning', 'danger'],
                defaultValue: 'primary'
            }
        }
    }

    public properties: Properties;

    constructor(private propertyChangeService: PropertyChangeService) {
        this.propertyChangeService.setPanelConfig(this.panelConfig);

        this.propertyChangeService.propertyChanges.subscribe(properties => {
            this.properties = properties;
        });
    }
}
