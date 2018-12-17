import { HierarchicalTransaction, HierarchicalState, TransactionType } from './transaction';
import { Injectable } from '@angular/core';
import { IgxTransactionService } from './igx-transaction';
import { DataUtil } from '../../data-operations/data-util';

/** @experimental @hidden */
@Injectable()
export class IgxHierarchicalTransactionService<T extends HierarchicalTransaction, S extends HierarchicalState>
    extends IgxTransactionService<T, S> {

    public getAggregatedChanges(mergeChanges: boolean): T[] {
        const result: T[] = [];
        this._states.forEach((state: S, key: any) => {
            const value = mergeChanges ? this.mergeValues(state.recordRef, state.value) : state.value;
            this.clearArraysFromObject(value);
            result.push({ id: key, path: state.path, newValue: value, type: state.type } as T);
        });
        return result;
    }

    protected updateState(states: Map<any, S>, transaction: T, recordRef?: any): void {
        super.updateState(states, transaction, recordRef);

        //  if transaction has no path, e.g. flat data source, get out
        if (!transaction.path) {
            return;
        }

        const currentState = states.get(transaction.id);
        if (currentState) {
            currentState.path = transaction.path;
        }

        //  if transaction has path, Hierarchical data source, and it is DELETE
        //  type transaction for all child rows remove ADD states and update
        //  transaction type and value of UPDATE states
        if (transaction.type === TransactionType.DELETE) {
            states.forEach((v: S, k: any) => {
                if (v.path && v.path.indexOf(transaction.id) !== -1) {
                    switch (v.type) {
                        case TransactionType.ADD:
                            states.delete(k);
                            break;
                        case TransactionType.UPDATE:
                            states.get(k).type = TransactionType.DELETE;
                            states.get(k).value = null;
                    }
                }
            });
        }
    }

    public commit(data: any[], primaryKey?: any, childDataKey?: any): void {
        if (childDataKey) {
            DataUtil.mergeHierarchicalTransactions(data, this.getAggregatedChanges(true), childDataKey, primaryKey, true);
        } else {
            super.commit(data);
        }
        this.clear();
    }

    //  TODO: remove this method. Force cloning to strip child arrays when needed instead
    private clearArraysFromObject(obj: {}) {
        if (obj) {
            for (const prop of Object.keys(obj)) {
                if (Array.isArray(obj[prop])) {
                    delete obj[prop];
                }
            }
        }
    }
}

