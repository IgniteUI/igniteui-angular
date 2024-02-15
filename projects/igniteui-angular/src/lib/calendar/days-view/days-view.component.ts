import {
    Component,
    Output,
    EventEmitter,
    Input,
    HostListener,
    ViewChildren,
    QueryList,
    HostBinding,
    Inject,
    LOCALE_ID,
    booleanAttribute,
    ElementRef,
    ChangeDetectorRef,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgIf, NgFor, TitleCasePipe } from '@angular/common';
import { CalendarSelection, ScrollDirection } from '../../calendar/calendar';
import { IgxDayItemComponent } from './day-item.component';
import { DateRangeType } from '../../core/dates';
import { IgxCalendarBaseDirective } from '../calendar-base';
import { isEqual, PlatformUtil, intoChunks } from '../../core/utils';
import { IViewChangingEventArgs } from './days-view.interface';
import {
    areSameMonth,
    generateMonth,
    getClosestActiveDate,
    getNextActiveDate,
    getPreviousActiveDate,
    isDateInRanges,
} from "../common/helpers";
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
export class IgxDaysViewComponent extends IgxCalendarBaseDirective {
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

    @Input({ transform: booleanAttribute })
    public set hideLeadingDays(value: boolean) {
        this._hideLeadingDays = value;
    }

    public get hideLeadingDays() {
        return this._hideLeadingDays ?? this.hideOutsideDays;
    }

    @Input({ transform: booleanAttribute })
    public set hideTrailingDays(value: boolean) {
        this._hideTrailingDays = value;
    }

    public get hideTrailingDays() {
        return this._hideTrailingDays ?? this.hideOutsideDays;
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
    public nextMonthView: IgxDaysViewComponent;

    /** @hidden */
    public prevMonthView: IgxDaysViewComponent;

    /** @hidden */
    public shouldResetDate = true;

    private _activeDate: Date;
    private _previewRangeDate: Date;
    private _hideLeadingDays: boolean;
    private _hideTrailingDays: boolean;

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
    protected handleDateClick(event: MouseEvent, item: IgxDayItemComponent) {
        event.preventDefault();
        const date = item.date.native;

        if (item.isPreviousMonth) {
            this.pageChanged.emit({
                monthAction: ScrollDirection.PREV,
                key: '',
                nextDate: date
            });
        }

        if (item.isNextMonth) {
            this.pageChanged.emit({
                monthAction: ScrollDirection.NEXT,
                key: '',
                nextDate: date
            });
        }

        this.el.nativeElement.focus();
        this.activeDate = item.date.native;
        this.selectActiveDate();
    }

    private selectActiveDate() {
        this.selectDateFromClient(this.activeDate);
        this.dateSelection.emit(this.activeDate);
        this.selected.emit(this.selectedDates);
        this.clearPreviewRange();
    }

    protected get calendarMonth(): CalendarDay[] {
        return Array.from(generateMonth(this.viewDate, this.calendarModel.firstWeekDay));
    }

    protected get monthWeeks(): CalendarDay[][] {
        return Array.from(intoChunks(this.calendarMonth, 7));
    }

    /**
     * Returns the week number by date
     *
     * @hidden
     */
    public getWeekNumber(date: CalendarDay): number {
        return date.week + 1;
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

        for (const day of this.monthWeeks[0]) {
            dayNames.push(this.formatterWeekday.format(day.native));
        }

        return dayNames;
    }

    /**
     * @hidden
     */
    public rowTracker(index: number, item: CalendarDay[]): string {
        return `${item[index].month}${item[index].date}`;
    }

    /**
     * @hidden
     */
    public dateTracker(_, item: CalendarDay): string {
        return `${item.month}--${item.date}`;
    }

    /**
     * @hidden
     */
    public isSelected(date: CalendarDay): boolean {
        const dates = this.value as Date[];
        const hasValue = this.value || (Array.isArray(this.value) && this.value.length > 0);

        if (this.isDateDisabled(date.native) || !hasValue) {
            return false;
        }

        if (this.selection === CalendarSelection.SINGLE) {
            return date.equalTo(this.value as Date);
        }

        if (this.selection === CalendarSelection.RANGE && dates.length === 1) {
            return date.equalTo(this.getDateOnly(dates.at(0)));
        }

        if (this.selection === CalendarSelection.MULTI) {
            const start = this.getDateOnly(dates.at(0));
            const end = this.getDateOnly(dates.at(-1));

            if (this.isWithinRange(date.native, false, start, end)) {
                const currentDate = dates.find(day => date.equalTo(day));
                return !!currentDate;
            } else {
                return false;
            }
        } else {
            return this.isWithinRange(date.native, true);
        }
    }

    /**
     * @hidden
     */
    protected isFirstInRange(date: CalendarDay): boolean {
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

        return date.equalTo(day);
    }

    /**
     * @hidden
     */
    protected isLastInRange(date: CalendarDay): boolean {
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

        return date.equalTo(day);
    }

    /**
     * @hidden
     */
    protected isActiveDate(day: CalendarDay): boolean {
        return day.equalTo(this.activeDate);
    }

    /**
     * @hidden
     */
    protected isWithinRange(date: Date, checkForRange: boolean, min?: Date, max?: Date): boolean {
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
    private get isSingleSelection(): boolean {
        return this.selection === CalendarSelection.SINGLE;
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
