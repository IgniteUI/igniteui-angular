import { HierarchicalTransaction, HierarchicalState, TransactionType } from './transaction';
import { Injectable } from '@angular/core';
import { IgxTransactionService } from './igx-transaction';

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
        const currentState = states.get(transaction.id);
        if (currentState) {
            currentState.path = transaction.path;
        }

        if (currentState.type === TransactionType.DELETE) {
            states.forEach((v: S, k: any) => {
                if (v.path.indexOf(transaction.id) !== -1) {
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

    //  TODO: remove this method. Force cloning to strip child arrays when needed instead
    private clearArraysFromObject(obj: {}) {
        for (const prop of Object.keys(obj)) {
            if (Array.isArray(obj[prop])) {
                delete obj[prop];
            }
        }
    }
}
