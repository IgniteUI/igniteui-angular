import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IgxButtonDirective, IgxButtonGroupComponent, IgxIconButtonDirective, IgxIconComponent, IgxRippleDirective, IgxSwitchComponent } from 'igniteui-angular';
import { defineComponents, IgcButtonComponent, IgcIconComponent, registerIconFromText } from "igniteui-webcomponents";
import { Properties, PropertyChangeService, PropertyPanelConfig } from '../properties-panel/property-change.service';

defineComponents(IgcButtonComponent, IgcIconComponent);

const face = '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#e8eaed"><path d="M0 0h24v24H0z" fill="none"/><path d="M9 11.75c-.69 0-1.25.56-1.25 1.25s.56 1.25 1.25 1.25 1.25-.56 1.25-1.25-.56-1.25-1.25-1.25zm6 0c-.69 0-1.25.56-1.25 1.25s.56 1.25 1.25 1.25 1.25-.56 1.25-1.25-.56-1.25-1.25-1.25zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8 0-.29.02-.58.05-.86 2.36-1.05 4.23-2.98 5.21-5.37C11.07 8.33 14.05 10 17.42 10c.78 0 1.53-.09 2.25-.26.21.71.33 1.47.33 2.26 0 4.41-3.59 8-8 8z"/></svg>'
registerIconFromText("face", face );

@Component({
    selector: 'app-button-showcase-sample',
    styleUrls: ['button-showcase.sample.scss'],
    templateUrl: 'button-showcase.sample.html',
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [NgIf, FormsModule, IgxSwitchComponent, IgxButtonDirective, IgxIconComponent, IgxButtonGroupComponent, IgxIconButtonDirective, IgxRippleDirective]
})
export class ButtonShowcaseSampleComponent implements OnInit {
    @ViewChild('customControls', { static: true })
    public customControlsTemplate!: TemplateRef<any>;

    public hasPrefix = false;
    public hasSuffix = false;

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

    public properties: Properties;

    constructor(private propertyChangeService: PropertyChangeService) {
        this.propertyChangeService.setPanelConfig(this.panelConfig);

        this.propertyChangeService.propertyChanges.subscribe(properties => {
            this.properties = properties;
        });
    }

    public ngOnInit(): void {
        this.propertyChangeService.setCustomControls(this.customControlsTemplate);
    }
}
