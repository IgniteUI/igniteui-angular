import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { FinancialData } from './financialData';

@Injectable()
export class LocalService {
    records: Observable<any[]>;
    url: string;
    _records: BehaviorSubject<any[]>;
    dataStore: any[];

    constructor(private http: HttpClient) {
        this.dataStore = [];
        this._records = new BehaviorSubject([]);
        this.records = this._records.asObservable();
    }

    getData() {
        return this.http.get(this.url).subscribe(data => {
            this.dataStore = data['value'];
            this._records.next(this.dataStore);
        });
    }

    getFinancialData(count: number = 10) {
        const financialData: FinancialData = new FinancialData();
        this._records.next(financialData.generateData(count));
    }
}
