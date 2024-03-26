import {
    Component,
    ViewChild,
    CUSTOM_ELEMENTS_SCHEMA,
    ChangeDetectionStrategy,
} from "@angular/core";
import { NgFor } from "@angular/common";
import { FormsModule } from "@angular/forms";
import {
    DateRangeType,
    IFormattingOptions,
    IgxButtonDirective,
    IgxButtonGroupComponent,
    IgxCalendarComponent,
    IgxCalendarView,
    IgxCardComponent,
    IgxHintDirective,
    IgxIconComponent,
    IgxInputDirective,
    IgxInputGroupComponent,
    IgxLabelDirective,
    IgxRippleDirective,
    IgxSwitchComponent,
    IViewDateChangeEventArgs,
} from "igniteui-angular";

import { defineComponents, IgcCalendarComponent } from "igniteui-webcomponents";

interface ISelectionType {
    ng: string;
    wc: string;
}

const orientations = ["horizontal", "vertical"] as const;
type Orientation = (typeof orientations)[number];

export type WeekDays =
    | "sunday"
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday";

const DaysMap = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
};

defineComponents(IgcCalendarComponent);

@Component({
    selector: "app-calendar-sample",
    templateUrl: "calendar.sample.html",
    styleUrls: ["calendar.sample.scss"],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        IgxButtonDirective,
        IgxRippleDirective,
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
    ],
})
export class CalendarSampleComponent  {
    @ViewChild("calendar", { static: true })
    private calendar: IgxCalendarComponent;

    private _formatOptions: IFormattingOptions = {
        day: "numeric",
        month: "long",
        weekday: "narrow",
        year: "numeric",
    };

    private _today = new Date();
    private _locale: string;
    private _selectionType: ISelectionType;

    protected weekStart: WeekDays = "sunday";
    protected orientations = Array.from(orientations, (o) => o);
    protected weekNumber: boolean;
    protected calendarHeader: boolean;
    protected outsideDays = false;
    protected visibleMonths: number = 1;
    protected headerOrientation: Orientation = "horizontal";
    protected orientation: Orientation = "horizontal";
    protected locales = [
        {
            text: "EN",
            iso: "en-US",
        },
        {
            text: "BG",
            iso: "bg-BG",
        },
        {
            text: "DE",
            iso: "de-DE",
        },
        {
            text: "FR",
            iso: "fr-FR",
        },
        {
            text: "JP",
            iso: "ja-JA",
        },
    ];

    protected selectionTypes: ISelectionType[] = [
        {
            ng: "single",
            wc: "single",
        },
        {
            ng: "multi",
            wc: "multiple",
        },
        {
            ng: "range",
            wc: "range",
        },
    ];

    protected get locale(): string {
        return this._locale ?? this.locales[0].iso;
    }

    protected set locale(value: string) {
        this._locale = this.locales.find((l) => l.text === value).iso;
    }

    protected disabledDates = [
        {
            type: DateRangeType.Specific,
            dateRange: [
                new Date(
                    this._today.getFullYear(),
                    this._today.getMonth() - 1,
                    31,
                ),
                new Date(this._today.getFullYear(), this._today.getMonth(), 20),
                new Date(this._today.getFullYear(), this._today.getMonth(), 21),
            ],
        },
    ];

    protected specialDates = [
        {
            type: DateRangeType.Specific,
            dateRange: [
                new Date(this._today.getFullYear(), this._today.getMonth(), 2),
                new Date(this._today.getFullYear(), this._today.getMonth(), 10),
            ],
        },
    ];

    public toggleLeadingTrailing() {
        this.outsideDays = !this.outsideDays;
    }

    public onSelection(event: Date | Date[]) {
        console.log(`Selected Date(s): ${event}`);
    }

    protected viewDateChanged(event: IViewDateChangeEventArgs) {
        console.table(event);
    }

    protected activeViewChanged(view: IgxCalendarView) {
        console.log(`Selected View: ${view}`);
    }

    protected set selectionType(value: ISelectionType) {
        this._selectionType = this.selectionTypes.find((t) => t === value);
    }

    protected get selectionType(): ISelectionType {
        return this._selectionType ?? this.selectionTypes[0];
    }

    protected setSelectionType(value: ISelectionType) {
        return (this.selectionType = value);
    }

    protected setMonthsViewNumber(value: string) {
        this.visibleMonths = parseInt(value, 10);
    }

    protected select() {
        if (this.calendar.selection === "single") {
            this.calendar.selectDate(
                new Date(this._today.getFullYear(), this._today.getMonth(), 7),
            );
        } else {
            this.calendar.selectDate([
                new Date(this._today.getFullYear(), this._today.getMonth(), 1),
                new Date(this._today.getFullYear(), this._today.getMonth(), 14),
            ]);
        }
    }

    protected deselect() {
        this.calendar.deselectDate([
            new Date(this._today.getFullYear(), this._today.getMonth(), 14),
        ]);
    }

    protected changeLocale(locale: string) {
        this.locale = locale;
    }

    protected hideHeader() {
        this.calendar.hasHeader = !this.calendar.hasHeader;
        this.calendarHeader = !this.calendarHeader;
    }

    protected setHeaderOrientation(orientation: Orientation) {
        this.headerOrientation = orientation;
    }

    protected setOrientation(orientation: Orientation) {
        this.orientation = orientation;
    }

    protected hideWeekNumber() {
        this.calendar.showWeekNumbers = !this.calendar.showWeekNumbers;
        this.weekNumber = !this.weekNumber;
    }

    protected changeWeekStart(day: string) {
        this.weekStart = day as WeekDays;
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

    protected getWeekDayNumber(value: WeekDays | string) {
        return DaysMap[value];
    }
}
