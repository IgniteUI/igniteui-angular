import { Component, ElementRef, HostBinding, Input, TemplateRef, ViewChild } from "@angular/core";
import { IgxIconService } from "./icon.service";
var NEXT_ID = 0;
var IgxIconComponent = (function () {
    function IgxIconComponent(el, iconService) {
        this.el = el;
        this.iconService = iconService;
        this.cssClass = "igx-icon";
        this.ariaHidden = true;
        this.id = "igx-icon-" + NEXT_ID++;
        this.active = true;
        this.font = this.iconService.defaultFontSet;
        this.iconService.registerFontSetAlias("material", "material-icons");
    }
    IgxIconComponent.prototype.ngOnInit = function () {
        this.checkInputProps();
        this.updateIconClass();
    };
    Object.defineProperty(IgxIconComponent.prototype, "getFontSet", {
        get: function () {
            return this.font;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxIconComponent.prototype, "getActive", {
        get: function () {
            return this.active;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxIconComponent.prototype, "getInactive", {
        get: function () {
            return !this.active;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxIconComponent.prototype, "getIconColor", {
        get: function () {
            return this.iconColor;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxIconComponent.prototype, "getIconName", {
        get: function () {
            return this.iconName;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxIconComponent.prototype, "template", {
        get: function () {
            if (this.glyphName) {
                return this.noLigature;
            }
            if (this.iconName) {
                return this.implicitLigature;
            }
            return this.explicitLigature;
        },
        enumerable: true,
        configurable: true
    });
    IgxIconComponent.prototype.checkInputProps = function () {
        if (this.iconName && this.glyphName) {
            throw new Error("You can provide either ligature `name` or glyph `iconName`, but not both at the same time.");
        }
    };
    IgxIconComponent.prototype.updateIconClass = function () {
        var className = this.iconService.fontSetClassName(this.font);
        this.el.nativeElement.classList.add(className);
        if (this.glyphName) {
            this.el.nativeElement.classList.add(this.glyphName);
        }
    };
    IgxIconComponent.decorators = [
        { type: Component, args: [{
                    selector: "igx-icon",
                    template: "<ng-template #noLigature></ng-template>  <ng-template #explicitLigature>     <ng-content></ng-content> </ng-template>  <ng-template #implicitLigature>     {{getIconName}} </ng-template>  <ng-container *ngTemplateOutlet=\"template\"></ng-container>"
                },] },
    ];
    IgxIconComponent.ctorParameters = function () { return [
        { type: ElementRef, },
        { type: IgxIconService, },
    ]; };
    IgxIconComponent.propDecorators = {
        "noLigature": [{ type: ViewChild, args: ["noLigature", { read: TemplateRef },] },],
        "implicitLigature": [{ type: ViewChild, args: ["implicitLigature", { read: TemplateRef },] },],
        "explicitLigature": [{ type: ViewChild, args: ["explicitLigature", { read: TemplateRef },] },],
        "cssClass": [{ type: HostBinding, args: ["class.igx-icon",] },],
        "ariaHidden": [{ type: HostBinding, args: ["attr.aria-hidden",] },],
        "id": [{ type: HostBinding, args: ["attr.id",] }, { type: Input },],
        "font": [{ type: Input, args: ["fontSet",] },],
        "active": [{ type: Input, args: ["isActive",] },],
        "iconColor": [{ type: Input, args: ["color",] },],
        "iconName": [{ type: Input, args: ["name",] },],
        "glyphName": [{ type: Input, args: ["iconName",] },],
        "getInactive": [{ type: HostBinding, args: ["class.igx-icon--inactive",] },],
        "getIconColor": [{ type: HostBinding, args: ["style.color",] },],
    };
    return IgxIconComponent;
}());
export { IgxIconComponent };
