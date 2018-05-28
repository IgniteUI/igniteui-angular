import { CommonModule } from "@angular/common";
import { Component, ContentChild, ContentChildren, ElementRef, HostBinding, HostListener, Input, NgModule, QueryList } from "@angular/core";
import { IgxHintDirective } from "../directives/hint/hint.directive";
import { IgxInputDirective, IgxInputState } from "../directives/input/input.directive";
import { IgxLabelDirective } from "../directives/label/label.directive";
import { IgxPrefixDirective } from "../directives/prefix/prefix.directive";
import { IgxSuffixDirective } from "../directives/suffix/suffix.directive";
var NEXT_ID = 0;
var IgxInputGroupType;
(function (IgxInputGroupType) {
    IgxInputGroupType[IgxInputGroupType["LINE"] = 0] = "LINE";
    IgxInputGroupType[IgxInputGroupType["BOX"] = 1] = "BOX";
    IgxInputGroupType[IgxInputGroupType["BORDER"] = 2] = "BORDER";
    IgxInputGroupType[IgxInputGroupType["SEARCH"] = 3] = "SEARCH";
})(IgxInputGroupType || (IgxInputGroupType = {}));
var IgxInputGroupComponent = (function () {
    function IgxInputGroupComponent(element) {
        this.element = element;
        this._type = IgxInputGroupType.LINE;
        this.id = "igx-input-group-" + NEXT_ID++;
        this.defaultClass = true;
        this.hasPlaceholder = false;
        this.isRequired = false;
        this.isFocused = false;
        this.isFilled = false;
        this.isBox = false;
        this.isBorder = false;
        this.isSearch = false;
        this.isDisabled = false;
        this.hasWarning = false;
    }
    Object.defineProperty(IgxInputGroupComponent.prototype, "validClass", {
        get: function () {
            return this.input.valid === IgxInputState.VALID;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxInputGroupComponent.prototype, "invalidClass", {
        get: function () {
            return this.input.valid === IgxInputState.INVALID;
        },
        enumerable: true,
        configurable: true
    });
    IgxInputGroupComponent.prototype.onClick = function (event) {
        this.input.focus();
    };
    Object.defineProperty(IgxInputGroupComponent.prototype, "type", {
        get: function () {
            return this._type.toString();
        },
        set: function (value) {
            var type = IgxInputGroupType[value.toUpperCase()];
            if (type !== undefined) {
                this.isBox = this.isBorder = this.isSearch = false;
                switch (type) {
                    case IgxInputGroupType.BOX:
                        this.isBox = true;
                        break;
                    case IgxInputGroupType.BORDER:
                        this.isBorder = true;
                        break;
                    case IgxInputGroupType.SEARCH:
                        this.isSearch = true;
                        break;
                    default: break;
                }
                this._type = type;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxInputGroupComponent.prototype, "hasHints", {
        get: function () {
            return this.hints.length > 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxInputGroupComponent.prototype, "hasBorder", {
        get: function () {
            return this._type === IgxInputGroupType.LINE ||
                this._type === IgxInputGroupType.BOX;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxInputGroupComponent.prototype, "isTypeLine", {
        get: function () {
            return this._type === IgxInputGroupType.LINE;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxInputGroupComponent.prototype, "isTypeBox", {
        get: function () {
            return this._type === IgxInputGroupType.BOX;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxInputGroupComponent.prototype, "isTypeBorder", {
        get: function () {
            return this._type === IgxInputGroupType.BORDER;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxInputGroupComponent.prototype, "isTypeSearch", {
        get: function () {
            return this._type === IgxInputGroupType.SEARCH;
        },
        enumerable: true,
        configurable: true
    });
    IgxInputGroupComponent.decorators = [
        { type: Component, args: [{
                    selector: "igx-input-group",
                    template: "<div class=\"igx-input-group__wrapper\" *ngIf=\"isTypeBox; else bundle\">     <ng-container *ngTemplateOutlet=\"bundle\"></ng-container> </div> <div class=\"igx-input-group__hint\" *ngIf=\"hasHints\">     <ng-content select=\"igx-hint,[igxHint]\"></ng-content> </div> <ng-template #bundle>     <div class=\"igx-input-group__bundle\">         <ng-content select=\"igx-prefix,[igxPrefix]\"></ng-content>         <div class=\"igx-input-group__bundle-main\">             <ng-content select=\"[igxLabel]\"></ng-content>             <ng-content select=\"[igxInput]\"></ng-content>         </div>         <ng-content select=\"igx-suffix,[igxSuffix]\"></ng-content>     </div>     <div class=\"igx-input-group__border\" *ngIf=\"hasBorder\"></div> </ng-template>"
                },] },
    ];
    IgxInputGroupComponent.ctorParameters = function () { return [
        { type: ElementRef, },
    ]; };
    IgxInputGroupComponent.propDecorators = {
        "id": [{ type: HostBinding, args: ["attr.id",] }, { type: Input },],
        "defaultClass": [{ type: HostBinding, args: ["class.igx-input-group",] },],
        "hasPlaceholder": [{ type: HostBinding, args: ["class.igx-input-group--placeholder",] },],
        "isRequired": [{ type: HostBinding, args: ["class.igx-input-group--required",] },],
        "isFocused": [{ type: HostBinding, args: ["class.igx-input-group--focused",] },],
        "isFilled": [{ type: HostBinding, args: ["class.igx-input-group--filled",] },],
        "isBox": [{ type: HostBinding, args: ["class.igx-input-group--box",] },],
        "isBorder": [{ type: HostBinding, args: ["class.igx-input-group--border",] },],
        "isSearch": [{ type: HostBinding, args: ["class.igx-input-group--search",] },],
        "isDisabled": [{ type: HostBinding, args: ["class.igx-input-group--disabled",] },],
        "validClass": [{ type: HostBinding, args: ["class.igx-input-group--valid",] },],
        "invalidClass": [{ type: HostBinding, args: ["class.igx-input-group--invalid",] },],
        "hasWarning": [{ type: HostBinding, args: ["class.igx-input-group--warning",] },],
        "hints": [{ type: ContentChildren, args: [IgxHintDirective, { read: IgxHintDirective },] },],
        "input": [{ type: ContentChild, args: [IgxInputDirective, { read: IgxInputDirective },] },],
        "onClick": [{ type: HostListener, args: ["click", ["$event"],] },],
        "type": [{ type: Input, args: ["type",] },],
    };
    return IgxInputGroupComponent;
}());
export { IgxInputGroupComponent };
var IgxInputGroupModule = (function () {
    function IgxInputGroupModule() {
    }
    IgxInputGroupModule.decorators = [
        { type: NgModule, args: [{
                    declarations: [IgxInputGroupComponent, IgxHintDirective, IgxInputDirective, IgxLabelDirective, IgxPrefixDirective, IgxSuffixDirective],
                    exports: [IgxInputGroupComponent, IgxHintDirective, IgxInputDirective, IgxLabelDirective, IgxPrefixDirective, IgxSuffixDirective],
                    imports: [CommonModule]
                },] },
    ];
    return IgxInputGroupModule;
}());
export { IgxInputGroupModule };
