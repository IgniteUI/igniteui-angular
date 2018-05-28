import { CommonModule } from "@angular/common";
import { Component, ComponentFactoryResolver, ContentChild, EventEmitter, HostBinding, Input, NgModule, Output, ViewChild, ViewContainerRef } from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { IgxCalendarComponent, IgxCalendarHeaderTemplateDirective, IgxCalendarModule, IgxCalendarSubheaderTemplateDirective, WEEKDAYS } from "../calendar";
import { IgxDialogComponent, IgxDialogModule } from "../dialog/dialog.component";
import { IgxIconModule } from "../icon";
import { IgxInputGroupModule } from "../input-group/input-group.component";
var NEXT_ID = 0;
var IgxDatePickerComponent = (function () {
    function IgxDatePickerComponent(resolver) {
        this.resolver = resolver;
        this.id = "igx-datePicker-" + NEXT_ID++;
        this.locale = Constants.DEFAULT_LOCALE_DATE;
        this.weekStart = WEEKDAYS.SUNDAY;
        this.vertical = false;
        this.onOpen = new EventEmitter();
        this.onClose = new EventEmitter();
        this.onSelection = new EventEmitter();
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
    }
    Object.defineProperty(IgxDatePickerComponent.prototype, "formatOptions", {
        get: function () {
            return this._formatOptions;
        },
        set: function (formatOptions) {
            this._formatOptions = Object.assign(this._formatOptions, formatOptions);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxDatePickerComponent.prototype, "formatViews", {
        get: function () {
            return this._formatViews;
        },
        set: function (formatViews) {
            this._formatViews = Object.assign(this._formatViews, formatViews);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxDatePickerComponent.prototype, "displayData", {
        get: function () {
            if (this.value) {
                return this._customFormatChecker(this.formatter, this.value);
            }
            return "";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxDatePickerComponent.prototype, "calendar", {
        get: function () {
            return this.calendarRef.instance;
        },
        enumerable: true,
        configurable: true
    });
    IgxDatePickerComponent.prototype.writeValue = function (value) {
        this.value = value;
    };
    IgxDatePickerComponent.prototype.registerOnChange = function (fn) { this._onChangeCallback = fn; };
    IgxDatePickerComponent.prototype.registerOnTouched = function (fn) { this._onTouchedCallback = fn; };
    IgxDatePickerComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.alert.onOpen.subscribe(function (ev) { return _this._focusTheDialog(); });
        this.alert.onClose.subscribe(function (ev) { return _this.handleDialogCloseAction(); });
    };
    IgxDatePickerComponent.prototype.ngOnDestroy = function () {
        this.alert.onClose.unsubscribe();
        this.alert.onOpen.unsubscribe();
    };
    IgxDatePickerComponent.prototype.triggerTodaySelection = function () {
        var today = new Date(Date.now());
        this.handleSelection(today);
    };
    IgxDatePickerComponent.prototype.selectDate = function (date) {
        this.value = date;
        this.onSelection.emit(date);
        this._onChangeCallback(date);
    };
    IgxDatePickerComponent.prototype.onOpenEvent = function (event) {
        var factory = this.resolver.resolveComponentFactory(IgxCalendarComponent);
        this.calendarRef = this.container.createComponent(factory);
        this.calendarRef.changeDetectorRef.detach();
        this.updateCalendarInstance();
        this.calendarRef.location.nativeElement.classList.add("igx-date-picker__date--opened");
        this.calendarRef.changeDetectorRef.reattach();
        this.alert.open();
        this._onTouchedCallback();
        this.onOpen.emit(this);
    };
    IgxDatePickerComponent.prototype.handleDialogCloseAction = function () {
        var _this = this;
        this.onClose.emit(this);
        setTimeout(function () { return _this.calendarRef.destroy(); }, 350);
    };
    IgxDatePickerComponent.prototype.handleSelection = function (event) {
        this.value = event;
        this.calendar.viewDate = event;
        this._onChangeCallback(event);
        this.alert.close();
        this.onSelection.emit(event);
    };
    IgxDatePickerComponent.prototype.updateCalendarInstance = function () {
        var _this = this;
        this.calendar.formatOptions = this._formatOptions;
        this.calendar.formatViews = this._formatViews;
        this.calendar.locale = this.locale;
        this.calendar.vertical = this.vertical;
        if (this.headerTemplate) {
            this.calendar.headerTemplate = this.headerTemplate;
        }
        if (this.subheaderTemplate) {
            this.calendar.subheaderTemplate = this.subheaderTemplate;
        }
        if (this.value) {
            this.calendar.value = this.value;
            this.calendar.viewDate = this.value;
        }
        this.calendar.weekStart = this.weekStart;
        this.calendar.onSelection.subscribe(function (ev) { return _this.handleSelection(ev); });
    };
    IgxDatePickerComponent.prototype._focusTheDialog = function () {
        var _this = this;
        requestAnimationFrame(function () { return _this.alert.element.focus(); });
    };
    IgxDatePickerComponent.prototype._setLocaleToDate = function (value, locale) {
        if (locale === void 0) { locale = Constants.DEFAULT_LOCALE_DATE; }
        return value.toLocaleDateString(locale);
    };
    IgxDatePickerComponent.prototype._customFormatChecker = function (formatter, date) {
        return this.formatter ? this.formatter(date) : this._setLocaleToDate(date, this.locale);
    };
    IgxDatePickerComponent.decorators = [
        { type: Component, args: [{
                    providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: IgxDatePickerComponent, multi: true }],
                    selector: "igx-datePicker",
                    template: "<div [ngClass]=\"{'igx-date-picker': !vertical, 'igx-date-picker--vertical': vertical}\">     <igx-input-group (click)=\"onOpenEvent($event)\">         <igx-prefix>             <igx-icon>today</igx-icon>         </igx-prefix>         <label igxLabel>Date</label>         <input class=\"igx-date-picker__input-date\" igxInput [value]=\"displayData\" [disabled]=\"isDisabled\" readonly />     </igx-input-group>     <igx-dialog class=\"igx-date-picker__dialog-popup\" closeOnOutsideSelect=\"true\" [leftButtonLabel]=\"cancelButtonLabel\" (onLeftButtonSelect)=\"alert.close()\"         [rightButtonLabel]=\"todayButtonLabel\" (onRightButtonSelect)=\"triggerTodaySelection()\">         <ng-container #container></ng-container>     </igx-dialog> </div>"
                },] },
    ];
    IgxDatePickerComponent.ctorParameters = function () { return [
        { type: ComponentFactoryResolver, },
    ]; };
    IgxDatePickerComponent.propDecorators = {
        "id": [{ type: HostBinding, args: ["attr.id",] }, { type: Input },],
        "formatter": [{ type: Input },],
        "isDisabled": [{ type: Input },],
        "value": [{ type: Input },],
        "locale": [{ type: Input },],
        "weekStart": [{ type: Input },],
        "formatOptions": [{ type: Input },],
        "formatViews": [{ type: Input },],
        "vertical": [{ type: Input },],
        "todayButtonLabel": [{ type: Input },],
        "cancelButtonLabel": [{ type: Input },],
        "onOpen": [{ type: Output },],
        "onClose": [{ type: Output },],
        "onSelection": [{ type: Output },],
        "headerTemplate": [{ type: ContentChild, args: [IgxCalendarHeaderTemplateDirective, { read: IgxCalendarHeaderTemplateDirective },] },],
        "subheaderTemplate": [{ type: ContentChild, args: [IgxCalendarSubheaderTemplateDirective, { read: IgxCalendarSubheaderTemplateDirective },] },],
        "container": [{ type: ViewChild, args: ["container", { read: ViewContainerRef },] },],
        "alert": [{ type: ViewChild, args: [IgxDialogComponent,] },],
    };
    return IgxDatePickerComponent;
}());
export { IgxDatePickerComponent };
var Constants = (function () {
    function Constants() {
    }
    Constants.DEFAULT_LOCALE_DATE = "en";
    return Constants;
}());
var IgxDatePickerModule = (function () {
    function IgxDatePickerModule() {
    }
    IgxDatePickerModule.decorators = [
        { type: NgModule, args: [{
                    declarations: [IgxDatePickerComponent],
                    entryComponents: [IgxCalendarComponent],
                    exports: [IgxDatePickerComponent],
                    imports: [CommonModule, IgxIconModule, IgxInputGroupModule, IgxDialogModule, IgxCalendarModule]
                },] },
    ];
    return IgxDatePickerModule;
}());
export { IgxDatePickerModule };
