import {
    Output,
    EventEmitter,
    Input,
    HostListener,
    Injectable,
    ViewChildren,
    QueryList,
    booleanAttribute,
    Directive,
} from "@angular/core";
import { noop } from 'rxjs';
import { Calendar } from "../calendar";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import {
    HammerGestureConfig,
} from "@angular/platform-browser";
import { IGX_CALENDAR_VIEW_ITEM, IgxCalendarMonthDirective, IgxCalendarYearDirective } from '../calendar.directives';

export enum Direction {
    NEXT = 1,
    PREV = -1,
}

@Injectable()
export class CalendarHammerConfig extends HammerGestureConfig {
    public override overrides = {
        pan: { direction: Hammer.DIRECTION_VERTICAL, threshold: 1 },
    };
}

@Directive({
    providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: IgxCalendarViewDirective, multi: true }],
    standalone: true,
})
export abstract class IgxCalendarViewDirective implements ControlValueAccessor {
    /**
     * @hidden
     * @internal
     */
    protected abstract tagName: string;

    /**
     * Gets/sets whether the view should be rendered
     * according to the locale and format, if any.
     */
    @Input({ transform: booleanAttribute })
    public formatView: boolean;

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
     * @hidden
     * @internal
     */
    @ViewChildren(IGX_CALENDAR_VIEW_ITEM, { read: IGX_CALENDAR_VIEW_ITEM })
    public viewItems: QueryList<IgxCalendarMonthDirective | IgxCalendarYearDirective>;

    /**
     * @hidden
     */
    protected _formatter: any;

    /**
     * @hidden
     */
    protected _locale = "en";

    /**
     * @hidden
     */
    protected _calendarModel: Calendar;

    /**
     * @hidden
     * @internal
     */
    protected activeDate: Date;

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
        if (!(value instanceof Date)) {
            return;
        }
        this._date = value;
        this.updateOnDateChange();
    }

    public get date() {
        return this._date;
    }

    /**
     * @hidden
     * @internal
     */
    protected updateOnDateChange() {
        this.activeDate = this.date;
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

    constructor() {
        this.initFormatter();
        this._calendarModel = new Calendar();
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
    @HostListener('keydown.home', ['$event'])
    public onKeydownHome(event: KeyboardEvent) {
        event.preventDefault();
        event.stopPropagation();

        const date = this.viewItems.toArray()[0];
        this.activeDate = date.value;
        date.nativeElement.focus();
    }

    /**
     * @hidden
     */
    @HostListener('keydown.end', ['$event'])
    public onKeydownEnd(event: KeyboardEvent) {
        event.preventDefault();
        event.stopPropagation();

        const dates = this.viewItems.toArray();
        const date = dates.at(-1);
        this.activeDate = date.value;
        date.nativeElement.focus();
    }

    /**
     * @hidden
     */
    @HostListener("keydown.enter", ["$event"])
    public onKeydownEnter(event: KeyboardEvent) {
        const value = this.viewItems.find((date) => date.nativeElement === event.target).value;
        this.date = new Date(value.getFullYear(), value.getMonth(), this.date.getDate());

        this.selected.emit(this.date);
        this._onChangeCallback(this.date);
    }

    /**
     * @hidden
     */
    public selectDate(event: Date) {
        this.date = event;
        this.activeDate = this.date;

        this.selected.emit(this.date);
        this._onChangeCallback(this.date);
    }

    /**
     * @hidden @internal
     */
    public focusActiveDate() {
        if (this.activeDate) {
            const dates = this.viewItems.toArray();
            const date = dates.find(d => d.value.getTime() === this.activeDate.getTime());
            date?.nativeElement.focus();
        }
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
    protected abstract navigateTo(event: KeyboardEvent, direction: Direction, delta: number): void;

    /**
     * @hidden @internal
     */
    protected abstract initFormatter(): void;
}
