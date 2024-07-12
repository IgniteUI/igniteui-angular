import { IBaseEventArgs, CancelableEventArgs } from '../../core/utils';
import { GridKeydownTargetType } from './enums';
import { CellType, ColumnType, GridType, RowType } from './grid.interface';
import { IFilteringExpressionsTree } from '../../data-operations/filtering-expressions-tree';
import { IGroupingExpression } from '../../data-operations/grouping-expression.interface';
import { IgxBaseExporter } from '../../services/exporter-common/base-export-service';
import { IgxExporterOptionsBase } from '../../services/exporter-common/exporter-options-base';
import { ISortingExpression } from '../../data-operations/sorting-strategy';
import { IBaseSearchInfo } from '../../directives/text-highlight/text-highlight.directive';

/** The event arguments when data from a grid is being copied. */
export interface IGridClipboardEvent {
    /** `data` can be of any type and refers to the data that is being copied/stored to the clipboard */
    data: any[];
    /**
     * `cancel` returns whether an external event has intercepted the copying
     * If the value becomes "true", it returns/exits from the method, instantiating the interface
     */
    cancel: boolean;
}

/** Represents an event argument related to grid cell interactions. */
export interface IGridCellEventArgs extends IBaseEventArgs {
    /** Represents the grid cell that triggered the event. */
    cell: CellType;
    /* blazorCSSuppress */
    /**
     * Represents the original event that occurred
     * Examples of such events include: selecting, clicking, double clicking, etc.
     */
    event: Event;
}

/** Represents an event argument related to grid row interactions. */
export interface IGridRowEventArgs extends IBaseEventArgs {
    /** Represents the grid row that triggered the event. */
    row: RowType;
    /**
     * Represents the original event that occurred
     * Examples of such events include: selecting, clicking, double clicking, etc.
     */
    event: Event;
}

/** Represents an event argument for the grid contextMenu output */
export interface IGridContextMenuEventArgs extends IGridCellEventArgs, IGridRowEventArgs {}

/** Represents event arguments related to grid editing completion. */
export interface IGridEditDoneEventArgs extends IBaseEventArgs {
    /**
     * @deprecated since version 17.1.0. Use the `rowKey` property instead.
     */
    rowID: any;
    /**
     * @deprecated since version 17.1.0. Use the `rowKey` property instead.
     */
    primaryKey: any;
    rowKey: any;
    cellID?: {
        rowID: any;
        columnID: any;
        rowIndex: number;
    };
    /**
     * `rowData` represents the updated/committed data of the row after the edit (newValue)
     * The only case rowData (of the current object) is used directly, is when there is no rowEditing or transactions enabled
     */
    rowData: any;
    /**
     * Represents the previous (before editing) value of the edited cell.
     * It's used when the event has been stopped/exited.
     */
    oldValue: any;
    /**
     * Optional
     * Represents the value, that is being entered in the edited cell
     * When there is no `newValue` and the event has ended, the value of the cell returns to the `oldValue`
     */
    newValue?: any;
    /* blazorSuppress */
    /**
     * Optional
     * Represents the original event, that has triggered the edit
     */
    event?: Event;
    /**
     * Optional
     * Represents the column information of the edited cell
     */
    column?: ColumnType;
    /**
     * Optional
     * Represents the grid instance that owns the edit event.
     */
    owner?: GridType;
    /**
     * Optional
     * Indicates if the editing consists of adding a new row
     */
    isAddRow?: boolean;
    /**
     * Optional
     * Indicates if the new value would be valid.
     * It can be set to return the result of the methods for validation of the grid
     */
    valid?: boolean;
}


/**
 * Represents event arguments related to grid editing.
 * The event is cancelable
 * It contains information about the row and the column, as well as the old and nwe value of the element/cell
 */
export interface IGridEditEventArgs extends CancelableEventArgs, IGridEditDoneEventArgs {
}

export interface IRowDataCancelableEventArgs extends IRowDataEventArgs, IGridEditEventArgs {
    /**
     * @deprecated
     */
    cellID?: {
        rowID: any;
        columnID: any;
        rowIndex: number;
    };
    /**
     * @deprecated
     */
    oldValue: any;
    /**
     * @deprecated
     */
    newValue?: any;
    /**
     * @deprecated
     */
    isAddRow?: boolean;
    owner: GridType;
}

/**
 * The event arguments after a column's pin state is changed.
 * `insertAtIndex`specifies at which index in the pinned/unpinned area the column was inserted.
 * `isPinned` returns the actual pin state of the column after the operation completed.
 */
