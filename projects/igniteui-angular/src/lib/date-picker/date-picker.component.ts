import { CommonModule, formatDate } from '@angular/common';
import {
    Component,
    ContentChild,
    EventEmitter,
    HostBinding,
    Input,
    NgModule,
    OnDestroy,
    OnInit,
    Output,
    ViewChild,
    ViewContainerRef,
    ElementRef,
    TemplateRef,
    Inject,
    NgZone,
    AfterViewInit,
    HostListener,
    ChangeDetectorRef
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
    IgxCalendarComponent,
    IgxCalendarHeaderTemplateDirective,
    IgxCalendarModule,
    IgxCalendarSubheaderTemplateDirective,
    WEEKDAYS
} from '../calendar/index';
import { IgxIconModule } from '../icon/index';
import { IgxInputGroupModule } from '../input-group/index';
import { Subject, fromEvent, interval, animationFrameScheduler } from 'rxjs';
import { filter, takeUntil, throttle } from 'rxjs/operators';
import { IgxOverlayOutletDirective } from '../directives/toggle/toggle.directive';
import {
    OverlaySettings,
    IgxOverlayService,
    VerticalAlignment,
    HorizontalAlignment,
    PositionSettings,
    ConnectedPositioningStrategy
} from '../services';
import { DateRangeDescriptor } from '../core/dates/dateRange';
import { EditorProvider } from '../core/edit-provider';
import { IgxButtonModule } from '../directives/button/button.directive';
import { IgxRippleModule } from '../directives/ripple/ripple.directive';
import { IgxMaskModule } from '../directives/mask/mask.directive';
import {
    PREDEFINED_FORMAT_OPTIONS,
    PREDEFINED_FORMATS,
    PREDEFINED_MASKS,
    FORMAT_DESC,
    DATE_PARTS,
    parseDateFormat,
    trimUnderlines,
    createDate,
    getSpinnedDateInput,
    getFormatMask,
    IFormatOptions,
    IFormatViews,
    DatePickerInteractionMode,
    DEFAULT_LOCALE_DATE,
    SPIN_DELTA,
    addPromptCharsEditMode,
    getDateValueFromInput,
    getDateFormatPart,
    trimMaskSymbols,
    isFullMonthInput,
    isFullDayInput,
    isFullYearInput,
    getDatePartOnPosition
} from './date-picker.utils';
import { DatePickerDisplayValuePipe, DatePickerInputValuePipe } from './date-picker.pipes';
import { IgxDatePickerBase } from './date-picker.common';
import { KEYS } from '../core/utils';
import { IgxDatePickerTemplateDirective } from './date-picker.directives';

let NEXT_ID = 0;

/**
 * **Ignite UI for Angular Date Picker** -
 * [Documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/date_picker.html)
 *
 * The Ignite UI Date Picker displays a popup calendar that lets users select a single date.
 *
 * Example:
 * ```html
 * <igx-date-picker [(ngModel)]="selectedDate"></igx-date-picker>
 * ```
 */
@Component({
    providers:
        [{ provide: NG_VALUE_ACCESSOR, useExisting: IgxDatePickerComponent, multi: true }],
    // tslint:disable-next-line:component-selector
    selector: 'igx-date-picker',
    styles: [':host {display: block;}'],
    templateUrl: 'date-picker.component.html'
})
export class IgxDatePickerComponent implements IgxDatePickerBase, ControlValueAccessor, EditorProvider, OnInit, OnDestroy, AfterViewInit {
    /**
     * An @Input property that sets the `IgxDatePickerComponent` label.
     * The default label is 'Date'.
     * ```html
     * <igx-date-picker [label]="Calendar"></igx-date-picker>
     * ```
     */
    @Input()
    public label = 'Date';

    /**
     * An @Input property that sets the `IgxDatePickerComponent` label visibility.
     * By default the visibility is set to true.
     * <igx-date-picker [labelVisibility]="false"></igx-date-picker>
     */
    @Input()
    public labelVisibility = true;

    /**
     *An @Input property that sets locales. Default locale is en.
     *```html
     *<igx-date-picker locale="ja-JP" [value]="date"></igx-date-picker>
     *```
     */
    @Input() public locale: 'en';

