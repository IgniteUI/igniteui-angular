import {
    Component,
    Input,
    HostBinding,
    ElementRef,
    Injectable,
    QueryList,
    AfterViewInit
} from '@angular/core';
import { HammerGestureConfig, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { IgxCalendarYearDirective } from '../calendar.directives';
import { Subject } from 'rxjs';
import { NgFor } from '@angular/common';
import { takeUntil } from 'rxjs/operators';
import { IgxCalendarViewDirective, Direction } from '../common/calendar-view.directive';

@Injectable()
export class CalendarHammerConfig extends HammerGestureConfig {
    public override overrides = {
        pan: { direction: Hammer.DIRECTION_VERTICAL, threshold: 1 }
    };
}

@Component({
    providers: [
        {
            provide: HAMMER_GESTURE_CONFIG,
            useClass: CalendarHammerConfig
        }
    ],
    selector: 'igx-years-view',
    templateUrl: 'years-view.component.html',
    standalone: true,
    imports: [NgFor, IgxCalendarYearDirective]
})
export class IgxYearsViewComponent extends IgxCalendarViewDirective implements AfterViewInit {
    /**
     * @hidden
     * @internal
     */
    protected tagName = 'igx-years-view';

    /**
     * The default css class applied to the component.
     *
     * @hidden
     */
    @HostBinding('class.igx-years-view')
    public readonly viewClass = true;

    /**
     * @hidden
     */
    private _yearFormat = 'numeric';

    private destroy$ = new Subject<boolean>();

    /**
     * Gets the year format option of the years view.
     * ```typescript
     * let yearFormat = this.yearsView.yearFormat.
     * ```
     */
    @Input()
    public get yearFormat(): any {
        return this._yearFormat;
    }

    /**
     * Sets the year format option of the years view.
     * ```html
     * <igx-years-view [yearFormat]="numeric"></igx-years-view>
     * ```
     *
     * @memberof IgxYearsViewComponent
     */
    public set yearFormat(value: any) {
        this._yearFormat = value;
        this.initFormatter();
    }

    /**
     * Returns an array of date objects which are then used to properly
     * render the years.
     *
     * Used in the template of the component.
     *
     * @hidden
     */
    public get years() {
		return this._calendarModel.yearDates(this.date);
    }

    constructor(public el: ElementRef) {
        super();
    }

    /**
     * Returns the locale representation of the year in the years view.
     *
     * @hidden
     */
    public formattedYear(value: Date): string {
        if (this.formatView) {
            return this._formatter.format(value);
        }

        return `${value.getFullYear()}`;
    }

    /**
     * @hidden
     */
    public scroll(event) {
        event.preventDefault();
        event.stopPropagation();

        const delta = event.deltaY < 0 ? -1 : 1;
        this.generateYearRange(delta);
    }

    /**
     * @hidden
     */
    public pan(event) {
        const delta = event.deltaY < 0 ? 1 : -1;
        this.generateYearRange(delta);
    }

    /**
     * @hidden
     */
    public yearTracker(_: number, item: Date): string {
        return `${item.getFullYear()}}`;
    }

    /**
     * @hidden
     */
    protected navigateTo(event: KeyboardEvent, direction: Direction, delta: number) {
        event.preventDefault();
        event.stopPropagation();

        const node = this.viewItems.find((date) => date.nativeElement === event.target);
        if (!node) return;

        const _date = new Date(this.activeDate.getFullYear(), this.date.getMonth());
        const _delta = this._calendarModel.timedelta(_date, 'year', direction * delta);
        const years = this._calendarModel.yearDates(_delta);
        const hasNextYear = years.find((year) => year.getFullYear() === this.activeDate.getFullYear());

        if (!hasNextYear) {
            this.date = _delta;
            this.pageChanged.emit(_delta);
        }

        this.activeDate = _delta;
        this.focusActiveNode(this.viewItems as QueryList<IgxCalendarYearDirective>);
    }

    /**
     * @hidden
     */
    public ngAfterViewInit() {
        this.viewItems.changes
            .pipe(takeUntil(this.destroy$))
            .subscribe((list: QueryList<IgxCalendarYearDirective>) =>
                this.focusActiveNode(list),
            );
    }

    /**
     * @hidden
     */
    private focusActiveNode(list: QueryList<IgxCalendarYearDirective>) {
        const years = list.toArray();
        const idx = years.findIndex(
            (year) => year.value.getFullYear() === this.activeDate.getFullYear()
        );

        if (years[idx]) years[idx].nativeElement.focus();
    }

    /**
     * @hidden
     */
    private generateYearRange(delta: number) {
        const currentYear = new Date().getFullYear();

        if ((delta > 0 && this.date.getFullYear() - currentYear >= 95) ||
            (delta < 0 && currentYear - this.date.getFullYear() >= 95)) {
            return;
        }

        this.date = this._calendarModel.timedelta(this.date, 'year', delta);
    }

    /**
     * @hidden
     */
    protected initFormatter() {
        this._formatter = new Intl.DateTimeFormat(this._locale, { year: this.yearFormat });
    }

}
