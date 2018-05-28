import { Directive, HostListener, Input, NgModule } from "@angular/core";
import { IgxNavigationService } from "./nav.service";
var IgxNavigationToggleDirective = (function () {
    function IgxNavigationToggleDirective(nav) {
        this.state = nav;
    }
    IgxNavigationToggleDirective.prototype.toggleNavigationDrawer = function () {
        this.state.toggle(this.target, true);
    };
    IgxNavigationToggleDirective.decorators = [
        { type: Directive, args: [{ selector: "[igxNavToggle]" },] },
    ];
    IgxNavigationToggleDirective.ctorParameters = function () { return [
        { type: IgxNavigationService, },
    ]; };
    IgxNavigationToggleDirective.propDecorators = {
        "target": [{ type: Input, args: ["igxNavToggle",] },],
        "toggleNavigationDrawer": [{ type: HostListener, args: ["click",] },],
    };
    return IgxNavigationToggleDirective;
}());
export { IgxNavigationToggleDirective };
var IgxNavigationCloseDirective = (function () {
    function IgxNavigationCloseDirective(nav) {
        this.state = nav;
    }
    IgxNavigationCloseDirective.prototype.closeNavigationDrawer = function () {
        this.state.close(this.target, true);
    };
    IgxNavigationCloseDirective.decorators = [
        { type: Directive, args: [{ selector: "[igxNavClose]" },] },
    ];
    IgxNavigationCloseDirective.ctorParameters = function () { return [
        { type: IgxNavigationService, },
    ]; };
    IgxNavigationCloseDirective.propDecorators = {
        "target": [{ type: Input, args: ["igxNavClose",] },],
        "closeNavigationDrawer": [{ type: HostListener, args: ["click",] },],
    };
    return IgxNavigationCloseDirective;
}());
export { IgxNavigationCloseDirective };
var IgxNavigationModule = (function () {
    function IgxNavigationModule() {
    }
    IgxNavigationModule.decorators = [
        { type: NgModule, args: [{
                    declarations: [IgxNavigationCloseDirective, IgxNavigationToggleDirective],
                    exports: [IgxNavigationCloseDirective, IgxNavigationToggleDirective],
                    providers: [IgxNavigationService]
                },] },
    ];
    return IgxNavigationModule;
}());
export { IgxNavigationModule };
