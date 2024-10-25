import { Directive, Optional, Input, Host, ViewContainerRef, Inject, createComponent, EnvironmentInjector, Injector } from '@angular/core';
import { FilteringExpressionsTree, IFilteringExpressionsTree } from '../data-operations/filtering-expressions-tree';
import { IFilteringExpression } from '../data-operations/filtering-expression.interface';
import { IgxColumnComponent } from './columns/column.component';
import { IgxColumnGroupComponent } from './columns/column-group.component';
import { IGroupingExpression } from '../data-operations/grouping-expression.interface';
import { IPagingState } from '../data-operations/paging-state.interface';
import { GridColumnDataType } from '../data-operations/data-util';
import {
    IgxBooleanFilteringOperand, IgxNumberFilteringOperand, IgxDateFilteringOperand,
    IgxStringFilteringOperand, IFilteringOperation, IgxDateTimeFilteringOperand
} from '../data-operations/filtering-condition';
import { IGroupByExpandState } from '../data-operations/groupby-expand-state.interface';
import { IGroupingState } from '../data-operations/groupby-state.interface';
import { IgxGridComponent } from './grid/grid.component';
import { IgxHierarchicalGridComponent } from './hierarchical-grid/hierarchical-grid.component';
import { GridSelectionRange } from './common/types';
import { ISortingExpression } from '../data-operations/sorting-strategy';
import { ColumnType, GridType, IGX_GRID_BASE, IPinningConfig } from './common/grid.interface';
import { IgxPivotGridComponent } from './pivot-grid/pivot-grid.component';
import { IPivotConfiguration, IPivotDimension } from './pivot-grid/pivot-grid.interface'
import { PivotUtil } from './pivot-grid/pivot-util';
import { IgxPivotDateDimension } from './pivot-grid/pivot-grid-dimensions';
import { cloneArray, cloneValue } from '../core/utils';
import { IgxColumnLayoutComponent } from './columns/column-layout.component';

export interface IGridState {
    columns?: IColumnState[];
    filtering?: IFilteringExpressionsTree;
    advancedFiltering?: IFilteringExpressionsTree;
    paging?: IPagingState;
    moving?: boolean;
    sorting?: ISortingExpression[];
    groupBy?: IGroupingState;
    cellSelection?: GridSelectionRange[];
    /* blazorPrimitiveValue */
    rowSelection?: any[];
    columnSelection?: string[];
    /* blazorPrimitiveValue */
    rowPinning?: any[];
    pinningConfig?: IPinningConfig;
    /* blazorPrimitiveValue */
    expansion?: any[];
    rowIslands?: IGridStateCollection[];
    id?: string;
    pivotConfiguration?: IPivotConfiguration;
}

/* marshalByValue */
export interface IGridStateCollection {
    id: string;
    parentRowID: any;
    state: IGridState;
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
    columnSelection?: boolean;
    rowPinning?: boolean;
    pinningConfig?: boolean;
    expansion?: boolean;
    rowIslands?: boolean;
    moving?: boolean;
    pivotConfiguration?: boolean;
}

/* marshalByValue */
/* tsPlainInterface */
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
    hidden: boolean;
    dataType: GridColumnDataType;
    hasSummary: boolean;
    field: string;
    width: any;
    header: string;
    resizable: boolean;
    searchable: boolean;
    columnGroup: boolean;
    // mrl props
    columnLayout?: boolean;
    rowStart?: number,
    rowEnd?: number,
    colStart?: number;
    colEnd?: number,
    /**
     * @deprecated
     */
    parent?: any;
    key: string;
    parentKey: string;
    disableHiding: boolean;
    disablePinning: boolean;
    collapsible?: boolean;
    expanded?: boolean;
    visibleWhenCollapsed?: boolean;
}

export type GridFeatures = keyof IGridStateOptions;

