import { FilterMode, GridPagingMode, GridSelectionMode, GridSummaryCalculationMode, GridSummaryPosition, } from './enums';
import {
    ISearchInfo, IGridCellEventArgs, IRowSelectionEventArgs, IColumnSelectionEventArgs, IGridEditEventArgs,
    IPinColumnCancellableEventArgs, IColumnVisibilityChangedEventArgs, IColumnVisibilityChangingEventArgs,
    IRowDragEndEventArgs, IColumnMovingStartEventArgs, IColumnMovingEndEventArgs,
    IGridEditDoneEventArgs, IRowDataEventArgs, IGridKeydownEventArgs, IRowDragStartEventArgs,
    IColumnMovingEventArgs, IPinColumnEventArgs,
    IActiveNodeChangeEventArgs,
    ICellPosition, IFilteringEventArgs, IColumnResizeEventArgs, IRowToggleEventArgs, IGridToolbarExportEventArgs,
} from '../common/events';
import { DisplayDensity, IDensityChangedEventArgs } from '../../core/displayDensity';
import { ChangeDetectorRef, EventEmitter, InjectionToken, QueryList, TemplateRef } from '@angular/core';
import { FilteringExpressionsTree, IFilteringExpressionsTree } from '../../data-operations/filtering-expressions-tree';
import { IGridResourceStrings } from '../../core/i18n/grid-resources';
import { ISortingExpression } from '../../data-operations/sorting-expression.interface';
import { IGroupingExpression } from '../../data-operations/grouping-expression.interface';
import { IGroupByRecord } from '../../data-operations/groupby-record.interface';
import { IGroupByExpandState } from '../../data-operations/groupby-expand-state.interface';
import { IgxGridHeaderRowComponent } from '../headers/grid-header-row.component';
import { IgxGridHeaderComponent } from '../headers/grid-header.component';
import { IgxGridHeaderGroupComponent } from '../headers/grid-header-group.component';
import { IgxGridFilteringCellComponent } from '../filtering/base/grid-filtering-cell.component';
import { IgxGridFilteringRowComponent } from '../filtering/base/grid-filtering-row.component';
import { IgxPaginatorComponent } from '../../paginator/paginator.component';
import { IgxCell, IgxEditRow, IgxGridCRUDService } from './crud.service';
import { GridSelectionRange } from './types';
import { ColumnType } from './column.interface';
import { RowType } from './row.interface';
import { FilteringLogic } from '../../data-operations/filtering-expression.interface';
import { IFilteringStrategy } from '../../data-operations/filtering-strategy';
import { IgxGridSummaryService } from '../summaries/grid-summary.service';
import { DropPosition, IgxColumnMovingService } from '../moving/moving.service';
import { IgxToggleDirective } from '../../directives/toggle/toggle.directive';
import { Observable, Subject } from 'rxjs';
import { IgxActionStripComponent } from '../../action-strip/action-strip.component';
import { IgxGridColumnResizerComponent } from '../resizing/resizer.component';
import { IGridSortingStrategy } from '../../data-operations/sorting-strategy';
import { IPathSegment } from '../hierarchical-grid/hierarchical-grid-base.directive';
import { ITreeGridRecord } from '../tree-grid/tree-grid.interfaces';
import { State, Transaction, TransactionService } from '../../services/transaction/transaction';
import { IgxGridGroupByAreaComponent } from '../grouping/grid-group-by-area.component';


export const IGX_GRID_BASE = new InjectionToken<GridType>('IgxGridBaseToken');
export const IGX_GRID_SERVICE_BASE = new InjectionToken<GridServiceType>('IgxGridServiceBaseToken');

export interface IGridDataBindable {
    data: any[] | null;
    filteredData: any[];
}

export interface GridServiceType {

    grid: GridType;
    crudService: IgxGridCRUDService;
    cms: IgxColumnMovingService;

