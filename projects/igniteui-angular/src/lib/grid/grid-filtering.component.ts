import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    DoCheck,
    ElementRef,
    HostBinding,
    HostListener,
    Input,
    NgZone,
    OnDestroy,
    OnInit,
    TemplateRef,
    ViewChild
} from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { DataType } from '../data-operations/data-util';
import { IgxToggleDirective } from '../directives/toggle/toggle.directive';
import { IgxGridAPIService } from './api.service';
import { IgxColumnComponent } from './column.component';
import { autoWire, IGridBus } from './grid.common';
import { IFilteringOperation } from '../../public_api';
import { IgxButtonGroupModule, IgxButtonGroupComponent } from "../buttonGroup/buttonGroup.component";
import { IgxGridFilterExpressionComponent } from "./grid-filtering-expression.component";

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: 'igx-grid-filter',
    templateUrl: './grid-filtering.component.html'
})
export class IgxGridFilterComponent implements IGridBus, OnInit, OnDestroy, DoCheck {

    @Input()
    public column;

    // get value() {
    //     return this._value;
    // }

    // set value(val) {
    //     // filtering needs to be cleared if value is null, undefined or empty string
    //     if (!val && val !== 0) {
    //         //this.clearFiltering(false);
    //         return;
    //     }
    //     //this._value = this.transformValue(val);
    //     this.filter();
    // }

    get dataType(): DataType {
        return this.column.dataType;
    }

