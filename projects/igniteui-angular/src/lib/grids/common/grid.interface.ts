import { ColumnPinningPosition, FilterMode, GridPagingMode, GridSelectionMode, GridSummaryCalculationMode, GridSummaryPosition, GridValidationTrigger, RowPinningPosition, Size } from './enums';
import {
    ISearchInfo, IGridCellEventArgs, IRowSelectionEventArgs, IColumnSelectionEventArgs,
    IPinColumnCancellableEventArgs, IColumnVisibilityChangedEventArgs, IColumnVisibilityChangingEventArgs,
    IRowDragEndEventArgs, IColumnMovingStartEventArgs, IColumnMovingEndEventArgs,
    IRowDataEventArgs, IGridKeydownEventArgs, IRowDragStartEventArgs,
    IColumnMovingEventArgs, IPinColumnEventArgs,
    IActiveNodeChangeEventArgs,
    ICellPosition, IFilteringEventArgs, IColumnResizeEventArgs, IRowToggleEventArgs, IGridToolbarExportEventArgs, IPinRowEventArgs,
    IGridRowEventArgs, IGridEditEventArgs, IRowDataCancelableEventArgs, IGridEditDoneEventArgs,
    IGridContextMenuEventArgs
} from '../common/events';
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
import { IColumnEditorOptions, IColumnPipeArgs, IFieldEditorOptions, IFieldPipeArgs, ISortingOptions, MRLResizeColumnInfo } from '../columns/interfaces';
import { IgxSummaryResult } from '../summaries/grid-summary';
import { ISortingExpression, ISortingStrategy, SortingDirection } from '../../data-operations/sorting-strategy';
import { IGridGroupingStrategy, IGridSortingStrategy } from './strategy';
import { IForOfState, IgxGridForOfDirective } from '../../directives/for-of/for_of.directive';
import { OverlaySettings } from '../../services/overlay/utilities';
import { IDimensionsChange, IPivotConfiguration, IPivotDimension, IPivotKeys, IPivotValue, IValuesChange, PivotDimensionType, IPivotUISettings } from '../pivot-grid/pivot-grid.interface';
import { IDataCloneStrategy } from '../../data-operations/data-clone-strategy';
import { FormControl, FormGroup, ValidationErrors } from '@angular/forms';
import { IgxGridValidationService } from '../grid/grid-validation.service';

export const IGX_GRID_BASE = /*@__PURE__*/new InjectionToken<GridType>('IgxGridBaseToken');
export const IGX_GRID_SERVICE_BASE = /*@__PURE__*/new InjectionToken<GridServiceType>('IgxGridServiceBaseToken');

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

export interface IGridDataBindable {
    data: any[] | null;
    get filteredData(): any[];
}

/* marshalByValue */
/* jsonAPIComplexObject */
/**
 * Interface representing a cell in the grid. It is essentially the blueprint to a cell object.
 * Contains definitions of properties and methods, relevant to a cell
 */
export interface CellType {
    /** The current value of the cell. */
    value: any;
    /** The value to display when the cell is in edit mode. */
    editValue: any;
    /** Indicates whether the cell is currently selected. It is false, if the sell is not selected, and true, if it is. */
    selected: boolean;
    /** Indicates whether the cell is currently active (focused). */
    active: boolean;
    /** Indicates whether the cell can be edited. */
    editable: boolean;
    /** Indicates whether the cell is currently in edit mode. */
    editMode: boolean;
    /* blazorSuppress */
    /** Represents the native HTML element of the cell itself */
    nativeElement?: HTMLElement;
    /** Represents the column that the cell belongs to. */
    column: ColumnType;
    /* blazorCSSuppress */
    /** Represents the row that the cell belongs to */
    row: RowType;
    /** Represents the grid instance containing the cell */
    grid: GridType;
    /** Optional; An object identifying the cell. It contains rowID, columnID, and rowIndex of the cell. */
    id?: { rowID: any; columnID: number; rowIndex: number };
    /** Optional; The `cellID` is the unique key, used to identify the cell */
    cellID?: any;
    /**
     * Optional; An object representing the validation state of the cell.
     * Whether it's valid or invalid, and if it has errors
     */
    readonly validation?: IGridValidationState;
    readonly?: boolean;
    /** An optional title to display for the cell */
    title?: any;
    /** The CSS width of the cell as a string. */
    width: string;
    /** The index of the column that the cell belongs to. It counts only the visible (not hidden) columns */
    visibleColumnIndex?: number;
    /** A method definition to update the value of the cell. */
    update: (value: any) => void;
    /** A method definition to start or end the edit mode of the cell. It takes a boolean value as an argument*/
    setEditMode?(value: boolean): void;
    /**
     * Optional;
     * A method definition to calculate the size of the cell to fit the content
     * The method can be used to calculate the size of the cell with the longest content and resize all cells to that size
     */
    calculateSizeToFit?(range: any): number;
    /* blazorSuppress */
    /**
     * Optional
     * A method to activate the cell.
     * It takes a focus or keyboard event as an argument
     */
    activate?(event: FocusEvent | KeyboardEvent): void;
    /* blazorSuppress */
    /**
     * Optional
     * A method to handle double-click events on the cell
     * It takes a mouse event as an argument
     */
    onDoubleClick?(event: MouseEvent): void;
    /* blazorSuppress */
    /**
     * Optional
     * A method to handle click events on the cell
     * It takes a mouse event as an argument
     */
    onClick?(event: MouseEvent): void;
}

