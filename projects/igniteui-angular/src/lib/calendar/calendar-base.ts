import { Input, Output, EventEmitter, Directive, Inject, LOCALE_ID, HostListener } from '@angular/core';
import { WEEKDAYS, Calendar, isDateInRanges, IFormattingOptions, IFormattingViews } from './calendar';
import { ControlValueAccessor } from '@angular/forms';
import { DateRangeDescriptor } from '../core/dates';
import { noop, Subject } from 'rxjs';
import { isDate, mkenum, PlatformUtil } from '../core/utils';
import { IgxCalendarView } from './month-picker-base';
import { CurrentResourceStrings } from '../core/i18n/resources';
import { ICalendarResourceStrings } from '../core/i18n/calendar-resources';
import { DateTimeUtil } from '../date-common/util/date-time.util';
import { getLocaleFirstDayOfWeek, getLocaleId } from "@angular/common";

/**
 * Sets the selection type - single, multi or range.
 */
export const CalendarSelection = mkenum({
    SINGLE: 'single',
    MULTI: 'multi',
    RANGE: 'range'
});
export type CalendarSelection = (typeof CalendarSelection)[keyof typeof CalendarSelection];

export enum ScrollMonth {
    PREV = 'prev',
    NEXT = 'next',
    NONE = 'none'
}

export interface IViewDateChangeEventArgs {
    previousValue: Date;
    currentValue: Date;
}

/** @hidden @internal */
@Directive({
    selector: '[igxCalendarBase]',
})
export class IgxCalendarBaseDirective implements ControlValueAccessor {
    /**
     * Sets/gets whether the outside dates (dates that are out of the current month) will be hidden.
     * Default value is `false`.
     * ```html
     * <igx-calendar [hideOutsideDays] = "true"></igx-calendar>
     * ```
     * ```typescript
     * let hideOutsideDays = this.calendar.hideOutsideDays;
     * ```
     */

    @Input()
    public hideOutsideDays = false;

    /**
     * Emits an event when a date is selected.
     * Provides reference the `selectedDates` property.
     */
    @Output()
    public selected = new EventEmitter<Date | Date[]>();

    /**
     * Emits an event when the month in view is changed.
     * ```html
     * <igx-calendar (viewDateChanged)="viewDateChanged($event)"></igx-calendar>
     * ```
     * ```typescript
     * public viewDateChanged(event: IViewDateChangeEventArgs) {
     *  let viewDate = event.currentValue;
     * }
     * ```
     */
    @Output()
    public viewDateChanged = new EventEmitter<IViewDateChangeEventArgs>();

    /**
     * Emits an event when the active view is changed.
     * ```html
     * <igx-calendar (activeViewChanged)="activeViewChanged($event)"></igx-calendar>
     * ```
     * ```typescript
     * public activeViewChanged(event: CalendarView) {
     *  let activeView = event;
     * }
     * ```
     */
    @Output()
    public activeViewChanged  = new EventEmitter<IgxCalendarView>();

    /**
     * @hidden
     */
    public rangeStarted = false;

    /**
     * @hidden
     */
    public monthScrollDirection = ScrollMonth.NONE;

    /**
     * @hidden
     */
    public scrollMonth$ = new Subject();

    /**
     * @hidden
     */
    public stopMonthScroll$ = new Subject<boolean>();

    /**
     * @hidden
     */
    public startMonthScroll$ = new Subject();

    /**
     * @hidden
     */
    public selectedDates;

    /**
     * @hidden
     */
    public shiftKey: boolean = false;

     /**
     * @hidden
     */
    public lastSelectedDate: Date;

    /**
     * @hidden
     */
    protected formatterWeekday;

    /**
     * @hidden
     */
    protected formatterDay;

    /**
     * @hidden
     */
    protected formatterMonth;

    /**
     * @hidden
     */
    protected formatterYear;

    /**
     * @hidden
     */
    protected formatterMonthday;

    /**
     * @hidden
     */
    protected calendarModel: Calendar;

