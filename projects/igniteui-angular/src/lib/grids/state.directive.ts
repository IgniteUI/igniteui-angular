import { Directive, Optional, Self, Input, NgModule, Inject } from '@angular/core';
import { ISortingExpression } from '../data-operations/sorting-expression.interface';
import { FilteringExpressionsTree, IFilteringExpressionsTree } from '../data-operations/filtering-expressions-tree';
import { IFilteringExpression } from '../data-operations/filtering-expression.interface';
import { DefaultSortingStrategy } from '../data-operations/sorting-strategy';
import { INTERFACE_TOKEN } from './grid/grid.component';
import { IgxColumnComponent } from './columns/column.component';
import { IGroupingExpression } from '../data-operations/grouping-expression.interface';
import { IPagingState } from '../data-operations/paging-state.interface';
import { DataType } from '../data-operations/data-util';
import { IgxBooleanFilteringOperand, IgxNumberFilteringOperand, IgxDateFilteringOperand,
    IgxStringFilteringOperand } from '../data-operations/filtering-condition';
import { GridSelectionRange } from './selection/selection.service';

export interface IGridState {
    columns?: IColumnState[];
    filtering?: FilteringExpressionsTree;
    advancedFiltering?: FilteringExpressionsTree;
    sorting?: ISortingExpression[];
    groupBy?: IGroupingExpression[];
    paging?: IPagingState;
    cellSelection?: GridSelectionRange[];
    rowSelection?: any[];
}

export interface IGridStateOptions {
    columns?: boolean;
    filtering?: boolean;
    advancedFiltering?: boolean;
    sorting?: boolean;
    groupBy?: boolean;
    paging?: boolean;
    cellSelection?: boolean;
    rowSelection?: boolean;
}

export interface IColumnState {
    pinned: boolean;
    sortable: boolean;
    filterable: boolean;
    editable: boolean;
    sortingIgnoreCase: boolean;
    filteringIgnoreCase: boolean;
    headerClasses: string;
    headerGroupClasses: string;
    maxWidth: string;
    groupable: boolean;
    movable: boolean;
    hidden: boolean;
    dataType: string;
    hasSummary: boolean;
    field: string;
    width: any;
    header: string;
    resizable: boolean;
    searchable: boolean;
    visibleIndex: number;
}

const COLUMNS = 'columns';
const FILTERING = 'filtering';
const ADVANCED_FILTERING = 'advancedFiltering';
const SORTING = 'sorting';
const GROUPBY = 'groupBy';
const PAGING = 'paging';
const ROW_SELECTION = 'rowSelection';
const CELL_SELECTION = 'cellSelection';

@Directive({
    selector: '[igxGridState]'
})
export class IgxGridStateDirective {

    private _options: IGridStateOptions = {
        columns: true,
        filtering: true,
        advancedFiltering: true,
        sorting: true,
        groupBy: true,
        paging: true,
        cellSelection: true,
        rowSelection: true
    };

    private state: IGridState | IColumnState | IFilteringExpressionsTree |
        ISortingExpression | IGroupingExpression | IPagingState;

    /**
     *  An object with options determining if a certain feature state should be saved.
     *
     * ```html
     * <igx-grid [igxGridState]="options"></igx-grid>
     * ```
     * ```typescript
     * public options = {selection: false, advancedFiltering: false};
     * ```
     */
    @Input('igxGridState')
    public get options(): IGridStateOptions {
       return this._options;
    }

    public set options(value: IGridStateOptions) {
        Object.assign(this._options, value);
    }

    /**
     * @hidden
     */
    constructor(@Inject(INTERFACE_TOKEN) @Self() @Optional() private grid) { }

    /**
     * Restores grid features' state based on the IGridState object passed as an argument.
     * @param IGridState object to restore state from.
     * @returns
     * ```html
     * <igx-grid [igxGridState]="options"></igx-grid>
     * ```
     * ```typescript
     * @ViewChild(IgxGridStateDirective, { static: true }) public state;
     * this.state.setState(gridState);
     * ```
     */
    public setState(state: IGridState | string) {
        if (typeof state === 'string') {
            state = JSON.parse(state as string, this.parseCallback) as string;
        }
        this.state = state as IGridState;
        this.restoreGridState();
    }

