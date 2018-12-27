import { Transaction, State, TransactionType } from './transaction';
import { IgxBaseTransactionService } from './base-transaction';
import { EventEmitter, Injectable } from '@angular/core';
import { isObject, mergeObjects, cloneValue } from '../../core/utils';

@Injectable()
export class IgxTransactionService<T extends Transaction, S extends State> extends IgxBaseTransactionService<T, S> {
    protected _transactions: T[] = [];
    protected _redoStack: { transaction: T, recordRef: any }[][] = [];
    protected _undoStack: { transaction: T, recordRef: any }[][] = [];
    protected _states: Map<any, S> = new Map();

    /**
     * @inheritdoc
     */
    get canUndo(): boolean {
        return this._undoStack.length > 0;
    }

    /**
     * @inheritdoc
     */
    get canRedo(): boolean {
        return this._redoStack.length > 0;
    }

    /**
     * @inheritdoc
     */
    public onStateUpdate = new EventEmitter<void>();

    /**
     * @inheritdoc
     */
    public add(transaction: T, recordRef?: any): void {
        const states = this._isPending ? this._pendingStates : this._states;
        this.verifyAddedTransaction(states, transaction, recordRef);
        this.addTransaction(transaction, states, recordRef);
    }

    protected addTransaction(transaction: T, states: Map<any, S>, recordRef?: any) {
        this.updateState(states, transaction, recordRef);

        const transactions = this._isPending ? this._pendingTransactions : this._transactions;
        transactions.push(transaction);

        if (!this._isPending) {
            this._undoStack.push([{ transaction, recordRef }]);
            this._redoStack = [];
            this.onStateUpdate.emit();
        }
    }

    /**
     * @inheritdoc
     */
    public getTransactionLog(id?: any): T[] {
        if (id) {
            return this._transactions.filter(t => t.id === id);
        }
        return [...this._transactions];
    }

    /**
     * @inheritdoc
     */
    public getAggregatedChanges(mergeChanges: boolean): T[] {
        const result: T[] = [];
        this._states.forEach((state: S, key: any) => {
            const value = mergeChanges ? this.mergeValues(state.recordRef, state.value) : state.value;
            result.push({ id: key, newValue: value, type: state.type } as T);
        });
        return result;
    }

    /**
     * @inheritdoc
     */
    public getState(id: any): S {
        return this._states.get(id);
    }

    /**
     * @inheritdoc
     */
    public get enabled(): boolean {
        return true;
    }

    /**
     * @inheritdoc
     */
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

    /**
     * @inheritdoc
     */
    public endPending(commit: boolean): void {
        this._isPending = false;
        if (commit) {
            const actions: { transaction: T, recordRef: any }[] = [];
            // don't use addTransaction due to custom undo handling
            for (const transaction of this._pendingTransactions) {
                const pendingState = this._pendingStates.get(transaction.id);
                this._transactions.push(transaction);
                this.updateState(this._states, transaction, pendingState.recordRef);
                actions.push({ transaction, recordRef: pendingState.recordRef });
            }

            this._undoStack.push(actions);
            this._redoStack = [];

            this.onStateUpdate.emit();
        }
        super.endPending(commit);
    }

    /**
     * @inheritdoc
     */
    public commit(data: any[]): void {
        this._states.forEach((s: S) => {
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

    /**
     * @inheritdoc
     */
    public clear(): void {
        this._transactions = [];
        this._states.clear();
        this._redoStack = [];
        this._undoStack = [];
        this.onStateUpdate.emit();
    }

    /**
     * @inheritdoc
     */
    public undo(): void {
        if (this._undoStack.length <= 0) {
            return;
        }

        const lastActions: { transaction: T, recordRef: any }[] = this._undoStack.pop();
        this._transactions.splice(this._transactions.length - lastActions.length);
        this._redoStack.push(lastActions);

        this._states.clear();
        for (const currentActions of this._undoStack) {
            for (const transaction of currentActions) {
                this.updateState(this._states, transaction.transaction, transaction.recordRef);
            }
        }

        this.onStateUpdate.emit();
    }

    /**
     * @inheritdoc
     */
    public redo(): void {
        if (this._redoStack.length > 0) {
            let actions: { transaction: T, recordRef: any, useInUndo?: boolean }[];
            actions = this._redoStack.pop();
            for (const action of actions) {
                this.updateState(this._states, action.transaction, action.recordRef);
                this._transactions.push(action.transaction);
            }

            this._undoStack.push(actions);
            this.onStateUpdate.emit();
        }
    }

    /**
     * Verifies if the passed transaction is correct. If not throws an exception.
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
     * @param states States collection to apply the update to
     * @param transaction Transaction to apply to the current state
     * @param recordRef Reference to the value of the record in data source, if any, where transaction should be applied
     */
    protected updateState(states: Map<any, S>, transaction: T, recordRef?: any): void {
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
            state = { value: cloneValue(transaction.newValue), recordRef: recordRef, type: transaction.type } as S;
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
