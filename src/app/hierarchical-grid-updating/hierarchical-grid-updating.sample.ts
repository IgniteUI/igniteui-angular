import { Component, ViewChild, AfterViewInit } from '@angular/core';
import {
    IgxRowIslandComponent,
    IgxHierarchicalGridComponent,
    IGridCreatedEventArgs,
    GridSelectionMode,
    IgxButtonDirective,
    IgxColumnComponent
} from 'igniteui-angular';
import { RemoteService } from '../shared/remote.service';

@Component({
    selector: 'app-hierarchical-grid-updating-sample',
    styleUrls: ['hierarchical-grid-updating.sample.scss'],
    templateUrl: 'hierarchical-grid-updating.sample.html',
    standalone: true,
    providers: [RemoteService],
    imports: [IgxButtonDirective, IgxHierarchicalGridComponent, IgxColumnComponent, IgxRowIslandComponent]
})
export class HierarchicalGridUpdatingSampleComponent implements AfterViewInit {
    @ViewChild('rowIsland1', { static: true })
    private rowIsland1: IgxRowIslandComponent;

    @ViewChild('hGrid', { static: true })
    private hGrid: IgxHierarchicalGridComponent;

    public lastChildGrid: IgxHierarchicalGridComponent;
    public lastIdx = 1000;
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
        this.remoteService.entity = 'Customers';
        this.remoteService.getData(null, null, null, (data) => {
            this.remoteData = data['value'];
        });
    }

    public gridCreated(event: IGridCreatedEventArgs, rowIsland: IgxRowIslandComponent) {
        this.remoteService.entity = { parentEntity: 'Customers', childEntity: 'Orders', key: rowIsland.key };
        this.remoteService.getData(null, null, null, (data) => {
            if (rowIsland.key === 'Orders') {
                let index = 0;
                data.forEach(item => {
                    item.orderDate = new Date(item.orderDate);
                    item.MyID = index;
                    index++;
                });
            }
            event.grid.data = data;
            event.grid.cdr.detectChanges();
        });
        this.lastChildGrid = event.grid;
    }

    public addRow() {
        this.hGrid.addRow({
            CustomerID: this.lastIdx,
            CompanyName: 'Some Company ' + this.lastIdx,
            ContactName: 'Some Contact ' + this.lastIdx,
            ContactTitle: 'Some Title ' + this.lastIdx++,
            Country: 'Germany',
            Phone: '000-0000'
        });
    }

    public deleteRow() {
        const grid = this.rowIsland1.gridAPI.getChildGrids()[0];
        grid.deleteRow(grid.data[0]['OrderID']);
    }

    public logTransactionsMain() {
        console.log(this.hGrid.transactions.getTransactionLog());
    }

    public logTransactionsIsland1() {
        console.log(this.rowIsland1.transactions.getTransactionLog());
    }

    public commitTransactionsIsland1() {
        this.rowIsland1.rowIslandAPI.getChildGrids().forEach((grid: IgxHierarchicalGridComponent) => {
            grid.transactions.commit(grid.data);
        });
    }

}
