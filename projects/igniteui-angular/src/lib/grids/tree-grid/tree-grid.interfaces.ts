import { IBaseEventArgs } from '../../core/utils';

export interface ITreeGridRecord {
    rowID: any;
    data: any;
    children?: ITreeGridRecord[];
    parent?: ITreeGridRecord;
    level?: number;
    isFilteredOutParent?: boolean;
    expanded?: boolean;
}

export interface IRowToggleEventArgs extends IBaseEventArgs {
    rowID: any;
    expanded: boolean;
    event?: Event;
    cancel: boolean;
}
