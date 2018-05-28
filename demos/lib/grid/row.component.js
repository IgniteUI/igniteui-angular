var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, forwardRef, HostBinding, HostListener, Input, QueryList, ViewChild, ViewChildren } from "@angular/core";
import { IgxCheckboxComponent } from "../checkbox/checkbox.component";
import { IgxSelectionAPIService } from "../core/selection";
import { IgxForOfDirective } from "../directives/for-of/for_of.directive";
import { IgxGridAPIService } from "./api.service";
import { IgxGridCellComponent } from "./cell.component";
import { autoWire } from "./grid.common";
var IgxGridRowComponent = (function () {
    function IgxGridRowComponent(gridAPI, selectionAPI, element, cdr) {
        this.gridAPI = gridAPI;
        this.selectionAPI = selectionAPI;
        this.element = element;
        this.cdr = cdr;
        this.tabindex = 0;
        this.role = "row";
        this.defaultCssClass = "igx-grid__tr";
        this._rowSelection = false;
        this.isFocused = false;
    }
    Object.defineProperty(IgxGridRowComponent.prototype, "rowHeight", {
        get: function () {
            return this.grid.rowHeight;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridRowComponent.prototype, "styleClasses", {
        get: function () {
            return this.defaultCssClass + " " + (this.index % 2 ? this.grid.evenRowCSS : this.grid.oddRowCSS);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridRowComponent.prototype, "focused", {
        get: function () {
            return this.isFocused;
        },
        set: function (val) {
            this.isFocused = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridRowComponent.prototype, "columns", {
        get: function () {
            return this.grid.visibleColumns;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridRowComponent.prototype, "pinnedColumns", {
        get: function () {
            return this.grid.pinnedColumns;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridRowComponent.prototype, "unpinnedColumns", {
        get: function () {
            return this.grid.unpinnedColumns;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridRowComponent.prototype, "rowSelectable", {
        get: function () {
            return this.grid.rowSelectable;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridRowComponent.prototype, "grid", {
        get: function () {
            return this.gridAPI.get(this.gridID);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridRowComponent.prototype, "rowID", {
        get: function () {
            var primaryKey = this.grid.primaryKey;
            return primaryKey ? this.rowData[primaryKey] : this.rowData;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridRowComponent.prototype, "nativeElement", {
        get: function () {
            return this.element.nativeElement;
        },
        enumerable: true,
        configurable: true
    });
    IgxGridRowComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.chunkLoaded$ = this.virtDirRow.onChunkLoad.subscribe(function () {
            if (_this.grid.cellInEditMode) {
                _this.grid.cellInEditMode.inEditMode = false;
            }
        });
    };
    IgxGridRowComponent.prototype.ngOnDestroy = function () {
        if (this.chunkLoaded$) {
            this.chunkLoaded$.unsubscribe();
        }
    };
    IgxGridRowComponent.prototype.onFocus = function (event) {
        this.isFocused = true;
    };
    IgxGridRowComponent.prototype.onBlur = function (event) {
        this.isFocused = false;
    };
    IgxGridRowComponent.prototype.onCheckboxClick = function (event) {
        var newSelection = (event.checked) ?
            this.selectionAPI.select_item(this.gridID, this.rowID) :
            this.selectionAPI.deselect_item(this.gridID, this.rowID);
        this.grid.triggerRowSelectionChange(newSelection, this, event);
    };
    Object.defineProperty(IgxGridRowComponent.prototype, "rowCheckboxAriaLabel", {
        get: function () {
            return this.grid.primaryKey ?
                this.isSelected ? "Deselect row with key " + this.rowID : "Select row with key " + this.rowID :
                this.isSelected ? "Deselect row" : "Select row";
        },
        enumerable: true,
        configurable: true
    });
    IgxGridRowComponent.prototype.ngDoCheck = function () {
        this.isSelected = this.rowSelectable ?
            this.grid.allRowsSelected ? true : this.selectionAPI.is_item_selected(this.gridID, this.rowID) :
            this.selectionAPI.is_item_selected(this.gridID, this.rowID);
        this.cdr.markForCheck();
        if (this.checkboxElement) {
            this.checkboxElement.checked = this.isSelected;
        }
    };
    IgxGridRowComponent.decorators = [
        { type: Component, args: [{
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    preserveWhitespaces: false,
                    selector: "igx-grid-row",
                    template: "<ng-container *ngIf=\"grid.groupingExpressions.length > 0\">         <div class=\"igx-grid__groupIndentation\" [style.min-width.px]=\"grid.calcGroupByWidth\">                        </div> </ng-container> <ng-container *ngIf=\"rowSelectable\">     <div class=\"igx-grid__cbx-selection\">         <igx-checkbox [checked]=\"isSelected\" (change)=\"onCheckboxClick($event)\" disableRipple=\"true\" [aria-label]=\"rowCheckboxAriaLabel\"></igx-checkbox>     </div> </ng-container> <ng-container *ngIf=\"pinnedColumns.length > 0\">     <igx-grid-cell *ngFor=\"let col of pinnedColumns\" [column]=\"col\" [row]=\"this\" [style.min-width.px]=\"col.width\" [style.flex-basis.px]=\"col.width\" [value]=\"rowData[col.field]\" [cellTemplate]=\"col.bodyTemplate\"></igx-grid-cell> </ng-container> <ng-template igxFor let-col [igxForOf]=\"unpinnedColumns\" [igxForScrollContainer]=\"grid.parentVirtDir\" let-colIndex=\"index\" [igxForScrollOrientation]=\"'horizontal'\" [igxForContainerSize]='grid.unpinnedWidth' [igxForTrackBy]='grid.trackColumnChanges' #igxDirRef>     <igx-grid-cell [column]=\"col\" [row]=\"this\" [style.min-width.px]=\"col.width\" [style.flex-basis.px]=\"col.width\" [value]=\"rowData[col.field]\" [cellTemplate]=\"col.bodyTemplate\"></igx-grid-cell> </ng-template>"
                },] },
    ];
    IgxGridRowComponent.ctorParameters = function () { return [
        { type: IgxGridAPIService, },
        { type: IgxSelectionAPIService, },
        { type: ElementRef, },
        { type: ChangeDetectorRef, },
    ]; };
    IgxGridRowComponent.propDecorators = {
        "rowData": [{ type: Input },],
        "index": [{ type: Input },],
        "gridID": [{ type: Input },],
        "virtDirRow": [{ type: ViewChild, args: ["igxDirRef", { read: IgxForOfDirective },] },],
        "checkboxElement": [{ type: ViewChild, args: [forwardRef(function () { return IgxCheckboxComponent; }), { read: IgxCheckboxComponent },] },],
        "cells": [{ type: ViewChildren, args: [forwardRef(function () { return IgxGridCellComponent; }), { read: IgxGridCellComponent },] },],
        "rowHeight": [{ type: HostBinding, args: ["style.height.px",] },],
        "tabindex": [{ type: HostBinding, args: ["attr.tabindex",] },],
        "role": [{ type: HostBinding, args: ["attr.role",] },],
        "styleClasses": [{ type: HostBinding, args: ["class",] },],
        "isSelected": [{ type: HostBinding, args: ["attr.aria-selected",] }, { type: HostBinding, args: ["class.igx-grid__tr--selected",] },],
        "onFocus": [{ type: HostListener, args: ["focus", ["$event"],] },],
        "onBlur": [{ type: HostListener, args: ["blur", ["$event"],] },],
    };
    __decorate([
        autoWire(true),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], IgxGridRowComponent.prototype, "ngOnInit", null);
    return IgxGridRowComponent;
}());
export { IgxGridRowComponent };
