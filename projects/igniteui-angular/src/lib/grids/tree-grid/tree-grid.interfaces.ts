import { IgxTreeGridRowComponent } from './tree-grid-row.component';

export interface ITreeGridRecord {
    rowID: any;
    data: any;
    children?: ITreeGridRecord[];
    parent?: ITreeGridRecord;
    indentationLevel?: number;
    isFilteredOutParent?: boolean;
    expanded?: boolean;
}

export interface ITreeGridRowExpansionEventArgs {
    row: IgxTreeGridRowComponent;
    expanded: boolean;
    event: Event;
    cancel: boolean;
}
