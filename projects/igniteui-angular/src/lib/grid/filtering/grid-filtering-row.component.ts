import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    Input,
    TemplateRef,
    ViewChild,
    OnDestroy,
    ViewChildren,
    QueryList,
    HostListener,
    ElementRef,
    HostBinding
} from '@angular/core';
import { Subject } from 'rxjs';
import { DataType } from '../../data-operations/data-util';
import { IgxColumnComponent } from '../column.component';
import { IgxDropDownComponent } from '../../drop-down/drop-down.component';
import { IFilteringOperation } from '../../data-operations/filtering-condition';
import { FilteringLogic, IFilteringExpression } from '../../data-operations/filtering-expression.interface';
import { HorizontalAlignment, VerticalAlignment } from '../../services/overlay/utilities';
import { ConnectedPositioningStrategy } from '../../services/overlay/position/connected-positioning-strategy';
import { FilteringExpressionsTree } from '../../data-operations/filtering-expressions-tree';
import { IChipsAreaSelectEventArgs, IChipSelectEventArgs, IBaseChipEventArgs, IgxChipsAreaComponent } from '../../chips';
import { ExpressionUI } from './grid-filtering-cell.component';
import { IgxDropDownItemComponent } from '../../drop-down/drop-down-item.component';
import { IgxGridFilterConditionPipe } from '../grid.pipes';
import { TitleCasePipe } from '@angular/common';
import { IgxIconComponent } from '../../icon';
import { IgxFilteringService } from './grid-filtering.service';

/**
 * @hidden
 */
@Component({
    preserveWhitespaces: false,
    selector: 'igx-grid-filtering-row',
    templateUrl: './grid-filtering-row.component.html'
})
export class IgxGridFilteringRowComponent implements AfterViewInit, OnDestroy {

    @Input()
    get column(): IgxColumnComponent {
        return this._column;
    }

    set column(val) {
        if (val) {
            this._column = val;

            this.expressionsMap = new Map<number, ExpressionUI[]>();
            this.expressionsList = new Array<ExpressionUI>();

            if (this.column.filteringExpressionsTree) {
                this.generateExpressionsMap(this.column.filteringExpressionsTree, 0);
                this.generateExpressionsList();
            }

            if (this.column.dataType === DataType.Boolean) {
                this.expression = {
                    fieldName: this.column.field,
                    condition: null,
                    searchVal: null,
                    ignoreCase: this.column.filteringIgnoreCase
                };
            } else {
                this.resetExpression();
            }
        }
    }

    @Input()
    get value(): any {
        return this.expression ? this.expression.searchVal : null;
    }

    set value(val) {
        if (!val && val !== 0) {
            this.expression.searchVal = null;
            this.clearFiltering();
        } else {
            this.expression.searchVal = this.transformValue(val);
            if (this.expressionsList.find(item => item.expression === this.expression) === undefined) {
                this.addExpression(true);
            }
            this.filter();
        }
    }

    @ViewChild('defaultFilterUI', { read: TemplateRef })
    protected defaultFilterUI: TemplateRef<any>;

    @ViewChild('defaultDateUI', { read: TemplateRef })
    protected defaultDateUI: TemplateRef<any>;

    @ViewChild('datePickerInput', { read: ElementRef })
    protected datePickerInput: ElementRef;

    @ViewChild('operands', { read: IgxDropDownComponent })
    protected igxDropDown: IgxDropDownComponent;

    @ViewChild('chipsArea', { read: IgxChipsAreaComponent })
    public chipsArea: IgxChipsAreaComponent;

    @ViewChildren('operators', { read: IgxDropDownComponent })
    protected dropDownList: QueryList<IgxDropDownComponent>;

    @ViewChild('operandsIcon', { read: IgxIconComponent })
    protected operandsIcon: IgxIconComponent;

    private _positionSettings = {
        horizontalStartPoint: HorizontalAlignment.Left,
        verticalStartPoint: VerticalAlignment.Bottom
    };

    private _overlaySettings = {
        closeOnOutsideClick: true,
        modal: false,
        positionStrategy: new ConnectedPositioningStrategy(this._positionSettings)
    };

    private expressionsMap: Map<number, ExpressionUI[]>;
    private rootExpressionsTree: FilteringExpressionsTree;
    private filterPipe = new IgxGridFilterConditionPipe();
    private titlecasePipe = new TitleCasePipe();

    protected conditionChanged = new Subject();
    protected unaryConditionChanged = new Subject();
    protected _column = null;

    public expression: IFilteringExpression;
    public expressionsList: Array<ExpressionUI>;

    @HostBinding('class.igx-grid__filtering-row')
    public cssClass = 'igx-grid__filtering-row';