    /**
     *An @Input property that sets on which day the week starts.
     *```html
     *<igx-date-picker [weekStart]="WEEKDAYS.FRIDAY" cancelButtonLabel="cancel" todayButtonLabel="today"></igx-date-picker>
     *```
     */
    @Input() public weekStart: WEEKDAYS | number = WEEKDAYS.SUNDAY;

    /**
     *Returns the format options of the `IgxDatePickerComponent`.
     *```typescript
     *@ViewChild("MyDatePicker")
     *public datePicker: IgxDatePickerComponent;
     *ngAfterViewInit(){
     *    let formatOptions = this.datePicker.formatOptions;
     *}
     *```
     */
    @Input()
    public get formatOptions(): IFormatOptions {
        return this._formatOptions;
    }

    /**
     *Sets the format options of the `IgxDatePickerComponent`.
     *```typescript
     *public Options;
     *@ViewChild("MyDatePicker")
     *public datePicker: IgxDatePickerComponent;
     *ngAfterViewInit(){
     *    this.Options = {
     *        day: "numeric",
     *        month: "long",
     *        weekday: "long",
     *        year: "numeric"
     *    }
     *this.datePicker.formatOptions = this.Options;
     *}
     *```
     */
    public set formatOptions(formatOptions: IFormatOptions) {
        this._formatOptions = Object.assign(this._formatOptions, formatOptions);
    }

    /**
     *Returns the date format of the `IgxDatePickerComponent` when in edit mode.
     *```typescript
     *@ViewChild("MyDatePicker")
     *public datePicker: IgxDatePickerComponent;
     *ngAfterViewInit(){
     *    let format = this.datePicker.format;
     *}
     *```
     */
    @Input()
    public get format(): string {
        return (this._format === undefined) ? this._defaultDateFormat : this._format;
    }

    /**
    *Sets the date format of the `IgxDatePickerComponent` when in edit mode.
    *```typescript
    *@ViewChild("MyDatePicker")
    *public datePicker: IgxDatePickerComponent;
    *this.datePicker.format = 'yyyy-M-d';
    *}
    *```
    */
    public set format(format: string) {
        this._format = format;
    }

    /**
     *Returns the format views of the `IgxDatePickerComponent`.
     *```typescript
     *@ViewChild("MyDatePicker")
     *public datePicker: IgxDatePickerComponent;
     *ngAfterViewInit(){
     *    let formatViews = this.datePicker.formatViews;
     *}
     *```
     */
    @Input()
    public get formatViews(): IFormatViews {
        return this._formatViews;
    }

    /**
     *Sets the format views of the `IgxDatePickerComponent`.
     *```typescript
     *public Views;
     *@ViewChild("MyDatePicker")
     *public datePicker: IgxDatePickerComponent;
     *ngAfterViewInit(){
     *    this.Views = {day:false, month: false, year:false};
     *    this.datePicker.formatViews = this.Views;
     *}
     *```
     */
    public set formatViews(formatViews: IFormatViews) {
        this._formatViews = Object.assign(this._formatViews, formatViews);
    }

    /**
     * Gets the disabled dates descriptors.
     * ```typescript
     * let disabledDates = this.datepicker.disabledDates;
     * ```
     */
    public get disabledDates(): DateRangeDescriptor[] {
        return this._disabledDates;
    }

    /**
     * Sets the disabled dates' descriptors.
     * ```typescript
     *@ViewChild("MyDatePicker")
     *public datePicker: IgxDatePickerComponent;
     *ngAfterViewInit(){
     *    this.datePicker.disabledDates = [
     *      new DateRangeDescriptor(DateRangeType.Between, [new Date("2020-1-1"), new Date("2020-1-15")]),
     *      new DateRangeDescriptor(DateRangeType.Weekends)];
     *}
     *```
     */
    public set disabledDates(value: DateRangeDescriptor[]) {
        this._disabledDates = value;
    }

    /**
     * Gets the special dates descriptors.
     * ```typescript
     * let specialDates = this.datepicker.specialDates;
     * ```
     */
    public get specialDates(): DateRangeDescriptor[] {
        return this._specialDates;
    }

