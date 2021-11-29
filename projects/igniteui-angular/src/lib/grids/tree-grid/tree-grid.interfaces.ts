
export interface ITreeGridRecord {
    key: any;
    data: any;
    children?: ITreeGridRecord[];
    parent?: ITreeGridRecord;
    level?: number;
    isFilteredOutParent?: boolean;
    expanded?: boolean;
}
