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
    ViewChild,
    ViewChildren
} from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { DataType } from '../data-operations/data-util';
import { IgxToggleDirective } from '../directives/toggle/toggle.directive';
import { IgxGridAPIService } from './api.service';
import { IgxColumnComponent } from './column.component';
import { FilteringExpressionsTree } from '../data-operations/filtering-expressions-tree';
import { IgxButtonGroupComponent } from '../buttonGroup/buttonGroup.component';
import { IgxGridFilterExpressionComponent } from './grid-filtering-expression.component';
import { FilteringLogic, IFilteringExpression } from '../data-operations/filtering-expression.interface';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: 'igx-grid-filter',
    templateUrl: './grid-filtering.component.html'
})
export class IgxGridFilterComponent implements OnInit, OnDestroy, DoCheck {

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
    protected chunkLoaded = new Subscription();
    private MINIMUM_VIABLE_SIZE = 240;
    private _secondExpression = null;

    @ViewChild(IgxToggleDirective, { read: IgxToggleDirective })
    protected toggleDirective: IgxToggleDirective;

    @ViewChildren(IgxGridFilterExpressionComponent, { read: IgxGridFilterExpressionComponent })
    protected expressionsList: QueryList<IgxGridFilterExpressionComponent>;

    @ViewChild('logicOperators', { read: IgxButtonGroupComponent })
    protected logicOperators: IgxButtonGroupComponent;

    constructor(public gridAPI: IgxGridAPIService, public cdr: ChangeDetectorRef, private elementRef: ElementRef) {

        this.filteringLogicOptions = [
            {
                label: 'And',
                togglable: true,
                ripple: 'none'
            },
            {
                label: 'Or',
                togglable: true,
                ripple: 'none'
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
        this.chunkLoaded.unsubscribe();
    }

    public refresh() {
        this.dialogShowing = !this.dialogShowing;
        if (this.dialogShowing) {
            this.expressionsList.toArray()[0].focusInput();

            const expr = this.gridAPI.get(this.gridID).filteringExpressionsTree.find(this.column.field);

            if (expr) {
                if (expr instanceof FilteringExpressionsTree) {
                    this.expressionsList.toArray()[0].value = (expr.filteringOperands[0] as IFilteringExpression).searchVal;
                    this.expressionsList.toArray()[0].expression.condition = (expr.filteringOperands[0] as IFilteringExpression).condition;
                    if (expr.filteringOperands.length > 1) {
                        this.isSecondConditionVisible = true;
                        this.logicOperators.selectedIndexes = [];
                        this.logicOperators.selectButton(expr.operator);
                    } else if (this.expressionsList.toArray()[1]) {
                        this.expressionsList.toArray()[1].value = null;
                        this.expressionsList.toArray()[1].expression.condition = undefined;
                    }
                }
            } else {
                this.expressionsList.forEach(el => {
                    el.value = null;
                    el.expression.condition = undefined;
                });
            }
        }
        this._secondExpression = null;
        this.expressionsList.forEach(el => el.cdr.markForCheck());
        this.cdr.detectChanges();
    }

    public clearFiltering(): void {
        this.expressionsList.forEach(el => {
            el.clearFiltering(true);
            el.cdr.markForCheck();
        });

        const grid = this.gridAPI.get(this.gridID);
        grid.clearFilter(this.column.field);

        const expr = grid.filteringExpressionsTree.find(this.column.field);
        grid.onFilteringDone.emit(expr as FilteringExpressionsTree);
    }

     public onSelectLogicOperator(event): void {
        this.isSecondConditionVisible = true;
        const grid = this.gridAPI.get(this.gridID);
        const expr = grid.filteringExpressionsTree.find(this.column.field);
        if (expr) {
            if (this.logicOperators.selectedIndexes.length > 1) {
                (expr as FilteringExpressionsTree).operator = this.logicOperators.selectedIndexes[1];
            } else {
                (expr as FilteringExpressionsTree).operator = this.logicOperators.selectedIndexes[0];
                if (this._secondExpression) {
                    (expr as FilteringExpressionsTree).filteringOperands.push(this._secondExpression);
                }
            }
            if ((expr as FilteringExpressionsTree).filteringOperands.length >= 2) {
                grid.filter(this.column.field, null, (expr as FilteringExpressionsTree), this.column.filteringIgnoreCase);
                grid.onFilteringDone.emit(expr as FilteringExpressionsTree);
            }
        }
    }

    public onUnSelectLogicOperator(event): void {
        if (this.logicOperators.selectedIndexes.length === 0) {
            this.isSecondConditionVisible = false;
            this._secondExpression = this._createNewExpression(this.expressionsList.toArray()[1].expression);
            this.expressionsList.toArray()[1].clearFiltering(true);
            this._filter(this.expressionsList.toArray()[0].expression);

            const grid = this.gridAPI.get(this.gridID);
            const expr = grid.filteringExpressionsTree.find(this.column.field);
            grid.onFilteringDone.emit(expr as FilteringExpressionsTree);
        }
    }

    public get disabled() {
        return !this.isFilteringApplied();
    }

    public onMouseDown(): void {
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

    public onExpressionChanged(expression: IFilteringExpression): void {
        const grid = this.gridAPI.get(this.gridID);
        const newExpression = this._createNewExpression(expression);
        this._filter(newExpression);
        const expr = grid.filteringExpressionsTree.find(this.column.field);
        grid.onFilteringDone.emit(expr as FilteringExpressionsTree);
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

    private _createNewExpression(expression: IFilteringExpression): IFilteringExpression {
        return {
            fieldName: expression.fieldName,
            condition: expression.condition,
            searchVal: expression.searchVal,
            ignoreCase: expression.ignoreCase
        };
    }

    private _filter(expression: IFilteringExpression): void {
        const editableCell = this.gridAPI.get_cell_inEditMode(this.gridID);
        if (editableCell) {
            this.gridAPI.escape_editMode(this.gridID, editableCell.cellID);
        }
        const grid = this.gridAPI.get(this.gridID);
        let expr = grid.filteringExpressionsTree.find(this.column.field);
        if (!expr) {
            expr = new FilteringExpressionsTree(FilteringLogic.And, this.column.field);
            if (expression.searchVal || expression.searchVal === 0 || this.expressionsList.toArray()[0].isUnaryCondition()) {
                expr.filteringOperands.push(expression);
            }
        } else {
            (expr as FilteringExpressionsTree).filteringOperands = [];

            this.expressionsList.forEach(el => {
                if (el.expression.searchVal || el.isUnaryCondition()) {
                    const newExpression = this._createNewExpression(el.expression);
                    (expr as FilteringExpressionsTree).filteringOperands.push(newExpression);
                }
            });

            if (this.logicOperators.selectedIndexes.length !== 0) {
                (expr as FilteringExpressionsTree).operator = this.logicOperators.selectedIndexes[0];
            }
        }

        if ((expr as FilteringExpressionsTree).filteringOperands.length === 0) {
            grid.clearFilter(this.column.field);
        } else {
            grid.filter(this.column.field, null, expr as FilteringExpressionsTree, this.column.filteringIgnoreCase);
        }
    }
}
