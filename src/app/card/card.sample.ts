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
    IgxAvatarComponent,
    IgxSwitchComponent,
    IgxButtonDirective,
    IgxIconButtonDirective,
    IgxIconComponent,
    IgxRippleDirective,
    IgxInputGroupModule,
    IGX_CARD_DIRECTIVES,
} from 'igniteui-angular';
import {
    defineComponents,
    IgcCardComponent,
    IgcAvatarComponent,
    IgcButtonComponent,
    IgcIconButtonComponent,
    registerIconFromText,
} from 'igniteui-webcomponents';
import {
    Properties,
    PropertyChangeService,
    PropertyPanelConfig,
} from '../properties-panel/property-change.service';

defineComponents(
    IgcCardComponent,
    IgcAvatarComponent,
    IgcButtonComponent,
    IgcIconButtonComponent
);

const icons = [
    {
        name: 'favorite',
        url: '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>'
    },
    {
        name: 'share',
        url: '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/></svg>'
    },
    {
        name: 'bookmark',
        url: '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z"/></svg>'
    },
    {
        name: 'skip_previous',
        url: '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#e8eaed"><path d="M0 0h24v24H0z" fill="none"/><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>'
    },
    {
        name: 'play_arrow',
        url: '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#e8eaed"><path d="M0 0h24v24H0z" fill="none"/><path d="M8 5v14l11-7z"/></svg>'
    },
    {
        name: 'skip_next',
        url: '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#e8eaed"><path d="M0 0h24v24H0z" fill="none"/><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>'
    },
];

icons.forEach((icon) => {
    registerIconFromText(icon.name, icon.url);
});

export interface ICard {
    title: string;
    subtitle: string;
    content: string;
    imageUrl: string;
    avatarUrl: string;
    unit: string;
    buttons: string[];
    chip: string[];
    icons: string[];
}

const cardFactory = (params: any): ICard => ({
    title: params.title || 'Card Title',
    subtitle: params.subtitle || 'Card Subtitle',
    unit: params.unit || '°C',
    content: params.content || 'Some card content should be place here.',
    imageUrl: params.imageUrl || 'images/card/media/placeholder.jpg',
    avatarUrl: params.avatarUrl || 'images/card/avatars/rupert_stadler.jpg',
    buttons: params.buttons || ['ACTION1', 'ACTION2'],
    chip: params.chip || ['ACTION1', 'ACTION2', 'ACTION3'],
    icons: params.icons || ['favorite', 'bookmark', 'share']
});

@Component({
    encapsulation: ViewEncapsulation.None,
    selector: 'app-card-sample',
    styleUrls: ['card.sample.scss'],
    templateUrl: 'card.sample.html',
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [
        FormsModule,
        IgxButtonDirective,
        IgxRippleDirective,
        IgxIconComponent,
        IgxAvatarComponent,
        IgxIconButtonDirective,
        IgxInputGroupModule,
        IgxSwitchComponent,
        IGX_CARD_DIRECTIVES
    ]
})
export class CardSampleComponent implements OnInit {
    @ViewChild('customControls', { static: true })
    public customControlsTemplate!: TemplateRef<any>;

    protected hideTitle: boolean = false;
    protected hideSubtitle: boolean = false;
    protected hideThumbnail: boolean = false;

    public sectionOrder: string[] = ['media', 'header', 'content', 'actions']; // Default order
    public orderInput: string = '';

    public panelConfig: PropertyPanelConfig = {
        hideMedia: {
            label: 'Hide Media',
            control: {
                type: 'boolean',
                defaultValue: false
            }
        },
        hideContent: {
            label: 'Hide Content',
            control: {
                type: 'boolean',
                defaultValue: false
            }
        },
        hideActions: {
            label: 'Hide Actions',
            control: {
                type: 'boolean',
                defaultValue: false
            }
        },
        hideHeader: {
            label: 'Hide Header',
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

    public updateSectionOrder(): void {
        const validSections = ['media', 'header', 'content', 'actions']; // Valid sections
        const inputOrder = this.orderInput
            .split(',')
            .map((section) => section.trim().toLowerCase());

        // Validate and update sectionOrder
        this.sectionOrder = inputOrder.filter((section) =>
            validSections.includes(section)
        );

        // Add remaining sections that were not provided (optional)
        validSections.forEach((section) => {
            if (!this.sectionOrder.includes(section)) {
                this.sectionOrder.push(section);
            }
        });
    }

    public cards = [
        cardFactory({
            content: `New York City comprises 5 boroughs sitting where the
            Hudson River meets the Atlantic Ocean. At its core is Manhattan,
            a densely populated borough that’s among the world’s major commercial,
            financial and cultural centers.`,
            avatarUrl: 'assets/images/card/avatars/statue_of_liberty.jpg',
            icons: ['favorite', 'bookmark', 'share'],
            imageUrl: 'assets/images/card/media/ny.jpg',
            subtitle: 'City in New York',
            title: 'New York City'
        }),
        cardFactory({
            title: 'Rozes',
            subtitle: 'Under the Grave (2016)',
            imageUrl: 'assets/images/card/media/roses.jpg',
            icons: ['skip_previous', 'play_arrow', 'skip_next']
        }),
        cardFactory({
            avatarUrl: 'assets/images/card/avatars/alicia_keys.jpg',
            buttons: ['share', 'play album'],
            imageUrl: 'assets/images/card/media/here_media.jpg',
            subtitle: 'by Melow D',
            title: 'THERE'
        }),
    ];
}
