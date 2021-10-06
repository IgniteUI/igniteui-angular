import { QueryList, TemplateRef } from '@angular/core';
import { GridColumnDataType } from '../../data-operations/data-util';
import { ISortingStrategy } from '../../data-operations/sorting-strategy';
import { FilteringExpressionsTree } from '../../data-operations/filtering-expressions-tree';
import { IColumnPipeArgs } from '../columns/interfaces';
import { GridType } from './grid.interface';
import { IgxFilteringOperand } from '../../data-operations/filtering-condition';

/**
 * @hidden
 * @internal
 */
export interface ColumnType {
    grid: GridType;
    children: QueryList<ColumnType>;
    allChildren: ColumnType[];

    field: string;
    header?: string;
    index: number;
    dataType: GridColumnDataType;
    inlineEditorTemplate: TemplateRef<any>;
    visibleIndex: number;
    editable: boolean;
    resizable: boolean;
    searchable: boolean;
    columnGroup: boolean;
    movable: boolean;
    groupable: boolean;
    sortable: boolean;
    filterable: boolean;
    hidden: boolean;
    disablePinning: boolean;
    sortStrategy: ISortingStrategy;
    sortingIgnoreCase: boolean;
    filterCell: any;
    filters: IgxFilteringOperand;
    filteringIgnoreCase: boolean;
    filteringExpressionsTree: FilteringExpressionsTree;
    hasSummary: boolean;
    summaries: any;
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
    defaultTimeFormat: string;
    defaultDateTimeFormat: string;
    additionalTemplateContext: any;
    isLastPinned: boolean;
    isFirstPinned: boolean;
    applySelectableClass: boolean;
    title: string;

    filterCellTemplate: TemplateRef<any>;

    getCellWidth(): string;
    getGridTemplate(isRow: boolean): string;
    toggleVisibility(value?: boolean): void;
    formatter(value: any, rowData?: any): any;
    populateVisibleIndexes?(): void;
}