    /**
     * Gets the state of a feature or states of all grid features, unless a certain feature is disabled through the `options` property.
     * @param `serialize` determines whether the returned object will be serialized to JSON string. Default value is false.
     * @param `feature` string or array of strings determining the features which state to retrieve. If skipped, returns all.
     * @returns Returns the serialized to JSON string IGridState object, or the non-serialized IGridState object.
     * ```html
     * <igx-grid [igxGridState]="options"></igx-grid>
     * ```
     * ```typescript
     * @ViewChild(IgxGridStateDirective, { static: true }) public state;
     * let state =  this.state.getState();
     * ```
     */
    public getState(serialize = true, feature?: string | string[]): IGridState | string  {
        let state: IGridState | string;
        if (feature) {
            state = {};
            if (Array.isArray(feature)) {
                feature.forEach(f => {
                    state = Object.assign(state, this.getGridFeature(f));
                });
            } else {
                state = this.getGridFeature(feature);
            }
        } else {
            state = this.getAllGridFeatures() as IGridState;
        }
        if (serialize) {
            state = JSON.stringify(state, this.stringifyCallback);
            return state as string;
        } else {
            return state as IGridState;
        }
    }

    /**
     * The method that calls corresponding methods to restore feature from this.state object.
     */
    private restoreGridState() {
        for (const key of Object.keys(this.state)) {
            if (this.state[key]) {
                this.restoreFeature(key, this.state[key]);
            }
        }
    }

    /**
     * Restores the state of a feature.
     */
    private restoreFeature(feature: string, state: any) {
        switch (feature) {
            case COLUMNS: {
               this.restoreColumns(state);
               break;
            }
            case FILTERING: {
                this.restoreFiltering(state);
                break;
            }
            case ADVANCED_FILTERING: {
                this.restoreAdvancedFiltering(state);
                break;
            }
            case SORTING: {
                this.restoreSorting(state);
                break;
             }
             case GROUPBY: {
                this.restoreGroupBy(state);
                break;
             }
             case PAGING: {
                this.restorePaging(state);
                break;
              }
              case ROW_SELECTION: {
                this.restoreRowSelection(state);
                break;
              }
              case CELL_SELECTION: {
                this.restoreCellSelection(state);
                break;
              }
         }
    }

    /**
     * Returns an object containing all grid features state.
     */
    private getAllGridFeatures(): IGridState {
        let gridState = {};

        for (const key of Object.keys(this.options)) {
            if (this.options[key]) {
                const feature = this.getGridFeature(key);
                gridState =  Object.assign(gridState, feature);
            }
        }

        gridState = Object.assign({}, gridState);
        return gridState as IGridState;
    }

    /**
     * Restores an object containing the state for a grid feature.
     * `serialize` param determines whether the returned object will be serialized to a JSON string. Default value is false.,
     */
    private getGridFeature(feature: string) {
        let state = null;
        switch (feature) {
            case COLUMNS: {
               state = this.getColumns();
               break;
            }
            case FILTERING: {
                state = this.getFiltering();
                break;
            }
            case ADVANCED_FILTERING: {
                state = this.getAdvancedFiltering();
                break;
            }
            case SORTING: {
                state = this.getSorting();
                break;
             }
             case GROUPBY: {
                state = this.getGroupBy();
                break;
             }
             case PAGING: {
                state = this.getPaging();
                break;
              }
              case ROW_SELECTION: {
                state = this.getRowSelection();
                break;
              }
              case CELL_SELECTION: {
                state = this.getCellSelection();
                break;
              }
         }
         return state;
    }

