import { CommonModule } from "@angular/common";
import { Component, HostBinding, Input, NgModule } from "@angular/core";
import { IgxIconModule } from "../icon";
var NEXT_ID = 0;
export var Type;
(function (Type) {
    Type["DEFAULT"] = "default";
    Type["INFO"] = "info";
    Type["SUCCESS"] = "success";
    Type["WARNING"] = "warning";
    Type["ERROR"] = "error";
})(Type || (Type = {}));
var IgxBadgeComponent = (function () {
    function IgxBadgeComponent() {
        this.id = "igx-badge-" + NEXT_ID++;
        this.type = "default";
        this.value = "";
        this.role = "status";
        this.cssClass = "igx-badge";
        this.label = "badge";
    }
    Object.defineProperty(IgxBadgeComponent.prototype, "roleDescription", {
        get: function () {
            var message;
            if (this.icon) {
                message = this.type + " type badge with icon type " + this.icon;
            }
            else if (this.value) {
                message = this.type + " badge type with value " + this.value;
            }
            else {
                message = this.type + " badge type without value";
            }
            return message;
        },
        enumerable: true,
        configurable: true
    });
    IgxBadgeComponent.prototype.setClasses = function () {
        var classes = {};
        switch (Type[this.type.toUpperCase()]) {
            case Type.DEFAULT:
                classes = (_a = {},
                    _a[this.cssClass + "__circle--default"] = true,
                    _a);
                break;
            case Type.INFO:
                classes = (_b = {},
                    _b[this.cssClass + "__circle--info"] = true,
                    _b);
                break;
            case Type.SUCCESS:
                classes = (_c = {},
                    _c[this.cssClass + "__circle--success"] = true,
                    _c);
                break;
            case Type.WARNING:
                classes = (_d = {},
                    _d[this.cssClass + "__circle--warning"] = true,
                    _d);
                break;
            case Type.ERROR:
                classes = (_e = {},
                    _e[this.cssClass + "__circle--error"] = true,
                    _e);
                break;
        }
        return classes;
        var _a, _b, _c, _d, _e;
    };
    IgxBadgeComponent.decorators = [
        { type: Component, args: [{
                    selector: "igx-badge",
                    template: "<div class=\"igx-badge__circle\" [ngClass]=\"setClasses()\" [attr.aria-roledescription]=\"roleDescription\">     <span *ngIf=\"!icon\" class=\"igx-badge__circle-value\">{{value}}</span>     <igx-icon *ngIf=\"icon\" fontSet=\"material\" [name]=\"icon\"></igx-icon> </div>"
                },] },
    ];
    IgxBadgeComponent.propDecorators = {
        "id": [{ type: HostBinding, args: ["attr.id",] }, { type: Input },],
        "type": [{ type: Input },],
        "value": [{ type: Input },],
        "icon": [{ type: Input },],
        "role": [{ type: HostBinding, args: ["attr.role",] },],
        "cssClass": [{ type: HostBinding, args: ["class.igx-badge",] },],
        "label": [{ type: HostBinding, args: ["attr.aria-label",] },],
    };
    return IgxBadgeComponent;
}());
export { IgxBadgeComponent };
var IgxBadgeModule = (function () {
    function IgxBadgeModule() {
    }
    IgxBadgeModule.decorators = [
        { type: NgModule, args: [{
                    declarations: [IgxBadgeComponent],
                    exports: [IgxBadgeComponent],
                    imports: [CommonModule, IgxIconModule]
                },] },
    ];
    return IgxBadgeModule;
}());
export { IgxBadgeModule };
