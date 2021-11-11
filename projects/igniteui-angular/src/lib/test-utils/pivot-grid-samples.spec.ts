import { Component, ViewChild } from '@angular/core';
import { IgxPivotNumericAggregate } from '../grids/pivot-grid/pivot-grid-aggregate';
import { IgxPivotGridComponent } from '../grids/pivot-grid/pivot-grid.component';
import { IPivotConfiguration, PivotAggregation } from '../grids/pivot-grid/pivot-grid.interface';


export class IgxTotalSaleAggregate {
    public static totalSale: PivotAggregation = (members, data: any) =>
        data.reduce((accumulator, value) => accumulator + value.UnitPrice * value.UnitsSold, 0);
}

@Component({
    template: `
    <igx-pivot-grid #grid [data]="data" [pivotConfiguration]="pivotConfigHierarchy"
        [rowSelection]="'single'" [columnSelection]="'single'">
    </igx-pivot-grid>`
})
export class IgxPivotGridTestBaseComponent {
    @ViewChild('grid', { read: IgxPivotGridComponent, static: true }) public pivotGrid: IgxPivotGridComponent;
    public data;

    public cellClasses;

    public pivotConfigHierarchy: IPivotConfiguration;

    constructor() {
        this.data = [
            {
                ProductCategory: 'Clothing', UnitPrice: 12.81, SellerName: 'Stanley',
                Country: 'Bulgaria', Date: '01/01/2021', UnitsSold: 282
            },
            {
                ProductCategory: 'Clothing', UnitPrice: 49.57, SellerName: 'Elisa',
                Country: 'USA', Date: '01/05/2019', UnitsSold: 296
            },
            {
                ProductCategory: 'Bikes', UnitPrice: 3.56, SellerName: 'Lydia',
                Country: 'Uruguay', Date: '01/06/2020', UnitsSold: 68
            },
            {
                ProductCategory: 'Accessories', UnitPrice: 85.58, SellerName: 'David',
                Country: 'USA', Date: '04/07/2021', UnitsSold: 293
            },
            {
                ProductCategory: 'Components', UnitPrice: 18.13, SellerName: 'John',
                Country: 'USA', Date: '12/08/2021', UnitsSold: 240
            },
            {
                ProductCategory: 'Clothing', UnitPrice: 68.33, SellerName: 'Larry',
                Country: 'Uruguay', Date: '05/12/2020', UnitsSold: 456
            },
            {
                ProductCategory: 'Clothing', UnitPrice: 16.05, SellerName: 'Walter',
                Country: 'Bulgaria', Date: '02/19/2020', UnitsSold: 492
            }];

        this.cellClasses = {
            test: this.callback,
            test2: this.callback1
        };

        this.pivotConfigHierarchy = {
            columns: [{
                memberName: 'Country',
                enabled: true
            },
            ],
            rows: [{
                memberName: 'All',
                memberFunction: () => 'All',
                enabled: true,
                childLevel: {
                    memberName: 'ProductCategory',
                    memberFunction: (data) => data.ProductCategory,
                    enabled: true
                }
            }],
            values: [
                {
                    member: 'UnitsSold',
                    aggregate: IgxPivotNumericAggregate.sum,
                    enabled: true,
                    // dataType: 'currency',
                    formatter: (value) => value ? value + '$' : undefined,
                    styles: this.cellClasses
                },
                {
                    member: 'UnitPrice',
                    aggregate: IgxPivotNumericAggregate.sum,
                    enabled: true,
                    dataType: 'currency'
                }
            ],
            filters: null
        };
    }
    public callback = (rowData: any, columnKey: any) => rowData[columnKey] >= 5;
    public callback1 = (rowData: any, columnKey: any) => rowData[columnKey] < 5;
}

@Component({
    template: `
    <igx-pivot-grid #grid [data]="data" [pivotConfiguration]="pivotConfigHierarchy"
        [rowSelection]="'single'" [columnSelection]="'single'">
    </igx-pivot-grid>`
})
export class IgxPivotGridTestComplexHierarchyComponent extends IgxPivotGridTestBaseComponent {
    constructor() {
        super();
        this.pivotConfigHierarchy = {
            columns: [

                {
                    memberName: 'Country',
                    enabled: true
                }
            ]
            ,
            rows: [{
                memberName: 'All cities',
                memberFunction: () => 'All Cities',
                enabled: true,
                childLevel: {
                    memberName: 'City',
                    enabled: true
                }
            }, {
                memberFunction: () => 'AllProducts',
                memberName: 'AllProducts',
                enabled: true,
                childLevel:
                {
                    memberFunction: (data) => data.ProductCategory,
                    memberName: 'ProductCategory',
                    enabled: true
                }
            }],
            values: [
                {
                    member: 'UnitsSold',
                    aggregate: IgxPivotNumericAggregate.sum,
                    enabled: true
                },
                {
                    member: 'AmountOfSale',
                    displayName: 'Amount of Sale',
                    aggregate: IgxTotalSaleAggregate.totalSale,
                    enabled: true
                }
            ]
        };
    }
}
