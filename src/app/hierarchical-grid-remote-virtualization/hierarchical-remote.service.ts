import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { IgxGridHierarchicalPipe } from 'projects/igniteui-angular/src/lib/grids/hierarchical-grid/hierarchical-grid.pipes';
import { IgxHierarchicalGridAPIService, IgxHierarchicalGridComponent } from 'igniteui-angular';

@Injectable()
export class HierarchicalRemoteService {

    public remotePagingData: BehaviorSubject<any[]>;
    public urlPaging = 'https://www.igniteui.com/api/products';
    public cachedData = [];
    requestStartIndex = 0;
    totalCount: number;
    remoteData: Observable<any[]>;
    _remoteData: BehaviorSubject<any[]>;    
    url = `https://services.odata.org/V4/Northwind/Northwind.svc/Products`;
    urlBuilder;

    constructor(private http: HttpClient, private hierarchyPipe: IgxGridHierarchicalPipe) {
        this._remoteData = new BehaviorSubject([]);
        this.remoteData = this._remoteData.asObservable();
    }


    nullData() {
        this._remoteData.next(null);
    }

    undefinedData() {
        this._remoteData.next(undefined);
    }

    private _updateCachedData(data: any, startIndex: number, lastChunk:boolean) {
        for (let i = 0; i < data.length; i++) {
            this.cachedData[i + startIndex] = data[i];
        }
        if (lastChunk) {
            this.cachedData.splice(startIndex + data.length);
        }
    }

    getData(virtualizationState: any, grid : IgxHierarchicalGridComponent, cb?: (any) => void) {
        return this.http.get(this.buildUrl(virtualizationState, grid)).pipe(
            map(response => response),
        )
        .subscribe(d => {
            const result = d['value'];
            this.totalCount = d['@odata.count'];

            result.map(x => {
                x["Orders"] = [
                    { "OrderID": 1, "Sequence": 2},
                    { "OrderID": 2, "Sequence": 2},
                    { "OrderID": 3, "Sequence": 2},
                    { "OrderID": 1, "Sequence": 2},
                    { "OrderID": 2, "Sequence": 2},
                    { "OrderID": 3, "Sequence": 2},
                    { "OrderID": 1, "Sequence": 2},
                    { "OrderID": 2, "Sequence": 2},
                    { "OrderID": 3, "Sequence": 2}
                  ];
                });
                const processedData = this.hierarchyPipe.addHierarchy(grid, result, grid.expansionStates, grid.primaryKey, grid.childLayoutKeys);       

                const childRecsBeforeIndex = this.cachedData.filter((x, index) => grid.isChildGridRecord(x) && index < virtualizationState.startIndex);
                const size = virtualizationState.chunkSize || 10;
                const lastChunk =  virtualizationState.startIndex + size === grid.verticalScrollContainer.totalItemCount;
                this._updateCachedData(processedData, this.requestStartIndex + childRecsBeforeIndex.length, lastChunk);
                const allChildRecords = this.cachedData.filter(x => grid.isChildGridRecord(x));        
                grid.verticalScrollContainer.totalItemCount = this.totalCount + allChildRecords.length;

                const dataResult = this.cachedData.slice(virtualizationState.startIndex, virtualizationState.startIndex + size);
                console.log(dataResult);
                this._remoteData.next(dataResult);
           
            if (cb) {
                cb(dataResult);
            }
        });
    }

    public buildUrl(virtualizationArgs, grid) {
        let qS = '';
        if (virtualizationArgs) {
            let requiredChunkSize: number;
            const childRecsBeforeIndex = this.cachedData.filter((x, index) => grid.isChildGridRecord(x) && index<=virtualizationArgs.startIndex);
            const skip = virtualizationArgs.startIndex - childRecsBeforeIndex.length;
            this.requestStartIndex = skip;
            requiredChunkSize = virtualizationArgs.chunkSize === 0 ? 11 : virtualizationArgs.chunkSize + childRecsBeforeIndex.length;
            const top = requiredChunkSize;
            qS = `?$skip=${skip}&$top=${top}&$count=true`;
            console.log(qS);
        }
        return `${this.url}${qS}`;
    }
}
