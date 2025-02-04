import { Component, CUSTOM_ELEMENTS_SCHEMA, DestroyRef } from '@angular/core';
import {
    IgxBadgeComponent,
    IgxAvatarComponent,
    IgxIconComponent,
} from 'igniteui-angular';
import {
    defineComponents,
    IgcBadgeComponent,
    IgcAvatarComponent,
    IgcIconComponent,
    registerIconFromText,
} from 'igniteui-webcomponents';
import {
    Properties,
    PropertyChangeService,
    PropertyPanelConfig,
} from '../properties-panel/property-change.service';

defineComponents(IgcBadgeComponent, IgcAvatarComponent, IgcIconComponent);

const face =
    '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#e8eaed"><path d="M0 0h24v24H0z" fill="none"/><path d="M9 11.75c-.69 0-1.25.56-1.25 1.25s.56 1.25 1.25 1.25 1.25-.56 1.25-1.25-.56-1.25-1.25-1.25zm6 0c-.69 0-1.25.56-1.25 1.25s.56 1.25 1.25 1.25 1.25-.56 1.25-1.25-.56-1.25-1.25-1.25zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8 0-.29.02-.58.05-.86 2.36-1.05 4.23-2.98 5.21-5.37C11.07 8.33 14.05 10 17.42 10c.78 0 1.53-.09 2.25-.26.21.71.33 1.47.33 2.26 0 4.41-3.59 8-8 8z"/></svg>';
const bluetooth =
    '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#e8eaed"><path d="M0 0h24v24H0z" fill="none"/><path d="M17.71 7.71L12 2h-1v7.59L6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 11 14.41V22h1l5.71-5.71-4.3-4.29 4.3-4.29zM13 5.83l1.88 1.88L13 9.59V5.83zm1.88 10.46L13 18.17v-3.76l1.88 1.88z"/></svg>';

registerIconFromText('face', face);
registerIconFromText('bluetooth', bluetooth);

@Component({
    selector: 'app-badge-sample',
    styleUrls: ['badge.sample.scss'],
    templateUrl: 'badge.sample.html',
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [IgxBadgeComponent, IgxAvatarComponent, IgxIconComponent]
})

export class BadgeSampleComponent {
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

    private variantMap = new Map<string, string>(
        Object.entries({
            default: 'primary',
            info: 'info',
            success: 'success',
            warning: 'warning',
            error: 'danger',
        })
    );

    public get wcVariant() {
        const variant = this.propertyChangeService.getProperty('variant');
        return this.variantMap.get(variant) || 'primary';
    }
}
