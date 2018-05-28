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
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
import { transition, trigger, useAnimation } from "@angular/animations";
import { Component, ContentChild, EventEmitter, forwardRef, HostBinding, HostListener, Input, Output, QueryList, ViewChildren } from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { HAMMER_GESTURE_CONFIG, HammerGestureConfig } from "@angular/platform-browser";
import { fadeIn, scaleInCenter, slideInLeft, slideInRight } from "../animations/main";
import { Calendar, range } from "./calendar";
import { IgxCalendarDateDirective, IgxCalendarHeaderTemplateDirective, IgxCalendarSubheaderTemplateDirective } from "./calendar.directives";
var NEXT_ID = 0;
export var CalendarView;
(function (CalendarView) {
    CalendarView[CalendarView["DEFAULT"] = 0] = "DEFAULT";
    CalendarView[CalendarView["YEAR"] = 1] = "YEAR";
    CalendarView[CalendarView["DECADE"] = 2] = "DECADE";
})(CalendarView || (CalendarView = {}));
export var CalendarSelection;
(function (CalendarSelection) {
    CalendarSelection["SINGLE"] = "single";
    CalendarSelection["MULTI"] = "multi";
    CalendarSelection["RANGE"] = "range";
})(CalendarSelection || (CalendarSelection = {}));
var CalendarHammerConfig = (function (_super) {
    __extends(CalendarHammerConfig, _super);
    function CalendarHammerConfig() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.overrides = {
            pan: { direction: Hammer.DIRECTION_VERTICAL, threshold: 1 }
        };
        return _this;
    }
    return CalendarHammerConfig;
}(HammerGestureConfig));
export { CalendarHammerConfig };
var IgxCalendarComponent = (function () {
    function IgxCalendarComponent() {
        this.id = "igx-calendar-" + NEXT_ID++;
        this.locale = "en";
        this.vertical = false;
        this.onSelection = new EventEmitter();
        this.tabindex = 0;
        this.role = "grid";
        this.ariaLabelledBy = "calendar";
        this._activeView = CalendarView.DEFAULT;
        this._selection = CalendarSelection.SINGLE;
        this._rangeStarted = false;
        this._monthAction = "";
        this._formatOptions = {
            day: "numeric",
            month: "short",
            weekday: "short",
            year: "numeric"
        };
        this._formatViews = {
            day: false,
            month: true,
            year: false
        };
        this._onTouchedCallback = function () { };
        this._onChangeCallback = function () { };
        this.calendarModel = new Calendar();
    }
    Object.defineProperty(IgxCalendarComponent.prototype, "weekStart", {
        get: function () {
            return this.calendarModel.firstWeekDay;
        },
        set: function (value) {
            this.calendarModel.firstWeekDay = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxCalendarComponent.prototype, "selection", {
        get: function () {
            return this._selection;
        },
        set: function (value) {
            switch (value) {
                case "single":
                    this.selectedDates = null;
                    break;
                case "multi":
                case "range":
                    this.selectedDates = [];
                    break;
                default:
                    throw new Error("Invalid selection value");
            }
            this._onChangeCallback(this.selectedDates);
            this._rangeStarted = false;
            this._selection = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxCalendarComponent.prototype, "viewDate", {
        get: function () {
            return this._viewDate;
        },
        set: function (value) {
            this._viewDate = new Date(value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxCalendarComponent.prototype, "value", {
        get: function () {
            return this.selectedDates;
        },
        set: function (value) {
            this.selectDate(value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxCalendarComponent.prototype, "formatOptions", {
        get: function () {
            return this._formatOptions;
        },
        set: function (formatOptions) {
            this._formatOptions = Object.assign(this._formatOptions, formatOptions);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxCalendarComponent.prototype, "formatViews", {
        get: function () {
            return this._formatViews;
        },
        set: function (formatViews) {
            this._formatViews = Object.assign(this._formatViews, formatViews);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxCalendarComponent.prototype, "styleClass", {
        get: function () {
            if (this.vertical) {
                return "igx-calendar--vertical";
            }
            return "igx-calendar";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxCalendarComponent.prototype, "months", {
        get: function () {
            var start = new Date(this._viewDate.getFullYear(), 0, 1);
            var result = [];
            for (var i = 0; i < 12; i++) {
                result.push(start);
                start = this.calendarModel.timedelta(start, "month", 1);
            }
            return result;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxCalendarComponent.prototype, "decade", {
        get: function () {
            var result = [];
            var start = this._viewDate.getFullYear() - 3;
            var end = this._viewDate.getFullYear() + 4;
            for (var _i = 0, _a = range(start, end); _i < _a.length; _i++) {
                var year = _a[_i];
                result.push(new Date(year, this._viewDate.getMonth(), this._viewDate.getDate()));
            }
            return result;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxCalendarComponent.prototype, "isDefaultView", {
        get: function () {
            return this._activeView === CalendarView.DEFAULT;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxCalendarComponent.prototype, "isYearView", {
        get: function () {
            return this._activeView === CalendarView.YEAR;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxCalendarComponent.prototype, "isDecadeView", {
        get: function () {
            return this._activeView === CalendarView.DECADE;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxCalendarComponent.prototype, "activeView", {
        get: function () {
            return this._activeView;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxCalendarComponent.prototype, "monthAction", {
        get: function () {
            return this._monthAction;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxCalendarComponent.prototype, "headerTemplate", {
        get: function () {
            if (this.headerTemplateDirective) {
                return this.headerTemplateDirective.template;
            }
            return null;
        },
        set: function (directive) {
            this.headerTemplateDirective = directive;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxCalendarComponent.prototype, "subheaderTemplate", {
        get: function () {
            if (this.subheaderTemplateDirective) {
                return this.subheaderTemplateDirective.template;
            }
            return null;
        },
        set: function (directive) {
            this.subheaderTemplateDirective = directive;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxCalendarComponent.prototype, "headerContext", {
        get: function () {
            var date = this.headerDate;
            return this.generateContext(date);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxCalendarComponent.prototype, "context", {
        get: function () {
            var date = this._viewDate;
            return this.generateContext(date);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxCalendarComponent.prototype, "headerDate", {
        get: function () {
            return this.selectedDates ? this.selectedDates : new Date();
        },
        enumerable: true,
        configurable: true
    });
    IgxCalendarComponent.prototype.ngOnInit = function () {
        var today = new Date();
        this.calendarModel.firstWeekDay = this.weekStart;
        this._viewDate = this._viewDate ? this._viewDate : today;
    };
    IgxCalendarComponent.prototype.registerOnChange = function (fn) {
        this._onChangeCallback = fn;
    };
    IgxCalendarComponent.prototype.registerOnTouched = function (fn) {
        this._onTouchedCallback = fn;
    };
    IgxCalendarComponent.prototype.writeValue = function (value) {
        this.selectedDates = value;
    };
    IgxCalendarComponent.prototype.formattedMonth = function (value) {
        if (this._formatViews.month) {
            return value.toLocaleString(this.locale, { month: this._formatOptions.month });
        }
        return "" + value.getMonth();
    };
    IgxCalendarComponent.prototype.formattedDate = function (value) {
        if (this._formatViews.day) {
            return value.toLocaleString(this.locale, { day: this._formatOptions.day });
        }
        return "" + value.getDate();
    };
    IgxCalendarComponent.prototype.formattedYear = function (value) {
        if (this._formatViews.year) {
            return value.toLocaleString(this.locale, { year: this._formatOptions.year });
        }
        return "" + value.getFullYear();
    };
    IgxCalendarComponent.prototype.isCurrentMonth = function (value) {
        return this.viewDate.getMonth() === value.getMonth();
    };
    IgxCalendarComponent.prototype.isCurrentYear = function (value) {
        return this.viewDate.getFullYear() === value.getFullYear();
    };
    IgxCalendarComponent.prototype.previousMonth = function () {
        this._viewDate = this.calendarModel.timedelta(this._viewDate, "month", -1);
        this._monthAction = "prev";
    };
    IgxCalendarComponent.prototype.nextMonth = function () {
        this._viewDate = this.calendarModel.timedelta(this._viewDate, "month", 1);
        this._monthAction = "next";
    };
    IgxCalendarComponent.prototype.previousYear = function () {
        this._viewDate = this.calendarModel.timedelta(this._viewDate, "year", -1);
    };
    IgxCalendarComponent.prototype.nextYear = function () {
        this._viewDate = this.calendarModel.timedelta(this._viewDate, "year", 1);
    };
    IgxCalendarComponent.prototype.getFormattedDate = function () {
        var date = this.headerDate;
        return {
            monthday: date.toLocaleString(this.locale, { month: this._formatOptions.month, day: this._formatOptions.day }),
            weekday: date.toLocaleString(this.locale, { weekday: this._formatOptions.weekday })
        };
    };
    IgxCalendarComponent.prototype.childClicked = function (instance) {
        if (instance.isPrevMonth) {
            this.previousMonth();
        }
        if (instance.isNextMonth) {
            this.nextMonth();
        }
        this.selectDate(instance.date);
        this.onSelection.emit(this.selectedDates);
    };
    IgxCalendarComponent.prototype.animationDone = function () {
        var date = this.dates.find(function (d) { return d.selected; });
        if (date) {
            date.nativeElement.focus();
        }
    };
    IgxCalendarComponent.prototype.selectDate = function (value) {
        switch (this.selection) {
            case "single":
                this.selectSingle(value);
                break;
            case "multi":
                this.selectMultiple(value);
                break;
            case "range":
                this.selectRange(value);
                break;
        }
    };
    IgxCalendarComponent.prototype.generateWeekHeader = function () {
        var dayNames = [];
        var rv = this.calendarModel.monthdatescalendar(this.viewDate.getFullYear(), this.viewDate.getMonth())[0];
        for (var _i = 0, rv_1 = rv; _i < rv_1.length; _i++) {
            var day = rv_1[_i];
            dayNames.push(day.date.toLocaleString(this.locale, { weekday: this._formatOptions.weekday }));
        }
        return dayNames;
    };
    Object.defineProperty(IgxCalendarComponent.prototype, "getCalendarMonth", {
        get: function () {
            return this.calendarModel.monthdatescalendar(this.viewDate.getFullYear(), this.viewDate.getMonth(), true);
        },
        enumerable: true,
        configurable: true
    });
    IgxCalendarComponent.prototype.changeYear = function (event) {
        this._viewDate = new Date(event.getFullYear(), this._viewDate.getMonth(), 1, 0, 0, 0);
        this._activeView = CalendarView.DEFAULT;
    };
    IgxCalendarComponent.prototype.changeMonth = function (event) {
        this._viewDate = new Date(this._viewDate.getFullYear(), event.getMonth(), 1, 0, 0, 0);
        this._activeView = CalendarView.DEFAULT;
    };
    IgxCalendarComponent.prototype.activeViewYear = function () {
        this._activeView = CalendarView.YEAR;
    };
    IgxCalendarComponent.prototype.activeViewDecade = function () {
        this._activeView = CalendarView.DECADE;
    };
    IgxCalendarComponent.prototype.onScroll = function (event) {
        event.preventDefault();
        event.stopPropagation();
        var delta = event.deltaY < 0 ? 1 : -1;
        this.generateYearRange(delta);
    };
    IgxCalendarComponent.prototype.onPan = function (event) {
        var delta = event.deltaY < 0 ? 1 : -1;
        this.generateYearRange(delta);
    };
    IgxCalendarComponent.prototype.onKeydownPageUp = function (event) {
        event.preventDefault();
        this.previousMonth();
    };
    IgxCalendarComponent.prototype.onKeydownPageDown = function (event) {
        event.preventDefault();
        this.nextMonth();
    };
    IgxCalendarComponent.prototype.onKeydownShiftPageUp = function (event) {
        event.preventDefault();
        this.previousYear();
    };
    IgxCalendarComponent.prototype.onKeydownShiftPageDown = function (event) {
        event.preventDefault();
        this.nextYear();
    };
    IgxCalendarComponent.prototype.onKeydownArrowUp = function (event) {
        event.preventDefault();
        var node = this.dates.find(function (date) { return date.nativeElement === event.target; });
        var index = this.dates.toArray().indexOf(node);
        if (node && index > -1 && index - 7 > -1) {
            this.dates.toArray()[index - 7].nativeElement.focus();
        }
    };
    IgxCalendarComponent.prototype.onKeydownArrowDown = function (event) {
        event.preventDefault();
        var node = this.dates.find(function (date) { return date.nativeElement === event.target; });
        var index = this.dates.toArray().indexOf(node);
        if (node && index > -1 && index + 7 < this.dates.length) {
            this.dates.toArray()[index + 7].nativeElement.focus();
        }
    };
    IgxCalendarComponent.prototype.onKeydownArrowLeft = function (event) {
        event.preventDefault();
        var node = this.dates.find(function (date) { return date.nativeElement === event.target; });
        var index = this.dates.toArray().indexOf(node);
        if (node && index > -1 && index > 0) {
            this.dates.toArray()[index - 1].nativeElement.focus();
        }
    };
    IgxCalendarComponent.prototype.onKeydownArrowRight = function (event) {
        event.preventDefault();
        var node = this.dates.find(function (date) { return date.nativeElement === event.target; });
        var index = this.dates.toArray().indexOf(node);
        if (node && index > -1 && index < this.dates.length - 1) {
            this.dates.toArray()[index + 1].nativeElement.focus();
        }
    };
    IgxCalendarComponent.prototype.onKeydownHome = function (event) {
        event.preventDefault();
        this.dates
            .filter(function (date) { return date.isCurrentMonth; })
            .shift().nativeElement.focus();
    };
    IgxCalendarComponent.prototype.onKeydownEnd = function (event) {
        event.preventDefault();
        this.dates
            .filter(function (date) { return date.isCurrentMonth; })
            .pop().nativeElement.focus();
    };
    IgxCalendarComponent.prototype.dateTracker = function (index, item) {
        return item.date.getMonth() + "--" + item.date.getDate();
    };
    IgxCalendarComponent.prototype.rowTracker = function (index, item) {
        return "" + item[index].date.getMonth() + item[index].date.getDate();
    };
    IgxCalendarComponent.prototype.selectSingle = function (value) {
        this.selectedDates = value;
        this._onChangeCallback(this.selectedDates);
    };
    IgxCalendarComponent.prototype.selectMultiple = function (value) {
        if (Array.isArray(value)) {
            this.selectedDates = this.selectedDates.concat(value);
        }
        else {
            if (this.selectedDates.every(function (date) { return date.toDateString() !== value.toDateString(); })) {
                this.selectedDates.push(value);
            }
            else {
                this.selectedDates = this.selectedDates.filter(function (date) { return date.toDateString() !== value.toDateString(); });
            }
        }
        this._onChangeCallback(this.selectedDates);
    };
    IgxCalendarComponent.prototype.selectRange = function (value) {
        var start;
        var end;
        if (Array.isArray(value)) {
            this._rangeStarted = false;
            value.sort(function (a, b) { return a.valueOf() - b.valueOf(); });
            start = value.shift();
            end = value.pop();
            this.selectedDates = [start];
            this.selectedDates = [start].concat(this.generateDateRange(start, end));
        }
        else {
            if (!this._rangeStarted) {
                this._rangeStarted = true;
                this.selectedDates = [value];
            }
            else {
                this._rangeStarted = false;
                if (this.selectedDates[0].toDateString() === value.toDateString()) {
                    this.selectedDates = [];
                    this._onChangeCallback(this.selectedDates);
                    return;
                }
                this.selectedDates.push(value);
                this.selectedDates.sort(function (a, b) { return a.valueOf() - b.valueOf(); });
                start = this.selectedDates.shift();
                end = this.selectedDates.pop();
                this.selectedDates = [start].concat(this.generateDateRange(start, end));
            }
        }
        this._onChangeCallback(this.selectedDates);
    };
    IgxCalendarComponent.prototype.generateContext = function (value) {
        var _this = this;
        var formatObject = __assign({ monthView: function () { return _this.activeViewYear(); }, yearView: function () { return _this.activeViewDecade(); } }, this.calendarModel.formatToParts(value, this.locale, this._formatOptions, ["era", "year", "month", "day", "weekday"]));
        return { $implicit: formatObject };
    };
    IgxCalendarComponent.prototype.generateDateRange = function (start, end) {
        var result = [];
        while (start.toDateString() !== end.toDateString()) {
            start = this.calendarModel.timedelta(start, "day", 1);
            result.push(start);
        }
        return result;
    };
    IgxCalendarComponent.prototype.generateYearRange = function (delta) {
        var currentYear = new Date().getFullYear();
        if ((delta > 0 && this._viewDate.getFullYear() - currentYear >= 95) ||
            (delta < 0 && currentYear - this._viewDate.getFullYear() >= 95)) {
            return;
        }
        this._viewDate = this.calendarModel.timedelta(this._viewDate, "year", delta);
    };
    IgxCalendarComponent.decorators = [
        { type: Component, args: [{
                    animations: [
                        trigger("animateView", [
                            transition("void => 0", useAnimation(fadeIn)),
                            transition("void => *", useAnimation(scaleInCenter, {
                                params: {
                                    duration: ".2s",
                                    fromScale: .9
                                }
                            }))
                        ]),
                        trigger("animateChange", [
                            transition("* => prev", useAnimation(slideInLeft, {
                                params: {
                                    fromPosition: "translateX(-30%)"
                                }
                            })),
                            transition("* => next", useAnimation(slideInRight, {
                                params: {
                                    fromPosition: "translateX(30%)"
                                }
                            }))
                        ])
                    ],
                    providers: [
                        {
                            multi: true,
                            provide: NG_VALUE_ACCESSOR,
                            useExisting: IgxCalendarComponent
                        },
                        {
                            provide: HAMMER_GESTURE_CONFIG,
                            useClass: CalendarHammerConfig
                        }
                    ],
                    selector: "igx-calendar",
                    template: "<ng-template let-result #defaultHeader>     <span class=\"date-text\">{{ getFormattedDate().weekday }},&nbsp;</span>     <span class=\"date-text\">{{ getFormattedDate().monthday }}</span> </ng-template>  <ng-template let-result #defaultMonth>     <span (click)=\"activeViewYear()\" class=\"date__el\">         {{ formattedMonth(viewDate) }}     </span>     <span (click)=\"activeViewDecade()\" class=\"date__el\">         {{ formattedYear(viewDate) }}     </span> </ng-template>  <div *ngIf=\"selection === 'single'\" class=\"igx-calendar__header\">     <h5 class=\"igx-calendar__header-year\">{{ formattedYear(headerDate) }}</h5>     <h2 class=\"igx-calendar__header-date\">         <ng-container *ngTemplateOutlet=\"headerTemplate ? headerTemplate : defaultHeader; context: headerContext\">         </ng-container>     </h2> </div>  <div *ngIf=\"isDefaultView\" class=\"igx-calendar__body\" [@animateView]=\"activeView\" (swiperight)=\"previousMonth()\" (swipeleft)=\"nextMonth()\">     <div class=\"igx-calendar__body-picker\">         <div class=\"prev\" (click)=\"previousMonth()\">             <igx-icon fontSet=\"material\" name=\"keyboard_arrow_left\"></igx-icon>         </div>         <div class=\"date\">             <ng-container *ngTemplateOutlet=\"subheaderTemplate ? subheaderTemplate : defaultMonth; context: context\">             </ng-container>         </div>         <div class=\"next\" (click)=\"nextMonth()\">             <igx-icon fontSet=\"material\" name=\"keyboard_arrow_right\"></igx-icon>         </div>     </div>      <div class=\"igx-calendar__body-row\">         <span *ngFor=\"let dayName of generateWeekHeader()\" class=\"igx-calendar__label\">             {{ dayName | titlecase }}         </span>     </div>      <div *ngFor=\"let week of getCalendarMonth; index as i; trackBy: rowTracker\" class=\"igx-calendar__body-row\" [@animateChange]=\"monthAction\"         (@animateChange.done)=\"animationDone()\">         <span [igxCalendarDate]=\"day\" (onDateSelection)=\"childClicked($event)\" *ngFor=\"let day of week; trackBy: dateTracker\">             {{ formattedDate(day.date) }}         </span>     </div> </div>  <div *ngIf=\"isYearView\" class=\"igx-calendar__body\" [@animateView]=\"activeView\">     <div class=\"igx-calendar__body-row--wrap\">         <div (onMonthSelection)=\"changeMonth($event)\" [igxCalendarMonth]=\"month\" [index]=\"i\" *ngFor=\"let month of months; index as i;\">             {{ formattedMonth(month) | titlecase }}         </div>     </div> </div>  <div *ngIf=\"isDecadeView\" class=\"igx-calendar__body\" [@animateView]=\"activeView\">     <div class=\"igx-calendar__body-column\" (wheel)=\"onScroll($event)\" (pan)=\"onPan($event)\">         <span (onYearSelection)=\"changeYear($event)\" [igxCalendarYear]=\"year\" *ngFor=\"let year of decade\">             {{ formattedYear(year) }}         </span>     </div> </div>"
                },] },
    ];
    IgxCalendarComponent.ctorParameters = function () { return []; };
    IgxCalendarComponent.propDecorators = {
        "id": [{ type: HostBinding, args: ["attr.id",] }, { type: Input },],
        "weekStart": [{ type: Input },],
        "locale": [{ type: Input },],
        "selection": [{ type: Input },],
        "viewDate": [{ type: Input },],
        "value": [{ type: Input },],
        "formatOptions": [{ type: Input },],
        "formatViews": [{ type: Input },],
        "vertical": [{ type: Input },],
        "onSelection": [{ type: Output },],
        "dates": [{ type: ViewChildren, args: [forwardRef(function () { return IgxCalendarDateDirective; }), { read: IgxCalendarDateDirective },] },],
        "tabindex": [{ type: HostBinding, args: ["attr.tabindex",] },],
        "role": [{ type: HostBinding, args: ["attr.role",] },],
        "ariaLabelledBy": [{ type: HostBinding, args: ["attr.aria-labelledby",] },],
        "styleClass": [{ type: HostBinding, args: ["class",] },],
        "headerTemplateDirective": [{ type: ContentChild, args: [forwardRef(function () { return IgxCalendarHeaderTemplateDirective; }), { read: IgxCalendarHeaderTemplateDirective },] },],
        "subheaderTemplateDirective": [{ type: ContentChild, args: [forwardRef(function () { return IgxCalendarSubheaderTemplateDirective; }), { read: IgxCalendarSubheaderTemplateDirective },] },],
        "onKeydownPageUp": [{ type: HostListener, args: ["keydown.pageup", ["$event"],] },],
        "onKeydownPageDown": [{ type: HostListener, args: ["keydown.pagedown", ["$event"],] },],
        "onKeydownShiftPageUp": [{ type: HostListener, args: ["keydown.shift.pageup", ["$event"],] },],
        "onKeydownShiftPageDown": [{ type: HostListener, args: ["keydown.shift.pagedown", ["$event"],] },],
        "onKeydownArrowUp": [{ type: HostListener, args: ["keydown.arrowup", ["$event"],] },],
        "onKeydownArrowDown": [{ type: HostListener, args: ["keydown.arrowdown", ["$event"],] },],
        "onKeydownArrowLeft": [{ type: HostListener, args: ["keydown.arrowleft", ["$event"],] },],
        "onKeydownArrowRight": [{ type: HostListener, args: ["keydown.arrowright", ["$event"],] },],
        "onKeydownHome": [{ type: HostListener, args: ["keydown.home", ["$event"],] },],
        "onKeydownEnd": [{ type: HostListener, args: ["keydown.end", ["$event"],] },],
    };
    return IgxCalendarComponent;
}());
export { IgxCalendarComponent };
