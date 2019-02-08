import { transition, trigger, useAnimation } from '@angular/animations';
import {
    Component,
    ContentChild,
    EventEmitter,
    forwardRef,
    HostBinding,
    HostListener,
    Input,
    Output,
    ViewChild,
    ElementRef
} from '@angular/core';
import { fadeIn, scaleInCenter } from '../animations/main';
import {
    IgxCalendarHeaderTemplateDirective,
    IgxCalendarSubheaderTemplateDirective
} from './calendar.directives';
import { IgxDaysViewComponent, CalendarView } from './days-view/days-view.component';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { IgxYearsViewComponent } from './years-view/years-view.component';
import { IgxMonthsViewComponent } from './months-view/months-view.component';
import { KEYS } from '../core/utils';
import { ICalendarDate } from './calendar';

let NEXT_ID = 0;

/**
 * **Ignite UI for Angular Calendar** -
 * [Documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/calendar.html)
 *
 * The Ignite UI Calendar provides an easy way to display a calendar and allow users to select dates using single, multiple
 * or range selection.
 *
 * Example:
 * ```html
 * <igx-calendar selection="range"></igx-calendar>
 * ```
 */
@Component({
    providers: [
        {
            multi: true,
            provide: NG_VALUE_ACCESSOR,
            useExisting: IgxCalendarComponent
        }
    ],
    animations: [
        trigger('animateView', [
            transition('void => 0', useAnimation(fadeIn)),
            transition('void => *', useAnimation(scaleInCenter, {
                params: {
                    duration: '.2s',
                    fromScale: .9
                }
            }))
        ])
    ],
    selector: 'igx-calendar',
    templateUrl: 'calendar.component.html'
})
export class IgxCalendarComponent extends IgxDaysViewComponent {
    /**
     * Sets/gets the `id` of the calendar.
     * If not set, the `id` will have value `"igx-calendar-0"`.
     * ```html
     * <igx-calendar id = "my-first-calendar"></igx-calendar>
     * ```
     * ```typescript
     * let calendarId =  this.calendar.id;
     * ```
     * @memberof IgxCalendarComponent
     */
    @HostBinding('attr.id')
    @Input()
    public id = `igx-calendar-${NEXT_ID++}`;

    /**
     * Gets whether the `day`, `month` and `year` should be rendered
     * according to the locale and formatOptions, if any.
     * ```typescript
     * let formatViews = this.calendar.formatViews;
     * ```
     */
    @Input()
    public get formatViews(): object {
        return this._formatViews;
    }
    /**
     * Gets whether the `day`, `month` and `year` should be rendered
     * according to the locale and formatOptions, if any.
     * ```html
     * <igx-calendar [formatViews] = "{ day: true, month: false, year: true }"></igx-calendar>
     * ```
     * @memberof IgxCalendarComponent
     */
    public set formatViews(formatViews: object) {
        this._formatViews = Object.assign(this._formatViews, formatViews);
    }

    /**
     * Sets/gets whether the calendar header will be in vertical position.
     * Default value is `false`.
     * ```html
     * <igx-calendar [vertical] = "true"></igx-calendar>
     * ```
     * ```typescript
     * let isVertical = this.calendar.vertical;
     * ```
     */
    @Input()
    public vertical = false;

    /**
     * Emits an event when a selection is made in the calendar.
     * Provides reference the `selectedDates` property in the `IgxCalendarComponent`.
     * ```html
     * <igx-calendar (onSelection) = "onSelection($event)"></igx-calendar>
     * ```
     * @memberof IgxCalendarComponent
     */
    @Output()
    public onSelection = new EventEmitter<Date | Date[]>();

    /**
     * The default `tabindex` attribute for the component.
     *
     * @hidden
     */
    @HostBinding('attr.tabindex')
    public tabindex = 0;

    /**
     * The default aria role attribute for the component.
     *
     * @hidden
     */
    @HostBinding('attr.role')
    public role = 'grid';

    /**
     * The default aria lebelled by attribute for the component.
     *
     * @hidden
     */
    @HostBinding('attr.aria-labelledby')
    public ariaLabelledBy = 'calendar';

    /**
     * The default css class applied to the component.
     *
     * @hidden
     */
    @HostBinding('class')
    get styleClass(): string {
        if (this.vertical) {
            return 'igx-calendar--vertical';
        }
        return 'igx-calendar';
    }

    /**
     * @hidden
     */
    @ViewChild('decade', {read: IgxYearsViewComponent})
    public dacadeView: IgxYearsViewComponent;

