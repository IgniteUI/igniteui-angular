// import { Component, OnInit, TemplateRef, ViewChild } from "@angular/core";
// import { IgxGridCellComponent } from "../grid/cell.component";
// import { IGridCellEventArgs, IgxGridComponent } from "../grid/grid.component";
// import { Calendar } from "../main";
// import { TestDataService } from "./test-data.service";

// const timeGenerator: Calendar = new Calendar();
// const today: Date = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0);
// const testData = new TestDataService();

// @Component({
//     template: `
//         <igx-grid
//             (onSelection)="cellSelected($event)"
//             (onCellClick)="cellClick($event)"
//             (onContextMenu)="cellRightClick($event)"
//             (onDoubleClick)="doubleClick($event)"
//             [data]="data"
//             [autoGenerate]="true">
//         </igx-grid>
//     `
// })
// export class DefaultGridComponent {

//     public data = testData.numberDataTwoFields;
//     //  [
//     //     { index: 1, value: 1},
//     //     { index: 2, value: 2}
//     // ];

//     public selectedCell: IgxGridCellComponent;
//     public clickedCell: IgxGridCellComponent;

//     @ViewChild(IgxGridComponent, { read: IgxGridComponent })
//     public instance: IgxGridComponent;

//     public cellSelected(event: IGridCellEventArgs) {
//         this.selectedCell = event.cell;
//     }

//     public cellClick(evt) {
//         this.clickedCell = evt.cell;
//     }

//     public cellRightClick(evt) {
//         this.clickedCell = evt.cell;
//     }

//     public doubleClick(evt) {
//         this.clickedCell = evt.cell;
//     }
// }

// @Component({
// template: `
//     <igx-grid (onSelection)="cellSelected($event)" [data]="data" [autoGenerate]="true"></igx-grid>
// `
// })
// export class CtrlKeyKeyboardNagivationComponent {

//     public data = testData.numberDataFourFields;
//     //  [
//     //     { index: 1, value: 1, other: 1, another: 1},
//     //     { index: 2, value: 2, other: 2, another: 2}
//     // ];

//     public selectedCell: IgxGridCellComponent;

//     @ViewChild(IgxGridComponent, { read: IgxGridComponent })
//     public instance: IgxGridComponent;

//     public cellSelected(event: IGridCellEventArgs) {
//         this.selectedCell = event.cell;
//     }
// }

// @Component({
// template: `
//     <igx-grid [height]="'300px'" [width]="'800px'" [data]="data" [autoGenerate]="true"></igx-grid>
// `
// })
// export class NoColumnWidthGridComponent {
//     public data = [];
//     @ViewChild(IgxGridComponent, { read: IgxGridComponent })
//     public instance: IgxGridComponent;
//     constructor() {
//         this.data = testData.generateNumberData(1000);
//         //  this.generateData();
//     }
//     // public generateData() {
//     //     const data = [];
//     //     for (let i = 0; i < 1000; i++) {
//     //         data.push({ index: i, value: i, other: i, another: i });
//     //     }
//     //     return data;
//     // }
// } // Equals GridWithSizeComponent

// @Component({
// template: `
//     <igx-grid [data]="data">
//         <igx-column [editable]="true" field="FirstName"></igx-column>
//         <igx-column field="LastName"></igx-column>
//         <igx-column field="age"></igx-column>
//     </igx-grid>
//     <input type="text" value="text" id="input-test" />
// `
// })
// export class GridWithEditableColumnComponent {

//     @ViewChild(IgxGridComponent) public grid: IgxGridComponent;

//     public data = testData.personNameAgeData;
//     // [
//     //     { FirstName: "John", LastName: "Brown", age: 20 },
//     //     { FirstName: "Ben", LastName: "Affleck", age: 30 },
//     //     { FirstName: "Tom", LastName: "Riddle", age: 50 }
//     // ];
// }

// @Component({
// template: `
//     <igx-grid [data]="data" width="500px" height="300px">
//         <igx-column [resizable]="true" field="ID" width="100px"></igx-column>
//         <igx-column [resizable]="true" [minWidth]="'70px'" [maxWidth]="'250px'" field="Name" width="100px"></igx-column>
//         <igx-column [resizable]="false" [sortable]="true" field="LastName" width="100px"></igx-column>
//         <igx-column [resizable]="true" field="Region" width="100px"></igx-column>
//     </igx-grid>
// `
// })
// export class ResizableColumnsComponent {

//     public data = testData.personIDNameRegionData;
//     // [
//     //     { ID: 2, Name: "Jane", LastName: "Brown", Region: "AD" },
//     //     { ID: 1, Name: "Brad", LastName: "Williams", Region: "BD" },
//     //     { ID: 6, Name: "Rick", LastName: "Jones", Region: "ACD"},
//     //     { ID: 7, Name: "Rick", LastName: "BRown", Region: "DD" },
//     //     { ID: 5, Name: "ALex", LastName: "Smith", Region: "MlDs" },
//     //     { ID: 4, Name: "Alex", LastName: "Wilson", Region: "DC" },
//     //     { ID: 3, Name: "Connor", LastName: "Walker", Region: "OC" }
//     // ];

//     @ViewChild(IgxGridComponent) public grid: IgxGridComponent;
// }

// @Component({
// template: `
//     <igx-grid [data]="data" width="500px">
//         <igx-column [pinned]="true" [resizable]="true" field="ID" width="100px"></igx-column>
//         <igx-column [pinned]="true" [resizable]="true" field="Name" width="100px" [maxWidth]="'150px'"></igx-column>
//         <igx-column [resizable]="true" field="LastName" width="100px"></igx-column>
//         <igx-column [resizable]="true" field="Region" width="100px"></igx-column>
//     </igx-grid>
// `
// })
// export class PinnedColumnsComponent {

//     public data = testData.personIDNameRegionData;
//     // [
//     //     { ID: 2, Name: "Jane", LastName: "Brown", Region: "AD" },
//     //     { ID: 1, Name: "Brad", LastName: "Williams", Region: "BD" },
//     //     { ID: 6, Name: "Rick", LastName: "Jones", Region: "ACD"},
//     //     { ID: 7, Name: "Rick", LastName: "BRown", Region: "DD" },
//     //     { ID: 5, Name: "ALex", LastName: "Smith", Region: "MlDs" },
//     //     { ID: 4, Name: "Alex", LastName: "Wilson", Region: "DC" },
//     //     { ID: 3, Name: "Connor", LastName: "Walker", Region: "OC" }
//     // ];

//     @ViewChild(IgxGridComponent) public grid: IgxGridComponent;
// }

// @Component({
//     template: `
//     <igx-grid width="600px" height="600px" [data]="data" [autoGenerate]="false">
//         <igx-column [field]="'Released'" [pinned]="true" width="100px" dataType="boolean" [resizable]="true"></igx-column>
//         <igx-column [field]="'ReleaseDate'" [pinned]="true" width="100px" dataType="date" [resizable]="true"></igx-column>
//         <igx-column [field]="'Items'" [pinned]="true" width="100px" dataType="string" [resizable]="true"></igx-column>
//         <igx-column [field]="'ID'" [width]="'100px'" [header]="'ID'" [resizable]="true"></igx-column>
//         <igx-column [field]="'ProductName'" width="25px" [maxWidth]="'100px'" dataType="string" [resizable]="true"></igx-column>
//         <igx-column [field]="'Test'" width="100px" dataType="string" [resizable]="true">
//             <ng-template igxCell>
//                 <div></div>
//             </ng-template>
//         </igx-column>
//         <igx-column [field]="'Downloads'" width="100px" dataType="number" [resizable]="true"></igx-column>
//         <igx-column [field]="'Category'" width="100px" dataType="string" [resizable]="true"></igx-column>
//   </igx-grid>
//     `
// })

// export class LargePinnedColGridComponent implements OnInit {

//     timeGenerator: Calendar = new Calendar();
//     today: Date = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0);
//     data = [];

//     @ViewChild(IgxGridComponent) public grid: IgxGridComponent;

//     ngOnInit() {
//         this.data = testData.generateProductData(75);
//         // this.createData();
//     }

//     // createData() {
//     //     for (let i = 0; i < 75; i++) {
//     //         const item = {
//     //             Downloads: 100 + i,
//     //             ID: i,
//     //             ProductName: "ProductName" + i,
//     //             ReleaseDate: this.timeGenerator.timedelta(this.today, "month", -1),
//     //             Released: true,
//     //             Category: "Category" + i,
//     //             Items: "Items" + i,
//     //             Test: "test" + i
//     //         };
//     //         this.data.push(item);
//     //     }
//     //   }
// }

// @Component({
//     template: `<igx-grid [data]="data" (onColumnResized)="handleResize($event)">
//         <igx-column [field]="'ID'" [width]="'150px'" [sortable]="true" [resizable]="true"></igx-column>
//         <igx-column [field]="'ProductName'" [width]="'150px'" [resizable]="true" dataType="string"></igx-column>
//         <igx-column [field]="'Downloads'" [sortable]="true" [header]="'D'" [width]="'150px'" [resizable]="true" dataType="number">
//         </igx-column>
//         <igx-column [field]="'Released'" [header]="'Re'" [resizable]="true" dataType="boolean"></igx-column>
//         <igx-column [field]="'ReleaseDate'" [resizable]="true" dataType="date"></igx-column>
//         <igx-column [field]="'Category'" [width]="'150px'" [resizable]="true" dataType="string">
//             <ng-template igxCell igxHeader>
//                 <igx-avatar initials="JS"></igx-avatar>
//             </ng-template>
//         </igx-column>
//         <igx-column [field]="'Items'" [width]="'60px'" [hasSummary]="true" [resizable]="true" dataType="string"></igx-column>
//         <igx-column [field]="'Test'" [resizable]="true" dataType="string"></igx-column>
//     </igx-grid>`
// })
// export class GridFeaturesComponent {
//     public count = 0;
//     public column;
//     public prevWidth;
//     public newWidth;

//     public timeGenerator: Calendar = new Calendar();
//     public today: Date = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0);

