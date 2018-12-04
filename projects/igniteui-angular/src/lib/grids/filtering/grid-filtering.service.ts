import { Injectable, OnDestroy } from '@angular/core';
import { GridBaseAPIService } from '../api.service';
import { IgxIconService } from '../../icon/icon.service';
import { FilteringExpressionsTree, IFilteringExpressionsTree } from '../../data-operations/filtering-expressions-tree';
import { IgxGridBaseComponent, IColumnResizeEventArgs } from '../grid-base.component';
import icons from './svgIcons';
import { IFilteringExpression, FilteringLogic } from '../../data-operations/filtering-expression.interface';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IForOfState } from '../../directives/for-of/for_of.directive';
import { IgxGridFilterConditionPipe } from '../grid-common.pipes';
import { TitleCasePipe, DatePipe } from '@angular/common';
import { IgxColumnComponent } from '../grid';

const FILTERING_ICONS_FONT_SET = 'filtering-icons';

/**
 *@hidden
 */
export class ExpressionUI {
    public expression: IFilteringExpression;
    public beforeOperator: FilteringLogic;
    public afterOperator: FilteringLogic;
    public isSelected = false;
    public isVisible = true;
}

/**
 *@hidden
 */
@Injectable()
export class IgxFilteringService implements OnDestroy {

    private columnsWithComplexFilter = new Set<string>();
    private areEventsSubscribed = false;
    private destroy$ = new Subject<boolean>();
    private isFiltering = false;
    private columnToExpressionsMap = new Map<string, ExpressionUI[]>();
    private filterPipe = new IgxGridFilterConditionPipe();
    private titlecasePipe = new TitleCasePipe();
    private datePipe = new DatePipe(window.navigator.language);
    private columnStartIndex = -1;

    public gridId: string;
    public isFilterRowVisible = false;
    public filteredColumn: IgxColumnComponent = null;
    public selectedExpression: IFilteringExpression = null;
    public columnToFocus: IgxColumnComponent = null;
    public shouldFocusNext = false;
    public columnToMoreIconHidden = new Map<string, boolean>();

