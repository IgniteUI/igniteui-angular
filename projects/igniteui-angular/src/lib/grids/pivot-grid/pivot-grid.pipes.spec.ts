import { IgxNumberSummaryOperand } from '../summaries/grid-summary';
import { IPivotConfiguration } from './pivot-grid.interface';
import { IgxPivotColumnPipe, IgxPivotRowPipe } from './pivot-grid.pipes';

describe('Pivot pipes', () => {
    // This pipe is a pure, stateless function so no need for BeforeEach
    const rowPipe = new IgxPivotRowPipe();
    const columnPipe = new IgxPivotColumnPipe();
    const expansionStates = new Map<any, boolean>();
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

    it('transforms flat data to pivot data', () => {
        const rowPipeResult = rowPipe.transform(data, pivotConfigHierarchy.rows, expansionStates, pivotConfigHierarchy.values);
        const columnPipeResult = columnPipe.transform(rowPipeResult, pivotConfigHierarchy.columns, pivotConfigHierarchy.values);
        expect(columnPipeResult).toEqual([
            {
                field1: 'All', All: 2127, 'All-Bulgaria': 774, 'All-USA': 829, 'All-Uruguay': 524, level: 0, field1_level: 0, records: [
                    { field1: 'Clothing', All: 1526, 'All-Bulgaria': 774,'All-USA': 296,'All-Uruguay': 456, level: 1, field1_level: 1 },
                    { field1: 'Bikes', All: 68, 'All-Uruguay': 68, level: 1, field1_level: 1  },
                    { field1: 'Accessories', All: 293, 'All-USA': 293, level: 1, field1_level: 1  },
                    { field1: 'Components', All: 240, 'All-USA': 240, level: 1, field1_level: 1  }
                ]
            },
            { field1: 'Clothing', All: 1526, 'All-Bulgaria': 774,'All-USA': 296,'All-Uruguay': 456, level: 1, field1_level: 1  },
            { field1: 'Bikes', All: 68, 'All-Uruguay': 68, level: 1, field1_level: 1 },
            { field1: 'Accessories', All: 293, 'All-USA': 293, level: 1, field1_level: 1 },
            { field1: 'Components', All: 240, 'All-USA': 240, level: 1, field1_level: 1 }
        ]);
    });

    it('transforms flat data to pivot data single row dimension and no children are defined', () => {
        const rowPipeResult = rowPipe.transform(data, [{
            member: 'ProductCategory',
            enabled: true,
            childLevels: []
        }], expansionStates, pivotConfigHierarchy.values);
        expect(rowPipeResult).toEqual([
            {
                ProductCategory: 'Clothing', level: 0,  ProductCategory_level: 0, records: [
        { ProductCategory: 'Clothing', UnitPrice: 12.81, SellerName: 'Stanley', Country: 'Bulgaria', Date: '01/01/2021', UnitsSold: 282 },
        { ProductCategory: 'Clothing', UnitPrice: 49.57, SellerName: 'Elisa', Country: 'USA', Date: '01/05/2019', UnitsSold: 296 },
        { ProductCategory: 'Clothing', UnitPrice: 68.33, SellerName: 'Larry', Country: 'Uruguay', Date: '05/12/2020', UnitsSold: 456 },
        { ProductCategory: 'Clothing', UnitPrice: 16.05, SellerName: 'Walter', Country: 'Bulgaria', Date: '02/19/2020', UnitsSold: 492 }]
            },
            {
                ProductCategory: 'Bikes', level: 0,  ProductCategory_level: 0, records: [
        { ProductCategory: 'Bikes', UnitPrice: 3.56, SellerName: 'Lydia', Country: 'Uruguay', Date: '01/06/2020', UnitsSold: 68 }
                ]
            },
            {
                ProductCategory: 'Accessories', level: 0,  ProductCategory_level: 0, records: [
        { ProductCategory: 'Accessories', UnitPrice: 85.58, SellerName: 'David', Country: 'USA', Date: '04/07/2021', UnitsSold: 293 }
                ]
            },
            {
                ProductCategory: 'Components', level: 0,  ProductCategory_level: 0, records: [
        { ProductCategory: 'Components', UnitPrice: 18.13, SellerName: 'John', Country: 'USA', Date: '12/08/2021', UnitsSold: 240 }
                ]
            }
        ]);
        const columnPipeResult = columnPipe.transform(rowPipeResult, pivotConfigHierarchy.columns, pivotConfigHierarchy.values);
        expect(columnPipeResult).toEqual([
            { ProductCategory: 'Clothing', All: 1526, 'All-Bulgaria': 774, 'All-USA': 296,
             'All-Uruguay': 456, level: 0, ProductCategory_level: 0 },
            { ProductCategory: 'Bikes', All: 68, 'All-Uruguay': 68, level: 0,  ProductCategory_level: 0 },
            { ProductCategory: 'Accessories', All: 293, 'All-USA': 293, level: 0,  ProductCategory_level: 0 },
            { ProductCategory: 'Components', All: 240, 'All-USA': 240, level: 0,  ProductCategory_level: 0 }
        ]);
    });

    it('allows setting expand/collapse state.', () => {
        const expanded =  new Map<any, boolean>();
        expanded.set('All', false);
        const rowPipeCollapseResult = rowPipe.transform(data, pivotConfigHierarchy.rows, expanded, pivotConfigHierarchy.values);
       expect(rowPipeCollapseResult).toEqual([
           { field1:'All',records: [
               {
                    field1:'Clothing',
                    records:[
                    {ProductCategory:'Clothing',UnitPrice:12.81,SellerName:'Stanley',Country:'Bulgaria',Date:'01/01/2021',UnitsSold:282},
                    {ProductCategory:'Clothing',UnitPrice:49.57,SellerName:'Elisa',Country:'USA',Date:'01/05/2019',UnitsSold:296},
                    {ProductCategory:'Clothing',UnitPrice:68.33,SellerName:'Larry',Country:'Uruguay',Date:'05/12/2020',UnitsSold:456},
                    {ProductCategory:'Clothing',UnitPrice:16.05,SellerName:'Walter',Country:'Bulgaria',Date:'02/19/2020',UnitsSold:492}
                    ]
                    ,level:1, field1_level: 1
                },
                {
                    field1:'Bikes',
                    records:[
                        {ProductCategory:'Bikes',UnitPrice:3.56,SellerName:'Lydia',Country:'Uruguay',Date:'01/06/2020',UnitsSold:68}
                    ]
                    ,level:1, field1_level: 1
                },
                {
                    field1:'Accessories',
                    records:[
                        {ProductCategory:'Accessories',UnitPrice:85.58,SellerName:'David',Country:'USA',Date:'04/07/2021',UnitsSold:293}
                    ]
                    ,level:1, field1_level: 1},
                {
                field1:'Components',
                records:[
                    {ProductCategory:'Components',UnitPrice:18.13,SellerName:'John',Country:'USA',Date:'12/08/2021',UnitsSold:240}
                ]
                ,level:1, field1_level: 1}
            ]
            ,level:0, field1_level: 0}
        ]);

        expanded.set('All', true);
        const rowPipeExpandResult = rowPipe.transform(data, pivotConfigHierarchy.rows, expanded, pivotConfigHierarchy.values);
        expect(rowPipeExpandResult).toEqual([
            { field1:'All',records: [
                {
                     field1:'Clothing',
                     records:[
                     {ProductCategory:'Clothing',UnitPrice:12.81,SellerName:'Stanley',Country:'Bulgaria',Date:'01/01/2021',UnitsSold:282},
                     {ProductCategory:'Clothing',UnitPrice:49.57,SellerName:'Elisa',Country:'USA',Date:'01/05/2019',UnitsSold:296},
                     {ProductCategory:'Clothing',UnitPrice:68.33,SellerName:'Larry',Country:'Uruguay',Date:'05/12/2020',UnitsSold:456},
                     {ProductCategory:'Clothing',UnitPrice:16.05,SellerName:'Walter',Country:'Bulgaria',Date:'02/19/2020',UnitsSold:492}
                     ]
                     ,level:1, field1_level: 1
                 },
                 {
                     field1:'Bikes',
                     records:[
                         {ProductCategory:'Bikes',UnitPrice:3.56,SellerName:'Lydia',Country:'Uruguay',Date:'01/06/2020',UnitsSold:68}
                     ]
                     ,level:1, field1_level: 1
                 },
                 {
                     field1:'Accessories',
                     records:[
                         {ProductCategory:'Accessories',UnitPrice:85.58,SellerName:'David',Country:'USA',Date:'04/07/2021',UnitsSold:293}
                     ]
                     ,level:1, field1_level: 1},
                 {
                 field1:'Components',
                 records:[
                     {ProductCategory:'Components',UnitPrice:18.13,SellerName:'John',Country:'USA',Date:'12/08/2021',UnitsSold:240}
                 ]
                 ,level:1, field1_level: 1}
             ]
             ,level:0, field1_level: 0},
             {
                field1:'Clothing',
                records:[
                {ProductCategory:'Clothing',UnitPrice:12.81,SellerName:'Stanley',Country:'Bulgaria',Date:'01/01/2021',UnitsSold:282},
                {ProductCategory:'Clothing',UnitPrice:49.57,SellerName:'Elisa',Country:'USA',Date:'01/05/2019',UnitsSold:296},
                {ProductCategory:'Clothing',UnitPrice:68.33,SellerName:'Larry',Country:'Uruguay',Date:'05/12/2020',UnitsSold:456},
                {ProductCategory:'Clothing',UnitPrice:16.05,SellerName:'Walter',Country:'Bulgaria',Date:'02/19/2020',UnitsSold:492}
                ]
                ,level:1, field1_level: 1
            },
            {
                field1:'Bikes',
                records:[
                    {ProductCategory:'Bikes',UnitPrice:3.56,SellerName:'Lydia',Country:'Uruguay',Date:'01/06/2020',UnitsSold:68}
                ]
                ,level:1, field1_level: 1
            },
            {
                field1:'Accessories',
                records:[
                    {ProductCategory:'Accessories',UnitPrice:85.58,SellerName:'David',Country:'USA',Date:'04/07/2021',UnitsSold:293}
                ]
                ,level:1, field1_level: 1},
            {
            field1:'Components',
            records:[
                {ProductCategory:'Components',UnitPrice:18.13,SellerName:'John',Country:'USA',Date:'12/08/2021',UnitsSold:240}
            ]
            ,level:1, field1_level: 1}
         ]);
    });

    it('transforms flat data to pivot data multiple row dimensions', () => {
        const rowPipeResult = rowPipe.transform(data, [{
            member: 'ProductCategory',
            enabled: true,
            childLevels: []
        },
        {
            member: 'Date',
            enabled: true,
            childLevels: []
        }], expansionStates, pivotConfigHierarchy.values);

        expect(rowPipeResult).toEqual([
            {
                Date: '01/01/2021',
                records: [
                    {
                        ProductCategory: 'Clothing',
                        UnitPrice: 12.81,
                        SellerName: 'Stanley',
                        Country: 'Bulgaria',
                        Date: '01/01/2021',
                        UnitsSold: 282
                    }
                ],
                level: 0,
                ProductCategory: 'Clothing',
                Date_level: 0,
                ProductCategory_level: 0
            },
            {
                Date: '01/05/2019',
                records: [
                    {
                        ProductCategory: 'Clothing',
                        UnitPrice: 49.57,
                        SellerName: 'Elisa',
                        Country: 'USA',
                        Date: '01/05/2019',
                        UnitsSold: 296
                    }
                ],
                level: 0,
                ProductCategory: 'Clothing',
                Date_level: 0,
                ProductCategory_level: 0
            },
            {
                Date: '05/12/2020',
                records: [
                    {
                        ProductCategory: 'Clothing',
                        UnitPrice: 68.33,
                        SellerName: 'Larry',
                        Country: 'Uruguay',
                        Date: '05/12/2020',
                        UnitsSold: 456
                    }
                ],
                level: 0,
                ProductCategory: 'Clothing',
                Date_level: 0,
                ProductCategory_level: 0
            },
            {
                Date: '02/19/2020',
                records: [
                    {
                        ProductCategory: 'Clothing',
                        UnitPrice: 16.05,
                        SellerName: 'Walter',
                        Country: 'Bulgaria',
                        Date: '02/19/2020',
                        UnitsSold: 492
                    }
                ],
                level: 0,
                ProductCategory: 'Clothing',
                Date_level: 0,
                ProductCategory_level: 0
            },
            {
                Date: '01/06/2020',
                records: [
                    {
                        ProductCategory: 'Bikes',
                        UnitPrice: 3.56,
                        SellerName: 'Lydia',
                        Country: 'Uruguay',
                        Date: '01/06/2020',
                        UnitsSold: 68
                    }
                ],
                level: 0,
                ProductCategory: 'Bikes',
                Date_level: 0,
                ProductCategory_level: 0
            },
            {
                Date: '04/07/2021',
                records: [
                    {
                        ProductCategory: 'Accessories',
                        UnitPrice: 85.58,
                        SellerName: 'David',
                        Country: 'USA',
                        Date: '04/07/2021',
                        UnitsSold: 293
                    }
                ],
                level: 0,
                ProductCategory: 'Accessories',
                Date_level: 0,
                ProductCategory_level: 0
            },
            {
                Date: '12/08/2021',
                records: [
                    {
                        ProductCategory: 'Components',
                        UnitPrice: 18.13,
                        SellerName: 'John',
                        Country: 'USA',
                        Date: '12/08/2021',
                        UnitsSold: 240
                    }
                ],
                level: 0,
                ProductCategory: 'Components',
                Date_level: 0,
                ProductCategory_level: 0
            }
        ]);
    });

    it('transforms flat data to pivot data 2 column dimensions', () => {
        const rowPipeResult = rowPipe.transform(data, pivotConfigHierarchy.rows, new Map<any, boolean>(), pivotConfigHierarchy.values);
        const columnPipeResult = columnPipe.transform(rowPipeResult, [{
            member: 'Country',
            enabled: true,
            childLevels:[]
            },
            {
            member: 'Date',
            enabled: true,
            childLevels: []
            }], pivotConfigHierarchy.values);
        /* eslint-disable quote-props */
        expect(columnPipeResult).toEqual([
            {'field1':'All','records':[
                {'field1':'Clothing','level':1, 'field1_level': 1, 'Bulgaria':774,'Bulgaria-01/01/2021':282,
                'Bulgaria-02/19/2020':492,'USA':296,'USA-01/05/2019':296,'Uruguay':456,'Uruguay-05/12/2020':456},
                {'field1':'Bikes','level':1, 'field1_level': 1,'Uruguay':68,'Uruguay-01/06/2020':68},
                {'field1':'Accessories','level':1, 'field1_level': 1, 'USA':293,'USA-04/07/2021':293},
                {'field1':'Components','level':1, 'field1_level': 1,'USA':240,'USA-12/08/2021':240}]
                ,'level':0, 'field1_level': 0,'Bulgaria':774,'Bulgaria-01/01/2021':282,'Bulgaria-02/19/2020':492,
                'USA':829,'USA-01/05/2019':296,'USA-04/07/2021':293,'USA-12/08/2021':240,
                'Uruguay':524,'Uruguay-05/12/2020':456,'Uruguay-01/06/2020':68},
            {'field1':'Clothing','level':1, 'field1_level': 1,'Bulgaria':774,'Bulgaria-01/01/2021':282,
            'Bulgaria-02/19/2020':492,'USA':296,'USA-01/05/2019':296,'Uruguay':456,'Uruguay-05/12/2020':456},
            {'field1':'Bikes','level':1, 'field1_level': 1,'Uruguay':68,'Uruguay-01/06/2020':68},
            {'field1':'Accessories','level':1, 'field1_level': 1,'USA':293,'USA-04/07/2021':293},
            {'field1':'Components','level':1, 'field1_level': 1,'USA':240,'USA-12/08/2021':240}]);
    });

    it('transforms flat data to pivot data 3 column dimensions', () => {
        const rowPipeResult = rowPipe.transform(data, pivotConfigHierarchy.rows, new Map<any, boolean>(), pivotConfigHierarchy.values);
        const columnPipeResult = columnPipe.transform(rowPipeResult, [{
            member: 'Country',
            enabled: true,
            childLevels:[]
            },
            {
            member: 'SellerName',
            enabled: true,
            childLevels:[]
            },
            {
            member: 'Date',
            enabled: true,
            childLevels: []
            }], pivotConfigHierarchy.values);
        /* eslint-disable quote-props */
        expect(columnPipeResult).toEqual([
            {'field1':'All','records':
            [
                {'field1':'Clothing','level':1, 'field1_level': 1, 'Bulgaria':774,'Bulgaria-Stanley':282,'Bulgaria-Stanley-01/01/2021':282,
                'Bulgaria-Walter':492,'Bulgaria-Walter-02/19/2020':492,'USA':296,'USA-Elisa':296,'USA-Elisa-01/05/2019':296,
                'Uruguay':456,'Uruguay-Larry':456,'Uruguay-Larry-05/12/2020':456},
                {'field1':'Bikes','level':1, 'field1_level': 1, 'Uruguay':68,'Uruguay-Lydia':68,'Uruguay-Lydia-01/06/2020':68},
                {'field1':'Accessories','level':1,'field1_level': 1, 'USA':293,'USA-David':293,'USA-David-04/07/2021':293},
                {'field1':'Components','level':1,'field1_level': 1, 'USA':240,'USA-John':240,'USA-John-12/08/2021':240}
            ],
            'level':0, 'field1_level': 0, 'Bulgaria':774,'Bulgaria-Stanley':282,'Bulgaria-Stanley-01/01/2021':282,'Bulgaria-Walter':492,
            'Bulgaria-Walter-02/19/2020':492,'USA':829,'USA-Elisa':296,'USA-Elisa-01/05/2019':296,'USA-David':293,
            'USA-David-04/07/2021':293,'USA-John':240,'USA-John-12/08/2021':240,'Uruguay':524,'Uruguay-Larry':456,
            'Uruguay-Larry-05/12/2020':456,'Uruguay-Lydia':68,'Uruguay-Lydia-01/06/2020':68},
            {'field1':'Clothing','level':1, 'field1_level': 1, 'Bulgaria':774,'Bulgaria-Stanley':282,'Bulgaria-Stanley-01/01/2021':282,
            'Bulgaria-Walter':492,'Bulgaria-Walter-02/19/2020':492,'USA':296,'USA-Elisa':296,'USA-Elisa-01/05/2019':296,'Uruguay':456,
            'Uruguay-Larry':456,'Uruguay-Larry-05/12/2020':456},
            {'field1':'Bikes','level':1,  'field1_level': 1, 'Uruguay':68,'Uruguay-Lydia':68,'Uruguay-Lydia-01/06/2020':68},
            {'field1':'Accessories','level':1, 'field1_level': 1, 'USA':293,'USA-David':293,'USA-David-04/07/2021':293},
            {'field1':'Components','level':1, 'field1_level': 1, 'USA':240,'USA-John':240,'USA-John-12/08/2021':240}
        ]);
    });
});
