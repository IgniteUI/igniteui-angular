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
import { ICalendarDate, isDateInRanges } from '../../calendar/calendar';
import { trigger, transition, useAnimation } from '@angular/animations';
import { slideInLeft, slideInRight } from '../../animations/main';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { IgxDayItemComponent } from './day-item.component';
import { DateRangeDescriptor, DateRangeType } from '../../core/dates';
import { IgxCalendarBase, ScrollMonth, CalendarSelection } from '../calendar-base';
import { isEqual } from '../../core/utils';

let NEXT_ID = 0;

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
    public onViewChanged = new EventEmitter<Date>();

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
    public nextMonthView: IgxDaysViewComponent;

    /**
     * @hidden
     */
    public prevMonthView: IgxDaysViewComponent;

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
     * @hidden
     */
    public isSelected(date: ICalendarDate): boolean {
        let selectedDates: Date | Date[];
        if (this.isDateDisabled(date.date)) {
            return false;
        }

        if (!this.value || (Array.isArray(this.value) && this.value.length === 0)) {
            return false;
        }

        if (this.selection === CalendarSelection.SINGLE) {
            selectedDates = (this.value as Date);
            return this.getDateOnly(selectedDates).getTime() === date.date.getTime();
        }

        selectedDates = (this.value as Date[]);
        if (this.selection === CalendarSelection.RANGE && selectedDates.length === 1) {
            return this.getDateOnly(selectedDates[0]).getTime() === date.date.getTime();
        }

        if (this.selection === CalendarSelection.MULTI) {
            const start = this.getDateOnly(selectedDates[0]);
            const end = this.getDateOnly(selectedDates[selectedDates.length - 1]);

            if (this.isWithinRange(date.date, false, start, end)) {
                const currentDate = selectedDates.find(element => element.getTime() === date.date.getTime());
                return !!currentDate;
            } else {
                return false;
            }

        } else {
            return this.isWithinRange(date.date, true);
        }
    }

    /**
     * @hidden
     */
    public isLastInRange(date: ICalendarDate): boolean {
        if (this.isSingleSelection || !this.value) {
            return false;
        }

        const dates = this.value as Date[];
        const lastDate = dates[dates.length - 1];
        return isEqual(lastDate, date.date);
    }

    /**
     * @hidden
     */
    public isFirstInRange(date: ICalendarDate): boolean {
        if (this.isSingleSelection || !this.value) {
            return false;
        }

        return isEqual((this.value as Date[])[0], date.date);
    }

    /**
     * @hidden
     */
    public isFirstInMonth(date: ICalendarDate): boolean {
        const checkLast = false;
        return this.isFirstLastInMonth(checkLast, date);
    }

    /**
     * @hidden
     */
    public isLastInMonth(date: ICalendarDate): boolean {
        const checkLast = false;
        return this.isFirstLastInMonth(checkLast, date);
    }

    /**
     * @hidden
     */
    public isWithinRange(date: Date, checkForRange: boolean, min?: Date, max?: Date): boolean {
        if (checkForRange && !(Array.isArray(this.value) && this.value.length > 1)) {
            return false;
        }

        min = min ? min : this.value[0];
        max = max ? max : this.value[(this.value as Date[]).length - 1];

        return isDateInRanges(date,
            [
                {
                    type: DateRangeType.Between,
                    dateRange: [min, max]
                }
            ]
        );
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
        this.deselectDateInMonthViews(event.date);
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
            day: IgxDayItemComponent, i;
        const index = dates.indexOf(node);

        if (!node) { return; }
        this.nextDate = this.calendarModel.timedelta(node.date.date, 'day', -7);

        // focus item in current month
        for (i = index; i - 7 > -1; i -= 7) {
            day = prevView ? dates[i] : dates[i - 7];
            this.nextDate = day.date.date;
            if (day.date.isPrevMonth) {
                break;
            }
            if (this.isDayFocusable(day)) {
                day.nativeElement.focus();
                return;
            }
        }

        // focus item in previous visible month
        if (this.prevMonthView) {
            dates = this.prevMonthView.dates.toArray();
            day = dates.find((item) => item.date.date.getTime() === this.nextDate.getTime());

            if (this.isDayFocusable(day)) {
                day.nativeElement.focus();
                return;
            }
            this.prevMonthView.focusPreviousUpDate(day.nativeElement);
        }

        if (!this.isDayFocusable(day)) {
            day = dates[i - 7];
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

            this.onViewChanged.emit(this.nextDate);
        }
    }

    /**
     * @hidden
     */
    private focusNextDownDate(target, nextView = false) {
        const node = this.dates.find((date) => date.nativeElement === target);
        let dates = this.dates.toArray(),
            day: IgxDayItemComponent, i;
        const index = dates.indexOf(node);

        if (!node) { return; }
        this.nextDate = this.calendarModel.timedelta(node.date.date, 'day', 7);

        // focus item in current month
        for (i = index; i + 7 < 42; i += 7) {
            day = nextView ? dates[i] : dates[i + 7];
            this.nextDate = day.date.date;
            if (day.date.isNextMonth) {
                break;
            }
            if (this.isDayFocusable(day)) {
                day.nativeElement.focus();
                return;
            }
        }

        // focus item in next visible month
        if (this.nextMonthView) {
            dates = this.nextMonthView.dates.toArray();
            day = dates.find((item) => item.date.date.getTime() === this.nextDate.getTime());

            if (this.isDayFocusable(day)) {
                day.nativeElement.focus();
                return;
            }
            this.nextMonthView.focusNextDownDate(day.nativeElement);
        }

        if (!this.isDayFocusable(day)) {
            day = dates[i + 7];

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

            this.onViewChanged.emit(this.nextDate);
        }
    }

    /**
     * @hidden
     */
    private focusPreviousDate(target, prevView = false) {
        const node = this.dates.find((date) => date.nativeElement === target);
        let dates = this.dates.toArray(),
            day: IgxDayItemComponent, i: number;
        const index = dates.indexOf(node);

        if (!node) { return; }
        this.nextDate = this.calendarModel.timedelta(node.date.date, 'day', -1);

        for (i = index; i > 0; i--) {
            day = prevView ? dates[i] : dates[i - 1];
            this.nextDate = day.date.date;
            if (day.date.isPrevMonth) {
                break;
            }
            if (this.isDayFocusable(day)) {
                day.nativeElement.focus();
                return;
            }
        }

        // focus item in previous visible month
        if (this.prevMonthView) {
            dates = this.prevMonthView.dates.toArray();
            day = dates.find((item) => item.date.date.getTime() === this.nextDate.getTime());

            if (this.isDayFocusable(day)) {
                day.nativeElement.focus();
                return;
            }
            this.prevMonthView.focusPreviousDate(day.nativeElement);
        }

        if (!this.isDayFocusable(day)) {
            day = dates[i - 1];
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

            this.onViewChanged.emit(this.nextDate);
        }
    }

    /**
     * @hidden
     */
    private focusNextDate(target, nextView = false) {
        const node = this.dates.find((date) => date.nativeElement === target);
        let dates = this.dates.toArray(),
            day: IgxDayItemComponent, i;
        let index = dates.indexOf(node);

        if (!node) { return; }
        this.nextDate = this.calendarModel.timedelta(node.date.date, 'day', 1);

        // focus item in current month
        for (i = index; i < dates.length - 1; i++) {
            day = nextView ? dates[i] : dates[i + 1];
            this.nextDate = day.date.date;
            if (day.date.isNextMonth) {
                break;
            }
            if (this.isDayFocusable(day)) {
                day.nativeElement.focus();
                return;
            }
        }

        // focus item in next visible month
        if (this.nextMonthView) {
            dates = this.nextMonthView.dates.toArray();
            day = dates.find((item) => item.date.date.getTime() === this.nextDate.getTime());
            index = dates.indexOf(day);

            if (this.isDayFocusable(day)) {
                day.nativeElement.focus();
                return;
            }
            this.nextMonthView.focusNextDate(day.nativeElement);
        }

        if (!this.isDayFocusable(day)) {
            day = dates[i + 1];
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

            this.onViewChanged.emit(this.nextDate);
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
     * Helper method that does deselection for all month views when selection is "multi"
     * If not called, selection in other month views stays
     * @hidden
     */
    private deselectDateInMonthViews(value: Date) {
        let monthView = this as IgxDaysViewComponent;
        while (monthView.prevMonthView) {
            monthView = monthView.prevMonthView;
            this.deselectMultipleInMonth(monthView, value);
        }
        monthView = this as IgxDaysViewComponent;
        while (monthView.nextMonthView) {
            monthView = monthView.nextMonthView;
            this.deselectMultipleInMonth(monthView, value);
        }
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
    private getFirstMonthView(): IgxDaysViewComponent {
        let monthView = this as IgxDaysViewComponent;
        while (monthView.prevMonthView) {
            monthView = monthView.prevMonthView;
        }
        return monthView;
    }

    /**
     * @hidden
     */
    private getLastMonthView(): IgxDaysViewComponent {
        let monthView = this as IgxDaysViewComponent;
        while (monthView.nextMonthView) {
            monthView = monthView.nextMonthView;
        }
        return monthView;
    }

    /**
     * @hidden
     */
    private isDayFocusable(day: IgxDayItemComponent): boolean {
        return !!day && day.isCurrentMonth && !day.isHidden && !day.isDisabled && !day.isOutOfRange;
    }

    /**
     * @hidden
     */
    private isFirstLastInMonth(checkLast: boolean, date: ICalendarDate): boolean {
        const inc = checkLast ? 1 : -1;
        if (date.isCurrentMonth && !this.isSingleSelection && this.isWithinRange(date.date, true)) {
            const nextDay = new Date(date.date);
            nextDay.setDate(nextDay.getDate() + inc);
            if (this.isWithinRange(nextDay, true) && date.date.getMonth() + inc === nextDay.getMonth()) {
                return true;
            }
        }
        return false;
    }

    /**
     * @hidden
     */
    private get isSingleSelection(): boolean {
        return this.selection !== CalendarSelection.RANGE;
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
