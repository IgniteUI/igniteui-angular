import { Component, CUSTOM_ELEMENTS_SCHEMA, OnDestroy, OnInit } from '@angular/core';
import { IgxBadgeComponent } from 'igniteui-angular';
import { defineComponents, IgcBadgeComponent } from "igniteui-webcomponents";
import { PropertyPanelConfig } from '../properties-panel/properties-panel.component';
import { PropertyChangeService } from '../property-change.service';

defineComponents(IgcBadgeComponent);

@Component({
    selector: 'app-badge-showcase-sample',
    styleUrls: ['badge-showcase.sample.scss'],
    templateUrl: 'badge-showcase.sample.html',
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    standalone: true,
    imports: [IgxBadgeComponent]
})

export class BadgeShowcaseSampleComponent implements OnInit, OnDestroy {
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
        }
    };

    constructor(protected propertyChangeService: PropertyChangeService) { }

    public ngOnInit(): void {
        this.propertyChangeService.setPanelConfig(this.panelConfig);
    }

    public ngOnDestroy(): void {
        this.propertyChangeService.clearPanelConfig();
    }

    private variantMapping: { [key: string]: { angular: string; webComponent: string } } = {
        default: { angular: 'default', webComponent: 'primary' },
        error: { angular: 'error', webComponent: 'danger' },
        info: { angular: 'info', webComponent: 'info' },
        success: { angular: 'success', webComponent: 'success' },
        warning: { angular: 'warning', webComponent: 'warning' },
    };

    public get angularVariant(): string {
        const variant = this.propertyChangeService.getProperty('variant') || 'default';
        return this.variantMapping[variant]?.angular || 'default';
    }

    public get webComponentVariant(): string {
        const variant = this.propertyChangeService.getProperty('variant') || 'default';
        return this.variantMapping[variant]?.webComponent || 'primary';
    }

    public get shape(): string {
        return this.propertyChangeService.getProperty('shape');
    }
}

