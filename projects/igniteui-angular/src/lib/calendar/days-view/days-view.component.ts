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
    Inject,
    LOCALE_ID,
    booleanAttribute,
    ElementRef,
    ChangeDetectorRef,
} from '@angular/core';
import { CalendarSelection, ICalendarDate, ScrollDirection, isDateInRanges } from '../../calendar/calendar';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { IgxDayItemComponent } from './day-item.component';
import { DateRangeDescriptor, DateRangeType } from '../../core/dates';
import { IgxCalendarBaseDirective } from '../calendar-base';
import { isEqual, PlatformUtil } from '../../core/utils';
import { IViewChangingEventArgs } from './days-view.interface';
import { NgIf, NgFor, TitleCasePipe } from '@angular/common';
import { areSameMonth, getClosestActiveDate, getNextActiveDate, getPreviousActiveDate } from '../common/helpers';
import { CalendarDay } from '../common/model';

let NEXT_ID = 0;

@Component({
    providers: [
        {
            multi: true,
            provide: NG_VALUE_ACCESSOR,
            useExisting: IgxDaysViewComponent
        },
    ],
    selector: 'igx-days-view',
    templateUrl: 'days-view.component.html',
    standalone: true,
    imports: [NgIf, NgFor, IgxDayItemComponent, TitleCasePipe]
})
export class IgxDaysViewComponent extends IgxCalendarBaseDirective implements DoCheck {
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
    public dateSelection = new EventEmitter<Date>();

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

    /**
     * @hidden
     */
    constructor(
        platform: PlatformUtil, 
        @Inject(LOCALE_ID) _localeId: string,
        protected el: ElementRef,
        protected cdr: ChangeDetectorRef,
    ) {
        super(platform, _localeId);
    }

    /**
     * @hidden
     */
    private handleArrowKeydown(event: KeyboardEvent, delta: number) {
        event.preventDefault();
        event.stopPropagation();

        const date = getClosestActiveDate(
            CalendarDay.from(this.activeDate),
            delta,
            this.disabledDates,
        );

        if (!areSameMonth(this.activeDate, date.native)) {
            this.pageChanged.emit({
                monthAction: delta > 0 ? ScrollDirection.NEXT : ScrollDirection.PREV,
                key: event.key,
                nextDate: date.native
            });
        }

        this.activeDate = date.native;
        this.viewDate = date.native;
        this.cdr.detectChanges();
    }

    /**
     * @hidden
     */
    @HostListener('keydown.arrowright', ['$event'])
    protected onArrowRight(event: KeyboardEvent) {
        this.handleArrowKeydown(event, 1);
    }

    /**
     * @hidden
     */
    @HostListener('keydown.arrowleft', ['$event'])
    protected onArrowLeft(event: KeyboardEvent) {
        this.handleArrowKeydown(event, -1);
    }

    /**
     * @hidden
     */
    @HostListener('keydown.arrowup', ['$event'])
    protected onArrowUp(event: KeyboardEvent) {
        this.handleArrowKeydown(event, -7);
    }

    /**
     * @hidden
     */
    @HostListener('keydown.arrowdown', ['$event'])
    protected onArrowDown(event: KeyboardEvent) {
        this.handleArrowKeydown(event, 7);
    }

    /**
     * @hidden
     */
    @HostListener('keydown.enter', ['$event'])
    protected onKeydownEnter(event: KeyboardEvent) {
        event.stopPropagation();
        this.selectActiveDate();
    }

    /**
     * @hidden
     */
    @HostListener('keydown.home', ['$event'])
    protected onKeydownHome(event: KeyboardEvent) {
        event.preventDefault();
        event.stopPropagation();

        const first = CalendarDay.from(this.activeDate);
        this.activeDate = getNextActiveDate(
            first.set({ date: 1 }),
            this.disabledDates,
        ).native;
    }

    /**
     * @hidden
     */
    @HostListener('keydown.end', ['$event'])
    protected onKeydownEnd(event: KeyboardEvent) {
        event.preventDefault();
        event.stopPropagation();

        const last = CalendarDay.from(this.activeDate);
        this.activeDate = getPreviousActiveDate(
            last.set({ month: last.month + 1, date: 0 }),
            this.disabledDates,
        ).native;
    }

    /**
     * @hidden
     */
    @HostListener('focus')
    protected handleFocus() {
        this.changePreviewRange(this.activeDate);
    }

    /**
     * @hidden
     */
    @HostListener('blur')
    protected handleBlur() {
        this.clearPreviewRange();
    }

    /**
     * @hidden
     */
    protected handleDateClick(event: MouseEvent, date: ICalendarDate) {
        event.preventDefault();

        if (date.isPrevMonth) {
            this.pageChanged.emit({
                monthAction: ScrollDirection.PREV,
                key: '',
                nextDate: date.date
            });
        }

        if (date.isNextMonth) {
            this.pageChanged.emit({
                monthAction: ScrollDirection.NEXT,
                key: '',
                nextDate: date.date
            });
        }

        // TODO: remove this when we have proper keyboard navigation
        this.el.nativeElement.focus();

        this.activeDate = date.date;
        this.selectActiveDate();
    }

    private selectActiveDate() {
        this.selectDateFromClient(this.activeDate);
        this.dateSelection.emit(this.activeDate);
        this.selected.emit(this.selectedDates);
        this.clearPreviewRange();
    }

    /**
     * @hidden
     */
    public get getCalendarMonth(): ICalendarDate[][] {
        return this.calendarModel.monthDatesCalendar(this.viewDate.getFullYear(), this.viewDate.getMonth(), true);
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
     * Returns the week number by date
     *
     * @hidden
     */
    public getWeekNumber(date: Date): number {
        return CalendarDay.from(date).week + 1;
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
        const rv = this.calendarModel.monthDatesCalendar(this.viewDate.getFullYear(), this.viewDate.getMonth())[0];
        for (const day of rv) {
            dayNames.push(this.formatterWeekday.format(day.date));
        }

        return dayNames;
    }

    /**
     * @hidden
     */
    public rowTracker(index: number, item): string {
        return `${item[index].date.getMonth()}${item[index].date.getDate()}`;
    }

    /**
     * @hidden
     */
    public dateTracker(_, item: ICalendarDate): string {
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
        const day = new CalendarDay({ 
            year: date.date.getFullYear(),
            month: date.date.getMonth(),
            date: date.date.getDate()
        });

        return day.equalTo(this.activeDate);
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
            this.value.length === 1 &&
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
    public getLastMonthView(): IgxDaysViewComponent {
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

    /**
     * @hidden @internal
     */
    public changePreviewRange(date: Date) {
        if (
          this.selection === 'range' &&
          Array.isArray(this.value) &&
          this.value.length === 1 &&
          !isEqual(this.value[0], date)
        ) {
          this.setPreviewRangeDate(date);
        }
    }

    /**
     * @hidden @internal
     */
    public clearPreviewRange() {
        if (this.previewRangeDate) {
            this.setPreviewRangeDate(undefined);
        }
    }

    private setPreviewRangeDate(value?: Date) {
        this.previewRangeDate = value;
    }
}
