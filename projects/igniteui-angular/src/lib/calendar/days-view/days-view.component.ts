import {
    Component,
    Output,
    EventEmitter,
    Input,
    HostListener,
    ViewChildren,
    QueryList,
    HostBinding,
    DoCheck
} from '@angular/core';
import { ICalendarDate } from '../../calendar';
import { trigger, transition, useAnimation } from '@angular/animations';
import { slideInLeft, slideInRight } from '../../animations/main';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { IgxDayItemComponent } from './day-item.component';
import { DateRangeDescriptor, DateRangeType } from '../../core/dates';
import { IgxCalendarBase, ScrollMonth } from '../calendar-base';

let NEXT_ID = 0;

export interface IViewChangedArgs {
    date: Date;
    delta: number;
    moveToFirst?: boolean;
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
export class IgxDaysViewComponent extends IgxCalendarBase implements DoCheck {
    /**
     * Sets/gets the `id` of the days view.
     * If not set, the `id` will have value `"igx-days-view-0"`.
     * ```html
     * <igx-days-view id="my-days-view"></igx-days-view>
     * ```
     * ```typescript
     * let daysViewId =  this.daysView.id;
     * ```
     */
    @HostBinding('attr.id')
    @Input()
    public id = `igx-days-view-${NEXT_ID++}`;

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
     * @hidden
     */
    @Output()
    public onDateSelection = new EventEmitter<ICalendarDate>();

    /**
     * @hidden
     */
    @Output()
    public onViewChanged = new EventEmitter<IViewChangedArgs>();

    /**
     * @hidden
     */
    @ViewChildren(IgxDayItemComponent, { read: IgxDayItemComponent })
    public dates: QueryList<IgxDayItemComponent>;

    /**
     * @hidden
     */
    public nextDate: Date;

    /**
     * @hidden
     */
    public callback: (dates?, next?) => void;

    /**
     * @hidden
     */
    public isKeydownTrigger = false;

    /**
     * @hidden
     */
    public outOfRangeDates: DateRangeDescriptor[];

    /**
     * @hidden
     */
    public nextMonthView = null;

