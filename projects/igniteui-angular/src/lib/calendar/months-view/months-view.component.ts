import {
    Component,
    Input,
    HostBinding,
    ElementRef,
    booleanAttribute,
} from '@angular/core';
import { IgxCalendarMonthDirective } from '../calendar.directives';
import { NgFor, TitleCasePipe, DatePipe } from '@angular/common';
import { IgxCalendarViewDirective, Direction } from '../common/calendar-view.directive';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { getNextActiveDate, isDateInRanges } from '../common/helpers';
import { CalendarDay } from '../common/model';
import { DateRangeType } from '../common/types';

let NEXT_ID = 0;

@Component({
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: IgxMonthsViewComponent,
        multi: true
    }],
    selector: 'igx-months-view',
    templateUrl: 'months-view.component.html',
    standalone: true,
    imports: [NgFor, IgxCalendarMonthDirective, TitleCasePipe, DatePipe]
})
export class IgxMonthsViewComponent extends IgxCalendarViewDirective implements ControlValueAccessor {
    protected tagName = 'igx-months-view';

    /**
     * The default css class applied to the component.
     *
     * @hidden
     */
    @HostBinding('class.igx-calendar')
    public styleClass = true;

    /**
     * Sets/gets the `id` of the months view.
     * If not set, the `id` will have value `"igx-months-view-0"`.
     * ```html
     * <igx-months-view id="my-months-view"></igx-months-view>
     * ```
     * ```typescript
     * let monthsViewId =  this.monthsView.id;
     * ```
     *
     * @memberof IgxMonthsViewComponent
     */
    @HostBinding('attr.id')
    @Input()
    public id = `igx-months-view-${NEXT_ID++}`;

    /**
     * The default css class applied to the component.
     *
     * @hidden
     */
    @HostBinding('class.igx-months-view')
    public readonly viewClass = true;

    /**
     * Gets the month format option of the months view.
     * ```typescript
     * let monthFormat = this.monthsView.monthFormat.
     * ```
     */
    @Input()
    public get monthFormat(): any {
        return this._monthFormat;
    }

    /**
     * Sets the month format option of the months view.
     * ```html
     * <igx-months-view> [monthFormat]="short'"</igx-months-view>
     * ```
     *
     * @memberof IgxMonthsViewComponent
     */
    public set monthFormat(value: any) {
        this._monthFormat = value;
        this.initFormatter();
    }

    /**
     * Gets/sets whether the view should be rendered
     * according to the locale and format, if any.
     */
    @Input({ transform: booleanAttribute })
    public override formatView = true;

    /**
     * Returns an array of date objects which are then used to
     * properly render the month names.
     *
     * Used in the template of the component
     *
     * @hidden
     */
    public get range(): Date[] {
        let start = new Date(this.date.getFullYear(), 0, 1);
        const result = [];

        for (let i = 0; i < 12; i++) {
            result.push(start);
            start = this._calendarModel.timedelta(start, 'month', 1);
        }

        return result;
    }

    /**
     * @hidden
     */
    private _monthFormat = 'short';

    constructor(public el: ElementRef) {
        super();
    }

    /**
     * Returns the locale representation of the month in the months view.
     *
     * @hidden
     */
    public formattedMonth(value: Date): string {
        if (this.formatView) {
            return this._formatter.format(value);
        }

        return `${value.getMonth()}`;
    }

    /**
     * @hidden
     */
    public monthTracker(_: number, item: Date): string {
        return `${item.getMonth()}}`;
    }

    /**
     * @hidden
     */
    protected navigateTo(event: KeyboardEvent, direction: Direction, delta: number) {
        event.preventDefault();
        event.stopPropagation();

        const date = getNextActiveDate(
            CalendarDay.from(this.date).add('month', direction * delta),
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
        this._formatter = new Intl.DateTimeFormat(this._locale, { month: this.monthFormat });
    }
}
