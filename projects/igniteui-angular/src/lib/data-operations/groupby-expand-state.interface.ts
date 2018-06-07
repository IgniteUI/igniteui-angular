export interface IGroupByExpandState {
    expanded: boolean;
    hierarchy: Array<IGroupByKey>;
}

export interface IGroupByKey {
    fieldName: string;
    value: any;
}
