import { HierarchicalTransaction, HierarchicalState, TransactionType, HierarchicalTransactionNode } from './transaction';
import { Injectable } from '@angular/core';
import { IgxTransactionService } from '..';

@Injectable()
export class IgxHierarchicalTransactionService<T extends HierarchicalTransaction, S extends HierarchicalState>
    extends IgxTransactionService<T, S> {

    private _hierarchicalTransactionNodes: Map<any, HierarchicalTransactionNode> = new Map();

    public aggregatedState(mergeChanges: boolean): T[] {
        const result: T[] = [];
        this._states.forEach((state: S, key: any) => {
            const value = mergeChanges ? this.mergeValues(state.recordRef, state.value) : state.value;
            this.clearArraysFromObject(value);
            result.push({ id: key, parentId: state.parentId, newValue: value, type: state.type } as T);
        });
        return result;
    }

    public addHierarchicalTransactionNode(id: any, parentId?: any) {
        if (!this._hierarchicalTransactionNodes.has(id)) {
            const node = { id: id, childNodes: [], parentId: parentId };
            this.updateHierarchy(node);
            this._hierarchicalTransactionNodes.set(id, node);
        }
    }

    public getHierarchicalTransactionNode(id: any): HierarchicalTransactionNode {
        return this._hierarchicalTransactionNodes.get(id);
    }

    protected updateState(states: Map<any, S>, transaction: T, recordRef?: any): void {
        super.updateState(states, transaction, recordRef);
        const currentState = states.get(transaction.id);
        if (currentState && transaction.type === TransactionType.ADD) {
            currentState.parentId = transaction.parentId;
        }
        if (transaction.type === TransactionType.DELETE) {
            this.clearStateForDeletedItems(this._hierarchicalTransactionNodes.get(transaction.id));
        }
    }

    private updateHierarchy(node: HierarchicalTransactionNode) {
        this._hierarchicalTransactionNodes.forEach((currentNode: HierarchicalTransactionNode, id: any) => {
            if (currentNode.id === node.parentId) {
                currentNode.childNodes.push(node);
            }

            if (currentNode.parentId === node.id) {
                node.childNodes.push(currentNode);
            }
        });
    }

    //  TODO: remove this method. Force cloning to strip child arrays when needed instead
    private clearArraysFromObject(obj: {}) {
        for (const prop of Object.keys(obj)) {
            if (Array.isArray(obj[prop])) {
                delete obj[prop];
            }
        }
    }

    private clearStateForDeletedItems(node: HierarchicalTransactionNode) {
        if (!node) {
            return;
        }
        for (const childNode of node.childNodes) {
            if (this._states.get(childNode.id)) {
                this._states.delete(childNode.id);
                this.clearStateForDeletedItems(childNode);
            }
        }
    }
}