/**
 * Interface representing a header cell in the grid. It is essentially the blueprint to a header cell object.
 * Contains definitions of properties, relevant to the header
 */
export interface HeaderType {
    /* blazorSuppress */
    /** Represents the native HTML element of the cell itself */
    nativeElement: HTMLElement;
    /** The column that the header cell represents. */
    column: ColumnType;
    /** Indicates whether the column is currently sorted. */
    sorted: boolean;
    /** Indicates whether the cell can be selected */
    selectable: boolean;
    /** Indicates whether the cell is currently selected */
    selected: boolean;
    /** Indicates whether the column header is a title cell. */
    title: boolean;
    /** Represents the sorting direction of the column (ascending, descending or none). */
    sortDirection: SortingDirection;
}

/* jsonAPIComplexObject */
/* marshalByValue */
/**
 * Interface representing a row in the grid. It is essentially the blueprint to a row object.
 * Contains definitions of properties and methods, relevant to a row
 */
export interface RowType {
    /* blazorSuppress */
    /** Represents the native HTML element of the row itself */
    nativeElement?: HTMLElement;
    /** The index of the row within the grid */
    index: number;
    viewIndex: number;
    /** Indicates whether the row is grouped. */
    isGroupByRow?: boolean;
    isSummaryRow?: boolean;
    /* blazorSuppress */
    /**
     * Optional
     * A map of column field names to the summary results for the row.
     */
    summaries?: Map<string, IgxSummaryResult[]>;
    groupRow?: IGroupByRecord;
    key?: any;
    readonly validation?: IGridValidationState;
    data?: any;
    /**
     * Optional
     * A list or an array of cells, that belong to the row
     */
    cells?: QueryList<CellType> | CellType[];
    /**
     * Optional
     * Indicates whether the current row is disabled
     */
    disabled?: boolean;
    /* blazorSuppress */
    /**
     * Optional
     * Virtualization state of data record added from cache
     */
    virtDirRow?: IgxGridForOfDirective<ColumnType, ColumnType[]>;
    /**
     * Optional
     * Indicates whether the current row is pinned.
     */
    pinned?: boolean;
    /**
     * Optional
     * Indicates whether the current row is selected
     */
    selected?: boolean;
    /**
     * Optional
     * Indicates whether the current row is expanded.
     * The value is true, if the row is expanded and false, if it is collapsed
     */
    expanded?: boolean;
    /**
     * Optional
     * Indicates whether the row is marked for deletion.
     */
    deleted?: boolean;
     /**
     * Optional
     * Indicates whether the row is currently being edited.
     */
    inEditMode?: boolean;
    /**
     * Optional
     * Contains the child rows of the current row, if there are any.
     */
    children?: RowType[];
    /* blazorAlternateName: RowParent */
    /**
     * Optional
     * Contains the parent row of the current row, if it has one.
     * If the parent row exist, it means that the current row is a child row
     */
    parent?: RowType;
    /**
     * Optional
     * Indicates whether the current row has any child rows
     */
    hasChildren?: boolean;
    /**
     * Optional
     * Represents the hierarchical record associated with the row (for tree grids).
     * It is of type ITreeGridRecord, which contains the data, children, the hierarchical level, etc.
     */
    treeRow?: ITreeGridRecord;
    addRowUI?: boolean;
    /**
     * Optional
     * Indicates whether the row is currently focused.
     */
    focused?: boolean;
    /** Represent the grid instance, the row belongs to */
    grid: GridType;
    /* blazorSuppress */
    onRowSelectorClick?: (event: MouseEvent) => void;
    /* blazorSuppress */
    /**
     * Optional
     * A method to handle click event on the row
     * It takes a `MouseEvent` as an argument
     */
    onClick?: (event: MouseEvent) => void;
    /* blazorSuppress */
    /**
     * Optional
     * A method to handle adding a new row
     */
    beginAddRow?: () => void;
    /**
     * Optional
     * A method to handle changing the value of elements of the row
     * It takes the new value as an argument
     */
    update?: (value: any) => void;
    /**
     * Optional
     * A method to handle deleting rows
     */
    delete?: () => any;
    /**
     * Optional
     * A method to handle pinning a row
     */
    pin?: () => void;
    /**
     * Optional
     * A method to handle unpinning a row, that has been pinned
     */
    unpin?: () => void;
}

