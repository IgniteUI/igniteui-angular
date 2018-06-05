import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    DoCheck,
    ElementRef,
    EventEmitter,
    HostBinding,
    HostListener,
    Input,
    NgZone,
    OnDestroy,
    OnInit,
    Output,
    TemplateRef,
    ViewChild,
    AfterViewInit
} from "@angular/core";
import { Subject, Subscription } from "rxjs";
import { debounceTime } from "rxjs/operators";
import { DataType } from "../data-operations/data-util";
import { IgxToggleDirective } from "../directives/toggle/toggle.directive";
import { IgxGridAPIService } from "./api.service";
import { IgxColumnComponent } from "./column.component";
import { autoWire, IGridBus } from "./grid.common";
import { IgxButtonGroupModule, IgxButtonGroupComponent } from "../buttonGroup/buttonGroup.component";
import { IgxGridFilterComponent } from "./grid-filtering.component";
import { IFilteringOperation, IFilteringExpression } from '../../public_api';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: "igx-grid-filter-expression",
    templateUrl: "./grid-filtering-expression.component.html"
})
export class IgxGridFilterExpressionComponent implements IGridBus, OnInit, OnDestroy, AfterViewInit {

    @Input()
    public name;

    get column() {
        return this._column;
    }

    @Input()
    set column(val) {
        this._column = val;
        if(this.expression) {
            this.expression.fieldName = val;
        }
    }

    @Output()
    public onExpressionChanged = new EventEmitter<any>();

    @ViewChild("defaultFilterUI", { read: TemplateRef })
    protected defaultFilterUI: TemplateRef<any>;

    @ViewChild("defaultDateUI", { read: TemplateRef })
    protected defaultDateUI: TemplateRef<any>;

    @ViewChild("select", { read: ElementRef})
    protected select: ElementRef;

    @ViewChild("input", { read: ElementRef})
    protected input: ElementRef;

    private _column: any;
    public expression: IFilteringExpression;
    protected conditionChanged = new Subject();
    protected unaryConditionChanged = new Subject();

    constructor(private zone: NgZone, public gridAPI: IgxGridAPIService, public cdr: ChangeDetectorRef, private elementRef: ElementRef, private filterComponent: IgxGridFilterComponent) {
         // when condition is unary
        //this.unaryConditionChanged.subscribe((value) => this.filter());
        this.unaryConditionChanged.subscribe((value) => this.onExpressionChanged.emit(this.expression));//TODO
        // when condition is NOT unary
        //this.conditionChanged.subscribe((value) => { if (!!this._value || this._value === 0) { this.filter(); }});
        this.conditionChanged.subscribe((value) => { if (!!this.expression.searchVal || this.expression.searchVal === 0) { this.onExpressionChanged.emit(this.expression); }});//TODO

    }

    public ngOnInit() {
        this.expression = { 
            fieldName: this.column,
            condition: null,
            searchVal: null,
            ignoreCase: null
        }
    }

    public ngAfterViewInit() {
        this.expression.condition = this.getCondition(this.select.nativeElement.value);
    }

    public ngOnDestroy() {
        this.conditionChanged.unsubscribe();
        this.unaryConditionChanged.unsubscribe();
    }

    protected UNARY_CONDITIONS = [
        "true", "false", "null", "notNull", "empty", "notEmpty",
        "yesterday", "today", "thisMonth", "lastMonth", "nextMonth",
        "thisYear", "lastYear", "nextYear"
    ];

    get template() {
        switch (this.filterComponent.dataType) {
            case DataType.String:
            case DataType.Number:
                return this.defaultFilterUI;
            case DataType.Date:
                return this.defaultDateUI;
            case DataType.Boolean:
                return null;
        }
    }    

    public isActive(value): boolean {
        if(this.expression && this.expression.condition === value) {
            return true;
        }
        else {
            return false;
        } 
    }

    get gridID(): string {
        return this.filterComponent.column.gridID;
    }

    get unaryCondition(): boolean {
        for (const each of this.UNARY_CONDITIONS) {
            if (this.expression && this.expression.condition && this.expression.condition.name === each) {
                return true;
            }
        }
        return false;
    }

    get conditions() {
        return this.filterComponent.column.filters.instance().conditionList();
    }

    protected getCondition(value: string): IFilteringOperation {
        return this.filterComponent.column.filters.instance().condition(value);
    }

    protected transformValue(value) {
        if (this.filterComponent.dataType === DataType.Number) {
            value = parseFloat(value);
        } else if (this.filterComponent.dataType === DataType.Boolean) {
            value = Boolean(value);
        }

        return value;
    }

    public selectionChanged(value): void {
        this.expression.condition = this.getCondition(value);
        if (this.unaryCondition) {
            this.unaryConditionChanged.next(value);
        } else {
            this.conditionChanged.next(value);
        }
        this.onExpressionChanged.emit(this.expression);
    }


    public onInputChanged(val): void {
        if (!val && val !== 0) {
            this.expression.searchVal = val;
            this.onExpressionChanged.emit(this.expression);
            return;
        }
        this.expression.searchVal = this.transformValue(val);
        this.onExpressionChanged.emit(this.expression);
    }

    public clearInput(): void {
        this.input.nativeElement.value = null;
        this.expression.searchVal = null;
        // XXX - Temp fix for (#1183, #1177) (Should be deleted)
        if (this.filterComponent.dataType === DataType.Date) {
            this.cdr.detectChanges();
        }
        this.onExpressionChanged.emit(this.expression);
    }

    // XXX - Temp fix for (#1183, #1177) (Should be deleted)
    onDatePickerClick() {
        this.zone.run(() => {});
    }


}