import { ITransactionService, ITransaction, IState, TransactionType } from './utilities';

export class IgxTransactionBaseService implements ITransactionService {
    private _transactions: ITransaction[] = [];
    private _redoStack: { transaction: ITransaction, originalValue: any }[] = [];
    private _states: Map<any, IState> = new Map();

    public add(transaction: ITransaction, originalValue?: any) {
        this.verifyAddedChange(transaction, originalValue);
        this.updateCurrentState(transaction, originalValue);
        this._transactions.push(transaction);
        this._redoStack = [];
    }

    public getLastTransactionById(id: string): ITransaction {
        return [...this._transactions].reverse().find(t => t.id === id);
    }

    public getTransactionLog(): ITransaction[] {
        return [...this._transactions];
    }

    public currentState(): Map<any, IState> {
        return new Map(this._states);
    }

    public update(data: any[]) {
        this._states.forEach(s => {
            switch (s.type) {
                case TransactionType.ADD:
                    data.push(s.value);
                    break;
                case TransactionType.DELETE:
                    const index = data.findIndex(i => i === s.originalValue);
                    if (0 <= index && index < data.length) {
                        data.splice(index, 1);
                    }
                    //  TODO: should we throw here if there is no such item in the data
                    break;
                case TransactionType.UPDATE:
                    this.updateValue(s, data);
                    break;
            }
        });
    }

    public reset() {
        this._transactions = [];
        this._states = new Map();
        this._redoStack = [];
    }

    public undo() {
        if (this._transactions.length > 0) {
            const transaction: ITransaction = this._transactions.pop();
            const state = this._states.get(transaction.id);
            const originalValue = state ? state.originalValue : undefined;

            this._redoStack.push({ transaction, originalValue });
            const currentlyLastChange = [...this._transactions].reverse().find(c => c.id === transaction.id);
            if (currentlyLastChange) {
                this.updateCurrentState(currentlyLastChange, originalValue);
            } else {
                this._states.delete(transaction.id);
            }
        }
    }

    public redo() {
        if (this._redoStack.length > 0) {
            const undone = this._redoStack.pop();
            this.updateCurrentState(undone.transaction, undone.originalValue);
            this._transactions.push(undone.transaction);
        }
    }

    /**
     * Verifies if the passed @param change is correct. If not throws an exception.
     * @param transaction Change to be verified
     */
    private verifyAddedChange(transaction: ITransaction, originalValue?: any): void {
        const state = this._states.get(transaction.id);
        switch (transaction.type) {
            case TransactionType.ADD:
                if (state) {
                    //  cannot add same item twice
                    throw new Error(`Cannot add this change. Change with id: ${transaction.id} has been already added.`);
                }
                break;
            case TransactionType.DELETE:
            case TransactionType.UPDATE:
                if (state && state.type === TransactionType.DELETE) {
                    //  cannot delete or update deleted items
                    throw new Error(`Cannot add this change. Change with id: ${transaction.id} has been already deleted.`);
                }
                if (!state && !originalValue) {
                    //  cannot initially change or delete item with no original value
                    throw new Error(`Cannot add this change. This is first change of type ${transaction.type} for id ${transaction.id}.
                     For first change of this type original value is mandatory.`);
                }
                break;
        }
    }

    /**
     * Updates the current state according to passed @param change and @param originalValue
     * @param transaction Change to apply to the current state
     * @param originalValue Original value, if any, of the record change is applied to
     */
    private updateCurrentState(transaction: ITransaction, originalValue?: any): void {
        const state = this._states.get(transaction.id);
        //  if ChangeType is ADD simply add change to _states;
        //  if ChangeType is DELETE:
        //    - if there is state with this id of type ADD remove it from the _states;
        //    - if there is state with this id of type UPDATE change its type to DELETE;
        //    - if there is no state with this id add change to _states;
        //  if ChangeType is UPDATE:
        //    - if there is state with this id set state value to the change value;
        //    - if there is state with this id and state type is DELETE change its type to UPDATE
        //    - if there is no state with this id add change to _states;
        switch (transaction.type) {
            case TransactionType.DELETE:
                if (state && state.type === TransactionType.ADD) {
                    this._states.delete(transaction.id);
                    return;
                } else if (state && state.type === TransactionType.UPDATE) {
                    state.value = transaction.newValue;
                    state.type = TransactionType.DELETE;
                    return;
                }
                break;
            case TransactionType.UPDATE:
                if (state) {
                    state.value = transaction.newValue;
                    if (state.type === TransactionType.DELETE) {
                        state.type = TransactionType.UPDATE;
                    }
                    return;
                }
        }

        this._states.set(transaction.id, { value: transaction.newValue, originalValue: originalValue, type: transaction.type });
    }

    /**
     * Updates the value in @param data. Accepts primitive and object value types
     * @param state State to update value for
     * @param data Data source where update should be applied
     */
    private updateValue(state: IState, data: any[]) {
        if (typeof state.originalValue === 'object') {
            Object.assign(state.originalValue, state.value);
        } else {
            const index = data.indexOf(i => i === state.originalValue);
            if (0 <= index && index < data.length) {
                data[index] = state.value;
            }
            //  TODO: should we throw here if there is no such item in the data
        }
    }
}