    /**
     * Sets the special dates' descriptors.
     * ```typescript
     *@ViewChild("MyDatePicker")
     *public datePicker: IgxDatePickerComponent;
     *ngAfterViewInit(){
     *    this.datePicker.specialDates = [
     *      new DateRangeDescriptor(DateRangeType.Between, [new Date("2020-1-1"), new Date("2020-1-15")]),
     *      new DateRangeDescriptor(DateRangeType.Weekends)];
     *}
     *```
     */
    public set specialDates(value: DateRangeDescriptor[]) {
        this._specialDates = value;
    }

    /**
     *Returns the formatted date when `IgxDatePickerComponent` is readonly.
     *```typescript
     *@ViewChild("MyDatePicker")
     *public datePicker: IgxDatePickerComponent;
     *public selection(event){
     *    let selectedDate = this.datePicker.displayData;
     *    alert(selectedDate);
     *}
     *```
     *```html
     *<igx-date-picker #MyDatePicker (onSelection)="selection()" todayButtonLabel="today"></igx-date-picker>
     *```
     */
    public get displayData(): string {
        if (this._value) {
            return this._customFormatChecker(this.formatter, this._value);
        }
    }

    /**
     *Returns the formatted date when `IgxDatePickerComponent` is in edit mode.
     *```typescript
     *@ViewChild("MyDatePicker")
     *public datePicker: IgxDatePickerComponent;
     *public selection(event){
     *    let transformedDate = this.datePicker.transformedDate;
     *    alert(transformedDate);
     *}
     *```
     *```html
     *<igx-date-picker #MyDatePicker (onSelection)="selection()" todayButtonLabel="today"></igx-date-picker>
     *```
     */
    public get transformedDate(): string {
        let result = '';
        if (this._value) {
            const formattedDate = this._transformDate(this._value);
            result = (this._isInEditMode) ? addPromptCharsEditMode(this.dateFormatParts, this.value, formattedDate) : formattedDate;
        } else {
            if (this._cleanInput) {
                result = trimMaskSymbols(this.mask);
            }
        }
        return result;
    }

    constructor(@Inject(IgxOverlayService) private _overlayService: IgxOverlayService,
        private _zone: NgZone,
        private cdr: ChangeDetectorRef) { }

    /**
     * Gets the input group template.
     * ```typescript
     * let template = this.template();
     * ```
     * @memberof IgxTimePickerComponent
     */
    get template(): TemplateRef<any> {
        if (this.datePickerTemplateDirective) {
            return this.datePickerTemplateDirective.template;
        }
        return (this.mode === DatePickerInteractionMode.READONLY) ? this.readOnlyDatePickerTemplate : this.editableDatePickerTemplate;
    }

    /**
     * Gets the context passed to the input group template.
     * @memberof IgxTimePickerComponent
     */
    get context() {
        return {
            value: this.value,
            displayData: this.displayData,
            openCalendar: (event) => { this.openCalendar(event); }
        };
    }

    /**
     *An @Input property that sets the selected date.
     *```typescript
     *public date: Date = new Date();
     *```
     *```html
     *<igx-date-picker [value]="date"></igx-date-picker>
     *```
     */
    @Input()
    public get value(): Date {
        return this._value;
    }

    public set value(date: Date) {
        this._value = date;
        this._onChangeCallback(date);
    }
    /**
     *An @Input property that sets the value of `id` attribute. If not provided it will be automatically generated.
     *```html
     *<igx-date-picker [id]="'igx-date-picker-3'" cancelButtonLabel="cancel" todayButtonLabel="today"></igx-date-picker>
     *```
     */
    @HostBinding('attr.id')
    @Input()
    public id = `igx-date-picker-${NEXT_ID++}`;

    /**
     *An @Input property that applies custom formatter on the selected or passed date.
     *```typescript
     *public date: Date = new Date();
     *private dayFormatter = new Intl.DateTimeFormat("en", { weekday: "long" });
     *private monthFormatter = new Intl.DateTimeFormat("en", { month: "long" });
     *public formatter = (date: Date) => { return `You selected
     *                     ${this.dayFormatter.format(date)},
     *                     ${date.getDate()} ${this.monthFormatter.format(date)},
     *                     ${date.getFullYear()}`;
     *}
     *```
     *```html
     *<igx-date-picker [value]="date" [formatter]="formatter"></igx-date-picker>
     *```
     */
    @Input()
    public formatter: (val: Date) => string;

