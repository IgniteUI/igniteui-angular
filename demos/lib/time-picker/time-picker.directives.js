import { Directive, ElementRef, forwardRef, Host, HostBinding, HostListener, Inject, Input } from "@angular/core";
import { IgxTimePickerComponent } from "./time-picker.component";
var IgxItemListDirective = (function () {
    function IgxItemListDirective(timePicker, elementRef) {
        this.timePicker = timePicker;
        this.elementRef = elementRef;
        this.tabindex = 0;
    }
    Object.defineProperty(IgxItemListDirective.prototype, "defaultCSS", {
        get: function () {
            return true;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxItemListDirective.prototype, "hourCSS", {
        get: function () {
            return this.type === "hourList";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxItemListDirective.prototype, "minuteCSS", {
        get: function () {
            return this.type === "minuteList";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxItemListDirective.prototype, "ampmCSS", {
        get: function () {
            return this.type === "ampmList";
        },
        enumerable: true,
        configurable: true
    });
    IgxItemListDirective.prototype.onFocus = function () {
        this.isActive = true;
    };
    IgxItemListDirective.prototype.onBlur = function () {
        this.isActive = false;
    };
    IgxItemListDirective.prototype.nextItem = function () {
        switch (this.type) {
            case "hourList": {
                this.timePicker.nextHour();
                break;
            }
            case "minuteList": {
                this.timePicker.nextMinute();
                break;
            }
            case "ampmList": {
                this.timePicker.nextAmPm();
                break;
            }
        }
    };
    IgxItemListDirective.prototype.prevItem = function () {
        switch (this.type) {
            case "hourList": {
                this.timePicker.prevHour();
                break;
            }
            case "minuteList": {
                this.timePicker.prevMinute();
                break;
            }
            case "ampmList": {
                this.timePicker.prevAmPm();
                break;
            }
        }
    };
    IgxItemListDirective.prototype.onKeydownArrowDown = function (event) {
        event.preventDefault();
        this.nextItem();
    };
    IgxItemListDirective.prototype.onKeydownArrowUp = function (event) {
        event.preventDefault();
        this.prevItem();
    };
    IgxItemListDirective.prototype.onKeydownArrowRight = function (event) {
        event.preventDefault();
        var listName = event.target.className;
        if (listName.indexOf("hourList") !== -1) {
            this.timePicker.minuteList.nativeElement.focus();
        }
        else if (listName.indexOf("minuteList") !== -1 && this.timePicker._ampmItems.length !== 0) {
            this.timePicker.ampmList.nativeElement.focus();
        }
    };
    IgxItemListDirective.prototype.onKeydownArrowLeft = function (event) {
        event.preventDefault();
        var listName = event.target.className;
        if (listName.indexOf("minuteList") !== -1) {
            this.timePicker.hourList.nativeElement.focus();
        }
        else if (listName.indexOf("ampmList") !== -1) {
            this.timePicker.minuteList.nativeElement.focus();
        }
    };
    IgxItemListDirective.prototype.onKeydownEnter = function (event) {
        event.preventDefault();
        this.timePicker.okButtonClick();
    };
    IgxItemListDirective.prototype.onKeydownEscape = function (event) {
        event.preventDefault();
        this.timePicker.cancelButtonClick();
    };
    IgxItemListDirective.prototype.onHover = function () {
        this.elementRef.nativeElement.focus();
    };
    IgxItemListDirective.prototype.onScroll = function (event) {
        event.preventDefault();
        event.stopPropagation();
        if (event.deltaY > 0) {
            this.nextItem();
        }
        else if (event.deltaY < 0) {
            this.prevItem();
        }
    };
    IgxItemListDirective.prototype.onPanMove = function (event) {
        if (event.deltaY < 0) {
            this.nextItem();
        }
        else if (event.deltaY > 0) {
            this.prevItem();
        }
    };
    IgxItemListDirective.decorators = [
        { type: Directive, args: [{
                    selector: "[igxItemList]"
                },] },
    ];
    IgxItemListDirective.ctorParameters = function () { return [
        { type: IgxTimePickerComponent, decorators: [{ type: Host }, { type: Inject, args: [forwardRef(function () { return IgxTimePickerComponent; }),] },] },
        { type: ElementRef, },
    ]; };
    IgxItemListDirective.propDecorators = {
        "type": [{ type: Input, args: ["igxItemList",] },],
        "tabindex": [{ type: HostBinding, args: ["attr.tabindex",] },],
        "defaultCSS": [{ type: HostBinding, args: ["class.igx-time-picker__column",] },],
        "hourCSS": [{ type: HostBinding, args: ["class.igx-time-picker__hourList",] },],
        "minuteCSS": [{ type: HostBinding, args: ["class.igx-time-picker__minuteList",] },],
        "ampmCSS": [{ type: HostBinding, args: ["class.igx-time-picker__ampmList",] },],
        "onFocus": [{ type: HostListener, args: ["focus",] },],
        "onBlur": [{ type: HostListener, args: ["blur",] },],
        "onKeydownArrowDown": [{ type: HostListener, args: ["keydown.arrowdown", ["$event"],] },],
        "onKeydownArrowUp": [{ type: HostListener, args: ["keydown.arrowup", ["$event"],] },],
        "onKeydownArrowRight": [{ type: HostListener, args: ["keydown.arrowright", ["$event"],] },],
        "onKeydownArrowLeft": [{ type: HostListener, args: ["keydown.arrowleft", ["$event"],] },],
        "onKeydownEnter": [{ type: HostListener, args: ["keydown.enter", ["$event"],] },],
        "onKeydownEscape": [{ type: HostListener, args: ["keydown.escape", ["$event"],] },],
        "onHover": [{ type: HostListener, args: ["mouseover",] },],
        "onScroll": [{ type: HostListener, args: ["wheel", ["$event"],] },],
        "onPanMove": [{ type: HostListener, args: ["panmove", ["$event"],] },],
    };
    return IgxItemListDirective;
}());
export { IgxItemListDirective };
var IgxHourItemDirective = (function () {
    function IgxHourItemDirective(timePicker, itemList) {
        this.timePicker = timePicker;
        this.itemList = itemList;
    }
    Object.defineProperty(IgxHourItemDirective.prototype, "defaultCSS", {
        get: function () {
            return true;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxHourItemDirective.prototype, "selectedCSS", {
        get: function () {
            return this.isSelectedHour;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxHourItemDirective.prototype, "activeCSS", {
        get: function () {
            return this.isSelectedHour && this.itemList.isActive;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxHourItemDirective.prototype, "isSelectedHour", {
        get: function () {
            return this.timePicker.selectedHour === this.value;
        },
        enumerable: true,
        configurable: true
    });
    IgxHourItemDirective.prototype.onClick = function (item) {
        if (item !== "") {
            this.timePicker.scrollHourIntoView(item);
        }
    };
    IgxHourItemDirective.decorators = [
        { type: Directive, args: [{
                    selector: "[igxHourItem]"
                },] },
    ];
    IgxHourItemDirective.ctorParameters = function () { return [
        { type: IgxTimePickerComponent, decorators: [{ type: Host }, { type: Inject, args: [forwardRef(function () { return IgxTimePickerComponent; }),] },] },
        { type: IgxItemListDirective, },
    ]; };
    IgxHourItemDirective.propDecorators = {
        "value": [{ type: Input, args: ["igxHourItem",] },],
        "defaultCSS": [{ type: HostBinding, args: ["class.igx-time-picker__item",] },],
        "selectedCSS": [{ type: HostBinding, args: ["class.igx-time-picker__item--selected",] },],
        "activeCSS": [{ type: HostBinding, args: ["class.igx-time-picker__item--active",] },],
        "onClick": [{ type: HostListener, args: ["click", ["value"],] },],
    };
    return IgxHourItemDirective;
}());
export { IgxHourItemDirective };
var IgxMinuteItemDirective = (function () {
    function IgxMinuteItemDirective(timePicker, itemList) {
        this.timePicker = timePicker;
        this.itemList = itemList;
    }
    Object.defineProperty(IgxMinuteItemDirective.prototype, "defaultCSS", {
        get: function () {
            return true;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxMinuteItemDirective.prototype, "selectedCSS", {
        get: function () {
            return this.isSelectedMinute;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxMinuteItemDirective.prototype, "activeCSS", {
        get: function () {
            return this.isSelectedMinute && this.itemList.isActive;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxMinuteItemDirective.prototype, "isSelectedMinute", {
        get: function () {
            return this.timePicker.selectedMinute === this.value;
        },
        enumerable: true,
        configurable: true
    });
    IgxMinuteItemDirective.prototype.onClick = function (item) {
        if (item !== "") {
            this.timePicker.scrollMinuteIntoView(item);
        }
    };
    IgxMinuteItemDirective.decorators = [
        { type: Directive, args: [{
                    selector: "[igxMinuteItem]"
                },] },
    ];
    IgxMinuteItemDirective.ctorParameters = function () { return [
        { type: IgxTimePickerComponent, decorators: [{ type: Host }, { type: Inject, args: [forwardRef(function () { return IgxTimePickerComponent; }),] },] },
        { type: IgxItemListDirective, },
    ]; };
    IgxMinuteItemDirective.propDecorators = {
        "value": [{ type: Input, args: ["igxMinuteItem",] },],
        "defaultCSS": [{ type: HostBinding, args: ["class.igx-time-picker__item",] },],
        "selectedCSS": [{ type: HostBinding, args: ["class.igx-time-picker__item--selected",] },],
        "activeCSS": [{ type: HostBinding, args: ["class.igx-time-picker__item--active",] },],
        "onClick": [{ type: HostListener, args: ["click", ["value"],] },],
    };
    return IgxMinuteItemDirective;
}());
export { IgxMinuteItemDirective };
var IgxAmPmItemDirective = (function () {
    function IgxAmPmItemDirective(timePicker, itemList) {
        this.timePicker = timePicker;
        this.itemList = itemList;
    }
    Object.defineProperty(IgxAmPmItemDirective.prototype, "defaultCSS", {
        get: function () {
            return true;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxAmPmItemDirective.prototype, "selectedCSS", {
        get: function () {
            return this.isSelectedAmPm;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxAmPmItemDirective.prototype, "activeCSS", {
        get: function () {
            return this.isSelectedAmPm && this.itemList.isActive;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxAmPmItemDirective.prototype, "isSelectedAmPm", {
        get: function () {
            return this.timePicker.selectedAmPm === this.value;
        },
        enumerable: true,
        configurable: true
    });
    IgxAmPmItemDirective.prototype.onClick = function (item) {
        if (item !== "") {
            this.timePicker.scrollAmPmIntoView(item);
        }
    };
    IgxAmPmItemDirective.decorators = [
        { type: Directive, args: [{
                    selector: "[igxAmPmItem]"
                },] },
    ];
    IgxAmPmItemDirective.ctorParameters = function () { return [
        { type: IgxTimePickerComponent, decorators: [{ type: Host }, { type: Inject, args: [forwardRef(function () { return IgxTimePickerComponent; }),] },] },
        { type: IgxItemListDirective, },
    ]; };
    IgxAmPmItemDirective.propDecorators = {
        "value": [{ type: Input, args: ["igxAmPmItem",] },],
        "defaultCSS": [{ type: HostBinding, args: ["class.igx-time-picker__item",] },],
        "selectedCSS": [{ type: HostBinding, args: ["class.igx-time-picker__item--selected",] },],
        "activeCSS": [{ type: HostBinding, args: ["class.igx-time-picker__item--active",] },],
        "onClick": [{ type: HostListener, args: ["click", ["value"],] },],
    };
    return IgxAmPmItemDirective;
}());
export { IgxAmPmItemDirective };
