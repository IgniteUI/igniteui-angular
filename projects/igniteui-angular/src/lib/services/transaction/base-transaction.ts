import { TransactionService, Transaction, State, StateUpdateEvent, TransactionType } from './transaction';
import { EventEmitter } from '@angular/core';
import { isObject, mergeObjects } from '../../core/utils';
import { DefaultDataCloneStrategy, IDataCloneStrategy } from '../../data-operations/data-clone-strategy';

export class IgxBaseTransactionService<T extends Transaction, S extends State> implements TransactionService<T, S> {
    /**
     * Gets/Sets the data clone strategy used to clone data
     */
    public get cloneStrategy(): IDataCloneStrategy {
        return this._cloneStrategy;
    }

    public set cloneStrategy(strategy: IDataCloneStrategy) {
        if (strategy) {
            this._cloneStrategy = strategy;
        }
    }

    /**
     * @returns if there are any transactions in the Redo stack
     */
    public get canRedo(): boolean {
        return false;
    }

    /**
     * @returns if there are any transactions in the Undo stack
     */
    public get canUndo(): boolean {
        return false;
    }

    /**
     * Returns whether transaction is enabled for this service
     */
    public get enabled(): boolean {
        return this._isPending;
    }

    /**
     * Event fired when transaction state has changed - add transaction, commit all transactions, undo and redo
     */
    public onStateUpdate = new EventEmitter<StateUpdateEvent>();

    protected _isPending = false;
    protected _pendingTransactions: T[] = [];
    protected _pendingStates: Map<any, S> = new Map();
    private _cloneStrategy: IDataCloneStrategy = new DefaultDataCloneStrategy();

    /**
     * Adds provided  transaction with recordRef if any
     *
     * @param transaction Transaction to be added
     * @param recordRef Reference to the value of the record in the data source related to the changed item
     */
    public add(transaction: T, recordRef?: any): void {
        if (this._isPending) {
            this.updateState(this._pendingStates, transaction, recordRef);
            this._pendingTransactions.push(transaction);
        }
    }

    /**
     * Returns all recorded transactions in chronological order
     *
     * @param id Optional record id to get transactions for
     * @returns All transaction in the service or for the specified record
     */
    public getTransactionLog(_id?: any): T[] {
        return [];
    }

    /**
     * Remove the last transaction if any
     */
    public undo(): void { }

     /**
      * Applies the last undone transaction if any
      */
    public redo(): void { }

    /**
     * Returns aggregated changes from all transactions
     *
     * @param mergeChanges If set to true will merge each state's value over relate recordRef
     * and will record resulting value in the related transaction
     * @returns Collection of aggregated transactions for each changed record
     */
    public getAggregatedChanges(mergeChanges: boolean): T[] {
        const result: T[] = [];
        this._pendingStates.forEach((state: S, key: any) => {
            const value = mergeChanges ? this.getAggregatedValue(key, mergeChanges) : state.value;
            result.push({ id: key, newValue: value, type: state.type } as T);
        });
        return result;
    }

    /**
     * Returns the state of the record with provided id
     *
     * @param id The id of the record
     * @param pending Should get pending state
     * @returns State of the record if any
     */
    public getState(id: any): S {
        return this._pendingStates.get(id);
    }

    /**
     * Returns value of the required id including all uncommitted changes
     *
     * @param id The id of the record to return value for
     * @param mergeChanges If set to true will merge state's value over relate recordRef
     * and will return merged value
     * @returns Value with changes or **null**
     */
    public getAggregatedValue(id: any, mergeChanges: boolean): any {
        const state = this._pendingStates.get(id);
        if (!state) {
            return null;
        }
        if (mergeChanges && state.recordRef) {
            return this.updateValue(state);
        }
        return state.value;
    }

    /**
     * Applies all transactions over the provided data
     *
     * @param data Data source to update
     * @param id Optional record id to commit transactions for
     */
    public commit(_data: any[], _id?: any): void { }

    /**
     * Clears all transactions
     *
     * @param id Optional record id to clear transactions for
     */
    public clear(_id?: any): void {
        this._pendingStates.clear();
        this._pendingTransactions = [];
    }

    /**
     * Starts pending transactions. All transactions passed after call to startPending
     * will not be added to transaction log
     */
    public startPending(): void {
        this._isPending = true;
    }

    /**
     * Clears all pending transactions and aggregated pending state. If commit is set to true
     * commits pending states as single transaction
     *
     * @param commit Should commit the pending states
     */
    public endPending(_commit: boolean): void {
        this._isPending = false;
        this._pendingStates.clear();
        this._pendingTransactions = [];
    }


    /**
     * Updates the provided states collection according to passed transaction and recordRef
     *
     * @param states States collection to apply the update to
     * @param transaction Transaction to apply to the current state
     * @param recordRef Reference to the value of the record in data source, if any, where transaction should be applied
     */
    protected updateState(states: Map<any, S>, transaction: T, recordRef?: any): void {
        let state = states.get(transaction.id);
        if (state) {
            if (isObject(state.value)) {
                mergeObjects(state.value, transaction.newValue);
            } else {
                state.value = transaction.newValue;
            }
        } else {
            state = { value: this.cloneStrategy.clone(transaction.newValue), recordRef, type: transaction.type } as S;
            states.set(transaction.id, state);
        }

        this.cleanState(transaction.id, states);
    }

    /**
     * Updates the recordRef of the provided state with all the changes in the state. Accepts primitive and object value types
     *
     * @param state State to update value for
     * @returns updated value including all the changes in provided state
     */
    protected updateValue(state: S) {
        return this.mergeValues(state.recordRef, state.value);
    }

    /**
     * Merges second values in first value and the result in empty object. If values are primitive type
     * returns second value if exists, or first value.
     *
     * @param first Value to merge into
     * @param second Value to merge
     */
    protected mergeValues<U>(first: U, second: U): U {
        if (isObject(first) || isObject(second)) {
            return mergeObjects(this.cloneStrategy.clone(first), second);
        } else {
            return second ? second : first;
        }
    }

    /**
     * Compares the state with recordRef and clears all duplicated values. If any state ends as
     * empty object removes it from states.
     *
     * @param state State to clean
     */
    protected cleanState(id: any, states: Map<any, S>): void {
        const state = states.get(id);
        //  do nothing if
        //  there is no state, or
        //  there is no state value (e.g. DELETED transaction), or
        //  there is no recordRef (e.g. ADDED transaction)
        if (state && state.value && state.recordRef) {
            //  if state's value is object compare each key with the ones in recordRef
            //  if values in any key are the same delete it from state's value
            //  if state's value is not object, simply compare with recordRef and remove
            //  the state if they are equal
            if (isObject(state.recordRef)) {
                for (const key of Object.keys(state.value)) {
                    if (JSON.stringify(state.recordRef[key]) === JSON.stringify(state.value[key])) {
                        delete state.value[key];
                    }
                }

                //  if state's value is empty remove the state from the states, only if state is not DELETE type
                if (state.type !== TransactionType.DELETE && Object.keys(state.value).length === 0) {
                    states.delete(id);
                }
            } else {
                if (state.recordRef === state.value) {
                    states.delete(id);
                }
            }
        }
    }
}