interface Feature {
    getFeatureState: (context: IgxGridStateBaseDirective) => IGridState;
    restoreFeatureState: (context: IgxGridStateBaseDirective, state: IColumnState[] | IPagingState | boolean | ISortingExpression[] |
        IGroupingState | IFilteringExpressionsTree | GridSelectionRange[] | IPinningConfig | IPivotConfiguration | any[]) => void;
}

/* blazorElement */
/* wcElementTag: igc-grid-state-base-directive */
/* blazorIndirectRender */
@Directive()
export class IgxGridStateBaseDirective {

    private featureKeys: GridFeatures[] = [];
    private state: IGridState;
    private currGrid: GridType;
    protected _options: IGridStateOptions = {
        columns: true,
        filtering: true,
        advancedFiltering: true,
        sorting: true,
        groupBy: true,
        paging: true,
        cellSelection: true,
        rowSelection: true,
        columnSelection: true,
        rowPinning: true,
        expansion: true,
        moving: true,
        rowIslands: true,
        pivotConfiguration: true
    };
    private FEATURES = {
        sorting:  {
            getFeatureState: (context: IgxGridStateBaseDirective): IGridState => {
                const sortingState = context.currGrid.sortingExpressions;
                sortingState.forEach(s => {
                    delete s.strategy;
                    delete s.owner;
                });
                return { sorting: sortingState };
            },
            restoreFeatureState: (context: IgxGridStateBaseDirective, state: ISortingExpression[]): void => {
                context.currGrid.sortingExpressions = state;
            }
        },
        filtering: {
            getFeatureState: (context: IgxGridStateBaseDirective): IGridState => {
                const filteringState = context.currGrid.filteringExpressionsTree;
                if (filteringState) {
                    delete filteringState.owner;
                    for (const item of filteringState.filteringOperands) {
                        delete (item as IFilteringExpressionsTree).owner;
                    }
                }
                return { filtering: filteringState };
            },
            restoreFeatureState: (context: IgxGridStateBaseDirective, state: FilteringExpressionsTree): void => {
                const filterTree = context.createExpressionsTreeFromObject(state);
                context.currGrid.filteringExpressionsTree = filterTree as FilteringExpressionsTree;
            }
        },
        advancedFiltering: {
            getFeatureState: (context: IgxGridStateBaseDirective): IGridState => {
                const filteringState = context.currGrid.advancedFilteringExpressionsTree;
                let advancedFiltering: any;
                if (filteringState) {
                    delete filteringState.owner;
                    for (const item of filteringState.filteringOperands) {
                        delete (item as IFilteringExpressionsTree).owner;
                    }
                    advancedFiltering = filteringState;
                } else {
                    advancedFiltering = {};
                }
                return { advancedFiltering };
            },
            restoreFeatureState: (context: IgxGridStateBaseDirective, state: FilteringExpressionsTree): void => {
                const filterTree = context.createExpressionsTreeFromObject(state);
                context.currGrid.advancedFilteringExpressionsTree = filterTree as FilteringExpressionsTree;
            }
        },
        columns: {
            getFeatureState: (context: IgxGridStateBaseDirective): IGridState => {
                const gridColumns: IColumnState[] = context.currGrid.columns.map((c) => ({
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
                    hidden: c.hidden,
                    dataType: c.dataType,
                    hasSummary: c.hasSummary,
                    field: c.field,
                    width: c.width,
                    header: c.header,
                    resizable: c.resizable,
                    searchable: c.searchable,
                    selectable: c.selectable,
                    key: c.columnGroup ? this.getColumnGroupKey(c) : c.field,
                    parentKey: c.parent ? this.getColumnGroupKey(c.parent) : undefined,
                    columnGroup: c.columnGroup,
                    columnLayout: c.columnLayout || undefined,
                    rowStart: c.parent?.columnLayout ? c.rowStart : undefined,
                    rowEnd: c.parent?.columnLayout ? c.rowEnd : undefined,
                    colStart: c.parent?.columnLayout ? c.colStart : undefined,
                    colEnd: c.parent?.columnLayout ? c.colEnd : undefined,
                    disableHiding: c.disableHiding,
                    disablePinning: c.disablePinning,
                    collapsible: c.columnGroup ? c.collapsible : undefined,
                    expanded: c.columnGroup ? c.expanded : undefined,
                    visibleWhenCollapsed: c.parent?.columnGroup ? (c as IgxColumnComponent).visibleWhenCollapsed : undefined
                }));
                return { columns: gridColumns };
            },
            restoreFeatureState: (context: IgxGridStateBaseDirective, state: IColumnState[]): void => {
                const newColumns = [];
                state.forEach((colState) => {
                    const hasColumnGroup = colState.columnGroup;
                    const hasColumnLayouts = colState.columnLayout;
                    delete colState.columnGroup;
                    delete colState.columnLayout;
                    if (hasColumnGroup) {
                        let ref1: IgxColumnGroupComponent = context.currGrid.columns.find(x => x.columnGroup && (colState.key ? this.getColumnGroupKey(x) === colState.key : x.header === colState.header)) as IgxColumnGroupComponent;
                        if (!ref1) {
                            const component = hasColumnLayouts ?
                            createComponent(IgxColumnLayoutComponent, { environmentInjector: this.envInjector, elementInjector: this.injector }) :
                            createComponent(IgxColumnGroupComponent, { environmentInjector: this.envInjector, elementInjector: this.injector });
                            ref1 = component.instance;
                            component.changeDetectorRef.detectChanges();
                        } else {
                            ref1.children.reset([]);
                        }
                        Object.assign(ref1, colState);
                        ref1.grid = context.currGrid;
                        if (colState.parent || colState.parentKey) {
                            const columnGroup: IgxColumnGroupComponent = newColumns.find(e => e.columnGroup && (e.key ? e.key === colState.parentKey : e.header === ref1.parent));
                            columnGroup.children.reset([...columnGroup.children.toArray(), ref1]);
                            ref1.parent = columnGroup;
                        }
                        ref1.cdr.detectChanges();
                        newColumns.push(ref1);
                    } else {
                        let ref: IgxColumnComponent = context.currGrid.columns.find(x => !x.columnGroup && x.field === colState.field) as IgxColumnComponent;
                        if (!ref) {
                            const component = createComponent(IgxColumnComponent, { environmentInjector: this.envInjector, elementInjector: this.injector});
                            ref = component.instance;
                            component.changeDetectorRef.detectChanges();
                        }

                        Object.assign(ref, colState);
                        ref.grid = context.currGrid;
                        if (colState.parent || colState.parentKey) {
                            const columnGroup: IgxColumnGroupComponent = newColumns.find(e =>  e.columnGroup && (e.key ? e.key === colState.parentKey : e.header === ref.parent));
                            if (columnGroup) {
                                ref.parent = columnGroup;
                                columnGroup.children.reset([...columnGroup.children.toArray(), ref]);
                            }
                        }
                        ref.cdr.detectChanges();
                        newColumns.push(ref);
                    }
                });
                context.currGrid.updateColumns(newColumns);
                newColumns.forEach(col => {
                    (context.currGrid as any).columnInit.emit(col);
                });
            }
        },
        groupBy: {
            getFeatureState: (context: IgxGridStateBaseDirective): IGridState => {
                const grid = context.currGrid as IgxGridComponent;
                const groupingExpressions = grid.groupingExpressions;
                groupingExpressions.forEach(expr => {
                    delete expr.strategy;
                });
                const expansionState = grid.groupingExpansionState;
                const groupsExpanded = grid.groupsExpanded;

                return { groupBy: { expressions: groupingExpressions, expansion: expansionState, defaultExpanded: groupsExpanded}  };
            },
            restoreFeatureState: (context: IgxGridStateBaseDirective, state: IGroupingState): void => {
                const grid = context.currGrid as IgxGridComponent;
                grid.groupingExpressions = state.expressions as IGroupingExpression[];
                state.expansion.forEach(exp => {
                    exp.hierarchy.forEach(h => {
                        const dataType = grid.columns.find(c => c.field === h.fieldName).dataType;
                        if (dataType.includes(GridColumnDataType.Date) || dataType.includes(GridColumnDataType.Time)) {
                            h.value = h.value ? new Date(Date.parse(h.value)) : h.value;
                        }
                    });
                });
                if (grid.groupsExpanded !== state.defaultExpanded) {
                    grid.toggleAllGroupRows();
                }
                grid.groupingExpansionState = state.expansion as IGroupByExpandState[];
            }
        },
        paging: {
            getFeatureState: (context: IgxGridStateBaseDirective): IGridState => {
                const pagingState = context.currGrid.pagingState;
                return { paging: pagingState };
            },
            restoreFeatureState: (context: IgxGridStateBaseDirective, state: IPagingState): void => {
                if (!context.currGrid.paginator) {
                    return;
                }
                if (context.currGrid.perPage !== state.recordsPerPage) {
                    context.currGrid.perPage = state.recordsPerPage;
                    context.currGrid.cdr.detectChanges();
                }
                context.currGrid.page = state.index;
            }
        },
        moving: {
            getFeatureState: (context: IgxGridStateBaseDirective): IGridState => {
                return { moving: context.currGrid.moving };
            },
            restoreFeatureState: (context: IgxGridStateBaseDirective, state: boolean): void => {
                context.currGrid.moving = state;
            }
        },
        rowSelection: {
            getFeatureState: (context: IgxGridStateBaseDirective): IGridState => {
                const selection = context.currGrid.selectionService.getSelectedRows();
                return { rowSelection: selection };
            },
            restoreFeatureState: (context: IgxGridStateBaseDirective, state: any[]): void => {
                context.currGrid.selectRows(state, true);
            }
        },
        cellSelection: {
            getFeatureState: (context: IgxGridStateBaseDirective): IGridState => {
                const selection = context.currGrid.getSelectedRanges().map(range =>
                    ({ rowStart: range.rowStart, rowEnd: range.rowEnd, columnStart: range.columnStart, columnEnd: range.columnEnd }));
                return { cellSelection: selection };
            },
            restoreFeatureState: (context: IgxGridStateBaseDirective, state: GridSelectionRange[]): void => {
                state.forEach(r => {
                    const range = { rowStart: r.rowStart, rowEnd: r.rowEnd, columnStart: r.columnStart, columnEnd: r.columnEnd};
                    context.currGrid.selectRange(range);
                });
            }
        },
        columnSelection: {
            getFeatureState: (context: IgxGridStateBaseDirective): IGridState => {
                const selection = context.currGrid.selectedColumns().map(c => c.field);
                return { columnSelection: selection };
            },
            restoreFeatureState: (context: IgxGridStateBaseDirective, state: string[]): void => {
                context.currGrid.deselectAllColumns();
                context.currGrid.selectColumns(state);
            }
        },
        rowPinning: {
            getFeatureState: (context: IgxGridStateBaseDirective): IGridState => {
                const pinned = context.currGrid.pinnedRows?.map(x => x.key);
                return { rowPinning: pinned };
            },
            restoreFeatureState: (context: IgxGridStateBaseDirective, state: any[]): void => {
                // clear current state.
                context.currGrid.pinnedRows.forEach(row => row.unpin());
                state.forEach(rowID => context.currGrid.pinRow(rowID));
            }
        },
        pinningConfig: {
            getFeatureState: (context: IgxGridStateBaseDirective): IGridState => ({ pinningConfig: context.currGrid.pinning }),
            restoreFeatureState: (context: IgxGridStateBaseDirective, state: IPinningConfig): void => {
                context.currGrid.pinning = state;
            }
        },
        expansion: {
            getFeatureState: (context: IgxGridStateBaseDirective): IGridState => {
                const expansionStates = Array.from(context.currGrid.expansionStates);
                return { expansion: expansionStates };
            },
            restoreFeatureState: (context: IgxGridStateBaseDirective, state: any[]): void => {
                const expansionStates = new Map<any, boolean>(state);
                context.currGrid.expansionStates = expansionStates;
            }
        },
        rowIslands: {
            getFeatureState(context: IgxGridStateBaseDirective): IGridState {
                const childGridStates: IGridStateCollection[] = [];
                const rowIslands = (context.currGrid as any).allLayoutList;
                if (rowIslands) {
                    rowIslands.forEach(rowIsland => {
                        const childGrids = rowIsland.rowIslandAPI.getChildGrids();
                        childGrids.forEach(chGrid => {
                            const parentRowID = this.getParentRowID(chGrid);
                            context.currGrid = chGrid;
                            if (context.currGrid) {
                                const childGridState = context.buildState(context.featureKeys) as IGridState;
                                childGridStates.push({ id: `${rowIsland.id}`, parentRowID, state: childGridState });
                            }
                        });
                    });
                }
                context.currGrid = context.grid;
                return { rowIslands: childGridStates };
            },
            restoreFeatureState(context: IgxGridStateBaseDirective, state: any): void {
                const rowIslands = (context.currGrid as any).allLayoutList;
                if (rowIslands) {
                    rowIslands.forEach(rowIsland => {
                        const childGrids = rowIsland.rowIslandAPI.getChildGrids();
                        childGrids.forEach(chGrid => {
                            const parentRowID = this.getParentRowID(chGrid);
                            context.currGrid = chGrid;
                            const childGridState = state.find(st => st.id === rowIsland.id && st.parentRowID === parentRowID);
                            if (childGridState && context.currGrid) {
                                context.restoreGridState(childGridState.state, context.featureKeys);
                            }
                        });
                    });
                }
                context.currGrid = context.grid;
            },
            /**
             * Traverses the hierarchy up to the root grid to return the ID of the expanded row.
             */
            getParentRowID: (grid: IgxHierarchicalGridComponent) => {
                let childGrid;
                while (grid.parent) {
                    childGrid = grid;
                    grid = grid.parent;
                }
                return grid.gridAPI.getParentRowId(childGrid);
            }
        },
        pivotConfiguration: {
            getFeatureState(context: IgxGridStateBaseDirective): IGridState {
                const config = (context.currGrid as IgxPivotGridComponent).pivotConfiguration;
                if (!config || !(context.currGrid instanceof IgxPivotGridComponent)) {
                    return { pivotConfiguration: undefined };
                }
                const configCopy = cloneValue(config);
                configCopy.rows = cloneArray(config.rows, true);
                configCopy.columns = cloneArray(config.columns, true);
                configCopy.filters = cloneArray(config.filters, true);
                const dims =  [...(configCopy.rows || []), ...(configCopy.columns || []), ...(configCopy.filters || [])];
                const dateDimensions = dims.filter(x => context.isDateDimension(x));
                dateDimensions?.forEach(dim => {
                    // do not serialize the grid resource strings. This would pollute the object with unnecessary data.
                    (dim as IgxPivotDateDimension).resourceStrings = {};
                });
                return { pivotConfiguration: configCopy };
            },
            restoreFeatureState(context: IgxGridStateBaseDirective, state: any): void {
                const config: IPivotConfiguration = state;
                if (!config || !(context.currGrid instanceof IgxPivotGridComponent)) {
                    return;
                }
                context.restoreValues(config, context.currGrid as IgxPivotGridComponent);
                context.restoreDimensions(config);
                (context.currGrid as IgxPivotGridComponent).pivotConfiguration = config;
            },


        }
    };

