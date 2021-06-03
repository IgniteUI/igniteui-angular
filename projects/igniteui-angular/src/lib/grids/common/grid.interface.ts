import { FilterMode } from './enums';
import { DisplayDensity } from '../../core/displayDensity';
import { EventEmitter } from '@angular/core';
import { IFilteringExpressionsTree } from '../../data-operations/filtering-expressions-tree';
import { IGridResourceStrings } from '../../core/i18n/grid-resources';
import { ISortingExpression } from '../../data-operations/sorting-expression.interface';
import { IGroupingExpression } from '../../data-operations/grouping-expression.interface';
import { TransactionService, Transaction, State } from '../../services/public_api';
import { ITreeGridRecord } from '../tree-grid/public_api';
import { IGroupByExpandState } from '../../data-operations/groupby-expand-state.interface';
import { IGroupByRecord } from '../../data-operations/groupby-record.interface';

export interface IGridDataBindable {
    data: any[] | null;
    filteredData: any[];
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
    summaryPipeTrigger: number;

    filterMode: FilterMode;

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

    calcHeight: number;
    defaultHeaderGroupMinWidth: any;
    scrollSize: number;

    parentVirtDir: any;
    tbody: any;
    verticalScrollContainer: any;
    dataRowList: any;
    rowList: any;
    columnList: any;
    columns: any;
    unpinnedColumns: any;
    pinnedColumns: any;
    summariesRowList: any;
    headerContainer: any;
    dataView: any[];
    transactions: TransactionService<Transaction, State>;
    defaultSummaryHeight: number;

    rowEditTabs: any;

    firstEditableColumnIndex: number;
    lastEditableColumnIndex: number;
    hasDetails: boolean;

    sortingExpressions: ISortingExpression[];
    sortingExpressionsChange: EventEmitter<ISortingExpression[]>;
    filteringExpressionsTree: IFilteringExpressionsTree;
    filteringExpressionsTreeChange: EventEmitter<IFilteringExpressionsTree>;
    advancedFilteringExpressionsTree: IFilteringExpressionsTree;
    advancedFilteringExpressionsTreeChange: EventEmitter<IFilteringExpressionsTree>;

    trackColumnChanges(index: number, column: any): any;
    hasVerticalScroll(): boolean;
    getColumnByName(name: string): any;
    sort(expression: ISortingExpression | Array<ISortingExpression>): void;
    clearSort(name?: string): void;
    isColumnGrouped(fieldName: string): boolean;
    isDetailRecord(rec: any): boolean;
    isGroupByRecord(rec: any): boolean;
    notifyChanges(repaint?: boolean): void;
}

/**
 * An interface describing a Flat Grid type
 */
export interface FlatGridType extends GridType {
    groupingExpansionState: IGroupByExpandState[];
    groupingExpressions: IGroupingExpression[];
    groupingExpressionsChange: EventEmitter<IGroupingExpression[]>;

    clearGrouping(field: string): void;
    toggleGroup(groupRow: IGroupByRecord): void;
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
