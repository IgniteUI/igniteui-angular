import {
    Component, ContentChild, EventEmitter, HostBinding, Input,
    OnDestroy, Output, ViewChild, ElementRef, Inject, HostListener,
    NgModuleRef, OnInit, AfterViewInit, Injector, AfterViewChecked, ContentChildren,
    QueryList, LOCALE_ID, Renderer2, Optional, PipeTransform
} from '@angular/core';
import {
    ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl, AbstractControl,
    NG_VALIDATORS, ValidationErrors, Validator
} from '@angular/forms';
import {
    IgxCalendarComponent, IgxCalendarHeaderTemplateDirective, IgxCalendarSubheaderTemplateDirective,
    WEEKDAYS, isDateInRanges, IFormattingViews, IFormattingOptions
} from '../calendar/public_api';
import {
    IgxInputDirective, IgxInputGroupComponent,
    IgxLabelDirective, IGX_INPUT_GROUP_TYPE, IgxInputGroupType, IgxInputState
} from '../input-group/public_api';
import { Subject, fromEvent, Subscription, noop, MonoTypeOperatorFunction } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { IgxOverlayOutletDirective } from '../directives/toggle/toggle.directive';
import {
    OverlaySettings, IgxOverlayService, AbsoluteScrollStrategy,
    AutoPositionStrategy,
    OverlayCancelableEventArgs,
    OverlayEventArgs
} from '../services/public_api';
import { DateRangeDescriptor, DateRangeType } from '../core/dates/dateRange';
import { isEqual, IBaseCancelableBrowserEventArgs, IBaseEventArgs, PlatformUtil } from '../core/utils';
import { IgxCalendarContainerComponent } from '../date-common/calendar-container/calendar-container.component';
import { fadeIn, fadeOut } from '../animations/fade';
import { PickerBaseDirective } from '../date-common/picker-base.directive';
import { DisplayDensityToken, IDisplayDensityOptions } from '../core/density';
import { DatePart, DatePartDeltas, IgxDateTimeEditorDirective } from '../directives/date-time-editor/public_api';
import { DeprecateProperty } from '../core/deprecateDecorators';
import { DateTimeUtil } from '../date-common/util/date-time.util';
import { PickerHeaderOrientation as PickerHeaderOrientation } from '../date-common/types';
import {
    IDatePickerDisabledDateEventArgs, IDatePickerValidationFailedEventArgs
} from './date-picker.common';
import { IgxPickerToggleComponent, IgxPickerClearComponent, IgxPickerActionsDirective } from '../date-common/public_api';

let NEXT_ID = 0;

/**
 * Date Picker displays a popup calendar that lets users select a single date.
 *
 * @igxModule IgxDatePickerModule
 * @igxTheme igx-calendar-theme, igx-icon-theme
 * @igxGroup Scheduling
 * @igxKeywords datepicker, calendar, schedule, date
 * @example
 * ```html
 * <igx-date-picker [(ngModel)]="selectedDate"></igx-date-picker>
 * ```
 */
