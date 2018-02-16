import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
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

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: "igx-grid-filter",
    templateUrl: "./grid-filtering.component.html"
})
export class IgxGridFilterComponent implements OnInit, OnDestroy {

    @Input()
    public column;

    get value() {
        return this._value || "";
    }

    set value(val) {
        if (!val) {
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

    protected UNARY_CONDITIONS = [
        "true", "false", "null", "notNull", "empty", "notEmpty",
        "yesterday", "today", "thisMonth", "lastMonth", "nextMonth",
        "thisYear", "lastYear", "nextYear"
    ];
    protected _value;
    protected _filterCondition;
    protected filterChanged = new Subject();
    protected chunkLoaded = new Subscription();

    @ViewChild("defaultFilterUI", { read: TemplateRef })
    protected defaultFilterUI: TemplateRef<any>;

    @ViewChild("defaultDateUI", { read: TemplateRef })
    protected defaultDateUI: TemplateRef<any>;

    @ViewChild(IgxToggleDirective, { read: IgxToggleDirective})
    protected toggleDirective: IgxToggleDirective;

    constructor(private gridAPI: IgxGridAPIService, private cdr: ChangeDetectorRef) {
        this.filterChanged.pipe(
            debounceTime(250),
            distinctUntilChanged()
        ).subscribe((value) => this.value = value);
    }

    public ngOnInit() {
        this.chunkLoaded = this.gridAPI.get(this.gridID).headerContainer.onChunkLoading.subscribe(() => {
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
        this.cdr.markForCheck();
    }

    public clearFiltering(): void {
        this._value = null;
        this._filterCondition = undefined;
        this.gridAPI.clear_filter(this.gridID, this.column.field);
        this.cdr.markForCheck();
    }

    public conditionChanged(value): void {

        this._filterCondition = value;

        if (this.dataType === DataType.String) {
            this.column.filteringCondition = STRING_FILTERS[value];
        } else if (this.dataType === DataType.Number) {
            this.column.filteringCondition = NUMBER_FILTERS[value];
        } else if (this.dataType === DataType.Boolean) {
            this.column.filteringCondition = BOOLEAN_FILTERS[value];
        } else if (this.dataType === DataType.Date) {
            this.column.filteringCondition = DATE_FILTERS[value];
        }
        this.filter();
    }

    public onInputChanged(val): void {
        this.filterChanged.next(val);
    }

    @HostListener("click", ["$event"])
    public onClick(event) {
        event.stopPropagation();
    }

    protected transformValue(value) {
        if (this.dataType === DataType.Number) {
            value = parseInt(value, 10);
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
