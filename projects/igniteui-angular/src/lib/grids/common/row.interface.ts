import { IGroupByRecord } from '../../data-operations/groupby-record.interface';
import { IgxSummaryResult } from '../summaries/grid-summary';
import { ITreeGridRecord } from '../tree-grid/tree-grid.interfaces';

export interface RowType {
    index: number;
    isGroupByRow?: boolean;
    isSummaryRow?: boolean;
    summaries?: Map<string, IgxSummaryResult[]>;
    groupRow?: IGroupByRecord;
    rowID?: any;
    /** Deprecated, will be removed. data is the new property */
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

