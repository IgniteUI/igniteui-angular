import { QueryList } from '@angular/core';
import { IgxGridCellComponent, ITreeGridRecord } from 'igniteui-angular';

export interface RowType {
    rowID: any;
    rowData: any;
    disabled: boolean;
    index: number;
    gridID: string;
    added: boolean;
    pinned: boolean;
    selected: boolean;
    expanded: boolean;
    deleted: boolean;
    addRow: boolean;
    cells: QueryList<IgxGridCellComponent>;
    inEditMode: boolean;
    update: (value: any) => void;
    delete: () => any;
    isCellActive: (visibleColumIndex: number) => boolean;
    pin: () => void;
    unpin: () => void;
    beginAddRow: () => void;
}

export interface TreeGridRowType extends RowType {
    treeRow: ITreeGridRecord;
}

export interface HierarchicalGridRowType extends RowType {
    toggle: () => void;
    hasChildren: boolean;
}
