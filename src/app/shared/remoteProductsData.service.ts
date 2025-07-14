import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { SortingDirection } from 'igniteui-angular';
import { BehaviorSubject, Observable } from 'rxjs';

const DATA_URL = 'https://services.odata.org/V4/Northwind/Northwind.svc/Products';
const EMPTY_STRING = '';
export enum SortOrder {
    ASC = 'asc',
    DESC = 'desc',
    NONE = ''
}
@Injectable()
export class RemoteVirtService {
    private _http = inject(HttpClient);


    public data: Observable<any[]>;
    private _data: BehaviorSubject<any[]>;
    private _cachedData: any[];

    constructor() {
        this._data = new BehaviorSubject([]);
        this.data = this._data.asObservable();
    }

    public hasItemsInCache(virtualizationArgs?) {
        const startIndex = virtualizationArgs.startIndex;
        const endIndex = virtualizationArgs.chunkSize + startIndex;
        let areAllItemsInCache = true;
        for (let i = startIndex; i < endIndex; i++) {
            if (this._cachedData[i] === null) {
                areAllItemsInCache = false;
                break;
            }
        }
        return areAllItemsInCache;
    }

    public getData(virtualizationArgs?, sortingArgs?: any, resetData?: boolean, cb?: (any) => void): any {
        const startIndex = virtualizationArgs.startIndex;
        const endIndex = virtualizationArgs.chunkSize + startIndex;

        if (resetData) {
            this._http.get(this._buildDataUrl(virtualizationArgs, sortingArgs)).subscribe((data: any) => {
                this._cachedData = new Array<any>(data['@odata.count']).fill(null);
                this._updateData(data, startIndex);
                if (cb) {
                    cb(data);
                }
            });

            return;
        }

        if (!this.hasItemsInCache(virtualizationArgs)) {
            this._http.get(this._buildDataUrl(virtualizationArgs, sortingArgs)).subscribe((data: any) => {
                this._updateData(data, startIndex);
                if (cb) {
                    cb(data);
                }
            });
        } else {
            const data = this._cachedData.slice(startIndex, endIndex);
            this._data.next(data);
            if (cb) {
                cb(data);
            }
        }
    }

    private _updateData(data: any, startIndex: number) {
        this._data.next(data.value);
        for (let i = 0; i < data.value.length; i++) {
            this._cachedData[i + startIndex] = data.value[i];
        }
    }

    private _buildDataUrl(virtualizationArgs: any, sortingArgs: any): string {
        let baseQueryString = `${DATA_URL}?$count=true`;
        let scrollingQuery = EMPTY_STRING;
        let orderQuery = EMPTY_STRING;
        let query = EMPTY_STRING;

        if (sortingArgs) {
            let sortingDirection: string;
            switch (sortingArgs.dir) {
                case SortingDirection.Asc:
                    sortingDirection = SortOrder.ASC;
                    break;
                case SortingDirection.Desc:
                    sortingDirection = SortOrder.DESC;
                    break;
                default:
                    sortingDirection = SortOrder.NONE;
            }

            orderQuery = `$orderby=${sortingArgs.fieldName} ${sortingDirection}`;
        }

        if (virtualizationArgs) {
            const skip = virtualizationArgs.startIndex;
            const requiredChunkSize = virtualizationArgs.chunkSize === 0 ? 11 : virtualizationArgs.chunkSize;
            const top = requiredChunkSize;
            scrollingQuery = `$skip=${skip}&$top=${top}`;
        }

        query += (orderQuery !== EMPTY_STRING) ? `&${orderQuery}` : EMPTY_STRING;
        query += (scrollingQuery !== EMPTY_STRING) ? `&${scrollingQuery}` : EMPTY_STRING;

        baseQueryString += query;

        return baseQueryString;
    }
}