export interface FieldType {
    label?: string;
    field: string;
    header?: string;
    /* alternateType: GridColumnDataType */
    dataType: DataType;
    editorOptions: IFieldEditorOptions;
    filters: IgxFilteringOperand;
    pipeArgs: IFieldPipeArgs;
    defaultTimeFormat: string;
    defaultDateTimeFormat: string;

    formatter(value: any, rowData?: any): any;
}

/**
 * Represents a column in the `GridType`. It is essentially the blueprint to a column object.
 * Contains definitions of properties and methods, relevant to a column
 */
export interface ColumnType extends FieldType {
    /** Represents the instance of the parent `GridType` that contains this column. */
    grid: GridType;
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
    pin(index?: number): boolean;
    /** Unpins the column at the specified index (if not already unpinned). */
    unpin(index?: number): boolean;
}

/**
 * Interface representing the event arguments when a form group is created in the grid.
 * - formGroup: The form group that is created.
 * - owner: The grid instance that owns the form group.
 */
export interface IGridFormGroupCreatedEventArgs {
    /* blazorSuppress */
    formGroup: FormGroup,
    owner: GridType
}

/**
 * Interface representing the event arguments for the grid validation status change event.
 * - status: The validation status ('VALID' or 'INVALID').
 * - owner: The grid instance that owns the validation state.
 */
export interface IGridValidationStatusEventArgs {
    status: ValidationStatus,
    owner: GridType
}

/**
 * Type representing the validation status.
 * - 'VALID': The validation status is valid.
 * - 'INVALID': The validation status is invalid.
 */
export type ValidationStatus = 'VALID' | 'INVALID';

/**
 * Interface representing the validation state of a grid.
 * - status: The validation status ('VALID' or 'INVALID').
 * - errors: The validation errors if any.
 */
export interface IGridValidationState {
    readonly status: ValidationStatus;
    readonly errors?: ValidationErrors;
}

/**
 * Interface representing the validation state of a record in the grid.
 * - `key`: The unique identifier of the record.
 * - `fields`: An array of the validation state of individual fields in the record.
 */
export interface IRecordValidationState extends IGridValidationState {
    key: any;
    fields: IFieldValidationState[];
}

/**
 * Interface representing the validation state of a field in the grid.
 * -`field`: The name of the field (property) being validated.
 */
export interface IFieldValidationState extends IGridValidationState {
    field: string
}

/**
 * Represents the service interface for interacting with the grid.
 */
export interface GridServiceType {

    /** The reference to the parent `GridType` that contains the service. */
    grid: GridType;
    /** Represents the type of the CRUD service (Create, Read, Update, Delete) operations on the grid data. */
    crudService: any;
    /** A service responsible for handling column moving within the grid. It contains a reference to the column, its icon, and indicator for cancelation. */
    cms: IgxColumnMovingService;

    /** Represents a method declaration for retrieving the data used in the grid. The returned values could be of any type */
    get_data(): any[];
    /**
     * Represents a method declaration for retrieving all the data available in the grid, including any transactional data.
     * `includeTransactions`: Optional parameter. Specifies whether to include transactional data if present.
     * Returns an array containing all the data available in the grid.
     */
    get_all_data(includeTransactions?: boolean): any[];
    /** Represents a method declaration for retrieving a column object by its name, taken as a parameter. */
    get_column_by_name(name: string): ColumnType;
    /** Represents a method declaration for retrieving the data associated with a specific row by its unique identifier (of any type, taken as a parameter). */
    getRowData(id: any): any;
    /** Represents a method declaration for retrieving the data associated with a specific record by its unique identifier (of any type, taken as a parameter). */
    get_rec_by_id(id: any): any;
    /** Represents a method declaration for retrieving the unique identifier of a specific row by its data. */
    get_row_id(rowData: any): any;
    /** Represents a method declaration for retrieving the row object associated with a specific index (taken as a parameter) in the grid */
    get_row_by_index(rowSelector: any): RowType;
    /** Represents a method declaration for retrieving the row object associated with a specific key (taken as a parameter) in the grid */
    get_row_by_key(rowSelector: any): RowType;
    /** Represents a method declaration for retrieving the index of a record in the grid's data collection using its unique identifier. */
    get_rec_index_by_id(pk: string | number, dataCollection?: any[]): number;
    /** Represents a method declaration for retrieving the index of a record in the grid's data collection using its index. */
    get_rec_id_by_index(index: number, dataCollection?: any[]): any;
    get_row_index_in_data(rowID: any, dataCollection?: any[]): number;
    /** Represents a method declaration for retrieving the cell object associated with a specific row and column in the grid. */
    get_cell_by_key(rowSelector: any, field: string): CellType;
    /** Represents a method declaration for retrieving the cell object associated with a specific row and column using their indexes. */
    get_cell_by_index(rowIndex: number, columnID: number | string): CellType;
    /**
     * Represents a method declaration for retrieving the cell object associated with a specific row and column using their indexes.
     * It counts only the indexes of the visible columns and rows
     */
    get_cell_by_visible_index(rowIndex: number, columnIndex: number);
    /** Represents a method declaration that sets the expansion state of a group row (used for tree grids)
     * It takes the value for the expansion as a parameter (expanded or collapsed)
     */
    set_grouprow_expansion_state?(groupRow: IGroupByRecord, value: boolean): void;
    row_deleted_transaction(id: any): boolean;
    /**
     * Represents a method declaration for adding a new row to the grid.
     * It takes the row's data and the identifier of the parent row if applicable (used for tree grids)
     */
    addRowToData(rowData: any, parentID?: any): void;
    /** Represents a method declaration for deleting a row, specified by it's identifier (taken as a parameter) */
    deleteRowById(id: any): any;
    /** Represents a method declaration for retrieving the row's current state of expansion (used for tree grids)*/
    get_row_expansion_state(id: any): boolean;
    /** Represents a method declaration for setting a new expansion state. It can be triggered by an event */
    set_row_expansion_state(id: any, expanded: boolean, event?: Event): void;
    get_summary_data(): any[];

