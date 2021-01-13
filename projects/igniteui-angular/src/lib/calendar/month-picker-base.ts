import { IgxCalendarBaseDirective } from './calendar-base';
import { HostBinding, Directive, ViewChildren, ElementRef, QueryList, Input } from '@angular/core';
import { KEYS } from '../core/utils';

/**
 * Sets the calender view - days, months or years.
 */
export enum CalendarView {
    DEFAULT,
    YEAR,
    DECADE
}

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


    @Input()
    /**
     * Gets the current active view.
     * ```typescript
     * this.activeView = calendar.activeView;
     * ```
     */
    public get activeView(): CalendarView {
        return this._activeView;
    }

    /**
     * Sets the current active view.
     * ```html
     * <igx-calendar [activeView]="1" #calendar></igx-calendar>
     * ```
     * ```typescript
     * calendar.activeView = CalendarView.YEAR;
     * ```
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
     * Holds month view index we are operating on.
     */
    protected activeViewIdx = 0;

    /**
     * @hidden
     */
    private _activeView = CalendarView.DEFAULT;

    /**
     * @hidden
     */
    public changeYear(event: Date) {
        this.previousViewDate = this.viewDate;
        this.viewDate = this.calendarModel.getFirstViewDate(event, 'month', this.activeViewIdx);
        this.activeView = CalendarView.DEFAULT;

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
        this.activeView = CalendarView.DECADE;
        this.activeViewIdx = activeViewIdx;
    }

    /**
     * @hidden
     */
    public activeViewDecadeKB(event, activeViewIdx = 0) {
        if (event.key === KEYS.SPACE || event.key === KEYS.SPACE_IE || event.key === KEYS.ENTER) {
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