    /**
     *An @Input property that disables the `IgxDatePickerComponent`.
     *```html
     *<igx-date-picker [disabled]="'true'" cancelButtonLabel="cancel" todayButtonLabel="today"></igx-date-picker>
     * ```
     */
    @Input()
    public disabled: boolean;

    /**
     *An @Input property that sets the orientation of the `IgxDatePickerComponent` header.
     *```html
     *<igx-date-picker [vertical]="'true'" cancelButtonLabel="cancel" todayButtonLabel="today"></igx-date-picker>
     *```
     */
    @Input()
    public vertical = false;

    /**
     *An @Input property that renders today button with custom label.
     *```html
     *<igx-date-picker cancelButtonLabel="cancel" todayButtonLabel="Tomorrow"></igx-date-picker>
     *```
     */
    @Input()
    public todayButtonLabel: string;

    /**
     *An @Input property that renders cancel button with custom label.
     *```html
     *<igx-date-picker cancelButtonLabel="Close" todayButtonLabel="Today"></igx-date-picker>
     *```
     */
    @Input()
    public cancelButtonLabel: string;

    /**
     *An @Input property that sets whether `IgxDatePickerComponent` is readonly or editable.
     *```html
     *<igx-date-picker mode="editable"></igx-date-picker>
     *```
     */
    @Input()
    public mode = DatePickerInteractionMode.READONLY;

    /**
    *@hidden
    */
    @Input()
    public outlet: IgxOverlayOutletDirective | ElementRef;

    /**
     *An event that is emitted when the `IgxDatePickerComponent` calendar is opened.
     *```typescript
     *public open(event){
     *    alert("The date-picker calendar has been opened!");
     *}
     *```
     *```html
     *<igx-date-picker (onOpen)="open($event)" cancelButtonLabel="cancel" todayButtonLabel="today"></igx-date-picker>
     *```
     */
    @Output()
    public onOpen = new EventEmitter<IgxDatePickerComponent>();

    /**
     *"An event that is emitted when the `IgxDatePickerComponent` is closed.
     *```typescript
     *public close(event){
     *    alert("The date-picker has been closed!");
     *}
     *```
     *```html
     *<igx-date-picker (onClose)="close($event)" cancelButtonLabel="cancel" todayButtonLabel="today"></igx-date-picker>
     *```
     */
    @Output()
    public onClose = new EventEmitter<IgxDatePickerComponent>();
    /**
     *An @Output property that is fired when selection is made in the calendar.
     *```typescript
     *public selection(event){
     *    alert("A date has been selected!");
     *}
     *```
     *```html
     *<igx-date-picker (onSelection)="selection($event)" cancelButtonLabel="cancel" todayButtonLabel="today"></igx-date-picker>
     *```
     */
    @Output()
    public onSelection = new EventEmitter<Date>();

    /*
     * @hidden
     */
    @ViewChild('readOnlyDatePickerTemplate', { read: TemplateRef })
    protected readOnlyDatePickerTemplate: TemplateRef<any>;

    /*
     * @hidden
     */
    @ViewChild('editableDatePickerTemplate', { read: TemplateRef })
    protected editableDatePickerTemplate: TemplateRef<any>;

    /*
     * @hidden
     */
    @ViewChild('editableInputGroup', { read: ElementRef })
    protected editableInputGroup: ElementRef;

    /*
     * @hidden
     */
    @ViewChild('editableInput', { read: ElementRef })
    protected editableInput: ElementRef;

    /*
    * @hidden
    */
    @ViewChild('readonlyInput', { read: ElementRef })
    protected readonlyInput: ElementRef;

    @ViewChild('calendar')
    public calendar: IgxCalendarComponent;

    /**
    *@hidden
    */
    @ViewChild('container', { read: ViewContainerRef })
    public container: ViewContainerRef;

    /**
     *@hidden
     */
    @ViewChild('calendarContainer')
    public calendarContainer: ElementRef;

    /**
     *@hidden
     */
    @ContentChild(IgxDatePickerTemplateDirective, { read: IgxDatePickerTemplateDirective })
    protected datePickerTemplateDirective: IgxDatePickerTemplateDirective;

