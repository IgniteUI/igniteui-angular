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
    OnInit,
    Inject,
    LOCALE_ID,
    booleanAttribute,
    ElementRef,
    ChangeDetectorRef,
} from '@angular/core';
import { CalendarSelection, ICalendarDate, isDateInRanges } from '../../calendar/calendar';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { IgxDayItemComponent } from './day-item.component';
import { DateRangeDescriptor, DateRangeType } from '../../core/dates';
import { IgxCalendarBaseDirective } from '../calendar-base';
import { isEqual, PlatformUtil } from '../../core/utils';
import { IViewChangingEventArgs } from './days-view.interface';
import { IgxDaysViewNavigationService } from '../days-view/daysview-navigation.service';
import { NgIf, NgFor, TitleCasePipe } from '@angular/common';
import { ScrollDirection } from '../calendar';

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
    templateUrl: 'days-view.component.html',
    standalone: true,
    imports: [NgIf, NgFor, IgxDayItemComponent, TitleCasePipe]
})
export class IgxDaysViewComponent extends IgxCalendarBaseDirective implements DoCheck, OnInit {
    /**
     * Sets/gets the `id` of the days view.
     * If not set, the `id` will have value `"igx-days-view-0"`.
     * ```html
     * <igx-days-view id="my-days-view"></igx-days-view>
     * ```
     * ```typescript
     * let daysViewId = this.daysView.id;
     * ```
     */
    @HostBinding('attr.id')
    @Input()
    public id = `igx-days-view-${NEXT_ID++}`;

    @HostBinding('attr.tabIndex')
    @Input()
    public tabIndex = 0;

	@HostBinding('class.igx-days-view')
	public readonly viewClass = true;

    /**
     * @hidden
     */
    @Input({ transform: booleanAttribute })
    public changeDaysView = false;

    /**
     * Show/hide week numbers
     *
     * @example
     * ```html
     * <igx-days-view [showWeekNumbers]="true"></igx-days-view>
     * ``
     */
    @Input({ transform: booleanAttribute })
    public showWeekNumbers: boolean;

    /**
     * @hidden
     * @internal
     */
    @Input()
    public set activeDate(value: Date) {
        this._activeDate = value;
        this.changePreviewRange(value);
        this.activeDateChange.emit(this._activeDate);
    }

    public get activeDate(): Date {
        return this._activeDate ?? this.viewDate;
    }

    /**
     * @hidden
     * @internal
     */
    @Input()
    protected set previewRangeDate(value: Date) {
        this._previewRangeDate = value;
        this.previewRangeDateChange.emit(this._previewRangeDate);
    }

