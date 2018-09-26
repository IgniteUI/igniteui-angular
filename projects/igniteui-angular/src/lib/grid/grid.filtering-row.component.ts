import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Input,
    NgZone,
    OnInit,
    Pipe,
    PipeTransform,
    TemplateRef,
    ViewChild,
    OnDestroy,
    ViewChildren,
    QueryList,
    HostListener
} from '@angular/core';
import { Subject } from 'rxjs';
import { DataType } from '../data-operations/data-util';
import { IgxGridAPIService } from './api.service';
import { IgxColumnComponent } from './column.component';
import { IgxDropDownComponent } from '../drop-down/drop-down.component';
import { IFilteringOperation } from '../data-operations/filtering-condition';
import { FilteringLogic, IFilteringExpression } from '../data-operations/filtering-expression.interface';
import { OverlaySettings, HorizontalAlignment, VerticalAlignment } from '../services/overlay/utilities';
import { ConnectedPositioningStrategy } from '../services/overlay/position/connected-positioning-strategy';
import { FilteringExpressionsTree } from '../data-operations/filtering-expressions-tree';
import { IChipsAreaSelectEventArgs, IChipSelectEventArgs, IBaseChipEventArgs, IgxChipsAreaComponent } from '../chips';
import { ExpressionUI } from './grid.filtering-cell.component';
import { IgxDropDownItemComponent } from '../drop-down/drop-down-item.component';

/**
 * @hidden
 */
@Component({
    preserveWhitespaces: false,
    selector: 'igx-grid-filtering-row',
    templateUrl: './grid.filtering-row.component.html'
})
export class IgxGridFilteringRowComponent implements OnInit, AfterViewInit, OnDestroy {

    @Input()
    public column: IgxColumnComponent;

    @Input()
    public gridID: string;

    @Input()
    get value() {
        return this.expression ? this.expression.searchVal : null;
    }
    set value(val) {
        if (!val && val !== 0) {
            this.expression.searchVal = null;
        } else {
            this.expression.searchVal = this.transformValue(val);
            if (this.chipsArea.chipsList.filter(chip => chip.selected).length === 0) {
                this._addExpression(true);
            }
            this.filter();
        }
    }

    @ViewChild('defaultFilterUI', { read: TemplateRef })
    protected defaultFilterUI: TemplateRef<any>;

    @ViewChild('defaultDateUI', { read: TemplateRef })
    protected defaultDateUI: TemplateRef<any>;

    @ViewChild('operands', { read: IgxDropDownComponent}) 
    protected igxDropDown: IgxDropDownComponent;

    @ViewChild("chipsArea", { read: IgxChipsAreaComponent })
    public chipsArea: IgxChipsAreaComponent;

    @ViewChildren('operators', { read: IgxDropDownComponent}) 
    protected dropDownList: QueryList<IgxDropDownComponent>;

    private _positionSettings = {
        horizontalStartPoint: HorizontalAlignment.Left,
        verticalStartPoint: VerticalAlignment.Bottom
    };

    private _overlaySettings = {
      closeOnOutsideClick: true,
      modal: false,
      positionStrategy: new ConnectedPositioningStrategy(this._positionSettings)
    };

    public expression: IFilteringExpression;
    @Input()
    public expressionsList: Array<ExpressionUI>;
    private _expressionsMap: Map<number, ExpressionUI[]>;
    private _rootExpressionsTree: FilteringExpressionsTree;

    protected conditionChanged = new Subject();
    protected unaryConditionChanged = new Subject();

    constructor(private zone: NgZone, public gridAPI: IgxGridAPIService, public cdr: ChangeDetectorRef) {
        this._expressionsMap = new Map<number, ExpressionUI[]>();
        this.expressionsList = new Array<ExpressionUI>();
        this.unaryConditionChanged.subscribe(() => this.unaryConditionChangedCallback());
        this.conditionChanged.subscribe(() => this.conditionChangedCallback());
    }

    ngOnInit(): void {
        if (this.column.filteringExpressionsTree) {
            this._generateExpressionsMap(this.column.filteringExpressionsTree, 0);
            this._generateExpressionsList();
        } else {
        }

        this._resetExpression();
    }

    ngAfterViewInit(): void {
    }

    ngOnDestroy(): void {
    }

    get grid(): any {
        return this.gridAPI.get(this.gridID);
    }