    constructor(private gridAPI: GridBaseAPIService<IgxGridBaseComponent>, private iconService: IgxIconService) {}

    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.complete();
    }

    public get grid(): IgxGridBaseComponent {
        return this.gridAPI.get(this.gridId);
    }

    /**
     * Subscribe to grid's events.
     */
    public subscribeToEvents() {
        if (!this.areEventsSubscribed) {
            this.areEventsSubscribed = true;

            this.grid.onColumnResized.pipe(takeUntil(this.destroy$)).subscribe((eventArgs: IColumnResizeEventArgs) => {
                this.updateFilteringCell(eventArgs.column);
            });

            this.grid.parentVirtDir.onChunkLoad.pipe(takeUntil(this.destroy$)).subscribe((eventArgs: IForOfState) => {
                if (eventArgs.startIndex !== this.columnStartIndex) {
                    this.columnStartIndex = eventArgs.startIndex;
                    this.grid.filterCellList.forEach((filterCell) => {
                        filterCell.updateFilterCellArea();
                    });
                }
                if (this.columnToFocus) {
                    this.focusFilterCellChip(this.columnToFocus, false);
                    this.columnToFocus = null;
                }
            });

            this.grid.onColumnMovingEnd.pipe(takeUntil(this.destroy$)).subscribe((event) => {
                this.grid.filterCellList.forEach((filterCell) => {
                    filterCell.updateFilterCellArea();
                });
            });
        }
    }

    /**
     * Execute filtering on the grid.
     */
    public filter(field: string): void {
        this.isFiltering = true;

        const expressionsTree = this.createSimpleFilteringTree(field);
        this.grid.filter(field, null, expressionsTree);

        // Wait for the change detection to update filtered data through the pipes and then emit the event.
        requestAnimationFrame(() => this.grid.onFilteringDone.emit(expressionsTree));

        this.isFiltering = false;
    }

    /**
     * Clear the filter of a given column.
     */
    public clearFilter(field: string): void {
        this.isFiltering = true;

        this.grid.clearFilter(field);

        const expr = this.grid.filteringExpressionsTree.find(field);

        // Wait for the change detection to update filtered data through the pipes and then emit the event.
        requestAnimationFrame(() => this.grid.onFilteringDone.emit(expr as FilteringExpressionsTree));

        const expressions = this.getExpressions(field);
        expressions.length = 0;

        this.isFiltering = false;
    }

    /**
     * Register filtering SVG icons in the icon service.
     */
    public registerSVGIcons(): void {
        for (const icon of icons) {
            if (!this.iconService.isSvgIconCached(icon.name, FILTERING_ICONS_FONT_SET)) {
                this.iconService.addSvgIconFromText(icon.name, icon.value, FILTERING_ICONS_FONT_SET);
            }
        }
    }

    /**
     * Returns the ExpressionUI array for a given column.
     */
    public getExpressions(columnId: string): ExpressionUI[] {
        if (!this.columnToExpressionsMap.has(columnId)) {
            const column = this.grid.columns.find((col) => col.field === columnId);
            const expressionUIs = new Array<ExpressionUI>();

            this.generateExpressionsList(column.filteringExpressionsTree, this.grid.filteringExpressionsTree.operator, expressionUIs);
            this.columnToExpressionsMap.set(columnId, expressionUIs);

            return expressionUIs;
        }

        return this.columnToExpressionsMap.get(columnId);
    }

    /**
     * Recreates all ExpressionUIs for all columns. Executed after filtering to refresh the cache.
     */
    public refreshExpressions() {
        if (!this.isFiltering) {
            this.columnsWithComplexFilter.clear();

            this.columnToExpressionsMap.forEach((value: ExpressionUI[], key: string) => {
                const column = this.grid.columns.find((col) => col.field === key);
                value.length = 0;

                this.generateExpressionsList(column.filteringExpressionsTree, this.grid.filteringExpressionsTree.operator, value);

                const isComplex = this.isFilteringTreeComplex(column.filteringExpressionsTree);
                if (isComplex) {
                    this.columnsWithComplexFilter.add(key);
                }

                this.updateFilteringCell(column);
            });
        }
    }

    /**
     * Remove an ExpressionUI for a given column.
     */
    public removeExpression(columnId: string, indexToRemove: number) {
        const expressionsList = this.getExpressions(columnId);

        if (indexToRemove === 0 && expressionsList.length > 1) {
            expressionsList[1].beforeOperator = null;
        } else if (indexToRemove === expressionsList.length - 1) {
            expressionsList[indexToRemove - 1].afterOperator = null;
        } else {
            expressionsList[indexToRemove - 1].afterOperator = expressionsList[indexToRemove + 1].beforeOperator;
            expressionsList[0].beforeOperator = null;
            expressionsList[expressionsList.length - 1].afterOperator = null;
        }

        expressionsList.splice(indexToRemove, 1);
    }

    /**
     * Generate filtering tree for a given column from existing ExpressionUIs.
     */
    public createSimpleFilteringTree(columnId: string): FilteringExpressionsTree {
        const expressionsList = this.getExpressions(columnId);
        const expressionsTree = new FilteringExpressionsTree(FilteringLogic.Or, columnId);
        let currAndBranch: FilteringExpressionsTree;
        let currExpressionUI: ExpressionUI;

        for (let i = 0; i < expressionsList.length; i++) {
            currExpressionUI = expressionsList[i];

            if (!currExpressionUI.expression.condition.isUnary && currExpressionUI.expression.searchVal === null) {
                if (currExpressionUI.afterOperator === FilteringLogic.And && !currAndBranch) {
                    currAndBranch = new FilteringExpressionsTree(FilteringLogic.And, columnId);
                    expressionsTree.filteringOperands.push(currAndBranch);
                }
                continue;
            }

            if ((currExpressionUI.beforeOperator === undefined || currExpressionUI.beforeOperator === null ||
                 currExpressionUI.beforeOperator === FilteringLogic.Or) &&
                currExpressionUI.afterOperator === FilteringLogic.And) {

                currAndBranch = new FilteringExpressionsTree(FilteringLogic.And, columnId);
                expressionsTree.filteringOperands.push(currAndBranch);
                currAndBranch.filteringOperands.push(currExpressionUI.expression);

            } else if (currExpressionUI.beforeOperator === FilteringLogic.And) {
                currAndBranch.filteringOperands.push(currExpressionUI.expression);
            } else {
                expressionsTree.filteringOperands.push(currExpressionUI.expression);
                currAndBranch = null;
            }
        }

        return expressionsTree;
    }

    /**
     * Returns whether a complex filter is applied to a given column.
     */
    public isFilterComplex(columnId: string) {
        if (this.columnsWithComplexFilter.has(columnId)) {
            return true;
        }

        const column = this.grid.columns.find((col) => col.field === columnId);
        const isComplex = this.isFilteringTreeComplex(column.filteringExpressionsTree);
        if (isComplex) {
            this.columnsWithComplexFilter.add(columnId);
        }

        return isComplex;
    }

    /**
     * Returns the string representation of the FilteringLogic operator.
     */
    public getOperatorAsString(operator: FilteringLogic): any {
        if (operator === 0) {
            return this.grid.resourceStrings.igx_grid_filter_operator_and;
        } else {
            return this.grid.resourceStrings.igx_grid_filter_operator_or;
        }
    }

    /**
     * Genererate the label of a chip from a given filtering expression.
     */
    public getChipLabel(expression: IFilteringExpression): any {
        if (expression.condition.isUnary) {
            return this.grid.resourceStrings[`igx_grid_filter_${expression.condition.name}`] || expression.condition.name;
        } else if (expression.searchVal instanceof Date) {
            return this.datePipe.transform(expression.searchVal);
        } else {
            return expression.searchVal;
        }
    }

    /**
     * Updates the content of a filterCell.
     */
    public updateFilteringCell(column: IgxColumnComponent) {
        const filterCell = column.filterCell;
        if (filterCell) {
            filterCell.updateFilterCellArea();
        }
    }

    /**
     * Focus a chip in a filterCell.
     */
    public focusFilterCellChip(column: IgxColumnComponent, focusFirst: boolean) {
        const filterCell = column.filterCell;
        if (filterCell) {
            filterCell.focusChip(focusFirst);
        }
    }

    private isFilteringTreeComplex(expressions: IFilteringExpressionsTree | IFilteringExpression): boolean {
        if (!expressions) {
            return false;
        }

        if (expressions instanceof FilteringExpressionsTree) {
            const expressionsTree = expressions as FilteringExpressionsTree;
            if (expressionsTree.operator === FilteringLogic.Or) {
                const andOperatorsCount = this.getChildAndOperatorsCount(expressionsTree);

                // having more that 'And' and operator in the sub-tree means that the filter could not be represented without parentheses.
                return andOperatorsCount > 1;
            }

            let isComplex = false;
            for (let i = 0; i < expressionsTree.filteringOperands.length; i++) {
                isComplex = isComplex || this.isFilteringTreeComplex(expressionsTree.filteringOperands[i]);
            }

            return isComplex;
        }

        return false;
    }

    private getChildAndOperatorsCount(expressions: IFilteringExpressionsTree): number {
        let count = 0;
        let operand;
        for (let i = 0; i < expressions.filteringOperands.length; i++) {
            operand = expressions[i];
            if (operand instanceof FilteringExpressionsTree) {
                if (operand.operator === FilteringLogic.And) {
                    count++;
                }

                count = count + this.getChildAndOperatorsCount(operand);
            }
        }

        return count;
    }

    private generateExpressionsList(expressions: IFilteringExpressionsTree | IFilteringExpression,
                                    operator: FilteringLogic,
                                    expressionsUIs: ExpressionUI[]): void {
        if (!expressions) {
            return;
        }

        if (expressions instanceof FilteringExpressionsTree) {
            const expressionsTree = expressions as FilteringExpressionsTree;
            for (let i = 0; i < expressionsTree.filteringOperands.length; i++) {
                this.generateExpressionsList(expressionsTree.filteringOperands[i], expressionsTree.operator, expressionsUIs);
            }
        } else {
            const exprUI = new ExpressionUI();
            exprUI.expression = expressions as IFilteringExpression;
            if (expressionsUIs.length !== 0) {
                exprUI.beforeOperator = operator;
            }

            const prevExprUI = expressionsUIs[expressionsUIs.length - 1];
            if (prevExprUI) {
                prevExprUI.afterOperator = operator;
            }

            expressionsUIs.push(exprUI);
        }
    }
}
