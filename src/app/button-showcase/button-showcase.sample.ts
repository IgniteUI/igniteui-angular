import { Component, CUSTOM_ELEMENTS_SCHEMA, ViewEncapsulation, inject } from '@angular/core';
import { IgxButtonDirective, IgxButtonGroupComponent, IgxIconButtonDirective, IgxIconComponent, IgxRippleDirective } from 'igniteui-angular';
import { defineComponents, IgcButtonComponent, IgcIconButtonComponent, registerIconFromText} from "igniteui-webcomponents";
import { PropertyChangeService, PropertyPanelConfig } from '../properties-panel/property-change.service';

defineComponents(IgcButtonComponent, IgcIconButtonComponent);

const favorite = '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>'
registerIconFromText("favorite", favorite );

@Component({
    selector: 'app-button-showcase-sample',
    styleUrls: ['button-showcase.sample.scss'],
    templateUrl: 'button-showcase.sample.html',
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [IgxButtonDirective, IgxIconComponent, IgxButtonGroupComponent, IgxIconButtonDirective, IgxRippleDirective]
})
export class ButtonShowcaseSampleComponent {
    private propertyChangeService = inject(PropertyChangeService);
    public panelConfig: PropertyPanelConfig = {
        size: {
            control: {
                type: "button-group",
                options: ['small', 'medium', 'large'],
            }
        },
        variant: {
            control: {
                type: "button-group",
                options: ['flat', 'contained', 'outlined', 'fab'],
                defaultValue: 'flat'
            }
        },
        disabled: {
            control: {
                type: "boolean",
                defaultValue: false
            }
        }
    }

    constructor() {
        this.propertyChangeService.setPanelConfig(this.panelConfig);
    }

    protected get size() {
        return this.propertyChangeService.getProperty('size');
    }

    protected get variant() {
        return this.propertyChangeService.getProperty('variant');
    }

    protected get disabled() {
        return this.propertyChangeService.getProperty('disabled');
    }
}
