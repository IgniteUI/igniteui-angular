import {
    AfterViewInit, booleanAttribute, ChangeDetectorRef, Component, ContentChild, ContentChildren, ElementRef,
    EventEmitter, HostBinding, HostListener, Inject, Injector, Input, LOCALE_ID,
    OnChanges, OnDestroy, OnInit, Optional, Output, QueryList,
    SimpleChanges, TemplateRef, ViewChild, ViewContainerRef
} from '@angular/core';
import { NgTemplateOutlet, getLocaleFirstDayOfWeek } from '@angular/common';
import {
    AbstractControl, ControlValueAccessor, NgControl,
    NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator
} from '@angular/forms';

import { fromEvent, merge, MonoTypeOperatorFunction, noop, Subscription } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { CalendarSelection, IgxCalendarComponent, IgxCalendarHeaderTemplateDirective, IgxCalendarHeaderTitleTemplateDirective, IgxCalendarSubheaderTemplateDirective } from '../calendar/public_api';
import { DateRangeDescriptor, DateRangeType } from '../core/dates';
import { DateRangePickerResourceStringsEN, IDateRangePickerResourceStrings } from '../core/i18n/date-range-picker-resources';
import { clamp, IBaseCancelableBrowserEventArgs, isDate, parseDate, PlatformUtil } from '../core/utils';
import { IgxCalendarContainerComponent } from '../date-common/calendar-container/calendar-container.component';
import { PickerBaseDirective } from '../date-common/picker-base.directive';
import { IgxPickerActionsDirective } from '../date-common/picker-icons.common';
import { DateTimeUtil } from '../date-common/util/date-time.util';
import { IgxOverlayOutletDirective } from '../directives/toggle/toggle.directive';
import {
    IgxInputDirective, IgxInputGroupComponent, IgxInputGroupType, IgxInputState,
    IgxLabelDirective, IGX_INPUT_GROUP_TYPE
} from '../input-group/public_api';
import {
    AutoPositionStrategy, IgxOverlayService, OverlayCancelableEventArgs, OverlayEventArgs,
    OverlaySettings, PositionSettings
} from '../services/public_api';
import { DateRange, IgxDateRangeEndComponent, IgxDateRangeInputsBaseComponent, IgxDateRangeSeparatorDirective, IgxDateRangeStartComponent, DateRangePickerFormatPipe, CustomDateRange } from './date-range-picker-inputs.common';
import { IgxPrefixDirective } from '../directives/prefix/prefix.directive';
import { IgxIconComponent } from '../icon/icon.component';
import { getCurrentResourceStrings } from '../core/i18n/resources';
import { fadeIn, fadeOut } from 'igniteui-angular/animations';
import { PickerCalendarOrientation } from '../date-common/types';
import { calendarRange, isDateInRanges } from '../calendar/common/helpers';

const SingleInputDatesConcatenationString = ' - ';

/**
 * Provides the ability to select a range of dates from a calendar UI or editable inputs.
 *
 * @igxModule IgxDateRangeModule
 *
 * @igxTheme igx-input-group-theme, igx-calendar-theme, igx-date-range-picker-theme
 *
 * @igxKeywords date, range, date range, date picker
 *
 * @igxGroup scheduling
 *
 * @remarks
 * It displays the range selection in a single or two input fields.
 * The default template displays a single *readonly* input field
 * while projecting `igx-date-range-start` and `igx-date-range-end`
 * displays two *editable* input fields.
 *
 * @example
 * ```html
 * <igx-date-range-picker mode="dropdown"></igx-date-range-picker>
 * ```
 */
