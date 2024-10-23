import {
    Component,
    CUSTOM_ELEMENTS_SCHEMA,
    OnInit,
    TemplateRef,
    ViewChild,
} from "@angular/core";
import { NgFor, DatePipe, DATE_PIPE_DEFAULT_OPTIONS } from "@angular/common";
import { FormsModule } from "@angular/forms";
import {
    IgxButtonDirective,
    IgxButtonGroupComponent,
    IgxDateRangePickerModule,
    IgxCalendarComponent,
    IgxCardComponent,
    IgxHintDirective,
    IgxIconComponent,
    IgxInputDirective,
    IgxInputGroupComponent,
    IgxLabelDirective,
    IgxRippleDirective,
    IgxSwitchComponent,
    IViewDateChangeEventArgs,
    IgxCalendarView,
    IFormattingOptions,
    DateRange,
    DateRangeDescriptor,
    DateRangeType,
} from "igniteui-angular";
import { PropertyChangeService, PropertyPanelConfig } from '../properties-panel/property-change.service';

import { defineComponents, IgcCalendarComponent } from "igniteui-webcomponents";

defineComponents(IgcCalendarComponent);

@Component({
    selector: "app-calendar-showcase-sample",
    templateUrl: "calendar-showcase.sample.html",
    styleUrls: ["calendar-showcase.sample.scss"],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    standalone: true,
    providers: [
        {
            provide: DATE_PIPE_DEFAULT_OPTIONS,
            useValue: { dateFormat: 'longDate', }
        }
    ],
    imports: [
        IgxButtonDirective,
        IgxRippleDirective,
        IgxDateRangePickerModule,
        IgxCardComponent,
        IgxCalendarComponent,
        IgxButtonGroupComponent,
        IgxInputGroupComponent,
        IgxLabelDirective,
        IgxInputDirective,
        IgxHintDirective,
        FormsModule,
        IgxSwitchComponent,
        IgxIconComponent,
        NgFor,
        DatePipe,
    ],
})
export class CalendarShowcaseSampleComponent implements OnInit {
    @ViewChild('customControls', { static: true }) public customControlsTemplate!: TemplateRef<any>;
    private _today = new Date();

    private _formatOptions: IFormattingOptions = {
        day: "numeric",
        month: "long",
        weekday: "narrow",
        year: "numeric",
    };

    public panelConfig: PropertyPanelConfig = {
        locale: {
            label: 'Change Locale',
            control: {
                type: 'button-group',
                options: ['EN', 'BG', 'DE', 'FR', 'JP'],
                defaultValue: 'EN'
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
                defaultValue: false
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

    constructor(protected propertyChangeService: PropertyChangeService) { }

    private weekStartMap = {
        monday: 1,
        sunday: 7
    };

    private selectionMap = {
        single: 'single',
        multiple: 'multi',
        range: 'range'
    };

    protected get locale() {
        return this.propertyChangeService.getProperty('locale');
    }

    protected get weekStartWC() {
        return this.propertyChangeService.getProperty('weekStart') || 'monday';
    }

    protected get weekStartAngular() {
        const weekStart = this.propertyChangeService.getProperty('weekStart') || 'monday';
        return this.weekStartMap[weekStart];
    }

    protected get selectionWC() {
        return this.propertyChangeService.getProperty('selection');
    }

    protected get selectionAngular() {
        const selection = this.propertyChangeService.getProperty('selection');
        return this.selectionMap[selection];
    }

    protected get headerOrientation() {
        return this.propertyChangeService.getProperty('headerOrientation');
    }

    protected get viewOrientation() {
        return this.propertyChangeService.getProperty('viewOrientation');
    }

    protected get hideHeader() {
        return this.propertyChangeService.getProperty('hideHeader');
    }

    protected get hideOutsideDays() {
        return this.propertyChangeService.getProperty('hideOutsideDays');
    }

    protected get showWeekNumbers() {
        return this.propertyChangeService.getProperty('showWeekNumbers');
    }

    protected get monthsViewNumber() {
        return this.propertyChangeService.getProperty('monthsViewNumber');
    }

    public ngOnInit(): void {
        this.propertyChangeService.setPanelConfig(this.panelConfig);
        this.propertyChangeService.setCustomControls(this.customControlsTemplate);
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

    protected setWeekDayFormat(format: IFormattingOptions["weekday"] | string) {
        this.formatOptions = {
            ...this.formatOptions,
            weekday: format as IFormattingOptions["weekday"],
        };
    }

    protected setMonthFormat(format: IFormattingOptions["month"] | string) {
        this.formatOptions = {
            ...this.formatOptions,
            month: format as IFormattingOptions["month"],
        };
    }

    protected disabledDates = [
        {
            type: DateRangeType.Specific,
            dateRange: [
                new Date(this._today.getFullYear(), this._today.getMonth(), 0),
                new Date(this._today.getFullYear(), this._today.getMonth(), 20),
                new Date(this._today.getFullYear(), this._today.getMonth(), 21),
            ],
        },
    ];

    protected mySpecialDates = [
        {
            type: DateRangeType.Specific,
            dateRange: [
                new Date(this._today.getFullYear(), this._today.getMonth(), 1),
                new Date(this._today.getFullYear(), this._today.getMonth(), 3),
                new Date(this._today.getFullYear(), this._today.getMonth(), 7),
            ],
        },
    ];

    private _specialRange: DateRange = {
        start: new Date(this._today.getFullYear(), this._today.getMonth(), 8),
        end: new Date(this._today.getFullYear(), this._today.getMonth(), 10),
    };

    protected set specialRange(value: DateRange) {
        this.specialDates = value;
        this._specialRange = value;
    };

    protected get specialRange(): DateRange {
        return this._specialRange;
    }

    private _specialDates: DateRangeDescriptor[] = [{
        type: DateRangeType.Between,
        dateRange: [this.specialRange.start as Date, this.specialRange.end as Date]
    }]

    protected get specialDates(): DateRangeDescriptor[] {
        return this._specialDates;
    }

    protected set specialDates(dates: DateRange) {
        this._specialDates = [
            {
                type: DateRangeType.Between,
                dateRange: [dates.start as Date, dates.end as Date]
            }
        ]
    }
}
