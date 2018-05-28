import { EventEmitter, OnInit, QueryList } from "@angular/core";
import { ControlValueAccessor } from "@angular/forms";
import { HammerGestureConfig } from "@angular/platform-browser";
import { ICalendarDate, WEEKDAYS } from "./calendar";
import { IgxCalendarDateDirective } from "./calendar.directives";
export declare enum CalendarView {
    DEFAULT = 0,
    YEAR = 1,
    DECADE = 2,
}
export declare enum CalendarSelection {
    SINGLE = "single",
    MULTI = "multi",
    RANGE = "range",
}
export declare class CalendarHammerConfig extends HammerGestureConfig {
    overrides: {
        pan: {
            direction: number;
            threshold: number;
        };
    };
}
export declare class IgxCalendarComponent implements OnInit, ControlValueAccessor {
    id: string;
    weekStart: WEEKDAYS | number;
    locale: string;
    selection: string;
    viewDate: Date;
    value: Date | Date[];
    formatOptions: object;
    formatViews: object;
    vertical: boolean;
    onSelection: EventEmitter<Date | Date[]>;
    dates: QueryList<IgxCalendarDateDirective>;
    tabindex: number;
    role: string;
    ariaLabelledBy: string;
    readonly styleClass: string;
    readonly months: Date[];
    readonly decade: number[];
    readonly isDefaultView: boolean;
    readonly isYearView: boolean;
    readonly isDecadeView: boolean;
    readonly activeView: CalendarView;
    readonly monthAction: string;
    headerTemplate: any;
    subheaderTemplate: any;
    readonly headerContext: {
        $implicit: {
            date: Date;
            full: string;
            monthView: () => void;
            yearView: () => void;
        };
    };
    readonly context: {
        $implicit: {
            date: Date;
            full: string;
            monthView: () => void;
            yearView: () => void;
        };
    };
    readonly headerDate: Date;
    private headerTemplateDirective;
    private subheaderTemplateDirective;
    private _viewDate;
    private calendarModel;
    private _activeView;
    private selectedDates;
    private _selection;
    private _rangeStarted;
    private _monthAction;
    private _formatOptions;
    private _formatViews;
    constructor();
    ngOnInit(): void;
    registerOnChange(fn: (v: Date) => void): void;
    registerOnTouched(fn: () => void): void;
    writeValue(value: Date | Date[]): void;
    formattedMonth(value: Date): string;
    formattedDate(value: Date): string;
    formattedYear(value: Date): string;
    isCurrentMonth(value: Date): boolean;
    isCurrentYear(value: Date): boolean;
    previousMonth(): void;
    nextMonth(): void;
    previousYear(): void;
    nextYear(): void;
    getFormattedDate(): {
        weekday: string;
        monthday: string;
    };
    childClicked(instance: ICalendarDate): void;
    animationDone(): void;
    selectDate(value: Date | Date[]): void;
    generateWeekHeader(): string[];
    readonly getCalendarMonth: ICalendarDate[][];
    changeYear(event: Date): void;
    changeMonth(event: Date): void;
    activeViewYear(): void;
    activeViewDecade(): void;
    onScroll(event: any): void;
    onPan(event: any): void;
    onKeydownPageUp(event: KeyboardEvent): void;
    onKeydownPageDown(event: KeyboardEvent): void;
    onKeydownShiftPageUp(event: KeyboardEvent): void;
    onKeydownShiftPageDown(event: KeyboardEvent): void;
    onKeydownArrowUp(event: KeyboardEvent): void;
    onKeydownArrowDown(event: KeyboardEvent): void;
    onKeydownArrowLeft(event: KeyboardEvent): void;
    onKeydownArrowRight(event: KeyboardEvent): void;
    onKeydownHome(event: KeyboardEvent): void;
    onKeydownEnd(event: KeyboardEvent): void;
    dateTracker(index: any, item: any): string;
    rowTracker(index: any, item: any): string;
    private selectSingle(value);
    private selectMultiple(value);
    private selectRange(value);
    private generateContext(value);
    private generateDateRange(start, end);
    private generateYearRange(delta);
    private _onTouchedCallback;
    private _onChangeCallback;
}
