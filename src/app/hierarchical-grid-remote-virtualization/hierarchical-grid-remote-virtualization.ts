import { Component, ViewChild, AfterViewInit, PipeTransform, Pipe } from '@angular/core';
import {
    IgxRowIslandComponent,
    IgxHierarchicalGridComponent,
    IGridCreatedEventArgs,
    GridSelectionMode
} from 'igniteui-angular';
import { RemoteService } from '../shared/remote.service';

@Component({
    selector: 'app-hierarchical-grid-remote-virtualization-sample',
    templateUrl: 'hierarchical-grid-remote-virtualization.html',
    providers: [RemoteService]
})
export class HierarchicalGridRemoteVirtualizationComponent implements AfterViewInit {

    public selectionMode;
    remoteData = [];
    gridData = [];
    totalCount:number;
    primaryKeys = [
        { name: 'CustomerID', type: 'string', level: 0 },
        { name: 'OrderID', type: 'number', level: 1 },
        { name: 'EmployeeID', type: 'number', level: 2 },
        { name: 'ProductID', type: 'number', level: 2 }
    ];

    @ViewChild('rowIsland1', { static: true })
    rowIsland1: IgxRowIslandComponent;

    @ViewChild('hGrid', { static: true })
    hGrid: IgxHierarchicalGridComponent;

    constructor(private remoteService: RemoteService) {
        remoteService.url = 'https://services.odata.org/V4/Northwind/Northwind.svc/Products';

        this.remoteService.urlBuilder = (virtualizationArgs) => this.buildUrl(virtualizationArgs);
        this.selectionMode = GridSelectionMode.none;
    }

    private _prevRequest: any;
    public handlePreLoad(args) {
        if (this._prevRequest) {
            this._prevRequest.unsubscribe();
        }
        console.log(args)
        this.hGrid.isLoading = true;
        this._prevRequest = this.remoteService.getData(args, (data) => {
            data.value.map(x => {
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
            this.gridData = data['value'];
            this.hGrid.cdr.detectChanges();
            (this.hGrid.verticalScrollContainer as any)._updateSizeCache();
            
            this.hGrid.isLoading = false;
        });
    }

    public buildUrl(virtualizationArgs) {
        let qS = '';
        if (virtualizationArgs) {
            let requiredChunkSize: number;
            const skip = virtualizationArgs.startIndex;
            requiredChunkSize = virtualizationArgs.chunkSize === 0 ? 11 : virtualizationArgs.chunkSize;
            const top = requiredChunkSize;
            qS = `?$skip=${skip}&$top=${top}&$count=true`;
        }
        return `${this.remoteService.url}${qS}`;
    }

    public ngAfterViewInit() {
        this.hGrid.isLoading = true;
        this.remoteService.getData(this.hGrid.virtualizationState, (data) => {
            data.value.map(x => {
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
            this.totalCount = data['@odata.count'];
            this.gridData = data['value'];
            this.hGrid.isLoading = false;
        });
    }
}


@Pipe({
    name: 'gridHierarchicalRemote',
    pure: true
})
export class IgxGridHierarchicalRemotePipe implements PipeTransform {
    public cachedData = [];
    public transform(
        collection: any,
        grid: IgxHierarchicalGridComponent,
        state: any,
        totalDataRecordsCount: number
        ): any[] {

        console.log('hit');
        const childKeys = grid.childLayoutKeys;
        if (childKeys.length === 0) {
            return collection;
        }
        const virtualizationState = grid.virtualizationState;

        const primaryKey = grid.primaryKey;
        const result = this.addHierarchy(grid, collection, state, primaryKey, childKeys);
        const childRecsBeforeIndex = this.cachedData.filter((x, index) => grid.isChildGridRecord(x) && index<=virtualizationState.startIndex);
        let dataUpdateStartIndex = virtualizationState.startIndex + childRecsBeforeIndex.length;
        const size = virtualizationState.chunkSize || 10;
        const lastChunk =  virtualizationState.startIndex + size === grid.verticalScrollContainer.totalItemCount;
        this._updateCachedData(result, dataUpdateStartIndex, lastChunk);
        const allChildRecords = this.cachedData.filter(x => grid.isChildGridRecord(x));        
        grid.verticalScrollContainer.totalItemCount = totalDataRecordsCount + allChildRecords.length;
        const data = this.cachedData.slice(virtualizationState.startIndex, virtualizationState.startIndex + size);
        if(!data[0]){
            data[0]={};
        }
        return data;
    }

    private _updateCachedData(data: any, startIndex: number, lastChunk:boolean) {
        for (let i = 0; i < data.length; i++) {
            this.cachedData[i + startIndex] = data[i];
        }
        if (lastChunk) {
            this.cachedData.splice(startIndex + data.length);
        }
    }

    public addHierarchy<T>(grid, data: T[], state, primaryKey, childKeys: string[]): T[] {
        const result = [];

        data.forEach((v) => {
            result.push(v);
            const childGridsData = {};
            childKeys.forEach((childKey) => {
                const childData = v[childKey] ? v[childKey] : null;
                childGridsData[childKey] = childData;
            });
            if (grid.gridAPI.get_row_expansion_state(v)) {
                result.push({ rowID: primaryKey ? v[primaryKey] : v, childGridsData: childGridsData});
            }
        });
        return result;
    }
}