    prepare_sorting_expression(stateCollections: Array<Array<any>>, expression: ISortingExpression): void;
    /**
     * Represents a method declaration for sorting by only one expression
     * The expression contains fieldName, sorting directory, whether case should be ignored and optional sorting strategy
     */
    sort(expression: ISortingExpression): void;
    /**
     * Represents a method declaration for sorting by multiple expressions
     * The expressions contains fieldName, sorting directory, whether case should be ignored and optional sorting strategy
     */
    sort_multiple(expressions: ISortingExpression[]): void;
    /** Represents a method declaration for resetting the sorting */
    clear_sort(fieldName: string): void;

    /** Represents an event, triggered when the pin state is changed */
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
 * Interface representing a grid type. It is essentially the blueprint to a grid object.
 * Contains definitions of properties and methods, relevant to a grid
 * Extends `IGridDataBindable`
 */
export interface GridType extends IGridDataBindable {
    /** Represents the locale of the grid: `USD`, `EUR`, `GBP`, `CNY`, `JPY`, etc. */
    locale: string;
    resourceStrings: IGridResourceStrings;
    /* blazorSuppress */
    /** Represents the native HTML element itself */
    nativeElement: HTMLElement;
    /** Indicates whether rows in the grid are editable. If te value is true, the rows can be edited */
    rowEditable: boolean;
    rootSummariesEnabled: boolean;
    /** Indicates whether filtering in the grid is enabled. If te value is true, the grid can be filtered */
    allowFiltering: boolean;
     /** Indicates whether rows in the grid can be dragged. If te value is true, the rows can be dragged */
    rowDraggable: boolean;
    /** Represents the unique primary key used for identifying rows in the grid */
    primaryKey: string;
    /** Represents the unique identifier of the grid. */
    id: string;
    /** The height of the visible rows in the grid. */
    renderedRowHeight: number;
    pipeTrigger: number;
    summaryPipeTrigger: number;
    /** @hidden @internal */
    groupablePipeTrigger: number;
    filteringPipeTrigger: number;
    /** @hidden @internal */
    hasColumnLayouts: boolean;
    /** Indicates whether the grid is currently in a moving state. */
    moving: boolean;
    isLoading: boolean;
    /** @hidden @internal */
    gridSize: Size;
    /** @hidden @internal */
    isColumnWidthSum: boolean;
    /** @hidden @internal */
    minColumnWidth: number;
    /** Strategy, used for cloning the provided data. The type has one method, that takes any type of data */
    dataCloneStrategy: IDataCloneStrategy;

    /** Represents the grid service type providing API methods for the grid */
    readonly gridAPI: GridServiceType;

    /** The filter mode for the grid. It can be quick filter of excel-style filter */
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



