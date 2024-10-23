import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IgxLinearProgressBarComponent } from 'igniteui-angular';
import { IgcLinearProgressComponent, defineComponents } from 'igniteui-webcomponents';
import { PropertyChangeService, PropertyPanelConfig } from '../properties-panel/property-change.service';

defineComponents(IgcLinearProgressComponent);

@Component({
    selector: 'app-linear-progress-showcase-sample',
    styleUrls: ['linear-progress-showcase.sample.scss'],
    templateUrl: 'linear-progress-showcase.sample.html',
    standalone: true,
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [IgxLinearProgressBarComponent]
})

export class LinearProgressSampleComponent implements OnInit {
    public panelConfig: PropertyPanelConfig = {
        striped: {
            control: {
                type: 'boolean',
                defaultValue: false
            }
        },
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
            control: {
                type: 'select',
                options: ['primary', 'info', 'success', 'warning', 'danger'],
                defaultValue: 'primary'
            }
        }
    }

    protected get striped() {
        return this.propertyChangeService.getProperty('striped');
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

    protected get variantWC() {
        return this.propertyChangeService.getProperty('variant');
    }

    protected get variantAngular() {
        const variantValue = this.propertyChangeService.getProperty('variant');

        switch (variantValue) {
            case 'primary':
                return 'default';
            case 'danger':
                return 'error';
            default:
                return variantValue;
        }
    }

    constructor(private propertyChangeService: PropertyChangeService) { }

    public ngOnInit() {
        this.propertyChangeService.setPanelConfig(this.panelConfig);
    }
}
