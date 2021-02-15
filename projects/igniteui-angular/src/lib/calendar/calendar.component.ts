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
import { CalendarView, IgxCalendarView, IgxMonthPickerBaseDirective } from './month-picker-base';
import { IgxMonthsViewComponent } from './months-view/months-view.component';
import { IgxYearsViewComponent } from './years-view/years-view.component';
import { IgxDaysViewComponent } from './days-view/days-view.component';
import { interval, Subscription } from 'rxjs';
import { takeUntil, debounce, skipLast, switchMap } from 'rxjs/operators';
import { ScrollMonth } from './calendar-base';
import { IViewChangingEventArgs } from './days-view/days-view.interface';

let NEXT_ID = 0;

/**
 * Calendar provides a way to display date information.
 *
 * @igxModule IgxCalendarModule
 *
 * @igxTheme igx-calendar-theme, igx-icon-theme
 *
 * @igxKeywords calendar, datepicker, schedule, date
 *
 * @igxGroup Scheduling
 *
 * @remarks
 * The Ignite UI Calendar provides an easy way to display a calendar and allow users to select dates using single, multiple
 * or range selection.
 *
 * @example:
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
export class IgxCalendarComponent extends IgxMonthPickerBaseDirective implements AfterViewInit, OnDestroy {
    /**
     * Sets/gets the `id` of the calendar.
     *
     * @remarks
     * If not set, the `id` will have value `"igx-calendar-0"`.
     *
     * @example
     * ```html
     * <igx-calendar id="my-first-calendar"></igx-calendar>
     * ```
     * @memberof IgxCalendarComponent
     */
    @HostBinding('attr.id')
    @Input()
    public id = `igx-calendar-${NEXT_ID++}`;

    /**
     * Sets/gets whether the calendar has header.
     * Default value is `true`.
     *
     * @example
     * ```html
     * <igx-calendar [hasHeader]="false"></igx-calendar>
     * ```
     */
    @Input()
    public hasHeader = true;

    /**
     * Sets/gets whether the calendar header will be in vertical position.
     * Default value is `false`.
     *
     * @example
     * ```html
     * <igx-calendar [vertical] = "true"></igx-calendar>
     * ```
     */
    @Input()
    public vertical = false;

    /**
     * Sets/gets the number of month views displayed.
     * Default value is `1`.
     *
     * @example
     * ```html
     * <igx-calendar [monthsViewNumber]="2"></igx-calendar>
     * ```
     */
    @Input()
    public get monthsViewNumber() {
        return this._monthsViewNumber;
    }

    public set monthsViewNumber(val: number) {
        if (val < 1 ) {
            return;
        }

        this._monthsViewNumber = val;
    }

    /**
     * Show/hide week numbers
     *
     * @example
     * ```html
     * <igx-calendar [showWeekNumbers]="true"></igx-calendar>
     * ``
     */
    @Input()
    public showWeekNumbers = false;

    /**
     * Apply the different states for the transitions of animateChange
     *
     * @hidden
     * @internal
     */
    @Input()
    public animationAction: any = '';

    /**
     * The default css class applied to the component.
     *
     * @hidden
     * @internal
     */
    @HostBinding('class.igx-calendar--vertical')
    public get styleVerticalClass(): boolean {
        return this.vertical;
    }

    /**
     * The default css class applied to the component.
     *
     * @hidden
     * @internal
     */
    @HostBinding('class.igx-calendar')
    public styleClass = true;

    /**
     * ViewChild that represents the months view.
     *
     * @hidden
     * @internal
     */
    @ViewChild('months', { read: IgxMonthsViewComponent })
    public monthsView: IgxMonthsViewComponent;

    /**
     * Month button, that displays the months view.
     *
     * @hidden
     * @internal
     */
    @ViewChildren('monthsBtn')
    public monthsBtns: QueryList<ElementRef>;

    /**
     * ViewChild that represents the decade view.
     *
     * @hidden
     * @internal
     */
    @ViewChild('decade', { read: IgxYearsViewComponent })
    public dacadeView: IgxYearsViewComponent;

    /**
     * ViewChild that represents the days view.
     *
     * @hidden
     * @internal
     */
    @ViewChild('days', { read: IgxDaysViewComponent })
    public daysView: IgxDaysViewComponent;

    /**
     * ViewChildrenden representing all of the rendered days views.
     *
     * @hidden
     * @internal
     */
    @ViewChildren('days', { read: IgxDaysViewComponent })
    public monthViews: QueryList<IgxDaysViewComponent>;

    /**
     * Button for previous month.
     *
     * @hidden
     * @internal
     */
    @ViewChild('prevMonthBtn')
    public prevMonthBtn: ElementRef;

    /**
     * Button for next month.
     *
     * @hidden
     * @internal
     */
    @ViewChild('nextMonthBtn')
    public nextMonthBtn: ElementRef;

    /**
     * Denote if the year view is active.
     *
     * @hidden
     * @internal
     */
    public get isYearView(): boolean {
        return this.activeView === CalendarView.YEAR || this.activeView === IgxCalendarView.Year;
    }

    /**
     * Gets the header template.
     *
     * @example
     * ```typescript
     * let headerTemplate =  this.calendar.headerTeamplate;
     * ```
     * @memberof IgxCalendarComponent
     */
    public get headerTemplate(): any {
        if (this.headerTemplateDirective) {
            return this.headerTemplateDirective.template;
        }
        return null;
    }

    /**
     * Sets the header template.
     *
     * @example
     * ```html
     * <igx-calendar headerTemplateDirective = "igxCalendarHeader"></igx-calendar>
     * ```
     * @memberof IgxCalendarComponent
     */
    public set headerTemplate(directive: any) {
        this.headerTemplateDirective = directive;
    }

    /**
     * Gets the subheader template.
     *
     * @example
     * ```typescript
     * let subheaderTemplate = this.calendar.subheaderTemplate;
     * ```
     */
    public get subheaderTemplate(): any {
        if (this.subheaderTemplateDirective) {
            return this.subheaderTemplateDirective.template;
        }
        return null;
    }

    /**
     * Sets the subheader template.
     *
     * @example
     * ```html
     * <igx-calendar subheaderTemplate = "igxCalendarSubheader"></igx-calendar>
     * ```
     * @memberof IgxCalendarComponent
     */
    public set subheaderTemplate(directive: any) {
        this.subheaderTemplateDirective = directive;
    }

    /**
     * Gets the context for the template marked with the `igxCalendarHeader` directive.
     *
     * @example
     * ```typescript
     * let headerContext =  this.calendar.headerContext;
     * ```
     */
    public get headerContext() {
        const date: Date = this.headerDate;
        return this.generateContext(date);
    }

    /**
     * Gets the context for the template marked with either `igxCalendarSubHeaderMonth`
     * or `igxCalendarSubHeaderYear` directive.
     *
     * @example
     * ```typescript
     * let context =  this.calendar.context;
     * ```
     */
    public get context() {
        const date: Date = this.viewDate;
        return this.generateContext(date);
    }

    /**
     * Date displayed in header
     *
     * @hidden
     * @internal
     */
    public get headerDate(): Date {
        return this.selectedDates ? this.selectedDates : new Date();
    }

    /**
     * @hidden
     * @internal
     */
    @ContentChild(forwardRef(() => IgxCalendarHeaderTemplateDirective), { read: IgxCalendarHeaderTemplateDirective, static: true  })
    private headerTemplateDirective: IgxCalendarHeaderTemplateDirective;

    /**
     * @hidden
     * @internal
     */
    // eslint-disable-next-line max-len
    @ContentChild(forwardRef(() => IgxCalendarSubheaderTemplateDirective), { read: IgxCalendarSubheaderTemplateDirective, static: true  })
    private subheaderTemplateDirective: IgxCalendarSubheaderTemplateDirective;

    /**
     * @hidden
     * @internal
     */
    public activeDate = new Date().toLocaleDateString();

    /**
     * Used to apply the active date when the calendar view is changed
     *
     * @hidden
     * @internal
     */
    public nextDate: Date;

    /**
     * Denote if the calendar view was changed with the keyboard
     *
     * @hidden
     * @internal
     */
    public isKeydownTrigger = false;

    /**
     * @hidden
     * @internal
     */
    public callback: (next) => void;

    /**
     * @hidden
     * @internal
     */
    private _monthsViewNumber = 1;
    /**
     * @hidden
     * @internal
     */
    private _monthViewsChanges$: Subscription;

    /**
     * Keyboard navigation of the calendar
     *
     * @hidden
     * @internal
     */
    @HostListener('keydown.pagedown', ['$event'])
    @HostListener('keydown.pageup', ['$event'])
    public onKeydownPageDown(event: KeyboardEvent) {
        event.preventDefault();
        if (!this.isDefaultView) {
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
                if (month > 11) {
                    month = 0; year += step;
                }
            } else {
                if (month < 0) {
                    month = 11; year += step;
                }
            }

            const range = monthRange(this.nextDate.getFullYear(), month);

            let day = this.nextDate.getDate();
            if (day > range[1]) {
                day = range[1];
            }

            this.nextDate.setDate(day);
            this.nextDate.setMonth(month);
            this.nextDate.setFullYear(year);

            this.callback = (next) => {
                monthView = this.daysView as IgxDaysViewComponent;
                let dayItem;
                while ((!dayItem && monthView) || (dayItem && !dayItem.isCurrentMonth)) {
                    dayItem = monthView.dates.find((d) => d.date.date.getTime() === next.getTime());
                    monthView = monthView.nextMonthView;
                }
                if (dayItem && dayItem.isFocusable) {
                    dayItem.nativeElement.focus();
                }
            };
        }

        if (isPageDown) {
            if (event.repeat) {
                requestAnimationFrame(() => this.nextMonth(true));
            } else {
                this.nextMonth(true);
            }
        } else {
            if (event.repeat) {
                requestAnimationFrame(() => this.previousMonth(true));
            } else {
                this.previousMonth(true);
            }
        }
    }

    /**
     * Keyboard navigation of the calendar
     *
     * @hidden
     * @internal
     */
    @HostListener('keydown.shift.pageup', ['$event'])
    @HostListener('keydown.shift.pagedown', ['$event'])
    public onKeydownShiftPageUp(event: KeyboardEvent) {
        event.preventDefault();

        if (!this.isDefaultView) {
            return;
        }

        const isPageDown = event.key === 'PageDown';
        const step = isPageDown ? 1 : -1;
        this.previousViewDate = this.viewDate;
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
            if (day > range[1]) {
                day = range[1];
            }

            this.nextDate.setDate(day);
            this.nextDate.setFullYear(year);

            this.callback = (next) => {
                monthView = this.daysView as IgxDaysViewComponent;
                let dayItem;
                while ((!dayItem && monthView) || (dayItem && !dayItem.isCurrentMonth)) {
                    dayItem = monthView.dates.find((d) => d.date.date.getTime() === next.getTime());
                    monthView = monthView.nextMonthView;
                }
                if (dayItem && dayItem.isFocusable) {
                    dayItem.nativeElement.focus();
                }
            };
        }
    }

    /**
     * Keyboard navigation of the calendar
     *
     * @hidden
     * @internal
     */
    @HostListener('keydown.home', ['$event'])
    public onKeydownHome(event: KeyboardEvent) {
        if (this.daysView) {
            this.daysView.onKeydownHome(event);
        }
    }

    /**
     * Keyboard navigation of the calendar
     *
     * @hidden
     * @internal
     */
    @HostListener('keydown.end', ['$event'])
    public onKeydownEnd(event: KeyboardEvent) {
        if (this.daysView) {
            this.daysView.onKeydownEnd(event);
        }
    }

    /**
     * Stop continuous navigation on mouseup event
     *
     * @hidden
     * @internal
     */
    @HostListener('document:mouseup', ['$event'])
    public onMouseUp(event: KeyboardEvent) {
        if (this.monthScrollDirection !== ScrollMonth.NONE) {
            this.stopMonthScroll(event);
        }
    }

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
     * @internal
     */
    public formattedMonth(value: Date): string {
        if (this.formatViews.month) {
            return this.formatterMonth.format(value);
        }
        return `${value.getMonth()}`;
    }

    /**
     * Change to previous month
     *
     * @hidden
     * @internal
     */
    public previousMonth(isKeydownTrigger = false) {
        if (isKeydownTrigger && this.animationAction === ScrollMonth.NEXT) {
            return;
        }
        this.previousViewDate = this.viewDate;
        this.viewDate = this.calendarModel.getPrevMonth(this.viewDate);
        this.animationAction = ScrollMonth.PREV;
        this.isKeydownTrigger = isKeydownTrigger;
    }

    public suppressBlur() {
        this.monthViews?.forEach(d => d.shouldResetDate = false);
        if (this.daysView) {
            this.daysView.shouldResetDate = false;
        }
    }

    /**
     * Change to next month
     *
     * @hidden
     * @internal
     */
    public nextMonth(isKeydownTrigger = false) {
        if (isKeydownTrigger && this.animationAction === 'prev') {
            return;
        }
        this.isKeydownTrigger = isKeydownTrigger;
        this.previousViewDate = this.viewDate;
        this.viewDate = this.calendarModel.getNextMonth(this.viewDate);
        this.animationAction = ScrollMonth.NEXT;
    }

    /**
     * Continious navigation through the previous months
     *
     * @hidden
     * @internal
     */
    public startPrevMonthScroll = (isKeydownTrigger = false) => {
        this.startMonthScroll$.next();
        this.monthScrollDirection = ScrollMonth.PREV;
        this.animationAction = ScrollMonth.PREV;
        this.previousMonth(isKeydownTrigger);
    };

    /**
     * Continious navigation through the next months
     *
     * @hidden
     * @internal
     */
    public startNextMonthScroll = (isKeydownTrigger = false) => {
        this.startMonthScroll$.next();
        this.monthScrollDirection = ScrollMonth.NEXT;
        this.animationAction = ScrollMonth.NEXT;
        this.nextMonth(isKeydownTrigger);
    };

    /**
     * Stop continuous navigation
     *
     * @hidden
     * @internal
     */
    public stopMonthScroll = (event) => {
        event.stopPropagation();

        // generally the scrolling is built on the calendar component
        // and all start/stop scrolling methods are called on the calendar
        // if we change below lines to call stopMonthScroll$ on the calendar instead of on the views,
        // strange bug is introduced --> after changing number of months, continuous scrolling on mouse click does not happen
        this.daysView.stopMonthScroll$.next(true);
        this.daysView.stopMonthScroll$.complete();


        if (this.monthScrollDirection === ScrollMonth.PREV) {
            this.prevMonthBtn.nativeElement.focus();
        } else if (this.monthScrollDirection === ScrollMonth.NEXT) {
            this.nextMonthBtn.nativeElement.focus();
        }
        if (event.key === KEYS.SPACE || event.key === KEYS.SPACE_IE || event.key === KEYS.ENTER) {
            this.resetActiveDate();
        }

        this.monthScrollDirection = ScrollMonth.NONE;
    };

    /**
     * @hidden
     * @internal
     */
    public onActiveViewDecade(args: Date, activeViewIdx: number) {
        super.activeViewDecade(activeViewIdx);
        requestAnimationFrame(() => {
            if (this.dacadeView) {
                this.dacadeView.date = args;
                this.dacadeView.calendarDir.find(date => date.isCurrentYear).nativeElement.focus();
            }
        });
    }

    /**
     * @hidden
     * @internal
     */
    public onActiveViewDecadeKB(event, args: Date, activeViewIdx: number) {
        super.activeViewDecadeKB(event, activeViewIdx);

        requestAnimationFrame(() => {
            if (this.dacadeView) {
                this.dacadeView.date = args;
                this.dacadeView.calendarDir.find(date => date.isCurrentYear).nativeElement.focus();
            }
        });
    }

    /**
     * @hidden
     * @internal
     */
    public getFormattedDate(): { weekday: string; monthday: string } {
        const date = this.headerDate;

        return {
            monthday: this.formatterMonthday.format(date),
            weekday: this.formatterWeekday.format(date),
        };
    }

    /**
     * Handles invoked on date selection
     *
     * @hidden
     * @internal
     */
    public childClicked(instance: ICalendarDate) {
        if (instance.isPrevMonth) {
            this.previousMonth();
        }

        if (instance.isNextMonth) {
            this.nextMonth();
        }

        this.selectDateFromClient(instance.date);
        if (this.selection === 'multi') {
            this.deselectDateInMonthViews(instance.date);
        }
        this.selected.emit(this.selectedDates);
    }

    /**
     * @hidden
     * @internal
     */
    public viewChanging(args: IViewChangingEventArgs) {
        this.animationAction = args.monthAction;
        this.isKeydownTrigger = true;
        this.nextDate = args.nextDate;
        this.callback = (next) => {
            const day = this.daysView.dates.find((item) => item.date.date.getTime() === next.getTime());
            if (day) {
                this.daysView.daysNavService.focusNextDate(day.nativeElement, args.key, true);
            }
        };
        this.previousViewDate = this.viewDate;
        this.viewDate = this.nextDate;
    }

    /**
     * @hidden
     * @intenal
     */
    public changeMonth(event: Date) {
        this.previousViewDate = this.viewDate;
        this.viewDate = this.calendarModel.getFirstViewDate(event, 'month', this.activeViewIdx);
        this.activeView = IgxCalendarView.Month;

        requestAnimationFrame(() => {
            const elem = this.monthsBtns.find((e: ElementRef, idx: number) => idx === this.activeViewIdx);
            if (elem) {
                elem.nativeElement.focus();
            }
        });
    }

    /**
     * @hidden
     * @internal
     */
    public onActiveViewYear(args: Date, activeViewIdx: number): void {
        this.activeView = IgxCalendarView.Year;
        this.activeViewIdx = activeViewIdx;
        requestAnimationFrame(() => {
            this.monthsView.date = args;
            this.focusMonth();
        });
    }

    /**
     * @hidden
     * @internal
     */
    public onActiveViewYearKB(args: Date, event, activeViewIdx: number): void {
        if (event.key === KEYS.SPACE || event.key === KEYS.SPACE_IE || event.key === KEYS.ENTER) {
            event.preventDefault();
            this.onActiveViewYear(args, activeViewIdx);
        }
    }

    /**
     * Deselects date(s) (based on the selection type).
     *
     * @example
     * ```typescript
     *  this.calendar.deselectDate(new Date(`2018-06-12`));
     * ````
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
     * @hidden
     * @internal
     */
    public getViewDate(i: number): Date {
        const date = this.calendarModel.timedelta(this.viewDate, 'month', i);
        return date;
    }

    /**
     * Getter for the context object inside the calendar templates.
     *
     * @hidden
     * @internal
     */
    public getContext(i: number) {
        const date = this.getViewDate(i);
        return this.generateContext(date, i);
    }

    /**
     * @hidden
     * @internal
     */
    public animationDone(event) {
        if ((event.fromState === ScrollMonth.NONE && (event.toState === ScrollMonth.PREV || event.toState === ScrollMonth.NEXT)) ||
             (event.fromState === 'void' && event.toState === ScrollMonth.NONE)) {
            this.viewDateChanged.emit({ previousValue: this.previousViewDate, currentValue: this.viewDate });
        }
        if (!this.isKeydownTrigger) {
            this.resetActiveDate();
        }

        if (this.monthScrollDirection !== ScrollMonth.NONE) {
            this.scrollMonth$.next();
        }

        if (!this.isDefaultView) {
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
     * @internal
     */
    public viewRendered(event) {
        if (event.fromState !== 'void') {
            this.activeViewChanged.emit(this.activeView);
            if (this.isDefaultView) {
                this.resetActiveDate();
            }
        }
    }

    /**
     * @hidden
     * @internal
     */
    public resetActiveDate() {
        if (!this.monthViews) {
            return;
        }
        let dates = [];
        this.monthViews.map(mv => mv.dates).forEach(days => {
            dates = dates.concat(days.toArray());
        });
        const date = dates.find(day => day.selected && day.isCurrentMonth) || dates.find(day => day.isToday && day.isCurrentMonth)
            || dates.find(d => d.isFocusable);
        if (date) {
            this.activeDate = date.date.date.toLocaleDateString();
        }
    }

    /**
     * @hidden
     * @internal
     */
    public ngOnDestroy(): void {
        if (this._monthViewsChanges$) {
            this._monthViewsChanges$.unsubscribe();
        }
    }

    /**
     * @hidden
     * @internal
     */
    public getPrevMonth(date): Date {
        return this.calendarModel.getPrevMonth(date);
    }

    /**
     * @hidden
     * @internal
     */
    public getNextMonth(date, viewIndex): Date {
        return this.calendarModel.getDateByView(date, 'Month', viewIndex);
    }

    /**
     * Helper method building and returning the context object inside
     * the calendar templates.
     *
     * @hidden
     * @internal
     */
    private generateContext(value: Date, i?: number) {
        const formatObject = {
            index: i,
            monthView: () => this.onActiveViewYear(value, i),
            yearView: () => this.onActiveViewDecade(value, i),
            ...this.calendarModel.formatToParts(value, this.locale, this.formatOptions,
                ['era', 'year', 'month', 'day', 'weekday'])
        };
        return { $implicit: formatObject };
    }

    /**
     * Helper method that sets references for prev/next months for each month in the view
     *
     * @hidden
     * @internal
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
     *
     * @hidden
     * @internal
     */
    private getMonthView(index: number): IgxDaysViewComponent {
        if (index === -1 || index === this.monthViews.length ) {
            return null;
        } else {
            return this.monthViews.toArray()[index];
        }
    }

    /**
     * Helper method that does deselection for all month views when selection is "multi"
     * If not called, selection in other month views stays
     *
     * @hidden
     * @internal
     */
    private deselectDateInMonthViews(value: Date) {
        this.monthViews.forEach(m => {
            m.deselectMultipleInMonth(value);
         });
    }

    private focusMonth() {
        const month = this.monthsView.monthsRef.find((e) =>
            e.index === this.monthsView.date.getMonth());
        if (month) {
            month.nativeElement.focus();
        }
    }
}
