
/* marshalByValue */
export interface ITreeGridRecord {
    key: any;
    data: any;
    children?: ITreeGridRecord[];
    /* blazorAlternateName: RecordParent */
    parent?: ITreeGridRecord;
    level?: number;
    isFilteredOutParent?: boolean;
    expanded?: boolean;
}
