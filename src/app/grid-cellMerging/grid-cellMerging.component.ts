import { Component, HostBinding, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
    IgxColumnComponent,
    IgxGridComponent,
} from 'igniteui-angular';

import { data, dataWithoutPK } from '../shared/data';

@Component({
    selector: 'app-grid-cellMerging',
    templateUrl: 'grid-cellMerging.component.html',
    styleUrl: 'grid-cellMerging.component.scss',
    imports: [
        FormsModule,
        IgxColumnComponent,
        IgxGridComponent,
    ]
})
export class GridCellMergingComponent {
    public data = [{
        ProductID: 1,
        ProductName: 'Chai',
        SupplierID: 1,
        CategoryID: 1,
        QuantityPerUnit: '10 boxes x 20 bags',
        UnitPrice: '18.0000',
        UnitsInStock: 39,
        UnitsOnOrder: 0,
        ReorderLevel: 10.567,
        Discontinued: false,
        OrderDate: null,
        OrderDate2: new Date(1991, 2, 12, 18, 40, 50).toISOString()
    }, {
        ProductID: 2,
        ProductName: 'Chai',
        SupplierID: 1,
        CategoryID: 1,
        QuantityPerUnit: '24 - 12 oz bottles',
        UnitPrice: '19.0000',
        UnitsInStock: 17,
        UnitsOnOrder: 40,
        ReorderLevel: 25,
        Discontinued: false,
        OrderDate: new Date('2003-03-17').toISOString(),
        OrderDate2: new Date('2003-03-17').toISOString()
    },
    {
        ProductID: 3,
        ProductName: 'Chai',
        SupplierID: 1,
        CategoryID: 1,
        QuantityPerUnit: '24 - 12 oz bottles',
        UnitPrice: '19.0000',
        UnitsInStock: 17,
        UnitsOnOrder: 40,
        ReorderLevel: 25,
        Discontinued: false,
        OrderDate: new Date('2003-03-17').toISOString(),
        OrderDate2: new Date('2003-03-17').toISOString()
    },
    {
        ProductID: 4,
        ProductName: 'Chai',
        SupplierID: 1,
        CategoryID: 1,
        QuantityPerUnit: '24 - 12 oz bottles',
        UnitPrice: '20.0000',
        UnitsInStock: 20,
        UnitsOnOrder: 40,
        ReorderLevel: 25,
        Discontinued: false,
        OrderDate: new Date('2003-03-17').toISOString(),
        OrderDate2: new Date('2003-03-17').toISOString()
    },
    {
        ProductID: 5,
        ProductName: 'Chai',
        SupplierID: 1,
        CategoryID: 1,
        QuantityPerUnit: '24 - 12 oz bottles',
        UnitPrice: '19.0000',
        UnitsInStock: 17,
        UnitsOnOrder: 40,
        ReorderLevel: 25,
        Discontinued: false,
        OrderDate: new Date('2003-03-17').toISOString(),
        OrderDate2: new Date('2003-03-17').toISOString()
    },
    {
        ProductID: 6,
        ProductName: 'Chang',
        SupplierID: 1,
        CategoryID: 1,
        QuantityPerUnit: '24 - 12 oz bottles',
        UnitPrice: '19.0000',
        UnitsInStock: 17,
        UnitsOnOrder: 40,
        ReorderLevel: 25,
        Discontinued: false,
        OrderDate: new Date('2003-03-17').toISOString(),
        OrderDate2: new Date('2003-03-17').toISOString()
    },
    {
        ProductID: 7,
        ProductName: 'Chang',
        SupplierID: 1,
        CategoryID: 1,
        QuantityPerUnit: '24 - 12 oz bottles',
        UnitPrice: '19.0000',
        UnitsInStock: 17,
        UnitsOnOrder: 40,
        ReorderLevel: 25,
        Discontinued: false,
        OrderDate: new Date('2003-03-17').toISOString(),
        OrderDate2: new Date('2003-03-17').toISOString()
    },
    {
        ProductID: 8,
        ProductName: 'Chang',
        SupplierID: 1,
        CategoryID: 1,
        QuantityPerUnit: '24 - 12 oz bottles',
        UnitPrice: '19.0000',
        UnitsInStock: 17,
        UnitsOnOrder: 40,
        ReorderLevel: 30,
        Discontinued: false,
        OrderDate: new Date('2003-03-17').toISOString(),
        OrderDate2: new Date('2003-03-17').toISOString()
    },
    {
        ProductID: 9,
        ProductName: 'Aniseed Syrup',
        SupplierID: 1,
        CategoryID: 2,
        QuantityPerUnit: '12 - 550 ml bottles',
        UnitPrice: '10.0000',
        UnitsInStock: 13,
        UnitsOnOrder: 70,
        ReorderLevel: 25,
        Discontinued: false,
        OrderDate: new Date('2006-03-17').toISOString(),
        OrderDate2: new Date(1991, 2, 12, 15, 40, 50).toISOString()
    },
    {
        ProductID: 10,
        ProductName: 'Chang',
        SupplierID: 1,
        CategoryID: 2,
        QuantityPerUnit: '12 - 550 ml bottles',
        UnitPrice: '10.0000',
        UnitsInStock: 13,
        UnitsOnOrder: 70,
        ReorderLevel: 25,
        Discontinued: false,
        OrderDate: new Date('2006-03-17').toISOString(),
        OrderDate2: new Date(1991, 2, 12, 15, 40, 50).toISOString()
    },
    {
        ProductID: 11,
        ProductName: 'Chai',
        SupplierID: 1,
        CategoryID: 2,
        QuantityPerUnit: '12 - 550 ml bottles',
        UnitPrice: '10.0000',
        UnitsInStock: 13,
        UnitsOnOrder: 70,
        ReorderLevel: 25,
        Discontinued: false,
        OrderDate: new Date('2006-03-17').toISOString(),
        OrderDate2: new Date(1991, 2, 12, 15, 40, 50).toISOString()
    },
    {
        ProductID: 12,
        ProductName: 'Chai',
        SupplierID: 1,
        CategoryID: 2,
        QuantityPerUnit: '12 - 550 ml bottles',
        UnitPrice: '10.0000',
        UnitsInStock: 12,
        UnitsOnOrder: 70,
        ReorderLevel: 30,
        Discontinued: false,
        OrderDate: new Date('2006-03-17').toISOString(),
        OrderDate2: new Date(1991, 2, 12, 15, 40, 50).toISOString()
    }];

}

