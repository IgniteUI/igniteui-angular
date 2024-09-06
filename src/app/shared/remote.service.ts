import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

export interface IHierarchicalEntity {
    parentEntity: string,
    childEntity: string,
    key: any
}

@Injectable()
export class RemoteService {
    public totalCount: Observable<number>;
    public remoteData: Observable<any[]>;
    public url = `https://data-northwind.indigo.design`;
    public entity: string | IHierarchicalEntity = 'Products';

    private _remoteData: BehaviorSubject<any[]>;
    private _totalCount: BehaviorSubject<number>;


    constructor(private http: HttpClient) {
        this._remoteData = new BehaviorSubject([]);
        this.remoteData = this._remoteData.asObservable();
        this._totalCount = new BehaviorSubject(null);
        this.totalCount = this._totalCount.asObservable();
    }

    public nullData() {
        this._remoteData.next(null);
    }

    public undefinedData() {
        this._remoteData.next(undefined);
    }

    public getData(start = 0, size: number = 0, orderBy: string = null, cb?: (any) => void) {
        // data-northwind works differently from the northwind odata service in that
        // it requires the page index instead of the item index (it also means it can't work without both parameters if either is provided)

        return this.http
            .get(this.buildUrl(~~(start / size), size, orderBy))
            .pipe(map(response => response),)
            .subscribe(d => {
                this._remoteData.next(d['items']);
                this._totalCount.next(d['totalRecordsCount']);
                if (cb) {
                    cb(d);
                }
            });
    }

    public buildUrl(start: number, size?: number, orderBy?: string) {
        const e = typeof this.entity === "string" ?
            `${this.entity}/GetPaged${this.entity}WithPage` :
            `${this.entity.parentEntity}/${this.entity.key}/${this.entity.childEntity}`;

        return `${this.url}/${e}?` +
            `${size ? `size=${size}&` : ''}` +
            `${start !== null ? `pageIndex=${start}` : ''}` +
            `${orderBy ? `&orderBy='${orderBy}'` : ''}`;
    }
}
