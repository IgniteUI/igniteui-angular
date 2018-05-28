import { ChangeDetectorRef, Directive, ElementRef, forwardRef, HostBinding, HostListener, Inject, Input, Optional, Self } from "@angular/core";
import { NgModel } from "@angular/forms";
import { IgxInputGroupComponent } from "../../main";
var nativeValidationAttributes = ["required", "pattern", "minlength", "maxlength", "min", "max", "step"];
export var IgxInputState;
(function (IgxInputState) {
    IgxInputState[IgxInputState["INITIAL"] = 0] = "INITIAL";
    IgxInputState[IgxInputState["VALID"] = 1] = "VALID";
    IgxInputState[IgxInputState["INVALID"] = 2] = "INVALID";
})(IgxInputState || (IgxInputState = {}));
var IgxInputDirective = (function () {
    function IgxInputDirective(inputGroup, ngModel, element, cdr) {
        this.inputGroup = inputGroup;
        this.ngModel = ngModel;
        this.element = element;
        this.cdr = cdr;
        this._valid = IgxInputState.INITIAL;
        this.isInput = false;
        this.isTextArea = false;
    }
    Object.defineProperty(IgxInputDirective.prototype, "value", {
        get: function () {
            return this.nativeElement.value;
        },
        set: function (value) {
            this.nativeElement.value = value;
            this.inputGroup.isFilled = value && value.length > 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxInputDirective.prototype, "disabled", {
        get: function () {
            return this.nativeElement.hasAttribute("disabled");
        },
        set: function (value) {
            this.nativeElement.disabled = value;
            this.inputGroup.isDisabled = value;
        },
        enumerable: true,
        configurable: true
    });
    IgxInputDirective.prototype.onFocus = function (event) {
        this.inputGroup.isFocused = true;
    };
    IgxInputDirective.prototype.onBlur = function (event) {
        this.inputGroup.isFocused = false;
        this._valid = IgxInputState.INITIAL;
        if (this.ngModel) {
            if (!this.ngModel.valid) {
                this._valid = IgxInputState.INVALID;
            }
        }
        else if (this._hasValidators() && !this.nativeElement.checkValidity()) {
            this._valid = IgxInputState.INVALID;
        }
    };
    IgxInputDirective.prototype.onInput = function (event) {
        var value = this.nativeElement.value;
        this.inputGroup.isFilled = value && value.length > 0;
        if (!this.ngModel && this._hasValidators()) {
            this._valid = this.nativeElement.checkValidity() ? IgxInputState.VALID : IgxInputState.INVALID;
        }
    };
    IgxInputDirective.prototype.ngAfterViewInit = function () {
        if (this.nativeElement.hasAttribute("placeholder")) {
            this.inputGroup.hasPlaceholder = true;
        }
        if (this.nativeElement.hasAttribute("required")) {
            this.inputGroup.isRequired = true;
        }
        if (this.nativeElement.hasAttribute("disabled")) {
            this.inputGroup.isDisabled = true;
        }
        if ((this.nativeElement.value && this.nativeElement.value.length > 0) ||
            (this.ngModel && this.ngModel.model && this.ngModel.model.length > 0)) {
            this.inputGroup.isFilled = true;
        }
        var elTag = this.nativeElement.tagName.toLowerCase();
        if (elTag === "textarea") {
            this.isTextArea = true;
        }
        else {
            this.isInput = true;
        }
        if (this.ngModel) {
            this._statusChanges$ = this.ngModel.statusChanges.subscribe(this.onStatusChanged.bind(this));
        }
        this.cdr.detectChanges();
    };
    IgxInputDirective.prototype.ngOnDestroy = function () {
        if (this._statusChanges$) {
            this._statusChanges$.unsubscribe();
        }
    };
    IgxInputDirective.prototype.focus = function () {
        this.nativeElement.focus();
    };
    Object.defineProperty(IgxInputDirective.prototype, "nativeElement", {
        get: function () {
            return this.element.nativeElement;
        },
        enumerable: true,
        configurable: true
    });
    IgxInputDirective.prototype.onStatusChanged = function (status) {
        if (!this.ngModel.control.pristine && (this.ngModel.validator || this.ngModel.asyncValidator)) {
            this._valid = this.ngModel.valid ? IgxInputState.VALID : IgxInputState.INVALID;
        }
    };
    Object.defineProperty(IgxInputDirective.prototype, "required", {
        get: function () {
            return this.nativeElement.hasAttribute("required");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxInputDirective.prototype, "hasPlaceholder", {
        get: function () {
            return this.nativeElement.hasAttribute("placeholder");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxInputDirective.prototype, "placeholder", {
        get: function () {
            return this.nativeElement.placeholder;
        },
        enumerable: true,
        configurable: true
    });
    IgxInputDirective.prototype._hasValidators = function () {
        for (var _i = 0, nativeValidationAttributes_1 = nativeValidationAttributes; _i < nativeValidationAttributes_1.length; _i++) {
            var nativeValidationAttribute = nativeValidationAttributes_1[_i];
            if (this.nativeElement.hasAttribute(nativeValidationAttribute)) {
                return true;
            }
        }
        return false;
    };
    Object.defineProperty(IgxInputDirective.prototype, "focused", {
        get: function () {
            return this.inputGroup.isFocused;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxInputDirective.prototype, "valid", {
        get: function () {
            return this._valid;
        },
        set: function (value) {
            this._valid = value;
        },
        enumerable: true,
        configurable: true
    });
    IgxInputDirective.decorators = [
        { type: Directive, args: [{
                    selector: "[igxInput]"
                },] },
    ];
    IgxInputDirective.ctorParameters = function () { return [
        { type: IgxInputGroupComponent, decorators: [{ type: Inject, args: [forwardRef(function () { return IgxInputGroupComponent; }),] },] },
        { type: NgModel, decorators: [{ type: Optional }, { type: Self }, { type: Inject, args: [NgModel,] },] },
        { type: ElementRef, },
        { type: ChangeDetectorRef, },
    ]; };
    IgxInputDirective.propDecorators = {
        "value": [{ type: Input, args: ["value",] },],
        "disabled": [{ type: Input },],
        "isInput": [{ type: HostBinding, args: ["class.igx-input-group__input",] },],
        "isTextArea": [{ type: HostBinding, args: ["class.igx-input-group__textarea",] },],
        "onFocus": [{ type: HostListener, args: ["focus", ["$event"],] },],
        "onBlur": [{ type: HostListener, args: ["blur", ["$event"],] },],
        "onInput": [{ type: HostListener, args: ["input", ["$event"],] },],
    };
    return IgxInputDirective;
}());
export { IgxInputDirective };