    /**
     *@hidden
     */
    @ContentChild(IgxCalendarHeaderTemplateDirective, { read: IgxCalendarHeaderTemplateDirective })
    public headerTemplate: IgxCalendarHeaderTemplateDirective;

    /**
     *@hidden
     */
    @ContentChild(IgxCalendarSubheaderTemplateDirective, { read: IgxCalendarSubheaderTemplateDirective })
    public subheaderTemplate: IgxCalendarSubheaderTemplateDirective;

    public hasHeader = true;
    public collapsed = true;
    public mask: string;
    public displayValuePipe = new DatePickerDisplayValuePipe(this);
    public inputValuePipe = new DatePickerInputValuePipe(this);
    public dateFormatParts = [];
    public rawDateString: string;

    private _formatOptions = {
        day: 'numeric',
        month: 'short',
        weekday: 'short',
        year: 'numeric'
    };
    private _formatViews = {
        day: false,
        month: true,
        year: false
    };
    private _destroy$ = new Subject<boolean>();
    private _componentID: string;
    private _format: string;
    private _value: Date;
    private _cleanInput = false;
    private _isInEditMode: boolean;
    private _defaultDateFormat: string = PREDEFINED_FORMAT_OPTIONS.SHORT_DATE;

    private _disabledDates: DateRangeDescriptor[] = null;
    private _specialDates: DateRangeDescriptor[] = null;

    private _positionSettings: PositionSettings;
    private _dropDownOverlaySettings: OverlaySettings;
    private _modalOverlaySettings: OverlaySettings;

    // @HostListener('keydown.esc', ['$event'])
    // public onEscKeydown(event) {
    //     this.closeCalendar();
    //         event.preventDefault();
    //         event.stopPropagation();
    // }

    // @HostListener('keydown.spacebar', ['$event'])
    // @HostListener('keydown.space', ['$event'])
    // public onSpaceClick(event) {
    //     this.openCalendar();
    //     event.preventDefault();
    // }

    /**
     *Method that sets the selected date.
     *```typescript
     *public date = new Date();
     *@ViewChild("MyDatePicker")
     *public datePicker: IgxDatePickerComponent;
     *ngAfterViewInit(){
     *    this.datePicker.writeValue(this.date);
     *}
     *```
     *@param value The date you want to select.
     *@memberOf {@link IgxDatePickerComponent}
     */
    public writeValue(value: Date) {
        this.value = value;
        this.cdr.markForCheck();
    }

    /**
     *@hidden
     */
    public registerOnChange(fn: (_: Date) => void) { this._onChangeCallback = fn; }

    /**
     *@hidden
     */
    public registerOnTouched(fn: () => void) { this._onTouchedCallback = fn; }

    /** @hidden */
    public getEditElement() {
        return ((this.mode === DatePickerInteractionMode.READONLY) ? this.readonlyInput : this.editableInput).nativeElement;
    }

    /**
     *@hidden
     */
    public ngOnInit(): void {
        this._positionSettings = {
            horizontalDirection: HorizontalAlignment.Right,
            verticalDirection: VerticalAlignment.Bottom,
        };

        this._dropDownOverlaySettings = {
            closeOnOutsideClick: true,
            modal: false,
            positionStrategy: new ConnectedPositioningStrategy(this._positionSettings),
            outlet: this.outlet
        };

        this._modalOverlaySettings = {
            closeOnOutsideClick: true,
            modal: true,
            outlet: this.outlet
        };

        this._overlayService.onOpened.pipe(
            filter(overlay => overlay.id === this._componentID),
            takeUntil(this._destroy$)).subscribe(() => {
                this._onOpened();
            });

        this._overlayService.onClosed.pipe(
            filter(overlay => overlay.id === this._componentID),
            takeUntil(this._destroy$)).subscribe(() => {
                this._onClosed();
            });

        if (this.calendarContainer) {
            this.calendarContainer.nativeElement.style.display = 'none';
        }

        if (this.mode === DatePickerInteractionMode.EDITABLE) {
            this._getFormatOptions(this.format);
            this.dateFormatParts = parseDateFormat(this.format);
        }
    }