    /**
     * @hidden
     */
    @ViewChild('months', {read: IgxMonthsViewComponent})
    public monthsView: IgxMonthsViewComponent;

    /**
     * @hidden
     */
    @ViewChild('days', {read: IgxDaysViewComponent})
    public daysView: IgxDaysViewComponent;

    /**
     * @hidden
     */
    get isDefaultView(): boolean {
        return this._activeView === CalendarView.DEFAULT;
    }

    /**
     * @hidden
     */
    get isYearView(): boolean {
        return this._activeView === CalendarView.YEAR;
    }

    /**
     * @hidden
     */
    get isDecadeView(): boolean {
        return this._activeView === CalendarView.DECADE;
    }

    /**
     * Gets the current active view of the calendar.
     * ```typescript
     * let activeView =  this.calendar.activeView;
     * ```
     */
    get activeView(): CalendarView {
        return this._activeView;
    }
    /**
     * Sets the current active view of the calendar.
     * ```typescript
     * this.calendar.activeView = activeView;
     * ```
     */
    set activeView(val: CalendarView) {
        this._activeView = val;
    }

    /**
     * @hidden
     */
    get monthAction(): string {
        return this._monthAction;
    }
    /**
     * @hidden
     */
    set monthAction(val: string) {
        this._monthAction = val;
    }
    /**
     * Gets the header template.
     * ```typescript
     * let headerTemplate =  this.calendar.headerTeamplate;
     * ```
     * @memberof IgxCalendarComponent
     */
    get headerTemplate(): any {
        if (this.headerTemplateDirective) {
            return this.headerTemplateDirective.template;
        }
        return null;
    }
    /**
     * Sets the header template.
     * ```html
     * <igx-calendar headerTemplateDirective = "igxCalendarHeader"></igx-calendar>
     * ```
     * @memberof IgxCalendarComponent
     */
    set headerTemplate(directive: any) {
        this.headerTemplateDirective = directive;
    }
    /**
     * Gets the subheader template.
     * ```typescript
     * let subheaderTemplate = this.calendar.subheaderTemplate;
     * ```
     */
    get subheaderTemplate(): any {
        if (this.subheaderTemplateDirective) {
            return this.subheaderTemplateDirective.template;
        }
        return null;
    }
    /**
     * Sets the subheader template.
     * ```html
     * <igx-calendar subheaderTemplate = "igxCalendarSubheader"></igx-calendar>
     * ```
     * @memberof IgxCalendarComponent
     */
    set subheaderTemplate(directive: any) {
        this.subheaderTemplateDirective = directive;
    }

    /**
     * Gets the context for the template marked with the `igxCalendarHeader` directive.
     * ```typescript
     * let headerContext =  this.calendar.headerContext;
     * ```
     */
    get headerContext() {
        const date: Date = this.headerDate;
        return this.generateContext(date);
    }

