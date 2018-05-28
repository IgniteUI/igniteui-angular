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
import { Component, Directive, EventEmitter, forwardRef, HostBinding, Input, NgModule, Output, ViewChild } from "@angular/core";
import { CheckboxRequiredValidator, NG_VALIDATORS, NG_VALUE_ACCESSOR } from "@angular/forms";
import { IgxRippleModule } from "../directives/ripple/ripple.directive";
export var SwitchLabelPosition;
(function (SwitchLabelPosition) {
    SwitchLabelPosition["BEFORE"] = "before";
    SwitchLabelPosition["AFTER"] = "after";
})(SwitchLabelPosition || (SwitchLabelPosition = {}));
var noop = function () { };
var ɵ0 = noop;
var nextId = 0;
var IgxSwitchComponent = (function () {
    function IgxSwitchComponent() {
        this.id = "igx-switch-" + nextId++;
        this.labelId = this.id + "-label";
        this.tabindex = null;
        this.labelPosition = "after";
        this.disableRipple = false;
        this.required = false;
        this.ariaLabelledBy = this.labelId;
        this.ariaLabel = null;
        this.change = new EventEmitter();
        this._onTouchedCallback = noop;
        this._onChangeCallback = noop;
        this.cssClass = "igx-switch";
        this.checked = false;
        this.disabled = false;
        this.focused = false;
        this.inputId = this.id + "-input";
    }
    IgxSwitchComponent.prototype.toggle = function () {
        if (this.disabled) {
            return;
        }
        this.checked = !this.checked;
        this.focused = false;
        this.change.emit({ checked: this.checked, switch: this });
        this._onChangeCallback(this.checked);
    };
    IgxSwitchComponent.prototype._onSwitchChange = function (event) {
        event.stopPropagation();
    };
    IgxSwitchComponent.prototype._onSwitchClick = function (event) {
        event.stopPropagation();
        this.toggle();
    };
    IgxSwitchComponent.prototype._onLabelClick = function (event) {
        this.toggle();
    };
    IgxSwitchComponent.prototype.onFocus = function (event) {
        this.focused = true;
    };
    IgxSwitchComponent.prototype.onBlur = function (event) {
        this.focused = false;
        this._onTouchedCallback();
    };
    IgxSwitchComponent.prototype.writeValue = function (value) {
        this._value = value;
        this.checked = !!this._value;
    };
    Object.defineProperty(IgxSwitchComponent.prototype, "labelClass", {
        get: function () {
            switch (this.labelPosition) {
                case SwitchLabelPosition.BEFORE:
                    return this.cssClass + "__label--before";
                case SwitchLabelPosition.AFTER:
                default:
                    return this.cssClass + "__label";
            }
        },
        enumerable: true,
        configurable: true
    });
    IgxSwitchComponent.prototype.registerOnChange = function (fn) { this._onChangeCallback = fn; };
    IgxSwitchComponent.prototype.registerOnTouched = function (fn) { this._onTouchedCallback = fn; };
    IgxSwitchComponent.decorators = [
        { type: Component, args: [{
                    providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: IgxSwitchComponent, multi: true }],
                    selector: "igx-switch",
                    template: "<input #checkbox class=\"igx-switch__input\" type=\"checkbox\"     [id]=\"inputId\"     [name]=\"name\"     [value]=\"value\"     [tabindex]=\"tabindex\"     [disabled]=\"disabled\"     [checked]=\"checked\"     [required]=\"required\"     [attr.aria-checked]=\"checked\"     [attr.aria-labelledby]=\"ariaLabelledBy\"     [attr.aria-label]=\"ariaLabel\"     (change)=\"_onSwitchChange($event)\"     (click)=\"_onSwitchClick($event)\"     (focus)=\"onFocus($event)\"     (blur)=\"onBlur($event)\" />  <label #label class =\"igx-switch__composite\" [for]=\"inputId\"     igxRipple     igxRippleTarget=\".igx-switch__ripple\"     [igxRippleDisabled]=\"disableRipple\"     [igxRippleCentered]=\"true\"     [igxRippleDuration]=\"100\">     <div class=\"igx-switch__composite-thumb\">         <div class=\"igx-switch__ripple\"></div>     </div> </label>  <span #placeholderLabel role=\"label\"     [class]=\"labelClass\"     [id]=\"labelId\"     (click)=\"_onLabelClick($event)\">     <ng-content></ng-content> </span>"
                },] },
    ];
    IgxSwitchComponent.propDecorators = {
        "nativeCheckbox": [{ type: ViewChild, args: ["checkbox",] },],
        "nativeLabel": [{ type: ViewChild, args: ["label",] },],
        "placeholderLabel": [{ type: ViewChild, args: ["placeholderLabel",] },],
        "id": [{ type: HostBinding, args: ["attr.id",] }, { type: Input },],
        "labelId": [{ type: Input },],
        "value": [{ type: Input },],
        "name": [{ type: Input },],
        "tabindex": [{ type: Input },],
        "labelPosition": [{ type: Input },],
        "disableRipple": [{ type: Input },],
        "required": [{ type: Input },],
        "ariaLabelledBy": [{ type: Input, args: ["aria-labelledby",] },],
        "ariaLabel": [{ type: Input, args: ["aria-label",] },],
        "change": [{ type: Output },],
        "cssClass": [{ type: HostBinding, args: ["class.igx-switch",] },],
        "checked": [{ type: HostBinding, args: ["class.igx-switch--checked",] }, { type: Input },],
        "disabled": [{ type: HostBinding, args: ["class.igx-switch--disabled",] }, { type: Input },],
        "focused": [{ type: HostBinding, args: ["class.igx-switch--focused",] },],
    };
    return IgxSwitchComponent;
}());
export { IgxSwitchComponent };
export var IGX_SWITCH_REQUIRED_VALIDATOR = {
    provide: NG_VALIDATORS,
    useExisting: forwardRef(function () { return IgxSwitchRequiredDirective; }),
    multi: true
};
var IgxSwitchRequiredDirective = (function (_super) {
    __extends(IgxSwitchRequiredDirective, _super);
    function IgxSwitchRequiredDirective() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    IgxSwitchRequiredDirective.decorators = [
        { type: Directive, args: [{
                    selector: "igx-switch[required][formControlName],\n    igx-switch[required][formControl],\n    igx-switch[required][ngModel]",
                    providers: [IGX_SWITCH_REQUIRED_VALIDATOR]
                },] },
    ];
    return IgxSwitchRequiredDirective;
}(CheckboxRequiredValidator));
export { IgxSwitchRequiredDirective };
var IgxSwitchModule = (function () {
    function IgxSwitchModule() {
    }
    IgxSwitchModule.decorators = [
        { type: NgModule, args: [{
                    declarations: [IgxSwitchComponent, IgxSwitchRequiredDirective],
                    exports: [IgxSwitchComponent, IgxSwitchRequiredDirective],
                    imports: [IgxRippleModule]
                },] },
    ];
    return IgxSwitchModule;
}());
export { IgxSwitchModule };
export { ɵ0 };
