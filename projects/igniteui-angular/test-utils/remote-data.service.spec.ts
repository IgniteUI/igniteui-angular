import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { IForOfState } from '../directives/src/directives/for-of/for_of.directive';

/**
 * Remote data mock shared by the combo and simple-combo specs. It lives in test-utils because
 * importing a spec file that contains tests registers all of its suites in the importing file.
 */
@Injectable()
export class RemoteDataService {
    public records: Observable<any[]>;
    private _records: BehaviorSubject<any[]>;
    private dataStore: any[];
    private initialData: any[];

    constructor() {
        this.dataStore = [];
        this._records = new BehaviorSubject([]);
        this.records = this._records.asObservable();
        this.initialData = this.generateInitialData(0, 1000);
    }

    public getData(data?: IForOfState, cb?: (any) => void): any {
        const size = data.chunkSize === 0 ? 10 : data.chunkSize;
        this.dataStore = this.generateData(data.startIndex, data.startIndex + size);
        this._records.next(this.dataStore);
        const count = 1000;
        if (cb) {
            cb(count);
        }
    }

    public generateData(start, end) {
        return this.initialData.slice(start, end);
    }

    public generateInitialData(start, end) {
        const data = [];
        for (let i = start; i < end; i++) {
            data.push({ id: i, product: 'Product ' + i });
        }
        return data;
    }
}