    /**
     *@hidden
     */
    public ngAfterViewInit(): void {
        // if (this.mode === DatePickerInteractionMode.EDITABLE) {
        //     this._zone.runOutsideAngular(() => {
        //         fromEvent(this.getEditElement(), 'keydown').pipe(
        //             throttle(() => interval(0, animationFrameScheduler)),
        //             takeUntil(this._destroy$))
        //             .subscribe((res) => {
        //                 this.onKeydown(res);
        //             });
    }

    /**
     *@hidden
     */
    public ngOnDestroy(): void {
        this._overlayService.hideAll();
        this._destroy$.next(true);
        this._destroy$.complete();
    }

    /**
     *Selects today's date from calendar and change the input field value, @calendar.viewDate and @calendar.value.
     *```typescript
     *@ViewChild("MyDatePicker")
     *public datePicker: IgxDatePickerComponent;
     *ngAfterViewInit(){
     *this.datePicker.triggerTodaySelection();
     *}
     *```
     *@memberOf {@link IgxDatePickerComponent}
     */
    public triggerTodaySelection(): void {
        const today = new Date(Date.now());
        this.handleSelection(today);
    }

    /**
     * Change the calendar selection and calling this method will emit the @calendar.onSelection event,
     * which will fire @handleSelection method.
     *```typescript
     *@ViewChild("MyDatePicker")
     *public datePicker: IgxDatePickerComponent;
     *ngAfterViewInit(){
     *this.datePicker.selectDate(this.date);
     *}
     * ```
     * @param date passed date that has to be set to the calendar.
     * @memberOf {@link IgxDatePickerComponent}
     */
    public selectDate(date: Date): void {
        this.value = date;
        this.onSelection.emit(date);
        this._onChangeCallback(date);
    }

    /**
     * Deselects the calendar date.
     *```typescript
     *@ViewChild("MyDatePicker")
     *public datePicker: IgxDatePickerComponent;
     *ngAfterViewInit(){
     *this.datePicker.deselectDate();
     *}
     * ```
     * @memberOf {@link IgxDatePickerComponent}
     */
    public deselectDate(): void {
        this.value = null;
        this.calendar.deselectDate();
        this._onChangeCallback(null);
    }

    /**
     * Open the dialog and update the calendar.
     *
     * @hidden
     */
    public openCalendar(event): void {
        event.stopPropagation();
        switch (this.mode) {
            case DatePickerInteractionMode.READONLY: {
                this.hasHeader = true;
                this._componentID = this._overlayService.show(this.calendarContainer, this._modalOverlaySettings);
                break;
            }
            case DatePickerInteractionMode.EDITABLE: {
                if (this.collapsed) {
                    this.hasHeader = false;
                    this._dropDownOverlaySettings.positionStrategy.settings.target = this.editableInputGroup.nativeElement;
                    this._componentID = this._overlayService.show(this.calendarContainer, this._dropDownOverlaySettings);
                }
                break;
            }
        }
    }

    public closeCalendar(): void {
        this._overlayService.hide(this._componentID);
    }

    public clear(): void {
        this.deselectDate();
        requestAnimationFrame(() => {
            this._setCursorPosition(0);
        });
    }

    public calculateDate(dateString: string, invokedByEvent: string): void {
        if (dateString !== '') {
            const trimmedData = trimUnderlines(dateString);
            const monthFormatType = getDateFormatPart(this.dateFormatParts, DATE_PARTS.MONTH).formatType;
            const originalDateValue = this.value;
            let newValue;

            if (monthFormatType === FORMAT_DESC.NUMERIC
                || monthFormatType === FORMAT_DESC.TWO_DIGITS) {
                let fullYear;
                const strToManipulate = (invokedByEvent === 'blur') ? this.rawDateString : dateString;

                const day = getDateValueFromInput(this.dateFormatParts, DATE_PARTS.DAY, strToManipulate);
                const month = getDateValueFromInput(this.dateFormatParts, DATE_PARTS.MONTH, strToManipulate);
                const year = getDateValueFromInput(this.dateFormatParts, DATE_PARTS.YEAR, strToManipulate);

                const yearFormat = getDateFormatPart(this.dateFormatParts, DATE_PARTS.YEAR).formatType;
                fullYear = (yearFormat === FORMAT_DESC.TWO_DIGITS) ? '20'.concat(year) : year;

                newValue = createDate(Number(day), Number(month) - 1, Number(fullYear));
            } else {
                newValue = new Date(trimmedData);
            }

            // Restore the time part if any
            if (originalDateValue !== null) {
                newValue.setHours(originalDateValue.getHours());
                newValue.setMinutes(originalDateValue.getMinutes());
                newValue.setSeconds(originalDateValue.getSeconds());
                newValue.setMilliseconds(originalDateValue.getMilliseconds());
            }

            this.value = newValue;
            this._onChangeCallback(newValue);
        }
    }

