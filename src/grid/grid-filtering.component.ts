import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    HostBinding,
    HostListener,
    Input,
    OnDestroy,
    OnInit,
    TemplateRef,
    ViewChild
} from "@angular/core";
import { debounceTime, distinctUntilChanged } from "rxjs/operators";
import { Subject } from "rxjs/Subject";
import { Subscription } from "rxjs/Subscription";
import { DataType } from "../data-operations/data-util";
import {
    BOOLEAN_FILTERS,
    DATE_FILTERS,
    NUMBER_FILTERS,
    STRING_FILTERS
} from "../data-operations/filtering-condition";
import { IgxToggleDirective } from "../directives/toggle/toggle.directive";
import { IgxGridAPIService } from "./api.service";
import { IgxColumnComponent } from "./column.component";
import { autoWire, IGridBus } from "./grid.common";

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: "igx-grid-filter",
    templateUrl: "./grid-filtering.component.html"
})
export class IgxGridFilterComponent implements IGridBus, OnInit, OnDestroy {

    @Input()
    public column;

    get value() {
        return this._value || "";
    }

    set value(val) {
        if (!val.length) {
            this.clearFiltering();
            return;
        }
        this._value = this.transformValue(val);
        this.filter();
    }

    get dataType(): DataType {
        return this.column.dataType;
    }

    get conditions() {
        let conditions = [];

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
    }

    get template() {
        switch (this.dataType) {
            case DataType.String:
            case DataType.Number:
                return this.defaultFilterUI;
            case DataType.Date:
                return this.defaultDateUI;
            case DataType.Boolean:
                return null;
        }
    }

    get filterCSS(): string {
        if (this.dialogShowing) {
            return "igx-filtering__toggle--active";
        }
        if (this.filteringExpression()) {
            return "igx-filtering__toggle--filtered";
        }
        return "igx-filtering__toggle";
    }

    get gridID(): string {
        return this.column.gridID;
    }

    @HostBinding("class")
    get styleClasses() {
        return `igx-filtering`;
    }

    public dialogShowing = false;
    public dialogPosition = "igx-filtering__options--to-right";

    protected UNARY_CONDITIONS = [
        "true", "false", "null", "notNull", "empty", "notEmpty",
        "yesterday", "today", "thisMonth", "lastMonth", "nextMonth",
        "thisYear", "lastYear", "nextYear"
    ];
    protected _value;
    protected _filterCondition;
    protected filterChanged = new Subject();
    protected chunkLoaded = new Subscription();
    private MINIMUM_VIABLE_SIZE = 240;

    @ViewChild("defaultFilterUI", { read: TemplateRef })
    protected defaultFilterUI: TemplateRef<any>;

    @ViewChild("defaultDateUI", { read: TemplateRef })
    protected defaultDateUI: TemplateRef<any>;

    @ViewChild(IgxToggleDirective, { read: IgxToggleDirective})
    protected toggleDirective: IgxToggleDirective;

    constructor(public gridAPI: IgxGridAPIService, public cdr: ChangeDetectorRef, private elementRef: ElementRef) {
        this.filterChanged.pipe(
            debounceTime(250),
            distinctUntilChanged()
        ).subscribe((value) => this.value = value);
    }

    public ngOnInit() {
        this.chunkLoaded = this.gridAPI.get(this.gridID).headerContainer.onChunkPreload.subscribe(() => {
            if (!this.toggleDirective.collapsed) {
                this.toggleDirective.collapsed = true;
                this.refresh();
            }
        });
    }

    public ngOnDestroy() {
        this.filterChanged.unsubscribe();
        this.chunkLoaded.unsubscribe();
    }

    public refresh() {
        this.dialogShowing = !this.dialogShowing;
        if (!this._filterCondition && this.dialogShowing) {
            this._filterCondition = this.conditions[0];
            this.column.filteringCondition = this.getCondition(this._filterCondition);
        }
        this.cdr.detectChanges();
    }

    public isActive(value): boolean {
        return this._filterCondition === value;
    }

    get unaryCondition(): boolean {
        for (const each of this.UNARY_CONDITIONS) {
            if (this._filterCondition && this._filterCondition === each) {
                return true;
            }
        }
        return false;
    }

    @autoWire(true)
    public filter(): void {
        const grid = this.gridAPI.get(this.gridID);
        this.gridAPI.filter(
            this.column.gridID, this.column.field,
            this._value, this.column.filteringCondition, this.column.filteringIgnoreCase);
        grid.onFilteringDone.emit({
            expression: {
                fieldName: this.column.field,
                filteringCondition: this.column.filteringCondition,
                filteringIgnoreCase: this.column.filteringIgnoreCase,
                searchVal: this._value
            }
        });
    }

    @autoWire(true)
    public clearFiltering(): void {
        this._value = null;
        this._filterCondition = undefined;
        this.gridAPI.clear_filter(this.gridID, this.column.field);
    }

    public conditionChanged(value): void {

        this._filterCondition = value;
        this.column.filteringCondition = this.getCondition(value);
        this.filter();
    }

    public onInputChanged(val): void {
        this.filterChanged.next(val);
    }

    public get disabled() {
        if (this.value && !this.unaryCondition) {
            return false;
        } else if (this.unaryCondition) {
            return false;
        }
        return true;
    }

    @HostListener("mousedown")
    public onMouseDown() {
        const grid = this.gridAPI.get(this.gridID);
        const gridRect = grid.nativeElement.getBoundingClientRect();
        const dropdownRect = this.elementRef.nativeElement.getBoundingClientRect();

        let x = dropdownRect.left;
        let x1 = gridRect.left + gridRect.width;
        x += window.pageXOffset;
        x1 += window.pageXOffset;
        if (Math.abs(x - x1) < this.MINIMUM_VIABLE_SIZE) {
            this.dialogPosition = "igx-filtering__options--to-left";
        }
    }

    @HostListener("click", ["$event"])
    public onClick(event) {
        event.stopPropagation();
    }

    protected getCondition(value) {
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
    }

    protected transformValue(value) {
        if (this.dataType === DataType.Number) {
            value = parseFloat(value);
        } else if (this.dataType === DataType.Boolean) {
            value = Boolean(value);
        } else if (this.dataType === DataType.Date) {
            value = new Date(Date.parse(value));
        }

        return value;
    }

    protected filteringExpression(): boolean {
        const expr = this.gridAPI.get(this.gridID)
            .filteringExpressions.find((x) => x.fieldName === this.column.field);

        if (expr) {
            this._value = expr.searchVal;
            this._filterCondition = expr.condition.name;

            if (!this.unaryCondition && !this._value) {
                return false;
            }
            return true;
        } else {
            this._value = null;
            this._filterCondition = undefined;
        }
    }
}
