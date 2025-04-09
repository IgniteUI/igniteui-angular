import { Component, ViewChild, OnInit, ChangeDetectorRef } from '@angular/core';
import {
    IgxRowIslandComponent,
    IgxHierarchicalGridComponent,
    IGridCreatedEventArgs,
    IGX_HIERARCHICAL_GRID_DIRECTIVES,
    FilteringExpressionsTree,
    IgxStringFilteringOperand,
    EntityType
} from 'igniteui-angular';
import { HttpClient } from '@angular/common/http';

const API_ENDPOINT = 'https://data-northwind.indigo.design';

@Component({
    selector: 'app-hierarchical-grid-remote-sample',
    templateUrl: 'hierarchical-grid-remote.sample.html',
    styleUrls: ['hierarchical-grid-remote.sample.scss'],
    imports: [IGX_HIERARCHICAL_GRID_DIRECTIVES]
})
export class HierarchicalGridRemoteSampleComponent implements OnInit {
    @ViewChild('hGrid', { static: true })
    private hGrid: IgxHierarchicalGridComponent;

    public selectionMode;
    public remoteData = [];
    public primaryKeys = [
        { name: 'Customers', type: 'string', level: 0 },
        { name: 'Orders', type: 'number', level: 1 },
        { name: 'Details', type: 'number', level: 2 }
    ];
    public remoteEntities: EntityType[] = [
        {
            name: 'Customers',
            fields: [
                { field: 'customerId', dataType: 'string' },
                { field: 'companyName', dataType: 'string' },
                { field: 'contactName', dataType: 'string' },
                { field: 'contactTitle', dataType: 'string' }
            ],
            childEntities: [
                {
                    name: 'Orders',
                    fields: [
                        { field: 'orderId', dataType: 'number' },
                        { field: 'customerId', dataType: 'string' },
                        { field: 'employeeId', dataType: 'number' },
                        { field: 'shipVia', dataType: 'string' }
                    ],
                    childEntities: [
                        {
                            name: 'Details',
                            fields: [
                                { field: 'orderId', dataType: 'number' },
                                { field: 'productId', dataType: 'number' },
                                { field: 'unitPrice', dataType: 'number' },
                                { field: 'quantity', dataType: 'number' },
                                { field: 'discount', dataType: 'number' }
                            ]
                        }
                    ]
                }
            ]
        }
    ];

    constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

    public ngOnInit() {
        const ordersTree = new FilteringExpressionsTree(0, undefined, 'Orders', ['customerId']);
        ordersTree.filteringOperands.push({
            fieldName: 'shipVia',
            ignoreCase: false,
            condition: IgxStringFilteringOperand.instance().condition('equals'),
            conditionName: IgxStringFilteringOperand.instance().condition('equals').name,
            searchVal: 'AirCargo'
        });

        const customersTree = new FilteringExpressionsTree(0, undefined, 'Customers', ['customerId', 'companyName', 'contactName', 'contactTitle']);
        customersTree.filteringOperands.push({
            fieldName: 'customerId',
            condition: IgxStringFilteringOperand.instance().condition('notInQuery'),
            conditionName: IgxStringFilteringOperand.instance().condition('notInQuery').name,
            ignoreCase: false,
            searchTree: ordersTree
        });
        // customersTree.filteringOperands.push({
        //     fieldName: 'customerId',
        //     ignoreCase: false,
        //     conditionName: IgxStringFilteringOperand.instance().condition('startsWith').name,
        //     searchVal: 'A'
        // });
        this.hGrid.advancedFilteringExpressionsTree = customersTree;
    }

    public ngAfterViewInit() {
        this.advancedFilteringExprTreeChange();
    }

    public advancedFilteringExprTreeChange() {
        if (!this.hGrid.advancedFilteringExpressionsTree) return;

        this.hGrid.isLoading = true;
        this.http.post(`${API_ENDPOINT}/QueryBuilder/ExecuteQuery`, this.hGrid.advancedFilteringExpressionsTree).subscribe(data =>{
            console.log('data', data);
            this.remoteData = Object.values(data)[0];
            this.hGrid.isLoading = false;
            this.cdr.detectChanges();
            this.calculateColsInView();
        });
    }

    private calculateColsInView() {
        this.hGrid.columns.forEach(column =>
            column.hidden = !this.hGrid.advancedFilteringExpressionsTree.returnFields.includes(column.field));
    }

    public gridCreated(event: IGridCreatedEventArgs, rowIsland: IgxRowIslandComponent) {
        event.grid.isLoading = true;
        const url = this.buildUrl(event, rowIsland);
        this.http.get(url).subscribe(data => {
            console.log('data', data);
            event.grid.data = Object.values(data);
            event.grid.isLoading = false;
            this.cdr.detectChanges(); 
        });
    }

    private buildUrl(event: IGridCreatedEventArgs, rowIsland: IgxRowIslandComponent) {
        const rowIslandKey = this.primaryKeys.find(key => key.level === rowIsland.level).name;
        const parentKey = (event.grid.parent as any).key ?? event.grid.parent.advancedFilteringExpressionsTree.entity;
        const url = `${API_ENDPOINT}/${parentKey}/${event.parentID}/${rowIslandKey}`;
        return url;
    }
}
