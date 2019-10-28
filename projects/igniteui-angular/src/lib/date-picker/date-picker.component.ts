import { CommonModule, formatDate } from '@angular/common';
import {
    Component,
    ContentChild,
    EventEmitter,
    HostBinding,
    Input,
    NgModule,
    OnDestroy,
    Output,
    ViewChild,
    ElementRef,
    TemplateRef,
    Inject,
    ChangeDetectorRef,
    HostListener,
    NgModuleRef,
    OnInit,
    AfterViewInit
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
    IgxCalendarComponent,
    IgxCalendarHeaderTemplateDirective,
    IgxCalendarModule,
    IgxCalendarSubheaderTemplateDirective,
    WEEKDAYS,
    isDateInRanges
} from '../calendar/index';
import { IgxIconModule } from '../icon/index';
import { IgxInputGroupModule, IgxInputDirective, IgxInputGroupComponent } from '../input-group/index';
import { Subject, fromEvent, animationFrameScheduler, interval } from 'rxjs';
import { filter, takeUntil, throttle } from 'rxjs/operators';
import { IgxOverlayOutletDirective } from '../directives/toggle/toggle.directive';
import { IgxTextSelectionModule} from '../directives/text-selection/text-selection.directive';
import {
    OverlaySettings,
    IgxOverlayService,
    PositionSettings,
    AbsoluteScrollStrategy,
    AutoPositionStrategy,
    OverlayCancelableEventArgs
} from '../services/index';
import { DateRangeDescriptor } from '../core/dates/dateRange';
import { EditorProvider } from '../core/edit-provider';
import { IgxButtonModule } from '../directives/button/button.directive';
import { IgxRippleModule } from '../directives/ripple/ripple.directive';
import { IgxMaskModule } from '../directives/mask/mask.directive';
import {
    DatePickerUtil,
    DateState
} from './date-picker.utils';
import { DatePickerDisplayValuePipe, DatePickerInputValuePipe } from './date-picker.pipes';
import { IDatePicker } from './date-picker.common';
import { KEYS, CancelableBrowserEventArgs, isIE, isEqual, IBaseEventArgs } from '../core/utils';
import { IgxDatePickerTemplateDirective, IgxDatePickerActionsDirective } from './date-picker.directives';
import { IgxCalendarContainerComponent } from './calendar-container.component';
import { InteractionMode } from '../core/enums';
import { fadeIn, fadeOut } from '../animations/fade';
import { DeprecateProperty } from '../core/deprecateDecorators';

let NEXT_ID = 0;

/**
 * This interface is used to provide information about date picker reference and its current value
 * when onDisabledDate event is fired.
 */
export interface IDatePickerDisabledDateEventArgs extends IBaseEventArgs {
    datePicker: IgxDatePickerComponent;
    currentValue: Date;
}

/**
 * This interface is used to provide information about date picker reference and its previously valid value
 * when onValidationFailed event is fired.
 */
export interface IDatePickerValidationFailedEventArgs extends IBaseEventArgs {
    datePicker: IgxDatePickerComponent;
    prevValue: Date;
}

/**
 * This interface is used to configure calendar format view options.
 */
export interface IFormatViews {
    day?: boolean;
    month?: boolean;
    year?: boolean;
}

/**
 * This interface is used to configure calendar format options.
 */
export interface IFormatOptions {
    day?: string;
    month?: string;
    weekday?: string;
    year?: string;
}

/**
 * This enumeration is used to configure the date picker to operate with pre-defined format option used in Angular DatePipe.
 * 'https://angular.io/api/common/DatePipe'
 * 'shortDate': equivalent to 'M/d/yy' (6/15/15).
 * 'mediumDate': equivalent to 'MMM d, y' (Jun 15, 2015).
 * 'longDate': equivalent to 'MMMM d, y' (June 15, 2015).
 * 'fullDate': equivalent to 'EEEE, MMMM d, y' (Monday, June 15, 2015).
 */
