/**
 * Minimal type stubs for grid types to avoid circular dependencies.
 * These are simple interfaces that core uses for typing only.
 * The actual implementations are in igniteui-angular/grids.
 */

import { QueryList, TemplateRef } from '@angular/core';
import { WEEKDAYS } from '../core/enums';
import { IgxFilteringOperand } from './filtering-condition';
import { ISortingStrategy } from './sorting-strategy';
import { FilteringExpressionsTree } from './filtering-expressions-tree';


/* IgxGrid column types */
export interface IFieldPipeArgs {
    /** The date/time components that a date column will display, using predefined options or a custom format string. */
    format?: string;
    /** A timezone offset (such as '+0430'), or a standard UTC/GMT or continental US timezone abbreviation. */
    timezone?: string;
    /**
     * Decimal representation options, specified by a string in the following format:
     * `{minIntegerDigits}`.`{minFractionDigits}`-`{maxFractionDigits}`.
     * `minIntegerDigits`: The minimum number of integer digits before the decimal point. Default is 1.
     * `minFractionDigits`: The minimum number of digits after the decimal point. Default is 0.
     * `maxFractionDigits`: The maximum number of digits after the decimal point. Default is 3.
     */
    digitsInfo?: string;
    /** The currency code of type string, default value undefined */
    currencyCode?: string;
    /**
     * Allow us to display currency 'symbol' or 'code' or 'symbol-narrow' or our own string.
     * The value is of type string. By default is set to 'symbol'
     */
    display?: string;

    /** The first week day to be displayed in calendar when filtering or editing a date column */
    weekStart?: WEEKDAYS | number;
}

// D.P. Can't use `export type IColumnPipeArgs = IFieldPipeArgs` because TypeScripts Compiler API optimizes it away completely

export interface IColumnPipeArgs extends IFieldPipeArgs {}

export interface IFieldEditorOptions {
    /**
     * A custom input format string used for the built-in editors of date/time columns.
     * See the Editing section under https://www.infragistics.com/products/ignite-ui-angular/angular/components/grid/column-types#datetime-date-and-time
     */
    dateTimeFormat?: string;
}

export interface IColumnEditorOptions extends IFieldEditorOptions {}

export interface ISortingOptions {
    mode: 'single' | 'multiple';
}

/**
 * @hidden
 * @internal
 */
export interface MRLColumnSizeInfo {
    ref: ColumnType;
    width: number;
    colSpan: number;
    colEnd: number;
    widthSetByUser: boolean;
}

/**
 * @hidden
 * @internal
 */
export interface MRLResizeColumnInfo {
    target: ColumnType;
    spanUsed: number;
}

/* mustCoerceToInt */
/**
 * Enumeration representing the possible positions for pinning columns.
 * - Start: Columns are pinned to the start of the grid.
 * - End: Columns are pinned to the end of the grid.
 */
export enum ColumnPinningPosition {
    Start,
    End
}

/**
 * Stub type for GridType - minimal interface for typing in core
 */
export interface GridTypeBase {
    primaryKey?: string;
    id?: string;
    data?: any[];
    [key: string]: any;
}

/**
 * Describes a field that can be used in the Grid and QueryBuilder components.
 */
export interface FieldType {
    /**
     * Display label for the field.
     */
    label?: string;

    /**
     * The internal field name, used in expressions and queries.
     */
    field: string;

    /**
     * Optional column header for UI display purposes.
     */
    header?: string;

    /**
     * The data type of the field.
     */
    /* alternateType: GridColumnDataType */
    dataType: GridColumnDataType;

    /**
     * Options for the editor associated with this field.
     */
    editorOptions?: IFieldEditorOptions;

    /**
     * Optional filtering operands that apply to this field.
     */
    filters?: IgxFilteringOperand;

    /**
     * Optional arguments for any pipe applied to the field.
     */
    pipeArgs?: IFieldPipeArgs;

    /**
     * Default time format for Date/Time fields.
     */
    defaultTimeFormat?: string;

    /**
     * Default date/time format for Date/Time fields.
     */
    defaultDateTimeFormat?: string;

    /**
     * Optional formatter function to transform the value before display.
     *
     * @param value - The value of the field.
     * @param rowData - Optional row data that contains this field.
     * @returns The formatted value.
     */
    formatter?(value: any, rowData?: any): any;
}

/**
 * Represents a column in the `GridType`. It is essentially the blueprint to a column object.
 * Contains definitions of properties and methods, relevant to a column
 */
export interface ColumnType extends FieldType {
    /** Represents the instance of the parent `GridType` that contains this column. */
    grid: GridTypeBase;
    /**
     * A list containing all the child columns under this column (if any).
     * @deprecated in version 18.1.0. Use the `childColumns` property instead.
     */
    children: QueryList<ColumnType>;
    /**
     * A list containing all the child columns under this column (if any).
     * Empty without children or if this column is not Group or Layout.
     */
    get childColumns(): ColumnType[];
    /** @hidden @internal */
    allChildren: ColumnType[];
    /** @hidden @internal */
    headerGroup: any;
    /** @hidden @internal */
    headerCell: any;
    validators: any[];
    mergingComparer: (prevRecord: any, record: any, field: string) => boolean;

