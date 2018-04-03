import {
    CommonModule
} from "@angular/common";
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
    ViewEncapsulation
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { HAMMER_GESTURE_CONFIG, HammerGestureConfig } from "@angular/platform-browser";
import { IgxDialogComponent, IgxDialogModule } from "../dialog/dialog.component";
import { IgxIconModule } from "../icon";
import { IgxInputGroupModule } from "../input-group/input-group.component";
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
        }
    ],
    selector: "igx-time-picker",
    templateUrl: "time-picker.component.html"
})
export class IgxTimePickerComponent implements ControlValueAccessor, OnInit, OnDestroy {

    private _value: Date;

    @Input()
    set value(value: Date) {
        if (this._isValueValid(value)) {
            this._value = value;
            this._onChangeCallback(value);
        } else {
            const args: IgxTimePickerValidationFailedEventArgs = {
                timePicker: this,
                currentValue: value,
                setThroughUI: false
            };
            this.onValidationFailed.emit(args);
        }
    }

    get value(): Date {
        return this._value;
    }

    @Input()
    public isDisabled = false;

    @Input()
    public okButtonLabel = "OK";

    @Input()
    public cancelButtonLabel = "Cancel";

    @Input()
    public itemsDelta = { hours: 1, minutes: 1 };

    @Input()
    public minValue: string;

    @Input()
    public maxValue: string;

    @Input()
    public isSpinLoop = true;

    @Input()
    public vertical = false;

    @Input()
    public format = "hh:mm tt";

    @Output()
    public onValueChanged = new EventEmitter<IgxTimePickerValueChangedEventArgs>();

    @Output()
    public onValidationFailed = new EventEmitter<IgxTimePickerValidationFailedEventArgs>();

    @Output()
    public onOpen = new EventEmitter<IgxTimePickerComponent>();

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
        if (this.value) {
            const foramttedTime = this._formatTime(this.value, this.format);
            const sections = foramttedTime.split(/[\s:]+/);

            this.selectedHour = sections[0];
            this.selectedMinute = sections[1];

            if (this._ampmItems !== null) {
                this.selectedAmPm = sections[2];
            }
        }

        if (this.selectedHour === undefined) {
            this.selectedHour = `${this._hourItems[3]}`;
        }
        if (this.selectedMinute === undefined) {
            this.selectedMinute = `${this._minuteItems[3]}`;
        }
        if (this.selectedAmPm === undefined && this._ampmItems !== null) {
            this.selectedAmPm = this._ampmItems[3];
        }

        this._prevSelectedHour = this.selectedHour;
        this._prevSelectedMinute = this.selectedMinute;
        this._prevSelectedAmPm = this.selectedAmPm;

        this._alert.open();
        this._onTouchedCallback();

        this._updateHourView(0, 7);
        this._updateMinuteView(0, 7);
        this._updateAmPmView(0, 7);

        if (this.selectedHour) {
            this.scrollHourIntoView(this.selectedHour);
        }
        if (this.selectedMinute) {
            this.scrollMinuteIntoView(this.selectedMinute);
        }
        if (this.selectedAmPm) {
            this.scrollAmPmIntoView(this.selectedAmPm);
        }

