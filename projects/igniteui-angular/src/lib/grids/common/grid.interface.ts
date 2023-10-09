import { ColumnPinningPosition, FilterMode, GridPagingMode, GridSelectionMode, GridSummaryCalculationMode, GridSummaryPosition, GridValidationTrigger, RowPinningPosition } from './enums';
import {
    ISearchInfo, IGridCellEventArgs, IRowSelectionEventArgs, IColumnSelectionEventArgs, IGridEditEventArgs,
    IPinColumnCancellableEventArgs, IColumnVisibilityChangedEventArgs, IColumnVisibilityChangingEventArgs,
    IRowDragEndEventArgs, IColumnMovingStartEventArgs, IColumnMovingEndEventArgs,
    IGridEditDoneEventArgs, IRowDataEventArgs, IGridKeydownEventArgs, IRowDragStartEventArgs,
    IColumnMovingEventArgs, IPinColumnEventArgs,
    IActiveNodeChangeEventArgs,
    ICellPosition, IFilteringEventArgs, IColumnResizeEventArgs, IRowToggleEventArgs, IGridToolbarExportEventArgs, IPinRowEventArgs
} from '../common/events';
import { DisplayDensity, IDensityChangedEventArgs } from '../../core/density';
import { ChangeDetectorRef, ElementRef, EventEmitter, InjectionToken, QueryList, TemplateRef, ViewContainerRef } from '@angular/core';
import { FilteringExpressionsTree, IFilteringExpressionsTree } from '../../data-operations/filtering-expressions-tree';
import { IGridResourceStrings } from '../../core/i18n/grid-resources';
import { IGroupingExpression } from '../../data-operations/grouping-expression.interface';
import { IGroupByRecord } from '../../data-operations/groupby-record.interface';
import { IGroupByExpandState } from '../../data-operations/groupby-expand-state.interface';
import { IgxPaginatorComponent } from '../../paginator/paginator.component';
import { IgxCell, IgxEditRow } from './crud.service';
import { GridSelectionRange } from './types';
import { FilteringLogic } from '../../data-operations/filtering-expression.interface';
import { IFilteringStrategy } from '../../data-operations/filtering-strategy';
import { DropPosition, IgxColumnMovingService } from '../moving/moving.service';
import { IgxOverlayOutletDirective, IgxToggleDirective } from '../../directives/toggle/toggle.directive';
import { Observable, Subject } from 'rxjs';
import { ITreeGridRecord } from '../tree-grid/tree-grid.interfaces';
import { State, Transaction, TransactionService } from '../../services/transaction/transaction';
import { DataType, GridColumnDataType } from '../../data-operations/data-util';
import { IgxFilteringOperand } from '../../data-operations/filtering-condition';
import { IColumnPipeArgs, IFieldPipeArgs, ISortingOptions, MRLResizeColumnInfo } from '../columns/interfaces';
import { IgxSummaryResult } from '../summaries/grid-summary';
import { ISortingExpression, ISortingStrategy, SortingDirection } from '../../data-operations/sorting-strategy';
import { IGridGroupingStrategy, IGridSortingStrategy } from './strategy';
import { IForOfState, IgxGridForOfDirective } from '../../directives/for-of/for_of.directive';
import { OverlaySettings } from '../../services/overlay/utilities';
import { IDimensionsChange, IPivotConfiguration, IPivotDimension, IPivotKeys, IPivotValue, IValuesChange, PivotDimensionType } from '../pivot-grid/pivot-grid.interface';
import { IDataCloneStrategy } from '../../data-operations/data-clone-strategy';
import { FormControl, FormGroup, ValidationErrors } from '@angular/forms';
import { IgxGridValidationService } from '../grid/grid-validation.service';

export const IGX_GRID_BASE = new InjectionToken<GridType>('IgxGridBaseToken');
export const IGX_GRID_SERVICE_BASE = new InjectionToken<GridServiceType>('IgxGridServiceBaseToken');

export interface IPathSegment {
    rowID: any;
    rowIslandKey: string;
}

export interface IGridDataBindable {
    data: any[] | null;
    get filteredData(): any[];
}