    /**
     * The template reference for the custom header of the column
     * It is of type TemplateRef, which represents an embedded template, used to instantiate embedded views
     */
    headerTemplate: TemplateRef<any>;
    /**
     * The template reference for the collapsible indicator of the column.
     * It is of type TemplateRef, which represents an embedded template, used to instantiate embedded views
     */
    collapsibleIndicatorTemplate?: TemplateRef<any>;
    /** Represents custom CSS classes applied to the header element. When added, they take different styling */
    headerClasses: any;
    /** Represents custom CSS styles applied to the header element. When added, they take different styling */
    headerStyles: any;
     /** Represents custom CSS classes applied to the header group. When added, they take different styling */
    headerGroupClasses: any;
     /** Represents custom CSS styles applied to the header group. When added, they take different styling */
    headerGroupStyles: any;

    /**
     * Custom CSS styling, applied to every column
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

    /**
     * Optional
     * Represents the header text of the column
     */
    header?: string;
    /**
     * The index of the column within the grid.
     * Includes the hidden columns when counting
     */
    index: number;
    /**
     * Represents the type of data for the column:
     * string, number, boolean, currency, date, time, etc.
     */
    dataType: GridColumnDataType;
    /**
     * Sets properties on the default column editors
     */
    editorOptions: IColumnEditorOptions;
    /**
     * The template reference for the custom inline editor of the column
     * It is of type TemplateRef, which represents an embedded template, used to instantiate embedded views
     */
    inlineEditorTemplate: TemplateRef<any>;
    /**
     * The index of the column within the grid.
     * Does not include the hidden columns when counting
     */
    visibleIndex: number;
    /** Optional
     * Indicated whether the column can be collapsed. If the value is true, the column can be collapsed
     * It is used in tree grid and for navigation
     */
    collapsible?: boolean;
    /** Indicated whether the column can be edited. If the value is true, the column can be edited */
    editable: boolean;
    /** Specifies whether the column can be resized. If the value is true, the column can be resized */
    resizable: boolean;
    /** Specifies whether the data of the column can be searched. If the value is true, the column data can be searched */
    searchable: boolean;
    /** Specifies whether the column belongs to a group of columns. */
    columnGroup: boolean;
    /** Indicates whether a column can be put in a group. If the value is true, the column can be put in a group */
    groupable: boolean;
    /** Indicates whether a column can be sorted. If the value is true, the column can be sorted. */
    sortable: boolean;
    /** Indicates whether a column can be filtered. If the value is true, the column can be filtered */
    filterable: boolean;
    /** Indicates whether a column is currently hidden (not visible). If the value is true, the column is not visible */
    hidden: boolean;
    /** Indicates whether a column can be pinned. If the value is true, the column cannot be pinned */
    disablePinning: boolean;
    /** Indicates whether a column can be hidden. If the value is true, the column cannot be hidden */
    disableHiding: boolean;
    /**
     * The sorting strategy used for sorting this column.
     * The interface contains a method sort that sorts the provided data based on the given sorting expressions
     */
    sortStrategy: ISortingStrategy;
     /**
     * Indicates whether the search should match results, no matter the case of the letters (upper and lower)
     * If the value is false, the result will depend on the case (example: `E` will not match `e`)
     * If the value is true, the result will not depend on the case (example: `E` will match `e`)
     */
    sortingIgnoreCase: boolean;
    /** @hidden @internal */
    filterCell: any;
    filteringIgnoreCase: boolean;
    /**
     * The filtering expressions for the column.
     * The type contains properties and methods for filtering: filteringOperands, operator (logic), fieldName, etc.
     */
    filteringExpressionsTree: FilteringExpressionsTree;
    hasSummary: boolean;
    summaries: any;
    disabledSummaries?: string[];
    /**
     * The template reference for a summary of the column
     * It is of type TemplateRef, which represents an embedded template, used to instantiate embedded views
     */
    summaryTemplate: TemplateRef<any>;
    /** Indicates if the column is currently pinned. If the value is true, the column is pinned */
    pinned: boolean;
    /** Indicates if the column is currently expanded or collapsed. If the value is true, the column is expanded */
    expanded: boolean;
    merge: boolean;
    /** Indicates if the column is currently selected. If the value is true, the column is selected */
    selected: boolean;
    /** Indicates if the column can be selected. If the value is true, the column can be selected */
    selectable: boolean;
    columnLayout: boolean;
    /** Represents the hierarchical level of the column in the column layout */
    level: number;
    rowStart: number;
    rowEnd: number;
    colStart: number;
    colEnd: number;
    /** @hidden @internal */
    gridRowSpan: number;
    /** @hidden @internal */
    gridColumnSpan: number;
    columnLayoutChild: boolean;
    width: string;
    /**
     * Optional
     * The root parent of this column (if any).
     * If there is no root parent, that means the current column is the root parent
     */
    topLevelParent?: ColumnType;
    /* alternateName: parentColumn */
    /**
     * Optional
     * The immediate parent (right above) column of this column (if any).
     * If there is no parent, that means the current column is the root parent
     */
    parent?: ColumnType;
    pipeArgs: IColumnPipeArgs;
    hasNestedPath: boolean;
    additionalTemplateContext: any;
    /** Indicates whether the current column is the last to be pinned.
     * If the value is false, there are columns, that have been pinned after the current */
    isLastPinned: boolean;
    /** Indicates whether the current column is the first for the grid to be pinned.
     * If the value is false, there are columns, that have been pinned before the current */
    isFirstPinned: boolean;
    applySelectableClass: boolean;
    /** The title of the column, used for accessibility purposes */
    title: string;
    /* blazorSuppress */
    /** Represents a method with custom grouping comparator to determine the members of the group. */
    groupingComparer: (a: any, b: any) => number;

