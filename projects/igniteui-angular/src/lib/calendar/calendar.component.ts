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
import { fadeIn, scaleInCenter, slideInLeft, slideInRight } from '../animations/main';
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
import { IViewChangingEventArgs } from './days-view/days-view.interface';

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
        ]),
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
        if (this._monthsViewNumber === val || val <= 0) {
            return;
        } else if (this._monthsViewNumber < val) {
            for (let i = this._monthsViewNumber; i < val; i++) {
                const nextMonthDate = new Date(this.viewDate);
                nextMonthDate.setMonth(nextMonthDate.getMonth() + i);
                const monthView = {
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
     * @hidden
     */
    @Input()
    public animationAction: any = '';

    /**
     * @hidden
     */
    public nextDate: Date;

    /**
     * @hidden
     */
    public isKeydownTrigger = false;

    /**
     * @hidden
     */
    public callback: (next) => void;

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
    private _monthsViewNumber = 1;

    /**
     *@hidden
     */
    private _monthViewsChanges$: Subscription;

    /**
     *@hidden
     */
    private defaultDayView = {
        value: this.value,
        viewDate: this.viewDate
    };

    /**
     *@hidden
     */
    public dayViews = [this.defaultDayView];

    public ngAfterViewInit() {
        this.setSiblingMonths(this.monthViews);
        this._monthViewsChanges$ = this.monthViews.changes.subscribe(c => {
            this.setSiblingMonths(c);
        });

        this.startMonthScroll$.pipe(
            takeUntil(this.stopMonthScroll$),
            switchMap(() => this.scrollMonth$.pipe(
                skipLast(1),
                debounce(() => interval(300)),
                takeUntil(this.stopMonthScroll$)
            ))).subscribe(() => {
                switch (this.monthScrollDirection) {
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
        this.animationAction = ScrollMonth.PREV;
        this.isKeydownTrigger = isKeydownTrigger;
    }

    /**
     * @hidden
     */
    public nextMonth(isKeydownTrigger = false) {
        this.viewDate = this.calendarModel.timedelta(this.viewDate, 'month', 1);
        this.animationAction = ScrollMonth.NEXT;
        this.isKeydownTrigger = isKeydownTrigger;
    }

    /**
     * @hidden
     */
    public startPrevMonthScroll = (isKeydownTrigger = false) => {
        this.startMonthScroll$.next();
        this.monthScrollDirection = ScrollMonth.PREV;

        this.previousMonth(isKeydownTrigger);
    }

    /**
     * @hidden
     */
    public startNextMonthScroll = (isKeydownTrigger = false) => {
        this.startMonthScroll$.next();
        this.monthScrollDirection = ScrollMonth.NEXT;

        this.nextMonth(isKeydownTrigger);
    }

    /**
     * @hidden
     */
    public stopMonthScroll = (event) => {
        event.stopPropagation();

        // generally the scrolling is built on the calendar component
        // and all start/stop scrolling methods are called on the calendar
        // if we change below lines to call stopMonthScrol$ on the calendar instead of on the veiws,
        // strange bug is introduced --> after changing number of months, continuous scrolling on mouse click does not happen
        this.daysView.stopMonthScroll$.next(true);
        this.daysView.stopMonthScroll$.complete();


        if (this.monthScrollDirection === ScrollMonth.PREV) {
            this.prevMonthBtn.nativeElement.focus();
        } else if (this.monthScrollDirection === ScrollMonth.NEXT) {
            this.nextMonthBtn.nativeElement.focus();
        }

        this.monthScrollDirection = ScrollMonth.NONE;
    }

    /**
     * @hidden
     */
    public activeViewDecade(args: Date) {
        super.activeViewDecade();
        requestAnimationFrame(() => {
            if (this.dacadeView) {
                this.dacadeView.date = args;
                this.dacadeView.el.nativeElement.focus();
            }
        });
    }

    /**
     * @hidden
     */
    public activeViewDecadeKB(event, args: Date) {
        super.activeViewDecadeKB(event, args);

        requestAnimationFrame(() => {
            if (this.dacadeView) {
                this.dacadeView.date = args;
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
        if (this.selection === 'multi') {
            this.deselectDateInMonthViews(instance.date);
        }
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
    public viewChanging(args: IViewChangingEventArgs) {
        this.animationAction = args.monthAction;
        this.isKeydownTrigger = true;
        this.nextDate = args.nextDate;
        this.callback = (next) => {
            const day = this.daysView.dates.find((item) => item.date.date.getTime() === next.getTime());
            if (day) {
                this.daysView.navService.focusNextDate(day.nativeElement, args.key, this.daysView, true);
            }
        };
        this.viewDate = this.calendarModel.timedelta(this.nextDate, 'month', 0);
    }

    /**
     * @hidden
     */
    public changeMonth(event: Date) {
        this.viewDate = new Date(this.viewDate.getFullYear(), event.getMonth());
        this.activeView = CalendarView.DEFAULT;

        requestAnimationFrame(() => {
            if (this.monthsBtn) { this.monthsBtn.nativeElement.focus(); }
        });
    }

    /**
     * @hidden
     */
    public activeViewYear(args: Date, event): void {
        this.activeView = CalendarView.YEAR;
        requestAnimationFrame(() => {
            this.monthsView.date = args;
            this.focusMonth(event.target);
        });
    }

    private focusMonth(target: HTMLElement) {
        const month = this.monthsView.dates.find((date) =>
            date.index === parseInt(target.parentElement.attributes['data-month'].value, 10));
        if (month) { month.nativeElement.focus(); }
    }

    /**
     * @hidden
     */
    public activeViewYearKB(args: Date, event): void {
        if (event.key === KEYS.SPACE || event.key === KEYS.SPACE_IE || event.key === KEYS.ENTER) {
            event.preventDefault();
            this.activeViewYear(args, event);
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

        this.monthViews.forEach((view) => {
            view.selectedDates = this.selectedDates;
            view.rangeStarted = false;
        });
        this._onChangeCallback(this.selectedDates);
    }

    /**
     * Helper method that does deselection for all month views when selection is "multi"
     * If not called, selection in other month views stays
     * @hidden
     */
    private deselectDateInMonthViews(value: Date) {
        this.monthViews.forEach(m => {
            this.deselectMultipleInMonth(m, value);
         });
    }

    /**
     * @hidden
     */
    private deselectMultipleInMonth(monthView: IgxDaysViewComponent, value: Date) {
        const mDates = monthView.selectedDates.map(v => this.getDateOnly(v).getTime());
        const selDates = this.selectedDates.map(v => this.getDateOnly(v).getTime());

        if (JSON.stringify(mDates) === JSON.stringify(selDates)) {
            return;
        }
        const valueDateOnly = this.getDateOnly(value);
        monthView.selectedDates = monthView.selectedDates.filter(
            (date: Date) => date.getTime() !== valueDateOnly.getTime()
        );
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
    public getMonth(i: number): number {
        const date = this.calendarModel.timedelta(this.viewDate, 'month', i);
        return date.getMonth();
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
    public animationDone(event) {
        if (this.monthScrollDirection !== ScrollMonth.NONE) {
            this.scrollMonth$.next();
        }

        if (this.activeView !== CalendarView.DEFAULT) {
            return;
        }

        let monthView = this.daysView as IgxDaysViewComponent;
        let date = monthView.dates.find((d) => d.selected);

        while (!date && monthView.nextMonthView) {
            monthView = monthView.nextMonthView;
            date = monthView.dates.find((d) => d.selected);
        }
        if (date && date.isFocusable && !this.isKeydownTrigger) {
            setTimeout(() => {
                date.nativeElement.focus();
            }, parseInt(slideInRight.options.params.duration, 10));
        } else if (this.callback && (event.toState === ScrollMonth.NEXT || event.toState === ScrollMonth.PREV)) {
            this.callback(this.nextDate);
        }
        this.animationAction = ScrollMonth.NONE;
    }

    /**
     * @hidden
     */
    @HostListener('keydown.pagedown', ['$event'])
    @HostListener('keydown.pageup', ['$event'])
    public onKeydownPageDown(event: KeyboardEvent) {
        event.preventDefault();

        if (this.activeView !== CalendarView.DEFAULT) {
            return;
        }

        const isPageDown = event.key === 'PageDown';
        const step = isPageDown ? 1 : -1;
        let monthView = this.daysView as IgxDaysViewComponent;
        let activeDate;

        while (!activeDate && monthView) {
            activeDate = monthView.dates.find((date) => date.nativeElement === document.activeElement);
            monthView = monthView.nextMonthView;
        }

        if (activeDate) {
            this.nextDate = new Date(activeDate.date.date);

            let year = this.nextDate.getFullYear();

            let month = this.nextDate.getMonth() + step;
            if (isPageDown) {
                if (month > 11) { month = 0; year += step; }
            } else {
                if (month < 0) { month = 11; year += step; }
            }

            const range = monthRange(this.nextDate.getFullYear(), month);

            let day = this.nextDate.getDate();
            if (day > range[1]) { day = range[1]; }

            this.nextDate.setDate(day);
            this.nextDate.setMonth(month);
            this.nextDate.setFullYear(year);

            this.callback = (next) => {
                monthView = this.daysView as IgxDaysViewComponent;
                let dayItem;
                while (!dayItem && monthView) {
                    dayItem = monthView.dates.find((d) => d.date.date.getTime() === next.getTime());
                    monthView = monthView.nextMonthView;
                }
                if (dayItem && dayItem.isFocusable) { dayItem.nativeElement.focus(); }
            };
        }

        if (isPageDown) { this.nextMonth(true); } else {
            this.previousMonth(true);
        }
    }

    /**
     * @hidden
     */
    @HostListener('keydown.shift.pageup', ['$event'])
    @HostListener('keydown.shift.pagedown', ['$event'])
    public onKeydownShiftPageUp(event: KeyboardEvent) {
        event.preventDefault();

        if (this.activeView !== CalendarView.DEFAULT) {
            return;
        }

        const isPageDown = event.key === 'Shift.PageDown';
        const step = isPageDown ? 1 : -1;
        this.viewDate = this.calendarModel.timedelta(this.viewDate, 'year', step);

        this.animationAction = isPageDown ? ScrollMonth.NEXT : ScrollMonth.PREV;
        this.isKeydownTrigger = true;

        let monthView = this.daysView as IgxDaysViewComponent;
        let activeDate;

        while (!activeDate && monthView) {
            activeDate = monthView.dates.find((date) => date.nativeElement === document.activeElement);
            monthView = monthView.nextMonthView;
        }

        if (activeDate) {
            this.nextDate = new Date(activeDate.date.date);

            const year = this.nextDate.getFullYear() + step;

            const range = monthRange(year, this.nextDate.getMonth());

            let day = this.nextDate.getDate();
            if (day > range[1]) { day = range[1]; }

            this.nextDate.setDate(day);
            this.nextDate.setFullYear(year);

            this.callback = (next) => {
                monthView = this.daysView as IgxDaysViewComponent;
                let dayItem;
                while (!dayItem && monthView) {
                    dayItem = monthView.dates.find((d) => d.date.date.getTime() === next.getTime());
                    monthView = monthView.nextMonthView;
                }
                if (dayItem && dayItem.isFocusable) { dayItem.nativeElement.focus(); }
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
        if (this.monthScrollDirection !== ScrollMonth.NONE) {
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
            monthView: () => this.activeViewYear(value, event),
            yearView: () => this.activeViewDecade(value),
            ...this.calendarModel.formatToParts(value, this.locale, this.formatOptions,
                ['era', 'year', 'month', 'day', 'weekday'])
        };
        return { $implicit: formatObject };
    }

    /**
     * Helper method that sets references for prev/next months for each month in the view
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
