import { IgxTransactionService, ITransaction, IState } from './utilities';

export class IgxNoOpTransactionService implements IgxTransactionService {
    add(transaction: ITransaction, recordRef?: any): boolean { return false; }

    getTransactionLog(id?: any): ITransaction[] | ITransaction { return null; }

    undo() { }

    redo() { }

    aggregatedState(): Map<any, IState> { return null; }

    commit(data: any) { }

    clear() { }
}