    /**
     * @hidden
     */
    protected _onTouchedCallback: () => void = noop;
    /**
     * @hidden
     */
    protected _onChangeCallback: (_: Date) => void = noop;

    /**
      * @hidden
      */
    protected _deselectDate: boolean;

    /**
     * @hidden
     */
    private selectedDatesWithoutFocus;

    /**
     * @hidden
     */
    private _locale: string;

    /**
     * @hidden
     */
    private _weekStart: WEEKDAYS | number;

    /**
     * @hidden
     */
    private _viewDate: Date;

    /**
     * @hidden
     */
    private _startDate: Date;

    /**
     * @hidden
     */
    private _endDate: Date;

    /**
     * @hidden
     */
    private _disabledDates: DateRangeDescriptor[];

    /**
     * @hidden
     */
    private _specialDates: DateRangeDescriptor[];

    /**
     * @hidden
     */
    private _selection: CalendarSelection | string = CalendarSelection.SINGLE;
    /** @hidden @internal */
    private _resourceStrings = CurrentResourceStrings.CalendarResStrings;

    /**
     * @hidden
     */
    private _formatOptions: IFormattingOptions = {
        day: 'numeric',
        month: 'short',
        weekday: 'short',
        year: 'numeric'
    };

    /**
     * @hidden
     */
    private _formatViews: IFormattingViews = {
        day: false,
        month: true,
        year: false
    };

    /**
     * An accessor that sets the resource strings.
     * By default it uses EN resources.
     */
    @Input()
    public set resourceStrings(value: ICalendarResourceStrings) {
        this._resourceStrings = Object.assign({}, this._resourceStrings, value);
    }

    /**
     * An accessor that returns the resource strings.
     */
    public get resourceStrings(): ICalendarResourceStrings {
        if (!this._resourceStrings) {
            this._resourceStrings = CurrentResourceStrings.CalendarResStrings;
        }
        return this._resourceStrings;
    }

    /**
     * Gets the start day of the week.
     * Can return a numeric or an enum representation of the week day.
     * If not set, defaults to the first day of the week for the application locale.
     */
    @Input()
    public get weekStart(): WEEKDAYS | number {
        return this.calendarModel.firstWeekDay;
    }

    /**
     * Sets the start day of the week.
     * Can be assigned to a numeric value or to `WEEKDAYS` enum value.
     */
    public set weekStart(value: WEEKDAYS | number) {
        this._weekStart = value;
        this.calendarModel.firstWeekDay = value;
    }

    /**
     * Gets the `locale` of the calendar.
     * If not set, defaults to application's locale.
     */
    @Input()
    public get locale(): string {
        return this._locale;
    }

    /**
     * Sets the `locale` of the calendar.
     * Expects a valid BCP 47 language tag.
     */
    public set locale(value: string) {
        this._locale = value;

        // if value is not a valid BCP 47 tag, set it back to _localeId
        try {
            getLocaleFirstDayOfWeek(this._locale);
        } catch (e) {
            this._locale = this._localeId;
        }

        // changing locale runtime needs to update the `weekStart` too, if `weekStart` is not explicitly set
        if (this._weekStart === undefined) {
            this.calendarModel.firstWeekDay = getLocaleFirstDayOfWeek(this._locale);
        }

        this.initFormatters();
    }

    /**
     * Gets the date format options of the days view.
     */
    @Input()
    public get formatOptions(): IFormattingOptions {
        return this._formatOptions;
    }

    /**
     * Sets the date format options of the days view.
     * Default is { day: 'numeric', month: 'short', weekday: 'short', year: 'numeric' }
     */
    public set formatOptions(formatOptions: IFormattingOptions) {
        this._formatOptions = Object.assign(this._formatOptions, formatOptions);
        this.initFormatters();
    }

    /**
     * Gets whether the `day`, `month` and `year` should be rendered
     * according to the locale and formatOptions, if any.
     */
    @Input()
    public get formatViews(): IFormattingViews {
        return this._formatViews;
    }

