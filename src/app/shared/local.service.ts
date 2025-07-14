import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { FinancialData } from './financialData';

@Injectable()
export class LocalService {
    private http = inject(HttpClient);

    public records: Observable<any[]>;
    public url: string;
    public dataStore: any[];

    private _records: BehaviorSubject<any[]>;

    constructor() {
        this.dataStore = [];
        this._records = new BehaviorSubject([]);
        this.records = this._records.asObservable();
    }

    public getData() {
        return this.http.get(this.url).subscribe(data => {
            this.dataStore = data['value'];
            this._records.next(this.dataStore);
        });
    }

    public getFinancialData(count = 10) {
        this._records.next(FinancialData.generateData(count));
    }

    public updateAllPriceValues(data) {
        const newData = FinancialData.updateAllPrices(data);
        this._records.next(newData);
    }

    public updateRandomPriceValues(data) {
        const newData = FinancialData.updateRandomPrices(data);
        this._records.next(newData);
    }
}
