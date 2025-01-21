import { Component, CUSTOM_ELEMENTS_SCHEMA, DestroyRef } from '@angular/core';
import { IgxCircularProgressBarComponent } from 'igniteui-angular';
import {
    IgcCircularProgressComponent,
    defineComponents,
} from 'igniteui-webcomponents';
import {
    Properties,
    PropertyChangeService,
    PropertyPanelConfig,
} from '../properties-panel/property-change.service';

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
        hasAnimation: {
            label: 'Enable none indeterminate animation (angular)',
            control: {
                type: 'boolean',
                defaultValue: true
            }
        },
        indeterminate: {
            control: {
                type: 'boolean',
                defaultValue: false
            }
        },
        animationDuration: {
            label: 'Animation Duration',
            control: {
                type: 'number',
                defaultValue: 300
            }
        },
        max: {
            control: {
                type: 'number',
                defaultValue: 100
            }
        },
        value: {
            control: {
                type: 'number',
                defaultValue: 66
            }
        },
        text: {
            control: {
                type: 'text',
                defaultValue: null
            }
        },
        hideLabel: {
            label: 'Hide Label',
            control: {
                type: 'boolean',
                defaultValue: false
            }
        },
        variant: {
            label: 'Variant (WebComponents)',
            control: {
                type: 'select',
                options: ['primary', 'info', 'success', 'warning', 'danger'],
                defaultValue: 'primary'
            }
        },
        diameter: {
            control: {
                type: 'number',
                defaultValue: null
            }
        },
    }

    public properties: Properties;

    constructor(
        private propertyChangeService: PropertyChangeService,
        private destroyRef: DestroyRef
    ) {
        this.propertyChangeService.setPanelConfig(this.panelConfig);

        const { unsubscribe } =
            this.propertyChangeService.propertyChanges.subscribe(
                (properties) => {
                    this.properties = properties;
                }
            );

        this.destroyRef.onDestroy(() => unsubscribe);
    }
}
