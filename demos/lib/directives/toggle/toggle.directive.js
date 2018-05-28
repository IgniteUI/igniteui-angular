import { animate, AnimationBuilder, style } from "@angular/animations";
import { ChangeDetectorRef, Directive, ElementRef, EventEmitter, HostBinding, HostListener, Input, NgModule, Optional, Output } from "@angular/core";
import { IgxNavigationService } from "../../core/navigation";
var IgxToggleDirective = (function () {
    function IgxToggleDirective(elementRef, builder, cdr, navigationService) {
        this.elementRef = elementRef;
        this.builder = builder;
        this.cdr = cdr;
        this.navigationService = navigationService;
        this.onOpen = new EventEmitter();
        this.onClose = new EventEmitter();
        this.collapsed = true;
    }
    Object.defineProperty(IgxToggleDirective.prototype, "element", {
        get: function () {
            return this.elementRef.nativeElement;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxToggleDirective.prototype, "hiddenClass", {
        get: function () {
            return this.collapsed;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxToggleDirective.prototype, "defaultClass", {
        get: function () {
            return !this.collapsed;
        },
        enumerable: true,
        configurable: true
    });
    IgxToggleDirective.prototype.open = function (fireEvents, handler) {
        var _this = this;
        if (!this.collapsed) {
            return;
        }
        var player = this.animationActivation();
        player.onStart(function () { return _this.collapsed = !_this.collapsed; });
        player.onDone(function () {
            player.destroy();
            if (fireEvents) {
                _this.onOpen.emit();
            }
        });
        player.play();
    };
    IgxToggleDirective.prototype.close = function (fireEvents, handler) {
        var _this = this;
        if (this.collapsed) {
            return;
        }
        var player = this.animationActivation();
        player.onDone(function () {
            _this.collapsed = !_this.collapsed;
            _this.cdr.markForCheck();
            player.destroy();
            if (fireEvents) {
                _this.onClose.emit();
            }
        });
        player.play();
    };
    IgxToggleDirective.prototype.toggle = function (fireEvents) {
        this.collapsed ? this.open(fireEvents) : this.close(fireEvents);
    };
    IgxToggleDirective.prototype.ngOnInit = function () {
        if (this.navigationService && this.id) {
            this.navigationService.add(this.id, this);
        }
    };
    IgxToggleDirective.prototype.ngOnDestroy = function () {
        if (this.navigationService && this.id) {
            this.navigationService.remove(this.id);
        }
    };
    IgxToggleDirective.prototype.animationActivation = function () {
        var animation;
        this.collapsed ?
            animation = this.openingAnimation() :
            animation = this.closingAnimation();
        return animation.create(this.elementRef.nativeElement);
    };
    IgxToggleDirective.prototype.openingAnimation = function () {
        return this.builder.build([
            style({ transform: "scaleY(0) translateY(-48px)", transformOrigin: "100% 0%", opacity: 0 }),
            animate("200ms ease-out", style({ transform: "scaleY(1) translateY(0)", opacity: 1 }))
        ]);
    };
    IgxToggleDirective.prototype.closingAnimation = function () {
        return this.builder.build([
            style({ transform: "translateY(0)", opacity: 1 }),
            animate("120ms ease-in", style({ transform: "translateY(-12px)", opacity: 0 }))
        ]);
    };
    IgxToggleDirective.decorators = [
        { type: Directive, args: [{
                    exportAs: "toggle",
                    selector: "[igxToggle]"
                },] },
    ];
    IgxToggleDirective.ctorParameters = function () { return [
        { type: ElementRef, },
        { type: AnimationBuilder, },
        { type: ChangeDetectorRef, },
        { type: IgxNavigationService, decorators: [{ type: Optional },] },
    ]; };
    IgxToggleDirective.propDecorators = {
        "onOpen": [{ type: Output },],
        "onClose": [{ type: Output },],
        "collapsed": [{ type: Input },],
        "id": [{ type: Input },],
        "hiddenClass": [{ type: HostBinding, args: ["class.igx-toggle--hidden",] },],
        "defaultClass": [{ type: HostBinding, args: ["class.igx-toggle",] },],
    };
    return IgxToggleDirective;
}());
export { IgxToggleDirective };
var IgxToggleActionDirective = (function () {
    function IgxToggleActionDirective(element, navigationService) {
        this.element = element;
        this.navigationService = navigationService;
        this.closeOnOutsideClick = true;
    }
    Object.defineProperty(IgxToggleActionDirective.prototype, "target", {
        get: function () {
            if (typeof this._target === "string") {
                return this.navigationService.get(this._target);
            }
            return this._target;
        },
        set: function (target) {
            if (target !== null && target !== "") {
                this._target = target;
            }
        },
        enumerable: true,
        configurable: true
    });
    IgxToggleActionDirective.prototype.ngOnDestroy = function () {
        document.removeEventListener("click", this._handler, true);
    };
    IgxToggleActionDirective.prototype.ngOnInit = function () {
        var _this = this;
        if (this.closeOnOutsideClick) {
            this._handler = function (evt) {
                if (_this.target.element.contains(evt.target) || _this.element.nativeElement.contains(evt.target)) {
                    return;
                }
                _this.target.close(true);
                document.removeEventListener("click", _this._handler, true);
            };
            document.addEventListener("click", this._handler, true);
        }
    };
    IgxToggleActionDirective.prototype.onClick = function () {
        this.target.toggle(true);
        if (this._handler) {
            document.addEventListener("click", this._handler, true);
        }
    };
    IgxToggleActionDirective.decorators = [
        { type: Directive, args: [{
                    exportAs: "toggle-action",
                    selector: "[igxToggleAction]"
                },] },
    ];
    IgxToggleActionDirective.ctorParameters = function () { return [
        { type: ElementRef, },
        { type: IgxNavigationService, decorators: [{ type: Optional },] },
    ]; };
    IgxToggleActionDirective.propDecorators = {
        "closeOnOutsideClick": [{ type: Input },],
        "target": [{ type: Input, args: ["igxToggleAction",] },],
        "onClick": [{ type: HostListener, args: ["click",] },],
    };
    return IgxToggleActionDirective;
}());
export { IgxToggleActionDirective };
var IgxToggleModule = (function () {
    function IgxToggleModule() {
    }
    IgxToggleModule.decorators = [
        { type: NgModule, args: [{
                    declarations: [IgxToggleDirective, IgxToggleActionDirective],
                    exports: [IgxToggleDirective, IgxToggleActionDirective],
                    providers: [IgxNavigationService]
                },] },
    ];
    return IgxToggleModule;
}());
export { IgxToggleModule };
