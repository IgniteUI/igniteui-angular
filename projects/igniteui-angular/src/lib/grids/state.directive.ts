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
import { IgxGridBaseDirective } from './grid-base.directive';
import { IgxGridComponent } from './grid/grid.component';
import { IPinningConfig } from './grid.common';

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
    rowIslands?: IGridStateCollection[];
    id?: string;
}

export interface IGridStateCollection {
    id: string;
    state: IGridState;
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
    inheritance?: boolean;
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
    EXPANSION = 'expansion',
    ROW_ISLANDS = 'rowIslands'
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
        groupBy: true,
        inheritance: true
    };

    private state: IGridState;
    private currGrid: IgxGridBaseDirective;
    private features = [];

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
        if (!(this.grid instanceof IgxGridComponent)) {
            delete this._options.groupBy;
            delete this._options.rowPinning;
        } else {
            delete this._options.inheritance;
        }
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
     * @param `serialize` determines whether the returned object will be serialized to JSON string. Default value is true.
     * @param `feature` string or array of strings determining the features to be added in the state. If skipped, all features are added.
     * @returns Returns the serialized to JSON string IGridState object, or the non-serialized IGridState object.
     * ```html
     * <igx-grid [igxGridState]="options"></igx-grid>
     * ```
     * ```typescript
     * @ViewChild(IgxGridStateDirective, { static: true }) public state;
     * let state = this.state.getState(); // returns string
     * let state = this.state(false) // returns `IGridState` object
     * ```
     */
    public getState(serialize = true, features?: string | string[]): IGridState | string  {
        let state: IGridState | string;
        this.currGrid = this.grid;
        this.state = state = this.buildState(features) as IGridState;
        if (serialize) {
            state = JSON.stringify(state, this.stringifyCallback) as string;
        }
        return state;
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
    public setState(state: IGridState | string, features?: string | string[]) {
        if (typeof state === 'string') {
            state = JSON.parse(state) as IGridState;
        }
        this.currGrid = this.grid;
        this.restoreGridState(state, features);
        this.grid.cdr.detectChanges(); // TODO
    }

    /**
     * Builds an IGridState object.
     */
    private buildState(features?: string | string[]): IGridState {
        this.applyFeatures(features);
        let gridState = {} as IGridState;
        this.features.forEach(f => {
            f = f === 'inheritance' ? GridFeatures.ROW_ISLANDS : f;
            if (!(this.grid instanceof IgxGridComponent) && (f === 'groupBy' || f === 'rowPinning')) {
                return;
            }
            const featureState: IGridState = this.getFeatureState(f);
            gridState = Object.assign(gridState, featureState);
        });
        return gridState;
    }

    /**
     * The method that calls corresponding methods to restore features from the passed IGridState object.
     */
    private restoreGridState(state: IGridState, features?: string | string[]) {
        this.applyFeatures(features);
        this.features.forEach(f => {
            if (this.options[f]) {
                f = f === 'inheritance' ? GridFeatures.ROW_ISLANDS : f;
                const featureState = state[f];
                if (featureState) {
                    this.restoreFeature(f, featureState);
                }
            }
        });
    }

    /**
     * Returns an IGridState object with the state for the passed feature.
     */
    private getFeatureState(feature: string): IGridState {
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
              case GridFeatures.ROW_ISLANDS: {
                Object.assign(state, this.getRowIslands());
                break;
              }
         }
         return state;
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
              case GridFeatures.ROW_ISLANDS: {
                this.restoreRowIslands(state as any);
                break;
              }
         }
    }

    /**
     * Helper method that creates a new array with the current grid columns.
     */
    private getColumns(): IGridState {
        const gridColumns: IColumnState[] = this.currGrid.columns.map((c) => {
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
                selectable: c.selectable
            };
        });
        return { columns: gridColumns };
    }

    private getFiltering(): IGridState {
        const filteringState = this.currGrid.filteringExpressionsTree;
        return { filtering: filteringState };
    }

    private getAdvancedFiltering(): IGridState {
        const advancedFiltering = this.currGrid.advancedFilteringExpressionsTree;
        return { advancedFiltering: advancedFiltering };
    }

    private getPaging(): IGridState {
        const pagingState = this.currGrid.pagingState;
        return { paging: pagingState };
    }

    private getSorting(): IGridState {
        const sortingState = this.currGrid.sortingExpressions;
        sortingState.forEach(s => {
            delete s.strategy;
        });
        return { sorting: sortingState };
    }

    private getGroupBy(): IGridState {
        const grid = this.currGrid as IgxGridComponent;
        const groupingExpressions = grid.groupingExpressions;
        groupingExpressions.forEach(expr => {
            delete expr.strategy;
        });
        const expansionState = grid.groupingExpansionState;
        const groupsExpanded = grid.groupsExpanded;

        return { groupBy: { expressions: groupingExpressions, expansion: expansionState, defaultExpanded: groupsExpanded}  };
    }

    private getRowSelection(): IGridState {
        const selection = this.currGrid.selectedRows();
        return { rowSelection: selection };
    }

    private getRowPinning(): IGridState {
        const pinned = this.currGrid.pinnedRows.map(x => x.rowID);
        return { rowPinning: pinned };
    }

    private getPinningConfig(): IGridState {
        return { pinningConfig: this.currGrid.pinning };
    }

    private getColumnSelection(): IGridState {
        const selection = this.currGrid.selectedColumns().map(c => c.field);
        return { columnSelection: selection };
    }

    private getCellSelection(): IGridState {
        const selection = this.currGrid.getSelectedRanges().map(range => {
            return { rowStart: range.rowStart, rowEnd: range.rowEnd, columnStart: range.columnStart, columnEnd: range.columnEnd };
        });
        return { cellSelection: selection };
    }

    private getExpansion(): IGridState {
        const expansionStates = Array.from(this.currGrid.expansionStates);
        return { expansion: expansionStates };
    }

    private getRowIslands(): IGridState {
        const childGridStates: IGridStateCollection[] = [];
        const rowIslands = (this.currGrid as any).allLayoutList;
        if (rowIslands) {
            rowIslands.forEach(rowIslandComponent => {
                this.currGrid = rowIslandComponent.rowIslandAPI.getChildGrids()[0];
                if (this.currGrid) {
                    const rowIslandState = this.buildState(this.features) as IGridState;
                    childGridStates.push({ id: `${rowIslandComponent.id}`, state: rowIslandState });
                }
            });
        }
        this.currGrid = this.grid;
        return { rowIslands: childGridStates };
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

        this.currGrid.columnList.reset(newColumns);
        this.currGrid.columnList.notifyOnChanges();
    }

    /**
     * Restores the grid filtering state, i.e. sets the `filteringExpressionsTree` property value.
     */
    private restoreFiltering(state: FilteringExpressionsTree) {
        const filterTree = this.createExpressionsTreeFromObject(state);
        this.currGrid.filteringExpressionsTree = filterTree as FilteringExpressionsTree;
    }

    /**
     * Restores the grid advanced filtering state, i.e. sets the `advancedFilteringExpressionsTree` property value.
     */
    private restoreAdvancedFiltering(state: FilteringExpressionsTree) {
        const advFilterTree = this.createExpressionsTreeFromObject(state);
        this.currGrid.advancedFilteringExpressionsTree = advFilterTree as FilteringExpressionsTree;
    }

    /**
     * Restores the grid sorting state, i.e. sets the `sortingExpressions` property value.
     */
    private restoreSorting(state: ISortingExpression[]) {
        this.currGrid.sortingExpressions = state;
    }

    /**
     * Restores the grid grouping state, i.e. sets the `groupbyExpressions` property value.
     */
    private restoreGroupBy(state: IGroupingState) {
        const grid = this.currGrid as IgxGridComponent;
        grid.groupingExpressions = state.expressions as IGroupingExpression[];
        if (grid.groupsExpanded !== state.defaultExpanded) {
            grid.toggleAllGroupRows();
        } else {
            grid.groupingExpansionState = state.expansion as IGroupByExpandState[];
        }
    }

    /**
     * Restores the grid paging state, i.e. sets the `perPage` property value and paginate to index.
     */
    private restorePaging(state: IPagingState) {
        if (this.currGrid.perPage !== state.recordsPerPage) {
            this.currGrid.perPage = state.recordsPerPage;
            this.currGrid.cdr.detectChanges();
        }
        this.currGrid.page = state.index;
    }

    private restoreRowSelection(state: any[]) {
        this.currGrid.selectRows(state);
    }

    private restoreRowPinning(state: any[]) {
        // clear current state.
        this.currGrid.pinnedRows.forEach(row => row.unpin());
        state.forEach(rowID => this.currGrid.pinRow(rowID));
    }

    private restorePinningConfig(state: IPinningConfig) {
        this.currGrid.pinning = state;
    }

    private restoreColumnSelection(state: string[]) {
        this.currGrid.selectColumns(state);
    }

    private restoreCellSelection(state: GridSelectionRange[]) {
        state.forEach(r => {
            const range = { rowStart: r.rowStart, rowEnd: r.rowEnd, columnStart: r.columnStart, columnEnd: r.columnEnd};
            this.currGrid.selectRange(range);
        });
    }

    /**
     * Restores expansion states for the grid, i.e expand/collapse rows.
     */
    private restoreExpansion(state: any[]) {
        const expansionStates = new Map<any, boolean>(state);
        this.currGrid.expansionStates = expansionStates;
    }

    /**
     * Restores grid state for each nested grid inside an IgxHierarchicalGridComponent.
     */
    private restoreRowIslands(state: IGridStateCollection[]) {
        const rowIslands = (this.currGrid as any).allLayoutList;
        if (rowIslands) {
            rowIslands.forEach(rowIslandComponent => {
                this.currGrid = rowIslandComponent.rowIslandAPI.getChildGrids()[0];
                const rowIslandState = state.find(st => st.id === rowIslandComponent.id);
                if (rowIslandState && this.currGrid) {
                    this.restoreGridState(rowIslandState.state, this.features);
                }
            });
        }
        this.currGrid = this.grid;
    }

    /**
     * Returns a collection of all grid features.
     */
    private applyFeatures(features?: string | string[]) {
        this.features = [];
        if (!features) {
            for (const feature of Object.keys(this.options)) {
                this.features.push(feature);
            }
        } else if (Array.isArray(features)) {
            this.features = [...features as string[]];
        } else {
            this.features.push(features);
        }
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
                if (this.currGrid.columnList.length > 0) {
                    dataType = this.currGrid.columnList.find(c => c.field === expr.fieldName).dataType;
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
