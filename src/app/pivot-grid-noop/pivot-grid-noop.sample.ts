import { Component, ViewChild } from '@angular/core';
import {
    IgxPivotGridComponent, IgxPivotNumericAggregate, IPivotConfiguration, IPivotDimension,
    IPivotValue,
    NoopPivotDimensionsStrategy
} from 'igniteui-angular';



export class MyRowStrategy extends NoopPivotDimensionsStrategy {
    public process(collection: any[], _: IPivotDimension[], __: IPivotValue[]): any[] {
        return collection;
    }
}

export class MyColumnStrategy extends NoopPivotDimensionsStrategy {
    public process(collection: any[], _: IPivotDimension[], __: IPivotValue[]): any[] {
        return collection;
    }
}


@Component({
    providers: [],
    selector: 'app-tree-grid-sample',
    styleUrls: ['pivot-grid-noop.sample.css'],
    templateUrl: 'pivot-grid-noop.sample.html'
})

export class PivotGridNoopSampleComponent {
    @ViewChild('grid1', { static: true }) public grid1: IgxPivotGridComponent;
    public pivotConfigHierarchy: IPivotConfiguration = {
        pivotKeys: {
            aggregations: 'aggregations',
            records: 'records',
            children: 'children',
            level: 'level',
            columnDimensionSeparator: '_',
            rowDimensionSeparator: '-'
        },
        columnStrategy: NoopPivotDimensionsStrategy.instance(),
        rowStrategy: NoopPivotDimensionsStrategy.instance(),
        columns: [
            {
                memberName: 'All',
                memberFunction: () => 'All',
                enabled: true,
                childLevel: {
                    memberName: 'Country',
                    enabled: true
                }
            }
        ]
        ,
        rows: [
            {
                memberName: 'AllProducts',
                memberFunction: () => 'All Products',
                enabled: true,
                childLevel: {
                    memberName: 'ProductCategory',
                    enabled: true
                }
            }
        ],
        values: [
            {
                member: 'UnitsSold',
                aggregate: {
                    aggregator: IgxPivotNumericAggregate.sum,
                    key: 'sum',
                    label: 'Sum'
                },
                enabled: true
            },
        ],
        filters: null
    };

    public mockRemoteData = [
        {
            AllProducts: 'All Products', All: 1000, 'All-Bulgaria': 774, 'All-USA': 829, 'All-Uruguay': 524, AllProducts_records: [
                { ProductCategory: 'Clothing', 'All-Bulgaria': 774, 'All-USA': 296, 'All-Uruguay': 456 },
                { ProductCategory: 'Bikes', 'All-Uruguay': 68 },
                { ProductCategory: 'Accessories', 'All-USA': 293 },
                { ProductCategory: 'Components', 'All-USA': 240 }
            ]
        }
    ];


    public mockRemoteDataDifferentSeparator = [
        {
            AllProducts: 'All Products', All: 2127, 'All_Country-Bulgaria': 774, 'All_Country-USA': 829, 'All_Country-Uruguay': 524, 'AllProducts-records': [
                { ProductCategory: 'Clothing', All: 1523, 'All_Country-Bulgaria': 774, 'All_Country-USA': 296, 'All_Country-Uruguay': 456,  },
                { ProductCategory: 'Bikes', All: 68, 'All_Country-Uruguay': 68 },
                { ProductCategory: 'Accessories', All: 293, 'All_Country-USA': 293 },
                { ProductCategory: 'Components', All: 240, 'All_Country-USA': 240 }
            ]
        }
    ];

}
