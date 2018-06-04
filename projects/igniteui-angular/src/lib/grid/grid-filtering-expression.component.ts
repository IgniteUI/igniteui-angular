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
    ViewChild
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
import { IFilteringOperation } from '../../public_api';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: "igx-grid-filter-expression",
    templateUrl: "./grid-filtering-expression.component.html"
})
export class IgxGridFilterExpressionComponent implements IGridBus, OnInit, OnDestroy {

    @Input()
    public column;

    @Input()
    public name;

    get value() {
        return this._value;
    }

    @Input()
    set value(val) {
        // filtering needs to be cleared if value is null, undefined or empty string
        if (!val && val !== 0) {
            //this.clearFiltering(false);
            //TODO
            return;
        }
        this._value = this.transformValue(val);
        //this.filter();
        this.onFilterChanged.emit();
        //TODO
    }
    
    // @Output()
    // public onClearInput = new EventEmitter<IgxGridFilterExpressionComponent>();

    @Output()
    public onFilterChanged = new EventEmitter<any>();

    @ViewChild("defaultFilterUI", { read: TemplateRef })
    protected defaultFilterUI: TemplateRef<any>;

    @ViewChild("defaultDateUI", { read: TemplateRef })
    protected defaultDateUI: TemplateRef<any>;

    @ViewChild(IgxToggleDirective, { read: IgxToggleDirective})
    protected toggleDirective: IgxToggleDirective;

    @ViewChild("select", { read: ElementRef})
    protected select: ElementRef;

    @ViewChild("logicOperators", {read: IgxButtonGroupComponent})
    protected logicOperators: IgxButtonGroupComponent;

    //public unaryCondition: boolean
    private _value: any;
    public filterCondition;
    protected conditionChanged = new Subject();
    protected unaryConditionChanged = new Subject();

    constructor(private zone: NgZone, public gridAPI: IgxGridAPIService, public cdr: ChangeDetectorRef, private elementRef: ElementRef, private filterComponent: IgxGridFilterComponent) {
         // when condition is unary
        //this.unaryConditionChanged.subscribe((value) => this.filter());
        this.unaryConditionChanged.subscribe((value) => this.onFilterChanged.emit());//TODO
        // when condition is NOT unary
        //this.conditionChanged.subscribe((value) => { if (!!this._value || this._value === 0) { this.filter(); }});
        this.conditionChanged.subscribe((value) => { if (!!this._value || this._value === 0) { this.onFilterChanged.emit(); }});//TODO
         
    }

    public ngOnInit() {
    }

    public ngOnDestroy() {
        //this.filterChanged.unsubscribe();
        this.conditionChanged.unsubscribe();
        this.unaryConditionChanged.unsubscribe();
        //this.chunkLoaded.unsubscribe();
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
        return this.filterCondition === value;
    }

    get gridID(): string {
        return this.column.gridID;
    }

    get unaryCondition(): boolean {
        for (const each of this.UNARY_CONDITIONS) {
            if (this.filterCondition && this.filterCondition === each) {
                return true;
            }
        }
        return false;
    }

    get conditions() {
        return this.column.filters.instance().conditionList();
    }

    protected getCondition(value: string): IFilteringOperation {
        return this.column.filters.instance().condition(value);
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
        //this.onSelectionChanged.emit(value);
        this.filterCondition = value;
        this.column.filteringCondition = this.getCondition(value);
        if (this.unaryCondition) {
            this.unaryConditionChanged.next(value);
        } else {
            this.conditionChanged.next(value);
        }
    }


    public onInputChanged(val): void {
        //this.filterChanged.next(val);
        this.onFilterChanged.emit(val);
        //TODO
    }

    public clearInput(): void {
        //this.clearFiltering(false);
        //TODO
        this.onFilterChanged.emit();
    }

    // XXX - Temp fix for (#1183, #1177) (Should be deleted)
    onDatePickerClick() {
        this.zone.run(() => {});
    }
}