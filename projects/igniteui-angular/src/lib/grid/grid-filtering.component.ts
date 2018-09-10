import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    DoCheck,
    ElementRef,
    HostBinding,
    HostListener,
    Input,
    OnDestroy,
    OnInit,
    QueryList,
    ViewChild,
    ViewChildren
} from '@angular/core';
import { Subscription } from 'rxjs';
import { DataType } from '../data-operations/data-util';
import { IgxToggleDirective, IgxOverlayOutletDirective } from '../directives/toggle/toggle.directive';
import { IgxGridAPIService } from './api.service';
import { FilteringExpressionsTree } from '../data-operations/filtering-expressions-tree';
import { IgxButtonGroupComponent } from '../buttonGroup/buttonGroup.component';
import { IgxGridFilterExpressionComponent } from './grid-filtering-expression.component';
import { FilteringLogic, IFilteringExpression } from '../data-operations/filtering-expression.interface';
import { OverlaySettings, HorizontalAlignment } from '../services/overlay/utilities';
import { ConnectedPositioningStrategy } from '../services/overlay/position/connected-positioning-strategy';

/**
 *@hidden
 */
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
        if (this.isDialogVisible) {
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

    public filteringLogicOptions: any[];
    public isSecondConditionVisible = false;
    protected chunkLoaded = new Subscription();
    protected columnMoving = new Subscription();
    private isDialogVisible = false;
    private MINIMUM_VIABLE_SIZE = 240;
    private _secondExpressionCache = null;
    private _overlaySettings: OverlaySettings = {
        positionStrategy: new ConnectedPositioningStrategy(),
        modal: false,
        closeOnOutsideClick: true
    };

    @ViewChild(IgxToggleDirective, { read: IgxToggleDirective })
    protected toggleDirective: IgxToggleDirective;

    @ViewChildren(IgxGridFilterExpressionComponent, { read: IgxGridFilterExpressionComponent })
    protected expressionComponents: QueryList<IgxGridFilterExpressionComponent>;

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
        const collapse = () => {
            if (!this.toggleDirective.collapsed) {
                this.toggleDirective.close();
            }
        };

        this.chunkLoaded = this.gridAPI.get(this.gridID).headerContainer.onChunkPreload.subscribe(() => {
            collapse();
        });

        this.columnMoving = this.gridAPI.get(this.gridID).onColumnMoving.subscribe(() => {
            collapse();
        });
    }

    public ngDoCheck() {
        this.cdr.markForCheck();
    }

    public ngOnDestroy() {
        this.chunkLoaded.unsubscribe();
        this.columnMoving.unsubscribe();
    }

    public openDialog() {
        const expr = this.gridAPI.get(this.gridID).filteringExpressionsTree.find(this.column.field);
        if (expr && expr instanceof FilteringExpressionsTree) {
            const firstExprComponent = this.expressionComponents.first;
            const firstFilteringOperand = expr.filteringOperands[0] as IFilteringExpression;
            firstExprComponent.expression.searchVal = firstFilteringOperand.searchVal;
            firstExprComponent.expression.condition = firstFilteringOperand.condition;
            const secondExprComponent = this.expressionComponents.length > 1 ? this.expressionComponents.last : null;
            if (expr.filteringOperands.length > 1) {
                this.isSecondConditionVisible = true;
                if (secondExprComponent) {
                    const secondFilteringOperand = expr.filteringOperands[1] as IFilteringExpression;
                    secondExprComponent.expression.searchVal = secondFilteringOperand.searchVal;
                    secondExprComponent.expression.condition = secondFilteringOperand.condition;
                }
                this.logicOperators.selectedIndexes = [];
                this.logicOperators.selectButton(expr.operator);
            } else if (secondExprComponent) {
                this.isSecondConditionVisible = false;
                secondExprComponent.expression.searchVal = null;
                secondExprComponent.expression.condition = secondExprComponent.getCondition(secondExprComponent.conditions[0]);
            }
        } else {
            this.isSecondConditionVisible = false;
            if (this.logicOperators.selectedIndexes.length > 0) {
                this.logicOperators.deselectButton(this.logicOperators.selectedIndexes[0]);
            }
            this.expressionComponents.forEach(el => {
                el.expression.searchVal = null;
                el.expression.condition = el.getCondition(el.conditions[0]);
            });
        }

        this.expressionComponents.forEach(el => el.cdr.markForCheck());
        this.cdr.detectChanges();

        this.isDialogVisible = true;
    }

    public closeDialog() {
        this.isDialogVisible = false;
        this._secondExpressionCache = null;
    }

    public clearFiltering(): void {
        this.expressionComponents.forEach(el => {
            el.clearFiltering(true);
            el.cdr.markForCheck();
        });

        const grid = this.gridAPI.get(this.gridID);
        grid.clearFilter(this.column.field);

        const expr = grid.filteringExpressionsTree.find(this.column.field);
        grid.onFilteringDone.emit(expr as FilteringExpressionsTree);
    }

    public onSelectLogicOperator(event): void {
        if (!this.isDialogVisible) {
            return;
        }

        this.isSecondConditionVisible = true;
        const grid = this.gridAPI.get(this.gridID);
        const expr = grid.filteringExpressionsTree.find(this.column.field) as FilteringExpressionsTree;

        if (expr) {
            if (this.logicOperators.selectedIndexes.length > 1) {
                expr.operator = this.logicOperators.selectedIndexes[1];
            } else {
                expr.operator = this.logicOperators.selectedIndexes[0];
                if (this._secondExpressionCache && this._secondExpressionCache.condition) {
                    expr.filteringOperands.push(this._secondExpressionCache);
                }
            }

            if (!this._secondExpressionCache && this.column.dataType === DataType.Boolean && expr.filteringOperands.length < 2) {
                expr.filteringOperands.push({
                    fieldName: this.column.field,
                    condition: this.expressionComponents.first.getCondition(this.expressionComponents.first.conditions[0]),
                    searchVal: null,
                    ignoreCase: this.column.filteringIgnoreCase
                });
            }

            if (expr.filteringOperands.length >= 2) {
                grid.filter(this.column.field, null, expr, this.column.filteringIgnoreCase);
                grid.onFilteringDone.emit(expr);
            }
        }

        requestAnimationFrame(() => {
            this.cdr.detectChanges();
        });
    }

    public onUnSelectLogicOperator(event): void {
        if (!this.isDialogVisible) {
            return;
        }

        if (this.logicOperators.selectedIndexes.length === 0) {
            this.isSecondConditionVisible = false;
            if (this.expressionComponents.last.expression.searchVal || this.expressionComponents.last.isUnaryCondition()) {
                this._secondExpressionCache = this._createNewExpression(this.expressionComponents.last.expression);
            } else {
                this._secondExpressionCache = null;
            }
            this.expressionComponents.last.clearFiltering(true);
            this._filter();

            const grid = this.gridAPI.get(this.gridID);
            const expr = grid.filteringExpressionsTree.find(this.column.field);
            grid.onFilteringDone.emit(expr as FilteringExpressionsTree);
        }
    }

    public get disabled() {
        return !this.isFilteringApplied();
    }

    public onIconClick(eventArgs): void {
        requestAnimationFrame(() => {
            const grid = this.gridAPI.get(this.gridID);
            const gridRect = grid.nativeElement.getBoundingClientRect();
            const dropdownRect = this.elementRef.nativeElement.getBoundingClientRect();

            let x = dropdownRect.left;
            let x1 = gridRect.left + gridRect.width;
            x += window.pageXOffset;
            x1 += window.pageXOffset;
            if (Math.abs(x - x1) < this.MINIMUM_VIABLE_SIZE) {
                this._overlaySettings.positionStrategy.settings.horizontalDirection = HorizontalAlignment.Left;
                this._overlaySettings.positionStrategy.settings.horizontalStartPoint = HorizontalAlignment.Right;
            } else {
                this._overlaySettings.positionStrategy.settings.horizontalDirection = HorizontalAlignment.Right;
                this._overlaySettings.positionStrategy.settings.horizontalStartPoint = HorizontalAlignment.Left;
            }
            this._overlaySettings.positionStrategy.settings.target = eventArgs.target;
            this._overlaySettings.outlet = grid.outletDirective;
            this.toggleDirective.toggle(this._overlaySettings);
        });
    }

    @HostListener('click', ['$event'])
    public onClick(event) {
        event.stopPropagation();
    }

    public onExpressionChanged(): void {
        const grid = this.gridAPI.get(this.gridID);
        this._filter();
        const expr = grid.filteringExpressionsTree.find(this.column.field);
        grid.onFilteringDone.emit(expr as FilteringExpressionsTree);
    }

    public focusFirstInput(): void {
        if (this.isDialogVisible) {
            this.expressionComponents.first.focusInput();
        }
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

    private _filter(): void {
        const grid = this.gridAPI.get(this.gridID);
        let expr = grid.filteringExpressionsTree.find(this.column.field) as FilteringExpressionsTree;

        if (!expr) {
            expr = new FilteringExpressionsTree(FilteringLogic.And, this.column.field);
        } else {
            expr.filteringOperands = [];
        }

        this.expressionComponents.forEach(el => {
            if (el.expression.searchVal || el.expression.searchVal === 0 || el.isUnaryCondition()) {
                const newExpression = this._createNewExpression(el.expression);
                expr.filteringOperands.push(newExpression);
            }
        });

        if (this.logicOperators.selectedIndexes.length !== 0) {
            expr.operator = this.logicOperators.selectedIndexes[0];
        }

        const operandsLength = expr.filteringOperands.length;
        if (operandsLength === 0 ||
            operandsLength === expr.filteringOperands.filter(e => (e as IFilteringExpression).condition.name === 'all').length) {
            grid.clearFilter(this.column.field);
        } else {
            grid.filter(this.column.field, null, expr, this.column.filteringIgnoreCase);
        }
    }
}