    /** Represents the state of virtualization for the grid. It has an owner, start index and chunk size */
    virtualizationState: IForOfState;
    // TYPE
    /** @hidden @internal */
    /** The service handling selection in the grid. Selecting, deselecting elements */
    selectionService: any;
    navigation: any;
    /** @hidden @internal */
    filteringService: any;
    outlet: any;
    /** Indicates whether the grid has columns that can be moved */
    /** @hidden @internal */
    hasMovableColumns: boolean;
    /** Indicates whether the grid's rows can be selected */
    isRowSelectable: boolean;
    /** Indicates whether the selectors of the rows are visible */
    showRowSelectors: boolean;
    /** Indicates whether the grid's element is pinned to the start of the grid */
    isPinningToStart: boolean;
    /** Indicates if the column of the grid is in drag mode */
    columnInDrag: any;
    /** @hidden @internal */
    /** The width of pinned element */
    pinnedWidth: number;
    /** @hidden @internal */
    /** The width of unpinned element */
    unpinnedWidth: number;
    /** The CSS margin of the summaries */
    summariesMargin: number;
    headSelectorBaseAriaLabel: string;

    /** Indicates whether the grid has columns that are shown */
    hasVisibleColumns: boolean;
    /**
     * Optional
     * Indicates whether the grid has expandable children (hierarchical and tree grid)
     */
    hasExpandableChildren?: boolean;
    /**
     * Optional
     * Indicates whether collapsed grid elements should be expanded
     */
    showExpandAll?: boolean;

    /** Represents the count of only the hidden (not visible) columns */
    hiddenColumnsCount: number;
    /** Represents the count of only the pinned columns */
    pinnedColumnsCount: number;

    /**
     * Optional
     * The template for grid icons.
     * It is of type TemplateRef, which represents an embedded template, used to instantiate embedded views
     */
    iconTemplate?: TemplateRef<any>;
    /**
     * Optional
     * The template for group-by rows.
     * It is of type TemplateRef, which represents an embedded template, used to instantiate embedded views
     */
    groupRowTemplate?: TemplateRef<IgxGroupByRowTemplateContext>;
    /**
     * Optional
     * The template for the group row selector.
     * It is of type TemplateRef, which represents an embedded template, used to instantiate embedded views
     */
    groupByRowSelectorTemplate?: TemplateRef<IgxGroupByRowSelectorTemplateContext>;
    /**
     * Optional
     * The template for row loading indicators.
     * It is of type TemplateRef, which represents an embedded template, used to instantiate embedded views
     */
    rowLoadingIndicatorTemplate?: TemplateRef<any>;
    /**
     * The template for the header selector.
     * It is of type TemplateRef, which represents an embedded template, used to instantiate embedded views
     */
    headSelectorTemplate: TemplateRef<IgxHeadSelectorTemplateContext>;
    /**
     * The template for row selectors.
     * It is of type TemplateRef, which represents an embedded template, used to instantiate embedded views
     */
    rowSelectorTemplate: TemplateRef<IgxRowSelectorTemplateContext>;
    /**
     * The template for sort header icons.
     * It is of type TemplateRef, which represents an embedded template, used to instantiate embedded views
     */
    sortHeaderIconTemplate: TemplateRef<IgxGridHeaderTemplateContext>;
    /**
     * The template for ascending sort header icons.
     * It is of type TemplateRef, which represents an embedded template, used to instantiate embedded views
     */
    sortAscendingHeaderIconTemplate: TemplateRef<IgxGridHeaderTemplateContext>;
    /**
     * The template for descending sort header icons.
     * It is of type TemplateRef, which represents an embedded template, used to instantiate embedded views
     */
    sortDescendingHeaderIconTemplate: TemplateRef<IgxGridHeaderTemplateContext>;
    /**
     * The template for header collapsed indicators.
     * It is of type TemplateRef, which represents an embedded template, used to instantiate embedded views
     */
    headerCollapsedIndicatorTemplate: TemplateRef<IgxGridTemplateContext>;
    /**
     * The template for header expanded indicators.
     * It is of type TemplateRef, which represents an embedded template, used to instantiate embedded views
     */
    headerExpandedIndicatorTemplate: TemplateRef<IgxGridTemplateContext>;
    /** The template for drag indicator icons. Could be of any type */
    dragIndicatorIconTemplate: any;
    /** The base drag indicator icon. Could be of any type */
    dragIndicatorIconBase: any;
    /** Indicates whether transitions are disabled for the grid. */
    disableTransitions: boolean;
    /** Indicates whether the currency symbol is positioned to the left of values. */
    currencyPositionLeft: boolean;

    /** Indicates whether the width of the column is set by the user, or is configured automatically. */
    columnWidthSetByUser: boolean;
    headerFeaturesWidth: number;
    /** CSS styling calculated for an element: calcHeight, calcWidth, outerWidth */
    calcHeight: number;
    calcWidth: number;
    outerWidth: number;
    /** The height of each row in the grid. Setting a constant height can solve problems with not showing all elements when scrolling */
    rowHeight: number;
    multiRowLayoutRowSize: number;
    /** Minimal width for headers */
    defaultHeaderGroupMinWidth: any;
    maxLevelHeaderDepth: number;
    defaultRowHeight: number;
    /** The default font size, calculated for each element */
    _baseFontSize?: number;
    scrollSize: number;

