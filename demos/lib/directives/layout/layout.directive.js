import { Directive, HostBinding, Input, NgModule } from "@angular/core";
var IgxLayoutDirective = (function () {
    function IgxLayoutDirective() {
        this.dir = "row";
        this.reverse = false;
        this.wrap = "nowrap";
        this.justify = "flex-start";
        this.itemAlign = "stretch";
        this.display = "flex";
    }
    Object.defineProperty(IgxLayoutDirective.prototype, "flexwrap", {
        get: function () { return this.wrap; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxLayoutDirective.prototype, "justifycontent", {
        get: function () { return this.justify; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxLayoutDirective.prototype, "align", {
        get: function () { return this.itemAlign; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxLayoutDirective.prototype, "direction", {
        get: function () {
            if (this.reverse) {
                return (this.dir === "row") ? "row-reverse" : "column-reverse";
            }
            return (this.dir === "row") ? "row" : "column";
        },
        enumerable: true,
        configurable: true
    });
    IgxLayoutDirective.decorators = [
        { type: Directive, args: [{
                    selector: "[igxLayout]"
                },] },
    ];
    IgxLayoutDirective.propDecorators = {
        "dir": [{ type: Input, args: ["igxLayoutDir",] },],
        "reverse": [{ type: Input, args: ["igxLayoutReverse",] },],
        "wrap": [{ type: Input, args: ["igxLayoutWrap",] },],
        "justify": [{ type: Input, args: ["igxLayoutJustify",] },],
        "itemAlign": [{ type: Input, args: ["igxLayoutItemAlign",] },],
        "display": [{ type: HostBinding, args: ["style.display",] },],
        "flexwrap": [{ type: HostBinding, args: ["style.flex-wrap",] },],
        "justifycontent": [{ type: HostBinding, args: ["style.justify-content",] },],
        "align": [{ type: HostBinding, args: ["style.align-items",] },],
        "direction": [{ type: HostBinding, args: ["style.flex-direction",] },],
    };
    return IgxLayoutDirective;
}());
export { IgxLayoutDirective };
var IgxFlexDirective = (function () {
    function IgxFlexDirective() {
        this.grow = 1;
        this.shrink = 1;
        this.flex = "";
        this.order = 0;
        this.basis = "auto";
    }
    Object.defineProperty(IgxFlexDirective.prototype, "style", {
        get: function () {
            if (this.flex) {
                return "" + this.flex;
            }
            return this.grow + " " + this.shrink + " " + this.basis;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxFlexDirective.prototype, "itemorder", {
        get: function () {
            return this.order || 0;
        },
        enumerable: true,
        configurable: true
    });
    IgxFlexDirective.decorators = [
        { type: Directive, args: [{
                    selector: "[igxFlex]"
                },] },
    ];
    IgxFlexDirective.propDecorators = {
        "grow": [{ type: Input, args: ["igxFlexGrow",] },],
        "shrink": [{ type: Input, args: ["igxFlexShrink",] },],
        "flex": [{ type: Input, args: ["igxFlex",] },],
        "order": [{ type: Input, args: ["igxFlexOrder",] },],
        "basis": [{ type: Input, args: ["igxFlexBasis",] },],
        "style": [{ type: HostBinding, args: ["style.flex",] },],
        "itemorder": [{ type: HostBinding, args: ["style.order",] },],
    };
    return IgxFlexDirective;
}());
export { IgxFlexDirective };
var IgxLayoutModule = (function () {
    function IgxLayoutModule() {
    }
    IgxLayoutModule.decorators = [
        { type: NgModule, args: [{
                    declarations: [IgxFlexDirective, IgxLayoutDirective],
                    exports: [IgxFlexDirective, IgxLayoutDirective]
                },] },
    ];
    return IgxLayoutModule;
}());
export { IgxLayoutModule };
