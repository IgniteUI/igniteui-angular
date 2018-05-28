import { CommonModule } from "@angular/common";
import { Directive, ElementRef, EventEmitter, HostListener, Input, NgModule, Output } from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { KEYS, MaskHelper } from "./mask-helper";
var noop = function () { };
var ɵ0 = noop;
var IgxMaskDirective = (function () {
    function IgxMaskDirective(elementRef) {
        this.elementRef = elementRef;
        this.onValueChange = new EventEmitter();
        this._maskOptions = {
            format: "",
            promptChar: ""
        };
        this._onTouchedCallback = noop;
        this._onChangeCallback = noop;
        this.maskHelper = new MaskHelper();
    }
    Object.defineProperty(IgxMaskDirective.prototype, "value", {
        get: function () {
            return this.nativeElement.value;
        },
        set: function (val) {
            this.nativeElement.value = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxMaskDirective.prototype, "nativeElement", {
        get: function () {
            return this.elementRef.nativeElement;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxMaskDirective.prototype, "selectionStart", {
        get: function () {
            return this.nativeElement.selectionStart;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxMaskDirective.prototype, "selectionEnd", {
        get: function () {
            return this.nativeElement.selectionEnd;
        },
        enumerable: true,
        configurable: true
    });
    IgxMaskDirective.prototype.ngOnInit = function () {
        if (this.promptChar && this.promptChar.length > 1) {
            this._maskOptions.promptChar = this.promptChar = this.promptChar.substring(0, 1);
        }
        this._maskOptions.format = this.mask ? this.mask : "CCCCCCCCCC";
        this._maskOptions.promptChar = this.promptChar ? this.promptChar : "_";
        this.nativeElement.setAttribute("placeholder", this.mask);
    };
    IgxMaskDirective.prototype.onKeydown = function (event) {
        var key = event.keyCode || event.charCode;
        if (key === KEYS.Ctrl) {
            this._ctrlDown = true;
        }
        if ((this._ctrlDown && key === KEYS.Z) || (this._ctrlDown && key === KEYS.Y)) {
            event.preventDefault();
        }
        this._key = key;
        this._selection = Math.abs(this.selectionEnd - this.selectionStart);
    };
    IgxMaskDirective.prototype.onKeyup = function (event) {
        var key = event.keyCode || event.charCode;
        if (key === KEYS.Ctrl) {
            this._ctrlDown = false;
        }
    };
    IgxMaskDirective.prototype.onPaste = function (event) {
        this._paste = true;
        this._valOnPaste = this.value;
        this._cursorOnPaste = this.getCursorPosition();
    };
    IgxMaskDirective.prototype.onInputChanged = function (event) {
        if (this._paste) {
            this._paste = false;
            var clipboardData = this.value.substring(this._cursorOnPaste, this.getCursorPosition());
            this.value = this.maskHelper.parseValueByMaskUponCopyPaste(this._valOnPaste, this._maskOptions, this._cursorOnPaste, clipboardData, this._selection);
            this.setCursorPosition(this.maskHelper.cursor);
        }
        else {
            var currentCursorPos = this.getCursorPosition();
            this.maskHelper.data = (this._key === KEYS.BACKSPACE) || (this._key === KEYS.DELETE);
            this.value = this._selection && this._selection !== 0 ?
                this.maskHelper.parseValueByMaskUponSelection(this.value, this._maskOptions, currentCursorPos - 1, this._selection) :
                this.maskHelper.parseValueByMask(this.value, this._maskOptions, currentCursorPos - 1);
            this.setCursorPosition(this.maskHelper.cursor);
        }
        var rawVal = this.maskHelper.restoreValueFromMask(this.value, this._maskOptions);
        this.dataValue = this.includeLiterals ? this.value : rawVal;
        this._onChangeCallback(this.dataValue);
        this.onValueChange.emit({ rawValue: rawVal, formattedValue: this.value });
    };
    IgxMaskDirective.prototype.onFocus = function (event) {
        this.value = this.maskHelper.parseValueByMaskOnInit(this.value, this._maskOptions);
    };
    IgxMaskDirective.prototype.getCursorPosition = function () {
        return this.nativeElement.selectionStart;
    };
    IgxMaskDirective.prototype.setCursorPosition = function (start, end) {
        if (end === void 0) { end = start; }
        this.nativeElement.setSelectionRange(start, end);
    };
    IgxMaskDirective.prototype.writeValue = function (value) {
        if (this.promptChar && this.promptChar.length > 1) {
            this._maskOptions.promptChar = this.promptChar.substring(0, 1);
        }
        this.value = this.maskHelper.parseValueByMaskOnInit(value, this._maskOptions);
        this.dataValue = this.includeLiterals ? this.value : value;
        this._onChangeCallback(this.dataValue);
        this.onValueChange.emit({ rawValue: value, formattedValue: this.value });
    };
    IgxMaskDirective.prototype.registerOnChange = function (fn) { this._onChangeCallback = fn; };
    IgxMaskDirective.prototype.registerOnTouched = function (fn) { this._onTouchedCallback = fn; };
    IgxMaskDirective.decorators = [
        { type: Directive, args: [{
                    providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: IgxMaskDirective, multi: true }],
                    selector: "[igxMask]"
                },] },
    ];
    IgxMaskDirective.ctorParameters = function () { return [
        { type: ElementRef, },
    ]; };
    IgxMaskDirective.propDecorators = {
        "mask": [{ type: Input, args: ["igxMask",] },],
        "promptChar": [{ type: Input },],
        "includeLiterals": [{ type: Input },],
        "dataValue": [{ type: Input },],
        "onValueChange": [{ type: Output },],
        "onKeydown": [{ type: HostListener, args: ["keydown", ["$event"],] },],
        "onKeyup": [{ type: HostListener, args: ["keyup", ["$event"],] },],
        "onPaste": [{ type: HostListener, args: ["paste", ["$event"],] },],
        "onInputChanged": [{ type: HostListener, args: ["input", ["$event"],] },],
        "onFocus": [{ type: HostListener, args: ["focus", ["$event"],] },],
    };
    return IgxMaskDirective;
}());
export { IgxMaskDirective };
var IgxMaskModule = (function () {
    function IgxMaskModule() {
    }
    IgxMaskModule.decorators = [
        { type: NgModule, args: [{
                    declarations: [IgxMaskDirective],
                    exports: [IgxMaskDirective],
                    imports: [CommonModule]
                },] },
    ];
    return IgxMaskModule;
}());
export { IgxMaskModule };
export { ɵ0 };