@Component({
    selector: 'igx-date-range-picker',
    templateUrl: './date-range-picker.component.html',
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: IgxDateRangePickerComponent, multi: true },
        { provide: NG_VALIDATORS, useExisting: IgxDateRangePickerComponent, multi: true }
    ],
    imports: [
        NgTemplateOutlet,
        IgxIconComponent,
        IgxInputGroupComponent,
        IgxInputDirective,
        IgxPrefixDirective,
        DateRangePickerFormatPipe
    ]
})
export class IgxDateRangePickerComponent extends PickerBaseDirective
    implements OnChanges, OnInit, AfterViewInit, OnDestroy, ControlValueAccessor, Validator {

    /**
     * The number of displayed month views.
     *
     * @remarks
     * Default is `2`.
     *
     * @example
     * ```html
     * <igx-date-range-picker [displayMonthsCount]="3"></igx-date-range-picker>
     * ```
     */
    @Input()
    public get displayMonthsCount(): number {
        return this._displayMonthsCount;
    }

    public set displayMonthsCount(value: number) {
        this._displayMonthsCount = clamp(value, 1, 2);
    }

    /**
     * Gets/Sets the orientation of the multiple months displayed in the picker's calendar's days view.
     *
     * @example
     * <igx-date-range-picker orientation="vertical"></igx-date-range-picker>
     */
    @Input()
    public orientation: PickerCalendarOrientation = PickerCalendarOrientation.Horizontal;

    /**
     * Gets/Sets whether dates that are not part of the current month will be displayed.
     *
     * @remarks
     * Default value is `false`.
     *
     * @example
     * ```html
     * <igx-date-range-picker [hideOutsideDays]="true"></igx-date-range-picker>
     * ```
     */
    @Input({ transform: booleanAttribute })
    public hideOutsideDays: boolean;

    /**
     * A custom formatter function, applied on the selected or passed in date.
     *
     * @example
     * ```typescript
     * private dayFormatter = new Intl.DateTimeFormat("en", { weekday: "long" });
     * private monthFormatter = new Intl.DateTimeFormat("en", { month: "long" });
     *
     * public formatter(date: Date): string {
     *  return `${this.dayFormatter.format(date)} - ${this.monthFormatter.format(date)} - ${date.getFullYear()}`;
     * }
     * ```
     * ```html
     * <igx-date-range-picker [formatter]="formatter"></igx-date-range-picker>
     * ```
     */
    @Input()
    public formatter: (val: DateRange) => string;

    /**
     * Overrides the default text of the calendar dialog **Done** button.
     *
     * @remarks
     * Defaults to the value from resource strings, `"Done"` for the built-in EN.
     * The button will only show up in `dialog` mode.
     *
     * @example
     * ```html
     * <igx-date-range-picker doneButtonText="完了"></igx-date-range-picker>
     * ```
     */
    @Input()
    public set doneButtonText(value: string) {
        this._doneButtonText = value;
    }

    public get doneButtonText(): string {
        if (this._doneButtonText === null) {
            return this.resourceStrings.igx_date_range_picker_done_button;
        }
        return this._doneButtonText;
    }
    /**
     * Overrides the default text of the calendar dialog **Cancel** button.
     *
     * @remarks
     * Defaults to the value from resource strings, `"Cancel"` for the built-in EN.
     * The button will only show up in `dialog` mode.
     *
     * @example
     * ```html
     * <igx-date-range-picker cancelButtonText="取消"></igx-date-range-picker>
     * ```
     */
    @Input()
    public set cancelButtonText(value: string) {
        this._cancelButtonText = value;
    }

    public get cancelButtonText(): string {
        if (this._cancelButtonText === null) {
            return this.resourceStrings.igx_date_range_picker_cancel_button;
        }
        return this._cancelButtonText;
    }
    /**
     * Custom overlay settings that should be used to display the calendar.
     *
     * @example
     * ```html
     * <igx-date-range-picker [overlaySettings]="customOverlaySettings"></igx-date-range-picker>
     * ```
     */
    @Input()
    public override overlaySettings: OverlaySettings;

    /**
     * The format used when editable inputs are not focused.
     *
     * @remarks
     * Uses Angular's DatePipe.
     *
     * @example
     * ```html
     * <igx-date-range-picker displayFormat="EE/M/yy"></igx-date-range-picker>
     * ```
     *
     */
    @Input()
    public override displayFormat: string;

    /**
     * The expected user input format and placeholder.
     *
     * @example
     * ```html
     * <igx-date-range-picker inputFormat="dd/MM/yy"></igx-date-range-picker>
     * ```
     */
    @Input()
    public override inputFormat: string;

    /**
     * The minimum value in a valid range.
     *
     * @example
     * <igx-date-range-picker [minValue]="minDate"></igx-date-range-picker>
     */
    @Input()
    public set minValue(value: Date | string) {
        this._minValue = value;
        this.onValidatorChange();
    }

    public get minValue(): Date | string {
        return this._minValue;
    }

    /**
     * The maximum value in a valid range.
     *
     * @example
     * <igx-date-range-picker [maxValue]="maxDate"></igx-date-range-picker>
     */
    @Input()
    public set maxValue(value: Date | string) {
        this._maxValue = value;
        this.onValidatorChange();
    }

    public get maxValue(): Date | string {
        return this._maxValue;
    }

    /**
     * Gets/Sets the disabled dates descriptors.
     *
     * @example
     * ```typescript
     * let disabledDates = this.dateRangePicker.disabledDates;
     * this.dateRangePicker.disabledDates = [ {type: DateRangeType.Weekends}, ...];
     * ```
     */
    @Input()
    public get disabledDates(): DateRangeDescriptor[] {
        return this._disabledDates;
    }
    public set disabledDates(value: DateRangeDescriptor[]) {
        this._disabledDates = value;
        this.onValidatorChange();
    }

    /**
     * Gets/Sets the special dates descriptors.
     *
     * @example
     * ```typescript
     * let specialDates = this.dateRangePicker.specialDates;
     * this.dateRangePicker.specialDates = [ {type: DateRangeType.Weekends}, ... ];
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
     * An accessor that sets the resource strings.
     * By default it uses EN resources.
     */
    @Input()
    public set resourceStrings(value: IDateRangePickerResourceStrings) {
        this._resourceStrings = Object.assign({}, this._resourceStrings, value);
    }

    /**
     * An accessor that returns the resource strings.
     */
    public get resourceStrings(): IDateRangePickerResourceStrings {
        return this._resourceStrings;
    }

    /**
     * Sets the `placeholder` for single-input `IgxDateRangePickerComponent`.
     *
     *   @example
     * ```html
     * <igx-date-range-picker [placeholder]="'Choose your dates'"></igx-date-range-picker>
     * ```
     */
    @Input()
    public override placeholder = '';

    /**
     * Gets/Sets the container used for the popup element.
     *
     * @remarks
     *  `outlet` is an instance of `IgxOverlayOutletDirective` or an `ElementRef`.
     * @example
     * ```html
     * <div igxOverlayOutlet #outlet="overlay-outlet"></div>
     * //..
     * <igx-date-range-picker [outlet]="outlet"></igx-date-range-picker>
     * //..
     * ```
     */
    @Input()
    public override outlet: IgxOverlayOutletDirective | ElementRef<any>;

    /**
     * Show/hide week numbers
     *
     * @remarks
     * Default is `false`.
     *
     * @example
     * ```html
     * <igx-date-range-picker [showWeekNumbers]="true"></igx-date-range-picker>
     * ``
     */
    @Input({ transform: booleanAttribute })
    public showWeekNumbers = false;

    /**
     * Emitted when the picker's value changes. Used for two-way binding.
     *
     * @example
     * ```html
     * <igx-date-range-picker [(value)]="date"></igx-date-range-picker>
     * ```
     */

     /**
      * Whether to render built-in predefined ranges.
      *
      * @example
      * ```html
      * <igx-date-range-picker [(usePredefinedRanges)]="true"></igx-date-range-picker>
      * ``
      *  */
    @Input() public usePredefinedRanges = false;

    /**
     *  Custom ranges rendered as chips.
     *
     * @example
     * ```html
     * <igx-date-range-picker [(usePredefinedRanges)]="true"></igx-date-range-picker>
     * ``
    */
    @Input() public customRanges: CustomDateRange[] = [];

    @Output()
    public valueChange = new EventEmitter<DateRange>();

    /** @hidden @internal */
    @HostBinding('class.igx-date-range-picker')
    public cssClass = 'igx-date-range-picker';

    @ViewChild(IgxInputGroupComponent, { read: ViewContainerRef })
    private viewContainerRef: ViewContainerRef;

    /** @hidden @internal */
    @ViewChild(IgxInputDirective)
    public inputDirective: IgxInputDirective;

    /** @hidden @internal */
    @ContentChildren(IgxDateRangeInputsBaseComponent)
    public projectedInputs: QueryList<IgxDateRangeInputsBaseComponent>;

    @ContentChild(IgxLabelDirective)
    public label: IgxLabelDirective;

    @ContentChild(IgxPickerActionsDirective)
    public pickerActions: IgxPickerActionsDirective;

    /** @hidden @internal */
    @ContentChild(IgxDateRangeSeparatorDirective, { read: TemplateRef })
    public dateSeparatorTemplate: TemplateRef<any>;


    @ContentChild(IgxCalendarHeaderTitleTemplateDirective)
    private headerTitleTemplate: IgxCalendarHeaderTitleTemplateDirective;

    @ContentChild(IgxCalendarHeaderTemplateDirective)
    private headerTemplate: IgxCalendarHeaderTemplateDirective;

    @ContentChild(IgxCalendarSubheaderTemplateDirective)
    private subheaderTemplate: IgxCalendarSubheaderTemplateDirective;

    /** @hidden @internal */
    public get dateSeparator(): string {
        if (this._dateSeparator === null) {
            return this.resourceStrings.igx_date_range_picker_date_separator;
        }
        return this._dateSeparator;
    }

    /** @hidden @internal */
    public get appliedFormat(): string {
        return DateTimeUtil.getLocaleDateFormat(this.locale, this.displayFormat)
            || DateTimeUtil.DEFAULT_INPUT_FORMAT;
    }

    /**
     * Gets/Sets the date which is shown in the calendar picker and is highlighted.
     * By default it is the current date, or the value of the picker, if set.
    */
    @Input()
    public get activeDate(): Date {
        const today = new Date(new Date().setHours(0, 0, 0, 0));
        const dateValue = DateTimeUtil.isValidDate(this._firstDefinedInRange) ? new Date(this._firstDefinedInRange.setHours(0, 0, 0, 0)) : null;
        return this._activeDate ?? dateValue ?? this._calendar?.activeDate ?? today;
    }

    public set activeDate(value: Date) {
        this._activeDate = value;
    }

    /**
     * @example
     * ```html
     * <igx-date-range-picker locale="jp"></igx-date-range-picker>
     * ```
     */
    /**
     * Gets the `locale` of the date-range-picker.
     * If not set, defaults to application's locale.
     */
    @Input()
    public override get locale(): string {
        return this._locale;
    }

    /**
     * Sets the `locale` of the date-picker.
     * Expects a valid BCP 47 language tag.
     */
    public override set locale(value: string) {
        this._locale = value;
        // if value is invalid, set it back to _localeId
        try {
            getLocaleFirstDayOfWeek(this._locale);
        } catch (e) {
            this._locale = this._localeId;
        }
        if (this.hasProjectedInputs) {
            this.updateInputLocale();
            this.updateDisplayFormat();
        }
    }

    /** @hidden @internal */
    public get singleInputFormat(): string {
        if (this.placeholder !== '') {
            return this.placeholder;
        }

        const format = this.appliedFormat;
        return `${format}${SingleInputDatesConcatenationString}${format}`;
    }

    /**
     * Gets calendar state.
     *
     * ```typescript
     * let state = this.dateRange.collapsed;
     * ```
     */
    public override get collapsed(): boolean {
        return this._collapsed;
    }

    /**
     * The currently selected value / range from the calendar
     *
     * @remarks
     * The current value is of type `DateRange`
     *
     * @example
     * ```typescript
     * const newValue: DateRange = { start: new Date("2/2/2012"), end: new Date("3/3/2013")};
     * this.dateRangePicker.value = newValue;
     * ```
     */
    public get value(): DateRange | null {
        return this._value;
    }

    @Input()
    public set value(value: DateRange | null) {
        this.updateValue(value);
        this.onChangeCallback(value);
        this.valueChange.emit(value);
    }

    /** @hidden @internal */
    public get hasProjectedInputs(): boolean {
        return this.projectedInputs?.length > 0;
    }

    /** @hidden @internal */
    public get separatorClass(): string {
        return 'igx-date-range-picker__label';
    }

    protected override get toggleContainer(): HTMLElement | undefined {
        return this._calendarContainer;
    }

    private get required(): boolean {
        if (this._ngControl && this._ngControl.control && this._ngControl.control.validator) {
            const error = this._ngControl.control.validator({} as AbstractControl);
            return (error && error.required) ? true : false;
        }

        return false;
    }

    private get calendar(): IgxCalendarComponent {
        return this._calendar;
    }

    private get dropdownOverlaySettings(): OverlaySettings {
        return Object.assign({}, this._dropDownOverlaySettings, this.overlaySettings);
    }

    private get dialogOverlaySettings(): OverlaySettings {
        return Object.assign({}, this._dialogOverlaySettings, this.overlaySettings);
    }

    private get _firstDefinedInRange(): Date | null {
        if (!this.value) {
            return null;
        }
        const range = this.toRangeOfDates(this.value);
        return range?.start ?? range?.end ?? null;
    }

    private _resourceStrings = getCurrentResourceStrings(DateRangePickerResourceStringsEN);
    private _doneButtonText = null;
    private _cancelButtonText = null;
    private _dateSeparator = null;
    private _value: DateRange | null;
    private _originalValue: DateRange | null;
    private _overlayId: string;
    private _ngControl: NgControl;
    private _statusChanges$: Subscription;
    private _calendar: IgxCalendarComponent;
    private _calendarContainer?: HTMLElement;
    private _positionSettings: PositionSettings;
    private _focusedInput: IgxDateRangeInputsBaseComponent;
    private _displayMonthsCount = 2;
    private _specialDates: DateRangeDescriptor[] = null;
    private _disabledDates: DateRangeDescriptor[] = null;
    private _activeDate: Date | null = null;
    private _overlaySubFilter:
        [MonoTypeOperatorFunction<OverlayEventArgs>, MonoTypeOperatorFunction<OverlayEventArgs | OverlayCancelableEventArgs>] = [
            filter(x => x.id === this._overlayId),
            takeUntil(merge(this._destroy$, this.closed))
        ];
    private _dialogOverlaySettings: OverlaySettings = {
        closeOnOutsideClick: true,
        modal: true,
        closeOnEscape: true
    };
    private _dropDownOverlaySettings: OverlaySettings = {
        closeOnOutsideClick: true,
        modal: false,
        closeOnEscape: true
    };
    private onChangeCallback: (dateRange: DateRange) => void = noop;
    private onTouchCallback: () => void = noop;
    private onValidatorChange: () => void = noop;

    constructor(element: ElementRef,
        @Inject(LOCALE_ID) _localeId: string,
        protected platform: PlatformUtil,
        private _injector: Injector,
        private _cdr: ChangeDetectorRef,
        @Inject(IgxOverlayService) private _overlayService: IgxOverlayService,
        @Optional() @Inject(IGX_INPUT_GROUP_TYPE) _inputGroupType?: IgxInputGroupType) {
        super(element, _localeId, _inputGroupType);
        this.locale = this.locale || this._localeId;
    }

    /** @hidden @internal */
    @HostListener('keydown', ['$event'])
    /** @hidden @internal */
    public onKeyDown(event: KeyboardEvent): void {
        switch (event.key) {
            case this.platform.KEYMAP.ARROW_UP:
                if (event.altKey) {
                    this.close();
                }
                break;
            case this.platform.KEYMAP.ARROW_DOWN:
                if (event.altKey) {
                    this.open();
                }
                break;
        }
    }

    /**
     * Opens the date range picker's dropdown or dialog.
     *
     * @example
     * ```html
     * <igx-date-range-picker #dateRange></igx-date-range-picker>
     *
     * <button type="button" igxButton (click)="dateRange.open()">Open Dialog</button
     * ```
     */
    public open(overlaySettings?: OverlaySettings): void {
        if (!this.collapsed || this.disabled) {
            return;
        }

        this._originalValue = this._value
            ? { start: new Date(this._value.start), end: new Date(this._value.end) }
            : null;

        const settings = Object.assign({}, this.isDropdown
            ? this.dropdownOverlaySettings
            : this.dialogOverlaySettings
            , overlaySettings);

        this._overlayId = this._overlayService
            .attach(IgxCalendarContainerComponent, this.viewContainerRef, settings);
        this.subscribeToOverlayEvents();
        this._overlayService.show(this._overlayId);
    }

    /**
     * Closes the date range picker's dropdown or dialog.
     *
     * @example
     * ```html
     * <igx-date-range-picker #dateRange></igx-date-range-picker>
     *
     * <button type="button" igxButton (click)="dateRange.close()">Close Dialog</button>
     * ```
     */
    public close(): void {
        if (!this.collapsed) {
            this._overlayService.hide(this._overlayId);
        }
    }

    /**
     * Toggles the date range picker's dropdown or dialog
     *
     * @example
     * ```html
     * <igx-date-range-picker #dateRange></igx-date-range-picker>
     *
     * <button type="button" igxButton (click)="dateRange.toggle()">Toggle Dialog</button>
     * ```
     */
    public toggle(overlaySettings?: OverlaySettings): void {
        if (!this.collapsed) {
            this.close();
        } else {
            this.open(overlaySettings);
        }
    }

    /**
     * Selects a range of dates. If no `endDate` is passed, range is 1 day (only `startDate`)
     *
     * @example
     * ```typescript
     * public selectFiveDayRange() {
     *  const today = new Date();
     *  const inFiveDays = new Date(new Date().setDate(today.getDate() + 5));
     *  this.dateRange.select(today, inFiveDays);
     * }
     * ```
     */
    public select(startDate: Date, endDate?: Date): void {
        endDate = endDate ?? startDate;
        const dateRange = [startDate, endDate];
        this.handleSelection(dateRange);
    }

    /** @hidden @internal */
    public writeValue(value: DateRange): void {
        this.updateValue(value);
    }

    /** @hidden @internal */
    public registerOnChange(fn: any): void {
        this.onChangeCallback = fn;
    }

    /** @hidden @internal */
    public registerOnTouched(fn: any): void {
        this.onTouchCallback = fn;
    }

    /** @hidden @internal */
    public validate(control: AbstractControl): ValidationErrors | null {
        const value: DateRange = control.value;
        const errors = {};
        if (value) {
            if (this.hasProjectedInputs) {
                const startInput = this.projectedInputs.find(i => i instanceof IgxDateRangeStartComponent) as IgxDateRangeStartComponent;
                const endInput = this.projectedInputs.find(i => i instanceof IgxDateRangeEndComponent) as IgxDateRangeEndComponent;
                if (!startInput.dateTimeEditor.value) {
                    Object.assign(errors, { startValue: true });
                }
                if (!endInput.dateTimeEditor.value) {
                    Object.assign(errors, { endValue: true });
                }
            }

            if (this._isValueInDisabledRange(value)) {
                Object.assign(errors, { dateIsDisabled: true });
            }

            const { minValue, maxValue } = this._getMinMaxDates();
            const start = parseDate(value.start);
            const end = parseDate(value.end);
            if ((minValue && start && DateTimeUtil.lessThanMinValue(start, minValue, false))
                || (minValue && end && DateTimeUtil.lessThanMinValue(end, minValue, false))) {
                Object.assign(errors, { minValue: true });
            }
            if ((maxValue && start && DateTimeUtil.greaterThanMaxValue(start, maxValue, false))
                || (maxValue && end && DateTimeUtil.greaterThanMaxValue(end, maxValue, false))) {
                Object.assign(errors, { maxValue: true });
            }
        }

        return Object.keys(errors).length > 0 ? errors : null;
    }

    /** @hidden @internal */
    public registerOnValidatorChange?(fn: any): void {
        this.onValidatorChange = fn;
    }

    /** @hidden @internal */
    public setDisabledState?(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    /** @hidden */
    public ngOnInit(): void {
        this._ngControl = this._injector.get<NgControl>(NgControl, null);

        this.locale = this.locale || this._localeId;
    }

    /** @hidden */
    public override ngAfterViewInit(): void {
        super.ngAfterViewInit();
        this.subscribeToDateEditorEvents();
        this.configPositionStrategy();
        this.configOverlaySettings();
        this.cacheFocusedInput();
        this.attachOnTouched();

        this.setRequiredToInputs();

        if (this._ngControl) {
            this._statusChanges$ = this._ngControl.statusChanges.subscribe(this.onStatusChanged.bind(this));
        }

        // delay invocations until the current change detection cycle has completed
        Promise.resolve().then(() => {
            this.updateDisabledState();
            this.initialSetValue();
            this.updateInputs();
            // B.P. 07 July 2021 - IgxDateRangePicker not showing initial disabled state with ChangeDetectionStrategy.OnPush #9776
            /**
             * if disabled is placed on the range picker element and there are projected inputs
             * run change detection since igxInput will initially set the projected inputs' disabled to false
             */
            if (this.hasProjectedInputs && this.disabled) {
                this._cdr.markForCheck();
            }
        });
        this.updateDisplayFormat();
        this.updateInputFormat();
    }

    /** @hidden @internal */
    public ngOnChanges(changes: SimpleChanges): void {
        if (changes['displayFormat'] && this.hasProjectedInputs) {
            this.updateDisplayFormat();
        }
        if (changes['inputFormat'] && this.hasProjectedInputs) {
            this.updateInputFormat();
        }
        if (changes['disabled']) {
            this.updateDisabledState();
        }
    }

    /** @hidden @internal */
    public override ngOnDestroy(): void {
        super.ngOnDestroy();
        if (this._statusChanges$) {
            this._statusChanges$.unsubscribe();
        }
        if (this._overlayId) {
            this._overlayService.detach(this._overlayId);
        }
    }

    /** @hidden @internal */
    public getEditElement() {
        return this.inputDirective.nativeElement;
    }

    protected onStatusChanged = () => {
        if (this.inputGroup) {
            this.setValidityState(this.inputDirective, this.inputGroup.isFocused);
        } else if (this.hasProjectedInputs) {
            this.projectedInputs
                .forEach((i) => {
                    this.setValidityState(i.inputDirective, i.isFocused);
                });
        }
        this.setRequiredToInputs();
    };

    private setValidityState(inputDirective: IgxInputDirective, isFocused: boolean) {
        if (this._ngControl && !this._ngControl.disabled && this.isTouchedOrDirty) {
            if (this.hasValidators && isFocused) {
                inputDirective.valid = this._ngControl.valid ? IgxInputState.VALID : IgxInputState.INVALID;
            } else {
                inputDirective.valid = this._ngControl.valid ? IgxInputState.INITIAL : IgxInputState.INVALID;
            }
        } else {
            inputDirective.valid = IgxInputState.INITIAL;
        }
    }

    private get isTouchedOrDirty(): boolean {
        return (this._ngControl.control.touched || this._ngControl.control.dirty);
    }

    private get hasValidators(): boolean {
        return (!!this._ngControl.control.validator || !!this._ngControl.control.asyncValidator);
    }

    private handleSelection(selectionData: Date[]): void {
        let newValue = this.extractRange(selectionData);
        if (!newValue.start && !newValue.end) {
            newValue = null;
        }
        this.value = newValue;
        if (this.isDropdown && selectionData?.length > 1) {
            this.close();
        }
        this._setCalendarActiveDate();
    }

    private handleClosing(e: IBaseCancelableBrowserEventArgs): void {
        const args = { owner: this, cancel: e?.cancel, event: e?.event };
        this.closing.emit(args);
        e.cancel = args.cancel;
        if (args.cancel) {
            return;
        }

        if (this.isDropdown && e?.event && !this.isFocused) {
            // outside click
            this.updateValidityOnBlur();
        } else {
            this.onTouchCallback();
            // input click
            if (this.hasProjectedInputs && this._focusedInput) {
                this._focusedInput.setFocus();
            }
            if (this.inputDirective) {
                this.inputDirective.focus();
            }
        }
    }

    private subscribeToOverlayEvents() {
        this._overlayService.opening.pipe(...this._overlaySubFilter).subscribe((e) => {
            const overlayEvent = e as OverlayCancelableEventArgs;
            const args = { owner: this, cancel: overlayEvent?.cancel, event: e.event };
            this.opening.emit(args);
            if (args.cancel) {
                this._overlayService.detach(this._overlayId);
                overlayEvent.cancel = true;
                return;
            }

            this._initializeCalendarContainer(e.componentRef.instance);
            this._calendarContainer = e.componentRef.location.nativeElement;
            this._collapsed = false;
            this.updateCalendar();
        });

        this._overlayService.opened.pipe(...this._overlaySubFilter).subscribe(() => {
            this.calendar.wrapper.nativeElement.focus();
            this.opened.emit({ owner: this });
        });

        this._overlayService.closing.pipe(...this._overlaySubFilter).subscribe((e: OverlayCancelableEventArgs) => {
            const isEscape = e.event && (e.event as KeyboardEvent).key === this.platform.KEYMAP.ESCAPE;
            if (this.isProjectedInputTarget(e.event) && !isEscape) {
                e.cancel = true;
            }
            this.handleClosing(e as OverlayCancelableEventArgs);
        });

        this._overlayService.closed.pipe(...this._overlaySubFilter).subscribe(() => {
            this._overlayService.detach(this._overlayId);
            this._collapsed = true;
            this._overlayId = null;
            this._calendar = null;
            this._calendarContainer = undefined;
            this.closed.emit({ owner: this });
        });
    }

    private isProjectedInputTarget(event: Event): boolean {
        if (!this.hasProjectedInputs || !event) {
            return false;
        }
        const path = event.composed ? event.composedPath() : [event.target];
        return this.projectedInputs.some(i =>
            path.includes(i.dateTimeEditor.nativeElement)
        );
    }

    private updateValue(value: DateRange) {
        this._value = value ? value : null;
        this.updateInputs();
        this.updateCalendar();
    }

    private updateValidityOnBlur() {
        this._focusedInput = null;
        this.onTouchCallback();
        if (this._ngControl) {
            if (this.hasProjectedInputs) {
                this.projectedInputs.forEach(i => {
                    if (!this._ngControl.valid) {
                        i.updateInputValidity(IgxInputState.INVALID);
                    } else {
                        i.updateInputValidity(IgxInputState.INITIAL);
                    }
                });
            }

            if (this.inputDirective) {
                if (!this._ngControl.valid) {
                    this.inputDirective.valid = IgxInputState.INVALID;
                } else {
                    this.inputDirective.valid = IgxInputState.INITIAL;
                }
            }
        }
    }

    private updateDisabledState() {
        if (this.hasProjectedInputs) {
            const start = this.projectedInputs.find(i => i instanceof IgxDateRangeStartComponent) as IgxDateRangeStartComponent;
            const end = this.projectedInputs.find(i => i instanceof IgxDateRangeEndComponent) as IgxDateRangeEndComponent;
            start.inputDirective.disabled = this.disabled;
            end.inputDirective.disabled = this.disabled;
            return;
        }
    }

    private setRequiredToInputs(): void {
        // workaround for igxInput setting required
        Promise.resolve().then(() => {
            const isRequired = this.required;
            if (this.inputGroup && this.inputGroup.isRequired !== isRequired) {
                this.inputGroup.isRequired = isRequired;
            } else if (this.hasProjectedInputs && this._ngControl) {
                this.projectedInputs.forEach(i => i.isRequired = isRequired);
            }
        });
    }

    private parseMinValue(value: string | Date): Date | null {
        let minValue: Date = parseDate(value);
        if (!minValue && this.hasProjectedInputs) {
            const start = this.projectedInputs.filter(i => i instanceof IgxDateRangeStartComponent)[0];
            if (start) {
                minValue = parseDate(start.dateTimeEditor.minValue);
            }
        }

        return minValue;
    }

    private parseMaxValue(value: string | Date): Date | null {
        let maxValue: Date = parseDate(value);
        if (!maxValue && this.projectedInputs) {
            const end = this.projectedInputs.filter(i => i instanceof IgxDateRangeEndComponent)[0];
            if (end) {
                maxValue = parseDate(end.dateTimeEditor.maxValue);
            }
        }

        return maxValue;
    }

    private updateCalendar(): void {
        if (!this.calendar) {
            return;
        }
        this._setDisabledDates();

        const range: Date[] = [];
        if (this.value) {
            const _value = this.toRangeOfDates(this.value);
            if (_value.start && _value.end) {
                if (DateTimeUtil.greaterThanMaxValue(_value.start, _value.end)) {
                    this.swapEditorDates();
                }
            }
            if (_value.start) {
                range.push(_value.start);
            }
            if (_value.end) {
                range.push(_value.end);
            }
        }

        if (range.length > 0) {
            this.calendar.selectDate(range);
        } else if (range.length === 0 && this.calendar.monthViews) {
            this.calendar.deselectDate();
        }
        this._setCalendarActiveDate();
        this._cdr.detectChanges();
    }

    private swapEditorDates(): void {
        if (this.hasProjectedInputs) {
            const start = this.projectedInputs.find(i => i instanceof IgxDateRangeStartComponent) as IgxDateRangeStartComponent;
            const end = this.projectedInputs.find(i => i instanceof IgxDateRangeEndComponent) as IgxDateRangeEndComponent;
            [start.dateTimeEditor.value, end.dateTimeEditor.value] = [end.dateTimeEditor.value, start.dateTimeEditor.value];
            [this.value.start, this.value.end] = [this.value.end, this.value.start];
        }
    }

    private extractRange(selection: Date[]): DateRange {
        return {
            start: selection[0] || null,
            end: selection.length > 0 ? selection[selection.length - 1] : null
        };
    }

    private toRangeOfDates(range: DateRange): { start: Date; end: Date } {
        let start;
        let end;
        if (!isDate(range.start)) {
            start = DateTimeUtil.parseIsoDate(range.start);
        }
        if (!isDate(range.end)) {
            end = DateTimeUtil.parseIsoDate(range.end);
        }

        if (start || end) {
            return { start, end };
        }

        return { start: range.start as Date, end: range.end as Date };
    }

    private subscribeToDateEditorEvents(): void {
        if (this.hasProjectedInputs) {
            const start = this.projectedInputs.find(i => i instanceof IgxDateRangeStartComponent) as IgxDateRangeStartComponent;
            const end = this.projectedInputs.find(i => i instanceof IgxDateRangeEndComponent) as IgxDateRangeEndComponent;
            if (start && end) {
                start.dateTimeEditor.valueChange
                    .pipe(takeUntil(this._destroy$))
                    .subscribe(value => {
                        if (this.value) {
                            this.value = { start: value, end: this.value.end };
                        } else {
                            this.value = { start: value, end: null };
                        }
                        if (this.calendar) {
                            this._setCalendarActiveDate(parseDate(value));
                            this._cdr.detectChanges();
                        }
                    });
                end.dateTimeEditor.valueChange
                    .pipe(takeUntil(this._destroy$))
                    .subscribe(value => {
                        if (this.value) {
                            this.value = { start: this.value.start, end: value as Date };
                        } else {
                            this.value = { start: null, end: value as Date };
                        }
                        if (this.calendar) {
                            this._setCalendarActiveDate(parseDate(value));
                            this._cdr.detectChanges();
                        }
                    });
            }
        }
    }

    private attachOnTouched(): void {
        if (this.hasProjectedInputs) {
            this.projectedInputs.forEach(i => {
                fromEvent(i.dateTimeEditor.nativeElement, 'blur')
                    .pipe(takeUntil(this._destroy$))
                    .subscribe(() => {
                        if (this.collapsed) {
                            this.updateValidityOnBlur();
                        }
                    });
            });
        } else {
            fromEvent(this.inputDirective.nativeElement, 'blur')
                .pipe(takeUntil(this._destroy$))
                .subscribe(() => {
                    if (this.collapsed) {
                        this.updateValidityOnBlur();
                    }
                });
        }
    }

    private cacheFocusedInput(): void {
        if (this.hasProjectedInputs) {
            this.projectedInputs.forEach(i => {
                fromEvent(i.dateTimeEditor.nativeElement, 'focus')
                    .pipe(takeUntil(this._destroy$))
                    .subscribe(() => this._focusedInput = i);
            });
        }
    }

    private configPositionStrategy(): void {
        this._positionSettings = {
            openAnimation: fadeIn,
            closeAnimation: fadeOut
        };
        this._dropDownOverlaySettings.positionStrategy = new AutoPositionStrategy(this._positionSettings);
        this._dropDownOverlaySettings.target = this.element.nativeElement;
    }

    private configOverlaySettings(): void {
        if (this.overlaySettings !== null) {
            this._dropDownOverlaySettings = Object.assign({}, this._dropDownOverlaySettings, this.overlaySettings);
            this._dialogOverlaySettings = Object.assign({}, this._dialogOverlaySettings, this.overlaySettings);
        }
    }

    private initialSetValue() {
        // if there is no value and no ngControl on the picker but we have inputs we may have value set through
        // their ngModels - we should generate our initial control value
        if ((!this.value || (!this.value.start && !this.value.end)) && this.hasProjectedInputs && !this._ngControl) {
            const start = this.projectedInputs.find(i => i instanceof IgxDateRangeStartComponent);
            const end = this.projectedInputs.find(i => i instanceof IgxDateRangeEndComponent);
            this._value = {
                start: start.dateTimeEditor.value as Date,
                end: end.dateTimeEditor.value as Date
            };
        }
    }

    private updateInputs(): void {
        const start = this.projectedInputs?.find(i => i instanceof IgxDateRangeStartComponent) as IgxDateRangeStartComponent;
        const end = this.projectedInputs?.find(i => i instanceof IgxDateRangeEndComponent) as IgxDateRangeEndComponent;
        if (start && end) {
            const _value = this.value ? this.toRangeOfDates(this.value) : null;
            start.updateInputValue(_value?.start || null);
            end.updateInputValue(_value?.end || null);
        }
    }

    private updateDisplayFormat(): void {
        this.projectedInputs.forEach(i => {
            const input = i as IgxDateRangeInputsBaseComponent;
            input.dateTimeEditor.displayFormat = this.displayFormat;
        });
    }

    private updateInputFormat(): void {
        this.projectedInputs.forEach(i => {
            const input = i as IgxDateRangeInputsBaseComponent;
            if (input.dateTimeEditor.inputFormat !== this.inputFormat) {
                input.dateTimeEditor.inputFormat = this.inputFormat;
            }
        });
    }

    private updateInputLocale(): void {
        this.projectedInputs.forEach(i => {
            const input = i as IgxDateRangeInputsBaseComponent;
            input.dateTimeEditor.locale = this.locale;
        });
    }

    private _initializeCalendarContainer(componentInstance: IgxCalendarContainerComponent) {
        this._calendar = componentInstance.calendar;
        this._calendar.hasHeader = !this.isDropdown && !this.hideHeader;
        this._calendar.locale = this.locale;
        this._calendar.selection = CalendarSelection.RANGE;
        this._calendar.weekStart = this.weekStart;
        this._calendar.hideOutsideDays = this.hideOutsideDays;
        this._calendar.monthsViewNumber = this._displayMonthsCount;
        this._calendar.showWeekNumbers = this.showWeekNumbers;
        this._calendar.headerTitleTemplate = this.headerTitleTemplate;
        this._calendar.headerTemplate = this.headerTemplate;
        this._calendar.subheaderTemplate = this.subheaderTemplate;
        this._calendar.headerOrientation = this.headerOrientation;
        this._calendar.orientation = this.orientation;
        this._calendar.specialDates = this.specialDates;
        this._calendar.selected.pipe(takeUntil(this._destroy$)).subscribe((ev: Date[]) => this.handleSelection(ev));

        this._setDisabledDates();
        this._setCalendarActiveDate();

        componentInstance.mode = this.mode;
        componentInstance.closeButtonLabel = !this.isDropdown ? this.doneButtonText : null;
        componentInstance.cancelButtonLabel = !this.isDropdown ? this.cancelButtonText : null;
        componentInstance.pickerActions = this.pickerActions;
        componentInstance.usePredefinedRanges = this.usePredefinedRanges;
        componentInstance.customRanges = this.customRanges;
        componentInstance.resourceStrings = this.resourceStrings;
        componentInstance.calendarClose.pipe(takeUntil(this._destroy$)).subscribe(() => this.close());
        componentInstance.calendarCancel.pipe(takeUntil(this._destroy$)).subscribe(() => {
            this._value = this._originalValue;
            this.close()
        });
        componentInstance.rangeSelected
        .pipe(takeUntil(this._destroy$))
        .subscribe((r: DateRange) => {
            if (r?.start && r?.end) {
            this.select(new Date(r.start), new Date(r.end));
            }

            if (this.isDropdown) {
            this.close();
            }
        });
    }

    private _setDisabledDates(): void {
        if (!this.calendar) {
            return;
        }
        this.calendar.disabledDates = this.disabledDates ? [...this.disabledDates] : [];
        const { minValue, maxValue } = this._getMinMaxDates();
        if (minValue) {
            this.calendar.disabledDates.push({ type: DateRangeType.Before, dateRange: [minValue] });
        }
        if (maxValue) {
            this.calendar.disabledDates.push({ type: DateRangeType.After, dateRange: [maxValue] });
        }
    }

    private _getMinMaxDates() {
        const minValue = this.parseMinValue(this.minValue);
        const maxValue = this.parseMaxValue(this.maxValue);
        return { minValue, maxValue };
    }

    private _isValueInDisabledRange(value: DateRange) {
        if (value && value.start && value.end && this.disabledDates) {
            const isOutsideDisabledRange = Array.from(
                calendarRange({
                    start: parseDate(this.value.start),
                    end: parseDate(this.value.end),
                    inclusive: true
                })).every((date) => !isDateInRanges(date, this.disabledDates));
            return !isOutsideDisabledRange;
        }
        return false;
    }

    private _setCalendarActiveDate(value = null): void {
        if (this._calendar) {
            this._calendar.activeDate = value ?? this.activeDate;
            this._calendar.viewDate = value ?? this.activeDate;
        }
    }
}
