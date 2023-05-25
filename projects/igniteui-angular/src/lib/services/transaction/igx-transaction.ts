import { Transaction, State, TransactionType, TransactionEventOrigin, Action } from './transaction';
import { IgxBaseTransactionService } from './base-transaction';
import { isObject, mergeObjects } from '../../core/utils';

export class IgxTransactionService<T extends Transaction, S extends State> extends IgxBaseTransactionService<T, S> {

    protected _transactions: T[] = [];
    protected _redoStack: Action<T>[][] = [];
    protected _undoStack: Action<T>[][] = [];
    protected _states: Map<any, S> = new Map();

    /**
     * @returns if there are any transactions in the Undo stack
     */
    public override get canUndo(): boolean {
        return this._undoStack.length > 0;
    }

    /**
     * @returns if there are any transactions in the Redo stack
     */
    public override get canRedo(): boolean {
        return this._redoStack.length > 0;
    }

    /**
     * Adds provided  transaction with recordRef if any
     *
     * @param transaction Transaction to be added
     * @param recordRef Reference to the value of the record in the data source related to the changed item
     */
    public override add(transaction: T, recordRef?: any): void {
        const states = this._isPending ? this._pendingStates : this._states;
        this.verifyAddedTransaction(states, transaction, recordRef);
        this.addTransaction(transaction, states, recordRef);
    }

    /**
     * Returns all recorded transactions in chronological order
     *
     * @param id Optional record id to get transactions for
     * @returns All transaction in the service or for the specified record
     */
    public override getTransactionLog(id?: any): T[] {
        if (id !== undefined) {
            return this._transactions.filter(t => t.id === id);
        }
        return [...this._transactions];
    }

