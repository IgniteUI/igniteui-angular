import { Component, ViewChild } from '@angular/core';
import { IgxNumberSummaryOperand, IgxPivotGridComponent, IPivotConfiguration, NoopPivotDimensionsStrategy } from 'igniteui-angular';
import { HIERARCHICAL_SAMPLE_DATA } from '../shared/sample-data';

@Component({
    providers: [],
    selector: 'app-tree-grid-sample',
    styleUrls: ['pivot-grid.sample.css'],
    templateUrl: 'pivot-grid.sample.html'
})

export class PivotGridSampleComponent {
    @ViewChild('grid1', { static: true }) public grid1: IgxPivotGridComponent;


    public pivotConfigHierarchy: IPivotConfiguration = {
        columns: [
            {
            member: 'Country',
            enabled: true
        }
        ]
,
        rows: [{
            member: () => 'AllProd',
            enabled: true,
            childLevels: [{
            member: 'ProductCategory',
            enabled: true,
            childLevels: []
            }]
        },
        {
            member: () => 'AllDate',
            enabled: true,
            childLevels: [{
            member: 'Date',
            enabled: true,
            childLevels: []
            }]
        }],
        values: [
            {
                member: 'UnitsSold',
                aggregate: IgxNumberSummaryOperand.sum,
                enabled: true
            }
        ],
        filters: null
    };

    public pivotConfigRemoteHierarchy: IPivotConfiguration = {
        columnStrategy: NoopPivotDimensionsStrategy.instance(),
        rowStrategy: NoopPivotDimensionsStrategy.instance(),
        columns: [{
            fieldName: 'All',
            member: () => 'All',
            enabled: true,
            childLevels:[
                {
            member: 'Country',
            enabled: true}]
        }
        ]
,
        rows: [{
            fieldName: 'All',
            member: () => 'All',
            enabled: true,
            childLevels:[
                {
                    fieldName: 'ProductCategory',
                    member: (data) => data.ProductCategory,
                    enabled: true,
                    childLevels:[]
                }
            ]
        }],
        values: [
            {
                member: 'UnitsSold',
                aggregate: IgxNumberSummaryOperand.sum,
                enabled: true
            }
        ],
        filters: null
    };

    public origData = [
        { ProductCategory: 'Clothing', UnitPrice: 12.81, SellerName: 'Stanley', Country: 'Bulgaria', Date: '01/01/2021', UnitsSold: 282 },
        { ProductCategory: 'Clothing', UnitPrice: 49.57, SellerName: 'Elisa', Country: 'USA', Date: '01/05/2019', UnitsSold: 296 },
        { ProductCategory: 'Bikes', UnitPrice: 3.56, SellerName: 'Lydia', Country: 'Uruguay', Date: '01/06/2020', UnitsSold: 68 },
        { ProductCategory: 'Accessories', UnitPrice: 85.58, SellerName: 'David', Country: 'USA', Date: '04/07/2021', UnitsSold: 293 },
        { ProductCategory: 'Components', UnitPrice: 18.13, SellerName: 'John', Country: 'USA', Date: '12/08/2021', UnitsSold: 240 },
        { ProductCategory: 'Clothing', UnitPrice: 68.33, SellerName: 'Larry', Country: 'Uruguay', Date: '05/12/2020', UnitsSold: 456 },
        { ProductCategory: 'Clothing', UnitPrice: 16.05, SellerName: 'Walter', Country: 'Bulgaria', Date: '02/19/2020', UnitsSold: 492 }
    ];
    // note: this is the potential processed by the pipes data
    // used just for testing purposes until the pipes are fully implemented
    public data = [
        { ProductCategory: 'Clothing', Bulgaria: 774, USA: 296, Uruguay: 456 },
        { ProductCategory: 'Bikes', Uruguay: 68 },
        { ProductCategory: 'Accessories', USA: 293 },
        { ProductCategory: 'Components', USA: 240 }
    ];

    public dataHierarchical =  [
        {All:2127,records:[
            {ProductCategory:'Clothing', level:1, ProductCategory_level: 1, All:1526,'All-Bulgaria':774,'All-USA':296,'All-Uruguay':456},
            {ProductCategory:'Bikes', level:1, ProductCategory_level: 1, All:68,'All-Uruguay':68},
            {ProductCategory:'Accessories',level:1, ProductCategory_level: 1, All:293,'All-USA':293},
            {ProductCategory:'Components', level:1, ProductCategory_level: 1, All:240,'All-USA':240}]
            , level:0, All_level: 0,'All-Bulgaria':774,'All-USA':829,'All-Uruguay':524}];
}