    /**
     *  An object with options determining if a certain feature state should be saved.
     * ```html
     * <igx-grid [igxGridState]="options"></igx-grid>
     * ```
     * ```typescript
     * public options = {selection: false, advancedFiltering: false};
     * ```
     */
    @Input()
    public get options(): IGridStateOptions {
       return this._options;
    }

    public set options(value: IGridStateOptions) {
        Object.assign(this._options, value);
        if (!(this.grid instanceof IgxGridComponent)) {
            delete this._options.groupBy;
        } else {
            delete this._options.rowIslands;
        }
    }

    /**
     * @hidden
     */
    constructor(
        @Host() @Optional() @Inject(IGX_GRID_BASE) public grid: GridType,
        protected viewRef: ViewContainerRef, protected envInjector: EnvironmentInjector,  protected injector: Injector) { }

    /**
     * Gets the state of a feature or states of all grid features, unless a certain feature is disabled through the `options` property.
     *
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
    protected getStateInternal(serialize = true, features?: GridFeatures | GridFeatures[]): IGridState | string  {
        let state: IGridState | string;
        this.currGrid = this.grid;
        this.state = state = this.buildState(features) as IGridState;
        if (serialize) {
            state = JSON.stringify(state, this.stringifyCallback) as string;
        }
        return state;
    }

    /* blazorSuppress */
    /**
     * Restores grid features' state based on the IGridState object passed as an argument.
     *
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
    protected setStateInternal(state: IGridState, features?: GridFeatures | GridFeatures[]) {
        this.state = state;
        this.currGrid = this.grid;
        this.restoreGridState(state, features);
        this.grid.cdr.detectChanges(); // TODO
    }

    /**
     * Builds an IGridState object.
     */
    private buildState(keys?: GridFeatures | GridFeatures[]): IGridState {
        this.applyFeatures(keys);
        let gridState = {} as IGridState;
        this.featureKeys.forEach(f => {
            if (this.options[f]) {
                if (!(this.grid instanceof IgxGridComponent) && f === 'groupBy') {
                    return;
                }
                const feature = this.getFeature(f);
                const featureState: IGridState = feature?.getFeatureState(this);
                gridState = Object.assign(gridState, featureState);
            }
        });
        return gridState;
    }

