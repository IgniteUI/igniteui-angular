import { TransactionService, Transaction, State } from './transaction';
import { EventEmitter, Injectable } from '@angular/core';

@Injectable()
export class IgxBaseTransactionService implements TransactionService {
    protected _isPending = false;
    protected _pendingTransactions: Transaction[] = [];
    protected _pendingStates: Map<any, State> = new Map();
    public onStateUpdate = new EventEmitter<void>();

    public add(transaction: Transaction, recordRef?: any): void {
        if (this._isPending) {
            this.updateState(this._pendingStates, transaction, recordRef);
            this._pendingTransactions.push(transaction);
        }
    }

    getTransactionLog(id?: any): Transaction[] | Transaction { return []; }

    undo(): void { }

    redo(): void { }

    aggregatedState(mergeChanges: boolean): Transaction[] {
        const result: Transaction[] = [];
        this._pendingStates.forEach((state: State, key: any) => {
            const value = mergeChanges ? this.getAggregatedValue(key, mergeChanges) : state.value;
            result.push({ id: key, newValue: value, type: state.type });
        });
        return result;
    }

    public getState(id: any): State {
        return this._pendingStates.get(id);
    }

    public get enabled(): boolean {
        return this._isPending;
    }

    public getAggregatedValue(id: any, mergeChanges: boolean): any {
        const state = this._pendingStates.get(id);
        if (!state) {
            return null;
        }
        if (mergeChanges) {
            return this.updateValue(state);
        }
        return state.value;
    }

    commit(data: any): void { }

    clear(): void {
        this._pendingStates.clear();
        this._pendingTransactions = [];
    }

    public startPending(): void {
        this._isPending = true;
    }

    public endPending(commit: boolean): void {
        this._isPending = false;
        this._pendingStates.clear();
        this._pendingTransactions = [];
    }


    /**
     * Updates the provided states collection according to passed transaction and recordRef
     * @param states States collection to apply the update to
     * @param transaction Transaction to apply to the current state
     * @param recordRef Reference to the value of the record in data source, if any, where transaction should be applied
     */
    protected updateState(states: Map<any, State>, transaction: Transaction, recordRef?: any): void {
        let state = states.get(transaction.id);
        if (state) {
            if (typeof state.value === 'object') {
                Object.assign(state.value, transaction.newValue);
            } else {
                state.value = transaction.newValue;
            }
        } else {
            state = { value: this.copyValue(transaction.newValue), recordRef: recordRef, type: transaction.type };
            states.set(transaction.id, state);
        }
    }

    /**
     * Updates the recordRef of the provided state with all the changes in the state. Accepts primitive and object value types
     * @param state State to update value for
     * @returns updated value including all the changes in provided state
     */
    protected updateValue(state: State) {
        if (typeof state.recordRef === 'object') {
            return Object.assign({}, state.recordRef, state.value);
        } else {
            return state.value;
        }
    }

    /**
     * If provided value is object creates a new object and returns it, otherwise returns the value
     * @param value Value to create copy for
     * @returns Copy of provided value
     */
    protected copyValue(value: any): any {
        if (typeof value === 'object') {
            return Object.assign({}, value);
        } else {
            return value;
        }
    }
}
