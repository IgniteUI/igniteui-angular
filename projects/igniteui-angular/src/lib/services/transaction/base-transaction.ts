import { TransactionService, Transaction, State } from './utilities';

export class IgxBaseTransactionService implements TransactionService {
    protected _isPending = false;
    protected _pendingTransactions: Transaction[] = [];
    protected _pendingStates: Map<any, State> = new Map();

    public add(transaction: Transaction, recordRef?: any): boolean {
        if (this._isPending) {
            this.updateState(this._pendingStates, transaction, recordRef);
            this._pendingTransactions.push(transaction);
            return true;
        }
        return false;
    }

    getTransactionLog(id?: any): Transaction[] | Transaction { return []; }

    undo(): void { }

    redo(): void { }

    aggregatedState(mergeChanges: boolean): Transaction[] { return []; }

    public getState(id: any): State {
        if (id !== undefined && this._pendingStates.has(id)) {
            return this._pendingStates.get(id);
        }

        return null;
    }

    public transactionsEnabled(): boolean {
        return this._isPending;
    }

    public getAggregatedValue(id: any, mergeChanges: boolean): any {
        const state = this._pendingStates.get(id);
        if (!state) {
            return {};
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
        this.clear();
    }


    /**
     * Updates the current state according to passed transaction and recordRef
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
