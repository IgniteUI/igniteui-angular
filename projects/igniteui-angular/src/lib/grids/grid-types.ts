import { InjectionToken, QueryList, TemplateRef, EventEmitter, ChangeDetectorRef, ElementRef } from '@angular/core';
import { DataType } from '../data-operations/data-util';
import { IgxGridForOfDirective } from '../directives/for-of/for_of.directive';
import { ITreeGridRecord, ISearchInfo, DropPosition, FilterMode } from './tree-grid/index';
import { IGroupByRecord } from '../data-operations/groupby-record.interface';
import { TransactionService, Transaction, State } from '../services/transaction/transaction';
import { GridSelectionRange } from '../core/grid-selection';
import { IgxGridNavigationService } from './grid-navigation.service';
import { IgxCheckboxComponent } from '../checkbox/checkbox.component';
import { IgxGridColumnResizerComponent } from './grid-column-resizer.component';
import { ISortingStrategy } from '../data-operations/sorting-strategy';
import { FilteringExpressionsTree, IFilteringExpressionsTree } from '../data-operations/filtering-expressions-tree';
import { IgxFilteringOperand } from '../data-operations/filtering-condition';
import { IgxRowEditTabStopDirective } from './grid.rowEdit.directive';
import { IgxFilteringService } from './filtering/grid-filtering.service';
import { IgxGridSummaryService } from './summaries/grid-summary.service';
import { IGridResourceStrings } from '../core/i18n/grid-resources';
import { ISortingExpression } from '../data-operations/sorting-expression.interface';
import { IGroupingExpression } from '../data-operations/grouping-expression.interface';

export const MINIMUM_COLUMN_WIDTH = 136;
export const FILTER_ROW_HEIGHT = 50;
export const IgxGridTransaction = new InjectionToken<string>('IgxGridTransaction');


interface INativeElement {
    nativeElement: HTMLElement;
}

export interface IgxGridCellType extends INativeElement {
    column: IgxGridColumnType;
    row: any;
    rowData: any;
    cellID: any;
    value: any;
    rowIndex: number;
    columnIndex: number;
    visibleColumnIndex: number;
    editMode: boolean;
    inEditMode: boolean;
    selected: boolean;
    editValue: any;
    editable: boolean;
    grid: IgxGridType;
    cdr: ChangeDetectorRef;
    focused: boolean;
    readonly: boolean;
    describedby: string;
    width: string;
    gridAPI: any;

    onClick(event: MouseEvent): void;
    onFocus(event: FocusEvent): void;
    dispatchEvent(event: KeyboardEvent): void;
    onKeydownEnterEditMode(): void;
    onKeydownExitEditMode(): void;
    calculateSizeToFit(range: any): number;
    highlightText(text: string, caseSensitive?: boolean, exactMatch?: boolean): number;
    clearHighlight(): void;
    setEditMode(value: boolean): void;
    update(value: any): void;
}

export interface IgxGridTreeCellType extends IgxGridCellType {
    expanded: boolean;
    level: number;
    showIndicator: boolean;
    hasChildren: boolean;
}

interface IGridRowExpandable {
    expanded: boolean;
}

export interface IgxGridRowType extends INativeElement {
    rowData: any;
    gridID: string;
    rowID: any;
    index: number;
    rowSelectable: boolean;
    deleted: boolean;
    focused: boolean;

    virtDirRow: IgxGridForOfDirective<any>;
    cells: QueryList<IgxGridCellType>;
    checkboxElement: IgxCheckboxComponent;

    update(value: any): void;
    delete(): void;
}

export interface IgxGridTreeRowType extends IgxGridRowType, IGridRowExpandable {
    treeRow: ITreeGridRecord;
}

export interface IgxGridGroupByRowType extends IGridRowExpandable {
    groupRow: IGroupByRecord;
}

export interface IgxGridHeaderGroupType {
    height: number;
    headerCell: IgxGridHeaderType;
    filterCell: IgxGridFilterCellType;
    column: IgxGridColumnType;
}

export interface IgxGridHeaderType extends INativeElement {
    column: IgxGridColumnType;
}

export interface IgxGridFilterCellType {
    column: IgxGridColumnType;
    updateFilterCellArea(): void;
    focusChip(focsuFirst: boolean): void;
}

