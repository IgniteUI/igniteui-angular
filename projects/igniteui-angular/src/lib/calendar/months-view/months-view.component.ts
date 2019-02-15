import {
    Component,
    Output,
    EventEmitter,
    Input,
    HostBinding,
    HostListener,
    ViewChildren,
    QueryList,
    ElementRef
} from '@angular/core';
import { Calendar } from '../calendar';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IgxCalendarMonthDirective } from '../calendar.directives';

let NEXT_ID = 0;

@Component({
    providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: IgxMonthsViewComponent, multi: true }],
    selector: 'igx-months-view',
    templateUrl: 'months-view.component.html'
})
export class IgxMonthsViewComponent implements ControlValueAccessor {

    /**
     * Sets/gets the `id` of the months view.
     * If not set, the `id` will have value `"igx-months-view-0"`.
     * ```html
     * <igx-months-view id="my-months-view"></igx-months-view>
     * ```
     * ```typescript
     * let monthsViewId =  this.monthsView.id;
     * ```
     * @memberof IgxMonthsViewComponent
     */
    @HostBinding('attr.id')
    @Input()
    public id = `igx-months-view-${NEXT_ID++}`;

    /**
     * Gets/sets the selected date of the months view.
     * By default it is the current date.
     * ```html
     * <igx-months-view [date]="myDate"></igx-months-view>
     * ```
     * ```typescript
     * let date =  this.monthsView.date;
     * ```
     * @memberof IgxMonthsViewComponent
     */
    @Input()
    public date = new Date();

    /**
     * Gets the month format option of the months view.
     * ```typescript
     * let monthFormat = this.monthsView.monthFormat.
     * ```
     */
    @Input()
    public get monthFormat(): string {
        return this._monthFormat;
    }

    /**
     * Sets the month format option of the months view.
     * ```html
     * <igx-months-view> [monthFormat] = "short'"</igx-months-view>
     * ```
     * @memberof IgxMonthsViewComponent
     */
    public set monthFormat(value: string) {
        this._monthFormat = value;
        this.initMonthFormatter();
    }

    /**
     * Gets the `locale` of the months view.
     * Default value is `"en"`.
     * ```typescript
     * let locale =  this.monthsView.locale;
     * ```
     * @memberof IgxMonthsViewComponent
     */
    @Input()
    public get locale(): string {
        return this._locale;
    }

    /**
     * Sets the `locale` of the months view.
     * Expects a valid BCP 47 language tag.
     * Default value is `"en"`.
     * ```html
     * <igx-months-view [locale]="de"></igx-months-view>
     * ```
     * @memberof IgxMonthsViewComponent
     */
    public set locale(value: string) {
        this._locale = value;
        this.initMonthFormatter();
    }

    /**
     * Emits an event when a selection is made in the months view.
     * Provides reference the `date` property in the `IgxMonthsViewComponent`.
     * ```html
     * <igx-months-view (onSelection)="onSelection($event)"></igx-months-view>
     * ```
     * @memberof IgxMonthsViewComponent
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
     * @hidden
     */
    @ViewChildren(IgxCalendarMonthDirective, { read: IgxCalendarMonthDirective })
    public dates: QueryList<IgxCalendarMonthDirective>;


    /**
     * The default `tabindex` attribute for the component.
     *
     * @hidden
     */
    @HostBinding('attr.tabindex')
    public tabindex = 0;

    /**
     * Returns an array of date objects which are then used to
     * properly render the month names.
     *
     * Used in the template of the component
     *
     * @hidden
     */
    get months(): Date[] {
        let start = new Date(this.date.getFullYear(), 0, 1);
        const result = [];

        for (let i = 0; i < 12; i++) {
            result.push(start);
            start = this._calendarModel.timedelta(start, 'month', 1);
        }

        return result;
    }

    /**
     *@hidden
     */
    private _formatterMonth: any;

    /**
     *@hidden
     */
    private _locale = 'en';

    /**
     *@hidden
     */
    private _monthFormat = 'short';

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
        this.initMonthFormatter();
        this._calendarModel = new Calendar();
    }

    /**
     * Returns the locale representation of the month in the months view.
     *
     * @hidden
     */
    public formattedMonth(value: Date): string {
        return this._formatterMonth.format(value);
    }

    /**
     *@hidden
     */
    public selectMonth(event) {
        this.onSelection.emit(event);

        this.date = event;
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
    public monthTracker(index, item): string {
        return `${item.getMonth()}}`;
    }

    /**
     *@hidden
     */
    private initMonthFormatter() {
        this._formatterMonth = new Intl.DateTimeFormat(this._locale, { month: this.monthFormat });
    }

    /**
     * @hidden
     */
    @HostListener('keydown.arrowup', ['$event'])
    public onKeydownArrowUp(event: KeyboardEvent) {
        event.preventDefault();
        event.stopPropagation();

        const node = this.dates.find((date) => date.nativeElement === event.target);
        if (!node) {
            return;
        }

        const months = this.dates.toArray();
        if (months.indexOf(node) - 3 >= 0) {
            const month = months[months.indexOf(node) - 3];

            month.nativeElement.focus();
         }
    }

    /**
     * @hidden
     */
    @HostListener('keydown.arrowdown', ['$event'])
    public onKeydownArrowDown(event: KeyboardEvent) {
        event.preventDefault();
        event.stopPropagation();

        const node = this.dates.find((date) => date.nativeElement === event.target);
        if (!node) {
            return;
        }

        const months = this.dates.toArray();
        if (months.indexOf(node) + 3 < months.length) {
            const month = months[months.indexOf(node) + 3];

            month.nativeElement.focus();
         }
    }

    /**
     * @hidden
     */
    @HostListener('keydown.arrowright', ['$event'])
    public onKeydownArrowRight(event: KeyboardEvent) {
        event.preventDefault();
        event.stopPropagation();

        const node = this.dates.find((date) => date.nativeElement === event.target);
        if (!node) { return; }

        const months = this.dates.toArray();
        if (months.indexOf(node) + 1 < months.length) {
            const month = months[months.indexOf(node) + 1];

            month.nativeElement.focus();
        }
    }

    /**
     * @hidden
     */
    @HostListener('keydown.arrowleft', ['$event'])
    public onKeydownArrowLeft(event: KeyboardEvent) {
        event.preventDefault();
        event.stopPropagation();

        const node = this.dates.find((date) => date.nativeElement === event.target);
        if (!node) { return; }

        const months = this.dates.toArray();
        if (months.indexOf(node) - 1 >= 0) {
            const month = months[months.indexOf(node) - 1];

            month.nativeElement.focus();
        }
    }

    /**
     * @hidden
     */
    @HostListener('keydown.home', ['$event'])
    public onKeydownHome(event: KeyboardEvent) {
        event.preventDefault();
        event.stopPropagation();

        const month = this.dates.toArray()[0];

        month.nativeElement.focus();
    }

    /**
     * @hidden
     */
    @HostListener('keydown.end', ['$event'])
    public onKeydownEnd(event: KeyboardEvent) {
        event.preventDefault();
        event.stopPropagation();

        const months = this.dates.toArray();
        const month = months[months.length - 1];

        month.nativeElement.focus();
    }

    /**
     * @hidden
     */
    @HostListener('keydown.enter', ['$event'])
    public onKeydownEnter(event) {
        const value = this.dates.find((date) => date.nativeElement === event.target).value;
        this.date = new Date(value.getFullYear(), value.getMonth(), this.date.getDate());

        this.onSelection.emit(this.date);
        this._onChangeCallback(this.date);
    }
}
