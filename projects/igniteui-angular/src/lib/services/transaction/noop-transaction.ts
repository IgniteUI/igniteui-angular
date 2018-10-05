import { IgxTransactionService, ITransaction, IState } from './utilities';

export class IgxNoOpTransactionService implements IgxTransactionService {
    protected _isPending = false;
    protected _pendingTransactions: ITransaction[] = [];
    protected _pendingStates: Map<any, IState> = new Map();

    public add(transaction: ITransaction, recordRef?: any) {
        if (this._isPending) {
            this.updateState(this._pendingStates, transaction, recordRef);
            this._pendingTransactions.push(transaction);
        }

        return true;
    }

    getTransactionLog(id?: any): ITransaction[] | ITransaction { return null; }

    undo() { }

    redo() { }

    aggregatedState(): Map<any, IState> { return null; }

    public hasState(id?: any): boolean {
        if (id !== undefined) {
            return this._pendingStates.has(id);
        }
        return this._pendingStates.size > 0;
    }

    public getAggregatedValue(id: any, mergeChanges = true) {
        const state = this._pendingStates.get(id);
        if (!state) {
            return null;
        }
        if (mergeChanges) {
            return this.updateValue(state);
        }
        return state.value;
    }

    commit(data: any) { }

    clear() { }

    public startPending(): void {
        this._isPending = true;
    }

    public endPending(commit: boolean): void {
        this._isPending = false;
        if (commit) {
            this._pendingStates.forEach((s: IState, k: any) => {
                this.add({ id: k, newValue: s.value, type: s.type }, s.recordRef);
            });
        }
        this._pendingStates.clear();
        this._pendingTransactions = [];
    }


    /**
     * Updates the current state according to passed transaction and recordRef
     * @param transaction Transaction to apply to the current state
     * @param recordRef Reference to the value of the record in data source, if any, where transaction should be applied
     */
    protected updateState(states: Map<any, IState>, transaction: ITransaction, recordRef?: any): void {
        const state = states.get(transaction.id);
        if (state) {
            if (typeof state.value === 'object') {
                Object.assign(state.value, transaction.newValue);
            } else {
                state.value = transaction.newValue;
            }
            return;
        }
        states.set(transaction.id, { value: this.copyValue(transaction.newValue), recordRef: recordRef, type: transaction.type });
    }

    /**
     * Updates the recordRef of the provided state with all the changes in the state. Accepts primitive and object value types
     * @param state State to update value for
     * @returns updated value including all the changes in provided state
     */
    protected updateValue(state: IState) {
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