//     public data = testData.productInfoData;
//     // public data = [
//     //     {
//     //         Downloads: 254,
//     //         ID: 1,
//     //         ProductName: "Ignite UI for JavaScript",
//     //         ReleaseDate: this.timeGenerator.timedelta(this.today, "day", 15),
//     //         Released: false,
//     //         Category: "Category 1",
//     //         Items: "Item 1",
//     //         Test: "Test 1"
//     //     },
//     //     {
//     //         Downloads: 127,
//     //         ID: 2,
//     //         ProductName: "NetAdvantage",
//     //         ReleaseDate: this.timeGenerator.timedelta(this.today, "month", -1),
//     //         Released: true,
//     //         Category: "Category 2",
//     //         Items: "Item 2",
//     //         Test: "Test 2"
//     //     },
//     //     {
//     //         Downloads: 20,
//     //         ID: 3,
//     //         ProductName: "Ignite UI for Angular",
//     //         ReleaseDate: null,
//     //         Released: null,
//     //         Category: "Category 3",
//     //         Items: "Item 3",
//     //         Test: "Test 3"
//     //     },
//     //     {
//     //         Downloads: null,
//     //         ID: 4,
//     //         ProductName: null,
//     //         ReleaseDate: this.timeGenerator.timedelta(this.today, "day", -1),
//     //         Released: true,
//     //         Category: "Category 4",
//     //         Items: "Item 4",
//     //         Test: "Test 4"
//     //     },
//     //     {
//     //         Downloads: 100,
//     //         ID: 5,
//     //         ProductName: "",
//     //         ReleaseDate: undefined,
//     //         Released: "",
//     //         Category: "Category 5",
//     //         Items: "Item 5",
//     //         Test: "Test 5"
//     //     },
//     //     {
//     //         Downloads: 702,
//     //         ID: 6,
//     //         ProductName: "Some other item with Script",
//     //         ReleaseDate: this.timeGenerator.timedelta(this.today, "day", 1),
//     //         Released: null,
//     //         Category: "Category 6",
//     //         Items: "Item 6",
//     //         Test: "Test 6"
//     //     },
//     //     {
//     //         Downloads: 0,
//     //         ID: 7,
//     //         ProductName: null,
//     //         ReleaseDate: this.timeGenerator.timedelta(this.today, "month", 1),
//     //         Released: true,
//     //         Category: "Category 7",
//     //         Items: "Item 7",
//     //         Test: "Test 7"
//     //     },
//     //     {
//     //         Downloads: 1000,
//     //         ID: 8,
//     //         ProductName: null,
//     //         ReleaseDate: this.today,
//     //         Released: false,
//     //         Category: "Category 8",
//     //         Items: "Item 8",
//     //         Test: "Test 8"
//     //     }
//     // ];

//     @ViewChild(IgxGridComponent) public grid: IgxGridComponent;

//     handleResize(event) {
//         this.count++;
//         this.column = event.column;
//         this.prevWidth = event.prevWidth;
//         this.newWidth = event.newWidth;
//     }
// }

// @Component({
//     template: `
//     <igx-grid [data]="data" [height]="'800px'">
//         <igx-column *ngFor="let c of columns" [field]="c.field"
//                                               [header]="c.field"
//                                               [resizable]="c.resizable"
//                                               [width]="c.width"
//                                               [minWidth]="c.minWidth"
//                                               [maxWidth]="c.maxWidth">
//         </igx-column>
//     </igx-grid>
//     `
// })
// export class NullColumnsComponent implements OnInit {

//     public data = [];
//     public columns = [];

//     @ViewChild(IgxGridComponent) public grid: IgxGridComponent;

//     public ngOnInit(): void {
//         this.columns = [
//             { field: "ID", resizable: true, maxWidth: 200, minWidth: 70 },
//             { field: "CompanyName", resizable: true },
//             { field: "ContactName", resizable: true },
//             { field: "ContactTitle", resizable: true},
//             { field: "Address", resizable: true },
//             { field: "City", resizable: true },
//             { field: "Region", resizable: true },
//             { field: "PostalCode", resizable: true },
//             { field: "Phone", resizable: true },
//             { field: "Fax", resizable: true }
//         ];
//         this.data = testData.productInfoData;

//         // this.data = [
//         //     {
//         //         ID: "ALFKI",
//         //         CompanyName: "Alfreds Futterkiste",
//         //         ContactName: "Maria Anders",
//         //         ContactTitle: "Sales Representative",
//         //         Address: "Obere Str. 57",
//         //         City: "Berlin",
//         //         Region: null,
//         //         PostalCode: "12209",
//         //         Country: "Germany",
//         //         Phone: "030-0074321",
//         //         Fax: "030-0076545"
//         //     },
//         //     {
//         //         ID: "ANATR",
//         //         CompanyName: "Ana Trujillo Emparedados y helados",
//         //         ContactName: "Ana Trujillo",
//         //         ContactTitle: "Owner",
//         //         Address: "Avda. de la Constitución 2222",
//         //         City: "México D.F.",
//         //         Region: null,
//         //         PostalCode: "05021",
//         //         Country: "Mexico",
//         //         Phone: "(5) 555-4729",
//         //         Fax: "(5) 555-3745"
//         //     },
//         //     {
//         //         ID: "ANTON",
//         //         CompanyName: "Antonio Moreno Taquería",
//         //         ContactName: "Antonio Moreno",
//         //         ContactTitle: "Owner",
//         //         Address: "Mataderos 2312",
//         //         City: "México D.F.",
//         //         Region: null,
//         //         PostalCode: "05023",
//         //         Country: "Mexico",
//         //         Phone: "(5) 555-3932",
//         //         Fax: null
//         //     },
//         //     {
//         //         ID: "AROUT",
//         //         CompanyName: "Around the Horn",
//         //         ContactName: "Thomas Hardy",
//         //         ContactTitle: "Sales Representative",
//         //         Address: "120 Hanover Sq.",
//         //         City: "London",
//         //         Region: null,
//         //         PostalCode: "WA1 1DP",
//         //         Country: "UK",
//         //         Phone: "(171) 555-7788",
//         //         Fax: "(171) 555-6750"
//         //     },
//         //     {
//         //         ID: "BERGS",
//         //         CompanyName: "Berglunds snabbköp",
//         //         ContactName: "Christina Berglund",
//         //         ContactTitle: "Order Administrator",
//         //         Address: "Berguvsvägen 8",
//         //         City: "Luleå",
//         //         Region: null,
//         //         PostalCode: "S-958 22",
//         //         Country: "Sweden",
//         //         Phone: "0921-12 34 65",
//         //         Fax: "0921-12 34 67"
//         //     },
//         //     {
//         //         ID: "BLAUS",
//         //         CompanyName: "Blauer See Delikatessen",
//         //         ContactName: "Hanna Moos",
//         //         ContactTitle: "Sales Representative",
//         //         Address: "Forsterstr. 57",
//         //         City: "Mannheim",
//         //         Region: null,
//         //         PostalCode: "68306",
//         //         Country: "Germany",
//         //         Phone: "0621-08460",
//         //         Fax: "0621-08924"
//         //     },
//         //     {
//         //         ID: "BLONP",
//         //         CompanyName: "Blondesddsl père et fils",
//         //         ContactName: "Frédérique Citeaux",
//         //         ContactTitle: "Marketing Manager",
//         //         Address: "24, place Kléber",
//         //         City: "Strasbourg",
//         //         Region: null,
//         //         PostalCode: "67000",
//         //         Country: "France",
//         //         Phone: "88.60.15.31",
//         //         Fax: "88.60.15.32"
//         //     },
//         //     {
//         //         ID: "BOLID",
//         //         CompanyName: "Bólido Comidas preparadas",
//         //         ContactName: "Martín Sommer",
//         //         ContactTitle: "Owner",
//         //         Address: "C/ Araquil, 67",
//         //         City: "Madrid",
//         //         Region: null,
//         //         PostalCode: "28023",
//         //         Country: "Spain",
//         //         Phone: "(91) 555 22 82",
//         //         Fax: "(91) 555 91 99"
//         //     },
//         //     {
//         //         ID: "BONAP",
//         //         CompanyName: "Bon app'",
//         //         ContactName: "Laurence Lebihan",
//         //         ContactTitle: "Owner",
//         //         Address: "12, rue des Bouchers",
//         //         City: "Marseille",
//         //         Region: null,
//         //         PostalCode: "13008",
//         //         Country: "France",
//         //         Phone: "91.24.45.40",
//         //         Fax: "91.24.45.41"
//         //     },
//         //     {
//         //         ID: "BOTTM",
//         //         CompanyName: "Bottom-Dollar Markets",
//         //         ContactName: "Elizabeth Lincoln",
//         //         ContactTitle: "Accounting Manager",
//         //         Address: "23 Tsawassen Blvd.",
//         //         City: "Tsawassen",
//         //         Region: "BC",
//         //         PostalCode: "T2F 8M4",
//         //         Country: "Canada",
//         //         Phone: "(604) 555-4729",
//         //         Fax: "(604) 555-3745"
//         //     },
//         //     {
//         //         ID: "BSBEV",
//         //         CompanyName: "B's Beverages",
//         //         ContactName: "Victoria Ashworth",
//         //         ContactTitle: "Sales Representative",
//         //         Address: "Fauntleroy Circus", City: "London",
//         //         Region: null, PostalCode: "EC2 5NT",
//         //         Country: "UK",
//         //         Phone: "(171) 555-1212",
//         //         Fax: null
//         //     }
//         // ];
//     }
// }

// @Component({
//     template: `
//         <igx-grid [data]="data">
//             <igx-column *ngFor="let each of declarations" [field]="each"></igx-column>
//         </igx-grid>
//     `
// })
// export class ColumnsFromIterableComponent {

//     public data = testData.personIDNameData;
//     // [
//     //     { ID: 1, Name: "Johny" },
//     //     { ID: 2, Name: "Sally" },
//     //     { ID: 3, Name: "Tim" }
//     // ];

//     public declarations = ["ID", "Name"];

//     @ViewChild(IgxGridComponent, { read: IgxGridComponent })
//     public instance: IgxGridComponent;
// }

// @Component({
//     template: `
//         <igx-grid [data]="data">
//             <igx-column field="ID">
//                 <ng-template igxHeader>
//                     <span class="header">Header text</span>
//                 </ng-template>

//                 <ng-template igxCell>
//                     <span class="cell">Cell text</span>
//                 </ng-template>

//                 <ng-template igxFooter>
//                     <span class="footer">Footer text</span>
//                 </ng-template>
//             </igx-column>
//             <igx-column field="Name">
//                 <ng-template igxHeader>
//                     <span class="header">Header text</span>
//                 </ng-template>

//                 <ng-template igxCell>
//                     <span class="cell">Cell text</span>
//                 </ng-template>

//                 <ng-template igxFooter>
//                     <span class="footer">Footer text</span>
//                 </ng-template>
//             </igx-column>
//         </igx-grid>

//         <ng-template #newHeader>
//             <span class="new-header">New header text</span>
//         </ng-template>

//         <ng-template #newCell>
//             <span class="new-cell">New cell text</span>
//         </ng-template>
//     `
// })
// export class TemplatedColumnsComponent {

//     public data = testData.personIDNameData;
//     // [
//     //     { ID: 1, Name: "Johny" },
//     //     { ID: 2, Name: "Sally" },
//     //     { ID: 3, Name: "Tim" }
//     // ];

//     @ViewChild(IgxGridComponent, { read: IgxGridComponent })
//     public instance: IgxGridComponent;

//     @ViewChild("newHeader", { read: TemplateRef })
//     public newHeaderTemplate: TemplateRef<any>;

//     @ViewChild("newCell", { read: TemplateRef })
//     public newCellTemplate: TemplateRef<any>;
// }

// @Component({
//     template: `
//         <igx-grid [data]="data">
//             <igx-column field="ID" [hidden]="true"></igx-column>
//         </igx-grid>
//     `
// })
// export class ColumnHiddenFromMarkupComponent {

//     public data = testData.personIDNameData;
//     // [
//     //     { ID: 1, Name: "Johny" },
//     //     { ID: 2, Name: "Sally" },
//     //     { ID: 3, Name: "Tim" }
//     // ];

//     @ViewChild(IgxGridComponent, { read: IgxGridComponent })
//     public instance: IgxGridComponent;
// }

