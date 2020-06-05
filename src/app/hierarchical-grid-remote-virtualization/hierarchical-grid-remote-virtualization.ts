import { Component, ViewChild, AfterViewInit, PipeTransform, Pipe } from '@angular/core';
import {
    IgxRowIslandComponent,
    IgxHierarchicalGridComponent,
    IGridCreatedEventArgs,
    GridSelectionMode
} from 'igniteui-angular';
import { RemoteService } from '../shared/remote.service';
import { HierarchicalRemoteService } from './hierarchical-remote.service';

@Component({
    selector: 'app-hierarchical-grid-remote-virtualization-sample',
    templateUrl: 'hierarchical-grid-remote-virtualization.html',
    providers: [RemoteService]
})
export class HierarchicalGridRemoteVirtualizationComponent implements AfterViewInit {

    public selectionMode;
    remoteData = [];
    gridData = [];
    totalCount: number;

    @ViewChild('rowIsland1', { static: true })
    rowIsland1: IgxRowIslandComponent;

    @ViewChild('hGrid', { static: true })
    hGrid: IgxHierarchicalGridComponent;

    constructor(private remoteService: HierarchicalRemoteService) {
        remoteService.url = 'https://services.odata.org/V4/Northwind/Northwind.svc/Customers?$expand=Orders';
    }

    private _prevRequest: any;
    public handlePreLoad(args) {
        if (this._prevRequest) {
            this._prevRequest.unsubscribe();
        }
        this.hGrid.isLoading = true;
        this._prevRequest = this.remoteService.getData(args, this.hGrid, (data) => {
            this.gridData = data;
            this.hGrid.cdr.detectChanges();
            (this.hGrid.verticalScrollContainer as any)._updateSizeCache();
            this.hGrid.isLoading = false;
        });
    }


    public ngAfterViewInit() {
        this.hGrid.isLoading = true;
        this.hGrid.expansionStatesChange.subscribe(x => {
            this.remoteService.getData(this.hGrid.virtualizationState, this.hGrid, (data) => {
                this.gridData = data;
                this.hGrid.isLoading = false;
            });
        });

        this.remoteService.getData(this.hGrid.virtualizationState, this.hGrid, (data) => {
            this.gridData = data;
            this.hGrid.isLoading = false;
        });
    }
}
