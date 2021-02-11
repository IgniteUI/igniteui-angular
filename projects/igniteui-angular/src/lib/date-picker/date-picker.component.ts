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
    AfterViewInit,
    Injector,
    AfterViewChecked,
    ContentChildren,
    QueryList,
    Renderer2
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl, AbstractControl, NG_VALIDATORS, ValidationErrors } from '@angular/forms';
import {
    IgxCalendarComponent,
    IgxCalendarHeaderTemplateDirective,
    IgxCalendarModule,
    IgxCalendarSubheaderTemplateDirective,
    WEEKDAYS,
    isDateInRanges
} from '../calendar/public_api';
import { IgxIconModule } from '../icon/public_api';
import {
    IgxInputGroupModule,
    IgxInputDirective,
    IgxInputGroupComponent,
    IgxInputState,
    IgxLabelDirective
} from '../input-group/public_api';
import { Subject, fromEvent, animationFrameScheduler, interval, Subscription, noop } from 'rxjs';
import { filter, takeUntil, throttle } from 'rxjs/operators';
import { IgxOverlayOutletDirective } from '../directives/toggle/toggle.directive';
import { IgxTextSelectionModule } from '../directives/text-selection/text-selection.directive';
import {
    OverlaySettings,
    IgxOverlayService,
    PositionSettings,
    AbsoluteScrollStrategy,
    AutoPositionStrategy,
    OverlayCancelableEventArgs
} from '../services/public_api';
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
import { KEYS, isIE, isEqual, IBaseEventArgs, mkenum, IBaseCancelableBrowserEventArgs } from '../core/utils';
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
export const PredefinedFormatOptions = mkenum({
    ShortDate: 'shortDate',
    MediumDate: 'mediumDate',
    LongDate: 'longDate',
    FullDate: 'fullDate'
});
export type PredefinedFormatOptions = (typeof PredefinedFormatOptions)[keyof typeof PredefinedFormatOptions];