// @Component({
//     template: `
//         <igx-grid [data]="data">
//             <igx-column field="ID" [formatter]="multiplier"></igx-column>
//             <igx-column field="Name"></igx-column>
//         </igx-grid>
//     `
// })
// export class ColumnCellFormatterComponent {

//     public data = testData.personIDNameData;
//     // [
//     //     { ID: 1, Name: "Johny" },
//     //     { ID: 2, Name: "Sally" },
//     //     { ID: 3, Name: "Tim" }
//     // ];

//     @ViewChild(IgxGridComponent, { read: IgxGridComponent })
//     public instance: IgxGridComponent;

//     public multiplier(value: number): string {
//         return `${value * value}`;
//     }
// }

// @Component({
//     template: `<igx-grid [data]="data" height="500px">
//         <igx-column [field]="'ID'" [header]="'ID'"></igx-column>
//         <igx-column [field]="'ProductName'" [filterable]="true" dataType="string"></igx-column>
//         <igx-column [field]="'Downloads'" [filterable]="true" dataType="number"></igx-column>
//         <igx-column [field]="'Released'" [filterable]="true" dataType="boolean"></igx-column>
//         <igx-column [field]="'ReleaseDate'" [header]="'ReleaseDate'"
//             [filterable]="true" dataType="date">
//         </igx-column>
//     </igx-grid>`
// })
// export class IgxGridFilteringComponent {

//     public timeGenerator: Calendar = new Calendar();
//     public today: Date = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0);

//     public data = testData.productInfoData;
//     // public data = [
//     //     {
//     //         Downloads: 254,
//     //         ID: 1,
//     //         ProductName: "Ignite UI for JavaScript",
//     //         ReleaseDate: this.timeGenerator.timedelta(this.today, "day", 15),
//     //         Released: false
//     //     },
//     //     {
//     //         Downloads: 127,
//     //         ID: 2,
//     //         ProductName: "NetAdvantage",
//     //         ReleaseDate: this.timeGenerator.timedelta(this.today, "month", -1),
//     //         Released: true
//     //     },
//     //     {
//     //         Downloads: 20,
//     //         ID: 3,
//     //         ProductName: "Ignite UI for Angular",
//     //         ReleaseDate: null,
//     //         Released: null
//     //     },
//     //     {
//     //         Downloads: null,
//     //         ID: 4,
//     //         ProductName: null,
//     //         ReleaseDate: this.timeGenerator.timedelta(this.today, "day", -1),
//     //         Released: true
//     //     },
//     //     {
//     //         Downloads: 100,
//     //         ID: 5,
//     //         ProductName: "",
//     //         ReleaseDate: undefined,
//     //         Released: false
//     //     },
//     //     {
//     //         Downloads: 702,
//     //         ID: 6,
//     //         ProductName: "Some other item with Script",
//     //         ReleaseDate: this.timeGenerator.timedelta(this.today, "day", 1),
//     //         Released: null
//     //     },
//     //     {
//     //         Downloads: 0,
//     //         ID: 7,
//     //         ProductName: null,
//     //         ReleaseDate: this.timeGenerator.timedelta(this.today, "month", 1),
//     //         Released: true
//     //     },
//     //     {
//     //         Downloads: 1000,
//     //         ID: 8,
//     //         ProductName: null,
//     //         ReleaseDate: this.today,
//     //         Released: undefined
//     //     }
//     // ];

//     @ViewChild(IgxGridComponent) public grid: IgxGridComponent;
// }

// @Component({
//     template: `
//         <igx-grid #gridSelection2 [data]="data" [primaryKey]="'ID'"
//         [autoGenerate]="true" [rowSelectable]="true" [paging]="true" [perPage]="50">
//         </igx-grid>
//         <button class="prevPageBtn" (click)="ChangePage(-1)">Prev page</button>
//         <button class="nextPageBtn" (click)="ChangePage(1)">Next page</button>
//     `
// })
// export class GridWithPagingAndSelectionComponent implements OnInit {
//     public data = [];

//     @ViewChild("gridSelection2", { read: IgxGridComponent })
//     public gridSelection2: IgxGridComponent;

//     ngOnInit() {
//         const bigData = [];
//         for (let i = 0; i < 100; i++) {
//             for (let j = 0; j < 5; j++) {
//                 bigData.push({
//                     ID: i.toString() + "_" + j.toString(),
//                     Column1: i * j,
//                     Column2: i * j * Math.pow(10, i),
//                     Column3: i * j * Math.pow(100, i)
//                 });
//             }
//         }
//         this.data = bigData;
//     }

//     public ChangePage(val) {
//         switch (val) {
//             case -1:
//                 this.gridSelection2.previousPage();
//                 break;
//             case 1:
//                 this.gridSelection2.nextPage();
//                 break;
//             default:
//                 this.gridSelection2.paginate(val);
//                 break;
//         }
//     }
// }

// @Component({
//     template: `
//         <igx-grid #gridSelection3 [data]="data" [primaryKey]="'ID'" [width]="'800px'" [height]="'600px'"
//         [autoGenerate]="true" [rowSelectable]="true">
//         </igx-grid>
//     `
// })
// export class GridWithSelectionComponent implements OnInit {
//     public data = [];

//     @ViewChild("gridSelection3", { read: IgxGridComponent })
//     public gridSelection3: IgxGridComponent;

//     ngOnInit() {
//         const bigData = [];
//         for (let i = 0; i < 100; i++) {
//             for (let j = 0; j < 5; j++) {
//                 bigData.push({
//                     ID: i.toString() + "_" + j.toString(),
//                     Column1: i * j,
//                     Column2: i * j * Math.pow(10, i),
//                     Column3: i * j * Math.pow(100, i)
//                 });
//             }
//         }
//         this.data = bigData;
//     }
// }

// @Component({
//     template: `<igx-grid #gridSelection4 [data]="data" height="500px" [rowSelectable]="true">
//         <igx-column [field]="'ID'" [header]="'ID'"></igx-column>
//         <igx-column [field]="'ProductName'" [filterable]="true" dataType="string"></igx-column>
//         <igx-column [field]="'Downloads'" [filterable]="true" dataType="number"></igx-column>
//         <igx-column [field]="'Released'" [filterable]="true" dataType="boolean"></igx-column>
//         <igx-column [field]="'ReleaseDate'" [header]="'ReleaseDate'"
//             [filterable]="true" dataType="date">
//         </igx-column>
//     </igx-grid>`
// })
// export class GridWithSelectionFilteringComponent {

//     public timeGenerator: Calendar = new Calendar();
//     public today: Date = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0);

//     @ViewChild("gridSelection4", { read: IgxGridComponent })
//     public gridSelection4: IgxGridComponent;

//     public data = [
//         {
//             Downloads: 254,
//             ID: 1,
//             ProductName: "Ignite UI for JavaScript",
//             ReleaseDate: this.timeGenerator.timedelta(this.today, "day", 15),
//             Released: false
//         },
//         {
//             Downloads: 127,
//             ID: 2,
//             ProductName: "NetAdvantage",
//             ReleaseDate: this.timeGenerator.timedelta(this.today, "month", -1),
//             Released: true
//         },
//         {
//             Downloads: 20,
//             ID: 3,
//             ProductName: "Ignite UI for Angular",
//             ReleaseDate: null,
//             Released: null
//         },
//         {
//             Downloads: null,
//             ID: 4,
//             ProductName: null,
//             ReleaseDate: this.timeGenerator.timedelta(this.today, "day", -1),
//             Released: true
//         },
//         {
//             Downloads: 100,
//             ID: 5,
//             ProductName: "",
//             ReleaseDate: undefined,
//             Released: ""
//         },
//         {
//             Downloads: 702,
//             ID: 6,
//             ProductName: "Some other item with Script",
//             ReleaseDate: this.timeGenerator.timedelta(this.today, "day", 1),
//             Released: null
//         },
//         {
//             Downloads: 0,
//             ID: 7,
//             ProductName: null,
//             ReleaseDate: this.timeGenerator.timedelta(this.today, "month", 1),
//             Released: true
//         },
//         {
//             Downloads: 1000,
//             ID: 8,
//             ProductName: null,
//             ReleaseDate: this.today,
//             Released: false
//         }
//     ];

//     @ViewChild(IgxGridComponent) public grid: IgxGridComponent;
// }

// @Component({
//     template: `
//             <igx-grid #gridSelection3
//             [data]="data"
//             [primaryKey]="'ID'"
//             [width]="'800px'"
//             [height]="'600px'"
//             [autoGenerate]="true"
//             [rowSelectable]="true"
//             (onColumnInit)="columnCreated($event)"
//         >
//         </igx-grid>
//     `
// })
// export class GridWithScrollsComponent implements OnInit {
//     public data = [];

//     @ViewChild(IgxGridComponent, { read: IgxGridComponent })
//     public gridSelection5: IgxGridComponent;

//     ngOnInit() {
//         this.data = this.getData();
//     }

//     public getData(rows: number = 100, cols: number = 100): any[] {
//         const bigData = [];
//         for (let i = 0; i < rows; i++) {
//             const row = {};
//             row["ID"] = i.toString();
//             for (let j = 1; j < cols; j++) {
//                 row["Column " + j] = i * j;
//             }

//             bigData.push(row);
//         }
//         return bigData;
//     }

//     public columnCreated(column: IgxColumnComponent) {
//         column.width = "50px";
//     }
// }

// @Component({
//     template: `
//         <igx-grid #grid1 [data]="data" [rowSelectable]="true">
//             <igx-column field="ProductID" header="Product ID">
//             </igx-column>
//             <igx-column field="ProductName" [hasSummary]="true">
//             </igx-column>
//             <igx-column field="InStock" [dataType]="'boolean'" [hasSummary]="true">
//             </igx-column>
//             <igx-column field="UnitsInStock" [dataType]="'number'" [hasSummary]="true">
//             </igx-column>
//             <igx-column field="OrderDate" width="200px" [dataType]="'date'" [sortable]="true" [hasSummary]="true">
//             </igx-column>
//         </igx-grid>
//     `
// })
// export class GridSummaryComponent {

//     public data = [
//         { ProductID: 1, ProductName: "Chai", InStock: true, UnitsInStock: 2760, OrderDate: new Date("2005-03-21") },
//         { ProductID: 2, ProductName: "Aniseed Syrup", InStock: false, UnitsInStock: 198, OrderDate: new Date("2008-01-15") },
//         { ProductID: 3, ProductName: "Chef Antons Cajun Seasoning", InStock: true, UnitsInStock: 52, OrderDate: new Date("2010-11-20") },
//         { ProductID: 4, ProductName: "Grandmas Boysenberry Spread", InStock: false, UnitsInStock: 0, OrderDate: new Date("2007-10-11") },
//         { ProductID: 5, ProductName: "Uncle Bobs Dried Pears", InStock: false, UnitsInStock: 0, OrderDate: new Date("2001-07-27") },
//         { ProductID: 6, ProductName: "Northwoods Cranberry Sauce", InStock: true, UnitsInStock: 1098, OrderDate: new Date("1990-05-17") },
//         { ProductID: 7, ProductName: "Queso Cabrales", InStock: false, UnitsInStock: 0, OrderDate: new Date("2005-03-03") },
//         { ProductID: 8, ProductName: "Tofu", InStock: true, UnitsInStock: 7898, OrderDate: new Date("2017-09-09") },
//         { ProductID: 9, ProductName: "Teatime Chocolate Biscuits", InStock: true, UnitsInStock: 6998, OrderDate: new Date("2025-12-25") },
//         { ProductID: 10, ProductName: "Chocolate", InStock: true, UnitsInStock: 20000, OrderDate: new Date("2018-03-01") }
//     ];
//     @ViewChild("grid1", { read: IgxGridComponent })
//     public gridSummaries: IgxGridComponent;

