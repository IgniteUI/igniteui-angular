import { EventEmitter } from '@angular/core';

export enum TransactionType {
    ADD = 'add',
    DELETE = 'delete',
    UPDATE = 'update'
}

export interface Transaction {
    id: any;
    type: TransactionType;
    newValue: any;
}

export interface State {
    value: any;
    recordRef: any;
    type: TransactionType;
}

export interface TransactionService {
    /**
     * Returns whether transaction is enabled for this service
     */
    readonly enabled: boolean;

    /**
     * Event fired when transaction state has changed - add transaction, commit all transactions, undo and redo.
     */
    onStateUpdate?: EventEmitter<void>;

    /**
     * Adds provided  transaction with recordRef if any
     * @param transaction Transaction to be added
     * @param recordRef Reference to the value of the record in the data source related to the changed item
     */
    add(transaction: Transaction, recordRef?: any): void;

    /**
     * Returns an array of all transactions. If id is provided returns last transaction for provided id
     * @returns All the transaction on last transaction for provided id
     */
    getTransactionLog(id?: any): Transaction[] | Transaction;

    /**
     * Remove the last transaction if any
     */
    undo(): void;

    /**
     * Applies the last undone transaction if any
     */
    redo(): void;

    /**
     * Returns aggregated state of all transactions including pending ones
     * @param mergeChanges If set to true will merge each state's value over relate recordRef
     * and will record resulting value in the related transaction
     * @returns Collection of aggregated transactions for each changed record
     */
    aggregatedState(mergeChanges: boolean): Transaction[];

    /**
     * Returns the state of the record with provided id
     * @param id The id of the record
     * @returns State of the record if any
     */
    getState(id: any): State;

    /**
     * Returns value of the required id including all uncommitted changes
     * @param id The id of the record to return value for
     * @param mergeChanges If set to true will merge state's value over relate recordRef
     * and will return merged value
     * @returns Value with changes or **null**
     */
    getAggregatedValue(id: any, mergeChanges: boolean): any;

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
     * will not be added to transaction log
     */
    startPending(): void;

    /**
     * Clears all pending transactions and aggregated pending state. If commit is set to true
     * commits pending states as single transaction
     * @param commit Should commit the pending states
     */
    endPending(commit: boolean): void;
}
