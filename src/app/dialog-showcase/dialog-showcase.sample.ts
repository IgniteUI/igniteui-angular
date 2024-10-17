import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { IgxButtonDirective, IgxDialogActionsDirective, IgxDialogComponent, IgxDialogTitleDirective, IgxIconComponent, IgxInputDirective, IgxInputGroupComponent, IgxLabelDirective, IgxPrefixDirective, IgxRippleDirective, IgxSwitchComponent } from 'igniteui-angular';
import { defineComponents, IgcDialogComponent, IgcButtonComponent} from "igniteui-webcomponents";
import { PropertyPanelConfig } from '../properties-panel/properties-panel.component';
import { PropertyChangeService } from '../properties-panel/property-change.service';

defineComponents(IgcDialogComponent, IgcButtonComponent);

@Component({
    selector: 'app-dialog-showcase-sample',
    styleUrls: ['dialog-showcase.sample.scss'],
    templateUrl: 'dialog-showcase.sample.html',
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    standalone: true,
    imports: [IgxButtonDirective, IgxRippleDirective, IgxSwitchComponent, IgxDialogComponent, IgxInputGroupComponent, IgxPrefixDirective, IgxIconComponent, IgxInputDirective, IgxLabelDirective, IgxDialogTitleDirective, IgxDialogActionsDirective]
})
export class DialogShowcaseSampleComponent implements OnInit {
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

    constructor(private propertyChangeService: PropertyChangeService){}

    public ngOnInit() {
        this.propertyChangeService.setPanelConfig(this.panelConfig);
    }

    protected get keepOpenOnEscape() {
        return this.propertyChangeService.getProperty('keepOpenOnEscape');
    }

    protected get closeOnOutsideClick() {
        return this.propertyChangeService.getProperty('closeOnOutsideClick');
    }

    protected get title() {
        return this.propertyChangeService.getProperty('title');
    }

    protected onDialogOKSelected(args) {
        args.dialog.close();
    }

    protected closeDialog(evt) {
        console.log(evt);
    }
}