export interface IPinColumnEventArgs extends IBaseEventArgs {
    column: ColumnType;
    /**
     * If pinned, specifies at which index in the pinned area the column is inserted.
     * If unpinned, specifies at which index in the unpinned area the column is inserted.
     */
    insertAtIndex: number;
    /**
     * Returns the actual pin state of the column.
     * If pinning/unpinning is successful, value of `isPinned` will change accordingly when read in the "-ing" and "-ed" event.
     */
    isPinned: boolean;
}

/**
 * The event arguments before a column's pin state is changed.
 * `insertAtIndex`specifies at which index in the pinned/unpinned area the column is inserted.
 * Can be changed in the `columnPin` event.
 * `isPinned` returns the actual pin state of the column. When pinning/unpinning is successful,
 * the value of `isPinned` will change accordingly when read in the "-ing" and "-ed" event.
 */
export interface IPinColumnCancellableEventArgs extends IPinColumnEventArgs, CancelableEventArgs {
}

/**
 * Represents event arguments related to events, that can occur for rows in a grid
 * Example for events: adding, deleting, selection, transaction, etc.
 */
export interface IRowDataEventArgs extends IBaseEventArgs {
    /**
     * @deprecated since version 17.1.0. Use the `rowData` property instead.
     */
    data: any;
    rowData: any
    /**
     * Represents the unique key, the row can be associated with.
     * Available if `primaryKey` exists
     * @deprecated since version 17.1.0. Use the `rowKey` property instead.
     */
    primaryKey: any;
    rowKey: any;
    /* blazorSuppress */
    /** Represents the grid instance that owns the edit event. */
    owner: GridType;
}


/** The event arguments when a column is being resized */
export interface IColumnResizeEventArgs extends IBaseEventArgs {
    /** Represents the information of the column that is being resized */
    column: ColumnType;
    /** Represents the old width of the column before the resizing */
    prevWidth: string;
    /** Represents the new width, the column is being resized to */
    newWidth: string;
}

/**
 * The event arguments when a column is being resized
 * It contains information about the column, it's old and new width
 * The event can be canceled
 */
export interface IColumnResizingEventArgs extends IColumnResizeEventArgs, CancelableEventArgs {
}

/**
 * The event arguments when the selection state of a row is being changed
 * The event is cancelable
 */
export interface IRowSelectionEventArgs extends CancelableEventArgs, IBaseEventArgs {
    /** Represents an array of rows, that have already been selected */
    readonly oldSelection: any[];
    /** Represents the newly selected rows */
    newSelection: any[];
    /**
     * Represents an array of all added rows
     * Whenever a row has been selected, the array is "refreshed" with the selected rows
     */
    readonly added: any[];
    /**
     * Represents an array of all rows, removed from the selection
     * Whenever a row has been deselected, the array is "refreshed" with the rows,
     * that have been previously selected, but are no longer
     */
    readonly removed: any[];
    /* blazorSuppress */
    /**
     * Represents the original event, that has triggered the selection change
     * selecting, deselecting
     */
    readonly event?: Event;
    /** Indicates whether or not all rows of the grid have been selected */
    readonly allRowsSelected?: boolean;
}

/**
 * The event arguments when the selection state of a column is being changed
 * The event is cancelable
 */
export interface IColumnSelectionEventArgs extends CancelableEventArgs, IBaseEventArgs {
    /** Represents an array of columns, that have already been selected */
    readonly oldSelection: string[];
    /** Represents the newly selected columns */
    newSelection: string[];
    /**
     * Represents an array of all added columns
     * Whenever a column has been selected, the array is "refreshed" with the selected columns
     */
    readonly added: string[];
    /**
     * Represents an array of all columns, removed from the selection
     * Whenever a column has been deselected, the array is "refreshed" with the columns, that have been previously selected, but are no longer
     */
    readonly removed: string[];
    /* blazorSuppress */
    /**
     * Represents the original event, that has triggered the selection change
     * selecting, deselecting
     */
    readonly event?: Event;
}

export interface ISearchInfo extends IBaseSearchInfo {
    matchInfoCache: any[];
    activeMatchIndex: number;
}

/* jsonAPIPlainObject */
/*  tsPlainInterface */
/**
 * Represents the arguments for the grid toolbar export event.
 * It provides information about the grid instance, exporter service, export options,
 * and allows the event to be canceled.
 */
