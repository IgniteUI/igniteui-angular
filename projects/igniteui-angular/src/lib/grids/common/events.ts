import { IBaseEventArgs, CancelableEventArgs } from '../../core/utils';
import { IgxBaseExporter, IgxExporterOptionsBase } from '../../services/public_api';
import { GridKeydownTargetType } from './enums';
import { IgxDragDirective } from '../../directives/drag-drop/drag-drop.directive';
import { IGridDataBindable, GridType } from './grid.interface';
import { IgxGridCellComponent } from '../cell.component';
import { IgxColumnComponent } from '../columns/column.component';
import { IgxGridBaseDirective } from '../grid-base.directive';
import { IgxRowDirective } from '../row.directive';
import { ColumnType } from './column.interface';
import { ISortingExpression } from '../../data-operations/sorting-expression.interface';
import { IFilteringExpressionsTree } from '../../data-operations/filtering-expressions-tree';
export { GridSelectionRange } from '../selection/selection.service';

export interface IGridClipboardEvent {
    data: any[];
    cancel: boolean;
}

export interface IGridCellEventArgs extends IBaseEventArgs {
    cell: IgxGridCellComponent;
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
    owner?: IgxGridBaseDirective & GridType;
    isAddRow?: boolean;
}

export interface IGridEditEventArgs extends CancelableEventArgs, IGridEditDoneEventArgs {
}

/**
 * The event arguments after a column's pin state is changed.
 * `insertAtIndex`specifies at which index in the pinned/unpinned area the column was inserted.
 * `isPinned` returns the actual pin state of the column after the operation completed.
 */
export interface IPinColumnEventArgs extends IBaseEventArgs {
    column: IgxColumnComponent;
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
 * Can be changed in the `onColumnPinning` event.
 * `isPinned` returns the actual pin state of the column. When pinning/unpinning is succesfull,
 * the value of `isPinned` will change accordingly when read in the "-ing" and "-ed" event.
 */
export interface IPinColumnCancellableEventArgs extends IPinColumnEventArgs, CancelableEventArgs {
}

/**
 * The event arguments after a page is changed.
 */
export interface IPageEventArgs extends IBaseEventArgs {
    previous: number;
    current: number;
}

export interface IRowDataEventArgs extends IBaseEventArgs {
    data: any;
}

export interface IColumnResizeEventArgs extends IBaseEventArgs {
    column: IgxColumnComponent;
    prevWidth: string;
    newWidth: string;
}

export interface IColumnResizingEventArgs extends IColumnResizeEventArgs, CancelableEventArgs {
}

export interface IRowSelectionEventArgs extends CancelableEventArgs, IBaseEventArgs {
    oldSelection: any[];
    newSelection: any[];
    added: any[];
    removed: any[];
    event?: Event;
}

export interface IColumnSelectionEventArgs extends CancelableEventArgs, IBaseEventArgs {
    oldSelection: string[];
    newSelection: string[];
    added: string[];
    removed: string[];
    event?: Event;
}

export interface ISearchInfo {
    searchText: string;
    caseSensitive: boolean;
    exactMatch: boolean;
    activeMatchIndex: number;
    matchInfoCache: any[];
}

export interface IGridToolbarExportEventArgs extends IBaseEventArgs {
    grid: IgxGridBaseDirective;
    exporter: IgxBaseExporter;
    options: IgxExporterOptionsBase;
    cancel: boolean;
}

export interface IColumnMovingStartEventArgs extends IBaseEventArgs {
    source: IgxColumnComponent;
}

export interface IColumnMovingEventArgs extends IBaseEventArgs {
    source: IgxColumnComponent;
    cancel: boolean;
}

export interface IColumnMovingEndEventArgs extends IBaseEventArgs {
    source: IgxColumnComponent;
    target: IgxColumnComponent;
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
    dragDirective: IgxDragDirective;
    dragData: IgxRowDirective<IgxGridBaseDirective & IGridDataBindable>;
    animation: boolean;
}

export interface IRowDragStartEventArgs extends CancelableEventArgs, IBaseEventArgs {
    dragDirective: IgxDragDirective;
    dragData: IgxRowDirective<IgxGridBaseDirective & IGridDataBindable>;
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
     * The row component instance, that was pinned/unpinned.
     * May be undefined if row does not exist in the current visible data.
     */
    readonly row?: IgxRowDirective<IgxGridBaseDirective & GridType>;
    /**
     * The ID of the row, that was pinned/unpinned.
     *   ID is either the primaryKey value or the data record instance.
     */
    readonly rowID: any;
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
    column: IgxColumnComponent;
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
    sortingExpressions: ISortingExpression | Array<ISortingExpression>;
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