    /** The trigger for grid validation. It's value can either be `change` or `blur` */
    validationTrigger: GridValidationTrigger;
    /**
     * The configuration for columns and rows pinning in the grid
     * It's of type IPinningConfig, which can have value for columns (start, end) and for rows (top, bottom)
    */
    pinning: IPinningConfig;
    /* blazorSuppress */
    expansionStates: Map<any, boolean>;
    parentVirtDir: any;
    tbody: any;
    verticalScrollContainer: any;
    dataRowList: any;
    rowList: any;
    /** An unmodifiable list, containing all the columns of the grid. */
    columnList: QueryList<ColumnType>;
    columns: ColumnType[];
    /** An array of columns, but it counts only the ones visible (not hidden) in the view */
    visibleColumns: ColumnType[];
    /** An array of columns, but it counts only the ones that are not pinned */
    unpinnedColumns: ColumnType[];
    /** An array of columns, but it counts only the ones that are pinned */
    pinnedColumns: ColumnType[];
    /** represents an array of the headers of the columns */
    /** @hidden @internal */
    headerCellList: any[];
    /** @hidden @internal */
    headerGroups: any[];
    /** @hidden @internal */
    headerGroupsList: any[];
    summariesRowList: any;
    /** @hidden @internal */
    headerContainer: any;
    /** Indicates whether cells are selectable in the grid */
    isCellSelectable: boolean;
    /** Indicates whether it is allowed to select more than one row in the grid */
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
    /** Represents the transaction service for the grid. */
    readonly transactions: TransactionService<Transaction, State>;
    /** Represents the validation service for the grid. The type contains properties and methods (logic) for validating records */
    readonly validation: IgxGridValidationService;
    defaultSummaryHeight: number;
    summaryRowHeight: number;
    rowEditingOverlay: IgxToggleDirective;
    totalRowsCountAfterFilter: number;
    _totalRecords: number;
    /**
     * Represents the paging of the grid. It can be either 'Local' or 'Remote'
     * - Local: Default value; The grid will paginate the data source based on the page
     */
    pagingMode: GridPagingMode;
    /** The paging state for the grid; Used to configure how paging should be applied - which is the current page, records per page */
    /** @hidden */
    pagingState: any;

    rowEditTabs: any;
    /** Represents the last search in the grid
     * It contains the search text (the user has entered), the match and some settings for the search
     */
    readonly lastSearchInfo: ISearchInfo;
    /** @hidden @internal */
    page: number;
    /** @hidden @internal */
    perPage: number;
    /** The ID of the row currently being dragged in the grid. */
    /** @hidden @internal */
    dragRowID: any;
    /** Indicates whether a row is currently being dragged */
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
    /* blazorSuppress */
    /** Property, that provides a callback for loading unique column values on demand.
     * If this property is provided, the unique values it generates will be used by the Excel Style Filtering  */
    uniqueColumnValuesStrategy: (column: ColumnType, tree: FilteringExpressionsTree, done: (values: any[]) => void) => void;
    /* blazorSuppress */
    /** Property, that gets the header cell inner width for auto-sizing. */
    getHeaderCellWidth: (element: HTMLElement) => ISizeInfo;

    /* blazorSuppress */
    /**
     * Provides change detection functionality.
     * A change-detection tree collects all views that are to be checked for changes.
     * The property cannot be changed (readonly) */
    readonly cdr: ChangeDetectorRef;
    /** @hidden @internal */
    document: Document;
     /**
     * The template for expanded row indicators.
     * It is of type TemplateRef, which represents an embedded template, used to instantiate embedded views
     */
    rowExpandedIndicatorTemplate: TemplateRef<IgxGridRowTemplateContext>;
    /**
     * The template for collapsed row indicators.
     * It is of type TemplateRef, which represents an embedded template, used to instantiate embedded views
     */
    rowCollapsedIndicatorTemplate: TemplateRef<IgxGridRowTemplateContext>;
    /**
     * The template for header icon
     * It is of type TemplateRef, which represents an embedded template, used to instantiate embedded views
     */
    excelStyleHeaderIconTemplate: TemplateRef<IgxGridHeaderTemplateContext>;

    selectRowOnClick: boolean;
    /** Represents the selection mode for cells: 'none','single', 'multiple', 'multipleCascade' */
    cellSelection: GridSelectionMode;
    /** Represents the selection mode for rows: 'none','single', 'multiple', 'multipleCascade' */
    rowSelection: GridSelectionMode;
    /** Represents the selection mode for columns: 'none','single', 'multiple', 'multipleCascade' */
    columnSelection: GridSelectionMode;
    /** Represents the calculation mode for summaries: 'rootLevelOnly', 'childLevelsOnly', 'rootAndChildLevels' */
    summaryCalculationMode: GridSummaryCalculationMode;
    /** Represents the position of summaries: 'top', 'bottom' */
    summaryPosition: GridSummaryPosition;

