import { Input, Output, EventEmitter, Directive, Inject, LOCALE_ID, HostListener, booleanAttribute, ViewChildren, QueryList, ElementRef, ChangeDetectorRef } from '@angular/core';
import { WEEKDAYS, IFormattingOptions, IFormattingViews, IViewDateChangeEventArgs, ScrollDirection, IgxCalendarView, CalendarSelection } from './calendar';
import { ControlValueAccessor } from '@angular/forms';
import { DateRangeDescriptor } from '../core/dates';
import { noop, Subject } from 'rxjs';
import { isDate, isEqual, PlatformUtil } from '../core/utils';
import { CalendarResourceStringsEN, ICalendarResourceStrings } from '../core/i18n/calendar-resources';
import { DateTimeUtil } from '../date-common/util/date-time.util';
import { getLocaleFirstDayOfWeek } from "@angular/common";
import { getCurrentResourceStrings } from '../core/i18n/resources';
import { KeyboardNavigationService } from './calendar.services';
import { getYearRange, isDateInRanges } from './common/helpers';
import { CalendarDay } from './common/model';

/** @hidden @internal */
@Directive({
    selector: '[igxCalendarBase]',
    standalone: true,
    providers: [KeyboardNavigationService]
})
export class IgxCalendarBaseDirective implements ControlValueAccessor {
    /**
     * Holds month view index we are operating on.
     */
    protected activeViewIdx = 0;

    /**
     * @hidden
     */
    private _activeView: IgxCalendarView = IgxCalendarView.Month;

    /**
     * @hidden
     */
    private activeViewSubject = new Subject<IgxCalendarView>();

    /**
     * @hidden
     */
    protected activeView$ = this.activeViewSubject.asObservable();

    /**
     * Sets/gets whether the outside dates (dates that are out of the current month) will be hidden.
     * Default value is `false`.
     * ```html
     * <igx-calendar [hideOutsideDays]="true"></igx-calendar>
     * ```
     * ```typescript
     * let hideOutsideDays = this.calendar.hideOutsideDays;
     * ```
     */

    @Input({ transform: booleanAttribute })
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
    public activeViewChanged = new EventEmitter<IgxCalendarView>();

    /**
     * @hidden
     */
    public rangeStarted = false;

    /**
     * @hidden
     */
    public pageScrollDirection = ScrollDirection.NONE;

    /**
     * @hidden
     */
    public scrollPage$ = new Subject<void>();

    /**
     * @hidden
     */
    public stopPageScroll$ = new Subject<boolean>();

    /**
     * @hidden
     */
    public startPageScroll$ = new Subject<void>();

    /**
     * @hidden
     */
    public selectedDates: Date[];

    /**
     * @hidden
     */
    public shiftKey = false;

    /**
    * @hidden
    */
    public lastSelectedDate: Date;

    /**
     * @hidden
     */
    protected formatterWeekday: Intl.DateTimeFormat;

    /**
     * @hidden
     */
    protected formatterDay: Intl.DateTimeFormat;

    /**
     * @hidden
     */
    protected formatterMonth: Intl.DateTimeFormat;

    /**
     * @hidden
     */
    protected formatterYear: Intl.DateTimeFormat;

    /**
     * @hidden
     */
    protected formatterMonthday: Intl.DateTimeFormat;

    /**
     * @hidden
     */
    protected formatterRangeday: Intl.DateTimeFormat;

    /**
     * @hidden
     */
    protected _onTouchedCallback: () => void = noop;
    /**
     * @hidden
     */
    protected _onChangeCallback: (_: Date | Date[]) => void = noop;

    /**
      * @hidden
      */
    protected _deselectDate: boolean;

    /**
     * @hidden
     */
    private initialSelection: Date | Date[];

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
    private _disabledDates: DateRangeDescriptor[] = [];

    /**
     * @hidden
     */
    private _specialDates: DateRangeDescriptor[] = [];

    /**
     * @hidden
     */
    private _selection: CalendarSelection | string = CalendarSelection.SINGLE;

    /** @hidden @internal */
    private _resourceStrings = getCurrentResourceStrings(CalendarResourceStringsEN);

    /**
     * @hidden
     */
    private _formatOptions: IFormattingOptions = {
        day: 'numeric',
        month: 'long',
        weekday: 'narrow',
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
        return this._resourceStrings;
    }

    /**
     * Gets the start day of the week.
     * Can return a numeric or an enum representation of the week day.
     * If not set, defaults to the first day of the week for the application locale.
     */
    @Input()
    public get weekStart(): WEEKDAYS | number {
        return this._weekStart;
    }

    /**
     * Sets the start day of the week.
     * Can be assigned to a numeric value or to `WEEKDAYS` enum value.
     */
    public set weekStart(value: WEEKDAYS | number) {
        this._weekStart = value;
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
        if (!this.weekStart) {
            this.weekStart = getLocaleFirstDayOfWeek(this._locale);
        }

        this.initFormatters();
    }

