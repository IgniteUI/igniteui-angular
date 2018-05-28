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
export var LabelPosition;
(function (LabelPosition) {
    LabelPosition["BEFORE"] = "before";
    LabelPosition["AFTER"] = "after";
})(LabelPosition || (LabelPosition = {}));
var noop = function () { };
var ɵ0 = noop;
var nextId = 0;
var IgxCheckboxComponent = (function () {
    function IgxCheckboxComponent() {
        this.id = "igx-checkbox-" + nextId++;
        this.labelId = this.id + "-label";
        this.tabindex = null;
        this.labelPosition = LabelPosition.AFTER;
        this.disableRipple = false;
        this.required = false;
        this.ariaLabelledBy = this.labelId;
        this.ariaLabel = null;
        this.change = new EventEmitter();
        this.cssClass = "igx-checkbox";
        this.focused = false;
        this.indeterminate = false;
        this.checked = false;
        this.disabled = false;
        this.inputId = this.id + "-input";
        this._onTouchedCallback = noop;
        this._onChangeCallback = noop;
    }
    IgxCheckboxComponent.prototype.toggle = function () {
        if (this.disabled) {
            return;
        }
        this.indeterminate = false;
        this.focused = false;
        this.checked = !this.checked;
        this.change.emit({ checked: this.checked, checkbox: this });
        this._onChangeCallback(this.checked);
    };
    IgxCheckboxComponent.prototype._onCheckboxChange = function (event) {
        event.stopPropagation();
    };
    IgxCheckboxComponent.prototype._onCheckboxClick = function (event) {
        event.stopPropagation();
        this.toggle();
    };
    IgxCheckboxComponent.prototype._onLabelClick = function (event) {
        this.toggle();
    };
    IgxCheckboxComponent.prototype.onFocus = function (event) {
        this.focused = true;
    };
    IgxCheckboxComponent.prototype.onBlur = function (event) {
        this.focused = false;
        this._onTouchedCallback();
    };
    IgxCheckboxComponent.prototype.writeValue = function (value) {
        this._value = value;
        this.checked = !!this._value;
    };
    Object.defineProperty(IgxCheckboxComponent.prototype, "labelClass", {
        get: function () {
            switch (this.labelPosition) {
                case LabelPosition.BEFORE:
                    return this.cssClass + "__label--before";
                case LabelPosition.AFTER:
                default:
                    return this.cssClass + "__label";
            }
        },
        enumerable: true,
        configurable: true
    });
    IgxCheckboxComponent.prototype.registerOnChange = function (fn) { this._onChangeCallback = fn; };
    IgxCheckboxComponent.prototype.registerOnTouched = function (fn) { this._onTouchedCallback = fn; };
    IgxCheckboxComponent.decorators = [
        { type: Component, args: [{
                    providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: IgxCheckboxComponent, multi: true }],
                    selector: "igx-checkbox",
                    preserveWhitespaces: false,
                    template: "<input #checkbox class=\"igx-checkbox__input\"     type=\"checkbox\"     [id]=\"inputId\"     [name]=\"name\"     [value]=\"value\"     [tabindex]=\"tabindex\"     [disabled]=\"disabled\"     [indeterminate]=\"indeterminate\"     [checked]=\"checked\"     [required]=\"required\"     [attr.aria-checked]=\"checked\"     [attr.aria-labelledby]=\"ariaLabelledBy\"     [attr.aria-label]=\"ariaLabel\"     (change)=\"_onCheckboxChange($event)\"     (click)=\"_onCheckboxClick($event)\"     (focus)=\"onFocus($event)\"     (blur)=\"onBlur($event)\" />  <label #label class=\"igx-checkbox__composite\"     igxRipple     igxRippleTarget=\".igx-checkbox__ripple\"     [igxRippleDisabled]=\"disableRipple\"     [igxRippleCentered]=\"true\"     [igxRippleDuration]=\"100\"     [attr.for]=\"inputId\">     <svg class=\"igx-checkbox__composite-mark\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\">         <path d=\"M4.1,12.7 9,17.6 20.3,6.3\" />     </svg>     <div class=\"igx-checkbox__ripple\"></div> </label>  <span #placeholderLabel role=\"label\"     [class]=\"labelClass\"     [id]=\"labelId\"     (click)=\"_onLabelClick($event)\">     <ng-content></ng-content> </span>"
                },] },
    ];
    IgxCheckboxComponent.propDecorators = {
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
        "cssClass": [{ type: HostBinding, args: ["class.igx-checkbox",] },],
        "focused": [{ type: HostBinding, args: ["class.igx-checkbox--focused",] },],
        "indeterminate": [{ type: HostBinding, args: ["class.igx-checkbox--indeterminate",] }, { type: Input },],
        "checked": [{ type: HostBinding, args: ["class.igx-checkbox--checked",] }, { type: Input },],
        "disabled": [{ type: HostBinding, args: ["class.igx-checkbox--disabled",] }, { type: Input },],
    };
    return IgxCheckboxComponent;
}());
export { IgxCheckboxComponent };
export var IGX_CHECKBOX_REQUIRED_VALIDATOR = {
    provide: NG_VALIDATORS,
    useExisting: forwardRef(function () { return IgxCheckboxRequiredDirective; }),
    multi: true
};
var IgxCheckboxRequiredDirective = (function (_super) {
    __extends(IgxCheckboxRequiredDirective, _super);
    function IgxCheckboxRequiredDirective() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    IgxCheckboxRequiredDirective.decorators = [
        { type: Directive, args: [{
                    selector: "igx-checkbox[required][formControlName],\n    igx-checkbox[required][formControl],\n    igx-checkbox[required][ngModel]",
                    providers: [IGX_CHECKBOX_REQUIRED_VALIDATOR]
                },] },
    ];
    return IgxCheckboxRequiredDirective;
}(CheckboxRequiredValidator));
export { IgxCheckboxRequiredDirective };
var IgxCheckboxModule = (function () {
    function IgxCheckboxModule() {
    }
    IgxCheckboxModule.decorators = [
        { type: NgModule, args: [{
                    declarations: [IgxCheckboxComponent, IgxCheckboxRequiredDirective],
                    exports: [IgxCheckboxComponent, IgxCheckboxRequiredDirective],
                    imports: [IgxRippleModule]
                },] },
    ];
    return IgxCheckboxModule;
}());
export { IgxCheckboxModule };
export { ɵ0 };
