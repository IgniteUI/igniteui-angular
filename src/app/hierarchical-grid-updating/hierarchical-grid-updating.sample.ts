import { Component, ViewChild, AfterViewInit } from '@angular/core';
import {
    IgxRowIslandComponent,
    IgxHierarchicalGridComponent,
    IGridCreatedEventArgs,
    IgxHierarchicalTransactionServiceFactory,
    IgxHierarchicalTransactionService,
    IgxGridTransaction
} from 'igniteui-angular';
import { RemoteService } from '../shared/remote.service';

@Component({
    selector: 'app-hierarchical-grid-updating-sample',
    templateUrl: 'hierarchical-grid-updating.sample.html',
    providers: [ RemoteService, IgxHierarchicalTransactionServiceFactory ]
})
export class HierarchicalGridUpdatingSampleComponent implements AfterViewInit {

    isRowSelectable = false;
    remoteData = [];
    primaryKeys = [
        { name: 'CustomerID', type: 'string', level: 0 },
        { name: 'OrderID', type: 'number', level: 1 },
        { name: 'EmployeeID', type: 'number', level: 2 },
        { name: 'ProductID', type: 'number', level: 2 }
    ];

    @ViewChild('rowIsland1')
    rowIsland1: IgxRowIslandComponent;

    @ViewChild('rowIsland2')
    rowIsland2: IgxRowIslandComponent;

    @ViewChild('hGrid')
    hGrid: IgxHierarchicalGridComponent;

    constructor(private remoteService: RemoteService) {
        remoteService.url = 'https://services.odata.org/V4/Northwind/Northwind.svc/';

        this.remoteService.urlBuilder = (dataState) => this.buildUrl(dataState);
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
        });
    }

    gridCreated(event: IGridCreatedEventArgs, rowIsland: IgxRowIslandComponent) {
        this.remoteService.getData({ parentID: event.parendID, level: rowIsland.level, key: rowIsland.key }, (data) => {
            event.grid.data = data['value'];
            event.grid.cdr.detectChanges();
        });
        this.lastChildGrid = event.grid;
    }

    public lastChildGrid: IgxHierarchicalGridComponent;
    public lastIdx = 1000;

    addRow() {
        this.hGrid.addRow({
            "CustomerID": this.lastIdx,
            "CompanyName": "Some Company " + this.lastIdx,
            "ContactName": "Some Contact " + this.lastIdx,
            "ContactTitle": "Some Title " + this.lastIdx++,
            "Country": "Germany",
            "Phone": "000-0000"
        })
    }

    deleteRow() {
        this.hGrid.deleteRow("ALFKI");
    }

    logTransactionsMain() {
        console.log(this.hGrid.transactions.getTransactionLog());
    }

    logTransactionsIsland1() {
        console.log(this.rowIsland1.transactions.getTransactionLog());
    }

}
