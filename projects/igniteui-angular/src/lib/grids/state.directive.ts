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

export interface IGridState {
    columns: IColumnState[];
    filtering: FilteringExpressionsTree;
    advancedFiltering: FilteringExpressionsTree;
    sorting: ISortingExpression[];
    groupby: IGroupingExpression[];
    paging: IPagingState;
    selection: any[];
}

interface IGridStateOptions {
    columns?: boolean;
    filtering?: boolean;
    advancedFiltering?: boolean;
    sorting?: boolean;
    groupby?: boolean;
    paging?: boolean;
    selection?: boolean;
}

interface IColumnState {
    pinned: boolean;
    sortable: boolean;
    filterable: boolean;
    editable: boolean;
    groupable: boolean;
    movable: boolean;
    hidden: boolean;
    dataType: string;
    summaries?: any;
    hasSummary: boolean;
    field: string;
    width: any;
    header: string;
    resizable: boolean;
}

// TODO Collapsible column groups

const ACTION_COLUMNS = 'columns';
const ACTION_FILTERING = 'filtering';
const ACTION_ADVANCED_FILTERING = 'advancedFiltering';
const ACTION_SORTING = 'sorting';
const ACTION_GROUPBY = 'groupby';
const ACTION_PAGING = 'paging';
const ACTION_SELECTION = 'selection';

@Directive({
    selector: '[igxGridState]'
})
export class IgxGridStateDirective {

    private _options: IGridStateOptions = {
        columns: true,
        filtering: true,
        advancedFiltering: true,
        sorting: true,
        groupby: true,
        paging: true,
        selection: true,
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

    constructor(@Inject(INTERFACE_TOKEN) @Self() @Optional() private grid) { }

    /**
     * Sets the state of a feature or states of all grid features, depending on the state object passed as an argument.
     * Pass an IGridState object to set the state for all features, or IPagingState object to set the paging state only.
     * returns an object containing all grid features states that are enabled through the `options` property.
     * ```html
     * <igx-grid [igxGridState]="options"></igx-grid>
     * ```
     * ```typescript
     * @ViewChild(IgxGridStateDirective, { static: true }) public state;
     * const gridState = window.localStorage.getItem(key);
     * this.state.setState(gridState);
     * ```
     */
    public setState(state: IGridState |
        IColumnState |
        IFilteringExpressionsTree |
        ISortingExpression |
        IGroupingExpression |
        IPagingState | string) {
        if (typeof state === 'string') {
            state = JSON.parse(state as string, this.parseCallback) as string;
        }
        this.state = state as IGridState | IColumnState | IFilteringExpressionsTree |
            ISortingExpression | IGroupingExpression | IPagingState;
        this.restoreGridState(this.state);
    }

    /**
     * Gets the state of a feature or states of all grid features.
     * If a feature name is not passed as an argument,
     * returns an object containing all grid features states that are enabled through the `options` property.
     * The optional `serialize` argument determines whether the returned object will be serialized to a JSON string. Default value is false.
     * ```html
     * <igx-grid [igxGridState]="options"></igx-grid>
     * ```
     * ```typescript
     * @ViewChild(IgxGridStateDirective, { static: true }) public state;
     * let state =  this.state.getState();
     * ```
     */
    public getState(serialize = true, feature?: string | string[]): IGridState |
        IColumnState |
        IFilteringExpressionsTree |
        ISortingExpression |
        IGroupingExpression |
        IPagingState | string  {
        let state: IGridState |
            IColumnState |
            IFilteringExpressionsTree |
            ISortingExpression |
            IGroupingExpression |
            IPagingState | string;
        if (feature) {
            if (Array.isArray(feature)) {
                feature.forEach(f => {
                    state[f] = this.getGridFeature(f);
                });
            } else {
                state[feature] = this.getGridFeature(feature);
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
     * Helper method that creates a new array with the current grid columns.
     */
    public restoreGridState(state) {
        for (const key of Object.keys(state)) {
            this.restoreFeature(key, state[key]);
        }
    }

    /**
     * Restores the state of a feature.
     */
    private restoreFeature(feature: string, state: any) {
        switch (feature) {
            case ACTION_COLUMNS: {
               this.restoreColumns(state);
               break;
            }
            case ACTION_FILTERING: {
                this.restoreFiltering(state);
                break;
            }
            case ACTION_ADVANCED_FILTERING: {
                state = this.getAdvancedFiltering();
                break;
            }
            case ACTION_SORTING: {
                this.restoreSorting(state);
                break;
             }
             case ACTION_GROUPBY: {
                this.restoreGroupBy(state);
                break;
             }
             case ACTION_PAGING: {
                this.restorePaging(state);
                break;
              }
              case ACTION_SELECTION: {
                state = this.getSelection();
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
            case ACTION_COLUMNS: {
               state = this.getColumns();
               break;
            }
            case ACTION_FILTERING: {
                state = this.getFiltering();
                break;
            }
            case ACTION_ADVANCED_FILTERING: {
                state = this.getAdvancedFiltering();
                break;
            }
            case ACTION_SORTING: {
                state = this.getSorting();
                break;
             }
             case ACTION_GROUPBY: {
                state = this.getGroupBy();
                break;
             }
             case ACTION_PAGING: {
                state = this.getPaging();
                break;
              }
              case ACTION_SELECTION: {
                state = this.getSelection();
                break;
              }
         }
         return state;
    }

    /**
     * Helper method that creates a new array with the current grid columns.
     */
    private getColumns() {
        const gridColumns = this.grid.columns.map((c) => {
            return {
                pinned: c.pinned,
                sortable: c.sortable,
                filterable: c.filterable,
                editable: c.editable,
                movable: c.movable,
                hidden: c.hidden,
                dataType: c.dataType,
                hasSummary: c.hasSummary,
                field: c.field,
                width: c.width,
                header: c.header,
                resizable: c.resizable
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
        return { groupby: groupingState };
    }

    private getSelection() {
        const selection = this.grid.selectedRows();
        return { selection: selection };
    }

    /**
     * Restores the grid columns by modifying the `columnList` collection of the grid.
     */
    private restoreColumns(columns: IColumnState[]): void {
        const newColumns = [];
        const factory = (this.grid as any).resolver.resolveComponentFactory(IgxColumnComponent);
        columns.forEach((col) => {
            const ref = factory.create(this.grid.viewRef.injector);
            ref.instance.field = col.field;
            ref.instance.dataType = col.dataType;
            ref.instance.sortable = col.sortable;
            ref.instance.groupable = col.groupable;
            ref.instance.editable = col.editable;
            ref.instance.filterable = col.filterable;
            ref.instance.resizable = col.resizable;
            ref.instance.movable = col.movable;
            ref.instance.width = col.width;
            ref.instance.pinned = col.pinned;
            ref.instance.hidden = col.hidden;
            ref.instance.hasSummary = col.hasSummary;
            ref.instance.header = col.header;
            ref.changeDetectorRef.detectChanges();
            newColumns.push(ref.instance);
        });

        this.grid.columnList.reset(newColumns);
        this.grid.columnList.notifyOnChanges();
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
        const advFilterTree = this.createExpressionsTreeFromObject(state.advancedFiltering);
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

    private restoreSelection(state: any[]) {
        this.grid.selectRows(state);
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
                const dataType = this.state[ACTION_COLUMNS].find(c => c.field === expr.fieldName).dataType;
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
