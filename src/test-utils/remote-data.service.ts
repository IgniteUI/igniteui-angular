import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { IDataState } from "../data-operations/data-state.interface";
import { SortingDirection } from "../data-operations/sorting-expression.interface";

export class RemoteServiceBase {
    public remoteData: Observable<any[]>;
    protected url: string;
    // private url = "http://services.odata.org/V4/Northwind/Northwind.svc/Products";
    private _remoteData: BehaviorSubject<any[]>;

    constructor(private http) {
        this._remoteData = new BehaviorSubject([]);
        this.remoteData = this._remoteData.asObservable();
    }

    public getData(data?: any[], cb?: () => void): any {
        return this.http.get(this.buildUrl(null)).pipe(
            map((response) => (response as Response).json()),
            map((response) => {
                if (cb) {
                    cb();
                }
                return response;
            }))
            .subscribe((data) => {
                this._remoteData.next(data.value);
            });
    }

    private buildUrl(dataState: IDataState): string {
        let qS = "";
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

@Injectable()
export class RemoteNWProductsService extends RemoteServiceBase {
    url = "http://services.odata.org/V4/Northwind/Northwind.svc/Products";
}
