import {
    CommonModule
} from '@angular/common';
import {
    Component,
    ElementRef,
    EventEmitter,
    HostBinding,
    HostListener,
    Input,
    NgModule,
    OnDestroy,
    OnInit,
    Output,
    TemplateRef,
    ViewChild,
    ContentChild,
    Injectable,
    AfterViewInit,
    Injector,
    ChangeDetectorRef,
    AfterViewChecked
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl, AbstractControl } from '@angular/forms';
import { HAMMER_GESTURE_CONFIG, HammerGestureConfig } from '@angular/platform-browser';
import { IgxIconModule } from '../icon/public_api';
import { IgxInputGroupModule, IgxInputGroupComponent } from '../input-group/input-group.component';
import { IgxInputDirective, IgxInputState } from '../directives/input/input.directive';
import {
    IgxAmPmItemDirective,
    IgxHourItemDirective,
    IgxMinuteItemDirective,
    IgxSecondsItemDirective,
    IgxItemListDirective,
    IgxTimePickerTemplateDirective,
    IgxTimePickerActionsDirective
} from './time-picker.directives';
import { Subject, fromEvent, interval, animationFrameScheduler, Subscription, noop } from 'rxjs';
import { EditorProvider } from '../core/edit-provider';
import { IgxTimePickerBase, IGX_TIME_PICKER_COMPONENT, TimeParts } from './time-picker.common';
import { AbsoluteScrollStrategy } from '../services/overlay/scroll';
import { AutoPositionStrategy } from '../services/overlay/position';
import { OverlaySettings } from '../services/overlay/utilities';
import { takeUntil, throttle } from 'rxjs/operators';
import { IgxButtonModule } from '../directives/button/button.directive';
import { IgxMaskModule } from '../directives/mask/mask.directive';
import { IgxOverlayOutletDirective, IgxToggleModule, IgxToggleDirective } from '../directives/toggle/toggle.directive';
import { TimeDisplayFormatPipe, TimeInputFormatPipe } from './time-picker.pipes';
import { ITimePickerResourceStrings } from '../core/i18n/time-picker-resources';
import { CurrentResourceStrings } from '../core/i18n/resources';
import { IBaseEventArgs, IBaseCancelableBrowserEventArgs, PlatformUtil } from '../core/utils';
import { InteractionMode } from '../core/enums';
import { IgxTextSelectionModule } from '../directives/text-selection/text-selection.directive';
import { IgxLabelDirective } from '../directives/label/label.directive';


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
export class IgxTimePickerComponent implements
    IgxTimePickerBase,
    ControlValueAccessor,
    EditorProvider,
    OnInit,
    OnDestroy,
    AfterViewInit,
    AfterViewChecked {

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
     * An @Input property that allows you to disable the `igx-time-picker` component. By default `disabled` is set to false.
     * ```html
     * <igx-time-picker [disabled]="'true'" [vertical]="true" format="h:mm tt" ></igx-time-picker>
     * ```
     */
    @Input()
    public disabled = false;

    /**
     * An @Input property that allows you to set the `minValue` to limit the user input.
     * ```html
     * public min: string = "09:00";
     *  //..
     * <igx-time-picker format="HH:mm" [vertical]="true" [minValue]="min"></igx-time-picker>
     * ```
     */
    @Input()
    public minValue: string;

    /**
     * An @Input property that allows you to set the `maxValue` to limit the user input.
     * ```html
     * public max: string = "18:00";
     *  //..
     * <igx-time-picker format="HH:mm" [vertical]="true" [maxValue]="max"></igx-time-picker>
     * ```
     */
    @Input()
    public maxValue: string;

    /**
     * An @Input property that determines the spin behavior. By default `isSpinLoop` is set to true.
     * The seconds, minutes and hour spinning will wrap around by default.
     * ```html
     * <igx-time-picker [isSpinLoop]="false" id="time-picker"></igx-time-picker>
     * ```
     */
    @Input()
    public isSpinLoop = true;

    /**
     * An @Input property that Gets/Sets the orientation of the `igxTimePicker`. By default `vertical` is set to false.
     * ```html
     * <igx-time-picker [vertical]="true" id="time-picker"></igx-time-picker>
     * ```
     */
    @Input()
    public vertical = false;

    /**
     * Sets the character used to prompt the user for input.
     * Default value is "'-'".
     * ```html
     * <igx-time-picker [promptChar] = "'_'">
     * ```
     *
     * @memberof IgxTimePickerComponent
     */
    @Input()
    public promptChar = '-';

    /**
     * An @Input property that allows you to switch the interaction mode between
     * a dialog picker or dropdown with editable masked input.
     * Deafult is dialog picker.
     * ```html
     * public mode = InteractionMode.DROPDOWN;
     *  //..
     * <igx-time-picker [mode]="mode"></igx-time-picker>
     * ```
     *
     * @memberof IgxTimePickerComponent
     */
    @Input()
    public mode: InteractionMode = InteractionMode.Dialog;

    /**
     * Determines the container the popup element should be attached to.
     *
     * ```html
     * <div igxOverlayOutlet #outlet="overlay-outlet"></div>
     * //..
     * <igx-time-picker [outlet]="outlet"></igx-time-picker>
     * //..
     * ```
     * Where `outlet` is an instance of `IgxOverlayOutletDirective` or an `ElementRef`.
     */
    @Input()
    public outlet: IgxOverlayOutletDirective | ElementRef;

    /**
     * Emitted when selection is made. The event contains the selected value. Returns {`oldValue`: `Date`, `newValue`: `Date`}.
     * ```typescript
     *  @ViewChild("toast")
     * private toast: IgxToastComponent;
     * public onValueChanged(timepicker){
     *     this.toast.open()
     * }
     *  //...
     *  ```
     *  ```html
     * <igx-time-picker (onValueChanged)="onValueChanged($event)"></igx-time-picker>
     * <igx-toast #toast message="The value has been changed!"></igx-toast>
     * ```
     */
    @Output()
    public onValueChanged = new EventEmitter<IgxTimePickerValueChangedEventArgs>();

    /**
     * Emitted when an invalid value is being set. Returns {`timePicker`: `any`, `currentValue`: `Date`, `setThroughUI`: `boolean`}
     * ```typescript
     * public min: string = "09:00";
     * public max: string = "18:00";
     *  @ViewChild("toast")
     * private toast: IgxToastComponent;
     * public onValidationFailed(timepicker){
     *     this.toast.open();
     * }
     *  //...
     *  ```
     *  ```html
     * <igx-time-picker [minValue]="min" [maxValue]="max" (onValidationFailed)="onValidationFailed($event)"></igx-time-picker>
     * <igx-toast #toast message="Value must be between 09:00 and 18:00!"></igx-toast>
     * ```
     */
    @Output()
    public onValidationFailed = new EventEmitter<IgxTimePickerValidationFailedEventArgs>();

    /**
     * Emitted when a timePicker is opened.
     */
    @Output()
    public onOpened = new EventEmitter<IgxTimePickerComponent>();

    /**
     * Emitted when a timePicker is closed.
     */
    @Output()
    public onClosed = new EventEmitter<IgxTimePickerComponent>();

    /**
     * Emitted when a timePicker is being closed.
     */
    @Output()
    public onClosing = new EventEmitter<IBaseCancelableBrowserEventArgs>();

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
     * @hidden
     */
    @ContentChild(IgxTimePickerActionsDirective, { read: IgxTimePickerActionsDirective })
    public timePickerActionsDirective: IgxTimePickerActionsDirective;

    /**
     * @hidden @internal
     */
    @ContentChild(IgxLabelDirective)
    public labelDirective: IgxLabelDirective;

    /**
     * @hidden
     */
    @ViewChild(IgxToggleDirective, { static: true })
    public toggleRef: IgxToggleDirective;

    /*
     * @hidden
     */
    @ViewChild('defaultTimePickerTemplate', { read: TemplateRef, static: true })
    protected defaultTimePickerTemplate: TemplateRef<any>;

    /**
     * @hidden
     */
    @ContentChild(IgxTimePickerTemplateDirective, { read: IgxTimePickerTemplateDirective })
    protected timePickerTemplateDirective: IgxTimePickerTemplateDirective;

    @ViewChild('dropdownInputTemplate', { read: TemplateRef, static: true })
    private dropdownInputTemplate: TemplateRef<any>;

    @ViewChild(IgxInputDirective, { read: ElementRef })
    private _inputElementRef: ElementRef;

    @ViewChild(IgxInputDirective, { read: IgxInputDirective })
    private _inputDirective: IgxInputDirective;

    @ContentChild(IgxInputDirective, { read: IgxInputDirective })
    private _inputDirectiveUserTemplate: IgxInputDirective;

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
    public displayFormat = new TimeDisplayFormatPipe(this);

    /**
     * @hidden
     */
    public inputFormat = new TimeInputFormatPipe(this);

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
    public get mask(): string {
        return this._mask || '00:00 LL';
    }

    public set mask(val: string) {
        this._mask = val;
    }

    /**
     * @hidden
     */
    public get displayValue(): string {
        if (this._displayValue === undefined) {
            return this._formatTime(this.value, this.format);
        }
        return this._displayValue;
    }

    public set displayValue(value: string) {
        this._displayValue = value;
    }

    /**
     * Returns the current time formatted as string using the `format` option.
     * If there is no set time the return is an empty string.
     * ```typescript
     * @ViewChild("MyChild")
     * private picker: IgxTimePickerComponent;
     * ngAfterViewInit(){
     *    let time = this.picker.displayTime;
     * }
     * ```
     */
    public get displayTime(): string {
        if (this.value) {
            return this._formatTime(this.value, this.format);
        }
        return '';
    }

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
        return (this.displayValue && this.displayValue !== this.parseMask(false)) || this.isNotEmpty;
    }

    /**
     * @hidden
     */
    public get showHoursList(): boolean {
        return this.format.indexOf('h') !== - 1 || this.format.indexOf('H') !== - 1;
    }

    /**
     * @hidden
     */
    public get showMinutesList(): boolean {
        return this.format.indexOf('m') !== - 1;
    }

    /**
     * @hidden
     */
    public get showSecondsList(): boolean {
        return this.format.indexOf('s') !== - 1;
    }

    /**
     * @hidden
     */
    public get showAmPmList(): boolean {
        return this.format.indexOf('t') !== - 1;
    }

    /**
     * @hidden
     */
    public get validSecondsEntries(): any[] {
        const secondsEntries = [];
        for (let i = 0; i < 60; i++) {
            secondsEntries.push(i);
        }
        return secondsEntries;
    }

    /**
     * @hidden
     */
    public get validMinuteEntries(): any[] {
        const minuteEntries = [];
        for (let i = 0; i < 60; i++) {
            minuteEntries.push(i);
        }
        return minuteEntries;
    }

    /**
     * @hidden
     */
    public get validHourEntries(): any[] {
        const hourEntries = [];
        const index = this.format.indexOf('h') !== -1 ? 13 : 24;
        for (let i = 0; i < index; i++) {
            hourEntries.push(i);
        }
        return hourEntries;
    }

    /**
     * Gets the input group template.
     * ```typescript
     * let template = this.template();
     * ```
     *
     * @memberof IgxTimePickerComponent
     */
    public get template(): TemplateRef<any> {
        if (this.timePickerTemplateDirective) {
            return this.timePickerTemplateDirective.template;
        }
        return this.mode === InteractionMode.Dialog ? this.defaultTimePickerTemplate : this.dropdownInputTemplate;
    }

    /**
     * Gets the context passed to the input group template.
     *
     * @memberof IgxTimePickerComponent
     */
    public get context() {
        return {
            value: this.value,
            displayTime: this.displayTime,
            displayValue: this.displayValue,
            openDialog: (target?: HTMLElement) => this.openDialog(target)
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

    /** @hidden @internal */
    private _value: Date;
    private _overlaySettings: OverlaySettings;
    private _resourceStrings = CurrentResourceStrings.TimePickerResStrings;
    private _okButtonLabel = null;
    private _cancelButtonLabel = null;
    private _format: string;
    private _mask: string;
    private _displayValue: string;
    private _itemsDelta: { hours: number; minutes: number; seconds: number } = { hours: 1, minutes: 1, seconds: 1 };

    private _isHourListLoop = this.isSpinLoop;
    private _isMinuteListLoop = this.isSpinLoop;
    private _isSecondsListLoop = this.isSpinLoop;

    private _hourView = [];
    private _minuteView = [];
    private _secondsView = [];
    private _ampmView = [];

    private _dateFromModel: Date;
    private _destroy$ = new Subject<boolean>();
    private _statusChanges$: Subscription;
    private _dropDownOverlaySettings: OverlaySettings;
    private _dialogOverlaySettings: OverlaySettings;

    private _prevSelectedHour: string;
    private _prevSelectedMinute: string;
    private _prevSelectedSeconds: string;
    private _prevSelectedAmPm: string;

    private _onOpen = new EventEmitter<IgxTimePickerComponent>();
    private _onClose = new EventEmitter<IgxTimePickerComponent>();

    private _hoursPos = new Set();
    private _minutesPos = new Set();
    private _secondsPos = new Set();
    private _amPmPos = new Set();
    private _ngControl: NgControl = null;

    private _onChangeCallback: (_: Date) => void = noop;
    private _onTouchedCallback: () => void = noop;

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
        if (this._isValueValid(value)) {
            const oldVal = this._value;

            this._value = value;
            this._onChangeCallback(value);

            const dispVal = this._formatTime(this.value, this.format);
            if (this.mode === InteractionMode.DropDown && this._displayValue !== dispVal) {
                this.displayValue = dispVal;
            }

            const args: IgxTimePickerValueChangedEventArgs = {
                oldValue: oldVal,
                newValue: value
            };
            this.onValueChanged.emit(args);
        } else {
            const args: IgxTimePickerValidationFailedEventArgs = {
                timePicker: this,
                currentValue: value,
                setThroughUI: false
            };
            this.onValidationFailed.emit(args);
        }
    }

    /**
     * An accessor that returns the value of `igx-time-picker` component.
     * ```html
     * @ViewChild("MyPick")
     * public pick: IgxTimePickerComponent;
     * ngAfterViewInit(){
     *    let pickSelect = this.pick.value;
     * }
     * ```
     */
    public get value(): Date {
        return this._value;
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

    /**
     * An @Input property that Gets/Sets format of time while `igxTimePicker` does not have focus. <br>
     * By default `format` is set to hh:mm tt. <br>
     * List of time-flags: <br>
     * `h` : hours field in 12-hours format without leading zero <br>
     * `hh` : hours field in 12-hours format with leading zero <br>
     * `H` : hours field in 24-hours format without leading zero <br>
     * `HH` : hours field in 24-hours format with leading zero <br>
     * `m` : minutes field without leading zero <br>
     * `mm` : minutes field with leading zero <br>
     * `s` : seconds field without leading zero <br>
     * `ss` : seconds field with leading zero <br>
     * `tt` : 2 character string which represents AM/PM field <br>
     * ```html
     * <igx-time-picker format="HH:m" id="time-picker"></igx-time-picker>
     * ```
     */
    @Input()
    public get format() {
        return this._format || 'hh:mm tt';
    }

    public set format(formatValue: string) {
        this._format = formatValue;
        this.mask = this._format.indexOf('tt') !== -1 ? '00:00:00 LL' : '00:00:00';

        if (!this.showHoursList || !this.showMinutesList) {
            this.trimMask();
        }

        if (!this.showSecondsList) {
            this.trimMask();
        }

        if (this.displayValue) {
            this.displayValue = this._formatTime(this.value, this._format);
        }

        this.determineCursorPos();
    }

    /**
     * An @Input property that allows you to modify overlay positioning, interaction and scroll behavior.
     * ```typescript
     * const settings: OverlaySettings = {
     *      closeOnOutsideClick: true,
     *      modal: false
     *  }
     * ```
     * ---
     * ```html
     * <igx-time-picker [overlaySettings]="settings"></igx-time-picker>
     * ```
     *
     * @memberof IgxTimePickerComponent
     */
    @Input()
    public set overlaySettings(value: OverlaySettings) {
        this._overlaySettings = value;
    }

    public get overlaySettings(): OverlaySettings {
        return this._overlaySettings ? this._overlaySettings :
            (this.mode === InteractionMode.Dialog ? this._dialogOverlaySettings : this._dropDownOverlaySettings);
    }

    constructor(
        private _injector: Injector,
        private _cdr: ChangeDetectorRef,
        protected platform: PlatformUtil) { }

    /**
     * @hidden
     */
    @HostListener('keydown.spacebar', ['$event'])
    @HostListener('keydown.space', ['$event'])
    public onKeydownSpace(event) {
        this.openDialog(this.getInputGroupElement());
        event.preventDefault();
    }

    /**
     * @hidden
     */
    @HostListener('keydown.Alt.ArrowDown')
    public onAltArrowDown() {
        this.openDialog(this.getInputGroupElement());
    }

    //#region ControlValueAccessor

    /** @hidden @internal */
    public writeValue(value: Date) {
        // use this flag to make sure that min/maxValue are checked (in _convertMinMaxValue() method)
        // against the real value when initializing the component and value is bound via ngModel
        this._dateFromModel = value;

        this._value = value;

        if (this.mode === InteractionMode.DropDown) {
            this.displayValue = this._formatTime(this.value, this.format);
        }
    }

    /** @hidden @internal */
    public applyDisabledStyleForItem(period: string, value: string) {
        if (!this.minValue || !this.maxValue) {
            return false;
        }
        const minValueDate: Date = this.convertMinMaxValue(this.minValue);
        const maxValueDate: Date = this.convertMinMaxValue(this.maxValue);
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
    public setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    //#endregion

    /**
     * @hidden
     */
    public ngOnInit(): void {
        this._generateHours();
        this._generateMinutes();
        this._generateSeconds();
        if (this.format.indexOf('tt') !== -1) {
            this._generateAmPm();
        }

        this._dropDownOverlaySettings = {
            modal: false,
            closeOnOutsideClick: true,
            scrollStrategy: new AbsoluteScrollStrategy(),
            positionStrategy: new AutoPositionStrategy()
        };
        this._dialogOverlaySettings = {};
        this._ngControl = this._injector.get<NgControl>(NgControl, null);
    }

    /**
     * @hidden
     */
    public ngAfterViewInit(): void {
        if (this.mode === InteractionMode.DropDown && this._inputElementRef) {
            fromEvent(this._inputElementRef.nativeElement, 'keydown').pipe(
                throttle(() => interval(0, animationFrameScheduler)),
                takeUntil(this._destroy$)
            ).subscribe((event: KeyboardEvent) => {
                if (event.key === this.platform.KEYMAP.ARROW_UP || event.key === this.platform.KEYMAP.ARROW_DOWN) {
                    this.spinOnEdit(event);
                }
            });
        }

        if (this.toggleRef && this._inputGroup) {
            this.toggleRef.element.style.width = this._inputGroup.element.nativeElement.getBoundingClientRect().width + 'px';
        }

        if (this.toggleRef) {
            this.toggleRef.onClosed.pipe(takeUntil(this._destroy$)).subscribe(() => {
                if (this.mode === InteractionMode.DropDown) {
                    this._onDropDownClosed();
                }

                this.onClosed.emit(this);
            });

            this.toggleRef.onOpened.pipe(takeUntil(this._destroy$)).subscribe(() => {
                this.onOpened.emit(this);
            });

            this.toggleRef.onClosing.pipe(takeUntil(this._destroy$)).subscribe((event) => {
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
                    this._updateValidityOnBlur();
                }
            });

            this.determineCursorPos();

            if (this._ngControl) {
                this._statusChanges$ = this._ngControl.statusChanges.subscribe(this.onStatusChanged.bind(this));
            }
        }
    }

    public ngAfterViewChecked() {
        // if one sets mode at run time this forces initialization of new igxInputGroup
        // As a result a new igxInputDirective is initialized too. In ngAfterViewInit of
        // the new directive isRequired of the igxInputGroup is set again. However
        // ngAfterViewInit of the time picker is not called again and we may finish with wrong
        // isRequired in igxInputGroup. This is why we should set it her, only when needed
        if (this._inputGroup && this._inputGroup.isRequired !== this.required) {
            this._inputGroup.isRequired = this.required;
            this._cdr.detectChanges();
        }
    }

    /**
     * @hidden
     */
    public ngOnDestroy(): void {
        this._destroy$.next(true);
        this._destroy$.complete();
        if (this._statusChanges$) {
            this._statusChanges$.unsubscribe();
        }
    }

    /** @hidden @internal */
    public convertMinMaxValue(value: string): Date {
        if (!value) {
            return;
        }
        const date = this.value ? new Date(this.value) : this._dateFromModel ? new Date(this._dateFromModel) : new Date();
        const sections = value.split(/[\s:]+/);
        let hour; let minutes; let seconds; let amPM;

        date.setSeconds(0);

        if (this.showHoursList) {
            hour = sections[0];
            date.setHours(parseInt(hour, 10));
        }

        if (this.showMinutesList) {
            minutes = this.showHoursList ? sections[1] : sections[0];
            date.setMinutes(parseInt(minutes, 10));
        }

        if (this.showSecondsList) {
            seconds = sections[sections.length - (this.showAmPmList ? 2 : 1)];
            date.setSeconds(parseInt(seconds, 10));
        }

        if (this.showAmPmList) {
            amPM = sections[sections.length - 1].toUpperCase();

            if (((this.showHoursList && date.getHours().toString() !== '12') ||
                (!this.showHoursList && date.getHours().toString() <= '11')) && amPM === 'PM') {
                date.setHours(date.getHours() + 12);
            }

            if (!this.showHoursList && amPM === 'AM' && date.getHours().toString() > '11') {
                date.setHours(date.getHours() - 12);
            }

            if (this.showHoursList && date.getHours() === 12 && amPM === 'AM') {
                date.setHours(0);
            }
        }

        return date;
    }

    /**
     * @hidden
     */
    public getEditElement() {
        return this._inputElementRef ? this._inputElementRef.nativeElement : null;
    }

    /**
     * @hidden
     */
    public getInputGroupElement() {
        return this._inputGroup ? this._inputGroup.element.nativeElement : null;
    }


    /**
     * opens the dialog.
     *
     * @param target HTMLElement - the target element to use for positioning the drop down container according to
     * ```html
     * <igx-time-picker [value]="date" mode="dropdown" #retemplated>
     *   <ng-template igxTimePickerTemplate let-openDialog="openDialog"
     *                let-displayTime="displayTime">
     *     <igx-input-group>
     *       <input #dropDownTarget igxInput [value]="displayTime" />
     *       <igx-suffix (click)="openDialog(dropDownTarget)">
     *         <igx-icon>alarm</igx-icon>
     *       </igx-suffix>
     *     </igx-input-group>
     *   </ng-template>
     * </igx-time-picker>
     * ```
     */
    public openDialog(target?: HTMLElement): void {
        if (!this.toggleRef.collapsed) {
            return this._onDropDownClosed();
        }
        const settings = this.overlaySettings;

        if (target && settings && settings.positionStrategy) {
            settings.target = target;
        }
        if (this.outlet) {
            settings.outlet = this.outlet;
        }

        this.toggleRef.open(settings);
        this._initializeContainer();
    }

    /**
     * Scrolls a hour item into view.
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
                this._updateEditableInput();
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
                this._updateEditableInput();
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
                this._updateEditableInput();
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
                this._updateEditableInput();
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

        this._updateEditableInput();
    }

    /**
     * @hidden
     */
    public prevHour() {
        const prevHour = this._prevItem(this._hourItems, this.selectedHour, this._isHourListLoop, 'hour');
        this._hourView = prevHour.view;
        this.selectedHour = prevHour.selectedItem;

        this._updateEditableInput();
    }

    /**
     * @hidden
     */
    public nextMinute() {
        const nextMinute = this._nextItem(this._minuteItems, this.selectedMinute, this._isMinuteListLoop, 'minute');
        this._minuteView = nextMinute.view;
        this.selectedMinute = nextMinute.selectedItem;

        this._updateEditableInput();
    }

    /**
     * @hidden
     */
    public prevMinute() {
        const prevMinute = this._prevItem(this._minuteItems, this.selectedMinute, this._isMinuteListLoop, 'minute');
        this._minuteView = prevMinute.view;
        this.selectedMinute = prevMinute.selectedItem;

        this._updateEditableInput();
    }

    /**
     * @hidden
     */
    public nextSeconds() {
        const nextSeconds = this._nextItem(this._secondsItems, this.selectedSeconds, this._isSecondsListLoop, 'seconds');
        this._secondsView = nextSeconds.view;
        this.selectedSeconds = nextSeconds.selectedItem;

        this._updateEditableInput();
    }

    /**
     * @hidden
     */
    public prevSeconds() {
        const prevSeconds = this._prevItem(this._secondsItems, this.selectedSeconds, this._isSecondsListLoop, 'seconds');
        this._secondsView = prevSeconds.view;
        this.selectedSeconds = prevSeconds.selectedItem;

        this._updateEditableInput();
    }

    /**
     * @hidden
     */
    public nextAmPm() {
        const selectedIndex = this._ampmItems.indexOf(this.selectedAmPm);

        if (selectedIndex + 1 < this._ampmItems.length - 3) {
            this._updateAmPmView(selectedIndex - 2, selectedIndex + 5);
            this.selectedAmPm = this._ampmItems[selectedIndex + 1];

            this._updateEditableInput();
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

            this._updateEditableInput();
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
        const time = this._getSelectedTime();
        if (this._isValueValid(time)) {
            this.close();
            this.value = time;
            return true;
        } else {
            const args: IgxTimePickerValidationFailedEventArgs = {
                timePicker: this,
                currentValue: time,
                setThroughUI: true
            };
            this.onValidationFailed.emit(args);
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
        if (this.mode === InteractionMode.DropDown) {
            this.displayValue = this.value ? this._formatTime(this.value, this.format) : this.parseMask(false);
        }

        this.close();

        this.selectedHour = this._prevSelectedHour;
        this.selectedMinute = this._prevSelectedMinute;
        this.selectedSeconds = this._prevSelectedSeconds;
        this.selectedAmPm = this._prevSelectedAmPm;
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

    /**
     * @hidden
     */
    public parseMask(preserveAmPm = true): string {
        const maskWithAmPm = this.mask.replace(new RegExp('0', 'g'), this.promptChar).replace('LL', 'AM');
        const pureMask = this.mask.replace(new RegExp('0', 'g'), this.promptChar).replace(new RegExp('L', 'g'), this.promptChar);

        return preserveAmPm ? maskWithAmPm : pureMask;
    }

    /**
     * @hidden
     */
    public clear(): void {
        if (this.toggleRef.collapsed) {
            this.cleared = true;
            this.isNotEmpty = false;

            const oldVal = new Date(this.value);
            this.displayValue = this.parseMask(false);
            requestAnimationFrame(() => {
                this._setCursorPosition(0);
            });
            // TODO: refactoring - this.value should be null #6585
            this.value?.setHours(0, 0, 0);

            if (oldVal.getTime() !== this.value?.getTime() || this.isReset()) {
                const args: IgxTimePickerValueChangedEventArgs = {
                    oldValue: oldVal,
                    newValue: this.value
                };
                this.onValueChanged.emit(args);
            }
        } else {
            this.close();
        }
    }

    /**
     * @hidden
     */
    public onInput(event): void {
        const inputMask: string = event.target.value;
        const oldVal = new Date(this.value);

        this.isNotEmpty = inputMask !== this.parseMask(false);

        // handle cases where all empty positions (promts) are filled and we want to update
        // timepicker own value property if it is a valid Date
        if (inputMask.indexOf(this.promptChar) === -1) {
            if (this._isEntryValid(inputMask)) {
                const newVal = this.convertMinMaxValue(inputMask);
                if (oldVal.getTime() !== newVal.getTime()) {
                    this.value = newVal;
                }
            } else {
                const args: IgxTimePickerValidationFailedEventArgs = {
                    timePicker: this,
                    currentValue: new Date(inputMask),
                    setThroughUI: false
                };
                this.onValidationFailed.emit(args);
            }
            // handle cases where the user deletes the display value (when pressing backspace or delete)
        } else if (!this.value || inputMask.length === 0 || !this.isNotEmpty) {
            this.isNotEmpty = false;
            // TODO: refactoring - this.value should be null #6585
            this.value?.setHours(0, 0, 0);
            this.displayValue = inputMask;
            if (oldVal.getTime() !== this.value?.getTime() || this.isReset()) {
                // TODO: Do not emit event when the editor is empty #6482
                const args: IgxTimePickerValueChangedEventArgs = {
                    oldValue: oldVal,
                    newValue: this.value
                };
                this.onValueChanged.emit(args);
            }
        }
    }

    /**
     * @hidden
     */
    public onFocus(event): void {
        this.isNotEmpty = event.target.value !== this.parseMask(false);
    }

    /**
     * @hidden
     */
    public onBlur(event): void {
        if (this.mode === InteractionMode.DropDown) {
            const value = event.target.value;

            this.isNotEmpty = value !== '';
            this.displayValue = value;

            if (value && (value !== this.parseMask() || value !== this.parseMask(false))) {
                if (this._isEntryValid(value)) {
                    const newVal = this.convertMinMaxValue(value);
                    if (!this.value || this.value.getTime() !== newVal.getTime()) {
                        this.value = newVal;
                    }
                } else {
                    const args: IgxTimePickerValidationFailedEventArgs = {
                        timePicker: this,
                        currentValue: value,
                        setThroughUI: false
                    };
                    this.onValidationFailed.emit(args);
                }
            }
        }

        if (this.toggleRef.collapsed) {
            this._updateValidityOnBlur();
        }
    }

    public mouseDown(event: MouseEvent): void {
        // if the click is not on the input but in input group
        // e.g. on prefix or suffix, prevent default and this way prevent blur
        if (event.target !== this.getEditElement()) {
            event.preventDefault();
        }
    }

    /**
     * @hidden
     */
    public spinOnEdit(event): void {
        event.preventDefault();

        let sign: number;
        let displayVal: string;
        const currentVal = new Date(this.value);
        const min = this.minValue ? this.convertMinMaxValue(this.minValue) : this.convertMinMaxValue('00:00');
        const max = this.maxValue ? this.convertMinMaxValue(this.maxValue) : this.convertMinMaxValue('24:00');

        const cursor = this._getCursorPosition();

        if (event.key) {
            const key = event.key;
            sign = key === this.platform.KEYMAP.ARROW_DOWN ? -1 : 1;
        }

        if (event.deltaY) {
            sign = event.deltaY < 0 ? 1 : -1;
        }

        if (!this.displayValue) {
            this.value = min;
            displayVal = this._formatTime(this.value, this.format);
        } else {
            const hDelta = this.itemsDelta.hours * 60 + (sign * this.value.getMinutes());
            const mDelta = this.itemsDelta.minutes;
            const sDelta = this.itemsDelta.seconds;

            if (this.cursorOnHours(cursor, this.showHoursList)) {
                this.value = this._spinHours(currentVal, min, max, hDelta, sign);
            }
            if (this.cursorOnMinutes(cursor, this.showHoursList, this.showMinutesList)) {
                this.value = this._spinMinutes(currentVal, mDelta, sign);
            }
            if (this.cursorOnSeconds(cursor, this.showHoursList, this.showMinutesList, this.showSecondsList)) {
                this.value = this._spinSeconds(currentVal, sDelta, sign);
            }
            if (this.cursorOnAmPm(cursor, this.showHoursList, this.showMinutesList, this.showSecondsList, this.showAmPmList)) {
                const sections = this.displayValue.split(/[\s:]+/);
                sign = sections[sections.length - 1] === 'AM' ? 1 : -1;
                currentVal.setHours(currentVal.getHours() + (sign * 12));

                this.value = currentVal;
            }

            displayVal = this._formatTime(this.value, this.format);
        }

        // minor hack for preventing cursor jumping in IE
        this._displayValue = this.inputFormat.transform(displayVal);
        this._inputElementRef.nativeElement.value = this._displayValue;
        this._setCursorPosition(cursor);

        requestAnimationFrame(() => {
            this._setCursorPosition(cursor);
        });
    }

    protected onStatusChanged() {
        if ((this._ngControl.control.touched || this._ngControl.control.dirty) &&
            (this._ngControl.control.validator || this._ngControl.control.asyncValidator)) {
            const input = this._inputDirective || this._inputDirectiveUserTemplate;
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

    private trimMask(): void {
        this.mask = this.mask.slice(this.mask.indexOf(':') + 1, this.mask.length);
    }

    private determineCursorPos(): void {
        this.clearCursorPos();
        for (const char of this.format) {
            switch (char) {
                case 'H':
                case 'h':
                    if (this._hoursPos.size === 0) {
                        this._hoursPos.add(this.format.indexOf(char));
                    } else {
                        this._hoursPos.add(this.format.lastIndexOf(char));
                    }
                    this._hoursPos.add(this.format.lastIndexOf(char) + 1);
                    break;
                case 'M':
                case 'm':
                    if (this._minutesPos.size === 0) {
                        this._minutesPos.add(this.format.indexOf(char));
                    } else {
                        this._minutesPos.add(this.format.lastIndexOf(char));
                    }
                    this._minutesPos.add(this.format.lastIndexOf(char) + 1);
                    break;
                case 'S':
                case 's':
                    if (this._secondsPos.size === 0) {
                        this._secondsPos.add(this.format.indexOf(char));
                    } else {
                        this._secondsPos.add(this.format.lastIndexOf(char));
                    }
                    this._secondsPos.add(this.format.lastIndexOf(char) + 1);
                    break;
                case 'T':
                case 't':
                    if (this._amPmPos.size === 0) {
                        this._amPmPos.add(this.format.indexOf(char));
                    } else {
                        this._amPmPos.add(this.format.lastIndexOf(char));
                    }
                    this._amPmPos.add(this.format.lastIndexOf(char) + 1);
                    break;
            }
        }
    }

    private clearCursorPos() {
        this._hoursPos.forEach(v => this._hoursPos.delete(v));
        this._minutesPos.forEach(v => this._minutesPos.delete(v));
        this._secondsPos.forEach(v => this._secondsPos.delete(v));
        this._amPmPos.forEach(v => this._amPmPos.delete(v));
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
            const leadZeroHour = (item < 10 && (this.format.indexOf('hh') !== -1 || this.format.indexOf('HH') !== -1));
            const leadZeroMinute = (item < 10 && this.format.indexOf('mm') !== -1);
            const leadZeroSeconds = (item < 10 && this.format.indexOf('ss') !== -1);

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

    private _formatTime(value: Date, format: string): string {
        if (!value) {
            return '';
        } else {
            let hour = value.getHours();
            let formattedHour;

            const minute = value.getMinutes();
            const seconds = value.getSeconds();
            const amPM = (hour > 11) ? 'PM' : 'AM';

            if (format.indexOf('h') !== -1) {
                if (hour > 12) {
                    hour -= 12;
                    formattedHour = hour < 10 && format.indexOf('hh') !== -1 ? '0' + hour : `${hour}`;
                } else if (hour === 0) {
                    formattedHour = '12';
                } else if (hour < 10 && format.indexOf('hh') !== -1) {
                    formattedHour = '0' + hour;
                } else {
                    formattedHour = `${hour}`;
                }
            } else {
                if (hour < 10 && format.indexOf('HH') !== -1) {
                    formattedHour = '0' + hour;
                } else {
                    formattedHour = `${hour}`;
                }
            }

            const formattedMinute = minute < 10 && format.indexOf('mm') !== -1 ? '0' + minute : `${minute}`;

            const formattedSeconds = seconds < 10 && format.indexOf('ss') !== -1 ? '0' + seconds : `${seconds}`;

            return format.replace('hh', formattedHour).replace('h', formattedHour)
                .replace('HH', formattedHour).replace('H', formattedHour)
                .replace('mm', formattedMinute).replace('m', formattedMinute)
                .replace('ss', formattedSeconds).replace('s', formattedSeconds)
                .replace('tt', amPM);
        }
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

    private _addEmptyItems(items: string[]): void {
        for (let i = 0; i < 3; i++) {
            items.push(null);
        }
    }

    private _generateHours(): void {
        let hourItemsCount = 24;
        if (this.format.indexOf('h') !== -1) {
            hourItemsCount = 13;
        }

        hourItemsCount /= this.itemsDelta.hours;

        let i = this.format.indexOf('H') !== -1 ? 0 : 1;

        if (hourItemsCount < 7 || !this.isSpinLoop) {
            this._addEmptyItems(this._hourItems);
            this._isHourListLoop = false;
        }

        if (hourItemsCount > 1) {
            for (i; i < hourItemsCount; i++) {
                this._hourItems.push(i * this.itemsDelta.hours);
            }
        } else {
            this._hourItems.push(0);
        }

        if (hourItemsCount < 7 || !this.isSpinLoop) {
            this._addEmptyItems(this._hourItems);
        }
    }

    private _generateMinutes(): void {
        const minuteItemsCount = 60 / this.itemsDelta.minutes;

        if (minuteItemsCount < 7 || !this.isSpinLoop) {
            this._addEmptyItems(this._minuteItems);
            this._isMinuteListLoop = false;
        }

        for (let i = 0; i < minuteItemsCount; i++) {
            this._minuteItems.push(i * this.itemsDelta.minutes);
        }

        if (minuteItemsCount < 7 || !this.isSpinLoop) {
            this._addEmptyItems(this._minuteItems);
        }
    }

    private _generateSeconds(): void {
        const secondsItemsCount = 60 / this.itemsDelta.seconds;

        if (secondsItemsCount < 7 || !this.isSpinLoop) {
            this._addEmptyItems(this._secondsItems);
            this._isSecondsListLoop = false;
        }

        for (let i = 0; i < secondsItemsCount; i++) {
            this._secondsItems.push(i * this.itemsDelta.seconds);
        }

        if (secondsItemsCount < 7 || !this.isSpinLoop) {
            this._addEmptyItems(this._secondsItems);
        }
    }

    private _generateAmPm(): void {

        this._addEmptyItems(this._ampmItems);

        this._ampmItems.push('AM');
        this._ampmItems.push('PM');

        this._addEmptyItems(this._ampmItems);
    }

    private _getSelectedTime(): Date {
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

    private _isValueValid(value: Date): boolean {
        if (this.maxValue && value > this.convertMinMaxValue(this.maxValue)) {
            return false;
        } else if (this.minValue && value < this.convertMinMaxValue(this.minValue)) {
            return false;
        } else {
            return true;
        }
    }

    private _isEntryValid(val: string): boolean {
        let validH = true;
        let validM = true;
        let validS = true;

        const sections = val.split(/[\s:]+/);
        const re = new RegExp(this.promptChar, 'g');

        if (this.showHoursList) {
            validH = this.validHourEntries.indexOf(parseInt(sections[0].replace(re, ''), 10)) !== -1;
        }

        if (this.showMinutesList) {
            const minutes = this.showHoursList ? sections[1] : sections[0];
            validM = this.validMinuteEntries.indexOf(parseInt(minutes.replace(re, ''), 10)) !== -1;
        }

        if (this.showSecondsList) {
            const seconds = sections[sections.length - (this.showAmPmList ? 2 : 1)];
            validS = this.validSecondsEntries.indexOf(parseInt(seconds.replace(re, ''), 10)) !== -1;
        }

        return validH && validM && validS;
    }

    private _getCursorPosition(): number {
        return this._inputElementRef.nativeElement.selectionStart;
    }

    private _setCursorPosition(start: number, end: number = start): void {
        this._inputElementRef.nativeElement.setSelectionRange(start, end);
    }

    private _updateEditableInput(): void {
        if (this.mode === InteractionMode.DropDown) {
            this.displayValue = this._formatTime(this._getSelectedTime(), this.format);
        }
    }

    private _spinHours(currentVal: Date, minVal: Date, maxVal: Date, hDelta: number, sign: number): Date {
        const oldVal = new Date(currentVal);

        currentVal.setMinutes(sign * hDelta);
        if (currentVal.getDate() !== oldVal.getDate() && this.isSpinLoop) {
            currentVal.setDate(oldVal.getDate());
        }

        let minutes = currentVal.getMinutes();
        if (currentVal.getTime() > maxVal.getTime()) {
            if (this.isSpinLoop) {
                minutes = minutes < minVal.getMinutes() ? 60 + minutes : minutes;
                minVal.setMinutes(sign * minutes);
                return minVal;
            } else {
                return oldVal;
            }
        } else if (currentVal.getTime() < minVal.getTime()) {
            if (this.isSpinLoop) {
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

    private _spinMinutes(currentVal: Date, mDelta: number, sign: number) {
        let minutes = currentVal.getMinutes() + (sign * mDelta);

        if (minutes < 0 || minutes >= 60) {
            minutes = this.isSpinLoop ? minutes - (sign * 60) : currentVal.getMinutes();
        }

        currentVal.setMinutes(minutes);
        return currentVal;
    }

    private _spinSeconds(currentVal: Date, sDelta: number, sign: number) {
        let seconds = currentVal.getSeconds() + (sign * sDelta);

        if (seconds < 0 || seconds >= 60) {
            seconds = this.isSpinLoop ? seconds - (sign * 60) : currentVal.getSeconds();
        }

        currentVal.setSeconds(seconds);
        return currentVal;
    }

    private _initializeContainer() {
        if (this.value) {
            const formttedTime = this._formatTime(this.value, this.format);
            const sections = formttedTime.split(/[\s:]+/);

            if (this.showHoursList) {
                this.selectedHour = sections[0];
            }

            if (this.showMinutesList) {
                this.selectedMinute = this.showHoursList ? sections[1] : sections[0];
            }

            if (this.showSecondsList) {
                this.selectedSeconds = sections[sections.length - (this.showAmPmList ? 2 : 1)];
            }

            if (this.showAmPmList && this._ampmItems !== null) {
                this.selectedAmPm = sections[sections.length - 1];
            }
        }

        if (this.selectedHour === undefined) {
            this.selectedHour = !this.showHoursList && this.value ? this.value.getHours().toString() :
                this.showHoursList ? `${this._hourItems[3]}` : '0';
        }
        if (this.selectedMinute === undefined) {
            this.selectedMinute = !this.showMinutesList && this.value ? this.value.getMinutes().toString() : '0';
        }
        if (this.selectedSeconds === undefined) {
            this.selectedSeconds = !this.showSecondsList && this.value ? this.value.getSeconds().toString() : '0';
        }
        if (this.selectedAmPm === undefined && this._ampmItems !== null) {
            this.selectedAmPm = this._ampmItems[3];
        }

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

    private _onDropDownClosed(): void {
        const oldValue = this.value;
        const newVal = this.convertMinMaxValue(this.displayValue);

        if (this.displayValue === this.parseMask(false)) {
            return;
        }

        if (this._isValueValid(newVal)) {
            if (!this.value || oldValue.getTime() !== newVal.getTime()) {
                this.value = newVal;
            }
        } else {
            this.displayValue = this.inputFormat.transform(this._formatTime(oldValue, this.format));

            const args: IgxTimePickerValidationFailedEventArgs = {
                timePicker: this,
                currentValue: newVal,
                setThroughUI: true
            };
            this.onValidationFailed.emit(args);
        }
    }

    private cursorOnHours(cursor: number, showHours: boolean): boolean {
        return showHours && this._hoursPos.has(cursor);
    }

    private cursorOnMinutes(cursor: number, showHours: boolean, showMinutes: boolean): boolean {
        return showMinutes &&
            (showHours && this._minutesPos.has(cursor)) ||
            (!showHours && this._minutesPos.has(cursor));
    }

    private cursorOnSeconds(cursor: number, showHours: boolean, showMinutes: boolean, showSeconds: boolean): boolean {
        return showSeconds &&
            (showHours && showMinutes && this._secondsPos.has(cursor)) ||
            ((!showHours || !showMinutes) && this._secondsPos.has(cursor)) ||
            (!showHours && !showMinutes && this._secondsPos.has(cursor));
    }

    private cursorOnAmPm(cursor: number, showHours: boolean, showMinutes: boolean,
        showSeconds: boolean, showAmPm: boolean): boolean {
        return showAmPm &&
            (showHours && showMinutes && showSeconds && this._amPmPos.has(cursor)) ||
            ((!showHours || !showMinutes || !showSeconds) && this._amPmPos.has(cursor)) ||
            (!showHours && (!showMinutes || !showSeconds) && this._amPmPos.has(cursor));
    }

    private _updateValidityOnBlur() {
        this._onTouchedCallback();
        const input = this._inputDirective || this._inputDirectiveUserTemplate;
        if (this._ngControl && !this._ngControl.valid) {
            input.valid = IgxInputState.INVALID;
        } else {
            input.valid = IgxInputState.INITIAL;
        }
    }

    // Workaround method for #8135
    // TODO: It must be removed in #6482
    private isReset(): boolean {
        return this.value?.getHours() === 0
            && this.value?.getMinutes() === 0
            && this.value?.getSeconds() === 0;
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
        IgxTimePickerActionsDirective,
        TimeDisplayFormatPipe,
        TimeInputFormatPipe
    ],
    exports: [
        IgxTimePickerComponent,
        IgxTimePickerTemplateDirective,
        IgxTimePickerActionsDirective,
        TimeDisplayFormatPipe,
        TimeInputFormatPipe,
        IgxInputGroupModule
    ],
    imports: [
        CommonModule,
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