    /**
     * Gets whether the `day`, `month` and `year` should be rendered
     * according to the locale and formatOptions, if any.
     */
    public set formatViews(formatViews: IFormattingViews) {
        this._formatViews = Object.assign(this._formatViews, formatViews);
    }

    /**
     *
     * Gets the selection type.
     * Default value is `"single"`.
     * Changing the type of selection resets the currently
     * selected values if any.
     */
    @Input()
    public get selection(): string {
        return this._selection;
    }

    /**
     * Sets the selection.
     */
    public set selection(value: string) {
        switch (value) {
            case CalendarSelection.SINGLE:
                this.selectedDates = null;
                break;
            case CalendarSelection.MULTI:
            case CalendarSelection.RANGE:
                this.selectedDates = [];
                break;
            default:
                throw new Error('Invalid selection value');
        }
        this._onChangeCallback(this.selectedDates);
        this.rangeStarted = false;
        this._selection = value;
    }

    /**
     * Gets the selected date(s).
     *
     * When selection is set to `single`, it returns
     * a single `Date` object.
     * Otherwise it is an array of `Date` objects.
     */
    @Input()
    public get value(): Date | Date[] {
        return this.selectedDates;
    }

    /**
     * Sets the selected date(s).
     *
     * When selection is set to `single`, it accepts
     * a single `Date` object.
     * Otherwise it is an array of `Date` objects.
     */
    public set value(value: Date | Date[]) {
        if (!value || !!value && (value as Date[]).length === 0) {
            this.selectedDatesWithoutFocus = new Date();
            return;
        }
        if (!this.selectedDatesWithoutFocus) {
            const valueDate = value[0] ? Math.min.apply(null, value) : value;
            const date = this.getDateOnly(new Date(valueDate)).setDate(1);
            this.viewDate = new Date(date);
        }
        this.selectDate(value);
        this.selectedDatesWithoutFocus = value;
    }

    /**
     * Gets the date that is presented.
     * By default it is the current date.
     */
    @Input()
    public get viewDate(): Date {
        return this._viewDate;
    }

    /**
     * Sets the date that will be presented in the default view when the component renders.
     */
    public set viewDate(value: Date) {
        if (Array.isArray(value)) {
            return;
        }

        const validDate = this.validateDate(value);
        if (this._viewDate) {
            this.selectedDatesWithoutFocus = validDate;
        }
        const date = this.getDateOnly(validDate).setDate(1);
        this._viewDate = new Date(date);
    }

    /**
     * Gets the disabled dates descriptors.
     */
    @Input()
    public get disabledDates(): DateRangeDescriptor[] {
        return this._disabledDates;
    }

    /**
     * Sets the disabled dates' descriptors.
     * ```typescript
     * @ViewChild("MyCalendar")
     * public calendar: IgxCalendarComponent;
     * ngOnInit(){
     *    this.calendar.disabledDates = [
     *     {type: DateRangeType.Between, dateRange: [new Date("2020-1-1"), new Date("2020-1-15")]},
     *     {type: DateRangeType.Weekends}];
     * }
     * ```
     */
    public set disabledDates(value: DateRangeDescriptor[]) {
        this._disabledDates = value;
    }

    /**
     * Gets the special dates descriptors.
     */
    @Input()
    public get specialDates(): DateRangeDescriptor[] {
        return this._specialDates;
    }

    /**
     * Sets the special dates' descriptors.
     * ```typescript
     * @ViewChild("MyCalendar")
     * public calendar: IgxCalendarComponent;
     * ngOnInit(){
     *    this.calendar.specialDates = [
     *     {type: DateRangeType.Between, dateRange: [new Date("2020-1-1"), new Date("2020-1-15")]},
     *     {type: DateRangeType.Weekends}];
     * }
     * ```
     */
    public set specialDates(value: DateRangeDescriptor[]) {
        this._specialDates = value;
    }

    /**
     * @hidden
     */
    constructor(protected platform: PlatformUtil, @Inject(LOCALE_ID) protected _localeId: string) {
        this.calendarModel = new Calendar();
        this.locale = _localeId;
        this.viewDate = this.viewDate ? this.viewDate : new Date();
        this.initFormatters();
    }

