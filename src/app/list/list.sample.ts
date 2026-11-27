import {
    ChangeDetectionStrategy,
    Component,
    CUSTOM_ELEMENTS_SCHEMA,
    DestroyRef,
    TemplateRef,
    ViewChild,
    ViewEncapsulation,
    afterNextRender,
    inject,
    signal
} from '@angular/core';
import {
    IGX_LIST_DIRECTIVES,
    IgxAvatarComponent,
    IgxButtonDirective,
    IgxCheckboxComponent,
    IgxCircularProgressBarComponent,
    IgxIconButtonDirective,
    IgxIconComponent,
    IgxSliderComponent,
    IgxSwitchComponent
} from 'igniteui-angular';
import {
    defineComponents,
    IgcAvatarComponent,
    IgcButtonComponent,
    IgcCheckboxComponent,
    IgcCircularProgressComponent,
    IgcIconButtonComponent,
    IgcIconComponent,
    IgcListComponent,
    IgcListHeaderComponent,
    IgcListItemComponent,
    IgcSliderComponent,
    IgcSwitchComponent,
    registerIconFromText
} from 'igniteui-webcomponents';
import { Properties, PropertyChangeService, PropertyPanelConfig } from '../properties-panel/property-change.service';

defineComponents(
    IgcListComponent,
    IgcListHeaderComponent,
    IgcListItemComponent,
    IgcAvatarComponent,
    IgcButtonComponent,
    IgcCheckboxComponent,
    IgcCircularProgressComponent,
    IgcIconButtonComponent,
    IgcIconComponent,
    IgcSliderComponent,
    IgcSwitchComponent
);

