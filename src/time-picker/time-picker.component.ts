import {
    CommonModule
} from "@angular/common";
import {
    Component,
    ComponentFactoryResolver,
    ComponentRef,
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
    ViewContainerRef,
    ViewEncapsulation
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { HAMMER_GESTURE_CONFIG, HammerGestureConfig } from "@angular/platform-browser";
import { IgxDialogComponent, IgxDialogModule } from "../dialog/dialog.component";
import { IgxInputModule } from "../directives/input/input.directive";
import {
    IgxAmPmItemDirective,
    IgxHourItemDirective,
    IgxItemListDirective,
    IgxMinuteItemDirective
} from "./time-picker.directives";

export class TimePickerHammerConfig extends HammerGestureConfig {
    public overrides = {
        pan: { direction: Hammer.DIRECTION_VERTICAL, threshold: 1 }
    };
}

@Component({
    encapsulation: ViewEncapsulation.None,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: IgxTimePickerComponent,
            multi: true
        },
        {
            provide: HAMMER_GESTURE_CONFIG,
            useClass: TimePickerHammerConfig
        }
    ],
    selector: "igx-time-picker",
    templateUrl: "time-picker.component.html"
})
export class IgxTimePickerComponent implements ControlValueAccessor, OnInit, OnDestroy {

    @Input() public isDisabled = false;

    @Input() public okButtonLabel = "OK";

    @Input() public cancelButtonLabel = "Cancel";

    @Input() public value: Date;

    @Input() public itemsDelta = {hours: 1, minutes: 1};

    @Input() public minValue: string;

    @Input() public maxValue: string;

    @Input() public isSpinLoop = true;

    @Input() public vertical = false;

    @Input() public format = "hh:mm tt";

    @Output() public onValueChanged = new EventEmitter<any>();

    @Output() public onValidationFailed = new EventEmitter<any>();

    @Output() public onOpen = new EventEmitter();

    @ViewChild("hourList")
    public hourList: ElementRef;

    @ViewChild("minuteList")
    public minuteList: ElementRef;

    @ViewChild("ampmList")
    public ampmList: ElementRef;

    @ViewChild(IgxDialogComponent)
    private _alert: IgxDialogComponent;

    /**
     * The default css class applied to the component.
     *
     * @hidden
     */
    @HostBinding("class")
    get styleClass(): string {
        if (this.vertical) {
            return "igx-time-picker--vertical";
        }
        return "igx-time-picker";
    }

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

    private _isHourListLoop = this.isSpinLoop;
    private _isMinuteListLoop = this.isSpinLoop;

    private _hourView = [];
    private _minuteView = [];
    private _ampmView = [];

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

    private _prevSelectedHour: string;
    private _prevSelectedMinute: string;
    private _prevSelectedAmPm: string;

    public get displayTime(): string {
        if (this.value) {
            return this._formatTime(this.value, this.format);
        }

        return "";
    }

    get hourView(): string[] {
        return this._hourView;
    }

    get minuteView(): string[] {
        return this._minuteView;
    }

    get ampmView(): string[] {
        return this._ampmView;
    }

    public onClick(): void {
        if (this.value !== undefined) {
            const foramttedTime = this._formatTime(this.value, this.format);
            const sections = foramttedTime.split(/[\s:]+/);

            this.selectedHour = sections[0];
            this.selectedMinute = sections[1];

            if (this._ampmItems !== null) {
                this.selectedAmPm = sections[2];
            }
        }

        if (this.selectedHour === undefined) {
            this.selectedHour = this._hourItems[3].toString();
        }
        if (this.selectedMinute === undefined) {
            this.selectedMinute = this._minuteItems[3].toString();
        }
        if (this.selectedAmPm === undefined && this._ampmItems !== null) {
            this.selectedAmPm = this._ampmItems[3];
        }

        this._prevSelectedHour = this.selectedHour;
        this._prevSelectedMinute = this.selectedMinute;
        this._prevSelectedAmPm = this.selectedAmPm;

        this._updateHourView(0, 7);
        this._updateMinuteView(0, 7);
        this._updateAmPmView(0, 7);

        this._alert.open();
        this._onTouchedCallback();

        setTimeout(() => {
            if (this.selectedHour) {
                this.scrollHourIntoView(this.selectedHour);
                this.hourList.nativeElement.focus();
            }
            if (this.selectedMinute) {
                this.scrollMinuteIntoView(this.selectedMinute);
            }
            if (this.selectedAmPm) {
                this.scrollAmPmIntoView(this.selectedAmPm);
            }
        });

        this.onOpen.emit(this);
    }

