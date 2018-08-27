import {
    QueryList,
    ChangeDetectorRef,
    EventEmitter
} from '@angular/core';

import { IgxOverlayOutletDirective } from '../directives/toggle/toggle.directive';

import { ISortingExpression } from '../data-operations/sorting-expression.interface';
import { IFilteringExpressionsTree } from '../data-operations/filtering-expressions-tree';
import { IFilteringOperation } from '../data-operations/filtering-condition';

import { IgxGridCellComponent } from './cell.component';
import { IgxColumnComponent } from './column.component';
import { IgxGridHeaderComponent } from './grid-header.component';
import { IgxRowComponent } from './row.component';

import { IgxBaseExporter, IgxExporterOptionsBase } from '../services/index';
import { IgxForOfDirective } from '../directives/for-of/for_of.directive';

import { DisplayDensity } from '../core/utils';
import { IgxSelectionAPIService } from '../core/selection';

import { IColumnVisibilityChangedEventArgs } from './column-hiding/column-hiding-item.directive';

export interface IGridCellEventArgs {
    cell: IgxGridCellComponent;
    event: Event;
}

export interface IGridEditEventArgs {
    row: IgxRowComponent<IGridComponent>;
    cell: IgxGridCellComponent;
    currentValue: any;
    newValue: any;
}

export interface IPinColumnEventArgs {
    column: IgxColumnComponent;
    insertAtIndex: number;
}

export interface IPageEventArgs {
    previous: number;
    current: number;
}

export interface IRowDataEventArgs {
    data: any;
}

export interface IColumnResizeEventArgs {
    column: IgxColumnComponent;
    prevWidth: string;
    newWidth: string;
}

export interface IRowSelectionEventArgs {
    oldSelection: any[];
    newSelection: any[];
    row?: IgxRowComponent<IGridComponent>;
    event?: Event;
}

export interface ISearchInfo {
    searchText: string;
    caseSensitive: boolean;
    exactMatch: boolean;
    activeMatchIndex: number;
    collapsedHighlightedItem: any;
    matchInfoCache: any[];
}

export interface IGridToolbarExportEventArgs {
    grid: IGridComponent;
    exporter: IgxBaseExporter;
    options: IgxExporterOptionsBase;
    cancel: boolean;
}

export interface IColumnMovingStartEventArgs {
    source: IgxColumnComponent;
}

export interface IColumnMovingEventArgs {
    source: IgxColumnComponent;
    cancel: boolean;
}

export interface IColumnMovingEndEventArgs {
    source: IgxColumnComponent;
    target: IgxColumnComponent;
    cancel: boolean;
}

export interface IToolbarComponent {
    exportExcel: boolean;
    exportCsv: boolean;
    toolbarTitle: string;
    exportText: string;
    exportExcelText: string;
    exportCsvText: string;
    columnHidingTitle: string;
    columnPinningTitle: string;


    onToolbarExporting: EventEmitter<IGridToolbarExportEventArgs>;
}

export interface IVirtualizedComponent {
    verticalScrollContainer: IgxForOfDirective<any>;
    parentVirtDir: IgxForOfDirective<any>;
    headerContainer: IgxForOfDirective<any>;
}

export interface IFilterableComponent {
    onFilteringDone: EventEmitter<IFilteringExpressionsTree>;

    clearFilter(name?: string);
    filter(name: string, value: any, conditionOrExpressionTree?: IFilteringOperation | IFilteringExpressionsTree, ignoreCase?: boolean);
}

export interface IGridComponent extends IToolbarComponent,
                                        IVirtualizedComponent,
                                        IFilterableComponent {
    id: string;
    columns: IgxColumnComponent[];
    data: any[];
    filteredData: any[];
    filteredSortedData: any[];
    primaryKey: string;
    rowList: QueryList<any>;
    dataRowList: QueryList<IgxRowComponent<IGridComponent>>;
    cdr: ChangeDetectorRef;
    sortingExpressions: ISortingExpression[];
    nativeElement: any;
    paging: boolean;
    page: number;
    perPage: number;
    isLastPage: boolean;
    filteringExpressionsTree: IFilteringExpressionsTree;
    // TODO: currently the search is tighltly coupled with the grouping functionality of the grid
    // due to its dependence on row indexes ang the group by rows changing the indexes of the data rows.
    // It would be dificult to make it work for both grid and treeGrid without a rework (making the directive work with the data item)
    lastSearchInfo: ISearchInfo;
    summariesHeight: number;
    columnsWithNoSetWidths: IgxColumnComponent[];
    hasMovableColumns: boolean;
    pinnedColumns: IgxColumnComponent[];
    unpinnedColumns: IgxColumnComponent[];
    pinnedColumnsText: string;
    visibleColumns: IgxColumnComponent[];
    headerList: QueryList<IgxGridHeaderComponent>;
    draggedColumn: IgxColumnComponent;
    isColumnResizing: boolean;
    isColumnMoving: boolean;
    evenRowCSS: string;
    oddRowCSS: string;
    displayDensity: DisplayDensity | string;
    outletDirective: IgxOverlayOutletDirective;
    hiddenColumnsCount: number;
    hiddenColumnsText: string;
    columnHiding: boolean;
    columnPinning: boolean;

    rowSelectable: boolean;
    allRowsSelected: boolean;
    selectionAPI: IgxSelectionAPIService;
    unpinnedWidth: number;
    calcHeight: number;
    calcPinnedContainerMaxWidth: number;
    rowHeight: number;
    defaultRowHeight: number;

    // Events
    onEditDone: EventEmitter<IGridEditEventArgs>;
    onRowDeleted: EventEmitter<IRowDataEventArgs>;
    onColumnMovingStart: EventEmitter<IColumnMovingStartEventArgs>;
    onColumnMoving: EventEmitter<IColumnMovingEventArgs>;
    onColumnMovingEnd: EventEmitter<IColumnMovingEndEventArgs>;

    // Methods
    reflow();
    markForCheck();
    deselectRows(rowIDs: any[]);
    selectRows(rowIDs: any[], clearCurrentSelection?: boolean);
    triggerRowSelectionChange(newSelectionAsSet: Set<any>,
        row?: IgxRowComponent<IGridComponent>, event?: Event, headerStatus?: boolean);
    getPinnedWidth(takeHidden?: boolean);
    moveColumn(column: IgxColumnComponent, dropTarget: IgxColumnComponent);
    getCellByKey(rowSelector: any, columnField: string);
    trackColumnChanges(index, col);
    checkHeaderCheckboxStatus(headerStatus?: boolean);
    toggleColumnVisibility(args: IColumnVisibilityChangedEventArgs);
}
