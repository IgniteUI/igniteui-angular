import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class RemoteService {

    totalCount: Observable<number>;
    _totalCount: BehaviorSubject<number>;
    remoteData: Observable<any[]>;
    _remoteData: BehaviorSubject<any[]>;
    url = `https://services.odata.org/V4/Northwind/Northwind.svc/Products`;
    urlBuilder;

    constructor(private http: HttpClient) {
        this._remoteData = new BehaviorSubject([]);
        this.remoteData = this._remoteData.asObservable();
        this._totalCount = new BehaviorSubject(null);
        this.totalCount = this._totalCount.asObservable();
    }

    nullData() {
        this._remoteData.next(null);
    }

    undefinedData() {
        this._remoteData.next(undefined);
    }

    getData(data?: any, cb?: (any) => void) {
        const dataState = data;
        return this.http.get(this.buildUrl(dataState)).pipe(
            map(response => response),
        )
        .subscribe(d => {
            this._remoteData.next(d['value']);
            this._totalCount.next(d['@odata.count']);
            if (cb) {
                cb(d);
            }
        });
    }

    buildUrl(dataState: any) {
        return this.urlBuilder(dataState);
    }
}
