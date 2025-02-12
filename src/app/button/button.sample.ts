import {
    Component,
    CUSTOM_ELEMENTS_SCHEMA,
    DestroyRef,
    OnInit,
    TemplateRef,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
    IgxButtonDirective,
    IgxIconComponent,
    IgxSwitchComponent,
    IgSizeDirective,
} from 'igniteui-angular';
import {
    defineComponents,
    IgcButtonComponent,
    IgcIconComponent,
    registerIconFromText,
} from 'igniteui-webcomponents';
import {
    Properties,
    PropertyChangeService,
    PropertyPanelConfig,
} from '../properties-panel/property-change.service';

defineComponents(IgcButtonComponent, IgcIconComponent);

const face =
    '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#e8eaed"><path d="M0 0h24v24H0z" fill="none"/><path d="M9 11.75c-.69 0-1.25.56-1.25 1.25s.56 1.25 1.25 1.25 1.25-.56 1.25-1.25-.56-1.25-1.25-1.25zm6 0c-.69 0-1.25.56-1.25 1.25s.56 1.25 1.25 1.25 1.25-.56 1.25-1.25-.56-1.25-1.25-1.25zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8 0-.29.02-.58.05-.86 2.36-1.05 4.23-2.98 5.21-5.37C11.07 8.33 14.05 10 17.42 10c.78 0 1.53-.09 2.25-.26.21.71.33 1.47.33 2.26 0 4.41-3.59 8-8 8z"/></svg>';
registerIconFromText('face', face);

@Component({
    selector: 'app-button-sample',
    styleUrls: ['button.sample.scss'],
    templateUrl: 'button.sample.html',
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    encapsulation: ViewEncapsulation.None,
    imports: [
        FormsModule,
        IgxSwitchComponent,
        IgxButtonDirective,
        IgxIconComponent,
        IgSizeDirective,
    ],
})
export class ButtonSampleComponent implements OnInit {
    @ViewChild('customControls', { static: true })
    public customControlsTemplate!: TemplateRef<any>;

    public hasPrefix = false;
    public hasSuffix = false;

    public panelConfig: PropertyPanelConfig = {
        size: {
            control: {
                type: 'button-group',
                options: ['small', 'medium', 'large'],
            }
        },
        variant: {
            control: {
                type: 'button-group',
                options: ['flat', 'contained', 'outlined', 'fab'],
                defaultValue: 'contained'
            }
        },
        disabled: {
            control: {
                type: 'boolean',
                defaultValue: false,
            }
        }
    };

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

    public ngOnInit(): void {
        this.propertyChangeService.setCustomControls(
            this.customControlsTemplate
        );
    }
}
