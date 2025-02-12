import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IForOfState } from 'igniteui-angular';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RemoteNWindService {
    public remoteData: BehaviorSubject<any[]>;
    private url = 'https://services.odata.org/V4/Northwind/Northwind.svc/Products';

    constructor(private http: HttpClient) {
        this.remoteData = new BehaviorSubject([]);
    }

    public getData(data?: IForOfState, searchText?: string, cb?: (any) => void): any {
        return this.http
            .get(this.buildUrl(data, searchText))
            .subscribe((d: any) => {
                this.remoteData.next(d.value);
                if (cb) {
                    cb(d);
                }
            });
    }

    private buildUrl(dataState: any, searchText?: string): string {
        let qS = '?';
        let requiredChunkSize: number;
        if (dataState) {
            const skip = dataState.startIndex;

            requiredChunkSize = dataState.chunkSize === 0 ?
                // Set initial chunk size, the best value is igxForContainerSize divided on igxForItemSize
                10 : dataState.chunkSize;
            qS += `$skip=${skip}&$top=${requiredChunkSize}&$count=true`;

            if (searchText) {
                qS += `&$filter=contains(ProductName, '` + searchText + `')`;
            }
        }
        return `${this.url}${qS}`;
    }
}
