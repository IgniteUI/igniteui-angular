import { transition, trigger, useAnimation } from "@angular/animations";
import {
    Component,
    ContentChild,
    EventEmitter,
    forwardRef,
    HostBinding,
    HostListener,
    Input,
    OnInit,
    Output,
    QueryList,
    TemplateRef,
    ViewChildren
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { HAMMER_GESTURE_CONFIG, HammerGestureConfig } from "@angular/platform-browser";
import { fadeIn, scaleInCenter, slideInLeft, slideInRight } from "../animations/main";
import { Calendar, ICalendarDate, range, weekDay, WEEKDAYS } from "./calendar";
import {
    IgxCalendarDateDirective,
    IgxCalendarHeaderTemplateDirective,
    IgxCalendarSubheaderTemplateDirective
} from "./calendar.directives";

export enum CalendarView {
    DEFAULT,
    YEAR,
    DECADE
}

export enum CalendarSelection {
    SINGLE = "single",
    MULTI = "multi",
    RANGE = "range"
}

export class CalendarHammerConfig extends HammerGestureConfig {
    public overrides = {
        pan: { direction: Hammer.DIRECTION_VERTICAL, threshold: 1 }
    };
}

/**
 * **Ignite UI for Angular Calendar**
 * [Documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/calendar.html)
 * The Ignite UI Calendar provides an easy way to display a calendar and allow users to select dates using single, multiple
 * or range selection.
 *
 * Example:
 * ```html
 * <igx-calendar selection="range"></igx-calendar>
 * ```
 */
@Component({
    animations: [
        trigger("animateView", [
            transition("void => 0", useAnimation(fadeIn)),
            transition("void => *", useAnimation(scaleInCenter, {
                params: {
                    duration: ".2s",
                    fromScale: .9
                }
            }))
        ]),
        trigger("animateChange", [
            transition("* => prev", useAnimation(slideInLeft, {
                params: {
                    fromPosition: "translateX(-30%)"
                }
            })),
            transition("* => next", useAnimation(slideInRight, {
                params: {
                    fromPosition: "translateX(30%)"
                }
            }))
        ])
    ],
    providers: [
            {
                multi: true,
                provide: NG_VALUE_ACCESSOR,
                useExisting: IgxCalendarComponent
            },
            {
                provide: HAMMER_GESTURE_CONFIG,
                useClass: CalendarHammerConfig
            }
        ],
    selector: "igx-calendar",
    templateUrl: "calendar.component.html"
})
export class IgxCalendarComponent implements OnInit, ControlValueAccessor {

    /**
     * An `@Input` property indicating the start of the week.
     * Defaults to Sunday.
     */
    @Input()
    public get weekStart(): WEEKDAYS | number {
        return this.calendarModel.firstWeekDay;
    }

    public set weekStart(value: WEEKDAYS | number) {
        this.calendarModel.firstWeekDay = value;
    }

    /**
     * An `@Input` property indicating the locale of the calendar.
     * Expects a valid BCP 47 language tag.
     */
    @Input()
    public locale = "en";

    /**
     * An @Input property controlling the selection mechanism of the calendar.
     * Allowed values are `single`, `multi` and `range`. Defaults to `single`.
     * Providing and invalid value will throw an error.
     *
     * Changing the type of selection in the calendar resets the currently
     * selected values if any.
     */
    @Input()
    public get selection(): string {
        return this._selection;
    }

    public set selection(value: string) {
        switch (value) {
            case "single":
                this.selectedDates = null;
                break;
            case "multi":
            case "range":
                this.selectedDates = [];
                break;
            default:
                throw new Error("Invalid selection value");
        }
        this._onChangeCallback(this.selectedDates);
        this._rangeStarted = false;
        this._selection = value;
    }

    /**
     * An @Input property controlling the the year/month that will be presented in the default view when the calendar renders.
     * By default it is the current year/month.
     */
    @Input()
    public get viewDate(): Date {
        return this._viewDate;
    }

    public set viewDate(value: Date) {
        this._viewDate = new Date(value);
    }

    /**
     * Gets and sets the selected date(s) of the calendar.
     *
     * When the calendar selection is set to `single`, it accepts/returns
     * a single `Date` object.
     * Otherwise it is an array of `Date` objects.
     */
    @Input()
    public get value(): Date | Date[] {
        return this.selectedDates;
    }

    public set value(value: Date | Date[]) {
        this.selectDate(value);
    }

    /**
     * An @Input property which controls the formatting of the date components to use in
     * formatted output.
     */
    @Input()
    public get formatOptions(): object {
        return this._formatOptions;
    }
    public set formatOptions(formatOptions: object) {
        this._formatOptions = Object.assign(this._formatOptions, formatOptions);
    }

    /**
     * An @Input property controlling whether the 'day', 'month' and 'year' should be rendered
     * according to the locale and formatOptions, if any.
     * Affects rendering in the default view, month view and year view.
     * Does not affect rendering in the header.
     */
    @Input()
    public get formatViews(): object {
        return this._formatViews;
    }
    public set formatViews(formatViews: object) {
        this._formatViews = Object.assign(this._formatViews, formatViews);
    }

    /**
     * An @Input property controlling the layout of the calendar.
     * When `vertical` is set to `true` the calendar header will be displayed on the side of
     * the calendar body, otherwise it will be above (default).
     */
    @Input()
    public vertical = false;

    @Output()
    public onSelection = new EventEmitter<Date | Date[]>();

    /**
     * @hidden
     */
    @ViewChildren(forwardRef(() => IgxCalendarDateDirective), { read: IgxCalendarDateDirective })
    public dates: QueryList<IgxCalendarDateDirective>;

    /**
     * The default `tabindex` attribute for the component.
     *
     * @hidden
     */
    @HostBinding("attr.tabindex")
    public tabindex = 0;

    /**
     * The default aria role attribute for the component.
     *
     * @hidden
     */
    @HostBinding("attr.role")
    public role = "grid";

    /**
     * The default aria lebelled by attribute for the component.
     *
     * @hidden
     */
    @HostBinding("attr.aria-labelledby")
    public ariaLabelledBy = "calendar";

    /**
     * The default css class applied to the component.
     *
     * @hidden
     */
    @HostBinding("class")
    get styleClass(): string {
        if (this.vertical) {
            return "igx-calendar--vertical";
        }
        return "igx-calendar";
    }

    /**
     * Returns an array of date objects which are then used to
     * properly render the month names.
     *
     * Used in the template of the component
     *
     * @hidden
     */
    get months(): Date[] {
        let start = new Date(this._viewDate.getFullYear(), 0, 1);
        const result = [];

        for (let i = 0; i < 12; i++) {
            result.push(start);
            start = this.calendarModel.timedelta(start, "month", 1);
        }

        return result;
    }

    /**
     * Returns an array of date objects which are then used to properly
     * render the years.
     *
     * Used in the template of the component.
     *
     * @hidden
     */
    get decade(): number[] {
        const result = [];
        const start = this._viewDate.getFullYear() - 3;
        const end = this._viewDate.getFullYear() + 4;

        for (const year of range(start, end)) {
            result.push(new Date(year, this._viewDate.getMonth(), this._viewDate.getDate()));
        }

        return result;
    }

    get isDefaultView(): boolean {
        return this._activeView === CalendarView.DEFAULT;
    }

    get isYearView(): boolean {
        return this._activeView === CalendarView.YEAR;
    }

    get isDecadeView(): boolean {
        return this._activeView === CalendarView.DECADE;
    }

    /**
     * Returns the current active view of the calendar.
     */
    get activeView(): CalendarView {
        return this._activeView;
    }

    /**
     * @hidden
     */
    get monthAction(): string {
        return this._monthAction;
    }

    get headerTemplate(): any {
        if (this.headerTemplateDirective) {
            return this.headerTemplateDirective.template;
        }
        return null;
    }

    set headerTemplate(directive: any) {
        this.headerTemplateDirective = directive;
    }

    get subheaderTemplate(): any {
        if (this.subheaderTemplateDirective) {
            return this.subheaderTemplateDirective.template;
        }
        return null;
    }

    set subheaderTemplate(directive: any) {
        this.subheaderTemplateDirective = directive;
    }

    /**
     * Returns the context for the template marked with the `igxCalendarHeader` directive.
     *
     */
    get headerContext() {
        const date: Date = this.headerDate;
        return this.generateContext(date);
    }

    /**
     * Returns the context for the template marked with either `igxCalendarSubHeaderMonth`
     * or `igxCalendarSubHeaderYear` directive.
     */
    get context() {
        const date: Date = this._viewDate;
        return this.generateContext(date);
    }

    /**
     * @hidden
     */
    get headerDate(): Date {
        return this.selectedDates ? this.selectedDates : new Date();
    }

    /**
     * @hidden
     */
    @ContentChild(forwardRef(() => IgxCalendarHeaderTemplateDirective), { read: IgxCalendarHeaderTemplateDirective })
    private headerTemplateDirective: IgxCalendarHeaderTemplateDirective;

    /**
     * @hidden
     */
    // tslint:disable-next-line:max-line-length
    @ContentChild(forwardRef(() => IgxCalendarSubheaderTemplateDirective), { read: IgxCalendarSubheaderTemplateDirective })
    private subheaderTemplateDirective: IgxCalendarSubheaderTemplateDirective;

    private _viewDate: Date;
    private calendarModel: Calendar;
    private _activeView = CalendarView.DEFAULT;
    private selectedDates;
    private _selection: CalendarSelection | string = CalendarSelection.SINGLE;
    private _rangeStarted = false;
    private _monthAction = "";
    private _formatOptions = {
        day: "numeric",
        month: "short",
        weekday: "short",
        year: "numeric"
    };
    private _formatViews = {
        day: false,
        month: true,
        year: false
    };

    /**
     * @hidden
     */
    constructor() {
        this.calendarModel = new Calendar();
    }

    /**
     * @hidden
     */
    public ngOnInit() {
        const today = new Date();

        this.calendarModel.firstWeekDay = this.weekStart;
        this._viewDate = this._viewDate ? this._viewDate : today;
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
     * Returns the locale representation of the month in the month view if enabled,
     * otherwise returns the default `Date.getMonth()` value.
     *
     * @hidden
     */
    public formattedMonth(value: Date): string {
        if (this._formatViews.month) {
            return value.toLocaleString(this.locale, { month: this._formatOptions.month });
        }
        return `${value.getMonth()}`;
    }

    /**
     * Returns the locale representation of the date in the default view if enabled,
     * otherwise returns the default `Date.getDate()` value.
     *
     * @hidden
     */
    public formattedDate(value: Date): string {
        if (this._formatViews.day) {
            return value.toLocaleString(this.locale, { day: this._formatOptions.day });
        }
        return `${value.getDate()}`;
    }

    /**
     * Returns the locale representation of the year in the year view if enabled,
     * otherwise returns the default `Date.getFullYear()` value.
     *
     * @hidden
     */
    public formattedYear(value: Date): string {
        if (this._formatViews.year) {
            return value.toLocaleString(this.locale, { year: this._formatOptions.year });
        }
        return `${value.getFullYear()}`;
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
    public previousMonth() {
        this._viewDate = this.calendarModel.timedelta(this._viewDate, "month", -1);
        this._monthAction = "prev";
    }

    /**
     * @hidden
     */
    public nextMonth() {
        this._viewDate = this.calendarModel.timedelta(this._viewDate, "month", 1);
        this._monthAction = "next";
    }

    /**
     * @hidden
     */
    public previousYear() {
        this._viewDate = this.calendarModel.timedelta(this._viewDate, "year", -1);
    }

    /**
     * @hidden
     */
    public nextYear() {
        this._viewDate = this.calendarModel.timedelta(this._viewDate, "year", 1);
    }

    /**
     * @hidden
     */
    public getFormattedDate(): { weekday: string, monthday: string } {

        const date = this.headerDate;

        return {
            monthday: date.toLocaleString(
                this.locale, { month: this._formatOptions.month, day: this._formatOptions.day }),
            weekday: date.toLocaleString(this.locale, { weekday: this._formatOptions.weekday })
        };
    }

    /**
     * @hidden
     */
    public childClicked(instance: ICalendarDate) {
        if (instance.isPrevMonth) {
            this.previousMonth();
        }

        if (instance.isNextMonth) {
            this.nextMonth();
        }

        this.selectDate(instance.date);
        this.onSelection.emit(this.selectedDates);
    }

    /**
     * Performs date selection through the API of the calendar component.
     * Does not trigger `onSelection` event.
     */
    public selectDate(value: Date | Date[]) {
        switch (this.selection) {
            case "single":
                this.selectSingle(value as Date);
                break;
            case "multi":
                this.selectMultiple(value);
                break;
            case "range":
                this.selectRange(value);
                break;
        }
    }

    /**
     * @hidden
     */
    public generateWeekHeader(): string[] {
        const dayNames = [];
        const rv = this.calendarModel.monthdatescalendar(this.viewDate.getFullYear(), this.viewDate.getMonth())[0];
        for (const day of rv) {
            dayNames.push(day.date.toLocaleString(this.locale, { weekday: this._formatOptions.weekday }));
        }

        return dayNames;
    }

    /**
     * @hidden
     */
    public get getCalendarMonth(): ICalendarDate[][] {
        return this.calendarModel.monthdatescalendar(this.viewDate.getFullYear(), this.viewDate.getMonth(), true);
    }

    /**
     * @hidden
     */
    public changeYear(event: Date) {
        this._viewDate = new Date(event.getFullYear(), this._viewDate.getMonth(), 1, 0, 0, 0);
        this._activeView = CalendarView.DEFAULT;
    }

    /**
     * @hidden
     */
    public changeMonth(event: Date) {
        this._viewDate = new Date(this._viewDate.getFullYear(), event.getMonth(), 1, 0, 0, 0);
        this._activeView = CalendarView.DEFAULT;
    }

    /**
     * @hidden
     */
    public activeViewYear(): void {
        this._activeView = CalendarView.YEAR;
    }

    /**
     * @hidden
     */
    public activeViewDecade(): void {
        this._activeView = CalendarView.DECADE;
    }

    /**
     * @hidden
     */
    public onScroll(event) {
        event.preventDefault();
        event.stopPropagation();

        const delta = event.deltaY < 0 ? 1 : -1;
        this.generateYearRange(delta);
    }

    /**
     * @hidden
     */
    public onPan(event) {
        const delta = event.deltaY < 0 ? 1 : -1;
        this.generateYearRange(delta);
    }

    /**
     * @hidden
     */
    @HostListener("keydown.pageup", ["$event"])
    public onKeydownPageUp(event: KeyboardEvent) {
        event.preventDefault();
        this.previousMonth();
    }

    /**
     * @hidden
     */
    @HostListener("keydown.pagedown", ["$event"])
    public onKeydownPageDown(event: KeyboardEvent) {
        event.preventDefault();
        this.nextMonth();
    }

    /**
     * @hidden
     */
    @HostListener("keydown.shift.pageup", ["$event"])
    public onKeydownShiftPageUp(event: KeyboardEvent) {
        event.preventDefault();
        this.previousYear();
    }

    /**
     * @hidden
     */
    @HostListener("keydown.shift.pagedown", ["$event"])
    public onKeydownShiftPageDown(event: KeyboardEvent) {
        event.preventDefault();
        this.nextYear();
    }

    /**
     * @hidden
     */
    @HostListener("keydown.arrowup", ["$event"])
    public onKeydownArrowUp(event: KeyboardEvent) {
        event.preventDefault();

        const node = this.dates.find((date) => date.nativeElement === event.target);
        const index = this.dates.toArray().indexOf(node);
        if (node && index > -1 && index - 7 > -1) {
            this.dates.toArray()[index - 7].nativeElement.focus();
        }
    }

    /**
     * @hidden
     */
    @HostListener("keydown.arrowdown", ["$event"])
    public onKeydownArrowDown(event: KeyboardEvent) {
        event.preventDefault();

        const node = this.dates.find((date) => date.nativeElement === event.target);
        const index = this.dates.toArray().indexOf(node);
        if (node && index > -1 && index + 7 < this.dates.length) {
            this.dates.toArray()[index + 7].nativeElement.focus();
        }
    }

    /**
     * @hidden
     */
    @HostListener("keydown.arrowleft", ["$event"])
    public onKeydownArrowLeft(event: KeyboardEvent) {
        event.preventDefault();

        const node = this.dates.find((date) => date.nativeElement === event.target);
        const index = this.dates.toArray().indexOf(node);
        if (node && index > -1 && index > 0) {
            this.dates.toArray()[index - 1].nativeElement.focus();
        }
    }

    /**
     * @hidden
     */
    @HostListener("keydown.arrowright", ["$event"])
    public onKeydownArrowRight(event: KeyboardEvent) {
        event.preventDefault();

        const node = this.dates.find((date) => date.nativeElement === event.target);
        const index = this.dates.toArray().indexOf(node);
        if (node && index > -1 && index < this.dates.length - 1) {
            this.dates.toArray()[index + 1].nativeElement.focus();
        }
    }

    /**
     * @hidden
     */
    @HostListener("keydown.home", ["$event"])
    public onKeydownHome(event: KeyboardEvent) {
        event.preventDefault();

        this.dates
            .filter((date) => date.isCurrentMonth)
            .shift().nativeElement.focus();
    }

    /**
     * @hidden
     */
    @HostListener("keydown.end", ["$event"])
    public onKeydownEnd(event: KeyboardEvent) {
        event.preventDefault();

        this.dates
            .filter((date) => date.isCurrentMonth)
            .pop().nativeElement.focus();
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
    public rowTracker(index, item): string {
        return `${item[index].date.getMonth()}${item[index].date.getDate()}`;
    }

    /**
     * Performs a single selection.
     */
    private selectSingle(value: Date) {
        this.selectedDates = value;
        this._onChangeCallback(this.selectedDates);
    }

    /**
     * Performs a multiple selection
     */
    private selectMultiple(value: Date | Date[]) {
        if (Array.isArray(value)) {
            this.selectedDates = this.selectedDates.concat(value);
        } else {
            if (this.selectedDates.every((date: Date) => date.toDateString() !== value.toDateString())) {
                this.selectedDates.push(value);
            } else {
                this.selectedDates = this.selectedDates.filter(
                    (date: Date) => date.toDateString() !== value.toDateString()
                );
            }
        }

        this._onChangeCallback(this.selectedDates);
    }

    private selectRange(value: Date | Date[]) {
        let start: Date;
        let end: Date;

        if (Array.isArray(value)) {
            this._rangeStarted = false;
            value.sort((a: Date, b: Date) => a.valueOf() - b.valueOf());
            start = value.shift();
            end = value.pop();
            this.selectedDates = [start];

            this.selectedDates = [start, ...this.generateDateRange(start, end)];

        } else {
            if (!this._rangeStarted) {
                this._rangeStarted = true;
                this.selectedDates = [value];
            } else {
                this._rangeStarted = false;

                if (this.selectedDates[0].toDateString() === value.toDateString()) {
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
        this._onChangeCallback(this.selectedDates);
    }

    /**
     * Helper method building and returning the context object inside
     * the calendar templates.
     */
    private generateContext(value: Date) {
        const formatObject = {
            monthView: () => this.activeViewYear(),
            yearView: () => this.activeViewDecade(),
            ...this.calendarModel.formatToParts(value, this.locale, this._formatOptions,
                                                    ["era", "year", "month", "day", "weekday"])
        };
        return { $implicit: formatObject };
    }

    private generateDateRange(start: Date, end: Date): Date[] {
        const result = [];

        while (start.toDateString() !== end.toDateString()) {
            start = this.calendarModel.timedelta(start, "day", 1);
            result.push(start);
        }

        return result;
    }

    private generateYearRange(delta: number) {
        const currentYear = new Date().getFullYear();

        if ((delta > 0 && this._viewDate.getFullYear() - currentYear >= 95) ||
            (delta < 0 && currentYear - this._viewDate.getFullYear() >= 95)) {
            return;
        }
        this._viewDate = this.calendarModel.timedelta(this._viewDate, "year", delta);
    }

    private _onTouchedCallback: () => void = () => { };
    private _onChangeCallback: (_: Date) => void = () => { };
}