    /**
     * Helper method that creates a new array with the current grid columns.
     */
    private getColumns() {
        const gridColumns: IColumnState = this.grid.columns.map((c) => {
            return {
                pinned: c.pinned,
                sortable: c.sortable,
                filterable: c.filterable,
                editable: c.editable,
                sortingIgnoreCase: c.sortingIgnoreCase,
                filteringIgnoreCase: c.filteringIgnoreCase,
                headerClasses: c.headerClasses,
                headerGroupClasses: c.headerGroupClasses,
                maxWidth: c.maxWidth,
                groupable: c.groupable,
                movable: c.movable,
                hidden: c.hidden,
                dataType: c.dataType,
                hasSummary: c.hasSummary,
                field: c.field,
                width: c.width,
                header: c.header,
                resizable: c.resizable,
                searchable: c.searchable,
                visibleIndex: c.visibleIndex
            };
        });
        return { columns: gridColumns };
    }

    private getFiltering() {
        const filteringState = this.grid.filteringExpressionsTree;
        return { filtering: filteringState };
    }

    private getAdvancedFiltering() {
        const advancedFiltering = this.grid.advancedFilteringExpressionsTree;
        return { advancedFiltering: advancedFiltering };
    }

    private getPaging() {
        const pagingState = this.grid.pagingState;
        return { paging: pagingState };
    }

    private getSorting() {
        const sortingState = this.grid.sortingExpressions;
        return { sorting: sortingState };
    }

    private getGroupBy() {
        const groupingState = this.grid.groupingExpressions;
        return { groupBy: groupingState };
    }

    private getRowSelection() {
        const selection = this.grid.selectedRows();
        return { rowSelection: selection };
    }

    private getCellSelection() {
        const selection = this.grid.getSelectedRanges().map(range => {
            return { rowStart: range.rowStart, rowEnd: range.rowEnd, columnStart: range.columnStart, columnEnd: range.columnEnd };
        });
        return { cellSelection: selection };
    }

    /**
     * Restores the grid columns by modifying the `columnList` collection of the grid.
     */
    private restoreColumns(columns: IColumnState[]): void {
        const newColumns = [];
        const factory = (this.grid as any).resolver.resolveComponentFactory(IgxColumnComponent);
        const sortedColumns = columns.sort(this.sortByVisibleIndex);
        sortedColumns.forEach((col) => {
            const ref = factory.create(this.grid.viewRef.injector);
            ref.instance.pinned = col.pinned;
            ref.instance.sortable = col.sortable;
            ref.instance.filterable = col.filterable;
            ref.instance.editable = col.editable;
            ref.instance.sortingIgnoreCase = col.sortingIgnoreCase;
            ref.instance.filteringIgnoreCase = col.filteringIgnoreCase;
            ref.instance.headerClasses = col.headerClasses;
            ref.instance.headerGroupClasses = col.headerGroupClasses;
            ref.instance.maxWidth = col.maxWidth;
            ref.instance.groupable = col.groupable;
            ref.instance.movable = col.movable;
            ref.instance.hidden = col.hidden;
            ref.instance.dataType = col.dataType;
            ref.instance.hasSummary = col.hasSummary;
            ref.instance.field = col.field;
            ref.instance.width = col.width;
            ref.instance.header = col.header;
            ref.instance.resizable = col.resizable;
            ref.instance.searchable = col.searchable;
            ref.changeDetectorRef.detectChanges();
            newColumns.push(ref.instance);
        });

        this.grid.columnList.reset(newColumns);
        this.grid.columnList.notifyOnChanges();
    }

    private sortByVisibleIndex(colA, colB) {
          const a = colA.visibleIndex, b = colB.visibleIndex;
          return a > b ? 1 : a < b ? -1 : 0;
    }

    /**
     * Restores the grid filtering state, i.e. sets the `filteringExpressionsTree` property value.
     */
    private restoreFiltering(state: FilteringExpressionsTree) {
        const filterTree = this.createExpressionsTreeFromObject(state);
        this.grid.filteringExpressionsTree = filterTree;
    }

    /**
     * Restores the grid advanced filtering state, i.e. sets the `advancedFilteringExpressionsTree` property value.
     */
    private restoreAdvancedFiltering(state) {
        const advFilterTree = this.createExpressionsTreeFromObject(state);
        this.grid.advancedFilteringExpressionsTree = advFilterTree;
    }

