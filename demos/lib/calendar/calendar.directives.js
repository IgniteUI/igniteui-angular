import { Directive, ElementRef, EventEmitter, Host, HostBinding, HostListener, Input, Output, TemplateRef } from "@angular/core";
import { IgxCalendarComponent } from "./calendar.component";
var IgxCalendarYearDirective = (function () {
    function IgxCalendarYearDirective(calendar) {
        this.calendar = calendar;
        this.onYearSelection = new EventEmitter();
    }
    Object.defineProperty(IgxCalendarYearDirective.prototype, "defaultCSS", {
        get: function () {
            return !this.isCurrentYear;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxCalendarYearDirective.prototype, "currentCSS", {
        get: function () {
            return this.isCurrentYear;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxCalendarYearDirective.prototype, "isCurrentYear", {
        get: function () {
            return this.calendar.isCurrentYear(this.value);
        },
        enumerable: true,
        configurable: true
    });
    IgxCalendarYearDirective.prototype.onClick = function () {
        this.onYearSelection.emit(this.value);
    };
    IgxCalendarYearDirective.decorators = [
        { type: Directive, args: [{
                    selector: "[igxCalendarYear]"
                },] },
    ];
    IgxCalendarYearDirective.ctorParameters = function () { return [
        { type: IgxCalendarComponent, decorators: [{ type: Host },] },
    ]; };
    IgxCalendarYearDirective.propDecorators = {
        "value": [{ type: Input, args: ["igxCalendarYear",] },],
        "onYearSelection": [{ type: Output },],
        "defaultCSS": [{ type: HostBinding, args: ["class.igx-calendar__year",] },],
        "currentCSS": [{ type: HostBinding, args: ["class.igx-calendar__year--current",] },],
        "onClick": [{ type: HostListener, args: ["click",] },],
    };
    return IgxCalendarYearDirective;
}());
export { IgxCalendarYearDirective };
var IgxCalendarMonthDirective = (function () {
    function IgxCalendarMonthDirective(calendar) {
        this.calendar = calendar;
        this.onMonthSelection = new EventEmitter();
    }
    Object.defineProperty(IgxCalendarMonthDirective.prototype, "defaultCSS", {
        get: function () {
            return !this.isCurrentMonth;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxCalendarMonthDirective.prototype, "currentCSS", {
        get: function () {
            return this.isCurrentMonth;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxCalendarMonthDirective.prototype, "isCurrentMonth", {
        get: function () {
            return this.calendar.isCurrentMonth(this.value);
        },
        enumerable: true,
        configurable: true
    });
    IgxCalendarMonthDirective.prototype.onClick = function () {
        this.onMonthSelection.emit(this.value);
    };
    IgxCalendarMonthDirective.decorators = [
        { type: Directive, args: [{
                    selector: "[igxCalendarMonth]"
                },] },
    ];
    IgxCalendarMonthDirective.ctorParameters = function () { return [
        { type: IgxCalendarComponent, decorators: [{ type: Host },] },
    ]; };
    IgxCalendarMonthDirective.propDecorators = {
        "value": [{ type: Input, args: ["igxCalendarMonth",] },],
        "index": [{ type: Input },],
        "onMonthSelection": [{ type: Output },],
        "defaultCSS": [{ type: HostBinding, args: ["class.igx-calendar__month",] },],
        "currentCSS": [{ type: HostBinding, args: ["class.igx-calendar__month--current",] },],
        "onClick": [{ type: HostListener, args: ["click",] },],
    };
    return IgxCalendarMonthDirective;
}());
export { IgxCalendarMonthDirective };
var IgxCalendarDateDirective = (function () {
    function IgxCalendarDateDirective(calendar, elementRef) {
        this.calendar = calendar;
        this.elementRef = elementRef;
        this.onDateSelection = new EventEmitter();
        this.tabindex = 0;
        this._selected = false;
    }
    Object.defineProperty(IgxCalendarDateDirective.prototype, "selected", {
        get: function () {
            var date = this.date.date;
            if (!this.calendar.value) {
                return;
            }
            if (this.calendar.selection === "single") {
                this._selected = this.calendar.value.toDateString() === date.toDateString();
            }
            else {
                this._selected = this.calendar.value
                    .some(function (each) { return each.toDateString() === date.toDateString(); });
            }
            return this._selected;
        },
        set: function (value) {
            this._selected = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxCalendarDateDirective.prototype, "isCurrentMonth", {
        get: function () {
            return this.date.isCurrentMonth;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxCalendarDateDirective.prototype, "isPreviousMonth", {
        get: function () {
            return this.date.isPrevMonth;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxCalendarDateDirective.prototype, "isNextMonth", {
        get: function () {
            return this.date.isNextMonth;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxCalendarDateDirective.prototype, "nativeElement", {
        get: function () {
            return this.elementRef.nativeElement;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxCalendarDateDirective.prototype, "isInactive", {
        get: function () {
            return this.date.isNextMonth || this.date.isPrevMonth;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxCalendarDateDirective.prototype, "isToday", {
        get: function () {
            var today = new Date(Date.now());
            var date = this.date.date;
            return (date.getFullYear() === today.getFullYear() &&
                date.getMonth() === today.getMonth() &&
                date.getDate() === today.getDate());
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxCalendarDateDirective.prototype, "isWeekend", {
        get: function () {
            var day = this.date.date.getDay();
            return day === 0 || day === 6;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxCalendarDateDirective.prototype, "defaultCSS", {
        get: function () {
            return this.date.isCurrentMonth && !(this.isWeekend && this.selected);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxCalendarDateDirective.prototype, "isInactiveCSS", {
        get: function () {
            return this.isInactive;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxCalendarDateDirective.prototype, "isTodayCSS", {
        get: function () {
            return this.isToday && !this.selected;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxCalendarDateDirective.prototype, "isSelectedCSS", {
        get: function () {
            return this.selected;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxCalendarDateDirective.prototype, "isWeekendCSS", {
        get: function () {
            return this.isWeekend;
        },
        enumerable: true,
        configurable: true
    });
    IgxCalendarDateDirective.prototype.onSelect = function () {
        this.onDateSelection.emit(this.date);
    };
    IgxCalendarDateDirective.decorators = [
        { type: Directive, args: [{
                    selector: "[igxCalendarDate]"
                },] },
    ];
    IgxCalendarDateDirective.ctorParameters = function () { return [
        { type: IgxCalendarComponent, decorators: [{ type: Host },] },
        { type: ElementRef, },
    ]; };
    IgxCalendarDateDirective.propDecorators = {
        "date": [{ type: Input, args: ["igxCalendarDate",] },],
        "onDateSelection": [{ type: Output },],
        "tabindex": [{ type: HostBinding, args: ["attr.tabindex",] },],
        "defaultCSS": [{ type: HostBinding, args: ["class.igx-calendar__date",] },],
        "isInactiveCSS": [{ type: HostBinding, args: ["class.igx-calendar__date--inactive",] },],
        "isTodayCSS": [{ type: HostBinding, args: ["class.igx-calendar__date--current",] },],
        "isSelectedCSS": [{ type: HostBinding, args: ["class.igx-calendar__date--selected",] },],
        "isWeekendCSS": [{ type: HostBinding, args: ["class.igx-calendar__date--weekend",] },],
        "onSelect": [{ type: HostListener, args: ["click",] }, { type: HostListener, args: ["keydown.enter",] },],
    };
    return IgxCalendarDateDirective;
}());
export { IgxCalendarDateDirective };
var IgxCalendarHeaderTemplateDirective = (function () {
    function IgxCalendarHeaderTemplateDirective(template) {
        this.template = template;
    }
    IgxCalendarHeaderTemplateDirective.decorators = [
        { type: Directive, args: [{
                    selector: "[igxCalendarHeader]"
                },] },
    ];
    IgxCalendarHeaderTemplateDirective.ctorParameters = function () { return [
        { type: TemplateRef, },
    ]; };
    return IgxCalendarHeaderTemplateDirective;
}());
export { IgxCalendarHeaderTemplateDirective };
var IgxCalendarSubheaderTemplateDirective = (function () {
    function IgxCalendarSubheaderTemplateDirective(template) {
        this.template = template;
    }
    IgxCalendarSubheaderTemplateDirective.decorators = [
        { type: Directive, args: [{
                    selector: "[igxCalendarSubheader]"
                },] },
    ];
    IgxCalendarSubheaderTemplateDirective.ctorParameters = function () { return [
        { type: TemplateRef, },
    ]; };
    return IgxCalendarSubheaderTemplateDirective;
}());
export { IgxCalendarSubheaderTemplateDirective };
