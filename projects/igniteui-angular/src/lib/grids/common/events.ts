import { IBaseEventArgs, CancelableEventArgs } from '../../core/utils';
import { IgxBaseExporter, IgxExporterOptionsBase } from '../../services';
import { GridKeydownTargetType } from './enums';
import { IgxDragDirective } from '../../directives/drag-drop/drag-drop.directive';
import { IGridDataBindable } from './grid.interface';
import { IgxGridCellComponent } from '../cell.component';
import { IgxColumnComponent } from '../columns/column.component';
import { IgxGridBaseComponent } from '../grid-base.component';
import { IgxRowComponent } from '../row.component';


export interface IGridClipboardEvent {
    data: any[];
    cancel: boolean;
}

export interface IGridCellEventArgs extends IBaseEventArgs {
    cell: IgxGridCellComponent;
    event: Event;
}

export interface IGridEditEventArgs extends CancelableEventArgs, IBaseEventArgs {
    rowID: any;
    cellID?: {
        rowID: any,
        columnID: any,
        rowIndex: number
    };
    oldValue: any;
    newValue?: any;
    event?: Event;
}

export interface IPinColumnEventArgs extends IBaseEventArgs {
    column: IgxColumnComponent;
    insertAtIndex: number;
    isPinned: boolean;
}

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

export interface IRowSelectionEventArgs extends CancelableEventArgs, IBaseEventArgs {
    oldSelection: any[];
    newSelection: any[];
    added: any[];
    removed: any[];
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
    grid: IgxGridBaseComponent;
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
    target: Object;
    event: Event;
    cancel: boolean;
}

export interface ICellPosition {
    rowIndex: number;
    visibleColumnIndex: number;
}

export interface IRowDragEndEventArgs extends IBaseEventArgs {
    dragDirective: IgxDragDirective;
    dragData: IgxRowComponent<IgxGridBaseComponent & IGridDataBindable>;
    animation: boolean;
}

export interface IRowDragStartEventArgs extends CancelableEventArgs, IBaseEventArgs {
    dragDirective: IgxDragDirective;
    dragData: IgxRowComponent<IgxGridBaseComponent & IGridDataBindable>;
}
