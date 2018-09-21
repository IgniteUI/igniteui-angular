import { ITransaction, IState } from './utilities';
import { IgxTransactionBaseService } from './transaction-base';

export class IgxPendingTransactionService extends IgxTransactionBaseService {
    private _pendingTransactions: ITransaction[] = [];
    private _pendingStates: Map<any, IState> = new Map();

    public addPending(transaction: ITransaction, recordRef?: any) {
        this.updateState(this._pendingStates, transaction, recordRef);
        this._pendingTransactions.push(transaction);
        return true;
    }

    public getPendingState(rowId): IState {
        return this._pendingStates.get(rowId);
    }

    public resetPending() {
        this._pendingTransactions = [];
        this._pendingStates = new Map();
    }
}
