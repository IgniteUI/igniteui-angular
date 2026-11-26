import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  DestroyRef,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  computed,
  signal
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
    IGX_CARD_DIRECTIVES,
    IGX_INPUT_GROUP_DIRECTIVES,
    IGX_LIST_DIRECTIVES,
    IgxAvatarComponent,
    IgxBadgeComponent,
    IgxButtonDirective,
    IgxCheckboxComponent,
    IgxCircularProgressBarComponent,
    IgxIconButtonDirective,
    IgxIconComponent,
    IgxSliderComponent,
    IgxSwitchComponent,
} from 'igniteui-angular';
import {
    defineComponents,
    IgcListComponent,
    IgcAvatarComponent,
    IgcListHeaderComponent,
    IgcListItemComponent,
    IgcIconComponent,
    IgcCheckboxComponent,
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
    selected?: boolean;
}

interface Member {
    id: number;
    name: string;
    role: string;
    team: string;
    avatar?: string;
}

interface Message {
    id: number;
    from: string;
    avatar: string;
    subject: string;
    time: string;
    day: 'Today' | 'Earlier';
    unread: boolean;
    starred: boolean;
}

interface City {
    name: string;
    country: string;
    population: string;
}

const MEMBERS: Member[] = [
    { id: 1, name: 'Amelia Brooks', role: 'Lead Product Designer', team: 'Design', avatar: 'assets/images/avatar/1.jpg' },
    { id: 2, name: 'Noah Fischer', role: 'UX Researcher', team: 'Design' },
    { id: 3, name: 'Priya Raman', role: 'Visual Designer', team: 'Design', avatar: 'assets/images/avatar/5.jpg' },
    { id: 4, name: 'Diego Morales', role: 'Staff Engineer', team: 'Engineering', avatar: 'assets/images/avatar/9.jpg' },
    { id: 5, name: 'Hana Sato', role: 'Front-end Engineer', team: 'Engineering', avatar: 'assets/images/avatar/12.jpg' },
    { id: 6, name: 'Lukas Novak', role: 'Platform Engineer', team: 'Engineering' },
    { id: 7, name: 'Zara Ahmed', role: 'QA Engineer', team: 'Engineering', avatar: 'assets/images/avatar/16.jpg' },
    { id: 8, name: 'Oliver Grant', role: 'Product Manager', team: 'Product', avatar: 'assets/images/avatar/20.jpg' },
    { id: 9, name: 'Sofia Rossi', role: 'Product Analyst', team: 'Product' }
];

const MESSAGES: Message[] = [
    { id: 1, from: 'Amelia Brooks', avatar: 'assets/images/avatar/1.jpg', subject: 'Design review moved to 3 PM', time: '10:42', day: 'Today', unread: true, starred: false },
    { id: 2, from: 'Diego Morales', avatar: 'assets/images/avatar/9.jpg', subject: 'Release 22.3 is green on CI', time: '09:15', day: 'Today', unread: true, starred: true },
    { id: 3, from: 'Oliver Grant', avatar: 'assets/images/avatar/20.jpg', subject: 'Q1 roadmap draft for feedback', time: '08:03', day: 'Today', unread: false, starred: false },
    { id: 4, from: 'Hana Sato', avatar: 'assets/images/avatar/12.jpg', subject: 'Accessibility audit results', time: 'Mon', day: 'Earlier', unread: false, starred: true },
    { id: 5, from: 'Zara Ahmed', avatar: 'assets/images/avatar/16.jpg', subject: 'Regression suite: 3 new flaky tests', time: 'Sun', day: 'Earlier', unread: false, starred: false }
];

const CITIES: City[] = [
    { name: 'Amsterdam', country: 'Netherlands', population: '0.9M' },
    { name: 'Athens', country: 'Greece', population: '0.6M' },
    { name: 'Barcelona', country: 'Spain', population: '1.6M' },
    { name: 'Berlin', country: 'Germany', population: '3.7M' },
    { name: 'Budapest', country: 'Hungary', population: '1.7M' },
    { name: 'Copenhagen', country: 'Denmark', population: '0.6M' },
    { name: 'Dublin', country: 'Ireland', population: '0.6M' },
    { name: 'Lisbon', country: 'Portugal', population: '0.5M' },
    { name: 'London', country: 'United Kingdom', population: '8.9M' },
    { name: 'Madrid', country: 'Spain', population: '3.3M' },
    { name: 'Paris', country: 'France', population: '2.1M' },
    { name: 'Prague', country: 'Czechia', population: '1.3M' },
    { name: 'Rome', country: 'Italy', population: '2.8M' },
    { name: 'Sofia', country: 'Bulgaria', population: '1.2M' },
    { name: 'Vienna', country: 'Austria', population: '2.0M' }
];

