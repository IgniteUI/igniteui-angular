import { Component, ElementRef, forwardRef, HostBinding, HostListener, Inject, Input } from "@angular/core";
import { IgxTabsGroupComponent } from "./tabs-group.component";
import { IgxTabsComponent } from "./tabs.component";
var IgxTabItemComponent = (function () {
    function IgxTabItemComponent(_tabs, _element) {
        this._tabs = _tabs;
        this._element = _element;
        this._changesCount = 0;
        this.role = "tab";
        this._nativeTabItem = _element;
    }
    IgxTabItemComponent.prototype.onClick = function (event) {
        this.select();
    };
    IgxTabItemComponent.prototype.onResize = function (event) {
        if (this.isSelected) {
            this._tabs.selectedIndicator.nativeElement.style.width = this.nativeTabItem.nativeElement.offsetWidth + "px";
            this._tabs.selectedIndicator.nativeElement.style.transform = "translate(" + this.nativeTabItem.nativeElement.offsetLeft + "px)";
        }
    };
    IgxTabItemComponent.prototype.onKeydownArrowRight = function (event) {
        this._onKeyDown(false);
    };
    IgxTabItemComponent.prototype.onKeydownArrowLeft = function (event) {
        this._onKeyDown(true);
    };
    IgxTabItemComponent.prototype.onKeydownHome = function (event) {
        event.preventDefault();
        this._onKeyDown(false, 0);
    };
    IgxTabItemComponent.prototype.onKeydownEnd = function (event) {
        event.preventDefault();
        this._onKeyDown(false, this._tabs.tabs.toArray().length - 1);
    };
    IgxTabItemComponent.prototype._onKeyDown = function (isLeftArrow, index) {
        if (index === void 0) { index = null; }
        var tabsArray = this._tabs.tabs.toArray();
        if (index === null) {
            index = (isLeftArrow)
                ? (this._tabs.selectedIndex === 0) ? tabsArray.length - 1 : this._tabs.selectedIndex - 1
                : (this._tabs.selectedIndex === tabsArray.length - 1) ? 0 : this._tabs.selectedIndex + 1;
        }
        var tab = tabsArray[index];
        var viewPortWidth = this._tabs.viewPort.nativeElement.offsetWidth;
        var nativeTabElement = tab.nativeTabItem.nativeElement;
        var focusDelay = (nativeTabElement.offsetWidth + nativeTabElement.offsetLeft - this._tabs.offset > viewPortWidth) ? 200 : 50;
        tab.select(focusDelay);
    };
    Object.defineProperty(IgxTabItemComponent.prototype, "changesCount", {
        get: function () {
            return this._changesCount;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxTabItemComponent.prototype, "nativeTabItem", {
        get: function () {
            return this._nativeTabItem;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxTabItemComponent.prototype, "isDisabled", {
        get: function () {
            var group = this.relatedGroup;
            if (group) {
                return group.isDisabled;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxTabItemComponent.prototype, "isSelected", {
        get: function () {
            var group = this.relatedGroup;
            if (group) {
                return group.isSelected;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxTabItemComponent.prototype, "index", {
        get: function () {
            return this._tabs.tabs.toArray().indexOf(this);
        },
        enumerable: true,
        configurable: true
    });
    IgxTabItemComponent.prototype.select = function (focusDelay) {
        if (focusDelay === void 0) { focusDelay = 50; }
        this.relatedGroup.select(focusDelay);
    };
    IgxTabItemComponent.decorators = [
        { type: Component, args: [{
                    selector: "igx-tab-item",
                    template: "<ng-template #defaultTabTemplate>     <div *ngIf=\"relatedGroup.icon\" class=\"igx-tabs__header-menu-item-icon\">         <igx-icon fontSet=\"material\" [name]=\"relatedGroup.icon\"></igx-icon>         <igx-badge [value]=\"changesCount\" [hidden]=\"changesCount === 0\"></igx-badge>     </div>     <div *ngIf=\"relatedGroup.label\" ngClass=\"igx-tabs__item-label\">{{relatedGroup.label}}</div>  </ng-template> <ng-container *ngTemplateOutlet=\"relatedGroup.customTabTemplate ? relatedGroup.customTabTemplate : defaultTabTemplate; context: { $implicit: relatedGroup }\"> </ng-container>"
                },] },
    ];
    IgxTabItemComponent.ctorParameters = function () { return [
        { type: IgxTabsComponent, decorators: [{ type: Inject, args: [forwardRef(function () { return IgxTabsComponent; }),] },] },
        { type: ElementRef, },
    ]; };
    IgxTabItemComponent.propDecorators = {
        "relatedGroup": [{ type: Input },],
        "role": [{ type: HostBinding, args: ["attr.role",] },],
        "tabindex": [{ type: HostBinding, args: ["attr.tabindex",] },],
        "onClick": [{ type: HostListener, args: ["click", ["$event"],] },],
        "onResize": [{ type: HostListener, args: ["window:resize", ["$event"],] },],
        "onKeydownArrowRight": [{ type: HostListener, args: ["keydown.arrowright", ["$event"],] },],
        "onKeydownArrowLeft": [{ type: HostListener, args: ["keydown.arrowleft", ["$event"],] },],
        "onKeydownHome": [{ type: HostListener, args: ["keydown.home", ["$event"],] },],
        "onKeydownEnd": [{ type: HostListener, args: ["keydown.end", ["$event"],] },],
    };
    return IgxTabItemComponent;
}());
export { IgxTabItemComponent };