    /**
     * Evaluates when @calendar.onSelection event was fired
     * and update the input value.
     *
     * @param event selected value from calendar.
     *
     * @hidden
     */
    public handleSelection(date: Date): void {
        if (this.value) {
            date.setHours(this.value.getHours());
            date.setMinutes(this.value.getMinutes());
            date.setSeconds(this.value.getSeconds());
            date.setMilliseconds(this.value.getMilliseconds());
        }

        this.value = date;
        this.calendar.viewDate = date;
        this._onChangeCallback(date);
        this.closeCalendar();
        this.onSelection.emit(date);
    }

    public onBlur(event): void {
        this._isInEditMode = false;
        this.calculateDate(event.target.value, event.type);
    }

    public onKeyDown(event) {
        switch (event.key) {
            case KEYS.UP_ARROW:
            case KEYS.UP_ARROW_IE:
                this.spinValue(event);
                break;
            case KEYS.DOWN_ARROW:
            case KEYS.DOWN_ARROW_IE:
                if (event.altKey) {
                    this.calculateDate(this.getEditElement().value, event.type);
                    this.openCalendar(event);
                } else {
                    this.spinValue(event);
                }
                break;
            default:
                return;
        }
    }

    public onWheel(event) {
        this.spinValue(event);
    }

    public onDoubleClick(event) {
        const datePart = getDatePartOnPosition(this.dateFormatParts, this._getCursorPosition());
        this.getEditElement().setSelectionRange(datePart.position[0], datePart.position[1]);
    }

    public onInput(event) {
        const inputValue = event.target.value;
        // Mandatory date parts
        const dayValue = getDateValueFromInput(this.dateFormatParts, DATE_PARTS.DAY, inputValue);
        const monthValue = getDateValueFromInput(this.dateFormatParts, DATE_PARTS.MONTH, inputValue);
        const yearValue = getDateValueFromInput(this.dateFormatParts, DATE_PARTS.YEAR, inputValue);

        const dayStr = getDateValueFromInput(this.dateFormatParts, DATE_PARTS.DAY, inputValue, false);
        const monthStr = getDateValueFromInput(this.dateFormatParts, DATE_PARTS.MONTH, inputValue, false);

        // While editting, if the input is deleted, total clean up
        if (dayValue === '' && monthValue === '' && yearValue === '') {
            this._cleanInput = true;
            this.deselectDate();
        }

        // While editting, if one date part is deleted, date-picker value is set to null, the remaining input stays intact
        if (dayValue === '' || monthValue === '' || yearValue === '') {
            this.deselectDate();
            const cursorPosition = this._getCursorPosition();
            requestAnimationFrame(() => {
                this.getEditElement().value = inputValue;
                this._setCursorPosition(cursorPosition);
            });
        }

        // If all date parts are completed, change the date-picker value, stay in edit mode
        if (isFullDayInput(this.dateFormatParts, dayValue, dayStr)
            && isFullMonthInput(this.dateFormatParts, monthValue, monthStr)
            && isFullYearInput(this.dateFormatParts, yearValue)
            && event.inputType !== 'deleteContentBackward') {
            this._isInEditMode = true;
            this.calculateDate(inputValue, event.type);
        }
    }

    private spinValue(event) {
        event.preventDefault();
        const cursorPos = this._getCursorPosition();
        const inputValue = event.target.value;
        let sign = 0;
        this._isInEditMode = true;

        if (event.key) {
            sign = (event.key === KEYS.UP_ARROW || event.key === KEYS.UP_ARROW_IE) ? 1 : -1;
        }

        if (event.deltaY) {
            sign = (event.deltaY > 0) ? -1 : 1;
        }

        this.getEditElement().value =
            getSpinnedDateInput(this.dateFormatParts, inputValue, cursorPos, SPIN_DELTA * sign);

        this._setCursorPosition(cursorPos);
        requestAnimationFrame(() => {
            this._setCursorPosition(cursorPos);
        });

        this.calculateDate(event.target.value, event.type);
    }