    // XXX: Work around till we fixed the injection tokens
    lastChildGrid?: GridType;
    /** @hidden @internal */
    toolbarOutlet?: ViewContainerRef;
    /** @hidden @internal */
    paginatorOutlet?: ViewContainerRef;
    flatData?: any[] | null;
    /** @hidden @internal */
    childRow?: any;
    expansionDepth?: number;
    childDataKey?: any;
    foreignKey?: any;
    cascadeOnDelete?: boolean;
    /* blazorSuppress */
    loadChildrenOnDemand?: (parentID: any, done: (children: any[]) => void) => void;
    hasChildrenKey?: any;
    /* blazorSuppress */
    loadingRows?: Set<any>;
    /* blazorAlternateName: GridParent */
    parent?: GridType;
    highlightedRowID?: any;
    updateOnRender?: boolean;
    childLayoutKeys?: any[];
    childLayoutList?: QueryList<any>;
    rootGrid?: GridType;
    processedRootRecords?: ITreeGridRecord[];
    rootRecords?: ITreeGridRecord[];
    /* blazorSuppress */
    records?: Map<any, ITreeGridRecord>;
    processedExpandedFlatData?: any[] | null;
    /* blazorSuppress */
    processedRecords?: Map<any, ITreeGridRecord>;
    treeGroupArea?: any;

