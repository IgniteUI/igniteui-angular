import { Injectable, inject } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class RemoteService {
    private http = inject(HttpClient);

    public remotePagingData: BehaviorSubject<any[]>;
    public urlPaging = 'https://www.igniteui.com/api/products';
    public totalCount: Observable<number>;
    public remoteData: Observable<any[]>;
    public url = `https://services.odata.org/V4/Northwind/Northwind.svc/Products`;
    public urlBuilder;

    private _remoteData: BehaviorSubject<any[]>;
    private _totalCount: BehaviorSubject<number>;

    constructor() {
        this._remoteData = new BehaviorSubject([]);
        this.remoteData = this._remoteData.asObservable();
        this._totalCount = new BehaviorSubject(null);
        this.totalCount = this._totalCount.asObservable();
        this.remotePagingData = new BehaviorSubject([]);
    }

    public nullData() {
        this._remoteData.next(null);
    }

    public undefinedData() {
        this._remoteData.next(undefined);
    }

    public getData(data?: any, cb?: (any) => void) {
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

    public getOrdersData(url: string, data?: any, cb?: (any) => void) {
        return this.http.get(url).pipe(
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

    public buildUrl(dataState: any) {
        return this.urlBuilder(dataState);
    }

    // Remote paging
    public getPagingData(index?: number, perPage?: number): any {
        let qS = '';

        if (perPage) {
            qS = `?$skip=${index}&$top=${perPage}&$count=true`;
        }

        this.http
            .get(`${this.urlPaging + qS}`).pipe(
                map((data: any) => data)
            ).subscribe((data) => this.remotePagingData.next(data));
    }

    public getPagingDataLength(): any {
        return this.http.get(this.urlPaging).pipe(
            map((data: any) => data.length)
        );
    }
}