    private _onOpened(): void {
        this.collapsed = false;
        this.calendarContainer.nativeElement.style.display = 'block';

        if (this.value) {
            this.calendar.value = this.value;
            this.calendar.viewDate = this.value;
        }

        this._onTouchedCallback();
        this.onOpen.emit(this);

        if (this.calendar && this.value) {
            this._focusCalendarDate();
        }
    }

    private _onClosed(): void {
        this.collapsed = true;
        this.calendarContainer.nativeElement.style.display = 'none';
        this.onClose.emit(this);

        if (this.editableInput) {
            this.editableInput.nativeElement.focus();
        }
    }

    // Focus a date, after the calendar appearence into DOM.
    private _focusCalendarDate(): void {
        requestAnimationFrame(() => {
            this.calendar.focusActiveDate();
        });
    }

    private _setLocaleToDate(value: Date): string {
        return value.toLocaleDateString(this.locale);
    }

    private _getCursorPosition(): number {
        return this.getEditElement().selectionStart;
    }

    private _setCursorPosition(start: number, end: number = start): void {
        this.getEditElement().setSelectionRange(start, end);
    }

    private _getFormatOptions(format: string): void {
        switch (format) {
            case PREDEFINED_FORMAT_OPTIONS.SHORT_DATE: {
                this.mask = PREDEFINED_MASKS.SHORT_DATE_MASK;
                this.format = PREDEFINED_FORMATS.SHORT_DATE_FORMAT;
                break;
            }
            case PREDEFINED_FORMAT_OPTIONS.MEDIUM_DATE: {
                this.mask = PREDEFINED_MASKS.MEDIUM_DATE_MASK;
                this.format = PREDEFINED_FORMATS.MEDIUM_DATE_FORMAT;
                break;
            }
            case PREDEFINED_FORMAT_OPTIONS.LONG_DATE: {
                this.mask = PREDEFINED_MASKS.LONG_DATE_MASK;
                this.format = PREDEFINED_FORMATS.LONG_DATE_FORMAT;
                break;
            }
            case PREDEFINED_FORMAT_OPTIONS.FULL_DATE: {
                this.mask = PREDEFINED_MASKS.FULL_DATE_MASK;
                this.format = PREDEFINED_FORMATS.FULL_DATE_FORMAT;
                break;
            }
            default: {
                this.mask = getFormatMask(format);
                this.format = format;
                break;
            }
        }
    }

    /**
     * Apply custom user formatter upon date.
     * @param formatter custom formatter function.
     * @param date passed date
     */
    private _customFormatChecker(formatter: (_: Date) => string, date: Date) {
        return this.formatter ? this.formatter(date) : this._setLocaleToDate(date);
    }

    /*
    * Transforms the date according to the specified format when `IgxDatePickerComponent` is in edit mode
    * using @angular/common formatDate method: https://angular.io/api/common/formatDate
    * @param  value: string | number | Date
    * @returns formatted string
    */
    private _transformDate(value: any): string {
        return formatDate(value, this.format, DEFAULT_LOCALE_DATE);
    }

    private _onTouchedCallback: () => void = () => { };

    private _onChangeCallback: (_: Date) => void = () => { };
}

/**
 * The IgxDatePickerModule provides the {@link IgxDatePickerComponent} inside your application.
 */
@NgModule({
    declarations: [IgxDatePickerComponent, IgxDatePickerTemplateDirective, DatePickerDisplayValuePipe, DatePickerInputValuePipe],
    exports: [IgxDatePickerComponent, IgxDatePickerTemplateDirective, DatePickerDisplayValuePipe, DatePickerInputValuePipe],
    imports: [CommonModule, IgxIconModule, IgxInputGroupModule, IgxCalendarModule, IgxButtonModule, IgxRippleModule, IgxMaskModule]
})
export class IgxDatePickerModule { }
