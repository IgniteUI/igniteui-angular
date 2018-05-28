import { Directive, ElementRef, HostListener, Input, NgModule } from "@angular/core";
var IgxTextSelectionDirective = (function () {
    function IgxTextSelectionDirective(element) {
        this.element = element;
        this.selectionState = true;
    }
    Object.defineProperty(IgxTextSelectionDirective.prototype, "selected", {
        get: function () {
            return this.selectionState;
        },
        set: function (val) {
            this.selectionState = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxTextSelectionDirective.prototype, "nativeElement", {
        get: function () {
            return this.element.nativeElement;
        },
        enumerable: true,
        configurable: true
    });
    IgxTextSelectionDirective.prototype.onFocus = function () {
        this.trigger();
    };
    IgxTextSelectionDirective.prototype.trigger = function () {
        var _this = this;
        if (this.selected && this.nativeElement.value.length) {
            requestAnimationFrame(function () { return _this.nativeElement.setSelectionRange(0, _this.nativeElement.value.length); });
        }
    };
    IgxTextSelectionDirective.decorators = [
        { type: Directive, args: [{
                    exportAs: "igxTextSelection",
                    selector: "[igxTextSelection]"
                },] },
    ];
    IgxTextSelectionDirective.ctorParameters = function () { return [
        { type: ElementRef, },
    ]; };
    IgxTextSelectionDirective.propDecorators = {
        "selected": [{ type: Input, args: ["igxTextSelection",] },],
        "onFocus": [{ type: HostListener, args: ["focus",] },],
    };
    return IgxTextSelectionDirective;
}());
export { IgxTextSelectionDirective };
var IgxTextSelectionModule = (function () {
    function IgxTextSelectionModule() {
    }
    IgxTextSelectionModule.decorators = [
        { type: NgModule, args: [{
                    declarations: [IgxTextSelectionDirective],
                    exports: [IgxTextSelectionDirective]
                },] },
    ];
    return IgxTextSelectionModule;
}());
export { IgxTextSelectionModule };
