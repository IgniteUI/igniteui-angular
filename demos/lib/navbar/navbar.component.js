import { CommonModule } from "@angular/common";
import { Component, EventEmitter, HostBinding, Input, NgModule, Output } from "@angular/core";
import { IgxButtonModule } from "../directives/button/button.directive";
import { IgxIconModule } from "../icon";
var NEXT_ID = 0;
var IgxNavbarComponent = (function () {
    function IgxNavbarComponent() {
        this.isVisible = true;
        this.id = "igx-navbar-" + NEXT_ID++;
        this.onAction = new EventEmitter();
        this.titleId = "igx-navbar-" + IgxNavbarComponent.NEXT_ID++;
    }
    Object.defineProperty(IgxNavbarComponent.prototype, "isActionButtonVisible", {
        get: function () {
            if (!this.actionButtonIcon) {
                return false;
            }
            return this.isVisible;
        },
        set: function (value) {
            this.isVisible = value;
        },
        enumerable: true,
        configurable: true
    });
    IgxNavbarComponent.prototype._triggerAction = function () {
        this.onAction.emit(this);
    };
    IgxNavbarComponent.NEXT_ID = 1;
    IgxNavbarComponent.decorators = [
        { type: Component, args: [{
                    selector: "igx-navbar",
                    template: "<nav class=\"igx-navbar\" role=\"navigation\" [attr.aria-labelledby]=\"titleId\">     <div class=\"igx-navbar__left\">         <igx-icon (click)=\"_triggerAction()\" fontSet=\"material\" [name]=\"actionButtonIcon\" *ngIf=\"isActionButtonVisible\"></igx-icon>         <h1 class=\"igx-navbar__title\" [attr.id]=\"titleId\">{{ title }}</h1>     </div>     <div class=\"igx-navbar__right\">         <ng-content></ng-content>     </div> </nav>"
                },] },
    ];
    IgxNavbarComponent.propDecorators = {
        "id": [{ type: HostBinding, args: ["attr.id",] }, { type: Input },],
        "isActionButtonVisible": [{ type: Input },],
        "actionButtonIcon": [{ type: Input },],
        "title": [{ type: Input },],
        "onAction": [{ type: Output },],
        "titleId": [{ type: Input },],
    };
    return IgxNavbarComponent;
}());
export { IgxNavbarComponent };
var IgxNavbarModule = (function () {
    function IgxNavbarModule() {
    }
    IgxNavbarModule.decorators = [
        { type: NgModule, args: [{
                    declarations: [IgxNavbarComponent],
                    exports: [IgxNavbarComponent],
                    imports: [IgxButtonModule, IgxIconModule, CommonModule]
                },] },
    ];
    return IgxNavbarModule;
}());
export { IgxNavbarModule };
