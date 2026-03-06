import { Component } from '@angular/core';
import { IGX_HIERARCHICAL_GRID_DIRECTIVES } from 'igniteui-angular/grids/hierarchical-grid';

@Component({
    selector: 'app-h-grid',
    templateUrl: './h-grid.component.html',
    styleUrls: ['./h-grid.component.scss'],
    imports: [IGX_HIERARCHICAL_GRID_DIRECTIVES]
})
export class HGridComponent {
    public data = [
        {
            ID: 1,
            CompanyName: 'Company A',
            ContactName: 'John Doe',
            ContactTitle: 'Sales Manager',
            Address: '123 Main St',
            City: 'New York',
            Region: 'NY',
            PostalCode: '10001',
            Country: 'USA',
            Phone: '555-1234',
            Fax: '555-1235',
            ChildCompanies: [
                {
                    ID: 11,
                    CompanyName: 'Subsidiary A1',
                    ContactName: 'Jane Smith',
                    ContactTitle: 'Manager',
                    Address: '456 Park Ave',
                    City: 'New York',
                    Region: 'NY',
                    PostalCode: '10002',
                    Country: 'USA',
                    Phone: '555-2345',
                    Fax: '555-2346'
                },
                {
                    ID: 12,
                    CompanyName: 'Subsidiary A2',
                    ContactName: 'Bob Johnson',
                    ContactTitle: 'Director',
                    Address: '789 Broadway',
                    City: 'New York',
                    Region: 'NY',
                    PostalCode: '10003',
                    Country: 'USA',
                    Phone: '555-3456',
                    Fax: '555-3457'
                }
            ]
        },
        {
            ID: 2,
            CompanyName: 'Company B',
            ContactName: 'Alice Williams',
            ContactTitle: 'CEO',
            Address: '321 Oak St',
            City: 'Los Angeles',
            Region: 'CA',
            PostalCode: '90001',
            Country: 'USA',
            Phone: '555-4567',
            Fax: '555-4568',
            ChildCompanies: [
                {
                    ID: 21,
                    CompanyName: 'Subsidiary B1',
                    ContactName: 'Charlie Brown',
                    ContactTitle: 'VP',
                    Address: '654 Sunset Blvd',
                    City: 'Los Angeles',
                    Region: 'CA',
                    PostalCode: '90002',
                    Country: 'USA',
                    Phone: '555-5678',
                    Fax: '555-5679'
                }
            ]
        },
        {
            ID: 3,
            CompanyName: 'Company C',
            ContactName: 'David Miller',
            ContactTitle: 'President',
            Address: '987 Elm St',
            City: 'Chicago',
            Region: 'IL',
            PostalCode: '60601',
            Country: 'USA',
            Phone: '555-6789',
            Fax: '555-6790',
            ChildCompanies: []
        }
    ];
}
