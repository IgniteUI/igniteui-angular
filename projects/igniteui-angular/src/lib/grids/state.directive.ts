import { Directive, Optional, Input, NgModule, Host, ComponentFactoryResolver, ViewContainerRef } from '@angular/core';
import { ISortingExpression } from '../data-operations/sorting-expression.interface';
import { FilteringExpressionsTree, IFilteringExpressionsTree } from '../data-operations/filtering-expressions-tree';
import { IFilteringExpression } from '../data-operations/filtering-expression.interface';
import { IgxColumnComponent } from './columns/column.component';
import { IGroupingExpression } from '../data-operations/grouping-expression.interface';
import { IPagingState } from '../data-operations/paging-state.interface';
import { DataType } from '../data-operations/data-util';
import { IgxBooleanFilteringOperand, IgxNumberFilteringOperand, IgxDateFilteringOperand,
    IgxStringFilteringOperand, IFilteringOperation} from '../data-operations/filtering-condition';
import { GridSelectionRange } from './selection/selection.service';
import { IGroupByExpandState } from '../data-operations/groupby-expand-state.interface';
import { IGroupingState } from '../data-operations/groupby-state.interface';
import { IPinningConfig } from './common/grid.interface';
import { IgxGridBaseDirective } from './grid-base.directive';
import { IgxGridComponent } from './grid/grid.component';

export interface IGridState {
    columns?: IColumnState[];
    filtering?: IFilteringExpressionsTree;
    advancedFiltering?: IFilteringExpressionsTree;
    paging?: IPagingState;
    sorting?: ISortingExpression[];
    groupBy?: IGroupingState;
    cellSelection?: GridSelectionRange[];
    rowSelection?: any[];
    columnSelection?: string[];
    rowPinning?: any[];
    pinningConfig?: IPinningConfig;
    expansion?: any[];
}

export interface IGridStateOptions {
    columns?: boolean;
    filtering?: boolean;
    advancedFiltering?: boolean;
    sorting?: boolean;
    paging?: boolean;
    cellSelection?: boolean;
    rowSelection?: boolean;
    columnSelection?: boolean;
    rowPinning?: boolean;
    pinningConfig?: boolean;
    expansion?: boolean;
    groupBy?: boolean;
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
    dataType: DataType;
    hasSummary: boolean;
    field: string;
    width: any;
    header: string;
    resizable: boolean;
    searchable: boolean;
}

export enum GridFeatures {
    COLUMNS = 'columns',
    FILTERING = 'filtering',
    ADVANCED_FILTERING = 'advancedFiltering',
    SORTING = 'sorting',
    PAGING = 'paging',
    ROW_PINNING = 'rowPinning',
    PINNING_CONFIG = 'pinningConfig',
    CELL_SELECTION = 'cellSelection',
    ROW_SELECTION = 'rowSelection',
    COLUMN_SELECTION = 'columnSelection',
    EXPANSION = 'expansion'
}

export enum FlatGridFeatures {
    GROUP_BY = 'groupBy',
}

@Directive({
    selector: '[igxGridState]'
})
export class IgxGridStateDirective {

    private _options: IGridStateOptions = {
        columns: true,
        filtering: true,
        advancedFiltering: true,
        sorting: true,
        paging: true,
        cellSelection: true,
        rowSelection: true,
        columnSelection: true,
        rowPinning: true,
        expansion: true,
        groupBy: true
    };

