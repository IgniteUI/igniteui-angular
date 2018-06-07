import { Injectable, Input } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IDataState } from '../data-operations/data-state.interface';
import { SortingDirection } from '../data-operations/sorting-expression.interface';

// @Injectable()
export class LocalServiceBase {
    public records: Observable<any[]>;
    // @Input()
    public url: string;
    // private url = 'http://services.odata.org/V4/Northwind/Northwind.svc/';
    private _records: BehaviorSubject<any[]>;
    private dataStore: any[];

    constructor(private http) {
        this.dataStore = [];
        this._records = new BehaviorSubject([]);
        this.records = this._records.asObservable();
    }

    public getData() {
        return this.http.get(this.url).pipe(
            map((response) => (response as Response).json()))
            .subscribe((data) => {
                this.dataStore = data.value;
                this._records.next(this.dataStore);
            });
    }

}

// @Injectable()
export class LocalNorthWindService extends LocalServiceBase {
    url = 'http://services.odata.org/V4/Northwind/Northwind.svc/';
}

// @Injectable()
export class LocalNWindProductsService extends LocalServiceBase {

    // constructor(http) {
    //     super(http);
    url = 'http://services.odata.org/V4/Northwind/Northwind.svc/Alphabetical_list_of_products';
    // }
}