    /**
     * Multi/Range selection with shift key
     *
     * @hidden
     * @internal
     */
    @HostListener('pointerdown', ['$event'])
    public onPointerdown(event: MouseEvent) {
        this.shiftKey = event.button === 0 && event.shiftKey;
    }

    /**
     * Performs deselection of date/dates, when selection is multi
     * Usually performed by the selectMultiple method, but leads to bug when multiple months are in view
     *
     * @hidden
     */
    public deselectMultipleInMonth(value: Date) {
        // deselect multiple dates from last clicked to shift clicked date (excluding)
        if (this.shiftKey) {
            let start: Date;
            let end: Date;

            [start, end] = this.lastSelectedDate.getTime() < value.getTime()
                ? [this.lastSelectedDate, value]
                : [value, this.lastSelectedDate];

            this.selectedDates = this.selectedDates.filter(
                (date: Date) => date.getTime() < start.getTime() || date.getTime() > end.getTime()
            );

            this.selectedDates.push(value);

        } else {
            // deselect a single date
            const valueDateOnly = this.getDateOnly(value);
            this.selectedDates = this.selectedDates.filter(
                (date: Date) => date.getTime() !== valueDateOnly.getTime()
            );
        }
    }

    /**
     * @hidden
     */
    public registerOnChange(fn: (v: Date) => void) {
        this._onChangeCallback = fn;
    }

    /**
     * @hidden
     */
    public registerOnTouched(fn: () => void) {
        this._onTouchedCallback = fn;
    }

    /**
     * @hidden
     */
    public writeValue(value: Date | Date[]) {
        this.selectDate(value as Date);
    }

    /**
     * Checks whether a date is disabled.
     *
     * @hidden
     */
    public isDateDisabled(date: Date) {
        if (this.disabledDates === null) {
            return false;
        }

        return isDateInRanges(date, this.disabledDates);
    }

    /**
     * Selects date(s) (based on the selection type).
     */
    public selectDate(value: Date | Date[]) {
        if (value === null || value === undefined || (Array.isArray(value) && value.length === 0)) {
            return;
        }

        switch (this.selection) {
            case CalendarSelection.SINGLE:
                if (isDate(value) && !this.isDateDisabled(value as Date)) {
                    this.selectSingle(value as Date);
                }
                break;
            case CalendarSelection.MULTI:
                this.selectMultiple(value);
                break;
            case CalendarSelection.RANGE:
                this.selectRange(value, true);
                break;
        }
    }

    /**
     * Deselects date(s) (based on the selection type).
     */
    public deselectDate(value?: Date | Date[]) {
        if (!this.selectedDates || this.selectedDates.length === 0) {
            return;
        }

        if (value === null || value === undefined) {
            this.selectedDates = this.selection === CalendarSelection.SINGLE ? null : [];
            this.rangeStarted = false;
            this._onChangeCallback(this.selectedDates);
            return;
        }

        switch (this.selection) {
            case CalendarSelection.SINGLE:
                this.deselectSingle(value as Date);
                break;
            case CalendarSelection.MULTI:
                this.deselectMultiple(value as Date[]);
                break;
            case CalendarSelection.RANGE:
                this.deselectRange(value as Date[]);
                break;
        }
    }

    /**
     * @hidden
     */
    public selectDateFromClient(value: Date) {
        switch (this.selection) {
            case CalendarSelection.SINGLE:
            case CalendarSelection.MULTI:
                this.selectDate(value);
                break;
            case CalendarSelection.RANGE:
                this.selectRange(value, true);
                break;
        }
    }

    /**
     * @hidden
     */
    protected initFormatters() {
        this.formatterDay = new Intl.DateTimeFormat(this._locale, { day: this._formatOptions.day });
        this.formatterWeekday = new Intl.DateTimeFormat(this._locale, { weekday: this._formatOptions.weekday });
        this.formatterMonth = new Intl.DateTimeFormat(this._locale, { month: this._formatOptions.month });
        this.formatterYear = new Intl.DateTimeFormat(this._locale, { year: this._formatOptions.year });
        this.formatterMonthday = new Intl.DateTimeFormat(this._locale, { month: this._formatOptions.month, day: this._formatOptions.day });
    }

