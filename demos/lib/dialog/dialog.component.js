import { transition, trigger, useAnimation } from "@angular/animations";
import { CommonModule } from "@angular/common";
import { Component, ElementRef, EventEmitter, HostBinding, Input, NgModule, Optional, Output } from "@angular/core";
import { fadeIn, fadeOut, slideInBottom } from "../animations/main";
import { IgxNavigationService } from "../core/navigation";
import { IgxButtonModule } from "../directives/button/button.directive";
import { IgxRippleModule } from "../directives/ripple/ripple.directive";
import { IgxDialogActionsDirective, IgxDialogTitleDirective } from "./dialog.directives";
var DIALOG_ID = 0;
var IgxDialogComponent = (function () {
    function IgxDialogComponent(elementRef, navService) {
        this.elementRef = elementRef;
        this.navService = navService;
        this.id = "igx-dialog-" + DIALOG_ID++;
        this.title = "";
        this.message = "";
        this.leftButtonLabel = "";
        this.leftButtonType = "flat";
        this.leftButtonColor = "";
        this.leftButtonBackgroundColor = "";
        this.leftButtonRipple = "";
        this.rightButtonLabel = "";
        this.rightButtonType = "flat";
        this.rightButtonColor = "";
        this.rightButtonBackgroundColor = "";
        this.rightButtonRipple = "";
        this.closeOnOutsideSelect = false;
        this.onOpen = new EventEmitter();
        this.onClose = new EventEmitter();
        this.onLeftButtonSelect = new EventEmitter();
        this.onRightButtonSelect = new EventEmitter();
        this.tabindex = -1;
        this._isOpen = false;
        this._titleId = IgxDialogComponent.NEXT_ID++ + "_title";
    }
    Object.defineProperty(IgxDialogComponent.prototype, "element", {
        get: function () {
            return this.elementRef.nativeElement;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxDialogComponent.prototype, "state", {
        get: function () {
            return this._state;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxDialogComponent.prototype, "isOpen", {
        get: function () {
            return this._isOpen;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxDialogComponent.prototype, "role", {
        get: function () {
            if (this.leftButtonLabel !== "" && this.rightButtonLabel !== "") {
                return "dialog";
            }
            else if (this.leftButtonLabel !== "" ||
                this.rightButtonLabel !== "") {
                return "alertdialog";
            }
            else {
                return "alert";
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxDialogComponent.prototype, "titleId", {
        get: function () {
            return this._titleId;
        },
        enumerable: true,
        configurable: true
    });
    IgxDialogComponent.prototype.open = function () {
        if (this.isOpen) {
            return;
        }
        this.toggleState("open");
        this.onOpen.emit({ dialog: this, event: null });
    };
    IgxDialogComponent.prototype.close = function () {
        if (!this.isOpen) {
            return;
        }
        this.toggleState("close");
        this.onClose.emit({ dialog: this, event: null });
    };
    IgxDialogComponent.prototype.toggle = function () {
        this.isOpen ? this.close() : this.open();
    };
    IgxDialogComponent.prototype.onDialogSelected = function (event) {
        event.stopPropagation();
        if (this.isOpen &&
            this.closeOnOutsideSelect &&
            event.target.classList.contains(IgxDialogComponent.DIALOG_CLASS)) {
            this.close();
        }
    };
    IgxDialogComponent.prototype.onInternalLeftButtonSelect = function (event) {
        this.onLeftButtonSelect.emit({ dialog: this, event: event });
    };
    IgxDialogComponent.prototype.onInternalRightButtonSelect = function (event) {
        this.onRightButtonSelect.emit({ dialog: this, event: event });
    };
    IgxDialogComponent.prototype.ngOnInit = function () {
        if (this.navService && this.id) {
            this.navService.add(this.id, this);
        }
    };
    IgxDialogComponent.prototype.ngOnDestroy = function () {
        if (this.navService && this.id) {
            this.navService.remove(this.id);
        }
    };
    IgxDialogComponent.prototype.toggleState = function (state) {
        this._state = state;
        this._isOpen = state === "open" ? true : false;
    };
    IgxDialogComponent.NEXT_ID = 1;
    IgxDialogComponent.DIALOG_CLASS = "igx-dialog";
    IgxDialogComponent.decorators = [
        { type: Component, args: [{
                    animations: [
                        trigger("fadeInOut", [
                            transition("void => open", useAnimation(fadeIn)),
                            transition("open => void", useAnimation(fadeOut))
                        ]),
                        trigger("slideIn", [
                            transition("void => open", useAnimation(slideInBottom))
                        ])
                    ],
                    selector: "igx-dialog",
                    template: "<div #dialog class=\"igx-dialog\" *ngIf=\"isOpen\" [@fadeInOut]=\"state\" (click)=\"onDialogSelected($event)\">     <div #dialogWindow class=\"igx-dialog__window\" [@slideIn]=\"state\" [attr.role]=\"role\" [attr.aria-labelledby]=\"titleId\">          <div *ngIf=\"title\" [attr.id]=\"titleId\" class=\"igx-dialog__window-title\">             {{ title }}         </div>         <ng-content *ngIf=\"!title\" select=\"igx-dialog-title,[igxDialogTitle]\"></ng-content>          <div class=\"igx-dialog__window-content\" *ngIf=\"message\">{{ message }}</div>         <ng-content *ngIf=\"!message\"></ng-content>          <div *ngIf=\"leftButtonLabel || rightButtonLabel\" class=\"igx-dialog__window-actions\">             <button *ngIf=\"leftButtonLabel\" type=\"button\" igxButton=\"{{ leftButtonType }}\" igxButtonColor=\"{{ leftButtonColor }}\" igxButtonBackground=\"{{ leftButtonBackgroundColor }}\"                 igxRipple=\"{{ leftButtonRipple }}\" (click)=\"onInternalLeftButtonSelect($event)\">                 {{ leftButtonLabel }}             </button>             <button *ngIf=\"rightButtonLabel\" type=\"button\" igxButton=\"{{ rightButtonType }}\" igxButtonColor=\"{{ rightButtonColor }}\" igxButtonBackground=\"{{ rightButtonBackgroundColor }}\"                 igxRipple=\"{{ rightButtonRipple }}\" (click)=\"onInternalRightButtonSelect($event)\">                 {{ rightButtonLabel }}             </button>         </div>         <ng-content *ngIf=\"!leftButtonLabel && !rightButtonLabel\" select=\"igx-dialog-actions,[igxDialogActions]\"></ng-content>      </div> </div>"
                },] },
    ];
    IgxDialogComponent.ctorParameters = function () { return [
        { type: ElementRef, },
        { type: IgxNavigationService, decorators: [{ type: Optional },] },
    ]; };
    IgxDialogComponent.propDecorators = {
        "id": [{ type: HostBinding, args: ["attr.id",] }, { type: Input },],
        "title": [{ type: Input },],
        "message": [{ type: Input },],
        "leftButtonLabel": [{ type: Input },],
        "leftButtonType": [{ type: Input },],
        "leftButtonColor": [{ type: Input },],
        "leftButtonBackgroundColor": [{ type: Input },],
        "leftButtonRipple": [{ type: Input },],
        "rightButtonLabel": [{ type: Input },],
        "rightButtonType": [{ type: Input },],
        "rightButtonColor": [{ type: Input },],
        "rightButtonBackgroundColor": [{ type: Input },],
        "rightButtonRipple": [{ type: Input },],
        "closeOnOutsideSelect": [{ type: Input },],
        "onOpen": [{ type: Output },],
        "onClose": [{ type: Output },],
        "onLeftButtonSelect": [{ type: Output },],
        "onRightButtonSelect": [{ type: Output },],
        "tabindex": [{ type: HostBinding, args: ["attr.tabindex",] },],
        "isOpen": [{ type: Input },],
        "role": [{ type: Input },],
        "titleId": [{ type: Input },],
    };
    return IgxDialogComponent;
}());
export { IgxDialogComponent };
var IgxDialogModule = (function () {
    function IgxDialogModule() {
    }
    IgxDialogModule.decorators = [
        { type: NgModule, args: [{
                    declarations: [IgxDialogComponent, IgxDialogTitleDirective, IgxDialogActionsDirective],
                    exports: [IgxDialogComponent, IgxDialogTitleDirective, IgxDialogActionsDirective],
                    imports: [CommonModule, IgxButtonModule, IgxRippleModule]
                },] },
    ];
    return IgxDialogModule;
}());
export { IgxDialogModule };
