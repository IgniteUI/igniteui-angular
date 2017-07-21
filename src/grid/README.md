# igx-grid
The **igx-grid** component provides the capability to manipulate and represent tabular data.

## Usage
```html
<igx-grid #grid1 [data]="localData" [autoGenerate]="true"
    (onColumnInit)="initColumns($event)" (onCellSelection)="selectCell($event)">
</igx-grid>
```

## Getting Started

### Dependencies
In order to be able to use most of the grid's features some additions should be kept in mind, for example:

Import *IgxGridBindingBehavior*, *IgxGridColumnInitEvent*, *DataContainer* (responsible for CRUD operations, data records access, data processing etb.), *IDataSate* (filtering, sorting, paging features), *sorting* and *filtering* strategies etc.

```typescript
import { IgxGridBindingBehavior, IgxGridColumnInitEvent, IgxGridComponent } from "../../../src/grid/grid.component";
import {
    DataContainer,
    IDataState,
    IgxSnackbar,
    IgxToast,
    IPagingState,
    PagingError,
    SortingDirection,
    StableSortingStrategy
} from "../../../src/main";
```

### Basic configuration

Define the grid
```html
<igx-grid #grid1 [data]="localData" [autoGenerate]="true"
    (onColumnInit)="initColumns($event)" (onCellSelection)="selectCell($event)">
</igx-grid>
```

When all needed dependencies are included, next step would be to configure local or remote service that will return grids data. For example:

```typescript
@Injectable()
export class LocalService {
    public records: Observable<any[]>;
    private url: string = "http://services.odata.org/V4/Northwind/Northwind.svc/Alphabetical_list_of_products";
    private _records: BehaviorSubject<any[]>;
    private dataStore: any[];

    constructor(private http: Http) {
      this.dataStore = [];
      this._records = new BehaviorSubject([]);
      this.records = this._records.asObservable();
    }

    public getData() {
      return this.http.get(this.url)
        .map((response) => response.json())
        .subscribe((data) => {
          this.dataStore = data.value;
          this._records.next(this.dataStore);
        });
    }

}
```

Create the Grid component that will be used in the application. This will include:
- define data fetching on ngOnInit() and implement some sorting or paging for example.

```typescript
public ngOnInit(): void {
    this.data = this.localService.records;
    this.remote = this.remoteService.remoteData;

    this.localService.getData();

    this.localData = [
        {ID: 1, Name: "A"},
        {ID: 2, Name: "B"},
    ];
...
    this.grid3.state = {
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
...
public ngAfterViewInit() {
    this.remoteService.getData(this.grid3.dataContainer.state);
}

```

- enable some features for certaing columns

```typescript
public initColumns(event: IgxGridColumnInitEvent) {
    const column: IgxColumnComponent = event.column;
    if (column.field === "Name") {
    column.filtering = true;
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

| Name | Type | Description |
| :--- |:--- | :--- |
| id  | string  | Unique identifier of the Grid |
| paging  | bool  | Enables paging feature |
| perPage  | number  | Visible items per page, default is 25 |
| state  | IDataState  | Define filtering, sorting and paging state  |
| autoGenerate  | boolean  | Autogenerate grid's columns, default value is *false* |


### Outputs

| Name | Description |
| :--- | :--- |
| *Event emitters* | *Notify for a change* |
| onEditDone  | Used on update row to emit the updated row  |
| onFilterDone  | Used when filtering data to emit the column and filtering expression  |
| onSortingDone  | Used when sorting data to emit the column, direction and sorting expression  |
| onMovingDone  | Used when moving column to emit the drop event  |
| onCellSelection  | Used when focusing a cell to emit the cell  |
| onRowSelection  | Used when focusing a row to emit the row  |
| onPagingDone  | Used when paginating to emit paginator event  |
| onColumnInit  | Used when initializing a column to emit it  |
| onBeforeProcess  | Emit binding behavior  |


### Methods

| Signature | Description |
| :--- | :--- |
| getColumnByIndex(index: number)  | Get grid column by index  |
| getColumnByField(field: string)  | Get grid columng by field name  |
| getCell(rowIndex: number, columnField: string) | Returns the cell at rowIndex/columnIndex.  |
| getRow(rowIndex: number) | Returns row  |
| focusCell | Focuses the grid cell at position row x column  |
| focusRow | Focuses the grid row at `index`.  |
| filterData | Filter data by search term and column  |
| addRow | Add record to the grid data container  |
| deleteRow | Remove record from the grid data container  |
| updateRow | Update record from teh grid data container  |
| updateCell | Update grid cell by index, column field and passed value  |
| sortColumn | Sort grid column  |
| paginate | Change the current page by passed number  |


# IgxColumnComponent

Column component used to define grid's *columns* collection. Cell, header and footer templates are available.

## Example
```html
<igx-grid #grid2 [data]="data | async" [paging]="true" [perPage]="10"
    (onCellSelection)="onInlineEdit($event)">
    <igx-column [sortable]="true" [field]="'ProductID'" [header]="'ID'"></igx-column>
    <igx-column [sortable]="true" [filtering]="true" [field]="'ProductName'"></igx-column>
    <igx-column [sortable]="true" [field]="'UnitsInStock'" [header]="'In Stock'">
        <ng-template igxCell let-col="column" let-ri="rowIndex" let-item="item">
            <span *ngIf="!showInput(ri, col.field)">{{ item }}</span>
            <input *ngIf="showInput(ri, col.field)" igxInput [value]="item">
        </ng-template>
    </igx-column>
```


## API

### Inputs

| Name | Type | Description |
| :--- |:--- | :--- |
| field  | string  | Column field name |
| header  | string  | Column header text |
| sortable  | boolean  | Set column to be sorted or not |
| editable  | boolean  | Set column values to be editable |
| filtering  | boolean  | Set column values to be filterable |
| hidden  | boolean  | Visibility of the column |
| movable  | boolean  | Column moving |
| width  | string  | Columns width |
| index  | string  | Column index |
| filteringCondition  | FilteringCondition  | Boolean, date, string or number conditions. Default is string *contains*  |
| filteringIgnoreCase  | boolean  | Ignore capitalization of words |
| dataType  | DataType  | String, number, Boolean or Date |

