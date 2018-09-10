import { ITransactionService, ITransaction, IState } from './utilities';

export class NoOpTransactionService implements ITransactionService {
    public add(transaction: ITransaction) {
    }

    getLastTransactionById(id: any): ITransaction {
        return null;
    }
    getTransactionLog(): ITransaction[] {
        return [];
    }

    undo() { }

    redo() { }

    aggregatedState(): Map<any, IState> {
        return new Map();
    }

    commit(data: any) { }

    clear() { }
}