    get_data(): any[];
    get_all_data(includeTransactions?: boolean): any[];
    get_column_by_name(name: string): ColumnType;
    getRowData(id: any): any;
    get_rec_by_id(id: any): any;
    get_row_id(rowData: any): any;
    get_row_by_index(rowSelector: any): RowType;
    get_row_by_key(rowSelector: any): RowType;
    get_rec_index_by_id(pk: string | number, dataCollection?: any[]): number;
    get_row_index_in_data(rowID: any, dataCollection?: any[]): number;
    get_cell_by_visible_index(rowIndex: number, columnIndex: number);
    set_grouprow_expansion_state?(groupRow: IGroupByRecord, value: boolean): void;
    row_deleted_transaction(id: any): boolean;
    addRowToData(rowData: any, parentID?: any): void;
    deleteRowById(id: any): any;
    get_row_expansion_state(id: any): boolean;
    set_row_expansion_state(id: any, expanded: boolean, event?: Event): void;
    get_summary_data(): any[];

    prepare_sorting_expression(stateCollections: Array<Array<any>>, expression: ISortingExpression): void;
    sort(expression: ISortingExpression): void;
    sort_multiple(expressions: ISortingExpression[]): void;
    clear_sort(fieldName: string): void;

    filterDataByExpressions(expressionsTree: IFilteringExpressionsTree): any[];

    update_cell(cell: IgxCell): IGridEditEventArgs;
    update_row(row: IgxEditRow, value: any, event?: Event): IGridEditEventArgs;

    expand_path_to_record?(record: ITreeGridRecord): void;
    get_selected_children?(record: ITreeGridRecord, selectedRowIDs: any[]): void;
    get_rec_id_by_index?(index: number, dataCollection?: any[]): any;
    get_groupBy_record_id?(gRow: IGroupByRecord): string;
    remove_grouping_expression?(fieldName: string): void;
    clear_groupby?(field: string | any): void;
    getParentRowId?(child: GridType): any;
    getChildGrids?(inDepth?: boolean): GridType[];
    getChildGrid?(path: IPathSegment[]): GridType;
    // XXX: Fix type
    unsetChildRowIsland?(rowIsland: any): void;
}


/**
 * An interface describing a Grid type
 */
export interface GridType extends IGridDataBindable {
    displayDensity: DisplayDensity;
    locale: string;
    resourceStrings: IGridResourceStrings;
    nativeElement: HTMLElement;
    rowEditable: boolean;
    rootSummariesEnabled: boolean;
    allowFiltering: boolean;
    rowDraggable: boolean;
    primaryKey: any;
    id: string;
    renderedRowHeight: number;
    pipeTrigger: number;
    summaryPipeTrigger: number;
    hasColumnLayouts: boolean;

    gridAPI: GridServiceType;


    filterMode: FilterMode;

    theadRow: IgxGridHeaderRowComponent;
    groupArea: IgxGridGroupByAreaComponent;
    filterCellList: IgxGridFilteringCellComponent[];
    filteringRow: IgxGridFilteringRowComponent;
    actionStrip: IgxActionStripComponent;
    resizeLine: IgxGridColumnResizerComponent;

    paginator: IgxPaginatorComponent;
    crudService: IgxGridCRUDService;
    summaryService: IgxGridSummaryService;




    selectionService: any;
    navigation: any;
    filteringService: any;
    outlet: any;
    hasMovableColumns: boolean;
    isRowSelectable: boolean;
    showRowSelectors: boolean;
    isPinningToStart: boolean;
    columnInDrag: any;
    pinnedWidth: number;
    unpinnedWidth: number;

    dragIndicatorIconTemplate: any;
    dragIndicatorIconBase: any;

    columnWidthSetByUser: boolean;
    headerFeaturesWidth: number;
    calcHeight: number;
    calcWidth: number;
    outerWidth: number;
    rowHeight: number;
    multiRowLayoutRowSize: number;
    defaultHeaderGroupMinWidth: any;
    maxLevelHeaderDepth: number;
    defaultRowHeight: number;
    _baseFontSize?: number;
    scrollSize: number;

