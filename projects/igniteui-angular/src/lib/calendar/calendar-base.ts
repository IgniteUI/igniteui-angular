import { Input, Output, EventEmitter } from '@angular/core';
import { WEEKDAYS, Calendar, isDateInRanges, IFormattingOptions } from './calendar';
import { ControlValueAccessor } from '@angular/forms';
import { DateRangeDescriptor } from '../core/dates';


/**
 * Sets the selction type - single, multi or range.
 */
export enum CalendarSelection {
    SINGLE = 'single',
    MULTI = 'multi',
    RANGE = 'range'
}

export class IgxCalendarBase implements ControlValueAccessor {
    /**
     * Gets the start day of the week.
     * Can return a numeric or an enum representation of the week day.
     * Defaults to `Sunday` / `0`.
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
        this.calendarModel.firstWeekDay = value;
    }

    /**
     * Gets the `locale` of the calendar.
     * Default value is `"en"`.
     */
    @Input()
    public get locale(): string {
        return this._locale;
    }

    /**
     * Sets the `locale` of the calendar.
     * Expects a valid BCP 47 language tag.
     * Default value is `"en"`.
     */
    public set locale(value: string) {
        this._locale = value;
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
            case 'single':
                this.selectedDates = null;
                break;
            case 'multi':
            case 'range':
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
        this.selectDate(value);
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
        this._viewDate = this.getDateOnly(value);
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
     *@ViewChild("MyCalendar")
     *public calendar: IgxCalendarComponent;
     *ngOnInit(){
     *    this.calendar.disabledDates = [
     *     {type: DateRangeType.Between, dateRange: [new Date("2020-1-1"), new Date("2020-1-15")]},
     *     {type: DateRangeType.Weekends}];
     *}
     *```
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
     *@ViewChild("MyCalendar")
     *public calendar: IgxCalendarComponent;
     *ngOnInit(){
     *    this.calendar.specialDates = [
     *     {type: DateRangeType.Between, dateRange: [new Date("2020-1-1"), new Date("2020-1-15")]},
     *     {type: DateRangeType.Weekends}];
     *}
     *```
     */
    public set specialDates(value: DateRangeDescriptor[]) {
        this._specialDates = value;
    }

    /**
     * Emits an event when a date is selected.
     * Provides reference the `selectedDates` property.
     */
    @Output()
    public onSelection = new EventEmitter<Date | Date[]>();

    /**
     *@hidden
     */
    private _selection: CalendarSelection | string = CalendarSelection.SINGLE;

    /**
     *@hidden
     */
    private rangeStarted = false;

    /**
    *@hidden
    */
    private _locale = 'en';

    /**
     *@hidden
     */
    private _viewDate: Date;

    /**
     *@hidden
     */
    private _disabledDates: DateRangeDescriptor[] = null;

    /**
     *@hidden
     */
    private _specialDates: DateRangeDescriptor[] = null;

    /**
     *@hidden
     */
    private _formatOptions = {
        day: 'numeric',
        month: 'short',
        weekday: 'short',
        year: 'numeric'
    };

    /**
     *@hidden
     */
    protected formatterWeekday;

    /**
     *@hidden
     */
    protected formatterDay;

    /**
     *@hidden
     */
    protected formatterMonth;

    /**
     *@hidden
     */
    protected formatterYear;

    /**
     *@hidden
     */
    protected formatterMonthday;

    /**
     *@hidden
     */
    public calendarModel: Calendar;

    /**
     *@hidden
     */
    public selectedDates;

    /**
     *@hidden
     */
    protected _onTouchedCallback: () => void = () => { };
    /**
     *@hidden
     */
    protected _onChangeCallback: (_: Date) => void = () => { };

    /**
     * @hidden
     */
    constructor() {
        this.calendarModel = new Calendar();

        this.viewDate = this.viewDate ? this.viewDate : new Date();

        this.calendarModel.firstWeekDay = this.weekStart;
        this.initFormatters();
    }

    /**
     *@hidden
     */
    private getDateOnlyInMs(date: Date) {
        return this.getDateOnly(date).getTime();
    }

    /**
     *@hidden
     */
    private generateDateRange(start: Date, end: Date): Date[] {
        const result = [];
        start = this.getDateOnly(start);
        end = this.getDateOnly(end);
        while (start.getTime() !== end.getTime()) {
            start = this.calendarModel.timedelta(start, 'day', 1);
            result.push(start);
        }

        return result;
    }

    /**
     * Performs a single selection.
     * @hidden
     */
    private selectSingle(value: Date) {
        this.selectedDates = this.getDateOnly(value);
        this._onChangeCallback(this.selectedDates);
    }

    /**
     * Performs a multiple selection
     * @hidden
     */
    private selectMultiple(value: Date | Date[]) {
        if (Array.isArray(value)) {
            this.selectedDates = this.selectedDates.concat(value.map(v => this.getDateOnly(v)));
        } else {
            const valueDateOnly = this.getDateOnly(value);
            const newSelection = [];
            if (this.selectedDates.every((date: Date) => date.getTime() !== valueDateOnly.getTime())) {
                newSelection.push(valueDateOnly);
            } else {
                this.selectedDates = this.selectedDates.filter(
                    (date: Date) => date.getTime() !== valueDateOnly.getTime()
                );
            }

            if (newSelection.length > 0) {
                this.selectedDates = this.selectedDates.concat(newSelection);
            }
        }

        this._onChangeCallback(this.selectedDates);
    }

    /**
     *@hidden
     */
    private selectRange(value: Date | Date[], excludeDisabledDates: boolean = false) {
        let start: Date;
        let end: Date;

        if (Array.isArray(value)) {
            // this.rangeStarted = false;
            value.sort((a: Date, b: Date) => a.valueOf() - b.valueOf());
            start = this.getDateOnly(value[0]);
            end = this.getDateOnly(value[value.length - 1]);
            this.selectedDates = [start, ...this.generateDateRange(start, end)];
        } else {
            if (!this.rangeStarted) {
                this.rangeStarted = true;
                this.selectedDates = [value];
            } else {
                this.rangeStarted = false;

                if (this.selectedDates[0].getTime() === value.getTime()) {
                    this.selectedDates = [];
                    this._onChangeCallback(this.selectedDates);
                    return;
                }

                this.selectedDates.push(value);
                this.selectedDates.sort((a: Date, b: Date) => a.valueOf() - b.valueOf());

                start = this.selectedDates.shift();
                end = this.selectedDates.pop();
                this.selectedDates = [start, ...this.generateDateRange(start, end)];
            }
        }

        if (excludeDisabledDates) {
            this.selectedDates = this.selectedDates.filter(d => !this.isDateDisabled(d));
        }

        this._onChangeCallback(this.selectedDates);
    }

    /**
     * Performs a single deselection.
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
    }

    /**
     *@hidden
     */
    protected getDateOnly(date: Date) {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
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
        this.selectedDates = value;
    }

    /**
     * Checks whether a date is disabled.
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
            return new Date();
        }

        switch (this.selection) {
            case 'single':
                this.selectSingle(value as Date);
                break;
            case 'multi':
                this.selectMultiple(value);
                break;
            case 'range':
                this.selectRange(value, true);
                break;
        }
    }

    /**
     * Deselects date(s) (based on the selection type).
     */
    public deselectDate(value?: Date | Date[]) {
        if (this.selectedDates === null || this.selectedDates === []) {
            return;
        }

        if (value === null || value === undefined) {
            this.selectedDates = this.selection === 'single' ? null : [];
            this.rangeStarted = false;
            this._onChangeCallback(this.selectedDates);
            return;
        }

        switch (this.selection) {
            case 'single':
                this.deselectSingle(value as Date);
                break;
            case 'multi':
                this.deselectMultiple(value as Date[]);
                break;
            case 'range':
                this.deselectRange(value as Date[]);
                break;
        }
    }

    /**
     * @hidden
     */
    public selectDateFromClient(value: Date) {
        switch (this.selection) {
            case 'single':
            case 'multi':
                if (!this.isDateDisabled(value)) {
                    this.selectDate(value);
                }

                break;
            case 'range':
                this.selectRange(value, true);
                break;
        }
    }
}
