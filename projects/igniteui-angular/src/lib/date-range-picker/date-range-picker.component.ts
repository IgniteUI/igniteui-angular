import {
    AfterViewInit,
    Component,
    ContentChild,
    ContentChildren,
    ElementRef,
    EventEmitter,
    HostBinding,
    Inject,
    Injector,
    Input,
    LOCALE_ID,
    OnChanges,
    OnDestroy,
    OnInit,
    Optional,
    Output,
    QueryList,
    SimpleChanges,
    TemplateRef,
    ViewChild
} from '@angular/core';
import {
    AbstractControl,
    ControlValueAccessor,
    NgControl,
    NG_VALIDATORS,
    NG_VALUE_ACCESSOR,
    ValidationErrors,
    Validator
} from '@angular/forms';
import { fromEvent, Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { fadeIn, fadeOut } from '../animations/fade';
import { IgxCalendarComponent, WEEKDAYS } from '../calendar/index';
import { DateRangeType } from '../core/dates';
import { DisplayDensityBase, DisplayDensityToken, IDisplayDensityOptions } from '../core/density';
import { InteractionMode } from '../core/enums';
import { CurrentResourceStrings } from '../core/i18n/resources';
import { IToggleView } from '../core/navigation';
import { CancelableBrowserEventArgs, IBaseEventArgs, KEYS } from '../core/utils';
import { DatePickerUtil } from '../date-picker/date-picker.utils';
import { IgxToggleDirective } from '../directives/toggle/toggle.directive';
import { IgxInputDirective, IgxInputGroupComponent, IgxInputState, IgxLabelDirective } from '../input-group';
import { AutoPositionStrategy, OverlaySettings, PositionSettings } from '../services/index';
import {
    DateRange,
    IgxDateRangeEndComponent,
    IgxDateRangeInputsBaseComponent,
    IgxDateRangeSeparatorDirective,
    IgxDateRangeStartComponent,
    IgxPickerToggleComponent
} from './date-range-picker-inputs.common';



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
    ]
})
export class IgxDateRangePickerComponent extends DisplayDensityBase
    implements IToggleView, OnChanges, OnInit, AfterViewInit, OnDestroy, ControlValueAccessor, Validator {
    /**
     * Display calendar in either `dialog` or `dropdown` mode.
     * @remarks
     * Default mode is `dialog`
     *
     * @example
     * ```html
     * <igx-date-range-picker mode="dropdown"></igx-date-range-picker>
     * ```
     */
    @Input()
    public mode = InteractionMode.Dialog;

    /**
     * The number of displayed month views.
     *
     * @remarks
     * Default is `2`.
     *
     * @example
     * ```html
     * <igx-date-range-picker [monthsViewNumber]="3"></igx-date-range-picker>
     * ```
     */
    @Input()
    public monthsViewNumber = 2;

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
    @Input()
    public hideOutsideDays: boolean;

    /**
     * The start day of the week.
     *
     * @remarks
     * Can be assigned to a numeric value or to `WEEKDAYS` enum value.
     *
     * @example
     * ```html
     * <igx-date-range-picker [weekStart]="1"></igx-date-range-picker>
     * ```
     */
    @Input()
    public weekStart = WEEKDAYS.SUNDAY;

    /**
     * The `locale` of the calendar.
     *
     * @remarks
     * Default value is `"en"`.
     *
     * @example
     * ```html
     * <igx-date-range-picker locale="jp"></igx-date-range-picker>
     * ```
     */
    @Input()
    public locale: string;

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
     * The default text of the calendar dialog `done` button.
     *
     * @remarks
     * Default value is `Done`.
     * The button will only show up in `dialog` mode.
     *
     * @example
     * ```html
     * <igx-date-range-picker doneButtonText="完了"></igx-date-range-picker>
     * ```
     */
    @Input()
    public doneButtonText = 'Done';

    /**
     * Custom overlay settings that should be used to display the calendar.
     *
     * @example
     * ```html
     * <igx-date-range-picker [overlaySettings]="customOverlaySettings"></igx-date-range-picker>
     * ```
     */
    @Input()
    public overlaySettings: OverlaySettings;

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
    public displayFormat: string;

    /**
     * The expected user input format and placeholder.
     *
     * @remarks
     * Default is `"'MM/dd/yyyy'"`
     *
     * @example
     * ```html
     * <igx-date-range-picker inputFormat="dd/MM/yy"></igx-date-range-picker>
     * ```
     */
    @Input()
    public inputFormat: string;

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
     * Enables/Disables the `IgxDateRangePickerComponent`.
     *  @example
     * ```html
     * <igx-date-range-picker [disabled]="'true'"></igx-date-range-picker>
     * ```
     */
    @Input()
    public disabled: boolean;

    /**
     * Sets the `placeholder` for single-input `IgxDateRangePickerComponent`.
     *   @example
     * ```html
     * <igx-date-range-picker [placeholder]="'Choose your dates'"></igx-date-range-picker>
     * ```
     */
    @Input()
    public placeholder = '';

    /**
     * Emitted when a range is selected.
     *
     * @example
     * ```html
     * <igx-date-range-picker (rangeSelected)="handleSelected($event)"></igx-date-range-picker>
     * ```
     */
    @Output()
    public rangeSelected = new EventEmitter<DateRange>();

    /**
     * Emitted when the calendar starts opening, cancelable.
     *
     * @example
     * ```html
     * <igx-date-range-picker (onOpening)="handleOpening($event)"></igx-date-range-picker>
     * ```
     */
    @Output()
    public onOpening = new EventEmitter<CancelableBrowserEventArgs & IBaseEventArgs>();

    /**
     * Emitted when the `IgxDateRangeComponent` is opened.
     *
     * @example
     * ```html
     * <igx-date-range-picker (onOpened)="handleOpened($event)"></igx-date-range-picker>
     * ```
     */
    @Output()
    public onOpened = new EventEmitter<IBaseEventArgs>();

    /**
     * Emitted when the calendar starts closing, cancelable.
     *
     * @example
     * ```html
     * <igx-date-range-picker (onClosing)="handleClosing($event)"></igx-date-range-picker>
     * ```
     */
    @Output()
    public onClosing = new EventEmitter<CancelableBrowserEventArgs & IBaseEventArgs>();

    /**
     * Emitted when the `IgxDateRangeComponent` is closed.
     *
     * @example
     * ```html
     * <igx-date-range-picker (onClosed)="handleClosed($event)"></igx-date-range-picker>
     * ```
     */
    @Output()
    public onClosed = new EventEmitter<IBaseEventArgs>();

    /** @hidden @internal */
    @HostBinding('class.igx-date-range-picker')
    public cssClass = 'igx-date-range-picker';

    /** @hidden @internal */
    @ViewChild(IgxCalendarComponent)
    public calendar: IgxCalendarComponent;

    /** @hidden @internal */
    @ViewChild(IgxInputGroupComponent)
    public inputGroup: IgxInputGroupComponent;

    /** @hidden @internal */
    @ViewChild(IgxInputDirective)
    public inputDirective: IgxInputDirective;

    /** @hidden @internal */
    @ViewChild(IgxToggleDirective)
    public toggleDirective: IgxToggleDirective;

    /** @hidden @internal */
    @ContentChildren(IgxPickerToggleComponent, { descendants: true })
    public toggleComponents: QueryList<IgxPickerToggleComponent>;

    /** @hidden @internal */
    @ContentChildren(IgxDateRangeInputsBaseComponent)
    public projectedInputs: QueryList<IgxDateRangeInputsBaseComponent>;

    @ContentChild(IgxLabelDirective)
    public label: IgxLabelDirective;

    /** @hidden @internal */
    @ContentChild(IgxDateRangeSeparatorDirective, { read: TemplateRef })
    public dateSeparatorTemplate: TemplateRef<any>;

    /** @hidden @internal */
    public dateSeparator = CurrentResourceStrings.DateRangePickerResStrings.igx_date_range_picker_date_separator;

    /** @hidden @internal */
    public get appliedFormat(): string {
        if (this.formatter) {
            return this.formatter(this.value);
        }
        if (!this.hasProjectedInputs) {
            if (this.placeholder !== '') {
                return this.placeholder;
            }
            // TODO: use displayFormat - see how shortDate, longDate can be defined
            return this.inputFormat
                ? `${this.inputFormat} - ${this.inputFormat}`
                : `${DatePickerUtil.DEFAULT_INPUT_FORMAT} - ${DatePickerUtil.DEFAULT_INPUT_FORMAT}`;
        } else {
            return this.inputFormat || DatePickerUtil.DEFAULT_INPUT_FORMAT;
        }
    }

    /** @hidden @internal */
    public get hasProjectedInputs(): boolean {
        return this.projectedInputs?.length > 0;
    }

    private get dropdownOverlaySettings(): OverlaySettings {
        return Object.assign({}, this._dropDownOverlaySettings, this.overlaySettings);
    }

    private get dialogOverlaySettings(): OverlaySettings {
        return Object.assign({}, this._dialogOverlaySettings, this.overlaySettings);
    }

    private get required(): boolean {
        if (this._ngControl && this._ngControl.control && this._ngControl.control.validator) {
            const error = this._ngControl.control.validator({} as AbstractControl);
            return (error && error.required) ? true : false;
        }

        return false;
    }

    private _value: DateRange;
    private _collapsed = true;
    private _ngControl: NgControl;
    private _statusChanges$: Subscription;
    private $destroy = new Subject();
    private _minValue: Date | string;
    private _maxValue: Date | string;
    private $toggleClickNotifier = new Subject();
    private _positionSettings: PositionSettings;
    private _dialogOverlaySettings: OverlaySettings = {
        closeOnOutsideClick: true,
        modal: true
    };
    private _dropDownOverlaySettings: OverlaySettings = {
        closeOnOutsideClick: true,
        modal: false
    };
    private onChangeCallback = (dateRange: DateRange) => { };
    private onTouchCallback = () => { };
    private onValidatorChange = () => { };

    constructor(public element: ElementRef,
        @Optional() @Inject(DisplayDensityToken) protected _displayDensityOptions: IDisplayDensityOptions,
        @Inject(LOCALE_ID) private _locale: any,
        private _injector: Injector) {
        super(_displayDensityOptions);
        this.locale = this.locale || this._locale;
    }

    /**
     * Opens the date range picker's dropdown or dialog.
     *
     * @example
     * ```html
     * <igx-date-range-picker #dateRange></igx-date-range-picker>
     *
     * <button (click)="dateRange.open()">Open Dialog</button
     * ```
     */
    public open(overlaySettings?: OverlaySettings): void {
        if (!this.collapsed) { return; }

        this.updateCalendar();
        const settings = this.mode === InteractionMode.Dialog ? this.dialogOverlaySettings : this.dropdownOverlaySettings;
        this.toggleDirective.open(Object.assign(settings, overlaySettings));
    }

    /**
     * Closes the date range picker's dropdown or dialog.
     *
     * @example
     * html```
     * <igx-date-range-picker #dateRange></igx-date-range-picker>
     *
     * <button (click)="dateRange.close()">Close Dialog</button>
     * ```
     */
    public close(): void {
        if (!this.collapsed) {
            this.toggleDirective.close();
        }
    }

    /**
     * Toggles the date range picker's dropdown or dialog
     *
     * @example
     * html```
     * <igx-date-range-picker #dateRange></igx-date-range-picker>
     *
     * <button (click)="dateRange.toggle()">Toggle Dialog</button>
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
     * Gets calendar state.
     *
     * ```typescript
     * let state = this.dateRange.collapsed;
     * ```
     */
    public get collapsed(): boolean {
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
    public get value(): DateRange {
        return this._value;
    }

    @Input()
    public set value(value: DateRange) {
        this.updateValue(value);
        this.onChangeCallback(value);
    }

    private updateValue(value: DateRange) {
        this._value = value ? value : null;
        this.updateInputs();
    }

    /**
     * Selects a range of dates. If no `endDate` is passed, range is 1 day (only `startDate`)
     *
     * @example
     * ```typescript
     * public selectFiveDayRange() {
     *  const inFiveDays = new Date(new Date().setDate(today.getDate() + 5));
     *  const today = new Date();
     *  this.dateRange.selectRange(today, inFiveDays);
     * }
     * ```
     */
    public selectRange(startDate: Date, endDate?: Date): void {
        endDate = endDate ?? startDate;
        const dateRange = [startDate, endDate];
        this.calendar.selectDate(dateRange);
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
            const min = DatePickerUtil.parseDate(this.minValue);
            const max = DatePickerUtil.parseDate(this.maxValue);
            const start = DatePickerUtil.parseDate(value.start);
            const end = DatePickerUtil.parseDate(value.end);

            if ((min && start && DatePickerUtil.lessThanMinValue(start, min, false))
                || (min && end && DatePickerUtil.lessThanMinValue(end, min, false))) {
                Object.assign(errors, { 'minValue': true });
            }
            if ((max && start && DatePickerUtil.greaterThanMaxValue(start, max, false))
                || (max && end && DatePickerUtil.greaterThanMaxValue(end, max, false))) {
                Object.assign(errors, { 'maxValue': true });
            }
        }

        // TODO: fix what happens on blur and ensure on blur the value is either null or with both start and end filled
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

    /** @hidden @internal */
    get separatorClass(): string {
        return this.getComponentDensityClass('igx-date-range-picker__label');
    }

    /** @hidden */
    public ngOnInit(): void {
        this._ngControl = this._injector.get<NgControl>(NgControl, null);
    }

    /** @hidden */
    public ngAfterViewInit(): void {
        if (this.mode === InteractionMode.DropDown) {
            this.attachOnKeydown();
        }
        this.subscribeToDateEditorEvents();
        this.configPositionStrategy();
        this.configOverlaySettings();
        this.attachOnTouched();

        const subsToClicked = () => {
            this.$toggleClickNotifier.next();
            this.toggleComponents.forEach(toggle => {
                toggle.clicked.pipe(takeUntil(this.$toggleClickNotifier)).subscribe(() => this.open());
            });
        };
        this.toggleComponents.changes.pipe(takeUntil(this.$destroy)).subscribe(() => subsToClicked());
        subsToClicked();

        this.setRequiredToInputs();

        if (this._ngControl) {
            this._statusChanges$ = this._ngControl.statusChanges.subscribe(this.onStatusChanged.bind(this));
        }
        this.initialSetValue();
        this.updateInputs();
        this.updateDisplayFormat();
        this.updateInputFormat();
    }

    /** @hidden @internal */
    public ngOnChanges(changes: SimpleChanges): void {
        if (changes['locale']) {
            this.inputFormat = DatePickerUtil.getDefaultInputFormat(this.locale || 'en') || DatePickerUtil.DEFAULT_INPUT_FORMAT;
        }
        if (changes['displayFormat'] && this.hasProjectedInputs) {
            this.updateDisplayFormat();
        }
        if (changes['inputFormat'] && this.hasProjectedInputs) {
            this.updateInputFormat();
        }
    }

    /** @hidden @internal */
    public ngOnDestroy(): void {
        this.$destroy.next();
        this.$destroy.complete();
        this.$toggleClickNotifier.next();
        this.$toggleClickNotifier.complete();
    }

    /** @hidden @internal */
    public handleOpening(event: CancelableBrowserEventArgs & IBaseEventArgs): void {
        this.onOpening.emit(event);
        this._collapsed = false;
    }

    /** @hidden @internal */
    public handleOpened(): void {
        this.calendar.daysView.focusActiveDate();
        this.onOpened.emit({ owner: this });
    }

    /** @hidden @internal */
    public handleClosing(event: CancelableBrowserEventArgs & IBaseEventArgs): void {
        this.onClosing.emit(event);

        if (this.value && this.value.start && !this.value.end) {
            this.value = { start: this.value.start, end: this.value.start };
        }
        if (this.value && !this.value.start && !this.value.end) {
            this.value = null;
        }

        if (this.mode === InteractionMode.DropDown && event.event && !this.element.nativeElement.contains(event.event.target)) {
            // outside click
            this.updateValidityOnBlur();
        } else {
            // input click
            this.focusInput();
        }
    }

    private updateValidityOnBlur() {
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

    private focusInput() {
        // TODO: should we always focus start input?
        (this.projectedInputs
            .find(i => i instanceof IgxDateRangeStartComponent) as IgxDateRangeStartComponent)?.setFocus();
        if (this.inputDirective) {
            this.inputDirective.focus();
        }
    }

    /** @hidden @internal */
    public handleClosed(): void {
        this._collapsed = true;
        this.onClosed.emit({ owner: this });
    }

    /** @hidden @internal */
    public onKeyDown(event: KeyboardEvent): void {
        switch (event.key) {
            case KEYS.UP_ARROW:
            case KEYS.UP_ARROW_IE:
                if (event.altKey) {
                    this.close();
                }
                break;
            case KEYS.DOWN_ARROW:
            case KEYS.DOWN_ARROW_IE:
                if (event.altKey) {
                    this.open();
                }
                break;
            case KEYS.ESCAPE:
            case KEYS.ESCAPE_IE:
                this.close();
                break;
        }
    }

    /** @hidden @internal */
    public handleSelection(selectionData: Date[]): void {
        this.value = this.extractRange(selectionData);
        this.rangeSelected.emit(this.value);
    }

    protected onStatusChanged = () => {
        if ((this._ngControl.control.touched || this._ngControl.control.dirty) &&
            (this._ngControl.control.validator || this._ngControl.control.asyncValidator)) {
            if (this.inputGroup) {
                this.inputDirective.valid = this.getInputState(this.inputGroup.isFocused);
            } else if (this.hasProjectedInputs) {
                this.projectedInputs
                    .forEach(i => { i.inputDirective.valid = this.getInputState(i.isFocused); });
            }
        }
        this.setRequiredToInputs();
    }

    private getInputState(focused: boolean): IgxInputState {
        if (focused) {
            return this._ngControl.valid ? IgxInputState.VALID : IgxInputState.INVALID;
        } else {
            return this._ngControl.valid ? IgxInputState.INITIAL : IgxInputState.INVALID;
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

    private updateCalendar(): void {
        this.calendar.disabledDates = [];
        let minValue: Date = DatePickerUtil.parseDate(this.minValue);
        if (!minValue && this.hasProjectedInputs) {
            const start = this.projectedInputs.filter(i => i instanceof IgxDateRangeStartComponent)[0];
            if (start) {
                minValue = DatePickerUtil.parseDate(start.dateTimeEditor.minValue);
            }
        }
        if (minValue) {
            this.calendar.disabledDates.push({ type: DateRangeType.Before, dateRange: [minValue] });
        }

        let maxValue: Date = DatePickerUtil.parseDate(this.maxValue);
        if (!maxValue && this.hasProjectedInputs) {
            const end = this.projectedInputs.filter(i => i instanceof IgxDateRangeEndComponent)[0];
            if (end) {
                maxValue = DatePickerUtil.parseDate(end.dateTimeEditor.maxValue);
            }
        }
        if (maxValue) {
            this.calendar.disabledDates.push({ type: DateRangeType.After, dateRange: [maxValue] });
        }

        const range: Date[] = [];
        if (this.value) {
            if (this.value.start) {
                range.push(this.value.start);
            }
            if (this.value.end) {
                range.push(this.value.end);
            }
        }

        if (range.length > 0) {
            this.calendar.selectDate(range);
            this.calendar.viewDate = range[0];
        } else {
            this.calendar.deselectDate();
        }
    }

    private extractRange(selection: Date[]): DateRange {
        return {
            start: selection[0],
            end: selection.length > 0 ? selection[selection.length - 1] : null
        };
    }

    private attachOnKeydown(): void {
        fromEvent(this.element.nativeElement, 'keydown')
            .pipe(takeUntil(this.$destroy))
            .subscribe((evt: KeyboardEvent) => this.onKeyDown(evt));
    }

    private subscribeToDateEditorEvents(): void {
        if (this.hasProjectedInputs) {
            const start = this.projectedInputs.find(i => i instanceof IgxDateRangeStartComponent) as IgxDateRangeStartComponent;
            const end = this.projectedInputs.find(i => i instanceof IgxDateRangeEndComponent) as IgxDateRangeEndComponent;
            if (start && end) {
                start.dateTimeEditor.valueChange
                    .pipe(takeUntil(this.$destroy))
                    .subscribe(value => {
                        if (this.value) {
                            this.value = { start: value, end: this.value.end };
                        } else {
                            this.value = { start: value, end: null };
                        }
                        // TODO: should we check start and reset end value
                    });
                end.dateTimeEditor.valueChange
                    .pipe(takeUntil(this.$destroy))
                    .subscribe(value => {
                        if (this.value) {
                            this.value = { start: this.value.start, end: value };
                        } else {
                            this.value = { start: null, end: value };
                        }
                    });
            }
        }
    }

    private attachOnTouched(): void {
        if (this.hasProjectedInputs) {
            this.projectedInputs.forEach(i => {
                fromEvent(i.dateTimeEditor.nativeElement, 'blur')
                    .pipe(takeUntil(this.$destroy))
                    .subscribe(() => {
                        if (this.collapsed) {
                            this.updateValidityOnBlur();
                        }
                        if (this.value && !this.value.start) {
                            this.value = null;
                        }
                        // TODO: if we have start and have no end should we fill end
                        // as we do on calendar close
                    });
            });
        } else {
            fromEvent(this.inputDirective.nativeElement, 'blur')
                .pipe(takeUntil(this.$destroy))
                .subscribe(() => {
                    if (this.collapsed) {
                        this.updateValidityOnBlur();
                    }
                });
        }
    }

    private configPositionStrategy(): void {
        this._positionSettings = {
            openAnimation: fadeIn,
            closeAnimation: fadeOut,
            target: this.element.nativeElement
        };
        this._dropDownOverlaySettings.positionStrategy = new AutoPositionStrategy(this._positionSettings);
    }

    private configOverlaySettings(): void {
        if (this.overlaySettings !== null) {
            this._dropDownOverlaySettings = Object.assign({}, this._dropDownOverlaySettings, this.overlaySettings);
            this._dialogOverlaySettings = Object.assign({}, this._dialogOverlaySettings, this.overlaySettings);
        }
    }

    private initialSetValue() {
        // if there is no value, no ngControl but we have inputs we may have value set trough
        // inputs' ngModels - we should generate our initial control value
        if (!this.value && this.hasProjectedInputs && !this._ngControl) {
            const start = this.projectedInputs.find(i => i instanceof IgxDateRangeStartComponent).dateTimeEditor.value;
            const end = this.projectedInputs.find(i => i instanceof IgxDateRangeEndComponent).dateTimeEditor.value;
            this.updateValue({ start, end });

        }
    }

    private updateInputs(): void {
        const start = this.projectedInputs?.find(i => i instanceof IgxDateRangeStartComponent) as IgxDateRangeStartComponent;
        const end = this.projectedInputs?.find(i => i instanceof IgxDateRangeEndComponent) as IgxDateRangeEndComponent;
        if (start && end && this.value) {
            start.updateInputValue(this.value.start);
            end.updateInputValue(this.value.end);
        }
    }

    private updateDisplayFormat(): void {
        this.projectedInputs.forEach(i => {
            const input = i as IgxDateRangeInputsBaseComponent;
            if (!input.dateTimeEditor.displayFormat) {
                input.dateTimeEditor.displayFormat = this.displayFormat;
            }
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
}
