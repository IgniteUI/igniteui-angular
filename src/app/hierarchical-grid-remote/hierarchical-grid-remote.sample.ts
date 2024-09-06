import { Component, ViewChild, AfterViewInit } from '@angular/core';
import {
    IgxRowIslandComponent,
    IgxHierarchicalGridComponent,
    IGridCreatedEventArgs,
    GridSelectionMode,
    IGX_HIERARCHICAL_GRID_DIRECTIVES
} from 'igniteui-angular';
import { RemoteService } from '../shared/remote.service';

@Component({
    selector: 'app-hierarchical-grid-remote-sample',
    templateUrl: 'hierarchical-grid-remote.sample.html',
    styleUrls: ['hierarchical-grid-remote.sample.scss'],
    standalone: true,
    providers: [RemoteService],
    imports: [IGX_HIERARCHICAL_GRID_DIRECTIVES]
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
        this.selectionMode = GridSelectionMode.none;
    }

    public ngAfterViewInit() {
        this.remoteService.entity = 'Customers';
        this.remoteService.getData(null, null, null, (data) => {
            this.remoteData = data['items'];
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

    public gridCreated(event: IGridCreatedEventArgs, _rowIsland: IgxRowIslandComponent) {
        event.grid.isLoading = true;
        this.remoteService.entity = { parentEntity: 'Customers', childEntity: 'Orders', key: event.parentID };
        this.remoteService.getData(null, null, null, (data) => {
            event.grid.data = data;
            event.grid.isLoading = false;
            event.grid.cdr.detectChanges();
        });
    }
}
