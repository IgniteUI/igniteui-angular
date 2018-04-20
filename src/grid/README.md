# igx-grid
**igx-grid** component provides the capability to manipulate and represent tabular data.
A walkthrough of how to get started can be found [here](https://www.infragistics.com/products/ignite-ui-angular/angular/components/grid.html)

## Usage
```html
<igx-grid #grid1 [data]="localData" [autoGenerate]="true"
    (onColumnInit)="initColumns($event)" (onCellSelection)="selectCell($event)">
</igx-grid>
```

## Getting Started

### Dependencies
The grid is exported as as an `NgModule`, thus all you need to do in your application is to import the _IgxGridModule_ inside your `AppModule`

```typescript
// app.module.ts

import { IgxGridModule } from 'igniteui-angular/main';
// Or
import { IgxGridModule } from 'igniteui-angular/grid';

@NgModule({
    imports: [
        ...
        IgxGridModule.forRoot(),
        ...
    ]
})
export class AppModule {}
```

Each of the components, directives and helper classes in the _IgxGridModule_ can be imported either through the _grid_ sub-package or through the main bundle in _igniteui-angular_. While you don't need to import all of them to instantiate and use the grid, you usually will import them (or your editor will auto-import them for you) when declaring types that are part of the grid API.

```typescript
import { IgxGridComponent } from 'igniteui-angular/grid/';
// Or
import { IgxGridComponent } from 'igniteui-angular/main'
...

@ViewChild('myGrid', { read: IgxGridComponent })
public grid: IgxGridComponent;
```

### Basic configuration

Define the grid
```html
<igx-grid #grid1 [data]="data | async" [height]="'500px'" width="100%" [autoGenerate]='false'>
    <igx-column [field]="'ProductID'" [width]="'120px'" [filterable]='true' ></igx-column>
    <igx-column [field]="'Category'" [width]="'120px'" [filterable]='true' ></igx-column>
    <igx-column [field]="'Type'" [width]="'150px'"></igx-column>
    <igx-column [field]="'Change'" [width]="'120px'" [dataType]="'number'" [headerClasses]="'headerAlignSyle'">
        <ng-template igxHeader>
            <span class="cellAlignSyle">Change</span>
        </ng-template>
    <igx-column [field]="'Change(%)'" [width]="'130px'" [dataType]="'number'" [formatter]="formatNumber">
        <ng-template igxHeader>
            <span class="cellAlignSyle">Change(%)</span>
        </ng-template>
    </igx-column>
</igx-grid>
```

When all needed dependencies are included, next step would be to configure local or remote service that will return grids data. For example:

```typescript
@Injectable()
export class FinancialSampleComponent {
    @ViewChild("grid1") public grid1: IgxGridComponent;
    public data: Observable<any[]>;
    constructor(private localService: LocalService) {
        this.localService.getData(100000);
        this.data = this.localService.records;
    }
    public ngOnInit(): void {
    }
    public formatNumber(value: number) {
        return value.toFixed(2);
    }
    public formatCurrency(value: number) {
        return "$" + value.toFixed(2);
    }
}
```

Create the Grid component that will be used in the application. This will include:
- implement some sorting or paging for example.

```typescript
public ngOnInit(): void {
    this.grid1.state = {
        paging: {
            index: 2,
            recordsPerPage: 10
        },
        sorting: {
            expressions: [
                {fieldName: "ProductID", dir: SortingDirection.Desc}
            ]
        }
    };
}

```

- enable some features for certaing columns

```typescript
public initColumns(event: IgxGridColumnInitEvent) {
    const column: IgxColumnComponent = event.column;
    if (column.field === "Change") {
        column.filterable = true;
        column.sortable = true;
        column.editable = true;
    }
}
```

- Аdd event handlers for CRUD operations

```typescript
public addRow() {
    if (!this.newRecord.trim()) {
    this.newRecord = "";
    return;
    }
    const record = {ID: this.grid1.data[this.grid1.data.length - 1].ID + 1, Name: this.newRecord};
    this.grid1.addRow(record);
    this.newRecord = "";
}

public updateRecord(event) {
    this.grid1.updateCell(this.selectedCell.rowIndex, this.selectedCell.columnField, event);
    this.grid1.getCell(this.selectedCell.rowIndex, this.selectedCell.columnField);
}

public deleteRow(event) {
    this.selectedRow = Object.assign({}, this.grid1.getRow(this.selectedCell.rowIndex));
    this.grid1.deleteRow(this.selectedCell.rowIndex);
    this.selectedCell = {};
    this.snax.message = `Row with ID ${this.selectedRow.record.ID} was deleted`;
    this.snax.show();
}
```

## API

### Inputs

Below is the list of all inputs that the developers may set to configure the grid look/behavior:
|Name|Type|Description|
|--- |--- |--- |
|`id`|string|Unique identifier of the Grid. If not provided it will be automatically generated.|
|`data`|Array|The data source for the grid.|
|`autoGenerate`|boolean|Autogenerate grid's columns, default value is _false_|
|`paging`|bool|Enables the paging feature. Defaults to _false_.|
|`perPage`|number|Visible items per page, default is 15|
|`filteringLogic`|FilteringLogic|The filtering logic of the grid. Defaults to _AND_.|
|`filteringExpressions`|Array|The filtering state of the grid.|
|`sortingExpressions`|Array|The sorting state of the grid.|
|`height`|string|The height of the grid element. You can pass values such as `1000px`, `75%`, etc.|
|`width`|string|The width of the grid element. You can pass values such as `1000px`, `75%`, etc.|
|`evenRowCSS`|string|Additional styling classes applied to all even rows in the grid.|
|`oddRowCSS`|string|Additional styling classses applied to all odd rows in the grid.|
|`paginationTemplate`|TemplateRef|You can provide a custom `ng-template` for the pagination part of the grid.|


### Outputs

A list of the events emitted by the **igx-grid**:

|Name|Description|
|--- |--- |
|_Event emitters_|_Notify for a change_|
|`onEditDone`|Emitted when a cell value changes. Returns `{ currentValue: any, newValue: any }`|
|`onCellClick`|Emitted when a cell is clicked. Returns the cell object.|
|`onSelection`|Emitted when a cell is selected. Returns the cell object.|
|`onColumnInit`|Emitted when the grid columns are initialized. Returns the column object.|
|`onSortingDone`|Emitted when sorting is performed through the UI. Returns the sorting expression.|
|`onFilteringDone`|Emitted when filtering is performed through the UI. Returns the filtering expression.|
|`onPagingDone`|Emitted when paging is performed. Returns an object consisting of the previous and the new page.|
|`onRowAdded`|Emitted when a row is being added to the grid through the API. Returns the data for the new row object.|
|`onRowDeleted`|Emitted when a row is deleted through the grid API. Returns the row object being removed.|
|`onColumnPinning`|Emitted when a column is pinned through the grid API. The index that the column is inserted at may be changed through the `insertAtIndex` property.|
|`onColumnResized`|Emitted when a column is resized. Returns the column object, previous and new column width.|
|`onContextMenu`|Emitted when a cell is right clicked. Returns the cell object.|


Defining handlers for these event emitters is done using declarative event binding:

```html
<igx-grid #grid1 [data]="data | async" [autoGenerate]="false"
    (onColumnInit)="initColumns($event)" (onSelection)="selectCell($event)"></igx-grid>
```

### Methods

Here is a list of all public methods exposed by **igx-grid**:

|Signature|Description|
|--- |--- |
|`getColumnByName(name: string)`|Returns the column object with field property equal to `name` or `undefined` if no such column exists.|
|`getCellByColumn(rowIndex: number, columnField: string)`|Returns the cell object in column with `columnField` and row with `rowIndex` or `undefined`.|
|`addRow(data: any)`|Creates a new row object and adds the `data` record to the end of the data source.|
|`deleteRow(rowIndex: number)`|Removes the row object and the corresponding data record from the data source.|
|`updateRow(value: any, rowIndex: number)`|Updates the row object and the data source record with the passed value.|
|`updateCell(value: any, rowIndex: number, column: string)`|Updates the cell object and the record field in the data source.|
|`filter(column: string, value: any, condition?, ignoreCase?: boolean)`|Filters a single column. Check the available [filtering conditions](#filtering-conditions)|
|`filter(expressions: Array)`|Filters the grid columns based on the provided array of filtering expressions.|
|`filterGlobal(value: any, condition? ignoreCase?)`|Filters all the columns in the grid.|
|`clearFilter(name?: string)`|If `name` is provided, clears the filtering state of the corresponding column, otherwise clears the filtering state of all columns.|
|`sort(name: string, direction, ignorecase)`|Sorts a single column.|
|`sort(expressions: Array)`|Sorts the grid columns based on the provided array of sorting expressions.|
|`clearSort(name?: string)`|If `name` is provided, clears the sorting state of the corresponding column, otherwise clears the sorting state of all columns.|
|`enableSummaries(fieldName: string, customSummary?: any)`|Enable summaries for the specified column and apply your `customSummary`. If you do not provide the `customSummary`, then the default summary for the column data type will be applied.|
|`enableSummaries(expressions: Array)`|Enable summaries for the columns and apply your `customSummary` if it is provided.|
|`disableSummaries(fieldName: string)`|Disable summaries for the specified column.|
|`disableSummaries(columns: string[])`|Disable summaries for the listed columns.|
|`clearSummaryCache()`|Delete all cached summaries and force recalculation.|
|`previousPage()`|Goes to the previous page if paging is enabled and the current page is not the first.|
|`nextPage()`|Goes to the next page if paging is enabled and current page is not the last.|
|`paginate(page: number)`|Goes to the specified page if paging is enabled. Page indices are 0 based.|
|`markForCheck()`|Manually triggers a change detection cycle for the grid and its children.|
|`pinColumn(name: string): boolean`|Pins a column by field name. Returns whether the operation is successful.|
|`unpinColumn(name: string): boolean`|Unpins a column by field name. Returns whether the operation is successful.|


## IgxColumnComponent
### Inputs

Inputs available on the **IgxGridColumnComponent** to define columns:
|Name|Type|Description|
|--- |--- |--- |
|`field`|string|Column field name|
|`header`|string|Column header text|
|`sortable`|boolean|Set column to be sorted or not|
|`editable`|boolean|Set column values to be editable|
|`filterable`|boolean|Set column values to be filterable|
|`hasSummary`| boolean  |Sets whether or not the specific column has summaries enabled.|
|`summaries`| IgxSummaryOperand |Set custom summary for the specific column|
|`hidden`|boolean|Visibility of the column|
|`movable`|boolean|Column moving|
|`resizable`|boolean|Set column to be resizable|
|`width`|string|Columns width|
|`minWidth`|string|Columns minimal width|
|`maxWidth`|string|Columns miximum width|
|`headerClasses`|string|Additional CSS classes applied to the header element.|
|`cellClasses`|string|Additional CSS classes applied to the cells in this column.|
|`formatter`|Function|A function used to "template" the values of the cells without the need to pass a cell template the column.|
|`index`|string|Column index|
|`filteringCondition`|FilteringCondition|Boolean, date, string or number conditions. Default is string _contains_|
|`filteringIgnoreCase`|boolean|Ignore capitalization of strings when filtering is applied. Defaults to _true_.|
|`sortingIgnoreCase`|boolean|Ignore capitalization of strings when sorting is applied. Defaults to _true_.|
|`dataType`|DataType|One of string, number, boolean or Date. When filtering is enabled the filter UI conditions are based on the `dataType` of the column. Defaults to `string` if it is not provided. With `autoGenerate` enabled the grid will try to resolve the correct data type for each column based on the data source.|
|`pinned`|boolean|Set column to be pinned or not|

### Methods
Here is a list of all public methods exposed by **IgxGridColumnComponent**:

|Signature|Description|
|--- |--- |
|`pin(): boolean`|Pins the column. Returns if the operation is successful.|
|`unpin(): boolean`|Unpins the column. Returns if the operation is successful.|


### Getters/Setters

|Name|Type|Getter|Setter|Description|
|--- |--- |--- |--- |--- |
|`bodyTemplate`|TemplateRef|Yes|Yes|Get/Set a reference to a template which will be applied to the cells in the column.|
|`headerTemplate`|TemplateRef|Yes|Yes|Get/Set a reference to a template which will be applied to the column header.|
|`footerTemplate`|TemplateRef|Yes|Yes|Get/Set a reference to a template which will be applied to the column footer.|
|`inlineEditorTemplate`|TemplateRef|Yes|Yes|Get/Set a reference to a template which will be applied as a cell enters edit mode.|


## Filtering Conditions

You will need to import the appropriate condition types from the `igniteui-angular` package.

```typescript
import {
    STRING_FILTERS,
    NUMBER_FILTERS,
    DATE_FILTERS,
    BOOLEAN_FILTERS
} from 'igniteui-angular/main';
```

### String types

|Name|Signature|Description|
|--- |--- |--- |
|`contains`|`(target: string, searchVal: string, ignoreCase?: boolean)`|Returns true if the `target` contains the `searchVal`.|
|`startsWith`|`(target: string, searchVal: string, ignoreCase?: boolean)`|Returns true if the `target` starts with the `searchVal`.|
|`endsWith`|`(target: string, searchVal: string, ignoreCase?: boolean)`|Returns true if the `target` ends with the `searchVal`.|
|`doesNotContain`|`(target: string, searchVal: string, ignoreCase?: boolean)`|Returns true if `searchVal` is not in `target`.|
|`equals`|`(target: string, searchVal: string, ignoreCase?: boolean)`|Returns true if `searchVal` matches `target`.|
|`doesNotEqual`|`(target: string, searchVal: string, ignoreCase?: boolean)`|Returns true if `searchVal` does not match `target`.|
|`null`|`(target: any)`|Returns true if `target` is `null`.|
|`notNull`|`(target: any)`|Returns true if `target` is not `null`.|
|`empty`|`(target: any)`|Returns true if `target` is either `null`, `undefined` or a string of length 0.|
|`notEmpty`|`(target: any)`|Returns true if `target` is not `null`, `undefined` or a string of length 0.|


### Number types

|Name|Signature|Description|
|--- |--- |--- |
|`equals`|`(target: number, searchVal: number)`|Returns true if `target` equals `searchVal`.|
|`doesNotEqual`|`(target: number, searchVal: number)`|Returns true if `target` is not equal to `searchVal`.|
|`doesNotEqual`|`(target: number, searchVal: number)`|Returns true if `target` is greater than `searchVal`.|
|`lessThan`|`(target: number, searchVal: number)`|Returns true if `target` is less than `searchVal`.|
|`greaterThanOrEqualTo`|`(target: number, searchVal: number)`|Returns true if `target` is greater than or equal to `searchVal`.|
|`lessThanOrEqualTo`|`(target: number, searchVal: number)`|Returns true if `target` is less than or equal to `searchVal`.|
|`null`|`(target: any)`|Returns true if `target` is `null`.|
|`notNull`|`(target: any)`|Returns true if `target` is not `null`.|
|`empty`|`(target: any)`|Returns true if `target` is either `null`, `undefined` or `NaN`.|
|`notEmpty`|`(target: any)`|Returns true if `target` is not `null`, `undefined` or `NaN`.|


### Boolean types

|Name|Signature|Description|
|--- |--- |--- |
|`true`|`(target: boolean)`|Returns if `target` is truthy.|
|`false`|`(target: boolean)`|Returns true if `target` is falsy.|
|`null`|`(target: any)`|Returns true if `target` is `null`.|
|`notNull`|`(target: any)`|Returns true if `target` is not `null`.|
|`empty`|`(target: any)`|Returns true if `target` is either `null` or `undefined`.|
|`notEmpty`|`(target: any)`|Returns true if target is not `null` or `undefined`.|

### Date types

|Name|Signature|Description|
|--- |--- |--- |
|`equals`|`(target: Date, searchVal: Date)`|Returns `true` if `target` equals `searchVal`.|
|`doesNotEqual`|`(target: Date, searchVal: Date)`|Returns `true` if `target` does not equal `searchVal`.|
|`before`|`(target: Date, searchVal: Date)`|Returns `true` if `target` is earlier than `searchVal`.|
|`after`|`(target: Date, searchVal: Date)`|Returns `true` if `target` is after `searchVal`.|
|`today`|`(target: Date)`|Returns `true` if `target` is the current date.|
|`yesterday`|`(target: Date)`|Returns `true` if `target` is the day before the current date.|
|`thisMonth`|`(target: Date)`|Returns `true` if `target` is contained in the current month.|
|`lastMonth`|`(target: Date)`|Returns `true` if `target` is contained in the month before the current month.|
|`nextMonth`|`(target: Date)`|Returns `true` if `target` is contained in the month following the current month.|
|`thisYear`|`(target: Date)`|Returns `true` if `target` is contained in the current year.|
|`lastYear`|`(target: Date)`|Returns `true` if `target` is contained in the year before the current year.|
|`nextYear`|`(target: Date)`|Returns `true` if `target` is contained in the year following the current year.|
|`null`|`(target: any)`|Returns true if `target` is `null`.|
|`notNull`|`(target: any)`|Returns true if `target` is not `null`.|
|`empty`|`(target: any)`|Returns true if `target` is either `null` or `undefined`.|
|`notEmpty`|`(target: any)`|Returns true if target is not `null` or `undefined`.|

## IgxGridRowComponent

### Getters/Setters

|Name|Type|Getter|Setter|Description|
|--- |--- |--- |--- |--- |
|`rowData`|Array|Yes|No|The data passed to the row component.|
|`index`|number|Yes|No|The index of the row.|
|`cells`|QueryList|Yes|No|The rendered cells in the row component.|
|`grid`|IgxGridComponent|Yes|No|A reference to the grid containing the row.|
|`nativeElement`|HTMLElement|Yes|No|The native DOM element representing the row. Could be `null` in certain environments.|

## IgxGridCellComponent

### Getters/Setters

|Name|Type|Getter|Setter|Description|
|--- |--- |--- |--- |--- |
|`column`|IgxColumnComponent|Yes|No|The column to which the cell belongs.|
|`row`|IgxGridRowComponent|Yes|No|The row to which the cell belongs.|
|`value`|any|Yes|No|The value in the cell.|
|`rowIndex`|number|Yes|No|The index of the row this cell belongs to.|
|`columnIndex`|number|Yes|No|The index of the column this cell belongs to.|
|`grid`|IgxGridComponent|Yes|No|The grid component itself.|
|`inEditMode`|boolean|Yes|Yes|Gets/Sets the cell in edit mode.|
|`nativeElement`|HTMLElement|Yes|No|The native DOM element representing the cell. Could be `null` in certain environments.|

### Methods

|Name|Return Type|Description|
|--- |--- |--- |
|`update(val: any)`|void|Emits the `onEditDone` event and updates the appropriate record in the data source.|


### Additional Resources

* [Virtualization and Performance](grid_virtualization.html)
* [Paging](grid_paging.html)
* [Filtering](grid_filtering.html)
* [Sorting](grid_sorting.html)
* [Summaries](grid_summaries.html)
* [Column Pinning](grid_column_pinning.html)
* [Column Resizing](grid_column_resizing.html)
* [Selection](grid_selection.html)