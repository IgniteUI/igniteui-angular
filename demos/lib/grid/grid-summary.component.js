var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, Input } from "@angular/core";
import { IgxGridAPIService } from "./api.service";
import { IgxColumnComponent } from "./column.component";
import { autoWire } from "./grid.common";
var IgxGridSummaryComponent = (function () {
    function IgxGridSummaryComponent(gridAPI, cdr) {
        this.gridAPI = gridAPI;
        this.cdr = cdr;
        this.itemClass = "igx-grid-summary__item";
        this.hiddenItemClass = "igx-grid-summary__item--inactive";
        this.summaryResultClass = "igx-grid-summary-item__result--left-align";
        this.numberSummaryResultClass = "igx-grid-summary-item__result";
    }
    Object.defineProperty(IgxGridSummaryComponent.prototype, "dataType", {
        get: function () {
            return this.column.dataType;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridSummaryComponent.prototype, "isPinned", {
        get: function () {
            return this.column.pinned;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridSummaryComponent.prototype, "isLastPinned", {
        get: function () {
            var pinnedCols = this.gridAPI.get(this.gridID).pinnedColumns;
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
    Object.defineProperty(IgxGridSummaryComponent.prototype, "emptyClass", {
        get: function () {
            return !this.column.hasSummary;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridSummaryComponent.prototype, "defaultClass", {
        get: function () {
            return this.column.hasSummary;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridSummaryComponent.prototype, "widthPersistenceClass", {
        get: function () {
            return this.column.width !== null;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridSummaryComponent.prototype, "width", {
        get: function () {
            return this.column.width;
        },
        enumerable: true,
        configurable: true
    });
    IgxGridSummaryComponent.prototype.ngOnInit = function () {
    };
    IgxGridSummaryComponent.prototype.ngOnDestroy = function () {
        if (this.subscriptionOnEdit$) {
            this.subscriptionOnEdit$.unsubscribe();
        }
        if (this.subscriptionOnAdd$) {
            this.subscriptionOnAdd$.unsubscribe();
        }
        if (this.subscriptionOnDelete$) {
            this.subscriptionOnDelete$.unsubscribe();
        }
        if (this.subscriptionOnFilter$) {
            this.subscriptionOnFilter$.unsubscribe();
        }
    };
    IgxGridSummaryComponent.prototype.ngDoCheck = function () {
        this.cdr.detectChanges();
    };
    IgxGridSummaryComponent.prototype.ngAfterContentInit = function () {
        var _this = this;
        if (this.column.hasSummary) {
            this.subscriptionOnEdit$ = this.gridAPI.get(this.gridID).onEditDone.subscribe(function (editCell) {
                if (editCell.cell) {
                    _this.fieldName = editCell.cell.column.field;
                    _this.clearCache(editCell.cell.column.field);
                }
                else {
                    _this.clearAll();
                }
            });
            this.subscriptionOnFilter$ = this.gridAPI.get(this.gridID).onFilteringDone.subscribe(function (data) {
                _this.fieldName = data.fieldName;
                _this.clearAll();
            });
            this.subscriptionOnAdd$ = this.gridAPI.get(this.gridID).onRowAdded.subscribe(function () { return _this.clearAll(); });
            this.subscriptionOnDelete$ = this.gridAPI.get(this.gridID).onRowDeleted.subscribe(function () { return _this.clearAll(); });
        }
    };
    IgxGridSummaryComponent.prototype.clearCache = function (field) {
        this.gridAPI.remove_summary(this.gridID, field);
    };
    IgxGridSummaryComponent.prototype.clearAll = function () {
        this.gridAPI.remove_summary(this.gridID);
        this.gridAPI.get(this.gridID).markForCheck();
        this.cdr.detectChanges();
    };
    Object.defineProperty(IgxGridSummaryComponent.prototype, "resolveSummaries", {
        get: function () {
            if (this.fieldName) {
                var field = this.fieldName;
                this.fieldName = null;
                this.gridAPI.set_summary_by_column_name(this.gridID, field);
                if (this.column.field === field) {
                    return this.gridAPI.get_summaries(this.gridID).get(field);
                }
                else {
                    return this.gridAPI.get_summaries(this.gridID).get(this.column.field);
                }
            }
            else {
                this.gridAPI.set_summary_by_column_name(this.gridID, this.column.field);
                return this.gridAPI.get_summaries(this.gridID).get(this.column.field);
            }
        },
        enumerable: true,
        configurable: true
    });
    IgxGridSummaryComponent.prototype.summaryValueClass = function (result) {
        if (typeof result === "number") {
            return this.numberSummaryResultClass;
        }
        else {
            return this.summaryResultClass;
        }
    };
    IgxGridSummaryComponent.decorators = [
        { type: Component, args: [{
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    preserveWhitespaces: false,
                    selector: "igx-grid-summary",
                    template: "<ng-container *ngIf=\"column.hasSummary\">     <ng-container *ngFor=\"let summary of resolveSummaries\">         <div class=\"{{itemClass}}\">             <span class=\"igx-grid-summary__label\" title=\"{{ summary.label }}\">{{ summary.label }}</span>             <span class=\"igx-grid-summary__result\" title=\"{{ summary.summaryResult }}\">{{ summary.summaryResult }}</span>         </div>     </ng-container> </ng-container>"
                },] },
    ];
    IgxGridSummaryComponent.ctorParameters = function () { return [
        { type: IgxGridAPIService, },
        { type: ChangeDetectorRef, },
    ]; };
    IgxGridSummaryComponent.propDecorators = {
        "column": [{ type: Input },],
        "gridID": [{ type: Input },],
        "isPinned": [{ type: HostBinding, args: ["class.igx-grid-summary--pinned",] },],
        "isLastPinned": [{ type: HostBinding, args: ["class.igx-grid-summary--pinned-last",] },],
        "emptyClass": [{ type: HostBinding, args: ["class.igx-grid-summary--empty",] },],
        "defaultClass": [{ type: HostBinding, args: ["class.igx-grid-summary",] },],
        "widthPersistenceClass": [{ type: HostBinding, args: ["class.igx-grid-summary--fw",] },],
        "width": [{ type: HostBinding, args: ["style.min-width",] }, { type: HostBinding, args: ["style.flex-basis",] },],
    };
    __decorate([
        autoWire(true),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], IgxGridSummaryComponent.prototype, "ngOnInit", null);
    __decorate([
        autoWire(true),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", void 0)
    ], IgxGridSummaryComponent.prototype, "clearCache", null);
    __decorate([
        autoWire(true),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], IgxGridSummaryComponent.prototype, "clearAll", null);
    return IgxGridSummaryComponent;
}());
export { IgxGridSummaryComponent };
