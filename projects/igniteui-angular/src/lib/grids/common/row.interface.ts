import { IGroupByRecord } from '../../data-operations/groupby-record.interface';
import { ITreeGridRecord } from '../tree-grid/tree-grid.interfaces';

export interface RowType {
    index: number;
    isGroupByRow?: boolean;
    groupRow?: IGroupByRecord;
    rowID?: any;
    rowData?: any;
    data?: any;
    disabled?: boolean;
    pinned?: boolean;
    selected?: boolean;
    expanded?: boolean;
    deleted?: boolean;
    inEditMode?: boolean;
    children?: ITreeGridRecord[];
    parent?: ITreeGridRecord;
    hasChildren?: boolean;
    update?: (value: any) => void;
    delete?: () => any;
    pin?: () => void;
    unpin?: () => void;
}

