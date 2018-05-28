import { Directive, ElementRef, HostBinding, Input, NgModule, Renderer2 } from "@angular/core";
var IgxButtonDirective = (function () {
    function IgxButtonDirective(_el, _renderer) {
        this._el = _el;
        this._renderer = _renderer;
        this._type = "flat";
        this._cssClass = "igx-button";
        this.role = "button";
    }
    Object.defineProperty(IgxButtonDirective.prototype, "type", {
        set: function (value) {
            this._type = value || this._type;
            this._renderer.addClass(this._el.nativeElement, this._cssClass + "--" + this._type);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxButtonDirective.prototype, "color", {
        set: function (value) {
            this._color = value || this._el.nativeElement.style.color;
            this._renderer.setStyle(this._el.nativeElement, "color", this._color);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxButtonDirective.prototype, "background", {
        set: function (value) {
            this._backgroundColor = value || this._backgroundColor;
            this._renderer.setStyle(this._el.nativeElement, "background", this._backgroundColor);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxButtonDirective.prototype, "label", {
        set: function (value) {
            this._label = value || this._label;
            this._renderer.setAttribute(this._el.nativeElement, "aria-label", this._label);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxButtonDirective.prototype, "disabled", {
        set: function (val) {
            val = !!val;
            if (val) {
                this._renderer.addClass(this._el.nativeElement, this._cssClass + "--disabled");
            }
            else {
                this._renderer.removeClass(this._el.nativeElement, this._cssClass + "--disabled");
            }
        },
        enumerable: true,
        configurable: true
    });
    IgxButtonDirective.decorators = [
        { type: Directive, args: [{
                    selector: "[igxButton]"
                },] },
    ];
    IgxButtonDirective.ctorParameters = function () { return [
        { type: ElementRef, },
        { type: Renderer2, },
    ]; };
    IgxButtonDirective.propDecorators = {
        "role": [{ type: HostBinding, args: ["attr.role",] },],
        "type": [{ type: Input, args: ["igxButton",] },],
        "color": [{ type: Input, args: ["igxButtonColor",] },],
        "background": [{ type: Input, args: ["igxButtonBackground",] },],
        "label": [{ type: Input, args: ["igxLabel",] },],
        "disabled": [{ type: Input },],
    };
    return IgxButtonDirective;
}());
export { IgxButtonDirective };
var IgxButtonModule = (function () {
    function IgxButtonModule() {
    }
    IgxButtonModule.decorators = [
        { type: NgModule, args: [{
                    declarations: [IgxButtonDirective],
                    exports: [IgxButtonDirective]
                },] },
    ];
    return IgxButtonModule;
}());
export { IgxButtonModule };
