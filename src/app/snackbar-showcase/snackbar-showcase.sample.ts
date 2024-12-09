import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
// eslint-disable-next-line max-len
import { IgxButtonDirective, IgxOverlayOutletDirective, IgxSnackbarComponent } from 'igniteui-angular';
import { defineComponents, IgcSnackbarComponent } from 'igniteui-webcomponents';
import { Properties, PropertyChangeService, PropertyPanelConfig } from '../properties-panel/property-change.service';

defineComponents(IgcSnackbarComponent);

@Component({
    selector: 'app-snackbar-showcase-sample',
    styleUrls: ['snackbar-showcase.sample.css'],
    templateUrl: 'snackbar-showcase.sample.html',
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    standalone: true,
    imports: [IgxSnackbarComponent, IgxOverlayOutletDirective, IgxButtonDirective]
})
export class SnackbarShowcaseSampleComponent {
    public panelConfig : PropertyPanelConfig = {
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

    constructor(private propertyChangeService: PropertyChangeService) {
        this.propertyChangeService.setPanelConfig(this.panelConfig);

        this.propertyChangeService.propertyChanges.subscribe(properties => {
            this.properties = properties;
        });
    }
}
