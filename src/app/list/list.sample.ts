import {
    Component,
    CUSTOM_ELEMENTS_SCHEMA,
    DestroyRef,
    ViewEncapsulation,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
    IGX_LIST_DIRECTIVES,
    IgxAvatarComponent,
    IgxButtonDirective,
    IgxCheckboxComponent,
    IgxIconComponent,
    IgxButtonModule,
    IgSizeDirective,
} from 'igniteui-angular';
import {
    defineComponents,
    IgcListComponent,
    IgcAvatarComponent,
    IgcListHeaderComponent,
    IgcListItemComponent,
    IgcIconComponent,
    IgcCheckboxComponent,
    IgcButtonComponent,
    registerIconFromText,
} from 'igniteui-webcomponents';
import {
    Properties,
    PropertyChangeService,
    PropertyPanelConfig,
} from '../properties-panel/property-change.service';

defineComponents(
    IgcListComponent,
    IgcListHeaderComponent,
    IgcListItemComponent,
    IgcAvatarComponent,
    IgcIconComponent,
    IgcCheckboxComponent,
    IgcButtonComponent
);

const icons = [
    {
        name: 'face',
        url: '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#e8eaed"><path d="M0 0h24v24H0z" fill="none"/><path d="M9 11.75c-.69 0-1.25.56-1.25 1.25s.56 1.25 1.25 1.25 1.25-.56 1.25-1.25-.56-1.25-1.25-1.25zm6 0c-.69 0-1.25.56-1.25 1.25s.56 1.25 1.25 1.25 1.25-.56 1.25-1.25-.56-1.25-1.25-1.25zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8 0-.29.02-.58.05-.86 2.36-1.05 4.23-2.98 5.21-5.37C11.07 8.33 14.05 10 17.42 10c.78 0 1.53-.09 2.25-.26.21.71.33 1.47.33 2.26 0 4.41-3.59 8-8 8z"/></svg>'
    },
    {
        name: 'info',
        url: '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#e8eaed"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>'
    }
];

icons.forEach((icon) => {
    registerIconFromText(icon.name, icon.url);
});

interface Employee {
    imageURL: string;
    name: string;
    position: string;
    description: string;
}

@Component({
    selector: 'app-list-sample',
    styleUrls: ['list.sample.scss'],
    templateUrl: 'list.sample.html',
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        IGX_LIST_DIRECTIVES,
        FormsModule,
        IgxIconComponent,
        IgxCheckboxComponent,
        IgxAvatarComponent,
        IgxButtonModule,
        IgxButtonDirective,
        IgSizeDirective
    ]
})
export class ListSampleComponent {
    public panelConfig: PropertyPanelConfig = {
        size: {
            control: {
                type: 'button-group',
                options: ['small', 'medium', 'large']
            }
        },
        hideTitle: {
            label: 'Hide Title',
            control: {
                type: 'boolean',
                defaultValue: false
            }
        },
        hideSubtitle: {
            label: 'Hide Subtitle',
            control: {
                type: 'boolean',
                defaultValue: false
            }
        },
        addAvatarThumbnail: {
            label: 'Add Avatar Thumbnail',
            control: {
                type: 'boolean',
                defaultValue: true
            }
        },
        addIconThumbnail: {
            label: 'Add Icon Thumbnail',
            control: {
                type: 'boolean',
                defaultValue: false
            }
        },
        addCheckboxAction: {
            label: 'Add Checkbox Action',
            control: {
                type: 'boolean',
                defaultValue: true
            }
        },
        addIconAction: {
            label: 'Add Icon Action',
            control: {
                type: 'boolean',
                defaultValue: true
            }
        },
        addOutlinedButton: {
            label: 'Add Outlined Button',
            control: {
                type: 'boolean',
                defaultValue: false
            }
        },
        addContainedButton: {
            label: 'Add Contained Button',
            control: {
                type: 'boolean',
                defaultValue: false
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

    public employeeItems: Employee[] = [
        {
            imageURL: 'assets/images/avatar/18.jpg',
            name: 'Marin Popov',
            position: 'Web designer',
            description:
                'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aperiam, vel?, consectetur adipisicing elit. Aperiam, vel?',
        },
        {
            imageURL: 'assets/images/avatar/2.jpg',
            name: 'Simeon Simeonov',
            position: 'Front-end Developer',
            description:
                'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aperiam, vel?, consectetur adipisicing elit. Aperiam, vel?',
        },
        {
            imageURL: 'assets/images/avatar/7.jpg',
            name: 'Stefan ivanov',
            position: 'UX Architect',
            description:
                'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aperiam, vel?, consectetur adipisicing elit. Aperiam, vel?',
        },
        {
            imageURL: 'assets/images/avatar/6.jpg',
            name: 'Svilen Dimchevski',
            position: 'Graphic designer',
            description:
                'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aperiam, vel, consectetur adipisicing elit. Aperiam, vel??',
        },
    ];
}
