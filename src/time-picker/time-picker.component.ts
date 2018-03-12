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

    @Input() public isSpinLoop = false;

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

    private _hourItems = [];
    private _minuteItems = [];
    private _ampmItems = [];

    public hourView = [];
    public minuteView = [];
    public ampmView = [];

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

        const listName = (event.target as HTMLElement).className;
        const selectedHourIndex = this._hourItems.indexOf(this.selectedHour);
        const selectedMinuteIndex = this._minuteItems.indexOf(this.selectedMinute);
        const selectedAmPmIndex = this._ampmItems.indexOf(this.selectedAmPm);

        if (listName.indexOf("hourList") !== -1 && selectedHourIndex + 1 < this._hourItems.length - 3) {
            this.scrollHourIntoView(this._hourItems[selectedHourIndex + 1])
        } else if (listName.indexOf("minuteList") !== -1 && selectedMinuteIndex + 1 < this._minuteItems.length - 3) {
            this.scrollMinuteIntoView(this._minuteItems[selectedMinuteIndex + 1]);
        } else if (listName.indexOf("ampmList") !== -1 && selectedAmPmIndex + 1 < this._ampmItems.length - 3) {
            this.scrollAmPmIntoView(this._ampmItems[selectedAmPmIndex + 1]);
        }
    }

    /**
     * @hidden
     */
    @HostListener("keydown.arrowup", ["$event"])
    public onKeydownArrowUp(event: KeyboardEvent) {
        event.preventDefault();

        const listName = (event.target as HTMLElement).className;
        const selectedHourIndex = this._hourItems.indexOf(this.selectedHour);
        const selectedMinuteIndex = this._minuteItems.indexOf(this.selectedMinute);
        const selectedAmPmIndex = this._ampmItems.indexOf(this.selectedAmPm);

        if (listName.indexOf("hourList") !== -1 && selectedHourIndex > 3) {
            this.scrollHourIntoView(this._hourItems[selectedHourIndex - 1])
        } else if (listName.indexOf("minuteList") !== -1 && selectedMinuteIndex > 3) {
            this.scrollMinuteIntoView(this._minuteItems[selectedMinuteIndex - 1]);
        } else if (listName.indexOf("ampmList") !== -1 && selectedAmPmIndex > 3) {
            this.scrollAmPmIntoView(this._ampmItems[selectedAmPmIndex - 1]);
        }
    }

    /**
     * @hidden
     */
    @HostListener("keydown.arrowright", ["$event"])
    public onKeydownArrowRight(event: KeyboardEvent) {
        event.preventDefault();

        const listName = (event.target as HTMLElement).className;

        if (listName.indexOf("hourList") !== -1) {
            this._minuteList.nativeElement.focus();
        } else if (listName.indexOf("minuteList") !== -1 && this._ampmItems.length !== 0) {
            this._ampmList.nativeElement.focus();
        }
    }

    /**
     * @hidden
     */
    @HostListener("keydown.arrowleft", ["$event"])
    public onKeydownArrowLeft(event: KeyboardEvent) {
        event.preventDefault();

        const listName = (event.target as HTMLElement).className;

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
                this._hourList.nativeElement.focus();
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
        this._generateHours(!this.isSpinLoop);
        this._generateMinutes(!this.isSpinLoop);
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
            this.scrollHourIntoView(item);
        }
    }

    public onMinuteClicked(item): void {
        if (item !== "") {
            this.scrollMinuteIntoView(item);
        }
    }

    public onAmPmClicked(item): void {
        if (item !== "") {
            this.scrollAmPmIntoView(item);
        }
    }

    /**
     * Scrolls a hour item into view.
     * @param item to be scrolled in view.
     */
    public scrollHourIntoView(item: string): void {
        const index = this._hourItems.indexOf(item);
        this._updateHourView(index - 3, index + 4);
        this.selectedHour = this._hourItems[index];
    }

    /**
     * Scrolls a minute item into view.
     * @param item to be scrolled in view.
     */
    public scrollMinuteIntoView(item: string): void {
        const index = this._minuteItems.indexOf(item);
        this._updateMinuteView(index - 3, index + 4);
        this.selectedMinute = this._minuteItems[index];
    }

    /**
     * Scrolls an ampm item into view.
     * @param item to be scrolled in view.
     */
    public scrollAmPmIntoView(item: string): void {
        const index = this._ampmItems.indexOf(item);
        this._updateAmPmView(index - 3, index + 4);
        this.selectedAmPm = this._ampmItems[index];
    }

    public onHourWheel(event): void {
        const selectedIndex = this._hourItems.indexOf(this.selectedHour);

        if (event.deltaY > 0) {
            this._nextHour();
        } else if (event.deltaY < 0) {
            this._prevHour();
        }
    }

    public onHourPan(event): void {
        const selectedIndex = this._hourItems.indexOf(this.selectedHour);

        if (event.deltaY < 0) {
            this._nextHour();
        } else if (event.deltaY > 0) {
            this._prevHour();
        }
    }

    public onMinuteWheel(event): void {
        const selectedIndex = this._minuteItems.indexOf(this.selectedMinute);

        if (event.deltaY > 0) {
            this._nextMinute();
        } else if (event.deltaY < 0) {
            this._prevMinute();
        }
    }

    public onMinutePan(event): void {
        const selectedIndex = this._minuteItems.indexOf(this.selectedMinute);

        if (event.deltaY < 0) {
            this._nextMinute();
        } else if (event.deltaY > 0) {
            this._prevMinute();
        }
    }

    public onAmPmWheel(event): void {
        const selectedIndex = this._ampmItems.indexOf(this.selectedAmPm);

        if (event.deltaY > 0) {
            this._nextAmPm();
        } else if (event.deltaY < 0) {
            this._prevAmPm();
        }
    }

    public onAmPmPan(event): void {
        const selectedIndex = this._ampmItems.indexOf(this.selectedAmPm);

        if (event.deltaY < 0) {
            this._nextAmPm();
        } else if (event.deltaY > 0) {
            this._prevAmPm();
        }
    }

    private _nextHour() {
        const selectedIndex = this._hourItems.indexOf(this.selectedHour);

        // if (this.isSpinLoop) {
        //     if (selectedIndex + 4 < 6) {
        //         this.hourView = this._hourItems.slice(this._hourItems.length - selectedIndex + 4, this._hourItems.length);
        //         this.hourView = this._hourItems.slice(0, selectedIndex + 5);
        //         this.hourView.
        //     }
        // } else
        if (selectedIndex + 1 < this._hourItems.length - 3) {
            this._updateHourView(selectedIndex - 2, selectedIndex + 5);
            this.selectedHour = this._hourItems[selectedIndex + 1];
        }
    }

    private _prevHour() {
        const selectedIndex = this._hourItems.indexOf(this.selectedHour);

        if (selectedIndex > 3) {
            this._updateHourView(selectedIndex - 4, selectedIndex + 3);
            this.selectedHour = this._hourItems[selectedIndex - 1];
        }
    }

    private _nextMinute() {
        const selectedIndex = this._minuteItems.indexOf(this.selectedMinute);

        if (selectedIndex + 1 < this._minuteItems.length - 3) {
            this._updateMinuteView(selectedIndex - 2, selectedIndex + 5);
            this.selectedMinute = this._minuteItems[selectedIndex + 1];
        }
    }

    private _prevMinute() {
        const selectedIndex = this._minuteItems.indexOf(this.selectedMinute);

        if (selectedIndex > 3) {
            this._updateMinuteView(selectedIndex - 4, selectedIndex + 3);
            this.selectedMinute = this._minuteItems[selectedIndex - 1];
        }
    }

    private _nextAmPm() {
        const selectedIndex = this._ampmItems.indexOf(this.selectedAmPm);

        if (selectedIndex + 1 < this._ampmItems.length - 3) {
            this._updateAmPmView(selectedIndex - 2, selectedIndex + 5);
            this.selectedAmPm = this._ampmItems[selectedIndex + 1];
        }
    }

    private _prevAmPm() {
        const selectedIndex = this._ampmItems.indexOf(this.selectedAmPm);

        if (selectedIndex > 3) {
            this._updateAmPmView(selectedIndex - 4, selectedIndex + 3);
            this.selectedAmPm = this._ampmItems[selectedIndex - 1];
        }
    }

    public onHover(event): void {
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

    private _updateHourView(start: any, end: any): void {
        this.hourView = this._hourItems.slice(start, end);
    }

    private _updateMinuteView(start: any, end: any): void {
        this.minuteView = this._minuteItems.slice(start, end);
    }

    private _updateAmPmView(start: any, end: any): void {
        this.ampmView = this._ampmItems.slice(start, end);
    }

    private _addEmptyItems(items: string[]): void {
        for (let i = 0; i < 3; i++) {
            items.push("");
        }
    }

    private _generateHours(addEmptyItems: boolean): void {
        let hourItemsCount = 24;
        if (this.format.indexOf("h") !== -1) {
            hourItemsCount = 13;
        }

        hourItemsCount /= this.itemsDelta.hours;

        let i = this.format.indexOf("H") !== -1 ? 0 : 1;

        if (addEmptyItems) {
            this._addEmptyItems(this._hourItems);
        }

        for (i; i < hourItemsCount; i++) {
            if (i * this.itemsDelta.hours < 10 && (this.format.indexOf("hh") !== -1 || this.format.indexOf("HH") !== -1)) {
                this._hourItems.push("0" + (i * this.itemsDelta.hours).toString());
            } else {
                this._hourItems.push((i * this.itemsDelta.hours).toString());
            }
        }

        if (addEmptyItems) {
            this._addEmptyItems(this._hourItems);
        }
    }

    private _generateMinutes(addEmptyItems: boolean): void {
        const minuteItemsCount = 60 / this.itemsDelta.minutes;

        if (addEmptyItems) {
            this._addEmptyItems(this._minuteItems);
        }

        for (let i = 0; i < minuteItemsCount; i++) {
            if (i * this.itemsDelta.minutes < 10 && this.format.indexOf("mm") !== -1) {
                this._minuteItems.push("0" + (i * this.itemsDelta.minutes).toString());
            } else {
                this._minuteItems.push((i * this.itemsDelta.minutes).toString());
            }
        }

        if (addEmptyItems) {
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
