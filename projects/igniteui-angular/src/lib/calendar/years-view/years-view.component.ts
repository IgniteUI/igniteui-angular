import { Component, Output, EventEmitter, Input, HostBinding, HostListener, ElementRef, Injectable} from '@angular/core';
import { range, Calendar } from '../../calendar';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { HammerGestureConfig, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';

let NEXT_ID = 0;

@Injectable()
export class CalendarHammerConfig extends HammerGestureConfig {
    public overrides = {
        pan: { direction: Hammer.DIRECTION_VERTICAL, threshold: 1 }
    };
}

@Component({
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: IgxYearsViewComponent,
            multi: true
        },
        {
            provide: HAMMER_GESTURE_CONFIG,
            useClass: CalendarHammerConfig
        }
    ],
    selector: 'igx-years-view',
    templateUrl: 'years-view.component.html'
})
export class IgxYearsViewComponent implements ControlValueAccessor {

    /**
     * Sets/gets the `id` of the years view.
     * If not set, the `id` will have value `"igx-years-view-0"`.
     * ```html
     * <igx-years-view id = "my-years-view"></igx-years-view>
     * ```
     * ```typescript
     * let yearsViewId =  this.yearsView.id;
     * ```
     * @memberof IgxCalendarComponent
     */
    @HostBinding('attr.id')
    @Input()
    public id = `igx-years-view-${NEXT_ID++}`;

    /**
     * Gets/sets the selected date of the years view.
     * By default it is the current date.
     * ```html
     * <igx-years-view [date]="myDate"></igx-years-view>
     * ```
     * ```typescript
     * let date =  this.yearsView.date;
     * ```
     * @memberof IgxYearsViewComponent
     */
    @Input()
    public date = new Date();

    /**
     * Gets the year format option of the years view.
     * ```typescript
     * let yearFormat = this.yearsView.yearFormat.
     * ```
     */
    @Input()
    public get yearFormat(): string {
        return this._yearFormat;
    }

    /**
     * Sets the year format option of the years view.
     * ```html
     * <igx-years-view [yearFormat]="numeric"></igx-years-view>
     * ```
     * @memberof IgxYearsViewComponent
     */
    public set yearFormat(value: string) {
        this._yearFormat = value;
        this.initYearFormatter();
    }

    /**
     * Gets the `locale` of the years view.
     * Default value is `"en"`.
     * ```typescript
     * let locale =  this.yearsView.locale;
     * ```
     * @memberof IgxYearsViewComponent
     */
    @Input()
    public get locale(): string {
        return this._locale;
    }

    /**
     * Sets the `locale` of the years view.
     * Expects a valid BCP 47 language tag.
     * Default value is `"en"`.
     * ```html
     * <igx-years-view [locale]="de"></igx-years-view>
     * ```
     * @memberof IgxYearsViewComponent
     */
    public set locale(value: string) {
        this._locale = value;
        this.initYearFormatter();
    }

    /**
     * Emits an event when a selection is made in the years view.
     * Provides reference the `date` property in the `IgxYearsViewComponent`.
     * ```html
     * <igx-years-view (onSelection)="onSelection($event)"></igx-years-view>
     * ```
     * @memberof IgxYearsViewComponent
     */
    @Output()
    public onSelection = new EventEmitter<Date>();

    /**
     * The default css class applied to the component.
     *
     * @hidden
     */
    @HostBinding('class.igx-calendar')
    public styleClass = true;

    /**
     * The default `tabindex` attribute for the component.
     *
     * @hidden
     */
    @HostBinding('attr.tabindex')
    public tabindex = 0;

    /**
     * Returns an array of date objects which are then used to properly
     * render the years.
     *
     * Used in the template of the component.
     *
     * @hidden
     */
    get decade(): number[] {
        const result = [];
        const start = this.date.getFullYear() - 3;
        const end = this.date.getFullYear() + 4;

        for (const year of range(start, end)) {
            result.push(new Date(year, this.date.getMonth(), this.date.getDate()));
        }

        return result;
    }

    /**
     *@hidden
     */
    private _formatterYear: any;

    /**
     *@hidden
     */
    private _locale = 'en';

    /**
     *@hidden
     */
    private _yearFormat = 'numeric';

    /**
     *@hidden
     */
    private _calendarModel: Calendar;

    /**
     *@hidden
     */
    private _onTouchedCallback: () => void = () => { };
    /**
     *@hidden
     */
    private _onChangeCallback: (_: Date) => void = () => { };

    constructor(public el: ElementRef) {
        this.initYearFormatter();
        this._calendarModel = new Calendar();
    }

    /**
     * Returns the locale representation of the year in the years view.
     *
     * @hidden
     */
    public formattedYear(value: Date): string {
        return this._formatterYear.format(value);
    }

    /**
     *@hidden
     */
    public selectYear(event) {
        this.date = event;

        this.onSelection.emit(this.date);
        this._onChangeCallback(this.date);
    }

    /**
     *@hidden
     */
    public scroll(event) {
        event.preventDefault();
        event.stopPropagation();

        const delta = event.deltaY < 0 ? -1 : 1;
        this.generateYearRange(delta);
    }

    /**
     *@hidden
     */
    public pan(event) {
        const delta = event.deltaY < 0 ? 1 : -1;
        this.generateYearRange(delta);
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
    public yearTracker(index, item): string {
        return `${item.getFullYear()}}`;
    }

    /**
     * @hidden
     */
    @HostListener('keydown.arrowdown', ['$event'])
    public onKeydownArrowDown(event: KeyboardEvent) {
        event.preventDefault();
        event.stopPropagation();

        this.generateYearRange(1);
    }

    /**
     * @hidden
     */
    @HostListener('keydown.arrowup', ['$event'])
    public onKeydownArrowUp(event: KeyboardEvent) {
        event.preventDefault();
        event.stopPropagation();

        this.generateYearRange(-1);
    }

    /**
     * @hidden
     */
    @HostListener('keydown.enter')
    public onKeydownEnter() {
        this.onSelection.emit(this.date);
        this._onChangeCallback(this.date);
    }

    /**
     *@hidden
     */
    private initYearFormatter() {
        this._formatterYear = new Intl.DateTimeFormat(this._locale, { year: this.yearFormat });
    }

    /**
     *@hidden
     */
    private generateYearRange(delta: number) {
        const currentYear = new Date().getFullYear();

        if ((delta > 0 && this.date.getFullYear() - currentYear >= 95) ||
            (delta < 0 && currentYear - this.date.getFullYear() >= 95)) {
            return;
        }
        this.date = this._calendarModel.timedelta(this.date, 'year', delta);
    }
}
