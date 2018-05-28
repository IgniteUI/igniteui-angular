var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { CommonModule } from "@angular/common";
import { Component, ElementRef, EventEmitter, HostBinding, Input, NgModule, Output, ViewChild } from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { HAMMER_GESTURE_CONFIG, HammerGestureConfig } from "@angular/platform-browser";
import { IgxDialogComponent, IgxDialogModule } from "../dialog/dialog.component";
import { IgxIconModule } from "../icon";
import { IgxInputGroupModule } from "../input-group/input-group.component";
import { IgxAmPmItemDirective, IgxHourItemDirective, IgxItemListDirective, IgxMinuteItemDirective } from "./time-picker.directives";
var NEXT_ID = 0;
var TimePickerHammerConfig = (function (_super) {
    __extends(TimePickerHammerConfig, _super);
    function TimePickerHammerConfig() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.overrides = {
            pan: { direction: Hammer.DIRECTION_VERTICAL, threshold: 1 }
        };
        return _this;
    }
    return TimePickerHammerConfig;
}(HammerGestureConfig));
export { TimePickerHammerConfig };
var IgxTimePickerComponent = (function () {
    function IgxTimePickerComponent() {
        this.id = "igx-time-picker-" + NEXT_ID++;
        this.isDisabled = false;
        this.okButtonLabel = "OK";
        this.cancelButtonLabel = "Cancel";
        this.itemsDelta = { hours: 1, minutes: 1 };
        this.isSpinLoop = true;
        this.vertical = false;
        this.format = "hh:mm tt";
        this.onValueChanged = new EventEmitter();
        this.onValidationFailed = new EventEmitter();
        this.onOpen = new EventEmitter();
        this._hourItems = [];
        this._minuteItems = [];
        this._ampmItems = [];
        this._isHourListLoop = this.isSpinLoop;
        this._isMinuteListLoop = this.isSpinLoop;
        this._hourView = [];
        this._minuteView = [];
        this._ampmView = [];
        this._onTouchedCallback = function () { };
        this._onChangeCallback = function () { };
    }
    Object.defineProperty(IgxTimePickerComponent.prototype, "value", {
        get: function () {
            return this._value;
        },
        set: function (value) {
            if (this._isValueValid(value)) {
                this._value = value;
                this._onChangeCallback(value);
            }
            else {
                var args = {
                    timePicker: this,
                    currentValue: value,
                    setThroughUI: false
                };
                this.onValidationFailed.emit(args);
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxTimePickerComponent.prototype, "styleClass", {
        get: function () {
            if (this.vertical) {
                return "igx-time-picker--vertical";
            }
            return "igx-time-picker";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxTimePickerComponent.prototype, "displayTime", {
        get: function () {
            if (this.value) {
                return this._formatTime(this.value, this.format);
            }
            return "";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxTimePickerComponent.prototype, "hourView", {
        get: function () {
            return this._hourView;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxTimePickerComponent.prototype, "minuteView", {
        get: function () {
            return this._minuteView;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxTimePickerComponent.prototype, "ampmView", {
        get: function () {
            return this._ampmView;
        },
        enumerable: true,
        configurable: true
    });
    IgxTimePickerComponent.prototype.onClick = function () {
        var _this = this;
        if (this.value) {
            var foramttedTime = this._formatTime(this.value, this.format);
            var sections = foramttedTime.split(/[\s:]+/);
            this.selectedHour = sections[0];
            this.selectedMinute = sections[1];
            if (this._ampmItems !== null) {
                this.selectedAmPm = sections[2];
            }
        }
        if (this.selectedHour === undefined) {
            this.selectedHour = "" + this._hourItems[3];
        }
        if (this.selectedMinute === undefined) {
            this.selectedMinute = "" + this._minuteItems[3];
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
        setTimeout(function () {
            _this.hourList.nativeElement.focus();
        });
        this.onOpen.emit(this);
    };
    IgxTimePickerComponent.prototype.ngOnInit = function () {
        this._generateHours();
        this._generateMinutes();
        if (this.format.indexOf("tt") !== -1) {
            this._generateAmPm();
        }
    };
    IgxTimePickerComponent.prototype.ngOnDestroy = function () {
    };
    IgxTimePickerComponent.prototype.writeValue = function (value) {
        this.value = value;
    };
    IgxTimePickerComponent.prototype.registerOnChange = function (fn) { this._onChangeCallback = fn; };
    IgxTimePickerComponent.prototype.registerOnTouched = function (fn) { this._onTouchedCallback = fn; };
    IgxTimePickerComponent.prototype._scrollItemIntoView = function (item, items, selectedItem, isListLoop, viewType) {
        var itemIntoView;
        if (items) {
            var index = (item === "AM" || item === "PM") ? items.indexOf(item) : items.indexOf(parseInt(item, 10));
            var view = void 0;
            if (index !== -1) {
                if (isListLoop) {
                    if (index > 0) {
                        selectedItem = this._itemToString(items[index - 1], viewType);
                        itemIntoView = this._nextItem(items, selectedItem, isListLoop, viewType);
                    }
                    else {
                        selectedItem = this._itemToString(items[1], viewType);
                        itemIntoView = this._prevItem(items, selectedItem, isListLoop, viewType);
                    }
                }
                else {
                    view = items.slice(index - 3, index + 4);
                    selectedItem = this._itemToString(items[index], viewType);
                    itemIntoView = { selectedItem: selectedItem, view: view };
                }
                itemIntoView.view = this._viewToString(itemIntoView.view, viewType);
            }
        }
        return itemIntoView;
    };
    IgxTimePickerComponent.prototype._viewToString = function (view, viewType) {
        for (var i = 0; i < view.length; i++) {
            if (typeof (view[i]) !== "string") {
                view[i] = this._itemToString(view[i], viewType);
            }
        }
        return view;
    };
    IgxTimePickerComponent.prototype._itemToString = function (item, viewType) {
        if (item === null) {
            item = "";
        }
        else if (viewType && typeof (item) !== "string") {
            var leadZeroHour = (item < 10 && (this.format.indexOf("hh") !== -1 || this.format.indexOf("HH") !== -1));
            var leadZeroMinute = (item < 10 && this.format.indexOf("mm") !== -1);
            var leadZero = (viewType === "hour") ? leadZeroHour : leadZeroMinute;
            item = (leadZero) ? "0" + item : "" + item;
        }
        return item;
    };
    IgxTimePickerComponent.prototype._prevItem = function (items, selectedItem, isListLoop, viewType) {
        var selectedIndex = items.indexOf(parseInt(selectedItem, 10));
        var itemsCount = items.length;
        var view;
        if (selectedIndex === -1) {
            view = items.slice(0, 7);
            selectedItem = items[3];
        }
        else if (isListLoop) {
            if (selectedIndex - 4 < 0) {
                view = items.slice(itemsCount - (4 - selectedIndex), itemsCount);
                view = view.concat(items.slice(0, selectedIndex + 3));
            }
            else if (selectedIndex + 4 > itemsCount) {
                view = items.slice(selectedIndex - 4, itemsCount);
                view = view.concat(items.slice(0, selectedIndex + 3 - itemsCount));
            }
            else {
                view = items.slice(selectedIndex - 4, selectedIndex + 3);
            }
            selectedItem = (selectedIndex === 0) ? items[itemsCount - 1] : items[selectedIndex - 1];
        }
        else if (selectedIndex > 3) {
            view = items.slice(selectedIndex - 4, selectedIndex + 3);
            selectedItem = items[selectedIndex - 1];
        }
        else if (selectedIndex === 3) {
            view = items.slice(0, 7);
        }
        view = this._viewToString(view, viewType);
        selectedItem = this._itemToString(selectedItem, viewType);
        return {
            selectedItem: selectedItem,
            view: view
        };
    };
    IgxTimePickerComponent.prototype._nextItem = function (items, selectedItem, isListLoop, viewType) {
        var selectedIndex = items.indexOf(parseInt(selectedItem, 10));
        var itemsCount = items.length;
        var view;
        if (selectedIndex === -1) {
            view = items.slice(0, 7);
            selectedItem = items[3];
        }
        else if (isListLoop) {
            if (selectedIndex < 2) {
                view = items.slice(itemsCount - (2 - selectedIndex), itemsCount);
                view = view.concat(items.slice(0, selectedIndex + 5));
            }
            else if (selectedIndex + 4 >= itemsCount) {
                view = items.slice(selectedIndex - 2, itemsCount);
                view = view.concat(items.slice(0, selectedIndex + 5 - itemsCount));
            }
            else {
                view = items.slice(selectedIndex - 2, selectedIndex + 5);
            }
            selectedItem = (selectedIndex === itemsCount - 1) ? items[0] : items[selectedIndex + 1];
        }
        else if (selectedIndex + 1 < itemsCount - 3) {
            view = items.slice(selectedIndex - 2, selectedIndex + 5);
            selectedItem = items[selectedIndex + 1];
        }
        else if (selectedIndex === itemsCount - 4) {
            view = items.slice(selectedIndex - 3, itemsCount);
        }
        view = this._viewToString(view, viewType);
        selectedItem = this._itemToString(selectedItem, viewType);
        return {
            selectedItem: selectedItem,
            view: view
        };
    };
    IgxTimePickerComponent.prototype._formatTime = function (value, format) {
        if (!value) {
            return "";
        }
        else {
            var hour = value.getHours();
            var minute = value.getMinutes();
            var formattedMinute = void 0;
            var formattedHour = void 0;
            var amPM = void 0;
            if (format.indexOf("h") !== -1) {
                amPM = (hour > 11) ? "PM" : "AM";
                if (hour > 12) {
                    hour -= 12;
                    formattedHour = hour < 10 && format.indexOf("hh") !== -1 ? "0" + hour : "" + hour;
                }
                else if (hour === 0) {
                    formattedHour = "12";
                }
                else if (hour < 10 && format.indexOf("hh") !== -1) {
                    formattedHour = "0" + hour;
                }
                else {
                    formattedHour = "" + hour;
                }
            }
            else {
                if (hour < 10 && format.indexOf("HH") !== -1) {
                    formattedHour = "0" + hour;
                }
                else {
                    formattedHour = "" + hour;
                }
            }
            formattedMinute = minute < 10 && format.indexOf("mm") !== -1 ? "0" + minute : "" + minute;
            return format.replace("hh", formattedHour).replace("h", formattedHour)
                .replace("HH", formattedHour).replace("H", formattedHour)
                .replace("mm", formattedMinute).replace("m", formattedMinute)
                .replace("tt", amPM);
        }
    };
    IgxTimePickerComponent.prototype._updateHourView = function (start, end) {
        this._hourView = this._viewToString(this._hourItems.slice(start, end), "hour");
    };
    IgxTimePickerComponent.prototype._updateMinuteView = function (start, end) {
        this._minuteView = this._viewToString(this._minuteItems.slice(start, end), "minute");
    };
    IgxTimePickerComponent.prototype._updateAmPmView = function (start, end) {
        this._ampmView = this._ampmItems.slice(start, end);
    };
    IgxTimePickerComponent.prototype._addEmptyItems = function (items) {
        for (var i = 0; i < 3; i++) {
            items.push(null);
        }
    };
    IgxTimePickerComponent.prototype._generateHours = function () {
        var hourItemsCount = 24;
        if (this.format.indexOf("h") !== -1) {
            hourItemsCount = 13;
        }
        hourItemsCount /= this.itemsDelta.hours;
        var i = this.format.indexOf("H") !== -1 ? 0 : 1;
        if (hourItemsCount < 7 || !this.isSpinLoop) {
            this._addEmptyItems(this._hourItems);
            this._isHourListLoop = false;
        }
        if (hourItemsCount > 1) {
            for (i; i < hourItemsCount; i++) {
                this._hourItems.push(i * this.itemsDelta.hours);
            }
        }
        else {
            this._hourItems.push(0);
        }
        if (hourItemsCount < 7 || !this.isSpinLoop) {
            this._addEmptyItems(this._hourItems);
        }
    };
    IgxTimePickerComponent.prototype._generateMinutes = function () {
        var minuteItemsCount = 60 / this.itemsDelta.minutes;
        if (minuteItemsCount < 7 || !this.isSpinLoop) {
            this._addEmptyItems(this._minuteItems);
            this._isMinuteListLoop = false;
        }
        for (var i = 0; i < minuteItemsCount; i++) {
            this._minuteItems.push(i * this.itemsDelta.minutes);
        }
        if (minuteItemsCount < 7 || !this.isSpinLoop) {
            this._addEmptyItems(this._minuteItems);
        }
    };
    IgxTimePickerComponent.prototype._generateAmPm = function () {
        this._addEmptyItems(this._ampmItems);
        this._ampmItems.push("AM");
        this._ampmItems.push("PM");
        this._addEmptyItems(this._ampmItems);
    };
    IgxTimePickerComponent.prototype._getSelectedTime = function () {
        var date = new Date();
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
    };
    IgxTimePickerComponent.prototype._convertMinMaxValue = function (value) {
        var date = new Date();
        var sections = value.split(/[\s:]+/);
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
    };
    IgxTimePickerComponent.prototype._isValueValid = function (value) {
        if (this.maxValue && value > this._convertMinMaxValue(this.maxValue)) {
            return false;
        }
        else if (this.minValue && value < this._convertMinMaxValue(this.minValue)) {
            return false;
        }
        else {
            return true;
        }
    };
    IgxTimePickerComponent.prototype.scrollHourIntoView = function (item) {
        var hourIntoView = this._scrollItemIntoView(item, this._hourItems, this.selectedHour, this._isHourListLoop, "hour");
        if (hourIntoView) {
            this._hourView = hourIntoView.view;
            this.selectedHour = hourIntoView.selectedItem;
        }
    };
    IgxTimePickerComponent.prototype.scrollMinuteIntoView = function (item) {
        var minuteIntoView = this._scrollItemIntoView(item, this._minuteItems, this.selectedMinute, this._isMinuteListLoop, "minute");
        if (minuteIntoView) {
            this._minuteView = minuteIntoView.view;
            this.selectedMinute = minuteIntoView.selectedItem;
        }
    };
    IgxTimePickerComponent.prototype.scrollAmPmIntoView = function (item) {
        var ampmIntoView = this._scrollItemIntoView(item, this._ampmItems, this.selectedAmPm, false, null);
        if (ampmIntoView) {
            this._ampmView = ampmIntoView.view;
            this.selectedAmPm = ampmIntoView.selectedItem;
        }
    };
    IgxTimePickerComponent.prototype.nextHour = function () {
        var nextHour = this._nextItem(this._hourItems, this.selectedHour, this._isHourListLoop, "hour");
        this._hourView = nextHour.view;
        this.selectedHour = nextHour.selectedItem;
    };
    IgxTimePickerComponent.prototype.prevHour = function () {
        var prevHour = this._prevItem(this._hourItems, this.selectedHour, this._isHourListLoop, "hour");
        this._hourView = prevHour.view;
        this.selectedHour = prevHour.selectedItem;
    };
    IgxTimePickerComponent.prototype.nextMinute = function () {
        var nextMinute = this._nextItem(this._minuteItems, this.selectedMinute, this._isMinuteListLoop, "minute");
        this._minuteView = nextMinute.view;
        this.selectedMinute = nextMinute.selectedItem;
    };
    IgxTimePickerComponent.prototype.prevMinute = function () {
        var prevMinute = this._prevItem(this._minuteItems, this.selectedMinute, this._isMinuteListLoop, "minute");
        this._minuteView = prevMinute.view;
        this.selectedMinute = prevMinute.selectedItem;
    };
    IgxTimePickerComponent.prototype.nextAmPm = function () {
        var selectedIndex = this._ampmItems.indexOf(this.selectedAmPm);
        if (selectedIndex + 1 < this._ampmItems.length - 3) {
            this._updateAmPmView(selectedIndex - 2, selectedIndex + 5);
            this.selectedAmPm = this._ampmItems[selectedIndex + 1];
        }
    };
    IgxTimePickerComponent.prototype.prevAmPm = function () {
        var selectedIndex = this._ampmItems.indexOf(this.selectedAmPm);
        if (selectedIndex > 3) {
            this._updateAmPmView(selectedIndex - 4, selectedIndex + 3);
            this.selectedAmPm = this._ampmItems[selectedIndex - 1];
        }
    };
    IgxTimePickerComponent.prototype.okButtonClick = function () {
        if (this._isValueValid(this._getSelectedTime())) {
            this._alert.close();
            var oldValue = this.value;
            this.value = this._getSelectedTime();
            var args = {
                oldValue: oldValue,
                newValue: this.value
            };
            this.onValueChanged.emit(args);
            return true;
        }
        else {
            var args = {
                timePicker: this,
                currentValue: this._getSelectedTime(),
                setThroughUI: true
            };
            this.onValidationFailed.emit(args);
            return false;
        }
    };
    IgxTimePickerComponent.prototype.cancelButtonClick = function () {
        this._alert.close();
        this.selectedHour = this._prevSelectedHour;
        this.selectedMinute = this._prevSelectedMinute;
        this.selectedAmPm = this._prevSelectedAmPm;
    };
    IgxTimePickerComponent.prototype.hoursInView = function () {
        return this._hourView.filter(function (hour) { return hour !== ""; });
    };
    IgxTimePickerComponent.prototype.minutesInView = function () {
        return this._minuteView.filter(function (minute) { return minute !== ""; });
    };
    IgxTimePickerComponent.prototype.ampmInView = function () {
        return this._ampmView.filter(function (ampm) { return ampm !== ""; });
    };
    IgxTimePickerComponent.decorators = [
        { type: Component, args: [{
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
                    template: "<igx-input-group (click)=\"onClick()\">     <igx-prefix>         <igx-icon>access_time</igx-icon>     </igx-prefix>     <label igxLabel>Time</label>     <input igxInput [value]=\"displayTime\" [disabled]=\"isDisabled\" tabindex=\"0\" readonly /> </igx-input-group> <ng-container *ngTemplateOutlet=\"scroll\"></ng-container> <ng-template #scroll>     <igx-dialog class=\"igx-time-picker__dialog-popup\" closeOnOutsideSelect=\"true\" [leftButtonLabel]=\"cancelButtonLabel\" (onLeftButtonSelect)=\"cancelButtonClick()\"         [rightButtonLabel]=\"okButtonLabel\" (onRightButtonSelect)=\"okButtonClick()\">         <ng-container #container>             <div class=\"igx-time-picker__wrapper\">                 <div class=\"igx-time-picker__header\">                     <h5 class=\"igx-time-picker__header-ampm\">{{ selectedAmPm }}</h5>                     <h2 class=\"igx-time-picker__header-hour\">                         <span>{{ selectedHour }}</span>:<span>{{ selectedMinute }}</span>                     </h2>                 </div>                 <div class=\"igx-time-picker__body\">                     <div #hourList [igxItemList]=\"'hourList'\">                         <span [igxHourItem]=\"hour\" *ngFor=\"let hour of hourView\">{{ hour }}</span>                     </div>                     <div #minuteList [igxItemList]=\"'minuteList'\">                         <span [igxMinuteItem]=\"minute\" *ngFor=\"let minute of minuteView\">{{ minute }}</span>                     </div>                     <div #ampmList [igxItemList]=\"'ampmList'\">                         <span [igxAmPmItem]=\"ampm\" *ngFor=\"let ampm of ampmView\">{{ ampm }}</span>                     </div>                 </div>             </div>         </ng-container>     </igx-dialog> </ng-template>"
                },] },
    ];
    IgxTimePickerComponent.propDecorators = {
        "id": [{ type: HostBinding, args: ["attr.id",] }, { type: Input },],
        "value": [{ type: Input },],
        "isDisabled": [{ type: Input },],
        "okButtonLabel": [{ type: Input },],
        "cancelButtonLabel": [{ type: Input },],
        "itemsDelta": [{ type: Input },],
        "minValue": [{ type: Input },],
        "maxValue": [{ type: Input },],
        "isSpinLoop": [{ type: Input },],
        "vertical": [{ type: Input },],
        "format": [{ type: Input },],
        "onValueChanged": [{ type: Output },],
        "onValidationFailed": [{ type: Output },],
        "onOpen": [{ type: Output },],
        "hourList": [{ type: ViewChild, args: ["hourList",] },],
        "minuteList": [{ type: ViewChild, args: ["minuteList",] },],
        "ampmList": [{ type: ViewChild, args: ["ampmList",] },],
        "_alert": [{ type: ViewChild, args: [IgxDialogComponent,] },],
        "styleClass": [{ type: HostBinding, args: ["class",] },],
    };
    return IgxTimePickerComponent;
}());
export { IgxTimePickerComponent };
var IgxTimePickerModule = (function () {
    function IgxTimePickerModule() {
    }
    IgxTimePickerModule.decorators = [
        { type: NgModule, args: [{
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
                },] },
    ];
    return IgxTimePickerModule;
}());
export { IgxTimePickerModule };
