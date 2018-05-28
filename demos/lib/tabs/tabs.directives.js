import { Directive, forwardRef, Host, HostBinding, Inject, TemplateRef } from "@angular/core";
import { IgxTabsComponent } from "./tabs.component";
var ButtonStyle;
(function (ButtonStyle) {
    ButtonStyle["VISIBLE"] = "visible";
    ButtonStyle["HIDDEN"] = "hidden";
    ButtonStyle["NOT_DISPLAYED"] = "not_displayed";
})(ButtonStyle || (ButtonStyle = {}));
var IgxRightButtonStyleDirective = (function () {
    function IgxRightButtonStyleDirective(tabs) {
        this.tabs = tabs;
    }
    IgxRightButtonStyleDirective.prototype.getRightButtonStyle = function () {
        var viewPortWidth = this.tabs.viewPort.nativeElement.offsetWidth;
        var itemsContainerWidth = this.tabs.itemsContainer.nativeElement.offsetWidth;
        var headerContainerWidth = this.tabs.headerContainer.nativeElement.offsetWidth;
        var offset = this.tabs.offset;
        var total = offset + viewPortWidth;
        if (itemsContainerWidth <= headerContainerWidth && offset === 0) {
            return ButtonStyle.NOT_DISPLAYED;
        }
        if (itemsContainerWidth > total) {
            return ButtonStyle.VISIBLE;
        }
        else {
            return ButtonStyle.HIDDEN;
        }
    };
    Object.defineProperty(IgxRightButtonStyleDirective.prototype, "visibleCSS", {
        get: function () {
            return (this.getRightButtonStyle() === ButtonStyle.VISIBLE) ? true : false;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxRightButtonStyleDirective.prototype, "hiddenCSS", {
        get: function () {
            return (this.getRightButtonStyle() === ButtonStyle.HIDDEN) ? true : false;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxRightButtonStyleDirective.prototype, "notDisplayedCSS", {
        get: function () {
            return (this.getRightButtonStyle() === ButtonStyle.NOT_DISPLAYED) ? true : false;
        },
        enumerable: true,
        configurable: true
    });
    IgxRightButtonStyleDirective.decorators = [
        { type: Directive, args: [{
                    selector: "[igxRightButtonStyle]"
                },] },
    ];
    IgxRightButtonStyleDirective.ctorParameters = function () { return [
        { type: IgxTabsComponent, decorators: [{ type: Host }, { type: Inject, args: [forwardRef(function () { return IgxTabsComponent; }),] },] },
    ]; };
    IgxRightButtonStyleDirective.propDecorators = {
        "visibleCSS": [{ type: HostBinding, args: ["class.igx-tabs__header-button",] },],
        "hiddenCSS": [{ type: HostBinding, args: ["class.igx-tabs__header-button--hidden",] },],
        "notDisplayedCSS": [{ type: HostBinding, args: ["class.igx-tabs__header-button--none",] },],
    };
    return IgxRightButtonStyleDirective;
}());
export { IgxRightButtonStyleDirective };
var IgxLeftButtonStyleDirective = (function () {
    function IgxLeftButtonStyleDirective(tabs) {
        this.tabs = tabs;
    }
    IgxLeftButtonStyleDirective.prototype.getLeftButtonStyle = function () {
        var itemsContainerWidth = this.tabs.itemsContainer.nativeElement.offsetWidth;
        var headerContainerWidth = this.tabs.headerContainer.nativeElement.offsetWidth;
        var offset = this.tabs.offset;
        if (offset === 0) {
            if (itemsContainerWidth <= headerContainerWidth) {
                return ButtonStyle.NOT_DISPLAYED;
            }
            return ButtonStyle.HIDDEN;
        }
        else {
            return ButtonStyle.VISIBLE;
        }
    };
    Object.defineProperty(IgxLeftButtonStyleDirective.prototype, "visibleCSS", {
        get: function () {
            return (this.getLeftButtonStyle() === ButtonStyle.VISIBLE) ? true : false;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxLeftButtonStyleDirective.prototype, "hiddenCSS", {
        get: function () {
            return (this.getLeftButtonStyle() === ButtonStyle.HIDDEN) ? true : false;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxLeftButtonStyleDirective.prototype, "notDisplayedCSS", {
        get: function () {
            return (this.getLeftButtonStyle() === ButtonStyle.NOT_DISPLAYED) ? true : false;
        },
        enumerable: true,
        configurable: true
    });
    IgxLeftButtonStyleDirective.decorators = [
        { type: Directive, args: [{
                    selector: "[igxLeftButtonStyle]"
                },] },
    ];
    IgxLeftButtonStyleDirective.ctorParameters = function () { return [
        { type: IgxTabsComponent, decorators: [{ type: Host }, { type: Inject, args: [forwardRef(function () { return IgxTabsComponent; }),] },] },
    ]; };
    IgxLeftButtonStyleDirective.propDecorators = {
        "visibleCSS": [{ type: HostBinding, args: ["class.igx-tabs__header-button",] },],
        "hiddenCSS": [{ type: HostBinding, args: ["class.igx-tabs__header-button--hidden",] },],
        "notDisplayedCSS": [{ type: HostBinding, args: ["class.igx-tabs__header-button--none",] },],
    };
    return IgxLeftButtonStyleDirective;
}());
export { IgxLeftButtonStyleDirective };
var IgxTabItemTemplateDirective = (function () {
    function IgxTabItemTemplateDirective(template) {
        this.template = template;
    }
    IgxTabItemTemplateDirective.decorators = [
        { type: Directive, args: [{
                    selector: "[igxTab]"
                },] },
    ];
    IgxTabItemTemplateDirective.ctorParameters = function () { return [
        { type: TemplateRef, },
    ]; };
    return IgxTabItemTemplateDirective;
}());
export { IgxTabItemTemplateDirective };
