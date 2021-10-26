import { Component, ViewChild } from '@angular/core';
import { IgxNumberSummaryOperand, IgxPivotGridComponent, IPivotConfiguration } from 'igniteui-angular';
import { HIERARCHICAL_SAMPLE_DATA } from '../shared/sample-data';

@Component({
    providers: [],
    selector: 'app-tree-grid-sample',
    styleUrls: ['pivot-grid.sample.scss'],
    templateUrl: 'pivot-grid.sample.html'
})

export class PivotGridSampleComponent {
    @ViewChild('grid1', { static: true }) public grid1: IgxPivotGridComponent;

    public pivotConfigHierarchy: IPivotConfiguration = {
        columns: [

        {
            member: 'Country',
            enabled: true,
            childLevels: []
        }
        ]
,
rows: [
    {
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
    },
{
        member: 'SellerName',
        enabled: true,
        childLevels: []
        }
    ],
        values: [
            {
                member: 'UnitsSold',
                aggregate: IgxNumberSummaryOperand.sum,
                enabled: true,
                styles: {
                    upFont: (rowData: any, columnKey: any): boolean => rowData[columnKey] > 300,
                    downFont: (rowData: any, columnKey: any): boolean => rowData[columnKey] <= 300
                },
                // dataType: 'currency',
                formatter: (value) => value ? value + '$' : undefined
            },
            // {
            //     member: 'UnitPrice',
            //     aggregate: IgxNumberSummaryOperand.sum,
            //     enabled: true
            // }
        ],
        filters: null
    };

    public origData =  [
        { ProductCategory: 'Clothing', UnitPrice: 12.81, SellerName: 'Stanley Brooker',
         Country: 'Bulgaria', City: 'Plovdiv', Date: '01/01/2012', UnitsSold: 282 },
    { ProductCategory: 'Clothing', UnitPrice: 49.57, SellerName: 'Elisa Longbottom',
     Country: 'US', City: 'New York', Date: '01/05/2013', UnitsSold: 296 },
    { ProductCategory: 'Bikes', UnitPrice: 3.56, SellerName: 'Lydia Burson',
     Country: 'Uruguay', City: 'Ciudad de la Costa', Date: '01/06/2011', UnitsSold: 68 },
    { ProductCategory: 'Accessories', UnitPrice: 85.58, SellerName: 'David Haley',
     Country: 'UK', City: 'London', Date: '04/07/2012', UnitsSold: 293 },
    { ProductCategory: 'Components', UnitPrice: 18.13, SellerName: 'John Smith',
     Country: 'Japan', City: 'Yokohama', Date: '12/08/2012', UnitsSold: 240 },
    { ProductCategory: 'Clothing', UnitPrice: 68.33, SellerName: 'Larry Lieb',
     Country: 'Uruguay', City: 'Ciudad de la Costa', Date: '05/12/2011', UnitsSold: 456 },
    { ProductCategory: 'Components', UnitPrice: 16.05, SellerName: 'Walter Pang',
     Country: 'Bulgaria', City: 'Sofia', Date: '02/19/2013', UnitsSold: 492 }];
}
