import {
    Component,
    Input,
    HostBinding,
    ElementRef,
} from '@angular/core';
import { IgxCalendarYearDirective } from '../calendar.directives';
import { NgFor } from '@angular/common';
import { IgxCalendarViewDirective, Direction } from '../common/calendar-view.directive';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CalendarDay } from '../common/model';
import { getNextActiveDate, isDateInRanges } from '../common/helpers';
import { DateRangeType } from '../common/types';

@Component({
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: IgxYearsViewComponent,
            multi: true
        }
    ],
    selector: 'igx-years-view',
    templateUrl: 'years-view.component.html',
    standalone: true,
    imports: [NgFor, IgxCalendarYearDirective]
})
export class IgxYearsViewComponent extends IgxCalendarViewDirective implements ControlValueAccessor {
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
    public get range() {
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
    public yearTracker(_: number, item: Date): string {
        return `${item.getFullYear()}}`;
    }

    /**
     * @hidden
     */
    protected navigateTo(event: KeyboardEvent, direction: Direction, delta: number) {
        event.preventDefault();
        event.stopPropagation();

        const date = getNextActiveDate(
            CalendarDay.from(this.date).add('year', direction * delta),
            []
        );

        const outOfRange = !isDateInRanges(date, [{
            type: DateRangeType.Between,
            dateRange: [this.range.at(0), this.range.at(-1)]
        }]);

        if (outOfRange) {
            this.pageChanged.emit(date.native);
        }

        this.date = date.native;
    }

    /**
     * @hidden
     */
    protected initFormatter() {
        this._formatter = new Intl.DateTimeFormat(this._locale, { year: this.yearFormat });
    }
}