// }

// @Component({
//     template: `
//         <igx-grid #gridCancelable [data]="data" [rowSelectable]="true" (onRowSelectionChange)="cancelClick($event)">
//             <igx-column field="ProductID" header="Product ID">
//             </igx-column>
//             <igx-column field="ProductName">
//             </igx-column>
//             <igx-column field="InStock" [dataType]="'boolean'">
//             </igx-column>
//             <igx-column field="UnitsInStock" [dataType]="'number'">
//             </igx-column>
//             <igx-column field="OrderDate" width="200px" [dataType]="'date'">
//             </igx-column>
//         </igx-grid>
//     `
// })
// export class GridCancelableComponent {

//     public data = [
//         { ProductID: 1, ProductName: "Chai", InStock: true, UnitsInStock: 2760, OrderDate: new Date("2005-03-21") },
//         { ProductID: 2, ProductName: "Aniseed Syrup", InStock: false, UnitsInStock: 198, OrderDate: new Date("2008-01-15") },
//         { ProductID: 3, ProductName: "Chef Antons Cajun Seasoning", InStock: true, UnitsInStock: 52, OrderDate: new Date("2010-11-20") },
//         { ProductID: 4, ProductName: "Grandmas Boysenberry Spread", InStock: false, UnitsInStock: 0, OrderDate: new Date("2007-10-11") },
//         { ProductID: 5, ProductName: "Uncle Bobs Dried Pears", InStock: false, UnitsInStock: 0, OrderDate: new Date("2001-07-27") },
//         { ProductID: 6, ProductName: "Northwoods Cranberry Sauce", InStock: true, UnitsInStock: 1098, OrderDate: new Date("1990-05-17") },
//         { ProductID: 7, ProductName: "Queso Cabrales", InStock: false, UnitsInStock: 0, OrderDate: new Date("2005-03-03") },
//         { ProductID: 8, ProductName: "Tofu", InStock: true, UnitsInStock: 7898, OrderDate: new Date("2017-09-09") },
//         { ProductID: 9, ProductName: "Teatime Chocolate Biscuits", InStock: true, UnitsInStock: 6998, OrderDate: new Date("2025-12-25") },
//         { ProductID: 10, ProductName: "Chocolate", InStock: true, UnitsInStock: 20000, OrderDate: new Date("2018-03-01") }
//     ];

//     @ViewChild("gridCancelable", { read: IgxGridComponent })
//     public gridCancelable: IgxGridComponent;

//     public cancelClick(evt) {
//         if (evt.row && (evt.row.index + 1) % 2 === 0) {
//             evt.newSelection = evt.oldSelection || [];
//         }
//     }
// }

// @Component({
//     template: `
//         <igx-grid #grid1 [data]="data">
//             <igx-column field="ProductID" header="Product ID">
//             </igx-column>
//             <igx-column field="ProductName">
//             </igx-column>
//             <igx-column field="InStock" [dataType]="'boolean'">
//             </igx-column>
//             <igx-column field="UnitsInStock" [dataType]="'number'">
//             </igx-column>
//             <igx-column field="OrderDate" width="200px" [dataType]="'date'">
//             </igx-column>
//         </igx-grid>
//     `
// })
// export class  NoActiveSummariesComponent {

//     @ViewChild("grid1", { read: IgxGridComponent })
//     public grid1: IgxGridComponent;

//     public data = [
//         { ProductID: 1, ProductName: "Chai", InStock: true, UnitsInStock: 2760, OrderDate: "2005-03-21" },
//         { ProductID: 2, ProductName: "Aniseed Syrup", InStock: false, UnitsInStock: 198, OrderDate: "2008-01-15" },
//         { ProductID: 3, ProductName: "Chef Antons Cajun Seasoning", InStock: true, UnitsInStock: 52, OrderDate: "2010-11-20" },
//         { ProductID: 4, ProductName: "Grandmas Boysenberry Spread", InStock: false, UnitsInStock: 0, OrderDate: "2007-10-11" },
//         { ProductID: 5, ProductName: "Uncle Bobs Dried Pears", InStock: false, UnitsInStock: 0, OrderDate: "2001-07-27" },
//         { ProductID: 6, ProductName: "Northwoods Cranberry Sauce", InStock: true, UnitsInStock: 1098, OrderDate: "1990-05-17" },
//         { ProductID: 7, ProductName: "Queso Cabrales", InStock: false, UnitsInStock: 0, OrderDate: "2005-03-03" },
//         { ProductID: 8, ProductName: "Tofu", InStock: true, UnitsInStock: 7898, OrderDate: "2017-09-09" },
//         { ProductID: 9, ProductName: "Teatime Chocolate Biscuits", InStock: true, UnitsInStock: 6998, OrderDate: "2025-12-25" },
//         { ProductID: 10, ProductName: "Chocolate", InStock: true, UnitsInStock: 20000, OrderDate: "2018-03-01" }
//     ];
// }

// @Component({
//     template: `
//         <igx-grid #grid1 [data]="data">
//             <igx-column field="ProductID" header="Product ID">
//             </igx-column>
//             <igx-column field="ProductName" [hasSummary]="true">
//             </igx-column>
//             <igx-column field="InStock" [dataType]="'boolean'" [hasSummary]="true">
//             </igx-column>
//             <igx-column field="UnitsInStock" [dataType]="'number'" [hasSummary]="true" [filterable]="true">
//             </igx-column>
//             <igx-column field="OrderDate" width="200px" [dataType]="'date'" [sortable]="true" [hasSummary]="true">
//             </igx-column>
//         </igx-grid>
//     `
// })
// export class  SummaryColumnComponent {

//     public data = [
//         { ProductID: 1, ProductName: "Chai", InStock: true, UnitsInStock: 2760, OrderDate: new Date("2005-03-21") },
//         { ProductID: 2, ProductName: "Aniseed Syrup", InStock: false, UnitsInStock: 198, OrderDate: new Date("2008-01-15") },
//         { ProductID: 3, ProductName: "Chef Antons Cajun Seasoning", InStock: true, UnitsInStock: 52, OrderDate: new Date("2010-11-20") },
//         { ProductID: 4, ProductName: "Grandmas Boysenberry Spread", InStock: false, UnitsInStock: 0, OrderDate: new Date("2007-10-11") },
//         { ProductID: 5, ProductName: "Uncle Bobs Dried Pears", InStock: false, UnitsInStock: 0, OrderDate: new Date("2001-07-27") },
//         { ProductID: 6, ProductName: "Northwoods Cranberry Sauce", InStock: true, UnitsInStock: 1098, OrderDate: new Date("1990-05-17") },
//         { ProductID: 7, ProductName: "Queso Cabrales", InStock: false, UnitsInStock: 0, OrderDate: new Date("2005-03-03") },
//         { ProductID: 8, ProductName: "Tofu", InStock: true, UnitsInStock: 7898, OrderDate: new Date("2017-09-09") },
//         { ProductID: 9, ProductName: "Teatime Chocolate Biscuits", InStock: true, UnitsInStock: 6998, OrderDate: new Date("2025-12-25") },
//         { ProductID: 10, ProductName: "Chocolate", InStock: true, UnitsInStock: 20000, OrderDate: new Date("2018-03-01") }
//     ];
//     @ViewChild("grid1", { read: IgxGridComponent })
//     public grid1: IgxGridComponent;

//     public numberSummary = new IgxNumberSummaryOperand();
//     public dateSummary = new IgxDateSummaryOperand();
// }

// @Component({
//     template: `
//         <igx-grid #grid1 [data]="data" [width]="width" [height]="height">
//             <igx-column field="ProductID" header="Product ID">
//             </igx-column>
//             <igx-column field="ProductName" [hasSummary]="true">
//             </igx-column>
//             <igx-column field="InStock" [dataType]="'boolean'" [hasSummary]="true">
//             </igx-column>
//             <igx-column field="UnitsInStock" [dataType]="'number'" [hasSummary]="true" [filterable]="true">
//             </igx-column>
//             <igx-column field="OrderDate" width="200px" [dataType]="'date'" [sortable]="true" [hasSummary]="true">
//             </igx-column>
//         </igx-grid>
//     `
// })
// export class  VirtualSummaryColumnComponent {

//     public data = [
//         { ProductID: 1, ProductName: "Chai", InStock: true, UnitsInStock: 2760, OrderDate: new Date("2005-03-21") },
//         { ProductID: 2, ProductName: "Aniseed Syrup", InStock: false, UnitsInStock: 198, OrderDate: new Date("2008-01-15") },
//         { ProductID: 3, ProductName: "Chef Antons Cajun Seasoning", InStock: true, UnitsInStock: 52, OrderDate: new Date("2010-11-20") },
//         { ProductID: 4, ProductName: "Grandmas Boysenberry Spread", InStock: false, UnitsInStock: 0, OrderDate: new Date("2007-10-11") },
//         { ProductID: 5, ProductName: "Uncle Bobs Dried Pears", InStock: false, UnitsInStock: 0, OrderDate: new Date("2001-07-27") },
//         { ProductID: 6, ProductName: "Northwoods Cranberry Sauce", InStock: true, UnitsInStock: 1098, OrderDate: new Date("1990-05-17") },
//         { ProductID: 7, ProductName: "Queso Cabrales", InStock: false, UnitsInStock: 0, OrderDate: new Date("2005-03-03") },
//         { ProductID: 8, ProductName: "Tofu", InStock: true, UnitsInStock: 7898, OrderDate: new Date("2017-09-09") },
//         { ProductID: 9, ProductName: "Teatime Chocolate Biscuits", InStock: true, UnitsInStock: 6998, OrderDate: new Date("2025-12-25") },
//         { ProductID: 10, ProductName: "Pie", InStock: true, UnitsInStock: 1000, OrderDate: new Date("2017-05-07") },
//         { ProductID: 11, ProductName: "Pasta", InStock: false, UnitsInStock: 198, OrderDate: new Date("2001-02-15") },
//         { ProductID: 12, ProductName: "Krusty krab's burger", InStock: true, UnitsInStock: 52, OrderDate: new Date("2012-09-25") },
//         { ProductID: 13, ProductName: "Lasagna", InStock: false, UnitsInStock: 0, OrderDate: new Date("2015-02-09") },
//         { ProductID: 14, ProductName: "Uncle Bobs Dried Pears", InStock: false, UnitsInStock: 0, OrderDate: new Date("2008-03-17") },
//         { ProductID: 15, ProductName: "Cheese", InStock: true, UnitsInStock: 1098, OrderDate: new Date("1990-11-27") },
//         { ProductID: 16, ProductName: "Devil's Hot Chilli Sauce", InStock: false, UnitsInStock: 0, OrderDate: new Date("2012-08-14") },
//         { ProductID: 17, ProductName: "Parmesan", InStock: true, UnitsInStock: 4898, OrderDate: new Date("2017-09-09") },
//         { ProductID: 18, ProductName: "Steaks", InStock: true, UnitsInStock: 3098, OrderDate: new Date("2025-12-25") },
//         { ProductID: 19, ProductName: "Biscuits", InStock: true, UnitsInStock: 10570, OrderDate: new Date("2018-03-01") }
//     ];