export interface CellType {
    value: any;
    editValue: any;
    selected: boolean;
    active: boolean;
    editable: boolean;
    editMode: boolean;
    nativeElement?: HTMLElement;
    column: ColumnType;
    row: RowType;
    grid: GridType;
    id?: { rowID: any; columnID: number; rowIndex: number };
    cellID?: any;
    readonly validation?: IGridValidationState;
    readonly?: boolean;
    title?: any;
    width: string;
    visibleColumnIndex?: number;
    update: (value: any) => void;
    setEditMode?(value: boolean): void;
    calculateSizeToFit?(range: any): number;
    activate?(event: FocusEvent | KeyboardEvent): void;
    onDoubleClick?(event: MouseEvent): void;
    onClick?(event: MouseEvent): void;
}

export interface HeaderType {
    nativeElement: HTMLElement;
    column: ColumnType;
    density: DisplayDensity;
    sorted: boolean;
    selectable: boolean;
    selected: boolean;
    title: boolean;
    sortDirection: SortingDirection;
}

export interface RowType {
    nativeElement?: HTMLElement;
    index: number;
    viewIndex: number;
    isGroupByRow?: boolean;
    isSummaryRow?: boolean;
    summaries?: Map<string, IgxSummaryResult[]>;
    groupRow?: IGroupByRecord;
    key?: any;
    readonly validation?: IGridValidationState;
    data?: any;
    cells?: QueryList<CellType> | CellType[];
    disabled?: boolean;
    virtDirRow?: IgxGridForOfDirective<ColumnType, ColumnType[]>;
    pinned?: boolean;
    selected?: boolean;
    expanded?: boolean;
    deleted?: boolean;
    inEditMode?: boolean;
    children?: RowType[];
    parent?: RowType;
    hasChildren?: boolean;
    treeRow?: ITreeGridRecord;
    addRowUI?: boolean;
    focused?: boolean;
    grid: GridType;
    onRowSelectorClick?: (event: MouseEvent) => void;
    onClick?: (event: MouseEvent) => void;
    beginAddRow?: () => void;
    update?: (value: any) => void;
    delete?: () => any;
    pin?: () => void;
    unpin?: () => void;
}

export interface FieldType {
    label?: string;
    field: string;
    header?: string;
    dataType: DataType;
    filters: IgxFilteringOperand;
    pipeArgs: IFieldPipeArgs;
    defaultTimeFormat: string;
    defaultDateTimeFormat: string;

    formatter(value: any, rowData?: any): any;
}

export interface ColumnType extends FieldType {
    grid: GridType;
    children: QueryList<ColumnType>;
    allChildren: ColumnType[];
    // TYPE
    headerGroup: any;
    // TYPE
    headerCell: any;
    validators: any[];

    headerTemplate: TemplateRef<any>;
    collapsibleIndicatorTemplate?: TemplateRef<any>;
    headerClasses: any;
    headerStyles: any;
    headerGroupClasses: any;
    headerGroupStyles: any;

    /** 
     * Custom CSS styling, appplied to every column 
     * calcWidth, minWidthPx, maxWidthPx, minWidth, maxWidth, minWidthPercent, maxWidthPercent, resolvedWidth
     */
    calcWidth: any;
    minWidthPx: number;
    maxWidthPx: number;
    minWidth: string;
    maxWidth: string;
    minWidthPercent: number;
    maxWidthPercent: number;
    resolvedWidth: string;

    header?: string;
    index: number;
    dataType: GridColumnDataType;
    inlineEditorTemplate: TemplateRef<any>;
    visibleIndex: number;
    collapsible?: boolean;
    editable: boolean;
    resizable: boolean;
    searchable: boolean;
    columnGroup: boolean;
    /** @deprecated in version 13.1.0. Use `IgxGridComponent.moving` instead.*/
    movable: boolean;
    groupable: boolean;
    sortable: boolean;
    filterable: boolean;
    hidden: boolean;
    disablePinning: boolean;
    disableHiding: boolean;
    sortStrategy: ISortingStrategy;
    sortingIgnoreCase: boolean;
    filterCell: any;
    filteringIgnoreCase: boolean;
    filteringExpressionsTree: FilteringExpressionsTree;
    hasSummary: boolean;
    summaries: any;
    summaryTemplate: TemplateRef<any>;
    pinned: boolean;
    expanded: boolean;
    selected: boolean;
    selectable: boolean;
    columnLayout: boolean;
    level: number;
    rowStart: number;
    rowEnd: number;
    colStart: number;
    colEnd: number;
    gridRowSpan: number;
    gridColumnSpan: number;
    columnLayoutChild: boolean;
    width: string;
    topLevelParent?: ColumnType;
    parent?: ColumnType;
    pipeArgs: IColumnPipeArgs;
    hasNestedPath: boolean;
    additionalTemplateContext: any;
    isLastPinned: boolean;
    isFirstPinned: boolean;
    applySelectableClass: boolean;
    title: string;
    groupingComparer: (a: any, b: any) => number;

