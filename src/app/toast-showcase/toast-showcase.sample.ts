import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { IgxButtonDirective, IgxOverlayOutletDirective, IgxRippleDirective, IgxToastComponent } from 'igniteui-angular';
import { defineComponents, IgcToastComponent } from 'igniteui-webcomponents';
import { PropertyChangeService, PropertyPanelConfig } from '../properties-panel/property-change.service';

defineComponents(IgcToastComponent);

@Component({
    selector: 'app-toast-showcase-sample',
    styleUrls: ['toast-showcase.sample.scss'],
    templateUrl: 'toast-showcase.sample.html',
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    standalone: true,
    imports: [IgxButtonDirective, IgxRippleDirective, IgxOverlayOutletDirective, IgxToastComponent]
})
export class ToastShowcaseSampleComponent implements OnInit {
    public panelConfig : PropertyPanelConfig = {
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

    protected get displayTime() {
        return this.propertyChangeService.getProperty('displayTime');
    }

    protected get keepOpen() {
        return this.propertyChangeService.getProperty('keepOpen');
    }
}