//     @ViewChild("grid1", { read: IgxGridComponent })
//     public grid1: IgxGridComponent;

//     public width = "800px";
//     public height = "600px";

//     public numberSummary = new IgxNumberSummaryOperand();
//     public dateSummary = new IgxDateSummaryOperand();

//     public scrollTop(newTop: number) {
//         const vScrollbar = this.grid1.verticalScrollContainer.getVerticalScroll();
//         vScrollbar.scrollTop = newTop;
//     }

//     public scrollLeft(newLeft: number) {
//         const hScrollbar = this.grid1.parentVirtDir.getHorizontalScroll();
//         hScrollbar.scrollLeft = newLeft;
//     }
// }


// @Component({
//     template: `<div style="width: 800px; height: 600px;">
//     <igx-grid #grid [data]="data" [autoGenerate]="false">
//         <igx-column field="index" header="index" dataType="number"></igx-column>
//         <igx-column field="value" header="value" dataType="number"></igx-column>
//     </igx-grid></div>`
// })
// export class IgxGridTestComponent {
//     public data = [{ index: 1, value: 1 }];
//     @ViewChild("grid") public grid: IgxGridComponent;
// }

// @Component({
//     template: `<igx-grid #grid2 style="margin-bottom: 20px;" [data]="data" (onColumnInit)="initColumns($event)">
//                 <igx-column *ngFor="let c of cols" [field]="c.field" [header]="c.header" [hasSummary]="true">
//                 </igx-column>
//                 </igx-grid>`
// })
// export class IgxGridTestDefaultWidthHeightComponent {
//     public data = [];
//     public cols = [];
//     @ViewChild("grid2") public grid2: IgxGridComponent;

//     initColumns(column) {
//         switch (this.grid2.columnList.length) {
//             case 5:
//                 if (column.index === 0 || column.index === 4) {
//                     column.width = "200px";
//                 }
//                 break;
//             case 30:
//                 if (column.index === 0 || column.index === 5 || column.index === 3 || column.index === 10 || column.index === 25) {
//                     column.width = "200px";
//                 }
//                 break;
//             case 150:
//                 if (column.index === 0 || column.index === 5 || column.index === 3 || column.index === 10 || column.index === 50) {
//                     column.width = "500px";
//                 }
//                 break;
//         }
//     }
//     public generateColumns(count) {
//         this.cols = [];
//         for (let i = 0; i < count; i++) {
//             this.cols.push({
//                 field: "col" + i,
//                 header: "col" + i
//             });
//         }
//         return this.cols;
//     }
//     public generateData(rows) {
//         for (let r = 0; r < rows; r++) {
//             const record = {};
//             for (let c = 0; c < this.cols.length; c++) {
//                 record[this.cols[c].field] = c * r;
//             }
//             this.data.push(record);
//         }
//         return this.data;
//     }

//     public isHorizonatScrollbarVisible() {
//         const scrollbar = this.grid2.parentVirtDir.getHorizontalScroll();
//         return scrollbar.offsetWidth < scrollbar.children[0].offsetWidth;
//     }
// }
// @Component({
//     template: `
//     <igx-grid #gridMinDefaultColWidth [data]="data" (onColumnInit)="init($event)" >
//         <igx-column *ngFor="let col of cols"
//             [field]="col.key"
//             [header]="col.key"
//             [dataType]="col.dataType"
//             [editable]="col.editable"></igx-column>
//     </igx-grid>
//     `
// })
// export class IgGridTest5x5Component {
//     public cols;
//     public data;

//     @ViewChild("gridMinDefaultColWidth", { read: IgxGridComponent })
//     public gridMinDefaultColWidth: IgxGridComponent;

//     constructor(public gridApi: IgxGridAPIService, private _cdr: ChangeDetectorRef) {
//         this.generateColumns(5);
//         this.generateData(this.cols.length, 5);
//     }

//     init(column) {
//         column.hasSummary = true;
//     }
//     public generateData(columns, rows) {
//         this.data = [];

//         for (let r = 0; r < rows; r++) {
//             const record = {};
//             for (let c = 0; c < columns; c++) {
//                 c === 0 ? record[this.cols[c].key] = 1 : record[this.cols[c].key] = c * r;
//             }
//             this.data.push(record);
//         }
//     }
//     public generateColumns(count) {
//         this.cols = [];
//         for (let i = 0; i < count; i++) {
//             if (i % 2 === 0) {
//                 this.cols.push({
//                     key: "col" + i,
//                     dataType: "number",
//                     editable: true
//                 });
//             } else {
//                 this.cols.push({
//                     key: "col" + i,
//                     dataType: "number"
//                 });
//             }
//         }
//         return this.cols;
//     }
// }
// @Component({
//     template: `
//     <igx-grid #gridMinDefaultColWidth [data]="data" (onColumnInit)="init($event)">
//         <igx-column *ngFor="let col of cols" [field]="col.key" [header]="col.key" [dataType]="col.dataType"></igx-column>
//     </igx-grid>
//     `
// })
// export class IgGridTest10x30Component {
//     public cols;
//     public data;

//     @ViewChild("gridMinDefaultColWidth", { read: IgxGridComponent })
//     public gridMinDefaultColWidth: IgxGridComponent;

//     constructor(private _cdr: ChangeDetectorRef) {
//         this.generateColumns(10);
//         this.generateData(this.cols.length, 30);
//     }

//     init(column) {
//         column.hasSummary = true;
//     }

//     public generateData(columns, rows) {
//         this.data = [];

//         for (let r = 0; r < rows; r++) {
//             const record = {};
//             for (let c = 0; c < columns; c++) {
//                 record[this.cols[c].key] = c * r;
//             }
//             this.data.push(record);
//         }
//     }
//     public generateColumns(count) {
//         this.cols = [];
//         for (let i = 0; i < count; i++) {
//             this.cols.push({
//                 key: "col" +  i,
//                 dataType: "number"
//             });
//         }
//         return this.cols;
//     }
// }
// @Component({
//     template: `
//     <igx-grid #gridMinDefaultColWidth [data]="data" (onColumnInit)="init($event)" [width]="'1500px'" >
//         <igx-column *ngFor="let col of cols" [field]="col.key" [header]="col.key" [dataType]="col.dataType"></igx-column>
//     </igx-grid>
//     `
// })
// export class IgGridTest30x1000Component {
//     public cols;
//     public data;

//     @ViewChild("gridMinDefaultColWidth", { read: IgxGridComponent })
//     public gridMinDefaultColWidth: IgxGridComponent;

//     constructor(private _cdr: ChangeDetectorRef) {
//         this.generateColumns(30);
//         this.generateData(this.cols.length, 1000);
//     }

//     init(column) {
//         column.hasSummary = true;
//     }

//     public generateData(columns, rows) {
//         this.data = [];

//         for (let r = 0; r < rows; r++) {
//             const record = {};
//             for (let c = 0; c < columns; c++) {
//                 record[this.cols[c].key] = c * r;
//             }
//             this.data.push(record);
//         }
//     }
//     public generateColumns(count) {
//         this.cols = [];
//         for (let i = 0; i < count; i++) {
//             this.cols.push({
//                 key: "col" +  i,
//                 dataType: "number"
//             });
//         }
//         return this.cols;
//     }
//     public isHorizonatScrollbarVisible() {
//         const scrollbar = this.gridMinDefaultColWidth.parentVirtDir.getHorizontalScroll();
//         return scrollbar.offsetWidth < scrollbar.children[0].offsetWidth;
//     }
// }
// @Component({
//     template: `
//     <igx-grid #gridMinDefaultColWidth [data]="data" (onColumnInit)="init($event)" [width]="'1500px'" >
//         <igx-column *ngFor="let col of cols" [field]="col.key" [header]="col.key" [dataType]="col.dataType"></igx-column>
//     </igx-grid>
//     `
// })
// export class IgGridTest150x200Component {
//     public cols;
//     public data;

//     @ViewChild("gridMinDefaultColWidth", { read: IgxGridComponent })
//     public gridMinDefaultColWidth: IgxGridComponent;

//     constructor(private _cdr: ChangeDetectorRef) {
//         this.generateColumns(150);
//         this.generateData(this.cols.length, 200);
//     }

//     init(column) {
//         column.hasSummary = true;
//     }

//     public generateData(columns, rows) {
//         this.data = [];

//         for (let r = 0; r < rows; r++) {
//             const record = {};
//             for (let c = 0; c < columns; c++) {
//                 record[this.cols[c].key] = c * r;
//             }
//             this.data.push(record);
//         }
//     }
//     public generateColumns(count) {
//         this.cols = [];
//         for (let i = 0; i < count; i++) {
//             this.cols.push({
//                 key: "col" + i,
//                 dataType: "number"
//             });
//         }
//         return this.cols;
//     }
//     public isHorizonatScrollbarVisible() {
//         const scrollbar = this.gridMinDefaultColWidth.parentVirtDir.getHorizontalScroll();
//         return scrollbar.offsetWidth < scrollbar.children[0].offsetWidth;
//     }
// }

// @Component({
//     template: `
//     <div style='height: 200px; overflow: auto;'>
//         <igx-grid #grid [data]="data" [height]='null' [autoGenerate]="true">
//         </igx-grid>
//     </div>
//     `
// })
// export class IgGridNullHeightComponent {
//     public cols;
//     public data;

//     @ViewChild("grid", { read: IgxGridComponent })
//     public instance: IgxGridComponent;

//     constructor(private _cdr: ChangeDetectorRef) {
//         this.data = this.generateData(5, 20);
//     }
//     public generateData(columns, rows) {
//         const data = [];

//         for (let r = 0; r < rows; r++) {
//             const record = {};
//             for (let c = 0; c < columns; c++) {
//                 record["col" + c] = c * r;
//             }
//             data.push(record);
//         }
//         return data;
//     }
// }

// @Component({
//     template:
//     `<div style="width: 800px; height: 600px;">
//         <igx-grid #grid [data]="data" [autoGenerate]="true" height="50%" width="50%">
//         </igx-grid>
//     </div>`
// })
// export class IgxGridTestPercentWidthHeightComponent {
//     public cols;
//     public data;

//     @ViewChild("grid", { read: IgxGridComponent })
//     public grid: IgxGridComponent;

//     constructor(private _cdr: ChangeDetectorRef) {
//         this.data = this.generateData(3, 30);
//     }
//     public generateData(columns, rows) {
//         const data = [];

//         for (let r = 0; r < rows; r++) {
//             const record = {};
//             for (let c = 0; c < columns; c++) {
//                 record["col" + c] = c * r;
//             }
//             data.push(record);
//         }
//         return data;
//     }
// }


