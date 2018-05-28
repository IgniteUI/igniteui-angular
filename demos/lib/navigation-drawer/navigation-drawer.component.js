import { Component, ContentChild, ElementRef, EventEmitter, HostBinding, Inject, Input, Optional, Output, Renderer, ViewChild } from "@angular/core";
import { fromEvent, interval } from "rxjs";
import { debounce } from "rxjs/operators";
import { IgxNavigationService } from "../core/navigation";
import { HammerGesturesManager } from "../core/touch";
import { IgxNavDrawerMiniTemplateDirective, IgxNavDrawerTemplateDirective } from "./navigation-drawer.directives";
var NEXT_ID = 0;
var IgxNavigationDrawerComponent = (function () {
    function IgxNavigationDrawerComponent(elementRef, _state, renderer, _touchManager) {
        var _this = this;
        this.elementRef = elementRef;
        this._state = _state;
        this.renderer = renderer;
        this._touchManager = _touchManager;
        this.cssClass = "igx-nav-drawer";
        this.id = "igx-nav-drawer-" + NEXT_ID++;
        this.position = "left";
        this.enableGestures = true;
        this.isOpen = false;
        this.pin = false;
        this.pinThreshold = 1024;
        this.width = "280px";
        this.miniWidth = "60px";
        this.pinChange = new EventEmitter(true);
        this.opening = new EventEmitter();
        this.opened = new EventEmitter();
        this.closing = new EventEmitter();
        this.closed = new EventEmitter();
        this._gesturesAttached = false;
        this._widthCache = { width: null, miniWidth: null };
        this.css = {
            drawer: "igx-nav-drawer__aside",
            mini: "igx-nav-drawer__aside--mini",
            overlay: "igx-nav-drawer__overlay",
            styleDummy: "igx-nav-drawer__style-dummy"
        };
        this._panning = false;
        this._maxEdgeZone = 50;
        this.checkPinThreshold = function (evt) {
            var windowWidth;
            if (_this.pinThreshold) {
                windowWidth = _this.getWindowWidth();
                if (!_this.pin && windowWidth >= _this.pinThreshold) {
                    _this.pin = true;
                    _this.pinChange.emit(true);
                }
                else if (_this.pin && windowWidth < _this.pinThreshold) {
                    _this.pin = false;
                    _this.pinChange.emit(false);
                }
            }
        };
        this.swipe = function (evt) {
            if (!_this.enableGestures || evt.pointerType !== "touch") {
                return;
            }
            var deltaX;
            var startPosition;
            if (_this.position === "right") {
                deltaX = -evt.deltaX;
                startPosition = _this.getWindowWidth() - (evt.center.x + evt.distance);
            }
            else {
                deltaX = evt.deltaX;
                startPosition = evt.center.x - evt.distance;
            }
            if ((_this.isOpen && deltaX < 0) ||
                (deltaX > 0 && startPosition < _this.maxEdgeZone)) {
                _this.toggle(true);
            }
        };
        this.panstart = function (evt) {
            if (!_this.enableGestures || _this.pin || evt.pointerType !== "touch") {
                return;
            }
            var startPosition = _this.position === "right" ? _this.getWindowWidth() - (evt.center.x + evt.distance)
                : evt.center.x - evt.distance;
            if (_this.isOpen || (startPosition < _this.maxEdgeZone)) {
                _this._panning = true;
                _this._panStartWidth = _this.getExpectedWidth(!_this.isOpen);
                _this._panLimit = _this.getExpectedWidth(_this.isOpen);
                _this.renderer.setElementClass(_this.overlay, "panning", true);
                _this.renderer.setElementClass(_this.drawer, "panning", true);
            }
        };
        this.pan = function (evt) {
            if (!_this._panning) {
                return;
            }
            var right = _this.position === "right";
            var deltaX = right ? -evt.deltaX : evt.deltaX;
            var visibleWidth;
            var newX;
            var percent;
            visibleWidth = _this._panStartWidth + deltaX;
            if (_this.isOpen && deltaX < 0) {
                if (visibleWidth <= _this._panLimit) {
                    return;
                }
                if (_this.hasAnimateWidth) {
                    percent = (visibleWidth - _this._panLimit) / (_this._panStartWidth - _this._panLimit);
                    newX = visibleWidth;
                }
                else {
                    percent = visibleWidth / _this._panStartWidth;
                    newX = evt.deltaX;
                }
                _this.setXSize(newX, percent.toPrecision(2));
            }
            else if (!_this.isOpen && deltaX > 0) {
                if (visibleWidth >= _this._panLimit) {
                    return;
                }
                if (_this.hasAnimateWidth) {
                    percent = (visibleWidth - _this._panStartWidth) / (_this._panLimit - _this._panStartWidth);
                    newX = visibleWidth;
                }
                else {
                    percent = visibleWidth / _this._panLimit;
                    newX = (_this._panLimit - visibleWidth) * (right ? 1 : -1);
                }
                _this.setXSize(newX, percent.toPrecision(2));
            }
        };
        this.panEnd = function (evt) {
            if (_this._panning) {
                var deltaX = _this.position === "right" ? -evt.deltaX : evt.deltaX;
                var visibleWidth = _this._panStartWidth + deltaX;
                _this.resetPan();
                if (_this.isOpen && visibleWidth <= _this._panStartWidth / 2) {
                    _this.close(true);
                }
                else if (!_this.isOpen && visibleWidth >= _this._panLimit / 2) {
                    _this.open(true);
                }
                _this._panStartWidth = null;
            }
        };
        this.toggleOpenedEvent = function (evt, fireEvents) {
            _this.elementRef.nativeElement.removeEventListener("transitionend", _this.toggleOpenedEvent, false);
            _this.opened.emit();
        };
        this.toggleClosedEvent = function (evt) {
            _this.elementRef.nativeElement.removeEventListener("transitionend", _this.toggleClosedEvent, false);
            _this.closed.emit();
        };
    }
    Object.defineProperty(IgxNavigationDrawerComponent.prototype, "element", {
        get: function () {
            return this.elementRef.nativeElement;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxNavigationDrawerComponent.prototype, "template", {
        get: function () {
            if (this.miniTemplate && !this.isOpen) {
                return this.miniTemplate.template;
            }
            else if (this.contentTemplate) {
                return this.contentTemplate.template;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxNavigationDrawerComponent.prototype, "miniTemplate", {
        get: function () {
            return this._miniTemplate;
        },
        set: function (v) {
            if (!this.isOpen) {
                this.setDrawerWidth(v ? this.miniWidth : "");
            }
            this._miniTemplate = v;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxNavigationDrawerComponent.prototype, "flexWidth", {
        get: function () {
            if (!this.pin) {
                return "0px";
            }
            if (this.isOpen) {
                return this.width;
            }
            if (this.miniTemplate && this.miniWidth) {
                return this.miniWidth;
            }
            return "0px";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxNavigationDrawerComponent.prototype, "drawer", {
        get: function () {
            return this._drawer.nativeElement;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxNavigationDrawerComponent.prototype, "overlay", {
        get: function () {
            return this._overlay.nativeElement;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxNavigationDrawerComponent.prototype, "styleDummy", {
        get: function () {
            return this._styleDummy.nativeElement;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxNavigationDrawerComponent.prototype, "hasAnimateWidth", {
        get: function () {
            return this.pin || !!this.miniTemplate;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxNavigationDrawerComponent.prototype, "maxEdgeZone", {
        get: function () {
            return this._maxEdgeZone;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxNavigationDrawerComponent.prototype, "expectedWidth", {
        get: function () {
            return this.getExpectedWidth(false);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxNavigationDrawerComponent.prototype, "expectedMiniWidth", {
        get: function () {
            return this.getExpectedWidth(true);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxNavigationDrawerComponent.prototype, "touchManager", {
        get: function () {
            return this._touchManager;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxNavigationDrawerComponent.prototype, "state", {
        get: function () {
            return this._state;
        },
        enumerable: true,
        configurable: true
    });
    IgxNavigationDrawerComponent.prototype.ngOnInit = function () {
        if (this._state) {
            this._state.add(this.id, this);
        }
        if (this.isOpen) {
            this.setDrawerWidth(this.width);
        }
    };
    IgxNavigationDrawerComponent.prototype.ngAfterContentInit = function () {
        this.updateEdgeZone();
        this.checkPinThreshold();
        this.ensureDrawerHeight();
        this.ensureEvents();
    };
    IgxNavigationDrawerComponent.prototype.ngOnDestroy = function () {
        this._touchManager.destroy();
        if (this._state) {
            this._state.remove(this.id);
        }
        if (this._resizeObserver) {
            this._resizeObserver.unsubscribe();
        }
    };
    IgxNavigationDrawerComponent.prototype.ngOnChanges = function (changes) {
        if (changes.enableGestures && changes.enableGestures.currentValue !== undefined) {
            this.enableGestures = !!(this.enableGestures && this.enableGestures.toString() === "true");
            this.ensureEvents();
        }
        if (changes.pin && changes.pin.currentValue !== undefined) {
            this.pin = !!(this.pin && this.pin.toString() === "true");
            this.ensureDrawerHeight();
            if (this.pin) {
                this._touchManager.destroy();
                this._gesturesAttached = false;
            }
            else {
                this.ensureEvents();
            }
        }
        if (changes.pinThreshold) {
            if (this.pinThreshold) {
                this.ensureEvents();
                this.checkPinThreshold();
            }
            else if (this._resizeObserver) {
                this._resizeObserver.unsubscribe();
                this._resizeObserver = null;
            }
        }
        if (changes.width && this.isOpen) {
            this.setDrawerWidth(changes.width.currentValue);
        }
        if (changes.miniWidth) {
            if (!this.isOpen) {
                this.setDrawerWidth(changes.miniWidth.currentValue);
            }
            this.updateEdgeZone();
        }
    };
    IgxNavigationDrawerComponent.prototype.toggle = function (fireEvents) {
        if (this.isOpen) {
            this.close(fireEvents);
        }
        else {
            this.open(fireEvents);
        }
    };
    IgxNavigationDrawerComponent.prototype.open = function (fireEvents) {
        if (this._panning) {
            this.resetPan();
        }
        if (this.isOpen) {
            return;
        }
        if (fireEvents) {
            this.opening.emit();
        }
        this.isOpen = true;
        this.elementRef.nativeElement.addEventListener("transitionend", this.toggleOpenedEvent, false);
        this.setDrawerWidth(this.width);
    };
    IgxNavigationDrawerComponent.prototype.close = function (fireEvents) {
        if (this._panning) {
            this.resetPan();
        }
        if (!this.isOpen) {
            return;
        }
        if (fireEvents) {
            this.closing.emit();
        }
        this.isOpen = false;
        this.setDrawerWidth(this.miniTemplate ? this.miniWidth : "");
        this.elementRef.nativeElement.addEventListener("transitionend", this.toggleClosedEvent, false);
    };
    IgxNavigationDrawerComponent.prototype.set_maxEdgeZone = function (value) {
        this._maxEdgeZone = value;
    };
    IgxNavigationDrawerComponent.prototype.ensureDrawerHeight = function () {
        if (this.pin) {
            this.renderer.setElementStyle(this.drawer, "height", window.innerHeight + "px");
        }
    };
    IgxNavigationDrawerComponent.prototype.getExpectedWidth = function (mini) {
        if (mini) {
            if (!this.miniTemplate) {
                return 0;
            }
            if (this.miniWidth) {
                return parseFloat(this.miniWidth);
            }
            else {
                if (this._widthCache.miniWidth === null) {
                    this.renderer.setElementClass(this.styleDummy, this.css.drawer, true);
                    this.renderer.setElementClass(this.styleDummy, this.css.mini, true);
                    this._widthCache.miniWidth = this.styleDummy.offsetWidth;
                    this.renderer.setElementClass(this.styleDummy, this.css.drawer, false);
                    this.renderer.setElementClass(this.styleDummy, this.css.mini, false);
                }
                return this._widthCache.miniWidth;
            }
        }
        else {
            if (this.width) {
                return parseFloat(this.width);
            }
            else {
                if (this._widthCache.width === null) {
                    this.renderer.setElementClass(this.styleDummy, this.css.drawer, true);
                    this._widthCache.width = this.styleDummy.offsetWidth;
                    this.renderer.setElementClass(this.styleDummy, this.css.drawer, false);
                }
                return this._widthCache.width;
            }
        }
    };
    IgxNavigationDrawerComponent.prototype.getWindowWidth = function () {
        return (window.innerWidth > 0) ? window.innerWidth : screen.width;
    };
    IgxNavigationDrawerComponent.prototype.setDrawerWidth = function (width) {
        var _this = this;
        window.requestAnimationFrame(function () {
            if (_this.drawer) {
                _this.renderer.setElementStyle(_this.drawer, "width", width);
            }
        });
    };
    IgxNavigationDrawerComponent.prototype.getDrawerWidth = function () {
        return this.drawer.offsetWidth;
    };
    IgxNavigationDrawerComponent.prototype.ensureEvents = function () {
        var _this = this;
        if (this.enableGestures && !this.pin && !this._gesturesAttached) {
            this._touchManager.addGlobalEventListener("document", "swipe", this.swipe);
            this._gesturesAttached = true;
            this._touchManager.addGlobalEventListener("document", "panstart", this.panstart);
            this._touchManager.addGlobalEventListener("document", "panmove", this.pan);
            this._touchManager.addGlobalEventListener("document", "panend", this.panEnd);
        }
        if (this.pinThreshold && !this._resizeObserver) {
            this._resizeObserver = fromEvent(window, "resize").pipe(debounce(function () { return interval(150); }))
                .subscribe(function (value) { _this.checkPinThreshold(); });
        }
    };
    IgxNavigationDrawerComponent.prototype.updateEdgeZone = function () {
        var maxValue;
        if (this.miniTemplate) {
            maxValue = Math.max(this._maxEdgeZone, this.getExpectedWidth(true) * 1.1);
            this.set_maxEdgeZone(maxValue);
        }
    };
    IgxNavigationDrawerComponent.prototype.resetPan = function () {
        this._panning = false;
        this.renderer.setElementClass(this.overlay, "panning", false);
        this.renderer.setElementClass(this.drawer, "panning", false);
        this.setXSize(0, "");
    };
    IgxNavigationDrawerComponent.prototype.setXSize = function (x, opacity) {
        var _this = this;
        window.requestAnimationFrame(function () {
            if (_this.hasAnimateWidth) {
                _this.renderer.setElementStyle(_this.drawer, "width", x ? Math.abs(x) + "px" : "");
            }
            else {
                _this.renderer.setElementStyle(_this.drawer, "transform", x ? "translate3d(" + x + "px,0,0)" : "");
                _this.renderer.setElementStyle(_this.drawer, "-webkit-transform", x ? "translate3d(" + x + "px,0,0)" : "");
            }
            if (opacity !== undefined) {
                _this.renderer.setElementStyle(_this.overlay, "opacity", opacity);
            }
        });
    };
    IgxNavigationDrawerComponent.decorators = [
        { type: Component, args: [{
                    providers: [HammerGesturesManager],
                    selector: "igx-nav-drawer",
                    template: "<ng-template #defaultItemsTemplate>     <div igxDrawerItem [isHeader]=\"true\">Navigation Drawer</div>     <div igxDrawerItem> Star by adding</div>     <div igxDrawerItem> <code>&lt;ng-template igxDrawer&gt;</code> </div>     <div igxDrawerItem> And some items inside </div>     <div igxDrawerItem> Style with igxDrawerItem </div>     <div igxDrawerItem> and igxRipple directives</div> </ng-template>  <div [hidden]=\"pin\"     class=\"igx-nav-drawer__overlay\"     [class.igx-nav-drawer__overlay--hidden]=\"!isOpen\"     (click)=\"close(true)\" #overlay> </div> <aside role=\"navigation\"     class=\"igx-nav-drawer__aside\"     [class.igx-nav-drawer__aside--collapsed]=\"!miniTemplate && !isOpen\"     [class.igx-nav-drawer__aside--mini]=\"miniTemplate && !isOpen\"     [class.igx-nav-drawer__aside--pinned]=\"pin\"     [class.igx-nav-drawer__aside--right]=\"position == 'right'\" #aside>      <ng-container *ngTemplateOutlet=\"template || defaultItemsTemplate\"></ng-container> </aside> <div class=\"igx-nav-drawer__style-dummy\" #dummy></div>"
                },] },
    ];
    IgxNavigationDrawerComponent.ctorParameters = function () { return [
        { type: ElementRef, decorators: [{ type: Inject, args: [ElementRef,] },] },
        { type: IgxNavigationService, decorators: [{ type: Optional },] },
        { type: Renderer, },
        { type: HammerGesturesManager, },
    ]; };
    IgxNavigationDrawerComponent.propDecorators = {
        "cssClass": [{ type: HostBinding, args: ["class",] },],
        "id": [{ type: HostBinding, args: ["attr.id",] }, { type: Input },],
        "position": [{ type: Input },],
        "enableGestures": [{ type: Input },],
        "isOpen": [{ type: Input },],
        "pin": [{ type: Input },],
        "pinThreshold": [{ type: Input },],
        "width": [{ type: Input },],
        "miniWidth": [{ type: Input },],
        "pinChange": [{ type: Output },],
        "opening": [{ type: Output },],
        "opened": [{ type: Output },],
        "closing": [{ type: Output },],
        "closed": [{ type: Output },],
        "miniTemplate": [{ type: ContentChild, args: [IgxNavDrawerMiniTemplateDirective, { read: IgxNavDrawerMiniTemplateDirective },] },],
        "contentTemplate": [{ type: ContentChild, args: [IgxNavDrawerTemplateDirective, { read: IgxNavDrawerTemplateDirective },] },],
        "flexWidth": [{ type: HostBinding, args: ["style.flexBasis",] },],
        "_drawer": [{ type: ViewChild, args: ["aside",] },],
        "_overlay": [{ type: ViewChild, args: ["overlay",] },],
        "_styleDummy": [{ type: ViewChild, args: ["dummy",] },],
    };
    return IgxNavigationDrawerComponent;
}());
export { IgxNavigationDrawerComponent };
