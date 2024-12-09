import { Component, ViewChild } from '@angular/core';
import { IGridState, IPivotConfiguration, IPivotDimension, IPivotUISettings, IPivotValue, IgxButtonDirective, IgxGridStateDirective, IgxPivotGridComponent, IgxPivotNumericAggregate, NoopPivotDimensionsStrategy, NoopSortingStrategy, PivotRowLayoutType } from 'igniteui-angular';

import { take } from 'rxjs/operators';



export class MyRowStrategy extends NoopPivotDimensionsStrategy {
    public override process(collection: any[], _: IPivotDimension[], __: IPivotValue[]): any[] {
        return collection;
    }
}

export class MyColumnStrategy extends NoopPivotDimensionsStrategy {
    public override process(collection: any[], _: IPivotDimension[], __: IPivotValue[]): any[] {
        return collection;
    }
}


@Component({
    providers: [],
    selector: 'app-tree-grid-sample',
    styleUrls: ['pivot-grid-noop.sample.scss'],
    templateUrl: 'pivot-grid-noop.sample.html',
    imports: [IgxPivotGridComponent, IgxGridStateDirective, IgxButtonDirective]
})

export class PivotGridNoopSampleComponent {
    @ViewChild('grid1', { static: true }) public grid1: IgxPivotGridComponent;
    public myStrategy = NoopSortingStrategy.instance();
    public myState: IGridState;
    public pivotUI: IPivotUISettings = { showConfiguration: true, showRowHeaders: true, rowLayout: PivotRowLayoutType.Horizontal };

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

    public configDifferentSeparator: IPivotConfiguration = {
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

    public data = [
        {
            AllProducts: 'All Products', All: 2127, 'Bulgaria': 774, 'USA': 829, 'Uruguay': 524, 'AllProducts_records': [
                { ProductCategory: 'Clothing', All: 1523, 'Bulgaria': 774, 'USA': 296, 'Uruguay': 456, },
                { ProductCategory: 'Bikes', All: 68, 'Uruguay': 68 },
                { ProductCategory: 'Accessories', All: 293, 'USA': 293 },
                { ProductCategory: 'Components', All: 240, 'USA': 240 }
            ]
        }
    ];

    @ViewChild(IgxGridStateDirective, { static: true })
    public state!: IgxGridStateDirective;

    public saveState() {
        const state = this.state.getState() as string;
        this.myState = this.state.getState(false) as IGridState;
        window.sessionStorage.setItem('grid-state', state);
    }

    public restoreState() {
        const state = window.sessionStorage.getItem('grid-state');
        this.state.stateParsed.pipe(take(1)).subscribe(parsedState => {
            parsedState.sorting.forEach(x => x.strategy = NoopSortingStrategy.instance());
            parsedState.pivotConfiguration.rowStrategy = NoopPivotDimensionsStrategy.instance();
            parsedState.pivotConfiguration.columnStrategy = NoopPivotDimensionsStrategy.instance();
        });
        this.state.setState(state as string);
    }

    public restoreStateFromObject() {
        this.myState.sorting?.forEach(x => x.strategy = NoopSortingStrategy.instance());
        this.myState.pivotConfiguration.rowStrategy = NoopPivotDimensionsStrategy.instance();
        this.myState.pivotConfiguration.columnStrategy = NoopPivotDimensionsStrategy.instance();
        this.state.setState(this.myState);
    }

}
