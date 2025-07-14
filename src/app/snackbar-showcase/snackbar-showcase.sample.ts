import { Component, CUSTOM_ELEMENTS_SCHEMA, DestroyRef, inject } from '@angular/core';
import {
    IgxButtonDirective,
    IgxOverlayOutletDirective,
    IgxSnackbarComponent,
} from 'igniteui-angular';
import { defineComponents, IgcSnackbarComponent } from 'igniteui-webcomponents';
import {
    Properties,
    PropertyChangeService,
    PropertyPanelConfig,
} from '../properties-panel/property-change.service';

defineComponents(IgcSnackbarComponent);

@Component({
    selector: 'app-snackbar-showcase-sample',
    styleUrls: ['snackbar-showcase.sample.css'],
    templateUrl: 'snackbar-showcase.sample.html',
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    standalone: true,
    imports: [
        IgxSnackbarComponent,
        IgxOverlayOutletDirective,
        IgxButtonDirective,
    ],
})
export class SnackbarShowcaseSampleComponent {
    private propertyChangeService = inject(PropertyChangeService);
    private destroyRef = inject(DestroyRef);

    public panelConfig: PropertyPanelConfig = {
        actionText: {
            label: 'Action Text',
            control: {
                type: 'text',
                defaultValue: 'Undo'
            }
        },
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

    constructor() {
        this.propertyChangeService.setPanelConfig(this.panelConfig);

        const propertyChange =
            this.propertyChangeService.propertyChanges.subscribe(
                (properties) => {
                    this.properties = properties;
                }
            );

        this.destroyRef.onDestroy(() => propertyChange.unsubscribe());
    }
}
