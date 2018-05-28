var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostBinding, HostListener, Input, NgZone, TemplateRef, ViewChild } from "@angular/core";
import { Subject, Subscription } from "rxjs";
import { debounceTime } from "rxjs/operators";
import { DataType } from "../data-operations/data-util";
import { BOOLEAN_FILTERS, DATE_FILTERS, NUMBER_FILTERS, STRING_FILTERS } from "../data-operations/filtering-condition";
import { IgxToggleDirective } from "../directives/toggle/toggle.directive";
import { IgxGridAPIService } from "./api.service";
import { autoWire } from "./grid.common";
var IgxGridFilterComponent = (function () {
    function IgxGridFilterComponent(zone, gridAPI, cdr, elementRef) {
        var _this = this;
        this.zone = zone;
        this.gridAPI = gridAPI;
        this.cdr = cdr;
        this.elementRef = elementRef;
        this.booleanFilterAll = "All";
        this.dialogShowing = false;
        this.dialogPosition = "igx-filtering__options--to-right";
        this.UNARY_CONDITIONS = [
            "true", "false", "null", "notNull", "empty", "notEmpty",
            "yesterday", "today", "thisMonth", "lastMonth", "nextMonth",
            "thisYear", "lastYear", "nextYear"
        ];
        this.filterChanged = new Subject();
        this.conditionChanged = new Subject();
        this.unaryConditionChanged = new Subject();
        this.chunkLoaded = new Subscription();
        this.MINIMUM_VIABLE_SIZE = 240;
        this.filterChanged.pipe(debounceTime(250)).subscribe(function (value) { return _this.value = value; });
        this.unaryConditionChanged.subscribe(function (value) { return _this.filter(); });
        this.conditionChanged.subscribe(function (value) { if (!!_this._value || _this._value === 0) {
            _this.filter();
        } });
    }
    Object.defineProperty(IgxGridFilterComponent.prototype, "value", {
        get: function () {
            return this._value;
        },
        set: function (val) {
            if (!val && val !== 0) {
                this.clearFiltering(false);
                return;
            }
            this._value = this.transformValue(val);
            this.filter();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridFilterComponent.prototype, "dataType", {
        get: function () {
            return this.column.dataType;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridFilterComponent.prototype, "conditions", {
        get: function () {
            var conditions = [];
            switch (this.dataType) {
                case DataType.String:
                    conditions = Object.keys(STRING_FILTERS);
                    break;
                case DataType.Number:
                    conditions = Object.keys(NUMBER_FILTERS);
                    break;
                case DataType.Boolean:
                    conditions = Object.keys(BOOLEAN_FILTERS);
                    break;
                case DataType.Date:
                    conditions = Object.keys(DATE_FILTERS);
            }
            return conditions;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridFilterComponent.prototype, "template", {
        get: function () {
            switch (this.dataType) {
                case DataType.String:
                case DataType.Number:
                    return this.defaultFilterUI;
                case DataType.Date:
                    return this.defaultDateUI;
                case DataType.Boolean:
                    return null;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridFilterComponent.prototype, "filterCSS", {
        get: function () {
            if (this.dialogShowing) {
                return "igx-filtering__toggle--active";
            }
            if (this.filteringExpression()) {
                return "igx-filtering__toggle--filtered";
            }
            return "igx-filtering__toggle";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridFilterComponent.prototype, "gridID", {
        get: function () {
            return this.column.gridID;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxGridFilterComponent.prototype, "styleClasses", {
        get: function () {
            return "igx-filtering";
        },
        enumerable: true,
        configurable: true
    });
    IgxGridFilterComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.chunkLoaded = this.gridAPI.get(this.gridID).headerContainer.onChunkPreload.subscribe(function () {
            if (!_this.toggleDirective.collapsed) {
                _this.toggleDirective.collapsed = true;
                _this.refresh();
            }
        });
    };
    IgxGridFilterComponent.prototype.ngDoCheck = function () {
        this.cdr.markForCheck();
    };
    IgxGridFilterComponent.prototype.ngOnDestroy = function () {
        this.filterChanged.unsubscribe();
        this.conditionChanged.unsubscribe();
        this.unaryConditionChanged.unsubscribe();
        this.chunkLoaded.unsubscribe();
    };
    IgxGridFilterComponent.prototype.refresh = function () {
        this.dialogShowing = !this.dialogShowing;
        if (this.dialogShowing) {
            this.focusInput();
            this.column.filteringCondition = this.getCondition(this.select.nativeElement.value);
        }
        this.cdr.detectChanges();
    };
    IgxGridFilterComponent.prototype.isActive = function (value) {
        return this._filterCondition === value;
    };
    Object.defineProperty(IgxGridFilterComponent.prototype, "unaryCondition", {
        get: function () {
            for (var _i = 0, _a = this.UNARY_CONDITIONS; _i < _a.length; _i++) {
                var each = _a[_i];
                if (this._filterCondition && this._filterCondition === each) {
                    return true;
                }
            }
            return false;
        },
        enumerable: true,
        configurable: true
    });
    IgxGridFilterComponent.prototype.filter = function () {
        var grid = this.gridAPI.get(this.gridID);
        this.column.filteringCondition = this.getCondition(this.select.nativeElement.value);
        this.gridAPI.filter(this.column.gridID, this.column.field, this._value, this.column.filteringCondition, this.column.filteringIgnoreCase);
        grid.onFilteringDone.emit({
            fieldName: this.column.field,
            condition: this.column.filteringCondition,
            ignoreCase: this.column.filteringIgnoreCase,
            searchVal: this._value
        });
    };
    IgxGridFilterComponent.prototype.clearFiltering = function (resetCondition) {
        this._value = null;
        this._filterCondition = resetCondition ? undefined : this._filterCondition;
        this.gridAPI.clear_filter(this.gridID, this.column.field);
        this.gridAPI.get(this.gridID).clearSummaryCache();
        if (this.dataType === DataType.Date) {
            this.cdr.detectChanges();
        }
        this.focusInput();
    };
    IgxGridFilterComponent.prototype.selectionChanged = function (value) {
        if (value === this.booleanFilterAll) {
            this.clearFiltering(true);
            return;
        }
        this.focusInput();
        this._filterCondition = value;
        this.column.filteringCondition = this.getCondition(value);
        if (this.unaryCondition) {
            this.unaryConditionChanged.next(value);
        }
        else {
            this.conditionChanged.next(value);
        }
    };
    IgxGridFilterComponent.prototype.onInputChanged = function (val) {
        this.filterChanged.next(val);
    };
    IgxGridFilterComponent.prototype.clearInput = function () {
        this.clearFiltering(false);
    };
    IgxGridFilterComponent.prototype.focusInput = function () {
        if (this.input) {
            this.input.nativeElement.focus();
        }
    };
    Object.defineProperty(IgxGridFilterComponent.prototype, "disabled", {
        get: function () {
            if (this.gridAPI.get(this.gridID).filteringExpressions.length > 0) {
                return false;
            }
            return true;
        },
        enumerable: true,
        configurable: true
    });
    IgxGridFilterComponent.prototype.onMouseDown = function () {
        var _this = this;
        requestAnimationFrame(function () {
            var grid = _this.gridAPI.get(_this.gridID);
            var gridRect = grid.nativeElement.getBoundingClientRect();
            var dropdownRect = _this.elementRef.nativeElement.getBoundingClientRect();
            var x = dropdownRect.left;
            var x1 = gridRect.left + gridRect.width;
            x += window.pageXOffset;
            x1 += window.pageXOffset;
            if (Math.abs(x - x1) < _this.MINIMUM_VIABLE_SIZE) {
                _this.dialogPosition = "igx-filtering__options--to-left";
            }
        });
    };
    IgxGridFilterComponent.prototype.onDatePickerClick = function () {
        this.zone.run(function () { });
    };
    IgxGridFilterComponent.prototype.onClick = function (event) {
        event.stopPropagation();
    };
    IgxGridFilterComponent.prototype.getCondition = function (value) {
        switch (this.dataType) {
            case DataType.String:
                return STRING_FILTERS[value];
            case DataType.Number:
                return NUMBER_FILTERS[value];
            case DataType.Boolean:
                return BOOLEAN_FILTERS[value];
            case DataType.Date:
                return DATE_FILTERS[value];
        }
    };
    IgxGridFilterComponent.prototype.transformValue = function (value) {
        if (this.dataType === DataType.Number) {
            value = parseFloat(value);
        }
        else if (this.dataType === DataType.Boolean) {
            value = Boolean(value);
        }
        return value;
    };
    IgxGridFilterComponent.prototype.filteringExpression = function () {
        var _this = this;
        var expr = this.gridAPI.get(this.gridID)
            .filteringExpressions.find(function (x) { return x.fieldName === _this.column.field; });
        if (expr) {
            this._value = expr.searchVal;
            this._filterCondition = expr.condition.name;
            if (!this.unaryCondition && !this._value) {
                return false;
            }
            return true;
        }
        else {
            this._value = null;
            this._filterCondition = undefined;
        }
    };
    IgxGridFilterComponent.decorators = [
        { type: Component, args: [{
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    preserveWhitespaces: false,
                    selector: "igx-grid-filter",
                    template: "<ng-template #defaultFilterUI>     <div *ngIf=\"!unaryCondition\" class=\"igx-filtering__op\">         <igx-input-group>             <input type=\"text\" igxInput placeholder=\"Value\" autocomplete=\"off\" [value]=\"value\" (input)=\"onInputChanged($event.target.value)\" #input igxFocus=\"true\"/>             <igx-suffix *ngIf=\"input.value.length > 0\" (click)=\"clearInput()\">                 <igx-icon>clear</igx-icon>             </igx-suffix>         </igx-input-group>     </div>     <br> </ng-template>  <ng-template #defaultDateUI>     <igx-datePicker (click)=\"onDatePickerClick()\" *ngIf=\"!unaryCondition\" [(ngModel)]=\"value\"></igx-datePicker> </ng-template>  <div class=\"igx-filtering\">     <div [attr.class]=\"filterCSS\">         <span class=\"toggle-icon\" [igxToggleAction]=\"directive\">             <igx-icon (mousedown)=\"onMouseDown()\">filter_list</igx-icon>         </span>     </div> </div>  <span igxToggle (onOpen)=\"refresh()\" (onClose)=\"refresh()\" #directive=\"toggle\" [attr.class]=\"dialogPosition\">     <div>         <select (change)=\"selectionChanged($event.target.value)\" #select>             <option *ngIf=\"dataType === 'boolean'\" [value]=\"booleanFilterAll\">{{ booleanFilterAll | filterCondition | titlecase }}</option>             <option [selected]=\"isActive(each)\" *ngFor=\"let each of conditions\" [value]=\"each\">{{ each | filterCondition | titlecase }}</option>         </select>     </div>     <ng-container *ngTemplateOutlet=\"template; context: { $implicit: this }\"></ng-container>     <div class=\"igx-filtering__options-bgroup\">         <button igxButton igxRipple (click)=\"clearFiltering(true)\" [disabled]=\"disabled\">Reset</button>         <button igxButton igxRipple (click)=\"directive.close(true)\">Close</button>     </div> </span>"
                },] },
    ];
    IgxGridFilterComponent.ctorParameters = function () { return [
        { type: NgZone, },
        { type: IgxGridAPIService, },
        { type: ChangeDetectorRef, },
        { type: ElementRef, },
    ]; };
    IgxGridFilterComponent.propDecorators = {
        "column": [{ type: Input },],
        "styleClasses": [{ type: HostBinding, args: ["class",] },],
        "defaultFilterUI": [{ type: ViewChild, args: ["defaultFilterUI", { read: TemplateRef },] },],
        "defaultDateUI": [{ type: ViewChild, args: ["defaultDateUI", { read: TemplateRef },] },],
        "toggleDirective": [{ type: ViewChild, args: [IgxToggleDirective, { read: IgxToggleDirective },] },],
        "select": [{ type: ViewChild, args: ["select", { read: ElementRef },] },],
        "input": [{ type: ViewChild, args: ["input", { read: ElementRef },] },],
        "onClick": [{ type: HostListener, args: ["click", ["$event"],] },],
    };
    __decorate([
        autoWire(true),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], IgxGridFilterComponent.prototype, "filter", null);
    __decorate([
        autoWire(true),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Boolean]),
        __metadata("design:returntype", void 0)
    ], IgxGridFilterComponent.prototype, "clearFiltering", null);
    return IgxGridFilterComponent;
}());
export { IgxGridFilterComponent };
