import { IgxCalendarBaseDirective } from './calendar-base';
import { HostBinding, Directive } from '@angular/core';
import { KEYS } from '../core/utils';

/**
 * Sets the calender view - days, months or years.
 */
export enum CalendarView {
    DEFAULT,
    YEAR,
    DECADE
}

/**
 * @hidden
 */
enum TimeDeltaInterval {
    Month = 'month',
    Year = 'year'
}
@Directive({
    selector: '[igxMonthPickerBase]'
})
export class IgxMonthPickerBaseDirective extends IgxCalendarBaseDirective {

    /**
     * Holds month view index we are operating on.
     */
    protected monthViewIdx = 0;

    /**
     * The default `tabindex` attribute for the component.
     *
     * @hidden
     */
    @HostBinding('attr.tabindex')
    public tabindex = 0;

    /**
     * Gets the current active view.
     */
    public get activeView(): CalendarView {
        return this._activeView;
    }

    /**
     * Sets the current active view.
     */
    public set activeView(val: CalendarView) {
        this._activeView = val;
    }

    /**
     * @hidden
     */
    public get isDefaultView(): boolean {
        return this._activeView === CalendarView.DEFAULT;
    }

    /**
     * @hidden
     */
    public get isDecadeView(): boolean {
        return this._activeView === CalendarView.DECADE;
    }

    /**
     *@hidden
     */
    private _activeView = CalendarView.DEFAULT;

    /**
     * @hidden
     */
    public activeViewDecade(monthViewIdx = 0): void {
        this._activeView = CalendarView.DECADE;
        this.monthViewIdx = monthViewIdx;
    }

    /**
     * @hidden
     */
    public activeViewDecadeKB(event, monthViewIdx = 0) {
        if (event.key === KEYS.SPACE || event.key === KEYS.SPACE_IE || event.key === KEYS.ENTER) {
            event.preventDefault();
            this.activeViewDecade(monthViewIdx);
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

    protected getDatePerMonthView(date: Date, interval: string) {
        return this.calendarModel.timedelta(date, interval, -this.monthViewIdx);
    }

    protected getNextMonth(date: Date) {
        return this.calendarModel.timedelta(date, TimeDeltaInterval.Month, 1);
    }

    protected getPrevMonth(date: Date) {
        return this.calendarModel.timedelta(date, TimeDeltaInterval.Month, -1);
    }

    protected getNextYear(date: Date) {
        return this.calendarModel.timedelta(date, TimeDeltaInterval.Year, 1);
    }

    protected getPrevYear(date: Date) {
        return this.calendarModel.timedelta(date, TimeDeltaInterval.Year, -1);
    }
}