    // get conditions() {
    //     return this.column.filters.instance().conditionList();
    // }

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
            return 'igx-filtering__toggle--active';
        }
        if (this.filteringExpression()) {
            return 'igx-filtering__toggle--filtered';
        }
        return 'igx-filtering__toggle';
    }

    get gridID(): string {
        return this.column.gridID;
    }

    @HostBinding('class')
    get styleClasses() {
        return `igx-filtering`;
    }

    public booleanFilterAll = 'All';
    public dialogShowing = false;
    public dialogPosition = 'igx-filtering__options--to-right';

    public filteringLogicOptions: any[];
    public isSecondConditionVisible = false;

    protected UNARY_CONDITIONS = [
        'true', 'false', 'null', 'notNull', 'empty', 'notEmpty',
        'yesterday', 'today', 'thisMonth', 'lastMonth', 'nextMonth',
        'thisYear', 'lastYear', 'nextYear'
    ];
    //protected _value;
    //protected _filterCondition;
    protected filterChanged = new Subject();
    protected chunkLoaded = new Subscription();
    private MINIMUM_VIABLE_SIZE = 240;

    @ViewChild('defaultFilterUI', { read: TemplateRef })
    protected defaultFilterUI: TemplateRef<any>;

    @ViewChild('defaultDateUI', { read: TemplateRef })
    protected defaultDateUI: TemplateRef<any>;

    @ViewChild(IgxToggleDirective, { read: IgxToggleDirective})
    protected toggleDirective: IgxToggleDirective;

    @ViewChild('select', { read: ElementRef})
    protected select: ElementRef;

    constructor(private zone: NgZone, public gridAPI: IgxGridAPIService, public cdr: ChangeDetectorRef, private elementRef: ElementRef) {
        // this.filterChanged.pipe(
        //     debounceTime(250)
        // ).subscribe((value) => this.value = value);

        this.filteringLogicOptions= [
            {
                label: "And",
                togglable: true,
                color: "gray",
                ripple: "none"
            },
            {
                label: "Or",
                togglable: true,
                color: "gray",
                ripple: "none"
            }
        ];
    }

    public ngOnInit() {
        this.chunkLoaded = this.gridAPI.get(this.gridID).headerContainer.onChunkPreload.subscribe(() => {
            if (!this.toggleDirective.collapsed) {
                this.toggleDirective.collapsed = true;
                this.refresh();
            }
        });
    }

    public ngDoCheck() {
        this.cdr.markForCheck();
    }

    public ngOnDestroy() {
        this.filterChanged.unsubscribe();
        this.chunkLoaded.unsubscribe();
    }

    public refresh() {
        this.dialogShowing = !this.dialogShowing;
        if (this.dialogShowing) {
            //this.column.filteringCondition = this.getCondition(this.select.nativeElement.value);
        }
        this.cdr.detectChanges();
    }

    public isUnaryCondition(condition): boolean {
        for (const each of this.UNARY_CONDITIONS) {
            if ( condition && condition === each) {
                return true;
            }
        }
        return false;
    }

    @autoWire(true)
    public filter(): void {
        // const grid = this.gridAPI.get(this.gridID);
        // //this.column.filteringCondition = this.getCondition(this.select.nativeElement.value);
        // this.gridAPI.filter(
        //     this.column.gridID, this.column.field,
        //     this._value, this.column.filteringCondition, this.column.filteringIgnoreCase);
        // grid.onFilteringDone.emit({
        //     fieldName: this.column.field,
        //     condition: this.column.filteringCondition,
        //     ignoreCase: this.column.filteringIgnoreCase,
        //     searchVal: this._value
        // });
    }

    @autoWire(true)
    public clearFiltering(resetCondition: boolean): void {
        // this._value = null;
        // this._filterCondition = resetCondition ? undefined : this._filterCondition;
        // this.gridAPI.clear_filter(this.gridID, this.column.field);
        // this.gridAPI.get(this.gridID).clearSummaryCache();
        // // XXX - Temp fix for (#1183, #1177) (Should be deleted)
        // if (this.dataType === DataType.Date) {
        //     this.cdr.detectChanges();
        // }
    }

    @autoWire(true)
    public onSelectLogicOperator(event): void {
        this.isSecondConditionVisible = true;
    }

    @autoWire(true)
    public onUnSelectLogicOperator(event): void {
        this.isSecondConditionVisible = false;
    }

    public get disabled() {
        // if filtering is applied, reset button should be active
        if (this.gridAPI.get(this.gridID).filteringExpressions.length > 0) {
            return false;
        }
        return true;
    }

    public onMouseDown() {
        requestAnimationFrame(() => {
            const grid = this.gridAPI.get(this.gridID);
            const gridRect = grid.nativeElement.getBoundingClientRect();
            const dropdownRect = this.elementRef.nativeElement.getBoundingClientRect();

            let x = dropdownRect.left;
            let x1 = gridRect.left + gridRect.width;
            x += window.pageXOffset;
            x1 += window.pageXOffset;
            if (Math.abs(x - x1) < this.MINIMUM_VIABLE_SIZE) {
                this.dialogPosition = 'igx-filtering__options--to-left';
            }
        });
    }

    @HostListener('click', ['$event'])
    public onClick(event) {
        event.stopPropagation();
    }

    @autoWire(true)
    public onExpressionChanged(args): void {
        const grid = this.gridAPI.get(this.gridID);
        if (args.searchVal || this.isUnaryCondition(args.condition.name)) {
            this.gridAPI.filter(
                this.column.gridID, this.column.field,
            args.searchVal, args.condition, this.column.filteringIgnoreCase);
        } else {
            this.gridAPI.clear_filter(this.gridID, this.column.field);
            this.gridAPI.get(this.gridID).clearSummaryCache();
        }

        grid.onFilteringDone.emit({
            fieldName: this.column.field,
            condition: args.condition,
            ignoreCase: this.column.filteringIgnoreCase,
            searchVal: args.searchVal
        });
    }

    protected filteringExpression(): boolean {
        const expr = this.gridAPI.get(this.gridID)
            .filteringExpressions.find((x) => x.fieldName === this.column.field);

        if (expr) {

            if (!this.isUnaryCondition(expr.condition.name) && !expr.searchVal) {
                return false;
            }
            return true;
        }
    }
}
