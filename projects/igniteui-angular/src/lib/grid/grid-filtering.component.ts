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
    QueryList,
    TemplateRef,
    ViewChild,
    ViewChildren
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

    @ViewChild(IgxToggleDirective, { read: IgxToggleDirective})
    protected toggleDirective: IgxToggleDirective;

    @ViewChildren(IgxGridFilterExpressionComponent, { read: IgxGridFilterExpressionComponent })
    public expressionsList: QueryList<IgxGridFilterExpressionComponent>;

    @ViewChild('logicOperators', { read: IgxButtonGroupComponent})
    protected logicOperators: IgxButtonGroupComponent;

    constructor(private zone: NgZone, public gridAPI: IgxGridAPIService, public cdr: ChangeDetectorRef, private elementRef: ElementRef) {

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
            //this.column.filteringExpressionsTree = this.getCondition(this.select.nativeElement.value);
        }
        this.cdr.detectChanges();
    }

    public isUnaryCondition(expression: IFilteringExpression): boolean {
        for (const each of this.UNARY_CONDITIONS) {
            if (expression.condition && expression.condition.name === each) {
                return true;
            }
        }
        return false;
    }    

    @autoWire(true)
    public clearFiltering(): void {
        this.expressionsList.toArray()[0].clearFiltering(true);
        if (this.expressionsList.toArray()[1]) {
            this.expressionsList.toArray()[1].clearFiltering(true);
        }

        const grid = this.gridAPI.get(this.gridID);
        grid.clearFilter(this.column.field);

        grid.onFilteringDone.emit(this.column.filteringExpressionsTree);
    }

    @autoWire(true)
    public onSelectLogicOperator(event): void {
        this.isSecondConditionVisible = true;
        if(this.column.filteringExpressionsTree) {
            if (this.logicOperators.selectedIndexes.length !== 0) {
                this.column.filteringExpressionsTree.operator = this.logicOperators.selectedIndexes[1];
            }

            if(this.column.filteringExpressionsTree.filteringOperands.length >=2) {
                const grid = this.gridAPI.get(this.gridID);
                grid.filter(this.column.field, null, this.column.filteringExpressionsTree,
                    this.column.filteringIgnoreCase);
            }
        }
    }

    @autoWire(true)
    public onUnSelectLogicOperator(event): void {
        if(this.logicOperators.selectedIndexes.length === 0) {
            this.isSecondConditionVisible = false;
            this.expressionsList.toArray()[1].clearFiltering(false);
            this._filter(this.expressionsList.toArray()[0]);
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
    public onExpressionChanged(filterExpression: IgxGridFilterExpressionComponent): void {
        const grid = this.gridAPI.get(this.gridID);
        this._filter(filterExpression)
        grid.onFilteringDone.emit(this.column.filteringExpressionsTree);
    }

    protected isFilteringApplied(): boolean {
        const expr = this.gridAPI.get(this.gridID).filteringExpressionsTree.find(this.column.field);

        if (expr) {
            if (expr instanceof FilteringExpressionsTree) {
                return expr.filteringOperands.length > 0;
            }
            return true;
        }
        return false;
    }

    private _filter(filterExpression: IgxGridFilterExpressionComponent) {
        if(!this.column.filteringExpressionsTree) {
            this.column.filteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And, this.column.field);
            this.column.filteringExpressionsTree.filteringOperands.push(filterExpression.expression);
        } else {
            this.column.filteringExpressionsTree.filteringOperands = [];

            if(this.expressionsList.toArray()[0].expression.searchVal || this.isUnaryCondition(this.expressionsList.toArray()[0].expression)) {
                this.column.filteringExpressionsTree.filteringOperands.push(this.expressionsList.toArray()[0].expression);
            }

            if(this.isSecondConditionVisible && this.expressionsList.toArray()[1] && (this.expressionsList.toArray()[1].expression.searchVal || this.isUnaryCondition(this.expressionsList.toArray()[1].expression))) {
                this.column.filteringExpressionsTree.filteringOperands.push(this.expressionsList.toArray()[1].expression);
            }

            if (this.logicOperators.selectedIndexes.length !== 0) {
                this.column.filteringExpressionsTree.operator = this.logicOperators.selectedIndexes[0];
            }
        }

        const grid = this.gridAPI.get(this.gridID);

        if(this.column.filteringExpressionsTree.filteringOperands.length === 0) {
            grid.clearFilter(this.column.field);
        } else {
            grid.filter(this.column.field, null, this.column.filteringExpressionsTree, this.column.filteringIgnoreCase);
        }
    }
}
