import {
    CommonModule
} from '@angular/common';
import {
    Component,
    ElementRef,
    EventEmitter,
    HostBinding,
    Input,
    NgModule,
    OnDestroy,
    OnInit,
    Output,
    ViewChild,
    ContentChild,
    Inject,
    Injectable,
    AfterViewInit,
    Injector,
    PipeTransform,
    LOCALE_ID, Optional, ContentChildren, QueryList, OnChanges, SimpleChanges, HostListener
} from '@angular/core';
import {
    ControlValueAccessor,
    NG_VALUE_ACCESSOR,
    NgControl,
    AbstractControl,
    ValidationErrors,
    Validator,
    NG_VALIDATORS
} from '@angular/forms';
import { HAMMER_GESTURE_CONFIG, HammerGestureConfig } from '@angular/platform-browser';
import { IgxIconModule } from '../icon/public_api';
import { IgxInputGroupModule, IgxInputGroupComponent } from '../input-group/input-group.component';
import { IgxInputDirective, IgxInputState } from '../directives/input/input.directive';
import { IgxInputGroupType, IGX_INPUT_GROUP_TYPE } from '../input-group/public_api';
import { DisplayDensityToken, IDisplayDensityOptions } from '../core/density';
import {
    IgxItemListDirective,
    IgxTimeItemDirective,
    IgxTimePickerTemplateDirective,
    IgxTimePickerActionsDirective
} from './time-picker.directives';
import { Subject, fromEvent, Subscription, noop } from 'rxjs';
import { IgxTimePickerBase, IGX_TIME_PICKER_COMPONENT } from './time-picker.common';
import { AbsoluteScrollStrategy } from '../services/overlay/scroll';
import { AutoPositionStrategy } from '../services/overlay/position';
import { OverlaySettings } from '../services/overlay/utilities';
import { takeUntil } from 'rxjs/operators';
import { IgxButtonModule } from '../directives/button/button.directive';
import { IgxMaskModule } from '../directives/mask/mask.directive';
import { IgxDateTimeEditorModule, IgxDateTimeEditorDirective } from '../directives/date-time-editor/date-time-editor.directive';
import { IgxToggleModule, IgxToggleDirective } from '../directives/toggle/toggle.directive';
import { ITimePickerResourceStrings } from '../core/i18n/time-picker-resources';
import { CurrentResourceStrings } from '../core/i18n/resources';
import { IBaseEventArgs, isEqual, isDate, PlatformUtil } from '../core/utils';
import { PickerInteractionMode } from '../date-common/types';
import { IgxTextSelectionModule } from '../directives/text-selection/text-selection.directive';
import { IgxLabelDirective } from '../directives/label/label.directive';
import { PickerBaseDirective } from '../date-common/picker-base.directive';
import { DateTimeUtil } from '../date-common/util/date-time.util';
import { DatePart } from '../directives/date-time-editor/public_api';
import { PickerHeaderOrientation } from '../date-common/types';
import { IgxPickersCommonModule, IgxPickerToggleComponent } from '../date-common/picker-icons.common';
import { TimeFormatPipe } from './time-picker.pipes';

let NEXT_ID = 0;
const ITEMS_COUNT = 7;

@Injectable()
export class TimePickerHammerConfig extends HammerGestureConfig {
    public overrides = {
        pan: { direction: Hammer.DIRECTION_VERTICAL, threshold: 1 }
    };
}

export interface IgxTimePickerValidationFailedEventArgs extends IBaseEventArgs {
    previousValue: Date | string;
}

