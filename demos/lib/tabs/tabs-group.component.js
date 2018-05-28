import { Component, ContentChild, forwardRef, HostBinding, Inject, Input } from "@angular/core";
import { IgxTabsComponent } from "./tabs.component";
import { IgxTabItemTemplateDirective } from "./tabs.directives";
var IgxTabsGroupComponent = (function () {
    function IgxTabsGroupComponent(_tabs) {
        this._tabs = _tabs;
        this._itemStyle = "igx-tabs-group";
        this.isSelected = false;
        this.role = "tabpanel";
    }
    Object.defineProperty(IgxTabsGroupComponent.prototype, "styleClass", {
        get: function () {
            return true;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxTabsGroupComponent.prototype, "labelledBy", {
        get: function () {
            return "igx-tab-item-" + this.index;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxTabsGroupComponent.prototype, "id", {
        get: function () {
            return "igx-tabs__group-" + this.index;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxTabsGroupComponent.prototype, "itemStyle", {
        get: function () {
            return this._itemStyle;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxTabsGroupComponent.prototype, "relatedTab", {
        get: function () {
            if (this._tabs.tabs) {
                return this._tabs.tabs.toArray()[this.index];
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxTabsGroupComponent.prototype, "index", {
        get: function () {
            return this._tabs.groups.toArray().indexOf(this);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxTabsGroupComponent.prototype, "customTabTemplate", {
        get: function () {
            return this._tabTemplate;
        },
        set: function (template) {
            this._tabTemplate = template;
        },
        enumerable: true,
        configurable: true
    });
    IgxTabsGroupComponent.prototype.ngAfterContentInit = function () {
        if (this.tabTemplate) {
            this._tabTemplate = this.tabTemplate.template;
        }
    };
    IgxTabsGroupComponent.prototype.select = function (focusDelay, onInit) {
        var _this = this;
        if (focusDelay === void 0) { focusDelay = 50; }
        if (onInit === void 0) { onInit = false; }
        if (this.isDisabled || this._tabs.selectedIndex === this.index) {
            return;
        }
        this.isSelected = true;
        this.relatedTab.tabindex = 0;
        if (!onInit) {
            setTimeout(function () {
                _this.relatedTab.nativeTabItem.nativeElement.focus();
            }, focusDelay);
        }
        this._handleSelection();
        this._tabs.onTabItemSelected.emit({ tab: this._tabs.tabs.toArray()[this.index], group: this });
    };
    IgxTabsGroupComponent.prototype._handleSelection = function () {
        var tabElement = this.relatedTab.nativeTabItem.nativeElement;
        var viewPortOffsetWidth = this._tabs.viewPort.nativeElement.offsetWidth;
        if (tabElement.offsetLeft < this._tabs.offset) {
            this._tabs.scrollElement(tabElement, false);
        }
        else if (tabElement.offsetLeft + tabElement.offsetWidth > viewPortOffsetWidth + this._tabs.offset) {
            this._tabs.scrollElement(tabElement, true);
        }
        var contentOffset = this._tabs.tabsContainer.nativeElement.offsetWidth * this.index;
        this._tabs.contentsContainer.nativeElement.style.transform = "translate(" + -contentOffset + "px)";
        this._tabs.selectedIndicator.nativeElement.style.width = tabElement.offsetWidth + "px";
        this._tabs.selectedIndicator.nativeElement.style.transform = "translate(" + tabElement.offsetLeft + "px)";
    };
    IgxTabsGroupComponent.decorators = [
        { type: Component, args: [{
                    selector: "igx-tabs-group",
                    template: "<ng-content></ng-content>"
                },] },
    ];
    IgxTabsGroupComponent.ctorParameters = function () { return [
        { type: IgxTabsComponent, decorators: [{ type: Inject, args: [forwardRef(function () { return IgxTabsComponent; }),] },] },
    ]; };
    IgxTabsGroupComponent.propDecorators = {
        "label": [{ type: Input },],
        "icon": [{ type: Input },],
        "isDisabled": [{ type: Input },],
        "role": [{ type: HostBinding, args: ["attr.role",] },],
        "styleClass": [{ type: HostBinding, args: ["class.igx-tabs__group",] },],
        "labelledBy": [{ type: HostBinding, args: ["attr.aria-labelledby",] },],
        "id": [{ type: HostBinding, args: ["attr.id",] },],
        "tabTemplate": [{ type: ContentChild, args: [IgxTabItemTemplateDirective, { read: IgxTabItemTemplateDirective },] },],
    };
    return IgxTabsGroupComponent;
}());
export { IgxTabsGroupComponent };