export interface IGridToolbarExportEventArgs extends IBaseEventArgs {
    /** `grid` represents a reference to the instance of the grid te event originated from */
    grid: GridType;
    /**
     * The `exporter` is a base service.
     * The type (an abstract class `IgxBaseExporter`) has it's own properties and methods
     * It is used to define the format and options of the export, the exported element
     * and methods for preparing the data from the elements for exporting
     */
    exporter: IgxBaseExporter;
    /**
     * Represents the different settings, that can be given to an export
     * The type (an abstract class `IgxExporterOptionsBase`) has properties for column settings
     * (whether they should be ignored) as well as method for generating a file name
     */
    options: IgxExporterOptionsBase;
    /**
     * `cancel` returns whether the event has been intercepted and stopped
     * If the value becomes "true", it returns/exits from the method, instantiating the interface
     */
    cancel: boolean;
}

/** Represents event arguments related to the start of a column moving operation in a grid. */
export interface IColumnMovingStartEventArgs extends IBaseEventArgs {
    /**
     * Represents the column that is being moved.
     * The `ColumnType` contains the information (the grid it belongs to, css data, settings, etc.) of the column in its properties
     */
    source: ColumnType;
}

/** Represents event arguments related to a column moving operation in a grid */
export interface IColumnMovingEventArgs extends IBaseEventArgs {
    /**
     * Represents the column that is being moved.
     * The `ColumnType` contains the information (the grid it belongs to, css data, settings, etc.) of the column in its properties
     */
    source: ColumnType;
    /**
     * `cancel` returns whether the event has been intercepted and stopped
     * If the value becomes "true", it returns/exits from the method, instantiating the interface
     */
    cancel: boolean;
}

/** Represents event arguments related to the end of a column moving operation in a grid */
export interface IColumnMovingEndEventArgs extends IBaseEventArgs {
    /**
     * The source of the event represents the column that is being moved.
     * The `ColumnType` contains the information (the grid it belongs to, css data, settings, etc.) of the column in its properties
     */
    source: ColumnType;
    /**
     * The target of the event represents the column, the source is being moved to.
     * The `ColumnType` contains the information (the grid it belongs to, css data, settings, etc.) of the column in its properties
     */
    target: ColumnType;
    /**
     * `cancel` returns whether the event has been intercepted and stopped
     * If the value becomes "true", it returns/exits from the method, instantiating the interface
     */
    cancel: boolean;
}

/**
 * Represents an event, emitted when keydown is triggered over element inside grid's body
 * This event is fired only if the key combination is supported in the grid.
 */
export interface IGridKeydownEventArgs extends IBaseEventArgs {
    /** The `targetType` represents the type of the targeted object. For example a cell or a row */
    targetType: GridKeydownTargetType;
    /** Represents the information and details of the object itself */
    target: any;
    /* blazorCSSuppress */
    /** Represents the original event, that occurred. */
    event: Event;
    /**
     * The event is cancelable
     * `cancel` returns whether the event has been intercepted and stopped
     * If the value becomes "true", it returns/exits from the method, instantiating the interface
     */
    cancel: boolean;
}

/** The event is triggered when getting the current position of a certain cell */
export interface ICellPosition {
    /* doNotStringify */
    /** It returns the position (index) of the row, the cell is in */
    rowIndex: number;
    /* doNotStringify */
    /**
     * It returns the position (index) of the column, the cell is in
     * Counts only the visible (non hidden) columns
     */
    visibleColumnIndex: number;
}

/** Emitted when a dragging operation is finished (when the row is dropped) */
export interface IRowDragEndEventArgs extends IBaseEventArgs {
    /** Represents the drag directive or information associated with the drag operation */
    dragDirective: any;
    /** Represents the information of the row that is being dragged. */
    dragData: RowType;
    /* blazorSuppress */
    /** Represents the HTML element itself */
    dragElement: HTMLElement;
    /** `animation` returns whether the event is animated */
    animation: boolean;
}

/**
 * Emitted when a dragging operation is starting (when the row is "picked")
 * The event is cancelable
 */
export interface IRowDragStartEventArgs extends CancelableEventArgs, IBaseEventArgs {
    /** Represents the drag directive or information associated with the drag operation */
    dragDirective: any;
    /** Represents the information of the row that is being dragged. */
    dragData: RowType;
    /* blazorSuppress */
    /** Represents the HTML element itself */
    dragElement: HTMLElement;
}