    /**
     * Returns aggregated changes from all transactions
     *
     * @param mergeChanges If set to true will merge each state's value over relate recordRef
     * and will record resulting value in the related transaction
     * @returns Collection of aggregated transactions for each changed record
     */
    public override getAggregatedChanges(mergeChanges: boolean): T[] {
        const result: T[] = [];
        this._states.forEach((state: S, key: any) => {
            const value = mergeChanges ? this.mergeValues(state.recordRef, state.value) : state.value;
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
    public override getState(id: any, pending = false): S {
        return pending ? this._pendingStates.get(id) : this._states.get(id);
    }

    /**
     * Returns whether transaction is enabled for this service
     */
    public override get enabled(): boolean {
        return true;
    }

    /**
     * Returns value of the required id including all uncommitted changes
     *
     * @param id The id of the record to return value for
     * @param mergeChanges If set to true will merge state's value over relate recordRef
     * and will return merged value
     * @returns Value with changes or **null**
     */
    public override getAggregatedValue(id: any, mergeChanges: boolean): any {
        const state = this._states.get(id);
        const pendingState = super.getState(id);

        //  if there is no state and there is no pending state return null
        if (!state && !pendingState) {
            return null;
        }

        const pendingChange = super.getAggregatedValue(id, false);
        const change = state && state.value;
        let aggregatedValue = this.mergeValues(change, pendingChange);
        if (mergeChanges) {
            const originalValue = state ? state.recordRef : pendingState.recordRef;
            aggregatedValue = this.mergeValues(originalValue, aggregatedValue);
        }
        return aggregatedValue;
    }

    /**
     * Clears all pending transactions and aggregated pending state. If commit is set to true
     * commits pending states as single transaction
     *
     * @param commit Should commit the pending states
     */
    public override endPending(commit: boolean): void {
        this._isPending = false;
        if (commit) {
            const actions: Action<T>[] = [];
            // don't use addTransaction due to custom undo handling
            for (const transaction of this._pendingTransactions) {
                const pendingState = this._pendingStates.get(transaction.id);
                this._transactions.push(transaction);
                this.updateState(this._states, transaction, pendingState.recordRef);
                actions.push({ transaction, recordRef: pendingState.recordRef });
            }

            this._undoStack.push(actions);
            this._redoStack = [];

            this.onStateUpdate.emit({ origin: TransactionEventOrigin.END, actions });
        }
        super.endPending(commit);
    }

    /**
     * Applies all transactions over the provided data
     *
     * @param data Data source to update
     * @param id Optional record id to commit transactions for
     */
    public override commit(data: any[], id?: any): void {
        if (id !== undefined) {
            const state = this.getState(id);
            if (state) {
                this.updateRecord(data, state);
            }
        } else {
            this._states.forEach((s: S) => {
                this.updateRecord(data, s);
            });
        }
        this.clear(id);
    }

    /**
     * Clears all transactions
     *
     * @param id Optional record id to clear transactions for
     */
    public override clear(id?: any): void {
        if (id !== undefined) {
            this._transactions = this._transactions.filter(t => t.id !== id);
            this._states.delete(id);
            //  Undo stack is an array of actions. Each action is array of transaction like objects
            //  We are going trough all the actions. For each action we are filtering out transactions
            //  with provided id. Finally if any action ends up as empty array we are removing it from
            //  undo stack
            this._undoStack = this._undoStack.map(a => a.filter(t => t.transaction.id !== id)).filter(a => a.length > 0);
        } else {
            this._transactions = [];
            this._states.clear();
            this._undoStack = [];
        }
        this._redoStack = [];
        this.onStateUpdate.emit({ origin: TransactionEventOrigin.CLEAR, actions: [] });
    }

    /**
     * Remove the last transaction if any
     */
    public override undo(): void {
        if (this._undoStack.length <= 0) {
            return;
        }

        const lastActions: Action<T>[] = this._undoStack.pop();
        this._transactions.splice(this._transactions.length - lastActions.length);
        this._redoStack.push(lastActions);

        this._states.clear();
        for (const currentActions of this._undoStack) {
            for (const transaction of currentActions) {
                this.updateState(this._states, transaction.transaction, transaction.recordRef);
            }
        }

        this.onStateUpdate.emit({ origin: TransactionEventOrigin.UNDO, actions: lastActions });
    }

    /**
     * Applies the last undone transaction if any
     */
    public override redo(): void {
        if (this._redoStack.length > 0) {
            const actions: Action<T>[] = this._redoStack.pop();
            for (const action of actions) {
                this.updateState(this._states, action.transaction, action.recordRef);
                this._transactions.push(action.transaction);
            }

            this._undoStack.push(actions);
            this.onStateUpdate.emit({ origin: TransactionEventOrigin.REDO, actions });
        }
    }

    protected addTransaction(transaction: T, states: Map<any, S>, recordRef?: any) {
        this.updateState(states, transaction, recordRef);

        const transactions = this._isPending ? this._pendingTransactions : this._transactions;
        transactions.push(transaction);

        if (!this._isPending) {
            const actions = [{ transaction, recordRef }];
            this._undoStack.push(actions);
            this._redoStack = [];
            this.onStateUpdate.emit({ origin: TransactionEventOrigin.ADD, actions });
        }
    }

    /**
     * Verifies if the passed transaction is correct. If not throws an exception.
     *
     * @param transaction Transaction to be verified
     */
    protected verifyAddedTransaction(states: Map<any, S>, transaction: T, recordRef?: any): void {
        const state = states.get(transaction.id);
        switch (transaction.type) {
            case TransactionType.ADD:
                if (state) {
                    //  cannot add same item twice
                    throw new Error(`Cannot add this transaction. Transaction with id: ${transaction.id} has been already added.`);
                }
                break;
            case TransactionType.DELETE:
            case TransactionType.UPDATE:
                if (state && state.type === TransactionType.DELETE) {
                    //  cannot delete or update deleted items
                    throw new Error(`Cannot add this transaction. Transaction with id: ${transaction.id} has been already deleted.`);
                }
                if (!state && !recordRef && !this._isPending) {
                    //  cannot initially add transaction or delete item with no recordRef
                    throw new Error(`Cannot add this transaction. This is first transaction of type ${transaction.type} ` +
                        `for id ${transaction.id}. For first transaction of this type recordRef is mandatory.`);
                }
                break;
        }
    }

    /**
     * Updates the provided states collection according to passed transaction and recordRef
     *
     * @param states States collection to apply the update to
     * @param transaction Transaction to apply to the current state
     * @param recordRef Reference to the value of the record in data source, if any, where transaction should be applied
     */
    protected override updateState(states: Map<any, S>, transaction: T, recordRef?: any): void {
        let state = states.get(transaction.id);
        //  if TransactionType is ADD simply add transaction to states;
        //  if TransactionType is DELETE:
        //    - if there is state with this id of type ADD remove it from the states;
        //    - if there is state with this id of type UPDATE change its type to DELETE;
        //    - if there is no state with this id add transaction to states;
        //  if TransactionType is UPDATE:
        //    - if there is state with this id of type ADD merge new value and state recordRef into state new value
        //    - if there is state with this id of type UPDATE merge new value into state new value
        //    - if there is state with this id and state type is DELETE change its type to UPDATE
        //    - if there is no state with this id add transaction to states;
        if (state) {
            switch (transaction.type) {
                case TransactionType.DELETE:
                    if (state.type === TransactionType.ADD) {
                        states.delete(transaction.id);
                    } else if (state.type === TransactionType.UPDATE) {
                        state.value = transaction.newValue;
                        state.type = TransactionType.DELETE;
                    }
                    break;
                case TransactionType.UPDATE:
                    if (isObject(state.value)) {
                        if (state.type === TransactionType.ADD) {
                            state.value = this.mergeValues(state.value, transaction.newValue);
                        }
                        if (state.type === TransactionType.UPDATE) {
                            mergeObjects(state.value, transaction.newValue);
                        }
                    } else {
                        state.value = transaction.newValue;
                    }
            }
        } else {
            state = { value: this.cloneStrategy.clone(transaction.newValue), recordRef, type: transaction.type } as S;
            states.set(transaction.id, state);
        }

        this.cleanState(transaction.id, states);
    }

    /**
     * Updates state related record in the provided data
     *
     * @param data Data source to update
     * @param state State to update data from
     */
    protected updateRecord(data: any[], state: S) {
        const index = data.findIndex(i => JSON.stringify(i) === JSON.stringify(state.recordRef || {}));
        switch (state.type) {
            case TransactionType.ADD:
                data.push(state.value);
                break;
            case TransactionType.DELETE:
                if (0 <= index && index < data.length) {
                    data.splice(index, 1);
                }
                break;
            case TransactionType.UPDATE:
                if (0 <= index && index < data.length) {
                    data[index] = this.updateValue(state);
                }
                break;
        }
    }
}
