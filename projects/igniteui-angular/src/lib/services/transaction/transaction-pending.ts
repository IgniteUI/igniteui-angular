import { ITransactionService, ITransaction, IState, TransactionType } from './utilities';
import { IgxTransactionBaseService } from './transaction-base';

export class IgxPendingTransactionService extends IgxTransactionBaseService {
    private _pendingTransactions: ITransaction[] = [];

    public addPending(transaction: ITransaction, recordRef?: any) {
        this.updateCurrentState(transaction, recordRef);
        this._pendingTransactions.push(transaction);
        return true;
    }

    public getPending(rowId): IState {
        return this.aggregatedState().get(rowId);
    }

    public resetPending(rowID) {
        this.removeTransactionFromCurrentState(rowID);
        this._pendingTransactions = [];
    }

    public removeTransactionFromCurrentState(rowID) {
        this._states.delete(rowID);
    }
}
