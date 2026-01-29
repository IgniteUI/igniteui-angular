import { Transaction, State, TransactionType, StateUpdateEvent, TransactionEventOrigin } from 'igniteui-angular/core';
import { EventEmitter } from '@angular/core';
export { Transaction, State, TransactionType, TransactionEventOrigin, StateUpdateEvent };

export class TransactionsWrapper {

    constructor(
        private getInstance: () => any,
        private runInZone: (func: () => any) => any
    ){}

    private get service() {
        return this.getInstance()?.transactions;
    }

    // properties

    public get canUndo(): boolean {
        return this.service?.canUndo ?? false;
    }

    public get canRedo(): boolean {
        return this.service?.canRedo ?? false;
    }

    public get enabled(): boolean {
        return this.service?.enabled ?? false;
    }

    // methods

    public undo(): void{
        this.runInZone(() => this.service?.undo());
    }

    public redo(): void{
        this.runInZone(() => this.service?.redo());
    }

    public commit(data?: any[], id?: any): void{
        const instance = this.getInstance();
        this.runInZone(() => this.service?.commit(data ? data : instance?.data, id));
    }

    public clear(id?: any): void{
        this.runInZone(() => this.service?.clear(id));
    }

    public add(transaction: Transaction, recordRef?: any): void{
        this.runInZone(() => this.service?.add(transaction, recordRef));
    }

    public getTransactionLog(id?: any): Transaction[] {
        return this.service?.getTransactionLog(id) ?? [];
    }

    public getAggregatedChanges(mergeChanges: boolean): Transaction[] {
        return this.service?.getAggregatedChanges(mergeChanges) ?? [];
    }

    public getState(id: any, pending?: boolean): State | null {
        return this.service?.getState(id, pending) ?? null;
    }

    public getAggregatedValue(id: any, mergeChanges: boolean): any {
        return this.service?.getAggregatedValue(id, mergeChanges);
    }

    public startPending(): void {
        this.runInZone(() => this.service?.startPending());
    }

    public endPending(commit: boolean): void {
        this.runInZone(() => this.service?.endPending(commit));
    }

    public get onStateUpdate(): EventEmitter<StateUpdateEvent> | undefined {
        return this.service?.onStateUpdate;
    }

}
