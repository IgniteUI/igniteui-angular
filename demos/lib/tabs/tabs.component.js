import { CommonModule } from "@angular/common";
import { Component, ContentChildren, ElementRef, EventEmitter, forwardRef, HostBinding, HostListener, Input, NgModule, Output, QueryList, ViewChild, ViewChildren } from "@angular/core";
import { IgxBadgeModule } from "../badge/badge.component";
import { IgxRippleModule } from "../directives/ripple/ripple.directive";
import { IgxIconModule } from "../icon";
import { IgxTabItemComponent } from "./tab-item.component";
import { IgxTabsGroupComponent } from "./tabs-group.component";
import { IgxLeftButtonStyleDirective, IgxRightButtonStyleDirective, IgxTabItemTemplateDirective } from "./tabs.directives";
export var TabsType;
(function (TabsType) {
    TabsType["FIXED"] = "fixed";
    TabsType["CONTENTFIT"] = "contentfit";
})(TabsType || (TabsType = {}));
var IgxTabsComponent = (function () {
    function IgxTabsComponent(_element) {
        this._element = _element;
        this.tabsType = "contentfit";
        this.onTabItemSelected = new EventEmitter();
        this.onTabItemDeselected = new EventEmitter();
        this.selectedIndex = -1;
        this.offset = 0;
    }
    Object.defineProperty(IgxTabsComponent.prototype, "class", {
        get: function () {
            var defaultStyle = "igx-tabs";
            var fixedStyle = "igx-tabs--fixed";
            var iconStyle = "igx-tabs--icons";
            var iconLabelFound = this.groups.find(function (group) { return group.icon != null && group.label != null; });
            var css;
            switch (TabsType[this.tabsType.toUpperCase()]) {
                case TabsType.FIXED: {
                    css = fixedStyle;
                    break;
                }
                default: {
                    css = defaultStyle;
                    break;
                }
            }
            if (iconLabelFound !== undefined) {
                css = css + " " + iconStyle;
            }
            return css;
        },
        enumerable: true,
        configurable: true
    });
    IgxTabsComponent.prototype.scrollLeft = function (event) {
        this._scroll(false);
    };
    IgxTabsComponent.prototype.scrollRight = function (event) {
        this._scroll(true);
    };
    IgxTabsComponent.prototype._scroll = function (scrollRight) {
        var tabsArray = this.tabs.toArray();
        for (var _i = 0, tabsArray_1 = tabsArray; _i < tabsArray_1.length; _i++) {
            var tab = tabsArray_1[_i];
            var element = tab.nativeTabItem.nativeElement;
            if (scrollRight) {
                if (element.offsetWidth + element.offsetLeft > this.viewPort.nativeElement.offsetWidth + this.offset) {
                    this.scrollElement(element, scrollRight);
                    break;
                }
            }
            else {
                if (element.offsetWidth + element.offsetLeft >= this.offset) {
                    this.scrollElement(element, scrollRight);
                    break;
                }
            }
        }
    };
    IgxTabsComponent.prototype.scrollElement = function (element, scrollRight) {
        var _this = this;
        requestAnimationFrame(function () {
            var viewPortWidth = _this.viewPort.nativeElement.offsetWidth;
            _this.offset = (scrollRight) ? element.offsetWidth + element.offsetLeft - viewPortWidth : element.offsetLeft;
            _this.itemsContainer.nativeElement.style.transform = "translate(" + -_this.offset + "px)";
        });
    };
    Object.defineProperty(IgxTabsComponent.prototype, "selectedTabItem", {
        get: function () {
            if (this.tabs && this.selectedIndex !== undefined) {
                return this.tabs.toArray()[this.selectedIndex];
            }
        },
        enumerable: true,
        configurable: true
    });
    IgxTabsComponent.prototype.ngAfterViewInit = function () {
        var _this = this;
        setTimeout(function () {
            if (_this.selectedIndex === -1) {
                var selectableGroups = _this.groups.filter(function (p) { return !p.isDisabled; });
                var group = selectableGroups[0];
                if (group) {
                    group.select(50, true);
                }
            }
        }, 0);
    };
    IgxTabsComponent.prototype._selectedGroupHandler = function (args) {
        var _this = this;
        this.selectedIndex = args.group.index;
        this.groups.forEach(function (p) {
            if (p.index !== _this.selectedIndex) {
                _this._deselectGroup(p);
            }
        });
    };
    IgxTabsComponent.prototype._deselectGroup = function (group) {
        if (group.isDisabled || this.selectedTabItem.index === group.index) {
            return;
        }
        group.isSelected = false;
        group.relatedTab.tabindex = -1;
        this.onTabItemDeselected.emit({ tab: this.tabs[group.index], group: group });
    };
    IgxTabsComponent.decorators = [
        { type: Component, args: [{
                    selector: "igx-tabs",
                    template: "<!-- TODO Remove tab container from here --> <div #tabsContainer>     <div class=\"igx-tabs__header\" #headerContainer>         <button igxRipple class=\"igx-tabs__header-button\" igxButton=\"icon\" (click)=\"scrollLeft($event)\" igxLeftButtonStyle>             <igx-icon fontSet=\"material\" name=\"navigate_before\"></igx-icon>         </button>         <div class=\"igx-tabs__header-wrapper-fixed\" #viewPort>             <div #itemsContainer class=\"igx-tabs__header-wrapper-fluid\">                 <igx-tab-item igxRipple *ngFor=\"let group of groups\" [id]=\"'igx-tab-item-' + group.index\" [attr.aria-label]=\"group.label\"                     [attr.aria-disabled]=\"group.isDisabled\" [attr.aria-selected]=\"group.isSelected\" [attr.aria-controls]=\"'igx-tab-item-group-'+ group.index\"                     [ngClass]=\"{                 'igx-tabs__header-menu-item': !group.isSelected && !group.isDisabled,                 'igx-tabs__header-menu-item--selected': group.isSelected,                 'igx-tabs__header-menu-item--disabled': group.isDisabled }\" [relatedGroup]=\"group\" role=\"tab\">                 </igx-tab-item>                 <div #selectedIndicator class=\"igx-tabs__header-menu-item-indicator\"></div>             </div>         </div>         <button igxRipple class=\"igx-tabs__header-button\" igxButton=\"icon\" (click)=\"scrollRight($event)\" igxRightButtonStyle>             <igx-icon fontSet=\"material\" name=\"navigate_next\"></igx-icon>         </button>     </div>     <div class=\"igx-tabs__content-fixed\">         <div #contentsContainer class=\"igx-tabs__content-fluid\">             <ng-content></ng-content>         </div>     </div> </div>"
                },] },
    ];
    IgxTabsComponent.ctorParameters = function () { return [
        { type: ElementRef, },
    ]; };
    IgxTabsComponent.propDecorators = {
        "tabs": [{ type: ViewChildren, args: [forwardRef(function () { return IgxTabItemComponent; }),] },],
        "groups": [{ type: ContentChildren, args: [forwardRef(function () { return IgxTabsGroupComponent; }),] },],
        "tabsType": [{ type: Input, args: ["tabsType",] },],
        "onTabItemSelected": [{ type: Output },],
        "onTabItemDeselected": [{ type: Output },],
        "tabsContainer": [{ type: ViewChild, args: ["tabsContainer",] },],
        "headerContainer": [{ type: ViewChild, args: ["headerContainer",] },],
        "itemsContainer": [{ type: ViewChild, args: ["itemsContainer",] },],
        "contentsContainer": [{ type: ViewChild, args: ["contentsContainer",] },],
        "selectedIndicator": [{ type: ViewChild, args: ["selectedIndicator",] },],
        "viewPort": [{ type: ViewChild, args: ["viewPort",] },],
        "class": [{ type: HostBinding, args: ["attr.class",] },],
        "_selectedGroupHandler": [{ type: HostListener, args: ["onTabItemSelected", ["$event"],] },],
    };
    return IgxTabsComponent;
}());
export { IgxTabsComponent };
var IgxTabsModule = (function () {
    function IgxTabsModule() {
    }
    IgxTabsModule.decorators = [
        { type: NgModule, args: [{
                    declarations: [IgxTabsComponent,
                        IgxTabsGroupComponent,
                        IgxTabItemComponent,
                        IgxTabItemTemplateDirective,
                        IgxRightButtonStyleDirective,
                        IgxLeftButtonStyleDirective],
                    exports: [IgxTabsComponent,
                        IgxTabsGroupComponent,
                        IgxTabItemComponent,
                        IgxTabItemTemplateDirective,
                        IgxRightButtonStyleDirective,
                        IgxLeftButtonStyleDirective],
                    imports: [CommonModule, IgxBadgeModule, IgxIconModule, IgxRippleModule]
                },] },
    ];
    return IgxTabsModule;
}());
export { IgxTabsModule };
