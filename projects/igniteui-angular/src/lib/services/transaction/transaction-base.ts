import { ITransaction, IState, TransactionType } from './utilities';
import { IgxNoOpTransactionService } from './noop-transaction';

export class IgxTransactionBaseService extends IgxNoOpTransactionService {
    private _transactions: ITransaction[] = [];
    private _redoStack: { transaction: ITransaction, recordRef: any }[] = [];
    private _undoStack: { transaction: ITransaction, recordRef: any }[] = [];
    private _states: Map<any, IState> = new Map();

    public add(transaction: ITransaction, recordRef?: any) {
        const states = this._isPending ? this._pendingStates : this._states;
        this.verifyAddedTransaction(states, transaction, recordRef);
        this.updateState(states, transaction, recordRef);

        const transactions = this._isPending ? this._pendingTransactions : this._transactions;
        transactions.push(transaction);

        if (!this._isPending) {
            this._undoStack.push({ transaction, recordRef });
            this._redoStack = [];
        }

        return true;
    }

    public getTransactionLog(id?: any): ITransaction[] | ITransaction {
        if (id) {
            return [...this._transactions].reverse().find(t => t.id === id);
        }
        return [...this._transactions];
    }

    public aggregatedState(): Map<any, IState> {
        return new Map(this._states);
    }

    public hasState(id: any): boolean {
        if (id !== undefined) {
            return this._states.has(id) || super.hasState(id);
        }
        return false;
    }

    public hasTransactions(): boolean {
        return true;
    }

    public getAggregatedValue(id: any, mergeChanges = true) {
        //  if we pending changes for this id get the state from pendingStates
        const state = this._pendingStates.get(id) || this._states.get(id);
        if (!state) {
            return null;
        }
        if (!mergeChanges) {
            return state.value;
        }
        //  if we have state update its recordRef and return the result
        return this.updateValue(state);
    }

    public commit(data: any[]) {
        this._states.forEach((s: IState) => {
            const index = data.findIndex(i => JSON.stringify(i) === JSON.stringify(s.recordRef));
            switch (s.type) {
                case TransactionType.ADD:
                    data.push(s.value);
                    break;
                case TransactionType.DELETE:
                    if (0 <= index && index < data.length) {
                        data.splice(index, 1);
                    }
                    //  TODO: should we throw here if there is no such item in the data
                    break;
                case TransactionType.UPDATE:
                    if (0 <= index && index < data.length) {
                        data[index] = this.updateValue(s);
                    }
                    break;
            }
        });
    }

    public clear() {
        this._transactions = [];
        this._states = new Map();
        this._redoStack = [];
        this._undoStack = [];
    }

    public undo() {
        if (this._transactions.length <= 0) {
            return;
        }
        this._transactions.pop();
        const action: { transaction: ITransaction, recordRef: any } = this._undoStack.pop();
        this._redoStack.push(action);
        this._states.clear();
        this._undoStack.map(a => this.updateState(this._states, a.transaction, a.recordRef));
    }

    public redo() {
        if (this._redoStack.length > 0) {
            const undoItem = this._redoStack.pop();
            this.updateState(this._states, undoItem.transaction, undoItem.recordRef);
            this._transactions.push(undoItem.transaction);
            this._undoStack.push(undoItem);
        }
    }

    /**
     * Verifies if the passed transaction is correct. If not throws an exception.
     * @param transaction Transaction to be verified
     */
    protected verifyAddedTransaction(states: Map<any, IState>, transaction: ITransaction, recordRef?: any): void {
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
                    //  cannot initially transaction or delete item with no recordRef
                    throw new Error(`Cannot add this transaction. This is first transaction of type ${transaction.type} ` +
                        `for id ${transaction.id}. For first transaction of this type recordRef is mandatory.`);
                }
                break;
        }
    }

    /**
     * Updates the current state according to passed transaction and recordRef
     * @param transaction Transaction to apply to the current state
     * @param recordRef Reference to the value of the record in data source, if any, where transaction should be applied
     */
    protected updateState(states: Map<any, IState>, transaction: ITransaction, recordRef?: any): void {
        const state = states.get(transaction.id);
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
        switch (transaction.type) {
            case TransactionType.DELETE:
                if (state && state.type === TransactionType.ADD) {
                    states.delete(transaction.id);
                    return;
                } else if (state && state.type === TransactionType.UPDATE) {
                    state.value = transaction.newValue;
                    state.type = TransactionType.DELETE;
                    return;
                }
                break;
            case TransactionType.UPDATE:
                if (state) {
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
                    if (state.type === TransactionType.DELETE) {
                        state.type = TransactionType.UPDATE;
                    }
                    return;
                }
        }

        states.set(transaction.id, { value: this.copyValue(transaction.newValue), recordRef: recordRef, type: transaction.type });
    }
}