    /**
     * Represents a custom template for filtering
     * It is of type TemplateRef, which represents an embedded template, used to instantiate embedded views
     */
    filterCellTemplate: TemplateRef<any>;

    /**
     * A method definition to move the column to the specified index.
     * It takes the index of type number as a parameter
    */
    move(index: number): void;
    /** A method definition to retrieve the set CSS size */
    getAutoSize(): string;
    getResizableColUnderEnd(): MRLResizeColumnInfo[];
    /** A method definition to retrieve the set CSS width of the cells under the column */
    getCellWidth(): string;
    getGridTemplate(isRow: boolean): string;
    /** A method definition to toggle column visibility (hidden or visible) */
    toggleVisibility(value?: boolean): void;
    populateVisibleIndexes?(): void;
    /** Pins the column at the specified index (if not already pinned). */
    pin(index?: number, pinningPosition?: ColumnPinningPosition): boolean;
    /** Unpins the column at the specified index (if not already unpinned). */
    unpin(index?: number): boolean;
}

/**
 * Describes an entity in the QueryBuilder.
 * An entity represents a logical grouping of fields and can have nested child entities.
 */
export interface EntityType {
    /**
     * The name of the entity.
     * Typically used as an identifier in expressions.
     */
    name: string;

    /**
     * The list of fields that belong to this entity.
     */
    fields: FieldType[];

    /**
     * Optional child entities.
     * This allows building hierarchical or nested query structures.
     */
    childEntities?: EntityType[];
}

/* marshalByValue */
export interface ITreeGridRecord {
    key: any;
    data: any;
    children?: ITreeGridRecord[];
    /* blazorAlternateName: RecordParent */
    parent?: ITreeGridRecord;
    level?: number;
    isFilteredOutParent?: boolean;
    expanded?: boolean;
}

/**
 * Stub type for IgxTreeGridAPIService - minimal interface for typing in core
 */
export interface IgxTreeGridAPIService {
    get_row_id(rowData: any): any;
    [key: string]: any;
}


/** Interface representing a segment of a path in a hierarchical grid. */
export interface IPathSegment {
    /**
     * The unique identifier of the row within the segment.
     * @deprecated since version 17.1.0. Use the `rowKey` property instead.
     */
    rowID: any;
    rowKey: any;
    /** The key representing the row's 'hierarchical level. */
    rowIslandKey: string;
}

/* tsPlainInterface *
/* marshalByValue */
export interface ISummaryExpression {
    fieldName: string;
    /* blazorCSSuppress */
    customSummary?: any;
}

/* tsPlainInterface */
/* marshalByValue */
export interface IgxSummaryResult {
    key: string;
    label: string;
    /* blazorAlternateName: Result */
    summaryResult: any;
    /**
     * Apply default formatting based on the grid column type.
     * ```typescript
     * const result: IgxSummaryResult = {
     *   key: 'key',
     *   label: 'label',
     *   defaultFormatting: true
     * }
     * ```
     *
     * @memberof IgxSummaryResult
     */
    defaultFormatting?: boolean;
}

export interface ISummaryRecord {
    summaries: Map<string, IgxSummaryResult[]>;
    max?: number;
    cellIndentation?: number;
}

/**
 * Enumeration representing different calculation modes for grid summaries.
 * - rootLevelOnly: Summaries are calculated only for the root level.
 * - childLevelsOnly: Summaries are calculated only for child levels.
 * - rootAndChildLevels: Default value; Summaries are calculated for both root and child levels.
 */
export const GridSummaryCalculationMode = {
    rootLevelOnly: 'rootLevelOnly',
    childLevelsOnly: 'childLevelsOnly',
    rootAndChildLevels: 'rootAndChildLevels'
} as const;
export type GridSummaryCalculationMode = (typeof GridSummaryCalculationMode)[keyof typeof GridSummaryCalculationMode];

/**
 * @hidden
 */
export const GridColumnDataType = {
    String: 'string',
    Number: 'number',
    Boolean: 'boolean',
    Date: 'date',
    DateTime: 'dateTime',
    Time: 'time',
    Currency: 'currency',
    Percent: 'percent',
    Image: 'image'
} as const;
export type GridColumnDataType = (typeof GridColumnDataType)[keyof typeof GridColumnDataType];