// @Component({
//     template: `
//         <igx-grid
//             [data]="data"
//             (onRowAdded)="rowAdded($event)"
//             (onRowDeleted)="rowDeleted($event)"
//             (onEditDone)="editDone($event)"
//             [autoGenerate]="true">
//         </igx-grid>
//     `
// })
// export class DefaultCRUDGridComponent {

//     public data = [
//         { index: 1, value: 1}
//     ];

//     public rowsAdded = 0;
//     public rowsDeleted = 0;

//     @ViewChild(IgxGridComponent, { read: IgxGridComponent })
//     public instance: IgxGridComponent;

//     public rowAdded(event) {
//         this.rowsAdded++;
//     }

//     public rowDeleted(event) {
//         this.rowsDeleted++;
//     }

//     public editDone(event: IGridEditEventArgs) {
//         if (event.newValue === "change") {
//             event.newValue = event.cell ? 200 : { index: 200, value: 200 };
//         }
//     }
// }

// @Component({
//     template: `
//         <igx-grid #grid1 [data]="data" [paging]="true" [perPage]="3">
//             <igx-column field="ID"></igx-column>
//             <igx-column field="Name"></igx-column>
//             <igx-column field="JobTitle"></igx-column>
//         </igx-grid>
//     `
// })
// export class GridMarkupPagingDeclarationComponent {
//     public data = data;

//     @ViewChild("grid1", { read: IgxGridComponent })
//     public grid1: IgxGridComponent;
// }

// @Component({
//     template: `
//     <igx-grid #grid1 [data]="data">
//         <igx-column field="ID"></igx-column>
//         <igx-column field="Name"></igx-column>
//         <igx-column field="JobTitle"></igx-column>
//     </igx-grid>
//     `
// })
// export class GridDeclarationComponent {

//     public data = data;

//     @ViewChild("grid1", { read: IgxGridComponent })
//     public grid1: IgxGridComponent;
// }

// @Component({
//     template: `
//     <igx-grid #grid1 [data]="data">
//         <igx-column field="ID"></igx-column>
//         <igx-column field="Name" [editable]="true"></igx-column>
//         <igx-column field="JobTitle" [editable]="true"></igx-column>
//     </igx-grid>
//     `
// })
// export class IgxGridMarkupEditingDeclarationComponent {

//     public data = data;

//     @ViewChild("grid1", { read: IgxGridComponent })
//     public grid1: IgxGridComponent;
// }

// @Component({
//     template: `
//     <igx-grid #grid1 [data]="data" paging="true" perPage="4">
//         <igx-column field="ID"></igx-column>
//         <igx-column field="Name" [editable]="true"></igx-column>
//         <igx-column field="JobTitle" [editable]="true"></igx-column>
//     </igx-grid>
//     <button id="prevPageBtn" igxButton (click)="GoToPage(-2)">Prev page</button>
//     <button id="nextPageBtn" igxButton (click)="GoToPage(-1)">Next page</button>
//     <button id="idxPageBtn" igxButton (click)="GoToPage(2)">Go to 3rd page</button>
//     `
// })
// export class IgxGridPageChangeComponent {

//     public data = data;

//     @ViewChild("grid1", { read: IgxGridComponent })
//     public grid1: IgxGridComponent;

//     public GoToPage(val) {
//         switch (val) {
//         case -2:
//             this.grid1.previousPage();
//             break;
//         case -1:
//             this.grid1.nextPage();
//             break;
//         default:
//             this.grid1.paginate(val);
//             break;
//     }
// }
// }

// @Component({
//     template: `
//         <igx-grid
//             [width]='"800px"'
//             [height]='"300px"'
//             [data]="data"
//             (onColumnInit)="initColumns($event)"
//             (onSelection)="cellSelected($event)"
//             [autoGenerate]="true">
//         </igx-grid>
//     `
// })
// export class DefaultGridComponent {
//     public selectedCell;
//     /* tslint:disable */
//     public data = [
//         { "ID": "ALFKI", "CompanyName": "Alfreds Futterkiste", "ContactName": "Maria Anders", "ContactTitle": "Sales Representative", "Address": "Obere Str. 57", "City": "Berlin", "Region": null, "PostalCode": "12209", "Country": "Germany", "Phone": "030-0074321", "Fax": "030-0076545" },
//         { "ID": "ANATR", "CompanyName": "Ana Trujillo Emparedados y helados", "ContactName": "Ana Trujillo", "ContactTitle": "Owner", "Address": "Avda. de la Constitución 2222", "City": "México D.F.", "Region": null, "PostalCode": "05021", "Country": "Mexico", "Phone": "(5) 555-4729", "Fax": "(5) 555-3745" },
//         { "ID": "ANTON", "CompanyName": "Antonio Moreno Taquería", "ContactName": "Antonio Moreno", "ContactTitle": "Owner", "Address": "Mataderos 2312", "City": "México D.F.", "Region": null, "PostalCode": "05023", "Country": "Mexico", "Phone": "(5) 555-3932", "Fax": null },
//         { "ID": "AROUT", "CompanyName": "Around the Horn", "ContactName": "Thomas Hardy", "ContactTitle": "Sales Representative", "Address": "120 Hanover Sq.", "City": "London", "Region": null, "PostalCode": "WA1 1DP", "Country": "UK", "Phone": "(171) 555-7788", "Fax": "(171) 555-6750" },
//         { "ID": "BERGS", "CompanyName": "Berglunds snabbköp", "ContactName": "Christina Berglund", "ContactTitle": "Order Administrator", "Address": "Berguvsvägen 8", "City": "Luleå", "Region": null, "PostalCode": "S-958 22", "Country": "Sweden", "Phone": "0921-12 34 65", "Fax": "0921-12 34 67" },
//         { "ID": "BLAUS", "CompanyName": "Blauer See Delikatessen", "ContactName": "Hanna Moos", "ContactTitle": "Sales Representative", "Address": "Forsterstr. 57", "City": "Mannheim", "Region": null, "PostalCode": "68306", "Country": "Germany", "Phone": "0621-08460", "Fax": "0621-08924" },
//         { "ID": "BLONP", "CompanyName": "Blondesddsl père et fils", "ContactName": "Frédérique Citeaux", "ContactTitle": "Marketing Manager", "Address": "24, place Kléber", "City": "Strasbourg", "Region": null, "PostalCode": "67000", "Country": "France", "Phone": "88.60.15.31", "Fax": "88.60.15.32" },
//         { "ID": "BOLID", "CompanyName": "Bólido Comidas preparadas", "ContactName": "Martín Sommer", "ContactTitle": "Owner", "Address": "C/ Araquil, 67", "City": "Madrid", "Region": null, "PostalCode": "28023", "Country": "Spain", "Phone": "(91) 555 22 82", "Fax": "(91) 555 91 99" },
//         { "ID": "BONAP", "CompanyName": "Bon app'", "ContactName": "Laurence Lebihan", "ContactTitle": "Owner", "Address": "12, rue des Bouchers", "City": "Marseille", "Region": null, "PostalCode": "13008", "Country": "France", "Phone": "91.24.45.40", "Fax": "91.24.45.41" },
//         { "ID": "BOTTM", "CompanyName": "Bottom-Dollar Markets", "ContactName": "Elizabeth Lincoln", "ContactTitle": "Accounting Manager", "Address": "23 Tsawassen Blvd.", "City": "Tsawassen", "Region": "BC", "PostalCode": "T2F 8M4", "Country": "Canada", "Phone": "(604) 555-4729", "Fax": "(604) 555-3745" },
//         { "ID": "BSBEV", "CompanyName": "B's Beverages", "ContactName": "Victoria Ashworth", "ContactTitle": "Sales Representative", "Address": "Fauntleroy Circus", "City": "London", "Region": null, "PostalCode": "EC2 5NT", "Country": "UK", "Phone": "(171) 555-1212", "Fax": null },
//         { "ID": "CACTU", "CompanyName": "Cactus Comidas para llevar", "ContactName": "Patricio Simpson", "ContactTitle": "Sales Agent", "Address": "Cerrito 333", "City": "Buenos Aires", "Region": null, "PostalCode": "1010", "Country": "Argentina", "Phone": "(1) 135-5555", "Fax": "(1) 135-4892" },
//         { "ID": "CENTC", "CompanyName": "Centro comercial Moctezuma", "ContactName": "Francisco Chang", "ContactTitle": "Marketing Manager", "Address": "Sierras de Granada 9993", "City": "México D.F.", "Region": null, "PostalCode": "05022", "Country": "Mexico", "Phone": "(5) 555-3392", "Fax": "(5) 555-7293" },
//         { "ID": "CHOPS", "CompanyName": "Chop-suey Chinese", "ContactName": "Yang Wang", "ContactTitle": "Owner", "Address": "Hauptstr. 29", "City": "Bern", "Region": null, "PostalCode": "3012", "Country": "Switzerland", "Phone": "0452-076545", "Fax": null },
//         { "ID": "COMMI", "CompanyName": "Comércio Mineiro", "ContactName": "Pedro Afonso", "ContactTitle": "Sales Associate", "Address": "Av. dos Lusíadas, 23", "City": "Sao Paulo", "Region": "SP", "PostalCode": "05432-043", "Country": "Brazil", "Phone": "(11) 555-7647", "Fax": null },
//         { "ID": "CONSH", "CompanyName": "Consolidated Holdings", "ContactName": "Elizabeth Brown", "ContactTitle": "Sales Representative", "Address": "Berkeley Gardens 12 Brewery", "City": "London", "Region": null, "PostalCode": "WX1 6LT", "Country": "UK", "Phone": "(171) 555-2282", "Fax": "(171) 555-9199" },
//         { "ID": "DRACD", "CompanyName": "Drachenblut Delikatessen", "ContactName": "Sven Ottlieb", "ContactTitle": "Order Administrator", "Address": "Walserweg 21", "City": "Aachen", "Region": null, "PostalCode": "52066", "Country": "Germany", "Phone": "0241-039123", "Fax": "0241-059428" },
//         { "ID": "DUMON", "CompanyName": "Du monde entier", "ContactName": "Janine Labrune", "ContactTitle": "Owner", "Address": "67, rue des Cinquante Otages", "City": "Nantes", "Region": null, "PostalCode": "44000", "Country": "France", "Phone": "40.67.88.88", "Fax": "40.67.89.89" },
//         { "ID": "EASTC", "CompanyName": "Eastern Connection", "ContactName": "Ann Devon", "ContactTitle": "Sales Agent", "Address": "35 King George", "City": "London", "Region": null, "PostalCode": "WX3 6FW", "Country": "UK", "Phone": "(171) 555-0297", "Fax": "(171) 555-3373" },
//         { "ID": "ERNSH", "CompanyName": "Ernst Handel", "ContactName": "Roland Mendel", "ContactTitle": "Sales Manager", "Address": "Kirchgasse 6", "City": "Graz", "Region": null, "PostalCode": "8010", "Country": "Austria", "Phone": "7675-3425", "Fax": "7675-3426" },
//         { "ID": "FAMIA", "CompanyName": "Familia Arquibaldo", "ContactName": "Aria Cruz", "ContactTitle": "Marketing Assistant", "Address": "Rua Orós, 92", "City": "Sao Paulo", "Region": "SP", "PostalCode": "05442-030", "Country": "Brazil", "Phone": "(11) 555-9857", "Fax": null },
//         { "ID": "FISSA", "CompanyName": "FISSA Fabrica Inter. Salchichas S.A.", "ContactName": "Diego Roel", "ContactTitle": "Accounting Manager", "Address": "C/ Moralzarzal, 86", "City": "Madrid", "Region": null, "PostalCode": "28034", "Country": "Spain", "Phone": "(91) 555 94 44", "Fax": "(91) 555 55 93" },
//         { "ID": "FOLIG", "CompanyName": "Folies gourmandes", "ContactName": "Martine Rancé", "ContactTitle": "Assistant Sales Agent", "Address": "184, chaussée de Tournai", "City": "Lille", "Region": null, "PostalCode": "59000", "Country": "France", "Phone": "20.16.10.16", "Fax": "20.16.10.17" },
//         { "ID": "FOLKO", "CompanyName": "Folk och fä HB", "ContactName": "Maria Larsson", "ContactTitle": "Owner", "Address": "Åkergatan 24", "City": "Bräcke", "Region": null, "PostalCode": "S-844 67", "Country": "Sweden", "Phone": "0695-34 67 21", "Fax": null },
//         { "ID": "FRANK", "CompanyName": "Frankenversand", "ContactName": "Peter Franken", "ContactTitle": "Marketing Manager", "Address": "Berliner Platz 43", "City": "München", "Region": null, "PostalCode": "80805", "Country": "Germany", "Phone": "089-0877310", "Fax": "089-0877451" },
//         { "ID": "FRANR", "CompanyName": "France restauration", "ContactName": "Carine Schmitt", "ContactTitle": "Marketing Manager", "Address": "54, rue Royale", "City": "Nantes", "Region": null, "PostalCode": "44000", "Country": "France", "Phone": "40.32.21.21", "Fax": "40.32.21.20" },
//         { "ID": "FRANS", "CompanyName": "Franchi S.p.A.", "ContactName": "Paolo Accorti", "ContactTitle": "Sales Representative", "Address": "Via Monte Bianco 34", "City": "Torino", "Region": null, "PostalCode": "10100", "Country": "Italy", "Phone": "011-4988260", "Fax": "011-4988261" }
//     ];
//     /* tslint:enable */
//     @ViewChild(IgxGridComponent, { read: IgxGridComponent })
//     public instance: IgxGridComponent;

