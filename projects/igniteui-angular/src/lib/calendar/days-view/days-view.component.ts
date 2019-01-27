import {
    Component,
    Output,
    EventEmitter,
    Input,
    HostListener,
    ViewChildren,
    QueryList,
    HostBinding,
    forwardRef,
    DoCheck
} from '@angular/core';
import { ICalendarDate, Calendar, WEEKDAYS, isDateInRanges } from '../../calendar';
import { trigger, transition, useAnimation } from '@angular/animations';
import { slideInLeft, slideInRight } from '../../animations/main';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { IgxDayItemComponent } from './day-item.component';
import { DateRangeDescriptor, DateRangeType } from '../../core/dates';

let NEXT_ID = 0;

export enum CalendarView {
    DEFAULT,
    YEAR,
    DECADE
}

export enum CalendarSelection {
    SINGLE = 'single',
    MULTI = 'multi',
    RANGE = 'range'
}

@Component({
    providers: [
        {
            multi: true,
            provide: NG_VALUE_ACCESSOR,
            useExisting: IgxDaysViewComponent
        }
    ],
    animations: [
        trigger('animateChange', [
            transition('* => prev', useAnimation(slideInLeft, {
                params: {
                    fromPosition: 'translateX(-30%)'
                }
            })),
            transition('* => next', useAnimation(slideInRight, {
                params: {
                    fromPosition: 'translateX(30%)'
                }
            }))
        ])
    ],
    selector: 'igx-days-view',
    templateUrl: 'days-view.component.html'
})
export class IgxDaysViewComponent implements ControlValueAccessor, DoCheck {
    /**
     * Sets/gets the `id` of the days view.
     * If not set, the `id` will have value `"igx-days-view-0"`.
     * ```html
     * <igx-days-view id="my-days-view"></igx-days-view>
     * ```
     * ```typescript
     * let daysViewId =  this.daysView.id;
     * ```
     * @memberof IgxDaysViewComponent
     */
    @HostBinding('attr.id')
    @Input()
    public id = `igx-days-view-${NEXT_ID++}`;

    /**
     * Gets the start day of the week.
     * Can return a numeric or an enum representation of the week day.
     * Defaults to `Sunday` / `0`.
     * ```typescript
     * let weekStart =  this.calendar.weekStart;
     * ```
     * @memberof IgxCalendarComponent
     */
    @Input()
    public get weekStart(): WEEKDAYS | number {
        return this.calendarModel.firstWeekDay;
    }
    /**
     * Sets the start day of the week.
     * Can be assigned to a numeric value or to `WEEKDAYS` enum value.
     * ```html
     * <igx-calendar [weekStart]="1"></igx-calendar>
     * ```
     * @memberof IgxCalendarComponent
     */
    public set weekStart(value: WEEKDAYS | number) {
        this.calendarModel.firstWeekDay = value;
    }

    /**
     * Gets the `locale` of the calendar.
     * Default value is `"en"`.
     * ```typescript
     * let locale =  this.calendar.locale;
     * ```
     * @memberof IgxCalendarComponent
     */
    @Input()
    public get locale(): string {
        return this._locale;
    }
    /**
     * Sets the `locale` of the calendar.
     * Expects a valid BCP 47 language tag.
     * Default value is `"en"`.
     * ```html
     * <igx-calendar [locale]="de"></igx-calendar>
     * ```
     * @memberof IgxCalendarComponent
     */
    public set locale(value: string) {
        this._locale = value;
        this.initFormatters();
    }

    /**
     *
     * Gets the selection type of the calendar.
     * Default value is `"single"`.
     * Changing the type of selection in the calendar resets the currently
     * selected values if any.
     * ```typescript
     * let selectionType =  this.calendar.selection;
     * ```
     * @memberof IgxCalendarComponent
     */
    @Input()
    public get selection(): string {
        return this._selection;
    }
    /**
     * Sets the selection type of the calendar.
     * ```html
     * <igx-calendar [selection]="'multi'"></igx-calendar>
     * ```
     * @memberof IgxCalendarComponent
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
     * Gets the date that is presented in the calendar.
     * By default it is the current date.
     * ```typescript
     * let date = this.calendar.viewDate;
     * ```
     * @memberof IgxCalendarComponent
     */
    @Input()
    public get viewDate(): Date {
        return this._viewDate;
    }
    /**
     * Sets the date that will be presented in the default view when the calendar renders.
     * ```html
     * <igx-calendar viewDate = "15/06/2018"></igx-calendar>
     * ```
     * @memberof IgxCalendarComponent
     */
    public set viewDate(value: Date) {
        this._viewDate = this.getDateOnly(value);
    }

