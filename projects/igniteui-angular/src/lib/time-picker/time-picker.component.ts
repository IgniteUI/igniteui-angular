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
    AfterViewInit
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { HAMMER_GESTURE_CONFIG, HammerGestureConfig } from '@angular/platform-browser';
import { IgxIconModule } from '../icon/index';
import { IgxInputGroupModule, IgxInputGroupComponent } from '../input-group/input-group.component';
import { IgxInputDirective } from '../directives/input/input.directive';
import {
    IgxAmPmItemDirective,
    IgxHourItemDirective,
    IgxItemListDirective,
    IgxMinuteItemDirective,
    IgxTimePickerTemplateDirective,
    IgxTimePickerActionsDirective
} from './time-picker.directives';
import { Subject, fromEvent, interval, animationFrameScheduler } from 'rxjs';
import { EditorProvider } from '../core/edit-provider';
import { IgxTimePickerBase, IGX_TIME_PICKER_COMPONENT } from './time-picker.common';
import { AbsoluteScrollStrategy } from '../services/overlay/scroll';
import { AutoPositionStrategy } from '../services/overlay/position';
import { OverlaySettings } from '../services/overlay/utilities';
import { takeUntil, throttle } from 'rxjs/operators';
import { IgxButtonModule } from '../directives/button/button.directive';
import { IgxMaskModule } from '../directives/mask/mask.directive';
import { IgxOverlayOutletDirective, IgxToggleModule, IgxToggleDirective } from '../directives/toggle/toggle.directive';
import { TimeDisplayFormatPipe, TimeInputFormatPipe } from './time-picker.pipes';
import { ITimePickerResourceStrings, TimePickerResourceStringsEN } from '../core/i18n/time-picker-resources';
import { CurrentResourceStrings } from '../core/i18n/resources';
import { KEYS, CancelableBrowserEventArgs } from '../core/utils';
import { InteractionMode } from '../core/enums';
import { showMessage } from '../core/deprecateDecorators';

let NEXT_ID = 0;
let onOpenWarningShown = false;
let onCloseWarningShown = false;

const HOURS_POS = [0, 1, 2];
const MINUTES_POS = [3, 4, 5];
const AMPM_POS = [6, 7, 8];

const ITEMS_COUNT = 7;

@Injectable()
export class TimePickerHammerConfig extends HammerGestureConfig {
    public overrides = {
        pan: { direction: Hammer.DIRECTION_VERTICAL, threshold: 1 }
    };
}

export interface IgxTimePickerValueChangedEventArgs {
    oldValue: Date;
    newValue: Date;
}

