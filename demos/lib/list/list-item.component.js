import { ChangeDetectionStrategy, Component, ElementRef, forwardRef, HostBinding, HostListener, Inject, Input, Renderer2 } from "@angular/core";
import { IgxListPanState } from "./list.common";
import { HammerGesturesManager } from "../core/touch";
import { IgxListComponent } from "./list.component";
var IgxListItemComponent = (function () {
    function IgxListItemComponent(list, elementRef, _renderer) {
        this.list = list;
        this.elementRef = elementRef;
        this._renderer = _renderer;
        this._panState = IgxListPanState.NONE;
        this._FRACTION_OF_WIDTH_TO_TRIGGER_GRIP = 0.5;
        this._currentLeft = 0;
        this.hidden = false;
        this.touchAction = "pan-y";
    }
    Object.defineProperty(IgxListItemComponent.prototype, "role", {
        get: function () {
            return this.isHeader ? "separator" : "listitem";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxListItemComponent.prototype, "headerStyle", {
        get: function () {
            return this.isHeader;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxListItemComponent.prototype, "innerStyle", {
        get: function () {
            return !this.isHeader;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxListItemComponent.prototype, "display", {
        get: function () {
            return this.hidden ? "none" : "";
        },
        enumerable: true,
        configurable: true
    });
    IgxListItemComponent.prototype.clicked = function (evt) {
        this.list.onItemClicked.emit({ item: this, event: evt });
    };
    IgxListItemComponent.prototype.panStart = function (ev) {
        if (!this.isTrue(this.list.allowLeftPanning) && !this.isTrue(this.list.allowRightPanning)) {
            return;
        }
        this._currentLeft = this.left;
    };
    IgxListItemComponent.prototype.panMove = function (ev) {
        if (!this.isTrue(this.list.allowLeftPanning) && !this.isTrue(this.list.allowRightPanning)) {
            return;
        }
        var isPanningToLeft = ev.deltaX < 0;
        if (isPanningToLeft && this.isTrue(this.list.allowLeftPanning)) {
            this.left = Math.max(this.maxLeft, this.left + ev.deltaX);
        }
        else if (!isPanningToLeft && this.isTrue(this.list.allowRightPanning)) {
            this.left = Math.min(this.maxRight, this.left + ev.deltaX);
        }
    };
    IgxListItemComponent.prototype.panEnd = function (ev) {
        if (!this.isTrue(this.list.allowLeftPanning) && !this.isTrue(this.list.allowRightPanning)) {
            return;
        }
        var oldPanState = this._panState;
        this.performMagneticGrip();
        if (oldPanState !== this._panState) {
            this.list.onPanStateChange.emit({ oldState: oldPanState, newState: this._panState, item: this });
            if (this._panState === IgxListPanState.LEFT) {
                this.list.onLeftPan.emit(this);
            }
            else if (this._panState === IgxListPanState.RIGHT) {
                this.list.onRightPan.emit(this);
            }
        }
    };
    Object.defineProperty(IgxListItemComponent.prototype, "panState", {
        get: function () {
            return this._panState;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxListItemComponent.prototype, "index", {
        get: function () {
            return this.list.children.toArray().indexOf(this);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxListItemComponent.prototype, "element", {
        get: function () {
            return this.elementRef.nativeElement;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxListItemComponent.prototype, "width", {
        get: function () {
            if (this.element) {
                return this.element.offsetWidth;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxListItemComponent.prototype, "maxLeft", {
        get: function () {
            return -this.width;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxListItemComponent.prototype, "maxRight", {
        get: function () {
            return this.width;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxListItemComponent.prototype, "left", {
        get: function () {
            return this.element.offsetLeft;
        },
        set: function (value) {
            var val = value + "";
            if (val.indexOf("px") === -1) {
                val += "px";
            }
            this.element.style.left = val;
        },
        enumerable: true,
        configurable: true
    });
    IgxListItemComponent.prototype.performMagneticGrip = function () {
        var widthTriggeringGrip = this.width * this._FRACTION_OF_WIDTH_TO_TRIGGER_GRIP;
        if (this.left > 0) {
            if (this.left > widthTriggeringGrip) {
                this.left = this.maxRight;
                this._panState = IgxListPanState.RIGHT;
            }
            else {
                this.left = 0;
                this._panState = IgxListPanState.NONE;
            }
        }
        else {
            if (-this.left > widthTriggeringGrip) {
                this.left = this.maxLeft;
                this._panState = IgxListPanState.LEFT;
            }
            else {
                this.left = 0;
                this._panState = IgxListPanState.NONE;
            }
        }
    };
    IgxListItemComponent.prototype.isTrue = function (value) {
        if (typeof (value) === "boolean") {
            return value;
        }
        else {
            return value === "true";
        }
    };
    IgxListItemComponent.decorators = [
        { type: Component, args: [{
                    providers: [HammerGesturesManager],
                    selector: "igx-list-item",
                    template: "<ng-content></ng-content>",
                    changeDetection: ChangeDetectionStrategy.OnPush
                },] },
    ];
    IgxListItemComponent.ctorParameters = function () { return [
        { type: IgxListComponent, decorators: [{ type: Inject, args: [forwardRef(function () { return IgxListComponent; }),] },] },
        { type: ElementRef, },
        { type: Renderer2, },
    ]; };
    IgxListItemComponent.propDecorators = {
        "isHeader": [{ type: Input },],
        "hidden": [{ type: Input },],
        "role": [{ type: HostBinding, args: ["attr.role",] },],
        "ariaLabel": [{ type: HostBinding, args: ["attr.aria-label",] },],
        "touchAction": [{ type: HostBinding, args: ["style.touch-action",] },],
        "headerStyle": [{ type: HostBinding, args: ["class.igx-list__header",] },],
        "innerStyle": [{ type: HostBinding, args: ["class.igx-list__item",] },],
        "display": [{ type: HostBinding, args: ["style.display",] },],
        "clicked": [{ type: HostListener, args: ["click", ["$event"],] },],
        "panStart": [{ type: HostListener, args: ["panstart", ["$event"],] },],
        "panMove": [{ type: HostListener, args: ["panmove", ["$event"],] },],
        "panEnd": [{ type: HostListener, args: ["panend", ["$event"],] },],
    };
    return IgxListItemComponent;
}());
export { IgxListItemComponent };
