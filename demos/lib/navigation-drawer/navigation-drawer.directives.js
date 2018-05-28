import { Directive, HostBinding, Input, TemplateRef } from "@angular/core";
var IgxNavDrawerItemDirective = (function () {
    function IgxNavDrawerItemDirective() {
        this.active = false;
        this.isHeader = false;
        this.activeClass = "igx-nav-drawer__item--active";
    }
    Object.defineProperty(IgxNavDrawerItemDirective.prototype, "defaultCSS", {
        get: function () {
            return !this.active && !this.isHeader;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxNavDrawerItemDirective.prototype, "currentCSS", {
        get: function () {
            return this.active && !this.isHeader;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxNavDrawerItemDirective.prototype, "headerCSS", {
        get: function () {
            return this.isHeader;
        },
        enumerable: true,
        configurable: true
    });
    IgxNavDrawerItemDirective.decorators = [
        { type: Directive, args: [{
                    selector: "[igxDrawerItem]",
                    exportAs: "igxDrawerItem"
                },] },
    ];
    IgxNavDrawerItemDirective.propDecorators = {
        "active": [{ type: Input, args: ["active",] },],
        "isHeader": [{ type: Input, args: ["isHeader",] },],
        "defaultCSS": [{ type: HostBinding, args: ["class.igx-nav-drawer__item",] },],
        "currentCSS": [{ type: HostBinding, args: ["class.igx-nav-drawer__item--active",] },],
        "headerCSS": [{ type: HostBinding, args: ["class.igx-nav-drawer__item--header",] },],
    };
    return IgxNavDrawerItemDirective;
}());
export { IgxNavDrawerItemDirective };
var IgxNavDrawerTemplateDirective = (function () {
    function IgxNavDrawerTemplateDirective(template) {
        this.template = template;
    }
    IgxNavDrawerTemplateDirective.decorators = [
        { type: Directive, args: [{
                    selector: "[igxDrawer]"
                },] },
    ];
    IgxNavDrawerTemplateDirective.ctorParameters = function () { return [
        { type: TemplateRef, },
    ]; };
    return IgxNavDrawerTemplateDirective;
}());
export { IgxNavDrawerTemplateDirective };
var IgxNavDrawerMiniTemplateDirective = (function () {
    function IgxNavDrawerMiniTemplateDirective(template) {
        this.template = template;
    }
    IgxNavDrawerMiniTemplateDirective.decorators = [
        { type: Directive, args: [{
                    selector: "[igxDrawerMini]"
                },] },
    ];
    IgxNavDrawerMiniTemplateDirective.ctorParameters = function () { return [
        { type: TemplateRef, },
    ]; };
    return IgxNavDrawerMiniTemplateDirective;
}());
export { IgxNavDrawerMiniTemplateDirective };
