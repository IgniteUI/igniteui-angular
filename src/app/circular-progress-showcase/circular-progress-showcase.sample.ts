import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IgxCircularProgressBarComponent } from 'igniteui-angular';
import { IgcCircularProgressComponent, defineComponents } from 'igniteui-webcomponents';
import { PropertyChangeService, PropertyPanelConfig } from '../properties-panel/property-change.service';

defineComponents(IgcCircularProgressComponent);

@Component({
    selector: 'app-circular-progress-showcase-sample',
    styleUrls: ['circular-progress-showcase.sample.scss'],
    templateUrl: 'circular-progress-showcase.sample.html',
    standalone: true,
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [IgxCircularProgressBarComponent]
})

export class CircularProgressSampleComponent implements OnInit {
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

    protected get indeterminate() {
        return this.propertyChangeService.getProperty('indeterminate');
    }

    protected get hideLabel() {
        return this.propertyChangeService.getProperty('hideLabel');
    }

    protected get value() {
        const value = this.propertyChangeService.getProperty('value');
        return value !== undefined ? value : 66;
    }

    protected get animationDuration() {
        return this.propertyChangeService.getProperty('animationDuration');
    }

    protected get variant() {
        return this.propertyChangeService.getProperty('variant');
    }

    constructor(private propertyChangeService: PropertyChangeService) { }

    public ngOnInit() {
        this.propertyChangeService.setPanelConfig(this.panelConfig);
    }
}