    /**
     * Gets the date format options of the views.
     */
    @Input()
    public get formatOptions(): IFormattingOptions {
        return this._formatOptions;
    }

    /**
     * Sets the date format options of the views.
     * Default is { day: 'numeric', month: 'short', weekday: 'short', year: 'numeric' }
     */
    public set formatOptions(formatOptions: IFormattingOptions) {
        this._formatOptions = {...this._formatOptions, ...formatOptions};
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
     * Sets whether the `day`, `month` and `year` should be rendered
     * according to the locale and formatOptions, if any.
     */
    public set formatViews(formatViews: IFormattingViews) {
        this._formatViews = Object.assign(this._formatViews, formatViews);
    }

    /**
     * Gets the current active view.
     * ```typescript
     * this.activeView = calendar.activeView;
     * ```
     */
    @Input()
    public get activeView(): IgxCalendarView {
        return this._activeView;
    }

    /**
     * Sets the current active view.
     * ```html
     * <igx-calendar [activeView]="year" #calendar></igx-calendar>
     * ```
     * ```typescript
     * calendar.activeView = IgxCalendarView.YEAR;
     * ```
     */
    public set activeView(val: IgxCalendarView) {
        this._activeView = val;
        this.activeViewSubject.next(val);
    }

    /**
     * @hidden
     */
    public get isDefaultView(): boolean {
        return this._activeView === IgxCalendarView.Month;
    }

    /**
     * @hidden
     */
    public get isDecadeView(): boolean {
        return this._activeView === IgxCalendarView.Decade;
    }

    /**
     * @hidden
     */
    public activeViewDecade(activeViewIdx = 0): void {
        this.activeView = IgxCalendarView.Decade;
        this.activeViewIdx = activeViewIdx;
    }

    /**
     * @hidden
     */
    public activeViewDecadeKB(event: KeyboardEvent, activeViewIdx = 0) {
        event.stopPropagation();

        if (this.platform.isActivationKey(event)) {
            event.preventDefault();
            this.activeViewDecade(activeViewIdx);
        }
    }

    /**
     * @hidden
     */
    @ViewChildren('yearsBtn')
    public yearsBtns: QueryList<ElementRef>;

    /**
     * @hidden @internal
     */
    public previousViewDate: Date;

    /**
     * @hidden
     */
    public changeYear(date: Date) {
        this.previousViewDate = this.viewDate;
        this.viewDate = CalendarDay.from(date).add('month', -this.activeViewIdx).native;
        this.activeView = IgxCalendarView.Month;
    }

    /**
     * Returns the locale representation of the year in the year view if enabled,
     * otherwise returns the default `Date.getFullYear()` value.
     *
     * @hidden
     */
    public formattedYear(value: Date | Date[]): string {
		if (Array.isArray(value)) {
			return;
		}

        if (this.formatViews.year) {
            return this.formatterYear.format(value);
        }

	    return `${value.getFullYear()}`;
    }

	public formattedYears(value: Date) {
		const dates = value as unknown as Date[];
		return dates.map(date => this.formattedYear(date)).join(' - ');
	}

    protected prevNavLabel(detail?: string): string {
        switch (this.activeView) {
            case 'month':
                return `${this.resourceStrings.igx_calendar_previous_month}, ${detail}`
            case 'year':
                return this.resourceStrings.igx_calendar_previous_year.replace('{0}', '15');
            case 'decade':
                return this.resourceStrings.igx_calendar_previous_years.replace('{0}', '15');
        }
    }

    protected nextNavLabel(detail?: string): string {
        switch (this.activeView) {
            case 'month':
                return `${this.resourceStrings.igx_calendar_next_month}, ${detail}`
            case 'year':
                return this.resourceStrings.igx_calendar_next_year.replace('{0}', '15');
            case 'decade':
                return this.resourceStrings.igx_calendar_next_years.replace('{0}', '15');
        }
    }

	protected getDecadeRange(): { start: string; end: string } {
        const range = getYearRange(this.viewDate, 15);
        const start = CalendarDay.from(this.viewDate).set({ date: 1, year: range.start });
        const end = CalendarDay.from(this.viewDate).set({ date: 1, year: range.end });

		return {
			start: this.formatterYear.format(start.native),
			end: this.formatterYear.format(end.native)
		}
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
     * Gets the date that is presented. By default it is the current date.
     */
    @Input()
    public get viewDate(): Date {
        return this._viewDate;
    }

    /**
     * Sets the date that will be presented in the default view when the component renders.
     */
    public set viewDate(value: Date | string) {
        if (Array.isArray(value)) {
            return;
        }

        if (typeof value === 'string') {
            value = DateTimeUtil.parseIsoDate(value);
        }

        const validDate = this.validateDate(value);

        if (this._viewDate) {
            this.initialSelection = validDate;
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
     * Checks whether a date is disabled.
     *
     * @hidden
     */
    public isDateDisabled(date: Date | string) {
        if (!this.disabledDates) {
            return false;
        }

        if (typeof date === 'string') {
            date = DateTimeUtil.parseIsoDate(date);
        }

        return isDateInRanges(date, this.disabledDates);
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
     * Gets the selected date(s).
     *
     * When selection is set to `single`, it returns
     * a single `Date` object.
     * Otherwise it is an array of `Date` objects.
     */
    @Input()
    public get value(): Date | Date[] {
        if (this.selection === CalendarSelection.SINGLE) {
            return this.selectedDates?.at(0);
        }

        return this.selectedDates;
    }

    /**
     * Sets the selected date(s).
     *
     * When selection is set to `single`, it accepts
     * a single `Date` object.
     * Otherwise it is an array of `Date` objects.
     */
    public set value(value: Date | Date[] | string) {
        // Validate the date if it is of type string and it is IsoDate
        if (typeof value === 'string') {
            value = DateTimeUtil.parseIsoDate(value);
        }

        // Check if value is set initially by the user,
        // if it's not set the initial selection to the current date
        if (!value || (Array.isArray(value) && value.length === 0)) {
            this.initialSelection = new Date();
            return;
        }

        // Value is provided, but there's no initial selection, set the initial selection to the passed value
        if (!this.initialSelection) {
            this.viewDate = Array.isArray(value) ? new Date(Math.min(...value as unknown as number[])) : value;
        }

        // we then call selectDate with either a single date or an array of dates
        // we also set the initial selection to the provided value
        this.selectDate(value);
        this.initialSelection = value;
    }

    /**
     * @hidden
     */
    constructor(
        protected platform: PlatformUtil,
        @Inject(LOCALE_ID)
        protected _localeId: string,
        protected keyboardNavigation?: KeyboardNavigationService,
        protected cdr?: ChangeDetectorRef,
    ) {
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
     * @hidden
     */
    public registerOnChange(fn: (v: Date | Date[]) => void) {
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
        this.value = value;
    }

    /**
     * Selects date(s) (based on the selection type).
     */
    public selectDate(value: Date | Date[] | string) {
        if (typeof value === 'string') {
            value = DateTimeUtil.parseIsoDate(value);
        }

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
    public deselectDate(value?: Date | Date[] | string) {
        if (!this.selectedDates || this.selectedDates.length === 0) {
            return;
        }

        if (typeof value === 'string') {
            value = DateTimeUtil.parseIsoDate(value);
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
     * Performs a single selection.
     *
     * @hidden
     */
    private selectSingle(value: Date) {
        if (!isEqual(this.selectedDates?.at(0), value)) {
            this.selectedDates = [this.getDateOnly(value)];
            this._onChangeCallback(this.selectedDates.at(0));
        }
    }

    /**
     * Performs a single deselection.
     *
     * @hidden
     */
    private deselectSingle(value: Date) {
        if (this.selectedDates !== null &&
            this.getDateOnlyInMs(value as Date) === this.getDateOnlyInMs(this.selectedDates.at(0))) {
            this.selectedDates = null;
            this._onChangeCallback(this.selectedDates);
        }
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

            if (selDates.length === 0 || selDates.length > newDates.length) {
                // deselect the dates that are part of currently selectedDates and not part of updated new values
                this.selectedDates = newDates.map(v => new Date(v));
            } else {
                this.selectedDates = Array.from(new Set([...newDates, ...selDates])).map(v => new Date(v));
            }
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
     * @hidden
     */
    private selectRange(value: Date | Date[], excludeDisabledDates = false) {
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

                if (this.selectedDates?.at(0)?.getTime() === value.getTime()) {
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

    /**
     * @hidden
     */
    protected initFormatters() {
        this.formatterDay = new Intl.DateTimeFormat(this._locale, { day: this._formatOptions.day });
        this.formatterWeekday = new Intl.DateTimeFormat(this._locale, { weekday: this._formatOptions.weekday });
        this.formatterMonth = new Intl.DateTimeFormat(this._locale, { month: this._formatOptions.month });
        this.formatterYear = new Intl.DateTimeFormat(this._locale, { year: this._formatOptions.year });
        this.formatterMonthday = new Intl.DateTimeFormat(this._locale, { month: this._formatOptions.month, day: this._formatOptions.day });
		this.formatterRangeday = new Intl.DateTimeFormat(this._locale, { day: this._formatOptions.day, month: 'short' });
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
            start = CalendarDay.from(start).add('day', 1).native;
            result.push(start);
        }

        return result;
    }

    private validateDate(value: Date) {
        return DateTimeUtil.isValidDate(value) ? value : new Date();
    }
}
