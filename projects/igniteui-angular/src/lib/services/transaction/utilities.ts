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
    recordRef: any;
    type: TransactionType;
}

export interface IgxTransactionService {
    /**
     * Adds provided  transaction with recordRef if any
     * @param transaction Transaction to be added
     * @param recordRef Reference to the value of the record in the data source related to the changed item
     *
     * @returns If operation is successful.
     */
    add(transaction: ITransaction, recordRef?: any): boolean;

    /**
     * Returns an array of all transactions. If id is provided returns last transaction for provided id
     */
    getTransactionLog(id?: any): ITransaction[] | ITransaction;

    /**
     * Remove the last transaction if any
     */
    undo(): void;

    /**
     * Applies the last undone transaction if any
     */
    redo(): void;

    /**
     * Returns a map of aggregated state for all transactions
     */
    aggregatedState(): Map<any, IState>;

    /**
     * Returns whether there are any uncommitted changes for provided id
     * @param id The id of the record
     * @returns whether there are uncommitted changes for provided id
     */
    hasState(id?: any): boolean;

    /**
     * Returns value of the required id including all uncommitted changes
     * @param id The id of the record
     * @returns updated recordRef
     */
    getAggregatedValue(id: any, mergeChanges: boolean): any;

    // TODO rename to commit
    /**
     * Applies all transactions over the provided data
     * @param data Data source to update
     */
    commit(data: any[]): void;

    /**
     * Clears all transactions
     */
    clear(): void;

    /**
     * Starts pending transactions. All transactions passed after call to startPending
     * will not be added to transaction log and will not be reflected in aggregated
     * state
     */
    startPending(): void;

    /**
     * Clears all pending transactions and aggregated pending state. If commit is set to true
     * commits pending states as single transaction
     * @param commit Should commit the pending states
     */
    endPending(commit: boolean): void;
}
