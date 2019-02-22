import { IgxCalendarBase } from './calendar-base';
import { ViewChild, ElementRef, Input, HostBinding } from '@angular/core';
import { IFormattingViews } from './calendar';
import { KEYS } from '../core/utils';

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
     * Gets whether the `day`, `month` and `year` should be rendered
     * according to the locale and formatOptions, if any.
     */
    @Input()
    public get formatViews(): IFormattingViews {
        return this._formatViews;
    }

    /**
     * Gets whether the `day`, `month` and `year` should be rendered
     * according to the locale and formatOptions, if any.
     */
    public set formatViews(formatViews: IFormattingViews) {
        this._formatViews = Object.assign(this._formatViews, formatViews);
    }

    /**
     * @hidden
     */
    @ViewChild('yearsBtn')
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
     *@hidden
     */
    private _formatViews: IFormattingViews = {
        day: false,
        month: true,
        year: false
    };

    /**
     * @hidden
     */
    public changeYear(event: Date) {
        this.viewDate = new Date(event.getFullYear(), this.viewDate.getMonth());
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
        if (this._formatViews.year) {
            return this.formatterYear.format(value);
        }
        return `${value.getFullYear()}`;
    }
}