    /**
     * The method that calls corresponding methods to restore features from the passed IGridState object.
     */
    private restoreGridState(state: IGridState, features?: GridFeatures | GridFeatures[]) {
        this.applyFeatures(features);
        this.restoreFeatures(state);
    }

    private restoreFeatures(state: IGridState) {
        this.featureKeys.forEach(f => {
            if (this.options[f]) {
                const featureState = state[f];
                if (f === 'moving' || featureState) {
                    const feature = this.getFeature(f);
                    feature.restoreFeatureState(this, featureState);
                }
            }
        });
    }

    /**
     * Returns a collection of all grid features.
     */
    private applyFeatures(keys?: GridFeatures | GridFeatures[]) {
        this.featureKeys = [];
        if (!keys) {
            for (const key of Object.keys(this.options)) {
                this.featureKeys.push(key as GridFeatures);
            }
        } else if (Array.isArray(keys)) {
            this.featureKeys = [...keys as GridFeatures[]];
        } else {
            this.featureKeys.push(keys);
        }
    }

    /**
     * This method restores complex objects in the pivot dimensions
     * Like the IgxPivotDateDimension and filters.
     */
    private restoreDimensions(config: IPivotConfiguration) {
        const collections = [config.rows, config.columns, config.filters];
        for (const collection of collections) {
            for (let index = 0; index < collection?.length; index++) {
                const dim = collection[index];
                if (this.isDateDimension(dim)) {
                   this.restoreDateDimension(dim as IgxPivotDateDimension);
                }
                // restore complex filters
                if (dim.filter) {
                    dim.filter = this.createExpressionsTreeFromObject(dim.filter as FilteringExpressionsTree);
                }
            }
        }
    }


