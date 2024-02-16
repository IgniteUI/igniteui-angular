import { IgxCalendarView } from '../calendar';
import { IgxCalendarBaseDirective } from '../calendar-base';
import { Directive, ViewChildren, ElementRef, QueryList, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { CalendarDay } from '../common/model';

@Directive({
    selector: '[igxMonthPickerBase]',
    standalone: true
})
export class IgxMonthPickerBaseDirective extends IgxCalendarBaseDirective {
    private activeViewSubject = new Subject<IgxCalendarView>();

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
     * @hidden
     */
    protected activeView$ = this.activeViewSubject.asObservable();

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
        this.activeViewSubject.next(val);
    }

    /**
     * @hidden
     */
    public get isDefaultView(): boolean {
        return this._activeView === IgxCalendarView.Month;
    }

    /**
     * @hidden
     */
    public get isDecadeView(): boolean {
        return this._activeView === IgxCalendarView.Decade;
    }

    /**
     * @hidden
     */
    public changeYear(date: Date) {
        this.previousViewDate = this.viewDate;
        this.viewDate = CalendarDay.from(date).add('month', -this.activeViewIdx).native;
        this.activeView = IgxCalendarView.Month;
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
        event.stopPropagation();

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
    public formattedYear(value: Date | Date[]): string {
		if (Array.isArray(value)) {
			return;
		}

        if (this.formatViews.year) {
            return this.formatterYear.format(value);
        }

	    return `${value.getFullYear()}`;
    }

	public formattedYears(value: Date) {
		const dates = value as unknown as Date[];
		return dates.map(date => this.formattedYear(date)).join(' - ');
	}

	protected getDecadeRange(): { start: string; end: string } {
		const dates = this.calendarModel.yearDates(this.viewDate);

		return {
			start: this.formatterYear.format(dates[0]),
			end: this.formatterYear.format(dates.at(-1))
		}
	}
}