//     public initColumns(column: IgxColumnComponent) {
//         if (column.field === "CompanyName" || column.field === "ContactName") {
//             column.pinned = true;
//         }
//         column.width = "200px";
//     }

//     public cellSelected(event: IGridCellEventArgs) {
//         this.selectedCell = event.cell;
//     }
// }

// @Component({
//     template: `
//         <igx-grid
//             [width]='"800px"'
//             [height]='"300px"'
//             [data]="data"
//             (onSelection)="cellSelected($event)"
//             (onColumnPinning)="columnPinningHandler($event)"
//           >
//         <igx-column  *ngFor="let c of columns" [field]="c.field" [header]="c.field" [width]="c.width">
//         </igx-column>
//         </igx-grid>
//     `
// })
// export class GridPinningComponent {
//     public selectedCell;
//     public data = [{
//         ID: "ALFKI",
//         CompanyName: "Alfreds Futterkiste",
//         ContactName: "Maria Anders",
//         ContactTitle: "Sales Representative",
//         Address: "Obere Str. 57",
//         City: "Berlin",
//         Region: null,
//         PostalCode: "12209",
//         Country: "Germany",
//         Phone: "030-0074321",
//         Fax: "030-0076545"
//     }];
//     public columns = [
//         { field: "ID", width: 100 },
//         { field: "CompanyName", width: 300 },
//         { field: "ContactName", width: 200 },
//         { field: "ContactTitle", width: 200 },
//         { field: "Address", width: 300 },
//         { field: "City", width: 100 },
//         { field: "Region", width: 100 },
//         { field: "PostalCode", width: 100 },
//         { field: "Phone", width: 150 },
//         { field: "Fax", width: 150 }
//     ];

//     @ViewChild(IgxGridComponent, { read: IgxGridComponent })
//     public instance: IgxGridComponent;

//     public columnPinningHandler($event) {
//         $event.insertAtIndex = 0;
//     }
//     public cellSelected(event: IGridCellEventArgs) {
//         this.selectedCell = event.cell;
//     }
// }

// @Component({
//     template: `<igx-grid [data]="data">
//         <igx-column [field]="'ID'" [header]="'ID'"></igx-column>
//         <igx-column [field]="'ProductName'" [filterable]="true" [sortable]="true" [pinned]="true" dataType="string"></igx-column>
//         <igx-column [field]="'Downloads'" [filterable]="true" dataType="number"></igx-column>
//         <igx-column [field]="'Released'" [filterable]="true" dataType="boolean"></igx-column>
//         <igx-column [field]="'ReleaseDate'" [header]="'ReleaseDate'"
//             [filterable]="true" dataType="date">
//         </igx-column>
//     </igx-grid>`
// })
// export class GridFeaturesComponent {

//     public timeGenerator: Calendar = new Calendar();
//     public today: Date = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0);

//     public data = [
//         {
//             Downloads: 254,
//             ID: 1,
//             ProductName: "Ignite UI for JavaScript",
//             ReleaseDate: this.timeGenerator.timedelta(this.today, "day", 15),
//             Released: false
//         },
//         {
//             Downloads: 127,
//             ID: 2,
//             ProductName: "NetAdvantage",
//             ReleaseDate: this.timeGenerator.timedelta(this.today, "month", -1),
//             Released: true
//         },
//         {
//             Downloads: 20,
//             ID: 3,
//             ProductName: "Ignite UI for Angular",
//             ReleaseDate: null,
//             Released: null
//         },
//         {
//             Downloads: null,
//             ID: 4,
//             ProductName: null,
//             ReleaseDate: this.timeGenerator.timedelta(this.today, "day", -1),
//             Released: true
//         },
//         {
//             Downloads: 100,
//             ID: 5,
//             ProductName: "",
//             ReleaseDate: undefined,
//             Released: ""
//         },
//         {
//             Downloads: 702,
//             ID: 6,
//             ProductName: "Some other item with Script",
//             ReleaseDate: this.timeGenerator.timedelta(this.today, "day", 1),
//             Released: null
//         },
//         {
//             Downloads: 0,
//             ID: 7,
//             ProductName: null,
//             ReleaseDate: this.timeGenerator.timedelta(this.today, "month", 1),
//             Released: true
//         },
//         {
//             Downloads: 1000,
//             ID: 8,
//             ProductName: null,
//             ReleaseDate: this.today,
//             Released: false
//         }
//     ];

//     @ViewChild(IgxGridComponent) public grid: IgxGridComponent;
// }

// @Component({
//     template: `
//         <igx-grid #gridSearch [data]="data">
//             <igx-column field="ID"></igx-column>
//             <igx-column field="Name"></igx-column>
//             <igx-column field="JobTitle"></igx-column>
//             <igx-column field="HireDate"></igx-column>
//         </igx-grid>
//     `
// })
// export class SimpleGridComponent {
//     public data = [
//         { ID: 1, Name: "Casey Houston", JobTitle: "Vice President", HireDate: "2017-06-19T11:43:07.714Z" },
//         { ID: 2, Name: "Gilberto Todd", JobTitle: "Director", HireDate: "2015-12-18T11:23:17.714Z" },
//         { ID: 3, Name: "Tanya Bennett", JobTitle: "Director", HireDate: "2005-11-18T11:23:17.714Z" },
//         { ID: 4, Name: "Jack Simon", JobTitle: "Software Developer", HireDate: "2008-12-18T11:23:17.714Z" },
//         { ID: 5, Name: "Celia Martinez", JobTitle: "Senior Software DEVELOPER", HireDate: "2007-12-19T11:23:17.714Z" },
//         { ID: 6, Name: "Erma Walsh", JobTitle: "CEO", HireDate: "2016-12-18T11:23:17.714Z" },
//         { ID: 7, Name: "Debra Morton", JobTitle: "Associate Software Developer", HireDate: "2005-11-19T11:23:17.714Z" },
//         { ID: 8, Name: "Erika Wells", JobTitle: "Software Development Team Lead", HireDate: "2005-10-14T11:23:17.714Z" },
//         { ID: 9, Name: "Leslie Hansen", JobTitle: "Associate Software Developer", HireDate: "2013-10-10T11:23:17.714Z" },
//         { ID: 10, Name: "Eduardo Ramirez", JobTitle: "Manager", HireDate: "2011-11-28T11:23:17.714Z" }
//     ];

//     @ViewChild("gridSearch", { read: IgxGridComponent })
//     public gridSearch: IgxGridComponent;

//     public highlightClass = "igx-highlight";
//     public activeClass = "igx-highlight__active";
// }