    /**
     * Gets the selected date(s) of the calendar.
     *
     * When the calendar selection is set to `single`, it returns
     * a single `Date` object.
     * Otherwise it is an array of `Date` objects.
     * ```typescript
     * let selectedDates =  this.calendar.value;
     * ```
     * @memberof IgxCalendarComponent
     */
    @Input()
    public get value(): Date | Date[] {
        return this.selectedDates;
    }
    /**
     * Sets the selected date(s) of the calendar.
     *
     * When the calendar selection is set to `single`, it accepts
     * a single `Date` object.
     * Otherwise it is an array of `Date` objects.
     * ```typescript
     *  this.calendar.value =  new Date(`2016-06-12`);
     * ```
     * @memberof IgxCalendarComponent
     */
    public set value(value: Date | Date[]) {
        this.selectDate(value);
    }

    /**
     * Gets the date format options of the calendar.
     * ```typescript
     * let dateFormatOptions = this.calendar.formatOptions.
     * ```
     */
    @Input()
    public get formatOptions(): object {
        return this._formatOptions;
    }
    /**
     * Sets the date format options of the calendar.
     * ```html
     * <igx-calendar> [formatOptions] = "{ day: '2-digit', month: 'short', weekday: 'long', year: 'numeric' }"</igx-calendar>
     * ```
     * @memberof IgxCalendarComponent
     */
    public set formatOptions(formatOptions: object) {
        this._formatOptions = Object.assign(this._formatOptions, formatOptions);
        this.initFormatters();
    }

    /**
     * Gets the disabled dates descriptors.
     * ```typescript
     * let disabledDates = this.calendar.disabledDates;
     * ```
     */
    @Input()
    public get disabledDates(): DateRangeDescriptor[] {
        return this._disabledDates;
    }
    /**
     * Sets the disabled dates' descriptors.
     * ```typescript
     *@ViewChild("MyCalendar")
     *public calendar: IgCalendarComponent;
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
     * ```typescript
     * let specialDates = this.calendar.specialDates;
     * ```
     */
    @Input()
    public get specialDates(): DateRangeDescriptor[] {
        return this._specialDates;
    }
    /**
     * Sets the special dates' descriptors.
     * ```typescript
     *@ViewChild("MyCalendar")
     *public calendar: IgCalendarComponent;
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
     * @hidden
     */
    @Input()
    public animationAction: any = '';

    /**
     * @hidden
     */
    @Input()
    public changeDaysView = false;

    /**
     * Emits an event when a selection is made in the days view.
     * Provides reference the `date` property in the `IgxDaysViewComponent`.
     * ```html
     * <igx-days-view (onDateSelection)="onSelection($event)"></igx-days-view>
     * ```
     * @memberof IgxDaysViewComponent
     */
    @Output()
    public onDateSelection = new EventEmitter<ICalendarDate>();

    /**
     *@hidden
     */
    @Output()
    public onViewChanged = new EventEmitter<any>();

    /**
     * @hidden
     */
    @ViewChildren(forwardRef(() => IgxDayItemComponent), { read: IgxDayItemComponent })
    public dates: QueryList<IgxDayItemComponent>;


    /**
     *@hidden
     */
    private _viewDate: Date;
    /**
    *@hidden
    */
    private _locale = 'en';
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
    private _selection: CalendarSelection | string = CalendarSelection.SINGLE;
    /**
     *@hidden
     */
    private rangeStarted = false;
    /**
     * @hidden
     */
    private _nextDate: Date;
    /**
     * @hidden
     */
    private callback: (dates?, next?) => void;

    /**
     *@hidden
     */
    protected formatterWeekday;
    /**
     *@hidden
     */
    protected formatterMonth;
    /**
     *@hidden
     */
    protected formatterMonthday;
    /**
     *@hidden
     */
    protected formatterYear;
    /**
     *@hidden
     */
    protected selectedDates;
    /**
     *@hidden
     */
    protected formatterDay;

    /**
     *@hidden
     */
    public calendarModel: Calendar;
    /**
     *@hidden
     */
    public _formatOptions = {
        day: 'numeric',
        month: 'short',
        weekday: 'short',
        year: 'numeric'
    };
    /**
     * @hidden
     */
    public isKeydownTrigger = false;
    /**
     * @hidden
     */
    public outOfRangeDates: DateRangeDescriptor[];

    /**
     * The default css class applied to the component.
     *
     * @hidden
     */
    @HostBinding('class')
    get styleClass(): string {
        return 'igx-calendar';
    }

    /**
     * @hidden
     */
    public get getCalendarMonth(): ICalendarDate[][] {
        return this.calendarModel.monthdatescalendar(this.viewDate.getFullYear(), this.viewDate.getMonth(), true);
    }

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

