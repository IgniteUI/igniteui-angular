import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { RemoteService } from '../shared/remote.service';
import { IgxColumnComponent, IgxGridComponent, IgxSplitterComponent, IgxSplitterPaneComponent, IgxSwitchComponent, SplitterType } from 'igniteui-angular';


@Component({
    selector: 'app-splitter-sample',
    styleUrls: ['splitter.sample.scss'],
    templateUrl: 'splitter.sample.html',
    standalone: true,
    imports: [IgxSwitchComponent, IgxSplitterComponent, IgxSplitterPaneComponent, IgxGridComponent, IgxColumnComponent]
})
export class SplitterSampleComponent implements AfterViewInit {
    @ViewChild('grid1', { static: true })
    private grid1: IgxGridComponent;

    @ViewChild('grid2', { static: true })
    private grid2: IgxGridComponent;

    @ViewChild('grid3', { static: true })
    private grid3: IgxGridComponent;

    public type = SplitterType.Horizontal;
    public data1 = [];
    public data2 = [];
    public data3 = [];
    public primaryKeys = [
        { name: 'CustomerID', type: 'string', level: 0 },
        { name: 'OrderID', type: 'number', level: 1 },
        { name: 'EmployeeID', type: 'number', level: 2 },
        { name: 'ProductID', type: 'number', level: 2 }
    ];

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

    public changeType() {
        if (this.type === SplitterType.Horizontal) {
            this.type = SplitterType.Vertical;
        } else {
            this.type = SplitterType.Horizontal;
        }
    }

    public ngAfterViewInit() {
        this.remoteService.getData({ parentID: null, level: 0, key: 'Customers' }, (data) => {
            this.data1 = data['value'];
            this.grid1.isLoading = false;
            this.grid1.selectRows([this.data1[0].CustomerID], true);
            const evt = { newSelection: [this.data1[0].CustomerID]};
            this.onCustomerSelection(evt);
        });
    }

    public onCustomerSelection(evt) {
        const newSelection = evt.newSelection[0];
        this.remoteService.getData({ parentID: newSelection, level: 1, key: 'Orders' }, (data) => {
            this.data2 = data['value'];
            this.grid2.isLoading = false;
            this.grid2.selectRows([this.data2[0].OrderID], true);
            const event = { newSelection: [this.data2[0].OrderID]};
            this.onOrderSelection(event);
        });
    }

    public onOrderSelection(evt) {
        const newSelection = evt.newSelection[0];
        this.remoteService.getData({ parentID: newSelection, level: 2, key: 'Order_Details' }, (data) => {
            this.data3 = data['value'];
            this.grid3.isLoading = false;
        });
    }
}
