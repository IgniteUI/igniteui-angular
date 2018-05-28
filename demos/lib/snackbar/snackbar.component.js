import { transition, trigger, useAnimation } from "@angular/animations";
import { CommonModule } from "@angular/common";
import { Component, EventEmitter, HostBinding, Input, NgModule, NgZone, Output } from "@angular/core";
import { fadeIn, fadeOut, slideInBottom, slideOutBottom } from "../animations/main";
var NEXT_ID = 0;
var IgxSnackbarComponent = (function () {
    function IgxSnackbarComponent(zone) {
        this.zone = zone;
        this.id = "igx-snackbar-" + NEXT_ID++;
        this.isVisible = false;
        this.autoHide = true;
        this.displayTime = 4000;
        this.onAction = new EventEmitter();
        this.animationStarted = new EventEmitter();
        this.animationDone = new EventEmitter();
    }
    IgxSnackbarComponent.prototype.show = function () {
        var _this = this;
        clearTimeout(this.timeoutId);
        setTimeout(this.timeoutId);
        this.isVisible = true;
        if (this.autoHide) {
            this.timeoutId = setTimeout(function () {
                _this.hide();
            }, this.displayTime);
        }
    };
    IgxSnackbarComponent.prototype.hide = function () {
        this.isVisible = false;
        clearTimeout(this.timeoutId);
    };
    IgxSnackbarComponent.prototype.triggerAction = function () {
        this.onAction.emit(this);
    };
    IgxSnackbarComponent.prototype.snackbarAnimationStarted = function (evt) {
        if (evt.fromState === "void") {
            this.animationStarted.emit(evt);
        }
    };
    IgxSnackbarComponent.prototype.snackbarAnimationDone = function (evt) {
        if (evt.fromState === "show") {
            this.animationDone.emit(evt);
        }
    };
    IgxSnackbarComponent.decorators = [
        { type: Component, args: [{
                    animations: [
                        trigger("slideInOut", [
                            transition("void => *", [
                                useAnimation(slideInBottom, {
                                    params: {
                                        duration: ".35s",
                                        easing: "cubic-bezier(0.0, 0.0, 0.2, 1)",
                                        fromPosition: "translateY(100%)",
                                        toPosition: "translateY(0)"
                                    }
                                })
                            ]),
                            transition("* => void", [
                                useAnimation(slideOutBottom, {
                                    params: {
                                        duration: ".2s",
                                        easing: "cubic-bezier(0.4, 0.0, 1, 1)",
                                        fromPosition: "translateY(0)",
                                        toOpacity: 1,
                                        toPosition: "translateY(100%)"
                                    }
                                })
                            ])
                        ]),
                        trigger("fadeInOut", [
                            transition("void => *", [
                                useAnimation(fadeIn, {
                                    params: {
                                        duration: ".35s",
                                        easing: "ease-out"
                                    }
                                })
                            ]),
                            transition("* => void", [
                                useAnimation(fadeOut, {
                                    params: {
                                        duration: ".2s",
                                        easing: "ease-out"
                                    }
                                })
                            ])
                        ])
                    ],
                    selector: "igx-snackbar",
                    template: "<div class=\"igx-snackbar\" *ngIf=\"isVisible\" (@slideInOut.start)=\"snackbarAnimationStarted($event)\" (@slideInOut.done)=\"snackbarAnimationDone($event)\"     [@slideInOut]=\"isVisible\">     <span class=\"igx-snackbar__message\" [@fadeInOut]=\"isVisible\">{{ message }}</span>     <button class=\"igx-snackbar__button\" igxRipple=\"white\" *ngIf=\"actionText\" [@fadeInOut] (click)=\"triggerAction()\">             {{ actionText }}     </button> </div>"
                },] },
    ];
    IgxSnackbarComponent.ctorParameters = function () { return [
        { type: NgZone, },
    ]; };
    IgxSnackbarComponent.propDecorators = {
        "id": [{ type: HostBinding, args: ["attr.id",] }, { type: Input },],
        "message": [{ type: Input },],
        "isVisible": [{ type: Input },],
        "autoHide": [{ type: Input },],
        "displayTime": [{ type: Input },],
        "actionText": [{ type: Input },],
        "onAction": [{ type: Output },],
        "animationStarted": [{ type: Output },],
        "animationDone": [{ type: Output },],
    };
    return IgxSnackbarComponent;
}());
export { IgxSnackbarComponent };
var IgxSnackbarModule = (function () {
    function IgxSnackbarModule() {
    }
    IgxSnackbarModule.decorators = [
        { type: NgModule, args: [{
                    declarations: [IgxSnackbarComponent],
                    exports: [IgxSnackbarComponent],
                    imports: [CommonModule]
                },] },
    ];
    return IgxSnackbarModule;
}());
export { IgxSnackbarModule };