/**
 * Date Picker displays a popup calendar that lets users select a single date.
 *
 * @igxModule IgxDatePickerModule
 * @igxTheme igx-calendar-theme, igx-icon-theme
 * @igxGroup Scheduling
 * @igxKeywords  datepicker, calendar, schedule, date
 * @example
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
        },
        {
            provide: NG_VALIDATORS,
            useExisting: IgxDatePickerComponent,
            multi: true
        }],
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'igx-date-picker',
    templateUrl: 'date-picker.component.html',
    styles: [`
        :host {
            display: block;
        }
    `]
})
export class IgxDatePickerComponent implements IDatePicker, ControlValueAccessor,
    EditorProvider, OnInit, AfterViewInit, OnDestroy, AfterViewChecked {
    /**
     * Gets/Sets the `IgxDatePickerComponent` label.
     *
     * @remarks
     * The default label is 'Date'.
     * @example
     * ```html
     * <igx-date-picker [label]="Calendar"></igx-date-picker>
     * ```
     * @deprecated Use igxLabel inside the date picker to change the label:
     * ````html
     * <igx-date-picker>
     *      <label igxLabel>Custom label</label>
     * </igx-date-picker>
     * ````
     * to set a custom label.
     */
    @DeprecateProperty(`Use igxLabel inside the date picker to change the label:
    <igx-date-picker>
        <label igxLabel>Custom label</label>
    </igx-date-picker> `)
    @Input()
    public label = 'Date';

    /**
     * Gets/Sets the `IgxDatePickerComponent` label visibility.
     *
     * @remarks
     * By default the visibility is set to true.
     * @example
     * <igx-date-picker [labelVisibility]="false"></igx-date-picker>
     */
    @Input()
    public labelVisibility = true;

    /**
     * Gets/Sets the locales.
     *
     * @remarks Default locale is en.
     * @example
     * ```html
     * <igx-date-picker locale="ja-JP" [value]="date"></igx-date-picker>
     * ```
     */
    @Input() public locale: 'en';

    /**
     * Gets/Sets the default template editor's tabindex.
     *
     * @example
     * ```html
     * <igx-date-picker editorTabIndex="1"></igx-date-picker>
     * ```
     */
    @Input() public editorTabIndex: number;

    /**
     * Gets/Sets on which day the week starts.
     *
     * @example
     * ```html
     * <igx-date-picker [weekStart]="WEEKDAYS.FRIDAY" cancelButtonLabel="cancel" todayButtonLabel="today"></igx-date-picker>
     * ```
     */
    @Input() public weekStart: WEEKDAYS | number = WEEKDAYS.SUNDAY;

    /**
     * Gets the format options of the `IgxDatePickerComponent`.
     *
     * @example
     * ```typescript
     * let formatOptions = this.datePicker.formatOptions;
     * ```
     */
    @Input()
    public get formatOptions(): IFormatOptions {
        return this._formatOptions;
    }

    /**
     * Sets the format options of the `IgxDatePickerComponent`.
     *
     * @example
     * ```typescript
     * this.datePicker.formatOptions = {  day: "numeric",  month: "long", weekday: "long", year: "numeric"};
     * ```
     */
    public set formatOptions(formatOptions: IFormatOptions) {
        this._formatOptions = Object.assign(this._formatOptions, formatOptions);
    }

    /**
     * Gets/Sets whether the inactive dates will be hidden.
     *
     * @remarks
     * Apllies to dates that are out of the current month.
     * Default value is `false`.
     * @example
     * ```html
     * <igx-date-picker [hideOutsideDays]="true"></igx-date-picker>
     * ```
     * @example
     * ```typescript
     * let hideOutsideDays = this.datePicker.hideOutsideDays;
     * ```
     */
    @Input()
    public hideOutsideDays: boolean;

    /**
     * Gets/Sets the number of month views displayed.
     *
     * @remarks
     * Default value is `1`.
     * @example
     * ```html
     * <igx-date-picker [monthsViewNumber]="2"></igx-date-picker>
     * ```
     * @example
     * ```typescript
     * let monthViewsDisplayed = this.datePicker.monthsViewNumber;
     * ```
     */
    @Input()
    public monthsViewNumber = 1;

    /**
     * Show/hide week numbers
     *
     * @exmpale
     * ```html
     * <igx-date-picker [showWeekNumbers]="true"></igx-date-picker>
     * ``
     */
    @Input()
    public showWeekNumbers: boolean;

    /**
     * Gets/Sets the date display format of the `IgxDatePickerComponent` in dropdown mode.
     *
     * @example
     * ```typescript
     * let format = this.datePicker.format;
     * this.datePicker.format = 'yyyy-M-d';
     * ```
     */
    @Input()
    public get format(): string {
        return (this._format === undefined) ? PredefinedFormatOptions.ShortDate : this._format;
    }
    public set format(format: string) {
        this._format = format;
    }

    /**
     * Gets/Sets the date mask of the `IgxDatePickerComponent` when in editable dropdown mode.
     *
     *  @example
     * ```typescript
     * let mask = this.datePicker.mask;
     * ```
     */
    @Input()
    public mask: string;

    /**
     * Gets/Sets the format views of the `IgxDatePickerComponent`.
     *
     * @example
     * ```typescript
     * let formatViews = this.datePicker.formatViews;
     *  this.datePicker.formatViews = {day:false, month: false, year:false};
     * ```
     */
    @Input()
    public get formatViews(): IFormatViews {
        return this._formatViews;
    }

    public set formatViews(formatViews: IFormatViews) {
        this._formatViews = Object.assign(this._formatViews, formatViews);
    }

    /**
     * Gets/Sets the disabled dates descriptors.
     *
     * @example
     * ```typescript
     * let disabledDates = this.datepicker.disabledDates;
     * this.datePicker.disabledDates = [ {type: DateRangeType.Weekends}, ...];
     * ```
     */
    @Input()
    public get disabledDates(): DateRangeDescriptor[] {
        return this._disabledDates;
    }
    public set disabledDates(value: DateRangeDescriptor[]) {
        this._disabledDates = value;
        this._onValidatorChange();
    }

    /**
     * Gets/Sets the special dates descriptors.
     *
     * @example
     * ```typescript
     * let specialDates = this.datepicker.specialDates;
     * this.datePicker.specialDates = [ {type: DateRangeType.Weekends}, ... ];
     * ```
     */
    @Input()
    public get specialDates(): DateRangeDescriptor[] {
        return this._specialDates;
    }
    public set specialDates(value: DateRangeDescriptor[]) {
        this._specialDates = value;
    }

    /**
     * Gets/Sets the modal overlay settings.
     */
    @Input()
    public get modalOverlaySettings(): OverlaySettings {
        return this._modalOverlay;
    }

    public set modalOverlaySettings(value: OverlaySettings) {
        this._modalOverlay = value;
    }

    /**
     * Gets/Sets the drop-down overlay settings.
     */
    @Input()
    public get dropDownOverlaySettings(): OverlaySettings {
        return this._dropDownOverlaySettings || this._defaultDropDownOverlaySettings;
    }

    public set dropDownOverlaySettings(value: OverlaySettings) {
        this._dropDownOverlaySettings = value;
    }

    /**
     * Gets the formatted date when `IgxDatePickerComponent` is in dialog mode.
     *
     *  @example
     * ```typescript
     * let selectedDate = this.datePicker.displayData;
     * ```
     */
    public get displayData(): string {
        if (this.value) {
            return this._customFormatChecker(this.formatter, this.value);
        }
        return '';
    }

    /** @hidden @internal */
    public get transformedDate(): string {
        if (this._value) {
            this._transformedDate = (this._isInEditMode) ? this._getEditorDate(this._value) : this._getDisplayDate(this._value);
            this.isEmpty = false;
        } else {
            this._transformedDate = (this._isInEditMode) ? DatePickerUtil.maskToPromptChars(this.inputMask) : '';
        }
        return this._transformedDate;
    }

    /** @hidden @internal */
    public set transformedDate(value) {
        this._transformedDate = value;
    }


    /**
     * Gets the input group template.
     *
     * @example
     * ```typescript
     * let template = this.template();
     * ```
     */
    get template(): TemplateRef<any> {
        if (this.datePickerTemplateDirective) {
            return this.datePickerTemplateDirective.template;
        }
        return (this.mode === InteractionMode.Dialog) ? this.readOnlyDatePickerTemplate : this.editableDatePickerTemplate;
    }

    /**
     * Gets the context passed to the input group template.
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
            openDialog: () => this.openDialog()
        };
    }

    private get required(): boolean {
        if (this._ngControl && this._ngControl.control && this._ngControl.control.validator) {
            // Run the validation with empty object to check if required is enabled.
            const error = this._ngControl.control.validator({} as AbstractControl);
            return error && error.required;
        }

        return false;
    }


    /**
     * Gets/Sets the selected date.
     *
     *  @example
     * ```html
     * <igx-date-picker [value]="date"></igx-date-picker>
     * ```
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
     * Gets/Sets the value of `id` attribute.
     *
     * @remarks If not provided it will be automatically generated.
     * @example
     * ```html
     * <igx-date-picker [id]="'igx-date-picker-3'" cancelButtonLabel="cancel" todayButtonLabel="today"></igx-date-picker>
     * ```
     */
    @HostBinding('attr.id')
    @Input()
    public id = `igx-date-picker-${NEXT_ID++}`;

    /**
     * Gets/Sets a custom formatter function on the selected or passed date.
     *
     * @example
     * ```html
     * <igx-date-picker [value]="date" [formatter]="formatter"></igx-date-picker>
     * ```
     */
    @Input()
    public formatter: (val: Date) => string;

    /**
     * Enables/Disables the `IgxDatePickerComponent`.
     *
     *  @example
     * ```html
     * <igx-date-picker [disabled]="'true'" cancelButtonLabel="cancel" todayButtonLabel="today"></igx-date-picker>
     * ```
     */
    @Input()
    public disabled: boolean;

    /**
     * Gets/Sets the orientation of the `IgxDatePickerComponent` header.
     *
     *  @example
     * ```html
     * <igx-date-picker [vertical]="'true'" cancelButtonLabel="cancel" todayButtonLabel="today"></igx-date-picker>
     * ```
     */
    @Input()
    public vertical = false;

    /**
     * Gets/Sets the today button's label.
     *
     *  @example
     * ```html
     * <igx-date-picker cancelButtonLabel="cancel" todayButtonLabel="Tomorrow"></igx-date-picker>
     * ```
     */
    @Input()
    public todayButtonLabel: string;

    /**
     * *Gets/Sets the cancel button's label.
     *
     * @example
     * ```html
     * <igx-date-picker cancelButtonLabel="Close" todayButtonLabel="Today"></igx-date-picker>
     * ```
     */
    @Input()
    public cancelButtonLabel: string;

    /**
     * Gets/Sets the interaction mode - dialog or drop down.
     *
     *  @example
     * ```html
     * <igx-date-picker mode="dropdown"></igx-date-picker>
     * ```
     */
    @Input()
    public mode: InteractionMode = InteractionMode.Dialog;

    /**
     * Gets/Sets whether date should spin continuously or stop when min/max is reached.
     *
     *  @example
     * ```html
     * <igx-date-picker [isSpinLoop]="false"></igx-date-picker>
     * ```
     */
    @Input()
    public isSpinLoop = true;

    /**
     * Gets/Sets the container used for the popup element.
     *
     * @remarks
     *  `outlet` is an instance of `IgxOverlayOutletDirective` or an `ElementRef`.
     * @example
     * ```html
     * <div igxOverlayOutlet #outlet="overlay-outlet"></div>
     * //..
     * <igx-date-picker [outlet]="outlet"></igx-date-picker>
     * //..
     * ```
     */
    @Input()
    public outlet: IgxOverlayOutletDirective | ElementRef;

    /**
     * Emitted when the `IgxDatePickerComponent` calendar is opened.
     */
    @Output()
    public onOpened = new EventEmitter<IgxDatePickerComponent>();

    /**
     * Emitted after the `IgxDatePickerComponent` is closed.
     */
    @Output()
    public onClosed = new EventEmitter<IgxDatePickerComponent>();

    /**
     * Emitted when the `IgxDatePickerComponent` is being closed.
     */
    @Output()
    public onClosing = new EventEmitter<IBaseCancelableBrowserEventArgs>();

    /**
     * Emitted when selection is made in the calendar.
     *
     *  @example
     * ```html
     * <igx-date-picker (onSelection)="selection($event)"></igx-date-picker>
     * ```
     */
    @Output()
    public onSelection = new EventEmitter<Date>();

    /**
     * Emitted when date picker value is changed.
     *
     * @example
     * ```html
     * <igx-date-picker (valueChange)="valueChanged($event)" mode="dropdown"></igx-date-picker>
     * ```
     */
    @Output()
    public valueChange = new EventEmitter<Date>();

    /**
     * Emitted when the user types/spins to a disabled date in the date-picker editor.
     *
     *  @example
     * ```html
     * <igx-date-picker (onDisabledDate)="onDisabledDate($event)"></igx-date-picker>
     * ```
     */
    @Output()
    public onDisabledDate = new EventEmitter<IDatePickerDisabledDateEventArgs>();

    /**
     * Emitted when the user types/spins invalid date in the date-picker editor.
     *
     *  @example
     * ```html
     * <igx-date-picker (onValidationFailed)="onValidationFailed($event)"></igx-date-picker>
     * ```
     */
    @Output()
    public onValidationFailed = new EventEmitter<IDatePickerValidationFailedEventArgs>();

    /** @hidden @internal */
    @ContentChild(IgxLabelDirective)
    public _labelDirectiveUserTemplate: IgxLabelDirective;

    /**
     * @hidden
     */
    @ContentChild(IgxCalendarHeaderTemplateDirective, { read: IgxCalendarHeaderTemplateDirective })
    public headerTemplate: IgxCalendarHeaderTemplateDirective;

    /**
     * @hidden
     */
    @ContentChild(IgxCalendarSubheaderTemplateDirective, { read: IgxCalendarSubheaderTemplateDirective })
    public subheaderTemplate: IgxCalendarSubheaderTemplateDirective;

    /**
     * @hidden
     */
    @ContentChild(IgxDatePickerActionsDirective, { read: IgxDatePickerActionsDirective })
    public datePickerActionsDirective: IgxDatePickerActionsDirective;

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
     * @hidden @internal
     */
    @ViewChild(IgxInputGroupComponent)
    protected _inputGroup: IgxInputGroupComponent;

    @ContentChild(IgxInputGroupComponent)
    protected _inputGroupUserTemplate: IgxInputGroupComponent;

    @ContentChild(IgxInputDirective, { read: ElementRef })
    protected _inputUserTemplateElementRef: ElementRef;

    @ViewChild(IgxLabelDirective)
    protected _labelDirective: IgxLabelDirective;

    /**
     * @hidden
     */
    @ContentChild(IgxDatePickerTemplateDirective, { read: IgxDatePickerTemplateDirective })
    protected datePickerTemplateDirective: IgxDatePickerTemplateDirective;

    @ViewChild(IgxInputDirective, { read: ElementRef })
    private _inputElementRef: ElementRef;

    @ViewChild(IgxInputDirective)
    private _inputDirective: IgxInputDirective;

    @ContentChildren(IgxInputDirective, { descendants: true })
    private _inputDirectiveUserTemplates: QueryList<IgxInputDirective>;

    /** @hidden @internal */
    public calendar: IgxCalendarComponent;
    /** @hidden @internal */
    public hasHeader = true;
    /** @hidden @internal */
    public collapsed = true;
    /** @hidden @internal */
    public displayValuePipe = new DatePickerDisplayValuePipe(this);
    /** @hidden @internal */
    public inputValuePipe = new DatePickerInputValuePipe(this);
    /** @hidden @internal */
    public dateFormatParts = [];
    /** @hidden @internal */
    public rawDateString: string;
    /** @hidden @internal */
    public inputMask: string;
    /** @hidden @internal */
    public isEmpty = true;
    /** @hidden @internal */
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
    private _statusChanges$: Subscription;
    private _templateInputBlur$: Subscription;
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
    private _ngControl: NgControl = null;

    //#region ControlValueAccessor

    private _onChangeCallback: (_: Date) => void = noop;
    private _onTouchedCallback: () => void = noop;
    private _onValidatorChange: () => void = noop;

    constructor(@Inject(
        IgxOverlayService) private _overlayService: IgxOverlayService,
        public element: ElementRef,
        private _cdr: ChangeDetectorRef,
        private _moduleRef: NgModuleRef<any>,
        private _injector: Injector,
        private _renderer: Renderer2) {
    }

    /**
     * @hidden
     */
    @HostListener('keydown.spacebar', ['$event'])
    @HostListener('keydown.space', ['$event'])
    public onSpaceClick(event: KeyboardEvent) {
        this.openDialog();
        event.preventDefault();
    }

    /** @hidden @internal */
    public writeValue(value: Date) {
        this._value = value;
        // TODO: do we need next call
        this._cdr.markForCheck();
    }

    /** @hidden @internal */
    public registerOnChange(fn: (_: Date) => void) {
        this._onChangeCallback = fn;
    }

    /** @hidden @internal */
    public registerOnTouched(fn: () => void) {
        this._onTouchedCallback = fn;
    }

    /** @hidden @internal */
    public setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    /** @hidden @internal */
    public registerOnValidatorChange(fn: any) {
        this._onValidatorChange = fn;
    }

    /** @hidden @internal */
    public validate(): ValidationErrors | null {
        if (!!this.value && this.disabledDates && isDateInRanges(this.value, this.disabledDates)) {
            return { dateIsDisabled: true };
        }
        return null;
    }
    //#endregion

    /** @hidden */
    public getEditElement() {
        const inputDirectiveElementRef = this._inputElementRef || this._inputUserTemplateElementRef;
        return (inputDirectiveElementRef) ? inputDirectiveElementRef.nativeElement : null;
    }

    /** @hidden @internal */
    public get inputGroupElement(): HTMLElement {
        return this.inputGroup?.element.nativeElement;
    }

    /** @hidden @internal */
    public get inputGroup(): IgxInputGroupComponent {
        return this._inputGroup || this._inputGroupUserTemplate || null;
    }

    /** @hidden @internal */
    public get inputDirective(): IgxInputDirective {
        return this._inputDirective || this._inputDirectiveUserTemplates.first || null;
    }

    /** @hidden @internal */
    public get labelDirective(): IgxLabelDirective {
        return this._labelDirective || this._labelDirectiveUserTemplate || null;
    }

    /** @hidden @internal */
    public ngOnInit(): void {
        this._positionSettings = {
            openAnimation: fadeIn,
            closeAnimation: fadeOut
        };

        this._defaultDropDownOverlaySettings = {
            target: this.inputGroupElement,
            closeOnOutsideClick: true,
            modal: false,
            scrollStrategy: new AbsoluteScrollStrategy(),
            positionStrategy: new AutoPositionStrategy(this._positionSettings),
            outlet: this.outlet
        };

        this._modalOverlaySettings = {
            closeOnOutsideClick: true,
            modal: true,
            closeOnEscape: true,
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
                // If canceled in a user onClosing handler
                if (event.cancel) {
                    return;
                }
                // Do not focus the input if clicking outside in dropdown mode
                const input = this.getEditElement();
                if (input && !(event.event && this.mode === InteractionMode.DropDown)) {
                    input.focus();
                } else {
                    // outside click
                    this._updateValidityOnBlur();
                }
            });

        if (this.mode === InteractionMode.DropDown) {
            this.dateFormatParts = DatePickerUtil.parseDateFormat(this.mask, this.locale);
            if (this.mask === undefined) {
                this.mask = DatePickerUtil.getMask(this.dateFormatParts);
            }
            this.inputMask = DatePickerUtil.getInputMask(this.dateFormatParts);
        }

        this._ngControl = this._injector.get<NgControl>(NgControl, null);
    }

    /** @hidden @internal */
    public ngAfterViewInit() {
        if (this.mode === InteractionMode.DropDown && this._inputElementRef) {
            fromEvent(this._inputElementRef.nativeElement, 'keydown').pipe(
                throttle(() => interval(0, animationFrameScheduler)),
                takeUntil(this._destroy$)
            ).subscribe((res) => this.onKeyDown(res));
        }

        if (this._ngControl) {
            this._statusChanges$ = this._ngControl.statusChanges.subscribe(this.onStatusChanged.bind(this));
        }

        this._inputDirectiveUserTemplates.changes.subscribe(() => {
            this.attachTemplateBlur();
        });
        this.attachTemplateBlur();
    }

    public ngAfterViewChecked() {
        // If one sets mode at run time this forces initialization of new igxInputGroup
        // As a result a new igxInputDirective is initialized too. In ngAfterViewInit of
        // the new directive isRequired of the igxInputGroup is set again. However
        // ngAfterViewInit of date picker is not called again and we may finish with wrong
        // isRequired in igxInputGroup. This is why we should set it her, only when needed
        if (this.inputGroup && this.inputGroup.isRequired !== this.required) {
            this.inputGroup.isRequired = this.required;
            this._cdr.detectChanges();
        }
        // TODO: persist validation state when dynamically changing 'dropdown' to 'dialog' ot vice versa.
        // For reference -> it is currently persisted if a user template is passed (as template is not recreated)

        if (this.labelDirective) {
            this._renderer.setAttribute(this.inputDirective.nativeElement, 'aria-labelledby', this.labelDirective.id);
        }
    }

    /** @hidden @internal */
    public ngOnDestroy(): void {
        if (this._componentID) {
            this._overlayService.hide(this._componentID);
        }
        if (this._statusChanges$) {
            this._statusChanges$.unsubscribe();
        }
        this._destroy$.next(true);
        this._destroy$.complete();
    }

    /**
     * Selects today's date from calendar.
     *
     *  @remarks
     * Changes the input field value, @calendar.viewDate and @calendar.value.
     *  @example
     * ```typescript
     * this.datePicker.triggerTodaySelection();
     * ```
     */
    public triggerTodaySelection(): void {
        const today = new Date(Date.now());
        this.handleSelection(today);
    }

    /**
     * Change the calendar selection.
     *
     * @remarks
     * Calling this method will emit the @calendar.onSelection event,
     * which will fire @handleSelection method.
     * @example
     * ```typescript
     * this.datePicker.selectDate(this.date);
     * ```
     * @param date passed date that has to be set to the calendar.
     */
    public selectDate(date: Date): void {
        const oldValue = this.value;
        this.value = date;

        this.emitValueChangeEvent(oldValue, this.value);
        this.onSelection.emit(date);
    }

    /**
     * Deselects the calendar date.
     *
     * @example
     * ```typescript
     * this.datePicker.deselectDate();
     * ```
     */
    public deselectDate(): void {
        const oldValue = this.value;
        this.value = null;
        this.emitValueChangeEvent(oldValue, this.value);
        if (this.calendar) {
            this.calendar.deselectDate();
        }
    }

    /**
     * Opens the date picker drop down or dialog.
     *
     * @param target HTMLElement - the target element to use for positioning the drop down container according to
     * @example
     * ```typescript
     * this.datePicker.openDialog(target);
     * ```
     */
    public openDialog(): void {
        if (!this.collapsed || this.disabled) {
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
                const target = this.inputGroupElement;
                if (target) {
                    this.dropDownOverlaySettings.target = target;
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
     * @hidden @internal
     */
    public closeCalendar(): void {
        this._overlayService.hide(this._componentID);
    }

    /**
     * Clear the input field, date picker value and calendar selection.
     *
     * @hidden @internal
     */
    public clear(): void {
        if (!this.disabled) {
            this.isEmpty = true;
            this.invalidDate = '';
            this.deselectDate();
            this._setCursorPosition(0);
        }
    }

    /**
     * Evaluates when @calendar.onSelection event was fired
     * and update the input value.
     *
     * @param event selected value from calendar.
     *
     * @hidden @internal
     */
    public handleSelection(date: Date): void {
        if (this.value) {
            date.setHours(this.value.getHours());
            date.setMinutes(this.value.getMinutes());
            date.setSeconds(this.value.getSeconds());
            date.setMilliseconds(this.value.getMilliseconds());
        }
        const oldValue = this.value;
        this.value = date;

        this.emitValueChangeEvent(oldValue, this.value);
        this.calendar.viewDate = date;
        this.closeCalendar();
        this.onSelection.emit(date);
    }

    /** @hidden @internal */
    public onOpenClick(event: MouseEvent) {
        event.stopPropagation();
        this.openDialog();
    }

    /** @hidden @internal */
    public onBlur(event, calcDate = true): void {
        this._isInEditMode = false;
        if (this.mode === InteractionMode.DropDown && calcDate) {
            this.calculateDate(event.target.value, event.type);
        }

        if (this.collapsed) {
            this._updateValidityOnBlur();
        }
    }

    /** @hidden @internal */
    public onFocus(): void {
        this._isInEditMode = true;
        if (this.value && this.invalidDate === '') {
            this._transformedDate = this._getEditorDate(this.value);
        }
    }

    /** @hidden @internal */
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
                    this.openDialog();
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

    /** @hidden @internal */
    public onWheel(event) {
        if (this._isInEditMode) {
            event.preventDefault();
            event.stopPropagation();
            const sign = (event.deltaY > 0) ? -1 : 1;
            this.spinValue(event.target.value, sign, event.type);
        }
    }

    /** @hidden @internal */
    public onInput(event) {
        /**
         * Fix for #8165 until refactoring (#6483).
         * The IgxDateTimeEditor will be used to handle all inputs, i.e. this handler will be removed.
         * It extends the IgxMaskDirective which contains logic that handles this issue.
         */
        if (isIE() && !this._isInEditMode && !this.inputGroup.isFocused) {
            return;
        }
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

    public _updateValidityOnBlur() {
        this._onTouchedCallback();
        const input = this.inputDirective;
        if (input && this._ngControl && !this._ngControl.valid) {
            input.valid = IgxInputState.INVALID;
        } else {
            input.valid = IgxInputState.INITIAL;
        }
    }

    protected onStatusChanged() {
        if ((this._ngControl.control.touched || this._ngControl.control.dirty) &&
            (this.inputDirective && this._ngControl.control.validator || this._ngControl.control.asyncValidator)) {
            if (this.inputGroup.isFocused) {
                this.inputDirective.valid = this._ngControl.valid ? IgxInputState.VALID : IgxInputState.INVALID;
            } else {
                this.inputDirective.valid = this._ngControl.valid ? IgxInputState.INITIAL : IgxInputState.INVALID;
            }
        }

        if (this.inputGroup && this.inputGroup.isRequired !== this.required) {
            this.inputGroup.isRequired = this.required;
        }
    }

    private attachTemplateBlur() {
        if (this._templateInputBlur$) {
            this._templateInputBlur$.unsubscribe();
        }

        if (this._inputDirectiveUserTemplates.first) {
            const directive = this._inputDirectiveUserTemplates.first;
            this._templateInputBlur$ = fromEvent(directive.nativeElement, 'blur').pipe(
                takeUntil(this._destroy$)).subscribe((res) => {
                    this.rawDateString = (res.target as HTMLInputElement).value;
                    this.onBlur(res, false);
                });
            // TODO: Refactor custom template handling.
            // Revise blur handling when custom template is passed
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
                    const oldValue = this.value;
                    this.value = newValue;

                    this.emitValueChangeEvent(oldValue, this.value);
                    this.invalidDate = '';
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
        this.onOpened.emit(this);

        if (this.calendar) {
            this._focusCalendarDate();
        }
    }

    private _onClosed(): void {
        this.collapsed = true;
        this._componentID = null;
        this.onClosed.emit(this);
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
        this.calendar.showWeekNumbers = this.showWeekNumbers;
        this.calendar.selected.pipe(takeUntil(this._destroy$)).subscribe((ev: Date) => this.handleSelection(ev));

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
            // eslint-disable-next-line max-len
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
     *
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
        DatePickerInputValuePipe,
        IgxInputGroupModule
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
