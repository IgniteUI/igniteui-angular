import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IgxButtonDirective, IgxDialogActionsDirective, IgxDialogComponent, IgxDialogTitleDirective, IgxIconComponent, IgxInputDirective, IgxInputGroupComponent, IgxLabelDirective, IgxPrefixDirective, IgxRippleDirective, IgxSwitchComponent } from 'igniteui-angular';
import { defineComponents, IgcDialogComponent, IgcButtonComponent} from "igniteui-webcomponents";
import { Properties, PropertyChangeService, PropertyPanelConfig } from '../properties-panel/property-change.service';

defineComponents(IgcDialogComponent, IgcButtonComponent);

@Component({
    selector: 'app-dialog-showcase-sample',
    styleUrls: ['dialog-showcase.sample.scss'],
    templateUrl: 'dialog-showcase.sample.html',
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    standalone: true,
    imports: [IgxButtonDirective, IgxRippleDirective, IgxSwitchComponent, IgxDialogComponent, IgxInputGroupComponent, IgxPrefixDirective, IgxIconComponent, IgxInputDirective, IgxLabelDirective, IgxDialogTitleDirective, IgxDialogActionsDirective]
})
export class DialogShowcaseSampleComponent {
    public panelConfig : PropertyPanelConfig = {
        keepOpenOnEscape: {
            label: 'Keep Open on Escape',
            control: {
                type: 'boolean'
            }
        },
        closeOnOutsideClick: {
            label: 'Close on Outside Click',
            control: {
                type: 'boolean'
            }
        },
        title: {
            control: {
                type: 'text',
                defaultValue: 'Confirmation'
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

    protected onDialogOKSelected(args) {
        args.dialog.close();
    }

    protected closeDialog(evt) {
        console.log(evt);
    }
}