    /**
     * @hidden
     */
    protected getDateOnly(date: Date) {
        const validDate = this.validateDate(date);
        return new Date(validDate.getFullYear(), validDate.getMonth(), validDate.getDate());
    }

    /**
     * @hidden
     */
    private getDateOnlyInMs(date: Date) {
        return this.getDateOnly(date).getTime();
    }

    /**
     * @hidden
     */
    private generateDateRange(start: Date, end: Date): Date[] {
        const result = [];
        start = this.getDateOnly(start);
        end = this.getDateOnly(end);
        while (start.getTime() < end.getTime()) {
            start = this.calendarModel.timedelta(start, 'day', 1);
            result.push(start);
        }

        return result;
    }

    /**
     * Performs a single selection.
     *
     * @hidden
     */
    private selectSingle(value: Date) {
        this.selectedDates = this.getDateOnly(value);
        this._onChangeCallback(this.selectedDates);
    }

    /**
     * Performs a multiple selection
     *
     * @hidden
     */
    private selectMultiple(value: Date | Date[]) {
        if (Array.isArray(value)) {
            const newDates = value.map(v => this.getDateOnly(v).getTime());
            const selDates = this.selectedDates.map(v => this.getDateOnly(v).getTime());

            if (JSON.stringify(newDates) === JSON.stringify(selDates)) {
                return;
            }

            this.selectedDates = Array.from(new Set([...newDates, ...selDates])).map(v => new Date(v));
        } else {
            let newSelection = [];

            if (this.shiftKey && this.lastSelectedDate) {

                [this._startDate, this._endDate] = this.lastSelectedDate.getTime() < value.getTime()
                    ? [this.lastSelectedDate, value]
                    : [value, this.lastSelectedDate];

                const unselectedDates = [this._startDate, ...this.generateDateRange(this._startDate, this._endDate)]
                    .filter(date => !this.isDateDisabled(date)
                        && this.selectedDates.every((d: Date) => d.getTime() !== date.getTime())
                    );

                // select all dates from last selected to shift clicked date
                if (this.selectedDates.some((date: Date) => date.getTime() === this.lastSelectedDate.getTime())
                    && unselectedDates.length) {

                    newSelection = unselectedDates;
                } else {
                    // delesect all dates from last clicked to shift clicked date (excluding)
                    this.selectedDates = this.selectedDates.filter((date: Date) =>
                        date.getTime() < this._startDate.getTime() || date.getTime() > this._endDate.getTime()
                    );

                    this.selectedDates.push(value);
                    this._deselectDate = true;
                }

                this._startDate = this._endDate = undefined;

            } else if (this.selectedDates.every((date: Date) => date.getTime() !== value.getTime())) {
                newSelection.push(value);

            } else {
                this.selectedDates = this.selectedDates.filter(
                    (date: Date) => date.getTime() !== value.getTime()
                );

                this._deselectDate = true;
            }

            if (newSelection.length > 0) {
                this.selectedDates = this.selectedDates.concat(newSelection);
                this._deselectDate = false;
            }

            this.lastSelectedDate = value;
        }

        this.selectedDates = this.selectedDates.filter(d => !this.isDateDisabled(d));
        this.selectedDates.sort((a: Date, b: Date) => a.valueOf() - b.valueOf());
        this._onChangeCallback(this.selectedDates);
    }