    filterCellTemplate: TemplateRef<any>;

    move(index: number): void;
    getAutoSize(): string;
    getResizableColUnderEnd(): MRLResizeColumnInfo[];
    getCellWidth(): string;
    getGridTemplate(isRow: boolean): string;
    toggleVisibility(value?: boolean): void;
    populateVisibleIndexes?(): void;
    pin(index?: number): boolean;
    unpin(index?: number): boolean;
}

export interface IGridFormGroupCreatedEventArgs {
    formGroup: FormGroup,
    owner: GridType
}

export interface IGridValidationStatusEventArgs {
    status: ValidationStatus,
    owner: GridType
}

export type ValidationStatus = 'VALID' | 'INVALID';

export interface IGridValidationState {
    readonly status: ValidationStatus;
    readonly errors?: ValidationErrors;
}

export interface IRecordValidationState extends IGridValidationState {
    key: any;
    fields: IFieldValidationState[];
}

export interface IFieldValidationState extends IGridValidationState {
    field: string
}

export interface GridServiceType {

    grid: GridType;
    crudService: any;
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
    get_rec_id_by_index(index: number, dataCollection?: any[]): any;
    get_row_index_in_data(rowID: any, dataCollection?: any[]): number;
    get_cell_by_key(rowSelector: any, field: string): CellType;
    get_cell_by_index(rowIndex: number, columnID: number | string): CellType;
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

    get_pin_row_event_args(rowID: any, index?: number, row?: RowType, pinned?: boolean): IPinRowEventArgs;

    filterDataByExpressions(expressionsTree: IFilteringExpressionsTree): any[];
    sortDataByExpressions(data: any[], expressions: ISortingExpression[]): any[];

    update_cell(cell: IgxCell): IGridEditEventArgs;
    update_row(row: IgxEditRow, value: any, event?: Event): IGridEditEventArgs;

    expand_path_to_record?(record: ITreeGridRecord): void;
    get_selected_children?(record: ITreeGridRecord, selectedRowIDs: any[]): void;
    get_groupBy_record_id?(gRow: IGroupByRecord): string;
    remove_grouping_expression?(fieldName: string): void;
    clear_groupby?(field: string | any): void;
    getParentRowId?(child: GridType): any;
    getChildGrids?(inDepth?: boolean): GridType[];
    getChildGrid?(path: IPathSegment[]): GridType;

    unsetChildRowIsland?(rowIsland: GridType): void;
    registerChildRowIsland?(rowIsland: GridType): void;
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
    /** @hidden @internal */
    groupablePipeTrigger: number;
    filteringPipeTrigger: number;
    /** @hidden @internal */
    hasColumnLayouts: boolean;
    moving: boolean;
    isLoading: boolean;
    dataCloneStrategy: IDataCloneStrategy;

    readonly gridAPI: GridServiceType;

    filterMode: FilterMode;

    // TYPE
    /** @hidden @internal */
    theadRow: any;
    /** @hidden @internal */
    groupArea: any;
    /** @hidden @internal */
    filterCellList: any[];
    /** @hidden @internal */
    filteringRow: any;
    /** @hidden @internal */
    actionStrip: any;
    /** @hidden @internal */
    resizeLine: any;

    /** @hidden @internal */
    tfoot: ElementRef<HTMLElement>;
    /** @hidden @internal */
    paginator: IgxPaginatorComponent;
    /** @hidden @internal */
    paginatorList?: QueryList<IgxPaginatorComponent>;
    /** @hidden @internal */
    crudService: any;
    /** @hidden @internal */
    summaryService: any;



