import {
    Component,
    CUSTOM_ELEMENTS_SCHEMA,
    DestroyRef,
    OnInit,
    TemplateRef,
    ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
    IgxAvatarComponent,
    IgxChipComponent,
    IgxIconComponent,
    IgxPrefixDirective,
    IgxSuffixDirective,
    IgxSwitchComponent,
    IgxCircularProgressBarComponent,
    IgSizeDirective,
} from 'igniteui-angular';
import {
    defineComponents,
    IgcChipComponent,
    IgcAvatarComponent,
    IgcIconComponent,
    IgcCircularProgressComponent,
    registerIconFromText,
} from 'igniteui-webcomponents';
import {
    Properties,
    PropertyChangeService,
    PropertyPanelConfig,
} from '../properties-panel/property-change.service';

defineComponents(
    IgcChipComponent,
    IgcAvatarComponent,
    IgcIconComponent,
    IgcCircularProgressComponent
);

const icons = [
    {
        name: 'face',
        url: '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#e8eaed"><path d="M0 0h24v24H0z" fill="none"/><path d="M9 11.75c-.69 0-1.25.56-1.25 1.25s.56 1.25 1.25 1.25 1.25-.56 1.25-1.25-.56-1.25-1.25-1.25zm6 0c-.69 0-1.25.56-1.25 1.25s.56 1.25 1.25 1.25 1.25-.56 1.25-1.25-.56-1.25-1.25-1.25zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8 0-.29.02-.58.05-.86 2.36-1.05 4.23-2.98 5.21-5.37C11.07 8.33 14.05 10 17.42 10c.78 0 1.53-.09 2.25-.26.21.71.33 1.47.33 2.26 0 4.41-3.59 8-8 8z"/></svg>'
    },
    {
        name: 'check_circle',
        url: '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#e8eaed"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>'
    },
    {
        name: 'delete',
        url: '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#e8eaed"><path d="M0 0h24v24H0z" fill="none"/><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>'
    },
];

icons.forEach((icon) => {
    registerIconFromText(icon.name, icon.url);
});

@Component({
    selector: 'app-chips-sample',
    styleUrls: ['chips.sample.scss', '../app.component.scss'],
    templateUrl: 'chips.sample.html',
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [
        IgxChipComponent,
        IgxCircularProgressBarComponent,
        IgxIconComponent,
        IgxPrefixDirective,
        IgxSuffixDirective,
        IgxSwitchComponent,
        FormsModule,
        IgxAvatarComponent,
        IgSizeDirective
    ]
})
export class ChipsSampleComponent implements OnInit {
    @ViewChild('customControls', { static: true })
    public customControlsTemplate!: TemplateRef<any>;

    public panelConfig: PropertyPanelConfig = {
        variant: {
            control: {
                type: 'select',
                options: [
                    'default',
                    'primary',
                    'info',
                    'success',
                    'warning',
                    'danger'
                ]
            }
        },
        size: {
            control: {
                type: 'button-group',
                options: ['small', 'medium', 'large'],
                defaultValue: 'large'
            }
        },
        disabled: {
            control: {
                type: 'boolean',
                defaultValue: false
            }
        },
        selectable: {
            control: {
                type: 'boolean',
                defaultValue: false
            }
        },
        selected: {
            control: {
                type: 'boolean',
                defaultValue: false
            }
        },
        removable: {
            control: {
                type: 'boolean',
                defaultValue: false
            }
        },
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

    public ngOnInit() {
        this.propertyChangeService.setCustomControls(
            this.customControlsTemplate
        );
    }

    public hasSuffix = false;
    public hasPrefix = false;
    public hasAvatar = false;
    public hasProgressbar = false;
    public customIcons = false;

    public removeChip(chip: IgxChipComponent) {
        chip.nativeElement.remove();
    }
}