/** Represents event arguments related to the row's expansion state being changed in a grid */
export interface IRowToggleEventArgs extends IBaseEventArgs {
    /**
     * Represents the ID of the row that emitted the event (which state is changed)
     * @deprecated since version 17.1.0. Use the `rowKey` property instead.
     */
    rowID: any;
    rowKey: any;
    /**
     * Returns the state of the row after the operation has ended
     * Indicating whether the row is being expanded (true) or collapsed (false)
     */
    expanded: boolean;
    /* blazorSuppress */
    /**
     * Optional
     * Represents the original event, that has triggered the expansion/collapse
     */
    event?: Event;
    /**
     * The event is cancelable
     * `cancel` returns whether the event has been intercepted and stopped
     * If the value becomes "true", it returns/exits from the method, instantiating the interface
     */
    cancel: boolean;
}

/**
 * Event emitted when a row's pin state changes.
 * The event is cancelable
 */
export interface IPinRowEventArgs extends IBaseEventArgs, CancelableEventArgs {
    /**
     * The ID of the row, that was pinned/unpinned.
     * ID is either the primaryKey value or the data record instance.
     * @deprecated since version 17.1.0. Use the `rowKey` property instead.
     */
    readonly rowID: any;
    readonly rowKey: any;
    row?: RowType;
    /** The index at which to pin the row in the pinned rows collection. */
    insertAtIndex?: number;
    /** Whether or not the row is pinned or unpinned. */
    readonly isPinned: boolean;
}

/**
 * Event emitted when a grid is scrolled.
 */
export interface IGridScrollEventArgs extends IBaseEventArgs {
    /** The scroll direction - vertical or horizontal. */
    direction: string;
    /* blazorCSSuppress */
    /** The original browser scroll event. */
    event: Event;
    /** The new scroll position */
    scrollPosition: number;
}

/**
 * Event emitted when a checkbox in the checkbox
 * list of an IgxColumnActions component is clicked.
 */
export interface IColumnToggledEventArgs extends IBaseEventArgs {
    /** The column that is toggled. */
    column: ColumnType;
    /** The checked state after the action. */
    checked: boolean;
}

/** Emitted when the active node is changed */
export interface IActiveNodeChangeEventArgs extends IBaseEventArgs {
    /** Represents the row index of the active node */
    row: number;
    /** Represents the column index of the active node */
    column: number;
    /**
     * Optional
     * Represents the hierarchical level of the active node
     */
    level?: number;
    /**
     * Represents the type of the active node.
     * The GridKeydownTargetType is an enum or that specifies the possible target types
     */
    tag: GridKeydownTargetType;
}

/**
 * Represents event arguments related to sorting and grouping operations
 * The event is cancelable
 */
export interface ISortingEventArgs extends IBaseEventArgs, CancelableEventArgs {
    /**
     * Optional
     * Represents the sorting expressions applied to the grid.
     * It can be a single sorting expression or an array of them
     * The expression contains information like file name, whether the letter case should be taken into account, etc.
     */
    sortingExpressions?: ISortingExpression | Array<ISortingExpression>;
    /**
     * Optional
     * Represents the grouping expressions applied to the grid.
     * It can be a single grouping expression or an array of them
     * The expression contains information like the sorting expression and criteria by which the elements will be grouped
     */
    groupingExpressions?: IGroupingExpression | Array<IGroupingExpression>;
}

/* blazorInclude */
/** @hidden @internal */
export interface IColumnsAutoGeneratedEventArgs extends IBaseEventArgs {
    /* blazorTreatAsCollection */
    /* blazorCollectionName: ColumnCollection */
    columns?: ColumnType[]
}

/**
 * Represents event arguments related to filtering operations
 * The event is cancelable
 */
export interface IFilteringEventArgs extends IBaseEventArgs, CancelableEventArgs {
    /**
     * Represents the filtering expressions applied to the grid.
     * The expression contains information like filtering operands and operator, an expression or condition, etc.
     */
    filteringExpressions: IFilteringExpressionsTree;
}

/** The event arguments after a column's visibility is changed. */
export interface IColumnVisibilityChangedEventArgs extends IBaseEventArgs {
    /** Represents the column the event originated from */
    column: any;
    /**
     * The new hidden state that the column will have, if operation is successful.
     * Will be `true` when hiding and `false` when showing.
     */
    newValue: boolean;
}

/**
 * The event arguments when a column's visibility is changed.
 * The event is cancelable
 * It contains information about the column and the it's visibility after the operation (will be `true` when hiding and `false` when showing)
 */
export interface IColumnVisibilityChangingEventArgs extends IColumnVisibilityChangedEventArgs, CancelableEventArgs {
}

