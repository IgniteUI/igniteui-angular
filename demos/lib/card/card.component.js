import { Component, Directive, HostBinding, Input, NgModule } from "@angular/core";
import { IgxButtonModule } from "../directives/button/button.directive";
var NEXT_ID = 0;
var IgxCardHeaderDirective = (function () {
    function IgxCardHeaderDirective() {
    }
    IgxCardHeaderDirective.decorators = [
        { type: Directive, args: [{
                    selector: "igx-card-header"
                },] },
    ];
    return IgxCardHeaderDirective;
}());
export { IgxCardHeaderDirective };
var IgxCardContentDirective = (function () {
    function IgxCardContentDirective() {
    }
    IgxCardContentDirective.decorators = [
        { type: Directive, args: [{
                    selector: "igx-card-content"
                },] },
    ];
    return IgxCardContentDirective;
}());
export { IgxCardContentDirective };
var IgxCardActionsDirective = (function () {
    function IgxCardActionsDirective() {
    }
    IgxCardActionsDirective.decorators = [
        { type: Directive, args: [{
                    selector: "igx-card-actions"
                },] },
    ];
    return IgxCardActionsDirective;
}());
export { IgxCardActionsDirective };
var IgxCardFooterDirective = (function () {
    function IgxCardFooterDirective() {
        this.role = "footer";
    }
    IgxCardFooterDirective.decorators = [
        { type: Directive, args: [{
                    selector: "igx-card-footer"
                },] },
    ];
    IgxCardFooterDirective.propDecorators = {
        "role": [{ type: Input },],
    };
    return IgxCardFooterDirective;
}());
export { IgxCardFooterDirective };
var IgxCardComponent = (function () {
    function IgxCardComponent() {
        this.id = "igx-card-" + NEXT_ID++;
    }
    IgxCardComponent.decorators = [
        { type: Component, args: [{
                    selector: "igx-card",
                    template: "<div class=\"igx-card\" role=\"group\">     <ng-content></ng-content> </div>"
                },] },
    ];
    IgxCardComponent.propDecorators = {
        "id": [{ type: HostBinding, args: ["attr.id",] }, { type: Input },],
    };
    return IgxCardComponent;
}());
export { IgxCardComponent };
var IgxCardModule = (function () {
    function IgxCardModule() {
    }
    IgxCardModule.decorators = [
        { type: NgModule, args: [{
                    declarations: [IgxCardComponent, IgxCardHeaderDirective,
                        IgxCardContentDirective, IgxCardActionsDirective, IgxCardFooterDirective],
                    exports: [IgxCardComponent, IgxCardHeaderDirective,
                        IgxCardContentDirective, IgxCardActionsDirective, IgxCardFooterDirective],
                    imports: [IgxButtonModule]
                },] },
    ];
    return IgxCardModule;
}());
export { IgxCardModule };
