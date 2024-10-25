import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, OnInit } from '@angular/core';
import { IgxBadgeComponent } from 'igniteui-angular';
import { defineComponents, IgcBadgeComponent } from "igniteui-webcomponents";
import { PropertyChangeService, PropertyPanelConfig } from '../properties-panel/property-change.service';

defineComponents(IgcBadgeComponent);

@Component({
    selector: 'app-badge-showcase-sample',
    styleUrls: ['badge-showcase.sample.scss'],
    templateUrl: 'badge-showcase.sample.html',
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    standalone: true,
    imports: [IgxBadgeComponent]
})

export class BadgeShowcaseSampleComponent implements OnInit {
    private propertyChangeService = inject(PropertyChangeService);
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
                options: ['default', 'info', 'success', 'warning', 'error']
            }
        },
        outlined: {
            control: {
                type: 'boolean',
            }
        }
    };

    public ngOnInit() {
        this.propertyChangeService.setPanelConfig(this.panelConfig);
    }
    private variantMap = {
        default: 'primary',
        info: 'info',
        success: 'success',
        warning: 'warning',
        error: 'danger',
    };

    public get angularVariant() {
        return this.propertyChangeService.getProperty('variant');
    }

    public get wcVariant() {
        const variant = this.propertyChangeService.getProperty('variant');
        return this.variantMap[variant] || 'primary';
    }

    public get shape() {
        return this.propertyChangeService.getProperty('shape');
    }

    public get outlined() {
        return this.propertyChangeService.getProperty('outlined');
    }
}