    virtualizationState: IForOfState;
    // TYPE
    /** @hidden @internal */
    selectionService: any;
    navigation: any;
    /** @hidden @internal */
    filteringService: any;
    outlet: any;
    /** @hidden @internal */
    hasMovableColumns: boolean;
    isRowSelectable: boolean;
    showRowSelectors: boolean;
    isPinningToStart: boolean;
    columnInDrag: any;
    /** @hidden @internal */
    pinnedWidth: number;
    /** @hidden @internal */
    unpinnedWidth: number;
    summariesMargin: number;
    headSelectorBaseAriaLabel: string;

    hasVisibleColumns: boolean;
    hasExpandableChildren?: boolean;
    showExpandAll?: boolean;

    hiddenColumnsCount: number;
    pinnedColumnsCount: number;

    iconTemplate?: TemplateRef<any>;
    groupRowTemplate?: TemplateRef<IgxGroupByRowTemplateContext>;
    groupByRowSelectorTemplate?: TemplateRef<IgxGroupByRowSelectorTemplateContext>;
    rowLoadingIndicatorTemplate?: TemplateRef<any>;
    headSelectorTemplate: TemplateRef<IgxHeadSelectorTemplateContext>;
    rowSelectorTemplate: TemplateRef<IgxRowSelectorTemplateContext>;
    sortHeaderIconTemplate: TemplateRef<IgxGridHeaderTemplateContext>;
    sortAscendingHeaderIconTemplate: TemplateRef<IgxGridHeaderTemplateContext>;
    sortDescendingHeaderIconTemplate: TemplateRef<IgxGridHeaderTemplateContext>;
    headerCollapsedIndicatorTemplate: TemplateRef<IgxGridTemplateContext>;
    headerExpandedIndicatorTemplate: TemplateRef<IgxGridTemplateContext>;
    dragIndicatorIconTemplate: any;
    dragIndicatorIconBase: any;
    disableTransitions: boolean;
    currencyPositionLeft: boolean;

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

    validationTrigger: GridValidationTrigger;
    pinning: IPinningConfig;
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
    /** @hidden @internal */
    headerCellList: any[];
    /** @hidden @internal */
    headerGroups: any[];
    /** @hidden @internal */
    headerGroupsList: any[];
    summariesRowList: any;
    /** @hidden @internal */
    headerContainer: any;
    isCellSelectable: boolean;
    isMultiRowSelectionEnabled: boolean;
    hasPinnedRecords: boolean;
    pinnedRecordsCount: number;
    pinnedRecords: any[];
    unpinnedRecords: any[];
    /** @hidden @internal */
    pinnedDataView: any[];
    pinnedRows: any[];
    dataView: any[];
    _filteredUnpinnedData: any[];
    _filteredSortedUnpinnedData: any[];
    filteredSortedData: any[];
    dataWithAddedInTransactionRows: any[];
    readonly transactions: TransactionService<Transaction, State>;
    readonly validation: IgxGridValidationService;
    defaultSummaryHeight: number;
    summaryRowHeight: number;
    rowEditingOverlay: IgxToggleDirective;
    totalRowsCountAfterFilter: number;
    _totalRecords: number;
    pagingMode: GridPagingMode;
    /** @hidden */
    pagingState: any;

    rowEditTabs: any;
    lastSearchInfo: ISearchInfo;
    /** @hidden @internal */
    page: number;
    /** @hidden @internal */
    perPage: number;
    /** @hidden @internal */
    dragRowID: any;
    rowDragging: boolean;

    firstEditableColumnIndex: number;
    lastEditableColumnIndex: number;
    isRowPinningToTop: boolean;
    hasDetails: boolean;
    /** @hidden @internal */
    hasSummarizedColumns: boolean;
    /** @hidden @internal */
    hasColumnGroups: boolean;
    /** @hidden @internal */
    hasEditableColumns: boolean;
    uniqueColumnValuesStrategy: (column: ColumnType, tree: FilteringExpressionsTree, done: (values: any[]) => void) => void;
    getHeaderCellWidth: (element: HTMLElement) => ISizeInfo;

