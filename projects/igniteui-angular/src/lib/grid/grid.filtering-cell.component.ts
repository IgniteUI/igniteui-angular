import {
    ChangeDetectorRef,
    Component,
    Input,
    NgZone,
    OnInit,
    TemplateRef,
    ViewChild,
    HostBinding,
} from '@angular/core';
import { IgxGridAPIService } from './api.service';
import { IgxColumnComponent } from './column.component';
import { FilteringLogic, IFilteringExpression } from '../data-operations/filtering-expression.interface';
import { FilteringExpressionsTree } from '../data-operations/filtering-expressions-tree';
import { IBaseChipEventArgs } from '../chips';
import { IgxGridFilterConditionPipe } from './grid.pipes';
import { TitleCasePipe } from '@angular/common';

export class ExpressionUI {
    public expression: IFilteringExpression;
    public beforeOperator: FilteringLogic;
    public afterOperator: FilteringLogic;
    public isSelected = false;
}
/**
 * @hidden
 */
@Component({
    preserveWhitespaces: false,
    selector: 'igx-grid-filtering-cell',
    templateUrl: './grid.filtering-cell.component.html'
})
export class IgxGridFilteringCellComponent implements OnInit {

    @Input()
    public column: IgxColumnComponent;

    @Input()
    public gridID: string;

    @ViewChild('emptyFilters', { read: TemplateRef })
    protected emptyFilters: TemplateRef<any>;

    @ViewChild('filters', { read: TemplateRef })
    protected filters: TemplateRef<any>;

    private _expressionsMap: Map<number, ExpressionUI[]>;
    private _rootExpressionsTree: FilteringExpressionsTree;
    private _filterPipe = new IgxGridFilterConditionPipe();
    private _titlecasePipe = new TitleCasePipe();

    public expressionsList: Array<ExpressionUI>;

    @HostBinding('class.igx-grid__filtering-cell')
    public cssClass = 'igx-grid__filtering-cell';

    constructor(private zone: NgZone, public gridAPI: IgxGridAPIService, public cdr: ChangeDetectorRef) {
        this._expressionsMap = new Map<number, ExpressionUI[]>();
        this.expressionsList = new Array<ExpressionUI>();
    }

    ngOnInit(): void {
        if (this.column.filteringExpressionsTree) {
            this._generateExpressionsMap(this.column.filteringExpressionsTree, 0);
            this._generateExpressionsList();
        }
    }

    get grid(): any {
        return this.gridAPI.get(this.gridID);
    }

    get template(): TemplateRef<any> {
        const expressionTree = this.column.filteringExpressionsTree;
        if (this.column.filterable) {
            if (expressionTree && expressionTree.filteringOperands.length > 0) {
                return this.filters;
            } else {
                return this.emptyFilters;
            }
        } else {
            return null;
        }
    }

    private _removeExpression(indexToRemove: number): void {
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
    }

    private _createTree(left: FilteringExpressionsTree | IFilteringExpression, right: ExpressionUI): void {
        const tree = new FilteringExpressionsTree(right.beforeOperator, this.column.field);
        tree.filteringOperands.push(left);
        tree.filteringOperands.push(right.expression);

        if (right !== this.expressionsList[this.expressionsList.length - 1]) {
            this._createTree(tree, this.expressionsList[this.expressionsList.indexOf(right) + 1]);
        } else {
            this._rootExpressionsTree = tree;
        }
    }

    private _generateExpressionsMap(expressionsTree: FilteringExpressionsTree, depth: number): void {
        if (expressionsTree.filteringOperands) {
            for (let i = 0; i < expressionsTree.filteringOperands.length; i++) {
                if (expressionsTree.filteringOperands[i] instanceof FilteringExpressionsTree) {
                    this._generateExpressionsMap(expressionsTree.filteringOperands[i] as FilteringExpressionsTree, depth + 1);
                } else {
                    const exprUI = new ExpressionUI();
                    exprUI.expression = expressionsTree.filteringOperands[i] as IFilteringExpression;
                    exprUI.beforeOperator = expressionsTree.operator;

                    if (this._expressionsMap.get(depth)) {
                        this._expressionsMap.get(depth).push(exprUI);
                    } else {
                        this._expressionsMap.set(depth, [exprUI]);
                    }
                }
            }
        }
    }

    private _generateExpressionsList(): void {
        for (let i = this._expressionsMap.size - 1; i >= 0; i--) {
            for (let j = 0; j < this._expressionsMap.get(i).length; j++) {
                this.expressionsList.push(this._expressionsMap.get(i)[j]);
                const length = this.expressionsList.length;
                if (this.expressionsList[length - 2]) {
                    this.expressionsList[length - 2].afterOperator = this.expressionsList[length - 1].beforeOperator;
                }
            }
        }
    }

    public getOperator(operator: FilteringLogic): any {
        return FilteringLogic[operator];
    }

    public getChipLabel(expression: IFilteringExpression): any {
        if (expression.condition.isUnary) {
            return this._titlecasePipe.transform(this._filterPipe.transform(expression.condition.name));
        } else {
            return expression.searchVal;
        }
    }

    public onChipClicked(expression?: IFilteringExpression) {
        this.grid.filterInfo = {
            filteredColumn: this.column,
            isFilterRowVisible: true,
            selectedExpression: expression
        };
    }

    public onChipRemoved(eventArgs: IBaseChipEventArgs, item: ExpressionUI): void {
        const indexToRemove = this.expressionsList.indexOf(item);
        this._removeExpression(indexToRemove);
    }

    public filter(): void {
        if (this.expressionsList.length === 1) {
            const tree = new FilteringExpressionsTree(this.expressionsList[0].beforeOperator, this.column.field);
            tree.filteringOperands.push(this.expressionsList[0].expression);
            this._rootExpressionsTree = tree;
        } else {
            this._createTree(this.expressionsList[0].expression, this.expressionsList[1]);
        }

        this.grid.filter(this.column.field, null, this._rootExpressionsTree);
    }

    public clearFiltering(): void {
        this.grid.clearFilter(this.column.field);
        this.expressionsList = [];
    }
}