    /**
     * Gets the context for the template marked with either `igxCalendarSubHeaderMonth`
     * or `igxCalendarSubHeaderYear` directive.
     * ```typescript
     * let context =  this.calendar.context;
     * ```
     */
    get context() {
        const date: Date = this.viewDate;
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

    /**
     *@hidden
     */
    private _activeView = CalendarView.DEFAULT;
    /**
     *@hidden
     */
    private _monthAction = '';
    /**
     *@hidden
     */
    private _formatViews = {
        day: false,
        month: true,
        year: false
    };

    /**
     *@hidden
     */
    constructor(public elementRef: ElementRef) {
        super();
    }

    /**
     * Returns the locale representation of the month in the month view if enabled,
     * otherwise returns the default `Date.getMonth()` value.
     *
     * @hidden
     */
    public formattedMonth(value: Date): string {
        if (this._formatViews.month) {
            return this.formatterMonth.format(value);
        }
        return `${value.getMonth()}`;
    }

    /**
     * Returns the locale representation of the year in the year view if enabled,
     * otherwise returns the default `Date.getFullYear()` value.
     *
     * @hidden
     */
    public formattedYear(value: Date): string {
        if (this._formatViews.year) {
            return this.formatterYear.format(value);
        }
        return `${value.getFullYear()}`;
    }

    /**
     * @hidden
     */
    public previousMonth() {
        this.viewDate = this.calendarModel.timedelta(this.viewDate, 'month', -1);
        this._monthAction = 'prev';

        this.daysView.isKeydownTrigger = false;
    }

    /**
     * @hidden
     */
    public previousMonthKB(event) {
        event.preventDefault();

        this.previousMonth();
        this.daysView.isKeydownTrigger = true;
    }

    /**
     * @hidden
     */
    public nextMonth() {
        this.viewDate = this.calendarModel.timedelta(this.viewDate, 'month', 1);
        this._monthAction = 'next';

        this.daysView.isKeydownTrigger = false;
    }

    /**
     * @hidden
     */
    public nextMonthKB(event) {
        event.preventDefault();

        this.nextMonth();
        this.daysView.isKeydownTrigger = true;
    }

    /**
     * @hidden
     */
    public previousYear() {
        this.viewDate = this.calendarModel.timedelta(this.viewDate, 'year', -1);
    }

    /**
     * @hidden
     */
    public nextYear() {
        this.viewDate = this.calendarModel.timedelta(this.viewDate, 'year', 1);
    }

    /**
     * @hidden
     */
    public getFormattedDate(): { weekday: string, monthday: string } {

        const date = this.headerDate;

        return {
            monthday: this.formatterMonthday.format(date),
            weekday: this.formatterWeekday.format(date),
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

        this.selectDateFromClient(instance.date);
        this.onSelection.emit(this.selectedDates);
    }

    /**
     * @hidden
     */
    public viewChanged(event) {
        this.viewDate = this.calendarModel.timedelta(event, 'month', 0);
    }

    /**
     * @hidden
     */
    public changeYear(event: Date) {
        this.viewDate = new Date(event.getFullYear(), this.viewDate.getMonth());
        this._activeView = CalendarView.DEFAULT;

        this.elementRef.nativeElement.focus();
    }

    /**
     * @hidden
     */
    public changeMonth(event: Date) {
        this.viewDate = new Date(this.viewDate.getFullYear(), event.getMonth());
        this._activeView = CalendarView.DEFAULT;

        this.elementRef.nativeElement.focus();
    }

    /**
     * @hidden
     */
    public activeViewYear(): void {
        this._activeView = CalendarView.YEAR;
        requestAnimationFrame(() => {
            this.monthsView.el.nativeElement.focus();
        });
    }

    /**
     * @hidden
     */
    public activeViewYearKB(event): void {
        if (event.key === KEYS.SPACE || event.key === KEYS.SPACE_IE || event.key === KEYS.ENTER) {
            event.preventDefault();
            this.activeViewYear();
        }
    }

    /**
     * @hidden
     */
    public activeViewDecade(): void {
        this._activeView = CalendarView.DECADE;
        requestAnimationFrame(() => {
            this.dacadeView.el.nativeElement.focus();
        });
    }

    /**
     * @hidden
     */
    public activeViewDecadeKB(event) {
        if (event.key === KEYS.SPACE || event.key === KEYS.SPACE_IE || event.key === KEYS.ENTER) {
            event.preventDefault();
            this.activeViewDecade();
        }
    }

    /**
     * @hidden
     */
    @HostListener('keydown.pageup', ['$event'])
    public onKeydownPageUp(event: KeyboardEvent) {
        event.preventDefault();
        this.previousMonth();

        this.daysView.isKeydownTrigger = true;
    }

    /**
     * @hidden
     */
    @HostListener('keydown.pagedown', ['$event'])
    public onKeydownPageDown(event: KeyboardEvent) {
        event.preventDefault();
        this.nextMonth();

        this.daysView.isKeydownTrigger = true;
    }

    /**
     * @hidden
     */
    @HostListener('keydown.shift.pageup', ['$event'])
    public onKeydownShiftPageUp(event: KeyboardEvent) {
        event.preventDefault();
        this.previousYear();

        this.daysView.isKeydownTrigger = true;
    }

    /**
     * @hidden
     */
    @HostListener('keydown.shift.pagedown', ['$event'])
    public onKeydownShiftPageDown(event: KeyboardEvent) {
        event.preventDefault();
        this.nextYear();

        this.daysView.isKeydownTrigger = true;
    }

    /**
     * @hidden
     */
    @HostListener('keydown.home', ['$event'])
    public onKeydownHome(event: KeyboardEvent) {
        this.daysView.onKeydownHome(event);
    }

    /**
     * @hidden
     */
    @HostListener('keydown.end', ['$event'])
    public onKeydownEnd(event: KeyboardEvent) {
        this.daysView.onKeydownEnd(event);
    }

    /**
     * Helper method building and returning the context object inside
     * the calendar templates.
     * @hidden
     */
    private generateContext(value: Date) {
        const formatObject = {
            monthView: () => this.activeViewYear(),
            yearView: () => this.activeViewDecade(),
            ...this.calendarModel.formatToParts(value, this.locale, this._formatOptions,
                ['era', 'year', 'month', 'day', 'weekday'])
        };
        return { $implicit: formatObject };
    }
}