    readonly cdr: ChangeDetectorRef;
    /** @hidden @internal */
    document: Document;
    rowExpandedIndicatorTemplate: TemplateRef<IgxGridRowTemplateContext>;
    rowCollapsedIndicatorTemplate: TemplateRef<IgxGridRowTemplateContext>;
    excelStyleHeaderIconTemplate: TemplateRef<IgxGridHeaderTemplateContext>;

    selectRowOnClick: boolean;
    cellSelection: GridSelectionMode;
    rowSelection: GridSelectionMode;
    columnSelection: GridSelectionMode;
    summaryCalculationMode: GridSummaryCalculationMode;
    summaryPosition: GridSummaryPosition;

    // XXX: Work around till we fixed the injection tokens
    lastChildGrid?: GridType;
    /** @hidden @internal */
    toolbarOutlet?: ViewContainerRef;
    /** @hidden @internal */
    paginatorOutlet?: ViewContainerRef;
    flatData?: any[] | null;
    childRow?: any;
    expansionDepth?: number;
    childDataKey?: any;
    foreignKey?: any;
    cascadeOnDelete?: boolean;
    loadChildrenOnDemand?: (parentID: any, done: (children: any[]) => void) => void;
    hasChildrenKey?: any;
    loadingRows?: Set<any>;
    parent?: GridType;
    highlightedRowID?: any;
    updateOnRender?: boolean;
    childLayoutKeys?: any[];
    childLayoutList?: QueryList<any>;
    rootGrid?: GridType;
    processedRootRecords?: ITreeGridRecord[];
    rootRecords?: ITreeGridRecord[];
    records?: Map<any, ITreeGridRecord>;
    processedExpandedFlatData?: any[] | null;
    processedRecords?: Map<any, ITreeGridRecord>;
    treeGroupArea?: any;

    activeNodeChange: EventEmitter<IActiveNodeChangeEventArgs>;
    gridKeydown: EventEmitter<IGridKeydownEventArgs>;
    cellClick: EventEmitter<IGridCellEventArgs>;
    doubleClick: EventEmitter<IGridCellEventArgs>;
    contextMenu: EventEmitter<IGridCellEventArgs>;
    selected: EventEmitter<IGridCellEventArgs>;
    rangeSelected: EventEmitter<GridSelectionRange>;
    rowSelectionChanging: EventEmitter<IRowSelectionEventArgs>;
    localeChange: EventEmitter<boolean>;
    filtering: EventEmitter<IFilteringEventArgs>;
    filteringDone: EventEmitter<IFilteringExpressionsTree>;
    columnPinned: EventEmitter<IPinColumnEventArgs>;
    columnResized: EventEmitter<IColumnResizeEventArgs>;
    columnMovingEnd: EventEmitter<IColumnMovingEndEventArgs>;
    columnSelectionChanging: EventEmitter<IColumnSelectionEventArgs>;
    columnMoving: EventEmitter<IColumnMovingEventArgs>;
    columnMovingStart: EventEmitter<IColumnMovingStartEventArgs>;
    columnPin: EventEmitter<IPinColumnCancellableEventArgs>;
    columnVisibilityChanging: EventEmitter<IColumnVisibilityChangingEventArgs>;
    columnVisibilityChanged: EventEmitter<IColumnVisibilityChangedEventArgs>;
    batchEditingChange?: EventEmitter<boolean>;
    densityChanged: EventEmitter<IDensityChangedEventArgs>;
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
    formGroupCreated: EventEmitter<IGridFormGroupCreatedEventArgs>;
    validationStatusChange: EventEmitter<IGridValidationStatusEventArgs>;

    toolbarExporting: EventEmitter<IGridToolbarExportEventArgs>;
    rendered$: Observable<boolean>;
    resizeNotify: Subject<void>;

    sortStrategy: IGridSortingStrategy;
    groupStrategy?: IGridGroupingStrategy;
    filteringLogic: FilteringLogic;
    filterStrategy: IFilteringStrategy;
    allowAdvancedFiltering: boolean;
    sortingExpressions: ISortingExpression[];
    sortingExpressionsChange: EventEmitter<ISortingExpression[]>;
    filteringExpressionsTree: IFilteringExpressionsTree;
    filteringExpressionsTreeChange: EventEmitter<IFilteringExpressionsTree>;
    advancedFilteringExpressionsTree: IFilteringExpressionsTree;
    advancedFilteringExpressionsTreeChange: EventEmitter<IFilteringExpressionsTree>;
    sortingOptions: ISortingOptions;

