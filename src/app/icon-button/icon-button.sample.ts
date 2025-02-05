import { Component, CUSTOM_ELEMENTS_SCHEMA, DestroyRef } from '@angular/core';
import {
    IgxIconButtonDirective,
    IgxIconComponent,
    IgSizeDirective,
} from 'igniteui-angular';
import {
    defineComponents,
    IgcIconButtonComponent,
    registerIconFromText,
} from 'igniteui-webcomponents';
import {
    Properties,
    PropertyChangeService,
    PropertyPanelConfig,
} from '../properties-panel/property-change.service';

defineComponents(IgcIconButtonComponent);

const favorite =
    '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>';
registerIconFromText('favorite', favorite);

@Component({
    selector: 'app-icon-button-sample',
    styleUrls: ['icon-button.sample.scss'],
    templateUrl: 'icon-button.sample.html',
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [IgxIconComponent, IgxIconButtonDirective, IgSizeDirective]
})
export class IconButtonSampleComponent {
    public panelConfig: PropertyPanelConfig = {
        size: {
            control: {
                type: 'button-group',
                options: ['small', 'medium', 'large'],
            }
        },
        variant: {
            control: {
                type: 'button-group',
                options: ['flat', 'contained', 'outlined'],
                defaultValue: 'flat'
            }
        },
        disabled: {
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
}
