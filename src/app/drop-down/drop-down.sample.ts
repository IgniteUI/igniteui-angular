import {
    Component,
    OnInit,
    ViewChild,
    ElementRef,
    CUSTOM_ELEMENTS_SCHEMA,
    DestroyRef,
} from '@angular/core';
import { foods } from './foods';
import {
    BlockScrollStrategy,
    CloseScrollStrategy,
    ConnectedPositioningStrategy,
    HorizontalAlignment,
    IgSizeDirective,
    IgxButtonDirective,
    IgxButtonGroupComponent,
    IgxDropDownComponent,
    IgxDropDownGroupComponent,
    IgxDropDownItemComponent,
    IgxDropDownItemNavigationDirective,
    IgxIconComponent,
    IgxInputDirective,
    IgxInputGroupComponent,
    IgxOverlayOutletDirective,
    IgxRippleDirective,
    IgxToggleActionDirective,
    IgxToggleDirective,
    NoOpScrollStrategy,
    OverlaySettings,
    PositionSettings,
    ScrollStrategy,
    VerticalAlignment,
} from 'igniteui-angular';
import {
    defineComponents,
    IgcDropdownComponent,
    IgcButtonComponent,
    IgcIconComponent,
    registerIconFromText,
} from 'igniteui-webcomponents';
import {
    Properties,
    PropertyChangeService,
    PropertyPanelConfig,
} from '../properties-panel/property-change.service';

defineComponents(IgcDropdownComponent, IgcButtonComponent, IgcIconComponent);

const icons = [
    {
        name: 'location_city',
        url: '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#e8eaed"><path d="M0 0h24v24H0z" fill="none"/><path d="M15 11V5l-3-3-3 3v2H3v14h18V11h-6zm-8 8H5v-2h2v2zm0-4H5v-2h2v2zm0-4H5V9h2v2zm6 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V9h2v2zm0-4h-2V5h2v2zm6 12h-2v-2h2v2zm0-4h-2v-2h2v2z"/></svg>'
    },
    {
        name: 'location_on',
        url: '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#e8eaed"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>',
    },
];

icons.forEach((icon) => {
    registerIconFromText(icon.name, icon.url);
});

