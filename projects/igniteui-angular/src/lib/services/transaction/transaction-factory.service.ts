import { Injectable } from '@angular/core';
import { IgxBaseTransactionService } from './base-transaction';
import { HierarchicalTransactionService } from './hierarchical-transaction';
import { IgxHierarchicalTransactionService } from './igx-hierarchical-transaction';
import { IgxTransactionService } from './igx-transaction';
import { HierarchicalState, HierarchicalTransaction, State, Transaction, TransactionService } from './transaction';

export const enum IGX_TRANSACTION_TYPE {
    'None' = 'None',
    'Base' = 'Base',
    'Hierarchical' = 'TreeGrid',
    'HierarchicalGrid' = 'HierarchicalGrid'
}

@Injectable({
    providedIn: 'root'
})
export class IgxTransactionFactoryService {

    public create(type: IGX_TRANSACTION_TYPE): TransactionService<Transaction, State> {
        switch (type) {
            case (IGX_TRANSACTION_TYPE.Base):
            case (IGX_TRANSACTION_TYPE.Hierarchical):
                return new IgxTransactionService() as unknown as TransactionService<Transaction, State>;
            case (IGX_TRANSACTION_TYPE.Hierarchical):
return new IgxHierarchicalTransactionService() as unknown as HierarchicalTransactionService<HierarchicalTransaction, HierarchicalState>;
            default:
                return new IgxBaseTransactionService() as unknown as TransactionService<Transaction, State>;
        }
    }
}
