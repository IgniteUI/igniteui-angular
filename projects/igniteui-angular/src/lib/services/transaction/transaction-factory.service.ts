import { Injectable } from '@angular/core';
import { IgxBaseTransactionService } from './base-transaction';
import { IgxHierarchicalTransactionService } from './igx-hierarchical-transaction';
import { IgxTransactionService } from './igx-transaction';
import { State, Transaction, TransactionService } from './transaction';

export const enum IGX_GRID_TYPE {
    'None' = 'None',
    'Base' = 'Base',
    'Hierarchical' = 'Hierarchical',
}

@Injectable({
    providedIn: 'root'
})
export class IgxGridTransactionFactory {

    public create(type: IGX_GRID_TYPE): TransactionService<Transaction, State> {
        switch (type) {
            case (IGX_GRID_TYPE.Base):
                return new IgxTransactionService();
            case (IGX_GRID_TYPE.Hierarchical):
                return new IgxHierarchicalTransactionService();
            default:
                return new IgxBaseTransactionService();
        }
    }
}
