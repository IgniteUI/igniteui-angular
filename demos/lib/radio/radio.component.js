import { Component, EventEmitter, HostBinding, Input, NgModule, Output, ViewChild } from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { IgxRippleModule } from "../directives/ripple/ripple.directive";
export var RadioLabelPosition;
(function (RadioLabelPosition) {
    RadioLabelPosition["BEFORE"] = "before";
    RadioLabelPosition["AFTER"] = "after";
})(RadioLabelPosition || (RadioLabelPosition = {}));
var nextId = 0;
var noop = function () { };
var ɵ0 = noop;
var IgxRadioComponent = (function () {
    function IgxRadioComponent() {
        this.id = "igx-radio-" + nextId++;
        this.labelId = this.id + "-label";
        this.labelPosition = "after";
        this.tabindex = null;
        this.disableRipple = false;
        this.required = false;
        this.ariaLabelledBy = this.labelId;
        this.ariaLabel = null;
        this.change = new EventEmitter();
        this.cssClass = "igx-radio";
        this.checked = false;
        this.disabled = false;
        this.focused = false;
        this.inputId = this.id + "-input";
        this._value = null;
        this._onTouchedCallback = noop;
        this._onChangeCallback = noop;
    }
    IgxRadioComponent.prototype._onRadioChange = function (event) {
        event.stopPropagation();
    };
    IgxRadioComponent.prototype._onRadioClick = function (event) {
        event.stopPropagation();
        this.select();
    };
    IgxRadioComponent.prototype._onLabelClick = function () {
        this.select();
    };
    IgxRadioComponent.prototype.select = function () {
        if (this.disabled) {
            return;
        }
        this.checked = true;
        this.focused = false;
        this.change.emit({ value: this.value, radio: this });
        this._onChangeCallback(this.value);
    };
    IgxRadioComponent.prototype.writeValue = function (value) {
        this._value = value;
        this.checked = (this._value === this.value);
    };
    Object.defineProperty(IgxRadioComponent.prototype, "labelClass", {
        get: function () {
            switch (this.labelPosition) {
                case RadioLabelPosition.BEFORE:
                    return this.cssClass + "__label--before";
                case RadioLabelPosition.AFTER:
                default:
                    return this.cssClass + "__label";
            }
        },
        enumerable: true,
        configurable: true
    });
    IgxRadioComponent.prototype.onFocus = function (event) {
        this.focused = true;
    };
    IgxRadioComponent.prototype.onBlur = function (event) {
        this.focused = false;
        this._onTouchedCallback();
    };
    IgxRadioComponent.prototype.registerOnChange = function (fn) { this._onChangeCallback = fn; };
    IgxRadioComponent.prototype.registerOnTouched = function (fn) { this._onTouchedCallback = fn; };
    IgxRadioComponent.decorators = [
        { type: Component, args: [{
                    providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: IgxRadioComponent, multi: true }],
                    selector: "igx-radio",
                    template: "<input #radio class=\"igx-radio__input\" type=\"radio\"     [id]=\"inputId\"     [name]=\"name\"     [value]=\"value\"     [tabindex]=\"tabindex\"     [disabled]=\"disabled\"     [checked]=\"checked\"     [required]=\"required\"     [attr.aria-checked]=\"checked\"     [attr.aria-labelledby]=\"ariaLabelledBy\"     [attr.aria-label]=\"ariaLabel\"     (click)=\"_onRadioClick($event)\"     (change)=\"_onRadioChange($event)\"     (focus)=\"onFocus($event)\"     (blur)=\"onBlur($event)\" />  <label #nativeLabel class=\"igx-radio__composite\" igxRipple     igxRippleTarget=\".igx-radio__ripple\"     [igxRippleDisabled]=\"disableRipple\"     [igxRippleCentered]=\"true\"     [igxRippleDuration]=\"100\"     [for]=\"inputId\">     <div class=\"igx-radio__ripple\"></div> </label>  <span #placeholderLabel role=\"label\"     [id]=\"labelId\"     [class]=\"labelClass\"     (click)=\"_onLabelClick()\">     <ng-content></ng-content> </span>"
                },] },
    ];
    IgxRadioComponent.ctorParameters = function () { return []; };
    IgxRadioComponent.propDecorators = {
        "nativeRadio": [{ type: ViewChild, args: ["radio",] },],
        "nativeLabel": [{ type: ViewChild, args: ["nativeLabel",] },],
        "placeholderLabel": [{ type: ViewChild, args: ["placeholderLabel",] },],
        "id": [{ type: HostBinding, args: ["attr.id",] }, { type: Input },],
        "labelId": [{ type: Input },],
        "labelPosition": [{ type: Input },],
        "value": [{ type: Input },],
        "name": [{ type: Input },],
        "tabindex": [{ type: Input },],
        "disableRipple": [{ type: Input },],
        "required": [{ type: Input },],
        "ariaLabelledBy": [{ type: Input, args: ["aria-labelledby",] },],
        "ariaLabel": [{ type: Input, args: ["aria-label",] },],
        "change": [{ type: Output },],
        "cssClass": [{ type: HostBinding, args: ["class.igx-radio",] },],
        "checked": [{ type: HostBinding, args: ["class.igx-radio--checked",] }, { type: Input },],
        "disabled": [{ type: HostBinding, args: ["class.igx-radio--disabled",] }, { type: Input },],
        "focused": [{ type: HostBinding, args: ["class.igx-radio--focused",] },],
    };
    return IgxRadioComponent;
}());
export { IgxRadioComponent };
var IgxRadioModule = (function () {
    function IgxRadioModule() {
    }
    IgxRadioModule.decorators = [
        { type: NgModule, args: [{
                    declarations: [IgxRadioComponent],
                    exports: [IgxRadioComponent],
                    imports: [IgxRippleModule]
                },] },
    ];
    return IgxRadioModule;
}());
export { IgxRadioModule };
export { ɵ0 };