    /**
     * @hidden
     */
    public prevMonthView = null;

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
    public get getCalendarMonth(): ICalendarDate[][] {
        return this.calendarModel.monthdatescalendar(this.viewDate.getFullYear(), this.viewDate.getMonth(), true);
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
     * Returns the locale representation of the date in the days view.
     *
     * @hidden
     */
    public formattedDate(value: Date): string {
        if (this.formatViews.day) {
            return this.formatterDay.format(value);
        }
        return `${value.getDate()}`;
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
    public selectDay(event) {
        this.selectDateFromClient(event.date);
        this.onDateSelection.emit(event);

        this.onSelection.emit(this.selectedDates);
    }

    /**
     * @hidden
     */
    public animationDone(event, isLast: boolean) {
        if (isLast) {
            if (this.monthScrollDirection !== ScrollMonth.NONE) {
                this.scrollMonth$.next();
            }

            const date = this.dates.find((d) => d.selected);
            if (date && !this.isKeydownTrigger) {
                setTimeout(() => {
                    date.nativeElement.focus();
                }, parseInt(slideInRight.options.params.duration, 10));
            } else if (this.callback && (event.toState === 'next' || event.toState === 'prev')) {
                this.callback(this.dates, this.nextDate);
            }
        }
    }

    /**
     * @hidden
     */
    private focusPreviousUpDate(target, prevView = false) {
        const node = this.dates.find((date) => date.nativeElement === target);
        let dates = this.dates.toArray(),
            day: IgxDayItemComponent;
        const index = dates.indexOf(node);

        if (!node) { return; }

        // focus item in current month
        for (let i = index; i - 7 > -1; i -= 7) {
            day = prevView ? node : dates[i - 7];
            if (!day.isDisabled  && !day.isHidden && !day.isOutOfRange && day.isCurrentMonth) {
                day.nativeElement.focus();
                break;
            }
        }

        // focus item in previous visible month
        this.nextDate = this.calendarModel.timedelta(node.date.date, 'day', -7);
        day = dates[index - 7];
        if (this.prevMonthView && ((day && day.date.isPrevMonth) || !day)) {
            dates = this.prevMonthView.dates.toArray();
            day = dates.find((item) => item.date.date.getTime() === this.nextDate.getTime());
            day.nativeElement.focus();
        }

        // focus item in next month, which is currently out of view
        if (this.changeDaysView && !this.prevMonthView && ((day && day.isPreviousMonth) || !day)) {
            this.isKeydownTrigger = true;
            this.animationAction = 'prev';

            this.callback = (items?, next?) => {
                day = items.find((item) => item.date.date.getTime() === next.getTime());
                if (day) {
                    this.focusPreviousUpDate(day.nativeElement, true);
                }
            };

            this.onViewChanged.emit({ date: this.nextDate, delta: -1 });
        }
    }

    /**
     * @hidden
     */
    private focusNextDownDate(target, nextView = false) {
        const node = this.dates.find((date) => date.nativeElement === target);
        let dates = this.dates.toArray(),
            day: IgxDayItemComponent;
        const index = dates.indexOf(node);

        if (!node) { return; }

        // focus item in current month
        for (let i = index; i + 7 < 42; i += 7) {
            day = nextView ? node : dates[i + 7];
            if (!day.isDisabled  && !day.isHidden && !day.isOutOfRange && day.isCurrentMonth) {
                day.nativeElement.focus();
                break;
            }
        }

        // focus item in next visible month
        this.nextDate = this.calendarModel.timedelta(node.date.date, 'day', 7);
        day = dates[index + 7];
        if (this.nextMonthView && ((day && day.date.isNextMonth) || !day)) {
            dates = this.nextMonthView.dates.toArray();
            day = dates.find((item) => item.date.date.getTime() === this.nextDate.getTime());
            day.nativeElement.focus();
        }

        // focus item in next month, which is currently out of view
        if (this.changeDaysView && !this.nextMonthView && ((day && day.isNextMonth) || !day)) {
            this.isKeydownTrigger = true;
            this.animationAction = 'next';

            this.callback = (items?, next?) => {
                const monthView = this.getFirstMonthView();
                items = monthView.dates;
                day = items.find((item) => item.date.date.getTime() === next.getTime());
                if (day) {
                    monthView.focusNextDownDate(day.nativeElement, true);
                }
            };

            this.onViewChanged.emit({ date: this.nextDate, delta: 1, moveToFirst: true });
        }
    }

    /**
     * @hidden
     */
    private focusPreviousDate(target, prevView = false) {
        const node = this.dates.find((date) => date.nativeElement === target);
        let dates = this.dates.toArray(),
            day: IgxDayItemComponent;
        const index = dates.indexOf(node);

        if (!node) { return; }

        for (let i = index; i > 0; i--) {
            day = prevView ? node : dates[i - 1];
            if (!day.isDisabled  && !day.isHidden && !day.isOutOfRange && day.isCurrentMonth) {
                day.nativeElement.focus();
                break;
            }
        }

        // focus item in previous visible month
        this.nextDate = this.calendarModel.timedelta(node.date.date, 'day', -1);
        day = dates[index - 1];
        if (this.prevMonthView && ((day && day.date.isPrevMonth) || !day)) {
            dates = this.prevMonthView.dates.toArray();
            day = dates.find((item) => item.date.date.getTime() === this.nextDate.getTime());
            day.nativeElement.focus();
        }

        // focus item in previous month, which is currently out of view
        if (this.changeDaysView && !this.prevMonthView && ((day && day.isPreviousMonth) || !day)) {
            this.isKeydownTrigger = true;
            this.animationAction = 'prev';

            this.callback = (items?, next?) => {
                day = items.find((item) => item.date.date.getTime() === next.getTime());
                if (day) {
                    this.focusPreviousDate(day.nativeElement, true);
                }
            };

            this.onViewChanged.emit({ date: this.nextDate, delta: -1 });
        }
    }

    /**
     * @hidden
     */
    private focusNextDate(target, nextView = false) {
        const node = this.dates.find((date) => date.nativeElement === target);
        let dates = this.dates.toArray(),
            day: IgxDayItemComponent;
        const index = dates.indexOf(node);

        if (!node) { return; }

        // focus item in current month
        for (let i = index; i < dates.length - 1; i++) {
            day = nextView ? node : dates[i + 1];
            if (!day.isDisabled && !day.isHidden && !day.isOutOfRange && day.isCurrentMonth) {
                day.nativeElement.focus();
                break;
            }
        }

        // focus item in next visible month
        this.nextDate = this.calendarModel.timedelta(node.date.date, 'day', 1);
        day = dates[index + 1];
        if (this.nextMonthView && ((day && day.date.isNextMonth) || !day)) {
            dates = this.nextMonthView.dates.toArray();
            day = dates.find((item) => item.date.date.getTime() === this.nextDate.getTime());
            day.nativeElement.focus();
        }

        // focus item in next month, which is currently out of view
        if (this.changeDaysView && !this.nextMonthView && ((day && day.isNextMonth) || !day)) {
            this.isKeydownTrigger = true;
            this.animationAction = 'next';

            this.callback = (items?, next?) => {
                const monthView = this.getFirstMonthView();
                items = monthView.dates;
                day = items.find((item) => item.date.date.getTime() === next.getTime());
                if (day) {
                    monthView.focusNextDate(day.nativeElement, true);
                }
            };

            this.onViewChanged.emit({ date: this.nextDate, delta: 1, moveToFirst: true });
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
    private getFirstMonthView(): IgxDaysViewComponent {
        let monthView = this;
        while (monthView.prevMonthView) {
            monthView = monthView.prevMonthView;
        }
        return monthView;
    }

    /**
     * @hidden
     */
    private getLastMonthView(): IgxDaysViewComponent {
        let monthView = this;
        while (monthView.nextMonthView) {
            monthView = monthView.nextMonthView;
        }
        return monthView;
    }

    /**
     * @hidden
     */
    @HostListener('keydown.arrowup', ['$event'])
    public onKeydownArrowUp(event: KeyboardEvent) {
        event.preventDefault();
        event.stopPropagation();

        this.focusPreviousUpDate(event.target);
    }

    /**
     * @hidden
     */
    @HostListener('keydown.arrowdown', ['$event'])
    public onKeydownArrowDown(event: KeyboardEvent) {
        event.preventDefault();
        event.stopPropagation();

        this.focusNextDownDate(event.target);
    }

    /**
     * @hidden
     */
    @HostListener('keydown.arrowleft', ['$event'])
    public onKeydownArrowLeft(event: KeyboardEvent) {
        event.preventDefault();
        event.stopPropagation();

        this.focusPreviousDate(event.target);
    }

    /**
     * @hidden
     */
    @HostListener('keydown.arrowright', ['$event'])
    public onKeydownArrowRight(event: KeyboardEvent) {
        event.preventDefault();
        event.stopPropagation();

        this.focusNextDate(event.target);
    }

    /**
     * @hidden
     */
    @HostListener('keydown.home', ['$event'])
    public onKeydownHome(event: KeyboardEvent) {
        event.preventDefault();
        event.stopPropagation();

        const dates = this.getFirstMonthView().dates.filter(d => d.isCurrentMonth);
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
        event.stopPropagation();

        const dates = this.getLastMonthView().dates.filter(d => d.isCurrentMonth);
        for (let i = dates.length - 1; i >= 0; i--) {
            if (!dates[i].isDisabled) {
                dates[i].nativeElement.focus();
                break;
            }
        }
    }
}
