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
        return this._isPending;
    }

    /**
     * @inheritdoc
     */
    public onStateUpdate = new EventEmitter<StateUpdateEvent>();

    protected _isPending = false;
    protected _pendingTransactions: T[] = [];
    protected _pendingStates: Map<any, S> = new Map();

    protected _validationTransactions: T[] = [];
    protected _validationStates: Map<any, S> = new Map();

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

    public addValidation(transaction: T, recordRef?: any): void {
        this.updateValidationState(this._validationStates, transaction, recordRef);
        this._validationTransactions.push(transaction);
    }

    public updateValidationState(states: Map<any, S>, transaction: T, recordRef?: any): void {
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
    * @inheritdoc
    */
    public getAggregatedValidationChanges(mergeChanges: boolean): T[] {
        const result: T[] = [];
        this._validationStates.forEach((state: S, key: any) => {
            const value = mergeChanges ? this.getAggregatedValue(key, mergeChanges) : state.value;
            result.push({ id: key, newValue: value, type: state.type, validity: state.validity } as T);
        });
        return result;
    }

        /**
        * @inheritdoc
        */
         public getAggregatedValidation(id: any): any {
            const state = this._validationStates.get(id);
            if (!state) {
                return null;
            }
            return state;
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
        let pending = [...this._validationTransactions];
        if (id !== undefined) {
            pending = pending.filter(t => t.id === id);
        }
        return pending.filter(x => x.validity.some(y => y.valid === false));
    }

    /**
     * @inheritdoc
     */
    public clear(id?: any): void {
        this._pendingStates.clear();
        this._pendingTransactions = [];
        if (id !== undefined) {
            this._validationTransactions = this._validationTransactions.filter(t => t.id !== id);
            this._validationStates.delete(id);
        } else {
            this._validationStates.clear();
            this._validationTransactions = [];
        }
 
    }

    /**
     * @inheritdoc
     */
    public startPending(): void {
        this._isPending = true;
    }

    /**
     * @inheritdoc
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
    }

    /**
     * Updates the validity state after update.
     *
     * @param state State to update value for
     * @param transaction The transaction based on which to update.
     */
    protected updateValidity(state, transaction) {
        // update validity
        if (transaction.validity) {
            transaction.validity.forEach(validity => {
                const existingState = state.validity?.find(x => x.field === validity.field);
                if (existingState) {
                    existingState.valid = validity.valid;
                    existingState.formGroup = validity.formGroup;
                } else {
                    if (!state.validity) {
                        state.validity = [];
                    }
                    state.validity.push(validity);
                }
            });
        }
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
