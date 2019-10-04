import { TemplateRef } from '@angular/core';
import { DataType } from '../../data-operations/data-util';
import { IgxFilteringOperand } from '../../data-operations/filtering-condition';
import { ISortingStrategy } from '../../data-operations/sorting-strategy';

export interface IGridColumn {
    field?: string;
    header?: string;
    dataType?: DataType;
    editable?: boolean;
    resizable?: boolean;
    searchable?: boolean;
    movable?: boolean;
    groupable?: boolean;
    sortable?: boolean;
    sortStrategy?: ISortingStrategy;
    sortingIgnoreCase?: boolean;
    filterable?: boolean;
    filters?: IgxFilteringOperand;
    filteringIgnoreCase?: boolean;
    hidden?: boolean;
    pinned?: boolean;
    disablePinning?: boolean;
    summaries?: any;
    hasSummary?: boolean;
    width?: string;
    maxWidth?: string;
    minWidth?: string;
    rowStart?: number;
    rowEnd?: number;
    colStart?: number;
    colEnd?: number;
    headerClasses?: string;
    headerGroupClasses?: string;
    cellClasses?: string;
    bodyTemplate?: TemplateRef<any>;
    headerTemplate?: TemplateRef<any>;
    inlineEditorTemplate?: TemplateRef<any>;
    filterCellTemplate?: TemplateRef<any>;
    groupChildren?: IGridColumn[];
    layoutChildren?: IGridColumn[];
    formatter?: (value: any) => any;
    groupingComparer?: (a: any, b: any) => number;
}

/**
 * @hidden
 * @internal
 */
export interface ColumnType {
    field: string;
    index: number;
    dataType: DataType;
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
    pinned: boolean;
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
}
