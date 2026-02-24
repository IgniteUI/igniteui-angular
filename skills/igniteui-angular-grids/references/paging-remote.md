# Grid Paging, Remote Data & Virtualization

> **Part of the [`igniteui-angular-grids`](../SKILL.md) skill hub.**
> For grid import patterns and `viewChild` access — see [`data-operations.md`](./data-operations.md).
> For editing and validation — see [`editing.md`](./editing.md).
> For state persistence — see [`state.md`](./state.md).

## Paging

> **Docs:** [Paging — Remote Paging](https://www.infragistics.com/products/ignite-ui-angular/angular/components/grid/paging#remote-paging) (substitute URL prefix per grid type)

### Using the Paginator Component

```html
<igx-grid #grid
  [data]="data()"
  [primaryKey]="'id'"
  height="600px">
  <igx-column field="name"></igx-column>
  <igx-column field="amount" dataType="number"></igx-column>

  <igx-paginator
    [perPage]="15"
    [selectOptions]="[10, 15, 25, 50]"
    [displayDensity]="'comfortable'">
  </igx-paginator>
</igx-grid>
```

### Programmatic Paging

```typescript
// Navigate pages
this.gridRef().paginator.page = 3;
this.gridRef().paginator.nextPage();
this.gridRef().paginator.previousPage();
this.gridRef().paginator.paginate(0); // go to first page

// Change page size
this.gridRef().paginator.perPage = 25;
```

### Paging Events

| Event | Description |
|---|---|
| `(paging)` | Fires before page changes (cancelable) |
| `(pagingDone)` | Fires after page has changed |
| `(perPageChange)` | Fires when page size changes |

### Remote Paging

```typescript
import { GridPagingMode } from 'igniteui-angular/grids/grid';

export class RemotePagingComponent {
  data = signal<Product[]>([]);
  totalCount = signal(0);
  perPage = signal(15);
  pagingMode = GridPagingMode.Remote;

  gridRef = viewChild.required<IgxGridComponent>('grid');
  private dataService = inject(ProductService);

  constructor() {
    this.loadPage(0);
  }

  onPagingDone(event: IPageEventArgs) {
    this.loadPage(event.current);
  }

  onPerPageChange(perPage: number) {
    this.perPage.set(perPage);
    this.loadPage(0);
  }

  private loadPage(pageIndex: number) {
    const skip = pageIndex * this.perPage();
    this.dataService.getProducts({ skip, take: this.perPage() }).subscribe(result => {
      this.data.set(result.data);
      this.totalCount.set(result.totalCount);
    });
  }
}
```

```html
<igx-grid #grid
  [data]="data()"
  [primaryKey]="'id'"
  [pagingMode]="pagingMode"
  height="600px">
  <igx-column field="name"></igx-column>
  <igx-column field="price" dataType="number"></igx-column>

  <igx-paginator
    [perPage]="perPage()"
    [totalRecords]="totalCount()"
    (pagingDone)="onPagingDone($event)"
    (perPageChange)="onPerPageChange($event)">
  </igx-paginator>
</igx-grid>
```

## Remote Data Operations

> **Docs:** [Remote Data Operations](https://www.infragistics.com/products/ignite-ui-angular/angular/components/grid/remote-data-operations) (substitute URL prefix per grid type)

### The Problem

Grids perform sorting, filtering, and paging **client-side** by default. For large datasets, you must intercept these operations and delegate them to the server.

### Complete Remote Data Pattern

This is the canonical pattern for server-side sorting, filtering, and virtualization. **You must disable the built-in client-side sorting/filtering** by applying `NoopSortingStrategy` and `NoopFilteringStrategy` on the grid:

```typescript
import { Component, ChangeDetectionStrategy, signal, viewChild, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IgxGridComponent, IGX_GRID_DIRECTIVES } from 'igniteui-angular/grids/grid';
import {
  IForOfState,
  ISortingEventArgs,
  IFilteringExpressionsTree,
  NoopSortingStrategy,
  NoopFilteringStrategy
} from 'igniteui-angular/grids/core';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'app-remote-grid',
  imports: [IGX_GRID_DIRECTIVES],
  templateUrl: './remote-grid.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RemoteGridComponent {
  data = signal<Order[]>([]);
  totalCount = signal(0);
  isLoading = signal(false);

  // Noop strategies — disable built-in client-side sort/filter
  noopSort = NoopSortingStrategy.instance();
  noopFilter = NoopFilteringStrategy.instance();

  gridRef = viewChild.required<IgxGridComponent>('grid');
  private dataService = inject(OrderService);
  private destroyRef = inject(DestroyRef);

  private currentSort: ISortingEventArgs[] | undefined;
  private currentFilter: IFilteringExpressionsTree | undefined;

  // Debounce rapid dataPreLoad events during fast scrolling
  private dataPreLoad$ = new Subject<IForOfState>();

  constructor() {
    this.dataPreLoad$.pipe(
      debounceTime(150),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(event => {
      // NOTE: The first chunkSize will always be 0 — use a reasonable default
      const chunkSize = event.chunkSize || 15;
      this.loadData(event.startIndex, chunkSize);
    });

    this.loadData(0, 15);
  }

  onDataPreLoad(event: IForOfState) {
    this.dataPreLoad$.next(event);
  }

  onSortingDone(event: ISortingEventArgs) {
    this.currentSort = this.gridRef().sortingExpressions;
    this.loadData(0, 15);
  }

  onFilteringExpressionsTreeChange() {
    this.currentFilter = this.gridRef().filteringExpressionsTree;
    this.loadData(0, 15);
  }

  private loadData(skip: number, take: number) {
    this.isLoading.set(true);
    this.dataService.getOrders({
      skip,
      take,
      sort: this.currentSort,
      filter: this.currentFilter
    }).subscribe(result => {
      this.data.set(result.data);
      this.totalCount.set(result.total);
      this.isLoading.set(false);
    });
  }
}
```

```html
<igx-grid #grid
  [data]="data()"
  [primaryKey]="'orderId'"
  [totalItemCount]="totalCount()"
  [isLoading]="isLoading()"
  [autoGenerate]="false"
  [allowFiltering]="true"
  [filterMode]="'excelStyleFilter'"
  [sortStrategy]="noopSort"
  [filterStrategy]="noopFilter"
  (dataPreLoad)="onDataPreLoad($event)"
  (sortingDone)="onSortingDone($event)"
  (filteringExpressionsTreeChange)="onFilteringExpressionsTreeChange()"
  height="600px">

  <igx-column field="orderId" header="Order ID" [sortable]="true"></igx-column>
  <igx-column field="customer" header="Customer" [sortable]="true" [filterable]="true"></igx-column>
  <igx-column field="orderDate" header="Date" dataType="date" [sortable]="true" [filterable]="true"></igx-column>
  <igx-column field="amount" header="Amount" dataType="number" [sortable]="true" [filterable]="true"></igx-column>
  <igx-column field="status" header="Status" [filterable]="true"></igx-column>
</igx-grid>
```

> **IMPORTANT**: `[sortStrategy]="noopSort"` and `[filterStrategy]="noopFilter"` prevent the grid from applying sort/filter operations client-side. The grid still fires events (allowing you to send them to the server), but the local data remains untouched until you replace it.

### Excel-Style Filtering with Remote Unique Values

When using Excel-style filtering with remote data, provide a strategy to fetch unique column values from the server:

```typescript
// Tell the grid how to load unique values for Excel-style filter lists
uniqueValuesStrategy = (column: any, tree: any, done: (values: any[]) => void) => {
  this.dataService.getUniqueValues(column.field).subscribe(values => done(values));
};
```

```html
<igx-grid #grid
  [data]="data()"
  [uniqueColumnValuesStrategy]="uniqueValuesStrategy"
  [filterMode]="'excelStyleFilter'"
  [allowFiltering]="true">
</igx-grid>
```

### Remote Data Service Example

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RemoteDataResult<T> {
  data: T[];
  total: number;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private http = inject(HttpClient);
  private apiUrl = '/api/orders';

  getOrders(params: {
    skip: number;
    take: number;
    sort?: any[];
    filter?: any;
  }): Observable<RemoteDataResult<Order>> {
    let httpParams = new HttpParams()
      .set('skip', params.skip)
      .set('take', params.take);

    if (params.sort?.length) {
      httpParams = httpParams.set('sort', JSON.stringify(params.sort));
    }
    if (params.filter) {
      httpParams = httpParams.set('filter', JSON.stringify(params.filter));
    }

    return this.http.get<RemoteDataResult<Order>>(this.apiUrl, { params: httpParams });
  }
}
```

### Key Points for Remote Data

1. **Set `[totalItemCount]`** — the grid needs the total record count for correct virtual scrollbar sizing
2. **Use `[isLoading]`** — shows a loading indicator while data is being fetched
3. **Apply `NoopSortingStrategy` and `NoopFilteringStrategy`** — prevents the grid from performing client-side sorting/filtering, so the server results are displayed as-is
4. **Listen to `(dataPreLoad)`** — fires when the user scrolls and the grid needs more rows; provides `startIndex` and `chunkSize` (first `chunkSize` will be 0 — use a fallback)
5. **Listen to `(sortingDone)` and `(filteringExpressionsTreeChange)`** — reset to the beginning and re-fetch with new parameters; `filteringExpressionsTreeChange` is the grid-level output that reflects the complete filter state (unlike the column-level `filteringDone`)
6. **Track current sort/filter state** — store them so every `loadData` call includes the active criteria
7. **Debounce `(dataPreLoad)`** — use `debounceTime` to avoid flooding the server during fast scrolling
8. **Use `[uniqueColumnValuesStrategy]`** — when using Excel-style filtering, supply a callback to load unique column values from the server

## Virtualization

### How It Works

All Ignite UI grids use **row and column virtualization** by default. Only the visible rows and columns are rendered in the DOM, enabling smooth scrolling through millions of records.

### Requirements

- Set a fixed `height` on the grid (e.g., `height="600px"`)
- No additional configuration is needed — virtualization is automatic
- Do **not** wrap the grid in a virtual scroll container

### Remote Virtualization

For datasets too large to load entirely, combine virtualization with remote data:

```html
<igx-grid #grid
  [data]="data()"
  [totalItemCount]="totalCount()"
  (dataPreLoad)="onDataPreLoad($event)"
  height="600px">
</igx-grid>
```

The `(dataPreLoad)` event fires with an `IForOfState` containing:
- `startIndex` — the first visible row index
- `chunkSize` — number of rows the grid needs

## Multi-Grid Coordination

### Master-Detail Filtering

When using a master grid to drive a detail grid:

```typescript
export class MasterDetailComponent {
  masterGrid = viewChild.required<IgxGridComponent>('masterGrid');
  orders = signal<Order[]>([]);
  selectedCustomer = signal<Customer | null>(null);
  customerOrders = signal<Order[]>([]);

  onRowSelectionChanging(event: IRowSelectionEventArgs) {
    const selectedId = event.newSelection[0];
    const customer = this.customers().find(c => c.id === selectedId);
    this.selectedCustomer.set(customer ?? null);

    if (customer) {
      this.dataService.getOrdersByCustomer(customer.id).subscribe(orders => {
        this.customerOrders.set(orders);
      });
    }
  }
}
```

```html
<igx-grid #masterGrid
  [data]="customers()"
  [primaryKey]="'id'"
  [rowSelection]="'single'"
  (rowSelectionChanging)="onRowSelectionChanging($event)"
  height="300px">
  <igx-column field="name" header="Customer"></igx-column>
</igx-grid>

<igx-grid
  [data]="customerOrders()"
  [primaryKey]="'orderId'"
  height="300px">
  <igx-column field="orderId" header="Order"></igx-column>
  <igx-column field="amount" header="Amount" dataType="number"></igx-column>
</igx-grid>
```

## Key Rules

1. **Remote data requires `[totalItemCount]`** — without it, the virtual scrollbar won't size correctly
2. **Remote data requires noop strategies** — apply `NoopSortingStrategy` and `NoopFilteringStrategy` to disable client-side operations when the server handles them
3. **Track sort/filter state for remote operations** — store current expressions and include them in every server request
4. **Debounce rapid virtual scroll** — use `debounceTime` on `(dataPreLoad)` to avoid flooding the server
5. **Virtualization is automatic** — don't wrap grids in virtual scroll containers; just set a fixed `height`
6. **Use the correct component type for `viewChild`** — `IgxGridComponent`, `IgxTreeGridComponent`, `IgxHierarchicalGridComponent`, or `IgxPivotGridComponent`
7. **Import the correct directives/components** — `IGX_GRID_DIRECTIVES`, `IGX_TREE_GRID_DIRECTIVES`, `IGX_HIERARCHICAL_GRID_DIRECTIVES`, or `IGX_PIVOT_GRID_DIRECTIVES`
8. **Use signals for data** — `[data]="myData()"` with `signal<T[]>([])`

## See Also

- [`data-operations.md`](./data-operations.md) — Sorting, filtering, grouping, and canonical grid import patterns
- [`editing.md`](./editing.md) — Cell editing, row editing, batch editing, validation, summaries
- [`state.md`](./state.md) — State persistence, Tree Grid / Hierarchical Grid / Pivot Grid / Grid Lite data operations
- [`structure.md`](./structure.md) — Grid structure, column configuration, templates, layout, selection
- [`../../igniteui-angular-components/SKILL.md`](../../igniteui-angular-components/SKILL.md) — Non-grid Ignite UI components
- [`../../igniteui-angular-theming/SKILL.md`](../../igniteui-angular-theming/SKILL.md) — Theming & Styling