    expansionStates: Map<any, boolean>;
    parentVirtDir: any;
    tbody: any;
    verticalScrollContainer: any;
    dataRowList: any;
    rowList: any;
    columnList: QueryList<ColumnType>;
    columns: ColumnType[];
    visibleColumns: ColumnType[];
    unpinnedColumns: ColumnType[];
    pinnedColumns: ColumnType[];
    headerCellList: IgxGridHeaderComponent[];
    headerGroups: IgxGridHeaderGroupComponent[];
    headerGroupsList: IgxGridHeaderGroupComponent[];
    summariesRowList: any;
    headerContainer: any;
    isCellSelectable: boolean;
    isMultiRowSelectionEnabled: boolean;
    hasPinnedRecords: boolean;
    pinnedRecordsCount: number;
    pinnedRecords: any[];
    unpinnedRecords: any[];
    pinnedDataView: any[];
    pinnedRows: any[];
    dataView: any[];
    _filteredUnpinnedData: any[];
    _filteredSortedUnpinnedData: any[];
    filteredSortedData: any[];
    dataWithAddedInTransactionRows: any[];
    transactions: TransactionService<Transaction, State>;
    defaultSummaryHeight: number;
    rowEditingOverlay: IgxToggleDirective;
    totalRowsCountAfterFilter: number;
    _totalRecords: number;

    pagingMode: GridPagingMode;
    pagingState: any;

    rowEditTabs: any;
    lastSearchInfo: ISearchInfo;
    page: number;
    perPage: number;
    dragRowID: any;
    rowDragging: boolean;
    evenRowCSS: string;
    oddRowCSS: string;

    firstEditableColumnIndex: number;
    lastEditableColumnIndex: number;
    isRowPinningToTop: boolean;
    hasDetails: boolean;
    hasSummarizedColumns: boolean;
    hasColumnGroups: boolean;
    hasEditableColumns: boolean;
    uniqueColumnValuesStrategy: (column: ColumnType, tree: FilteringExpressionsTree, done: (values: any[]) => void) => void;

    cdr: ChangeDetectorRef;
    document: Document;
    rowExpandedIndicatorTemplate: TemplateRef<any>;
    rowCollapsedIndicatorTemplate: TemplateRef<any>;
    excelStyleHeaderIconTemplate: TemplateRef<any>;

    selectRowOnClick: boolean;
    cellSelection: GridSelectionMode;
    rowSelection: GridSelectionMode;
    columnSelection: GridSelectionMode;
    summaryCalculationMode: GridSummaryCalculationMode;
    summaryPosition: GridSummaryPosition;

    // XXX: Work around till we fixed the injection tokens
    flatData?: any[];
    expansionDepth?: number;
    childDataKey?: any;
    foreignKey?: any;
    cascadeOnDelete?: boolean;
    loadChildrenOnDemand?: (parentID: any, done: (children: any[]) => void) => void;
    hasChildrenKey?: any;
    loadingRows?: Set<any>;
    parent?: GridType;
    highlightedRowID?: any;
    hgridAPI?: GridServiceType;
    updateOnRender?: boolean;
    childLayoutKeys?: any[];
    childLayoutList?: QueryList<any>;
    rootGrid?: GridType;
    processedRootRecords?: ITreeGridRecord[];
    rootRecords?: ITreeGridRecord[];
    records?: Map<any, ITreeGridRecord>;
    processedExpandedFlatData?: any[];
    processedRecords?: Map<any, ITreeGridRecord>;

