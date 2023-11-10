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
    QueryList,
    booleanAttribute,
    AfterViewChecked
} from '@angular/core';
import { Calendar } from '../calendar';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { HammerGestureConfig, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { IgxCalendarYearDirective } from '../calendar.directives';
import { noop } from 'rxjs';
import { NgFor } from '@angular/common';

enum Direction {
    NEXT = 1,
    PREV = -1
}

@Injectable()
export class CalendarHammerConfig extends HammerGestureConfig {
    public override overrides = {
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
    templateUrl: 'years-view.component.html',
    standalone: true,
    imports: [NgFor, IgxCalendarYearDirective]
})
export class IgxYearsViewComponent implements ControlValueAccessor, AfterViewChecked {
    /**
     * Gets/sets whether the view should be rendered
     * according to the locale and yearFormat, if any.
     */
    @Input({ transform: booleanAttribute })
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
     * Emits an event when a page changes in the years view.
     * Provides reference the `date` property in the `IgxMonthsViewComponent`.
     * ```html
     * <igx-months-view (pageChanged)="onPageChanged($event)"></igx-months-view>
     * ```
     *
     * @memberof IgxMonthsViewComponent
     * @hidden @internal
     */
    @Output()
    public pageChanged = new EventEmitter<Date>();

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
     * @internal
     */
    protected activeYear: number;
    
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
	 * @hidden
	 */
	private isMonthView: boolean = false;

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
    public set date(value: Date) {
        if (!(value instanceof Date)) {
            return;
        }
        this._date = value;
        this.activeYear = this.date.getFullYear();
    }

    public get date() {
        return this._date;
    }

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
    public get decade() {
		return this._calendarModel.decadedates(this.date);
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
        this.navigateToYear(event, Direction.NEXT, 3);
    }

    /**
     * @hidden
     */
    @HostListener('keydown.arrowup', ['$event'])
    public onKeydownArrowUp(event: KeyboardEvent) {
        this.navigateToYear(event, Direction.PREV, 3);
    }

    /**
     * @hidden
     */
    @HostListener('keydown.arrowright', ['$event'])
    public onKeydownArrowRight(event: KeyboardEvent) {
        this.navigateToYear(event, Direction.NEXT, 1);
    }

    /**
     * @hidden
     */
    @HostListener('keydown.arrowleft', ['$event'])
    public onKeydownArrowLeft(event: KeyboardEvent) {
        this.navigateToYear(event, Direction.PREV, 1);
    }

    /**
     * @hidden
     */
    @HostListener('keydown.enter', ['$event'])
    public onKeydownEnter(event) {
        const value = this.calendarDir.find((date) => date.nativeElement === event.target).value;
        this.date = new Date(value.getFullYear(), value.getMonth(), this.date.getDate());
        this.activeYear = this.date.getFullYear();
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
    public selectYear(event: Date) {
        this.date = event;
        this.activeYear = this.date.getFullYear();

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
    private navigateToYear(event: KeyboardEvent, direction: Direction, delta: number) {
        event.preventDefault();
        event.stopPropagation();

        const node = this.calendarDir.find((date) => date.nativeElement === event.target);
        if (!node) return;

        const _date = new Date(this.activeYear, this.date.getMonth());
        const _delta = this._calendarModel.timedelta(_date, 'year', direction * delta);
        const years = this._calendarModel.decadedates(_delta);
        const hasNextYear = years.find((year) => year.getFullYear() === this.activeYear);
        
        if (!hasNextYear) {
            this.pageChanged.emit(_delta);
        }

        this.activeYear = _delta.getFullYear();
    }

    /**
     * @hidden
     */
    public ngAfterViewChecked() {
        const years = this.calendarDir.toArray();
        const idx = years.findIndex((year) => year.value.getFullYear() === this.activeYear);
        years[idx].nativeElement.focus();
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
