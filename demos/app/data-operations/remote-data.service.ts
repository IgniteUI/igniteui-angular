import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
import { BehaviorSubject, Observable } from "rxjs/Rx";
import { DataContainer, DataType, DataUtil, IDataState, SortingDirection
      } from "../../../src/main";

@Injectable()
export class RemoteDataService  extends BehaviorSubject<DataContainer> {
    private url: string = "http://services.odata.org/V4/Northwind/Northwind.svc/Products";
    constructor(private http: Http) {
        super(null);
    }
    public getData(dataState?: IDataState) {
        const url = this.encodeUrl(dataState);
        return this.http
            .get(url)
            .map((response) => response.json())
            .toPromise();
    }
    private encodeUrl(dataState: IDataState): string {
        let queryStr: string = "";
        if (dataState && dataState.paging) {
            const skip = dataState.paging.index * dataState.paging.recordsPerPage;
            const top = dataState.paging.recordsPerPage;
            queryStr += `$skip=${skip}&$top=${top}&$count=true`;
        }
        if (dataState && dataState.sorting) {
            const s = dataState.sorting;
            if (s && s.expressions && s.expressions.length) {
                queryStr += (queryStr ? "&" : "") + "$orderby=";
                s.expressions.forEach((e, ind) => {
                    queryStr += ind ? "," : "";
                    queryStr += `${e.fieldName} ${e.dir === SortingDirection.Asc ? "asc" : "desc"}`;
                });
            }
        }
        queryStr = queryStr ? `?${queryStr}` : "";
        return `${this.url}${queryStr}`;
    }
}
