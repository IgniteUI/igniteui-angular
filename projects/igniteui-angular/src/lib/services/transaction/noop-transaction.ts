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

    currentState(): Map<any, IState> {
        return new Map();
    }

    update(data: any) { }

    reset() { }
}
