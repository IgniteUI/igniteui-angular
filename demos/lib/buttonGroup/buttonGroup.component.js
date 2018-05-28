import { CommonModule } from "@angular/common";
import { ChangeDetectorRef, Component, ElementRef, EventEmitter, HostBinding, Input, NgModule, Output, QueryList, Renderer2, ViewChildren } from "@angular/core";
import { IgxButtonDirective, IgxButtonModule } from "../directives/button/button.directive";
import { IgxRippleModule } from "../directives/ripple/ripple.directive";
import { IgxIconModule } from "../icon";
export var ButtonGroupAlignment;
(function (ButtonGroupAlignment) {
    ButtonGroupAlignment[ButtonGroupAlignment["horizontal"] = 0] = "horizontal";
    ButtonGroupAlignment[ButtonGroupAlignment["vertical"] = 1] = "vertical";
})(ButtonGroupAlignment || (ButtonGroupAlignment = {}));
var NEXT_ID = 0;
var IgxButtonGroupComponent = (function () {
    function IgxButtonGroupComponent(_el, _renderer, cdr) {
        this._el = _el;
        this._renderer = _renderer;
        this.id = "igx-buttongroup-" + NEXT_ID++;
        this.multiSelection = false;
        this.disabled = false;
        this.selectedIndexes = [];
        this.onSelect = new EventEmitter();
        this.onUnselect = new EventEmitter();
    }
    Object.defineProperty(IgxButtonGroupComponent.prototype, "itemContentCssClass", {
        get: function () {
            return this._itemContentCssClass;
        },
        set: function (value) {
            this._itemContentCssClass = value || this._itemContentCssClass;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxButtonGroupComponent.prototype, "alignment", {
        get: function () {
            return this._isVertical ? ButtonGroupAlignment.vertical : ButtonGroupAlignment.horizontal;
        },
        set: function (value) {
            this._isVertical = value === ButtonGroupAlignment.vertical;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxButtonGroupComponent.prototype, "isVertical", {
        get: function () {
            return this._isVertical;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxButtonGroupComponent.prototype, "selectedButtons", {
        get: function () {
            var _this = this;
            return this.buttons.filter(function (b, i) {
                return _this.selectedIndexes.indexOf(i) !== -1;
            });
        },
        enumerable: true,
        configurable: true
    });
    IgxButtonGroupComponent.prototype.selectButton = function (index) {
        var _this = this;
        if (this.buttons.toArray()[index]._el.nativeElement.getAttribute("data-togglable") === "false"
            || this.buttons.toArray()[index]._el.nativeElement.classList.contains("igx-button--disabled")) {
            return;
        }
        var buttonElement = this.buttons.toArray()[index]._el.nativeElement;
        this.selectedIndexes.push(index);
        buttonElement.setAttribute("data-selected", true);
        this.onSelect.emit({ button: this.buttons.toArray()[index], index: index });
        this.values[index].selected = true;
        if (!this.multiSelection && this.selectedIndexes.length > 0) {
            this.buttons.forEach(function (b, i) {
                if (i !== index && _this.selectedIndexes.indexOf(i) !== -1) {
                    _this.deselectButton(i);
                }
            });
        }
    };
    IgxButtonGroupComponent.prototype.deselectButton = function (index) {
        if (this.buttons.toArray()[index]._el.nativeElement.getAttribute("data-togglable") === "false"
            || this.buttons.toArray()[index]._el.nativeElement.classList.contains("igx-button--disabled")) {
            return;
        }
        var buttonElement = this.buttons.toArray()[index]._el.nativeElement;
        this.selectedIndexes.splice(this.selectedIndexes.indexOf(index), 1);
        buttonElement.setAttribute("data-selected", false);
        this.onUnselect.emit({ button: this.buttons.toArray()[index], index: index });
        this.values[index].selected = false;
    };
    IgxButtonGroupComponent.prototype.ngAfterViewInit = function () {
        var _this = this;
        setTimeout(function () {
            _this.buttons.forEach(function (button, index) {
                if (!button.disabled && button._el.nativeElement.getAttribute("data-selected") === "true") {
                    _this.selectButton(index);
                }
            });
        }, 0);
    };
    IgxButtonGroupComponent.prototype._clickHandler = function (event, i) {
        if (this.selectedIndexes.indexOf(i) !== -1) {
            this.deselectButton(i);
        }
        else {
            this.selectButton(i);
        }
    };
    IgxButtonGroupComponent.decorators = [
        { type: Component, args: [{
                    selector: "igx-buttongroup",
                    template: "<div class=\"igx-button-group\" role=\"group\" [class.igx-button-group--vertical]=\"isVertical\">      <span class=\"igx-button-group__item\" *ngFor=\"let button of values; let i = 'index'\" type=\"button\" (click)=\"_clickHandler($event, i)\"         igxButton=\"flat\" [attr.data-selected]=\"button.selected\" [attr.data-togglable]=\"button.togglable\" [attr.aria-pressed]=\"button.selected\"         [disabled]=\"disabled || button.disabled\" [igxButtonColor]=\"button.color\" [igxButtonBackground]=\"button.bgcolor\" [igxLabel]=\"button.label\"         [igxRipple]=\"button.ripple\" [class.igx-button-group__item--selected]=\"button.selected\">         <div class=\"igx-button-group__item-content {{ itemContentCssClass }}\">             <igx-icon *ngIf=\"button.icon\" fontSet=\"material\" [name]=\"button.icon\"></igx-icon>             <span *ngIf=\"button.label\">{{button.label}}</span> </div> </span>  </div>"
                },] },
    ];
    IgxButtonGroupComponent.ctorParameters = function () { return [
        { type: ElementRef, },
        { type: Renderer2, },
        { type: ChangeDetectorRef, },
    ]; };
    IgxButtonGroupComponent.propDecorators = {
        "buttons": [{ type: ViewChildren, args: [IgxButtonDirective,] },],
        "id": [{ type: HostBinding, args: ["attr.id",] }, { type: Input },],
        "itemContentCssClass": [{ type: Input },],
        "multiSelection": [{ type: Input },],
        "values": [{ type: Input },],
        "disabled": [{ type: Input },],
        "alignment": [{ type: Input },],
        "onSelect": [{ type: Output },],
        "onUnselect": [{ type: Output },],
    };
    return IgxButtonGroupComponent;
}());
export { IgxButtonGroupComponent };
var IgxButtonGroupModule = (function () {
    function IgxButtonGroupModule() {
    }
    IgxButtonGroupModule.decorators = [
        { type: NgModule, args: [{
                    declarations: [IgxButtonGroupComponent],
                    exports: [IgxButtonGroupComponent],
                    imports: [IgxButtonModule, CommonModule, IgxRippleModule, IgxIconModule]
                },] },
    ];
    return IgxButtonGroupModule;
}());
export { IgxButtonGroupModule };
