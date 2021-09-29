import { IgxNumberSummaryOperand } from '../summaries/grid-summary';
import { IPivotConfiguration } from './pivot-grid.interface';
import { IgxPivotColumnPipe, IgxPivotRowPipe } from './pivot-grid.pipes';

describe('Pivot pipes', () => {
    // This pipe is a pure, stateless function so no need for BeforeEach
    const rowPipe = new IgxPivotRowPipe();
    const columnPipe = new IgxPivotColumnPipe();

    const data = [
        { ProductCategory: 'Clothing', UnitPrice: 12.81, SellerName: 'Stanley', Country: 'Bulgaria', Date: '01/01/2021', UnitsSold: 282 },
        { ProductCategory: 'Clothing', UnitPrice: 49.57, SellerName: 'Elisa', Country: 'USA', Date: '01/05/2019', UnitsSold: 296 },
        { ProductCategory: 'Bikes', UnitPrice: 3.56, SellerName: 'Lydia', Country: 'Uruguay', Date: '01/06/2020', UnitsSold: 68 },
        { ProductCategory: 'Accessories', UnitPrice: 85.58, SellerName: 'David', Country: 'USA', Date: '04/07/2021', UnitsSold: 293 },
        { ProductCategory: 'Components', UnitPrice: 18.13, SellerName: 'John', Country: 'USA', Date: '12/08/2021', UnitsSold: 240 },
        { ProductCategory: 'Clothing', UnitPrice: 68.33, SellerName: 'Larry', Country: 'Uruguay', Date: '05/12/2020', UnitsSold: 456 },
        { ProductCategory: 'Clothing', UnitPrice: 16.05, SellerName: 'Walter', Country: 'Bulgaria', Date: '02/19/2020', UnitsSold: 492 }
    ];

    const pivotConfigHierarchy: IPivotConfiguration = {
        columns: [{
            member: () => 'All',
            enabled: true,
            childLevels: [{
                member: 'Country',
                enabled: true,
                childLevels: []
            }]
        }],
        rows: [{
            member: () => 'All',
            enabled: true,
            childLevels: [
                {
                    member: (d) => d.ProductCategory,
                    enabled: true,
                    childLevels: []
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

    fit('transforms flat data to pivot data', () => {
        const rowPipeResult = rowPipe.transform(data, pivotConfigHierarchy.rows, pivotConfigHierarchy.values);
        const columnPipeResult = columnPipe.transform(rowPipeResult, pivotConfigHierarchy.columns, pivotConfigHierarchy.values);
        expect(columnPipeResult).toEqual([
            { field1: 'All', All: 2127, Bulgaria: 774, USA: 829, Uruguay: 524, level: 0, records: [
                { field1: 'Clothing', All: 1526, Bulgaria: 774, USA: 296, Uruguay: 456, level: 1  },
                { field1: 'Bikes', All: 68, Uruguay: 68, level: 1  },
                { field1: 'Accessories', All: 293, USA: 293, level: 1  },
                { field1: 'Components', All: 240, USA: 240, level: 1  }
            ] },
            { field1: 'Clothing', All: 1526, Bulgaria: 774, USA: 296, Uruguay: 456, level: 1  },
            { field1: 'Bikes', All: 68, Uruguay: 68, level: 1  },
            { field1: 'Accessories', All: 293, USA: 293, level: 1  },
            { field1: 'Components', All: 240, USA: 240, level: 1  }
        ]);
    });

});
