import { Component, CUSTOM_ELEMENTS_SCHEMA, DestroyRef } from '@angular/core';
import {
    IgxButtonDirective,
    IgxOverlayOutletDirective,
    IgxRippleDirective,
    IgxToastComponent,
} from 'igniteui-angular';
import { defineComponents, IgcToastComponent } from 'igniteui-webcomponents';
import {
    Properties,
    PropertyChangeService,
    PropertyPanelConfig,
} from '../properties-panel/property-change.service';

defineComponents(IgcToastComponent);

@Component({
    selector: 'app-toast-showcase-sample',
    styleUrls: ['toast-showcase.sample.scss'],
    templateUrl: 'toast-showcase.sample.html',
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [
        IgxButtonDirective,
        IgxRippleDirective,
        IgxOverlayOutletDirective,
        IgxToastComponent,
    ],
})
export class ToastShowcaseSampleComponent {
    public panelConfig: PropertyPanelConfig = {
        displayTime: {
            label: 'Display Time',
            control: {
                type: 'number',
                defaultValue: 4000
            }
        },
        keepOpen: {
            label: 'Keep Open',
            control: {
                type: 'boolean',
            }
        }
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
