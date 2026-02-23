````skill
---
name: igniteui-angular-grid-data-operations
description: Sorting, filtering, grouping, paging, remote data, virtualization, and Excel-style editing patterns for Ignite UI Angular grids
user-invokable: true
---

# Ignite UI for Angular — Grid Data Operations & State Management

## Description

This skill teaches AI agents how to implement **data manipulation patterns** with Ignite UI for Angular grids. It covers sorting, filtering, grouping, paging, remote data binding, virtualization, batch editing, Excel-style workflows, and how to wire up services correctly.

> **When to use this skill vs. the Data Grids skill**
>
> | Skill | Focus |
> |---|---|
> | **Data Grids** (`igniteui-angular-grids`) | Grid structure — choosing a grid type, column configuration, templates, layout, selection, toolbar, export |
> | **Grid Data Operations** (this skill) | Data manipulation — sorting, filtering, grouping, paging, remote data, state persistence, batch editing workflows |
>
> If the user's question is about *what* to render (columns, templates, grid type), use the Data Grids skill. If it's about *how data flows* (sorting, filtering, remote services, transactions), use this skill.

## Prerequisites

- Angular 20+ project
- `igniteui-angular` installed
- A theme applied (see the Theming skill)
- Familiarity with the Data Grids skill for grid setup basics

## Accessing the Grid Instance

All programmatic data operations require a reference to the grid component. Use `viewChild` to obtain it:

```typescript
import { Component, ChangeDetectionStrategy, signal, viewChild } from '@angular/core';
import { IgxGridComponent, IGX_GRID_DIRECTIVES } from 'igniteui-angular/grids/grid';

@Component({
  selector: 'app-orders-grid',
  imports: [IGX_GRID_DIRECTIVES],
  templateUrl: './orders-grid.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrdersGridComponent {
  // Signal-based view child — the grid is available after view init
  gridRef = viewChild.required<IgxGridComponent>('grid');

  protected data = signal<Order[]>([]);

  sortByName() {
    // Access the grid instance via the signal
    this.gridRef().sort({ fieldName: 'name', dir: SortingDirection.Asc, ignoreCase: true });
  }

  clearAllFilters() {
    this.gridRef().clearFilter();
  }
}
```

```html
<!-- The #grid template variable matches the viewChild name -->
<igx-grid #grid
  [data]="data()"
  [primaryKey]="'id'"
  [autoGenerate]="false"
  height="600px">

  <igx-column field="name" header="Name" [sortable]="true" [filterable]="true"></igx-column>
  <igx-column field="amount" header="Amount" dataType="number" [sortable]="true"></igx-column>
</igx-grid>
```

> **CRITICAL**: Every programmatic example in this skill assumes `gridRef = viewChild.required<IgxGridComponent>('grid')` is defined and `#grid` is set on the template element. For Tree Grid use `IgxTreeGridComponent`, for Hierarchical Grid use `IgxHierarchicalGridComponent`.

## Sorting

### Template-Driven Sorting

Enable sorting on individual columns and optionally bind the sorting state:

```html
<igx-grid #grid
  [data]="data()"
  [(sortingExpressions)]="sortExprs"
  [sortingOptions]="{ mode: 'multiple' }">
  <igx-column field="name" [sortable]="true"></igx-column>
  <igx-column field="date" dataType="date" [sortable]="true"></igx-column>
  <igx-column field="amount" dataType="number" [sortable]="true"></igx-column>
</igx-grid>
```

Sorting modes:
- `'single'` — only one column sorted at a time (default)
- `'multiple'` — multi-column sorting via Shift+click

### Programmatic Sorting

```typescript
import { SortingDirection } from 'igniteui-angular/grids/core';

// Sort a single column
this.gridRef().sort({ fieldName: 'name', dir: SortingDirection.Asc, ignoreCase: true });

// Sort multiple columns
this.gridRef().sort([
  { fieldName: 'category', dir: SortingDirection.Asc, ignoreCase: true },
  { fieldName: 'price', dir: SortingDirection.Desc, ignoreCase: false }
]);

// Clear sorting on one column
this.gridRef().clearSort('name');

// Clear all sorting
this.gridRef().clearSort();
```

### Sorting Events