    public ngOnInit(): void {
        this._generateHours();
        this._generateMinutes();
        if (this.format.indexOf("tt") !== -1) {
            this._generateAmPm();
        }
    }

    public ngOnDestroy(): void {
    }

    public writeValue(value: Date) {
        this.value = value;
    }

    public registerOnChange(fn: (_: Date) => void) { this._onChangeCallback = fn; }

    public registerOnTouched(fn: () => void) { this._onTouchedCallback = fn; }

    private _onTouchedCallback: () => void = () => {};

    private _onChangeCallback: (_: Date) => void = () => {};

    /**
     * Scrolls a hour item into view.
     * @param item to be scrolled in view.
     */
    public scrollHourIntoView(item: string): void {
        const index = this._hourItems.indexOf(item);

        if (index !== -1) {
            if (this._isHourListLoop) {
                if (index > 0) {
                    this.selectedHour = this._hourItems[index - 1];
                    this.nextHour();
                } else {
                    this.selectedHour = this._hourItems[1];
                    this.prevHour();
                }
            } else {
                this._updateHourView(index - 3, index + 4);
                this.selectedHour = this._hourItems[index];
            }
        }
    }

    /**
     * Scrolls a minute item into view.
     * @param item to be scrolled in view.
     */
    public scrollMinuteIntoView(item: string): void {
        const index = this._minuteItems.indexOf(item);

        if (index !== -1) {
            if (this._isMinuteListLoop) {
                if (index > 0) {
                    this.selectedMinute = this._minuteItems[index - 1];
                    this.nextMinute();
                } else {
                    this.selectedMinute = this._minuteItems[1];
                    this.prevMinute();
                }
            } else {
                this._updateMinuteView(index - 3, index + 4);
                this.selectedMinute = this._minuteItems[index];
            }
        }
    }

    /**
     * Scrolls an ampm item into view.
     * @param item to be scrolled in view.
     */
    public scrollAmPmIntoView(item: string): void {
        const index = this._ampmItems.indexOf(item);

        if (index !== -1) {
            this._updateAmPmView(index - 3, index + 4);
            this.selectedAmPm = this._ampmItems[index];
        }
    }

    /**
     * @hidden
     */
    public nextHour() {
        const selectedIndex = this._hourItems.indexOf(this.selectedHour);
        const hourItemsCount = this._hourItems.length;

        if (this._isHourListLoop) {
            if (selectedIndex < 2) {
                this._hourView = this._hourItems.slice(hourItemsCount - (2 - selectedIndex), hourItemsCount);
                this._hourView = this._hourView.concat(this._hourItems.slice(0, selectedIndex + 5));
            } else if (selectedIndex + 4 >= hourItemsCount) {
                this._hourView = this._hourItems.slice(selectedIndex - 2, hourItemsCount);
                this._hourView = this._hourView.concat(this._hourItems.slice(0, selectedIndex + 5 - hourItemsCount));
            } else {
                this._updateHourView(selectedIndex - 2, selectedIndex + 5);
            }

            this.selectedHour = (selectedIndex === 0) ? this._hourItems[0] : this._hourItems[selectedIndex + 1];
        } else if (selectedIndex + 1 < hourItemsCount - 3) {
            this._updateHourView(selectedIndex - 2, selectedIndex + 5);
            this.selectedHour = this._hourItems[selectedIndex + 1];
        }
    }

    /**
     * @hidden
     */
    public prevHour() {
        const selectedIndex = this._hourItems.indexOf(this.selectedHour);
        const hourItemsCount = this._hourItems.length;

        if (this._isHourListLoop) {
            if (selectedIndex - 4 < 0) {
                this._hourView = this._hourItems.slice(hourItemsCount - (4 - selectedIndex), hourItemsCount);
                this._hourView = this._hourView.concat(this._hourItems.slice(0, selectedIndex + 3));
            } else if (selectedIndex + 4 > hourItemsCount) {
                this._hourView = this._hourItems.slice(selectedIndex - 4, hourItemsCount);
                this._hourView = this._hourView.concat(this._hourItems.slice(0, selectedIndex + 3 - hourItemsCount));
            } else {
                this._updateHourView(selectedIndex - 4, selectedIndex + 3);
            }

            this.selectedHour = (selectedIndex === 0) ? this._hourItems[hourItemsCount - 1] : this._hourItems[selectedIndex - 1];
        } else if (selectedIndex > 3) {
            this._updateHourView(selectedIndex - 4, selectedIndex + 3);
            this.selectedHour = this._hourItems[selectedIndex - 1];
        }
    }

