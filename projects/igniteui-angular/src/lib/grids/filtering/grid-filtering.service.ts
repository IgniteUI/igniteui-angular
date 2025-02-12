import {
    Injectable,
    OnDestroy,
} from '@angular/core';
import { FilteringExpressionsTree, IFilteringExpressionsTree } from '../../data-operations/filtering-expressions-tree';
import { IFilteringExpression, FilteringLogic } from '../../data-operations/filtering-expression.interface';
import { Subject } from 'rxjs';
import { takeUntil, first } from 'rxjs/operators';
import { IForOfState } from '../../directives/for-of/for_of.directive';
import { IFilteringOperation } from '../../data-operations/filtering-condition';
import { IColumnResizeEventArgs, IFilteringEventArgs } from '../common/events';
import { OverlayCancelableEventArgs, OverlaySettings, VerticalAlignment } from '../../services/overlay/utilities';
import { IgxOverlayService } from '../../services/overlay/overlay';
import { useAnimation } from '@angular/animations';
import { AbsoluteScrollStrategy } from '../../services/overlay/scroll/absolute-scroll-strategy';
import { IgxIconService } from '../../icon/icon.service';
import { editor, pinLeft, unpinLeft } from '@igniteui/material-icons-extended';
import { ExpressionUI, generateExpressionsList } from './excel-style/common';
import { ColumnType, GridType } from '../common/grid.interface';
import { formatDate } from '../../core/utils';
import { ExcelStylePositionStrategy } from './excel-style/excel-style-position-strategy';
import { fadeIn } from 'igniteui-angular/animations';
import { ExpressionsTreeUtil } from '../../data-operations/expressions-tree-util';

/**
 * @hidden
 */
@Injectable()
export class IgxFilteringService implements OnDestroy {
    public isFilterRowVisible = false;
    public filteredColumn: ColumnType = null;
    public selectedExpression: IFilteringExpression = null;
    public columnToMoreIconHidden = new Map<string, boolean>();
    public activeFilterCell = 0;
    public grid: GridType;

    private columnsWithComplexFilter = new Set<string>();
    private areEventsSubscribed = false;
    protected destroy$ = new Subject<boolean>();
    private isFiltering = false;
    private columnToExpressionsMap = new Map<string, ExpressionUI[]>();
    private columnStartIndex = -1;
    protected _filterMenuOverlaySettings: OverlaySettings = {
        closeOnEscape: true,
        closeOnOutsideClick: true,
        modal: false,
        positionStrategy: new ExcelStylePositionStrategy({
            verticalStartPoint: VerticalAlignment.Bottom,
            openAnimation: useAnimation(fadeIn, { params: { duration: '250ms' } }),
            closeAnimation: null
        }),
        scrollStrategy: new AbsoluteScrollStrategy()
    };
    protected lastActiveNode;

    constructor(
        private iconService: IgxIconService,
        protected _overlayService: IgxOverlayService,
    ) { }