    get disabled() {
        return !this._isFilteringApplied();
    }

    get template() {
        switch (this.column.dataType) {
            case DataType.String:
            case DataType.Number:
            case DataType.Boolean:
                return this.defaultFilterUI;
            case DataType.Date:
                return this.defaultDateUI;
        }
    }

    get unaryCondition(): boolean {
        return this.isUnaryCondition();
    }

    public isUnaryCondition(): boolean {
        return this.expression && this.expression.condition && this.expression.condition.isUnary;
    }

    get conditions() {
        return this.column.filters.instance().conditionList();
    }

    public conditionChangedCallback(): void {
        if (!!this.expression.searchVal || this.expression.searchVal === 0) {
            this.filter();
        } else {
            this.value = null;
        }
    }

    public unaryConditionChangedCallback(): void {
        this.value = null;
        if (this.chipsArea.chipsList.filter(chip => chip.selected).length === 0) {
            this._addExpression(true);
        }
        this.filter();
    }

    public getCondition(value: string): IFilteringOperation {
        return this.column.filters.instance().condition(value);
    }

    private _isFilteringApplied(): boolean {
        return this.column.filteringExpressionsTree && this.column.filteringExpressionsTree.filteringOperands.length > 0;
    }

    public getOperator(operator: FilteringLogic) {
        return FilteringLogic[operator];
    }

    public getChipLable(expression: IFilteringExpression) {
        if(expression.condition.isUnary) {
            return expression.condition.name;
        } else {
            return expression.searchVal;
        }
    }

    private _generateExpressionsMap(expressionsTree: FilteringExpressionsTree, depth:number) {
        if (expressionsTree.filteringOperands) {
            for (let i = 0; i < expressionsTree.filteringOperands.length; i++) {
                if (expressionsTree.filteringOperands[i] instanceof FilteringExpressionsTree) {
                    this._generateExpressionsMap(expressionsTree.filteringOperands[i] as FilteringExpressionsTree, depth + 1)
                } else {
                    const exprUI = new ExpressionUI();
                    exprUI.expression = expressionsTree.filteringOperands[i] as IFilteringExpression;
                    exprUI.beforeOperator = expressionsTree.operator;

                    if(this._expressionsMap.get(depth)) {
                        this._expressionsMap.get(depth).push(exprUI);
                    } else {
                        this._expressionsMap.set(depth, [exprUI]);
                    }

                    if(exprUI.expression === this.grid.filterInfo.selectedExpression) {
                        exprUI.isSelected = true;
                    }
                }
            }
        }
    }

    private _generateExpressionsList() {
        for (let i = this._expressionsMap.size - 1; i >= 0; i--) {
            for (let j = 0; j < this._expressionsMap.get(i).length; j++) {
                this.expressionsList.push(this._expressionsMap.get(i)[j]);
                const length = this.expressionsList.length;
                if(this.expressionsList[length - 2]) {
                    this.expressionsList[length - 2].afterOperator = this.expressionsList[length - 1].beforeOperator;
                }
            }
        }
    }

    public clearFiltering() {
        this.grid.clearFilter(this.column.field);
        this.expressionsList = [];
        this._resetExpression();
    }

    public clearInput(): void {
        this.value = null;
    }

    public close() {
        this.grid.filterInfo.isFilterRowVisible = false;
        this.cdr.detectChanges();
    }

    public onOperandChanged(eventArgs): void {
        const value = (eventArgs.newSelection as IgxDropDownItemComponent).value;
        this.expression.condition = this.getCondition(value);
        if (this.unaryCondition) {
            this.unaryConditionChanged.next(value);
        } else {
            this.conditionChanged.next(value);
        }
    }

    public toggleDropDown(eventArgs): void {
        this._overlaySettings.positionStrategy.settings.target = eventArgs.target;
        this.igxDropDown.toggle(this._overlaySettings);
    }

    public toggleOperandsDropDown(eventArgs, index): void {
        this._overlaySettings.positionStrategy.settings.target = eventArgs.target;
        this.dropDownList.toArray()[index].toggle(this._overlaySettings);
    }

    protected transformValue(value) {
        if (this.column.dataType === DataType.Number) {
            value = parseFloat(value);
        } else if (this.column.dataType === DataType.Boolean) {
            value = Boolean(value);
        }

        return value;
    }