// @Component({
//     template: `
//         <igx-grid #gridSearch [data]="data" height="500px" width="500px" columnWidth="200">
//             <igx-column field="ID" sortable="true"></igx-column>
//             <igx-column field="Name" sortable="true"></igx-column>
//             <igx-column field="JobTitle" sortable="true"></igx-column>
//             <igx-column field="HireDate" sortable="true"></igx-column>
//         </igx-grid>
//     `
// })
// export class ScrollableGridComponent {
//     public data = [
//         { ID: 1, Name: "Casey Houston", JobTitle: "Vice President", HireDate: "2017-06-19T11:43:07.714Z" },
//         { ID: 2, Name: "Gilberto Todd", JobTitle: "Director", HireDate: "2015-12-18T11:23:17.714Z" },
//         { ID: 3, Name: "Tanya Bennett", JobTitle: "Director", HireDate: "2005-11-18T11:23:17.714Z" },
//         { ID: 4, Name: "Jack Simon", JobTitle: "Software Developer", HireDate: "2008-12-18T11:23:17.714Z" },
//         { ID: 5, Name: "Celia Martinez", JobTitle: "Senior Software DEVELOPER", HireDate: "2007-12-19T11:23:17.714Z" },
//         { ID: 6, Name: "Erma Walsh", JobTitle: "CEO", HireDate: "2016-12-18T11:23:17.714Z" },
//         { ID: 7, Name: "Debra Morton", JobTitle: "Associate Software Developer", HireDate: "2005-11-19T11:23:17.714Z" },
//         { ID: 8, Name: "Erika Wells", JobTitle: "Software Development Team Lead", HireDate: "2005-10-14T11:23:17.714Z" },
//         { ID: 9, Name: "Leslie Hansen", JobTitle: "Associate Software Developer", HireDate: "2013-10-10T11:23:17.714Z" },
//         { ID: 10, Name: "Eduardo Ramirez", JobTitle: "Manager", HireDate: "2011-11-28T11:23:17.714Z" },
//         { ID: 11, Name: "Casey Houston", JobTitle: "Vice President", HireDate: "2017-06-19T11:43:07.714Z" },
//         { ID: 12, Name: "Gilberto Todd", JobTitle: "Director", HireDate: "2015-12-18T11:23:17.714Z" },
//         { ID: 13, Name: "Tanya Bennett", JobTitle: "Director", HireDate: "2005-11-18T11:23:17.714Z" },
//         { ID: 14, Name: "Jack Simon", JobTitle: "Software Developer", HireDate: "2008-12-18T11:23:17.714Z" },
//         { ID: 15, Name: "Celia Martinez", JobTitle: "Senior Software DEVELOPER", HireDate: "2007-12-19T11:23:17.714Z" },
//         { ID: 16, Name: "Erma Walsh", JobTitle: "CEO", HireDate: "2016-12-18T11:23:17.714Z" },
//         { ID: 17, Name: "Debra Morton", JobTitle: "Associate Software Developer", HireDate: "2005-11-19T11:23:17.714Z" },
//         { ID: 18, Name: "Erika Wells", JobTitle: "Software Development Team Lead", HireDate: "2005-10-14T11:23:17.714Z" },
//         { ID: 19, Name: "Leslie Hansen", JobTitle: "Associate Software Developer", HireDate: "2013-10-10T11:23:17.714Z" },
//         { ID: 20, Name: "Eduardo Ramirez", JobTitle: "Manager", HireDate: "2011-11-28T11:23:17.714Z" },
//         { ID: 21, Name: "Casey Houston", JobTitle: "Vice President", HireDate: "2017-06-19T11:43:07.714Z" },
//         { ID: 22, Name: "Gilberto Todd", JobTitle: "Director", HireDate: "2015-12-18T11:23:17.714Z" },
//         { ID: 23, Name: "Tanya Bennett", JobTitle: "Director", HireDate: "2005-11-18T11:23:17.714Z" },
//         { ID: 24, Name: "Jack Simon", JobTitle: "Software Developer", HireDate: "2008-12-18T11:23:17.714Z" },
//         { ID: 25, Name: "Celia Martinez", JobTitle: "Senior Software DEVELOPER", HireDate: "2007-12-19T11:23:17.714Z" },
//         { ID: 26, Name: "Erma Walsh", JobTitle: "CEO", HireDate: "2016-12-18T11:23:17.714Z" },
//         { ID: 27, Name: "Debra Morton", JobTitle: "Associate Software Developer", HireDate: "2005-11-19T11:23:17.714Z" },
//         { ID: 28, Name: "Erika Wells", JobTitle: "Software Development Team Lead", HireDate: "2005-10-14T11:23:17.714Z" },
//         { ID: 29, Name: "Leslie Hansen", JobTitle: "Associate Software Developer", HireDate: "2013-10-10T11:23:17.714Z" },
//         { ID: 30, Name: "Eduardo Ramirez", JobTitle: "Manager", HireDate: "1887-11-28T11:23:17.714Z" }
//     ];

//     @ViewChild("gridSearch", { read: IgxGridComponent })
//     public gridSearch: IgxGridComponent;

//     public highlightClass = "igx-highlight";
//     public activeClass = "igx-highlight__active";
// }

// @Component({
//     template: `
//         <igx-grid #gridSearch [data]="data" height="500px" width="500px" columnWidth="200" paging="true">
//             <igx-column field="ID" sortable="true"></igx-column>
//             <igx-column field="Name" sortable="true"></igx-column>
//             <igx-column field="JobTitle" sortable="true"></igx-column>
//             <igx-column field="HireDate" sortable="true"></igx-column>
//         </igx-grid>
//     `
// })
// export class PagingGridComponent {
//     public data = [
//         { ID: 1, Name: "Casey Houston", JobTitle: "Vice President", HireDate: "2017-06-19T11:43:07.714Z" },
//         { ID: 2, Name: "Gilberto Todd", JobTitle: "Director", HireDate: "2015-12-18T11:23:17.714Z" },
//         { ID: 3, Name: "Tanya Bennett", JobTitle: "Director", HireDate: "2005-11-18T11:23:17.714Z" },
//         { ID: 4, Name: "Jack Simon", JobTitle: "Software Developer", HireDate: "2008-12-18T11:23:17.714Z" },
//         { ID: 5, Name: "Celia Martinez", JobTitle: "Senior Software DEVELOPER", HireDate: "2007-12-19T11:23:17.714Z" },
//         { ID: 6, Name: "Erma Walsh", JobTitle: "CEO", HireDate: "2016-12-18T11:23:17.714Z" },
//         { ID: 7, Name: "Debra Morton", JobTitle: "Associate Software Developer", HireDate: "2005-11-19T11:23:17.714Z" },
//         { ID: 8, Name: "Erika Wells", JobTitle: "Software Development Team Lead", HireDate: "2005-10-14T11:23:17.714Z" },
//         { ID: 9, Name: "Leslie Hansen", JobTitle: "Associate Software Developer", HireDate: "2013-10-10T11:23:17.714Z" },
//         { ID: 10, Name: "Eduardo Ramirez", JobTitle: "Manager", HireDate: "2011-11-28T11:23:17.714Z" },
//         { ID: 11, Name: "Casey Houston", JobTitle: "Vice President", HireDate: "2017-06-19T11:43:07.714Z" },
//         { ID: 12, Name: "Gilberto Todd", JobTitle: "Director", HireDate: "2015-12-18T11:23:17.714Z" },
//         { ID: 13, Name: "Tanya Bennett", JobTitle: "Director", HireDate: "2005-11-18T11:23:17.714Z" },
//         { ID: 14, Name: "Jack Simon", JobTitle: "Software Developer", HireDate: "2008-12-18T11:23:17.714Z" },
//         { ID: 15, Name: "Celia Martinez", JobTitle: "Senior Software DEVELOPER", HireDate: "2007-12-19T11:23:17.714Z" },
//         { ID: 16, Name: "Erma Walsh", JobTitle: "CEO", HireDate: "2016-12-18T11:23:17.714Z" },
//         { ID: 17, Name: "Debra Morton", JobTitle: "Associate Software Developer", HireDate: "2005-11-19T11:23:17.714Z" },
//         { ID: 18, Name: "Erika Wells", JobTitle: "Software Development Team Lead", HireDate: "2005-10-14T11:23:17.714Z" },
//         { ID: 19, Name: "Leslie Hansen", JobTitle: "Associate Software Developer", HireDate: "2013-10-10T11:23:17.714Z" },
//         { ID: 20, Name: "Eduardo Ramirez", JobTitle: "Manager", HireDate: "2011-11-28T11:23:17.714Z" },
//         { ID: 21, Name: "Casey Houston", JobTitle: "Vice President", HireDate: "2017-06-19T11:43:07.714Z" },
//         { ID: 22, Name: "Gilberto Todd", JobTitle: "Director", HireDate: "2015-12-18T11:23:17.714Z" },
//         { ID: 23, Name: "Tanya Bennett", JobTitle: "Director", HireDate: "2005-11-18T11:23:17.714Z" },
//         { ID: 24, Name: "Jack Simon", JobTitle: "Software Developer", HireDate: "2008-12-18T11:23:17.714Z" },
//         { ID: 25, Name: "Celia Martinez", JobTitle: "Senior Software DEVELOPER", HireDate: "2007-12-19T11:23:17.714Z" },
//         { ID: 26, Name: "Erma Walsh", JobTitle: "CEO", HireDate: "2016-12-18T11:23:17.714Z" },
//         { ID: 27, Name: "Debra Morton", JobTitle: "Associate Software Developer", HireDate: "2005-11-19T11:23:17.714Z" },
//         { ID: 28, Name: "Erika Wells", JobTitle: "Software Development Team Lead", HireDate: "2005-10-14T11:23:17.714Z" },
//         { ID: 29, Name: "Leslie Hansen", JobTitle: "Associate Software Developer", HireDate: "2013-10-10T11:23:17.714Z" },
//         { ID: 30, Name: "Eduardo Ramirez", JobTitle: "Manager", HireDate: "1887-11-28T11:23:17.714Z" }
//     ];

//     @ViewChild("gridSearch", { read: IgxGridComponent })
//     public gridSearch: IgxGridComponent;

//     public highlightClass = "igx-highlight";
//     public activeClass = "igx-highlight__active";
// }

// @Component({
//     template: `
//         <igx-grid #gridSearch [data]="data">
//             <igx-column field="ID"></igx-column>
//             <igx-column field="Name" hidden="true"></igx-column>
//             <igx-column field="JobTitle"></igx-column>
//             <igx-column field="HireDate" pinned="true"></igx-column>
//         </igx-grid>
//     `
// })
// export class HiddenColumnsGridComponent {
//     public data = [
//         { ID: 1, Name: "Casey Houston", JobTitle: "Vice President", HireDate: "2017-06-19T11:43:07.714Z" },
//         { ID: 2, Name: "Gilberto Todd", JobTitle: "Director", HireDate: "2015-12-18T11:23:17.714Z" },
//         { ID: 3, Name: "Tanya Bennett", JobTitle: "Director", HireDate: "2005-11-18T11:23:17.714Z" },
//         { ID: 4, Name: "Jack Simon", JobTitle: "Software Developer", HireDate: "2008-12-18T11:23:17.714Z" },
//         { ID: 5, Name: "Celia Martinez", JobTitle: "Senior Software DEVELOPER", HireDate: "2007-12-19T11:23:17.714Z" },
//         { ID: 6, Name: "Erma Walsh", JobTitle: "CEO", HireDate: "2016-12-18T11:23:17.714Z" },
//         { ID: 7, Name: "Debra Morton", JobTitle: "Associate Software Developer", HireDate: "2005-11-19T11:23:17.714Z" },
//         { ID: 8, Name: "Erika Wells", JobTitle: "Software Development Team Lead", HireDate: "2005-10-14T11:23:17.714Z" },
//         { ID: 9, Name: "Leslie Hansen", JobTitle: "Associate Software Developer", HireDate: "2013-10-10T11:23:17.714Z" },
//         { ID: 10, Name: "Eduardo Ramirez", JobTitle: "Manager", HireDate: "2011-11-28T11:23:17.714Z" }
//     ];

//     @ViewChild("gridSearch", { read: IgxGridComponent })
//     public gridSearch: IgxGridComponent;

//     public highlightClass = "igx-highlight";
//     public activeClass = "igx-highlight__active";
// }

// @Component({
//     template: `
//         <igx-grid [data]="data">
//             <igx-column headerClasses="header-id" [sortable]="true" field="ID"></igx-column>
//             <igx-column [sortable]="true" field="Name"></igx-column>
//             <igx-column [sortable]="true" field="LastName"></igx-column>
//         </igx-grid>
//     `
// })
// export class GridDeclaredColumnsComponent {

//     public data = [
//         { ID: 2, Name: "Jane", LastName: "Brown" },
//         { ID: 1, Name: "Brad", LastName: "Williams" },
//         { ID: 6, Name: "Rick", LastName: "Jones"},
//         { ID: 7, Name: "Rick", LastName: "BRown" },
//         { ID: 5, Name: "ALex", LastName: "Smith" },
//         { ID: 4, Name: "Alex", LastName: "Wilson" },
//         { ID: 3, Name: "Connor", LastName: "Walker" }
//     ];

//     @ViewChild(IgxGridComponent) public grid: IgxGridComponent;
//     @ViewChild("nameColumn") public nameColumn;
// }
