import {
    Component,
    Output,
    EventEmitter,
    Input,
    HostBinding,
    HostListener,
    ElementRef,
    Injectable,
    ViewChildren,
    QueryList
} from '@angular/core';
import { range, Calendar } from '../calendar';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { HammerGestureConfig, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { IgxCalendarYearDirective } from '../calendar.directives';
import { noop } from 'rxjs';

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
     * Gets/sets whether the view should be rendered
     * according to the locale and yearFormat, if any.
     */
    @Input()
    public formatView: boolean;

    /**
     * Emits an event when a selection is made in the years view.
     * Provides reference the `date` property in the `IgxYearsViewComponent`.
     * ```html
     * <igx-years-view (selected)="onSelection($event)"></igx-years-view>
     * ```
     *
     * @memberof IgxYearsViewComponent
     */
    @Output()
    public selected = new EventEmitter<Date>();

    /**
     * The default css class applied to the component.
     *
     * @hidden
     */
    @HostBinding('class.igx-calendar')
    public styleClass = true;

    /**
     * @hidden
     * @internal
     */
    @ViewChildren(IgxCalendarYearDirective, { read: IgxCalendarYearDirective })
    public calendarDir: QueryList<IgxCalendarYearDirective>;

    /**
     * @hidden
     */
    private _formatterYear: any;

    /**
     * @hidden
     */
    private _locale = 'en';

    /**
     * @hidden
     */
    private _yearFormat = 'numeric';

    /**
     * @hidden
     */
    private _calendarModel: Calendar;
    /**
     * @hidden
     */
    private _date = new Date();

    /**
     * @hidden
     */
    private _onTouchedCallback: () => void = noop;

    /**
     * @hidden
     */
    private _onChangeCallback: (_: Date) => void = noop;

    /**
     * Gets/sets the selected date of the years view.
     * By default it is the current date.
     * ```html
     * <igx-years-view [date]="myDate"></igx-years-view>
     * ```
     * ```typescript
     * let date =  this.yearsView.date;
     * ```
     *
     * @memberof IgxYearsViewComponent
     */
    @Input()
    public get date() {
        return this._date;
    }

    public set date(value: Date) {
        if (!(value instanceof Date)) {
            return;
        }
        this._date = value;
    }

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
     *
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
     *
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
     *
     * @memberof IgxYearsViewComponent
     */
    public set locale(value: string) {
        this._locale = value;
        this.initYearFormatter();
    }

    /**
     * Returns an array of date objects which are then used to properly
     * render the years.
     *
     * Used in the template of the component.
     *
     * @hidden
     */
    public get decade(): number[] {
        const result = [];
        const start = this.date.getFullYear() - 3;
        const end = this.date.getFullYear() + 4;

        for (const year of range(start, end)) {
            result.push(new Date(year, this.date.getMonth(), this.date.getDate()));
        }

        return result;
    }

    constructor(public el: ElementRef) {
        this.initYearFormatter();
        this._calendarModel = new Calendar();
    }

    /**
     * @hidden
     */
    @HostListener('keydown.arrowdown', ['$event'])
    public onKeydownArrowDown(event: KeyboardEvent) {
        event.preventDefault();
        event.stopPropagation();

        this.generateYearRange(1);
        this.calendarDir.find(date => date.isCurrentYear).nativeElement.nextElementSibling.focus();
    }

    /**
     * @hidden
     */
    @HostListener('keydown.arrowup', ['$event'])
    public onKeydownArrowUp(event: KeyboardEvent) {
        event.preventDefault();
        event.stopPropagation();

        this.generateYearRange(-1);
        this.calendarDir.find(date => date.isCurrentYear).nativeElement.previousElementSibling.focus();
    }

    /**
     * @hidden
     */
    @HostListener('keydown.enter')
    public onKeydownEnter() {
        this.selected.emit(this.date);
        this._onChangeCallback(this.date);
    }

    /**
     * Returns the locale representation of the year in the years view.
     *
     * @hidden
     */
    public formattedYear(value: Date): string {
        if (this.formatView) {
            return this._formatterYear.format(value);
        }
        return `${value.getFullYear()}`;
    }

    /**
     * @hidden
     */
    public selectYear(event) {
        this.date = event;

        this.selected.emit(this.date);
        this._onChangeCallback(this.date);
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
    public yearTracker(index, item): string {
        return `${item.getFullYear()}}`;
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
    private initYearFormatter() {
        this._formatterYear = new Intl.DateTimeFormat(this._locale, { year: this.yearFormat });
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
}
