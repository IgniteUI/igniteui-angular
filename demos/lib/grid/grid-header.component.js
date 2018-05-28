var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostBinding, HostListener, Input, NgZone, ViewChild } from "@angular/core";
import { DataType } from "../data-operations/data-util";
import { SortingDirection } from "../data-operations/sorting-expression.interface";
import { RestrictDrag } from "../directives/dragdrop/dragdrop.directive";
import { IgxGridAPIService } from "./api.service";
import { IgxColumnComponent } from "./column.component";
import { autoWire } from "./grid.common";
var IgxGridHeaderComponent = (function () {
    function IgxGridHeaderComponent(gridAPI, cdr, elementRef, zone) {
        this.gridAPI = gridAPI;
        this.cdr = cdr;
        this.elementRef = elementRef;
        this.zone = zone;
        this.hostRole = "columnheader";
        this.tabindex = 0;
        this.resizeCursor = null;
        this.showResizer = false;
        this.dragDirection = RestrictDrag.HORIZONTALLY;
        this.resizeEndTimeout = /Firefox[\/\s](\d+\.\d+)/.test(navigator.userAgent) ? 200 : 0;
        this.sortDirection = SortingDirection.None;
        this._isResiznig = false;
    }
    Object.defineProperty(IgxGridHeaderComponent.prototype, "styleClasses", {
        get: function () {
            return "igx-grid__th " + this.column.headerClasses;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridHeaderComponent.prototype, "width", {
        get: function () {
            return this.column.width;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridHeaderComponent.prototype, "ascending", {
        get: function () {
            return this.sortDirection === SortingDirection.Asc;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridHeaderComponent.prototype, "descending", {
        get: function () {
            return this.sortDirection === SortingDirection.Desc;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridHeaderComponent.prototype, "sortingIcon", {
        get: function () {
            if (this.sortDirection !== SortingDirection.None) {
                return this.sortDirection === SortingDirection.Asc ? "arrow_upward" : "arrow_downward";
            }
            return "none";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridHeaderComponent.prototype, "columnType", {
        get: function () {
            return this.column.dataType === DataType.Number;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridHeaderComponent.prototype, "sorted", {
        get: function () {
            return this.sortDirection !== SortingDirection.None;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridHeaderComponent.prototype, "zIndex", {
        get: function () {
            if (!this.column.pinned) {
                return null;
            }
            return 9999 - this.grid.pinnedColumns.indexOf(this.column);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridHeaderComponent.prototype, "headerID", {
        get: function () {
            return this.gridID + "_" + this.column.field;
        },
        enumerable: true,
        configurable: true
    });
    IgxGridHeaderComponent.prototype.ngOnInit = function () {
        this.cdr.markForCheck();
    };
    IgxGridHeaderComponent.prototype.ngDoCheck = function () {
        this.getSortDirection();
        this.cdr.markForCheck();
    };
    IgxGridHeaderComponent.prototype.ngAfterViewInit = function () {
        var _this = this;
        this.zone.runOutsideAngular(function () {
            _this.resizeArea.nativeElement.addEventListener("mouseover", _this.onResizeAreaMouseOver.bind(_this));
            _this.resizeArea.nativeElement.addEventListener("mousedown", _this.onResizeAreaMouseDown.bind(_this));
        });
    };
    IgxGridHeaderComponent.prototype.onClick = function (event) {
        var _this = this;
        if (!this._isResiznig) {
            event.stopPropagation();
            if (this.column.sortable) {
                var grid = this.gridAPI.get(this.gridID);
                var groupingExpr = grid.groupingExpressions.find(function (expr) { return expr.fieldName === _this.column.field; });
                var sortDir = groupingExpr ?
                    this.sortDirection + 1 > SortingDirection.Desc ? SortingDirection.Asc : SortingDirection.Desc
                    : this.sortDirection + 1 > SortingDirection.Desc ? SortingDirection.None : this.sortDirection + 1;
                this.sortDirection = sortDir;
                this.gridAPI.sort(this.gridID, this.column.field, this.sortDirection, this.column.sortingIgnoreCase);
                grid.onSortingDone.emit({
                    dir: this.sortDirection,
                    fieldName: this.column.field,
                    ignoreCase: this.column.sortingIgnoreCase
                });
            }
        }
    };
    Object.defineProperty(IgxGridHeaderComponent.prototype, "restrictResizeMin", {
        get: function () {
            var actualMinWidth = parseFloat(this.column.minWidth);
            var defaultMinWidth = parseFloat(this.column.defaultMinWidth);
            var minWidth = Number.isNaN(actualMinWidth) || actualMinWidth < defaultMinWidth ? defaultMinWidth : actualMinWidth;
            minWidth = minWidth < parseFloat(this.column.width) ? minWidth : parseFloat(this.column.width);
            return minWidth - this.elementRef.nativeElement.getBoundingClientRect().width;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridHeaderComponent.prototype, "restrictResizeMax", {
        get: function () {
            var actualWidth = this.elementRef.nativeElement.getBoundingClientRect().width;
            if (this.column.pinned) {
                var pinnedMaxWidth = this._pinnedMaxWidth = this.grid.calcPinnedContainerMaxWidth - this.grid.pinnedWidth + actualWidth;
                if (this.column.maxWidth && parseFloat(this.column.maxWidth) < pinnedMaxWidth) {
                    this._pinnedMaxWidth = this.column.maxWidth;
                    return parseFloat(this.column.maxWidth) - actualWidth;
                }
                else {
                    return pinnedMaxWidth - actualWidth;
                }
            }
            else {
                if (this.column.maxWidth) {
                    return parseFloat(this.column.maxWidth) - actualWidth;
                }
                else {
                    return Number.MAX_SAFE_INTEGER;
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridHeaderComponent.prototype, "grid", {
        get: function () {
            return this.gridAPI.get(this.gridID);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridHeaderComponent.prototype, "isPinned", {
        get: function () {
            return this.column.pinned;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridHeaderComponent.prototype, "isLastPinned", {
        get: function () {
            var pinnedCols = this.grid.pinnedColumns;
            if (pinnedCols.length === 0) {
                return false;
            }
            else {
                return pinnedCols.indexOf(this.column) === pinnedCols.length - 1;
            }
        },
        enumerable: true,
        configurable: true
    });
    IgxGridHeaderComponent.prototype.getSortDirection = function () {
        var _this = this;
        var expr = this.gridAPI.get(this.gridID).sortingExpressions.find(function (x) { return x.fieldName === _this.column.field; });
        this.sortDirection = expr ? expr.dir : SortingDirection.None;
    };
    IgxGridHeaderComponent.prototype.onResizeAreaMouseOver = function () {
        if (this.column.resizable) {
            this.resizeCursor = "col-resize";
            this.cdr.detectChanges();
        }
    };
    IgxGridHeaderComponent.prototype.onResizeAreaMouseDown = function (event) {
        if (event.button === 0 && this.column.resizable) {
            this.showResizer = true;
            this._isResiznig = true;
            this.resizerHeight = this.grid.calcResizerHeight;
            this._startResizePos = event.clientX;
        }
        else {
            this.resizeCursor = null;
        }
        this.cdr.detectChanges();
    };
    IgxGridHeaderComponent.prototype.onResizeAreaDblClick = function () {
        if (this.column.resizable) {
            var currentColWidth = this.elementRef.nativeElement.getBoundingClientRect().width;
            var range_1 = this.column.grid.document.createRange();
            var valToPxls_1 = function (referenceNode) {
                range_1.selectNodeContents(referenceNode);
                return range_1.getBoundingClientRect().width;
            };
            var largest = new Map();
            var cellsContentWidths_1 = [];
            if (this.column.cells[0].nativeElement.children.length > 0) {
                this.column.cells.forEach(function (cell) {
                    cellsContentWidths_1.push(Math.max.apply(Math, Array.from(cell.nativeElement.children).map(function (child) { return valToPxls_1(child); })));
                });
            }
            else {
                cellsContentWidths_1 = this.column.cells.map(function (cell) { return valToPxls_1(cell.nativeElement); });
            }
            var ind = cellsContentWidths_1.indexOf(Math.max.apply(Math, cellsContentWidths_1));
            var cellStyle = this.grid.document.defaultView.getComputedStyle(this.column.cells[ind].nativeElement);
            var cellPadding = parseFloat(cellStyle.paddingLeft) + parseFloat(cellStyle.paddingRight);
            if (this.isLastPinned) {
                cellPadding += parseFloat(cellStyle.borderRightWidth);
            }
            largest.set(Math.max.apply(Math, cellsContentWidths_1), cellPadding);
            var headerCell = void 0;
            if (this.column.headerTemplate && this.elementRef.nativeElement.children[0].children.length > 0) {
                headerCell = Math.max.apply(Math, Array.from(this.elementRef.nativeElement.children[0].children)
                    .map(function (child) { return valToPxls_1(child); }));
            }
            else {
                headerCell = valToPxls_1(this.elementRef.nativeElement.children[0]);
            }
            if (this.column.sortable || this.column.filterable) {
                headerCell += this.elementRef.nativeElement.children[1].getBoundingClientRect().width;
            }
            var headerStyle = this.grid.document.defaultView.getComputedStyle(this.elementRef.nativeElement);
            var headerPadding = parseFloat(headerStyle.paddingLeft) + parseFloat(headerStyle.paddingRight) +
                parseFloat(headerStyle.borderRightWidth);
            largest.set(headerCell, headerPadding);
            var largestCell = Math.max.apply(Math, Array.from(largest.keys()));
            var largestCellPadding = largest.get(largestCell);
            var size = Math.ceil(largestCell + largestCellPadding) + "px";
            if (this.column.pinned) {
                var newPinnedWidth = this.grid.pinnedWidth - currentColWidth + parseFloat(size);
                if (newPinnedWidth <= this.grid.calcPinnedContainerMaxWidth) {
                    this.column.width = size;
                }
            }
            else if (this.column.maxWidth && (parseFloat(size) > parseFloat(this.column.maxWidth))) {
                this.column.width = parseFloat(this.column.maxWidth) + "px";
            }
            else if (parseFloat(size) < parseFloat(this.column.defaultMinWidth)) {
                this.column.width = this.column.defaultMinWidth + "px";
            }
            else {
                this.column.width = size;
            }
            this.grid.markForCheck();
            this.grid.reflow();
            this.grid.onColumnResized.emit({ column: this.column, prevWidth: currentColWidth.toString(), newWidth: this.column.width });
        }
    };
    IgxGridHeaderComponent.prototype.onResize = function (event) {
        this._isResiznig = false;
        this.showResizer = false;
        var diff = event.clientX - this._startResizePos;
        if (this.column.resizable) {
            var currentColWidth = parseFloat(this.column.width);
            var actualMinWidth = parseFloat(this.column.minWidth);
            var defaultMinWidth = parseFloat(this.column.defaultMinWidth);
            var colMinWidth = Number.isNaN(actualMinWidth) || actualMinWidth < defaultMinWidth ? defaultMinWidth : actualMinWidth;
            var colMaxWidth = this.column.pinned ? parseFloat(this._pinnedMaxWidth) : parseFloat(this.column.maxWidth);
            var actualWidth = this.elementRef.nativeElement.getBoundingClientRect().width;
            currentColWidth = Number.isNaN(currentColWidth) || (currentColWidth < actualWidth) ? actualWidth : currentColWidth;
            colMinWidth = colMinWidth < currentColWidth ? colMinWidth : currentColWidth;
            if (currentColWidth + diff < colMinWidth) {
                this.column.width = colMinWidth + "px";
            }
            else if (colMaxWidth && (currentColWidth + diff > colMaxWidth)) {
                this.column.width = colMaxWidth + "px";
            }
            else {
                this.column.width = (currentColWidth + diff) + "px";
            }
            this.grid.markForCheck();
            this.grid.reflow();
            if (currentColWidth !== parseFloat(this.column.width)) {
                this.grid.onColumnResized.emit({ column: this.column, prevWidth: currentColWidth.toString(), newWidth: this.column.width });
            }
        }
    };
    IgxGridHeaderComponent.decorators = [
        { type: Component, args: [{
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    preserveWhitespaces: false,
                    selector: "igx-grid-header",
                    template: "<ng-template #defaultColumn>     {{ column.header || column.field }} </ng-template>  <span class=\"igx-grid__th-title\">     <ng-container *ngTemplateOutlet=\"column.headerTemplate ? column.headerTemplate : defaultColumn; context: { $implicit: column }\">     </ng-container> </span>  <div class=\"igx-grid__th-icons\">     <igx-icon class=\"sort-icon\" *ngIf=\"column.sortable\">{{sortingIcon}}</igx-icon>     <igx-grid-filter [column]=\"column\" *ngIf=\"column.filterable\"></igx-grid-filter> </div>  <span [style.cursor]=\"resizeCursor\" #resizeArea     class=\"igx-grid__th-resize-handle\"     (dblclick)=\"onResizeAreaDblClick()\">      <div *ngIf=\"showResizer\" igxResizer         class=\"igx-grid__th-resize-line\"         [style.height.px]=\"resizerHeight\"         [restrictHResizeMax]=\"restrictResizeMax\"         [restrictHResizeMin]=\"restrictResizeMin\"         [resizeEndTimeout]=\"resizeEndTimeout\"         (resizeEnd)=\"onResize($event)\">     </div>  </span>"
                },] },
    ];
    IgxGridHeaderComponent.ctorParameters = function () { return [
        { type: IgxGridAPIService, },
        { type: ChangeDetectorRef, },
        { type: ElementRef, },
        { type: NgZone, },
    ]; };
    IgxGridHeaderComponent.propDecorators = {
        "column": [{ type: Input },],
        "gridID": [{ type: Input },],
        "styleClasses": [{ type: HostBinding, args: ["class",] },],
        "width": [{ type: HostBinding, args: ["style.min-width",] }, { type: HostBinding, args: ["style.flex-basis",] }, { type: HostBinding, args: ["class.igx-grid__th--fw",] },],
        "ascending": [{ type: HostBinding, args: ["class.asc",] },],
        "descending": [{ type: HostBinding, args: ["class.desc",] },],
        "columnType": [{ type: HostBinding, args: ["class.igx-grid__th--number",] },],
        "sorted": [{ type: HostBinding, args: ["class.igx-grid__th--sorted",] },],
        "zIndex": [{ type: HostBinding, args: ["style.z-index",] },],
        "hostRole": [{ type: HostBinding, args: ["attr.role",] },],
        "tabindex": [{ type: HostBinding, args: ["attr.tabindex",] },],
        "headerID": [{ type: HostBinding, args: ["attr.id",] },],
        "resizeArea": [{ type: ViewChild, args: ["resizeArea",] },],
        "onClick": [{ type: HostListener, args: ["click", ["$event"],] },],
        "isPinned": [{ type: HostBinding, args: ["class.igx-grid__th--pinned",] },],
        "isLastPinned": [{ type: HostBinding, args: ["class.igx-grid__th--pinned-last",] },],
    };
    __decorate([
        autoWire(true),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", void 0)
    ], IgxGridHeaderComponent.prototype, "onClick", null);
    return IgxGridHeaderComponent;
}());
export { IgxGridHeaderComponent };