    /**
     * Restores the grid sorting state, i.e. sets the `sortingExpressions` property value.
     */
    private restoreSorting(state: ISortingExpression | ISortingExpression[]) {
        const strategy = DefaultSortingStrategy.instance();

        if (Array.isArray(state)) {
            (state as ISortingExpression[]).forEach((expr) => expr.strategy = strategy);
        } else {
            (state as ISortingExpression).strategy = strategy;
        }

        this.grid.sortingExpressions = state;
    }

    /**
     * Restores the grid grouping state, i.e. sets the `groupbyExpressions` property value.
     */
    private restoreGroupBy(state: IGroupingExpression | IGroupingExpression[]) {
        const strategy = DefaultSortingStrategy.instance();

        if (Array.isArray(state)) {
            (state as IGroupingExpression[]).forEach((expr) => expr.strategy = strategy);
        } else {
            (state as IGroupingExpression).strategy = strategy;
        }

        this.grid.groupingExpressions = state;
    }

    /**
     * Restores the grid paging state, i.e. sets the `perPage` property value and paginate to index.
     */
    private restorePaging(state: IPagingState) {
        if (this.grid.perPage !== state.recordsPerPage) {
            this.grid.perPage = state.recordsPerPage;
            this.grid.cdr.detectChanges();
        }
        if (state.index > -1 && this.grid.page !== state.index) {
            this.grid.paginate(state.index);
        }
    }

    private restoreRowSelection(state: any[]) {
        this.grid.selectRows(state);
    }

    private restoreCellSelection(state: any[]) {
        state.forEach(r => {
            const range = { rowStart: r.rowStart, rowEnd: r.rowEnd, columnStart: r.columnStart, columnEnd: r.columnEnd};
            this.grid.selectRange(range);
        });
    }

    /**
     * This method builds a FilteringExpressionsTree from a provided object.
     */
    private createExpressionsTreeFromObject(exprTreeObject: any): FilteringExpressionsTree {
        if (!exprTreeObject || !exprTreeObject.filteringOperands) {
            return null;
        }

        const expressionsTree = new FilteringExpressionsTree(exprTreeObject.operator, exprTreeObject.fieldName);

        for (const item of exprTreeObject.filteringOperands) {
            // Check if item is an expressions tree or a single expression.
            if (item.filteringOperands) {
                const subTree = this.createExpressionsTreeFromObject((item as FilteringExpressionsTree));
                expressionsTree.filteringOperands.push(subTree);
            } else {
                const expr = item as IFilteringExpression;
                let dataType: string;
                if (this.grid.columnList.length > 0) {
                    dataType = this.grid.columnList.find(c => c.field === expr.fieldName).dataType;
                } else {
                    dataType = this.state[COLUMNS].find(c => c.field === expr.fieldName).dataType;
                }
                expr.condition = this.generateFilteringCondition(dataType, expr.condition.name);
                expr.searchVal = (dataType === 'date') ? new Date(Date.parse(expr.searchVal)) : expr.searchVal;
                expressionsTree.filteringOperands.push(expr);
            }
        }

        return expressionsTree;
    }

    /**
     * Returns the filtering logic function for a given dataType and condition (contains, greaterThan, etc.)
     */
    private generateFilteringCondition(dataType: string, name: string): any {
        let filters;
        switch (dataType) {
            case DataType.Boolean:
                filters = IgxBooleanFilteringOperand.instance();
                break;
            case DataType.Number:
                filters = IgxNumberFilteringOperand.instance();
                break;
            case DataType.Date:
                filters = IgxDateFilteringOperand.instance();
                break;
            case DataType.String:
            default:
                filters = IgxStringFilteringOperand.instance();
                break;
        }
        return filters.condition(name);
    }

    private stringifyCallback(key: string, val: any) {
        if (key === 'searchVal' && val instanceof Set) {
            return Array.from(val);
        }
        return val;
    }

    private parseCallback(key: string, val: any) {
        if (key === 'searchVal' && Array.isArray(val)) {
            return new Set(val);
        }
        return val;
    }
}

/**
 * @hidden
 */
@NgModule({
    declarations: [IgxGridStateDirective],
    exports: [IgxGridStateDirective]
})
export class IgxGridStateModule { }
