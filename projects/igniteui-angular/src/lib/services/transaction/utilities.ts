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
    /**
     * Adds provided  transaction with originalValue if any
     * @param transaction Transaction to be added
     * @param originalValue Value from data source of the changed item
     */
    add(transaction: ITransaction, originalValue?: any);

    /**
     * Returns last transaction related to the passed id
     * @param id Of the transaction
     */
    getLastTransactionById(id: any): ITransaction;

    /**
     * Returns an array of all transactions
     */
    getTransactionLog(): ITransaction[];

    /**
     * Remove the last transaction if any
     */
    undo();

    /**
     * Applies the last undone transaction if any
     */
    redo();

    /**
     * Returns a map of actual state for each changed item
     */
    currentState(): Map<any, IState>;

    /**
     * Applies all changes for all changed items in the provided data
     * @param data Data source to update
     */
    update(data: any[]);

    /**
     * Clears all transactions
     */
    reset();
}
