import { ITransactionService, ITransaction, IState } from './utilities';

export class NoOpTransactionService implements ITransactionService {
    add(transaction: ITransaction, recordRef?: any): boolean {
        return false;
    }

    getTransactionLog(id?: any): ITransaction[] | ITransaction {
        return null;
    }

    undo() { }

    redo() { }

    aggregatedState(): Map<any, IState> {
        return null;
    }

    commit(data: any) { }

    clear() { }
}
