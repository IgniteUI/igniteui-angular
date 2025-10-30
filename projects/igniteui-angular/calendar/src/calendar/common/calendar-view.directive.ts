import {
    Output,
    EventEmitter,
    Input,
    HostListener,
    ViewChildren,
    QueryList,
    booleanAttribute,
    Directive,
    HostBinding,
    InjectionToken,
    Inject,
} from "@angular/core";
import { noop } from "rxjs";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import {
    IGX_CALENDAR_VIEW_ITEM,
    IgxCalendarMonthDirective,
    IgxCalendarYearDirective,
} from "../calendar.directives";
import { CalendarDay, DayInterval } from "../common/model";
import { getNextActiveDate, isDateInRanges } from "./helpers";
import { DateRangeType } from "../../core/dates";
import { isDate } from "../../core/utils";

export enum Direction {
    NEXT = 1,
    PREV = -1,
}

export const DAY_INTERVAL_TOKEN = new InjectionToken<DayInterval>(
    "DAY_INTERVAL",
);

@Directive({
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: IgxCalendarViewDirective,
            multi: true,
        },
    ],
    standalone: true,
})
export abstract class IgxCalendarViewDirective implements ControlValueAccessor {
    @HostBinding("attr.role")
    @Input()
    public role = 'grid';

    @HostBinding("attr.tabIndex")
    @Input()
    public tabIndex = 0;

    @HostBinding('attr.aria-activeDescendant')
    protected get activeDescendant() {
        if (this.tabIndex === -1) return;

        return this.date.getTime();
    }

    /**
     * Gets/sets whether the view should be rendered
     * according to the locale and format, if any.
     */
    @Input({ transform: booleanAttribute })
    public formatView: boolean;

    /**
     * Applies styles to the active item on view focus.
     */
    @Input({ transform: booleanAttribute })
    public showActive = false;

    /**
     * Emits an event when a selection is made in the view.
     * Provides reference the `date` property in the component.
     * @memberof IgxCalendarViewDirective
     */
    @Output()
    public selected = new EventEmitter<Date>();

    /**
     * Emits an event when a page changes in the view.
     * Provides reference the `date` property in the component.
     * @memberof IgxCalendarViewDirective
     * @hidden @internal
     */
    @Output()
    public pageChanged = new EventEmitter<Date>();

    /**
     * Emits an event when the active date has changed.
     * @memberof IgxCalendarViewDirective
     * @hidden @internal
     */
    @Output()
    public activeDateChanged = new EventEmitter<Date>();

    /**
     * @hidden
     * @internal
     */
    @ViewChildren(IGX_CALENDAR_VIEW_ITEM, { read: IGX_CALENDAR_VIEW_ITEM })
    public viewItems: QueryList<
        IgxCalendarMonthDirective | IgxCalendarYearDirective
    >;

    /**
     * @hidden
     */
    protected _formatter: Intl.DateTimeFormat;

    /**
     * @hidden
     */
    protected _locale = "en";

    /**
     * @hidden
     * @internal
     */
    private _date = new Date();

    /**
     * @hidden
     */
    protected _onTouchedCallback: () => void = noop;

    /**
     * @hidden
     */
    protected _onChangeCallback: (_: Date) => void = noop;

    /**
     * Gets/sets the selected date of the view.
     * By default it's the current date.
     * ```typescript
     * let date = this.view.date;
     * ```
     *
     * @memberof IgxYearsViewComponent
     */
    @Input()
    public set date(value: Date) {
        if (!isDate(value)) return;

        this._date = value;
    }

    public get date() {
        return this._date;
    }

    /**
     * Gets the `locale` of the view.
     * Default value is `"en"`.
     * ```typescript
     * let locale = this.view.locale;
     * ```
     *
     * @memberof IgxCalendarViewDirective
     */
    @Input()
    public get locale(): string {
        return this._locale;
    }

    /**
     * Sets the `locale` of the view.
     * Expects a valid BCP 47 language tag.
     * Default value is `"en"`.
     *
     * @memberof IgxCalendarViewDirective
     */
    public set locale(value: string) {
        this._locale = value;
        this.initFormatter();
    }

    constructor(@Inject(DAY_INTERVAL_TOKEN) protected dayInterval?: DayInterval) {
        this.initFormatter();
    }

    /**
     * @hidden
     */
    @HostListener("keydown.arrowdown", ["$event"])
    public onKeydownArrowDown(event: KeyboardEvent) {
        this.navigateTo(event, Direction.NEXT, 3);
    }

    /**
     * @hidden
     */
    @HostListener("keydown.arrowup", ["$event"])
    public onKeydownArrowUp(event: KeyboardEvent) {
        this.navigateTo(event, Direction.PREV, 3);
    }

    /**
     * @hidden
     */
    @HostListener("keydown.arrowright", ["$event"])
    public onKeydownArrowRight(event: KeyboardEvent) {
        this.navigateTo(event, Direction.NEXT, 1);
    }

    /**
     * @hidden
     */
    @HostListener("keydown.arrowleft", ["$event"])
    public onKeydownArrowLeft(event: KeyboardEvent) {
        this.navigateTo(event, Direction.PREV, 1);
    }

    /**
     * @hidden
     */
    @HostListener("keydown.home", ["$event"])
    public onKeydownHome(event: KeyboardEvent) {
        event.preventDefault();
        event.stopPropagation();

        this.date = this.range.at(0);
        this.activeDateChanged.emit(this.date);
    }

    /**
     * @hidden
     */
    @HostListener("keydown.end", ["$event"])
    public onKeydownEnd(event: KeyboardEvent) {
        event.preventDefault();
        event.stopPropagation();

        this.date = this.range.at(-1);
        this.activeDateChanged.emit(this.date);
    }

    /**
     * @hidden
     */
    @HostListener("keydown.enter", ["$event"])
    public onKeydownEnter(event: KeyboardEvent) {
        event.stopPropagation();

        this.selected.emit(this.date);
        this._onChangeCallback(this.date);
    }

    /**
     * @hidden
     */
    @HostListener("focus")
    protected handleFocus() {
        this.showActive = true;
    }

    /**
     * @hidden
     */
    @HostListener("blur")
    protected handleBlur() {
        this.showActive = false;
    }

    /**
     * @hidden
     */
    public selectDate(value: Date) {
        this.date = value;

        this.selected.emit(this.date);
        this._onChangeCallback(this.date);
    }

    /**
     * @hidden
     */
    public registerOnChange(fn: (v: Date) => void) {
        this._onChangeCallback = fn;
    }

    /**
     * @hidden
     */
    public registerOnTouched(fn: () => void) {
        this._onTouchedCallback = fn;
    }

    /**
     * @hidden
     */
    public writeValue(value: Date) {
        if (value) {
            this.date = value;
        }
    }

    /**
     * @hidden
     */
    protected navigateTo(
        event: KeyboardEvent,
        direction: Direction,
        delta: number,
    ) {
        event.preventDefault();
        event.stopPropagation();

        const date = getNextActiveDate(
            CalendarDay.from(this.date).add(this.dayInterval, direction * delta),
            [],
        );

        const outOfRange = !isDateInRanges(date, [
            {
                type: DateRangeType.Between,
                dateRange: [this.range.at(0), this.range.at(-1)],
            },
        ]);

        if (outOfRange) {
            this.pageChanged.emit(date.native);
        }

        this.date = date.native;
        this.activeDateChanged.emit(this.date);
    }

    /**
     * @hidden
     */
    protected abstract initFormatter(): void;

    /**
     * @hidden
     */
    protected abstract get range(): Date[];
}