    protected get previewRangeDate() {
        return this._previewRangeDate;
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
    public pageChanged = new EventEmitter<IViewChangingEventArgs>();

    /**
     * @hidden
     */
    @Output()
    public activeDateChange = new EventEmitter<Date>();

    /**
     * @hidden
     */
    @Output()
    public monthsViewBlur = new EventEmitter<any>();

    /**
     * @hidden
     */
    @Output()
    public previewRangeDateChange = new EventEmitter<any>();

    /**
     * @hidden
     */
    @ViewChildren(IgxDayItemComponent, { read: IgxDayItemComponent })
    public dates: QueryList<IgxDayItemComponent>;

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

    private _activeDate: Date;
    private _previewRangeDate: Date;
    private _hasFocus = false;

    /**
     * @hidden
     */
    constructor(
        public daysNavService: IgxDaysViewNavigationService,
        platform: PlatformUtil, @Inject(LOCALE_ID) _localeId: any,
        protected el: ElementRef,
        protected cdr: ChangeDetectorRef
    ) {
        super(platform, _localeId);
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

        let key = event.key;

        if (key.indexOf('Arrow') === -1) {
            key = 'Arrow'.concat(event.key);
        }

        const delta = this.getKeyDelta(key);
        const monthAction = delta > 0 ? ScrollDirection.NEXT : ScrollDirection.PREV;
        const currentMonthDates = this.getMonthDates(this.viewDate);
        const nextMonthDates = this.getOffsetMonthDates(monthAction);
        let nextDate = this.findClosestDate(currentMonthDates, this.activeDate, delta);

        if (!nextDate) {
            nextDate = this.findClosestDate(nextMonthDates, this.activeDate, delta);
            this.pageChanged.emit({ monthAction, key, nextDate });
        }

        this.shouldResetDate = false;
        this.activeDate = nextDate;
        this.viewDate = nextDate;
        this.cdr.detectChanges();
    }

    /**
     * @hidden
     */
    @HostListener('keydown.enter', ['$event'])
    protected selectDay(event: KeyboardEvent) {
        event.stopPropagation();

        this.selectDateFromClient(this.activeDate);
        this.clearPreviewRange();
        this.selected.emit(this.selectedDates);
    }


    /**
     * @hidden
     */
    @HostListener('keydown.home', ['$event'])
    protected onKeydownHome(event: KeyboardEvent) {
        event.preventDefault();
        event.stopPropagation();
        this.activateDay(0);
    }

    /**
     * @hidden
     */
    @HostListener('keydown.end', ['$event'])
    protected onKeydownEnd(event: KeyboardEvent) {
        event.preventDefault();
        event.stopPropagation();
        this.activateDay(-1);
    }

    protected activateDay(offset: number) {
        this.shouldResetDate = false;
        const day = this.getMonthDates(this.viewDate).at(offset);

        if (!day.isDisabled) {
            this.activeDate = day.date;
        }
    }

    protected getKeyDelta(key: string) {
        let delta: number;

        switch(key) {
            case 'ArrowRight':
                delta = 1;
                break;
            case 'ArrowLeft':
                delta = -1;
                break;
            case 'ArrowUp':
                delta = -7;
                break;
            case 'ArrowDown':
                delta = 7;
                break;
        }

        return delta;
    }

    /**
     * @hidden
     */
    protected findClosestDate(dates: ICalendarDate[], target: Date, delta: number): Date | null {
        let counter = 0;

        while (counter < dates.length) {
            const nextDate = new Date(target);
            nextDate.setDate(nextDate.getDate() + delta * (counter + 1));
            nextDate.setHours(0, 0, 0, 0);

            for (const day of dates) {
                const compareDate = new Date(day.date);
                compareDate.setHours(0, 0, 0, 0);

                if (compareDate.getTime() === nextDate.getTime()) {
                    if (!day.isDisabled) return day.date;
                    else break; // Found disabled target date, adjust and try again
                }
            }

            counter++;
        }

        return null;
    }

    /**
     * @hidden
     */
    @HostListener('focus')
    protected handleFocus() {
        this._hasFocus = true;
        this.changePreviewRange(this.activeDate);
    }

    /**
     * @hidden
     */
    @HostListener('blur')
    protected handleBlur() {
        this._hasFocus = false;
        this.clearPreviewRange();
    }

    /**
     * @hidden
     */
    protected handleClick(event: MouseEvent, date: ICalendarDate) {
        event.stopPropagation();
        this.el.nativeElement.focus();
        this.activeDate = date.date;
        this.selectDateFromClient(this.activeDate);
        this.dateSelection.emit(date);
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
    protected getMonthDates(date: Date): ICalendarDate[] {
        return this.calendarModel.monthdatescalendar(date.getFullYear(), date.getMonth(), false)
            .flat()
            .filter((_date) => _date.isCurrentMonth);
    }

    /**
     * @hidden
     */
    protected getOffsetMonthDates(dir: ScrollDirection) {
        if (dir === ScrollDirection.PREV) {
            return this.getMonthDates(this.calendarModel.getPrevMonth(this.activeDate));
        }

        if (dir === ScrollDirection.NEXT) {
            return this.getMonthDates(this.calendarModel.getNextMonth(this.activeDate));
        }

        return this.getMonthDates(this.activeDate);
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
    // public tabIndex(day: ICalendarDate): number {
    //     return this.activeDate?.getDate() === day.date?.getDate() && day.isCurrentMonth ? 0 : -1;
    // }

    /**
     * Returns the week number by date
     *
     * @hidden
     */
    public getWeekNumber(date): number {
        return this.calendarModel.getWeekNumber(date, this.weekStart);
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
        ) {
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
    protected isFirstInRange(date: ICalendarDate): boolean {
        const dates = this.value as Date[];

        if (this.isSingleSelection || dates.length === 0) {
            return false;
        }

        let day = dates.at(0);

        if (this.previewRangeDate) {
            if (this.previewRangeDate < day) {
                day = this.previewRangeDate;
            }
        }

        return isEqual(day, date.date);
    }

    /**
     * @hidden
     */
    protected isLastInRange(date: ICalendarDate): boolean {
        const dates = this.value as Date[];

        if (this.isSingleSelection || dates.length === 0) {
            return false;
        }

        let day = dates.at(-1);

        if (this.previewRangeDate) {
            if (this.previewRangeDate > day) {
                day = this.previewRangeDate;
            }
        }

        return isEqual(day, date.date);
    }

    /**
     * @hidden
     */
    protected isActiveDate(date: ICalendarDate): boolean {
        if (!this._hasFocus) return false;

        return (this.activeDate?.getDate() === date.date?.getDate()) && date.isCurrentMonth;
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

    protected isWithinPreviewRange(date: Date): boolean {
        if (
            this.selection === 'range' &&
            Array.isArray(this.value) &&
            this.value.length > 0 &&
            this.previewRangeDate
        ) {
            return isDateInRanges(date, [
                {
                    type: DateRangeType.Between,
                    dateRange: [this.value[0], this.previewRangeDate],
                },
            ]);
        }

        return false;
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
    private get isSingleSelection(): boolean {
        return this.selection !== CalendarSelection.RANGE;
    }

    protected changePreviewRange(date: Date) {
        if (
          this.selection === 'range' &&
          Array.isArray(this.value) &&
          this.value.length === 1 &&
          !isEqual(this.value[0], date)
        ) {
          this.setPreviewRangeDate(date);
        }
    }

    protected clearPreviewRange() {
        if (this.previewRangeDate) {
            this.setPreviewRangeDate(undefined);
        }
    }

    private setPreviewRangeDate(value?: Date) {
        this.previewRangeDate = value;
    }
}
