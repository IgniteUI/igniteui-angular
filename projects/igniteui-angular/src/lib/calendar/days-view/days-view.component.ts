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
    ChangeDetectionStrategy,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgIf, NgFor, TitleCasePipe } from '@angular/common';
import { CalendarSelection, ScrollDirection } from '../../calendar/calendar';
import { IgxDayItemComponent } from './day-item.component';
import { DateRangeType } from '../../core/dates';
import { IgxCalendarBaseDirective } from '../calendar-base';
import { PlatformUtil, intoChunks } from '../../core/utils';
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
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgIf, NgFor, IgxDayItemComponent, TitleCasePipe]
})
export class IgxDaysViewComponent extends IgxCalendarBaseDirective {
    #standalone = true;

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

    @HostBinding('attr.role')
    @Input()
    public role = 'grid';

	@HostBinding('class.igx-days-view')
	public readonly viewClass = true;

    @Input()
	@HostBinding('class.igx-days-view--standalone')
	public get standalone() {
        return this.#standalone;
    }

	public set standalone(value: boolean) {
        this.#standalone = value;
    }

    @HostBinding('attr.aria-activeDescendant')
    protected get activeDescendant() {
        if (this.tabIndex === -1) return;

        return this.activeDate.getTime();
    }

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
    public set previewRangeDate(value: Date) {
        this._previewRangeDate = value;
        this.previewRangeDateChange.emit(value);
    }

    public get previewRangeDate() {
        return this._previewRangeDate;
    }

    @Input({ transform: booleanAttribute })
    public set hideLeadingDays(value: boolean) {
        this._hideLeadingDays = value;
        this.cdr.detectChanges();
    }

    public get hideLeadingDays() {
        return this._hideLeadingDays ?? this.hideOutsideDays;
    }

    @Input({ transform: booleanAttribute })
    public set hideTrailingDays(value: boolean) {
        this._hideTrailingDays = value;
        this.cdr.detectChanges();
    }

    public get hideTrailingDays() {
        return this._hideTrailingDays ?? this.hideOutsideDays;
    }

    @Input({ transform: booleanAttribute })
    public set showActiveDay(value: boolean) {
        this._showActiveDay = value;
    }

    public get showActiveDay() {
        return this._showActiveDay;
    }

    /**
     * @hidden
     */
    @Output()
    public dateSelected = new EventEmitter<Date>();

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
    public previewRangeDateChange = new EventEmitter<any>();

    /**
     * @hidden
     */
    @ViewChildren(IgxDayItemComponent, { read: IgxDayItemComponent })
    public dates: QueryList<IgxDayItemComponent>;

    private _activeDate: Date;
    private _previewRangeDate: Date;
    private _hideLeadingDays: boolean;
    private _hideTrailingDays: boolean;
    private _showActiveDay: boolean;

    /**
     * @hidden
     */
    constructor(
        platform: PlatformUtil,
        @Inject(LOCALE_ID) _localeId: string,
        protected el: ElementRef,
        public override cdr: ChangeDetectorRef,
    ) {
        super(platform, _localeId, null, cdr);
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
        this.clearPreviewRange();
        this.changePreviewRange(date.native);
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
    @HostListener('keydown.Space', ['$event'])
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
        this._showActiveDay = true;
        this.changePreviewRange(this.activeDate);
    }

    /**
     * @hidden
     */
    @HostListener('blur')
    protected handleBlur() {
        this._showActiveDay = false;
        this.clearPreviewRange();
    }

    /**
     * @hidden
     */
    protected handleDateClick(item: IgxDayItemComponent) {
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

        if (this.tabIndex !== -1) {
            this.el.nativeElement.focus();
        }

        this.activeDate = item.date.native;
        this.selectActiveDate();
    }

    private selectActiveDate() {
        this.selectDate(this.activeDate);
        this.dateSelected.emit(this.activeDate);
        this.selected.emit(this.selectedDates);
        this.clearPreviewRange();
    }

