import { Component, ViewChild, AfterViewInit } from '@angular/core';
import {
    IgxRowIslandComponent,
    IgxHierarchicalGridComponent,
    IGridCreatedEventArgs,
    GridSelectionMode
} from 'igniteui-angular';
import { RemoteService } from '../shared/remote.service';

@Component({
    selector: 'app-hierarchical-grid-remote-sample',
    templateUrl: 'hierarchical-grid-remote.sample.html',
    providers: [RemoteService]
})
export class HierarchicalGridRemoteSampleComponent implements AfterViewInit {
    @ViewChild('rowIsland1', { static: true })
    private rowIsland1: IgxRowIslandComponent;

    @ViewChild('hGrid', { static: true })
    private hGrid: IgxHierarchicalGridComponent;

    public selectionMode;
    public remoteData = [];
    public primaryKeys = [
        { name: 'CustomerID', type: 'string', level: 0 },
        { name: 'OrderID', type: 'number', level: 1 },
        { name: 'EmployeeID', type: 'number', level: 2 },
        { name: 'ProductID', type: 'number', level: 2 }
    ];

    constructor(private remoteService: RemoteService) {
        remoteService.url = 'https://services.odata.org/V4/Northwind/Northwind.svc/';

        this.remoteService.urlBuilder = (dataState) => this.buildUrl(dataState);
        this.selectionMode = GridSelectionMode.none;
    }

    public buildUrl(dataState) {
        let qS = '';
        if (dataState) {
            qS += `${dataState.key}?`;

            const level = dataState.level;
            if (level > 0) {
                const parentKey = this.primaryKeys.find((key) => key.level === level - 1);
                const parentID = typeof dataState.parentID !== 'object' ? dataState.parentID : dataState.parentID[parentKey.name];

                if (parentKey.type === 'string') {
                    qS += `$filter=${parentKey.name} eq '${parentID}'`;
                } else {
                    qS += `$filter=${parentKey.name} eq ${parentID}`;
                }
            }
        }
        return `${this.remoteService.url}${qS}`;
    }

    public ngAfterViewInit() {
        this.remoteService.getData({ parentID: null, level: 0, key: 'Customers' }, (data) => {
            this.remoteData = data['value'];
            this.hGrid.isLoading = false;
        });
    }

    public setterChange() {
        this.rowIsland1.rowSelection = this.rowIsland1.rowSelection === GridSelectionMode.multiple
        ? GridSelectionMode.none : GridSelectionMode.multiple;
    }

    public setterBindingChange() {
        this.selectionMode = this.selectionMode === GridSelectionMode.none ? GridSelectionMode.multiple : GridSelectionMode.none;
    }

    public gridCreated(event: IGridCreatedEventArgs, rowIsland: IgxRowIslandComponent) {
        event.grid.isLoading = true;
        this.remoteService.getData({ parentID: event.parentID, level: rowIsland.level, key: rowIsland.key }, (data) => {
            event.grid.data = data['value'];
            event.grid.isLoading = false;
            event.grid.cdr.detectChanges();
        });
    }
}
