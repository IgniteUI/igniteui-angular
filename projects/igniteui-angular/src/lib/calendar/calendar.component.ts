import { transition, trigger, useAnimation } from '@angular/animations';
import {
    Component,
    ContentChild,
    forwardRef,
    HostBinding,
    HostListener,
    Input,
    ViewChild,
    ElementRef,
    AfterViewInit,
    ViewChildren,
    QueryList,
    OnDestroy
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { fadeIn, scaleInCenter } from '../animations/main';
import {
    IgxCalendarHeaderTemplateDirective,
    IgxCalendarSubheaderTemplateDirective
} from './calendar.directives';
import { KEYS } from '../core/utils';
import { ICalendarDate, monthRange } from './calendar';
import { CalendarView, IgxMonthPickerBase } from './month-picker-base';
import { IgxMonthsViewComponent } from './months-view/months-view.component';
import { IgxYearsViewComponent } from './years-view/years-view.component';
import { IgxDaysViewComponent } from './days-view/days-view.component';
import { interval, Subscription } from 'rxjs';
import { takeUntil, debounce, skipLast, switchMap } from 'rxjs/operators';
import { ScrollMonth } from './calendar-base';
import { IMonthView, IViewChangedArgs } from './calendar.interface';

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
export class IgxCalendarComponent extends IgxMonthPickerBase implements AfterViewInit, OnDestroy {
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

    @Input()
    public hasHeader = true;

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
     * Sets/gets the number of month views displayed.
     * Default value is `1`.
     * ```html
     * <igx-calendar [vertical] = "true" [monthsViewNumber]="2"></igx-calendar>
     * ```
     * ```typescript
     * let monthViewsDisplayed = this.calendar.monthsViewNumber;
     * ```
     */
    @Input()
    get monthsViewNumber() {
        return this._monthsViewNumber;
    }

    set monthsViewNumber(val: number) {
        if (this._monthsViewNumber === val || val === 0) {
            return;
        } else if (this._monthsViewNumber < val) {
            for (let i = this._monthsViewNumber; i < val; i++) {
                const nextMonthDate = new Date(this.viewDate);
                nextMonthDate.setMonth(nextMonthDate.getMonth() + i);
                const monthView: IMonthView = {
                    value: null,
                    viewDate: nextMonthDate
                };
                this.dayViews.push(monthView);
            }
            this._monthsViewNumber = val;
        } else {
            this.dayViews.splice(val, this.dayViews.length - val);
            this._monthsViewNumber = val;
        }
    }

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
    @HostBinding('class.igx-calendar--vertical')
    get styleVerticalClass(): boolean {
        return this.vertical;
    }

    /**
     * The default css class applied to the component.
     *
     * @hidden
     */
    @HostBinding('class.igx-calendar')
    public styleClass = true;

    /**
     * @hidden
     */
    @ViewChild('months', { read: IgxMonthsViewComponent, static: false })
    public monthsView: IgxMonthsViewComponent;

    /**
     * @hidden
     */
    @ViewChild('monthsBtn', { static: false })
    public monthsBtn: ElementRef;

    /**
     * @hidden
     */
    @ViewChild('decade', { read: IgxYearsViewComponent, static: false })
    public dacadeView: IgxYearsViewComponent;

    /**
     * @hidden
     */
    @ViewChild('days', { read: IgxDaysViewComponent, static: false })
    public daysView: IgxDaysViewComponent;

    /**
     * @hidden
     */
    @ViewChildren('days', { read: IgxDaysViewComponent })
    public monthViews: QueryList<IgxDaysViewComponent>;

    /**
     * @hidden
     */
    @ViewChild('prevMonthBtn', { static: false })
    public prevMonthBtn: ElementRef;

    /**
     * @hidden
     */
    @ViewChild('nextMonthBtn', { static: false })
    public nextMonthBtn: ElementRef;

    /**
     * @hidden
     */
    get isYearView(): boolean {
        return this.activeView === CalendarView.YEAR;
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
    @ContentChild(forwardRef(() => IgxCalendarHeaderTemplateDirective), { read: IgxCalendarHeaderTemplateDirective, static: true  })
    private headerTemplateDirective: IgxCalendarHeaderTemplateDirective;

    /**
     * @hidden
     */
    // tslint:disable-next-line:max-line-length
    @ContentChild(forwardRef(() => IgxCalendarSubheaderTemplateDirective), { read: IgxCalendarSubheaderTemplateDirective, static: true  })
    private subheaderTemplateDirective: IgxCalendarSubheaderTemplateDirective;

    /**
     *@hidden
     */
    private _monthAction = '';

    /**
     *@hidden
     */
    private _monthsViewNumber = 1;

    /**
     *@hidden
     */
    private _monthViewsChanges$: Subscription;

    /**
     *@hidden
     */
    private defaultDayView: IMonthView = {
        value: this.value,
        viewDate: this.viewDate,
    };

    /**
     *@hidden
     */
    public dayViews: Array<IMonthView> = [this.defaultDayView];

    public ngAfterViewInit() {
        this.setSiblingMonths(this.monthViews);
        this._monthViewsChanges$ = this.monthViews.changes.subscribe(c => {
            this.setSiblingMonths(c);
        });

        this.startMonthScroll$.pipe(
            takeUntil(this.stopMonthScroll$),
            switchMap(() => this.daysView.scrollMonth$.pipe(
                skipLast(1),
                debounce(() => interval(300)),
                takeUntil(this.stopMonthScroll$)
            ))).subscribe(() => {
                switch (this.daysView.monthScrollDirection) {
                    case ScrollMonth.PREV:
                        this.previousMonth();
                        break;
                    case ScrollMonth.NEXT:
                        this.nextMonth();
                        break;
                    case ScrollMonth.NONE:
                    default:
                        break;
                }
        });
    }

    /**
     * Returns the locale representation of the month in the month view if enabled,
     * otherwise returns the default `Date.getMonth()` value.
     *
     * @hidden
     */
    public formattedMonth(value: Date): string {
        if (this.formatViews.month) {
            return this.formatterMonth.format(value);
        }
        return `${value.getMonth()}`;
    }

    /**
     * @hidden
     */
    public previousMonth(isKeydownTrigger = false) {
        this.viewDate = this.calendarModel.timedelta(this.viewDate, 'month', -1);
        this._monthAction = 'prev';

        if (this.daysView) {
            this.daysView.isKeydownTrigger = isKeydownTrigger;
        }
    }

    /**
     * @hidden
     */
    public nextMonth(isKeydownTrigger = false) {
        this.viewDate = this.calendarModel.timedelta(this.viewDate, 'month', 1);
        this._monthAction = 'next';

        if (this.daysView) {
            this.daysView.isKeydownTrigger = isKeydownTrigger;
        }
    }

    /**
     * @hidden
     */
    public startPrevMonthScroll = (isKeydownTrigger = false) => {
        this.startMonthScroll$.next();
        this.daysView.monthScrollDirection = ScrollMonth.PREV;

        this.previousMonth(isKeydownTrigger);
    }

    /**
     * @hidden
     */
    public startNextMonthScroll = (isKeydownTrigger = false) => {
        this.startMonthScroll$.next();
        this.daysView.monthScrollDirection = ScrollMonth.NEXT;

        this.nextMonth(isKeydownTrigger);
    }

    /**
     * @hidden
     */
    public stopMonthScroll = (event) => {
        event.stopPropagation();

        this.daysView.stopMonthScroll$.next(true);
        this.daysView.stopMonthScroll$.complete();


        if (this.daysView.monthScrollDirection === ScrollMonth.PREV) {
            this.prevMonthBtn.nativeElement.focus();
        } else if (this.daysView.monthScrollDirection === ScrollMonth.NEXT) {
            this.nextMonthBtn.nativeElement.focus();
        }

        this.daysView.monthScrollDirection = ScrollMonth.NONE;
    }

    /**
     * @hidden
     */
    public activeViewDecade() {
        super.activeViewDecade();

        requestAnimationFrame(() => {
            if (this.dacadeView) {
                this.dacadeView.el.nativeElement.focus();
            }
        });
    }

    /**
     * @hidden
     */
    public activeViewDecadeKB(event) {
        super.activeViewDecadeKB(event);

        requestAnimationFrame(() => {
            if (this.dacadeView) {
                this.dacadeView.el.nativeElement.focus();
            }
        });
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
    public viewChanged(event: IViewChangedArgs) {
        let date = this.viewDate,
            delta = event.delta;
        if (event.moveToFirst) {
            delta = 0;
            date = event.date;
        }
        this.viewDate = this.calendarModel.timedelta(date, 'month', delta);
    }

    /**
     * @hidden
     */
    public changeMonth(event: Date) {
        this.viewDate = new Date(this.viewDate.getFullYear(), event.getMonth());
        this.activeView = CalendarView.DEFAULT;

        requestAnimationFrame(() => {
            this.monthsBtn.nativeElement.focus();
        });
    }

    /**
     * @hidden
     */
    public activeViewYear(): void {
        this.activeView = CalendarView.YEAR;
        requestAnimationFrame(() => {
            this.monthsView.dates.find((date) => date.isCurrentMonth).nativeElement.focus();
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
     * Deselects date(s) (based on the selection type).
     *```typescript
     * this.calendar.deselectDate(new Date(`2018-06-12`));
     *````
     */
    public deselectDate(value?: Date | Date[]) {
        super.deselectDate(value);

        this.daysView.selectedDates = this.selectedDates;
        this._onChangeCallback(this.selectedDates);
    }

    /**
     * @hidden
     */
    public getViewDate(i: number): Date {
        const date = this.calendarModel.timedelta(this.viewDate, 'month', i);
        return date;
    }

    /**
     * @hidden
     */
    public getContext(i: number) {
        const date = this.calendarModel.timedelta(this.viewDate, 'month', i);
        return this.generateContext(date, i);
    }

    /**
     * @hidden
     */
    @HostListener('keydown.pageup', ['$event'])
    public onKeydownPageUp(event: KeyboardEvent) {
        event.preventDefault();

        const activeDate = this.daysView.dates.find((date) => date.nativeElement === document.activeElement);
        if (activeDate) {
            this.daysView.nextDate = new Date(activeDate.date.date);

            let year = this.daysView.nextDate.getFullYear();

            let month = this.daysView.nextDate.getMonth() - 1;
            if (month < 0) { month = 11; year -= 1; }

            const range = monthRange(this.daysView.nextDate.getFullYear(), month);

            let day = this.daysView.nextDate.getDate();
            if (day > range[1]) { day = range[1]; }

            this.daysView.nextDate.setDate(day);
            this.daysView.nextDate.setMonth(month);
            this.daysView.nextDate.setFullYear(year);

            this.daysView.callback = (dates?, next?) => {
                const dayItem = dates.find((d) => d.date.date.getTime() === next.getTime());
                if (dayItem) { dayItem.nativeElement.focus(); }
            };
        }

        this.previousMonth(true);
    }

    /**
     * @hidden
     */
    @HostListener('keydown.pagedown', ['$event'])
    public onKeydownPageDown(event: KeyboardEvent) {
        event.preventDefault();

        this.nextMonth(true);

        const activeDate = this.daysView.dates.find((date) => date.nativeElement === document.activeElement);
        if (activeDate) {
            this.daysView.nextDate = new Date(activeDate.date.date);

            let year = this.daysView.nextDate.getFullYear();

            let month = this.daysView.nextDate.getMonth() + 1;
            if (month > 11) { month = 0; year += 1; }

            const range = monthRange(this.daysView.nextDate.getFullYear(), month);

            let day = this.daysView.nextDate.getDate();
            if (day > range[1]) { day = range[1]; }

            this.daysView.nextDate.setDate(day);
            this.daysView.nextDate.setMonth(month);
            this.daysView.nextDate.setFullYear(year);

            this.daysView.callback = (dates?, next?) => {
                const dayItem = dates.find((d) => d.date.date.getTime() === next.getTime());
                if (dayItem) { dayItem.nativeElement.focus(); }
            };
        }
    }

    /**
     * @hidden
     */
    @HostListener('keydown.shift.pageup', ['$event'])
    public onKeydownShiftPageUp(event: KeyboardEvent) {
        event.preventDefault();
        this.viewDate = this.calendarModel.timedelta(this.viewDate, 'year', -1);

        this.daysView.animationAction = 'prev';
        this.daysView.isKeydownTrigger = true;

        const activeDate = this.daysView.dates.find((date) => date.nativeElement === document.activeElement);
        if (activeDate) {
            this.daysView.nextDate = new Date(activeDate.date.date);

            const year = this.daysView.nextDate.getFullYear() - 1;

            const range = monthRange(year, this.daysView.nextDate.getMonth());

            let day = this.daysView.nextDate.getDate();
            if (day > range[1]) { day = range[1]; }

            this.daysView.nextDate.setDate(day);
            this.daysView.nextDate.setFullYear(year);

            this.daysView.callback = (dates?, next?) => {
                const dayItem = dates.find((d) => d.date.date.getTime() === next.getTime());
                if (dayItem) { dayItem.nativeElement.focus(); }
            };
        }
    }

    /**
     * @hidden
     */
    @HostListener('keydown.shift.pagedown', ['$event'])
    public onKeydownShiftPageDown(event: KeyboardEvent) {
        event.preventDefault();
        this.viewDate = this.calendarModel.timedelta(this.viewDate, 'year', 1);

        this.daysView.animationAction = 'next';
        this.daysView.isKeydownTrigger = true;

        const activeDate = this.daysView.dates.find((date) => date.nativeElement === document.activeElement);
        if (activeDate) {
            this.daysView.nextDate = new Date(activeDate.date.date);

            const year = this.daysView.nextDate.getFullYear() + 1;

            const range = monthRange(year, this.daysView.nextDate.getMonth());

            let day = this.daysView.nextDate.getDate();
            if (day > range[1]) { day = range[1]; }

            this.daysView.nextDate.setDate(day);
            this.daysView.nextDate.setFullYear(year);

            this.daysView.callback = (dates?, next?) => {
                const dayItem = dates.find((d) => d.date.date.getTime() === next.getTime());
                if (dayItem) { dayItem.nativeElement.focus(); }
            };
        }
    }

    /**
     * @hidden
     */
    @HostListener('keydown.home', ['$event'])
    public onKeydownHome(event: KeyboardEvent) {
        if (this.daysView) {
            this.daysView.onKeydownHome(event);
        }
    }

    /**
     * @hidden
     */
    @HostListener('keydown.end', ['$event'])
    public onKeydownEnd(event: KeyboardEvent) {
        if (this.daysView) {
            this.daysView.onKeydownEnd(event);
        }
    }

    /**
     * @hidden
     */
    @HostListener('document:mouseup', ['$event'])
    public onMouseUp(event: KeyboardEvent) {
        if (this.daysView && this.daysView.monthScrollDirection !== ScrollMonth.NONE) {
            this.stopMonthScroll(event);
        }
    }

    /**
     * @hidden
     */
    public ngOnDestroy(): void {
        if (this._monthViewsChanges$) {
            this._monthViewsChanges$.unsubscribe();
        }
    }

    /**
     * Helper method building and returning the context object inside
     * the calendar templates.
     * @hidden
     */
    private generateContext(value: Date, i?: number) {
        const formatObject = {
            index: i,
            monthView: () => this.activeViewYear(),
            yearView: () => this.activeViewDecade(),
            ...this.calendarModel.formatToParts(value, this.locale, this.formatOptions,
                ['era', 'year', 'month', 'day', 'weekday'])
        };
        return { $implicit: formatObject };
    }


    /**
     * Helper method sthat sets references for prev/next months for each month in the view
     * @hidden
     */
    private setSiblingMonths(monthViews: QueryList<IgxDaysViewComponent>) {
        monthViews.forEach((item, index) => {
            const prevMonthView = this.getMonthView(index - 1);
            const nextMonthView = this.getMonthView(index + 1);
            item.nextMonthView = nextMonthView;
            item.prevMonthView = prevMonthView;
        });
    }

    /**
     * Helper method returning previous/next day views
     * @hidden
     */
    private getMonthView(index: number): IgxDaysViewComponent {
        if (index === -1 || index === this.monthViews.length ) {
            return null;
        } else {
            return this.monthViews.toArray()[index];
        }
    }
}
