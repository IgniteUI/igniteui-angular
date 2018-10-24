import { Transaction, State, TransactionType } from './transaction';
import { IgxBaseTransactionService } from './base-transaction';
import { EventEmitter, Injectable } from '@angular/core';

@Injectable()
export class IgxTransactionService extends IgxBaseTransactionService {
    private _transactions: Transaction[] = [];
    private _redoStack: { transaction: Transaction, recordRef: any }[] = [];
    private _undoStack: { transaction: Transaction, recordRef: any }[] = [];
    private _states: Map<any, State> = new Map();
    public onStateUpdate = new EventEmitter<void>();

    public add(transaction: Transaction, recordRef?: any): void {
        const states = this._isPending ? this._pendingStates : this._states;
        this.verifyAddedTransaction(states, transaction, recordRef);
        this.updateState(states, transaction, recordRef);

        const transactions = this._isPending ? this._pendingTransactions : this._transactions;
        transactions.push(transaction);

        if (!this._isPending) {
            this._undoStack.push({ transaction, recordRef });
            this._redoStack = [];
            this.onStateUpdate.emit();
        }
    }

    public getTransactionLog(id?: any): Transaction[] | Transaction {
        if (id) {
            return [...this._transactions].reverse().find(t => t.id === id);
        }
        return [...this._transactions];
    }

    public aggregatedState(mergeChanges: boolean): Transaction[] {
        const result: Transaction[] = [];
        this._states.forEach((state: State, key: any) => {
            const value = mergeChanges ? this.getAggregatedValue(key, mergeChanges) : state.value;
            result.push({ id: key, newValue: value, type: state.type });
        });
        return result;
    }

    public getState(id: any): State {
        return this._states.get(id);
    }

    public get enabled(): boolean {
        return true;
    }

    public getAggregatedValue(id: any, mergeChanges: boolean): any {
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

    public endPending(commit: boolean): void {
        this._isPending = false;
        if (commit) {
            this._pendingStates.forEach((s: State, k: any) => {
                this.add({ id: k, newValue: s.value, type: s.type }, s.recordRef);
            });
        }
        super.endPending(commit);
    }

    public commit(data: any[]): void {
        this._states.forEach((s: State) => {
            const index = data.findIndex(i => JSON.stringify(i) === JSON.stringify(s.recordRef));
            switch (s.type) {
                case TransactionType.ADD:
                    data.push(s.value);
                    break;
                case TransactionType.DELETE:
                    if (0 <= index && index < data.length) {
                        data.splice(index, 1);
                    }
                    break;
                case TransactionType.UPDATE:
                    if (0 <= index && index < data.length) {
                        data[index] = this.updateValue(s);
                    }
                    break;
            }
        });
        this.clear();
    }

    public clear(): void {
        this._transactions = [];
        this._states.clear();
        this._redoStack = [];
        this._undoStack = [];
        this.onStateUpdate.emit();
    }

    public undo(): void {
        if (this._undoStack.length <= 0) {
            return;
        }
        this._transactions.pop();
        const action: { transaction: Transaction, recordRef: any } = this._undoStack.pop();
        this._redoStack.push(action);
        this._states.clear();
        this._undoStack.map(a => this.updateState(this._states, a.transaction, a.recordRef));
        this.onStateUpdate.emit();
    }

    public redo(): void {
        if (this._redoStack.length > 0) {
            const undoItem = this._redoStack.pop();
            this.updateState(this._states, undoItem.transaction, undoItem.recordRef);
            this._transactions.push(undoItem.transaction);
            this._undoStack.push(undoItem);
            this.onStateUpdate.emit();
        }
    }

    /**
     * Verifies if the passed transaction is correct. If not throws an exception.
     * @param transaction Transaction to be verified
     */
    protected verifyAddedTransaction(states: Map<any, State>, transaction: Transaction, recordRef?: any): void {
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
                if (!state && !recordRef) {
                    //  cannot initially add transaction or delete item with no recordRef
                    throw new Error(`Cannot add this transaction. This is first transaction of type ${transaction.type} ` +
                        `for id ${transaction.id}. For first transaction of this type recordRef is mandatory.`);
                }
                break;
        }
    }

    /**
     * Updates the provided states collection according to passed transaction and recordRef
     * @param states States collection to apply the update to
     * @param transaction Transaction to apply to the current state
     * @param recordRef Reference to the value of the record in data source, if any, where transaction should be applied
     */
    protected updateState(states: Map<any, State>, transaction: Transaction, recordRef?: any): void {
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
                    } else if (state && state.type === TransactionType.UPDATE) {
                        state.value = transaction.newValue;
                        state.type = TransactionType.DELETE;
                    }
                    break;
                case TransactionType.UPDATE:
                    //  TODO: move object.assign part in a method, probably change updateValue one!
                    if (typeof state.value === 'object') {
                        if (state.type === TransactionType.ADD) {
                            state.value = Object.assign({}, state.value, transaction.newValue);
                        }
                        if (state.type === TransactionType.UPDATE) {
                            Object.assign(state.value, transaction.newValue);
                        }
                    } else {
                        state.value = transaction.newValue;
                    }
            }
        } else {
            state = { value: this.copyValue(transaction.newValue), recordRef: recordRef, type: transaction.type };
            states.set(transaction.id, state);
        }

        //  should not clean pending state. This will happen automatically on endPending call
        if (!this._isPending) {
            this.cleanState(transaction.id, states);
        }
    }

    /**
     * Compares the state with recordRef and clears all duplicated values. If any state ends as
     * empty object removes it from states.
     * @param state State to clean
     */
    protected cleanState(id: any, states: Map<any, State>): void {
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
            if (typeof state.recordRef === 'object') {
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

    /**
     * Merges second values in first value and the result in empty object. If values are primitive type
     * returns second value if exists, or first value.
     * @param first Value to merge into
     * @param second Value to merge
     */
    protected mergeValues<T>(first: T, second: T): T {
        let result: T;
        if ((first && typeof first === 'object') || (second && typeof second === 'object')) {
            result = Object.assign({}, first, second);
        } else {
            result = second ? second : first;
        }
        return result;
    }
}
