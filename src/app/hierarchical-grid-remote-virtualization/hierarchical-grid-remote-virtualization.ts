import { Component, ViewChild, AfterViewInit } from '@angular/core';
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
            this.hGrid.data = data['value'];
            
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
            this.hGrid.verticalScrollContainer.totalItemCount = data['@odata.count'];
            this.hGrid.data = data['value'];
            this.hGrid.isLoading = false;
        });
    }
}