    /**
     * @hidden
     */
    public nextMinute() {
        const selectedIndex = this._minuteItems.indexOf(this.selectedMinute);
        const minuteItemsCount = this._minuteItems.length;

        if (this._isMinuteListLoop) {
            if (selectedIndex < 2) {
                this._minuteView = this._minuteItems.slice(minuteItemsCount - (2 - selectedIndex), minuteItemsCount);
                this._minuteView = this._minuteView.concat(this._minuteItems.slice(0, selectedIndex + 5));
            } else if (selectedIndex + 4 >= minuteItemsCount) {
                this._minuteView = this._minuteItems.slice(selectedIndex - 2, minuteItemsCount);
                this._minuteView = this._minuteView.concat(this._minuteItems.slice(0, selectedIndex + 5 - minuteItemsCount));
            } else {
                this._updateMinuteView(selectedIndex - 2, selectedIndex + 5);
            }

            this.selectedMinute = (selectedIndex === 0) ? this._minuteItems[0] : this._minuteItems[selectedIndex + 1];
        } else if (selectedIndex + 1 < minuteItemsCount - 3) {
            this._updateMinuteView(selectedIndex - 2, selectedIndex + 5);
            this.selectedMinute = this._minuteItems[selectedIndex + 1];
        }
    }

    /**
     * @hidden
     */
    public prevMinute() {
        const selectedIndex = this._minuteItems.indexOf(this.selectedMinute);
        const minuteItemsCount = this._minuteItems.length;

        if (this._isMinuteListLoop) {
            if (selectedIndex - 4 < 0) {
                this._minuteView = this._minuteItems.slice(minuteItemsCount - (4 - selectedIndex), minuteItemsCount);
                this._minuteView = this._minuteView.concat(this._minuteItems.slice(0, selectedIndex + 3));
            } else if (selectedIndex + 4 > minuteItemsCount) {
                this._minuteView = this._minuteItems.slice(selectedIndex - 4, minuteItemsCount);
                this._minuteView = this._minuteView.concat(this._minuteItems.slice(0, selectedIndex + 3 - minuteItemsCount));
            } else {
                this._updateMinuteView(selectedIndex - 4, selectedIndex + 3);
            }

            this.selectedMinute = (selectedIndex === 0) ? this._minuteItems[minuteItemsCount - 1] : this._minuteItems[selectedIndex - 1];
        } else if (selectedIndex > 3) {
            this._updateMinuteView(selectedIndex - 4, selectedIndex + 3);
            this.selectedMinute = this._minuteItems[selectedIndex - 1];
        }
    }

    /**
     * @hidden
     */
    public nextAmPm() {
        const selectedIndex = this._ampmItems.indexOf(this.selectedAmPm);

        if (selectedIndex + 1 < this._ampmItems.length - 3) {
            this._updateAmPmView(selectedIndex - 2, selectedIndex + 5);
            this.selectedAmPm = this._ampmItems[selectedIndex + 1];
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
        }
    }

    private _formatTime(value: Date, format: string): string {
        if (value) {
            let hour = value.getHours();
            const minute = value.getMinutes();
            let formattedMinute;
            let formattedHour;
            let amPM;

            if (format.indexOf("h") !== -1) {
                amPM = (hour > 11) ? "PM" : "AM";

                if (hour > 12) {
                    hour -= 12;
                    formattedHour = hour < 10 && format.indexOf("hh") !== -1 ? "0" + hour : hour.toString();
                } else if (hour === 0) {
                    formattedHour = "12";
                } else if (hour < 10 && format.indexOf("hh") !== -1) {
                    formattedHour = "0" + hour;
                } else {
                    formattedHour = hour.toString();
                }
            } else {
                if (hour < 10 && format.indexOf("HH") !== -1) {
                    formattedHour = "0" + hour;
                } else {
                    formattedHour = hour.toString();
                }
            }

            formattedMinute = minute < 10 && format.indexOf("mm") !== -1 ? "0" + minute : minute.toString();

            return format.replace("hh", formattedHour).replace("h", formattedHour)
                        .replace("HH", formattedHour).replace("H", formattedHour)
                        .replace("mm", formattedMinute).replace("m", formattedMinute)
                        .replace("tt" , amPM);
        } else {
            return format;
        }
    }

    private _updateHourView(start: any, end: any): void {
        this._hourView = this._hourItems.slice(start, end);
    }

