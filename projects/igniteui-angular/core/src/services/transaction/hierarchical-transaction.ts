import { TransactionService, HierarchicalState, HierarchicalTransaction } from './transaction';

export interface HierarchicalTransactionService<T extends HierarchicalTransaction, S extends HierarchicalState>
    extends TransactionService<T, S> {
    /**
     * Applies all transactions over the provided data
     *
     * @param data Data source to update
     * @param id Optional record id to commit transactions for
     */
    commit(data: any[], id?: any): void;
    /**
     * Applies all transactions over the provided data
     *
     * @param data Data source to update
     * @param primaryKey Primary key of the hierarchical data
     * @param childDataKey Key of child data collection
     * @param id Optional record id to commit transactions for
     */
    commit(data: any[], primaryKey: any, childDataKey: any, id?: any): void;
}