    batchEditing: boolean;
    groupingExpansionState?: IGroupByExpandState[];
    groupingExpressions?: IGroupingExpression[];
    groupingExpressionsChange?: EventEmitter<IGroupingExpression[]>;
    groupsExpanded?: boolean;
    readonly groupsRecords?: IGroupByRecord[];
    groupingFlatResult?: any[];
    groupingResult?: any[];
    groupingMetadata?: any[];
    selectedCells?: CellType[];
    selectedRows: any[];
    /** @hidden @internal */
    activeDescendant?: string;
    /** @hidden @internal */
    isPivot?: boolean;

    toggleGroup?(groupRow: IGroupByRecord): void;
    clearGrouping?(field: string): void;
    groupBy?(expression: IGroupingExpression | Array<IGroupingExpression>): void;
    resolveOutlet?(): IgxOverlayOutletDirective;
    updateColumns(columns: ColumnType[]): void;
    getSelectedRanges(): GridSelectionRange[];
    deselectAllColumns(): void;
    deselectColumns(columns: string[] | ColumnType[]): void;
    selectColumns(columns: string[] | ColumnType[]): void;
    selectedColumns(): ColumnType[];
    refreshSearch(): void;
    getDefaultExpandState(record: any): boolean;
    trackColumnChanges(index: number, column: any): any;
    getPossibleColumnWidth(): string;
    resetHorizontalVirtualization(): void;
    hasVerticalScroll(): boolean;
    getVisibleContentHeight(): number;
    getDragGhostCustomTemplate(): TemplateRef<any> | null;
    openRowOverlay(id: any): void;
    openAdvancedFilteringDialog(): void;
    showSnackbarFor(index: number): void;
    getColumnByName(name: string): any;
    getColumnByVisibleIndex(index: number): ColumnType;
    getHeaderGroupWidth(column: ColumnType): string;
    getRowByKey?(key: any): RowType;
    getRowByIndex?(index: number): RowType;
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
    isChildGridRecord?(rec: any): boolean;
    getChildGrids?(inDepth?: boolean): any[];
    isHierarchicalRecord?(record: any): boolean;
    columnToVisibleIndex(key: string | number): number;
    moveColumn(column: ColumnType, target: ColumnType, pos: DropPosition): void;
    navigateTo(rowIndex: number, visibleColumnIndex: number, callback?: (e: any) => any): void;
    getPreviousCell(currRowIndex: number, curVisibleColIndex: number, callback: (c: ColumnType) => boolean): ICellPosition;
    getNextCell(currRowIndex: number, curVisibleColIndex: number, callback: (c: ColumnType) => boolean): ICellPosition;
    clearCellSelection(): void;
    selectRange(range: GridSelectionRange | GridSelectionRange[]): void;
    selectRows(rowIDs: any[], clearCurrentSelection?: boolean): void;
    deselectRows(rowIDs: any[]): void;
    selectAllRows(onlyFilterData?: boolean): void;
    deselectAllRows(onlyFilterData?: boolean): void;
    setUpPaginator(): void;
    createFilterDropdown(column: ColumnType, options: OverlaySettings): any;
    updateCell(value: any, rowSelector: any, column: string): void;
    // Type to RowType
    createRow?(index: number, data?: any): RowType;
    deleteRow(id: any): any;
    deleteRowById(id: any): any;
    updateRow(value: any, rowSelector: any): void;
    collapseRow(id: any): void;
    notifyChanges(repaint?: boolean): void;
    resetColumnCollections(): void;
    triggerPipes(): void;
    repositionRowEditingOverlay(row: RowType): void;
    closeRowEditingOverlay(): void;
    reflow(): void;

