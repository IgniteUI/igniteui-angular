import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
import { BehaviorSubject, Observable } from "rxjs/Rx";
import { IDataState, SortingDirection } from "../../lib/main";

@Injectable()
export class LocalService {
    public records: Observable<any[]>;
    private url: string = "http://services.odata.org/V4/Northwind/Northwind.svc/";
    private _records: BehaviorSubject<any[]>;
    private dataStore: any[];

    constructor(private http: Http) {
        this.dataStore = [];
        this._records = new BehaviorSubject([]);
        this.records = this._records.asObservable();
    }

    public getData() {
        return this.http.get(this.url)
            .map((response) => response.json())
            .subscribe((data) => {
                this.dataStore = data.value;
                this._records.next(this.dataStore);
            });
    }

}

@Injectable()
export class RemoteService {
    public remoteData: Observable<any[]>;
    private url: string = "http://services.odata.org/V4/Northwind/Northwind.svc/Products";
    private _remoteData: BehaviorSubject<any[]>;

    constructor(private http: Http) {
        this._remoteData = new BehaviorSubject([]);
        this.remoteData = this._remoteData.asObservable();
    }

    public getData(data?: Array<any>, cb?: () => void): any {
        return this.http
            .get(this.buildUrl(null))
            .map((response) => response.json())
            .map((response) => {
                if (data) {
                    // const p: IPagingState = data.paging;
                    //  if (p) {
                    //      const countRecs: number = response["@odata.count"];
                    //      p.metadata = {
                    //          countPages: Math.ceil(countRecs / p.recordsPerPage),
                    //         countRecords: countRecs,
                    //         error: PagingError.None
                    //      };
                    //  }
                }
                if (cb) {
                    cb();
                }
                return response;
            })
            .subscribe((data) => {
                this._remoteData.next(data.value);
            });
    }

    private buildUrl(dataState: IDataState): string {
        let qS: string = "";
        if (dataState && dataState.paging) {
            const skip = dataState.paging.index * dataState.paging.recordsPerPage;
            const top = dataState.paging.recordsPerPage;
            qS += `$skip=${skip}&$top=${top}&$count=true`;
        }
        if (dataState && dataState.sorting) {
            const s = dataState.sorting;
            if (s && s.expressions && s.expressions.length) {
                qS += (qS ? "&" : "") + "$orderby=";
                s.expressions.forEach((e, ind) => {
                    qS += ind ? "," : "";
                    qS += `${e.fieldName} ${e.dir === SortingDirection.Asc ? "asc" : "desc"}`;
                });
            }
        }
        qS = qS ? `?${qS}` : "";
        return `${this.url}${qS}`;
    }
}