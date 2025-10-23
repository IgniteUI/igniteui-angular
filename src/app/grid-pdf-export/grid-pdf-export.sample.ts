import { Component, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
    IgxGridComponent,
    IgxColumnComponent,
    IgxPdfExporterService,
    IgxPdfExporterOptions,
    IgxTreeGridComponent,
    IgxHierarchicalGridComponent,
    IgxRowIslandComponent,
    IgxButtonDirective,
    IgxSwitchComponent,
    IgxSelectComponent,
    IgxSelectItemComponent,
    IgxInputGroupComponent,
    IgxLabelDirective,
    IgxInputDirective,
    IgxColumnGroupComponent
} from 'igniteui-angular';

@Component({
    selector: 'app-grid-pdf-export-sample',
    templateUrl: 'grid-pdf-export.sample.html',
    styleUrls: ['grid-pdf-export.sample.scss'],
    imports: [
        IgxGridComponent,
        IgxColumnComponent,
        IgxColumnGroupComponent,
        IgxTreeGridComponent,
        IgxHierarchicalGridComponent,
        IgxRowIslandComponent,
        IgxButtonDirective,
        IgxSwitchComponent,
        IgxSelectComponent,
        IgxSelectItemComponent,
        IgxInputGroupComponent,
        IgxLabelDirective,
        IgxInputDirective,
        FormsModule
    ],
    providers: [IgxPdfExporterService]
})
export class GridPdfExportSampleComponent {
    private pdfExporter = inject(IgxPdfExporterService);

    @ViewChild('grid1', { static: true })
    public grid1: IgxGridComponent;

    @ViewChild('treeGrid', { static: true })
    public treeGrid: IgxTreeGridComponent;

    @ViewChild('hierarchicalGrid', { static: true })
    public hierarchicalGrid: IgxHierarchicalGridComponent;

    // Grid data
    public gridData = [
        { ID: 1, Name: 'Product A', Category: 'Electronics', Price: 299.99, InStock: true, LaunchDate: new Date(2023, 0, 15) },
        { ID: 2, Name: 'Product B', Category: 'Clothing', Price: 49.99, InStock: true, LaunchDate: new Date(2023, 1, 20) },
        { ID: 3, Name: 'Product C', Category: 'Electronics', Price: 599.99, InStock: false, LaunchDate: new Date(2023, 2, 10) },
        { ID: 4, Name: 'Product D', Category: 'Books', Price: 19.99, InStock: true, LaunchDate: new Date(2023, 3, 5) },
        { ID: 5, Name: 'Product E', Category: 'Clothing', Price: 79.99, InStock: true, LaunchDate: new Date(2023, 4, 12) },
        { ID: 6, Name: 'Product F', Category: 'Electronics', Price: 899.99, InStock: false, LaunchDate: new Date(2023, 5, 8) },
        { ID: 7, Name: 'Product G', Category: 'Books', Price: 24.99, InStock: true, LaunchDate: new Date(2023, 6, 22) },
        { ID: 8, Name: 'Product H', Category: 'Clothing', Price: 39.99, InStock: true, LaunchDate: new Date(2023, 7, 18) },
        { ID: 9, Name: 'Product I', Category: 'Electronics', Price: 1299.99, InStock: true, LaunchDate: new Date(2023, 8, 5) },
        { ID: 10, Name: 'Product J', Category: 'Books', Price: 34.99, InStock: true, LaunchDate: new Date(2023, 9, 14) },
        { ID: 11, Name: 'Product K', Category: 'Clothing', Price: 89.99, InStock: false, LaunchDate: new Date(2023, 10, 3) },
        { ID: 12, Name: 'Product L', Category: 'Electronics', Price: 449.99, InStock: true, LaunchDate: new Date(2023, 11, 1) }
    ];

    // Tree Grid data
    public treeGridData = [
        { ID: 1, ParentID: -1, Name: 'Electronics', Budget: 5000 },
        { ID: 2, ParentID: 1, Name: 'Laptops', Budget: 2000 },
        { ID: 3, ParentID: 1, Name: 'Phones', Budget: 1500 },
        { ID: 4, ParentID: 1, Name: 'Tablets', Budget: 1500 },
        { ID: 5, ParentID: -1, Name: 'Furniture', Budget: 3000 },
        { ID: 6, ParentID: 5, Name: 'Chairs', Budget: 800 },
        { ID: 7, ParentID: 5, Name: 'Desks', Budget: 1200 },
        { ID: 8, ParentID: 5, Name: 'Cabinets', Budget: 1000 },
        { ID: 9, ParentID: -1, Name: 'Office Supplies', Budget: 2500 },
        { ID: 10, ParentID: 9, Name: 'Paper Products', Budget: 600 },
        { ID: 11, ParentID: 9, Name: 'Writing Instruments', Budget: 400 },
        { ID: 12, ParentID: 9, Name: 'Storage Solutions', Budget: 1500 }
    ];

    // Hierarchical Grid data
    public hierarchicalGridData = [
        {
            ID: 1,
            CompanyName: 'Company A',
            Revenue: 1000000,
            Employees: [
                { ID: 1, Name: 'John Doe', Position: 'Manager', Salary: 80000 },
                { ID: 2, Name: 'Jane Smith', Position: 'Developer', Salary: 70000 },
                { ID: 3, Name: 'Mike Wilson', Position: 'Developer', Salary: 72000 }
            ]
        },
        {
            ID: 2,
            CompanyName: 'Company B',
            Revenue: 2000000,
            Employees: [
                { ID: 4, Name: 'Bob Johnson', Position: 'CEO', Salary: 150000 },
                { ID: 5, Name: 'Alice Brown', Position: 'Designer', Salary: 65000 },
                { ID: 6, Name: 'Carol Davis', Position: 'Developer', Salary: 75000 }
            ]
        },
        {
            ID: 3,
            CompanyName: 'Company C',
            Revenue: 1500000,
            Employees: [
                { ID: 7, Name: 'David Lee', Position: 'Manager', Salary: 85000 },
                { ID: 8, Name: 'Emma Taylor', Position: 'Analyst', Salary: 68000 },
                { ID: 9, Name: 'Frank Martinez', Position: 'Developer', Salary: 73000 },
                { ID: 10, Name: 'Grace Anderson', Position: 'Designer', Salary: 67000 }
            ]
        }
    ];

    // Export options
    public fileName = 'GridExport';
    public pageOrientation: 'portrait' | 'landscape' = 'landscape';
    public pageSize = 'a4';
    public showTableBorders = true;
    public fontSize = 10;
    public pageSizes = ['a3', 'a4', 'a5', 'letter', 'legal'];

    public exportGrid() {
        const options = this.createExportOptions();
        this.pdfExporter.export(this.grid1, options);
    }

    public exportTreeGrid() {
        const options = this.createExportOptions();
        options.fileName = `TreeGrid_${this.fileName}`;
        this.pdfExporter.export(this.treeGrid, options);
    }

    public exportHierarchicalGrid() {
        const options = this.createExportOptions();
        options.fileName = `HierarchicalGrid_${this.fileName}`;
        this.pdfExporter.export(this.hierarchicalGrid, options);
    }

    private createExportOptions(): IgxPdfExporterOptions {
        const options = new IgxPdfExporterOptions(this.fileName);
        options.pageOrientation = this.pageOrientation;
        options.pageSize = this.pageSize;
        options.showTableBorders = this.showTableBorders;
        options.fontSize = this.fontSize;
        return options;
    }
}
