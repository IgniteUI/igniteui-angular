import {
    QueryList,
    ChangeDetectorRef,
    EventEmitter
} from '@angular/core';

import { IgxOverlayOutletDirective } from '../directives/toggle/toggle.directive';

import { ISortingExpression } from '../data-operations/sorting-expression.interface';
import { IFilteringExpressionsTree } from '../data-operations/filtering-expressions-tree';
import { IFilteringOperation } from '../data-operations/filtering-condition';

import { IgxColumnComponent } from './column.component';
import { IgxGridHeaderComponent } from './grid-header.component';
import { IgxRowComponent } from './row.component';

import { IgxForOfDirective } from '../directives/for-of/for_of.directive';

import { IgxSelectionAPIService } from '../core/selection';

import { IColumnVisibilityChangedEventArgs } from './column-hiding/column-hiding-item.directive';
import {
    IGridComponent,
    ISearchInfo,
    IGridEditEventArgs,
    IRowDataEventArgs,
    IColumnMovingStartEventArgs,
    IColumnMovingEventArgs,
    IColumnMovingEndEventArgs,
    IGridToolbarExportEventArgs
} from './grid-interfaces';

export class EmptyMockGrid implements IGridComponent {
    columns: IgxColumnComponent[];
    data: any[];
    filteredSortedData: any[];
    primaryKey: string;
    rowList: QueryList<any>;
    dataRowList: QueryList<IgxRowComponent<IGridComponent>>;
    sortingExpressions: ISortingExpression[];
    paging: boolean;
    page: number;
    perPage: number;
    isLastPage: boolean;
    filteringExpressionsTree: IFilteringExpressionsTree;
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
    displayDensity: string;
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
    onEditDone: EventEmitter<IGridEditEventArgs>;
    onRowDeleted: EventEmitter<IRowDataEventArgs>;
    onColumnMovingStart: EventEmitter<IColumnMovingStartEventArgs>;
    onColumnMoving: EventEmitter<IColumnMovingEventArgs>;
    onColumnMovingEnd: EventEmitter<IColumnMovingEndEventArgs>;
    id = 'mock-grid';
    nativeElement: any;
    cdr: ChangeDetectorRef;
    exportExcel: boolean;
    exportCsv: boolean;
    toolbarTitle: string;
    exportText: string;
    exportExcelText: string;
    exportCsvText: string;
    columnHidingTitle: string;
    columnPinningTitle: string;
    onToolbarExporting: EventEmitter<IGridToolbarExportEventArgs>;
    verticalScrollContainer: IgxForOfDirective<any>;
    parentVirtDir: IgxForOfDirective<any>;
    headerContainer: IgxForOfDirective<any>;
    filteredData: any[];
    onFilteringDone: EventEmitter<IFilteringExpressionsTree>;
    reflow() {
        throw new Error('Method not implemented.');
    }
    markForCheck() {
        throw new Error('Method not implemented.');
    }
    deselectRows(rowIDs: any[]) {
        throw new Error('Method not implemented.');
    }
    selectRows(rowIDs: any[], clearCurrentSelection?: boolean) {
        throw new Error('Method not implemented.');
    }
    triggerRowSelectionChange(newSelectionAsSet: Set<any>, row?: IgxRowComponent<IGridComponent>, event?: Event, headerStatus?: boolean) {
        throw new Error('Method not implemented.');
    }
    getPinnedWidth(takeHidden?: boolean) {
        throw new Error('Method not implemented.');
    }
    moveColumn(column: IgxColumnComponent, dropTarget: IgxColumnComponent) {
        throw new Error('Method not implemented.');
    }
    getCellByKey(rowSelector: any, columnField: string) {
        throw new Error('Method not implemented.');
    }
    trackColumnChanges(index: any, col: any) {
        throw new Error('Method not implemented.');
    }
    checkHeaderCheckboxStatus(headerStatus?: boolean) {
        throw new Error('Method not implemented.');
    }
    toggleColumnVisibility(args: IColumnVisibilityChangedEventArgs) {
        throw new Error('Method not implemented.');
    }
    clearFilter(name?: string) {
        throw new Error('Method not implemented.');
    }
    filter(name: string, value: any, conditionOrExpressionTree?: IFilteringExpressionsTree | IFilteringOperation, ignoreCase?: boolean) {
        throw new Error('Method not implemented.');
    }


}
