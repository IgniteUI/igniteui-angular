import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    HostBinding,
    HostListener,
    Input,
    OnDestroy,
    TemplateRef,
    ViewChild
} from "@angular/core";
import { debounceTime, distinctUntilChanged } from "rxjs/operators";
import { Subject } from "rxjs/Subject";
import { DataType } from "../data-operations/data-util";
import {
    BOOLEAN_FILTERS,
    DATE_FILTERS,
    NUMBER_FILTERS,
    STRING_FILTERS
} from "../data-operations/filtering-condition";
import { IgxGridAPIService } from "./api.service";
import { IgxColumnComponent } from "./column.component";

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: "igx-grid-filter",
    styleUrls: ["./grid-filtering.component.scss"],
    templateUrl: "./grid-filtering.component.html"
})
export class IgxGridFilterComponent implements OnDestroy {

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

    get gridID() {
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

    @ViewChild("defaultFilterUI", { read: TemplateRef })
    protected defaultFilterUI: TemplateRef<any>;

    @ViewChild("defaultDateUI", { read: TemplateRef })
    protected defaultDateUI: TemplateRef<any>;

    constructor(private gridAPI: IgxGridAPIService, private cdr: ChangeDetectorRef) {
        this.filterChanged.pipe(
            debounceTime(250),
            distinctUntilChanged()
        ).subscribe((value) => this.value = value);
    }

    public ngOnDestroy() {
        this.filterChanged.unsubscribe();
    }

    public isActive(value) {
        return this._filterCondition === value;
    }

    get unaryCondition() {
        for (const each of this.UNARY_CONDITIONS) {
            if (this._filterCondition && this._filterCondition === each) {
                return true;
            }
        }
        return false;
    }

    public filter() {
        this.gridAPI.filter(
            this.column.gridID, this.column.field,
            this._value, this.column.filteringCondition, this.column.filteringIgnoreCase);
        this.cdr.markForCheck();
    }

    public clearFiltering() {
        this._value = null;
        this._filterCondition = undefined;
        this.gridAPI.clear_filter(this.gridID, this.column.field);
        this.cdr.markForCheck();
    }

    public conditionChanged(value) {

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

    public onInputChanged(val) {
        this.filterChanged.next(val);
    }

    public toggle() {
        this.dialogShowing = !this.dialogShowing;

        if (this.dialogShowing) {
            const expr = this.gridAPI.get(this.gridID)
                .filteringExpressions.find((x) => x.fieldName === this.column.field);
            if (expr) {
                this._value = expr.searchVal;
                this._filterCondition = expr.condition.name;
            }
        }
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
}
