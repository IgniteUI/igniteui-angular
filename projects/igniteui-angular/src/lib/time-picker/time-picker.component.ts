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
    TemplateRef,
    ViewChild,
    ContentChild,
    Inject,
    Injectable,
    AfterViewInit,
    Injector,
    ChangeDetectorRef,
    AfterViewChecked,
    LOCALE_ID, Optional, ContentChildren, QueryList, OnChanges, SimpleChanges
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl, AbstractControl, ValidationErrors, Validator, NG_VALIDATORS } from '@angular/forms';
import { HAMMER_GESTURE_CONFIG, HammerGestureConfig } from '@angular/platform-browser';
import { IgxIconModule } from '../icon/public_api';
import { IgxInputGroupModule, IgxInputGroupComponent } from '../input-group/input-group.component';
import { IgxInputDirective, IgxInputState } from '../directives/input/input.directive';
import { IgxInputGroupType, IGX_INPUT_GROUP_TYPE } from '../input-group/public_api';
import { DisplayDensityToken, IDisplayDensityOptions } from '../core/density';
import {
    IgxAmPmItemDirective,
    IgxHourItemDirective,
    IgxMinuteItemDirective,
    IgxSecondsItemDirective,
    IgxItemListDirective,
    IgxTimePickerTemplateDirective,
    IgxTimePickerActionsDirective
} from './time-picker.directives';
import { Subject, fromEvent, Subscription, noop } from 'rxjs';
import { EditorProvider } from '../core/edit-provider';
import { IgxTimePickerBase, IGX_TIME_PICKER_COMPONENT, TimeParts } from './time-picker.common';
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
import { KEYS, IBaseEventArgs, IBaseCancelableBrowserEventArgs } from '../core/utils';
import { InteractionMode } from '../core/enums';
import { IgxTextSelectionModule } from '../directives/text-selection/text-selection.directive';
import { IgxLabelDirective } from '../directives/label/label.directive';
import { PickersBaseDirective } from '../date-common/pickers-base.directive';
import { IgxPickerToggleComponent } from '../date-range-picker/public_api';
import { DatePickerUtil } from '../date-picker/date-picker.utils';
import { DatePart } from '../directives/date-time-editor/public_api';
import { DeprecateProperty } from '../core/deprecateDecorators';
import { HeaderOrientation } from '../date-common/types';


let NEXT_ID = 0;
const ITEMS_COUNT = 7;

@Injectable()
export class TimePickerHammerConfig extends HammerGestureConfig {
    public overrides = {
        pan: { direction: Hammer.DIRECTION_VERTICAL, threshold: 1 }
    };
}

export interface IgxTimePickerValueChangedEventArgs extends IBaseEventArgs {
    oldValue: Date;
    newValue: Date;
}

