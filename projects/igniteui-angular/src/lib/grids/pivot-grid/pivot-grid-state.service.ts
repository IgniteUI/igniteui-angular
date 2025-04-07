import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class IgxPivotGridStateService {
    public currencyColumnSet: Set<string> = new Set();

    constructor() {}

    public addCurrencyColumn(columnName: string): void {
        this.currencyColumnSet.add(columnName);
    }

    public removeCurrencyColumn(columnName: string): void {
        this.currencyColumnSet.delete(columnName);
    }

    public isCurrencyColumn(columnName: string): boolean {
        return this.currencyColumnSet.has(columnName);
    }
}