@Component({
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: IgxDatePickerComponent, multi: true },
        { provide: NG_VALIDATORS, useExisting: IgxDatePickerComponent, multi: true }
    ],
    selector: 'igx-date-picker',
    templateUrl: 'date-picker.component.html',
    styles: [':host { display: block; }']
})
export class IgxDatePickerComponent extends PickerBaseDirective implements ControlValueAccessor, Validator,
    OnInit, AfterViewInit, OnDestroy, AfterViewChecked {
    /**
     * Gets/Sets on which day the week starts.
     *
     * @example
     * ```html
     * <igx-date-picker [weekStart]="4" cancelButtonLabel="cancel" todayButtonLabel="today"></igx-date-picker>
     * ```
     */
    @Input()
    public weekStart: WEEKDAYS | number = WEEKDAYS.SUNDAY;

    /**
     * Gets/Sets whether the inactive dates will be hidden.
     *
     * @remarks
     * Applies to dates that are out of the current month.
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
     *
     * @example
     * ```html
     * <igx-date-picker [displayMonthsCount]="2"></igx-date-picker>
     * ```
     * @example
     * ```typescript
     * let monthViewsDisplayed = this.datePicker.displayMonthsCount;
     * ```
     */
    @Input()
    public displayMonthsCount = 1;

    /**
     * Show/hide week numbers
     *
     * @example
     * ```html
     * <igx-date-picker [showWeekNumbers]="true"></igx-date-picker>
     * ``
     */
    @Input()
    public showWeekNumbers: boolean;

    /**
     * Gets/Sets a custom formatter function on the selected or passed date.
     *
     * @example
     * ```html
     * <igx-date-picker [value]="date" [formatter]="formatter"></igx-date-picker>
     * ```
     */
    @DeprecateProperty('formatter has been deprecated, use displayFormat instead.')
    @Input()
    public formatter: (val: Date) => string;

    /**
     * Gets/Sets the orientation of the `IgxDatePickerComponent` header.
     *
     *  @example
     * ```html
     * <igx-date-picker headerOrientation="vertical"></igx-date-picker>
     * ```
     */
    @Input()
    public headerOrientation: PickerHeaderOrientation = PickerHeaderOrientation.Horizontal;

    /**
     * Gets/Sets the today button's label.
     *
     *  @example
     * ```html
     * <igx-date-picker todayButtonLabel="Today"></igx-date-picker>
     * ```
     */
    @Input()
    public todayButtonLabel: string;

    /**
     * Gets/Sets the cancel button's label.
     *
     * @example
     * ```html
     * <igx-date-picker cancelButtonLabel="Cancel"></igx-date-picker>
     * ```
     */
    @Input()
    public cancelButtonLabel: string;

    /**
     * Specify if the currently spun date segment should loop over.
     *
     *  @example
     * ```html
     * <igx-date-picker [spinLoop]="false"></igx-date-picker>
     * ```
     */
    @Input()
    public spinLoop = true;

    /**
     * Delta values used to increment or decrement each editor date part on spin actions.
     * All values default to `1`.
     *
     * @example
     * ```html
     * <igx-date-picker [spinDelta]="{ date: 5, month: 2 }"></igx-date-picker>
     * ```
     */
    @Input()
    public spinDelta: Pick<DatePartDeltas, 'date' | 'month' | 'year'>;

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
     * Gets/Sets the value of `id` attribute.
     *
     * @remarks If not provided it will be automatically generated.
     * @example
     * ```html
     * <igx-date-picker [id]="'igx-date-picker-3'" cancelButtonLabel="cancel" todayButtonLabel="today"></igx-date-picker>
     * ```
     */
    @Input()
    @HostBinding('attr.id')
    public id = `igx-date-picker-${NEXT_ID++}`;

    //#region calendar members

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
    public get formatViews(): IFormattingViews {
        return this._formatViews;
    }

    public set formatViews(formatViews: IFormattingViews) {
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
     * Gets the format options of the `IgxDatePickerComponent`.
     *
     * @example
     * ```typescript
     * let formatOptions = this.datePicker.formatOptions;
     * ```
     */
    @Input()
    public get calendarFormat(): IFormattingOptions {
        return this._calendarFormat;
    }

    /**
     * Sets the format options of the `IgxDatePickerComponent`.
     *
     * @example
     * ```typescript
     * this.datePicker.formatOptions = {day: "numeric",  month: "long", weekday: "long", year: "numeric"};
     * ```
     */
    public set calendarFormat(options: IFormattingOptions) {
        this._calendarFormat = Object.assign(this._calendarFormat, options);
    }

    //#endregion

    /**
     * Gets/Sets the selected date.
     *
     *  @example
     * ```html
     * <igx-date-picker [value]="date"></igx-date-picker>
     * ```
     */
    @Input()
    public get value(): Date | string {
        return this._value;
    }
    public set value(date: Date | string) {
        const oldValue = this.dateValue;
        this._value = date;
        this.setDateValue(date);
        if (this.dateTimeEditor.value !== date) {
            this.dateTimeEditor.value = date;
        }
        this.emitValueChange(oldValue, this.dateValue);
        this._onChangeCallback(this.dateValue);
    }

    /**
     * The minimum value the picker will accept.
     *
     * @example
     * <igx-date-picker [minValue]="minDate"></igx-date-picker>
     */
    @Input()
    public set minValue(value: Date | string) {
        this._minValue = value;
        this._onValidatorChange();
    }

    public get minValue(): Date | string {
        return this._minValue;
    }

    /**
     * The maximum value the picker will accept.
     *
     * @example
     * <igx-date-picker [maxValue]="maxDate"></igx-date-picker>
     */
    @Input()
    public set maxValue(value: Date | string) {
        this._maxValue = value;
        this._onValidatorChange();
    }

    public get maxValue(): Date | string {
        return this._maxValue;
    }

    /**
     * Emitted when the picker's value changes.
     *
     * @remarks
     * Used for `two-way` bindings.
     *
     * @example
     * ```html
     * <igx-date-picker [(value)]="date"></igx-date-picker>
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
    // eslint-disable-next-line @angular-eslint/no-output-on-prefix
    @Output()
    @DeprecateProperty('onDisabledDate has been deprecated.')
    public onDisabledDate = new EventEmitter<IDatePickerDisabledDateEventArgs>(); // TODO: remove event args as well

    /**
     * Emitted when the user types/spins invalid date in the date-picker editor.
     *
     *  @example
     * ```html
     * <igx-date-picker (validationFailed)="onValidationFailed($event)"></igx-date-picker>
     * ```
     */
    @Output()
    public validationFailed = new EventEmitter<IDatePickerValidationFailedEventArgs>();

    /** @hidden @internal */
    @ContentChildren(IgxPickerToggleComponent, { descendants: true })
    public toggleComponents: QueryList<IgxPickerToggleComponent>;

    /** @hidden @internal */
    @ContentChildren(IgxPickerClearComponent)
    public clearComponents: QueryList<IgxPickerClearComponent>;

    /** @hidden @internal */
    @ContentChild(IgxLabelDirective)
    public label: IgxLabelDirective;

    @ContentChild(IgxCalendarHeaderTemplateDirective)
    private headerTemplate: IgxCalendarHeaderTemplateDirective;

    @ViewChild(IgxDateTimeEditorDirective, { static: true })
    private dateTimeEditor: IgxDateTimeEditorDirective;

    @ViewChild(IgxInputGroupComponent)
    private inputGroup: IgxInputGroupComponent;

    @ViewChild(IgxLabelDirective)
    private labelDirective: IgxLabelDirective;

    @ViewChild(IgxInputDirective)
    private inputDirective: IgxInputDirective;

    @ContentChild(IgxCalendarSubheaderTemplateDirective)
    private subheaderTemplate: IgxCalendarSubheaderTemplateDirective;

    @ContentChild(IgxPickerActionsDirective)
    private pickerActions: IgxPickerActionsDirective;

    private get dialogOverlaySettings(): OverlaySettings {
        return Object.assign({}, this._dialogOverlaySettings, this.overlaySettings);
    }

    private get dropDownOverlaySettings(): OverlaySettings {
        return Object.assign({}, this._dropDownOverlaySettings, this.overlaySettings);
    }

    private get inputGroupElement(): HTMLElement {
        return this.inputGroup?.element.nativeElement;
    }

    private get dateValue(): Date {
        return this._dateValue;
    }

    /** @hidden @internal */
    public displayValue: PipeTransform = { transform: (date: Date) => this.formatter(date) };

    private _dateValue: Date;
    private _overlayId: string;
    private _value: Date | string;
    private _targetViewDate: Date;
    private _destroy$ = new Subject();
    private _ngControl: NgControl = null;
    private _statusChanges$: Subscription;
    private _calendar: IgxCalendarComponent;
    private _specialDates: DateRangeDescriptor[] = null;
    private _disabledDates: DateRangeDescriptor[] = null;
    private _overlaySubFilter:
        [MonoTypeOperatorFunction<OverlayEventArgs>,
            MonoTypeOperatorFunction<OverlayEventArgs | OverlayCancelableEventArgs>] = [
            filter(x => x.id === this._overlayId),
            takeUntil(this._destroy$)
        ];
    private _dropDownOverlaySettings: OverlaySettings = {
        target: this.inputGroupElement,
        closeOnOutsideClick: true,
        modal: false,
        scrollStrategy: new AbsoluteScrollStrategy(),
        positionStrategy: new AutoPositionStrategy({
            openAnimation: fadeIn,
            closeAnimation: fadeOut
        })
    };
    private _dialogOverlaySettings: OverlaySettings = {
        closeOnOutsideClick: true,
        modal: true,
        closeOnEscape: true
    };
    private _calendarFormat: IFormattingOptions = {
        day: 'numeric',
        month: 'short',
        weekday: 'short',
        year: 'numeric'
    };
    private _formatViews: IFormattingViews = {
        day: false,
        month: true,
        year: false
    };
    private _onChangeCallback: (_: Date) => void = noop;
    private _onTouchedCallback: () => void = noop;
    private _onValidatorChange: () => void = noop;

    constructor(public element: ElementRef,
        @Inject(LOCALE_ID) protected _localeId: string,
        @Inject(IgxOverlayService) private _overlayService: IgxOverlayService,
        private _moduleRef: NgModuleRef<any>,
        private _injector: Injector,
        private _renderer: Renderer2,
        private platform: PlatformUtil,
        @Optional() @Inject(DisplayDensityToken) protected _displayDensityOptions?: IDisplayDensityOptions,
        @Optional() @Inject(IGX_INPUT_GROUP_TYPE) protected _inputGroupType?: IgxInputGroupType) {
        super(element, _localeId, _displayDensityOptions, _inputGroupType);
    }

    /** @hidden @internal */
    public get required(): boolean {
        if (this._ngControl && this._ngControl.control && this._ngControl.control.validator) {
            // Run the validation with empty object to check if required is enabled.
            const error = this._ngControl.control.validator({} as AbstractControl);
            return error && error.required;
        }

        return false;
    }

    /** @hidden @internal */
    @HostListener('keydown.spacebar', ['$event'])
    @HostListener('keydown.space', ['$event'])
    public onSpaceClick(event: KeyboardEvent) {
        event.preventDefault();
        this.open();
    }

    /** @hidden @internal */
    @HostListener('keydown', ['$event'])
    public onKeyDown(event: KeyboardEvent) {
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
     * Opens the picker's dropdown or dialog.
     *
     * @example
     * ```html
     * <igx-date-picker #picker></igx-date-picker>
     *
     * <button (click)="picker.open()">Open Dialog</button>
     * ```
     */
    public open(settings?: OverlaySettings): void {
        if (!this.collapsed || this.disabled) {
            return;
        }

        const overlaySettings = Object.assign({}, this.isDropdown
            ? this.dropDownOverlaySettings
            : this.dialogOverlaySettings
            , settings);

        if (this.isDropdown && this.inputGroupElement) {
            overlaySettings.target = this.inputGroupElement;
        }
        if (this.outlet) {
            overlaySettings.outlet = this.outlet;
        }

        this._overlayId = this._overlayService
            .attach(IgxCalendarContainerComponent, overlaySettings, this._moduleRef);
        this._overlayService.show(this._overlayId);
    }

    /**
     * Toggles the picker's dropdown or dialog
     *
     * @example
     * ```html
     * <igx-date-picker #picker></igx-date-picker>
     *
     * <button (click)="picker.toggle()">Toggle Dialog</button>
     * ```
     */
    public toggle(settings?: OverlaySettings): void {
        if (this.collapsed) {
            this.open(settings);
        } else {
            this.close();
        }
    }

    /**
     * Closes the picker's dropdown or dialog.
     *
     * @example
     * ```html
     * <igx-date-picker #picker></igx-date-picker>
     *
     * <button (click)="picker.close()">Close Dialog</button>
     * ```
     */
    public close(): void {
        if (!this.collapsed) {
            this._overlayService.hide(this._overlayId);
        }
    }

    /**
     * Selects a date.
     *
     * @remarks Updates the value in the input field.
     *
     * @example
     * ```typescript
     * this.datePicker.select(date);
     * ```
     * @param date passed date that has to be set to the calendar.
     */
    public select(value: Date): void {
        const oldValue = this.dateValue;
        this.value = value;
        if (DateTimeUtil.validateMinMax(value, this.minValue, this.maxValue, false)) {
            this.validationFailed.emit({
                owner: this,
                prevValue: oldValue
            });
        }
    }

    /**
     * Selects today's date and closes the picker.
     *
     * @example
     * ```html
     * <igx-date-picker #picker></igx-date-picker>
     *
     * <button (click)="picker.selectToday()">Select Today</button>
     * ```
     * */
    public selectToday(): void {
        const today = new Date();
        today.setHours(0);
        today.setMinutes(0);
        today.setSeconds(0);
        today.setMilliseconds(0);
        this.select(today);
        this.close();
    }

    /**
     * Clears the input field and the picker's value.
     *
     * @example
     * ```typescript
     * this.datePicker.clear();
     * ```
     */
    public clear(): void {
        if (!this.disabled) {
            this._calendar?.deselectDate();
            this.dateTimeEditor.clear();
        }
    }

    /**
     * Increment a specified `DatePart`.
     *
     * @param datePart The optional DatePart to increment. Defaults to Date.
     * @param delta The optional delta to increment by. Overrides `spinDelta`.
     * @example
     * ```typescript
     * this.datePicker.increment(DatePart.Date);
     * ```
     */
    public increment(datePart?: DatePart, delta?: number): void {
        this.dateTimeEditor.increment(datePart, delta);
    }

    /**
     * Decrement a specified `DatePart`
     *
     * @param datePart The optional DatePart to decrement. Defaults to Date.
     * @param delta The optional delta to decrement by. Overrides `spinDelta`.
     * @example
     * ```typescript
     * this.datePicker.decrement(DatePart.Date);
     * ```
     */
    public decrement(datePart?: DatePart, delta?: number): void {
        this.dateTimeEditor.decrement(datePart, delta);
    }

    //#region Control Value Accessor
    /** @hidden @internal */
    public writeValue(value: Date | string) {
        this._value = value;
        this.setDateValue(value);
        if (this.dateTimeEditor.value !== value) {
            this.dateTimeEditor.value = this.value;
        }
    }

    /** @hidden @internal */
    public registerOnChange(fn: any) {
        this._onChangeCallback = fn;
    }

    /** @hidden @internal */
    public registerOnTouched(fn: any) {
        this._onTouchedCallback = fn;
    }

    /** @hidden @internal */
    public setDisabledState?(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }
    //#endregion

    //#region Validator
    /** @hidden @internal */
    public registerOnValidatorChange(fn: any) {
        this._onValidatorChange = fn;
    }

    /** @hidden @internal */
    public validate(control: AbstractControl): ValidationErrors | null {
        const value = control.value;
        const errors = {};
        if (!value) {
            Object.assign(errors, { value: true });
        }
        if (value && this.disabledDates && isDateInRanges(value, this.disabledDates)) {
            Object.assign(errors, { dateIsDisabled: true });
        }
        Object.assign(errors, DateTimeUtil.validateMinMax(value, this.minValue, this.maxValue, false));

        return Object.keys(errors).length > 0 ? errors : null;
    }
    //#endregion

    /** @hidden @internal */
    public ngOnInit(): void {
        this._ngControl = this._injector.get<NgControl>(NgControl, null);
    }

    /** @hidden @internal */
    public ngAfterViewInit() {
        this.subscribeToClick();
        this.subscribeToOverlayEvents();
        this.subscribeToDateEditorEvents();

        fromEvent(this.inputDirective.nativeElement, 'blur')
            .pipe(takeUntil(this._destroy$))
            .subscribe(() => {
                if (this.collapsed) {
                    this._onTouchedCallback();
                    this.updateValidity();
                }
            });

        if (this._ngControl) {
            this._statusChanges$ =
                this._ngControl.statusChanges.subscribe(this.onStatusChanged.bind(this));
        }
    }

    /** @hidden @internal */
    public ngAfterViewChecked() {
        if (this.labelDirective) {
            this._renderer.setAttribute(this.inputDirective.nativeElement, 'aria-labelledby', this.labelDirective.id);
        }
    }

    /** @hidden @internal */
    public ngOnDestroy(): void {
        if (this._overlayId) {
            this._overlayService.hide(this._overlayId);
        }
        if (this._statusChanges$) {
            this._statusChanges$.unsubscribe();
        }
        this._destroy$.next();
        this._destroy$.complete();
        this._overlayService.detach(this._overlayId);
    }

    /** @hidden @internal */
    public getEditElement(): HTMLInputElement {
        return this.inputDirective.nativeElement;
    }

    /** @hidden @internal */
    public subscribeToClick() {
        fromEvent(this.getEditElement(), 'click')
            .pipe(takeUntil(this._destroy$))
            .subscribe(() => {
                if (!this.isDropdown) {
                    this.open();
                }
            });
    }

    private setDateValue(value: Date | string) {
        this._dateValue = DateTimeUtil.isValidDate(value) ? value : DateTimeUtil.parseIsoDate(value);
    }

    private updateValidity() {
        if (this._ngControl) {
            if (this.inputGroup.isFocused) {
                this.inputDirective.valid = this._ngControl.valid
                    ? IgxInputState.VALID
                    : IgxInputState.INVALID;
            } else {
                this.inputDirective.valid = this._ngControl.valid
                    ? IgxInputState.INITIAL
                    : IgxInputState.INVALID;
            }
        }
    }

    private onStatusChanged = () => {
        if ((this._ngControl.control.touched || this._ngControl.control.dirty) &&
            (this._ngControl.control.validator || this._ngControl.control.asyncValidator)) {
            this.updateValidity();
        }
        this.inputGroup.isRequired = this.required;
    };

    private handleSelection(date: Date): void {
        if (this.dateValue) {
            date.setHours(this.dateValue.getHours());
            date.setMinutes(this.dateValue.getMinutes());
            date.setSeconds(this.dateValue.getSeconds());
            date.setMilliseconds(this.dateValue.getMilliseconds());
        }
        this.value = date;
        this._calendar.viewDate = date;
        this.close();
    }

    private subscribeToDateEditorEvents(): void {
        this.dateTimeEditor.valueChange.pipe(
            takeUntil(this._destroy$)).subscribe(newDate => {
                this.value = newDate;
                const dateValue = DateTimeUtil.isValidDate(newDate) ? newDate : DateTimeUtil.parseIsoDate(newDate);
                if (newDate && this.disabledDates && !isDateInRanges(dateValue, this.disabledDates)) {
                    this.onDisabledDate.emit({ currentValue: this.dateValue, datePicker: this });
                }
            });
        this.dateTimeEditor.validationFailed.pipe(
            takeUntil(this._destroy$)).subscribe((event) => {
                this.validationFailed.emit({
                    owner: this,
                    prevValue: event.oldValue
                });
            });
    }

    private subscribeToOverlayEvents() {
        this._overlayService.onOpening.pipe(...this._overlaySubFilter).subscribe((eventArgs) => {
            const args = eventArgs as IBaseCancelableBrowserEventArgs;
            this.opening.emit(args);
            if (args.cancel) {
                this._overlayService.detach(this._overlayId);
                return;
            }

            this._initializeCalendarContainer(eventArgs.componentRef.instance);
            this._collapsed = false;
        });

        this._overlayService.onOpened.pipe(...this._overlaySubFilter).subscribe((eventArgs) => {
            this.opened.emit(eventArgs as IBaseEventArgs);
            if (this._calendar?.daysView?.selectedDates) {
                this._calendar?.daysView?.focusActiveDate();
                return;
            }
            if (this._targetViewDate) {
                this._targetViewDate.setHours(0, 0, 0, 0);
                this._calendar?.daysView?.dates
                    .find(d => d.date.date.getTime() === this._targetViewDate.getTime())?.nativeElement.focus();
            }
        });

        this._overlayService.onClosing.pipe(...this._overlaySubFilter).subscribe((eventArgs) => {
            const args = eventArgs as IBaseCancelableBrowserEventArgs;
            this.closing.emit(args);
            if (args.cancel) {
                return;
            }
            // do not focus the input if clicking outside in dropdown mode
            if (this.getEditElement() && !(args.event && this.isDropdown)) {
                this.inputDirective.focus();
            }
        });

        this._overlayService.onClosed.pipe(...this._overlaySubFilter).subscribe((event) => {
            this.closed.emit(event as IBaseEventArgs);
            this._overlayService.detach(this._overlayId);
            this._collapsed = true;
            this._overlayId = null;
        });
    }

    private emitValueChange(oldValue: Date, newValue: Date) {
        if (!isEqual(oldValue, newValue)) {
            this.valueChange.emit(newValue);
        }
    }

    private getMinMaxDates() {
        const minValue = DateTimeUtil.isValidDate(this.minValue) ? this.minValue : DateTimeUtil.parseIsoDate(this.minValue);
        const maxValue = DateTimeUtil.isValidDate(this.maxValue) ? this.maxValue : DateTimeUtil.parseIsoDate(this.maxValue);
        return { minValue, maxValue };
    }

    private setDisabledDates(): void {
        this._calendar.disabledDates = this.disabledDates ? [...this.disabledDates] : [];
        const { minValue, maxValue } = this.getMinMaxDates();
        if (minValue) {
            this._calendar.disabledDates.push({ type: DateRangeType.Before, dateRange: [minValue] });
        }
        if (maxValue) {
            this._calendar.disabledDates.push({ type: DateRangeType.After, dateRange: [maxValue] });
        }
    }

    private _initializeCalendarContainer(componentInstance: IgxCalendarContainerComponent) {
        this._calendar = componentInstance.calendar;
        const isVertical = this.headerOrientation === PickerHeaderOrientation.Vertical;
        this._calendar.hasHeader = !this.isDropdown;
        this._calendar.formatOptions = this.calendarFormat;
        this._calendar.formatViews = this.formatViews;
        this._calendar.locale = this.locale;
        this._calendar.vertical = isVertical;
        this._calendar.weekStart = this.weekStart;
        this._calendar.specialDates = this.specialDates;
        this._calendar.headerTemplate = this.headerTemplate;
        this._calendar.subheaderTemplate = this.subheaderTemplate;
        this._calendar.hideOutsideDays = this.hideOutsideDays;
        this._calendar.monthsViewNumber = this.displayMonthsCount;
        this._calendar.showWeekNumbers = this.showWeekNumbers;
        this._calendar.selected.pipe(takeUntil(this._destroy$)).subscribe((ev: Date) => this.handleSelection(ev));
        this.setDisabledDates();

        if (DateTimeUtil.isValidDate(this.dateValue)) {
            // calendar will throw if the picker's value is InvalidDate #9208
            this._calendar.value = this.dateValue;
        }
        this.setCalendarViewDate();

        componentInstance.mode = this.mode;
        componentInstance.vertical = isVertical;
        componentInstance.closeButtonLabel = this.cancelButtonLabel;
        componentInstance.todayButtonLabel = this.todayButtonLabel;
        componentInstance.pickerActions = this.pickerActions;

        componentInstance.calendarClose.pipe(takeUntil(this._destroy$)).subscribe(() => this.close());
        componentInstance.todaySelection.pipe(takeUntil(this._destroy$)).subscribe(() => this.selectToday());
    }

    private setCalendarViewDate() {
        const { minValue, maxValue } = this.getMinMaxDates();
        if (minValue && DateTimeUtil.lessThanMinValue(this.dateValue, minValue)) {
            this._calendar.viewDate = this._targetViewDate = minValue;
            return;
        }
        if (maxValue && DateTimeUtil.greaterThanMaxValue(this.dateValue, maxValue)) {
            this._calendar.viewDate = this._targetViewDate = maxValue;
            return;
        }
        this._calendar.viewDate = this.dateValue;
    }
}