    /**
     * @hidden
     */
    private selectRange(value: Date | Date[], excludeDisabledDates: boolean = false) {
        if (Array.isArray(value)) {
            value.sort((a: Date, b: Date) => a.valueOf() - b.valueOf());
            this._startDate = this.getDateOnly(value[0]);
            this._endDate = this.getDateOnly(value[value.length - 1]);
        } else {

            if (this.shiftKey && this.lastSelectedDate) {

                if (this.lastSelectedDate.getTime() === value.getTime()) {
                    this.selectedDates = this.selectedDates.length === 1 ? [] : [value];
                    this.rangeStarted = !!this.selectedDates.length;
                    this._onChangeCallback(this.selectedDates);
                    return;
                }

                // shortens the range when selecting a date inside of it
                if (this.selectedDates.some((date: Date) => date.getTime() === value.getTime())) {

                    this.lastSelectedDate.getTime() < value.getTime()
                        ? this._startDate = value
                        : this._endDate = value;

                } else {
                    // extends the range when selecting a date outside of it
                    // allows selection from last deselected to current selected date
                    if (this.lastSelectedDate.getTime() < value.getTime()) {
                        this._startDate = this._startDate ?? this.lastSelectedDate;
                        this._endDate = value;
                    } else {
                        this._startDate = value;
                        this._endDate = this._endDate ?? this.lastSelectedDate;
                    }
                }

                this.rangeStarted = false;

            } else if (!this.rangeStarted) {
                this.rangeStarted = true;
                this.selectedDates = [value];
                this._startDate = this._endDate = undefined;
            } else {
                this.rangeStarted = false;

                if (this.selectedDates[0].getTime() === value.getTime()) {
                    this.selectedDates = [];
                    this._onChangeCallback(this.selectedDates);
                    return;
                }

                [this._startDate, this._endDate] = this.lastSelectedDate.getTime() < value.getTime()
                    ? [this.lastSelectedDate, value]
                    : [value, this.lastSelectedDate];
            }

            this.lastSelectedDate = value;
        }

        if (this._startDate && this._endDate) {
            this.selectedDates = [this._startDate, ...this.generateDateRange(this._startDate, this._endDate)];
        }

        if (excludeDisabledDates) {
            this.selectedDates = this.selectedDates.filter(d => !this.isDateDisabled(d));
        }

        this._onChangeCallback(this.selectedDates);
    }

    /**
     * Performs a single deselection.
     *
     * @hidden
     */
    private deselectSingle(value: Date) {
        if (this.selectedDates !== null &&
            this.getDateOnlyInMs(value as Date) === this.getDateOnlyInMs(this.selectedDates)) {
            this.selectedDates = null;
            this._onChangeCallback(this.selectedDates);
        }
    }

    /**
     * Performs a multiple deselection.
     *
     * @hidden
     */
    private deselectMultiple(value: Date[]) {
        value = value.filter(v => v !== null);
        const selectedDatesCount = this.selectedDates.length;
        const datesInMsToDeselect: Set<number> = new Set<number>(
            value.map(v => this.getDateOnlyInMs(v)));

        for (let i = this.selectedDates.length - 1; i >= 0; i--) {
            if (datesInMsToDeselect.has(this.getDateOnlyInMs(this.selectedDates[i]))) {
                this.selectedDates.splice(i, 1);
            }
        }

        if (this.selectedDates.length !== selectedDatesCount) {
            this._onChangeCallback(this.selectedDates);
        }
    }

    /**
     * Performs a range deselection.
     *
     * @hidden
     */
    private deselectRange(value: Date[]) {
        value = value.filter(v => v !== null);
        if (value.length < 1) {
            return;
        }

        value.sort((a: Date, b: Date) => a.valueOf() - b.valueOf());
        const valueStart = this.getDateOnlyInMs(value[0]);
        const valueEnd = this.getDateOnlyInMs(value[value.length - 1]);

        this.selectedDates.sort((a: Date, b: Date) => a.valueOf() - b.valueOf());
        const selectedDatesStart = this.getDateOnlyInMs(this.selectedDates[0]);
        const selectedDatesEnd = this.getDateOnlyInMs(this.selectedDates[this.selectedDates.length - 1]);

        if (!(valueEnd < selectedDatesStart) && !(valueStart > selectedDatesEnd)) {
            this.selectedDates = [];
            this.rangeStarted = false;
            this._onChangeCallback(this.selectedDates);
        }
    }

    private validateDate(value: Date) {
        return DateTimeUtil.isValidDate(value) ? value : new Date();
    }
}
