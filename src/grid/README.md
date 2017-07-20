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

- Or add event handlers for CRUD operations

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
| perPage  | number  | Visible items per page, default is 25 |
| paging  | bool  | Enables paging feature |
| state  | IDataState  |  |
| id  | string  | Content Cell |
| autoGenerate  | boolean  | Content Cell |


### Outputs

| Name | Description |
| :--- | :--- |
| Event emitters |   |
| onEditDone  | Content Cell  |
| onFilterDone  | Content Cell  |
| onSortingDone  | Content Cell  |
| onMovingDone  | Content Cell  |
| onCellSelection  | Content Cell  |
| onRowSelection  | Content Cell  |
| onPagingDone  | Content Cell  |
| onColumnInit  | Content Cell  |
| onBeforeProcess  | Content Cell  |


### Methods

| Signature | Description |
| :--- | :--- |
| getColumnByIndex(index: number)  | Content Cell  |
| getColumnByField(field: string)  | Content Cell  |
| formatBody(record: any, column: IgxColumnComponent) | Content Cell  |
| formatHeader(column: IgxColumnComponent) | Content Cell  |
| getCell(rowIndex: number, columnField: string) | Returns the cell at rowIndex/columnIndex.  |
| getRow(rowIndex: number) | Returns row  |
| focusCell | Focuses the grid cell at position row x column  |
| focusRow | Focuses the grid row at index `index`.  |
| filterData | Content Cell  |
| addRow | Content Cell  |
| deleteRow | Content Cell  |
| updateRow | Content Cell  |
| updateCell | Content Cell  |
| sortColumn | Content Cell  |
| paginate | Content Cell  |