    // TODO: Maybe move them to FlatGridType, but then will we need another token?
    isExpandedGroup(group: IGroupByRecord): boolean;
    createColumnsList?(cols: ColumnType[]): void;
    toggleAllGroupRows?(): void;
    toggleAll?(): void;
    generateRowPath?(rowId: any): any[];
    preventHeaderScroll?(args: any): void;
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

export interface PivotGridType extends GridType {
    pivotConfiguration: IPivotConfiguration;
    allDimensions: IPivotDimension[],
    showPivotConfigurationUI: boolean;
    /** @hidden @internal */
    columnDimensions: IPivotDimension[];
    /** @hidden @internal */
    rowDimensions: IPivotDimension[];
    rowDimensionResizing: boolean;
    /** @hidden @internal */
    values: IPivotValue[];
    /** @hidden @internal */
    filterDimensions: IPivotDimension[];
    /** @hidden @internal */
    dimensionDataColumns: ColumnType[];
    pivotRowWidths: number;
    setupColumns(): void;
    toggleRow(rowID: any): void;
    resolveDataTypes(field: any): GridColumnDataType;
    moveDimension(dimension: IPivotDimension, targetCollectionType: PivotDimensionType, index?: number);
    getDimensionsByType(dimension: PivotDimensionType);
    toggleDimension(dimension: IPivotDimension);
    sortDimension(dimension: IPivotDimension, sortDirection: SortingDirection);
    toggleValue(value: IPivotValue);
    moveValue(value: IPivotValue, index?: number);
    rowDimensionWidthToPixels(dim: IPivotDimension): number;
    dimensionsChange: EventEmitter<IDimensionsChange>;
    valuesChange: EventEmitter<IValuesChange>;
    /** @hidden @internal */
    pivotKeys: IPivotKeys;
    hasMultipleValues: boolean;
    excelStyleFilterMaxHeight: string;
    excelStyleFilterMinHeight: string;
    valueChipTemplate: TemplateRef<any>;
}
export interface GridSVGIcon {
    name: string;
    value: string;
}

export interface ISizeInfo {
    width: number,
    padding: number
}

export interface IgxGridMasterDetailContext {
    $implicit: any;
    index: number;
}

export interface IgxGroupByRowTemplateContext {
    $implicit: IGroupByRecord;
}

export interface IgxGridTemplateContext {
    $implicit: GridType
}

export interface IgxGridRowTemplateContext {
    $implicit: RowType
}

export interface IgxGridRowDragGhostContext {
    $implicit: any, // this is the row data
    data: any, // this is also the row data for some reason.
    grid: GridType
}

export interface IgxGridEmptyTemplateContext {
    $implicit: undefined
}

export interface IgxGridRowEditTemplateContext {
    $implicit: undefined,
    rowChangesCount: number,
    endEdit: (commit: boolean, event?: Event) => void
}

export interface IgxGridRowEditTextTemplateContext {
    $implicit: number
}

export interface IgxGridRowEditActionsTemplateContext {
    $implicit: (commit: boolean, event?: Event) => void
}

export interface IgxGridHeaderTemplateContext {
    $implicit: HeaderType
}

export interface IgxColumnTemplateContext {
    $implicit: ColumnType,
    column: ColumnType
}

export interface IgxCellTemplateContext {
    $implicit: any,
    additionalTemplateContext: any,
    formControl?: FormControl<any>,
    defaultErrorTemplate?: TemplateRef<any>,
    cell: CellType
}

export interface IgxRowSelectorTemplateDetails {
    index: number;
    /** @deprecated Use `key` */
    rowID: any;
    key: any;
    selected: boolean;
    select?: () => void;
    deselect?: () => void;
}

export interface IgxRowSelectorTemplateContext {
    $implicit: IgxRowSelectorTemplateDetails;
}

export interface IgxGroupByRowSelectorTemplateDetails {
    selectedCount: number;
    totalCount: number;
    groupRow: IGroupByRecord;
}
export interface IgxGroupByRowSelectorTemplateContext {
    $implicit: IgxGroupByRowSelectorTemplateDetails;
}

export interface IgxHeadSelectorTemplateDetails {
    selectedCount: number;
    totalCount: number;
    selectAll?: () => void;
    deselectAll?: () => void;
}
export interface IgxHeadSelectorTemplateContext {
    $implicit: IgxHeadSelectorTemplateDetails;
}

export interface IgxSummaryTemplateContext {
    $implicit: IgxSummaryResult[]
}

/**
 * An interface describing settings for row/column pinning position.
 */
export interface IPinningConfig {
    columns?: ColumnPinningPosition;
    rows?: RowPinningPosition;
}
