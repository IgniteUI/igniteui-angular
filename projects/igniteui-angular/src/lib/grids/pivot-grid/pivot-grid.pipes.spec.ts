import { NoopPivotDimensionsStrategy } from '../../data-operations/pivot-strategy';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { IgxNumberSummaryOperand } from '../summaries/grid-summary';
import { IgxPivotNumericAggregate } from './pivot-grid-aggregate';
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
        { ProductCategory: 'Clothing', UnitPrice: 12.81, SellerName: 'Stanley', Country: 'Bulgaria', Date: '01/01/2021', UnitsSold: 282 },
        { ProductCategory: 'Clothing', UnitPrice: 49.57, SellerName: 'Elisa', Country: 'USA', Date: '01/05/2019', UnitsSold: 296 },
        { ProductCategory: 'Bikes', UnitPrice: 3.56, SellerName: 'Lydia', Country: 'Uruguay', Date: '01/06/2020', UnitsSold: 68 },
        { ProductCategory: 'Accessories', UnitPrice: 85.58, SellerName: 'David', Country: 'USA', Date: '04/07/2021', UnitsSold: 293 },
        { ProductCategory: 'Components', UnitPrice: 18.13, SellerName: 'John', Country: 'USA', Date: '12/08/2021', UnitsSold: 240 },
        { ProductCategory: 'Clothing', UnitPrice: 68.33, SellerName: 'Larry', Country: 'Uruguay', Date: '05/12/2020', UnitsSold: 456 },
        { ProductCategory: 'Clothing', UnitPrice: 16.05, SellerName: 'Walter', Country: 'Bulgaria', Date: '02/19/2020', UnitsSold: 492 }];
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
                memberName: 'All',
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
                    aggregate: {
                        aggregator: IgxNumberSummaryOperand.sum,
                        key: 'sum',
                        label: 'Sum'
                    },
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
        const rowStatePipeResult = rowStatePipe.transform(rowPipeResult, pivotConfig, expansionStates);
        const columnPipeResult = columnPipe.transform(rowStatePipeResult, pivotConfig, expansionStates);
        expect(columnPipeResult).toEqual([
            { All: 2127, 'All-Bulgaria': 774, 'All-USA': 829, 'All-Uruguay': 524, All_level: 0 },
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
        expect(columnPipeResult).toEqual([
            {
                ProductCategory: 'Clothing', All: 1526, 'All-Bulgaria': 774, 'All-USA': 296,
                'All-Uruguay': 456
            },
            { ProductCategory: 'Bikes', All: 68, 'All-Uruguay': 68 },
            { ProductCategory: 'Accessories', All: 293, 'All-USA': 293 },
            { ProductCategory: 'Components', All: 240, 'All-USA': 240 }
        ]);
    });

    it('allows setting expand/collapse state.', () => {
        const expanded = new Map<any, boolean>();
        expanded.set('All', false);
        const rowPipeResult = rowPipe.transform(data, pivotConfig, expanded);
        const rowPipeCollapseResult = rowStatePipe.transform(rowPipeResult, pivotConfig, expanded);
        expect(rowPipeCollapseResult).toEqual([
            {
                All: 'All', All_records: [
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
                            }
                        ], ProductCategory_records: [
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
                        ], level: 1
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
                        ], level: 1
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
                        ], level: 1
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
                        ], level: 1
                    }], level: 0,
                records: [
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
                    }
                ], All_level: 0
            }]);

        expanded.set('All', true);
        const rowPipeExpandResult = rowStatePipe.transform(rowPipeResult, pivotConfig, expanded);
        expect(rowPipeExpandResult).toEqual([
            {
                All: 'All', All_records: [
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
                            }
                        ], ProductCategory_records: [
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
                        ], level: 1, ProductCategory_level: 1
                    },
                    {
                        ProductCategory: 'Bikes', records: [
                            {
                                ProductCategory: 'Bikes', UnitPrice: 3.56, SellerName: 'Lydia',
                                Country: 'Uruguay', Date: '01/06/2020', UnitsSold: 68
                            }],
                        ProductCategory_records: [
                            {
                                ProductCategory: 'Bikes', UnitPrice: 3.56, SellerName: 'Lydia',
                                Country: 'Uruguay', Date: '01/06/2020', UnitsSold: 68
                            }
                        ], level: 1, ProductCategory_level: 1
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
                        ], level: 1, ProductCategory_level: 1
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
                        ], level: 1, ProductCategory_level: 1
                    }],
                level: 0, records: [
                    {
                        ProductCategory: 'Clothing', UnitPrice: 12.81, SellerName: 'Stanley', Country: 'Bulgaria',
                        Date: '01/01/2021', UnitsSold: 282
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
                    }
                ], All_level: 0
            }, {
                ProductCategory: 'Clothing', records: [
                    {
                        ProductCategory: 'Clothing', UnitPrice: 12.81, SellerName: 'Stanley', Country: 'Bulgaria',
                        Date: '01/01/2021', UnitsSold: 282
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
                ], ProductCategory_records: [
                    {
                        ProductCategory: 'Clothing', UnitPrice: 12.81, SellerName: 'Stanley', Country: 'Bulgaria',
                        Date: '01/01/2021', UnitsSold: 282
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
                ], level: 1, ProductCategory_level: 1
            }, {
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
                ], level: 1, ProductCategory_level: 1
            }, {
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
                ], level: 1, ProductCategory_level: 1
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
                ], level: 1, ProductCategory_level: 1
            }]);
    });

    it('transforms flat data to pivot data multiple row dimensions', () => {
        pivotConfig.rows = [{
            memberName: 'ProductCategory',
            enabled: true
        },
        {
            memberName: 'Date',
            enabled: true
        }];
        const rowPipeResult = rowPipe.transform(data, pivotConfig, expansionStates);
        const rowStatePipeResult = rowStatePipe.transform(rowPipeResult, pivotConfig, expansionStates);

        expect(rowStatePipeResult).toEqual([
            {
                Date: '01/01/2021', records: [
                    {
                        ProductCategory: 'Clothing', UnitPrice: 12.81, SellerName: 'Stanley',
                        Country: 'Bulgaria', Date: '02/19/2020', UnitsSold: 282
                    }
                ], Date_records: [
                    {
                        ProductCategory: 'Clothing', UnitPrice: 12.81, SellerName: 'Stanley',
                        Country: 'Bulgaria', Date: '02/19/2020', UnitsSold: 282
                    }
                ], level: 0, ProductCategory: 'Clothing', ProductCategory_records: [
                    {
                        ProductCategory: 'Clothing', UnitPrice: 12.81, SellerName: 'Stanley',
                        Country: 'Bulgaria', Date: '02/19/2020', UnitsSold: 282
                    },
                    {
                        ProductCategory: 'Clothing', UnitPrice: 49.57, SellerName: 'Elisa',
                        Country: 'USA', Date: '02/19/2020', UnitsSold: 296
                    },
                    {
                        ProductCategory: 'Clothing', UnitPrice: 68.33, SellerName: 'Larry',
                        Country: 'Uruguay', Date: '02/19/2020', UnitsSold: 456
                    },
                    {
                        ProductCategory: 'Clothing', UnitPrice: 16.05, SellerName: 'Walter',
                        Country: 'Bulgaria', Date: '02/19/2020', UnitsSold: 492
                    }],
                ProductCategory_level: 0, Date_level: 0
            },
            {
                Date: '01/05/2019', records: [
                    {
                        ProductCategory: 'Clothing', UnitPrice: 49.57, SellerName: 'Elisa',
                        Country: 'USA', Date: '02/19/2020', UnitsSold: 296
                    }
                ], Date_records: [
                    {
                        ProductCategory: 'Clothing', UnitPrice: 49.57, SellerName: 'Elisa',
                        Country: 'USA', Date: '02/19/2020', UnitsSold: 296
                    }
                ], level: 0, ProductCategory: 'Clothing', ProductCategory_records: [
                    {
                        ProductCategory: 'Clothing', UnitPrice: 12.81, SellerName: 'Stanley',
                        Country: 'Bulgaria', Date: '02/19/2020', UnitsSold: 282
                    },
                    {
                        ProductCategory: 'Clothing', UnitPrice: 49.57, SellerName: 'Elisa',
                        Country: 'USA', Date: '02/19/2020', UnitsSold: 296
                    },
                    {
                        ProductCategory: 'Clothing', UnitPrice: 68.33, SellerName: 'Larry',
                        Country: 'Uruguay', Date: '02/19/2020', UnitsSold: 456
                    },
                    {
                        ProductCategory: 'Clothing', UnitPrice: 16.05, SellerName: 'Walter',
                        Country: 'Bulgaria', Date: '02/19/2020', UnitsSold: 492
                    }
                ], ProductCategory_level: 0, Date_level: 0
            },
            {
                Date: '05/12/2020', records: [
                    {
                        ProductCategory: 'Clothing', UnitPrice: 68.33, SellerName: 'Larry',
                        Country: 'Uruguay', Date: '02/19/2020', UnitsSold: 456
                    }
                ], Date_records: [
                    {
                        ProductCategory: 'Clothing', UnitPrice: 68.33, SellerName: 'Larry',
                        Country: 'Uruguay', Date: '02/19/2020', UnitsSold: 456
                    }
                ], level: 0, ProductCategory: 'Clothing', ProductCategory_records: [
                    {
                        ProductCategory: 'Clothing', UnitPrice: 12.81, SellerName: 'Stanley',
                        Country: 'Bulgaria', Date: '02/19/2020', UnitsSold: 282
                    },
                    {
                        ProductCategory: 'Clothing', UnitPrice: 49.57, SellerName: 'Elisa',
                        Country: 'USA', Date: '02/19/2020', UnitsSold: 296
                    },
                    {
                        ProductCategory: 'Clothing', UnitPrice: 68.33, SellerName: 'Larry',
                        Country: 'Uruguay', Date: '02/19/2020', UnitsSold: 456
                    },
                    {
                        ProductCategory: 'Clothing', UnitPrice: 16.05, SellerName: 'Walter',
                        Country: 'Bulgaria', Date: '02/19/2020', UnitsSold: 492
                    }
                ], ProductCategory_level: 0, Date_level: 0
            }, {
                Date: '02/19/2020', records: [
                    {
                        ProductCategory: 'Clothing', UnitPrice: 16.05, SellerName: 'Walter',
                        Country: 'Bulgaria', Date: '02/19/2020', UnitsSold: 492
                    }
                ], Date_records: [
                    {
                        ProductCategory: 'Clothing', UnitPrice: 16.05, SellerName: 'Walter',
                        Country: 'Bulgaria', Date: '02/19/2020', UnitsSold: 492
                    }
                ], level: 0, ProductCategory: 'Clothing', ProductCategory_records: [
                    {
                        ProductCategory: 'Clothing', UnitPrice: 12.81, SellerName: 'Stanley',
                        Country: 'Bulgaria', Date: '02/19/2020', UnitsSold: 282
                    },
                    {
                        ProductCategory: 'Clothing', UnitPrice: 49.57, SellerName: 'Elisa',
                        Country: 'USA', Date: '02/19/2020', UnitsSold: 296
                    },
                    {
                        ProductCategory: 'Clothing', UnitPrice: 68.33, SellerName: 'Larry',
                        Country: 'Uruguay', Date: '02/19/2020', UnitsSold: 456
                    },
                    {
                        ProductCategory: 'Clothing', UnitPrice: 16.05, SellerName: 'Walter',
                        Country: 'Bulgaria', Date: '02/19/2020', UnitsSold: 492
                    }
                ], ProductCategory_level: 0, Date_level: 0
            },
            {
                Date: '01/06/2020', records: [
                    {
                        ProductCategory: 'Bikes', UnitPrice: 3.56, SellerName: 'Lydia',
                        Country: 'Uruguay', Date: '01/06/2020', UnitsSold: 68
                    }
                ], Date_records: [
                    {
                        ProductCategory: 'Bikes', UnitPrice: 3.56, SellerName: 'Lydia',
                        Country: 'Uruguay', Date: '01/06/2020', UnitsSold: 68
                    }
                ], level: 0, ProductCategory: 'Bikes', ProductCategory_records: [
                    {
                        ProductCategory: 'Bikes', UnitPrice: 3.56, SellerName: 'Lydia',
                        Country: 'Uruguay', Date: '01/06/2020', UnitsSold: 68
                    }
                ], ProductCategory_level: 0, Date_level: 0
            }, {
                Date: '04/07/2021', records: [
                    {
                        ProductCategory: 'Accessories', UnitPrice: 85.58, SellerName: 'David',
                        Country: 'USA', Date: '04/07/2021', UnitsSold: 293
                    }
                ], Date_records: [
                    {
                        ProductCategory: 'Accessories', UnitPrice: 85.58, SellerName: 'David',
                        Country: 'USA', Date: '04/07/2021', UnitsSold: 293
                    }
                ], level: 0, ProductCategory: 'Accessories', ProductCategory_records: [
                    {
                        ProductCategory: 'Accessories', UnitPrice: 85.58, SellerName: 'David',
                        Country: 'USA', Date: '04/07/2021', UnitsSold: 293
                    }
                ], ProductCategory_level: 0, Date_level: 0
            }, {
                Date: '12/08/2021', records: [
                    {
                        ProductCategory: 'Components', UnitPrice: 18.13, SellerName: 'John',
                        Country: 'USA', Date: '12/08/2021', UnitsSold: 240
                    }
                ], Date_records: [
                    {
                        ProductCategory: 'Components', UnitPrice: 18.13, SellerName: 'John',
                        Country: 'USA', Date: '12/08/2021', UnitsSold: 240
                    }
                ], level: 0, ProductCategory: 'Components', ProductCategory_records: [
                    {
                        ProductCategory: 'Components', UnitPrice: 18.13, SellerName: 'John',
                        Country: 'USA', Date: '12/08/2021', UnitsSold: 240
                    }
                ], ProductCategory_level: 0, Date_level: 0
            }]);
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
        const rowStatePipeResult = rowStatePipe.transform(rowPipeResult, pivotConfig, expansionStates);
        const columnPipeResult = columnPipe.transform(rowStatePipeResult, pivotConfig, expansionStates);
        expect(columnPipeResult).toEqual([
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
        const rowStatePipeResult = rowStatePipe.transform(rowPipeResult, pivotConfig, new Map<any, boolean>());
        const columnPipeResult = columnPipe.transform(rowStatePipeResult, pivotConfig, new Map<any, boolean>());
        /* eslint-disable quote-props */
        expect(columnPipeResult).toEqual([
            {
                'All': 'All', 'All_level': 0, 'Bulgaria': 774, 'Bulgaria-01/01/2021': 282,
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
        const rowStateResult = rowStatePipe.transform(rowPipeResult, pivotConfig, new Map<any, boolean>());
        const columnPipeResult = columnPipe.transform(rowStateResult, pivotConfig, new Map<any, boolean>());
        /* eslint-disable quote-props */
        expect(columnPipeResult).toEqual([
            {
                'All': 'All', 'All_level': 0, 'Bulgaria': 774, 'Bulgaria-Stanley': 282,
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
                aggregate: {
                    aggregator: IgxPivotNumericAggregate.sum,
                    key: 'sum',
                    label: 'SUM',
                },
                enabled: true
            },
            {
                member: 'UnitPrice',
                aggregate: {
                    aggregator: IgxPivotNumericAggregate.sum,
                    key: 'sum',
                    label: 'SUM',
                },
                enabled: true
            }
        ];
        const rowPipeResult = rowPipe.transform(data, pivotConfig, expansionStates);
        const rowStatePipeResult = rowStatePipe.transform(rowPipeResult, pivotConfig, new Map<any, boolean>());
        const columnPipeResult = columnPipe.transform(rowStatePipeResult, pivotConfig, expansionStates);
        expect(columnPipeResult).toEqual([
            {
                'All': 'All', 'All_level': 0, 'All-UnitsSold': 2127, 'All-Bulgaria-UnitsSold': 774, 'All-Bulgaria-UnitPrice': 28.86,
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
                All: 2127, All_records: [
                    { ProductCategory: 'Clothing', level: 1, All: 1526, 'All-Bulgaria': 774, 'All-USA': 296, 'All-Uruguay': 456 },
                    { ProductCategory: 'Bikes', level: 1, All: 68, 'All-Uruguay': 68 },
                    { ProductCategory: 'Accessories', level: 1, All: 293, 'All-USA': 293 },
                    { ProductCategory: 'Components', level: 1, All: 240, 'All-USA': 240 }]
                , level: 0, 'All-Bulgaria': 774, 'All-USA': 829, 'All-Uruguay': 524
            }];
        pivotConfig.columnStrategy = NoopPivotDimensionsStrategy.instance();
        pivotConfig.columns[0].memberName = 'All';
        pivotConfig.rowStrategy = NoopPivotDimensionsStrategy.instance();
        pivotConfig.rows[0].memberName = 'All';

        const rowPipeResult = rowPipe.transform(preprocessedData, pivotConfig, new Map<any, boolean>());
        const rowStateResult = rowStatePipe.transform(rowPipeResult, pivotConfig, new Map<any, boolean>());
        const columnPipeResult = columnPipe.transform(rowStateResult, pivotConfig, new Map<any, boolean>());

        // same data but expanded
        expect(columnPipeResult).toEqual([
            {
                'All': 2127, 'All_records': [
                    {
                        'ProductCategory': 'Clothing', 'level': 1, 'All': 1526, 'All-Bulgaria': 774,
                        'All-USA': 296, 'All-Uruguay': 456, 'ProductCategory_level': 1
                    },
                    { 'ProductCategory': 'Bikes', 'level': 1, 'All': 68, 'All-Uruguay': 68, 'ProductCategory_level': 1 },
                    { 'ProductCategory': 'Accessories', 'level': 1, 'All': 293, 'All-USA': 293, 'ProductCategory_level': 1 },
                    { 'ProductCategory': 'Components', 'level': 1, 'All': 240, 'All-USA': 240, 'ProductCategory_level': 1 }
                ], 'level': 0, 'All-Bulgaria': 774, 'All-USA': 829, 'All-Uruguay': 524, 'All_level': 0
            },
            {
                'ProductCategory': 'Clothing', 'level': 1, 'All': 1526, 'All-Bulgaria': 774,
                'All-USA': 296, 'All-Uruguay': 456, 'ProductCategory_level': 1
            },
            { 'ProductCategory': 'Bikes', 'level': 1, 'All': 68, 'All-Uruguay': 68, 'ProductCategory_level': 1 },
            { 'ProductCategory': 'Accessories', 'level': 1, 'All': 293, 'All-USA': 293, 'ProductCategory_level': 1 },
            { 'ProductCategory': 'Components', 'level': 1, 'All': 240, 'All-USA': 240, 'ProductCategory_level': 1 }]);
    });
});
