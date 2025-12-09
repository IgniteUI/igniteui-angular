import {
    Component,
    CUSTOM_ELEMENTS_SCHEMA,
    DestroyRef,
    OnInit,
    TemplateRef,
    ViewChild,
} from '@angular/core';
import { DATE_PIPE_DEFAULT_OPTIONS } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
    IgxButtonDirective,
    IgxButtonGroupComponent,
    IgxDateRangePickerModule,
    IgxCalendarComponent,
    IViewDateChangeEventArgs,
    IgxCalendarView,
    IFormattingOptions,
    DateRange,
    DateRangeDescriptor,
    DateRangeType,
    IFormattingViews,
} from 'igniteui-angular';
import {
    Properties,
    PropertyChangeService,
    PropertyPanelConfig,
} from '../properties-panel/property-change.service';

import { defineComponents, IgcCalendarComponent } from 'igniteui-webcomponents';

defineComponents(IgcCalendarComponent);

@Component({
    selector: 'app-calendar-sample',
    templateUrl: 'calendar.sample.html',
    styleUrls: ['calendar.sample.scss'],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    providers: [
        {
            provide: DATE_PIPE_DEFAULT_OPTIONS,
            useValue: { dateFormat: 'longDate', }
        }
    ],
    imports: [
        IgxButtonDirective,
        IgxDateRangePickerModule,
        IgxCalendarComponent,
        IgxButtonGroupComponent,
        FormsModule,
    ],
})
export class CalendarSampleComponent implements OnInit {
    @ViewChild('customControls', { static: true })
    public customControlsTemplate!: TemplateRef<any>;

    private _today = new Date();

    private _formatOptions: IFormattingOptions = {
        day: 'numeric',
        month: 'long',
        weekday: 'narrow',
        year: 'numeric',
    };

    protected formatViews: IFormattingViews = {
        day: true,
        month: true,
        year: true
    };

    public panelConfig: PropertyPanelConfig = {
        locale: {
            label: 'Change Locale',
            control: {
                type: 'button-group',
                options: [
                    {
                        value: 'en-US',
                        label: 'EN'
                    },
                    {
                        value: 'bg-BG',
                        label: 'BG'
                    },
                    {
                        value: 'de-DE',
                        label: 'DE'
                    },
                    {
                        value: 'fr-FR',
                        label: 'FR'
                    },
                    {
                        value: 'ja-JP',
                        label: 'JP'
                    },
                    {
                        value: 'zh-CN',
                        label: 'CN'
                    }
                ],
                defaultValue: 'en-US'
            }
        },
        weekStart: {
            label: 'Week Start',
            control: {
                type: 'button-group',
                options: ['monday', 'sunday'],
                defaultValue: 'monday'
            }
        },
        selection: {
            control: {
                type: 'button-group',
                options: ['single', 'multiple', 'range'],
                defaultValue: 'single'
            }
        },
        headerOrientation: {
            label: 'Header Orientation',
            control: {
                type: 'button-group',
                options: ['horizontal', 'vertical'],
                defaultValue: 'horizontal'
            }
        },
        viewOrientation: {
            label: 'View Orientation',
            control: {
                type: 'button-group',
                options: ['horizontal', 'vertical'],
                defaultValue: 'horizontal'
            }
        },
        hideHeader: {
            label: 'Hide Header',
            control: {
                type: 'boolean',
                defaultValue: false
            }
        },
        hideOutsideDays: {
            label: 'Hide Outside Days',
            control: {
                type: 'boolean',
                defaultValue: false
            }
        },
        showWeekNumbers: {
            label: 'Show Week Numbers',
            control: {
                type: 'boolean',
                defaultValue: true
            }
        },
        monthsViewNumber: {
            label: 'Number of Months',
            control: {
                type: 'number',
                min: 1,
                max: 4,
                defaultValue: 1
            }
        }
    }

    private weekStartMap = new Map<string, number>([
        ['monday', 1],
        ['sunday', 7]
    ]);

    private selectionMap = new Map<string, string>([
        ['single', 'single'],
        ['multiple', 'multi'],
        ['range', 'range']
    ]);

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

    public ngOnInit(): void {
        this.propertyChangeService.setCustomControls(
            this.customControlsTemplate
        );
    }

    protected get weekStartAngular() {
        const weekStart =
            this.propertyChangeService.getProperty('weekStart') || 'monday';
        return this.weekStartMap.get(weekStart) || 1;
    }

    protected get selectionAngular() {
        const selection = this.propertyChangeService.getProperty('selection');
        return this.selectionMap.get(selection) || 'single';
    }

    protected onSelection(event: Date | Date[]) {
        console.log(`Selected Date(s): ${event}`);
    }

    protected viewDateChanged(event: IViewDateChangeEventArgs) {
        console.table(event);
    }

    protected activeViewChanged(view: IgxCalendarView) {
        console.log(`Selected View: ${view}`);
    }

    protected set formatOptions(value: IFormattingOptions) {
        this._formatOptions = value;
    }

    protected get formatOptions(): IFormattingOptions {
        return this._formatOptions;
    }

    protected setWeekDayFormat(format: IFormattingOptions['weekday'] | string) {
        this.formatOptions = {
            ...this.formatOptions,
            weekday: format as IFormattingOptions['weekday'],
        };
    }

    protected setMonthFormat(format: IFormattingOptions['month'] | string) {
        this.formatOptions = {
            ...this.formatOptions,
            month: format as IFormattingOptions['month'],
        };
    }

    // DISABLED DATES
    private _disabledRange: DateRange = {
        start: new Date(this._today.getFullYear(), this._today.getMonth(), 15),
        end: new Date(this._today.getFullYear(), this._today.getMonth(), 17),
    };

    protected set disabledRange(value: DateRange) {
        this.disabledDates = value;
        this._disabledRange = value;
    }

    protected get disabledRange(): DateRange {
        return this._disabledRange;
    }

    private _disabledDates: DateRangeDescriptor[] = [
        {
            type: DateRangeType.Between,
            dateRange: [
                this.disabledRange.start as Date,
                this.disabledRange.end as Date,
            ],
        },
    ];

    protected get disabledDates(): DateRangeDescriptor[] {
        return this._disabledDates;
    }

    protected set disabledDates(dates: DateRange) {
        this._disabledDates = [
            {
                type: DateRangeType.Between,
                dateRange: [dates.start as Date, dates.end as Date]
            }
        ];
    }

    // SPECIAL DATES
    private _specialRange: DateRange = {
        start: new Date(this._today.getFullYear(), this._today.getMonth(), 8),
        end: new Date(this._today.getFullYear(), this._today.getMonth(), 10),
    };

    protected set specialRange(value: DateRange) {
        this.specialDates = value;
        this._specialRange = value;
    }

    protected get specialRange(): DateRange {
        return this._specialRange;
    }

    private _specialDates: DateRangeDescriptor[] = [
        {
            type: DateRangeType.Between,
            dateRange: [
                this.specialRange.start as Date,
                this.specialRange.end as Date,
            ],
        },
    ];

    protected get specialDates(): DateRangeDescriptor[] {
        return this._specialDates;
    }

    protected set specialDates(dates: DateRange) {
        this._specialDates = [
            {
                type: DateRangeType.Between,
                dateRange: [dates.start as Date, dates.end as Date]
            }
        ];
    }
}
