import {
    Component,
    CUSTOM_ELEMENTS_SCHEMA,
    inject,
    TemplateRef,
    ViewChild,
    ViewEncapsulation,
    OnInit,
    ElementRef,
    ChangeDetectorRef,
    DestroyRef,
} from '@angular/core';

import {
    IgxButtonDirective,
    IgxIconComponent,
    IGX_TABS_DIRECTIVES,
} from 'igniteui-angular';
import {
    defineComponents,
    IgcTabsComponent,
    IgcTabComponent,
    IgcTabPanelComponent,
} from 'igniteui-webcomponents';
import {
    PropertyChangeService,
    Properties,
} from '../properties-panel/property-change.service';

defineComponents(IgcTabsComponent, IgcTabComponent, IgcTabPanelComponent);

@Component({
    selector: 'app-tabs-showcase-sample',
    styleUrls: ['tabs-showcase.sample.scss'],
    templateUrl: 'tabs-showcase.sample.html',
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [IgxButtonDirective, IgxIconComponent, IGX_TABS_DIRECTIVES]
})
export class TabsShowcaseSampleComponent implements OnInit {
    @ViewChild('angularTabs', { static: false })
    public angularTabsRef!: ElementRef;
    @ViewChild('webComponentsTabs', { static: false })
    public webComponentsTabsRef!: ElementRef;
    @ViewChild('customControlsTemplate', { static: true })
    public customControlsTemplate!: TemplateRef<any>;

    public properties: Properties;

    public contacts: any[] = [
        { id: '1', text: 'Terrance Orta', phone: '770-504-2217' },
        { id: '2', text: 'Richard Mahoney', phone: '423-676-2869' },
        { id: '3', text: 'Donna Price', phone: '859-496-2817' },
        { id: '4', text: 'Lisa Landers', phone: '901-747-3428' },
    ];

    public selectedTabId = this.contacts[0]?.id;
    public indexMessage: string;

    private pcs = inject(PropertyChangeService);
    private cdr = inject(ChangeDetectorRef);

    constructor(private destroyRef: DestroyRef) {
        this.pcs.setPanelConfig({
            alignment: {
                control: {
                    type: 'select',
                    options: ['start', 'end', 'center', 'justify'],
                    defaultValue: 'start'
                }
            },
            activation: {
                control: {
                    type: 'button-group',
                    options: ['manual', 'auto'],
                    defaultValue: 'auto'
                }
            },
            hideIcon: {
                label: 'Hide icons',
                control: {
                    type: 'boolean',
                    defaultValue: false
                },
            },
            hideText: {
                label: 'Hide Text',
                control: {
                    type: 'boolean',
                    defaultValue: false
                },
            },
        });

        const { unsubscribe } = this.pcs.propertyChanges.subscribe(
            (properties) => {
                this.properties = properties;
            }
        );

        this.destroyRef.onDestroy(() => unsubscribe);
    }

    public ngOnInit() {
        this.pcs.setCustomControls(this.customControlsTemplate);
    }

    /**
     * Select a tab programmatically by its ID.
     * Use ChangeDetectorRef to notify Angular about the change,
     * preventing the ExpressionChangedAfterItHasBeenCheckedError.
     */
    public selectTab(id: string) {
        this.selectedTabId = id;
        this.cdr.detectChanges(); // Notify Angular of the programmatic change
    }

    /**
     * Add a new tab and automatically select it.
     */
    public addTab() {
        const newContact = {
            id: (this.contacts.length + 1).toString(),
            text: `New Contact ${this.contacts.length + 1}`,
            phone: '555-555-5555'
        };

        this.contacts.push(newContact);

        // Select the new tab
        this.selectTab(newContact.id);
    }

    /**
     * Remove the last tab and select the previous one if available.
     */
    public removeTab() {
        if (this.contacts.length > 0) {
            this.contacts.pop();

            // Select the previous tab or none if empty
            this.selectTab(this.contacts[this.contacts.length - 1]?.id || '');
        }
    }

    /**
     * Update the tab index for next or previous navigation.
     * Use modular arithmetic for circular navigation.
     */
    private updateTabIndex(forward: boolean) {
        const currentIndex = this.contacts.findIndex(
            (contact) => contact.id === this.selectedTabId
        );
        if (currentIndex !== -1) {
            const nextIndex = forward
                // Move forward, loop to start
                ? (currentIndex + 1) % this.contacts.length
                // Move backward, loop to end
                : (currentIndex - 1 + this.contacts.length) % this.contacts.length;
            this.selectTab(this.contacts[nextIndex].id); // Select the new tab
        }
    }

    public nextTab() {
        this.updateTabIndex(true); // Move forward
    }

    public previousTab() {
        this.updateTabIndex(false); // Move backward
    }

    public selectTabAtIndex(index: number): string {
        if (index >= 0 && index < this.contacts.length) {
            this.selectTab(this.contacts[index].id);
            return this.indexMessage = `Tab at index ${index} selected: ${this.contacts[index].text}`;
        } else {
            return this.indexMessage = `Tab at index ${index} does not exist.`;
        }
    }
}