    constructor(private filteringService: IgxFilteringService, public cdr: ChangeDetectorRef) {
        this.unaryConditionChanged.subscribe(() => this.unaryConditionChangedCallback());
        this.conditionChanged.subscribe(() => this.conditionChangedCallback());
    }

    ngAfterViewInit(): void {
        if (this.column.dataType === DataType.Date) {
            this.cdr.detectChanges();
        }

        this.toggleDropDown(this.operandsIcon.el.nativeElement);
    }

    ngOnDestroy(): void {
        this.conditionChanged.unsubscribe();
        this.unaryConditionChanged.unsubscribe();
    }

    get disabled(): boolean {
        return !(this.column.filteringExpressionsTree && this.column.filteringExpressionsTree.filteringOperands.length > 0);
    }

    get template(): TemplateRef<any> {
        switch (this.column.dataType) {
            case DataType.String:
            case DataType.Number:
            case DataType.Boolean:
                return this.defaultFilterUI;
            case DataType.Date:
                return this.defaultDateUI;
        }
    }

    get conditions(): any {
        return this.column.filters.instance().conditionList();
    }

    get gridOutlet(): any {
        return this.filteringService.gridOutlet
    }

    get isUnaryCondition(): boolean {
        if (this.expression.condition) {
            return this.expression.condition.isUnary;
        } else {
            return false;
        }
    }

    get placeholder(): string {
        if (this.expression.condition && this.expression.condition.isUnary) {
            return this.titlecasePipe.transform(this.filterPipe.transform(this.expression.condition.name));
        } else {
            return 'Add filter value';
        }
    }

    @HostListener('keydown.Enter')
    public onInputKeyDown(): void {
        this.chipsArea.chipsList.filter(chip => chip.selected = false);

        let indexToDeselect = -1;
        for (let index = 0; index < this.expressionsList.length; index++) {
            const expression = this.expressionsList[index].expression;
            if (expression.searchVal === null && !expression.condition.isUnary) {
                indexToDeselect = index;
            }
        }

        if (indexToDeselect !== -1) {
            this.removeExpression(indexToDeselect, this.expression);
        }

        this.resetExpression();
    }

    private generateExpressionsMap(expressionsTree: FilteringExpressionsTree, depth: number): void {
        if (expressionsTree.filteringOperands) {
            for (let i = 0; i < expressionsTree.filteringOperands.length; i++) {
                if (expressionsTree.filteringOperands[i] instanceof FilteringExpressionsTree) {
                    this.generateExpressionsMap(expressionsTree.filteringOperands[i] as FilteringExpressionsTree, depth + 1);
                } else {
                    const exprUI = new ExpressionUI();
                    exprUI.expression = expressionsTree.filteringOperands[i] as IFilteringExpression;
                    exprUI.beforeOperator = expressionsTree.operator;

                    if (this.expressionsMap.get(depth)) {
                        this.expressionsMap.get(depth).push(exprUI);
                    } else {
                        this.expressionsMap.set(depth, [exprUI]);
                    }

                    if (exprUI.expression === this.filteringService.selectedExpression) {
                        exprUI.isSelected = true;
                    }
                }
            }
        }
    }

    private generateExpressionsList(): void {
        for (let i = this.expressionsMap.size - 1; i >= 0; i--) {
            for (let j = 0; j < this.expressionsMap.get(i).length; j++) {
                this.expressionsList.push(this.expressionsMap.get(i)[j]);
                const length = this.expressionsList.length;
                if (this.expressionsList[length - 2]) {
                    this.expressionsList[length - 2].afterOperator = this.expressionsList[length - 1].beforeOperator;
                }
            }
        }
    }

    private transformValue(value): any {
        if (this.column.dataType === DataType.Number) {
            value = parseFloat(value);
        } else if (this.column.dataType === DataType.Boolean) {
            value = Boolean(value);
        }

        return value;
    }

    private addExpression(isSelected: boolean): void {
        const exprUI = new ExpressionUI();
        exprUI.expression = this.expression;
        exprUI.beforeOperator = FilteringLogic.And;
        exprUI.isSelected = isSelected;

        this.expressionsList.push(exprUI);

        const length = this.expressionsList.length;
        if (this.expressionsList[length - 2]) {
            this.expressionsList[length - 2].afterOperator = this.expressionsList[length - 1].beforeOperator;
        }

    }

    private createTree(left: FilteringExpressionsTree | IFilteringExpression, right: ExpressionUI): void {
        const tree = new FilteringExpressionsTree(right.beforeOperator, this.column.field);
        tree.filteringOperands.push(left);
        tree.filteringOperands.push(right.expression);

        if (right !== this.expressionsList[this.expressionsList.length - 1]) {
            this.createTree(tree, this.expressionsList[this.expressionsList.indexOf(right) + 1]);
        } else {
            this.rootExpressionsTree = tree;
        }
    }

