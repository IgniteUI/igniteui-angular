import { FilterMode } from './enums';

export interface IGridDataBindable {
    data: any[];
    filteredData: any[];
}

/**
 * @hidden
 * @internal
 */
export interface GridType extends IGridDataBindable {
    id: string;
    nativeElement: HTMLElement;
    rowEditable: boolean;
    rootSummariesEnabled: boolean;
    allowFiltering: boolean;
    rowDraggable: boolean;
    primaryKey: any;

    filterMode: FilterMode;

    selectionService: any;
    navigation: any;
    filteringService: any;

    calcHeight: number;

    parentVirtDir: any;
    tbody: any;
    verticalScrollContainer: any;
    dataRowList: any;
    rowList: any;
    columnList: any;
    unpinnedColumns: any;
    pinnedColumns: any;
    summariesRowList: any;
    headerContainer: any;
    dataView: any[];

    rowInEditMode: any;
    rowEditTabs: any;

    firstEditableColumnIndex: number;
    lastEditableColumnIndex: number;

    endEdit(commit: boolean, event?: Event): void;
}
