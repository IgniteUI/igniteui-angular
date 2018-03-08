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
import { IgxAmPmItemDirective, IgxHourItemDirective, IgxMinuteItemDirective } from "./time-picker.directives";

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
    styleUrls: ["time-picker.component.scss"],
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

    @Input() public vertical = false;

    @Input() public format = "hh:mm tt";

    @Output() public onValueChanged = new EventEmitter<any>();

    @Output() public onValidationFailed = new EventEmitter<any>();

    @Output() public onOpen = new EventEmitter();

    @ViewChild("hourList")
    private _hourList: ElementRef;

    @ViewChild("minuteList")
    private _minuteList: ElementRef;

    @ViewChild("ampmList")
    private _ampmList: ElementRef;

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

    public hourItems = [];
    public minuteItems = [];
    public ampmItems = [];

    public selectedHour: string;
    public selectedMinute: string;
    public selectedAmPm: string;

    private _prevSelectedHour: string;
    private _prevSelectedMinute: string;
    private _prevSelectedAmPm: string;

    /**
     * @hidden
     */
    @HostListener("keydown.arrowdown", ["$event"])
    public onKeydownArrowDown(event: KeyboardEvent) {
        event.preventDefault();

        const listName = event.srcElement.className;
        const selectedHourIndex = this.hourItems.indexOf(this.selectedHour);
        const selectedMinuteIndex = this.minuteItems.indexOf(this.selectedMinute);
        const selectedAmPmIndex = this.ampmItems.indexOf(this.selectedAmPm);

        if (listName.indexOf("hourList") !== -1 && selectedHourIndex + 1 < this.hourItems.length - 3) {
            this._scrollHourIntoView(selectedHourIndex + 1);
        } else if (listName.indexOf("minuteList") !== -1 && selectedMinuteIndex + 1 < this.minuteItems.length - 3) {
            this._scrollMinuteIntoView(selectedMinuteIndex + 1);
        } else if (listName.indexOf("ampmList") !== -1 && selectedAmPmIndex + 1 < this.ampmItems.length - 3) {
            this._scrollAmPmIntoView(selectedAmPmIndex + 1);
        }
    }

    /**
     * @hidden
     */
    @HostListener("keydown.arrowup", ["$event"])
    public onKeydownArrowUp(event: KeyboardEvent) {
        event.preventDefault();

        const listName = event.srcElement.className;
        const selectedHourIndex = this.hourItems.indexOf(this.selectedHour);
        const selectedMinuteIndex = this.minuteItems.indexOf(this.selectedMinute);
        const selectedAmPmIndex = this.ampmItems.indexOf(this.selectedAmPm);

        if (listName.indexOf("hourList") !== -1 && selectedHourIndex > 3) {
            this._scrollHourIntoView(selectedHourIndex - 1);
        } else if (listName.indexOf("minuteList") !== -1 && selectedMinuteIndex > 3) {
            this._scrollMinuteIntoView(selectedMinuteIndex - 1);
        } else if (listName.indexOf("ampmList") !== -1 && selectedAmPmIndex > 3) {
            this._scrollAmPmIntoView(selectedAmPmIndex - 1);
        }
    }

    /**
     * @hidden
     */
    @HostListener("keydown.arrowright", ["$event"])
    public onKeydownArrowRight(event: KeyboardEvent) {
        event.preventDefault();

        const listName = event.srcElement.className;

        if (listName.indexOf("hourList") !== -1) {
            this._minuteList.nativeElement.focus();
        } else if (listName.indexOf("minuteList") !== -1 && this.ampmItems.length !== 0) {
            this._ampmList.nativeElement.focus();
        }
    }

    /**
     * @hidden
     */
    @HostListener("keydown.arrowleft", ["$event"])
    public onKeydownArrowLeft(event: KeyboardEvent) {
        event.preventDefault();

        const listName = event.srcElement.className;

        if (listName.indexOf("minuteList") !== -1) {
            this._hourList.nativeElement.focus();
        } else if (listName.indexOf("ampmList") !== -1) {
            this._minuteList.nativeElement.focus();
        }
    }

    /**
     * @hidden
     */
    @HostListener("keydown.enter", ["$event"])
    public onKeydownEnter(event: KeyboardEvent) {
        event.preventDefault();

        this.OKButtonClick();
    }

    /**
     * @hidden
     */
    @HostListener("keydown.escape", ["$event"])
    public onKeydownEscape(event: KeyboardEvent) {
        event.preventDefault();

        this.CancelButtonClick();
    }

    /**
     * @hidden
     */
    @HostListener("keydown.tab", ["$event"])
    public onKeydownTab(event: KeyboardEvent) {

        const listName = event.srcElement.className;

        if (listName.indexOf("hourList") !== -1) {
            event.preventDefault();
            this._minuteList.nativeElement.focus();
        } else if (listName.indexOf("minuteList") !== -1) {
            event.preventDefault();
            this._ampmList.nativeElement.focus();
        } else if (listName.indexOf("ampmList") !== -1) {
            this._ampmList.nativeElement.blur();
        }
    }

    /**
     * @hidden
     */
    @HostListener("keydown.shift.tab", ["$event"])
    public onKeydownShiftTab(event: KeyboardEvent) {

        const listName = event.srcElement.className;

        if (listName.indexOf("minuteList") !== -1) {
            event.preventDefault();
            this._hourList.nativeElement.focus();
        } else if (listName.indexOf("ampmList") !== -1) {
            event.preventDefault();
            this._minuteList.nativeElement.focus();
        } else if (event.srcElement.innerHTML.indexOf(this.cancelButtonLabel) !== -1) {
            event.preventDefault();
            this._ampmList.nativeElement.focus();
        }
    }

    public get displayTime(): string {
        if (this.value) {
            return this._formatTime(this.value, this.format);
        }

        return "";
    }

    public onClick(): void {
        if (this.value !== undefined) {
            const foramttedTime = this._formatTime(this.value, this.format);
            const sections = foramttedTime.split(/[\s:]+/);

            this.selectedHour = sections[0];
            this.selectedMinute = sections[1];

            if (this.ampmItems !== null) {
                this.selectedAmPm = sections[2];
            }
        }

        if (this.selectedHour === undefined) {
            this.selectedHour = this.hourItems[3].toString();
        }
        if (this.selectedMinute === undefined) {
            this.selectedMinute = this.minuteItems[3].toString();
        }
        if (this.selectedAmPm === undefined && this.ampmItems !== null) {
            this.selectedAmPm = this.ampmItems[3];
        }

        this._prevSelectedHour = this.selectedHour;
        this._prevSelectedMinute = this.selectedMinute;
        this._prevSelectedAmPm = this.selectedAmPm;

        this._alert.open();
        this._onTouchedCallback();

        setTimeout(() => {
            if (this.selectedHour) {
                this._scrollHourIntoView(this.hourItems.indexOf(this.selectedHour));
                this._hourList.nativeElement.focus();
            }
            if (this.selectedMinute) {
                this._scrollMinuteIntoView(this.minuteItems.indexOf(this.selectedMinute));
            }
            if (this.selectedAmPm) {
                this._scrollAmPmIntoView(this.ampmItems.indexOf(this.selectedAmPm));
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

    public onHourClicked(item): void {
        if (item !== "") {
            this._scrollHourIntoView(this.hourItems.indexOf(item));
        }
    }

    public onMinuteClicked(item): void {
        if (item !== "") {
            this._scrollMinuteIntoView(this.minuteItems.indexOf(item));
        }
    }

    public onAmPmClicked(item): void {
        if (item !== "") {
            this._scrollAmPmIntoView(this.ampmItems.indexOf(item));
        }
    }

    private _scrollHourIntoView(index): void {
        this._hourList.nativeElement.children[index].scrollIntoView({block: "center"});
        this.selectedHour = this.hourItems[index];
    }

    private _scrollMinuteIntoView(index): void {
        this._minuteList.nativeElement.children[index].scrollIntoView({block: "center"});
        this.selectedMinute = this.minuteItems[index];
    }

    private _scrollAmPmIntoView(index): void {
        this._ampmList.nativeElement.children[index].scrollIntoView({block: "center"});
        this.selectedAmPm = this.ampmItems[index];
    }

    public onHourWheel(event): void {
        const selectedIndex = this.hourItems.indexOf(this.selectedHour);

        if (event.deltaY > 0) {
            this._nextHour();
        } else if (event.deltaY < 0) {
            this._prevHour();
        }
    }

    public onHourPan(event): void {
        const selectedIndex = this.hourItems.indexOf(this.selectedHour);

        if (event.deltaY < 0) {
            this._nextHour();
        } else if (event.deltaY > 0) {
            this._prevHour();
        }
    }

    public onMinuteWheel(event): void {
        const selectedIndex = this.minuteItems.indexOf(this.selectedMinute);

        if (event.deltaY > 0) {
            this._nextMinute();
        } else if (event.deltaY < 0) {
            this._prevMinute();
        }
    }

    public onMinutePan(event): void {
        const selectedIndex = this.minuteItems.indexOf(this.selectedMinute);

        if (event.deltaY < 0) {
            this._nextMinute();
        } else if (event.deltaY > 0) {
            this._prevMinute();
        }
    }

    public onAmPmWheel(event): void {
        const selectedIndex = this.ampmItems.indexOf(this.selectedAmPm);

        if (event.deltaY > 0) {
            this._nextAmPm();
        } else if (event.deltaY < 0) {
            this._prevAmPm();
        }
    }

    public onAmPmPan(event): void {
        const selectedIndex = this.ampmItems.indexOf(this.selectedAmPm);

        if (event.deltaY < 0) {
            this._nextAmPm();
        } else if (event.deltaY > 0) {
            this._prevAmPm();
        }
    }

    private _nextHour() {
        const selectedIndex = this.hourItems.indexOf(this.selectedHour);

        if (selectedIndex + 1 < this.hourItems.length - 3) {
            this._scrollHourIntoView(selectedIndex + 1);
        }
    }

    private _prevHour() {
        const selectedIndex = this.hourItems.indexOf(this.selectedHour);

        if (selectedIndex > 3) {
            this._scrollHourIntoView(selectedIndex - 1);
        }
    }

    private _nextMinute() {
        const selectedIndex = this.minuteItems.indexOf(this.selectedMinute);

        if (selectedIndex + 1 < this.minuteItems.length - 3) {
            this._scrollMinuteIntoView(selectedIndex + 1);
        }
    }

    private _prevMinute() {
        const selectedIndex = this.minuteItems.indexOf(this.selectedMinute);

        if (selectedIndex > 3) {
            this._scrollMinuteIntoView(selectedIndex - 1);
        }
    }

    private _nextAmPm() {
        const selectedIndex = this.ampmItems.indexOf(this.selectedAmPm);

        if (selectedIndex + 1 < this.ampmItems.length - 3) {
            this._scrollAmPmIntoView(selectedIndex + 1);
        }
    }

    private _prevAmPm() {
        const selectedIndex = this.ampmItems.indexOf(this.selectedAmPm);

        if (selectedIndex > 3) {
            this._scrollAmPmIntoView(selectedIndex - 1);
        }
    }

    public onListHover(event): void {
        if (event.currentTarget.className.indexOf("hour") !== -1) {
            this._hourList.nativeElement.focus();
        } else if (event.currentTarget.className.indexOf("minute") !== -1) {
            this._minuteList.nativeElement.focus();
        } else {
            this._ampmList.nativeElement.focus();
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

        this._addEmptyItems(this.hourItems);

        for (i; i < hourItemsCount; i++) {
            if (i * this.itemsDelta.hours < 10 && (this.format.indexOf("hh") !== -1 || this.format.indexOf("HH") !== -1)) {
                this.hourItems.push("0" + (i * this.itemsDelta.hours).toString());
            } else {
                this.hourItems.push((i * this.itemsDelta.hours).toString());
            }
        }

        this._addEmptyItems(this.hourItems);
    }

    private _generateMinutes(): void {
        const minuteItemsCount = 60 / this.itemsDelta.minutes;

        this._addEmptyItems(this.minuteItems);

        for (let i = 0; i < minuteItemsCount; i++) {
            if (i * this.itemsDelta.minutes < 10 && this.format.indexOf("mm") !== -1) {
                this.minuteItems.push("0" + (i * this.itemsDelta.minutes).toString());
            } else {
                this.minuteItems.push((i * this.itemsDelta.minutes).toString());
            }
        }

        this._addEmptyItems(this.minuteItems);
    }

    private _generateAmPm(): void {

        this._addEmptyItems(this.ampmItems);

        this.ampmItems.push("AM");
        this.ampmItems.push("PM");

        this._addEmptyItems(this.ampmItems);
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
}

@NgModule({
    declarations: [
        IgxTimePickerComponent,
        IgxHourItemDirective,
        IgxMinuteItemDirective,
        IgxAmPmItemDirective
    ],
    exports: [
        IgxTimePickerComponent,
        IgxHourItemDirective,
        IgxMinuteItemDirective,
        IgxAmPmItemDirective
    ],
    imports: [
        CommonModule,
        IgxInputModule,
        IgxDialogModule
    ],
    providers: []
})
export class IgxTimePickerModule { }