const svg = (path: string) =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="${path}"/></svg>`;

const ICONS: Record<string, string> = {
    face: 'M9 11.75a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5zm6 0a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8 0-.29.02-.58.05-.86 2.36-1.05 4.23-2.98 5.21-5.37A9.97 9.97 0 0 0 17.42 10c.78 0 1.53-.09 2.25-.26.21.71.33 1.47.33 2.26 0 4.41-3.59 8-8 8z',
    star: 'M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z',
    star_border: 'M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z',
    delete: 'M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z'
};

for (const [name, path] of Object.entries(ICONS)) {
    registerIconFromText(name, svg(path));
}

export interface Person {
    id: number;
    name: string;
    role: string;
    team: string;
    avatar?: string;
    time: string;
    starred: boolean;
    notify: boolean;
    volume: number;
}

const PEOPLE: Person[] = [
    { id: 1, name: 'Amelia Brooks', role: 'Lead Product Designer', team: 'Design', avatar: 'assets/images/avatar/1.jpg', time: '10:42', starred: false, notify: true, volume: 60 },
    { id: 2, name: 'Noah Fischer', role: 'UX Researcher', team: 'Design', time: '09:15', starred: true, notify: false, volume: 40 },
    { id: 3, name: 'Priya Raman', role: 'Visual Designer', team: 'Design', avatar: 'assets/images/avatar/5.jpg', time: '08:03', starred: false, notify: true, volume: 80 },
    { id: 4, name: 'Diego Morales', role: 'Staff Engineer', team: 'Engineering', avatar: 'assets/images/avatar/9.jpg', time: 'Mon', starred: true, notify: true, volume: 20 },
    { id: 5, name: 'Hana Sato', role: 'Front-end Engineer', team: 'Engineering', avatar: 'assets/images/avatar/12.jpg', time: 'Mon', starred: false, notify: false, volume: 50 },
    { id: 6, name: 'Lukas Novak', role: 'Platform Engineer', team: 'Engineering', time: 'Sun', starred: false, notify: true, volume: 70 },
    { id: 7, name: 'Zara Ahmed', role: 'QA Engineer', team: 'Engineering', avatar: 'assets/images/avatar/16.jpg', time: 'Sun', starred: true, notify: false, volume: 30 },
    { id: 8, name: 'Oliver Grant', role: 'Product Manager', team: 'Product', avatar: 'assets/images/avatar/20.jpg', time: 'Sat', starred: false, notify: true, volume: 90 },
    { id: 9, name: 'Sofia Rossi', role: 'Product Analyst', team: 'Product', time: 'Sat', starred: false, notify: true, volume: 10 },
    { id: 10, name: 'Mateo Silva', role: 'Data Scientist', team: 'Product', avatar: 'assets/images/avatar/7.jpg', time: 'Fri', starred: true, notify: false, volume: 60 },
    { id: 11, name: 'Ingrid Berg', role: 'Technical Writer', team: 'Product', time: 'Fri', starred: false, notify: true, volume: 40 },
    { id: 12, name: 'Kenji Watanabe', role: 'DevOps Engineer', team: 'Engineering', avatar: 'assets/images/avatar/11.jpg', time: 'Thu', starred: false, notify: false, volume: 50 },
    { id: 13, name: 'Chloe Martin', role: 'Interaction Designer', team: 'Design', avatar: 'assets/images/avatar/14.jpg', time: 'Thu', starred: true, notify: true, volume: 70 },
    { id: 14, name: 'Ravi Patel', role: 'Security Engineer', team: 'Engineering', time: 'Wed', starred: false, notify: true, volume: 20 },
    { id: 15, name: 'Elena Petrova', role: 'Product Owner', team: 'Product', avatar: 'assets/images/avatar/18.jpg', time: 'Wed', starred: false, notify: false, volume: 80 }
];

const TEAMS = ['Design', 'Engineering', 'Product'];

/** One group of people under a header, or all of them under none. */
interface Group {
    team: string | null;
    people: Person[];
}

@Component({
    selector: 'app-list-sample',
    styleUrls: ['list.sample.scss'],
    templateUrl: 'list.sample.html',
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    encapsulation: ViewEncapsulation.None,
    imports: [
        IGX_LIST_DIRECTIVES,
        IgxAvatarComponent,
        IgxButtonDirective,
        IgxCheckboxComponent,
        IgxCircularProgressBarComponent,
        IgxIconButtonDirective,
        IgxIconComponent,
        IgxSliderComponent,
        IgxSwitchComponent
    ],
    changeDetection: ChangeDetectionStrategy.Eager
})
export class ListSampleComponent {
    @ViewChild('customControls', { static: true })
    public customControls!: TemplateRef<unknown>;

    public readonly panelConfig: PropertyPanelConfig = {
        navigation: {
            label: 'Navigation',
            control: { type: 'button-group', options: ['none', 'listbox', 'grid'], defaultValue: 'listbox' }
        },
        selection: {
            label: 'Selection',
            control: { type: 'button-group', options: ['none', 'single', 'multiple'], defaultValue: 'multiple' }
        },
        thumbnail: {
            label: 'Thumbnail',
            control: { type: 'select', options: ['none', 'avatar', 'initials', 'icon'], defaultValue: 'avatar' }
        },
        title: {
            label: 'Show title',
            control: { type: 'boolean', defaultValue: true }
        },
        subtitle: {
            label: 'Show subtitle',
            control: { type: 'boolean', defaultValue: true }
        },
        end: {
            label: 'End content',
            control: { type: 'select', options: ['none', 'text', 'checkbox', 'buttons', 'switch', 'slider'], defaultValue: 'checkbox' }
        },
        groups: {
            label: 'Group by team',
            control: { type: 'boolean', defaultValue: true }
        },
        count: {
            label: 'Items (0 shows the empty state)',
            control: { type: 'number', min: 0, max: PEOPLE.length, defaultValue: 9 }
        },
        filter: {
            label: 'Filter',
            control: { type: 'text', defaultValue: '' }
        },
        loading: {
            label: 'Loading',
            control: { type: 'boolean', defaultValue: false }
        },
        panning: {
            label: 'Item panning (Angular only)',
            control: { type: 'boolean', defaultValue: false }
        }
    };

    public properties: Properties = {};

    /** The data that both lists show, with the changes the user made. */
    public readonly people = signal(PEOPLE.map(person => ({ ...person })));
    public readonly selected = signal(new Set<number>([1, 5]));

    private readonly _propertyChangeService = inject(PropertyChangeService);
    private readonly _destroyRef = inject(DestroyRef);

    constructor() {
        this._propertyChangeService.setPanelConfig(this.panelConfig);
        const subscription = this._propertyChangeService.propertyChanges.subscribe(properties => {
            this.properties = properties;
        });
        this._destroyRef.onDestroy(() => subscription.unsubscribe());
        // After the first render: the panel renders the controls synchronously, which fails during this one.
        afterNextRender(() => this._propertyChangeService.setCustomControls(this.customControls));
    }

    /** Why the list is empty, for its empty message. */
    public get emptyReason(): string {
        if (Number(this.properties.count ?? 0) === 0) {
            return 'Set Items above 0 to show people';
        }
        return this.properties.filter ? `No people match "${this.properties.filter}"` : 'No people left';
    }

    /** Whether the user removed items, which the Restore button brings back. */
    public get removed(): boolean {
        return this.people().length < PEOPLE.length;
    }

    /** The people to show, filtered, cut to the item count, and grouped by team when groups are on. */
    public get groups(): Group[] {
        const term = String(this.properties.filter ?? '').trim().toLowerCase();
        const shown = this.people()
            .filter(person => !term || `${person.name} ${person.role} ${person.team}`.toLowerCase().includes(term))
            .slice(0, Math.max(0, Number(this.properties.count ?? 0)));

        return this.properties.groups
            ? TEAMS.map(team => ({ team, people: shown.filter(person => person.team === team) })).filter(group => group.people.length)
            : [{ team: null, people: shown }];
    }

    /** `true` for a multiple selection, `false` for a single one in a grid, else none. */
    public get multiselectable(): string | null {
        switch (this.properties.selection) {
            case 'multiple': return 'true';
            case 'single': return this.properties.navigation === 'grid' ? 'false' : null;
            default: return null;
        }
    }

    /** A checkbox in a listbox option only shows the selection: it is inert, and a click reaches the option. */
    public get checkboxInert(): boolean {
        return this.properties.navigation === 'listbox';
    }

    public isSelected(person: Person): boolean {
        return this.selected().has(person.id);
    }

    public initials(person: Person): string {
        return person.name.split(' ').map(part => part[0]).join('');
    }

    /** Selects an item as the selection mode says, from a click, or from Enter or Space on the item. */
    public select(person: Person): void {
        const mode = this.properties.selection;
        if (mode === 'none') {
            return;
        }
        this.selected.update(selected => {
            if (mode === 'single') {
                return new Set([person.id]);
            }
            const next = new Set(selected);
            if (!next.delete(person.id)) {
                next.add(person.id);
            }
            return next;
        });
    }

    /** Delete on the item itself removes it, so the focus recovery can be tried in every mode. */
    public onKeydown(event: KeyboardEvent, person: Person): void {
        if (event.key === 'Delete' && event.target === event.currentTarget) {
            this.remove(person);
        }
    }

    public remove(person: Person, event?: Event): void {
        event?.stopPropagation();
        this.people.update(people => people.filter(item => item.id !== person.id));
    }

    public toggleStar(person: Person, event: Event): void {
        event.stopPropagation();
        this.patch(person, { starred: !person.starred });
    }

    public setNotify(person: Person, notify: boolean): void {
        this.patch(person, { notify });
    }

    public setVolume(person: Person, volume: number): void {
        this.patch(person, { volume });
    }

    public restore(): void {
        this.people.set(PEOPLE.map(person => ({ ...person })));
    }

    /** Turns loading on for a few seconds, so the items can arrive while the empty list has the focus. */
    public simulateLoad(): void {
        this._propertyChangeService.updateProperty('loading', true);
        setTimeout(() => this._propertyChangeService.updateProperty('loading', false), 3000);
    }

    private patch(person: Person, change: Partial<Person>): void {
        this.people.update(people => people.map(item => item.id === person.id ? { ...item, ...change } : item));
    }
}