    activeNodeChange: EventEmitter<IActiveNodeChangeEventArgs>;
    gridKeydown: EventEmitter<IGridKeydownEventArgs>;
    cellClick: EventEmitter<IGridCellEventArgs>;
    rowClick: EventEmitter<IGridRowEventArgs>;
    doubleClick: EventEmitter<IGridCellEventArgs>;
    contextMenu: EventEmitter<IGridContextMenuEventArgs>;
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
    rowAdd: EventEmitter<IRowDataCancelableEventArgs>;
    rowAdded: EventEmitter<IRowDataEventArgs>;
    /* blazorSuppress */
    rowAddedNotifier: Subject<IRowDataEventArgs>;
    rowDelete: EventEmitter<IRowDataCancelableEventArgs>;
    rowDeleted: EventEmitter<IRowDataEventArgs>;
    /* blazorSuppress */
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
    /* blazorSuppress */
    rendered$: Observable<boolean>;
    /* blazorSuppress */
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
    readonly type: 'flat' | 'tree' | 'hierarchical' | 'pivot';

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
    /* blazorSuppress */
    getDragGhostCustomTemplate(): TemplateRef<any> | null;
    openRowOverlay(id: any): void;
    openAdvancedFilteringDialog(overlaySettings?: OverlaySettings): void;
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
    /* blazorSuppress */
    navigateTo(rowIndex: number, visibleColumnIndex: number, callback?: (e: any) => any): void;
    /* blazorSuppress */
    getPreviousCell(currRowIndex: number, curVisibleColIndex: number, callback: (c: ColumnType) => boolean): ICellPosition;
    /* blazorSuppress */
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
 * An interface describing a Flat Grid type. It is essentially the blueprint to a grid kind
 * Contains definitions of properties and methods, relevant to a grid kind
 * Extends from `GridType`
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
 * An interface describing a Tree Grid type. It is essentially the blueprint to a grid kind
 * Contains definitions of properties and methods, relevant to a grid kind
 * Extends from `GridType`
 */
export interface TreeGridType extends GridType {
    /* blazorSuppress */
    records: Map<any, ITreeGridRecord>;
    isTreeRow(rec: any): boolean;
}

/**
 * An interface describing a Hierarchical Grid type. It is essentially the blueprint to a grid kind
 * Contains definitions of properties and methods, relevant to a grid kind
 * Extends from `GridType`
 */
export interface HierarchicalGridType extends GridType {
    childLayoutKeys: any[];
}

/**
 * An interface describing a Pivot Grid type. It is essentially the blueprint to a grid kind
 * Contains definitions of properties and methods, relevant to a grid kind
 * Extends from `GridType`
 */
export interface PivotGridType extends GridType {
    /**
     * The configuration settings for the pivot grid.
     * it includes dimension strategy for rows and columns, filters and data keys
     */
    pivotConfiguration: IPivotConfiguration;
    /**
     * An array of all dimensions (rows and columns) in the pivot grid.
     * it includes hierarchical level, filters and sorting, dimensional level, etc.
     */
    allDimensions: IPivotDimension[],
    /** Specifies whether to show the pivot configuration UI in the grid. */
    pivotUI: IPivotUISettings;
    /** @hidden @internal */
    columnDimensions: IPivotDimension[];
    /** @hidden @internal */
    rowDimensions: IPivotDimension[];
    rowDimensionResizing: boolean;
    /** @hidden @internal */
    visibleRowDimensions: IPivotDimension[];
    /** @hidden @internal */
    hasHorizontalLayout: boolean;
    /** @hidden @internal */
    values: IPivotValue[];
    /** @hidden @internal */
    filterDimensions: IPivotDimension[];
    /** @hidden @internal */
    dimensionDataColumns: ColumnType[];
    pivotRowWidths: number;
    getRowDimensionByName(name: string): IPivotDimension;
    /** Represents a method declaration for setting up the columns for the pivot grid based on the pivot configuration */
    setupColumns(): void;
    /** Represents a method declaration that allows toggle of expansion state of a row (taken as a parameter) in the pivot grid */
    toggleRow(rowID: any): void;
    /**
     * Represents a method declaration for resolving the data type for a specific field (column).
     * It takes the field as a parameter and returns it's type
     */
    resolveDataTypes(field: any): GridColumnDataType;
    /**
     * Represents a method declaration for moving dimension from its currently collection to the specified target collection
     * by type (Row, Column or Filter) at specified index or at the collection's end
     */
    moveDimension(dimension: IPivotDimension, targetCollectionType: PivotDimensionType, index?: number);
    getDimensionsByType(dimension: PivotDimensionType);
    /** Toggles the dimension's enabled state on or off. The dimension remains in its current collection */
    toggleDimension(dimension: IPivotDimension);
    /** Sort the dimension and its children in the provided direction (ascending, descending or none). */
    sortDimension(dimension: IPivotDimension, sortDirection: SortingDirection);
    /** Toggles the value's enabled state on or off. The value remains in its current collection. */
    toggleValue(value: IPivotValue);
    /** Move value from its currently at specified index or at the end.
     * If the parameter is not set, it will add it to the end of the collection. */
    moveValue(value: IPivotValue, index?: number);
    rowDimensionWidth(dim: IPivotDimension): string;
    rowDimensionWidthToPixels(dim: IPivotDimension): number;
    /** Emits an event when the dimensions in the pivot grid change. */
    dimensionsChange: EventEmitter<IDimensionsChange>;
    /** Emits an event when the values in the pivot grid change. */
    valuesChange: EventEmitter<IValuesChange>;
    /** Emits an event when the a dimension is sorted. */
    dimensionsSortingExpressionsChange: EventEmitter<ISortingExpression[]>;
    /** @hidden @internal */
    pivotKeys: IPivotKeys;
    hasMultipleValues: boolean;
    excelStyleFilterMaxHeight: string;
    excelStyleFilterMinHeight: string;
    valueChipTemplate: TemplateRef<any>;
    rowDimensionHeaderTemplate: TemplateRef<IgxColumnTemplateContext>;
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
    /* blazorSuppress */
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
    /* blazorCSSuppress */
    /* blazorAlternateType: RowEditActionsImplicit */
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
    /* blazorSuppress */
    formControl?: FormControl<any>,
    /* blazorSuppress */
    defaultErrorTemplate?: TemplateRef<any>,
    cell: CellType
}

/* jsonAPIComplexObject */
export interface IgxRowSelectorTemplateDetails {
    index: number;
    /**
     * @deprecated in version 15.1.0. Use the `key` property instead.
     */
    rowID: any;
    key: any;
    selected: boolean;
    select?: () => void;
    deselect?: () => void;
}

export interface IgxRowSelectorTemplateContext {
    $implicit: IgxRowSelectorTemplateDetails;
}

/* jsonAPIComplexObject */
export interface IgxGroupByRowSelectorTemplateDetails {
    selectedCount: number;
    totalCount: number;
    groupRow: IGroupByRecord;
}
export interface IgxGroupByRowSelectorTemplateContext {
    $implicit: IgxGroupByRowSelectorTemplateDetails;
}

/* jsonAPIComplexObject */
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

export interface IgxGridPaginatorTemplateContext {
    $implicit: GridType;
}

/* marshalByValue */
/* tsPlainInterface */
/**
 * An interface describing settings for row/column pinning position.
 */
export interface IPinningConfig {
    columns?: ColumnPinningPosition;
    rows?: RowPinningPosition;
}

/**
 * An interface describing settings for clipboard options
 */
export interface IClipboardOptions {
    /**
     * Enables/disables the copy behavior
     */
    enabled: boolean;
    /**
     * Include the columns headers in the clipboard output.
     */
    copyHeaders: boolean;
    /**
     * Apply the columns formatters (if any) on the data in the clipboard output.
     */
    copyFormatters: boolean;
    /**
     * The separator used for formatting the copy output. Defaults to `\t`.
     */
    separator: string;
}
