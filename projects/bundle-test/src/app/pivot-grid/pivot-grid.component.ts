import { Component } from '@angular/core';
import { IGX_PIVOT_GRID_DIRECTIVES } from 'igniteui-angular/grids/pivot-grid';
import { IgxPivotDateDimension, IPivotConfiguration } from 'igniteui-angular/grids/core';

@Component({
    selector: 'app-pivot-grid',
    templateUrl: './pivot-grid.component.html',
    styleUrls: ['./pivot-grid.component.scss'],
    imports: [IGX_PIVOT_GRID_DIRECTIVES]
})
export class PivotGridComponent {
    public data = [
        {
            ProductCategory: 'Clothing',
            ProductName: 'Shirt',
            SellerName: 'John Doe',
            SellerCity: 'New York',
            Date: new Date('2023-01-15'),
            UnitsSold: 20,
            UnitPrice: 25.99,
            Revenue: 519.8
        },
        {
            ProductCategory: 'Clothing',
            ProductName: 'Shirt',
            SellerName: 'Jane Smith',
            SellerCity: 'Los Angeles',
            Date: new Date('2023-01-20'),
            UnitsSold: 15,
            UnitPrice: 25.99,
            Revenue: 389.85
        },
        {
            ProductCategory: 'Clothing',
            ProductName: 'Pants',
            SellerName: 'John Doe',
            SellerCity: 'New York',
            Date: new Date('2023-02-10'),
            UnitsSold: 10,
            UnitPrice: 45.50,
            Revenue: 455
        },
        {
            ProductCategory: 'Electronics',
            ProductName: 'Phone',
            SellerName: 'Bob Johnson',
            SellerCity: 'Chicago',
            Date: new Date('2023-02-15'),
            UnitsSold: 8,
            UnitPrice: 699.99,
            Revenue: 5599.92
        },
        {
            ProductCategory: 'Electronics',
            ProductName: 'Laptop',
            SellerName: 'Alice Williams',
            SellerCity: 'New York',
            Date: new Date('2023-03-01'),
            UnitsSold: 5,
            UnitPrice: 1299.99,
            Revenue: 6499.95
        },
        {
            ProductCategory: 'Electronics',
            ProductName: 'Phone',
            SellerName: 'Jane Smith',
            SellerCity: 'Los Angeles',
            Date: new Date('2023-03-10'),
            UnitsSold: 12,
            UnitPrice: 699.99,
            Revenue: 8399.88
        },
        {
            ProductCategory: 'Clothing',
            ProductName: 'Jacket',
            SellerName: 'Bob Johnson',
            SellerCity: 'Chicago',
            Date: new Date('2023-03-20'),
            UnitsSold: 7,
            UnitPrice: 89.99,
            Revenue: 629.93
        },
        {
            ProductCategory: 'Electronics',
            ProductName: 'Tablet',
            SellerName: 'John Doe',
            SellerCity: 'New York',
            Date: new Date('2023-04-05'),
            UnitsSold: 6,
            UnitPrice: 499.99,
            Revenue: 2999.94
        }
    ];

    public pivotConfigHierarchy: IPivotConfiguration = {
        rows: [
            {
                memberName: 'ProductCategory',
                enabled: true
            },
            {
                memberName: 'ProductName',
                enabled: true
            }
        ],
        columns: [
            new IgxPivotDateDimension(
                {
                    memberName: 'Date',
                    enabled: true
                },
                {
                    months: false,
                    quarters: true,
                    years: true
                }
            ),
            {
                memberName: 'SellerCity',
                enabled: true
            }
        ],
        values: [
            {
                member: 'UnitsSold',
                displayName: 'Units Sold',
                aggregate: {
                    aggregator: (members: any[], data?: any[]) => members.reduce((acc, val) => acc + val, 0),
                    key: 'SUM',
                    label: 'Sum'
                },
                enabled: true
            },
            {
                member: 'Revenue',
                displayName: 'Revenue',
                aggregate: {
                    aggregator: (members: any[], data?: any[]) => members.reduce((acc, val) => acc + val, 0),
                    key: 'SUM',
                    label: 'Sum'
                },
                enabled: true,
                dataType: 'currency'
            }
        ],
        filters: null
    };
}