    public filter() {
        if (this.expressionsList.length === 0) {
            const tree = new FilteringExpressionsTree(FilteringLogic.And, this.column.field);
            tree.filteringOperands.push(this.expression);
            this._rootExpressionsTree = tree;
        } else if (this.expressionsList.length === 1) {
            const tree = new FilteringExpressionsTree(this.expressionsList[0].beforeOperator, this.column.field);
            tree.filteringOperands.push(this.expressionsList[0].expression);
            this._rootExpressionsTree = tree;
        } else {
            this._createTree(this.expressionsList[0].expression, this.expressionsList[1]);
        }

        this.grid.filter(this.column.field, null, this._rootExpressionsTree);
    }

    private _addExpression(isSelected: boolean) {
        const exprUI = new ExpressionUI();
        exprUI.expression = this.expression;
        exprUI.beforeOperator = FilteringLogic.And;
        exprUI.isSelected = isSelected;

        this.expressionsList.push(exprUI);

        const length = this.expressionsList.length;
        if(this.expressionsList[length - 2]) {
            this.expressionsList[length - 2].afterOperator = this.expressionsList[length - 1].beforeOperator;
        }

    }

    private _createTree(left: FilteringExpressionsTree | IFilteringExpression, right: ExpressionUI ) {
        const tree = new FilteringExpressionsTree(right.beforeOperator, this.column.field);
        tree.filteringOperands.push(left);
        tree.filteringOperands.push(right.expression);

        if(right !== this.expressionsList[this.expressionsList.length - 1]) {
            this._createTree(tree, this.expressionsList[this.expressionsList.indexOf(right) + 1]);
        } else {
            this._rootExpressionsTree = tree;
        }
    }

    public onChipSelected(eventArgs: IChipSelectEventArgs, expression: IFilteringExpression ) {
        if (eventArgs.selected) {
            this.expression = expression;
        } else if (this.expression === expression) {
            this._resetExpression();
        }
    }

    private _removeExpression(indexToRemove: number, expression: IFilteringExpression) {
        if (indexToRemove === 0 && this.expressionsList[1]) {
            this.expressionsList[1].beforeOperator = null;
        } else if (indexToRemove === 0 && this.expressionsList.length === 1) {
            this.clearFiltering();
            return;
        } else if (indexToRemove === this.expressionsList.length - 1) {
            this.expressionsList[indexToRemove - 1].afterOperator = null;
        } else {
            this.expressionsList[indexToRemove - 1].afterOperator = this.expressionsList[indexToRemove + 1].beforeOperator;
            this.expressionsList[0].beforeOperator = null;
            this.expressionsList[this.expressionsList.length - 1].afterOperator = null;
        }
        
        this.expressionsList.splice(indexToRemove, 1);
        this.filter();

        if (this.expression === expression) {
            this._resetExpression();
        }
        
        this.cdr.detectChanges();
    }

    private _resetExpression() {
        this.expression = {
            fieldName: this.column.field,
            condition: this.getCondition(this.conditions[0]),
            searchVal: null,
            ignoreCase: this.column.filteringIgnoreCase
        }
    }

    public onChipRemoved(eventArgs: IBaseChipEventArgs, item: ExpressionUI) {
        const indexToRemove = this.expressionsList.indexOf(item);

        this._removeExpression(indexToRemove, item.expression);
    }

    public onChipsSelectionChanged (eventArgs: IChipsAreaSelectEventArgs) {
        if (eventArgs.newSelection.length > 1) {
            eventArgs.newSelection[0].selected = false;
        }
        this.cdr.detectChanges();
    }

    @HostListener('keydown.Enter')
    public onInputKeyDown() {
        this.chipsArea.chipsList.filter(chip => chip.selected = false);

        let indexToDeselect = -1;
        for (let index = 0; index < this.expressionsList.length; index++) {
            if (this.expressionsList[index].expression.searchVal === null) {
                indexToDeselect = index;
            }
        }

        if(indexToDeselect !== -1) {
            this._removeExpression(indexToDeselect, this.expression);
        }

        this._resetExpression();
    }

    public onLogicOperatorChanged(eventArgs, expression: ExpressionUI) {
        expression.afterOperator = (eventArgs.newSelection as IgxDropDownItemComponent).value;
        this.expressionsList[this.expressionsList.indexOf(expression) + 1].beforeOperator = expression.afterOperator;
        this.filter();
    }

}