export interface IgxTimePickerValidationFailedEventArgs {
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
    AfterViewInit {

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
     * An accessor that allows you to set a time using the `value` input.
     * ```html
     *public date: Date = new Date(Date.now());
     *  //...
     *<igx-time-picker [value]="date" format="h:mm tt"></igx-time-picker>
     * ```
     */
    @Input()
    set value(value: Date) {
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
     *@ViewChild("MyPick")
     *public pick: IgxTimePickerComponent;
     *ngAfterViewInit(){
     *    let pickSelect = this.pick.value;
     * }
     * ```
     */
    get value(): Date {
        return this._value;
    }

    /**
     * An @Input property that allows you to disable the `igx-time-picker` component. By default `disabled` is set to false.
     * ```html
     * <igx-time-picker [disabled]="'true'" [vertical]="true" format="h:mm tt" ></igx-time-picker>
     * ```
     */
    @Input()
    public disabled = false;

    /**
     * An accessor that sets the resource strings.
     * By default it uses EN resources.
    */
    @Input()
    set resourceStrings(value: ITimePickerResourceStrings) {
        this._resourceStrings = Object.assign({}, this._resourceStrings, value);
    }

    /**
     * An accessor that returns the resource strings.
    */
    get resourceStrings(): ITimePickerResourceStrings {
        return this._resourceStrings;
    }

    /**
     * An @Input property that renders OK button with custom text. By default `okButtonLabel` is set to OK.
     * ```html
     * <igx-time-picker okButtonLabel='SET' [value]="date" format="h:mm tt"></igx-time-picker>
     * ```
     */
    @Input()
    set okButtonLabel(value: string) {
        this._okButtonLabel = value;
    }

    /**
     * An accessor that returns the label of ok button.
    */
    get okButtonLabel(): string {
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
    set cancelButtonLabel(value: string) {
        this._cancelButtonLabel = value;
    }

    /**
    * An accessor that returns the label of cancel button.
    */
    get cancelButtonLabel(): string {
        if (this._cancelButtonLabel === null) {
            return this.resourceStrings.igx_time_picker_cancel;
        }
        return this._cancelButtonLabel;
    }

    /**
     * An @Input property that gets/sets the delta by which hour and minute items would be changed <br>
     * when the user presses the Up/Down keys.
     * By default `itemsDelta` is set to `{hours: 1, minutes:1}`
     * ```html
     *<igx-time-picker [itemsDelta]="{hours:3, minutes:5}" id="time-picker"></igx-time-picker>
     *```
     */
    @Input()
    public itemsDelta = { hours: 1, minutes: 1 };

    /**
     * An @Input property that allows you to set the `minValue` to limit the user input.
     *```html
     *public min: string = "09:00";
     *  //..
     *<igx-time-picker format="HH:mm" [vertical]="true" [minValue]="min"></igx-time-picker>
     *```
     */
    @Input()
    public minValue: string;

    /**
     * An @Input property that allows you to set the `maxValue` to limit the user input.
     *```html
     *public max: string = "18:00";
     *  //..
     *<igx-time-picker format="HH:mm" [vertical]="true" [maxValue]="max"></igx-time-picker>
     *```
     */
    @Input()
    public maxValue: string;

    /**
     * An @Input property that determines the spin behavior. By default `isSpinLoop` is set to true.
     *The minutes and hour spinning will wrap around by default.
     *```html
     *<igx-time-picker [isSpinLoop]="false" id="time-picker"></igx-time-picker>
     *```
     */
    @Input()
    public isSpinLoop = true;

    /**
     * An @Input property that Gets/Sets the orientation of the `igxTimePicker`. By default `vertical` is set to false.
     * ```html
     *<igx-time-picker [vertical]="true" id="time-picker"></igx-time-picker>
     * ```
     */
    @Input()
    public vertical = false;

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
     * `tt` : 2 character string which represents AM/PM field <br>
     * ```html
     *<igx-time-picker format="HH:m" id="time-picker"></igx-time-picker>
     * ```
     */
    @Input()
    get format() {
        return this._format || 'hh:mm tt';
    }

    set format(formatValue: string) {
        this._format = formatValue;
        this.mask = this._format.indexOf('tt') !== -1 ? '00:00 LL' : '00:00';

        if (!this.showHoursList || !this.showMinutesList) {
            this.mask = this.mask.slice(this.mask.indexOf(':') + 1, this.mask.length);
        }

        if (this.displayValue) {
            this.displayValue = this._formatTime(this.value, this._format);
        }
    }

    /**
     * Sets the character used to prompt the user for input.
     * Default value is "'-'".
     * ```html
     * <igx-time-picker [promptChar] = "'_'">
     * ```
     * @memberof IgxTimePickerComponent
     */
    @Input()
    public promptChar = '-';

    /**
     * An @Input property that allows you to switch the interaction mode between
     * a dialog picker or dropdown with editable masked input.
     * Deafult is dialog picker.
     *```html
     *public mode = InteractionMode.DROPDOWN;
     *  //..
     *<igx-time-picker [mode]="mode"></igx-time-picker>
     *```
     * @memberof IgxTimePickerComponent
     */
    @Input()
    public mode = InteractionMode.Dialog;

    /**
     *@hidden
     */
    @Input()
    public outlet: IgxOverlayOutletDirective | ElementRef;

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
     * @memberof IgxTimePickerComponent
     */
    @Input()
    public overlaySettings: OverlaySettings;

    /**
     * Emitted when selection is made. The event contains the selected value. Returns {`oldValue`: `Date`, `newValue`: `Date`}.
     *```typescript
     * @ViewChild("toast")
     *private toast: IgxToastComponent;
     *public onValueChanged(timepicker){
     *    this.toast.show()
     *}
     * //...
     * ```
     * ```html
     *<igx-time-picker (onValueChanged)="onValueChanged($event)"></igx-time-picker>
     *<igx-toast #toast message="The value has been changed!"></igx-toast>
     *```
     */
    @Output()
    public onValueChanged = new EventEmitter<IgxTimePickerValueChangedEventArgs>();

    /**
     * Emitted when an invalid value is being set. Returns {`timePicker`: `any`, `currentValue`: `Date`, `setThroughUI`: `boolean`}
     * ```typescript
     *public min: string = "09:00";
     *public max: string = "18:00";
     *@ViewChild("toast")
     *private toast: IgxToastComponent;
     *public onValidationFailed(timepicker){
     *    this.toast.show();
     *}
     * //...
     * ```
     * ```html
     *<igx-time-picker [minValue]="min" [maxValue]="max" (onValidationFailed)="onValidationFailed($event)"></igx-time-picker>
     *<igx-toast #toast message="Value must be between 09:00 and 18:00!"></igx-toast>
     * ```
     */
    @Output()
    public onValidationFailed = new EventEmitter<IgxTimePickerValidationFailedEventArgs>();

    /**
     * @deprecated Use 'onOpened' instead.
     * Emitted when a timePicker is being opened.
     * ```html
     *@ViewChild("toast")
     *private toast: IgxToastComponent;
     *public onOpen(timepicker){
     *    this.toast.show();
     *}
     * //...
     * ```
     * ```html
     *<igx-time-picker [minValue]="min" [maxValue]="max" (onOpen)="onOpen($event)"></igx-time-picker>
     *<igx-toast #toast message="The time picker has been opened!"></igx-toast>
     * ```
     */
    @Output()
    public onOpen = new EventEmitter<IgxTimePickerComponent>();

    /**
     * Emitted when a timePicker is opened.
     */
    @Output()
    public onOpened = new EventEmitter<IgxTimePickerComponent>();

    /**
     * @deprecated Use 'onClosed' instead.
     * Emitted when a timePicker is being closed.
     */
    @Output()
    public onClose = new EventEmitter<IgxTimePickerComponent>();

    /**
     * Emitted when a timePicker is closed.
     */
    @Output()
    public onClosed = new EventEmitter<IgxTimePickerComponent>();

    /**
     * Emitted when a timePicker is being closed.
     */
    @Output()
    public onClosing = new EventEmitter<CancelableBrowserEventArgs>();

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
    @ViewChild('ampmList')
    public ampmList: ElementRef;

    /*
     * @hidden
     */
    @ViewChild('defaultTimePickerTemplate', { read: TemplateRef })
    protected defaultTimePickerTemplate: TemplateRef<any>;

    /**
     *@hidden
     */
    @ContentChild(IgxTimePickerTemplateDirective, { read: IgxTimePickerTemplateDirective })
    protected timePickerTemplateDirective: IgxTimePickerTemplateDirective;

    /**
     *@hidden
     */
    @ContentChild(IgxTimePickerActionsDirective, { read: IgxTimePickerActionsDirective })
    public timePickerActionsDirective: IgxTimePickerActionsDirective;

    /**
     * @hidden
     */
    @ViewChild(IgxInputDirective, { read: ElementRef })
    private _input: ElementRef;

    /**
     * @hidden
     */
    @ViewChild('container')
    public container: ElementRef;

    /**
     * @hidden
     */
    @ViewChild(IgxToggleDirective)
    public toggleRef: IgxToggleDirective;

    /**
     * @hidden
     */
    @ViewChild('input', { read: ElementRef })
    private input: ElementRef;

    /**
     * @hidden
     */
    @ViewChild('group', { read: IgxInputGroupComponent })
    private group: IgxInputGroupComponent;

    /**
     * @hidden
     */
    @ViewChild('dropdownInputTemplate', { read: TemplateRef })
    private dropdownInputTemplate: TemplateRef<any>;

    /*
     * @hidden
     */
    @ContentChild('dropDownTarget', { read: ElementRef })
    protected templateDropDownTarget: ElementRef;

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
    public selectedAmPm: string;

    private _value: Date;
    private _resourceStrings = CurrentResourceStrings.TimePickerResStrings;
    private _okButtonLabel = null;
    private _cancelButtonLabel = null;
    private _format: string;
    private _mask: string;
    private _displayValue: string;

    private _isHourListLoop = this.isSpinLoop;
    private _isMinuteListLoop = this.isSpinLoop;

    private _hourView = [];
    private _minuteView = [];
    private _ampmView = [];

    private _dateFromModel: Date;
    private _destroy$ = new Subject<boolean>();
    private _dropDownOverlaySettings: OverlaySettings;
    private _dialogOverlaySettings: OverlaySettings;

    private _prevSelectedHour: string;
    private _prevSelectedMinute: string;
    private _prevSelectedAmPm: string;

    private _onTouchedCallback: () => void = () => { };
    private _onChangeCallback: (_: Date) => void = () => { };

    /**
     * @hidden
    */
    get mask(): string {
        return this._mask || '00:00 LL';
    }

    set mask(val: string) {
        this._mask = val;
    }

    /**
     * @hidden
     */
    get displayValue(): string {
        if (this._displayValue === undefined) {
            return this._formatTime(this.value, this.format);
        }
        return this._displayValue;
    }

    set displayValue(value: string) {
        this._displayValue = value;
    }

    /**
     * Returns the current time formatted as string using the `format` option.
     * If there is no set time the return is an empty string.
     *```typescript
     *@ViewChild("MyChild")
     *private picker: IgxTimePickerComponent;
     *ngAfterViewInit(){
     *    let time = this.picker.displayTime;
     *}
     *```
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
    get hourView(): string[] {
        return this._hourView;
    }

    /**
     * @hidden
     */
    get minuteView(): string[] {
        return this._minuteView;
    }

    /**
     * @hidden
     */
    get ampmView(): string[] {
        return this._ampmView;
    }

    /**
     * @hidden
     */
    get showClearButton(): boolean {
        return (this.displayValue && this.displayValue !== this.parseMask(false)) || this.isNotEmpty;
    }

    /**
     * @hidden
     */
    get showHoursList(): boolean {
        return this.format.indexOf('h') !== - 1 || this.format.indexOf('H') !== - 1;
    }

    /**
     * @hidden
     */
    get showMinutesList(): boolean {
        return this.format.indexOf('m') !== - 1;
    }

    /**
     * @hidden
     */
    get showAmPmList(): boolean {
        return this.format.indexOf('t') !== - 1;
    }

    /**
     * @hidden
     */
    get validMinuteEntries(): any[] {
        const minuteEntries = [];
        for (let i = 0; i < 60; i++) {
            minuteEntries.push(i);
        }
        return minuteEntries;
    }

    /**
     * @hidden
     */
    get validHourEntries(): any[] {
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
     * @memberof IgxTimePickerComponent
     */
    get template(): TemplateRef<any> {
        if (this.timePickerTemplateDirective) {
            return this.timePickerTemplateDirective.template;
        }
        return this.mode === InteractionMode.Dialog ? this.defaultTimePickerTemplate : this.dropdownInputTemplate;
    }

    /**
     * Gets the context passed to the input group template.
     * @memberof IgxTimePickerComponent
     */
    get context() {
        return {
            value: this.value,
            displayTime: this.displayTime,
            displayValue: this.displayValue,
            openDialog: () => { this.openDialog(); }
        };
    }

    /**
     * @hidden
     */
    public ngOnInit(): void {
        this._generateHours();
        this._generateMinutes();
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
    }

    /**
     * @hidden
     */
    public ngAfterViewInit(): void {
        if (this.mode === InteractionMode.DropDown && this.input) {
            fromEvent(this.input.nativeElement, 'keydown').pipe(
                throttle(() => interval(0, animationFrameScheduler)),
                takeUntil(this._destroy$)
            ).subscribe((event: KeyboardEvent) => {
                if (event.key === KEYS.UP_ARROW || event.key === KEYS.UP_ARROW_IE ||
                    event.key === KEYS.DOWN_ARROW || event.key === KEYS.DOWN_ARROW_IE) {
                    this.spinOnEdit(event);
                }
            });
        }

        if (this.container && this.group) {
            this.container.nativeElement.style.width = this.group.element.nativeElement.getBoundingClientRect().width + 'px';
        }

        if (this.toggleRef) {
            this.toggleRef.onClosed.pipe(takeUntil(this._destroy$)).subscribe(() => {

                if (this._input) {
                    this._input.nativeElement.focus();
                }

                if (this.mode === InteractionMode.DropDown) {
                    this._onDropDownClosed();
                }

                this.onClosed.emit(this);

                // TODO: remove these two lines after deprecating 'onClose'
                onCloseWarningShown = showMessage(`'onClose' @Output property is deprecated. Use 'onClosed' instead.`, onCloseWarningShown);
                this.onClose.emit(this);
            });

            this.toggleRef.onOpened.pipe(takeUntil(this._destroy$)).subscribe(() => {
                this.onOpened.emit(this);

                // TODO: remove these two lines after deprecating 'onOpen'
                onOpenWarningShown = showMessage(`'onOpen' @Output property is deprecated. Use 'onOpened' instead.`, onOpenWarningShown);
                this.onOpen.emit(this);
            });

            this.toggleRef.onClosing.pipe(takeUntil(this._destroy$)).subscribe((event) => {
                this.onClosing.emit(event);
            });
        }
    }

    /**
     * @hidden
     */
    public ngOnDestroy(): void {
        this._destroy$.next(true);
        this._destroy$.complete();
    }

    /**
     * @hidden
     */
    @HostListener('keydown.spacebar', ['$event'])
    @HostListener('keydown.space', ['$event'])
    public onKeydownSpace(event) {
        this.openDialog();
        event.preventDefault();
    }

    /**
     * @hidden
     */
    @HostListener('keydown.Alt.ArrowDown')
    public onAltArrowDown() {
        this.openDialog();
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

            const leadZero = (viewType === 'hour') ? leadZeroHour : leadZeroMinute;
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
            let formattedMinute, formattedHour;

            const minute = value.getMinutes();
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

            formattedMinute = minute < 10 && format.indexOf('mm') !== -1 ? '0' + minute : `${minute}`;

            return format.replace('hh', formattedHour).replace('h', formattedHour)
                .replace('HH', formattedHour).replace('H', formattedHour)
                .replace('mm', formattedMinute).replace('m', formattedMinute)
                .replace('tt', amPM);
        }
    }

    private _updateHourView(start: any, end: any): void {
        this._hourView = this._viewToString(this._hourItems.slice(start, end), 'hour');
    }

    private _updateMinuteView(start: any, end: any): void {
        this._minuteView = this._viewToString(this._minuteItems.slice(start, end), 'minute');
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
        date.setSeconds(0);
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

    private _convertMinMaxValue(value: string): Date {
        const date = this.value ? new Date(this.value) : this._dateFromModel ? new Date(this._dateFromModel) : new Date();
        const sections = value.split(/[\s:]+/);
        let hour, minutes, amPM;

        date.setSeconds(0);

        if (this.showHoursList) {
            hour = sections[0];
            date.setHours(parseInt(hour, 10));
        }

        if (this.showMinutesList) {
            minutes = this.showHoursList ? sections[1] : sections[0];
            date.setMinutes(parseInt(minutes, 10));
        }

        if (this.showAmPmList) {
            amPM = sections[sections.length - 1];

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

    private _isValueValid(value: Date): boolean {
        if (this.maxValue && value > this._convertMinMaxValue(this.maxValue)) {
            return false;
        } else if (this.minValue && value < this._convertMinMaxValue(this.minValue)) {
            return false;
        } else {
            return true;
        }
    }

    private _isEntryValid(val: string): boolean {
        let validH = true;
        let validM = true;

        const sections = val.split(/[\s:]+/);
        const re = new RegExp(this.promptChar, 'g');

        if (this.showHoursList) {
            validH = this.validHourEntries.indexOf(parseInt(sections[0].replace(re, ''), 10)) !== -1;
        }

        if (this.showMinutesList) {
            const minutes = this.showHoursList ? sections[1] : sections[0];
            validM = this.validMinuteEntries.indexOf(parseInt(minutes.replace(re, ''), 10)) !== -1;
        }

        return validH && validM;
    }

    private _getCursorPosition(): number {
        return this.input.nativeElement.selectionStart;
    }

    private _setCursorPosition(start: number, end: number = start): void {
        this.input.nativeElement.setSelectionRange(start, end);
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
        if (this.selectedAmPm === undefined && this._ampmItems !== null) {
            this.selectedAmPm = this._ampmItems[3];
        }

        this._prevSelectedHour = this.selectedHour;
        this._prevSelectedMinute = this.selectedMinute;
        this._prevSelectedAmPm = this.selectedAmPm;

        this._onTouchedCallback();

        this._updateHourView(0, ITEMS_COUNT);
        this._updateMinuteView(0, ITEMS_COUNT);
        this._updateAmPmView(0, ITEMS_COUNT);

        if (this.selectedHour) {
            this.scrollHourIntoView(this.selectedHour);
        }
        if (this.selectedMinute) {
            this.scrollMinuteIntoView(this.selectedMinute);
        }
        if (this.selectedAmPm) {
            this.scrollAmPmIntoView(this.selectedAmPm);
        }

        requestAnimationFrame(() => {
            if (this.hourList) {
                this.hourList.nativeElement.focus();
            } else if (this.minuteList) {
                this.minuteList.nativeElement.focus();
            }
        });
    }

    private _onDropDownClosed(): void {
        const oldValue = this.value;
        const newVal = this._convertMinMaxValue(this.displayValue);

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

    /**
     * @hidden
     */
    getEditElement() {
        return this._input.nativeElement;
    }

    /**
     * @hidden
     */
    public writeValue(value: Date) {
        // use this flag to make sure that min/maxValue are checked (in _convertMinMaxValue() method)
        // against the real value when initializing the component and value is bound via ngModel
        this._dateFromModel = value;

        this.value = value;

        if (this.mode === InteractionMode.DropDown) {
            this.displayValue = this._formatTime(this.value, this.format);
        }
    }

    /**
     * @hidden
     */
    public registerOnChange(fn: (_: Date) => void) { this._onChangeCallback = fn; }

    /**
     * @hidden
     */
    public registerOnTouched(fn: () => void) { this._onTouchedCallback = fn; }

    /**
     * opens the dialog.
     * ```html
     *<igx-time-picker #timePicker></igx-time-picker>
     * ```
     * ```typescript
     * @ViewChild('timePicker', { read: IgxTimePickerComponent }) picker: IgxTimePickerComponent;
     * picker.openDialog();
     * ```
     */
    public openDialog(timePicker: IgxTimePickerComponent = this): void {
        if (this.toggleRef.collapsed) {
            let settings;
            if (this.mode === InteractionMode.Dialog) {
                settings = this.overlaySettings || this._dialogOverlaySettings;
            }

            if (this.mode === InteractionMode.DropDown) {
                settings = this.overlaySettings || this._dropDownOverlaySettings;
                const posStrategy = settings.positionStrategy;

                if (this.group && posStrategy) {
                    posStrategy.settings.target = this.group.element.nativeElement;
                } else if (this.templateDropDownTarget && posStrategy) {
                    posStrategy.settings.target = this.templateDropDownTarget.nativeElement;
                } else if (!posStrategy || (posStrategy && !posStrategy.settings.target)) {
                    throw new Error('There is no target element for the dropdown to attach.' +
                        'Mark a DOM element with #dropDownTarget ref variable or provide correct overlay positionStrategy.');
                }
            }

            if (this.outlet) {
                settings.outlet = this.outlet;
            }

            this.toggleRef.open(settings);
            this._initializeContainer();

        } else if (this.mode === InteractionMode.DropDown) {
            this.close();
        }
    }

    /**
     * Scrolls a hour item into view.
     * ```typescript
     *scrhintoView(picker) {
     *picker.scrollHourIntoView('2');
     *}
     * ```
     *```html
     *<igx-time-picker #picker format="h:mm tt" (onOpen)="scrhintoView(picker)"></igx-time-picker>
     *```
     *@param item to be scrolled in view.
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
     *scrMintoView(picker) {
     *picker.scrollMinuteIntoView('3');
     *}
     * ```
     *```html
     *<igx-time-picker #picker format="h:mm tt" (onOpen)="scrMintoView(picker)"></igx-time-picker>
     *```
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
     * Scrolls an ampm item into view.
     * ```typescript
     *scrAmPmIntoView(picker) {
     *picker.scrollAmPmIntoView('PM');
     *}
     * ```
     *```html
     *<igx-time-picker #picker format="h:mm tt" (onOpen)="scrAmPmIntoView(picker)"></igx-time-picker>
     *```
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
            this.displayValue = this._formatTime(this.value, this.format);
        }

        this.close();

        this.selectedHour = this._prevSelectedHour;
        this.selectedMinute = this._prevSelectedMinute;
        this.selectedAmPm = this._prevSelectedAmPm;
    }