    private _updateMinuteView(start: any, end: any): void {
        this._minuteView = this._minuteItems.slice(start, end);
    }

    private _updateAmPmView(start: any, end: any): void {
        this._ampmView = this._ampmItems.slice(start, end);
    }

    private _addEmptyItems(items: string[]): void {
        for (let i = 0; i < 3; i++) {
            items.push("");
        }
    }

    private _generateHours(): void {
        let hourItemsCount = 24;
        if (this.format.indexOf("h") !== -1) {
            hourItemsCount = 13;
        }

        hourItemsCount /= this.itemsDelta.hours;

        let i = this.format.indexOf("H") !== -1 ? 0 : 1;

        if (hourItemsCount < 7 || !this.isSpinLoop) {
            this._addEmptyItems(this._hourItems);
            this._isHourListLoop = false;
        }

        for (i; i < hourItemsCount; i++) {
            if (i * this.itemsDelta.hours < 10 && (this.format.indexOf("hh") !== -1 || this.format.indexOf("HH") !== -1)) {
                this._hourItems.push("0" + (i * this.itemsDelta.hours).toString());
            } else {
                this._hourItems.push((i * this.itemsDelta.hours).toString());
            }
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
            if (i * this.itemsDelta.minutes < 10 && this.format.indexOf("mm") !== -1) {
                this._minuteItems.push("0" + (i * this.itemsDelta.minutes).toString());
            } else {
                this._minuteItems.push((i * this.itemsDelta.minutes).toString());
            }
        }

        if (minuteItemsCount < 7 || !this.isSpinLoop) {
            this._addEmptyItems(this._minuteItems);
        }
    }

    private _generateAmPm(): void {

        this._addEmptyItems(this._ampmItems);

        this._ampmItems.push("AM");
        this._ampmItems.push("PM");

        this._addEmptyItems(this._ampmItems);
    }

    private _getSelectedTime(): Date {
        const date = new Date();
        date.setHours(parseInt(this.selectedHour, 10));
        date.setMinutes(parseInt(this.selectedMinute, 10));
        date.setSeconds(0);
        if (this.selectedAmPm === "PM" && this.selectedHour !== "12") {
            date.setHours(date.getHours() + 12);
        }
        if (this.selectedAmPm === "AM" && this.selectedHour === "12") {
            date.setHours(0);
        }
        return date;
    }

    private _convertMinMaxValue(value: string): Date {
        const date = new Date();
        const sections = value.split(/[\s:]+/);

        date.setHours(parseInt(sections[0], 10));
        date.setMinutes(parseInt(sections[1], 10));
        date.setSeconds(0);
        if (sections[2] && sections[2] === "PM" && sections[0] !== "12") {
            date.setHours(date.getHours() + 12);
        }
        if (sections[2] && sections[2] && sections[0] === "12") {
            date.setHours(0);
        }

        return date;
    }

    private _isValueValid(): boolean {
       if (this.maxValue && this._getSelectedTime() > this._convertMinMaxValue(this.maxValue)) {
            return false;
       } else if (this.minValue && this._getSelectedTime() < this._convertMinMaxValue(this.minValue)) {
            return false;
       } else {
           return true;
       }
    }

    public OKButtonClick(): void {
        if (this._isValueValid()) {
            this._alert.close();
            this.value = this._getSelectedTime();
            this.onValueChanged.emit(this.value);
        } else {
            this.onValidationFailed.emit({timePicker: this, currentValue: this._getSelectedTime()});
        }
    }

    public CancelButtonClick(): void {
        this._alert.close();
        this.selectedHour = this._prevSelectedHour;
        this.selectedMinute = this._prevSelectedMinute;
        this.selectedAmPm = this._prevSelectedAmPm;
    }

    public HoursInView(): string[] {
        return this._hourView.filter((hour) => hour !== "");
    }

    public MinutesInView(): string[] {
        return this._minuteView.filter((minute) => minute !== "");
    }

    public AmPmInView(): string[] {
        return this._ampmView.filter((ampm) => ampm !== "");
    }
}

@NgModule({
    declarations: [
        IgxTimePickerComponent,
        IgxHourItemDirective,
        IgxItemListDirective,
        IgxMinuteItemDirective,
        IgxAmPmItemDirective
    ],
    exports: [
        IgxTimePickerComponent
    ],
    imports: [
        CommonModule,
        IgxInputModule,
        IgxDialogModule
    ],
    providers: []
})
export class IgxTimePickerModule { }
