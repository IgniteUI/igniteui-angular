import { IgxCalendarBase } from './calendar-base';
import { ViewChild, ElementRef, HostBinding } from '@angular/core';
import { KEYS } from '../core/utils';
import { IDayView } from './calendar.component';

/**
 * Sets the calender view - days, months or years.
 */
export enum CalendarView {
    DEFAULT,
    YEAR,
    DECADE
}
export class IgxMonthPickerBase extends IgxCalendarBase {

    /**
     * @hidden
     */
    @ViewChild('yearsBtn', { static: false })
    public yearsBtn: ElementRef;

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
    public changeYear(event: Date, dayViews: IDayView[]) {
        this.viewDate = new Date(event.getFullYear(), this.viewDate.getMonth());
        const yearsDiff = event.getFullYear() - dayViews[0].viewDate.getFullYear();
        dayViews.forEach((val, index) => {
            val.viewDate.setMonth(event.getMonth() + 12 * yearsDiff + index);
        });
        this._activeView = CalendarView.DEFAULT;

        requestAnimationFrame(() => {
            this.yearsBtn.nativeElement.focus();
        });
    }

    /**
     * @hidden
     */
    public activeViewDecade(): void {
        this._activeView = CalendarView.DECADE;
    }

    /**
     * @hidden
     */
    public activeViewDecadeKB(event) {
        if (event.key === KEYS.SPACE || event.key === KEYS.SPACE_IE || event.key === KEYS.ENTER) {
            event.preventDefault();
            this.activeViewDecade();
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
