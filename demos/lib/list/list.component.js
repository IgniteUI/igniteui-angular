import { CommonModule } from "@angular/common";
import { Component, ContentChild, ContentChildren, ElementRef, EventEmitter, forwardRef, HostBinding, Input, NgModule, Output, QueryList, TemplateRef, ViewChild } from "@angular/core";
import { IgxRippleModule } from "../directives/ripple/ripple.directive";
import { IgxListItemComponent } from "./list-item.component";
import { IgxEmptyListTemplateDirective } from "./list.common";
var NEXT_ID = 0;
var IgxListComponent = (function () {
    function IgxListComponent(element) {
        this.element = element;
        this.id = "igx-list-" + NEXT_ID++;
        this.allowLeftPanning = false;
        this.allowRightPanning = false;
        this.onLeftPan = new EventEmitter();
        this.onRightPan = new EventEmitter();
        this.onPanStateChange = new EventEmitter();
        this.onItemClicked = new EventEmitter();
    }
    Object.defineProperty(IgxListComponent.prototype, "role", {
        get: function () {
            return "list";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxListComponent.prototype, "isListEmpty", {
        get: function () {
            return !this.children || this.children.length === 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxListComponent.prototype, "cssClass", {
        get: function () {
            return this.children && this.children.length > 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxListComponent.prototype, "items", {
        get: function () {
            var items = [];
            if (this.children !== undefined) {
                for (var _i = 0, _a = this.children.toArray(); _i < _a.length; _i++) {
                    var child = _a[_i];
                    if (!child.isHeader) {
                        items.push(child);
                    }
                }
            }
            return items;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxListComponent.prototype, "headers", {
        get: function () {
            var headers = [];
            if (this.children !== undefined) {
                for (var _i = 0, _a = this.children.toArray(); _i < _a.length; _i++) {
                    var child = _a[_i];
                    if (child.isHeader) {
                        headers.push(child);
                    }
                }
            }
            return headers;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxListComponent.prototype, "context", {
        get: function () {
            return {
                $implicit: this
            };
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxListComponent.prototype, "template", {
        get: function () {
            return this.emptyListTemplate ? this.emptyListTemplate.template : this.defaultEmptyListTemplate;
        },
        enumerable: true,
        configurable: true
    });
    IgxListComponent.decorators = [
        { type: Component, args: [{
                    selector: "igx-list",
                    template: "<ng-content></ng-content>  <ng-template #defaultEmptyList> \t<article class=\"message\"> \t\t<p>There are no items in the list.</p> \t</article> </ng-template>  <ng-container *ngIf=\"!children || children.length === 0\"> \t<ng-container *ngTemplateOutlet=\"template; context: context\"> \t</ng-container> </ng-container>"
                },] },
    ];
    IgxListComponent.ctorParameters = function () { return [
        { type: ElementRef, },
    ]; };
    IgxListComponent.propDecorators = {
        "children": [{ type: ContentChildren, args: [forwardRef(function () { return IgxListItemComponent; }),] },],
        "emptyListTemplate": [{ type: ContentChild, args: [IgxEmptyListTemplateDirective, { read: IgxEmptyListTemplateDirective },] },],
        "defaultEmptyListTemplate": [{ type: ViewChild, args: ["defaultEmptyList", { read: TemplateRef },] },],
        "id": [{ type: HostBinding, args: ["attr.id",] }, { type: Input },],
        "allowLeftPanning": [{ type: Input },],
        "allowRightPanning": [{ type: Input },],
        "onLeftPan": [{ type: Output },],
        "onRightPan": [{ type: Output },],
        "onPanStateChange": [{ type: Output },],
        "onItemClicked": [{ type: Output },],
        "role": [{ type: HostBinding, args: ["attr.role",] },],
        "isListEmpty": [{ type: HostBinding, args: ["class.igx-list-empty",] },],
        "cssClass": [{ type: HostBinding, args: ["class.igx-list",] },],
    };
    return IgxListComponent;
}());
export { IgxListComponent };
var IgxListModule = (function () {
    function IgxListModule() {
    }
    IgxListModule.decorators = [
        { type: NgModule, args: [{
                    declarations: [IgxListComponent, IgxListItemComponent, IgxEmptyListTemplateDirective],
                    exports: [IgxListComponent, IgxListItemComponent, IgxEmptyListTemplateDirective],
                    imports: [CommonModule, IgxRippleModule]
                },] },
    ];
    return IgxListModule;
}());
export { IgxListModule };