@Component({
    selector: 'drop-down-sample',
    templateUrl: './drop-down.sample.html',
    styleUrls: ['drop-down.sample.scss'],
    imports: [
        IgxButtonGroupComponent,
        IgxButtonDirective,
        IgxDropDownItemNavigationDirective,
        IgxToggleActionDirective,
        IgxDropDownComponent,
        IgxDropDownItemComponent,
        IgxToggleDirective,
        IgxDropDownGroupComponent,
        IgxInputGroupComponent,
        IgxInputDirective,
        IgxRippleDirective,
        IgxOverlayOutletDirective,
        IgxIconComponent,
        IgSizeDirective
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DropDownSampleComponent implements OnInit {
    @ViewChild(IgxDropDownComponent, { static: true })
    private igxDropDown: IgxDropDownComponent;
    @ViewChild('dropdown3', { static: true })
    private igxDropDownSelection: IgxDropDownComponent;
    @ViewChild('button', { static: true })
    private button: ElementRef;
    @ViewChild(IgxOverlayOutletDirective, { static: true })
    private igxOverlayOutlet: IgxOverlayOutletDirective;

    public items: any[] = [];
    public foods = foods;

    public panelConfig: PropertyPanelConfig = {
        size: {
            control: {
                type: 'button-group',
                options: ['small', 'medium', 'large']
            }
        },
        placement: {
            control: {
                type: 'select',
                options: [
                    'top',
                    'top-start',
                    'top-end',
                    'bottom',
                    'bottom-start',
                    'bottom-end',
                    'right',
                    'right-start',
                    'right-end',
                    'left',
                    'left-start',
                    'left-end'
                ],
                defaultValue: 'bottom'
            }
        },
        scrollStrategy: {
            label: 'Scroll Strategy',
            control: {
                type: 'button-group',
                options: ['scroll', 'block', 'close']
            }
        },
        keepOpenOnOutsideClick: {
            label: 'Keep Open on Outside Click',
            control: {
                type: 'boolean',
                defaultValue: false
            }
        },
        hidePrefix: {
            label: 'Hide Prefix',
            control: {
                type: 'boolean',
                defaultValue: false
            }
        },
        hideSuffix: {
            label: 'Hide Suffix',
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

    public ngOnInit() {
        this.igxDropDown.height = '400px';
        this.igxDropDown.width = '180px';

        const states = [
            'New England',
            'Connecticut',
            'Maine',
            'Massachusetts',
            'New Hampshire',
            'Rhode Island',
            'Vermont',
            'Mid-Atlantic',
            'New Jersey',
            'New York',
            'Pennsylvania',
            'East North Central',
            'Illinois',
            'Indiana',
            'Michigan',
            'Ohio',
            'Wisconsin',
            'West North Central',
            'Iowa',
            'Kansas',
            'Minnesota',
            'Missouri',
            'Nebraska',
            'North Dakota',
            'South Dakota',
            'South Atlantic',
            'Delaware',
            'Florida',
            'Georgia',
            'Maryland',
            'North Carolina',
            'South Carolina',
            'Virginia',
            'District of Columbia',
            'West Virginia',
            'East South Central',
            'Alabama',
            'Kentucky',
            'Mississippi',
            'Tennessee',
            'West South Central',
            'Arkansas',
            'Louisiana',
            'Oklahoma',
            'Texas',
            'Mountain',
            'Arizona',
            'Colorado',
            'Idaho',
            'Montana',
            'Nevada',
            'New Mexico',
            'Utah',
            'Wyoming',
            'Pacific',
            'Alaska',
            'California',
            'Hawaii',
            'Oregon',
            'Washington'
        ];

        const areas = [
            'New England',
            'Mid-Atlantic',
            'East North Central',
            'West North Central',
            'South Atlantic',
            'East South Central',
            'West South Central',
            'Mountain',
            'Pacific'
        ];

        for (let i = 0; i < states.length; i += 1) {
            const item = { field: states[i] };
            if (areas.indexOf(states[i]) !== -1) {
                item['header'] = true;
            } else if (i % 7 === 4 || i > 49) {
                item['disabled'] = true;
            }
            this.items.push(item);
        }

        this.items[3]['selected'] = true;
    }

    public clearSelection() {
        this.igxDropDownSelection.clearSelection();
    }

    public onSelection(event) {
        console.log(event);
        const old = event.oldSelection;
        event.oldSelection = event.newSelection;
        event.newSelection = old;
    }

    public onSelectionLogger(event) {
        // event.cancel = true;
        console.log(event);
    }

    public onSelectionMenu(eventArgs) {
        eventArgs.cancel = true;

        console.log(`new selection ${eventArgs.newSelection.element.nativeElement.textContent}`);
        console.log(`old selection ${eventArgs.oldSelection ? eventArgs.oldSelection.element.nativeElement.textContent : ''}`);
    }

    public onOpening() {
    }

    private getPositionStrategy(): ConnectedPositioningStrategy {
        const left = { horizontalDirection: HorizontalAlignment.Left };
        const center = { horizontalDirection: HorizontalAlignment.Center };
        const right = { horizontalDirection: HorizontalAlignment.Right };

        const top = { verticalDirection: VerticalAlignment.Top };
        const middle = { verticalDirection: VerticalAlignment.Middle };
        const bottom = { verticalDirection: VerticalAlignment.Bottom };

        const horizontalStartPointLeft = {
            horizontalStartPoint: HorizontalAlignment.Left,
        };
        const horizontalStartPointRight = {
            horizontalStartPoint: HorizontalAlignment.Right,
        };

        const verticalStartPointTop = {
            verticalStartPoint: VerticalAlignment.Top,
        };
        const verticalStartPointBottom = {
            verticalStartPoint: VerticalAlignment.Bottom,
        };

        const positionEntries = {
            top: {
                ...center,
                ...top,
            },
            'top-start': {
                ...left,
                ...top,
                ...horizontalStartPointLeft,
            },
            'top-end': {
                ...right,
                ...top,
                ...horizontalStartPointRight,
            },
            bottom: {
                ...center,
                ...bottom,
            },
            'bottom-start': {
                ...left,
                ...bottom,
                ...horizontalStartPointLeft,
            },
            'bottom-end': {
                ...right,
                ...bottom,
                ...horizontalStartPointRight,
            },
            right: {
                ...right,
                ...middle,
            },
            'right-start': {
                ...right,
                ...top,
                ...verticalStartPointTop,
            },
            'right-end': {
                ...right,
                ...bottom,
                ...verticalStartPointBottom,
            },
            left: {
                ...left,
                ...middle,
            },
            'left-start': {
                ...left,
                ...top,
                ...verticalStartPointTop,
            },
            'left-end': {
                ...left,
                ...bottom,
                ...verticalStartPointBottom,
            },
        };

        const positionMap = new Map<string, Partial<PositionSettings>>(
            Object.entries(positionEntries)
        );

        const selectedPosition =
            this.propertyChangeService.getProperty('placement') || 'bottom';
        const settings =
            positionMap.get(selectedPosition) || positionMap.get('bottom')!;

        return new ConnectedPositioningStrategy(settings);
    }

    private getScrollStrategy(): ScrollStrategy {
        const selectedStrategy =
            this.propertyChangeService.getProperty('scrollStrategy') ||
            'scroll';

        switch (selectedStrategy) {
            case 'scroll':
                return new NoOpScrollStrategy();
            case 'block':
                return new BlockScrollStrategy();
            case 'close':
                return new CloseScrollStrategy();
            default:
                return new NoOpScrollStrategy();
        }
    }

    public toggleDropDown() {
        const overlaySettings: OverlaySettings = {
            positionStrategy: this.getPositionStrategy(),
            scrollStrategy: this.getScrollStrategy(),
            closeOnOutsideClick: !this.propertyChangeService.getProperty(
                'keepOpenOnOutsideClick'
            ),
            outlet: this.igxOverlayOutlet,
            target: this.button.nativeElement
        };

        this.igxDropDown.toggle(overlaySettings);
    }
}