@Component({
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: IgxTimePickerComponent,
            multi: true
        },
        {
            provide: HAMMER_GESTURE_CONFIG,
            useClass: TimePickerHammerConfig
        },
        {
            provide: IGX_TIME_PICKER_COMPONENT,
            useExisting: IgxTimePickerComponent
        },
        {
            provide: NG_VALIDATORS,
            useExisting: IgxTimePickerComponent,
            multi: true
        }
    ],
    selector: 'igx-time-picker',
    templateUrl: 'time-picker.component.html',
    styles: [
        `:host {
            display: block;
        }`
    ]
})
export class IgxTimePickerComponent extends PickerBaseDirective
    implements
    IgxTimePickerBase,
    ControlValueAccessor,
    OnInit,
    OnChanges,
    OnDestroy,
    AfterViewInit,
    Validator {
    /**
     * An @Input property that sets the value of the `id` attribute.
     * ```html
     * <igx-time-picker [id]="'igx-time-picker-5'" [displayFormat]="h:mm tt" ></igx-time-picker>
     * ```
     */
    @HostBinding('attr.id')
    @Input()
    public id = `igx-time-picker-${NEXT_ID++}`;

    /**
     * The format used when editable input is not focused. Defaults to the `inputFormat` if not set.
     *
     * @remarks
     * Uses Angular's `DatePipe`.
     *
     * @example
     * ```html
     * <igx-time-picker displayFormat="mm:ss"></igx-time-picker>
     * ```
     *
     */
    @Input()
    public displayFormat: string;

    /**
     * The expected user input format and placeholder.
     *
     * @remarks
     * Default is `hh:mm tt`
     *
     * @example
     * ```html
     * <igx-time-picker inputFormat="HH:mm"></igx-time-picker>
     * ```
     */
    @Input()
    public inputFormat: string = DateTimeUtil.DEFAULT_TIME_INPUT_FORMAT;

    /**
     * Gets/Sets the interaction mode - dialog or drop down.
     *
     * @example
     * ```html
     * <igx-time-picker mode="dialog"></igx-time-picker>
     * ```
     */
    @Input()
    public mode: PickerInteractionMode = PickerInteractionMode.DropDown;

    /**
     * The minimum value the picker will accept.
     *
     * @remarks
     * If a `string` value is passed in, it must be in ISO format.
     *
     * @example
     * ```html
     * <igx-time-picker [minValue]="18:00:00"></igx-time-picker>
     * ```
     */
    @Input()
    public set minValue(value: Date | string) {
        this._minValue = value;
        const date = this.parseToDate(value);
        if (date) {
            this._dateMinValue = new Date();
            this._dateMinValue.setHours(date.getHours(), date.getMinutes(), date.getSeconds());
        }
        this._onValidatorChange();
    }

    public get minValue(): Date | string {
        return this._minValue;
    }

    /**
     * The maximum value the picker will accept.
     *
     * @remarks
     * If a `string` value is passed in, it must be in ISO format.
     *
     * @example
     * ```html
     * <igx-time-picker [maxValue]="20:30:00"></igx-time-picker>
     * ```
     */
    @Input()
    public set maxValue(value: Date | string) {
        this._maxValue = value;
        const date = this.parseToDate(value);
        if (date) {
            this._dateMaxValue = new Date();
            this._dateMaxValue.setHours(date.getHours(), date.getMinutes(), date.getSeconds());
        }
        this._onValidatorChange();
    }

    public get maxValue(): Date | string {
        return this._maxValue;
    }

    /**
     * An @Input property that determines the spin behavior. By default `spinLoop` is set to true.
     * The seconds, minutes and hour spinning will wrap around by default.
     * ```html
     * <igx-time-picker [spinLoop]="false"></igx-time-picker>
     * ```
     */
    @Input()
    public spinLoop = true;

    /**
     * Gets/Sets a custom formatter function on the selected or passed date.
     *
     * @example
     * ```html
     * <igx-time-picker [value]="date" [formatter]="formatter"></igx-time-picker>
     * ```
     */
    @Input()
    public formatter: (val: Date) => string;

    /**
     * Sets the orientation of the picker's header.
     *
     * @remarks
     * Available in dialog mode only. Default value is `horizontal`.
     *
     * ```html
     * <igx-time-picker [headerOrientation]="'vertical'"></igx-time-picker>
     * ```
     */
    @Input()
    public headerOrientation: PickerHeaderOrientation = PickerHeaderOrientation.Horizontal;

    /** @hidden @internal */
    @Input()
    public readOnly = false;

    /**
     * Emitted after a selection has been done.
     *
     * @example
     * ```html
     * <igx-time-picker (selected)="onSelection($event)"></igx-time-picker>
     * ```
     */
    @Output()
    public selected = new EventEmitter<Date>();

    /**
     * Emitted when the picker's value changes.
     *
     * @remarks
     * Used for `two-way` bindings.
     *
     * @example
     * ```html
     * <igx-time-picker [(value)]="date"></igx-time-picker>
     * ```
     */
    @Output()
    public valueChange = new EventEmitter<Date | string>();

    /**
     * Emitted when the user types/spins invalid time in the time-picker editor.
     *
     *  @example
     * ```html
     * <igx-time-picker (validationFailed)="onValidationFailed($event)"></igx-time-picker>
     * ```
     */
    @Output()
    public validationFailed = new EventEmitter<IgxTimePickerValidationFailedEventArgs>();

    /** @hidden */
    @ViewChild('hourList')
    public hourList: ElementRef;

    /** @hidden */
    @ViewChild('minuteList')
    public minuteList: ElementRef;

    /** @hidden */
    @ViewChild('secondsList')
    public secondsList: ElementRef;

    /** @hidden */
    @ViewChild('ampmList')
    public ampmList: ElementRef;

    /** @hidden @internal */
    @ContentChild(IgxLabelDirective)
    public label: IgxLabelDirective;

    /** @hidden @internal */
    @ContentChild(IgxTimePickerActionsDirective)
    public timePickerActionsDirective: IgxTimePickerActionsDirective;

    /** @hidden @internal */
    @ContentChildren(IgxPickerToggleComponent, { descendants: true })
    public toggleComponents: QueryList<IgxPickerToggleComponent>;

    @ViewChild(IgxInputDirective, { read: IgxInputDirective })
    private inputDirective: IgxInputDirective;

    @ViewChild(IgxInputGroupComponent)
    private _inputGroup: IgxInputGroupComponent;

    @ViewChild(IgxDateTimeEditorDirective, { static: true })
    private dateTimeEditor: IgxDateTimeEditorDirective;

    @ViewChild(IgxToggleDirective)
    private toggleRef: IgxToggleDirective;

    /** @hidden */
    public cleared = false;

    /** @hidden */
    public isNotEmpty = false;

    /** @hidden */
    public currentHour: number;

    /** @hidden */
    public currentMinutes: number;

    /** @hidden */
    public get hourView(): string[] {
        return this._hourView;
    }

    /** @hidden */
    public get minuteView(): string[] {
        return this._minuteView;
    }

    /** @hidden */
    public get secondsView(): string[] {
        return this._secondsView;
    }

    /** @hidden */
    public get ampmView(): string[] {
        return this._ampmView;
    }

    /** @hidden */
    public get showClearButton(): boolean {
        return (this.isDropdown && this.dateTimeEditor.value !== null);
    }

    /** @hidden */
    public get showHoursList(): boolean {
        return this.inputFormat.indexOf('h') !== - 1 || this.inputFormat.indexOf('H') !== - 1;
    }

    /** @hidden */
    public get showMinutesList(): boolean {
        return this.inputFormat.indexOf('m') !== - 1;
    }

    /** @hidden */
    public get showSecondsList(): boolean {
        return this.inputFormat.indexOf('s') !== - 1;
    }

    /** @hidden */
    public get showAmPmList(): boolean {
        return this.inputFormat.indexOf('t') !== - 1 || this.inputFormat.indexOf('a') !== - 1;
    }

    /** @hidden */
    public get isTwelveHourFormat(): boolean {
        return this.inputFormat.indexOf('h') !== - 1;
    }

    /** @hidden @internal */
    public get isDropdown(): boolean {
        return this.mode === PickerInteractionMode.DropDown;
    }

    /** @hidden @internal */
    public get isVertical(): boolean {
        return this.headerOrientation === PickerHeaderOrientation.Vertical;
    }

    /** @hidden @internal */
    public get selectedDate(): Date {
        return this._selectedDate;
    }

    /** @hidden @internal */
    public get minDropdownValue(): Date {
        return this._minDropdownValue;
    }

    /** @hidden @internal */
    public get maxDropdownValue(): Date {
        return this._maxDropdownValue;
    }

    private get required(): boolean {
        if (this._ngControl && this._ngControl.control && this._ngControl.control.validator) {
            // Run the validation with empty object to check if required is enabled.
            const error = this._ngControl.control.validator({} as AbstractControl);
            return error && error.required;
        }

        return false;
    }

    private get minDateValue(): Date {
        if (!this._dateMinValue) {
            const minDate = new Date();
            minDate.setHours(0, 0, 0);
            return minDate;
        }

        return this._dateMinValue;
    }

    private get maxDateValue(): Date {
        if (!this._dateMaxValue) {
            const maxDate = new Date();
            maxDate.setHours(23, 59, 59);
            return maxDate;
        }

        return this._dateMaxValue;
    }

    private get dialogOverlaySettings(): OverlaySettings {
        return Object.assign({}, this._defaultDialogOverlaySettings, this.overlaySettings);
    }

    private get dropDownOverlaySettings(): OverlaySettings {
        return Object.assign({}, this._defaultDropDownOverlaySettings, this.overlaySettings);
    }

    /** @hidden @internal */
    public displayValue: PipeTransform = { transform: (date: Date) => this.formatter(date) };

    private _value: Date | string;
    private _dateValue: Date;
    private _dateMinValue: Date;
    private _dateMaxValue: Date;
    private _selectedDate: Date;
    private _oldValue: Date | string;
    private _minDropdownValue: Date;
    private _maxDropdownValue: Date;
    private _resourceStrings = CurrentResourceStrings.TimePickerResStrings;
    private _okButtonLabel = null;
    private _cancelButtonLabel = null;
    private _itemsDelta: { hour: number; minute: number; second: number } = { hour: 1, minute: 1, second: 1 };

    private _hourItems = [];
    private _minuteItems = [];
    private _secondsItems = [];
    private _ampmItems = [];

    private _hourView = [];
    private _minuteView = [];
    private _secondsView = [];
    private _ampmView = [];

    private _destroy$ = new Subject();
    private _statusChanges$: Subscription;
    private _ngControl: NgControl = null;
    private _onChangeCallback: (_: Date | string) => void = noop;
    private _onTouchedCallback: () => void = noop;
    private _onValidatorChange: () => void = noop;

    private _defaultDialogOverlaySettings: OverlaySettings = {
        closeOnOutsideClick: true,
        modal: true,
        closeOnEscape: true,
        outlet: this.outlet
    };
    private _defaultDropDownOverlaySettings: OverlaySettings = {
        target: this.element.nativeElement,
        modal: false,
        closeOnOutsideClick: true,
        scrollStrategy: new AbsoluteScrollStrategy(),
        positionStrategy: new AutoPositionStrategy(),
        outlet: this.outlet
    };


    /**
     * The currently selected value / time from the drop-down/dialog
     *
     * @remarks
     * The current value is of type `Date`
     *
     * @example
     * ```typescript
     * const newValue: Date = new Date(2000, 2, 2, 10, 15, 15);
     * this.timePicker.value = newValue;
     * ```
     */
    public get value(): Date | string {
        return this._value;
    }

    /**
     * An accessor that allows you to set a time using the `value` input.
     * ```html
     * public date: Date = new Date(Date.now());
     *  //...
     * <igx-time-picker [value]="date" format="h:mm tt"></igx-time-picker>
     * ```
     */
    @Input()
    public set value(value: Date | string) {
        const oldValue = this._value;
        this._value = value;
        const date = this.parseToDate(value);
        if (date) {
            this._dateValue = new Date();
            this._dateValue.setHours(date.getHours(), date.getMinutes(), date.getSeconds());
        }
        if (this.dateTimeEditor.value !== this._dateValue) {
            this.dateTimeEditor.value = date;
        }
        this.emitValueChange(oldValue, this._value);
        this._onChangeCallback(this._value);
    }

    /**
     * An accessor that sets the resource strings.
     * By default it uses EN resources.
     */
    @Input()
    public set resourceStrings(value: ITimePickerResourceStrings) {
        this._resourceStrings = Object.assign({}, this._resourceStrings, value);
    }

    /**
     * An accessor that returns the resource strings.
     */
    public get resourceStrings(): ITimePickerResourceStrings {
        return this._resourceStrings;
    }

    /**
     * An @Input property that renders OK button with custom text. By default `okButtonLabel` is set to OK.
     * ```html
     * <igx-time-picker okButtonLabel='SET' [value]="date" format="h:mm tt"></igx-time-picker>
     * ```
     */
    @Input()
    public set okButtonLabel(value: string) {
        this._okButtonLabel = value;
    }

    /**
     * An accessor that returns the label of ok button.
     */
    public get okButtonLabel(): string {
        if (this._okButtonLabel === null) {
            return this.resourceStrings.igx_time_picker_ok;
        }
        return this._okButtonLabel;
    }

    /**
     * An @Input property that renders cancel button with custom text.
     * By default `cancelButtonLabel` is set to Cancel.
     * ```html
     * <igx-time-picker cancelButtonLabel='Exit' [value]="date" format="h:mm tt"></igx-time-picker>
     * ```
     */
    @Input()
    public set cancelButtonLabel(value: string) {
        this._cancelButtonLabel = value;
    }

    /**
     * An accessor that returns the label of cancel button.
     */
    public get cancelButtonLabel(): string {
        if (this._cancelButtonLabel === null) {
            return this.resourceStrings.igx_time_picker_cancel;
        }
        return this._cancelButtonLabel;
    }

    /**
     * Delta values used to increment or decrement each editor date part on spin actions and
     * to display time portions in the dropdown/dialog.
     * By default `itemsDelta` is set to `{hour: 1, minute: 1, second: 1}`
     * ```html
     * <igx-time-picker [itemsDelta]="{hour:3, minute:5, second:10}" id="time-picker"></igx-time-picker>
     * ```
     */
    @Input()
    public set itemsDelta(value) {
        this._itemsDelta = { hour: 1, minute: 1, second: 1, ...value };
    }

    public get itemsDelta(): { hour: number; minute: number; second: number } {
        return this._itemsDelta;
    }

    constructor(
        public element: ElementRef,
        @Inject(LOCALE_ID) protected _localeId: string,
        @Optional() @Inject(DisplayDensityToken) protected _displayDensityOptions: IDisplayDensityOptions,
        @Optional() @Inject(IGX_INPUT_GROUP_TYPE) protected _inputGroupType: IgxInputGroupType,
        private _injector: Injector,
        private platform: PlatformUtil) {
        super(element, _localeId, _displayDensityOptions, _inputGroupType);
    }

    // #region ControlValueAccessor

    /** @hidden @internal */
    public writeValue(value: Date | string) {
        this._value = value;
        const date = this.parseToDate(value);
        if (date) {
            this._dateValue = new Date();
            this._dateValue.setHours(date.getHours(), date.getMinutes(), date.getSeconds());
        }
        if (this.dateTimeEditor) {
            this.dateTimeEditor.value = this.parseToDate(value);
        }
        if (this._dateValue && this._dateValue.getTime() !== this._selectedDate?.getTime()) {
            this._selectedDate.setHours(this._dateValue.getHours(), this._dateValue.getMinutes(), this._dateValue.getSeconds());
        }
    }

    /** @hidden @internal */
    public registerOnChange(fn: (_: Date | string) => void) {
        this._onChangeCallback = fn;
    }

    /** @hidden @internal */
    public registerOnTouched(fn: () => void) {
        this._onTouchedCallback = fn;
    }

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
        Object.assign(errors, DateTimeUtil.validateMinMax(value, this.minValue, this.maxValue, false));
        return Object.keys(errors).length > 0 ? errors : null;
    }

    /** @hidden @internal */
    public setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }
    //#endregion

    /** @hidden */
    public ngOnInit(): void {
        this._ngControl = this._injector.get<NgControl>(NgControl, null);
        this.setContainer();
    }

    /** @hidden */
    public ngAfterViewInit(): void {
        this.subscribeToDateEditorEvents();
        this.subscribeToToggleDirectiveEvents();
        if (this._ngControl) {
            this._statusChanges$ = this._ngControl.statusChanges.subscribe(this.onStatusChanged.bind(this));
        }
    }

    /** @hidden @internal */
    public ngOnChanges(changes: SimpleChanges): void {
        if (changes['minValue'] || changes['maxValue']) {
            this.setContainer();
        }
    }

    /** @hidden */
    public ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
        if (this._statusChanges$) {
            this._statusChanges$.unsubscribe();
        }
    }

    /** @hidden */
    public getEditElement(): HTMLInputElement {
        return this.dateTimeEditor.nativeElement;
    }

    /**
     * Opens the picker's dialog UI.
     *
     * @param settings OverlaySettings - the overlay settings to use for positioning the drop down or dialog container according to
     * ```html
     * <igx-time-picker #picker [value]="date"></igx-time-picker>
     * <button (click)="picker.open()">Open Dialog</button>
     * ```
     */
    public open(settings?: OverlaySettings): void {
        if (this.disabled || !this.toggleRef.collapsed) {
            return;
        }

        this._oldValue = DateTimeUtil.isValidDate(this.value) ? new Date(this.value) : this.value;
        const overlaySettings = Object.assign({}, this.isDropdown
            ? this.dropDownOverlaySettings
            : this.dialogOverlaySettings
            , settings);

        this.toggleRef.open(overlaySettings);
        this.initializeContainer();
    }

    /**
     * Closes the dropdown/dialog.
     * ```html
     * <igx-time-picker #timePicker></igx-time-picker>
     * ```
     * ```typescript
     * @ViewChild('timePicker', { read: IgxTimePickerComponent }) picker: IgxTimePickerComponent;
     * picker.close();
     * ```
     */
    public close(): void {
        this.toggleRef.close();
    }

    public toggle(settings?: OverlaySettings): void {
        if (this.toggleRef.collapsed) {
            this.open(settings);
        } else {
            this.close();
        }
    }

    /**
     * Clears the time picker value if it is a `string` or resets the time to `00:00:00` if the value is a Date object.
     *
     * @example
     * ```typescript
     * this.timePicker.clear();
     * ```
     */
    public clear(): void {
        if (this.disabled) {
            return;
        }

        if (!this.toggleRef.collapsed) {
            this.close();
        }

        if (isDate(this.value)) {
            const oldValue = new Date(this.value);
            this.value.setHours(0, 0, 0);
            if (this.value.getTime() !== oldValue.getTime()) {
                this.emitValueChange(oldValue, this.value);
                this._dateValue.setHours(0, 0, 0);
                this.dateTimeEditor.value = new Date(this.value);
                this.setSelectedValue();
            }
        } else {
            this.value = null;
        }
    }

    /**
     * Selects time from the igxTimePicker.
     *
     * @example
     * ```typescript
     * this.timePicker.select(date);
     *
     * @param date Date object containing the time to be selected.
     */
    public select(date: Date | string): void {
        const oldValue = this.value;
        this.value = date;
        this.setSelectedValue();
        if (DateTimeUtil.validateMinMax(this._dateValue, this.minValue, this.maxValue, true)) {
            this.emitValidationFailedEvent(oldValue);
        }
    }

    /**
     * Increment a specified `DatePart`.
     *
     * @param datePart The optional DatePart to increment. Defaults to Hour.
     * @param delta The optional delta to increment by. Overrides `itemsDelta`.
     * @example
     * ```typescript
     * this.timePicker.increment(DatePart.Hours);
     * ```
     */
    public increment(datePart?: DatePart, delta?: number): void {
        this.dateTimeEditor.increment(datePart, delta);
        this.setSelectedValue();
    }

    /**
     * Decrement a specified `DatePart`
     *
     * @param datePart The optional DatePart to decrement. Defaults to Hour.
     * @param delta The optional delta to decrement by. Overrides `itemsDelta`.
     * @example
     * ```typescript
     * this.timePicker.decrement(DatePart.Seconds);
     * ```
     */
    public decrement(datePart?: DatePart, delta?: number): void {
        this.dateTimeEditor.decrement(datePart, delta);
        this.setSelectedValue();
    }

    /** @hidden @internal */
    public cancelButtonClick(): void {
        this.value = this._oldValue;
        this.setSelectedValue();
        this.close();
    }

    /** @hidden @internal */
    public onItemClick(item: string, dateType: string): void {
        let date = new Date(this._selectedDate);
        switch (dateType) {
            case 'hourList':
                const previousDate = new Date(date);
                let ampm: string;
                const selectedHour = parseInt(item, 10);
                let hours = selectedHour;

                if (this.showAmPmList) {
                    ampm = this.getPartValue(date, 'ampm');
                    hours = this.toTwentyFourHourFormat(hours, ampm);
                    const minHours = this._minDropdownValue?.getHours() || 0;
                    const maxHours = this._maxDropdownValue?.getHours() || 24;
                    if (hours < minHours || hours > maxHours) {
                        hours = hours < 12 ? hours + 12 : hours - 12;
                    }
                }

                date.setHours(hours);
                date = this.validateDropdownValue(date);

                if (this.valueInRange(date, this._minDropdownValue, this._maxDropdownValue)) {
                    hours = date.getHours();
                    hours = this.isTwelveHourFormat ? this.toTwelveHourFormat(hours) : hours;
                    this._hourView = this.scrollListItem(hours, this._hourItems, DatePart.Hours);
                    this._selectedDate = date;

                    this.updateSelectedAmpm(previousDate);
                    this.updateSelectedMinutes();
                    this.updateSelectedSeconds();
                }
                break;
            case 'minuteList': {
                const minutes = parseInt(item, 10);
                date.setMinutes(minutes);
                date = this.validateDropdownValue(date);
                this._minuteView = this.scrollListItem(minutes, this._minuteItems, DatePart.Minutes);
                this._selectedDate = date;
                this.updateSelectedSeconds();
                break;
            }
            case 'secondsList': {
                const seconds = parseInt(item, 10);
                date.setSeconds(seconds);
                if (this.valueInRange(date, this._minDropdownValue, this._maxDropdownValue)) {
                    this._secondsView = this.scrollListItem(seconds, this._secondsItems, DatePart.Seconds);
                    this._selectedDate = date;
                }
                break;
            }
            case 'ampmList': {
                let hour = this._selectedDate.getHours();
                hour = item === 'AM' ? hour - 12 : hour + 12;
                date.setHours(hour);
                date = this.validateDropdownValue(date, true);
                hour = this.toTwelveHourFormat(date.getHours());
                this._ampmView = this.scrollListItem(item, this._ampmItems, DatePart.AmPm);
                this._hourView = this.scrollListItem(hour, this._hourItems, DatePart.Hours);
                this._selectedDate = date;
                this.updateSelectedMinutes();
                this.updateSelectedSeconds();
                break;
            }
        }
        this.updateValue();
    }

    /** @hidden @internal */
    public nextHour(delta: number) {
        delta = delta > 0 ? 1 : -1;
        const previousDate = new Date(this._selectedDate);
        const minHours = this._minDropdownValue?.getHours() || 0;
        const maxHours = this._maxDropdownValue?.getHours() || 24;
        const previousHours = previousDate.getHours();
        let hours = previousHours + delta * this.itemsDelta.hour;
        if ((previousHours === maxHours && delta > 0) || (previousHours === minHours && delta < 0)) {
            hours = !this.spinLoop ? previousHours : delta > 0 ? minHours : maxHours;
        }

        this._selectedDate.setHours(hours);
        this._selectedDate = this.validateDropdownValue(this._selectedDate);

        if (hours === minHours || hours === maxHours ||
            previousHours === minHours || previousHours === maxHours) {
            this.updateSelectedMinutes();
            this.updateSelectedSeconds();
        }

        hours = this.isTwelveHourFormat ? this.toTwelveHourFormat(hours) : hours;
        this._hourView = this.scrollListItem(hours, this._hourItems, DatePart.Hours);
        this.updateSelectedAmpm(previousDate);

        this._selectedDate = new Date(this._selectedDate);
        this.updateValue();
    }

    /** @hidden @internal */
    public nextMinute(delta: number) {
        delta = delta > 0 ? 1 : -1;
        const minMax = this.findArrayMinMax(this._minuteItems);
        const min = minMax.min;
        const max = minMax.max;
        let minutes = this._selectedDate.getMinutes();
        if ((delta < 0 && minutes === min) || (delta > 0 && minutes === max)) {
            minutes = this.spinLoop && minutes === min ? max : this.spinLoop && minutes === max ? min : minutes;
        } else {
            minutes = minutes + delta * this.itemsDelta.minute;
        }

        this._selectedDate.setMinutes(minutes);
        this._selectedDate = this.validateDropdownValue(this._selectedDate);

        this.updateSelectedSeconds();

        this._minuteView = this.scrollListItem(minutes, this._minuteItems, DatePart.Minutes);
        this._selectedDate = new Date(this._selectedDate);
        this.updateValue();
    }

    /** @hidden @internal */
    public nextSeconds(delta: number) {
        delta = delta > 0 ? 1 : -1;
        const minMax = this.findArrayMinMax(this._secondsItems);
        const min = minMax.min;
        const max = minMax.max;
        let seconds = this._selectedDate.getSeconds();
        if ((delta < 0 && seconds === min) || (delta > 0 && seconds === max)) {
            seconds = this.spinLoop && seconds === min ? max : this.spinLoop && seconds === max ? min : seconds;
        } else {
            seconds = seconds + delta * this.itemsDelta.second;
        }

        this._selectedDate.setSeconds(seconds);
        this._selectedDate = this.validateDropdownValue(this._selectedDate);

        this._secondsView = this.scrollListItem(seconds, this._secondsItems, DatePart.Seconds);
        this._selectedDate = new Date(this._selectedDate);
        this.updateValue();
    }

    /** @hidden @internal */
    public nextAmPm(delta?: number) {
        let ampm = this.getPartValue(this._selectedDate, 'ampm');
        if (!delta || (ampm === 'AM' && delta > 0) || (ampm === 'PM' && delta < 0)) {
            let hours = this._selectedDate.getHours();
            const sign = hours < 12 ? 1 : -1;
            hours = hours + sign * 12;
            this._selectedDate.setHours(hours);
            this._selectedDate = this.validateDropdownValue(this._selectedDate, true);

            hours = this.toTwelveHourFormat(this._selectedDate.getHours());
            this._hourView = this.scrollListItem(hours, this._hourItems, DatePart.Hours);

            this.updateSelectedMinutes();
            this.updateSelectedSeconds();

            ampm = this.getPartValue(this._selectedDate, 'ampm');
            this._ampmView = this.scrollListItem(ampm, this._ampmItems, DatePart.AmPm);

            this._selectedDate = new Date(this._selectedDate);
            this.updateValue();
        }
    }

    /** @hidden @internal */
    public hoursInView(): string[] {
        return this._hourView.filter((hour) => hour !== '');
    }

    /** @hidden @internal */
    public minutesInView(): string[] {
        return this._minuteView.filter((minute) => minute !== '');
    }

    /** @hidden @internal */
    public secondsInView(): string[] {
        return this._secondsView.filter((seconds) => seconds !== '');
    }

    /** @hidden @internal */
    public ampmInView(): string[] {
        return this._ampmView.filter((ampm) => ampm !== '');
    }

    /** @hidden @internal */
    @HostListener('keydown', ['$event'])
    public onKeyDown(event: KeyboardEvent): void {
        switch (event.key) {
            case this.platform.KEYMAP.ARROW_UP:
                if (event.altKey && this.isDropdown) {
                    this.close();
                }
                break;
            case this.platform.KEYMAP.ARROW_DOWN:
                if (event.altKey && this.isDropdown) {
                    this.open();
                }
                break;
            case this.platform.KEYMAP.ESCAPE:
                this.cancelButtonClick();
                break;
            case this.platform.KEYMAP.SPACE:
                this.open();
                event.preventDefault();
                break;
        }
    }

    protected onStatusChanged() {
        if ((this._ngControl.control.touched || this._ngControl.control.dirty) &&
            (this._ngControl.control.validator || this._ngControl.control.asyncValidator)) {
            const input = this.inputDirective;
            if (this._inputGroup.isFocused) {
                input.valid = this._ngControl.valid ? IgxInputState.VALID : IgxInputState.INVALID;
            } else {
                input.valid = this._ngControl.valid ? IgxInputState.INITIAL : IgxInputState.INVALID;
            }
        }

        if (this._inputGroup && this._inputGroup.isRequired !== this.required) {
            this._inputGroup.isRequired = this.required;
        }
    }

    private scrollListItem(item: number | string, items: any[], datePart: DatePart): any {
        const itemsCount = items.length;
        let view;
        if (items) {
            const index = items.indexOf(item);
            if (index < 3) {
                view = items.slice(itemsCount - (3 - index), itemsCount);
                view = view.concat(items.slice(0, index + 4));
            } else if (index + 4 > itemsCount) {
                view = items.slice(index - 3, itemsCount);
                view = view.concat(items.slice(0, index + 4 - itemsCount));
            } else {
                view = items.slice(index - 3, index + 4);
            }
        }
        return this.viewToString(view, datePart);;
    }

    private viewToString(view: any, dateType: DatePart): any {
        for (let i = 0; i < view.length; i++) {
            view[i] = this.itemToString(view[i], dateType);
        }
        return view;
    }

    private itemToString(item: any, dateType: DatePart): string {
        if (item === null) {
            item = '';
        } else if (dateType && typeof (item) !== 'string') {
            const leadZeroHour = (item < 10 && (this.inputFormat.indexOf('hh') !== -1 || this.inputFormat.indexOf('HH') !== -1));
            const leadZeroMinute = (item < 10 && this.inputFormat.indexOf('mm') !== -1);
            const leadZeroSeconds = (item < 10 && this.inputFormat.indexOf('ss') !== -1);

            const leadZero = {
                hour: leadZeroHour,
                minute: leadZeroMinute,
                second: leadZeroSeconds
            }[dateType];

            item = (leadZero) ? '0' + item : `${item}`;
        }
        return item;
    }

    private generateHours(): void {
        this._hourItems = [];
        let hoursCount = this.isTwelveHourFormat ? 13 : 24;
        hoursCount /= this.itemsDelta.hour;
        const minHours = this._minDropdownValue.getHours() || 0;
        const maxHours = this._maxDropdownValue.getHours() || 24;

        if (hoursCount > 1) {
            for (let hourIndex = 0; hourIndex < 24; hourIndex++) {
                let hours = hourIndex * this.itemsDelta.hour;
                if (hours >= minHours && hours <= maxHours) {
                    hours = this.isTwelveHourFormat ? this.toTwelveHourFormat(hours) : hours;
                    if (!this._hourItems.find((element => element === hours))) {
                        this._hourItems.push(hours);
                    }
                }
            }
        } else {
            this._hourItems.push(0);
        }

        if (this._hourItems.length < ITEMS_COUNT || hoursCount < ITEMS_COUNT || !this.spinLoop) {
            const index = !this.spinLoop || (this._hourItems.length < ITEMS_COUNT && hoursCount < ITEMS_COUNT) ? 6 : 3;
            for (let i = 0; i < index; i++) {
                this._hourItems.push(null);
            }
        }
    }

    private generateMinutes(): void {
        this._minuteItems = [];
        const minuteItemsCount = 60 / this.itemsDelta.minute;
        const min = new Date(this._minDropdownValue);
        const max = new Date(this._maxDropdownValue);
        const time = new Date(this._selectedDate);
        if (this.showHoursList) {
            time.setSeconds(0, 0);
            min.setSeconds(0, 0);
            max.setSeconds(0, 0);
        }

        for (let i = 0; i < minuteItemsCount; i++) {
            const minutes = i * this.itemsDelta.minute;
            time.setMinutes(minutes);
            if (time >= min && time <= max) {
                this._minuteItems.push(minutes);
            }
        }

        if (this._minuteItems.length < ITEMS_COUNT || minuteItemsCount < ITEMS_COUNT || !this.spinLoop) {
            const index = !this.spinLoop || (this._minuteItems.length < ITEMS_COUNT && minuteItemsCount < ITEMS_COUNT) ? 6 : 3;
            for (let i = 0; i < index; i++) {
                this._minuteItems.push(null);
            }
        }
    }

    private generateSeconds(): void {
        this._secondsItems = [];
        const secondsItemsCount = 60 / this.itemsDelta.second;
        const time = new Date(this._selectedDate);

        for (let i = 0; i < secondsItemsCount; i++) {
            const seconds = i * this.itemsDelta.second;
            time.setSeconds(seconds);
            if (time.getTime() >= this._minDropdownValue.getTime() && time.getTime() <= this._maxDropdownValue.getTime()) {
                this._secondsItems.push(i * this.itemsDelta.second);
            }
        }

        if (this._secondsItems.length < ITEMS_COUNT || secondsItemsCount < ITEMS_COUNT || !this.spinLoop) {
            const index = !this.spinLoop || (this._secondsItems.length < ITEMS_COUNT && secondsItemsCount < ITEMS_COUNT) ? 6 : 3;
            for (let i = 0; i < index; i++) {
                this._secondsItems.push(null);
            }
        }
    }

    private generateAmPm(): void {
        const minHour = this._minDropdownValue?.getHours() || 0;
        const maxHour = this._maxDropdownValue?.getHours() || 24;

        if (minHour < 12) {
            this._ampmItems.push('AM');
        }

        if (minHour >= 12 || maxHour >= 12) {
            this._ampmItems.push('PM');
        }

        for (let i = 0; i < 5; i++) {
            this._ampmItems.push(null);
        }
    }

    private initializeContainer() {
        this.value = isDate(this.value) ? this._selectedDate : this.toISOString(this._selectedDate);
        this._onTouchedCallback();

        if (this.showHoursList) {
            const hours = this._selectedDate.getHours();
            const selectedHour = this.isTwelveHourFormat ? this.toTwelveHourFormat(hours) : hours;
            this._hourView = this.scrollListItem(selectedHour, this._hourItems, DatePart.Hours);
        }
        if (this.showMinutesList) {
            this._minuteView = this.scrollListItem(this._selectedDate.getMinutes(), this._minuteItems, DatePart.Minutes);
        }
        if (this.showSecondsList) {
            this._secondsView = this.scrollListItem(this._selectedDate.getSeconds(), this._secondsItems, DatePart.Seconds);
        }
        if (this.showAmPmList) {
            const selectedAmPm = this.getPartValue(this._selectedDate, 'ampm');
            this._ampmView = this.scrollListItem(selectedAmPm, this._ampmItems, null);
        }

        requestAnimationFrame(() => {
            if (this.hourList) {
                this.hourList.nativeElement.focus();
            } else if (this.minuteList) {
                this.minuteList.nativeElement.focus();
            } else if (this.secondsList) {
                this.secondsList.nativeElement.focus();
            }
        });
    }

    private getPartValue(value: Date, type: string): string {
        const inputDateParts = DateTimeUtil.parseDateTimeFormat(this.inputFormat);
        const part = inputDateParts.find(element => element.type === type);
        return DateTimeUtil.getPartValue(value, part, part.format.length);
    }

    private findArrayMinMax(array: any[]): any {
        const filteredArray = array.filter(val => val !== null);
        return {
            min: Math.min(...filteredArray),
            max: Math.max(...filteredArray)
        };
    }

    private updateSelectedMinutes() {
        if (this.showMinutesList) {
            this.generateMinutes();
            this._minuteView = this.scrollListItem(this._selectedDate.getMinutes(), this._minuteItems, DatePart.Minutes);
        }
    }

    private updateSelectedSeconds() {
        if (this.showSecondsList) {
            this.generateSeconds();
            this._secondsView = this.scrollListItem(this._selectedDate.getSeconds(), this._secondsItems, DatePart.Seconds);
        }
    }

    private updateSelectedAmpm(previousDate: Date) {
        if (this.showAmPmList) {
            const previousAmPm = this.getPartValue(previousDate, 'ampm');
            const currentAmPm = this.getPartValue(this._selectedDate, 'ampm');
            if (previousAmPm !== currentAmPm) {
                this._ampmView = this.scrollListItem(currentAmPm, this._ampmItems, null);
            }
        }
    }

    private validateDropdownValue(date: Date, isAmPm = false): Date {
        if (date > this._maxDropdownValue) {
            if (isAmPm && date.getHours() !== this._maxDropdownValue.getHours()) {
                date.setHours(12);
            } else {
                date = new Date(this._maxDropdownValue);
            }
        }

        if (date < this._minDropdownValue) {
            date = new Date(this._minDropdownValue);
        }

        return date;
    }

    private emitValueChange(oldValue: Date | string, newValue: Date | string) {
        if (!isEqual(oldValue, newValue)) {
            this.valueChange.emit(newValue);
        }
    }

    private emitValidationFailedEvent(previousValue: Date | string) {
        const args: IgxTimePickerValidationFailedEventArgs = {
            owner: this,
            previousValue
        };
        this.validationFailed.emit(args);
    }

    private updateValidityOnBlur() {
        this._onTouchedCallback();
        if (this._ngControl) {
            if (!this._ngControl.valid) {
                this.inputDirective.valid = IgxInputState.INVALID;
            } else {
                this.inputDirective.valid = IgxInputState.INITIAL;
            }
        }
    }

    private valueInRange(value: Date, minValue: Date, maxValue: Date): boolean {
        if (minValue && DateTimeUtil.lessThanMinValue(value, minValue, true, false)) {
            return false;
        }
        if (maxValue && DateTimeUtil.greaterThanMaxValue(value, maxValue, true, false)) {
            return false;
        }

        return true;
    }

    private setContainer(): void {
        this._minDropdownValue = this.setMinMaxDropdownValue('min');
        this._maxDropdownValue = this.setMinMaxDropdownValue('max');
        this.setSelectedValue();

        if (this.showHoursList) {
            this.generateHours();
        }
        if (this.showMinutesList) {
            this.generateMinutes();
        }
        if (this.showSecondsList) {
            this.generateSeconds();
        }
        if (this.showAmPmList) {
            this.generateAmPm();
        }
    }

    private setMinMaxDropdownValue(value: string): Date {
        let delta: number;

        const sign = value === 'min' ? 1 : -1;
        const time = value === 'min' ? new Date(this.minDateValue) : new Date(this.maxDateValue);

        const hours = time.getHours();
        const minutes = time.getMinutes();
        const seconds = time.getSeconds();

        if (this.showHoursList && hours % this.itemsDelta.hour > 0) {
            delta = value === 'min' ? this.itemsDelta.hour - hours % this.itemsDelta.hour : hours % this.itemsDelta.hour;
            time.setHours(hours + sign * delta, 0, 0);
        } else if (this.showMinutesList && minutes % this.itemsDelta.minute > 0) {
            delta = value === 'min' ? this.itemsDelta.minute - minutes % this.itemsDelta.minute : minutes % this.itemsDelta.minute;
            time.setHours(hours, minutes + sign * delta, 0);
        } else if (this.showSecondsList && seconds % this.itemsDelta.second > 0) {
            delta = value === 'min' ? this.itemsDelta.second - seconds % this.itemsDelta.second : seconds % this.itemsDelta.second;
            time.setHours(hours, minutes, seconds + sign * delta);
        }

        return time;
    }

    private setSelectedValue() {
        this._selectedDate = this._dateValue ? new Date(this._dateValue) : new Date(this._minDropdownValue);
        if (!this._selectedDate || this._selectedDate < this._minDropdownValue ||
            this._selectedDate > this._maxDropdownValue ||
            this._selectedDate.getHours() % this.itemsDelta.hour > 0 ||
            this._selectedDate.getMinutes() % this.itemsDelta.minute > 0 ||
            this._selectedDate.getSeconds() % this.itemsDelta.second > 0) {
            this._selectedDate = new Date(this._minDropdownValue);
        }
    }

    private parseToDate(value: any): Date {
        return DateTimeUtil.isValidDate(value) ? value : DateTimeUtil.parseIsoDate(value);
    }

    private toISOString(value: Date): string {
        return value.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    }

    private toTwelveHourFormat(hour: number): number {
        if (hour > 12) {
            hour -= 12;
        } else if (hour === 0) {
            hour = 12;
        }

        return hour;
    }

    private toTwentyFourHourFormat(hour: number, ampm: string): number {
        if (ampm === 'PM' && hour < 12) {
            hour += 12;
        } else if (ampm === 'AM' && hour === 12) {
            hour = 0;
        }

        return hour;
    }

    private updateValue(): void {
        if (isDate(this.value)) {
            const date = new Date(this.value);
            date.setHours(this._selectedDate.getHours(), this._selectedDate.getMinutes(), this._selectedDate.getSeconds());
            this.value = date;
        } else {
            this.value = this.toISOString(this._selectedDate);
        }
    }

    private subscribeToDateEditorEvents(): void {
        this.dateTimeEditor.valueChange.pipe(
            takeUntil(this._destroy$)).subscribe(date => {
                this.value = isDate(this.value) ? this.parseToDate(date) : isDate(date) ? this.toISOString(date) : date;
                this.setSelectedValue();
            });

        this.dateTimeEditor.validationFailed.pipe(
            takeUntil(this._destroy$)).subscribe((event) => {
                this.emitValidationFailedEvent(event.oldValue);
            });
    }

    private subscribeToToggleDirectiveEvents(): void {
        if (this.toggleRef) {
            if (this._inputGroup) {
                this.toggleRef.element.style.width = this._inputGroup.element.nativeElement.getBoundingClientRect().width + 'px';
            }

            const args: IBaseEventArgs = {
                owner: this
            };

            this.toggleRef.onOpening.pipe(takeUntil(this._destroy$)).subscribe((event) => {
                this.opening.emit(event);
                if (event.cancel) {
                    return;
                }
            });

            this.toggleRef.onOpened.pipe(takeUntil(this._destroy$)).subscribe(() => {
                this.opened.emit(args);
            });

            this.toggleRef.onClosed.pipe(takeUntil(this._destroy$)).subscribe(() => {
                this.closed.emit(args);
            });

            this.toggleRef.onClosing.pipe(takeUntil(this._destroy$)).subscribe((event) => {
                this.closing.emit(event);
                if (event.cancel) {
                    return;
                }
                // Do not focus the input if clicking outside in dropdown mode
                const input = this.getEditElement();
                if (input && !(event.event && this.isDropdown)) {
                    input.focus();
                } else {
                    this.updateValidityOnBlur();
                }
            });
        }
    }
}

/**
 * @hidden
 */
@NgModule({
    declarations: [
        IgxTimePickerComponent,
        IgxItemListDirective,
        IgxTimeItemDirective,
        IgxTimePickerTemplateDirective,
        IgxTimePickerActionsDirective,
        TimeFormatPipe
    ],
    exports: [
        IgxTimePickerComponent,
        IgxTimePickerTemplateDirective,
        IgxTimePickerActionsDirective,
        IgxPickersCommonModule,
        IgxInputGroupModule
    ],
    imports: [
        CommonModule,
        IgxDateTimeEditorModule,
        IgxInputGroupModule,
        IgxIconModule,
        IgxButtonModule,
        IgxMaskModule,
        IgxToggleModule,
        IgxTextSelectionModule
    ],
    providers: []
})
export class IgxTimePickerModule { }
