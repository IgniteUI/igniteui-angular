import { Injectable } from '@angular/core';
import { IgxBaseTransactionService } from './base-transaction';
import { IgxHierarchicalTransactionService } from './igx-hierarchical-transaction';
import { IgxTransactionService } from './igx-transaction';
import { State, Transaction, TransactionService } from './transaction';

export const enum TRANSACTION_TYPE {
    'None' = 'None',
    'Base' = 'Base',
    'Hierarchical' = 'Hierarchical',
}

@Injectable({
    providedIn: 'root'
})
export class IgxGridTransactionFactory {

    public create<T extends Transaction, S extends State>(type: TRANSACTION_TYPE): TransactionService<T, S> {
        switch (type) {
            case (TRANSACTION_TYPE.Base):
                return new IgxTransactionService();
            case (TRANSACTION_TYPE.Hierarchical):
                return new IgxHierarchicalTransactionService() as any;
            default:
                return new IgxBaseTransactionService();
        }
    }
}