export interface IgxTimePickerValidationFailedEventArgs extends IBaseEventArgs {
    timePicker: IgxTimePickerComponent;
    currentValue: Date;
    setThroughUI: boolean;
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
export class IgxTimePickerComponent extends PickersBaseDirective
    implements
    IgxTimePickerBase,
    ControlValueAccessor,
    EditorProvider,
    OnInit,
    OnChanges,
    OnDestroy,
    AfterViewInit,
    AfterViewChecked,
    Validator {
    /**
     * An @Input property that sets the value of the `id` attribute.
     * ```html
     * <igx-time-picker [id]="'igx-time-picker-5'" format="h:mm tt" ></igx-time-picker>
     * ```
     */
    @HostBinding('attr.id')
    @Input()
    public id = `igx-time-picker-${NEXT_ID++}`;

    /**
     * The format used when editable inputs are not focused.
     *
     * @remarks
     * Uses Angular's DatePipe.
     *
     * @example
     * ```html
     * <igx-time-picker displayFormat="mm:ss"></igx-time-picker>
     * ```
     *
     */
    @Input()
    public displayFormat: string = DatePickerUtil.DEFAULT_TIME_FORMAT;

    /**
     * The expected user input format and placeholder.
     *
     * @remarks
     * Default is `hh:mm tt`
     *
     * @example
     * ```html
     * <igx-time-picker inputFormat="HH:MM tt"></igx-time-picker>
     * ```
     */
    @Input()
    public inputFormat: string = DatePickerUtil.DEFAULT_TIME_INPUT_FORMAT;

    /**
     * Gets/Sets the interaction mode - dialog or drop down.
     *
     *  @example
     * ```html
     * <igx-time-picker mode="dialog"></igx-time-picker>
     * ```
     */
    @Input()
    public mode: InteractionMode = InteractionMode.DropDown;

    /**
   * Minimum value required for the editor to remain valid.
   *
   * @remarks
   * If a `string` value is passed, it must be in the defined input format.
   *
   * @example
   * ```html
   * <igx-time-picker format="HH:mm" [minValue]="18:00"></igx-time-picker>
   * ```
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
   * Maximum value required for the editor to remain valid.
   *
   * @remarks
   * If a `string` value is passed in, it must be in the defined input format.
   *
   * @example
   * ```html
   * <igx-time-picker format="HH:mm" [maxValue]="20:30"></igx-time-picker>
   * ```
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
     * An @Input property that determines the spin behavior. By default `isSpinLoop` is set to true.
     * The seconds, minutes and hour spinning will wrap around by default.
     * @deprecated Use spinLoop instead:
     * ```html
     * <igx-time-picker [isSpinLoop]="false" id="time-picker"></igx-time-picker>
     * ```
     */
    @DeprecateProperty(`Use spinLoop to set the component's spin behavior:
    <igx-time-picker [spinLoop]="false"></igx-time-picker>`)
    @Input()
    public isSpinLoop = true;

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
     * An @Input property that Gets/Sets the orientation of the `igxTimePicker`. By default `vertical` is set to false.
    * @deprecated Use headerOrientation instead:
     * ```html
     * <igx-time-picker [vertical]="true" id="time-picker"></igx-time-picker>
     * ```
     */
    @DeprecateProperty(`Use headerOrientation to set the dialog's header position:
    <igx-time-picker [headerOrientation]="'vertical'"></igx-time-picker>`)
    @Input()
    public vertical = false;

    /**
     * An @Input property that sets the orientation of the `igxTimePicker` header in dialog mode. Default value is horizontal.
     * ```html
     * <igx-time-picker [headerOrientation]="'vertical'"></igx-time-picker>
     * ```
     */
    @Input()
    public headerOrientation: HeaderOrientation = HeaderOrientation.Horizontal;

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
     * Emitted when selection is made. The event contains the selected value. Returns {`oldValue`: `Date`, `newValue`: `Date`}.
     * ```typescript
     *  @ViewChild("toast")
     * private toast: IgxToastComponent;
     * public valueChange(timepicker){
     *     this.toast.open()
     * }
     *  //...
     *  ```
     *  ```html
     * <igx-time-picker (valueChange)="valueChange($event)"></igx-time-picker>
     * <igx-toast #toast message="The value has been changed!"></igx-toast>
     * ```
     */
    @Output()
    public valueChange = new EventEmitter<IgxTimePickerValueChangedEventArgs>();

    /**
     * Emitted when an invalid value is being set. Returns {`timePicker`: `any`, `currentValue`: `Date`, `setThroughUI`: `boolean`}
     * ```typescript
     * public min: string = "09:00";
     * public max: string = "18:00";
     *  @ViewChild("toast")
     * private toast: IgxToastComponent;
     * public validationFailed(timepicker){
     *     this.toast.open();
     * }
     *  //...
     *  ```
     *  ```html
     * <igx-time-picker [minValue]="min" [maxValue]="max" (validationFailed)="validationFailed($event)"></igx-time-picker>
     * <igx-toast #toast message="Value must be between 09:00 and 18:00!"></igx-toast>
     * ```
     */
    @Output()
    public validationFailed = new EventEmitter<IgxTimePickerValidationFailedEventArgs>();

    /**
     * @hidden
     */
    @ViewChild('hourList')
    public hourList: ElementRef;

    /**
     * @hidden
     */
    @ViewChild('minuteList')
    public minuteList: ElementRef;

    /**
     * @hidden
     */
    @ViewChild('secondsList')
    public secondsList: ElementRef;

    /**
     * @hidden
     */
    @ViewChild('ampmList')
    public ampmList: ElementRef;

    /**
     * @hidden @internal
     */
    @ViewChild(IgxToggleDirective, { static: true })
    public toggleRef: IgxToggleDirective;

    /**
     * @hidden @internal
     */
    @ViewChild(IgxDateTimeEditorDirective, { static: true })
    public dateTimeEditor: IgxDateTimeEditorDirective;

    /**
     * @hidden @internal
     */
    @ContentChild(IgxLabelDirective)
    public label: IgxLabelDirective;

    /**
     *  @hidden @internal
     */
    @ContentChild(IgxTimePickerActionsDirective, { read: IgxTimePickerActionsDirective })
    public timePickerActionsDirective: IgxTimePickerActionsDirective;

    /**
     *  @hidden @internal
     */
    @ContentChildren(IgxPickerToggleComponent, { descendants: true })
    public toggleComponents: QueryList<IgxPickerToggleComponent>;

    @ContentChild(NgControl)
    protected ngControl: NgControl;

    @ViewChild(IgxInputDirective, { read: ElementRef })
    private _inputElementRef: ElementRef;

    @ViewChild(IgxInputDirective, { read: IgxInputDirective })
    private inputDirective: IgxInputDirective;

    @ViewChild(IgxInputGroupComponent, { read: IgxInputGroupComponent })
    private _inputGroup: IgxInputGroupComponent;

    /**
     * @hidden @internal
     */
    public timeParts: any = Object.assign({}, TimeParts);

    /**
     * @hidden
     */
    public _hourItems = [];

    /**
     * @hidden
     */
    public _minuteItems = [];

    /**
     * @hidden
     */
    public _secondsItems = [];

    /**
     * @hidden
     */
    public _ampmItems = [];

    /**
     * @hidden
     */
    public cleared = false;

    /**
     * @hidden
     */
    public isNotEmpty = false;

    /**
     * @hidden
     */
    public selectedHour: string;

    /**
     * @hidden
     */
    public selectedMinute: string;

    /**
     * @hidden
     */
    public selectedSeconds: string;

    /**
     * @hidden
     */
    public selectedAmPm: string;

    /**
     * @hidden
     */
    public get hourView(): string[] {
        return this._hourView;
    }

    /**
     * @hidden
     */
    public get minuteView(): string[] {
        return this._minuteView;
    }

    /**
     * @hidden
     */
    public get secondsView(): string[] {
        return this._secondsView;
    }

    /**
     * @hidden
     */
    public get ampmView(): string[] {
        return this._ampmView;
    }

    /**
     * @hidden
     */
    public get showClearButton(): boolean {
        return (this.isDropdown && this.dateTimeEditor.value !== null);
    }

    /**
     * @hidden
     */
    public get showHoursList(): boolean {
        return this.displayFormat.indexOf('h') !== - 1 || this.displayFormat.indexOf('H') !== - 1;
    }

    /**
     * @hidden
     */
    public get showMinutesList(): boolean {
        return this.displayFormat.indexOf('m') !== - 1;
    }

    /**
     * @hidden
     */
    public get showSecondsList(): boolean {
        return this.displayFormat.indexOf('s') !== - 1;
    }

    /**
     * @hidden
     */
    public get showAmPmList(): boolean {
        return this.displayFormat.indexOf('a') !== - 1;
    }

    /** @hidden @internal */
    public get isDropdown(): boolean {
        return this.mode === InteractionMode.DropDown;
    }

    /** @hidden @internal */
    public get isVertical(): boolean {
        return this.headerOrientation === HeaderOrientation.Vertical;
    }

    private get required(): boolean {
        if (this._ngControl && this._ngControl.control && this._ngControl.control.validator) {
            // Run the validation with empty object to check if required is enabled.
            const error = this._ngControl.control.validator({} as AbstractControl);
            return error && error.required;
        }

        return false;
    }

    /** @hidden @internal */
    private _value: Date;
    private _resourceStrings = CurrentResourceStrings.TimePickerResStrings;
    private _okButtonLabel = null;
    private _cancelButtonLabel = null;
    private _itemsDelta: { hours: number; minutes: number; seconds: number } = { hours: 1, minutes: 1, seconds: 1 };

    private _isHourListLoop = this.spinLoop;
    private _isMinuteListLoop = this.spinLoop;
    private _isSecondsListLoop = this.spinLoop;

    private _hourView = [];
    private _minuteView = [];
    private _secondsView = [];
    private _ampmView = [];

    private destroy$ = new Subject<boolean>();
    private _statusChanges$: Subscription;
    private _defaultDropDownOverlaySettings: OverlaySettings;
    private _defaultDialogOverlaySettings: OverlaySettings = {};

    private _prevSelectedHour: string;
    private _prevSelectedMinute: string;
    private _prevSelectedSeconds: string;
    private _prevSelectedAmPm: string;

    private _ngControl: NgControl = null;
    private _onChangeCallback: (_: Date) => void = noop;
    private _onTouchedCallback: () => void = noop;
    private _onValidatorChange: () => void = noop;

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
    public get value(): Date {
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
    public set value(value: Date) {
        if (this.valueInRange(value, this.parseToDate(this.minValue), this.parseToDate(this.maxValue))) {
            const oldValue = this._value;
            this._value = value || null;
            this.dateTimeEditor.value = value || null;
            this._onChangeCallback(value);
            if (oldValue !== value) {
                this.emitValueChangedEvent(oldValue, value);
            }
        } else {
            this.emitValidationFailedEvent(value);
        }
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
     * An @Input property that gets/sets the delta by which hour and minute items would be changed <br>
     * when the user presses the Up/Down keys.
     * By default `itemsDelta` is set to `{hours: 1, minutes: 1, seconds: 1}`
     * ```html
     * <igx-time-picker [itemsDelta]="{hours:3, minutes:5, seconds:10}" id="time-picker"></igx-time-picker>
     * ```
     */
    @Input()
    public set itemsDelta(value) {
        this._itemsDelta = { hours: 1, minutes: 1, seconds: 1, ...value };
    }

    public get itemsDelta(): { hours: number; minutes: number; seconds: number } {
        return this._itemsDelta;
    }

    // /**
    //  * An @Input property that Gets/Sets format of time while `igxTimePicker` does not have focus. <br>
    //  * By default `format` is set to hh:mm tt. <br>
    //  * List of time-flags: <br>
    //  * `h` : hours field in 12-hours format without leading zero <br>
    //  * `hh` : hours field in 12-hours format with leading zero <br>
    //  * `H` : hours field in 24-hours format without leading zero <br>
    //  * `HH` : hours field in 24-hours format with leading zero <br>
    //  * `m` : minutes field without leading zero <br>
    //  * `mm` : minutes field with leading zero <br>
    //  * `s` : seconds field without leading zero <br>
    //  * `ss` : seconds field with leading zero <br>
    //  * `tt` : 2 character string which represents AM/PM field <br>
    //  * ```html
    //  * <igx-time-picker format="HH:m" id="time-picker"></igx-time-picker>
    //  * ```
    //  */
    // @Input()
    // public get format() {
    //     return this._format || 'hh:mm tt';
    // }

    // public set format(formatValue: string) {
    //     this._format = formatValue;
    //     this.mask = this._format.indexOf('tt') !== -1 ? '00:00:00 LL' : '00:00:00';

    //     if (!this.showHoursList || !this.showMinutesList) {
    //         this.trimMask();
    //     }

    //     if (!this.showSecondsList) {
    //         this.trimMask();
    //     }

    //     if (this.displayValue) {
    //         this.displayValue = this._formatTime(this.value, this._format);
    //     }

    //     this.determineCursorPos();
    // }

    constructor(
        public element: ElementRef,
        @Inject(LOCALE_ID) protected _localeId: string,
        @Optional() @Inject(DisplayDensityToken) protected _displayDensityOptions: IDisplayDensityOptions,
        @Optional() @Inject(IGX_INPUT_GROUP_TYPE) protected _inputGroupType: IgxInputGroupType,
        private _injector: Injector,
        private _cdr: ChangeDetectorRef) {
        super(element, _localeId, _displayDensityOptions, _inputGroupType);
    }

    // #region ControlValueAccessor

    /** @hidden @internal */
    public writeValue(value: Date) {
        this._value = value || null;
        this.updateInputValue(value);
    }

    /** @hidden @internal */
    public applyDisabledStyleForItem(period: string, value: string) {
        if (!this.minValue || !this.maxValue) {
            return false;
        }
        const minValueDate: Date = this.parseToDate(this.minValue);
        const maxValueDate: Date = this.parseToDate(this.maxValue);
        let hour: number = parseInt(this.selectedHour, 10);
        let minute: number = parseInt(this.selectedMinute, 10);
        let seconds: number = parseInt(this.selectedSeconds, 10);
        let amPM: string = this.selectedAmPm;
        const date = new Date(minValueDate);
        switch (period) {
            case TimeParts.Hour:
                hour = parseInt(value, 10);
                break;

            case TimeParts.Minute:
                minute = parseInt(value, 10);
                break;

            case TimeParts.Seconds:
                seconds = parseInt(value, 10);
                break;

            case TimeParts.AMPM:
                amPM = value;
                break;
        }

        if (amPM === 'PM') {
            hour += 12;
        }
        date.setHours(hour);
        date.setMinutes(minute);
        date.setSeconds(seconds);
        return date < minValueDate || date > maxValueDate;

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
    public registerOnValidatorChange(fn: any) {
        this._onValidatorChange = fn;
    }

    /** @hidden @internal */
    public validate(control: AbstractControl): ValidationErrors | null {
        const value = control.value;
        const errors = {};
        if (value && (this.minValue || this.maxValue)) {
            const minTime = this.parseToDate(this.minValue);
            const maxTime = this.parseToDate(this.maxValue);
            Object.assign(errors, DatePickerUtil.validateMinMax(value, minTime, maxTime, true, false));
        }

        return Object.keys(errors).length > 0 ? errors : null;
    }

    /** @hidden @internal */
    public setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    /** @hidden @internal */
    public updateInputValue(value: Date) {
        if (this.ngControl) {
            this.ngControl.control.setValue(value);
        } else {
            this.value = value;
        }
    }

    //#endregion

    /**
     * @hidden
     */
    public ngOnInit(): void {
        this._ngControl = this._injector.get<NgControl>(NgControl, null);

        this._defaultDropDownOverlaySettings = {
            target: this.element.nativeElement,
            modal: false,
            closeOnOutsideClick: true,
            scrollStrategy: new AbsoluteScrollStrategy(),
            positionStrategy: new AutoPositionStrategy()
        };
        this.overlaySettings = this.overlaySettings ? this.overlaySettings :
            (this.isDropdown ? this._defaultDropDownOverlaySettings : this._defaultDialogOverlaySettings);

        this.generateHours();
        this.generateMinutes();
        this.generateSeconds();
        if (this.displayFormat.indexOf('a') !== -1) {
            this.generateAmPm();
        }
    }

    /**
     * @hidden
     */
    public ngAfterViewInit(): void {
        this.attachOnKeydown();
        this.subscribeToDateEditorEvents();
        this.subscribeToToggleDirectiveEvents();
        if (this._ngControl) {
            this._statusChanges$ = this._ngControl.statusChanges.subscribe(this.onStatusChanged.bind(this));
        }
    }

    public ngAfterViewChecked() {
        // if one sets mode at run time this forces initialization of new igxInputGroup
        // As a result a new igxInputDirective is initialized too. In ngAfterViewInit of
        // the new directive isRequired of the igxInputGroup is set again. However
        // ngAfterViewInit of the time picker is not called again and we may finish with wrong
        // isRequired in igxInputGroup. This is why we should set it here, only when needed
        if (this._inputGroup && this._inputGroup.isRequired !== this.required) {
            this._inputGroup.isRequired = this.required;
            this._cdr.detectChanges();
        }
    }

    /** @hidden @internal */
    public ngOnChanges(changes: SimpleChanges): void {
        if (changes['locale']) {
            this.inputFormat = DatePickerUtil.getDefaultInputFormat(this.locale || 'en') || DatePickerUtil.DEFAULT_TIME_INPUT_FORMAT;
        }
        if (changes['displayFormat'] && this.dateTimeEditor) {
            this.dateTimeEditor.displayFormat = this.displayFormat;
        }
        if (changes['inputFormat'] && this.dateTimeEditor) {
            this.dateTimeEditor.inputFormat = this.inputFormat;
        }
    }

    /**
     * @hidden
     */
    public ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.complete();
        if (this._statusChanges$) {
            this._statusChanges$.unsubscribe();
        }
    }

    /**
     * @hidden
     */
    public getEditElement() {
        return this._inputElementRef ? this._inputElementRef.nativeElement : null;
    }

    /**
     * opens the drop down/dialog.
     *
     * @param settings OverlaySettings - the overlay settings to use for positioning the drop down container according to
     * ```html
     * <igx-time-picker [value]="date" mode="dropdown" #retemplated>
     *   <ng-template igxTimePickerTemplate let-openDialog="openDialog"
     *                let-displayTime="displayTime">
     *     <igx-input-group>
     *       <input igxInput [value]="displayTime" />
     *       <igx-suffix (click)="open()">
     *         <igx-icon>alarm</igx-icon>
     *       </igx-suffix>
     *     </igx-input-group>
     *   </ng-template>
     * </igx-time-picker>
     * ```
     */
    public open(settings?: OverlaySettings): void {
        if (this.disabled) {
            return;
        }

        if (!this.toggleRef.collapsed) {
            return this.handleContainerClosed();
        }
        settings = Object.assign({}, this.overlaySettings, settings);
        if (this.outlet) {
            settings.outlet = this.outlet;
        }

        this.toggleRef.open(settings);
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
            settings = Object.assign({}, this.overlaySettings, settings);
            this.open(settings);
        } else {
            this.close();
        }
    }

    /**
     * Scrolls an hour item into view.
     * ```typescript
     * scrhintoView(picker) {
     * picker.scrollHourIntoView('2');
     * }
     *  ```
     * ```html
     * <igx-time-picker #picker format="h:mm tt" (onOpened)="scrhintoView(picker)"></igx-time-picker>
     * ```
     *
     * @param item to be scrolled in view.
     */
    public scrollHourIntoView(item: string): void {
        if (this.showHoursList) {
            const hourIntoView = this._scrollItemIntoView(item, this._hourItems, this.selectedHour, this._isHourListLoop, 'hour');
            if (hourIntoView) {
                this._hourView = hourIntoView.view;
                this.selectedHour = hourIntoView.selectedItem;
                this.dateTimeEditor.value = this.getSelectedTime();
            }
        }
    }

    /**
     * Scrolls a minute item into view.
     * ```typescript
     * scrMintoView(picker) {
     * picker.scrollMinuteIntoView('3');
     * }
     *  ```
     * ```html
     * <igx-time-picker #picker format="h:mm tt" (onOpened)="scrMintoView(picker)"></igx-time-picker>
     * ```
     *
     * @param item to be scrolled in view.
     */
    public scrollMinuteIntoView(item: string): void {
        if (this.showMinutesList) {
            const minuteIntoView = this._scrollItemIntoView(item, this._minuteItems, this.selectedMinute, this._isMinuteListLoop, 'minute');
            if (minuteIntoView) {
                this._minuteView = minuteIntoView.view;
                this.selectedMinute = minuteIntoView.selectedItem;
                this.dateTimeEditor.value = this.getSelectedTime();
            }
        }
    }

    /**
     * Scrolls a seconds item into view.
     * ```typescript
     * scrMintoView(picker) {
     * picker.scrollSecondsIntoView('4');
     * }
     *  ```
     * ```html
     * <igx-time-picker #picker format="h:mm tt" (onOpened)="scrMintoView(picker)"></igx-time-picker>
     * ```
     *
     * @param item to be scrolled in view.
     */
    public scrollSecondsIntoView(item: string): void {
        if (this.showSecondsList) {
            const secondsIntoView = this._scrollItemIntoView(item,
                this._secondsItems, this.selectedSeconds, this._isSecondsListLoop, 'seconds');
            if (secondsIntoView) {
                this._secondsView = secondsIntoView.view;
                this.selectedSeconds = secondsIntoView.selectedItem;
                this.dateTimeEditor.value = this.getSelectedTime();
            }
        }
    }

    /**
     * Scrolls an ampm item into view.
     * ```typescript
     * scrAmPmIntoView(picker) {
     * picker.scrollAmPmIntoView('PM');
     * }
     *  ```
     * ```html
     * <igx-time-picker #picker format="h:mm tt" (onOpened)="scrAmPmIntoView(picker)"></igx-time-picker>
     * ```
     *
     * @param item to be scrolled in view.
     */
    public scrollAmPmIntoView(item: string): void {
        if (this.showAmPmList) {
            const ampmIntoView = this._scrollItemIntoView(item, this._ampmItems, this.selectedAmPm, false, null);
            if (ampmIntoView) {
                this._ampmView = ampmIntoView.view;
                this.selectedAmPm = ampmIntoView.selectedItem;
                this.dateTimeEditor.value = this.getSelectedTime();
            }
        }
    }

    /**
     * @hidden
     */
    public nextHour() {
        const nextHour = this._nextItem(this._hourItems, this.selectedHour, this._isHourListLoop, 'hour');
        this._hourView = nextHour.view;
        this.selectedHour = nextHour.selectedItem;

        this.dateTimeEditor.value = this.getSelectedTime();
    }

    /**
     * @hidden
     */
    public prevHour() {
        const prevHour = this._prevItem(this._hourItems, this.selectedHour, this._isHourListLoop, 'hour');
        this._hourView = prevHour.view;
        this.selectedHour = prevHour.selectedItem;
        this.dateTimeEditor.value = this.getSelectedTime();
    }

    /**
     * @hidden
     */
    public nextMinute() {
        const nextMinute = this._nextItem(this._minuteItems, this.selectedMinute, this._isMinuteListLoop, 'minute');
        this._minuteView = nextMinute.view;
        this.selectedMinute = nextMinute.selectedItem;
        this.dateTimeEditor.value = this.getSelectedTime();
    }

    /**
     * @hidden
     */
    public prevMinute() {
        const prevMinute = this._prevItem(this._minuteItems, this.selectedMinute, this._isMinuteListLoop, 'minute');
        this._minuteView = prevMinute.view;
        this.selectedMinute = prevMinute.selectedItem;
        this.dateTimeEditor.value = this.getSelectedTime();
    }

    /**
     * @hidden
     */
    public nextSeconds() {
        const nextSeconds = this._nextItem(this._secondsItems, this.selectedSeconds, this._isSecondsListLoop, 'seconds');
        this._secondsView = nextSeconds.view;
        this.selectedSeconds = nextSeconds.selectedItem;
        this.dateTimeEditor.value = this.getSelectedTime();
    }

    /**
     * @hidden
     */
    public prevSeconds() {
        const prevSeconds = this._prevItem(this._secondsItems, this.selectedSeconds, this._isSecondsListLoop, 'seconds');
        this._secondsView = prevSeconds.view;
        this.selectedSeconds = prevSeconds.selectedItem;
        this.dateTimeEditor.value = this.getSelectedTime();
    }

    /**
     * @hidden
     */
    public nextAmPm() {
        const selectedIndex = this._ampmItems.indexOf(this.selectedAmPm);

        if (selectedIndex + 1 < this._ampmItems.length - 3) {
            this._updateAmPmView(selectedIndex - 2, selectedIndex + 5);
            this.selectedAmPm = this._ampmItems[selectedIndex + 1];
            this.dateTimeEditor.value = this.getSelectedTime();
        }
    }

    /**
     * @hidden
     */
    public prevAmPm() {
        const selectedIndex = this._ampmItems.indexOf(this.selectedAmPm);

        if (selectedIndex > 3) {
            this._updateAmPmView(selectedIndex - 4, selectedIndex + 3);
            this.selectedAmPm = this._ampmItems[selectedIndex - 1];
            this.dateTimeEditor.value = this.getSelectedTime();
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
    public select(date: Date): void {
        if (this.shouldCancelSelecting()) {
            return;
        }

        if (!date) {
            this.clear();
        } else {
            const oldValue = new Date(this.value);
            if (this.value.getTime() === oldValue?.getTime()) {
                this.value = date;
            }
        }

        this.selected.emit(date);

        if (!this.valueInRange(date, this.parseToDate(this.minValue), this.parseToDate(this.maxValue))) {
            this.emitValidationFailedEvent(date);
        }
    }

    /**
     * If current value is valid selects it, closes the dialog and returns true, otherwise returns false.
     * ```html
     * <igx-dialog class="igx-time-picker__dialog-popup" [rightButtonLabel]="okButtonLabel" (onRightButtonSelect)="okButtonClick()">
     * //..
     * </igx-dialog>
     * ```
     */
    public okButtonClick(): boolean {
        const selectedValue = this.getSelectedTime();

        if (this.value.getTime() === selectedValue.getTime()) {
            return;
        }

        if (this.valueInRange(selectedValue, this.parseToDate(this.minValue), this.parseToDate(this.maxValue))) {
            this.close();
            this.value = selectedValue;
            return true;
        } else {
            this.emitValidationFailedEvent(selectedValue, true);
            this.dateTimeEditor.value = this.value;
            return false;
        }
    }

    /**
     * Closes the dialog without selecting the current value.
     * ```html
     * <igx-dialog class="igx-time-picker__dialog-popup" [leftButtonLabel]="cancelButtonLabel" (onLeftButtonSelect)="cancelButtonClick()">
     * //...
     * </igx-dialog>
     * ```
     */
    public cancelButtonClick(): void {
        if (this.isDropdown) {
            this.dateTimeEditor.value = this.value;
        }

        this.close();

        this.selectedHour = this._prevSelectedHour;
        this.selectedMinute = this._prevSelectedMinute;
        this.selectedSeconds = this._prevSelectedSeconds;
        this.selectedAmPm = this._prevSelectedAmPm;
    }

    /**
    * Increment specified TimePart.
    *
    * @param datePart The optional DatePart to increment. Defaults to Hours.
    */
    public increment(datePart?: DatePart): void {
        const timePart = datePart ? datePart : DatePart.Hours;
        this.spin(timePart);
    }

    /**
    * Decrement specified TimePart.
    *
    * @param datePart The optional DatePart to decrement. Defaults to Hours.
    */
    public decrement(datePart?: DatePart): void {
        const timePart = datePart ? datePart : DatePart.Hours;
        this.spin(timePart, -1);
    }

    /**
     * @hidden
     */
    public spinOnEdit(event): void {
        let sign: number;

        if (event.key) {
            const key = event.key;
            sign = key === KEYS.DOWN_ARROW || key === KEYS.DOWN_ARROW_IE ? -1 : 1;
        }

        if (event.deltaY) {
            sign = event.deltaY < 0 ? 1 : -1;
        }

        this.spin(this.dateTimeEditor.targetDatePart, sign);
    }

    /**
     * Returns an array of the hours currently in view.
     * ```html
     *  @ViewChild("MyChild")
     * private picker: IgxTimePickerComponent;
     * ngAfterViewInit(){
     *     let hInView = this.picker.hoursInView;
     * }
     * ```
     */
    public hoursInView(): string[] {
        return this._hourView.filter((hour) => hour !== '');
    }

    /**
     * Returns an array of the minutes currently in view.
     * ```html
     *  @ViewChild("MyChild")
     * private picker: IgxTimePickerComponent;
     * ngAfterViewInit(){
     *     let minInView = this.picker.minutesInView;
     * }
     * ```
     */
    public minutesInView(): string[] {
        return this._minuteView.filter((minute) => minute !== '');
    }

    /**
     * Returns an array of the seconds currently in view.
     * ```html
     *  @ViewChild("MyChild")
     * private picker: IgxTimePickerComponent;
     * ngAfterViewInit(){
     *     let minInView = this.picker.secondsInView;
     * }
     * ```
     */
    public secondsInView(): string[] {
        return this._secondsView.filter((seconds) => seconds !== '');
    }

    /**
     * Returns an array of the AM/PM currently in view.
     * ```html
     *  @ViewChild("MyChild")
     * private picker: IgxTimePickerComponent;
     * ngAfterViewInit(){
     *     let ApInView = this.picker.ampmInView;
     * }
     * ```
     */
    public ampmInView(): string[] {
        return this._ampmView.filter((ampm) => ampm !== '');
    }

    /**
     * @hidden
     */
    public clear(): void {
        if (this.disabled) {
            return;
        }
        if (this.toggleRef.collapsed) {
            const oldValue = new Date(this.value);
            this.value.setHours(0, 0, 0);
            this.dateTimeEditor.value = new Date(this.value);
            if (oldValue.getTime() !== this.value?.getTime()) {
                this.emitValueChangedEvent(oldValue, this.value);
            }
        } else {
            this.close();
        }
    }

    /**
     * @hidden
     */
    public handleBlur(event): void {
        if (this.isDropdown) {
            const inputValue = event.target.value;

            if (!inputValue) {
                this.clear();
                return;
            }

            this.dateTimeEditor.value.setFullYear(this.value.getFullYear(), this.value.getMonth(), this.value.getDate());
            const newValue = this.dateTimeEditor.value;

            if (this.value.getTime() === newValue.getTime()) {
                return;
            }

            const minDate: Date = this.parseToDate(this.minValue);
            const maxDate: Date = this.parseToDate(this.maxValue);

            if (this.valueInRange(newValue, minDate, maxDate)) {
                this.value = newValue;
            } else {
                this.emitValidationFailedEvent(inputValue);
            }
        }

        if (this.toggleRef.collapsed) {
            this.updateValidityOnBlur();
        }
    }

    /** @hidden @internal */
    public onKeyDown(event: KeyboardEvent): void {
        switch (event.key) {
            case KEYS.UP_ARROW:
            case KEYS.UP_ARROW_IE:
                if (event.altKey) {
                    this.close();
                }
                else {
                    this.spinOnEdit(event);
                }
                break;
            case KEYS.DOWN_ARROW:
            case KEYS.DOWN_ARROW_IE:
                if (event.altKey) {
                    this.open();
                }
                else {
                    this.spinOnEdit(event);
                }
                break;
            case KEYS.ESCAPE:
            case KEYS.ESCAPE_IE:
                this.cancelButtonClick();
                break;
            case KEYS.SPACE:
            case KEYS.SPACE_IE:
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

    private spin(datePart: DatePart, sign: number = 1): void {
        const currentVal = new Date(this.value);
        const min = this.minValue ? this.parseToDate(this.minValue) : this.parseToDate('00:00');
        const max = this.maxValue ? this.parseToDate(this.maxValue) : this.parseToDate('24:00');

        switch (datePart) {
            case DatePart.Hours:
                const hDelta = this.itemsDelta.hours * 60 + (sign * this.value.getMinutes());
                this.value = this.spinHours(currentVal, min, max, hDelta, sign);
                break;
            case DatePart.Minutes:
                const mDelta = this.itemsDelta.minutes;
                this.value = this.spinMinutes(currentVal, mDelta, sign);
                break;
            case DatePart.Seconds:
                const sDelta = this.itemsDelta.seconds;
                this.value = this.spinSeconds(currentVal, sDelta, sign);
                break;
            case DatePart.AmPm:
                if (this.valueInRange(currentVal, min, max)) {
                    this.value = currentVal;
                }
                break;
        }
    }

    private spinHours(currentVal: Date, minVal: Date, maxVal: Date, hDelta: number, sign: number): Date {
        const oldVal = new Date(currentVal);

        currentVal.setMinutes(sign * hDelta);
        if (currentVal.getDate() !== oldVal.getDate() && this.spinLoop) {
            currentVal.setDate(oldVal.getDate());
        }

        let minutes = currentVal.getMinutes();
        if (currentVal.getTime() > maxVal?.getTime()) {
            if (this.spinLoop) {
                minutes = minutes < minVal.getMinutes() ? 60 + minutes : minutes;
                minVal.setMinutes(sign * minutes);
                return minVal;
            } else {
                return oldVal;
            }
        } else if (currentVal.getTime() < minVal?.getTime()) {
            if (this.spinLoop) {
                minutes = minutes <= maxVal.getMinutes() ? minutes : minutes - 60;
                maxVal.setMinutes(minutes);
                return maxVal;
            } else {
                return oldVal;
            }
        } else {
            return currentVal;
        }
    }

    private spinMinutes(currentVal: Date, mDelta: number, sign: number) {
        let minutes = currentVal.getMinutes() + (sign * mDelta);

        if (minutes < 0 || minutes >= 60) {
            minutes = this.spinLoop ? minutes - (sign * 60) : currentVal.getMinutes();
        }

        currentVal.setMinutes(minutes);
        return currentVal;
    }

    private spinSeconds(currentVal: Date, sDelta: number, sign: number) {
        let seconds = currentVal.getSeconds() + (sign * sDelta);

        if (seconds < 0 || seconds >= 60) {
            seconds = this.spinLoop ? seconds - (sign * 60) : currentVal.getSeconds();
        }

        currentVal.setSeconds(seconds);
        return currentVal;
    }

    private _scrollItemIntoView(item: string, items: any[], selectedItem: string, isListLoop: boolean, viewType: string): any {
        let itemIntoView;
        if (items) {
            const index = (item === 'AM' || item === 'PM') ? items.indexOf(item) : items.indexOf(parseInt(item, 10));
            let view;

            if (index !== -1) {
                if (isListLoop) {
                    if (index > 0) {
                        selectedItem = this._itemToString(items[index - 1], viewType);
                        itemIntoView = this._nextItem(items, selectedItem, isListLoop, viewType);
                    } else {
                        selectedItem = this._itemToString(items[1], viewType);
                        itemIntoView = this._prevItem(items, selectedItem, isListLoop, viewType);
                    }
                } else {
                    view = items.slice(index - 3, index + 4);
                    selectedItem = this._itemToString(items[index], viewType);
                    itemIntoView = { selectedItem, view };
                }
                itemIntoView.view = this._viewToString(itemIntoView.view, viewType);
            }
        }
        return itemIntoView;
    }

    private _viewToString(view: any, viewType: string): any {
        for (let i = 0; i < view.length; i++) {
            if (typeof (view[i]) !== 'string') {
                view[i] = this._itemToString(view[i], viewType);
            }
        }
        return view;
    }

    private _itemToString(item: any, viewType: string): string {
        if (item === null) {
            item = '';
        } else if (viewType && typeof (item) !== 'string') {
            const leadZeroHour = (item < 10 && (this.displayFormat.indexOf('hh') !== -1 || this.displayFormat.indexOf('HH') !== -1));
            const leadZeroMinute = (item < 10 && this.displayFormat.indexOf('mm') !== -1);
            const leadZeroSeconds = (item < 10 && this.displayFormat.indexOf('ss') !== -1);

            const leadZero = {
                hour: leadZeroHour,
                minute: leadZeroMinute,
                seconds: leadZeroSeconds
            }[viewType];

            item = (leadZero) ? '0' + item : `${item}`;
        }
        return item;
    }

    private _prevItem(items: any[], selectedItem: string, isListLoop: boolean, viewType: string): any {
        const selectedIndex = items.indexOf(parseInt(selectedItem, 10));
        const itemsCount = items.length;
        let view;

        if (selectedIndex === -1) {
            view = items.slice(0, 7);
            selectedItem = items[3];
        } else if (isListLoop) {
            if (selectedIndex - 4 < 0) {
                view = items.slice(itemsCount - (4 - selectedIndex), itemsCount);
                view = view.concat(items.slice(0, selectedIndex + 3));
            } else if (selectedIndex + 4 > itemsCount) {
                view = items.slice(selectedIndex - 4, itemsCount);
                view = view.concat(items.slice(0, selectedIndex + 3 - itemsCount));
            } else {
                view = items.slice(selectedIndex - 4, selectedIndex + 3);
            }

            selectedItem = (selectedIndex === 0) ? items[itemsCount - 1] : items[selectedIndex - 1];
        } else if (selectedIndex > 3) {
            view = items.slice(selectedIndex - 4, selectedIndex + 3);
            selectedItem = items[selectedIndex - 1];
        } else if (selectedIndex === 3) {
            view = items.slice(0, 7);
        }
        view = this._viewToString(view, viewType);
        selectedItem = this._itemToString(selectedItem, viewType);
        return {
            selectedItem,
            view
        };
    }

    private _nextItem(items: any[], selectedItem: string, isListLoop: boolean, viewType: string): any {
        const selectedIndex = items.indexOf(parseInt(selectedItem, 10));
        const itemsCount = items.length;
        let view;

        if (selectedIndex === -1) {
            view = items.slice(0, 7);
            selectedItem = items[3];
        } else if (isListLoop) {
            if (selectedIndex < 2) {
                view = items.slice(itemsCount - (2 - selectedIndex), itemsCount);
                view = view.concat(items.slice(0, selectedIndex + 5));
            } else if (selectedIndex + 4 >= itemsCount) {
                view = items.slice(selectedIndex - 2, itemsCount);
                view = view.concat(items.slice(0, selectedIndex + 5 - itemsCount));
            } else {
                view = items.slice(selectedIndex - 2, selectedIndex + 5);
            }

            selectedItem = (selectedIndex === itemsCount - 1) ? items[0] : items[selectedIndex + 1];
        } else if (selectedIndex + 1 < itemsCount - 3) {
            view = items.slice(selectedIndex - 2, selectedIndex + 5);
            selectedItem = items[selectedIndex + 1];
        } else if (selectedIndex === itemsCount - 4) {
            view = items.slice(selectedIndex - 3, itemsCount);
        }
        view = this._viewToString(view, viewType);
        selectedItem = this._itemToString(selectedItem, viewType);
        return {
            selectedItem,
            view
        };
    }

    private _updateHourView(start: any, end: any): void {
        this._hourView = this._viewToString(this._hourItems.slice(start, end), 'hour');
    }

    private _updateMinuteView(start: any, end: any): void {
        this._minuteView = this._viewToString(this._minuteItems.slice(start, end), 'minute');
    }

    private _updateSecondsView(start: any, end: any): void {
        this._secondsView = this._viewToString(this._secondsItems.slice(start, end), 'seconds');
    }

    private _updateAmPmView(start: any, end: any): void {
        this._ampmView = this._ampmItems.slice(start, end);
    }

    private addEmptyItems(items: string[]): void {
        for (let i = 0; i < 3; i++) {
            items.push(null);
        }
    }

    private generateHours(): void {
        let hoursCount = this.displayFormat.indexOf('H') >= 0 ? 24 : 13;
        hoursCount /= this.itemsDelta.hours;
        let hourIndex = this.displayFormat.indexOf('H') >= 0 ? 0 : 1;

        if (hoursCount < 7 || !this.spinLoop) {
            this.addEmptyItems(this._hourItems);
            this._isHourListLoop = false;
        }

        if (hoursCount > 1) {
            for (hourIndex; hourIndex < hoursCount; hourIndex++) {
                this._hourItems.push(hourIndex * this.itemsDelta.hours);
            }
        } else {
            this._hourItems.push(0);
        }

        if (hoursCount < 7 || !this.spinLoop) {
            this.addEmptyItems(this._hourItems);
        }
    }

    private generateMinutes(): void {
        const minuteItemsCount = 60 / this.itemsDelta.minutes;

        if (minuteItemsCount < 7 || !this.spinLoop) {
            this.addEmptyItems(this._minuteItems);
            this._isMinuteListLoop = false;
        }

        for (let i = 0; i < minuteItemsCount; i++) {
            this._minuteItems.push(i * this.itemsDelta.minutes);
        }

        if (minuteItemsCount < 7 || !this.spinLoop) {
            this.addEmptyItems(this._minuteItems);
        }
    }

    private generateSeconds(): void {
        const secondsItemsCount = 60 / this.itemsDelta.seconds;

        if (secondsItemsCount < 7 || !this.spinLoop) {
            this.addEmptyItems(this._secondsItems);
            this._isSecondsListLoop = false;
        }

        for (let i = 0; i < secondsItemsCount; i++) {
            this._secondsItems.push(i * this.itemsDelta.seconds);
        }

        if (secondsItemsCount < 7 || !this.spinLoop) {
            this.addEmptyItems(this._secondsItems);
        }
    }

    private generateAmPm(): void {

        this.addEmptyItems(this._ampmItems);

        this._ampmItems.push('AM');
        this._ampmItems.push('PM');

        this.addEmptyItems(this._ampmItems);
    }

    private getSelectedTime(): Date {
        const date = this.value ? new Date(this.value) : new Date();
        if (this.selectedHour) {
            date.setHours(parseInt(this.selectedHour, 10));
        }
        if (this.selectedMinute) {
            date.setMinutes(parseInt(this.selectedMinute, 10));
        }
        if (this.selectedSeconds) {
            date.setSeconds(parseInt(this.selectedSeconds, 10));
        }
        if (((this.showHoursList && this.selectedHour !== '12') || (!this.showHoursList && this.selectedHour <= '11')) &&
            this.selectedAmPm === 'PM') {
            date.setHours(date.getHours() + 12);
        }
        if (!this.showHoursList && this.selectedAmPm === 'AM' && this.selectedHour > '11') {
            date.setHours(date.getHours() - 12);
        }
        if (this.selectedAmPm === 'AM' && this.selectedHour === '12') {
            date.setHours(0);
        }
        return date;
    }

    private initializeContainer() {
        this.selectedHour = this.value ? this.parseHours(this.value, this.displayFormat) :
            this.showHoursList ? `${this._hourItems[3]}` : '0';
        this.selectedMinute = this.value ? this.parseMinutes(this.value, this.displayFormat) : '0';
        this.selectedSeconds = this.value ? this.parseSeconds(this.value, this.displayFormat) : '0';
        this.selectedAmPm = this.value && this._ampmItems !== null ? this.parseAMPM(this.value, this.displayFormat) : this._ampmItems[3];

        this._prevSelectedHour = this.selectedHour;
        this._prevSelectedMinute = this.selectedMinute;
        this._prevSelectedSeconds = this.selectedSeconds;
        this._prevSelectedAmPm = this.selectedAmPm;

        this._onTouchedCallback();

        this._updateHourView(0, ITEMS_COUNT);
        this._updateMinuteView(0, ITEMS_COUNT);
        this._updateSecondsView(0, ITEMS_COUNT);
        this._updateAmPmView(0, ITEMS_COUNT);

        if (this.selectedHour) {
            this.scrollHourIntoView(this.selectedHour);
        }
        if (this.selectedMinute) {
            this.scrollMinuteIntoView(this.selectedMinute);
        }
        if (this.selectedSeconds) {
            this.scrollSecondsIntoView(this.selectedSeconds);
        }
        if (this.selectedAmPm) {
            this.scrollAmPmIntoView(this.selectedAmPm);
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

    private parseHours(value: Date, format: string): string {
        let hour = value.getHours();
        let formattedHour;

        if (format.indexOf('h') !== -1) {
            hour = hour % 12;
            hour = hour ? hour : 12; // the hour '0' should be '12'
            formattedHour = hour < 10 && format.indexOf('hh') !== -1 ? '0' + hour : `${hour}`;
        } else {
            formattedHour = hour < 10 && format.indexOf('HH') !== -1 ? '0' + hour : `${hour}`;
        }

        return formattedHour;
    }

    private parseMinutes(value: Date, format: string): string {
        const minutes = value.getMinutes();
        const formattedMinutes = minutes < 10 && format.indexOf('mm') !== -1 ? '0' + minutes : `${minutes}`;
        return formattedMinutes;
    }

    private parseSeconds(value: Date, format: string): string {
        const seconds = value.getSeconds();
        const formattedSeconds = seconds < 10 && format.indexOf('ss') !== -1 ? '0' + seconds : `${seconds}`;
        return formattedSeconds;
    }

    private parseAMPM(value: Date, format: string): string {
        let hour = value.getHours();
        const ampm = hour >= 12 ? 'PM' : 'AM';
        return ampm;
    }

    private handleContainerClosed(): void {
        const newValue = this.dateTimeEditor.value;
        const minDate: Date = this.parseToDate(this.minValue);
        const maxDate: Date = this.parseToDate(this.maxValue);

        if (this.value.getTime() === newValue.getTime()) {
            return;
        }

        if (this.valueInRange(newValue, minDate, maxDate)) {
            this.value = newValue;
        } else {
            this.emitValidationFailedEvent(newValue, true);
        }
    }

    private shouldCancelSelecting(): boolean {
        const args: IBaseCancelableBrowserEventArgs = { owner: this, cancel: false };
        this.selecting.emit(args);
        return args.cancel;
    }

    private emitValueChangedEvent(oldValue: Date, newValue: Date) {
        const args: IgxTimePickerValueChangedEventArgs = {
            oldValue: oldValue,
            newValue: newValue
        };
        this.valueChange.emit(args);
    }

    private emitValidationFailedEvent(currentValue: Date, setThroughUI = false) {
        const args: IgxTimePickerValidationFailedEventArgs = {
            timePicker: this,
            currentValue: currentValue,
            setThroughUI: setThroughUI
        };
        this.validationFailed.emit(args);
    }

    private updateValidityOnBlur() {
        this._onTouchedCallback();
        if (this.inputDirective && this._ngControl) {
            if (!this._ngControl.valid) {
                this.inputDirective.valid = IgxInputState.INVALID;
            } else {
                this.inputDirective.valid = IgxInputState.INITIAL;
            }
        }
    }

    private valueInRange(value: Date, minValue?: Date, maxValue?: Date): boolean {
        if (!value) {
            return true;
        }
        if (minValue && DatePickerUtil.lessThanMinValue(value, minValue, true, false)) {
            return false;
        }
        if (maxValue && DatePickerUtil.greaterThanMaxValue(value, maxValue, true, false)) {
            return false;
        }

        return true;
    }

    private parseToDate(value: any): Date {
        if (!value) {
            return;
        }

        const date = DatePickerUtil.isDate(value) ? value : this.dateTimeEditor.parseDate(value);
        return date;
    }

    private attachOnKeydown(): void {
        fromEvent(this.element.nativeElement, 'keydown')
            .pipe(takeUntil(this.destroy$))
            .subscribe((evt: KeyboardEvent) => this.onKeyDown(evt));
    }

    private subscribeToDateEditorEvents(): void {
        fromEvent(this.dateTimeEditor.nativeElement, 'blur')
            .pipe(takeUntil(this.destroy$))
            .subscribe((event) => {
                this.handleBlur(event);
            });

        fromEvent(this.dateTimeEditor.nativeElement, 'wheel')
            .pipe(takeUntil(this.destroy$))
            .subscribe((event) => {
                this.spinOnEdit(event);
            });

        // this.dateTimeEditor.valueChange.pipe(
        //     takeUntil(this.destroy$)).subscribe(newValue => {
        //         this.emitValueChangedEvent(this.value, newValue)
        //         this.value = newValue;
        //     });

        // this.dateTimeEditor.validationFailed.pipe(
        //     takeUntil(this.destroy$)).subscribe(() => {
        //         this.validationFailed.emit({
        //             timePicker: this,
        //             currentValue: this.value,
        //             setThroughUI: true
        //         });
        //     });
    }

    private subscribeToToggleDirectiveEvents(): void {
        if (this.toggleRef) {
            if (this._inputGroup) {
                this.toggleRef.element.style.width = this._inputGroup.element.nativeElement.getBoundingClientRect().width + 'px';
            }

            const args: IBaseEventArgs = {
                owner: this
            };

            this.toggleRef.onOpening.pipe(takeUntil(this.destroy$)).subscribe((event) => {
                this.opening.emit(event);
                if (event.cancel) {
                    return;
                }
            });

            this.toggleRef.onOpened.pipe(takeUntil(this.destroy$)).subscribe(() => {
                this.opened.emit(args);
            });

            this.toggleRef.onClosed.pipe(takeUntil(this.destroy$)).subscribe(() => {
                this.handleContainerClosed();
                this.closed.emit(args);
            });

            this.toggleRef.onClosing.pipe(takeUntil(this.destroy$)).subscribe((event) => {
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
        IgxHourItemDirective,
        IgxMinuteItemDirective,
        IgxSecondsItemDirective,
        IgxItemListDirective,
        IgxAmPmItemDirective,
        IgxTimePickerTemplateDirective,
        IgxTimePickerActionsDirective
    ],
    exports: [
        IgxTimePickerComponent,
        IgxTimePickerTemplateDirective,
        IgxTimePickerActionsDirective,
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