| Event | Cancelable | Payload |
|---|---|---|
| `(sorting)` | Yes | `ISortingEventArgs` — set `event.cancel = true` to prevent |
| `(sortingDone)` | No | `ISortingEventArgs` — fires after sort is applied |

```typescript
onSorting(event: ISortingEventArgs) {
  // Prevent sorting on a specific column
  if (event.fieldName === 'id') {
    event.cancel = true;
  }
}

onSortingDone(event: ISortingEventArgs) {
  console.log('Sorted by:', event.fieldName, event.dir);
  // Good place to trigger remote data fetch
}
```

### Custom Sorting Strategy

Implement `ISortingStrategy` to control how values are compared:

```typescript
import { ISortingStrategy, SortingDirection } from 'igniteui-angular/grids/core';

class PrioritySortStrategy implements ISortingStrategy {
  private priorityOrder = ['Critical', 'High', 'Medium', 'Low'];

  sort(data: any[], fieldName: string, dir: SortingDirection): any[] {
    return data.sort((a, b) => {
      const indexA = this.priorityOrder.indexOf(a[fieldName]);
      const indexB = this.priorityOrder.indexOf(b[fieldName]);
      return dir === SortingDirection.Asc ? indexA - indexB : indexB - indexA;
    });
  }
}
```

```html
<igx-column field="priority" [sortable]="true" [sortStrategy]="prioritySortStrategy"></igx-column>
```

## Filtering

### Filter Modes

| Mode | Template Property | Description |
|---|---|---|
| Quick Filter | `[filterMode]="'quickFilter'"` | Row of filter inputs above columns |
| Excel-Style | `[filterMode]="'excelStyleFilter'"` | Excel-like dropdown menus per column |
| Advanced | `[allowAdvancedFiltering]="true"` | Dialog with complex filter tree (AND/OR groups) |

```html
<!-- Excel-style filtering (most common enterprise pattern) -->
<igx-grid #grid
  [data]="data()"
  [allowFiltering]="true"
  [filterMode]="'excelStyleFilter'">
  <igx-column field="name" [filterable]="true"></igx-column>
  <igx-column field="status" [filterable]="true"></igx-column>
  <igx-column field="amount" dataType="number" [filterable]="true"></igx-column>
</igx-grid>
```

### Programmatic Filtering

```typescript
import {
  IgxStringFilteringOperand,
  IgxNumberFilteringOperand,
  IgxDateFilteringOperand,
  IgxBooleanFilteringOperand,
  FilteringExpressionsTree,
  FilteringLogic
} from 'igniteui-angular/grids/core';

// Simple single-column filter
this.gridRef().filter('name', 'John', IgxStringFilteringOperand.instance().condition('contains'), true);

// Filter by number range
this.gridRef().filter('amount', 1000, IgxNumberFilteringOperand.instance().condition('greaterThan'));

// Filter by date
this.gridRef().filter('hireDate', new Date(2024, 0, 1), IgxDateFilteringOperand.instance().condition('after'));

// Clear single column filter
this.gridRef().clearFilter('name');

// Clear all filters
this.gridRef().clearFilter();
```

### Complex Filtering (AND/OR Groups)

Build multi-condition filters using `FilteringExpressionsTree`:

```typescript
const tree = new FilteringExpressionsTree(FilteringLogic.And);
tree.filteringOperands = [
  {
    fieldName: 'status',
    condition: IgxStringFilteringOperand.instance().condition('equals'),
    searchVal: 'Active',
    ignoreCase: true
  },
  {
    fieldName: 'amount',
    condition: IgxNumberFilteringOperand.instance().condition('greaterThan'),
    searchVal: 500
  }
];
// Use filteringExpressionsTree for column-level programmatic filtering
this.gridRef().filteringExpressionsTree = tree;
this.gridRef().cdr.detectChanges();
```

> **NOTE**: Use `filteringExpressionsTree` for programmatic column-level filtering. `advancedFilteringExpressionsTree` is only for the advanced filtering dialog (`[allowAdvancedFiltering]="true"`).

### Global Filtering & Cross-Column Logic

```typescript
// Filter all filterable columns at once with a search term
this.gridRef().filterGlobal('search term', IgxStringFilteringOperand.instance().condition('contains'), true);
```

