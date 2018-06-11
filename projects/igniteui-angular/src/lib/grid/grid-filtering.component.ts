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
import { IFilteringOperation, FilteringExpressionsTree } from '../../public_api';
import { IgxButtonGroupModule, IgxButtonGroupComponent } from "../buttonGroup/buttonGroup.component";
import { IgxGridFilterExpressionComponent } from "./grid-filtering-expression.component";
import { FilteringLogic, IFilteringExpression } from '../data-operations/filtering-expression.interface';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: 'igx-grid-filter',
    templateUrl: './grid-filtering.component.html'
})
export class IgxGridFilterComponent implements IGridBus, OnInit, OnDestroy, DoCheck {

    @Input()
    public column;

    get dataType(): DataType {
        return this.column.dataType;
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
            return 'igx-filtering__toggle--active';
        }
        if (this.isFilteringApplied()) {
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

    public dialogShowing = false;
    public dialogPosition = 'igx-filtering__options--to-right';

    public filteringLogicOptions: any[];
    public isSecondConditionVisible = false;

    protected UNARY_CONDITIONS = [
        'true', 'false', 'null', 'notNull', 'empty', 'notEmpty',
        'yesterday', 'today', 'thisMonth', 'lastMonth', 'nextMonth',
        'thisYear', 'lastYear', 'nextYear'
    ];
    
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

    @ViewChild('firstExpr', { read: IgxGridFilterExpressionComponent})
    protected firstExpr: IgxGridFilterExpressionComponent;

    @ViewChild('secondExpr', { read: IgxGridFilterExpressionComponent})
    protected secondExpr: IgxGridFilterExpressionComponent;

    @ViewChild('logicOperators', { read: IgxButtonGroupComponent})
    protected logicOperators: IgxButtonGroupComponent;

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
    public clearFiltering(): void {
        this.firstExpr.clearFiltering(true);
        if (this.secondExpr) {
            this.secondExpr.clearFiltering(true);
        }

        const grid = this.gridAPI.get(this.gridID);

        //this.gridAPI.clear_filter(this.gridID, this.column.field);
        //this.gridAPI.get(this.gridID).clearSummaryCache();
        grid.clearFilter(this.column.field);

        grid.onFilteringDone.emit(this.column.filteringExpressionsTree);
    }

    @autoWire(true)
    public onSelectLogicOperator(event): void {
        this.isSecondConditionVisible = true;
        if(this.column.filteringExpressionsTree) {
            //this.filter();
        }
    }

    @autoWire(true)
    public onUnSelectLogicOperator(event): void {
        if(this.logicOperators.selectedIndexes.length === 0){ 
            this.isSecondConditionVisible = false;
        }
    }

    public get disabled() {
        // if filtering is applied, reset button should be active
        const grid = this.gridAPI.get(this.gridID);

        return !(grid.filteringExpressionsTree && grid.filteringExpressionsTree.filteringOperands && 
                 grid.filteringExpressionsTree.filteringOperands.length > 0);
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
            this.filter(args)
        } else if (!this.secondExpr){
            grid.clearFilter(this.column.field);
        } else {
            
        }

        grid.onFilteringDone.emit(this.column.filteringExpressionsTree);
    }

    protected isFilteringApplied(): boolean {
        const expr = this.gridAPI.get(this.gridID)
            .filteringExpressionsTree.find(this.column.field);

        if (expr) {
            if (expr instanceof FilteringExpressionsTree) {
                return expr.filteringOperands.length > 0;
            }

            return true;
        }

        return false;
    }

    private filter(expression: any) {
        if(!this.column.filteringExpressionsTree) {
            this.column.filteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And);
            this.column.filteringExpressionsTree.filteringOperands.push(this.firstExpr.expression);
        } else {
            this.column.filteringExpressionsTree.filteringOperands = [];
            this.column.filteringExpressionsTree.filteringOperands.push(this.firstExpr.expression);
            if(this.secondExpr && this.secondExpr.expression.searchVal) {
                this.column.filteringExpressionsTree.filteringOperands.push(this.secondExpr.expression);
                if (this.logicOperators.selectedIndexes[0] === 0) {
                    this.column.filteringExpressionsTree.operator = FilteringLogic.And;
                } else {
                    this.column.filteringExpressionsTree.operator = FilteringLogic.Or;
                }
            }
        }
        this.gridAPI.filter(
            this.column.gridID, this.column.field,
            expression.searchVal, this.column.filteringExpressionsTree, this.column.filteringIgnoreCase);
    }
}
