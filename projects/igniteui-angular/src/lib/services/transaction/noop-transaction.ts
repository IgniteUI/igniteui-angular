import { ITransaction, IChange, IState } from './utilities';

export class NoOpTransactionService implements ITransaction {
    public add(change: IChange) {
    }

    get(id: string): IChange {
        return null;
    }
    getAll(): IChange[] {
        return [];
    }

    undo() { }

    redo() { }

    currentState(): Map<any, IState> {
        return new Map();
    }

    update(data: any) { }

    reset() { }
}