Control the AND/OR logic between **different column** filters:

```html
<!-- Default is AND — all column filters must match. Use OR to match any column filter -->
<igx-grid #grid [data]="data()" [allowFiltering]="true" [filteringLogic]="filteringLogic">
</igx-grid>
```

```typescript
import { FilteringLogic } from 'igniteui-angular/grids/core';

// FilteringLogic.And (default) — row must match ALL column filters
// FilteringLogic.Or — row must match ANY column filter
filteringLogic = FilteringLogic.And;
```

### Filtering Events

| Event | Cancelable | Payload |
|---|---|---|
| `(filtering)` | Yes | `IFilteringEventArgs` — set `event.cancel = true` to prevent |
| `(filteringDone)` | No | `IFilteringEventArgs` — fires after filter is applied |

```typescript
onFilteringDone(event: IFilteringEventArgs) {
  // Trigger remote data fetch with new filter state
  this.loadFilteredData();
}
```

### Available Filtering Operands by Data Type

| Operand Class | Conditions |
|---|---|
| `IgxStringFilteringOperand` | `contains`, `startsWith`, `endsWith`, `equals`, `doesNotEqual`, `doesNotContain`, `empty`, `notEmpty`, `null`, `notNull`, `in` |
| `IgxNumberFilteringOperand` | `equals`, `doesNotEqual`, `greaterThan`, `lessThan`, `greaterThanOrEqualTo`, `lessThanOrEqualTo`, `empty`, `notEmpty`, `null`, `notNull`, `in` |
| `IgxDateFilteringOperand` | `equals`, `doesNotEqual`, `before`, `after`, `today`, `yesterday`, `thisMonth`, `lastMonth`, `nextMonth`, `thisYear`, `lastYear`, `nextYear`, `empty`, `notEmpty`, `null`, `notNull`, `in` |
| `IgxBooleanFilteringOperand` | `all`, `true`, `false`, `empty`, `notEmpty`, `null`, `notNull` |

## Grouping (Grid Only)

### Template-Driven Grouping

```html
<igx-grid #grid
  [data]="data()"
  [groupsExpanded]="true">
  <igx-column field="category" [groupable]="true"></igx-column>
  <igx-column field="product" [groupable]="true"></igx-column>
  <igx-column field="price" dataType="number"></igx-column>

  <!-- Custom group row template -->
  <ng-template igxGroupByRow let-groupRow>
    {{ groupRow.expression.fieldName }}: {{ groupRow.value }}
    ({{ groupRow.records.length }} items)
  </ng-template>
</igx-grid>
```

### Programmatic Grouping

```typescript
import { SortingDirection } from 'igniteui-angular/grids/core';

// Group by a column
this.gridRef().groupBy({ fieldName: 'category', dir: SortingDirection.Asc, ignoreCase: true });

// Group by multiple columns
this.gridRef().groupBy([
  { fieldName: 'region', dir: SortingDirection.Asc, ignoreCase: true },
  { fieldName: 'category', dir: SortingDirection.Asc, ignoreCase: true }
]);

// Clear grouping on one column
this.gridRef().clearGrouping('category');

// Clear all grouping
this.gridRef().clearGrouping();

// Toggle group row expansion
this.gridRef().toggleGroup(groupRow);

// Expand/collapse all groups
this.gridRef().toggleAllGroupRows();
```

### Group By Events

| Event | Description |
|---|---|
| `(groupingDone)` | Fires after grouping expressions change |

### Custom Group-By Key

Control how values are grouped using a `groupingComparer`:

```typescript
// Group dates by month instead of exact value
const monthGroupComparer = (a: Date, b: Date) => {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() ? 0 : -1;
};
```

```html
<igx-column field="orderDate" dataType="date" [groupable]="true" [groupingComparer]="monthGroupComparer"></igx-column>
```

## Paging

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
export class RemotePagingComponent {
  data = signal<Product[]>([]);
  totalCount = signal(0);
  perPage = signal(15);

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

