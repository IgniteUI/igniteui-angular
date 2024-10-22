import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
// eslint-disable-next-line max-len
import { IgxButtonDirective, IgxOverlayOutletDirective, IgxSnackbarComponent } from 'igniteui-angular';
import { defineComponents, IgcSnackbarComponent } from 'igniteui-webcomponents';
import { PropertyChangeService, PropertyPanelConfig } from '../properties-panel/property-change.service';

defineComponents(IgcSnackbarComponent);

@Component({
    selector: 'app-snackbar-showcase-sample',
    styleUrls: ['snackbar-showcase.sample.css'],
    templateUrl: 'snackbar-showcase.sample.html',
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    standalone: true,
    imports: [IgxSnackbarComponent, IgxOverlayOutletDirective, IgxButtonDirective]
})
export class SnackbarShowcaseSampleComponent implements OnInit {
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

    constructor(private propertyChangeService: PropertyChangeService){}

    public ngOnInit() {
        this.propertyChangeService.setPanelConfig(this.panelConfig);
    }

    protected get actionText() {
        return this.propertyChangeService.getProperty('actionText');
    }

    protected get displayTime() {
        return this.propertyChangeService.getProperty('displayTime');
    }

    protected get keepOpen() {
        return this.propertyChangeService.getProperty('keepOpen');
    }
}
