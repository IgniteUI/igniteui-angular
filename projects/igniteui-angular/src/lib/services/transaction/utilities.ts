export enum ChangeType {
    ADD = 'add',
    DELETE = 'delete',
    UPDATE = 'update'
}

export interface IChange {
    id: any;
    type: ChangeType;
    newValue: any;
}

export interface IState {
    value: any;
    originalValue: any;
    type: ChangeType;
}

export interface ITransaction {
    add(change: IChange, originalValue?: any);
    get(id: string): IChange;
    getAll(): IChange[];
    undo();
    redo();
    currentState(): Map<any, IState>;
    update(data: any[]);
    reset();
}
