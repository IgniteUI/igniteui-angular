var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { CommonModule } from "@angular/common";
import { Component, ContentChild, ContentChildren, Directive, ElementRef, EventEmitter, forwardRef, HostBinding, HostListener, Input, NgModule, Output, QueryList, TemplateRef, ViewChildren } from "@angular/core";
import { IgxBadgeModule } from "../badge/badge.component";
import { DeprecateClass } from "../core/deprecateDecorators";
import { IgxIconModule } from "../icon";
var IgxTabTemplateDirective = (function () {
    function IgxTabTemplateDirective(template) {
        this.template = template;
    }
    IgxTabTemplateDirective.decorators = [
        { type: Directive, args: [{
                    selector: "[igxTab]"
                },] },
    ];
    IgxTabTemplateDirective.ctorParameters = function () { return [
        { type: TemplateRef, },
    ]; };
    return IgxTabTemplateDirective;
}());
export { IgxTabTemplateDirective };
var NEXT_ID = 0;
var IgxBottomNavComponent = (function () {
    function IgxBottomNavComponent(_element) {
        this._element = _element;
        this.id = "igx-bottom-nav-" + NEXT_ID++;
        this.onTabSelected = new EventEmitter();
        this.onTabDeselected = new EventEmitter();
        this.selectedIndex = -1;
        this._itemStyle = "igx-bottom-nav";
    }
    Object.defineProperty(IgxBottomNavComponent.prototype, "itemStyle", {
        get: function () {
            return this._itemStyle;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxBottomNavComponent.prototype, "selectedTab", {
        get: function () {
            if (this.tabs && this.selectedIndex !== undefined) {
                return this.tabs.toArray()[this.selectedIndex];
            }
        },
        enumerable: true,
        configurable: true
    });
    IgxBottomNavComponent.prototype.ngAfterViewInit = function () {
        var _this = this;
        setTimeout(function () {
            if (_this.selectedIndex === -1) {
                var selectablePanels = _this.panels.filter(function (p) { return !p.isDisabled; });
                var panel = selectablePanels[0];
                if (panel) {
                    panel.select();
                }
            }
        }, 0);
    };
    IgxBottomNavComponent.prototype._selectedPanelHandler = function (args) {
        var _this = this;
        this.selectedIndex = args.panel.index;
        this.panels.forEach(function (p) {
            if (p.index !== _this.selectedIndex) {
                _this._deselectPanel(p);
            }
        });
    };
    IgxBottomNavComponent.prototype._deselectPanel = function (panel) {
        if (panel.isDisabled || this.selectedTab.index === panel.index) {
            return;
        }
        panel.isSelected = false;
        this.onTabDeselected.emit({ tab: this.tabs[panel.index], panel: panel });
    };
    IgxBottomNavComponent.decorators = [
        { type: Component, args: [{
                    selector: "igx-tab-bar, igx-bottom-nav",
                    template: "<div>     <ng-content></ng-content> </div> <div #tablist class=\"{{itemStyle}}__menu {{itemStyle}}__menu--bottom\" role=\"tablist\" aria-orientation=\"horizontal\">     <igx-tab *ngFor=\"let panel of panels\" [id]=\"'igx-tab-' + panel.index\" [attr.aria-label]=\"panel.label\" [attr.aria-disabled]=\"panel.isDisabled\"         [attr.aria-selected]=\"panel.isSelected\" [attr.aria-controls]=\"'igx-tab-panel-'+ panel.index\" [ngClass]=\"{                  'igx-bottom-nav__menu-item': !panel.isSelected && !panel.isDisabled,                  'igx-bottom-nav__menu-item--selected': panel.isSelected,                  'igx-bottom-nav__menu-item--disabled': panel.isDisabled              }\" [relatedPanel]=\"panel\" (click)=\"panel.select()\" role=\"tab\">     </igx-tab> </div>"
                },] },
    ];
    IgxBottomNavComponent.ctorParameters = function () { return [
        { type: ElementRef, },
    ]; };
    IgxBottomNavComponent.propDecorators = {
        "tabs": [{ type: ViewChildren, args: [forwardRef(function () { return IgxTabComponent; }),] },],
        "panels": [{ type: ContentChildren, args: [forwardRef(function () { return IgxTabPanelComponent; }),] },],
        "id": [{ type: HostBinding, args: ["attr.id",] }, { type: Input },],
        "onTabSelected": [{ type: Output },],
        "onTabDeselected": [{ type: Output },],
        "_selectedPanelHandler": [{ type: HostListener, args: ["onTabSelected", ["$event"],] },],
    };
    IgxBottomNavComponent = __decorate([
        DeprecateClass("'igx-tab-bar' selector is deprecated. Use 'igx-bottom-nav' selector instead."),
        __metadata("design:paramtypes", [ElementRef])
    ], IgxBottomNavComponent);
    return IgxBottomNavComponent;
}());
export { IgxBottomNavComponent };
var IgxTabPanelComponent = (function () {
    function IgxTabPanelComponent(_tabBar) {
        this._tabBar = _tabBar;
        this._itemStyle = "igx-tab-panel";
        this.isSelected = false;
        this.role = "tabpanel";
    }
    Object.defineProperty(IgxTabPanelComponent.prototype, "styleClass", {
        get: function () {
            return (!this.isSelected);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxTabPanelComponent.prototype, "selected", {
        get: function () {
            return this.isSelected;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxTabPanelComponent.prototype, "labelledBy", {
        get: function () {
            return "igx-tab-" + this.index;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxTabPanelComponent.prototype, "id", {
        get: function () {
            return "igx-bottom-nav__panel-" + this.index;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxTabPanelComponent.prototype, "itemStyle", {
        get: function () {
            return this._itemStyle;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxTabPanelComponent.prototype, "relatedTab", {
        get: function () {
            if (this._tabBar.tabs) {
                return this._tabBar.tabs.toArray()[this.index];
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxTabPanelComponent.prototype, "index", {
        get: function () {
            return this._tabBar.panels.toArray().indexOf(this);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxTabPanelComponent.prototype, "customTabTemplate", {
        get: function () {
            return this._tabTemplate;
        },
        set: function (template) {
            this._tabTemplate = template;
        },
        enumerable: true,
        configurable: true
    });
    IgxTabPanelComponent.prototype.ngAfterContentInit = function () {
        if (this.tabTemplate) {
            this._tabTemplate = this.tabTemplate.template;
        }
    };
    IgxTabPanelComponent.prototype.select = function () {
        if (this.isDisabled || this._tabBar.selectedIndex === this.index) {
            return;
        }
        this.isSelected = true;
        this._tabBar.onTabSelected.emit({ tab: this._tabBar.tabs.toArray()[this.index], panel: this });
    };
    IgxTabPanelComponent.decorators = [
        { type: Component, args: [{
                    selector: "igx-tab-panel",
                    template: "<ng-content></ng-content>"
                },] },
    ];
    IgxTabPanelComponent.ctorParameters = function () { return [
        { type: IgxBottomNavComponent, },
    ]; };
    IgxTabPanelComponent.propDecorators = {
        "label": [{ type: Input },],
        "icon": [{ type: Input },],
        "isDisabled": [{ type: Input },],
        "role": [{ type: HostBinding, args: ["attr.role",] },],
        "styleClass": [{ type: HostBinding, args: ["class.igx-bottom-nav__panel",] },],
        "selected": [{ type: HostBinding, args: ["class.igx-bottom-nav__panel--selected",] },],
        "labelledBy": [{ type: HostBinding, args: ["attr.aria-labelledby",] },],
        "id": [{ type: HostBinding, args: ["attr.id",] },],
        "tabTemplate": [{ type: ContentChild, args: [IgxTabTemplateDirective, { read: IgxTabTemplateDirective },] },],
    };
    return IgxTabPanelComponent;
}());
export { IgxTabPanelComponent };
var IgxTabComponent = (function () {
    function IgxTabComponent(_tabBar, _element) {
        this._tabBar = _tabBar;
        this._element = _element;
        this.role = "tab";
        this._changesCount = 0;
    }
    Object.defineProperty(IgxTabComponent.prototype, "changesCount", {
        get: function () {
            return this._changesCount;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxTabComponent.prototype, "isDisabled", {
        get: function () {
            var panel = this.relatedPanel;
            if (panel) {
                return panel.isDisabled;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxTabComponent.prototype, "isSelected", {
        get: function () {
            var panel = this.relatedPanel;
            if (panel) {
                return panel.isSelected;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxTabComponent.prototype, "index", {
        get: function () {
            return this._tabBar.tabs.toArray().indexOf(this);
        },
        enumerable: true,
        configurable: true
    });
    IgxTabComponent.prototype.select = function () {
        this.relatedPanel.select();
    };
    IgxTabComponent.decorators = [
        { type: Component, args: [{
                    selector: "igx-tab",
                    template: "<ng-template #defaultTabTemplate>     <div *ngIf=\"relatedPanel.icon\" class=\"tab-icon\">         <igx-icon fontSet=\"material\" [name]=\"relatedPanel.icon\"></igx-icon>         <igx-badge [value]=\"changesCount\" [hidden]=\"changesCount === 0\"></igx-badge>     </div>     <div *ngIf=\"relatedPanel.label\" ngClass=\"tab-label\">{{relatedPanel.label}}</div> </ng-template> <ng-container *ngTemplateOutlet=\"relatedPanel.customTabTemplate ? relatedPanel.customTabTemplate : defaultTabTemplate; context: { $implicit: relatedPanel }\"> </ng-container>"
                },] },
    ];
    IgxTabComponent.ctorParameters = function () { return [
        { type: IgxBottomNavComponent, },
        { type: ElementRef, },
    ]; };
    IgxTabComponent.propDecorators = {
        "role": [{ type: HostBinding, args: ["attr.role",] },],
        "relatedPanel": [{ type: Input },],
    };
    return IgxTabComponent;
}());
export { IgxTabComponent };
var IgxBottomNavModule = (function () {
    function IgxBottomNavModule() {
    }
    IgxBottomNavModule.decorators = [
        { type: NgModule, args: [{
                    declarations: [IgxBottomNavComponent, IgxTabPanelComponent, IgxTabComponent, IgxTabTemplateDirective],
                    exports: [IgxBottomNavComponent, IgxTabPanelComponent, IgxTabComponent, IgxTabTemplateDirective],
                    imports: [CommonModule, IgxBadgeModule, IgxIconModule]
                },] },
    ];
    return IgxBottomNavModule;
}());
export { IgxBottomNavModule };
