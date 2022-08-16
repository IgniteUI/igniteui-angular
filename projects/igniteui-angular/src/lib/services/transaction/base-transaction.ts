import { TransactionService, Transaction, State, StateUpdateEvent } from './transaction';
import { EventEmitter } from '@angular/core';
import { isObject, mergeObjects } from '../../core/utils';
import { DefaultDataCloneStrategy, IDataCloneStrategy } from '../../data-operations/data-clone-strategy';

export class IgxBaseTransactionService<T extends Transaction, S extends State> implements TransactionService<T, S> {
    /**
     * @inheritdoc
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
     * @inheritdoc
     */
    public get canRedo(): boolean {
        return false;
    }

    /**
     * @inheritdoc
     */
    public get canUndo(): boolean {
        return false;
    }

    /**
     * @inheritdoc
     */
    public get enabled(): boolean {
        return this._isPending || this.autoCommit;
    }

    /**
     * @inheritdoc
     */
    public autoCommit = true;

    /**
     * @inheritdoc
     */
    public onStateUpdate = new EventEmitter<StateUpdateEvent>();

    protected _isPending = false;
    protected _pendingTransactions: T[] = [];
    protected _pendingStates: Map<any, S> = new Map();
    private _cloneStrategy: IDataCloneStrategy = new DefaultDataCloneStrategy();

    /**
     * @inheritdoc
     */
    public add(transaction: T, recordRef?: any): void {
        if (this.enabled) {
            this.updateState(this._pendingStates, transaction, recordRef);
            this._pendingTransactions.push(transaction);
        }
    }

    /**
     * @inheritdoc
     */
    public getTransactionLog(_id?: any): T[] {
        return [];
    }

    /**
     * @inheritdoc
     */
    public undo(): void { }

    /**
     * @inheritdoc
     */
    public redo(): void { }

    /**
     * @inheritdoc
     */
    public getAggregatedChanges(mergeChanges: boolean): T[] {
        const result: T[] = [];
        this._pendingStates.forEach((state: S, key: any) => {
            const value = mergeChanges ? this.getAggregatedValue(key, mergeChanges) : state.value;
            result.push({ id: key, newValue: value, type: state.type, validity: state.validity } as T);
        });
        return result;
    }

    /**
     * @inheritdoc
     */
    public getState(id: any): S {
        return this._pendingStates.get(id);
    }

    /**
     * @inheritdoc
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
     * @inheritdoc
     */
    public commit(_data: any[], _id?: any): void {
        this.clear(_id);
    }

    /**
     * @inheritdoc
     */
    public getInvalidTransactionLog(id?: any) {
        let pending = [...this._pendingTransactions];
        if (id !== undefined) {
            pending = pending.filter(t => t.id === id);
        }
        return pending.filter(x => x.validity.some(y => y.valid === false));
    }

    /**
     * @inheritdoc
     */
    public clear(_id?: any): void {
        this._pendingStates.clear();
        this._pendingTransactions = [];
    }

    /**
     * @inheritdoc
     */
    public startPending(): void {
        this._isPending = true;
        this.autoCommit = false;
    }

    /**
     * @inheritdoc
     */
    public endPending(_commit: boolean): void {
        if (this._isPending && !_commit) {
            this._isPending = false;
            this.autoCommit = true;
            // reset last pending transaction.
            const last = this._pendingTransactions.pop();
            if (last) {
                this._pendingStates.delete(last.id);
            }
        }
        if (_commit) {
            this._pendingStates.clear();
            this._pendingTransactions = [];
        }
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
            this.updateValidity(state, transaction);
        } else {
            state = { value: this.cloneStrategy.clone(transaction.newValue), recordRef, type: transaction.type, validity: transaction.validity } as S;
            states.set(transaction.id, state);
            state.validity = transaction.validity;
        }
    }

    /**
     * Updates the validity state after update.
     *
     * @param state State to update value for
     * @param transaction The transaction based on which to update.
     */
    protected updateValidity(state, transaction) {
        // update validity
        const objKeys = Object.keys(state.value);
        objKeys.forEach(x => {
            const currentState = state.validity?.find(y => y.field === x);
            const newState = transaction.validity?.find(y => y.field === x);
            if (currentState && newState) {
                // update existing
                currentState.formGroup = newState.formGroup;
                currentState.valid = newState.valid;
            } else if (!currentState && transaction.validity) {
                state.validity = (state.validity || []).concat(transaction.validity);
            }
        });
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
}