    /**
     * This method restores the IgxPivotDateDimension with its default functions and resource strings.
     */
    private restoreDateDimension(dim: IgxPivotDateDimension) {
        const dateDim = new IgxPivotDateDimension((dim as any)._baseDimension, (dim as any)._options);
        // restore functions and resource strings
        dim.resourceStrings = dateDim.resourceStrings;
        dim.memberFunction = dateDim.memberFunction;
        let currDim: IPivotDimension = dim;
        let originDim: IPivotDimension = dateDim;
        while (currDim.childLevel) {
            currDim = currDim.childLevel;
            originDim = originDim.childLevel;
            currDim.memberFunction = originDim.memberFunction;
        }
    }

    /**
     * Returns if this is a IgxPivotDateDimension.
     */
    private isDateDimension(dim: IPivotDimension) {
        return (dim as any)._baseDimension;
    }

    /**
     * This method restores complex objects in the pivot values.
     * Like the default aggregator methods.
     */
    private restoreValues(config: IPivotConfiguration, grid: IgxPivotGridComponent) {
        // restore aggregator func if it matches the default aggregators key and label
        const values = config.values;
        for (const value of values) {
            const aggregateList = value.aggregateList;
            const aggregators = PivotUtil.getAggregatorsForValue(value, grid);
            value.aggregate.aggregator = aggregators.find(x => x.key === value.aggregate.key && x.label === value.aggregate.label)?.aggregator;
            if (aggregateList) {
                for (const ag of aggregateList) {
                    ag.aggregator = aggregators.find(x => x.key === ag.key && x.label === ag.label)?.aggregator;
                }
            }
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
                if (this.currGrid instanceof IgxPivotGridComponent) {
                    dataType = this.currGrid.allDimensions.find(x => x.memberName === expr.fieldName).dataType;
                } else if (this.currGrid.columns.length > 0) {
                    dataType = this.currGrid.columns.find(c => c.field === expr.fieldName).dataType;
                } else if (this.state.columns) {
                    dataType = this.state.columns.find(c => c.field === expr.fieldName).dataType;
                } else {
                    return null;
                }
                // when ESF, values are stored in Set.
                // First those values are converted to an array before returning string in the stringifyCallback
                // now we need to convert those back to Set
                if (Array.isArray(expr.searchVal)) {
                    expr.searchVal = new Set(expr.searchVal);
                } else {
                    expr.searchVal = expr.searchVal && (dataType === 'date' || dataType === 'dateTime') ? new Date(Date.parse(expr.searchVal)) : expr.searchVal;
                }

                const condition = this.generateFilteringCondition(dataType, expr.condition.name) ||
                                this.currGrid.columns.find(c => c.field === expr.fieldName).filters.condition(expr.condition.name);

                if (condition) {
                    expr.condition = condition;
                    expressionsTree.filteringOperands.push(expr);
                }
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
            case GridColumnDataType.Boolean:
                filters = IgxBooleanFilteringOperand.instance();
                break;
            case GridColumnDataType.Number:
                filters = IgxNumberFilteringOperand.instance();
                break;
            case GridColumnDataType.Date:
                filters = IgxDateFilteringOperand.instance();
                break;
            case GridColumnDataType.DateTime:
                filters = IgxDateTimeFilteringOperand.instance();
                break;
            case GridColumnDataType.String:
            default:
                filters = IgxStringFilteringOperand.instance();
                break;
        }
        return filters.condition(name);
    }

    protected stringifyCallback(key: string, val: any) {
        if (key === 'searchVal' && val instanceof Set) {
            return Array.from(val);
        }
        return val;
    }

    private getColumnGroupKey(columnGroup: ColumnType) : string {
        return columnGroup.childColumns.map(x => x.columnGroup ? x.level + "_" + this.getColumnGroupKey(x) : x.field).sort().join("_");
    }

    private getFeature(key: string): Feature {
        const feature: Feature = this.FEATURES[key];
        return feature;
    }
}