    private removeExpression(indexToRemove: number, expression: IFilteringExpression): void {
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
            this.resetExpression();
        }

        this.cdr.detectChanges();
    }

    private resetExpression(): void {
        this.expression = {
            fieldName: this.column.field,
            condition: null,
            searchVal: null,
            ignoreCase: this.column.filteringIgnoreCase
        };

        if (this.column.dataType !== DataType.Boolean) {
            this.expression.condition = this.getCondition(this.conditions[0]);
        }

        if (this.column.dataType === DataType.Date && this.datePickerInput) {
            this.datePickerInput.nativeElement.value = null;
        }
    }

    public conditionChangedCallback(): void {
        if (!!this.expression.searchVal || this.expression.searchVal === 0) {
            this.filter();
        } else if (this.value) {
            this.value = null;
        }
    }

    public unaryConditionChangedCallback(): void {
        if (this.value) {
            this.value = null;
        }
        if (this.expressionsList.find(item => item.expression === this.expression) === undefined) {
            this.addExpression(true);
        }
        this.filter();
    }

    public getCondition(value: string): IFilteringOperation {
        return this.column.filters.instance().condition(value);
    }

    public isConditionSelected(conditionName: string): boolean {
        if (this.expression.condition) {
            return this.expression.condition.name === conditionName;
        } else {
            return false;
        }
    }

    public getOperator(operator: FilteringLogic): string {
        return FilteringLogic[operator];
    }

    public getChipLabel(expression: IFilteringExpression): any {
        if (expression.condition.isUnary) {
            return this.titlecasePipe.transform(this.filterPipe.transform(expression.condition.name));
        } else {
            return expression.searchVal;
        }
    }

    public clearFiltering(): void {
        this.filteringService.clearFilter(this.column.field);
        this.expressionsList = [];
        this.resetExpression();
    }

    public clearInput(): void {
        this.value = null;
    }

    public close(): void {
        this.filteringService.isFilterRowVisible = false;
        this.cdr.detectChanges();
    }

    public toggleDropDown(target: any): void {
        this._overlaySettings.positionStrategy.settings.target = target;
        this.igxDropDown.toggle(this._overlaySettings);
    }

    public toggleOperatorsDropDown(eventArgs, index): void {
        this._overlaySettings.positionStrategy.settings.target = eventArgs.target;
        this.dropDownList.toArray()[index].toggle(this._overlaySettings);
    }

    public filter(): void {
        if (this.expressionsList.length === 0) {
            const tree = new FilteringExpressionsTree(FilteringLogic.And, this.column.field);
            tree.filteringOperands.push(this.expression);
            this.rootExpressionsTree = tree;
        } else if (this.expressionsList.length === 1) {
            const tree = new FilteringExpressionsTree(this.expressionsList[0].beforeOperator, this.column.field);
            tree.filteringOperands.push(this.expressionsList[0].expression);
            this.rootExpressionsTree = tree;
        } else {
            this.createTree(this.expressionsList[0].expression, this.expressionsList[1]);
        }

        this.filteringService.filter(this.column.field, this.rootExpressionsTree);
    }

    public onOperandChanged(eventArgs): void {
        const value = (eventArgs.newSelection as IgxDropDownItemComponent).value;
        this.expression.condition = this.getCondition(value);
        if (this.expression.condition.isUnary) {
            this.unaryConditionChanged.next(value);
        } else {
            this.conditionChanged.next(value);
        }
    }

    public onChipSelected(eventArgs: IChipSelectEventArgs, expression: IFilteringExpression): void {
        if (eventArgs.selected) {
            this.expression = expression;
            setTimeout(() => {
                if (eventArgs.originalEvent) {
                    this.toggleDropDown(this.operandsIcon.el.nativeElement);
                }
            });
        } else if (this.expression === expression) {
            this.resetExpression();
        }
    }

    public onChipRemoved(eventArgs: IBaseChipEventArgs, item: ExpressionUI): void {
        const indexToRemove = this.expressionsList.indexOf(item);
        this.removeExpression(indexToRemove, item.expression);
    }

    public onChipsSelectionChanged(eventArgs: IChipsAreaSelectEventArgs): void {
        if (eventArgs.newSelection.length > 1) {
            eventArgs.newSelection[0].selected = false;
        }
        this.cdr.detectChanges();
    }

    public onLogicOperatorChanged(eventArgs, expression: ExpressionUI): void {
        expression.afterOperator = (eventArgs.newSelection as IgxDropDownItemComponent).value;
        this.expressionsList[this.expressionsList.indexOf(expression) + 1].beforeOperator = expression.afterOperator;
        this.filter();
    }
}
