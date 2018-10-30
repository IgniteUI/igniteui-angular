import { IgxTreeGridRowComponent } from './tree-grid-row.component';

export interface ITreeGridRecord {
    rowID: any;
    data: any;
    children?: ITreeGridRecord[];
    parent?: ITreeGridRecord;
    level?: number;
    isFilteredOutParent?: boolean;
    expanded?: boolean;
}

export interface IRowToggleEventArgs {
    row: IgxTreeGridRowComponent;
    expanded: boolean;
    event: Event;
    cancel: boolean;
}