export interface IgxGridColumnType {
    field: string;
    header: string;
    sortable: boolean;
    groupable: boolean;
    editable: boolean;
    filterable: boolean;
    resizable: boolean;
    hasSummary: boolean;
    hidden: boolean;
    pinned: boolean;
    movable: boolean;
    searchable: boolean;
    disablePinning: boolean;
    disableHiding: boolean;
    sortingIgnoreCase: boolean;
    headerClasses: string;
    headerGroupClasses: string;
    width: string;
    calcWidth: string | number;
    defaultWidth: string;
    defaultMinWidth: string;
    widthSetByUser: boolean;
    maxWidth: string;
    minWidth: string;
    index: number;
    formatter: (value: any) => string | number;
    dataType: DataType;
    visibleIndex: number;
    columnGroup: boolean;
    summaries: any;
    cells: IgxGridCellType[];
    children: QueryList<any>;
    parent: IgxGridColumnType;
    topLevelParent: IgxGridColumnType;
    allChildren: IgxGridColumnType[];
    level: number;
    isLastPinned: boolean;
    bodyTemplate: TemplateRef<any>;
    headerTemplate: TemplateRef<any>;
    filterCellTemplate: TemplateRef<any>;
    inlineEditorTemplate: TemplateRef<any>;
    headerGroup: IgxGridHeaderGroupType;
    headerCell: IgxGridHeaderType;
    filteringIgnoreCase: boolean;
    filters: IgxFilteringOperand;
    filterCell: IgxGridFilterCellType;
    filteringExpressionsTree: FilteringExpressionsTree;
    grid: IgxGridType;
    sortStrategy: ISortingStrategy;

    autosize(): void;
    resetVisibleIndex(): void;
    getLargestCellWidth(): string;
    getCellWidth(): string;
    pin(index?: number): boolean;
    unpin(index?: number): boolean;
}


export interface IgxGridType extends INativeElement {
    id: string;
    data: any[];
    filteredData: any[];
    primaryKey: any;
    locale: string;
    rowEditable: boolean;
    hasMovableColumns: boolean;
    allowFiltering: boolean;
    rootSummariesEnabled: boolean;
    calcHeight: number;
    defaultRowHeight: number;
    filterMode: FilterMode;
    calcPinnedContainerMaxWidth: number;
    pinnedWidth: number;
    unpinnedWidth: number;
    filteringExpressionsTree: IFilteringExpressionsTree;
    resourceStrings: IGridResourceStrings;
    sortingExpressions: ISortingExpression[];

    firstEditableColumnIndex: number;
    lastEditableColumnIndex: number;


    cdr: ChangeDetectorRef;
    columnList: QueryList<IgxGridColumnType>;
    lastSearchInfo: ISearchInfo;
    draggedColumn: IgxGridColumnType;
    resizeLine: IgxGridColumnResizerComponent;
    document: Document;
    tbody: ElementRef;
    // TOOD: type
    rowInEditMode;

    visibleColumns: IgxGridColumnType[];
    pinnedColumns: IgxGridColumnType[];
    unpinnedColumns: IgxGridColumnType[];
    columns: IgxGridColumnType[];
    rowList: QueryList<any>;
    dataRowList: QueryList<any>;
    summariesRowList: QueryList<any>;
    rowEditTabs: QueryList<IgxRowEditTabStopDirective>;
    // TODO: Type'em right. Need to change return signature in grid-base though.
    headerCellList: Array<IgxGridHeaderType>;
    filterCellList: Array<IgxGridFilterCellType>;
    headerGroupsList: Array<IgxGridHeaderGroupType>;

    outletDirective;
    headerContainer: IgxGridForOfDirective<any>;
    parentVirtDir: IgxGridForOfDirective<any>;
    verticalScrollContainer: IgxGridForOfDirective<any>;

    gridAPI;
    summaryService: IgxGridSummaryService;
    filteringService: IgxFilteringService;
    navigation: IgxGridNavigationService;
    transactions: TransactionService<Transaction, State>;

    // TODO: Type it!
    onFilteringDone: EventEmitter<any>;
    onRangeSelection: EventEmitter<GridSelectionRange>;
    onDoubleClick: EventEmitter<any>;
    onCellClick: EventEmitter<any>;
    onContextMenu: EventEmitter<any>;
    onSelection: EventEmitter<any>;
    onFocusChange: EventEmitter<any>;
    onCellEditCancel: EventEmitter<any>;
    onColumnMovingStart: EventEmitter<any>;
    onColumnMovingEnd: EventEmitter<any>;
    onColumnMoving: EventEmitter<any>;
    onColumnResized: EventEmitter<any>;

    moveColumn(column: IgxGridColumnType, dropTarget: IgxGridColumnType, pos: DropPosition): void;
    getVisibleContentHeight(): number;
    getPossibleColumnWidth(): string;
    getRowByIndex(index: number): IgxGridRowType;
    getPinnedWidth(takeHidden: boolean): number;
    wheelHandler(): void;
    reflow(): void;
    refreshSearch(updateActiveInfo?: boolean): number;
    resetCaches(): void;
    markForCheck(): void;
    endEdit(commit: boolean): void;
}

export interface IgxGridGroupType extends IgxGridType {
    groupingExpressions?: IGroupingExpression[];
    groupBy(expression: IGroupingExpression | Array<IGroupingExpression>): void;
}

export interface IgxHGridType extends IgxGridType {
    hgridAPI;
    parent: IgxHGridType;
    highlightedRowID: any;
}
