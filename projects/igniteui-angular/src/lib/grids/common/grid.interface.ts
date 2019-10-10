import { FilterMode } from './enums';

export interface GridType {
    nativeElement: HTMLElement;
    rowEditable: boolean;
    rootSummariesEnabled: boolean;
    allowFiltering: boolean;

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
    dataView: any;

    rowInEditMode: any;
    rowEditTabs: any;

    firstEditableColumnIndex: number;
    lastEditableColumnIndex: number;

    endEdit(commit: boolean, event?: Event): void;
}
