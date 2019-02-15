import { IgxCalendarBase } from './calendar-base';
import { ViewChild, ElementRef, Input, HostBinding } from '@angular/core';
import { IgxYearsViewComponent } from './years-view/years-view.component';
import { IgxDaysViewComponent } from './days-view/days-view.component';
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
     * @hidden
     */
    @ViewChild('days', {read: IgxDaysViewComponent})
    public daysView: IgxDaysViewComponent;

    /**
     * @hidden
     */
    @ViewChild('decade', { read: IgxYearsViewComponent })
    public dacadeView: IgxYearsViewComponent;

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
    get activeView(): CalendarView {
        return this._activeView;
    }

    /**
     * Sets the current active view.
     */
    set activeView(val: CalendarView) {
        this._activeView = val;
    }

    /**
     * @hidden
     */
    get isDefaultView(): boolean {
        return this._activeView === CalendarView.DEFAULT;
    }

    /**
     * @hidden
     */
    get isDecadeView(): boolean {
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
        requestAnimationFrame(() => {
            this.dacadeView.el.nativeElement.focus();
        });
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
     * @hidden
     */
    public previousYear() {
        this.viewDate = this.calendarModel.timedelta(this.viewDate, 'year', -1);
    }

    /**
     * @hidden
     */
    public nextYear() {
        this.viewDate = this.calendarModel.timedelta(this.viewDate, 'year', 1);
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

    /**
     * @hidden
     */
    public keydownPageUpHandler(event: KeyboardEvent) {
        event.preventDefault();
        this.previousYear();

        if (this.daysView) {
            this.daysView.isKeydownTrigger = true;
        }
    }

    /**
     * @hidden
     */
    public keydownPageDownHandler(event: KeyboardEvent) {
        event.preventDefault();
        this.nextYear();

        if (this.daysView) {
            this.daysView.isKeydownTrigger = true;
        }
    }
}
