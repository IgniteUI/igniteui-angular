import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IgxBadgeComponent } from 'igniteui-angular';
import { defineComponents, IgcBadgeComponent } from "igniteui-webcomponents";
import { Properties, PropertyChangeService, PropertyPanelConfig } from '../properties-panel/property-change.service';

defineComponents(IgcBadgeComponent);

@Component({
    selector: 'app-badge-showcase-sample',
    styleUrls: ['badge-showcase.sample.scss'],
    templateUrl: 'badge-showcase.sample.html',
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    standalone: true,
    imports: [IgxBadgeComponent]
})

export class BadgeShowcaseSampleComponent {
    public panelConfig: PropertyPanelConfig = {
        shape: {
            control: {
                type: 'button-group',
                options: ['rounded', 'square'],
                defaultValue: 'rounded'
            }
        },
        variant: {
            control: {
                type: 'select',
                options: ['default', 'info', 'success', 'warning', 'error'],
                defaultValue: 'default'
            }
        },
        outlined: {
            control: {
                type: 'boolean',
                defaultValue: false
            }
        }
    };

    public properties: Properties;

    constructor(private propertyChangeService: PropertyChangeService) {
        this.propertyChangeService.setPanelConfig(this.panelConfig);

        this.propertyChangeService.propertyChanges.subscribe(properties => {
            this.properties = properties;
        });
    }

    private variantMap = {
        default: 'primary',
        info: 'info',
        success: 'success',
        warning: 'warning',
        error: 'danger',
    };

    public get wcVariant() {
        const variant = this.propertyChangeService.getProperty('variant');
        return this.variantMap[variant] || 'primary';
    }
}

