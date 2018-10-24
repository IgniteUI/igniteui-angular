import {
    ChangeDetectorRef,
    Component,
    Input,
    OnInit,
    TemplateRef,
    ViewChild,
    HostBinding,
    AfterViewInit,
    ElementRef
} from '@angular/core';
import { IgxColumnComponent } from '../column.component';
import { FilteringLogic, IFilteringExpression } from '../../data-operations/filtering-expression.interface';
import { FilteringExpressionsTree } from '../../data-operations/filtering-expressions-tree';
import { IBaseChipEventArgs, IgxChipsAreaComponent } from '../../chips';
import { IgxGridFilterConditionPipe } from '../grid.pipes';
import { TitleCasePipe, DatePipe } from '@angular/common';
import { IgxFilteringService } from './grid-filtering.service';
import { IgxGridAPIService } from '../api.service';
import { KEYCODES, cloneArray } from '../../core/utils';

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
    templateUrl: './grid-filtering-cell.component.html'
})
export class IgxGridFilteringCellComponent implements OnInit, AfterViewInit {

    @Input()
    public column: IgxColumnComponent;

    @ViewChild('emptyFilter', { read: TemplateRef })
    protected emptyFilter: TemplateRef<any>;

    @ViewChild('defaultFilter', { read: TemplateRef })
    protected defaultFilter: TemplateRef<any>;

    @ViewChild('complexFilter', { read: TemplateRef })
    protected complexFilter: TemplateRef<any>;

    @ViewChild('chipsArea', { read: IgxChipsAreaComponent })
    protected chipsArea: IgxChipsAreaComponent;

    @ViewChild('moreIcon', { read: ElementRef })
    protected moreIcon: ElementRef;

    private expressionsMap: Map<number, ExpressionUI[]>;
    private treesOnLevelCount = [0, 0, 0, 0, 0];
    private rootExpressionsTree: FilteringExpressionsTree;
    private filterPipe = new IgxGridFilterConditionPipe();
    private titlecasePipe = new TitleCasePipe();
    private datePipe = new DatePipe(window.navigator.language);

    public expressionsList: Array<ExpressionUI>;
    public visibleExpressionsList: Array<ExpressionUI>;
    public moreFiltersCount = 0;

    @HostBinding('style.min-width')
    @HostBinding('style.max-width')
    @HostBinding('style.flex-basis')
    get width() {
        return this.column.width;
    }

    @HostBinding('class.igx-grid__filtering-cell')
    public cssClass = 'igx-grid__filtering-cell';

    @HostBinding('class.igx-grid__th--pinned-last')
    get isLastPinned() {
        const pinnedCols = this.filteringService.grid.pinnedColumns;
        if (pinnedCols.length === 0) {
            return false;
        } else {
            return pinnedCols.indexOf(this.column) === pinnedCols.length - 1;
        }
    }

    constructor(private filteringService: IgxFilteringService, public gridAPI: IgxGridAPIService, public cdr: ChangeDetectorRef) {
        this.expressionsMap = new Map<number, ExpressionUI[]>();
        this.expressionsList = new Array<ExpressionUI>();
        this.filteringService.subscribeEvents();
    }

    ngOnInit(): void {
        if (this.column.filteringExpressionsTree) {
            this.generateExpressionsMap(this.column.filteringExpressionsTree, 0);
            if (this.treesOnLevelCount.find(item => item > 0) === undefined) {
                this.generateExpressionsList();
                this.visibleExpressionsList = cloneArray(this.expressionsList);
            }
        }
    }

    ngAfterViewInit(): void {
        this.updateFilterCellArea();
    }

    get template(): TemplateRef<any> {
        const expressionTree = this.column.filteringExpressionsTree;
        if (this.column.filterable) {
            const index = this.filteringService.columsWithComplexFilter.indexOf(this.column.field);
            if (index !== -1) {
                this.filteringService.columsWithComplexFilter.splice(index, 1);
            }
            if (expressionTree && expressionTree.filteringOperands.length > 0) {
                if (this.treesOnLevelCount.find(item => item > 0)) {
                    this.filteringService.columsWithComplexFilter.push(this.column.field);
                    return this.complexFilter;
                } else {
                    return this.defaultFilter;
                }
            } else {
                return this.emptyFilter;
            }
        } else {
            return null;
        }
    }

