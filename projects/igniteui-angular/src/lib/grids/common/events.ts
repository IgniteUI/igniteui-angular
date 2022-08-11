import { IBaseEventArgs, CancelableEventArgs } from '../../core/utils';
import { GridKeydownTargetType } from './enums';
import { CellType, ColumnType, GridType, RowType } from './grid.interface';
import { IFilteringExpressionsTree } from '../../data-operations/filtering-expressions-tree';
import { IGroupingExpression } from '../../data-operations/grouping-expression.interface';
import { IgxBaseExporter } from '../../services/exporter-common/base-export-service';
import { IgxExporterOptionsBase } from '../../services/exporter-common/exporter-options-base';
import { ISortingExpression } from '../../data-operations/sorting-strategy';

export interface IGridClipboardEvent {
    data: any[];
    cancel: boolean;
}

export interface IGridCellEventArgs extends IBaseEventArgs {
    cell: CellType;
    event: Event;
}

export interface IGridEditDoneEventArgs extends IBaseEventArgs {
    rowID: any;
    cellID?: {
        rowID: any;
        columnID: any;
        rowIndex: number;
    };
    rowData: any;
    oldValue: any;
    newValue?: any;
    event?: Event;
    column?: ColumnType;
    owner?: GridType;
    isAddRow?: boolean;
    isValid?: boolean;
}

export interface IGridEditEventArgs extends CancelableEventArgs, IGridEditDoneEventArgs {
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
     * If pinning/unpinning is succesfull, value of `isPinned` will change accordingly when read in the "-ing" and "-ed" event.
     */
    isPinned: boolean;
}

/**
 * The event arguments before a column's pin state is changed.
 * `insertAtIndex`specifies at which index in the pinned/unpinned area the column is inserted.
 * Can be changed in the `columnPin` event.
 * `isPinned` returns the actual pin state of the column. When pinning/unpinning is succesfull,
 * the value of `isPinned` will change accordingly when read in the "-ing" and "-ed" event.
 */
export interface IPinColumnCancellableEventArgs extends IPinColumnEventArgs, CancelableEventArgs {
}
export interface IRowDataEventArgs extends IBaseEventArgs {
    data: any;
    owner: GridType;
}

export interface IColumnResizeEventArgs extends IBaseEventArgs {
    column: ColumnType;
    prevWidth: string;
    newWidth: string;
}

export interface IColumnResizingEventArgs extends IColumnResizeEventArgs, CancelableEventArgs {
}

export interface IRowSelectionEventArgs extends CancelableEventArgs, IBaseEventArgs {
    readonly oldSelection: any[];
    newSelection: any[];
    readonly added: any[];
    readonly removed: any[];
    readonly event?: Event;
}

export interface IColumnSelectionEventArgs extends CancelableEventArgs, IBaseEventArgs {
    readonly oldSelection: string[];
    newSelection: string[];
    readonly added: string[];
    readonly removed: string[];
    readonly event?: Event;
}

export interface ISearchInfo {
    searchText: string;
    caseSensitive: boolean;
    exactMatch: boolean;
    activeMatchIndex: number;
    matchInfoCache: any[];
}

export interface IGridToolbarExportEventArgs extends IBaseEventArgs {
    grid: GridType;
    exporter: IgxBaseExporter;
    options: IgxExporterOptionsBase;
    cancel: boolean;
}

export interface IColumnMovingStartEventArgs extends IBaseEventArgs {
    source: ColumnType;
}

export interface IColumnMovingEventArgs extends IBaseEventArgs {
    source: ColumnType;
    cancel: boolean;
}

export interface IColumnMovingEndEventArgs extends IBaseEventArgs {
    source: ColumnType;
    target: ColumnType;
    cancel: boolean;
}

export interface IGridKeydownEventArgs extends IBaseEventArgs {
    targetType: GridKeydownTargetType;
    target: any;
    event: Event;
    cancel: boolean;
}

export interface ICellPosition {
    rowIndex: number;
    visibleColumnIndex: number;
}

export interface IRowDragEndEventArgs extends IBaseEventArgs {
    dragDirective: any;
    dragData: RowType;
    dragElement: HTMLElement;
    animation: boolean;
}

export interface IRowDragStartEventArgs extends CancelableEventArgs, IBaseEventArgs {
    dragDirective: any;
    dragData: RowType;
    dragElement: HTMLElement;
}

export interface IRowToggleEventArgs extends IBaseEventArgs {
    rowID: any;
    expanded: boolean;
    event?: Event;
    cancel: boolean;
}

/**
 * Event emitted when a row's pin state changes.
 */
export interface IPinRowEventArgs extends IBaseEventArgs, CancelableEventArgs {
    /**
     * The ID of the row, that was pinned/unpinned.
     *   ID is either the primaryKey value or the data record instance.
     */
    readonly rowID: any;
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

export interface IActiveNodeChangeEventArgs extends IBaseEventArgs {
    row: number;
    column: number;
    level?: number;
    tag: GridKeydownTargetType;
}

export interface ISortingEventArgs extends IBaseEventArgs, CancelableEventArgs {
    sortingExpressions?: ISortingExpression | Array<ISortingExpression>;
    groupingExpressions?: IGroupingExpression | Array<IGroupingExpression>;
}

export interface IFilteringEventArgs extends IBaseEventArgs, CancelableEventArgs {
    filteringExpressions: IFilteringExpressionsTree;
}

export interface IColumnVisibilityChangedEventArgs extends IBaseEventArgs {
    column: any;
    /**
     * The new hidden state that the column will have, if operation is succesfull.
     * Will be `true` when hiding and `false` when showing.
     */
    newValue: boolean;
}

export interface IColumnVisibilityChangingEventArgs extends IColumnVisibilityChangedEventArgs, CancelableEventArgs {
}

