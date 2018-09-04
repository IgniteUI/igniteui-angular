import { ITransaction, IChange, IState, ChangeType } from './utilities';

export class IgxTransactionBaseService implements ITransaction {
    private _changes: IChange[] = [];
    private _undone: IChange[] = [];
    private _states: Map<any, IState> = new Map();

    constructor() {
    }

    public add(change: IChange, originalValue?: any) {
        this.verifyAddedChange(change, originalValue);
        this.updateCurrentState(change, originalValue);
        this._changes.push(change);
        this._undone = [];
    }

    public get(id: string): IChange {
        return [...this._changes].reverse().find(t => t.id === id);
    }

    public getAll(): IChange[] {
        return [...this._changes];
    }

    public currentState(): Map<any, IState> {
        return new Map(this._states);
    }

    public update(data: any[]) {
        this._states.forEach(s => {
            switch (s.type) {
                case ChangeType.ADD:
                    data.push(s.value);
                    break;
                case ChangeType.DELETE:
                    const index = data.indexOf(i => i === s.originalValue);
                    if (0 <= index && index < data.length) {
                        data.splice(index, 1);
                    }
                    //  TODO: should we throw here if there is no such item in the data
                    break;
                case ChangeType.UPDATE:
                    this.updateValue(s, data);
                    break;
            }
        });
    }

    public reset() {
        this._changes = [];
    }

    public undo() {
        if (this._changes.length > 0) {
            const change: IChange = this._changes.pop();
            this._undone.push(change);
            const currentlyLastChange = [...this._changes].reverse().find(c => c.id === change.id);
            const state = this._states.get(currentlyLastChange.id);
            if (currentlyLastChange) {
                this.updateCurrentState(currentlyLastChange, state.originalValue);
            } else {
                if (state) {
                    this._states.delete(change.id);
                }
            }
        }
    }

    public redo() {
        if (this._undone.length > 0) {
            this._changes.push(this._undone.pop());
        }
    }

    /**
     * Verifies if the passed @param change is correct. If not throws an exception.
     * @param change Change to be verified
     */
    private verifyAddedChange(change: IChange, originalValue?: any): void {
        const state = this._states.get(change.id);
        switch (change.type) {
            case ChangeType.ADD:
                if (state) {
                    //  cannot add same item twice
                    throw new Error(`Cannot add this change. Change with id: ${change.id} has been already added.`);
                }
                break;
            case ChangeType.DELETE:
            case ChangeType.UPDATE:
                if (state && state.type === ChangeType.DELETE) {
                    //  cannot delete or update deleted items
                    throw new Error(`Cannot add this change. Change with id: ${change.id} has been already deleted.`);
                }
                if (!state && !originalValue) {
                    //  cannot initially change or delete item with no original value
                    throw new Error(`Cannot add this change. This is first change of type ${change.type} for id ${change.id}.
                     For first change of this type original value is mandatory.`);
                }
                break;
        }
    }

    /**
     * Updates the current state according to passed @param change and @param originalValue
     * @param change Change to apply to the current state
     * @param originalValue Original value, if any, of the record change is applied to
     */
    private updateCurrentState(change: IChange, originalValue?: any): void {
        const state = this._states.get(change.id);
        //  if ChangeType is ADD simply add change to _states;
        //  if ChangeType is DELETE:
        //    - if there is state with this id of type ADD remove it from the _states;
        //    - if there is state with this id of type UPDATE change it type to DELETE;
        //    - if there is no state with this id add change to _states;
        //  if ChangeType is UPDATE:
        //    - if there is state with this id set state value to the change value;
        //    - if there is no state with this id add change to _states;
        switch (change.type) {
            case ChangeType.DELETE:
                if (state && state.type === ChangeType.ADD) {
                    this._states.delete(change.id);
                } else if (state && state.type === ChangeType.UPDATE) {
                    state.type = ChangeType.DELETE;
                }
                return;
            case ChangeType.UPDATE:
                if (state) {
                    state.value = change.newValue;
                }
                if (state.type === ChangeType.DELETE) {
                    state.type = ChangeType.UPDATE;
                }
                return;
        }

        this._states.set(change.id, { value: change.newValue, originalValue: originalValue, type: change.type });
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
