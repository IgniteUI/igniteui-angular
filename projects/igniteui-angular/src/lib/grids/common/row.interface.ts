import { ITreeGridRecord } from '../tree-grid/tree-grid.interfaces';

export interface RowType {
    key: any;
    data: any;
    disabled: boolean;
    index: number;
    pinned: boolean;
    selected: boolean;
    expanded: boolean;
    deleted: boolean;
    inEditMode: boolean;
    children?: ITreeGridRecord[];
    parent?: ITreeGridRecord;
    hasChildren: boolean;
    update: (value: any) => void;
    delete: () => any;
    pin: () => void;
    unpin: () => void;
}

