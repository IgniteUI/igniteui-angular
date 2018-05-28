import { CommonModule } from "@angular/common";
import { Component, ElementRef, HostBinding, Input, NgModule, TemplateRef, ViewChild } from "@angular/core";
import { IgxIconModule } from "../icon";
var NEXT_ID = 0;
export var Size;
(function (Size) {
    Size["SMALL"] = "small";
    Size["MEDIUM"] = "medium";
    Size["LARGE"] = "large";
})(Size || (Size = {}));
var IgxAvatarComponent = (function () {
    function IgxAvatarComponent(elementRef) {
        this.elementRef = elementRef;
        this.ariaLabel = "avatar";
        this.role = "img";
        this.cssClass = "igx-avatar";
        this._size = "small";
        this.id = "igx-avatar-" + NEXT_ID++;
        this.roundShape = false;
    }
    Object.defineProperty(IgxAvatarComponent.prototype, "size", {
        get: function () {
            return this._size;
        },
        set: function (value) {
            switch (value) {
                case "small":
                case "medium":
                case "large":
                    this._size = value;
                    break;
                default:
                    this._size = "small";
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxAvatarComponent.prototype, "template", {
        get: function () {
            if (this.src) {
                return this.imageTemplate;
            }
            if (this.initials) {
                return this.initialsTemplate;
            }
            return this.iconTemplate;
        },
        enumerable: true,
        configurable: true
    });
    IgxAvatarComponent.prototype.ngOnInit = function () {
        this.roleDescription = this.getRole();
    };
    IgxAvatarComponent.prototype.ngAfterViewInit = function () {
        this.elementRef.nativeElement.classList.add("igx-avatar--" + this._size);
    };
    IgxAvatarComponent.prototype.getRole = function () {
        if (this.initials) {
            return "initials type avatar";
        }
        else if (this.src) {
            return "image type avatar";
        }
        else {
            return "icon type avatar";
        }
    };
    IgxAvatarComponent.decorators = [
        { type: Component, args: [{
                    selector: "igx-avatar",
                    template: "<ng-template #imageTemplate>     <img #image [src]=\"src\" class=\"igx-avatar__image\" [style.backgroundColor]=\"bgColor\" [attr.aria-roledescription]=\"roleDescription\"     /> </ng-template>  <ng-template #initialsTemplate>     <div class=\"igx-avatar__initials\" [style.backgroundColor]=\"bgColor\" [style.color]=\"color\" [attr.aria-roledescription]=\"roleDescription\">         <span>{{initials.substring(0, 2)}}</span>     </div> </ng-template>  <ng-template #iconTemplate>     <span class=\"igx-avatar__icon\" [style.backgroundColor]=\"bgColor\" [style.color]=\"color\" [attr.aria-roledescription]=\"roleDescription\">         <igx-icon [name]=\"icon\"></igx-icon>     </span> </ng-template>  <ng-container *ngTemplateOutlet=\"template\"></ng-container> <ng-content></ng-content>"
                },] },
    ];
    IgxAvatarComponent.ctorParameters = function () { return [
        { type: ElementRef, },
    ]; };
    IgxAvatarComponent.propDecorators = {
        "image": [{ type: ViewChild, args: ["image",] },],
        "imageTemplate": [{ type: ViewChild, args: ["imageTemplate", { read: TemplateRef },] },],
        "initialsTemplate": [{ type: ViewChild, args: ["initialsTemplate", { read: TemplateRef },] },],
        "iconTemplate": [{ type: ViewChild, args: ["iconTemplate", { read: TemplateRef },] },],
        "ariaLabel": [{ type: HostBinding, args: ["attr.aria-label",] },],
        "role": [{ type: HostBinding, args: ["attr.role",] },],
        "cssClass": [{ type: HostBinding, args: ["class.igx-avatar",] },],
        "id": [{ type: HostBinding, args: ["class.igx-avatar--rounded",] }, { type: HostBinding, args: ["attr.id",] }, { type: Input },],
        "roundShape": [{ type: Input },],
        "color": [{ type: Input },],
        "bgColor": [{ type: Input },],
        "initials": [{ type: Input },],
        "icon": [{ type: Input },],
        "src": [{ type: Input },],
        "size": [{ type: Input },],
    };
    return IgxAvatarComponent;
}());
export { IgxAvatarComponent };
var IgxAvatarModule = (function () {
    function IgxAvatarModule() {
    }
    IgxAvatarModule.decorators = [
        { type: NgModule, args: [{
                    declarations: [IgxAvatarComponent],
                    exports: [IgxAvatarComponent],
                    imports: [CommonModule, IgxIconModule]
                },] },
    ];
    return IgxAvatarModule;
}());
export { IgxAvatarModule };
