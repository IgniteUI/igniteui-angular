import { NoopPivotDimensionsStrategy } from '../../data-operations/pivot-strategy';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { IgxNumberSummaryOperand } from '../summaries/grid-summary';
import { IgxPivotDateDimension } from './pivot-grid-dimensions';
import { IPivotConfiguration } from './pivot-grid.interface';
import { IgxPivotColumnPipe, IgxPivotRowExpansionPipe, IgxPivotRowPipe } from './pivot-grid.pipes';

describe('Pivot pipes', () => {
    let rowPipe: IgxPivotRowPipe;
    let rowStatePipe: IgxPivotRowExpansionPipe;
    let columnPipe: IgxPivotColumnPipe;
    let expansionStates: Map<any, boolean>;
    let data: any[];
    let pivotConfig: IPivotConfiguration;

    configureTestSuite();
    beforeEach(() => {
        data = [
            { ProductCategory: 'Clothing', UnitPrice: 12.81, SellerName: 'Stanley',
             Country: 'Bulgaria', Date: '01/01/2021', UnitsSold: 282 },
            { ProductCategory: 'Clothing', UnitPrice: 49.57, SellerName: 'Elisa', Country: 'USA', Date: '01/05/2019', UnitsSold: 296 },
            { ProductCategory: 'Bikes', UnitPrice: 3.56, SellerName: 'Lydia', Country: 'Uruguay', Date: '01/06/2020', UnitsSold: 68 },
            { ProductCategory: 'Accessories', UnitPrice: 85.58, SellerName: 'David', Country: 'USA', Date: '04/07/2021', UnitsSold: 293 },
            { ProductCategory: 'Components', UnitPrice: 18.13, SellerName: 'John', Country: 'USA', Date: '12/08/2021', UnitsSold: 240 },
            { ProductCategory: 'Clothing', UnitPrice: 68.33, SellerName: 'Larry', Country: 'Uruguay', Date: '05/12/2020', UnitsSold: 456 },
            { ProductCategory: 'Clothing', UnitPrice: 16.05, SellerName: 'Walter',
             Country: 'Bulgaria', Date: '02/19/2020', UnitsSold: 492 }];
        pivotConfig = {
            columns: [{
                memberName: 'All',
                memberFunction: () => 'All',
                enabled: true,
                childLevel: {
                    memberName: 'Country',
                    enabled: true
                }
            }],
            rows: [{
                memberName: 'AllCategory',
                memberFunction: () => 'All',
                enabled: true,
                childLevel: {
                    memberName: 'ProductCategory',
                    memberFunction: (d) => d.ProductCategory,
                    enabled: true
                }
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
        expansionStates = new Map<any, boolean>();
        rowPipe = new IgxPivotRowPipe();
        rowStatePipe = new IgxPivotRowExpansionPipe();
        columnPipe = new IgxPivotColumnPipe();
    });

    it('transforms flat data to pivot data', () => {
        const rowPipeResult = rowPipe.transform(data, pivotConfig, expansionStates);
        const columnPipeResult = columnPipe.transform(rowPipeResult, pivotConfig, expansionStates);
        const rowStatePipeResult = rowStatePipe.transform(columnPipeResult, pivotConfig, expansionStates);
        expect(rowStatePipeResult).toEqual([
            { All: 2127, 'All-Bulgaria': 774, 'All-USA': 829, 'All-Uruguay': 524, AllCategory: 'All', AllCategory_level: 0 },
            { ProductCategory: 'Clothing', All: 1526, 'All-Bulgaria': 774, 'All-USA': 296, 'All-Uruguay': 456, ProductCategory_level: 1 },
            { ProductCategory: 'Bikes', All: 68, 'All-Uruguay': 68, ProductCategory_level: 1 },
            { ProductCategory: 'Accessories', All: 293, 'All-USA': 293, ProductCategory_level: 1 },
            { ProductCategory: 'Components', All: 240, 'All-USA': 240, ProductCategory_level: 1 }
        ]);
    });

    it('transforms flat data to pivot data single row dimension and no children are defined', () => {
        pivotConfig.rows = [{
            memberName: 'ProductCategory',
            enabled: true
        }];
        const rowPipeResult = rowPipe.transform(data, pivotConfig, expansionStates);
        expect(rowPipeResult).toEqual([
            {
                ProductCategory: 'Clothing', records: [
                    {
                        ProductCategory: 'Clothing', UnitPrice: 12.81, SellerName: 'Stanley',
                        Country: 'Bulgaria', Date: '01/01/2021', UnitsSold: 282
                    },
                    {
                        ProductCategory: 'Clothing', UnitPrice: 49.57, SellerName: 'Elisa',
                        Country: 'USA', Date: '01/05/2019', UnitsSold: 296
                    },
                    {
                        ProductCategory: 'Clothing', UnitPrice: 68.33, SellerName: 'Larry',
                        Country: 'Uruguay', Date: '05/12/2020', UnitsSold: 456
                    },
                    {
                        ProductCategory: 'Clothing', UnitPrice: 16.05, SellerName: 'Walter',
                        Country: 'Bulgaria', Date: '02/19/2020', UnitsSold: 492
                    }],
                ProductCategory_records: [
                    {
                        ProductCategory: 'Clothing', UnitPrice: 12.81, SellerName: 'Stanley',
                        Country: 'Bulgaria', Date: '01/01/2021', UnitsSold: 282
                    },
                    {
                        ProductCategory: 'Clothing', UnitPrice: 49.57, SellerName: 'Elisa',
                        Country: 'USA', Date: '01/05/2019', UnitsSold: 296
                    },
                    {
                        ProductCategory: 'Clothing', UnitPrice: 68.33, SellerName: 'Larry',
                        Country: 'Uruguay', Date: '05/12/2020', UnitsSold: 456
                    },
                    {
                        ProductCategory: 'Clothing', UnitPrice: 16.05, SellerName: 'Walter',
                        Country: 'Bulgaria', Date: '02/19/2020', UnitsSold: 492
                    }
                ], level: 0
            },
            {
                ProductCategory: 'Bikes', records: [
                    {
                        ProductCategory: 'Bikes', UnitPrice: 3.56, SellerName: 'Lydia',
                        Country: 'Uruguay', Date: '01/06/2020', UnitsSold: 68
                    }
                ], ProductCategory_records: [
                    {
                        ProductCategory: 'Bikes', UnitPrice: 3.56, SellerName: 'Lydia',
                        Country: 'Uruguay', Date: '01/06/2020', UnitsSold: 68
                    }
                ], level: 0
            },
            {
                ProductCategory: 'Accessories', records: [
                    {
                        ProductCategory: 'Accessories', UnitPrice: 85.58, SellerName: 'David',
                        Country: 'USA', Date: '04/07/2021', UnitsSold: 293
                    }
                ], ProductCategory_records: [
                    {
                        ProductCategory: 'Accessories', UnitPrice: 85.58, SellerName: 'David',
                        Country: 'USA', Date: '04/07/2021', UnitsSold: 293
                    }
                ], level: 0
            },
            {
                ProductCategory: 'Components', records: [
                    {
                        ProductCategory: 'Components', UnitPrice: 18.13, SellerName: 'John',
                        Country: 'USA', Date: '12/08/2021', UnitsSold: 240
                    }
                ], ProductCategory_records: [
                    {
                        ProductCategory: 'Components', UnitPrice: 18.13, SellerName: 'John',
                        Country: 'USA', Date: '12/08/2021', UnitsSold: 240
                    }
                ], level: 0
            }]);
        const columnPipeResult = columnPipe.transform(rowPipeResult, pivotConfig, expansionStates);
        const rowStatePipeResult = rowStatePipe.transform(columnPipeResult, pivotConfig, expansionStates);
        expect(rowStatePipeResult).toEqual([
            {
                ProductCategory: 'Clothing', All: 1526, 'All-Bulgaria': 774, 'All-USA': 296,
                'All-Uruguay': 456, ProductCategory_level: 0
            },
            { ProductCategory: 'Bikes', All: 68, 'All-Uruguay': 68, ProductCategory_level: 0 },
            { ProductCategory: 'Accessories', All: 293, 'All-USA': 293, ProductCategory_level: 0 },
            { ProductCategory: 'Components', All: 240, 'All-USA': 240, ProductCategory_level: 0 }
        ]);
    });

    it('allows setting expand/collapse state.', () => {
        const expanded = new Map<any, boolean>();
        expanded.set('All', false);
        const rowPipeResult = rowPipe.transform(data, pivotConfig, expanded);
        const columnPipeResult = columnPipe.transform(rowPipeResult, pivotConfig, expansionStates);
        const rowPipeCollapseResult = rowStatePipe.transform(columnPipeResult, pivotConfig, expanded);
        expect(rowPipeCollapseResult).toEqual([
            {
                AllCategory: 'All',
                AllCategory_level: 0,
                All: 2127,
                'All-Bulgaria': 774,
                'All-USA': 829,
                'All-Uruguay': 524
            }
        ]);

        expanded.set('All', true);
        const rowPipeExpandResult = rowStatePipe.transform(columnPipeResult, pivotConfig, expanded);
        expect(rowPipeExpandResult).toEqual([
            { AllCategory: 'All', All: 2127, 'All-Bulgaria': 774, 'All-USA': 829, 'All-Uruguay': 524, AllCategory_level: 0 },
            { ProductCategory: 'Clothing', All: 1526, 'All-Bulgaria': 774, 'All-USA': 296, 'All-Uruguay': 456, ProductCategory_level: 1 },
            { ProductCategory: 'Bikes', All: 68, 'All-Uruguay': 68, ProductCategory_level: 1 },
            { ProductCategory: 'Accessories', All: 293, 'All-USA': 293, ProductCategory_level: 1 },
            { ProductCategory: 'Components', All: 240, 'All-USA': 240, ProductCategory_level: 1 }]);
    });

    it('transforms flat data to pivot data multiple row dimensions', () => {
        pivotConfig.rows = [
            {
                memberName: 'ProductCategory',
                enabled: true
            },
            {
                memberName: 'Date',
                enabled: true
            }
        ];
        const rowPipeResult = rowPipe.transform(data, pivotConfig, expansionStates);
        const columnPipeResult = columnPipe.transform(rowPipeResult, pivotConfig, expansionStates);
        const rowStatePipeResult = rowStatePipe.transform(columnPipeResult, pivotConfig, expansionStates);
        expect(rowStatePipeResult).toEqual([
            { Date: '01/01/2021', ProductCategory: 'Clothing', All: 282, 'All-Bulgaria': 282, ProductCategory_level: 0, Date_level: 0 },
            { Date: '01/05/2019', ProductCategory: 'Clothing', All: 296, 'All-USA': 296, ProductCategory_level: 0, Date_level: 0 },
            { Date: '05/12/2020', ProductCategory: 'Clothing', All: 456, 'All-Uruguay': 456, ProductCategory_level: 0, Date_level: 0 },
            { Date: '02/19/2020', ProductCategory: 'Clothing', All: 492, 'All-Bulgaria': 492, ProductCategory_level: 0, Date_level: 0 },
            { Date: '01/06/2020', ProductCategory: 'Bikes', All: 68, 'All-Uruguay': 68, ProductCategory_level: 0, Date_level: 0 },
            { Date: '04/07/2021', ProductCategory: 'Accessories', All: 293, 'All-USA': 293, ProductCategory_level: 0, Date_level: 0 },
            { Date: '12/08/2021', ProductCategory: 'Components', All: 240, 'All-USA': 240, ProductCategory_level: 0, Date_level: 0 }]);
    });

    it('transforms flat data to pivot data with multiple nested row dimensions', () => {
        pivotConfig.rows = [{
            memberName: 'AllProd',
            memberFunction: () => 'AllProd',
            enabled: true,
            childLevel: {
                memberName: 'ProductCategory',
                enabled: true
            }
        },
        {
            memberName: 'AllDate',
            memberFunction: () => 'AllDate',
            enabled: true,
            childLevel: {
                memberName: 'Date',
                enabled: true
            }
        }];
        const rowPipeResult = rowPipe.transform(data, pivotConfig, expansionStates);
        const columnPipeResult = columnPipe.transform(rowPipeResult, pivotConfig, expansionStates);
        const rowStatePipeResult = rowStatePipe.transform(columnPipeResult, pivotConfig, expansionStates);
        expect(rowStatePipeResult).toEqual([
            {
                All: 2127, 'All-Bulgaria': 774, 'All-Uruguay': 524, 'All-USA': 829, AllDate: 'AllDate',
                AllDate_level: 0, AllProd: 'AllProd', AllProd_level: 0
            },
            { All: 282, 'All-Bulgaria': 282, AllProd: 'AllProd', AllProd_level: 0, Date: '01/01/2021', Date_level: 1 },
            { All: 296, 'All-USA': 296, AllProd: 'AllProd', AllProd_level: 0, Date: '01/05/2019', Date_level: 1 },
            { All: 456, 'All-Uruguay': 456, AllProd: 'AllProd', AllProd_level: 0, Date: '05/12/2020', Date_level: 1 },
            { All: 492, 'All-Bulgaria': 492, AllProd: 'AllProd', AllProd_level: 0, Date: '02/19/2020', Date_level: 1 },
            { All: 68, 'All-Uruguay': 68, AllProd: 'AllProd', AllProd_level: 0, Date: '01/06/2020', Date_level: 1 },
            { All: 293, 'All-USA': 293, AllProd: 'AllProd', AllProd_level: 0, Date: '04/07/2021', Date_level: 1 },
            { All: 240, 'All-USA': 240, AllProd: 'AllProd', AllProd_level: 0, Date: '12/08/2021', Date_level: 1 },
            {
                All: 1526, 'All-Bulgaria': 774, 'All-Uruguay': 456, 'All-USA': 296, AllDate: 'AllDate',
                AllDate_level: 0, ProductCategory: 'Clothing', ProductCategory_level: 1
            },
            { All: 282, 'All-Bulgaria': 282, Date: '01/01/2021', Date_level: 1, ProductCategory: 'Clothing', ProductCategory_level: 1 },
            { All: 296, 'All-USA': 296, Date: '01/05/2019', Date_level: 1, ProductCategory: 'Clothing', ProductCategory_level: 1 },
            { All: 456, 'All-Uruguay': 456, Date: '05/12/2020', Date_level: 1, ProductCategory: 'Clothing', ProductCategory_level: 1 },
            { All: 492, 'All-Bulgaria': 492, Date: '02/19/2020', Date_level: 1, ProductCategory: 'Clothing', ProductCategory_level: 1 },
            { All: 68, 'All-Uruguay': 68, AllDate: 'AllDate', AllDate_level: 0, ProductCategory: 'Bikes', ProductCategory_level: 1 },
            { All: 68, 'All-Uruguay': 68, Date: '01/06/2020', Date_level: 1, ProductCategory: 'Bikes', ProductCategory_level: 1 },
            { All: 293, 'All-USA': 293, AllDate: 'AllDate', AllDate_level: 0, ProductCategory: 'Accessories', ProductCategory_level: 1 },
            { All: 293, 'All-USA': 293, Date: '04/07/2021', Date_level: 1, ProductCategory: 'Accessories', ProductCategory_level: 1 },
            { All: 240, 'All-USA': 240, AllDate: 'AllDate', AllDate_level: 0, ProductCategory: 'Components', ProductCategory_level: 1 },
            { All: 240, 'All-USA': 240, Date: '12/08/2021', Date_level: 1, ProductCategory: 'Components', ProductCategory_level: 1 }
        ]);
    });

    it('transforms flat data to pivot data 2 column dimensions', () => {
        pivotConfig.columns = [{
            memberName: 'Country',
            enabled: true
        },
        {
            memberName: 'Date',
            enabled: true
        }];
        const rowPipeResult = rowPipe.transform(data, pivotConfig, new Map<any, boolean>());
        const columnPipeResult = columnPipe.transform(rowPipeResult, pivotConfig, new Map<any, boolean>());
        const rowStatePipeResult = rowStatePipe.transform(columnPipeResult, pivotConfig, new Map<any, boolean>());
        /* eslint-disable quote-props */
        expect(rowStatePipeResult).toEqual([
            {
                'AllCategory': 'All', 'AllCategory_level': 0, 'Bulgaria': 774, 'Bulgaria-01/01/2021': 282,
                'Bulgaria-02/19/2020': 492, 'USA': 829, 'USA-01/05/2019': 296, 'USA-04/07/2021': 293,
                'USA-12/08/2021': 240, 'Uruguay': 524, 'Uruguay-01/06/2020': 68, 'Uruguay-05/12/2020': 456
            },
            {
                'ProductCategory': 'Clothing', 'ProductCategory_level': 1, 'Bulgaria': 774,
                'Bulgaria-01/01/2021': 282, 'Bulgaria-02/19/2020': 492, 'USA': 296,
                'USA-01/05/2019': 296, 'Uruguay': 456, 'Uruguay-05/12/2020': 456
            },
            { 'ProductCategory': 'Bikes', 'ProductCategory_level': 1, 'Uruguay': 68, 'Uruguay-01/06/2020': 68 },
            { 'ProductCategory': 'Accessories', 'ProductCategory_level': 1, 'USA': 293, 'USA-04/07/2021': 293 },
            { 'ProductCategory': 'Components', 'ProductCategory_level': 1, 'USA': 240, 'USA-12/08/2021': 240 }]);
    });

    it('transforms flat data to pivot data 3 column dimensions', () => {
        pivotConfig.columns = [{
            memberName: 'Country',
            enabled: true
        },
        {
            memberName: 'SellerName',
            enabled: true
        },
        {
            memberName: 'Date',
            enabled: true
        }];
        const rowPipeResult = rowPipe.transform(data, pivotConfig, new Map<any, boolean>());
        const columnPipeResult = columnPipe.transform(rowPipeResult, pivotConfig, new Map<any, boolean>());
        const rowStateResult = rowStatePipe.transform(columnPipeResult, pivotConfig, new Map<any, boolean>());
        /* eslint-disable quote-props */
        expect(rowStateResult).toEqual([
            {
                'AllCategory': 'All', 'AllCategory_level': 0, 'Bulgaria': 774, 'Bulgaria-Stanley': 282,
                'Bulgaria-Stanley-01/01/2021': 282, 'Bulgaria-Walter': 492, 'Bulgaria-Walter-02/19/2020': 492, 'USA': 829, 'USA-Elisa': 296,
                'USA-Elisa-01/05/2019': 296, 'USA-David': 293, 'USA-David-04/07/2021': 293,
                'USA-John': 240, 'USA-John-12/08/2021': 240, 'Uruguay': 524, 'Uruguay-Larry': 456,
                'Uruguay-Larry-05/12/2020': 456, 'Uruguay-Lydia': 68,
                'Uruguay-Lydia-01/06/2020': 68
            }, {
                'ProductCategory': 'Clothing', 'ProductCategory_level': 1, 'Bulgaria': 774, 'Bulgaria-Stanley': 282,
                'Bulgaria-Stanley-01/01/2021': 282, 'Bulgaria-Walter': 492, 'Bulgaria-Walter-02/19/2020': 492, 'USA': 296, 'USA-Elisa': 296,
                'USA-Elisa-01/05/2019': 296, 'Uruguay': 456, 'Uruguay-Larry': 456, 'Uruguay-Larry-05/12/2020': 456
            },
            { 'ProductCategory': 'Bikes', 'ProductCategory_level': 1, 'Uruguay': 68, 'Uruguay-Lydia': 68, 'Uruguay-Lydia-01/06/2020': 68 },
            { 'ProductCategory': 'Accessories', 'ProductCategory_level': 1, 'USA': 293, 'USA-David': 293, 'USA-David-04/07/2021': 293 },
            { 'ProductCategory': 'Components', 'ProductCategory_level': 1, 'USA': 240, 'USA-John': 240, 'USA-John-12/08/2021': 240 }]);
    });

    it('transforms flat data to pivot data 2 value dimensions', () => {
        pivotConfig.values = [
            {
                member: 'UnitsSold',
                aggregate: IgxNumberSummaryOperand.sum,
                enabled: true
            },
            {
                member: 'UnitPrice',
                aggregate: IgxNumberSummaryOperand.sum,
                enabled: true
            }
        ];
        const rowPipeResult = rowPipe.transform(data, pivotConfig, expansionStates);
        const columnPipeResult = columnPipe.transform(rowPipeResult, pivotConfig, expansionStates);
        const rowStatePipeResult = rowStatePipe.transform(columnPipeResult, pivotConfig, new Map<any, boolean>());
        expect(rowStatePipeResult).toEqual([
            {
                'AllCategory': 'All', 'AllCategory_level': 0, 'All-UnitsSold': 2127,
                'All-Bulgaria-UnitsSold': 774, 'All-Bulgaria-UnitPrice': 28.86,
                'All-USA-UnitsSold': 829, 'All-USA-UnitPrice': 153.28, 'All-Uruguay-UnitsSold': 524, 'All-Uruguay-UnitPrice': 71.89,
                'All-UnitPrice': 254.02999999999997
            }, {
                'ProductCategory': 'Clothing', 'ProductCategory_level': 1, 'All-UnitsSold': 1526, 'All-Bulgaria-UnitsSold': 774,
                'All-Bulgaria-UnitPrice': 28.86, 'All-USA-UnitsSold': 296, 'All-USA-UnitPrice': 49.57, 'All-Uruguay-UnitsSold': 456,
                'All-Uruguay-UnitPrice': 68.33, 'All-UnitPrice': 146.76
            },
            {
                'ProductCategory': 'Bikes', 'ProductCategory_level': 1, 'All-UnitsSold': 68, 'All-Uruguay-UnitsSold': 68,
                'All-Uruguay-UnitPrice': 3.56, 'All-UnitPrice': 3.56
            },
            {
                'ProductCategory': 'Accessories', 'ProductCategory_level': 1, 'All-UnitsSold': 293, 'All-USA-UnitsSold': 293,
                'All-USA-UnitPrice': 85.58, 'All-UnitPrice': 85.58
            },
            {
                'ProductCategory': 'Components', 'ProductCategory_level': 1, 'All-UnitsSold': 240, 'All-USA-UnitsSold': 240,
                'All-USA-UnitPrice': 18.13, 'All-UnitPrice': 18.13
            }]);
    });

    it('allow setting NoopPivotDimensionsStrategy for rows/columns', () => {
        const preprocessedData = [
            {
                All: 2127, AllCategory: 'All', AllCategory_records: [
                    { ProductCategory: 'Clothing', All: 1526, 'All-Bulgaria': 774, 'All-USA': 296, 'All-Uruguay': 456 },
                    { ProductCategory: 'Bikes', All: 68, 'All-Uruguay': 68 },
                    { ProductCategory: 'Accessories', All: 293, 'All-USA': 293 },
                    { ProductCategory: 'Components', All: 240, 'All-USA': 240 }]
                , 'All-Bulgaria': 774, 'All-USA': 829, 'All-Uruguay': 524
            }];
        pivotConfig.columnStrategy = NoopPivotDimensionsStrategy.instance();
        pivotConfig.columns[0].memberName = 'All';
        pivotConfig.rowStrategy = NoopPivotDimensionsStrategy.instance();
        pivotConfig.rows[0].memberName = 'AllCategory';

        const rowPipeResult = rowPipe.transform(preprocessedData, pivotConfig, new Map<any, boolean>());
        const columnPipeResult = columnPipe.transform(rowPipeResult, pivotConfig, new Map<any, boolean>());
        const rowStateResult = rowStatePipe.transform(columnPipeResult, pivotConfig, new Map<any, boolean>());

        // same data but expanded
        expect(rowStateResult).toEqual(
            [
                { 'All': 2127, 'AllCategory': 'All', 'All-Bulgaria': 774, 'All-USA': 829,
                 'All-Uruguay': 524, 'AllCategory_level': 0 },
                { 'ProductCategory': 'Clothing', 'All': 1526, 'All-Bulgaria': 774,
                 'All-USA': 296, 'All-Uruguay': 456, 'ProductCategory_level': 1 },
                { 'ProductCategory': 'Bikes', 'All': 68, 'All-Uruguay': 68, 'ProductCategory_level': 1 },
                { 'ProductCategory': 'Accessories', 'All': 293, 'All-USA': 293, 'ProductCategory_level': 1 },
                { 'ProductCategory': 'Components', 'All': 240, 'All-USA': 240, 'ProductCategory_level': 1 }]
        );
    });

    it('should generate correct levels when using predefined date dimension', () => {
        data = [
            {
                ProductCategory: 'Clothing', UnitPrice: 12.81, SellerName: 'Stanley',
                Country: 'Bulgaria', City: 'Sofia', Date: '01/01/2021', UnitsSold: 282
            },
            {
                ProductCategory: 'Clothing', UnitPrice: 49.57, SellerName: 'Elisa',
                Country: 'USA', City: 'New York', Date: '01/05/2019', UnitsSold: 296
            },
            {
                ProductCategory: 'Bikes', UnitPrice: 3.56, SellerName: 'Lydia',
                Country: 'Uruguay', City: 'Ciudad de la Costa', Date: '01/06/2020', UnitsSold: 68
            },
            {
                ProductCategory: 'Accessories', UnitPrice: 85.58, SellerName: 'David',
                Country: 'USA', City: 'New York', Date: '04/07/2021', UnitsSold: 293
            },
            {
                ProductCategory: 'Components', UnitPrice: 18.13, SellerName: 'John',
                Country: 'USA', City: 'New York', Date: '12/08/2021', UnitsSold: 240
            },
            {
                ProductCategory: 'Clothing', UnitPrice: 68.33, SellerName: 'Larry',
                Country: 'Uruguay', City: 'Ciudad de la Costa', Date: '05/12/2020', UnitsSold: 456
            },
            {
                ProductCategory: 'Clothing', UnitPrice: 16.05, SellerName: 'Walter',
                Country: 'Bulgaria', City: 'Plovdiv', Date: '02/19/2020', UnitsSold: 492
            }];

        pivotConfig.rows = [
            new IgxPivotDateDimension(
                {
                    memberName: 'Date',
                    enabled: true
                },
                {
                    months: false
                }
            )
        ];

        const rowPipeResult = rowPipe.transform(data, pivotConfig, expansionStates);
        const columnPipeResult = columnPipe.transform(rowPipeResult, pivotConfig, new Map<any, boolean>());
        const rowStatePipeResult = rowStatePipe.transform(columnPipeResult, pivotConfig, expansionStates);

        expect(rowStatePipeResult[0]).toEqual(
            {
                AllPeriods: 'All Periods',
                AllPeriods_records: [
                    {
                        Years: '2021',
                        level: 1,
                        Years_level: 1
                    },
                    {
                        Date: '01/01/2021',
                        Date_level: 2,
                    },
                    {
                        Date: '04/07/2021',
                        Date_level: 2,
                    },
                    {
                        Date: '12/08/2021',
                        Date_level: 2,
                    },
                    {
                        Years: '2019',
                        Years_level: 1
                    },
                    {
                        Date: '01/05/2019',
                        Date_level: 2
                    },
                    {
                        Years: '2020',
                        Years_level: 1
                    },
                    {
                        Date: '01/06/2020',
                        Date_level: 2
                    },
                    {
                        Date: '05/12/2020',
                        Date_level: 2
                    },
                    {
                        Date: '02/19/2020',
                        level: 2,
                        Date_level: 2
                    }],
                level: 0,
                AllPeriods_level: 0
            });
    });

    it('should generate correct levels when using predefined date dimension with other row dimensions', () => {
        data = [
            {
                ProductCategory: 'Clothing', UnitPrice: 12.81, SellerName: 'Stanley',
                Country: 'Bulgaria', City: 'Sofia', Date: '01/01/2021', UnitsSold: 282
            },
            {
                ProductCategory: 'Clothing', UnitPrice: 49.57, SellerName: 'Elisa',
                Country: 'USA', City: 'New York', Date: '01/05/2019', UnitsSold: 296
            },
            {
                ProductCategory: 'Bikes', UnitPrice: 3.56, SellerName: 'Lydia',
                Country: 'Uruguay', City: 'Ciudad de la Costa', Date: '01/06/2020', UnitsSold: 68
            },
            {
                ProductCategory: 'Accessories', UnitPrice: 85.58, SellerName: 'David',
                Country: 'USA', City: 'New York', Date: '04/07/2021', UnitsSold: 293
            },
            {
                ProductCategory: 'Components', UnitPrice: 18.13, SellerName: 'John',
                Country: 'USA', City: 'New York', Date: '12/08/2021', UnitsSold: 240
            },
            {
                ProductCategory: 'Clothing', UnitPrice: 68.33, SellerName: 'Larry',
                Country: 'Uruguay', City: 'Ciudad de la Costa', Date: '05/12/2020', UnitsSold: 456
            },
            {
                ProductCategory: 'Clothing', UnitPrice: 16.05, SellerName: 'Walter',
                Country: 'Bulgaria', City: 'Plovdiv', Date: '02/19/2020', UnitsSold: 492
            }];
        pivotConfig.rows = [
            new IgxPivotDateDimension(
                {
                    memberName: 'Date',
                    enabled: true
                },
                {
                    months: false
                }
            ),
            {
                memberName: 'City',
                enabled: true
            },
            {
                memberFunction: () => 'All',
                memberName: 'AllProducts',
                enabled: true,
                childLevel: {
                    memberName: 'ProductCategory',
                    enabled: true
                }
            }
        ];

        const rowPipeResult = rowPipe.transform(data, pivotConfig, expansionStates);
        const columnPipeResult = columnPipe.transform(rowPipeResult, pivotConfig, new Map<any, boolean>());
        const rowStatePipeResult = rowStatePipe.transform(columnPipeResult, pivotConfig, expansionStates);
        expect(rowStatePipeResult.length).toEqual(44);
        expect(rowStatePipeResult[0]['AllPeriods']).toEqual('All Periods');
        expect(rowStatePipeResult[0]['AllPeriods_records'].length).toEqual(10);
        expect(rowStatePipeResult[0]['AllProducts']).toEqual('All');
        expect(rowStatePipeResult[0]['ProductCategory']).not.toBeDefined();
        expect(rowStatePipeResult[0]['AllProducts_records'].length).toEqual(1);
        expect(rowStatePipeResult[0]['AllProducts_records'][0]['ProductCategory']).toEqual('Clothing');
        expect(rowStatePipeResult[0]['City']).toEqual('Sofia');
        expect(rowStatePipeResult[0]['City_records'].length).toEqual(1);
        expect(rowStatePipeResult[0]['level']).toEqual(0);

        expect(rowStatePipeResult[1]['AllPeriods']).toEqual('All Periods');
        expect(rowStatePipeResult[1]['AllPeriods_records'].length).toEqual(10);
        expect(rowStatePipeResult[1]['AllProducts']).not.toBeDefined();
        expect(rowStatePipeResult[1]['AllProducts_records'].length).toEqual(0);
        expect(rowStatePipeResult[1]['ProductCategory']).toEqual('Clothing');
        expect(rowStatePipeResult[1]['City']).toEqual('Sofia');
        expect(rowStatePipeResult[1]['City_records'].length).toEqual(1);
        expect(rowStatePipeResult[1]['level']).toEqual(1);

        expect(rowStatePipeResult[2]['level']).toEqual(0);

        expect(rowStatePipeResult[10]['AllPeriods']).not.toBeDefined();
        expect(rowStatePipeResult[10]['AllPeriods_records']).not.toBeDefined();
        expect(rowStatePipeResult[10]['ProductCategory']).not.toBeDefined();
        expect(rowStatePipeResult[10]['AllProducts']).toEqual('All');
        expect(rowStatePipeResult[10]['AllProducts_records'].length).toEqual(1);
        expect(rowStatePipeResult[10]['AllProducts_records'][0]['ProductCategory']).toEqual('Clothing');
        expect(rowStatePipeResult[10]['City']).toEqual('Sofia');
        expect(rowStatePipeResult[10]['City_records'].length).toEqual(2);
        expect(rowStatePipeResult[10]['Years']).toEqual('2021');
        expect(rowStatePipeResult[10]['Years_records'].length).toEqual(3);
        expect(rowStatePipeResult[10]['Years_level']).toEqual(1);
        expect(rowStatePipeResult[10]['level']).toEqual(0);

        expect(rowStatePipeResult[11]['AllPeriods']).not.toBeDefined();
        expect(rowStatePipeResult[11]['AllPeriods_records']).not.toBeDefined();
        expect(rowStatePipeResult[11]['ProductCategory']).toEqual('Clothing');
        expect(rowStatePipeResult[11]['ProductCategory_records'].length).toEqual(1);
        expect(rowStatePipeResult[11]['AllProducts']).not.toBeDefined();
        expect(rowStatePipeResult[11]['AllProducts_records'].length).toEqual(0);
        expect(rowStatePipeResult[11]['City']).toEqual('Sofia');
        expect(rowStatePipeResult[11]['City_records'].length).toEqual(2);
        expect(rowStatePipeResult[11]['Years']).toEqual('2021');
        expect(rowStatePipeResult[11]['Years_records'].length).toEqual(3);
        expect(rowStatePipeResult[11]['Years_level']).toEqual(1);
        expect(rowStatePipeResult[11]['level']).toEqual(1);

        expect(rowStatePipeResult[15]['AllPeriods']).not.toBeDefined();
        expect(rowStatePipeResult[15]['AllPeriods_records']).not.toBeDefined();
        expect(rowStatePipeResult[15]['ProductCategory']).not.toBeDefined();
        expect(rowStatePipeResult[15]['ProductCategory_records']).not.toBeDefined();
        expect(rowStatePipeResult[15]['AllProducts']).toEqual('All');
        expect(rowStatePipeResult[15]['AllProducts_records'].length).toEqual(1);
        expect(rowStatePipeResult[15]['City']).toEqual('Sofia');
        expect(rowStatePipeResult[15]['City_records'].length).toEqual(1);
        expect(rowStatePipeResult[15]['Years']).not.toBeDefined();
        expect(rowStatePipeResult[15]['Years_records']).not.toBeDefined();
        expect(rowStatePipeResult[15]['Date']).toEqual('01/01/2021');
        expect(rowStatePipeResult[15]['Date_records'][0]).toEqual(
            {
                'ProductCategory': 'Clothing', 'UnitPrice': 12.81, 'SellerName': 'Stanley',
                'Country': 'Bulgaria', 'City': 'Sofia', 'Date': '01/01/2021', 'UnitsSold': 282, 'Date_level': 2, 'AllProducts_level': 0
            }
        );
        expect(rowStatePipeResult[15]['level']).toEqual(2);
    });
});
