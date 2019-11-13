import { FilterMode } from './enums';
import { DisplayDensity } from '../../core/displayDensity';
import { EventEmitter } from '@angular/core';
import { IFilteringExpressionsTree } from '../../data-operations/filtering-expressions-tree';
import { IGridResourceStrings } from '../../core/i18n/grid-resources';
import { ISortingExpression } from '../../data-operations/sorting-expression.interface';

export interface IGridDataBindable {
    data: any[];
    filteredData: any[];
}

/**
 * An interface describing a Grid type
 */
export interface GridType extends IGridDataBindable {
    displayDensity: DisplayDensity | string;
    locale: string;
    resourceStrings: IGridResourceStrings;
    nativeElement: HTMLElement;
    rowEditable: boolean;
    rootSummariesEnabled: boolean;
    allowFiltering: boolean;
    rowDraggable: boolean;
    primaryKey: any;
    id: string;

    filterMode: FilterMode;

    selectionService: any;
    navigation: any;
    filteringService: any;
    outletDirective: any;

    calcHeight: number;

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

    rowInEditMode: any;
    rowEditTabs: any;

    firstEditableColumnIndex: number;
    lastEditableColumnIndex: number;
    hasDetails: boolean;

    sortingExpressions: ISortingExpression[];
    sortingExpressionsChange: EventEmitter<ISortingExpression[]>;
    advancedFilteringExpressionsTree: IFilteringExpressionsTree;
    advancedFilteringExpressionsTreeChange: EventEmitter<IFilteringExpressionsTree>;

    endEdit(commit: boolean, event?: Event): void;
    getColumnByName(name: string): any;
    sort(expression: ISortingExpression | Array<ISortingExpression>): void;
    clearSort(name?: string): void;
    isColumnGrouped(fieldName: string): boolean;
    isDetailRecord(rec: any): boolean;
}