    private state: IGridState;

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
        if (!(this.grid instanceof IgxGridComponent)) {
            this._options.groupBy = false;
        }
        Object.assign(this._options, value);
    }

    /**
     * @hidden
     */
    constructor(
        @Host() @Optional() public grid: IgxGridBaseDirective,
        private resolver: ComponentFactoryResolver,
        protected viewRef: ViewContainerRef) { }

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
            state = this.getAllGridFeatures();
        }
        if (serialize) {
            state = JSON.stringify(state, this.stringifyCallback);
            return state as string;
        } else {
            return state as IGridState;
        }
    }

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
            state = JSON.parse(state);
        }
        this.state = state as IGridState;
        this.restoreGridState();
        this.grid.cdr.detectChanges();
    }

    /**
     * The method that calls corresponding methods to restore feature from this.state object.
     */
    private restoreGridState() {
        for (const key of Object.keys(this.state)) {
            const state = this.state[key];
            if (state) {
                this.restoreFeature(key, state);
            }
        }
    }

    /**
     * Restores the state of a feature.
     */
    private restoreFeature(feature: string, state: IColumnState[] | IPagingState | ISortingExpression[] |
        IGroupingState | FilteringExpressionsTree | GridSelectionRange[] | any[]) {
        switch (feature) {
            case GridFeatures.COLUMNS: {
               this.restoreColumns(state as IColumnState[]);
               break;
            }
            case GridFeatures.FILTERING: {
                this.restoreFiltering(state as FilteringExpressionsTree);
                break;
            }
            case GridFeatures.ADVANCED_FILTERING: {
                this.restoreAdvancedFiltering(state as FilteringExpressionsTree);
                break;
            }
            case GridFeatures.SORTING: {
                this.restoreSorting(state as ISortingExpression[]);
                break;
             }
             case FlatGridFeatures.GROUP_BY: {
                this.restoreGroupBy(state as IGroupingState);
                break;
             }
             case GridFeatures.PAGING: {
                this.restorePaging(state as IPagingState);
                break;
              }
              case GridFeatures.ROW_SELECTION: {
                this.restoreRowSelection(state as any[]);
                break;
              }
              case GridFeatures.ROW_PINNING: {
                this.restoreRowPinning(state as any[]);
                break;
              }
              case GridFeatures.PINNING_CONFIG: {
                this.restorePinningConfig(state as IPinningConfig);
                break;
              }
              case GridFeatures.CELL_SELECTION: {
                this.restoreCellSelection(state as GridSelectionRange[]);
                break;
              }
              case GridFeatures.COLUMN_SELECTION: {
                this.restoreColumnSelection(state as string[]);
                break;
              }
              case GridFeatures.EXPANSION: {
                this.restoreExpansion(state as string[]);
                break;
              }
         }
    }

    /**
     * Returns an object containing all grid features state.
     */
    private getAllGridFeatures(): IGridState {
        let gridState: IGridState = {};

        for (const key of Object.keys(this.options)) {
            let feature: IGridState;
            if (this.options[key]) {
                feature = this.getGridFeature(key);
                gridState =  Object.assign(gridState, feature);
            }
        }

        gridState = Object.assign({}, gridState);
        return gridState;
    }

    /**
     * Restores an object containing the state for a grid feature.
     * `serialize` param determines whether the returned object will be serialized to a JSON string. Default value is false.,
     */
    private getGridFeature(feature: string): IGridState {
        const state: IGridState = {};
        switch (feature) {
            case GridFeatures.COLUMNS: {
               Object.assign(state, this.getColumns());
               break;
            }
            case GridFeatures.FILTERING: {
                Object.assign(state, this.getFiltering());
                break;
            }
            case GridFeatures.ADVANCED_FILTERING: {
                Object.assign(state, this.getAdvancedFiltering());
                break;
            }
            case GridFeatures.SORTING: {
                Object.assign(state, this.getSorting());
                break;
             }
             case FlatGridFeatures.GROUP_BY: {
                Object.assign(state, this.getGroupBy());
                break;
             }
             case GridFeatures.PAGING: {
                Object.assign(state, this.getPaging());
                break;
              }
              case GridFeatures.ROW_SELECTION: {
                Object.assign(state, this.getRowSelection());
                break;
              }
              case GridFeatures.ROW_PINNING: {
                Object.assign(state, this.getRowPinning());
                break;
              }
              case GridFeatures.PINNING_CONFIG: {
                Object.assign(state, this.getPinningConfig());
                break;
              }
              case GridFeatures.CELL_SELECTION: {
                Object.assign(state, this.getCellSelection());
                break;
              }
              case GridFeatures.COLUMN_SELECTION: {
                Object.assign(state, this.getColumnSelection());
                break;
              }
              case GridFeatures.EXPANSION: {
                Object.assign(state, this.getExpansion());
                break;
              }
         }
         return state;
    }

    /**
     * Helper method that creates a new array with the current grid columns.
     */
    private getColumns(): IGridState {
        const gridColumns: IColumnState[] = this.grid.columns.sort(this.sortByVisibleIndex).map((c) => {
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
                searchable: c.searchable
            };
        });
        return { columns: gridColumns };
    }

    private getFiltering(): IGridState {
        const filteringState = this.grid.filteringExpressionsTree;
        return { filtering: filteringState };
    }

    private getAdvancedFiltering(): IGridState {
        const advancedFiltering = this.grid.advancedFilteringExpressionsTree;
        return { advancedFiltering: advancedFiltering };
    }

    private getPaging(): IGridState {
        const pagingState = this.grid.pagingState;
        return { paging: pagingState };
    }

    private getSorting(): IGridState {
        const sortingState = this.grid.sortingExpressions;
        sortingState.forEach(s => {
            delete s.strategy;
        });
        return { sorting: sortingState };
    }

    private getGroupBy(): IGridState {
        const groupingExpressions = (this.grid as IgxGridComponent).groupingExpressions;
        groupingExpressions.forEach(expr => {
            delete expr.strategy;
        });
        const expansionState = (this.grid as IgxGridComponent).groupingExpansionState;
        const groupsExpanded = (this.grid as IgxGridComponent).groupsExpanded;

        return { groupBy: { expressions: groupingExpressions, expansion: expansionState, defaultExpanded: groupsExpanded}  };
    }

    private getRowSelection(): IGridState {
        const selection = this.grid.selectedRows();
        return { rowSelection: selection };
    }

    private getRowPinning(): IGridState {
        const pinned = this.grid.pinnedRows.map(x => x.rowID);
        return { rowPinning: pinned };
    }

    private getPinningConfig(): IGridState {
        return { pinningConfig: this.grid.pinning };
    }

    private getColumnSelection(): IGridState {
        const selection = this.grid.selectedColumns().map(c => c.field);
        return { columnSelection: selection };
    }

    private getCellSelection(): IGridState {
        const selection = this.grid.getSelectedRanges().map(range => {
            return { rowStart: range.rowStart, rowEnd: range.rowEnd, columnStart: range.columnStart, columnEnd: range.columnEnd };
        });
        return { cellSelection: selection };
    }

    private getExpansion(): IGridState {
        const expansionStates = Array.from(this.grid.expansionStates);
        return { expansion: expansionStates };
    }

    /**
     * Restores the grid columns by modifying the `columnList` collection of the grid.
     */
    private restoreColumns(columnsState: IColumnState[]): void {
        const newColumns = [];
        const factory = this.resolver.resolveComponentFactory(IgxColumnComponent);
        columnsState.forEach((colState) => {
            const ref = factory.create(this.viewRef.injector);
            Object.assign(ref.instance, colState);
            ref.changeDetectorRef.detectChanges();
            newColumns.push(ref.instance);
        });

        this.grid.columnList.reset(newColumns);
        this.grid.columnList.notifyOnChanges();
    }

    private sortByVisibleIndex(colA: IgxColumnComponent, colB: IgxColumnComponent) {
          const a = colA.visibleIndex, b = colB.visibleIndex;
          return a > b ? 1 : a < b ? -1 : 0;
    }

    /**
     * Restores the grid filtering state, i.e. sets the `filteringExpressionsTree` property value.
     */
    private restoreFiltering(state: FilteringExpressionsTree) {
        const filterTree = this.createExpressionsTreeFromObject(state);
        this.grid.filteringExpressionsTree = filterTree as FilteringExpressionsTree;
    }

    /**
     * Restores the grid advanced filtering state, i.e. sets the `advancedFilteringExpressionsTree` property value.
     */
    private restoreAdvancedFiltering(state: FilteringExpressionsTree) {
        const advFilterTree = this.createExpressionsTreeFromObject(state);
        this.grid.advancedFilteringExpressionsTree = advFilterTree as FilteringExpressionsTree;
    }

    /**
     * Restores the grid sorting state, i.e. sets the `sortingExpressions` property value.
     */
    private restoreSorting(state: ISortingExpression[]) {
        this.grid.sortingExpressions = state;
    }

    /**
     * Restores the grid grouping state, i.e. sets the `groupbyExpressions` property value.
     */
    private restoreGroupBy(state: IGroupingState) {
        (this.grid as IgxGridComponent).groupingExpressions = state.expressions as IGroupingExpression[];
        if ((this.grid as IgxGridComponent).groupsExpanded !== state.defaultExpanded) {
            (this.grid as IgxGridComponent).toggleAllGroupRows();
        } else {
            (this.grid as IgxGridComponent).groupingExpansionState = state.expansion as IGroupByExpandState[];
        }
    }

    /**
     * Restores the grid paging state, i.e. sets the `perPage` property value and paginate to index.
     */
    private restorePaging(state: IPagingState) {
        if (this.grid.perPage !== state.recordsPerPage) {
            this.grid.perPage = state.recordsPerPage;
            this.grid.cdr.detectChanges();
        }
        this.grid.page = state.index;
    }

    private restoreRowSelection(state: any[]) {
        this.grid.selectRows(state);
    }

    private restoreRowPinning(state: any[]) {
        // clear current state.
        this.grid.pinnedRows.forEach(row => row.unpin());
        state.forEach(rowID => this.grid.pinRow(rowID));
    }

    private restorePinningConfig(state: IPinningConfig) {
        this.grid.pinning = state;
    }

    private restoreColumnSelection(state: string[]) {
        this.grid.selectColumns(state);
    }

    private restoreCellSelection(state: GridSelectionRange[]) {
        state.forEach(r => {
            const range = { rowStart: r.rowStart, rowEnd: r.rowEnd, columnStart: r.columnStart, columnEnd: r.columnEnd};
            this.grid.selectRange(range);
        });
    }

    /**
     * Helper method that restores expansion states for the grid.
     */
    private restoreExpansion(state: any[]) {
        const expansionStates = new Map<any, boolean>(state);
        this.grid.expansionStates = expansionStates;
    }

    /**
     * This method builds a FilteringExpressionsTree from a provided object.
     */
    private createExpressionsTreeFromObject(exprTreeObject: FilteringExpressionsTree): FilteringExpressionsTree {
        if (!exprTreeObject || !exprTreeObject.filteringOperands) {
            return null;
        }

        const expressionsTree = new FilteringExpressionsTree(exprTreeObject.operator, exprTreeObject.fieldName);

        for (const item of exprTreeObject.filteringOperands) {
            // Check if item is an expressions tree or a single expression.
            if ((item as FilteringExpressionsTree).filteringOperands) {
                const subTree = this.createExpressionsTreeFromObject((item as FilteringExpressionsTree));
                expressionsTree.filteringOperands.push(subTree);
            } else {
                const expr = item as IFilteringExpression;
                let dataType: string;
                if (this.grid.columnList.length > 0) {
                    dataType = this.grid.columnList.find(c => c.field === expr.fieldName).dataType;
                } else {
                    dataType = this.state.columns.find(c => c.field === expr.fieldName).dataType;
                }
                // when ESF, values are stored in Set.
                // First those values are converted to an array before returning string in the stringifyCallback
                // now we need to convert those back to Set
                if (Array.isArray(expr.searchVal)) {
                    expr.searchVal = new Set(expr.searchVal);
                } else {
                    expr.searchVal = (dataType === 'date') ? new Date(Date.parse(expr.searchVal)) : expr.searchVal;
                }
                expr.condition = this.generateFilteringCondition(dataType, expr.condition.name);
                expressionsTree.filteringOperands.push(expr);
            }
        }

        return expressionsTree;
    }

    /**
     * Returns the filtering logic function for a given dataType and condition (contains, greaterThan, etc.)
     */
    private generateFilteringCondition(dataType: string, name: string): IFilteringOperation {
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
}

/**
 * @hidden
 */
@NgModule({
    declarations: [IgxGridStateDirective],
    exports: [IgxGridStateDirective]
})
export class IgxGridStateModule { }
