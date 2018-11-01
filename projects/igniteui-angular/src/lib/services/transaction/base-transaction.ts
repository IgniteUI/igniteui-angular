import { TransactionService, Transaction, State } from './transaction';
import { EventEmitter, Injectable } from '@angular/core';
import { isObject, mergeObjects, cloneValue } from '../../core/utils';

@Injectable()
export class IgxBaseTransactionService<T extends Transaction> implements TransactionService<T> {
    protected _isPending = false;
    protected _pendingTransactions: T[] = [];
    protected _pendingStates: Map<any, State> = new Map();
    public get canRedo(): boolean {
        return false;
    }
    public get canUndo(): boolean {
        return false;
    }
    public get enabled(): boolean {
        return this._isPending;
    }

    public onStateUpdate = new EventEmitter<void>();

    public add(transaction: T, recordRef?: any): void {
        if (this._isPending) {
            this.updateState(this._pendingStates, transaction, recordRef);
            this._pendingTransactions.push(transaction);
        }
    }

    getTransactionLog(id?: any): T[] | T { return []; }

    undo(): void { }

    redo(): void { }

    aggregatedState(mergeChanges: boolean): T[] {
        const result: T[] = [];
        this._pendingStates.forEach((state: State, key: any) => {
            const value = mergeChanges ? this.getAggregatedValue(key, mergeChanges) : state.value;
            result.push({ id: key, newValue: value, type: state.type } as T);
        });
        return result;
    }

    public getState(id: any): State {
        return this._pendingStates.get(id);
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
    protected updateState(states: Map<any, State>, transaction: T, recordRef?: any): void {
        let state = states.get(transaction.id);
        if (state) {
            if (isObject(state.value)) {
                mergeObjects(state.value, transaction.newValue);
            } else {
                state.value = transaction.newValue;
            }
        } else {
            state = { value: cloneValue(transaction.newValue), recordRef: recordRef, type: transaction.type };
            states.set(transaction.id, state);
        }
    }

    /**
     * Updates the recordRef of the provided state with all the changes in the state. Accepts primitive and object value types
     * @param state State to update value for
     * @returns updated value including all the changes in provided state
     */
    protected updateValue(state: State) {
        return this.mergeValues(state.recordRef, state.value);
    }

    /**
     * Merges second values in first value and the result in empty object. If values are primitive type
     * returns second value if exists, or first value.
     * @param first Value to merge into
     * @param second Value to merge
     */
    protected mergeValues<U>(first: U, second: U): U {
        let result: U;
        if (isObject(first) || isObject(second)) {
            result = mergeObjects(mergeObjects({}, first), second);
        } else {
            result = second ? second : first;
        }
        return result;
    }
}