    public ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.complete();
    }

    public toggleFilterDropdown(element: HTMLElement, column: ColumnType) {

        const filterIcon = column.filteringExpressionsTree ? 'igx-excel-filter__icon--filtered' : 'igx-excel-filter__icon';
        const filterIconTarget = element.querySelector(`.${filterIcon}`) as HTMLElement || element;

        const id = this.grid.createFilterDropdown(column, {
            ...this._filterMenuOverlaySettings,
            ...{ target: filterIconTarget }
        });

        this._overlayService.opening
            .pipe(
                first(overlay => overlay.id === id),
                takeUntil(this.destroy$)
            )
            .subscribe((event: OverlayCancelableEventArgs) => {
                if (event.componentRef) {
                    event.componentRef.instance.initialize(column, this._overlayService);
                    event.componentRef.instance.overlayComponentId = id;
                }
                this.lastActiveNode = this.grid.navigation.activeNode;
            });

        this._overlayService.closed
            .pipe(
                first(overlay => overlay.id === id),
                takeUntil(this.destroy$)
            )
            .subscribe(() => {
                this._overlayService.detach(id);
                this.grid.navigation.activeNode = this.lastActiveNode;
                this.grid.theadRow.nativeElement.focus();
            });

        this._overlayService.show(id);
    }

    /**
     * Subscribe to grid's events.
     */
    public subscribeToEvents() {
        if (!this.areEventsSubscribed) {
            this.areEventsSubscribed = true;

            this.grid.columnResized.pipe(takeUntil(this.destroy$)).subscribe((eventArgs: IColumnResizeEventArgs) => {
                this.updateFilteringCell(eventArgs.column);
            });

            this.grid.parentVirtDir.chunkLoad.pipe(takeUntil(this.destroy$)).subscribe((eventArgs: IForOfState) => {
                if (eventArgs.startIndex !== this.columnStartIndex) {
                    this.columnStartIndex = eventArgs.startIndex;
                    this.grid.filterCellList.forEach((filterCell) => {
                        filterCell.updateFilterCellArea();
                    });
                }
            });

            this.grid.columnMovingEnd.pipe(takeUntil(this.destroy$)).subscribe(() => {
                this.grid.filterCellList.forEach((filterCell) => {
                    filterCell.updateFilterCellArea();
                });
            });
        }
    }

    /**
     * Close filtering row if a column is hidden.
     */
    public hideFilteringRowOnColumnVisibilityChange(col: ColumnType) {
        const filteringRow = this.grid?.filteringRow;

        if (filteringRow && filteringRow.column && filteringRow.column === col) {
            filteringRow.close();
        }
    }

    /**
     * Internal method to create expressionsTree and filter grid used in both filter modes.
     */
    public filterInternal(field: string, expressions: FilteringExpressionsTree | Array<ExpressionUI> = null): void {
        this.isFiltering = true;

        let expressionsTree;
        if (expressions instanceof FilteringExpressionsTree) {
            expressionsTree = expressions;
        } else {
            expressionsTree = this.createSimpleFilteringTree(field, expressions);
        }

        if (expressionsTree.filteringOperands.length === 0) {
            this.clearFilter(field);
        } else {
            this.filter(field, null, expressionsTree);
        }

        this.isFiltering = false;
    }

    /**
     * Execute filtering on the grid.
     */
    public filter(field: string, value: any, conditionOrExpressionTree?: IFilteringOperation | IFilteringExpressionsTree,
        ignoreCase?: boolean) {

        const grid = this.grid;

        const col = grid.getColumnByName(field);
        const filteringIgnoreCase = ignoreCase || (col ? col.filteringIgnoreCase : false);

        const filteringTree = grid.filteringExpressionsTree;
        const columnFilteringExpressionsTree = ExpressionsTreeUtil.find(filteringTree, field) as IFilteringExpressionsTree;
        conditionOrExpressionTree = conditionOrExpressionTree ?? columnFilteringExpressionsTree;
        const fieldFilterIndex = ExpressionsTreeUtil.findIndex(filteringTree, field);

        const newFilteringTree: FilteringExpressionsTree =
            this.prepare_filtering_expression(filteringTree, field, value, conditionOrExpressionTree,
                filteringIgnoreCase, fieldFilterIndex, true);

        const eventArgs: IFilteringEventArgs = {
            owner: grid,
            filteringExpressions: ExpressionsTreeUtil.find(newFilteringTree, field) as FilteringExpressionsTree, cancel: false
        };
        this.grid.filtering.emit(eventArgs);

        if (eventArgs.cancel) {
            return;
        }

        if (conditionOrExpressionTree) {
            this.filter_internal(field, value, conditionOrExpressionTree, filteringIgnoreCase);
        } else {
            const expressionsTreeForColumn = ExpressionsTreeUtil.find(this.grid.filteringExpressionsTree, field);
            if (!expressionsTreeForColumn) {
                throw new Error('Invalid condition or Expression Tree!');
            } else if (expressionsTreeForColumn instanceof FilteringExpressionsTree) {
                this.filter_internal(field, value, expressionsTreeForColumn, filteringIgnoreCase);
            } else {
                const expressionForColumn = expressionsTreeForColumn as IFilteringExpression;
                this.filter_internal(field, value, expressionForColumn.condition, filteringIgnoreCase);
            }
        }
        const doneEventArgs = ExpressionsTreeUtil.find(this.grid.filteringExpressionsTree, field) as FilteringExpressionsTree;
        // Wait for the change detection to update filtered data through the pipes and then emit the event.
        requestAnimationFrame(() => this.grid.filteringDone.emit(doneEventArgs));
    }

    public filter_global(term, condition, ignoreCase) {
        if (!condition) {
            return;
        }

        const filteringTree = this.grid.filteringExpressionsTree;
        this.grid.crudService.endEdit(false);
        this.grid.page = 0;

        filteringTree.filteringOperands = [];
        for (const column of this.grid.columns) {
            this.prepare_filtering_expression(filteringTree, column.field, term,
                condition, ignoreCase || column.filteringIgnoreCase);
        }

        this.grid.filteringExpressionsTree = filteringTree;
    }

    /**
     * Clears the filter of a given column if name is provided. Otherwise clears the filters of all columns.
     */
    public clearFilter(field: string): void {
        if (field) {
            const column = this.grid.getColumnByName(field);
            if (!column) {
                return;
            }
        }

        const emptyFilter = new FilteringExpressionsTree(null, field);
        const onFilteringEventArgs: IFilteringEventArgs = {
            owner: this.grid,
            filteringExpressions: emptyFilter,
            cancel: false
        };

        this.grid.filtering.emit(onFilteringEventArgs);

        if (onFilteringEventArgs.cancel) {
            return;
        }

        this.isFiltering = true;
        this.clear_filter(field);

        // Wait for the change detection to update filtered data through the pipes and then emit the event.
        requestAnimationFrame(() => this.grid.filteringDone.emit(emptyFilter));

        if (field) {
            const expressions = this.getExpressions(field);
            expressions.length = 0;
        } else {
            this.grid.columns.forEach(c => {
                const expressions = this.getExpressions(c.field);
                expressions.length = 0;
            });
        }

        this.isFiltering = false;
    }

    public clear_filter(fieldName: string) {
        const grid = this.grid;
        grid.crudService.endEdit(false);
        const filteringState = grid.filteringExpressionsTree;
        const index = ExpressionsTreeUtil.findIndex(filteringState, fieldName);

        if (index > -1) {
            filteringState.filteringOperands.splice(index, 1);
        } else if (!fieldName) {
            filteringState.filteringOperands = [];
        }

        grid.filteringExpressionsTree = filteringState;
    }

    /**
     * Filters all the `IgxColumnComponent` in the `IgxGridComponent` with the same condition.
     * @deprecated in version 19.0.0.
     */
    public filterGlobal(value: any, condition, ignoreCase?) {
        if (!condition) {
            return;
        }

        const filteringTree = this.grid.filteringExpressionsTree;
        const newFilteringTree = new FilteringExpressionsTree(filteringTree.operator, filteringTree.fieldName);

        for (const column of this.grid.columns) {
            this.prepare_filtering_expression(newFilteringTree, column.field, value, condition,
                ignoreCase || column.filteringIgnoreCase);
        }

        const eventArgs: IFilteringEventArgs = { owner: this.grid, filteringExpressions: newFilteringTree, cancel: false };
        this.grid.filtering.emit(eventArgs);
        if (eventArgs.cancel) {
            return;
        }

        this.grid.crudService.endEdit(false);
        this.grid.page = 0;
        this.grid.filteringExpressionsTree = newFilteringTree;

        // Wait for the change detection to update filtered data through the pipes and then emit the event.
        requestAnimationFrame(() => this.grid.filteringDone.emit(this.grid.filteringExpressionsTree));
    }

    /**
     * Register filtering SVG icons in the icon service.
     */
    public registerSVGIcons(): void {
        const editorIcons = editor as any[];
        editorIcons.forEach(icon => {
            this.iconService.addSvgIconFromText(icon.name, icon.value, 'imx-icons');
        });
        this.iconService.addSvgIconFromText(pinLeft.name, pinLeft.value, 'imx-icons');
        this.iconService.addSvgIconFromText(unpinLeft.name, unpinLeft.value, 'imx-icons');
    }

    /**
     * Returns the ExpressionUI array for a given column.
     */
    public getExpressions(columnId: string): ExpressionUI[] {
        if (!this.columnToExpressionsMap.has(columnId)) {
            const column = this.grid.columns.find((col) => col.field === columnId);
            const expressionUIs = new Array<ExpressionUI>();
            if (column) {
                this.generateExpressionsList(column.filteringExpressionsTree, this.grid.filteringExpressionsTree.operator, expressionUIs);
                this.columnToExpressionsMap.set(columnId, expressionUIs);
            }
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
                if (column) {
                    value.length = 0;

                    this.generateExpressionsList(column.filteringExpressionsTree, this.grid.filteringExpressionsTree.operator, value);

                    const isComplex = this.isFilteringTreeComplex(column.filteringExpressionsTree);
                    if (isComplex) {
                        this.columnsWithComplexFilter.add(key);
                    }

                    this.updateFilteringCell(column);
                } else {
                    this.columnToExpressionsMap.delete(key);
                }
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
    public createSimpleFilteringTree(columnId: string, expressionUIList = null): FilteringExpressionsTree {
        const expressionsList = expressionUIList ? expressionUIList : this.getExpressions(columnId);
        const expressionsTree = new FilteringExpressionsTree(FilteringLogic.Or, columnId);
        let currAndBranch: FilteringExpressionsTree;

        for (const currExpressionUI of expressionsList) {
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
        const isComplex = column && this.isFilteringTreeComplex(column.filteringExpressionsTree);
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
     * Generate the label of a chip from a given filtering expression.
     */
    public getChipLabel(expression: IFilteringExpression): any {
        if (expression.condition.isUnary) {
            return this.grid.resourceStrings[`igx_grid_filter_${expression.condition.name}`] || expression.condition.name;
        } else if (expression.searchVal instanceof Date) {
            const column = this.grid.getColumnByName(expression.fieldName);
            const formatter = column.formatter;
            if (formatter) {
                return formatter(expression.searchVal, undefined);
            }
            const pipeArgs = column.pipeArgs;
            return formatDate(expression.searchVal, pipeArgs.format, this.grid.locale);
        } else {
            return expression.searchVal;
        }
    }

    /**
     * Updates the content of a filterCell.
     */
    public updateFilteringCell(column: ColumnType) {
        const filterCell = column.filterCell;
        if (filterCell) {
            filterCell.updateFilterCellArea();
        }
    }

    public generateExpressionsList(expressions: IFilteringExpressionsTree | IFilteringExpression,
        operator: FilteringLogic,
        expressionsUIs: ExpressionUI[]): void {
        generateExpressionsList(expressions, operator, expressionsUIs);
    }

    public isFilteringExpressionsTreeEmpty(expressionTree: IFilteringExpressionsTree): boolean {
        if (FilteringExpressionsTree.empty(expressionTree)) {
            return true;
        }

        for (const expr of expressionTree.filteringOperands) {
            if ((expr instanceof FilteringExpressionsTree)) {
                const exprTree = expr as FilteringExpressionsTree;
                if (exprTree.filteringOperands && exprTree.filteringOperands.length) {
                    return false;
                }
            } else {
                return false;
            }
        }
        return true;
    }

    protected filter_internal(fieldName: string, term, conditionOrExpressionsTree: IFilteringOperation | IFilteringExpressionsTree,
        ignoreCase: boolean) {
        const filteringTree = this.grid.filteringExpressionsTree;
        this.grid.crudService.endEdit(false);
        this.grid.page = 0;

        const fieldFilterIndex = ExpressionsTreeUtil.findIndex(filteringTree, fieldName);
        this.prepare_filtering_expression(filteringTree, fieldName, term, conditionOrExpressionsTree, ignoreCase, fieldFilterIndex);
        this.grid.filteringExpressionsTree = filteringTree;
    }

    /** Modifies the filteringState object to contain the newly added filtering conditions/expressions.
     * If createNewTree is true, filteringState will not be modified (because it directly affects the grid.filteringExpressionsTree),
     * but a new object is created and returned.
     */
    protected prepare_filtering_expression(
        filteringState: IFilteringExpressionsTree,
        fieldName: string,
        searchVal,
        conditionOrExpressionsTree: IFilteringOperation | IFilteringExpressionsTree,
        ignoreCase: boolean,
        insertAtIndex = -1,
        createNewTree = false): FilteringExpressionsTree {

        let expressionsTree = conditionOrExpressionsTree instanceof FilteringExpressionsTree ?
            conditionOrExpressionsTree as IFilteringExpressionsTree : null;
        const condition = conditionOrExpressionsTree instanceof FilteringExpressionsTree ?
            null : conditionOrExpressionsTree as IFilteringOperation;

        let newExpressionsTree = filteringState as FilteringExpressionsTree;

        if (createNewTree) {
            newExpressionsTree = new FilteringExpressionsTree(filteringState.operator, filteringState.fieldName);
            newExpressionsTree.filteringOperands = [...filteringState.filteringOperands];
        }

        if (condition) {
            const newExpression: IFilteringExpression = { fieldName, searchVal, condition, ignoreCase };
            expressionsTree = new FilteringExpressionsTree(filteringState.operator, fieldName);
            expressionsTree.filteringOperands.push(newExpression);
        }

        if (expressionsTree) {
            if (insertAtIndex > -1) {
                newExpressionsTree.filteringOperands[insertAtIndex] = expressionsTree;
            } else {
                newExpressionsTree.filteringOperands.push(expressionsTree);
            }
        }

        return newExpressionsTree;
    }


    private isFilteringTreeComplex(expressions: IFilteringExpressionsTree | IFilteringExpression): boolean {
        if (!expressions) {
            return false;
        }

        if (expressions instanceof FilteringExpressionsTree) {
            const expressionsTree = expressions as FilteringExpressionsTree;
            if (expressionsTree.operator === FilteringLogic.Or) {
                const andOperatorsCount = this.getChildAndOperatorsCount(expressionsTree);

                // having more than one 'And' operator in the sub-tree means that the filter could not be represented without parentheses.
                return andOperatorsCount > 1;
            }

            let isComplex = false;
            for (const operand of expressionsTree.filteringOperands) {
                isComplex = isComplex || this.isFilteringTreeComplex(operand);
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
}