export enum PredefinedFormatOptions {
    ShortDate = 'shortDate',
    MediumDate = 'mediumDate',
    LongDate = 'longDate',
    FullDate = 'fullDate'
}

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
        [{
            provide: NG_VALUE_ACCESSOR,
            useExisting: IgxDatePickerComponent,
            multi: true
        }],
    // tslint:disable-next-line:component-selector
    selector: 'igx-date-picker',
    templateUrl: 'date-picker.component.html',
    styles: [`
        :host {
            display: block;
        }
    `]
})
export class IgxDatePickerComponent implements IDatePicker, ControlValueAccessor, EditorProvider, OnInit, AfterViewInit, OnDestroy {
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
     * Sets/gets whether the inactive dates (dates that are out of the current month) will be hidden.
     * Default value is `false`.
     * ```html
     * <igx-date-picker [hideOutsideDays]="true"></igx-date-picker>
     * ```
     * ```typescript
     * let hideOutsideDays = this.datePicker.hideOutsideDays;
     * ```
     */
    @Input()
    public hideOutsideDays: boolean;

    /**
     * Sets/gets the number of month views displayed.
     * Default value is `1`.
     * ```html
     * <igx-date-picker [monthsViewNumber]="2"></igx-date-picker>
     * ```
     * ```typescript
     * let monthViewsDisplayed = this.datePicker.monthsViewNumber;
     * ```
     */
    @Input()
    public monthsViewNumber = 1;

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
     *Returns the date display format of the `IgxDatePickerComponent` in dropdown mode.
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
        return (this._format === undefined) ? PredefinedFormatOptions.ShortDate : this._format;
    }

    /**
    *Sets the date format of the `IgxDatePickerComponent` when in editable dropdown mode.
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
     *Returns the date mask of the `IgxDatePickerComponent` when in editable dropdown mode.
     *```typescript
     *@ViewChild("MyDatePicker")
     *public datePicker: IgxDatePickerComponent;
     *ngAfterViewInit(){
     *    let mask = this.datePicker.mask;
     *}
     *```
     */
    @Input()
    public mask: string;

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
    @Input()
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
     *     {type: DateRangeType.Between, dateRange: [new Date("2020-1-1"), new Date("2020-1-15")]},
     *     {type: DateRangeType.Weekends}];
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
    @Input()
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
     *     {type: DateRangeType.Between, dateRange: [new Date("2020-1-1"), new Date("2020-1-15")]},
     *     {type: DateRangeType.Weekends}];
     *}
     *```
     */
    public set specialDates(value: DateRangeDescriptor[]) {
        this._specialDates = value;
    }

    @Input()
    public get modalOverlaySettings(): OverlaySettings {
        return this._modalOverlay;
    }

    public set modalOverlaySettings(value: OverlaySettings) {
        this._modalOverlay = value;
    }

    @Input()
    public get dropDownOverlaySettings(): OverlaySettings {
        return this._dropDownOverlaySettings || this._defaultDropDownOverlaySettings;
    }

    public set dropDownOverlaySettings(value: OverlaySettings) {
        this._dropDownOverlaySettings = value;
    }

    /**
     *Returns the formatted date when `IgxDatePickerComponent` is in dialog mode.
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
        if (this.value) {
            return this._customFormatChecker(this.formatter, this.value);
        }
        return '';
    }

    /**
     hidden
     */
    public get transformedDate(): string {
        if (this._value) {
            this._transformedDate = (this._isInEditMode) ? this._getEditorDate(this._value) : this._getDisplayDate(this._value);
            this.isEmpty = false;
        } else {
            this._transformedDate = (this._isInEditMode) ? DatePickerUtil.maskToPromptChars(this.inputMask) : '';
        }
        return this._transformedDate;
    }

    public set transformedDate(value) {
        this._transformedDate = value;
    }

    constructor(@Inject(IgxOverlayService) private _overlayService: IgxOverlayService, public element: ElementRef,
        private _cdr: ChangeDetectorRef, private _moduleRef: NgModuleRef<any>) { }

    /**
     * Gets the input group template.
     * ```typescript
     * let template = this.template();
     * ```
     * @memberof IgxDatePickerComponent
     */
    get template(): TemplateRef<any> {
        if (this.datePickerTemplateDirective) {
            return this.datePickerTemplateDirective.template;
        }
        return (this.mode === InteractionMode.Dialog) ? this.readOnlyDatePickerTemplate : this.editableDatePickerTemplate;
    }

    /**
     * Gets the context passed to the input group template.
     * @memberof IgxDatePickerComponent
     */
    get context() {
        return {
            disabled: this.disabled,
            disabledDates: this.disabledDates,
            displayData: this.displayData,
            format: this.format,
            isSpinLoop: this.isSpinLoop,
            label: this.label,
            labelVisibility: this.labelVisibility,
            locale: this.locale,
            mask: this.mask,
            mode: this.mode,
            specialDates: this.specialDates,
            value: this.value,
            openDialog: (target?: HTMLElement) => this.openDialog(target)
        };
    }

    /**
     *An @Input property that gets/sets the selected date.
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
     *An @Input property that applies a custom formatter function on the selected or passed date.
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
     *An @Input property that sets whether `IgxDatePickerComponent` is in dialog or drop down mode.
     *```html
     *<igx-date-picker mode="dropdown"></igx-date-picker>
     *```
     */
    @Input()
    public mode = InteractionMode.Dialog;

    /**
     *An @Input property that sets whether the `IgxDatePickerComponent` date parts would spin continuously or stop when min/max is reached.
     *```html
     *<igx-date-picker [isSpinLoop]="false"></igx-date-picker>
     *```
     */
    @Input()
    public isSpinLoop = true;

    /**
     * Determines the container the popup element should be attached to.
     *
     * ```html
     * <div igxOverlayOutlet #outlet="overlay-outlet"></div>
     * //..
     * <igx-date-picker [outlet]="outlet"></igx-date-picker>
     * //..
     * ```
     * Where `outlet` is an instance of `IgxOverlayOutletDirective` or an `ElementRef`.
     */
    @Input()
    public outlet: IgxOverlayOutletDirective | ElementRef;

    /**
     * @deprecated Use 'onOpened' instead.
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
    @DeprecateProperty(`'onOpen' @Output property is deprecated. Use 'onOpened' instead.`)
    @Output()
    public get onOpen(): EventEmitter<IgxDatePickerComponent> {
        return this._onOpen;
    }

    public set onOpen(val: EventEmitter<IgxDatePickerComponent>) {
        this._onOpen = val;
    }

    /**
     *An event that is emitted when the `IgxDatePickerComponent` calendar is opened.
    */
    @Output()
    public onOpened = new EventEmitter<IgxDatePickerComponent>();

    /**
     * @deprecated Use 'onClosed' instead.
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
    @DeprecateProperty(`'onClose' @Output property is deprecated. Use 'onClosed' instead.`)
    @Output()
    public get onClose(): EventEmitter<IgxDatePickerComponent> {
        return this._onClose;
    }

    public set onClose(val: EventEmitter<IgxDatePickerComponent>) {
        this._onClose = val;
    }

    /**
     *An event that is emitted after the `IgxDatePickerComponent` is closed.
    */
    @Output()
    public onClosed = new EventEmitter<IgxDatePickerComponent>();

    /**
     * An event that is emitted when the `IgxDatePickerComponent` is being closed.
     */
    @Output()
    public onClosing = new EventEmitter<CancelableBrowserEventArgs & IBaseEventArgs>();

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

    /**
     *An @Output property that is fired when date picker value is changed.
     *```typescript
     *public valueChanged(event){
        *    alert("Date picker value is changed");
        *}
        *```
        *```html
        *<igx-date-picker (valueChange)="valueChanged($event)" mode="dropdown"></igx-date-picker>
        *```
    */
    @Output()
    public valueChange = new EventEmitter<Date>();

    /**
    *An @Output property that fires when the user types/spins to a disabled date in the date-picker editor.
    *```typescript
    *public onDisabledDate(event){
    *    alert("This date is disabled!");
    *}
    *```
    *```html
    *<igx-date-picker (onDisabledDate)="onDisabledDate($event)"></igx-date-picker>
    *```
    */
    @Output()
    public onDisabledDate = new EventEmitter<IDatePickerDisabledDateEventArgs>();

    /**
    *An @Output property that fires when the user types/spins invalid date in the date-picker editor.
    *```typescript
    *public onValidationFailed(event){
        *    alert("This date is not valid!");
        *}
        *```
        *```html
        *<igx-date-picker (onValidationFailed)="onValidationFailed($event)"></igx-date-picker>
        *```
        */
    @Output()
    public onValidationFailed = new EventEmitter<IDatePickerValidationFailedEventArgs>();

    /*
     * @hidden
     */
    @ViewChild('readOnlyDatePickerTemplate', { read: TemplateRef, static: true })
    protected readOnlyDatePickerTemplate: TemplateRef<any>;

    /*
     * @hidden
     */
    @ViewChild('editableDatePickerTemplate', { read: TemplateRef, static: true })
    protected editableDatePickerTemplate: TemplateRef<any>;

    /*
     * @hidden
     */
    @ViewChild(IgxInputGroupComponent, { static: false })
    protected inputGroup: IgxInputGroupComponent;

    /*
     * @hidden
     */
    @ViewChild('editableInput', { read: ElementRef, static: false })
    protected editableInput: ElementRef;

    /*
    * @hidden
    */
    @ViewChild('readonlyInput', { read: ElementRef, static: false })
    protected readonlyInput: ElementRef;

    /*
    * @hidden
    */
    @ContentChild(IgxInputDirective, { static: false })
    protected input: IgxInputDirective;

    /**
     *@hidden
     */
    @ContentChild(IgxDatePickerTemplateDirective, { read: IgxDatePickerTemplateDirective, static: false })
    protected datePickerTemplateDirective: IgxDatePickerTemplateDirective;

    /**
     *@hidden
     */
    @ContentChild(IgxCalendarHeaderTemplateDirective, { read: IgxCalendarHeaderTemplateDirective, static: false })
    public headerTemplate: IgxCalendarHeaderTemplateDirective;

    /**
     *@hidden
     */
    @ContentChild(IgxCalendarSubheaderTemplateDirective, { read: IgxCalendarSubheaderTemplateDirective, static: false })
    public subheaderTemplate: IgxCalendarSubheaderTemplateDirective;

    /**
     *@hidden
     */
    @ContentChild(IgxDatePickerActionsDirective, { read: IgxDatePickerActionsDirective, static: false })
    public datePickerActionsDirective: IgxDatePickerActionsDirective;

    public calendar: IgxCalendarComponent;
    public hasHeader = true;
    public collapsed = true;
    public displayValuePipe = new DatePickerDisplayValuePipe(this);
    public inputValuePipe = new DatePickerInputValuePipe(this);
    public dateFormatParts = [];
    public rawDateString: string;
    public inputMask: string;
    public isEmpty = true;
    public invalidDate = '';

    private readonly spinDelta = 1;
    private readonly defaultLocale = 'en';

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
    private _isInEditMode: boolean;
    private _disabledDates: DateRangeDescriptor[] = null;
    private _specialDates: DateRangeDescriptor[] = null;
    private _modalOverlay: OverlaySettings;
    private _dropDownOverlaySettings: OverlaySettings;
    private _positionSettings: PositionSettings;
    private _defaultDropDownOverlaySettings: OverlaySettings;
    private _modalOverlaySettings: OverlaySettings;
    private _transformedDate;
    private _onOpen = new EventEmitter<IgxDatePickerComponent>();
    private _onClose = new EventEmitter<IgxDatePickerComponent>();

    /**
    * @hidden
    */
    @HostListener('keydown.spacebar', ['$event'])
    @HostListener('keydown.space', ['$event'])
    public onSpaceClick(event: KeyboardEvent) {
        this.openDialog(this.getInputGroupElement());
        event.preventDefault();
    }

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
        this._cdr.markForCheck();
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
        const inputElement = this.editableInput || this.readonlyInput || this.input;
        return (inputElement) ? inputElement.nativeElement : null;
    }

    /** @hidden */
    public getInputGroupElement() {
        return this.inputGroup ? this.inputGroup.element.nativeElement : null;
    }

    /**
     *@hidden
     */
    public ngOnInit(): void {
        this._positionSettings = {
            openAnimation: fadeIn,
            closeAnimation: fadeOut
        };

        this._defaultDropDownOverlaySettings = {
            closeOnOutsideClick: true,
            modal: false,
            scrollStrategy: new AbsoluteScrollStrategy(),
            positionStrategy: new AutoPositionStrategy(this._positionSettings),
            outlet: this.outlet
        };

        this._modalOverlaySettings = {
            closeOnOutsideClick: true,
            modal: true,
            outlet: this.outlet
        };

        this._overlayService.onOpening.pipe(
            filter((overlay) => overlay.id === this._componentID),
            takeUntil(this._destroy$)).subscribe((eventArgs) => {
                this._onOpening(eventArgs);
            });

        this._overlayService.onOpened.pipe(
            filter((overlay) => overlay.id === this._componentID),
            takeUntil(this._destroy$)).subscribe(() => {
                this._onOpened();
            });

        this._overlayService.onClosed.pipe(
            filter(overlay => overlay.id === this._componentID),
            takeUntil(this._destroy$)).subscribe(() => {
                this._onClosed();
            });

        this._overlayService.onClosing.pipe(
            filter(overlay => overlay.id === this._componentID),
            takeUntil(this._destroy$)).subscribe((event) => {
                this.onClosing.emit(event);
            });

        if (this.mode === InteractionMode.DropDown) {
            this.dateFormatParts = DatePickerUtil.parseDateFormat(this.mask, this.locale);
            if (this.mask === undefined) {
                this.mask = DatePickerUtil.getMask(this.dateFormatParts);
            }
            this.inputMask = DatePickerUtil.getInputMask(this.dateFormatParts);
        }
    }

    ngAfterViewInit() {
        if (this.mode === InteractionMode.DropDown && this.editableInput) {
            fromEvent(this.editableInput.nativeElement, 'keydown').pipe(
                throttle(() => interval(0, animationFrameScheduler)),
                takeUntil(this._destroy$)
            ).subscribe((res) => this.onKeyDown(res));
        }
    }

    /**
     *@hidden
     */
    public ngOnDestroy(): void {
        if (this._componentID) {
            this._overlayService.hide(this._componentID);
        }
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
        const oldValue =  this.value;
        this.value = date;

        this.emitValueChangeEvent(oldValue, this.value );
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
        const oldValue =  this.value;
        this.value = null;
        this.emitValueChangeEvent(oldValue, this.value );
        if (this.calendar) {
            this.calendar.deselectDate();
        }
        this._onChangeCallback(null);
    }

    /**
     * Opens the date picker drop down or dialog.
     * @param target HTMLElement - the target element to use for positioning the drop down container according to
     * ```html
     * <igx-date-picker [value]="date" mode="dropdown" #retemplated>
     *   <ng-template igxDatePickerTemplate let-openDialog="openDialog"
     *                let-displayData="displayData">
     *     <igx-input-group>
     *       <input #dropDownTarget igxInput [value]="displayData" />
     *       <igx-suffix (click)="openDialog(dropDownTarget)">
     *         <igx-icon>alarm</igx-icon>
     *       </igx-suffix>
     *     </igx-input-group>
     *   </ng-template>
     * </igx-date-picker>
     * ```
     */
    public openDialog(target?: HTMLElement): void {
        if (!this.collapsed) {
            return;
        }
        switch (this.mode) {
            case InteractionMode.Dialog: {
                this.hasHeader = true;
                const modalOverlay = (this.modalOverlaySettings !== undefined) ? this._modalOverlay : this._modalOverlaySettings;
                this._componentID = this._overlayService.attach(IgxCalendarContainerComponent, modalOverlay, this._moduleRef);
                this._overlayService.show(this._componentID);
                break;
            }
            case InteractionMode.DropDown: {
                this.hasHeader = false;
                if (target) {
                    this.dropDownOverlaySettings.positionStrategy.settings.target = target;
                }
                this._componentID = this._overlayService.attach(IgxCalendarContainerComponent,
                    this.dropDownOverlaySettings, this._moduleRef);
                this._overlayService.show(this._componentID);
                break;
            }
        }
    }

    /**
     * Close the calendar.
     *
     * @hidden
     */
    public closeCalendar(): void {
        this._overlayService.hide(this._componentID);
    }

    /**
     * Clear the input field, date picker value and calendar selection.
     *
     * @hidden
     */
    public clear(): void {
        this.isEmpty = true;
        this.invalidDate = '';
        this.deselectDate();
        this._setCursorPosition(0);
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
        const oldValue =  this.value;
        this.value = date;

        this.emitValueChangeEvent(oldValue, this.value );
        this.calendar.viewDate = date;
        this._onChangeCallback(date);
        this.closeCalendar();
        this.onSelection.emit(date);
    }

    /**
    * Evaluates when the input blur event was fired
    * and re-calculate the date picker value.
    *
    * @param event
    *
    * @hidden
    */
    public onBlur(event): void {
        this._isInEditMode = false;
        this.calculateDate(event.target.value, event.type);
    }

    /**
    * Evaluates when the input focus event was fired
    * and re-calculate the editor text.
    *
    * @param event
    * @hidden
    */
    public onFocus(): void {
        this._isInEditMode = true;
        if (this.value && this.invalidDate === '') {
            this._transformedDate = this._getEditorDate(this.value);
        }
    }

    /**
    * Evaluates when the keydown event was fired for up/down keys
    * to provide spinning of date parts.
    *
    * @param event
    *
    * @hidden
    */
    public onKeyDown(event) {
        switch (event.key) {
            case KEYS.UP_ARROW:
            case KEYS.UP_ARROW_IE:
                event.preventDefault();
                event.stopPropagation();
                this.spinValue(event.target.value, 1, event.type);
                break;
            case KEYS.DOWN_ARROW:
            case KEYS.DOWN_ARROW_IE:
                if (event.altKey) {
                    this.openDialog(this.getInputGroupElement());
                } else {
                    event.preventDefault();
                    event.stopPropagation();
                    this.spinValue(event.target.value, -1, event.type);
                }
                break;
            default:
                break;
        }
    }

    /**
    * Evaluates when the mouse wheel event was fired
    * to provide spinning of date parts.
    *
    * @param event
    *
    * @hidden
    */
    public onWheel(event) {
        if (this._isInEditMode) {
            event.preventDefault();
            event.stopPropagation();
            const sign = (event.deltaY > 0) ? -1 : 1;
            this.spinValue(event.target.value, sign, event.type);
        }
    }

    /**
    * Evaluates when input event was fired in editor.
    *
    * @param event
    *
    * @hidden
    */
    public onInput(event) {
        const targetValue = event.target.value;
        const cursorPosition = this._getCursorPosition();
        const checkInput = DatePickerUtil.checkForCompleteDateInput(this.dateFormatParts, targetValue);
        this._isInEditMode = true;

        if (targetValue !== DatePickerUtil.maskToPromptChars(this.inputMask)) {
            this.isEmpty = false;
        }

        // If all date parts are completed, change the date-picker value, stay in edit mode
        if (checkInput === 'complete' && event.inputType !== 'deleteContentBackward') {
            this._transformedDate = targetValue;
            this.calculateDate(targetValue, event.type);
            this._setCursorPosition(cursorPosition);
        } else if (checkInput === 'partial') {
            // While editing, if one date part is deleted, date-picker value is set to null, the remaining input stays intact.
            this.deselectDate();
            requestAnimationFrame(() => {
                this.getEditElement().value = targetValue;
                this._setCursorPosition(cursorPosition);
            });
        } else if (checkInput === 'empty') {
            // Total clean-up as input is deleted.
            this.isEmpty = true;
            this.deselectDate();
        }
    }

    private emitValueChangeEvent(oldValue: Date, newValue: Date) {
        if (!isEqual(oldValue, newValue)) {
            this.valueChange.emit(newValue);
        }
    }

    private calculateDate(dateString: string, invokedByEvent: string): void {
        if (dateString !== '') {
            const prevDateValue = this.value;
            const inputValue = (invokedByEvent === 'blur') ? this.rawDateString : dateString;
            const newDateArray = DatePickerUtil.parseDateArray(this.dateFormatParts, prevDateValue, inputValue);

            if (newDateArray.state === DateState.Valid) {
                const newValue = newDateArray.date;
                // Restore the time part if any
                if (prevDateValue) {
                    newValue.setHours(prevDateValue.getHours());
                    newValue.setMinutes(prevDateValue.getMinutes());
                    newValue.setSeconds(prevDateValue.getSeconds());
                    newValue.setMilliseconds(prevDateValue.getMilliseconds());
                }

                if (this.disabledDates === null
                    || (this.disabledDates !== null && !isDateInRanges(newValue, this.disabledDates))) {
                        const oldValue =  this.value;
                        this.value = newValue;

                        this.emitValueChangeEvent(oldValue, this.value );
                        this.invalidDate = '';
                        this._onChangeCallback(newValue);
                } else {
                    const args: IDatePickerDisabledDateEventArgs = {
                        datePicker: this,
                        currentValue: newValue,
                    };
                    this.onDisabledDate.emit(args);
                }
            } else {
                const args: IDatePickerValidationFailedEventArgs = {
                    datePicker: this,
                    prevValue: prevDateValue
                };
                this.invalidDate = dateString;
                this.onValidationFailed.emit(args);
            }
        }
    }

    private spinValue(inputValue: string, sign: number, eventType: string): void {
        this._isInEditMode = true;
        this.isEmpty = false;
        const cursorPosition = this._getCursorPosition();

        const modifiedInputValue =
            DatePickerUtil.getModifiedDateInput(this.dateFormatParts, inputValue, cursorPosition, this.spinDelta * sign, this.isSpinLoop);

        this.getEditElement().value = modifiedInputValue;
        this._setCursorPosition(cursorPosition);

        const checkInput = DatePickerUtil.checkForCompleteDateInput(this.dateFormatParts, modifiedInputValue);
        if (checkInput === 'complete') {
            this._isInEditMode = true;
            this.calculateDate(modifiedInputValue, eventType);
            this._setCursorPosition(cursorPosition);
        }
    }

    private _onOpening(event: OverlayCancelableEventArgs) {
        this._initializeCalendarContainer(event.componentRef.instance as IgxCalendarContainerComponent);
        this.collapsed = false;
    }

    private _onOpened(): void {
        this._onTouchedCallback();
        this.onOpened.emit(this);

        // TODO: remove this line after deprecating 'onOpen'
        this._onOpen.emit(this);

        if (this.calendar) {
            this._focusCalendarDate();
        }
    }

    private _onClosed(): void {
        this.collapsed = true;
        this._componentID = null;
        this.onClosed.emit(this);

        // TODO: remove this line after deprecating 'onClose'
        this.onClose.emit(this);

        if (this.getEditElement()) {
            this.getEditElement().focus();
        }
    }

    private _initializeCalendarContainer(componentInstance: IgxCalendarContainerComponent) {
        this.calendar = componentInstance.calendar;
        const isVertical = (this.vertical && this.mode === InteractionMode.Dialog);
        this.calendar.hasHeader = this.hasHeader;
        this.calendar.formatOptions = this.formatOptions;
        this.calendar.formatViews = this.formatViews;
        this.calendar.locale = this.locale;
        this.calendar.vertical = isVertical;
        this.calendar.weekStart = this.weekStart;
        this.calendar.specialDates = this.specialDates;
        this.calendar.disabledDates = this.disabledDates;
        this.calendar.headerTemplate = this.headerTemplate;
        this.calendar.subheaderTemplate = this.subheaderTemplate;
        this.calendar.hideOutsideDays = this.hideOutsideDays;
        this.calendar.monthsViewNumber = this.monthsViewNumber;
        this.calendar.onSelection.pipe(takeUntil(this._destroy$)).subscribe((ev: Date) => this.handleSelection(ev));

        if (this.value) {
            this.calendar.value = this.value;
            this.calendar.viewDate = this.value;
        }

        componentInstance.mode = this.mode;
        componentInstance.vertical = isVertical;
        componentInstance.cancelButtonLabel = this.cancelButtonLabel;
        componentInstance.todayButtonLabel = this.todayButtonLabel;
        componentInstance.datePickerActions = this.datePickerActionsDirective;

        componentInstance.onClose.pipe(takeUntil(this._destroy$)).subscribe(() => this.closeCalendar());
        componentInstance.onTodaySelection.pipe(takeUntil(this._destroy$)).subscribe(() => this.triggerTodaySelection());
    }

    // Focus a date, after the calendar appearance into DOM.
    private _focusCalendarDate(): void {
        requestAnimationFrame(() => {
            this.calendar.daysView.focusActiveDate();
        });
    }

    private _setLocaleToDate(value: Date): string {
        if (isIE()) {
            // this is a workaround fixing the following IE11 issue:
            // IE11 has added character code 8206 (mark for RTL) to the output of toLocaleDateString() that
            // precedes each portion that comprises the total date... For more information read this article:
            // tslint:disable-next-line: max-line-length
            // https://www.csgpro.com/blog/2016/08/a-bad-date-with-internet-explorer-11-trouble-with-new-unicode-characters-in-javascript-date-strings/
            const localeDateStrIE = new Date(value.getFullYear(), value.getMonth(), value.getDate(),
                value.getHours(), value.getMinutes(), value.getSeconds(), value.getMilliseconds());
            return localeDateStrIE.toLocaleDateString(this.locale);
        }

        return value.toLocaleDateString(this.locale);
    }

    private _getCursorPosition(): number {
        return this.getEditElement().selectionStart;
    }

    private _setCursorPosition(start: number, end: number = start): void {
        requestAnimationFrame(() => {
            this.getEditElement().setSelectionRange(start, end);
        });
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
    private _getDisplayDate(value: any): string {
        if (this.format && !this.formatter) {
            const locale = this.locale || this.defaultLocale;
            return formatDate(value, this.format, locale);
        } else {
            return this._customFormatChecker(this.formatter, value);
        }
    }

    private _getEditorDate(value: any) {
        const locale = this.locale || this.defaultLocale;
        const changedValue = (value) ? formatDate(value, this.mask, locale) : '';
        return DatePickerUtil.addPromptCharsEditMode(this.dateFormatParts, this.value, changedValue);
    }

    private _onTouchedCallback: () => void = () => { };

    private _onChangeCallback: (_: Date) => void = () => { };
}

/**
 * @hidden
 */
@NgModule({
    declarations: [
        IgxDatePickerComponent,
        IgxCalendarContainerComponent,
        IgxDatePickerActionsDirective,
        IgxDatePickerTemplateDirective,
        DatePickerDisplayValuePipe,
        DatePickerInputValuePipe
    ],
    entryComponents: [
        IgxCalendarContainerComponent
    ],
    exports: [
        IgxDatePickerComponent,
        IgxDatePickerTemplateDirective,
        IgxDatePickerActionsDirective,
        DatePickerDisplayValuePipe,
        DatePickerInputValuePipe
    ],
    imports: [
        CommonModule,
        IgxIconModule,
        IgxInputGroupModule,
        IgxCalendarModule,
        IgxButtonModule,
        IgxRippleModule,
        IgxMaskModule,
        IgxTextSelectionModule
    ]
})
export class IgxDatePickerModule { }