        setTimeout(() => {
            this.hourList.nativeElement.focus();
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

    private _onTouchedCallback: () => void = () => { };

    private _onChangeCallback: (_: Date) => void = () => { };

    private _scrollItemIntoView(item: string, items: any[], selectedItem: string, isListLoop: boolean, viewType: string): any {
        let itemIntoView;
        if (items) {
            const index = (item === "AM" || item === "PM") ? items.indexOf(item) : items.indexOf(parseInt(item, 10));
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
            if (typeof (view[i]) !== "string") {
                view[i] = this._itemToString(view[i], viewType);
            }
        }
        return view;
    }

    private _itemToString(item: any, viewType: string): string {
        if (item === null) {
            item = "";
        } else if (viewType && typeof (item) !== "string") {
            const leadZeroHour = (item < 10 && (this.format.indexOf("hh") !== -1 || this.format.indexOf("HH") !== -1));
            const leadZeroMinute = (item < 10 && this.format.indexOf("mm") !== -1);

            const leadZero = (viewType === "hour") ? leadZeroHour : leadZeroMinute;
            item = (leadZero) ? "0" + item : `${item}`;
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
            return "";
        } else {
            let hour = value.getHours();
            const minute = value.getMinutes();
            let formattedMinute;
            let formattedHour;
            let amPM;

            if (format.indexOf("h") !== -1) {
                amPM = (hour > 11) ? "PM" : "AM";

                if (hour > 12) {
                    hour -= 12;
                    formattedHour = hour < 10 && format.indexOf("hh") !== -1 ? "0" + hour : `${hour}`;
                } else if (hour === 0) {
                    formattedHour = "12";
                } else if (hour < 10 && format.indexOf("hh") !== -1) {
                    formattedHour = "0" + hour;
                } else {
                    formattedHour = `${hour}`;
                }
            } else {
                if (hour < 10 && format.indexOf("HH") !== -1) {
                    formattedHour = "0" + hour;
                } else {
                    formattedHour = `${hour}`;
                }
            }

            formattedMinute = minute < 10 && format.indexOf("mm") !== -1 ? "0" + minute : `${minute}`;

            return format.replace("hh", formattedHour).replace("h", formattedHour)
                .replace("HH", formattedHour).replace("H", formattedHour)
                .replace("mm", formattedMinute).replace("m", formattedMinute)
                .replace("tt", amPM);
        }
    }

    private _updateHourView(start: any, end: any): void {
        this._hourView = this._viewToString(this._hourItems.slice(start, end), "hour");
    }

    private _updateMinuteView(start: any, end: any): void {
        this._minuteView = this._viewToString(this._minuteItems.slice(start, end), "minute");
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
        if (this.format.indexOf("h") !== -1) {
            hourItemsCount = 13;
        }

        hourItemsCount /= this.itemsDelta.hours;

        let i = this.format.indexOf("H") !== -1 ? 0 : 1;

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

    private _isValueValid(value: Date): boolean {
        if (this.maxValue && value > this._convertMinMaxValue(this.maxValue)) {
            return false;
        } else if (this.minValue && value < this._convertMinMaxValue(this.minValue)) {
            return false;
        } else {
            return true;
        }
    }

    /**
     * Scrolls a hour item into view.
     * @param item to be scrolled in view.
     */
    public scrollHourIntoView(item: string): void {
        const hourIntoView = this._scrollItemIntoView(item, this._hourItems, this.selectedHour, this._isHourListLoop, "hour");
        if (hourIntoView) {
            this._hourView = hourIntoView.view;
            this.selectedHour = hourIntoView.selectedItem;
        }
    }

    /**
     * Scrolls a minute item into view.
     * @param item to be scrolled in view.
     */
    public scrollMinuteIntoView(item: string): void {
        const minuteIntoView = this._scrollItemIntoView(item, this._minuteItems, this.selectedMinute, this._isMinuteListLoop, "minute");
        if (minuteIntoView) {
            this._minuteView = minuteIntoView.view;
            this.selectedMinute = minuteIntoView.selectedItem;
        }
    }

    /**
     * Scrolls an ampm item into view.
     * @param item to be scrolled in view.
     */
    public scrollAmPmIntoView(item: string): void {
        const ampmIntoView = this._scrollItemIntoView(item, this._ampmItems, this.selectedAmPm, false, null);
        if (ampmIntoView) {
            this._ampmView = ampmIntoView.view;
            this.selectedAmPm = ampmIntoView.selectedItem;
        }
    }

    /**
     * @hidden
     */
    public nextHour() {
        const nextHour = this._nextItem(this._hourItems, this.selectedHour, this._isHourListLoop, "hour");
        this._hourView = nextHour.view;
        this.selectedHour = nextHour.selectedItem;
    }

    /**
     * @hidden
     */
    public prevHour() {
        const prevHour = this._prevItem(this._hourItems, this.selectedHour, this._isHourListLoop, "hour");
        this._hourView = prevHour.view;
        this.selectedHour = prevHour.selectedItem;
    }

    /**
     * @hidden
     */
    public nextMinute() {
        const nextMinute = this._nextItem(this._minuteItems, this.selectedMinute, this._isMinuteListLoop, "minute");
        this._minuteView = nextMinute.view;
        this.selectedMinute = nextMinute.selectedItem;
    }

    /**
     * @hidden
     */
    public prevMinute() {
        const prevMinute = this._prevItem(this._minuteItems, this.selectedMinute, this._isMinuteListLoop, "minute");
        this._minuteView = prevMinute.view;
        this.selectedMinute = prevMinute.selectedItem;
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

    public okButtonClick(): void {
        if (this._isValueValid(this._getSelectedTime())) {
            this._alert.close();
            const oldValue = this.value;
            this.value = this._getSelectedTime();
            const args: IgxTimePickerValueChangedEventArgs = {
                oldValue,
                newValue: this.value
            };
            this.onValueChanged.emit(args);
        } else {
            const args: IgxTimePickerValidationFailedEventArgs = {
                timePicker: this,
                currentValue: this._getSelectedTime(),
                setThroughUI: true
            };
            this.onValidationFailed.emit(args);
        }
    }

    public cancelButtonClick(): void {
        this._alert.close();
        this.selectedHour = this._prevSelectedHour;
        this.selectedMinute = this._prevSelectedMinute;
        this.selectedAmPm = this._prevSelectedAmPm;
    }

    public hoursInView(): string[] {
        return this._hourView.filter((hour) => hour !== "");
    }

    public minutesInView(): string[] {
        return this._minuteView.filter((minute) => minute !== "");
    }

    public ampmInView(): string[] {
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
        IgxInputGroupModule,
        IgxDialogModule,
        IgxIconModule
    ],
    providers: []
})
export class IgxTimePickerModule { }
