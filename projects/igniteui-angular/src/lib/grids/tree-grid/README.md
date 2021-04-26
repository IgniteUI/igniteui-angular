# igx-tree-grid
**igx-tree-grid** component provides the capability to represent and manipulate hierarchical data with consistent schema, formatted as a table.
A walkthrough of how to get started can be found [here](https://www.infragistics.com/products/ignite-ui-angular/angular/components/treegrid.html).

## Usage
```html
<igx-tree-grid #treegrid1 [data]="localData" [autoGenerate]="true"
                primaryKey="ID" foreignKey="ParentID"
                (columnInit)="initColumns($event)"
                (onCellSelection)="selectCell($event)">
</igx-tree-grid>
```

## Getting Started

### Dependencies
The tree grid is exported as an `NgModule`, thus all you need to do in your application is to import the _IgxTreeGridModule_ inside your `AppModule`.

```typescript
// app.module.ts

import { IgxTreeGridModule } from 'igniteui-angular';

@NgModule({
    imports: [
        ...
        IgxTreeGridModule,
        ...
    ]
})
export class AppModule {}
```

We can obtain a reference to the tree grid in typescript as follows:

```typescript
@ViewChild('treegrid1', { read: IgxTreeGridComponent })
public treegrid1: IgxTreeGridComponent;
```

### Basic configuration

The `IgxTreeGridComponent` shares a lot of features with the `IgxGridComponent`, but it also adds the ability to display its data hierarchically. In order to achieve this, the `IgxTreeGridComponent` provides us with a couple of ways to define the relations among our data objects - by using a **child collection** for every data object or by using **primary and foreign keys** for every data object.

#### Using child collection

When we are using the child collection option, every data object contains a child collection, that is populated with items of the same type as the parent data object.


```typescript
export const EMPLOYEE_DATA = [
    {
        Name: "Johnathan Winchester",
        ID: 1,
        HireDate: new Date(2008, 3, 20),
        Age: 55,
        Employees: [
            {
                Name: "Michael Burke",
                ID: 3,
                HireDate: new Date(2011, 6, 3),
                Age: 43,
                Employees: []
            },
            {
                Name: "Thomas Anderson"
                ID: 2,
                HireDate: new Date(2009, 6, 19),
                Age: 29,
                Employees: []
            },
            ...
        ]
    },
    ...
]
```

In order for the `IgxTreeGridComponent` to build the hierarchy, we will have to set its `childDataKey` property to the name of the child collection that is used in each of our data objects.

```html
<igx-tree-grid #treeGrid1 [data]="localData" childDataKey="Employees"
               [autoGenerate]="false">
    <igx-column field="Name" dataType="string"></igx-column>
    <igx-column field="ID" dataType="number"></igx-column>
    <igx-column field="HireDate" dataType="date"></igx-column>
    <igx-column field="Age" dataType="number"></igx-column>
</igx-tree-grid>
```
#### Using primary and foreign keys

When we are using the primary and foreign keys option, every data object contains a primary key and a foreign key. The **primary key** is the unique identifier of the current data object and the **foreign key** is the unique identifier of its parent. In this case the data property of our tree grid that contains the original data source will be a flat collection.

```typescript
export const data = [
    { ID: 1, ParentID: -1, Name: "Casey Houston", JobTitle: "Vice President", Age: 32 },
    { ID: 2, ParentID: 1, Name: "Gilberto Todd", JobTitle: "Director", Age: 41 },
    { ID: 3, ParentID: 2, Name: "Tanya Bennett", JobTitle: "Director", Age: 29 },
    { ID: 4, ParentID: 2, Name: "Jack Simon", JobTitle: "Software Developer", Age: 33 },
    { ID: 5, ParentID: 8, Name: "Celia Martinez", JobTitle: "Senior Software Developer", Age: 44 },
    { ID: 6, ParentID: -1, Name: "Erma Walsh", JobTitle: "CEO", Age: 52 },
    { ID: 7, ParentID: 2, Name: "Debra Morton", JobTitle: "Associate Software Developer", Age: 35 },
    { ID: 8, ParentID: 10, Name: "Erika Wells", JobTitle: "Software Development Team Lead", Age: 50 },
    { ID: 9, ParentID: 8, Name: "Leslie Hansen", JobTitle: "Associate Software Developer", Age: 28 },
    { ID: 10, ParentID: -1, Name: "Eduardo Ramirez", JobTitle: "Development Manager", Age: 53 }
];
```

In order for the `IgxTreeGridComponent` to build the hierarchy, we will have to set its `primaryKey` and `foreignKey` properties to the respective names of the data object properties. If a row has a ParentID that does not match any row in the tree grid, then that means this row is a root row.

```html
<igx-tree-grid #treeGrid1 [data]="data" primaryKey="ID" foreignKey="ParentID"
               [autoGenerate]="false">
    <igx-column field="ID" dataType="number"></igx-column>
    <igx-column field="ParentID" dataType="number"></igx-column>
    <igx-column field="Name" dataType="string"></igx-column>
    <igx-column field="JobTitle" dataType="string"></igx-column>
    <igx-column field="Age" dataType="number"></igx-column>
</igx-tree-grid>
```

### CRUD operations

- Adding a new row can be done by using the `addRow` method of the tree grid. The method takes a second **optional** parameter - parentRowID. If a parentRowID is not specified, the newly created row would be added at the root level, otherwise it would be added as a child of the row whose primaryKey matches the specified parentRowID.

```typescript
const record = {
    ID: this.treegrid1.data[this.treegrid1.data.length - 1].ID + 1,
    Name: this.newRecord
};
this.treegrid1.addRow(record, 1); // Adds a new child row to the row with ID=1.
```

- Updating an existing row or cell is done the same way as it is in the `igx-grid`.

```typescript
const selectedCell = this.treegrid1.selectedCells[0];
this.treegrid1.updateCell('new value', selectedCell.rowIndex, selectedCell.column.field);

const record = {
    ID: 123,
    Name: 'New Name',
    ...
};
this.treegrid1.updateRow(record, 123);
```

- Deleting an existing row can be done by using the `deleteRow` method, which takes as an argument the primary key of the row that should be deleted.
The `deleteRow` method takes the `cascadeOnDelete` property of the tree grid into account. This property indicates whether the child records should be deleted when their parent gets deleted (by default, it is set to **true**).

```typescript
const rowForDel = this.treegrid1.selectedCells[0].row;
this.treegrid1.deleteRow(rowForDel.rowID);
```

**NOTE:** The `cascadeOnDelete` property is taken into account only if our tree grid is defined with **primary and foreign keys**. If **child collection** is used instead, then child records will always be deleted when their respective parent is deleted.

### Known Limitations

|Limitation|Description|
|--- |--- |
|Templating Tree Cells|When templating a tree cell, content that spans outside the boundaries of the cell will not be shown unless positioned in an overlay.|
|Group By|Group By feature is not supported, because it is inherent to the tree grid.|