    protected get calendarMonth(): CalendarDay[] {
        return Array.from(generateMonth(this.viewDate, this.weekStart));
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
        return date.week;
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
    public get weekHeaderLabels(): {long: string, formatted: string}[] {
        const weekdays = [];
        const rawFormatter = new Intl.DateTimeFormat(this.locale, { weekday: 'long' });

        for (const day of this.monthWeeks.at(0)) {
            weekdays.push({
                long: rawFormatter.format(day.native),
                formatted: this.formatterWeekday.format(day.native)
            });
        }

        return weekdays;
    }

    protected get weekNumberHeader(): { short: string, long: string } {
        const weekOfYear = (style: 'narrow' | 'long') => {
            const dn = new Intl.DisplayNames(this.locale, {
                type: 'dateTimeField',
                style,
            });

            return dn.of('weekOfYear');
        }

        return {
            short: weekOfYear('narrow').substring(0, 1),
            long: weekOfYear('long'),
        }
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
    public dateTracker(_: number, item: CalendarDay): string {
        return `${item.month}--${item.date}`;
    }

    /**
     * @hidden
     */
    public isSelected(date: CalendarDay): boolean {
        const dates = this.value as Date[];
        const hasValue = this.value || (Array.isArray(this.value) && this.value.length === 1);

        if (isDateInRanges(date, this.disabledDates)) {
            return false;
        }

        if (this.selection === CalendarSelection.SINGLE) {
            return !!this.value && date.equalTo(this.value as Date);
        }

        if (!hasValue) {
            return false;
        }

        if (this.selection === CalendarSelection.MULTI && dates.length > 0) {
            return isDateInRanges(date, [
                {
                    type: DateRangeType.Specific,
                    dateRange: dates,
                },
            ]);
        }

        if (this.selection === CalendarSelection.RANGE && dates.length > 0) {
            return isDateInRanges(date, [
                {
                    type: DateRangeType.Between,
                    dateRange: [dates.at(0), dates.at(-1)],
                },
            ]);
        }
    }

    /**
     * @hidden
     */
    protected isFirstInRange(date: CalendarDay): boolean {
        const dates = this.selectedDates;

        if (this.isSingleSelection || dates.length === 0) {
            return false;
        }

        let target = dates.at(0);

        if (this.previewRangeDate && this.previewRangeDate < target) {
            target = this.previewRangeDate;
        }

        return date.equalTo(target);
    }

    /**
     * @hidden
     */
    protected isLastInRange(date: CalendarDay): boolean {
        const dates = this.selectedDates;

        if (this.isSingleSelection || dates.length === 0) {
            return false;
        }

        let target = dates.at(-1);

        if (this.previewRangeDate && this.previewRangeDate > target) {
            target = this.previewRangeDate;
        }

        return date.equalTo(target);
    }

    /**
     * @hidden
     */
    protected isActiveDate(day: CalendarDay): boolean {
        return this._showActiveDay && day.equalTo(this.activeDate);
    }

    /**
     * @hidden
     */
    protected isWithinRange(date: Date, checkForRange: boolean, min?: Date, max?: Date): boolean {
        const dates = this.selectedDates;

        if (checkForRange && !(Array.isArray(dates) && dates.length > 1)) {
            return false;
        }

        min = min ? min : dates.at(0);
        max = max ? max : dates.at(-1);

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
        if (this.selection !== 'range') return false;

        const dates = this.selectedDates;

        if (!(dates.length > 0 && this.previewRangeDate)) {
            return false;
        }

        return isDateInRanges(date, [
          {
            type: DateRangeType.Between,
            dateRange: [dates.at(0), this.previewRangeDate],
          },
        ]);
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
        const dates = this.value as Date[];

        if (this.selection === 'range' && dates.length === 1) {
            const first = CalendarDay.from(dates.at(0));

            if (!first.equalTo(date)) {
              this.setPreviewRangeDate(date);
            }
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
