import { Injectable } from '@angular/core';
import { IDataCloneStrategy } from '../../data-operations/data-clone-strategy';
import { IgxBaseTransactionService } from './base-transaction';
import { HierarchicalTransactionService } from './hierarchical-transaction';
import { IgxHierarchicalTransactionService } from './igx-hierarchical-transaction';
import { IgxTransactionService } from './igx-transaction';
import { HierarchicalState, HierarchicalTransaction, State, Transaction, TransactionService } from './transaction';

/**
 * The type of the transaction that should be provided.
 * When batchEditing is disabled, `None` is provided.
 * When enabled - `Base` is provided.
 * An enum instead of a boolean value leaves room for extra scenarios in the future.
 */
export const enum TRANSACTION_TYPE {
    'None' = 'None',
    'Base' = 'Base'
}

/**
 * Factory service for instantiating TransactionServices
 */
@Injectable({
    providedIn: 'root'
})
export class IgxFlatTransactionFactory {

    /**
     * Creates a new Transaction service instance depending on the specified type.
     *
     * @param type The type of the transaction
     * @returns a new instance of TransactionService<Transaction, State>
     */
    public create(type: TRANSACTION_TYPE, cloneStrategy?: IDataCloneStrategy): TransactionService<Transaction, State> {
        switch (type) {
            case (TRANSACTION_TYPE.Base):
                return new IgxTransactionService(cloneStrategy);;
            default:
                return new IgxBaseTransactionService(cloneStrategy);
        }
    }
}

/**
 * Factory service for instantiating HierarchicalTransactionServices
 */
@Injectable({
    providedIn: 'root'
})
export class IgxHierarchicalTransactionFactory extends IgxFlatTransactionFactory {

    /**
     * Creates a new HierarchialTransaction service instance depending on the specified type.
     *
     * @param type The type of the transaction
     * @returns a new instance of HierarchialTransaction<HierarchialTransaction, HierarchialState>
     */
    public create(type: TRANSACTION_TYPE, cloneStrategy?: IDataCloneStrategy): HierarchicalTransactionService<HierarchicalTransaction, HierarchicalState> {
        switch (type) {
            case (TRANSACTION_TYPE.Base):
                return new IgxHierarchicalTransactionService(cloneStrategy);;
            default:
                return new IgxBaseTransactionService(cloneStrategy);
        }
    }
}
