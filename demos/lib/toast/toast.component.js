import { animate, state, style, transition, trigger } from "@angular/animations";
import { CommonModule } from "@angular/common";
import { Component, ElementRef, EventEmitter, HostBinding, Input, NgModule, Optional, Output } from "@angular/core";
import { IgxNavigationService } from "../core/navigation";
var NEXT_ID = 0;
var IgxToastComponent = (function () {
    function IgxToastComponent(elementRef, navService) {
        this.elementRef = elementRef;
        this.navService = navService;
        this.CSS_CLASSES = {
            IGX_TOAST_BOTTOM: "igx-toast--bottom",
            IGX_TOAST_MIDDLE: "igx-toast--middle",
            IGX_TOAST_TOP: "igx-toast--top"
        };
        this.id = "igx-toast-" + NEXT_ID++;
        this.onShowing = new EventEmitter();
        this.onShown = new EventEmitter();
        this.onHiding = new EventEmitter();
        this.onHidden = new EventEmitter();
        this.role = "alert";
        this.autoHide = true;
        this.displayTime = 4000;
        this.isVisible = false;
        this.position = IgxToastPosition.Bottom;
    }
    Object.defineProperty(IgxToastComponent.prototype, "element", {
        get: function () {
            return this.elementRef.nativeElement;
        },
        enumerable: true,
        configurable: true
    });
    IgxToastComponent.prototype.show = function () {
        var _this = this;
        clearInterval(this.timeoutId);
        this.onShowing.emit(this);
        this.isVisible = true;
        if (this.autoHide) {
            this.timeoutId = setTimeout(function () {
                _this.hide();
            }, this.displayTime);
        }
        this.onShown.emit(this);
    };
    IgxToastComponent.prototype.hide = function () {
        this.onHiding.emit(this);
        this.isVisible = false;
        this.onHidden.emit(this);
        clearInterval(this.timeoutId);
    };
    IgxToastComponent.prototype.open = function () {
        this.show();
    };
    IgxToastComponent.prototype.close = function () {
        this.hide();
    };
    IgxToastComponent.prototype.toggle = function () {
        this.isVisible ? this.close() : this.open();
    };
    IgxToastComponent.prototype.mapPositionToClassName = function () {
        if (this.position === IgxToastPosition.Top) {
            return this.CSS_CLASSES.IGX_TOAST_TOP;
        }
        if (this.position === IgxToastPosition.Middle) {
            return this.CSS_CLASSES.IGX_TOAST_MIDDLE;
        }
        if (this.position === IgxToastPosition.Bottom) {
            return this.CSS_CLASSES.IGX_TOAST_BOTTOM;
        }
    };
    IgxToastComponent.prototype.ngOnInit = function () {
        if (this.navService && this.id) {
            this.navService.add(this.id, this);
        }
    };
    IgxToastComponent.prototype.ngOnDestroy = function () {
        if (this.navService && this.id) {
            this.navService.remove(this.id);
        }
    };
    IgxToastComponent.decorators = [
        { type: Component, args: [{
                    animations: [
                        trigger("animate", [
                            state("show", style({
                                opacity: 1
                            })),
                            transition("* => show", animate(".20s ease")),
                            transition("show => *", animate(".40s ease-out"))
                        ])
                    ],
                    selector: "igx-toast",
                    template: "<div [ngClass]=\"mapPositionToClassName()\" *ngIf=\"this.isVisible\" [@animate]=\"'show'\">     {{ message }} </div>"
                },] },
    ];
    IgxToastComponent.ctorParameters = function () { return [
        { type: ElementRef, },
        { type: IgxNavigationService, decorators: [{ type: Optional },] },
    ]; };
    IgxToastComponent.propDecorators = {
        "id": [{ type: HostBinding, args: ["attr.id",] }, { type: Input },],
        "onShowing": [{ type: Output },],
        "onShown": [{ type: Output },],
        "onHiding": [{ type: Output },],
        "onHidden": [{ type: Output },],
        "role": [{ type: Input },],
        "autoHide": [{ type: Input },],
        "displayTime": [{ type: Input },],
        "isVisible": [{ type: Input },],
        "message": [{ type: Input },],
        "position": [{ type: Input },],
    };
    return IgxToastComponent;
}());
export { IgxToastComponent };
export var IgxToastPosition;
(function (IgxToastPosition) {
    IgxToastPosition[IgxToastPosition["Bottom"] = 0] = "Bottom";
    IgxToastPosition[IgxToastPosition["Middle"] = 1] = "Middle";
    IgxToastPosition[IgxToastPosition["Top"] = 2] = "Top";
})(IgxToastPosition || (IgxToastPosition = {}));
var IgxToastModule = (function () {
    function IgxToastModule() {
    }
    IgxToastModule.decorators = [
        { type: NgModule, args: [{
                    declarations: [IgxToastComponent],
                    exports: [IgxToastComponent],
                    imports: [CommonModule]
                },] },
    ];
    return IgxToastModule;
}());
export { IgxToastModule };
