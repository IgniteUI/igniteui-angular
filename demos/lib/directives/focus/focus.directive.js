import { Directive, ElementRef, Input, NgModule } from "@angular/core";
var IgxFocusDirective = (function () {
    function IgxFocusDirective(element) {
        this.element = element;
        this.focusState = true;
    }
    Object.defineProperty(IgxFocusDirective.prototype, "focused", {
        get: function () {
            return this.focusState;
        },
        set: function (val) {
            this.focusState = val;
            this.trigger();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxFocusDirective.prototype, "nativeElement", {
        get: function () {
            return this.element.nativeElement;
        },
        enumerable: true,
        configurable: true
    });
    IgxFocusDirective.prototype.trigger = function () {
        var _this = this;
        if (this.focusState) {
            requestAnimationFrame(function () { return _this.nativeElement.focus(); });
        }
    };
    IgxFocusDirective.decorators = [
        { type: Directive, args: [{
                    exportAs: "igxFocus",
                    selector: "[igxFocus]"
                },] },
    ];
    IgxFocusDirective.ctorParameters = function () { return [
        { type: ElementRef, },
    ]; };
    IgxFocusDirective.propDecorators = {
        "focused": [{ type: Input, args: ["igxFocus",] },],
    };
    return IgxFocusDirective;
}());
export { IgxFocusDirective };
var IgxFocusModule = (function () {
    function IgxFocusModule() {
    }
    IgxFocusModule.decorators = [
        { type: NgModule, args: [{
                    declarations: [IgxFocusDirective],
                    exports: [IgxFocusDirective]
                },] },
    ];
    return IgxFocusModule;
}());
export { IgxFocusModule };