    private removeExpression(indexToRemove: number): void {
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
        this.visibleExpressionsList = cloneArray(this.expressionsList);
        this.updateFilterCellArea();
        this.filter();
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

    private generateExpressionsMap(expressionsTree: FilteringExpressionsTree, depth: number): void {
        if (expressionsTree.filteringOperands) {
            for (let i = 0; i < expressionsTree.filteringOperands.length; i++) {
                if (expressionsTree.filteringOperands[i] instanceof FilteringExpressionsTree) {
                    this.treesOnLevelCount[depth] ++;
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

    public getOperator(operator: FilteringLogic): any {
        return FilteringLogic[operator];
    }

    public getChipLabel(expression: IFilteringExpression): any {
        if (expression.condition.isUnary) {
            return this.titlecasePipe.transform(this.filterPipe.transform(expression.condition.name));
        } else if (expression.searchVal instanceof Date) {
            return this.datePipe.transform(expression.searchVal);
        } else {
            return expression.searchVal;
        }
    }

    public onChipClicked(expression?: IFilteringExpression) {
        this.filteringService.filteredColumn = this.column;
        this.filteringService.isFilterRowVisible = true;
        this.filteringService.selectedExpression = expression;
    }

    public onChipRemoved(eventArgs: IBaseChipEventArgs, item: ExpressionUI): void {
        const indexToRemove = this.expressionsList.indexOf(item);
        this.removeExpression(indexToRemove);
    }

    public updateFilterCellArea() {
        this.cdr.detectChanges();
        if(this.moreIcon) {
            this.moreIcon.nativeElement.setAttribute("style", "visibility:hidden");
        }
        if(this.chipsArea && this.visibleExpressionsList.length > 1) {
            const areaWidth = this.chipsArea.element.nativeElement.offsetWidth;
            let viewWidth = 0;
            const chipsAreaElements = this.chipsArea.element.nativeElement.children;
            let visibleChipsCount = 0;
            
            for (let index = 0; index < chipsAreaElements.length - 1; index++) {
                if (viewWidth + chipsAreaElements[index].offsetWidth < areaWidth) {
                    viewWidth += chipsAreaElements[index].offsetWidth;
                    if (index % 2 === 0) {
                        visibleChipsCount++;
                    }
                } else {
                    if (index % 2 !== 0 && viewWidth + this.moreIcon.nativeElement.offsetWidth > areaWidth) {
                        visibleChipsCount--;
                    }
                    this.moreFiltersCount = this.expressionsList.length - visibleChipsCount;
                    this.moreIcon.nativeElement.setAttribute("style", "visibility:visible");
                    this.visibleExpressionsList.splice(visibleChipsCount);
                    this.cdr.detectChanges();
                    break;
                }
            }
        }
    }

    public filter(): void {
        if (this.expressionsList.length === 1) {
            const tree = new FilteringExpressionsTree(this.expressionsList[0].beforeOperator, this.column.field);
            tree.filteringOperands.push(this.expressionsList[0].expression);
            this.rootExpressionsTree = tree;
        } else {
            this.createTree(this.expressionsList[0].expression, this.expressionsList[1]);
        }

        this.filteringService.filter(this.column.field, this.rootExpressionsTree);
    }

    public clearFiltering(): void {
        this.filteringService.clearFilter(this.column.field);
        this.expressionsList = [];
        this.visibleExpressionsList = [];
    }

    public onKeyDown(eventArgs: KeyboardEvent, expression?: IFilteringExpression) {
        if (eventArgs.keyCode === KEYCODES.ENTER) {
            eventArgs.preventDefault();
            this.onChipClicked(expression);
        }
    }
}
