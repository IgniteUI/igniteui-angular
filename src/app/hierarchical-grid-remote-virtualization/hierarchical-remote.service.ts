import { Injectable, inject } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { IgxGridHierarchicalPipe } from 'projects/igniteui-angular/src/lib/grids/hierarchical-grid/hierarchical-grid.pipes';
import { IgxHierarchicalGridComponent } from 'igniteui-angular';

@Injectable()
export class HierarchicalRemoteService {
    private http = inject(HttpClient);


    public remotePagingData: BehaviorSubject<any[]>;
    public cachedData = [];
    public requestStartIndex = 0;
    public totalCount: number;
    public remoteData: Observable<any[]>;
    public _remoteData: BehaviorSubject<any[]>;
    public url = `https://services.odata.org/V4/Northwind/Northwind.svc/Products`;
    public urlBuilder;

    private hierarchyPipe: IgxGridHierarchicalPipe = null;

    constructor() {
        this._remoteData = new BehaviorSubject([]);
        this.remoteData = this._remoteData.asObservable();
    }


    public nullData() {
        this._remoteData.next(null);
    }

    public undefinedData() {
        this._remoteData.next(undefined);
    }

    public getDataFromCache(data: any) {
        const startIndex = data.startIndex;
        const endIndex = (data.chunkSize || 11) + startIndex;
        const dataResult = this.cachedData.slice(startIndex, endIndex);
        while (dataResult.length < data.chunkSize) {
            dataResult.unshift({emptyRec: true});
        }
        this._remoteData.next(dataResult);
        return dataResult;
    }

    public getData(virtualizationState: any, grid: IgxHierarchicalGridComponent, cb?: (any) => void) {
        this.hierarchyPipe = this.hierarchyPipe ?? new IgxGridHierarchicalPipe(grid);
        return this.http.get(this.buildUrl(virtualizationState, grid)).pipe(
            map(response => response),
        )
        .subscribe(d => {
                const result = d['value'];
                this.totalCount = d['@odata.count'];
                if (this.cachedData.length === 0) {
                    this.cachedData = new Array<any>(this.totalCount * 2).fill({emptyRec: true});
                }
                const processedData = this.hierarchyPipe
                .addHierarchy(grid, result, grid.expansionStates, grid.primaryKey, grid.childLayoutKeys);

                const childRecsBeforeIndex = this.cachedData
                .filter((x, index) => grid.isChildGridRecord(x) && index < virtualizationState.startIndex);
                const size = virtualizationState.chunkSize || 11;
                const lastChunk =  virtualizationState.startIndex + size === grid.verticalScrollContainer.totalItemCount;
                this._updateCachedData(processedData, this.requestStartIndex + childRecsBeforeIndex.length, lastChunk);
                const allChildRecords = this.cachedData.filter(x => grid.isChildGridRecord(x));
                grid.verticalScrollContainer.totalItemCount = this.totalCount + allChildRecords.length;
                const dataResult = this.getDataFromCache(virtualizationState);
                this._remoteData.next(dataResult);
            if (cb) {
                cb(dataResult);
            }
        });
    }

    public buildUrl(virtualizationArgs, grid) {
        let qS = '';
        if (virtualizationArgs) {
            const childRecsBeforeIndex = this.cachedData
            .filter((x, index) => grid.isChildGridRecord(x) && index <= virtualizationArgs.startIndex);
            const skip = virtualizationArgs.startIndex - childRecsBeforeIndex.length;
            this.requestStartIndex = skip;
            const requiredChunkSize = virtualizationArgs.chunkSize === 0 ? 11 : virtualizationArgs.chunkSize + childRecsBeforeIndex.length;
            const top = requiredChunkSize;
            qS = `&$skip=${skip}&$top=${top}&$count=true`;
        }
        return `${this.url}${qS}`;
    }

    private _updateCachedData(data: any, startIndex: number, lastChunk: boolean) {
        for (let i = 0; i < data.length; i++) {
            this.cachedData[i + startIndex] = data[i];
        }
        if (lastChunk) {
            this.cachedData.splice(startIndex + data.length);
        }
    }
}