    activeNodeChange: EventEmitter<IActiveNodeChangeEventArgs>;
    gridKeydown: EventEmitter<IGridKeydownEventArgs>;
    cellClick: EventEmitter<IGridCellEventArgs>;
    doubleClick: EventEmitter<IGridCellEventArgs>;
    contextMenu: EventEmitter<IGridCellEventArgs>;
    selected: EventEmitter<IGridCellEventArgs>;
    rangeSelected: EventEmitter<GridSelectionRange>;
    rowSelected: EventEmitter<IRowSelectionEventArgs>;
    localeChange: EventEmitter<boolean>;
    filtering: EventEmitter<IFilteringEventArgs>;
    filteringDone: EventEmitter<IFilteringExpressionsTree>;
    columnPinned: EventEmitter<IPinColumnEventArgs>;
    columnResized: EventEmitter<IColumnResizeEventArgs>;
    columnMovingEnd: EventEmitter<IColumnMovingEndEventArgs>;
    columnSelected: EventEmitter<IColumnSelectionEventArgs>;
    columnMoving: EventEmitter<IColumnMovingEventArgs>;
    columnMovingStart: EventEmitter<IColumnMovingStartEventArgs>;
    columnPin: EventEmitter<IPinColumnCancellableEventArgs>;
    columnVisibilityChanging: EventEmitter<IColumnVisibilityChangingEventArgs>;
    columnVisibilityChanged: EventEmitter<IColumnVisibilityChangedEventArgs>;
    onDensityChanged: EventEmitter<IDensityChangedEventArgs>;
    rowAdd: EventEmitter<IGridEditEventArgs>;
    rowAdded: EventEmitter<IRowDataEventArgs>;
    rowAddedNotifier: Subject<IRowDataEventArgs>;
    rowDeleted: EventEmitter<IRowDataEventArgs>;
    rowDeletedNotifier: Subject<IRowDataEventArgs>;
    cellEditEnter: EventEmitter<IGridEditEventArgs>;
    cellEdit: EventEmitter<IGridEditEventArgs>;
    cellEditDone: EventEmitter<IGridEditDoneEventArgs>;
    cellEditExit: EventEmitter<IGridEditDoneEventArgs>;
    rowEditEnter: EventEmitter<IGridEditEventArgs>;
    rowEdit: EventEmitter<IGridEditEventArgs>;
    rowEditDone: EventEmitter<IGridEditDoneEventArgs>;
    rowEditExit: EventEmitter<IGridEditDoneEventArgs>;
    rowDragStart: EventEmitter<IRowDragStartEventArgs>;
    rowDragEnd: EventEmitter<IRowDragEndEventArgs>;
    rowToggle: EventEmitter<IRowToggleEventArgs>;

    toolbarExporting: EventEmitter<IGridToolbarExportEventArgs>;
    rendered$: Observable<boolean>;
    resizeNotify: Subject<void>;

    sortStrategy: IGridSortingStrategy;
    filteringLogic: FilteringLogic;
    filterStrategy: IFilteringStrategy;
    allowAdvancedFiltering: boolean;
    sortingExpressions: ISortingExpression[];
    sortingExpressionsChange: EventEmitter<ISortingExpression[]>;
    filteringExpressionsTree: IFilteringExpressionsTree;
    filteringExpressionsTreeChange: EventEmitter<IFilteringExpressionsTree>;
    advancedFilteringExpressionsTree: IFilteringExpressionsTree;
    advancedFilteringExpressionsTreeChange: EventEmitter<IFilteringExpressionsTree>;

    groupingExpansionState?: IGroupByExpandState[];
    groupingExpressions?: IGroupingExpression[];
    groupingExpressionsChange?: EventEmitter<IGroupingExpression[]>;
    groupsExpanded?: boolean;
    groupsRecords?: IGroupByRecord[];
    groupingFlatResult?: any[];
    groupingResult?: any[];
    groupingMetadata?: any[];

    toggleGroup?(groupRow: IGroupByRecord): void;
    clearGrouping?(field: string): void;
    groupBy?(expression: IGroupingExpression | Array<IGroupingExpression>): void;

