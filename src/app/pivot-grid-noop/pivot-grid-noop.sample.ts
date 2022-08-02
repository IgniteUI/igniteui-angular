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
    columnStrategy: NoopPivotDimensionsStrategy.instance(),
    rowStrategy: NoopPivotDimensionsStrategy.instance(),
    columns: [
      {
        memberName: 'Country',
        enabled: true
      },
    ]
    ,
    rows: [
      {
        memberFunction: () => 'All',
        memberName: 'AllProducts',
        enabled: true,
        width: '25%',
        childLevel: {
          memberName: 'ProductCategory',
          enabled: true
        }
      },
      {
        memberName: 'AllSeller',
        memberFunction: () => 'All Sellers',
        enabled: true,
        childLevel: {
          enabled: true,
          memberName: 'SellerName'
        }
      },
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

  public mockData = [
    {
      'AllProducts': 'All', 'USA': 829, 'Uruguay': 524, 'Bulgaria': 282,
      'AllSeller_records': [
        {
          'AllSeller': 'All Sellers',
          'USA': 829, 'Uruguay': 524, 'Bulgaria': 282,
          'AllSeller_records': [
            { 'SellerName': 'David', 'USA': 293 },
            { 'SellerName': 'Lydia', 'Uruguay': 68 },
            { 'SellerName': 'Elisa', 'USA': 296 },
            { 'SellerName': 'Larry', 'Uruguay': 456 },
            { 'SellerName': 'Stanley', 'Bulgaria': 282 },
            { 'SellerName': 'John', 'USA': 240 }
          ]
        }
      ],
      'AllProducts_records': [
        {
          'ProductCategory': 'Accessories',
          'USA': 293,
          'AllSeller_records': [
            {
              'AllSeller': 'All Sellers', 'USA': 293,
              'AllSeller_records': [{ 'SellerName': 'David', 'USA': 293 }]
            }
          ],
        },
        {
          'ProductCategory': 'Bikes', 'Uruguay': 68,
          'AllSeller_records': [
            {
              'AllSeller': 'All Sellers', 'Uruguay': 68,
              'AllSeller_records': [{ 'SellerName': 'Lydia', 'Uruguay': 68 }]
            }
          ]
        },
        {
          'ProductCategory': 'Clothing', 'USA': 296, 'Uruguay': 456, 'Bulgaria': 282,
          'AllSeller_records': [
            {
              'AllSeller': 'All Sellers', 'USA': 296, 'Uruguay': 456, 'Bulgaria': 282,
              'AllSeller_records': [
                { 'SellerName': 'Elisa', 'USA': 296 },
                { 'SellerName': 'Larry', 'Uruguay': 456 },
                { 'SellerName': 'Stanley', 'Bulgaria': 282 }
              ]
            }
          ]
        },
        {
          'ProductCategory': 'Components', 'USA': 240,
          'AllSeller_records': [
            {
              'AllSeller': 'All Sellers', 'USA': 240,
              'AllSeller_records': [
                {
                  'SellerName': 'John', 'USA': 240
                }]
            }
          ]
        }
      ],
    }
  ];

  public mockRemoteDataDifferentSeparator = [
    {
      AllProducts: 'All Products', All: 2127, 'All_Country-Bulgaria': 774, 'All_Country-USA': 829, 'All_Country-Uruguay': 524, 'AllProducts-records': [
        { ProductCategory: 'Clothing', All: 1523, 'All_Country-Bulgaria': 774, 'All_Country-USA': 296, 'All_Country-Uruguay': 456, },
        { ProductCategory: 'Bikes', All: 68, 'All_Country-Uruguay': 68 },
        { ProductCategory: 'Accessories', All: 293, 'All_Country-USA': 293 },
        { ProductCategory: 'Components', All: 240, 'All_Country-USA': 240 }
      ]
    }
  ];

}
