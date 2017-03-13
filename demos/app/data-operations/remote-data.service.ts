import { Injectable } from "@angular/core";
import { DataContainer, DataUtil, DataState, DataType, SortingDirection
      } from "../../../src/main";
import { Http } from '@angular/http';
import { Observable, BehaviorSubject } from 'rxjs/Rx';

@Injectable()
export class RemoteDataService  extends BehaviorSubject<DataContainer> {
    private url: string = 'http://services.odata.org/V4/Northwind/Northwind.svc/Products';
    constructor(private http: Http) {
        super(null);
    }
    private encodeUrl(dataState: DataState): string {
        let queryStr: string = "";
        if (dataState && dataState.paging) {
            let skip = dataState.paging.index * dataState.paging.recordsPerPage;
            let top = dataState.paging.recordsPerPage;
            queryStr += `$skip=${skip}&$top=${top}&$count=true`;
        }
        if (dataState && dataState.sorting) {
            let s = dataState.sorting;
            if (s && s.expressions && s.expressions.length) {
                queryStr += (queryStr ? "&" : "") + "$orderby=";
                s.expressions.forEach((e, ind) => {
                    queryStr += ind ? "," : "";
                    queryStr += `${e.fieldName} ${e.dir === SortingDirection.Asc?"asc":"desc"}`;
                });
            }
        }
        queryStr = queryStr ? `?${queryStr}`: "";
        return `${this.url}${queryStr}`;
    }
    public getData(dataState?: DataState) {
        let url = this.encodeUrl(dataState);
        return this.http
            .get(url)
            .map(response => response.json())
            .toPromise();
    }
}