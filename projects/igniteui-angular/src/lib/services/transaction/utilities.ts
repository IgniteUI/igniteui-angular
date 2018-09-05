export enum TransactionType {
    ADD = 'add',
    DELETE = 'delete',
    UPDATE = 'update'
}

export interface ITransaction {
    id: any;
    type: TransactionType;
    newValue: any;
}

export interface IState {
    value: any;
    originalValue: any;
    type: TransactionType;
}

export interface ITransactionService {
    add(transaction: ITransaction, originalValue?: any);
    getLastTransactionById(id: any): ITransaction;
    getTransactionLog(): ITransaction[];
    undo();
    redo();
    currentState(): Map<any, IState>;
    update(data: any[]);
    reset();
}
