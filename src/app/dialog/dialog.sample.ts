import { Component, CUSTOM_ELEMENTS_SCHEMA, DestroyRef } from '@angular/core';
import {
    IgxButtonDirective,
    IGX_DIALOG_DIRECTIVES,
    IgxIconComponent,
    IgxInputDirective,
    IgxInputGroupComponent,
    IgxLabelDirective,
    IgxPrefixDirective,
    IgxRippleDirective,
} from 'igniteui-angular';
import {
    defineComponents,
    IgcDialogComponent,
    IgcInputComponent,
    IgcButtonComponent,
    IgcIconComponent,
    registerIconFromText,
} from 'igniteui-webcomponents';
import {
    Properties,
    PropertyChangeService,
    PropertyPanelConfig,
} from '../properties-panel/property-change.service';

defineComponents(
    IgcDialogComponent,
    IgcInputComponent,
    IgcButtonComponent,
    IgcIconComponent
);

const icons = [
    {
        name: 'person',
        url: '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#e8eaed"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>'
    },
    {
        name: 'lock',
        url: '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#e8eaed"><path d="M0 0h24v24H0z" fill="none"/><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>'
    },
];

icons.forEach((icon) => {
    registerIconFromText(icon.name, icon.url);
});
@Component({
    selector: 'app-dialog-sample',
    styleUrls: ['dialog.sample.scss'],
    templateUrl: 'dialog.sample.html',
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    standalone: true,
    imports: [
        IGX_DIALOG_DIRECTIVES,
        IgxButtonDirective,
        IgxRippleDirective,
        IgxInputGroupComponent,
        IgxPrefixDirective,
        IgxIconComponent,
        IgxInputDirective,
        IgxLabelDirective,
    ],
})
export class DialogSampleComponent {
    public panelConfig: PropertyPanelConfig = {
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

    protected onDialogOKSelected(args) {
        args.dialog.close();
    }

    protected closeDialog(evt) {
        console.log(evt);
    }
}
