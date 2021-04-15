import { IgxCalendarBaseDirective } from './calendar-base';
import { Directive, ViewChildren, ElementRef, QueryList, Input } from '@angular/core';
import { mkenum } from '../core/utils';

export const IgxCalendarView = mkenum({
    Month: 'month',
    Year: 'year',
    Decade: 'decade'
});


/**
 * @hidden
 */
export enum CalendarView {
    DEFAULT,
    YEAR,
    DECADE
}

/**
 * Determines the Calendar active view - days, months or years.
 */
export type IgxCalendarView = (typeof IgxCalendarView)[keyof typeof IgxCalendarView] | CalendarView;

@Directive({
    selector: '[igxMonthPickerBase]'
})
export class IgxMonthPickerBaseDirective extends IgxCalendarBaseDirective {
    /**
     * @hidden
     */
    @ViewChildren('yearsBtn')
    public yearsBtns: QueryList<ElementRef>;

    /**
     * @hidden @internal
     */
    public previousViewDate: Date;

    /**
     * Holds month view index we are operating on.
     */
    protected activeViewIdx = 0;

    /**
     * @hidden
     */
    private _activeView: IgxCalendarView = IgxCalendarView.Month;


    /**
     * Gets the current active view.
     * ```typescript
     * this.activeView = calendar.activeView;
     * ```
     */
    @Input()
    public get activeView(): IgxCalendarView {
        return this._activeView;
    }

    /**
     * Sets the current active view.
     * ```html
     * <igx-calendar [activeView]="year" #calendar></igx-calendar>
     * ```
     * ```typescript
     * calendar.activeView = IgxCalendarView.YEAR;
     * ```
     */
    public set activeView(val: IgxCalendarView) {
        this._activeView = val;
    }

    /**
     * @hidden
     */
    public get isDefaultView(): boolean {
        return this._activeView === CalendarView.DEFAULT || this._activeView === IgxCalendarView.Month;
    }

    /**
     * @hidden
     */
    public get isDecadeView(): boolean {
        return this._activeView === CalendarView.DECADE || this._activeView === IgxCalendarView.Decade;
    }

    /**
     * @hidden
     */
    public changeYear(event: Date) {
        this.previousViewDate = this.viewDate;
        this.viewDate = this.calendarModel.getFirstViewDate(event, 'month', this.activeViewIdx);
        this.activeView = IgxCalendarView.Month;

        requestAnimationFrame(() => {
            if (this.yearsBtns && this.yearsBtns.length) {
                this.yearsBtns.find((e: ElementRef, idx: number) => idx === this.activeViewIdx).nativeElement.focus();
            }
        });
    }

    /**
     * @hidden
     */
    public activeViewDecade(activeViewIdx = 0): void {
        this.activeView = IgxCalendarView.Decade;
        this.activeViewIdx = activeViewIdx;
    }

    /**
     * @hidden
     */
    public activeViewDecadeKB(event: KeyboardEvent, activeViewIdx = 0) {
        if (this.platform.isActivationKey(event)) {
            event.preventDefault();
            this.activeViewDecade(activeViewIdx);
        }
    }

    /**
     * Returns the locale representation of the year in the year view if enabled,
     * otherwise returns the default `Date.getFullYear()` value.
     *
     * @hidden
     */
    public formattedYear(value: Date): string {
        if (this.formatViews.year) {
            return this.formatterYear.format(value);
        }
        return `${value.getFullYear()}`;
    }
}
