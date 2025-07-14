import { Component, ViewChild, OnInit, ChangeDetectorRef, AfterViewInit, inject } from '@angular/core';
import {
    IgxRowIslandComponent,
    IgxHierarchicalGridComponent,
    IGridCreatedEventArgs,
    IGX_HIERARCHICAL_GRID_DIRECTIVES,
    FilteringExpressionsTree,
    IgxStringFilteringOperand,
    EntityType,
    IgxNumberFilteringOperand
} from 'igniteui-angular';
import { HttpClient } from '@angular/common/http';

const API_ENDPOINT = 'https://data-northwind.indigo.design';

@Component({
    selector: 'app-hierarchical-grid-remote-sample',
    templateUrl: 'hierarchical-grid-remote.sample.html',
    styleUrls: ['hierarchical-grid-remote.sample.scss'],
    imports: [IGX_HIERARCHICAL_GRID_DIRECTIVES]
})
export class HierarchicalGridRemoteSampleComponent implements OnInit, AfterViewInit {
    private http = inject(HttpClient);
    private cdr = inject(ChangeDetectorRef);

    @ViewChild('hGrid', { static: true })
    private hGrid: IgxHierarchicalGridComponent;

    public selectionMode;
    public remoteData = [];
    public primaryKeys = [
        { name: 'Customers', key: 'customerId' },
        { name: 'Orders', key: 'orderId' },
        { name: 'Details', key: 'orderId' }
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
                        { field: 'customerId', dataType: 'string' }, // first field will be treated as foreign key
                        { field: 'orderId', dataType: 'number' },
                        { field: 'employeeId', dataType: 'number' },
                        { field: 'shipVia', dataType: 'string' },
                        { field: 'freight', dataType: 'number' }
                    ],
                    childEntities: [
                        {
                            name: 'Details',
                            fields: [
                                { field: 'orderId', dataType: 'number' }, // first field will be treated as foreign key
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

    public ngOnInit() {
        const ordersTree = new FilteringExpressionsTree(0, undefined, 'Orders', ['customerId']);
        ordersTree.filteringOperands.push({
            fieldName: 'freight',
            ignoreCase: false,
            condition: IgxNumberFilteringOperand.instance().condition('greaterThanOrEqualTo'),
            conditionName: IgxNumberFilteringOperand.instance().condition('greaterThanOrEqualTo').name,
            searchVal: '500'
        });

        const customersTree = new FilteringExpressionsTree(0, undefined, 'Customers', ['customerId', 'companyName', 'contactName', 'contactTitle']);
        customersTree.filteringOperands.push({
            fieldName: 'customerId',
            condition: IgxStringFilteringOperand.instance().condition('inQuery'),
            conditionName: IgxStringFilteringOperand.instance().condition('inQuery').name,
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
        let tree = this.hGrid.advancedFilteringExpressionsTree;
        if (!tree) {
            tree = new FilteringExpressionsTree(0, undefined, this.remoteEntities[0].name, this.remoteEntities[0].fields.map(f => f.field));
        }

        console.log(tree);

        this.hGrid.isLoading = true;
        this.http.post(`${API_ENDPOINT}/QueryBuilder/ExecuteQuery`, tree).subscribe(data =>{
            console.log('data', data);
            this.remoteData = Object.values(data)[0];
            this.hGrid.isLoading = false;
            this.cdr.detectChanges();
            this.calculateColsInView();
        });
    }

    private calculateColsInView() {
        if (this.hGrid.advancedFilteringExpressionsTree) {
            this.hGrid.columns.forEach(column =>
                column.hidden = !this.hGrid.advancedFilteringExpressionsTree.returnFields.includes(column.field));
        }
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
        const rowIslandKey = this.primaryKeys.find(key => key.name === rowIsland.key).name;
        const parentKey = (event.grid.parent as any).key ?? event.grid.parent.advancedFilteringExpressionsTree.entity;
        const url = `${API_ENDPOINT}/${parentKey}/${event.parentID}/${rowIslandKey}`;
        return url;
    }
}
