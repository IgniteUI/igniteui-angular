import { Directive, ElementRef, HostListener, Input, NgModule, NgZone, Renderer2 } from "@angular/core";
var IgxRippleDirective = (function () {
    function IgxRippleDirective(elementRef, renderer, zone) {
        this.elementRef = elementRef;
        this.renderer = renderer;
        this.zone = zone;
        this.rippleTarget = "";
        this.rippleDuration = 600;
        this.rippleDisabled = false;
        this.rippleElementClass = "igx-ripple__inner";
        this.rippleHostClass = "igx-ripple";
        this.animationFrames = [
            { opacity: 0.5, transform: "scale(.3)" },
            { opacity: 0, transform: "scale(2)" }
        ];
        this.animationOptions = {
            duration: this.rippleDuration,
            fill: "forwards"
        };
        this._centered = false;
        this.animationQueue = [];
    }
    Object.defineProperty(IgxRippleDirective.prototype, "centered", {
        set: function (value) {
            this._centered = value || this.centered;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxRippleDirective.prototype, "nativeElement", {
        get: function () {
            return this.elementRef.nativeElement;
        },
        enumerable: true,
        configurable: true
    });
    IgxRippleDirective.prototype.onMouseDown = function (event) {
        var _this = this;
        this.zone.runOutsideAngular(function () { return _this._ripple(event); });
    };
    IgxRippleDirective.prototype.setStyles = function (rippleElement, styleParams) {
        this.renderer.addClass(rippleElement, this.rippleElementClass);
        this.renderer.setStyle(rippleElement, "width", styleParams.radius + "px");
        this.renderer.setStyle(rippleElement, "height", styleParams.radius + "px");
        this.renderer.setStyle(rippleElement, "top", styleParams.top + "px");
        this.renderer.setStyle(rippleElement, "left", styleParams.left + "px");
        if (this.rippleColor) {
            this.renderer.setStyle(rippleElement, "background", this.rippleColor);
        }
    };
    IgxRippleDirective.prototype._ripple = function (event) {
        var _this = this;
        if (this.rippleDisabled) {
            return;
        }
        event.stopPropagation();
        var target = (this.rippleTarget ? this.nativeElement.querySelector(this.rippleTarget) || this.nativeElement : this.nativeElement);
        var rectBounds = target.getBoundingClientRect();
        var radius = Math.max(rectBounds.width, rectBounds.height);
        var left = event.clientX - rectBounds.left - radius / 2;
        var top = event.clientY - rectBounds.top - radius / 2;
        if (this._centered) {
            left = top = 0;
        }
        var dimensions = {
            radius: radius,
            top: top,
            left: left
        };
        var rippleElement = this.renderer.createElement("span");
        this.setStyles(rippleElement, dimensions);
        this.renderer.addClass(target, this.rippleHostClass);
        this.renderer.appendChild(target, rippleElement);
        var animation = rippleElement.animate(this.animationFrames, this.animationOptions);
        this.animationQueue.push(animation);
        animation.onfinish = function () {
            _this.animationQueue.splice(_this.animationQueue.indexOf(animation), 1);
            target.removeChild(rippleElement);
            if (_this.animationQueue.length < 1) {
                _this.renderer.removeClass(target, _this.rippleHostClass);
            }
        };
    };
    IgxRippleDirective.decorators = [
        { type: Directive, args: [{
                    selector: "[igxRipple]"
                },] },
    ];
    IgxRippleDirective.ctorParameters = function () { return [
        { type: ElementRef, },
        { type: Renderer2, },
        { type: NgZone, },
    ]; };
    IgxRippleDirective.propDecorators = {
        "rippleTarget": [{ type: Input, args: ["igxRippleTarget",] },],
        "rippleColor": [{ type: Input, args: ["igxRipple",] },],
        "rippleDuration": [{ type: Input, args: ["igxRippleDuration",] },],
        "centered": [{ type: Input, args: ["igxRippleCentered",] },],
        "rippleDisabled": [{ type: Input, args: ["igxRippleDisabled",] },],
        "onMouseDown": [{ type: HostListener, args: ["mousedown", ["$event"],] },],
    };
    return IgxRippleDirective;
}());
export { IgxRippleDirective };
var IgxRippleModule = (function () {
    function IgxRippleModule() {
    }
    IgxRippleModule.decorators = [
        { type: NgModule, args: [{
                    declarations: [IgxRippleDirective],
                    exports: [IgxRippleDirective]
                },] },
    ];
    return IgxRippleModule;
}());
export { IgxRippleModule };
