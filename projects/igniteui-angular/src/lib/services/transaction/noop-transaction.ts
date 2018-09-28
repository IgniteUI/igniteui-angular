import { IgxTransactionService, ITransaction, IState } from './utilities';

export class IgxNoOpTransactionService implements IgxTransactionService {
    add(transaction: ITransaction, recordRef?: any): boolean { return false; }

    getTransactionLog(id?: any): ITransaction[] | ITransaction { return null; }

    undo() { }

    redo() { }

    aggregatedState(): Map<any, IState> { return null; }

    hasState(id: any): boolean { return false; }

    getAggregatedValue(id: any) { return null; }

    commit(data: any) { }

    clear() { }

    startPending(): void { }

    endPending(commit: boolean): void { }
}