        this.calendarModel.firstWeekDay = this.weekStart;
        this._viewDate = this._viewDate ? this._viewDate : new Date();
        this.initFormatters();
    }

    /**
     * @hidden
     */
    public ngDoCheck() {
        if (!this.changeDaysView && this.dates) {
            this.disableOutOfRangeDates();
        }
    }

    /**
     * Resets the formatters when locale or formatOptions are changed
     *
     * @hidden
     */
    private initFormatters() {
        this.formatterMonth = new Intl.DateTimeFormat(this._locale, { month: this._formatOptions.month });
        this.formatterDay = new Intl.DateTimeFormat(this._locale, { day: this._formatOptions.day });
        this.formatterYear = new Intl.DateTimeFormat(this._locale, { year: this._formatOptions.year });
        this.formatterMonthday = new Intl.DateTimeFormat(this._locale, { month: this._formatOptions.month, day: this._formatOptions.day });
        this.formatterWeekday = new Intl.DateTimeFormat(this._locale, { weekday: this._formatOptions.weekday });
    }

    /**
     *@hidden
     */
    private getDateOnly(date: Date) {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
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
    private focusPreviousUpDate(target, prevView = false) {
        const node = this.dates.find((date) => date.nativeElement === target);
        if (!node) { return; }

        const dates = this.dates.toArray();
        for (let index = dates.indexOf(node); index - 7 > -1; index -= 7) {
            const date = prevView ? dates[index] : dates[index - 7];
            if (!date.isDisabled) {
                if (!date.isOutOfRange) {
                    date.nativeElement.focus();
                    break;
                }
            }
        }

        if (this.changeDaysView && dates.indexOf(node) - 7 < 0) {
            const dayItem = dates[dates.indexOf(node)];
            this._nextDate = new Date(dayItem.date.date);

            this._nextDate.setDate(this._nextDate.getDate() - 7);

            this.animationAction = 'prev';
            this.isKeydownTrigger = true;
            this.onViewChanged.emit(this._nextDate);

            this.callback = (items?, next?) => {
                const day = items.find((item) => item.date.date.getTime() === next.getTime()).nativeElement;
                this.focusPreviousUpDate(day, true);
            };
        }
    }

    /**
     * @hidden
     */
    private focusNextDownDate(target, nextView = false) {
        const node = this.dates.find((date) => date.nativeElement === target);
        if (!node) { return; }

        const dates = this.dates.toArray();
        for (let index = dates.indexOf(node); index + 7 < this.dates.length; index += 7) {
            const date = nextView ? dates[index] : dates[index + 7];
            if (!date.isDisabled) {
                if (!date.isOutOfRange) {
                    date.nativeElement.focus();
                    break;
                }
            }
        }

        if (this.changeDaysView && dates.indexOf(node) + 7 > this.dates.length - 1) {
            const dayItem = dates[dates.indexOf(node)];
            this._nextDate = new Date(dayItem.date.date);

            this._nextDate.setDate(this._nextDate.getDate() + 7);

            this.animationAction = 'next';
            this.isKeydownTrigger = true;
            this.onViewChanged.emit(this._nextDate);

            this.callback = (items?, next?) => {
                const day = items.find((item) => item.date.date.getTime() === next.getTime()).nativeElement;
                this.focusNextDownDate(day, true);
            };
        }
    }

    /**
     * @hidden
     */
    private focusPreviousDate(target) {
        const node = this.dates.find((date) => date.nativeElement === target);
        if (!node) { return; }

        const dates = this.dates.toArray();
        for (let index = dates.indexOf(node); index > 0; index--) {
            const date = dates[index - 1];
            if (!date.isDisabled) {
                if (!date.isOutOfRange) {
                    date.nativeElement.focus();
                    break;
                }
            }
        }

        if (this.changeDaysView && dates.indexOf(node) === 0) {
            const dayItem = dates[dates.indexOf(node)];
            this._nextDate = new Date(dayItem.date.date);

            this.animationAction = 'prev';
            this.isKeydownTrigger = true;
            this.onViewChanged.emit(this._nextDate);

            this.callback = (items?, next?) => {
                const day = items.find((item) => item.date.date.getTime() === next.getTime()).nativeElement;
                this.focusPreviousDate(day);
            };
        }
    }

    /**
     * @hidden
     */
    private focusNextDate(target) {
        const node = this.dates.find((date) => date.nativeElement === target);
        if (!node) { return; }

        const dates = this.dates.toArray();

        for (let index = dates.indexOf(node); index < this.dates.length - 1; index++) {
            const date = dates[index + 1];
            if (!date.isDisabled) {
                if (!date.isOutOfRange) {
                    date.nativeElement.focus();
                    break;
                }
            }
        }

        if (this.changeDaysView && dates.indexOf(node) === this.dates.length - 1) {
            const dayItem = dates[dates.indexOf(node)];
            this._nextDate = new Date(dayItem.date.date);

            this.animationAction = 'next';
            this.isKeydownTrigger = true;
            this.onViewChanged.emit(this._nextDate);

            this.callback = (items?, next?) => {
                const day = items.find((item) => item.date.date.getTime() === next.getTime()).nativeElement;
                this.focusNextDate(day);
            };
        }
    }

    /**
     * @hidden
     */
    private disableOutOfRangeDates() {
        const dateRange = [];
        this.dates.toArray().forEach((date) => {
            if (!date.isCurrentMonth) {
                dateRange.push(date.date.date);
            }
        });

        this.outOfRangeDates = [{
            type: DateRangeType.Specific,
            dateRange: dateRange
        }];
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
     *```typescript
     * this.calendar.isDateDisabled(new Date(`2018-06-12`));
     *```
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
     *```typescript
     * this.calendar.selectDate(new Date(`2018-06-12`));
     *```
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
     *```typescript
     * this.calendar.deselectDate(new Date(`2018-06-12`));
     *````
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
    public isCurrentMonth(value: Date): boolean {
        return this.viewDate.getMonth() === value.getMonth();
    }

    /**
     * @hidden
     */
    public isCurrentYear(value: Date): boolean {
        return this.viewDate.getFullYear() === value.getFullYear();
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

    /**
     *@hidden
     */
    public focusActiveDate() {
        let date = this.dates.find((d) => d.selected);

        if (!date) {
            date = this.dates.find((d) => d.isToday);
        }

        if (date) {
            date.nativeElement.focus();
        }
    }

    /**
     * @hidden
     */
    public generateWeekHeader(): string[] {
        const dayNames = [];
        const rv = this.calendarModel.monthdatescalendar(this.viewDate.getFullYear(), this.viewDate.getMonth())[0];
        for (const day of rv) {
            dayNames.push(this.formatterWeekday.format(day.date));
        }

        return dayNames;
    }

    /**
     * Returns the locale representation of the date in the days view.
     *
     * @hidden
     */
    public formattedDate(value: Date): string {
        return this.formatterDay.format(value);
    }

    /**
     * @hidden
     */
    public rowTracker(index, item): string {
        return `${item[index].date.getMonth()}${item[index].date.getDate()}`;
    }

    /**
     * @hidden
     */
    public dateTracker(index, item): string {
        return `${item.date.getMonth()}--${item.date.getDate()}`;
    }

    /**
     * @hidden
     */
    public selectDay(event) {
        this.selectDateFromClient(event.date);
        this.onDateSelection.emit(event);
    }

    /**
     * @hidden
     */
    public animationDone(event, isLast: boolean) {
        if (isLast) {
            const date = this.dates.find((d) => d.selected);
            if (date && !this.isKeydownTrigger) {
                setTimeout(() => {
                    date.nativeElement.focus();
                }, parseInt(slideInRight.options.params.duration, 10));
            } else if (this.callback) {
                this.callback(this.dates, this._nextDate);
            }
        }
    }

    /**
     * @hidden
     */
    @HostListener('keydown.arrowup', ['$event'])
    public onKeydownArrowUp(event: KeyboardEvent) {
        event.preventDefault();
        this.focusPreviousUpDate(event.target);
    }

    /**
     * @hidden
     */
    @HostListener('keydown.arrowdown', ['$event'])
    public onKeydownArrowDown(event: KeyboardEvent) {
        event.preventDefault();
        this.focusNextDownDate(event.target);
    }

    /**
     * @hidden
     */
    @HostListener('keydown.arrowleft', ['$event'])
    public onKeydownArrowLeft(event: KeyboardEvent) {
        event.preventDefault();
        this.focusPreviousDate(event.target);
    }

    /**
     * @hidden
     */
    @HostListener('keydown.arrowright', ['$event'])
    public onKeydownArrowRight(event: KeyboardEvent) {
        event.preventDefault();
        this.focusNextDate(event.target);
    }

    /**
     * @hidden
     */
    @HostListener('keydown.home', ['$event'])
    public onKeydownHome(event: KeyboardEvent) {
        event.preventDefault();

        const dates = this.dates.filter(d => d.isCurrentMonth);
        for (let i = 0; i < dates.length; i++) {
            if (!dates[i].isDisabled) {
                dates[i].nativeElement.focus();
                break;
            }
        }
    }

    /**
     * @hidden
     */
    @HostListener('keydown.end', ['$event'])
    public onKeydownEnd(event: KeyboardEvent) {
        event.preventDefault();

        const dates = this.dates.filter(d => d.isCurrentMonth);
        for (let i = dates.length - 1; i >= 0; i--) {
            if (!dates[i].isDisabled) {
                dates[i].nativeElement.focus();
                break;
            }
        }
    }
}