  onFilteringDone() {
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
  (filteringDone)="onFilteringDone()"
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
import { IColumnPipeArgs } from 'igniteui-angular/grids/core';

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
5. **Listen to `(sortingDone)` and `(filteringDone)`** — reset to the beginning and re-fetch with new parameters
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

## Batch Editing & Transactions

### Enabling Batch Editing

```html
<igx-grid #grid
  [data]="data()"
  [primaryKey]="'id'"
  [batchEditing]="true"
  [rowEditable]="true"
  height="600px">
  <igx-column field="name" [editable]="true"></igx-column>
  <igx-column field="price" dataType="number" [editable]="true"></igx-column>
  <igx-column field="quantity" dataType="number" [editable]="true"></igx-column>
</igx-grid>

<button (click)="commitChanges()">Save All</button>
<button (click)="undoLast()">Undo</button>
<button (click)="redoLast()">Redo</button>
<button (click)="discardAll()">Discard</button>
```

### Managing Transactions

```typescript
commitChanges() {
  // Exit any active edit before committing
  this.gridRef().endEdit(true);
  this.gridRef().transactions.commit(this.gridRef().data);
}

undoLast() {
  // Must exit edit mode before undo/redo
  this.gridRef().endEdit(true);
  this.gridRef().transactions.undo();
}

redoLast() {
  this.gridRef().endEdit(true);
  this.gridRef().transactions.redo();
}

discardAll() {
  this.gridRef().endEdit(false);
  this.gridRef().transactions.clear();
}
```

Use `canUndo` and `canRedo` to control button state:

```html
<button (click)="commitChanges()" [disabled]="gridRef().transactions.getAggregatedChanges(false).length < 1">Save All</button>
<button (click)="undoLast()" [disabled]="!gridRef().transactions.canUndo">Undo</button>
<button (click)="redoLast()" [disabled]="!gridRef().transactions.canRedo">Redo</button>
<button (click)="discardAll()">Discard</button>
```

### Transaction State

```typescript
// Check if there are pending changes
const hasPendingChanges = this.gridRef().transactions.getAggregatedChanges(false).length > 0;

// Get all pending transactions
const pending = this.gridRef().transactions.getAggregatedChanges(true);
// Each transaction has: { id, type ('add'|'update'|'delete'), newValue }
```

### Sending Batch Changes to Server

```typescript
saveToServer() {
  const changes = this.gridRef().transactions.getAggregatedChanges(true);

  const adds = changes.filter(t => t.type === 'add').map(t => t.newValue);
  const updates = changes.filter(t => t.type === 'update').map(t => ({ id: t.id, ...t.newValue }));
  const deletes = changes.filter(t => t.type === 'delete').map(t => t.id);

  this.dataService.saveBatch({ adds, updates, deletes }).subscribe(() => {
    this.gridRef().transactions.commit(this.gridRef().data);
    this.gridRef().transactions.clear();
  });
}
```

## Excel-Style Editing Workflows

### Inline Cell Editing with Validation

```html
<igx-grid #grid
  [data]="data()"
  [primaryKey]="'id'"
  [batchEditing]="true"
  (cellEditDone)="onCellEditDone($event)">

  <igx-column field="name" [editable]="true" required></igx-column>
  <igx-column field="email" [editable]="true" [validators]="emailValidators"></igx-column>
  <igx-column field="quantity" dataType="number" [editable]="true" [validators]="quantityValidators"></igx-column>
</igx-grid>
```

```typescript
import { Validators } from '@angular/forms';

emailValidators = [Validators.required, Validators.email];
quantityValidators = [Validators.required, Validators.min(0), Validators.max(9999)];

onCellEditDone(event: IGridEditDoneEventArgs) {
  // React to edits — e.g., recalculate totals
  if (event.column.field === 'quantity' || event.column.field === 'unitPrice') {
    this.recalculateRowTotal(event.rowID);
  }
}
```

### Clipboard Paste for Bulk Edit

Grids support paste from Excel/spreadsheets by default. Configure clipboard behavior:

```html
<igx-grid #grid
  [data]="data()"
  [primaryKey]="'id'"
  [batchEditing]="true"
  [clipboardOptions]="{ enabled: true, copyHeaders: true, copyFormatters: true, separator: '\t' }">
</igx-grid>
```

### Row Adding via UI

```typescript
// Open the add-row UI at the top
this.gridRef().beginAddRowByIndex(0);

// Or under a specific row by primary key
this.gridRef().beginAddRowById('ALFKI');

// Or at the end
this.gridRef().beginAddRowByIndex(this.gridRef().data.length);
```

Use with Action Strip for visual add/edit actions:

```html
<igx-grid #grid [data]="data()" [primaryKey]="'id'" [rowEditable]="true">
  <igx-action-strip>
    <igx-grid-editing-actions [addRow]="true"></igx-grid-editing-actions>
  </igx-action-strip>
  <igx-column field="name" [editable]="true"></igx-column>
</igx-grid>
```

## Editing Events Reference

All grids fire a consistent sequence of events during cell and row editing:

| Event | Fires When | Cancelable |
|---|---|---|
| `(rowEditEnter)` | Row enters edit mode | Yes |
| `(cellEditEnter)` | Cell enters edit mode (after `rowEditEnter`) | Yes |
| `(cellEdit)` | Cell value is about to be committed | Yes |
| `(cellEditDone)` | Cell value has been committed | No |
| `(cellEditExit)` | Cell exits edit mode | No |
| `(rowEdit)` | Row edit is about to be committed (Done button) | Yes |
| `(rowEditDone)` | Row edit has been committed | No |
| `(rowEditExit)` | Row exits edit mode | No |

Canceling `(cellEdit)` keeps the cell in edit mode — the value won't commit until Cancel is clicked:

```typescript
onCellEdit(event: IGridEditEventArgs) {
  if (!event.valid) {
    event.cancel = true; // prevent committing invalid values
  }
}
```

## Validation

### Template-Driven Validation

Apply Angular validators directly on columns:

```html
<igx-column field="email" [editable]="true" required email></igx-column>
<igx-column field="age" dataType="number" [editable]="true" required [min]="18" [max]="120"></igx-column>
```

Supported built-in validators: `required`, `min`, `max`, `email`, `minlength`, `maxlength`, `pattern`.

### Reactive Form Validation

Use the `formGroupCreated` event to add custom validators when a row enters edit mode:

```html
<igx-grid #grid [data]="data()" [rowEditable]="true" [primaryKey]="'id'"
  (formGroupCreated)="onFormGroupCreated($event)">
</igx-grid>
```

```typescript
onFormGroupCreated(event: IGridFormGroupCreatedEventArgs) {
  const { formGroup } = event;
  formGroup.get('endDate')?.addValidators(this.dateAfterValidator('startDate'));
}
```

### Validation Service

The grid exposes a `validation` service:

```typescript
// Check if the grid is in a valid state
const isValid = this.gridRef().validation.valid;

// Get all records with validation errors
const invalid = this.gridRef().validation.getInvalid();

// Clear validation state for a specific record (or all if no id)
this.gridRef().validation.clear(recordId);
```

## Summaries

### Built-In Summaries

```html
<igx-column field="amount" dataType="number" [hasSummary]="true"></igx-column>
```

Default summaries by type:
- **number**: Count, Min, Max, Sum, Average
- **date**: Count, Earliest, Latest
- **string/boolean**: Count

### Custom Summary Operand

```typescript
import { IgxNumberSummaryOperand, IgxSummaryResult } from 'igniteui-angular/grids/core';

class RevenueSummary extends IgxNumberSummaryOperand {
  operate(data: number[]): IgxSummaryResult[] {
    const result = super.operate(data);
    result.push({
      key: 'margin',
      label: 'Avg Margin',
      summaryResult: data.length ? data.reduce((a, b) => a + b, 0) / data.length * 0.15 : 0
    });
    return result;
  }
}

// Use in component
revenueSummary = RevenueSummary;
```

```html
<igx-column field="revenue" dataType="number" [hasSummary]="true" [summaries]="revenueSummary"></igx-column>
```

### Summaries with Grouping

When grouping is enabled, summaries appear for each group. Control this with:

```html
<igx-grid #grid
  [data]="data()"
  [showSummaryOnCollapse]="true"
  [summaryCalculationMode]="'childLevelsOnly'"
  [summaryPosition]="'bottom'">
</igx-grid>
```

## State Persistence

### Saving and Restoring Grid State

Use `IgxGridStateDirective` to persist sorting, filtering, grouping, paging, selection, and column state:

```html
<igx-grid #grid [data]="data()" igxGridState>
  <igx-column field="name" [sortable]="true" [filterable]="true" [groupable]="true"></igx-column>
</igx-grid>
```

```typescript
import { IgxGridStateDirective } from 'igniteui-angular/grids/grid';

export class StatefulGridComponent {
  gridState = viewChild.required(IgxGridStateDirective);

  saveState() {
    const state = this.gridState().getState();
    localStorage.setItem('gridState', state);
  }

  restoreState() {
    const state = localStorage.getItem('gridState');
    if (state) {
      this.gridState().setState(state);
    }
  }
}
```

### Selective State Features

Control which features are persisted:

```html
<igx-grid #grid [data]="data()" [igxGridState]="stateOptions">
</igx-grid>
```

```typescript
stateOptions = {
  sorting: true,
  filtering: true,
  groupBy: true,
  paging: true,
  columns: true,
  cellSelection: false,    // skip selection state
  rowSelection: false,
  columnSelection: false,
  advancedFiltering: true,
  rowPinning: true,
  expansion: true
};
```

### Restoring Custom Strategies

`IgxGridState` does **not** persist functions — this includes sorting strategies, filtering strategies, column formatters, summaries, `cellClasses`, and `cellStyles`. Use the `stateParsed` event to reapply these after restoring state:

```typescript
restoreState() {
  const stateJson = localStorage.getItem('gridState');
  if (!stateJson) return;

  // Subscribe to stateParsed to reapply custom strategies before state is applied
  this.gridState().stateParsed.pipe(take(1)).subscribe(parsedState => {
    parsedState.sorting?.forEach(expr => expr.strategy = NoopSortingStrategy.instance());
  });

  this.gridState().setState(stateJson);
}
```

### Restoring Column Templates

Column templates are also not serialized. Use the `columnInit` event to reassign them:

```typescript
@ViewChild('activeTemplate', { static: true }) public activeTemplate: TemplateRef<any>;

onColumnInit(column: IgxColumnComponent) {
  if (column.field === 'IsActive') {
    column.bodyTemplate = this.activeTemplate;
  }
}
```

```html
<igx-grid #grid [data]="data()" igxGridState (columnInit)="onColumnInit($event)">
  <ng-template #activeTemplate igxCell let-val="val">
    <igx-checkbox [checked]="val"></igx-checkbox>
  </ng-template>
</igx-grid>
```

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

1. **Always access the grid via `viewChild`** — use `gridRef = viewChild.required<IgxGridComponent>('grid')` and `#grid` on the template
2. **Set `[primaryKey]`** — required for editing, batch transactions, selection, row adding, and row operations
3. **Set `dataType` on every column** — enables correct filtering operands, sorting behavior, and editors
4. **Cancelable events** — use `event.cancel = true` in `(sorting)`, `(filtering)`, `(cellEdit)`, `(rowEdit)`, `(paging)` to prevent the action
5. **Use signals for data** — `[data]="myData()"` with `signal<T[]>([])`
6. **Remote data requires `[totalItemCount]`** — without it, the virtual scrollbar won't size correctly
7. **Remote data requires noop strategies** — apply `NoopSortingStrategy` and `NoopFilteringStrategy` to disable client-side operations when the server handles them
8. **Track sort/filter state for remote operations** — store current expressions and include them in every server request
9. **Batch editing requires `[primaryKey]`** — call `endEdit(true)` before `transactions.undo()`/`redo()`, commit via `transactions.commit(data)`
10. **Virtualization is automatic** — don't wrap grids in virtual scroll containers; just set a fixed `height`
11. **Debounce rapid virtual scroll** — use `debounceTime` on `(dataPreLoad)` to avoid flooding the server
12. **State persistence** — use `IgxGridStateDirective` to save/restore sort, filter, group, and column configuration; functions (formatters, strategies, summaries) must be reapplied via `stateParsed` event
13. **Use `filteringExpressionsTree` for programmatic filtering** — `advancedFilteringExpressionsTree` is only for the advanced filtering dialog
14. **Validation** — use template-driven validators on columns (`required`, `min`, `max`, `email`, `pattern`) or reactive validators via `(formGroupCreated)`
````
