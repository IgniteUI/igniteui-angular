var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostBinding, HostListener, Input, ViewChild } from "@angular/core";
import { IgxSelectionAPIService } from "../core/selection";
import { IgxGridAPIService } from "./api.service";
import { autoWire } from "./grid.common";
var IgxGridGroupByRowComponent = (function () {
    function IgxGridGroupByRowComponent(gridAPI, selectionAPI, element, cdr) {
        this.gridAPI = gridAPI;
        this.selectionAPI = selectionAPI;
        this.element = element;
        this.cdr = cdr;
        this.defaultCssClass = "igx-grid__tr--group";
        this.isFocused = false;
        this.tabindex = 0;
    }
    Object.defineProperty(IgxGridGroupByRowComponent.prototype, "focused", {
        get: function () {
            return this.isFocused;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridGroupByRowComponent.prototype, "expanded", {
        get: function () {
            return this.grid.isExpandedGroup(this.groupRow);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridGroupByRowComponent.prototype, "describedBy", {
        get: function () {
            return this.gridID + "_" + this.groupRow.expression.fieldName;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridGroupByRowComponent.prototype, "padding", {
        get: function () {
            return this.groupRow.level * this.grid.groupByIndentation + "px";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridGroupByRowComponent.prototype, "styleClasses", {
        get: function () {
            return "" + this.defaultCssClass;
        },
        enumerable: true,
        configurable: true
    });
    IgxGridGroupByRowComponent.prototype.toggle = function () {
        this.grid.toggleGroup(this.groupRow);
    };
    Object.defineProperty(IgxGridGroupByRowComponent.prototype, "grid", {
        get: function () {
            return this.gridAPI.get(this.gridID);
        },
        enumerable: true,
        configurable: true
    });
    IgxGridGroupByRowComponent.prototype.onKeydownArrowDown = function (event) {
        var colIndex = this._getSelectedColIndex() || this._getPrevSelectedColIndex();
        var visibleColumnIndex = colIndex ? this.grid.columnList.toArray()[colIndex].visibleIndex : 0;
        event.preventDefault();
        var rowIndex = this.index + 1;
        this.grid.navigateDown(rowIndex, visibleColumnIndex);
    };
    IgxGridGroupByRowComponent.prototype.onKeydownArrowUp = function (event) {
        var colIndex = this._getSelectedColIndex() || this._getPrevSelectedColIndex();
        var visibleColumnIndex = colIndex ? this.grid.columnList.toArray()[colIndex].visibleIndex : 0;
        event.preventDefault();
        if (this.index === 0) {
            return;
        }
        var rowIndex = this.index - 1;
        this.grid.navigateUp(rowIndex, visibleColumnIndex);
    };
    IgxGridGroupByRowComponent.prototype.onFocus = function () {
        this.isFocused = true;
    };
    IgxGridGroupByRowComponent.prototype.onBlur = function () {
        this.isFocused = false;
    };
    IgxGridGroupByRowComponent.prototype._getSelectedColIndex = function () {
        var selection = this.selectionAPI.get_selection(this.gridID + "-cells");
        if (selection && selection.length > 0) {
            return selection[0].columnID;
        }
    };
    IgxGridGroupByRowComponent.prototype._getPrevSelectedColIndex = function () {
        var selection = this.selectionAPI.get_prev_selection(this.gridID + "-cells");
        if (selection && selection.length > 0) {
            return selection[0].columnID;
        }
    };
    IgxGridGroupByRowComponent.decorators = [
        { type: Component, args: [{
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    preserveWhitespaces: false,
                    selector: "igx-grid-groupby-row",
                    template: "<ng-container [style.padding-left]=\"padding\" #defaultGroupRow (focus)=\"onFocus()\" (blur)=\"onBlur()\">     <div class=\"igx-grid__indicator-grouping\" [style.min-width.px]=\"grid.calcGroupByWidth\" [tabIndex]=\"tabindex\">             <span (click)=\"toggle()\">             <igx-icon *ngIf=\"!expanded\" fontSet=\"material\" name=\"expand_less\"></igx-icon>             <igx-icon *ngIf=\"expanded\" fontSet=\"material\" name=\"expand_more\"></igx-icon>         </span>     </div> <div [tabIndex]=\"tabindex\" class=\"igx-grid__groupContent\" #groupContent (focus)=\"onFocus()\" (blur)=\"onBlur()\">     <ng-container *ngTemplateOutlet=\"grid.groupRowTemplate ? grid.groupRowTemplate : defaultGroupByTemplate; context: { $implicit: groupRow }\">     </ng-container> </div> <ng-template #defaultGroupByTemplate>     <span class=\"igx-grid__groupLabel\">         <igx-icon fontSet=\"material\" name=\"group_work\" color=\"#0099FF\">         </igx-icon>         <span class=\"igx-grid__groupField\">             {{ groupRow.expression.fieldName }}:         </span>         {{ groupRow.value }}             </span>     <igx-badge [value]=\"groupRow.records.length\" class='igx-grid__groupCount' class='igx-grid__groupCount'></igx-badge> </ng-template>     </ng-container>",
                    styles: [":host {\n        display: flex;\n        background: inherit;\n        outline-style: none;\n        height: 50px;\n    }"]
                },] },
    ];
    IgxGridGroupByRowComponent.ctorParameters = function () { return [
        { type: IgxGridAPIService, },
        { type: IgxSelectionAPIService, },
        { type: ElementRef, },
        { type: ChangeDetectorRef, },
    ]; };
    IgxGridGroupByRowComponent.propDecorators = {
        "index": [{ type: Input },],
        "gridID": [{ type: Input },],
        "groupRow": [{ type: Input },],
        "groupContent": [{ type: ViewChild, args: ["groupContent",] },],
        "expanded": [{ type: HostBinding, args: ["attr.aria-expanded",] },],
        "describedBy": [{ type: HostBinding, args: ["attr.aria-describedby",] },],
        "padding": [{ type: HostBinding, args: ["style.padding-left",] },],
        "styleClasses": [{ type: HostBinding, args: ["class",] },],
        "toggle": [{ type: HostListener, args: ["keydown.enter",] }, { type: HostListener, args: ["keydown.space",] },],
        "onKeydownArrowDown": [{ type: HostListener, args: ["keydown.arrowdown", ["$event"],] },],
        "onKeydownArrowUp": [{ type: HostListener, args: ["keydown.arrowup", ["$event"],] },],
    };
    __decorate([
        autoWire(true),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], IgxGridGroupByRowComponent.prototype, "toggle", null);
    return IgxGridGroupByRowComponent;
}());
export { IgxGridGroupByRowComponent };