@Component({
    selector: 'app-list-sample',
    styleUrls: ['list.sample.scss'],
    templateUrl: 'list.sample.html',
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        IGX_LIST_DIRECTIVES,
        IGX_CARD_DIRECTIVES,
        IGX_INPUT_GROUP_DIRECTIVES,
        FormsModule,
        IgxIconComponent,
        IgxCheckboxComponent,
        IgxAvatarComponent,
        IgxBadgeComponent,
        IgxButtonDirective,
        IgxIconButtonDirective,
        IgxSwitchComponent,
        IgxSliderComponent,
        IgxCircularProgressBarComponent,
    ],
    changeDetection: ChangeDetectionStrategy.Eager
})
export class ListSampleComponent {
    public panelConfig: PropertyPanelConfig = {
        navigation: {
            label: 'Navigation',
            control: {
                type: 'button-group',
                options: ['none', 'listbox', 'grid'],
                defaultValue: 'listbox'
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
        enablePanning: {
            label: 'Item Panning',
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

        const propertyChange =
            this.propertyChangeService.propertyChanges.subscribe(
                (properties) => {
                    this.properties = properties;
                }
            );

        this.destroyRef.onDestroy(() => propertyChange.unsubscribe());
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

    //#region Team: a multi-select listbox, grouped by team

    public readonly teams = ['Design', 'Engineering', 'Product'];
    public readonly members = MEMBERS;
    public readonly selectedMembers = signal(new Set<number>([1, 5]));

    public membersOf(team: string): Member[] {
        return this.members.filter(member => member.team === team);
    }

    public initials(name: string): string {
        return name.split(' ').map(part => part[0]).join('');
    }

    public toggleMember(member: Member): void {
        this.selectedMembers.update(selected => {
            const next = new Set(selected);
            if (!next.delete(member.id)) {
                next.add(member.id);
            }
            return next;
        });
    }

    //#endregion

    //#region Inbox: a grid of messages with actions

    public readonly days: Message['day'][] = ['Today', 'Earlier'];
    public readonly messages = signal(MESSAGES.map(message => ({ ...message })));
    public readonly unreadCount = computed(() => this.messages().filter(message => message.unread).length);

    public messagesOf(day: Message['day']): Message[] {
        return this.messages().filter(message => message.day === day);
    }

    public open(message: Message): void {
        this.patchMessage(message.id, { unread: false });
    }

    public toggleStar(event: Event, message: Message): void {
        event.stopPropagation();
        this.patchMessage(message.id, { starred: !message.starred });
    }

    public remove(event: Event, message: Message): void {
        event.stopPropagation();
        this.messages.update(messages => messages.filter(item => item.id !== message.id));
    }

    public restoreMessages(): void {
        this.messages.set(MESSAGES.map(message => ({ ...message })));
    }

    private patchMessage(id: number, patch: Partial<Message>): void {
        this.messages.update(messages => messages.map(message => message.id === id ? { ...message, ...patch } : message));
    }

    //#endregion

    //#region Settings: a grid of switches and a slider

    public readonly settings = signal({ email: true, push: false, digest: true, quietHours: false, volume: 60 });

    public toggleSetting(key: 'email' | 'push' | 'digest' | 'quietHours'): void {
        this.settings.update(settings => ({ ...settings, [key]: !settings[key] }));
    }

    public setVolume(volume: number): void {
        this.settings.update(settings => ({ ...settings, volume }));
    }

    //#endregion

    //#region Cities: a single-select listbox with search and loading

    public readonly citySearch = signal('');
    public readonly selectedCity = signal('Sofia');
    public readonly loadingCities = signal(false);
    public readonly cities = computed(() => {
        const term = this.citySearch().trim().toLowerCase();
        return term
            ? CITIES.filter(city => city.name.toLowerCase().includes(term) || city.country.toLowerCase().includes(term))
            : CITIES;
    });

    public refreshCities(): void {
        this.loadingCities.set(true);
        setTimeout(() => this.loadingCities.set(false), 1500);
    }

    //#endregion
}