    /**
     * Returns an array of the hours currently in view.
     *```html
     *@ViewChild("MyChild")
     *private picker: IgxTimePickerComponent;
     *ngAfterViewInit(){
     *    let hInView = this.picker.hoursInView;
     *}
     *```
     */
    public hoursInView(): string[] {
        return this._hourView.filter((hour) => hour !== '');
    }

    /**
     * Returns an array of the minutes currently in view.
     *```html
     *@ViewChild("MyChild")
     *private picker: IgxTimePickerComponent;
     *ngAfterViewInit(){
     *    let minInView = this.picker.minutesInView;
     *}
     *```
     */
    public minutesInView(): string[] {
        return this._minuteView.filter((minute) => minute !== '');
    }

    /**
     * Returns an array of the AM/PM currently in view.
     *```html
     *@ViewChild("MyChild")
     *private picker: IgxTimePickerComponent;
     *ngAfterViewInit(){
     *    let ApInView = this.picker.ampmInView;
     *}
     *```
     */
    public ampmInView(): string[] {
        return this._ampmView.filter((ampm) => ampm !== '');
    }

    /**
     * Closes the dropdown/dialog.
     * ```html
     *<igx-time-picker #timePicker></igx-time-picker>
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

            this.displayValue = '';
            this.value.setHours(0, 0);

            if (oldVal.getTime() !== this.value.getTime()) {
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
        const val = event.target.value;
        const oldVal = new Date(this.value);

        this.isNotEmpty = val !== this.parseMask(false);

        // handle cases where all empty positions (promts) are filled and we want to update
        // timepicker own value property if it is a valid Date
        if (val.indexOf(this.promptChar) === -1) {
            if (this._isEntryValid(val)) {
                const newVal = this._convertMinMaxValue(val);
                if (oldVal.getTime() !== newVal.getTime()) {
                    this.value = newVal;
                }
            } else {
                const args: IgxTimePickerValidationFailedEventArgs = {
                    timePicker: this,
                    currentValue: val,
                    setThroughUI: false
                };
                this.onValidationFailed.emit(args);
            }
            // handle cases where the user deletes the display value (when pressing backspace or delete)
        } else if (!this.value || !val || val === this.parseMask(false)) {
            this.isNotEmpty = false;

            this.value.setHours(0, 0);
            this.displayValue = val;

            if (oldVal.getTime() !== this.value.getTime()) {
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
        const value = event.target.value;

        this.isNotEmpty = value !== '';
        this.displayValue = value;

        if (value && value !== this.parseMask()) {
            if (this._isEntryValid(value)) {
                const newVal = this._convertMinMaxValue(value);
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

    /**
     * @hidden
     */
    public spinOnEdit(event): void {
        event.preventDefault();

        let sign: number;
        let displayVal: string;
        const currentVal = new Date(this.value);
        const min = this.minValue ? this._convertMinMaxValue(this.minValue) : this._convertMinMaxValue('00:00');
        const max = this.maxValue ? this._convertMinMaxValue(this.maxValue) : this._convertMinMaxValue('24:00');

        const cursor = this._getCursorPosition();

        if (event.key) {
            const key = event.key;
            sign = key === KEYS.DOWN_ARROW || key === KEYS.DOWN_ARROW_IE ? -1 : 1;
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

            if (this.showHoursList && HOURS_POS.indexOf(cursor) !== -1) {
                this.value = this._spinHours(currentVal, min, max, hDelta, sign);
            }

            if (this.showMinutesList &&
                ((this.showHoursList && MINUTES_POS.indexOf(cursor) !== -1) || (!this.showHoursList && HOURS_POS.indexOf(cursor) !== -1))) {
                    this.value = this._spinMinutes(currentVal, mDelta, sign);
            }

            if (this.showAmPmList) {
                if (((!this.showHoursList || !this.showMinutesList) && MINUTES_POS.indexOf(cursor) !== -1) ||
                    (this.showHoursList && this.showMinutesList &&  AMPM_POS.indexOf(cursor) !== -1)) {

                        const sections = this.displayValue.split(/[\s:]+/);
                        sign = sections[sections.length - 1] === 'AM' ? 1 : -1;
                        currentVal.setHours(currentVal.getHours() + (sign * 12));

                        this.value = currentVal;
                }
            }

            displayVal = this._formatTime(this.value, this.format);
        }

        // minor hack for preventing cursor jumping in IE
        this._displayValue = this.inputFormat.transform(displayVal);
        this.input.nativeElement.value = this._displayValue;
        this._setCursorPosition(cursor);

        requestAnimationFrame(() => {
            this._setCursorPosition(cursor);
        });
    }
}

/**
 * @hidden
 */
@NgModule({
    declarations: [
        IgxTimePickerComponent,
        IgxHourItemDirective,
        IgxItemListDirective,
        IgxMinuteItemDirective,
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
        TimeInputFormatPipe
    ],
    imports: [
        CommonModule,
        IgxInputGroupModule,
        IgxIconModule,
        IgxButtonModule,
        IgxMaskModule,
        IgxToggleModule
    ],
    providers: []
})
export class IgxTimePickerModule { }
