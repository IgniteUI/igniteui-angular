import {
    Component,
    Input,
    HostBinding,
    ElementRef,
    booleanAttribute,
    Inject,
} from "@angular/core";
import { IgxCalendarMonthDirective } from "../calendar.directives";
import { NgFor, TitleCasePipe } from "@angular/common";
import {
    IgxCalendarViewDirective,
    DAY_INTERVAL_TOKEN,
} from "../common/calendar-view.directive";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { CalendarDay } from "../common/model";
import type { DayInterval } from "../common/model";
import { calendarRange } from "../common/helpers";

let NEXT_ID = 0;

@Component({
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: IgxMonthsViewComponent,
            multi: true,
        },
        {
            provide: DAY_INTERVAL_TOKEN,
            useValue: "month",
        },
    ],
    selector: "igx-months-view",
    templateUrl: "months-view.component.html",
    imports: [NgFor, IgxCalendarMonthDirective, TitleCasePipe]
})
export class IgxMonthsViewComponent extends IgxCalendarViewDirective implements ControlValueAccessor {
    #standalone = true;

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
    @HostBinding("attr.id")
    @Input()
    public id = `igx-months-view-${NEXT_ID++}`;

    /**
     * The default css class applied to the component.
     *
     * @hidden
     */
    @HostBinding("class.igx-calendar-view")
    public readonly viewClass = true;

    /**
     * @hidden @internal
     */
    @Input()
    @HostBinding("class.igx-calendar-view--standalone")
    public get standalone() {
        return this.#standalone;
    }

    public set standalone(value: boolean) {
        this.#standalone = value;
    }

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
     * @hidden @internal
     */
    public get range(): Date[] {
        const start = CalendarDay.from(this.date).set({ date: 1, month: 0 });
        const end = start.add(this.dayInterval, 12);

        return Array.from(
            calendarRange({ start, end, unit: this.dayInterval }),
        ).map((m) => m.native);
    }

    /**
     * @hidden
     */
    private _monthFormat = "short";

    constructor(
        public el: ElementRef,
        @Inject(DAY_INTERVAL_TOKEN) dayInterval: DayInterval,
    ) {
        super(dayInterval);
    }

    /**
     * @hidden
     */
    protected onMouseDown() {
        if (this.tabIndex !== -1) {
            this.el.nativeElement.focus();
        }
    }

    /**
     * Returns the locale representation of the month in the months view.
     *
     * @hidden
     */
    public formattedMonth(value: Date): { long: string; formatted: string } {
        const rawFormatter = new Intl.DateTimeFormat(this.locale, {
            month: "long",
            year: "numeric",
        });

        if (this.formatView) {
            return {
                long: rawFormatter.format(value),
                formatted: this._formatter.format(value),
            };
        }

        return {
            long: rawFormatter.format(value),
            formatted: `${value.getMonth()}`,
        };
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
    protected initFormatter() {
        this._formatter = new Intl.DateTimeFormat(this._locale, {
            month: this.monthFormat,
        });
    }
}