    selectedColumns(): ColumnType[];
    refreshSearch(): void;
    getDefaultExpandState(record: any): boolean;
    trackColumnChanges(index: number, column: any): any;
    getPossibleColumnWidth(): string;
    resetHorizontalVirtualization(): void;
    hasVerticalScroll(): boolean;
    getVisibleContentHeight(): number;
    openRowOverlay(id: any): void;
    openAdvancedFilteringDialog(): void;
    showSnackbarFor(index: number): void;
    getColumnByName(name: string): any;
    getColumnByVisibleIndex(index: number): ColumnType;
    getHeaderGroupWidth(column: ColumnType): string;
    getRowByKey?(key: any): RowType;
    setFilteredData(data: any, pinned: boolean): void;
    setFilteredSortedData(data: any, pinned: boolean): void;
    sort(expression: ISortingExpression | ISortingExpression[]): void;
    clearSort(name?: string): void;
    pinRow(id: any, index?: number, row?: RowType): boolean;
    unpinRow(id: any, row?: RowType): boolean;
    getUnpinnedIndexById(id: any): number;
    getEmptyRecordObjectFor(inRow: RowType): any;
    isSummaryRow(rec: any): boolean;
    isRecordPinned(rec: any): boolean;
    getInitialPinnedIndex(rec: any): number;
    isRecordPinnedByViewIndex(rowIndex: number): boolean;
    isColumnGrouped(fieldName: string): boolean;
    isDetailRecord(rec: any): boolean;
    isGroupByRecord(rec: any): boolean;
    isGhostRecord(rec: any): boolean;
    isTreeRow?(rec: any): boolean;
    isHierarchicalRecord?(record: any): boolean;
    columnToVisibleIndex(key: string | number): number;
    moveColumn(column: ColumnType, target: ColumnType, pos: DropPosition): void;
    navigateTo(rowIndex: number, visibleColumnIndex: number, callback?: (e: any) => any): void;
    getPreviousCell(currRowIndex: number, curVisibleColIndex: number, callback: (IgxColumnComponent) => boolean): ICellPosition;
    getNextCell(currRowIndex: number, curVisibleColIndex: number, callback: (IgxColumnComponent) => boolean): ICellPosition;
    clearCellSelection(): void;
    selectRange(range: GridSelectionRange | GridSelectionRange[]): void;
    selectRows(rowIDs: any[], clearCurrentSelection?: boolean): void;
    deselectRows(rowIDs: any[]): void;
    selectAllRows(onlyFilterData?: boolean): void;
    deselectAllRows(onlyFilterData?: boolean): void;
    // Type to RowType
    createRow?(index: number, data?: any): RowType;
    deleteRow(id: any): any;
    deleteRowById(id: any): any;
    collapseRow(id: any): void;
    notifyChanges(repaint?: boolean): void;
    resetColumnCollections(): void;
    triggerPipes(): void;
    repositionRowEditingOverlay(row: RowType): void;
    closeRowEditingOverlay(): void;
    reflow(): void;

    // TODO: Maybe move them to FlatGridType, but then will we need another token?
    isExpandedGroup(group: IGroupByRecord): boolean;
    generateRowPath?(rowId: any): any[];

}

/**
 * An interface describing a Flat Grid type
 */
export interface FlatGridType extends GridType {
    groupingExpansionState: IGroupByExpandState[];
    groupingExpressions: IGroupingExpression[];
    groupingExpressionsChange: EventEmitter<IGroupingExpression[]>;

    toggleGroup(groupRow: IGroupByRecord): void;
    clearGrouping(field: string): void;
    groupBy(expression: IGroupingExpression | Array<IGroupingExpression>): void;
}

/**
 * An interface describing a Tree Grid type
 */
export interface TreeGridType extends GridType {
    records: Map<any, ITreeGridRecord>;
    isTreeRow(rec: any): boolean;
}

/**
 * An interface describing a Hierarchical Grid type
 */
export interface HierarchicalGridType extends GridType {
    childLayoutKeys: any[];
}

export interface GridSVGIcon {
    name: string;
    value: string;
}
