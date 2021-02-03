import {
    Component,
    Output,
    EventEmitter,
    Input,
    HostListener,
    ViewChildren,
    QueryList,
    HostBinding,
    DoCheck,
    OnInit
} from '@angular/core';
import { ICalendarDate, isDateInRanges } from '../../calendar/calendar';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { IgxDayItemComponent } from './day-item.component';
import { DateRangeDescriptor, DateRangeType } from '../../core/dates';
import { IgxCalendarBaseDirective, CalendarSelection } from '../calendar-base';
import { isEqual } from '../../core/utils';
import { IViewChangingEventArgs } from './days-view.interface';
import { IgxDaysViewNavigationService } from '../days-view/daysview-navigation.service';

let NEXT_ID = 0;

@Component({
    providers: [
        {
            multi: true,
            provide: NG_VALUE_ACCESSOR,
            useExisting: IgxDaysViewComponent
        },
        { provide: IgxDaysViewNavigationService, useClass: IgxDaysViewNavigationService }
    ],
    selector: 'igx-days-view',
    templateUrl: 'days-view.component.html'
})
export class IgxDaysViewComponent extends IgxCalendarBaseDirective implements DoCheck, OnInit {
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
    public changeDaysView = false;

    /**
     * Show/hide week numbers
     *
     * @example
     * ```html
     * <igx-days-view [showWeekNumbers]="true"></igx-days-view>
     * ``
     */
    @Input()
    public showWeekNumbers: boolean;

    /**
     * @hidden
     * @internal
     */
    @Input()
    public set activeDate(value: string) {
        this._activeDate = value;
        this.activeDateChange.emit(this._activeDate);
    }

    public get activeDate() {
        return this._activeDate ? this._activeDate : this.viewDate.toLocaleDateString();
    }

    /**
     * @hidden
     */
    @Output()
    public dateSelection = new EventEmitter<ICalendarDate>();

    /**
     * @hidden
     */
    @Output()
    public viewChanging = new EventEmitter<IViewChangingEventArgs>();

    /**
     * @hidden
     */
    @Output()
    public activeDateChange = new EventEmitter<string>();

    /**
     * @hidden
     */
    @Output()
    public monthsViewBlur = new EventEmitter<any>();

    /**
     * @hidden
     */
    @ViewChildren(IgxDayItemComponent, { read: IgxDayItemComponent })
    public dates: QueryList<IgxDayItemComponent>;

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
    public outOfRangeDates: DateRangeDescriptor[];

    /**
     * @hidden
     */
    public nextMonthView: IgxDaysViewComponent;

    /** @hidden */
    public prevMonthView: IgxDaysViewComponent;
    /** @hidden */
    public shouldResetDate = true;
    private _activeDate;

    /**
     * @hidden
     */
    constructor(public daysNavService: IgxDaysViewNavigationService) {
        super();
    }

    /**
     * @hidden
     * @internal
     */
    @HostListener('focusout')
    public resetActiveMonth() {
        if (this.shouldResetDate) {
            const date = this.dates.find(day => day.selected && day.isCurrentMonth) ||
                        this.dates.find(day => day.isToday && day.isCurrentMonth) ||
                        this.dates.find(d => d.isFocusable);
            if (date) {
                this.activeDate = date.date.date.toLocaleDateString();
            }
            this.monthsViewBlur.emit();
        }
        this.shouldResetDate = true;
    }

    /**
     * @hidden
     * @internal
     */
    @HostListener('keydown.pagedown')
    @HostListener('keydown.pageup')
    @HostListener('keydown.shift.pagedown')
    @HostListener('keydown.shift.pageup')
    @HostListener('pointerdown')
    public pointerDown() {
        this.shouldResetDate = false;
    }

    /**
     * @hidden
     */
    @HostListener('keydown.arrowleft', ['$event'])
    @HostListener('keydown.arrowright', ['$event'])
    @HostListener('keydown.arrowup', ['$event'])
    @HostListener('keydown.arrowdown', ['$event'])
    public onKeydownArrow(event: KeyboardEvent) {
        event.preventDefault();
        event.stopPropagation();
        this.shouldResetDate = false;
        this.daysNavService.focusNextDate(event.target as HTMLElement, event.key);
    }

    /**
     * @hidden
     */
    @HostListener('keydown.home', ['$event'])
    public onKeydownHome(event: KeyboardEvent) {
        event.preventDefault();
        event.stopPropagation();
        this.shouldResetDate = false;
        this.getFirstMonthView().daysNavService.focusHomeDate();
    }

    /**
     * @hidden
     */
    @HostListener('keydown.end', ['$event'])
    public onKeydownEnd(event: KeyboardEvent) {
        event.preventDefault();
        event.stopPropagation();
        this.shouldResetDate = false;
        this.getLastMonthView().daysNavService.focusEndDate();
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
    public ngOnInit() {
        this.daysNavService.monthView = this;
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
     * @hidden
     * @internal
     */
    public tabIndex(day: ICalendarDate): number {
        return this.activeDate && this.activeDate === day.date.toLocaleDateString() && day.isCurrentMonth ? 0 : -1;
    }

    /**
     * Returns the week number by date
     *
     * @hidden
     */
    public getWeekNumber(date): number {
        return this.calendarModel.getWeekNumber(date);
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
        if (this.isDateDisabled(date.date) || !this.value ||
            (Array.isArray(this.value) && this.value.length === 0)
            )  {
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
     * @hidden
     */
    public focusActiveDate() {
        let date = this.dates.find((d) => d.selected);

        if (!date) {
            date = this.dates.find((d) => d.isToday);
        }

        if (date.isFocusable) {
            date.nativeElement.focus();
        }
    }

    /**
     * @hidden
     */
    public selectDay(event) {
        this.selectDateFromClient(event.date);
        this.dateSelection.emit(event);
        this.selected.emit(this.selectedDates);
    }

    /**
     * @hidden
     */
    public getFirstMonthView(): IgxDaysViewComponent {
        let monthView = this as IgxDaysViewComponent;
        while (monthView.prevMonthView) {
            monthView = monthView.prevMonthView;
        }
        return monthView;
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
            dateRange
        }];
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
    private get isSingleSelection(): boolean {
        return this.selection !== CalendarSelection.RANGE;
    }
}
