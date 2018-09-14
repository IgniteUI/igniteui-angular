import { ITransactionService, ITransaction, IState } from './utilities';

export class NoOpTransactionService implements ITransactionService {
    public add(transaction: ITransaction) {
        return false;
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
        return null;
    }

    commit(data: any) { }

    clear() { }
}
