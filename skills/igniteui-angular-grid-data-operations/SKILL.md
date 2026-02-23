````skill
---
name: igniteui-angular-grid-data-operations
description: Cell editing, row editing, batch editing, sorting, filtering, grouping, paging, remote data, and virtualization patterns for Ignite UI Angular grids
user-invokable: true
---

# Ignite UI for Angular — Grid Data Operations & State Management

## Description

This skill teaches AI agents how to implement **data manipulation patterns** with Ignite UI for Angular grids. It covers cell editing, row editing, batch editing, sorting, filtering, grouping, paging, remote data binding, virtualization, and how to wire up services correctly.

> **When to use this skill vs. the Data Grids skill**
>
> | Skill | Focus |
> |---|---|
> | **Data Grids** (`igniteui-angular-grids`) | Grid structure — choosing a grid type, column configuration, templates, layout, selection, toolbar, export |
> | **Grid Data Operations** (this skill) | Data manipulation — editing (cell/row/batch), sorting, filtering, grouping, paging, remote data, state persistence |
>
> If the user's question is about *what* to render (columns, templates, grid type), use the Data Grids skill. If it's about *how data flows* (sorting, filtering, remote services, transactions), use this skill.

## Prerequisites

- Angular 20+ project
- `igniteui-angular` installed, **or** `@infragistics/igniteui-angular` for licensed users — both packages share the same entry-point structure
- A theme applied (see the Theming skill)
- Familiarity with the Data Grids skill for grid setup basics

## Accessing the Grid Instance

All programmatic data operations require a reference to the grid component. Use `viewChild` with the **correct component type** for your grid.

> **AGENT INSTRUCTION:** Check `package.json` to determine whether the project uses `igniteui-angular` or `@infragistics/igniteui-angular`. Replace the package prefix in every import accordingly. Always use specific entry points — never the root barrel of either package.

```typescript
import { Component, ChangeDetectionStrategy, signal, viewChild } from '@angular/core';

// Open-source package — import from specific entry points
// Grid Lite (separate npm package — requires `npm install igniteui-grid-lite`)
import { IgxGridLiteComponent } from 'igniteui-angular/grids/lite';
// Flat Grid
import { IgxGridComponent, IGX_GRID_DIRECTIVES } from 'igniteui-angular/grids/grid';
// Tree Grid
import { IgxTreeGridComponent, IGX_TREE_GRID_DIRECTIVES } from 'igniteui-angular/grids/tree-grid';
// Hierarchical Grid
import { IgxHierarchicalGridComponent, IGX_HIERARCHICAL_GRID_DIRECTIVES } from 'igniteui-angular/grids/hierarchical-grid';
// Pivot Grid
import { IgxPivotGridComponent, IGX_PIVOT_GRID_DIRECTIVES } from 'igniteui-angular/grids/pivot-grid';

// Licensed package — same entry-point paths, different prefix:
// import { IgxGridComponent, IGX_GRID_DIRECTIVES } from '@infragistics/igniteui-angular/grids/grid';
// import { IgxTreeGridComponent, IGX_TREE_GRID_DIRECTIVES } from '@infragistics/igniteui-angular/grids/tree-grid';
// import { IgxHierarchicalGridComponent, IGX_HIERARCHICAL_GRID_DIRECTIVES } from '@infragistics/igniteui-angular/grids/hierarchical-grid';
// import { IgxPivotGridComponent, IGX_PIVOT_GRID_DIRECTIVES } from '@infragistics/igniteui-angular/grids/pivot-grid';

// AVOID — never import from the root barrel (wrong for BOTH variants)
// import { IgxGridComponent } from 'igniteui-angular';
// import { IgxGridComponent } from '@infragistics/igniteui-angular';
```

### Flat Grid Example

```typescript
@Component({
  selector: 'app-orders-grid',
  imports: [IGX_GRID_DIRECTIVES],
  templateUrl: './orders-grid.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrdersGridComponent {
  gridRef = viewChild.required<IgxGridComponent>('grid');
  protected data = signal<Order[]>([]);

  sortByName() {
    this.gridRef().sort({ fieldName: 'name', dir: SortingDirection.Asc, ignoreCase: true });
  }
}
```

### Tree Grid Example

```typescript
@Component({
  selector: 'app-org-tree',
  imports: [IGX_TREE_GRID_DIRECTIVES],
  templateUrl: './org-tree.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrgTreeComponent {
  // Use IgxTreeGridComponent for tree grids
  treeGridRef = viewChild.required<IgxTreeGridComponent>('treeGrid');
  protected employees = signal<Employee[]>([]);
}
```

```html
<igx-tree-grid #treeGrid
  [data]="employees()"
  [primaryKey]="'id'"
  [foreignKey]="'managerId'"
  height="600px">
  <igx-column field="name" [sortable]="true" [filterable]="true"></igx-column>
</igx-tree-grid>
```

### Hierarchical Grid Example

```typescript
@Component({
  selector: 'app-company-grid',
  imports: [IGX_HIERARCHICAL_GRID_DIRECTIVES],
  templateUrl: './company-grid.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompanyGridComponent {
  // Use IgxHierarchicalGridComponent for hierarchical grids
  hGridRef = viewChild.required<IgxHierarchicalGridComponent>('hGrid');
  protected companies = signal<Company[]>([]);
}
```

```html
<igx-hierarchical-grid #hGrid
  [data]="companies()"
  [primaryKey]="'id'"
  height="600px">
  <igx-column field="name" [sortable]="true"></igx-column>
  <igx-row-island [key]="'orders'" [primaryKey]="'orderId'">
    <igx-column field="orderId" [sortable]="true"></igx-column>
  </igx-row-island>
</igx-hierarchical-grid>
```

> **CRITICAL**: Every programmatic example in this skill uses Flat Grid (`IgxGridComponent`) by default. For Tree Grid substitute `IgxTreeGridComponent` and `#treeGrid`. For Hierarchical Grid substitute `IgxHierarchicalGridComponent` and `#hGrid`. The sorting, filtering, and editing APIs are the same across all three grid types (Flat, Tree, Hierarchical). **Pivot Grid does NOT support standard sorting/filtering/editing APIs** — see the Pivot Grid section. **Grid Lite has its own lightweight sorting/filtering API** — see the Grid Lite Data Operations section.

## Sorting

> **Docs:** [Sorting](https://www.infragistics.com/products/ignite-ui-angular/angular/components/grid/sorting) · [Tree Grid](https://www.infragistics.com/products/ignite-ui-angular/angular/components/treegrid/sorting) · [Hierarchical Grid](https://www.infragistics.com/products/ignite-ui-angular/angular/components/hierarchicalgrid/sorting)

> **Applies to**: Flat Grid, Tree Grid, and Hierarchical Grid. Pivot Grid uses dimension-level sorting instead (see Pivot Grid section). **Grid Lite** uses a different sorting API (`sort()`, `clearSort()`, `IgxGridLiteSortingExpression`) — see the Grid Lite Data Operations section.
>
> **Tree Grid behavior**: sorting is applied per-level — children are sorted among their siblings, not globally flattened.
>
> **Hierarchical Grid behavior**: each grid level sorts independently. Configure sorting on the `<igx-row-island>` to apply to all child grids at that level.

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

> **Docs:** [Filtering](https://www.infragistics.com/products/ignite-ui-angular/angular/components/grid/filtering) · [Excel-Style](https://www.infragistics.com/products/ignite-ui-angular/angular/components/grid/excel-style-filtering) · [Advanced](https://www.infragistics.com/products/ignite-ui-angular/angular/components/grid/advanced-filtering) (substitute URL prefix per grid type)

> **Applies to**: Flat Grid, Tree Grid, and Hierarchical Grid. Pivot Grid uses dimension-level filtering instead (see Pivot Grid section). **Grid Lite** uses a different filtering API (`filter()`, `clearFilter()`, `IgxGridLiteFilteringExpression`) — see the Grid Lite Data Operations section.
>
> **Tree Grid behavior**: filtering is **recursive** — when a child matches, all its ancestor rows are shown (even if they don't match) and auto-expanded.
>
> **Hierarchical Grid behavior**: each grid level filters independently. Configure filtering on the `<igx-row-island>` to apply to all child grids at that level.

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

## Grouping (Flat Grid Only)

> **Docs:** [Group By](https://www.infragistics.com/products/ignite-ui-angular/angular/components/grid/groupby)

> **NOTE**: GroupBy is **exclusive to the Flat Grid** (`igx-grid`). Tree Grid uses its natural hierarchy. Hierarchical Grid uses row islands. Pivot Grid uses dimensions.

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

## Editing Data Through the Grid

> **AGENT INSTRUCTION:** When a user says they want to "edit data through the grid", "make the grid editable", or "allow CRUD in the grid", use this section to pick the right editing mode before writing any code.

### Choosing an Editing Mode

| Mode | When to use | Key properties |
|---|---|---|
| **Cell editing** | Each cell saves immediately when the user confirms or leaves it. Good for quick single-field corrections. | `[editable]="true"` on columns + `(cellEditDone)` |
| **Row editing** | User edits multiple cells in a row and confirms/cancels the whole row at once. **Best for most CRUD UIs.** | `[rowEditable]="true"` + `[editable]="true"` on columns + `(rowEditDone)` |
| **Batch editing** | Accumulate many changes across multiple rows with undo/redo, then commit or discard all at once. | `[batchEditing]="true"` + `[rowEditable]="true"` |

> **Default recommendation:** use **row editing** for most data management UIs (e.g., "edit available cars"). It prevents half-edited data from being visible and gives users a clear Done/Cancel flow per row.

### Cell Editing (Immediate)

> **Docs:** [Cell Editing](https://www.infragistics.com/products/ignite-ui-angular/angular/components/grid/cell-editing)

The simplest mode. Each cell saves the moment the user tabs away or presses Enter.

```typescript
import { Component, ChangeDetectionStrategy, signal, viewChild, inject } from '@angular/core';
import { IgxGridComponent, IGX_GRID_DIRECTIVES } from 'igniteui-angular/grids/grid';
import { IGridEditDoneEventArgs } from 'igniteui-angular/grids/core';

@Component({
  selector: 'app-cars-grid',
  imports: [IGX_GRID_DIRECTIVES],
  templateUrl: './cars-grid.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CarsGridComponent {
  gridRef = viewChild.required<IgxGridComponent>('grid');
  private carService = inject(CarService);
  protected cars = signal<Car[]>([]);

  constructor() {
    this.carService.getCars().subscribe(data => this.cars.set(data));
  }

  onCellEditDone(event: IGridEditDoneEventArgs) {
    // Persist the single-cell change immediately
    const updatedCar = { ...event.rowData, [event.column.field]: event.newValue };
    this.carService.updateCar(updatedCar).subscribe();
  }
}
```

```html
<igx-grid #grid
  [data]="cars()"
  [primaryKey]="'id'"
  [autoGenerate]="false"
  (cellEditDone)="onCellEditDone($event)"
  height="600px">
  <igx-column field="make" header="Make" [editable]="true" [sortable]="true"></igx-column>
  <igx-column field="model" header="Model" [editable]="true" [sortable]="true"></igx-column>
  <igx-column field="year" header="Year" dataType="number" [editable]="true" [sortable]="true"></igx-column>
  <igx-column field="price" header="Price" dataType="number" [editable]="true" [sortable]="true"></igx-column>
  <igx-column field="available" header="Available" dataType="boolean" [editable]="true"></igx-column>
</igx-grid>
```

### Row Editing (Recommended for CRUD)

> **Docs:** [Row Editing](https://www.infragistics.com/products/ignite-ui-angular/angular/components/grid/row-editing)

Users click into a row, edit cells, then click **Done** or **Cancel** — changes only apply when Done is pressed. An overlay toolbar appears automatically.

```typescript
import { Component, ChangeDetectionStrategy, signal, viewChild, inject } from '@angular/core';
import { IgxGridComponent, IGX_GRID_DIRECTIVES } from 'igniteui-angular/grids/grid';
import { IGridEditDoneEventArgs, IGridEditEventArgs, IRowDataEventArgs } from 'igniteui-angular/grids/core';

@Component({
  selector: 'app-cars-grid',
  imports: [IGX_GRID_DIRECTIVES],
  templateUrl: './cars-grid.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CarsGridComponent {
  gridRef = viewChild.required<IgxGridComponent>('grid');
  private carService = inject(CarService);
  protected cars = signal<Car[]>([]);

  constructor() {
    this.carService.getCars().subscribe(data => this.cars.set(data));
  }

  onRowEditDone(event: IGridEditDoneEventArgs) {
    // event.newValue contains the full updated row object
    this.carService.updateCar(event.newValue).subscribe();
  }

  onRowAdded(event: IRowDataEventArgs) {
    // Persist the newly added row; optionally replace local data with server response
    this.carService.createCar(event.data).subscribe(created => {
      this.cars.update(cars => cars.map(c => c === event.data ? created : c));
    });
  }

  onRowDeleted(event: IRowDataEventArgs) {
    this.carService.deleteCar(event.data.id).subscribe();
  }

  addCar() {
    // Programmatically start a new row at the end
    this.gridRef().beginAddRowByIndex(this.cars().length);
  }

  deleteCar(carId: number) {
    this.gridRef().deleteRow(carId);
  }
}
```

```html
<igx-grid #grid
  [data]="cars()"
  [primaryKey]="'id'"
  [autoGenerate]="false"
  [rowEditable]="true"
  (rowEditDone)="onRowEditDone($event)"
  (rowAdded)="onRowAdded($event)"
  (rowDeleted)="onRowDeleted($event)"
  height="600px">

  <igx-column field="make" header="Make" [editable]="true" [sortable]="true"></igx-column>
  <igx-column field="model" header="Model" [editable]="true" [sortable]="true"></igx-column>
  <igx-column field="year" header="Year" dataType="number" [editable]="true" [sortable]="true"></igx-column>
  <igx-column field="price" header="Price" dataType="number" [editable]="true" [sortable]="true"></igx-column>
  <igx-column field="available" header="Available" dataType="boolean" [editable]="true"></igx-column>

  <!-- Action strip: shows Edit and Delete buttons on row hover; Add Row button in toolbar -->
  <igx-action-strip>
    <igx-grid-editing-actions [addRow]="true"></igx-grid-editing-actions>
  </igx-action-strip>
</igx-grid>

<button (click)="addCar()">Add Car</button>
```

> **Key inputs summary:**
> - `[rowEditable]="true"` — enables the Done/Cancel overlay per row
> - `[editable]="true"` on each `igx-column` — marks which fields the user can change
> - `[primaryKey]`— **required** for editing to work
> - `[autoGenerate]="false"` — always define columns explicitly when editing is enabled so you control which fields are editable
> - `<igx-action-strip>` with `<igx-grid-editing-actions>` — adds hover Edit/Delete buttons and an optional Add Row button automatically

### Programmatic Row Adding with Default Values

When starting a new row programmatically, pre-populate fields using `(cellEditEnter)` on the new row:

```typescript
onCellEditEnter(event: IGridEditEventArgs) {
  if (event.isAddRow && event.column.field === 'available') {
    event.cellEditArgs.newValue = true; // default new cars to available
  }
  if (event.isAddRow && event.column.field === 'year') {
    event.cellEditArgs.newValue = new Date().getFullYear();
  }
}
```

```html
<igx-grid #grid ... (cellEditEnter)="onCellEditEnter($event)">
```

---

## Batch Editing & Transactions

> **Docs:** [Batch Editing](https://www.infragistics.com/products/ignite-ui-angular/angular/components/grid/batch-editing) (substitute URL prefix per grid type)

> **Applies to**: Flat Grid, Tree Grid, and Hierarchical Grid. **Pivot Grid does NOT support batch editing.**
> Use batch editing when users need to **edit many rows at once** and commit or discard all changes together, with undo/redo support.

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
// Flat Grid / Hierarchical Grid:
this.gridRef().beginAddRowByIndex(0);                // at top
this.gridRef().beginAddRowById('ALFKI');             // under a specific row
this.gridRef().beginAddRowByIndex(this.gridRef().data.length); // at end

// Tree Grid — add as child of a parent:
this.treeGridRef().addRow(newRowData, parentRowID);  // add row as child of parentRowID
this.treeGridRef().beginAddRowByIndex(3, true);      // add as child of row at index 3
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

> **Docs:** [Validation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/grid/validation)

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

> **Docs:** [Summaries](https://www.infragistics.com/products/ignite-ui-angular/angular/components/grid/summaries) (substitute URL prefix per grid type)

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

> **Docs:** [State Persistence](https://www.infragistics.com/products/ignite-ui-angular/angular/components/grid/state-persistence) (substitute URL prefix per grid type)

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

## Tree Grid Data Operations

> **Docs:** [Tree Grid](https://www.infragistics.com/products/ignite-ui-angular/angular/components/treegrid/tree-grid) · [Load on Demand](https://www.infragistics.com/products/ignite-ui-angular/angular/components/treegrid/load-on-demand)

### Recursive Filtering Behavior

Tree Grid filtering is **inclusive** — when a child matches, all its ancestors are kept visible (marked as `isFilteredOutParent`) and auto-expanded. This is the default `TreeGridFilteringStrategy`.

```html
<igx-tree-grid #treeGrid
  [data]="employees()"
  [primaryKey]="'id'"
  [foreignKey]="'managerId'"
  [allowFiltering]="true"
  [filterMode]="'excelStyleFilter'"
  height="600px">
  <igx-column field="name" [filterable]="true" [sortable]="true"></igx-column>
  <igx-column field="title" [filterable]="true"></igx-column>
</igx-tree-grid>
```

When you filter for `title = 'Developer'`, all ancestor rows are shown even though they don't match, and they're auto-expanded so you can see the matching children in context.

### Per-Level Sorting

Tree Grid sorting is applied **within each parent level** — children are sorted among siblings, not globally flattened:

```typescript
// This sorts employees within their respective manager, not globally
this.treeGridRef().sort({ fieldName: 'name', dir: SortingDirection.Asc, ignoreCase: true });
```

### Tree Grid Batch Editing

Tree Grid uses `HierarchicalTransactionService` — each transaction carries a `path` array tracing the parent hierarchy, enabling proper undo/redo of nested changes:

```html
<igx-tree-grid #treeGrid
  [data]="employees()"
  [primaryKey]="'id'"
  [foreignKey]="'managerId'"
  [batchEditing]="true"
  [rowEditable]="true"
  height="600px">
  <igx-column field="name" [editable]="true"></igx-column>
</igx-tree-grid>
```

```typescript
// Add a row as child of a specific parent
this.treeGridRef().addRow({ id: 100, name: 'New Employee', managerId: 2 }, 2);

// Cascade delete — deleting a parent removes all descendants (default behavior)
this.treeGridRef().deleteRow(2); // deletes row 2 and all its children
```

## Hierarchical Grid Data Operations

> **Docs:** [Hierarchical Grid](https://www.infragistics.com/products/ignite-ui-angular/angular/components/hierarchicalgrid/hierarchical-grid) · [Load on Demand](https://www.infragistics.com/products/ignite-ui-angular/angular/components/hierarchicalgrid/load-on-demand)

### Independent Grid Levels

Each level of a hierarchical grid has its **own independent** sorting, filtering, and paging state. Configure features on the `<igx-row-island>` blueprint:

```html
<igx-hierarchical-grid #hGrid
  [data]="companies()"
  [primaryKey]="'id'"
  [allowFiltering]="true"
  [filterMode]="'excelStyleFilter'"
  height="600px">

  <igx-column field="name" [sortable]="true" [filterable]="true"></igx-column>

  <!-- Each row island defines column/feature config for that level -->
  <igx-row-island [key]="'orders'" [primaryKey]="'orderId'" [allowFiltering]="true" [rowEditable]="true">
    <igx-column field="orderId" [sortable]="true" [filterable]="true"></igx-column>
    <igx-column field="amount" dataType="number" [editable]="true"></igx-column>

    <igx-paginator [perPage]="10"></igx-paginator>
  </igx-row-island>
</igx-hierarchical-grid>
```

### Accessing Child Grid Instances

To perform programmatic operations on child grids, use the `(gridCreated)` event:

```typescript
onChildGridCreated(event: IGridCreatedEventArgs) {
  const childGrid = event.grid;
  // Example: apply a default sort to all child grids
  childGrid.sort({ fieldName: 'orderId', dir: SortingDirection.Desc, ignoreCase: false });
}
```

```html
<igx-row-island [key]="'orders'" (gridCreated)="onChildGridCreated($event)">
  <igx-column field="orderId" [sortable]="true"></igx-column>
</igx-row-island>
```

### Batch Editing Propagation

Setting `[batchEditing]="true"` on the root hierarchical grid automatically propagates to all child grids:

```html
<igx-hierarchical-grid #hGrid
  [data]="companies()"
  [primaryKey]="'id'"
  [batchEditing]="true"
  [rowEditable]="true">
  <!-- All child grids inherit batchEditing automatically -->
  <igx-row-island [key]="'departments'" [primaryKey]="'deptId'" [rowEditable]="true">
    <igx-column field="name" [editable]="true"></igx-column>
  </igx-row-island>
</igx-hierarchical-grid>
```

> **NOTE**: Each child grid instance has its **own** `TransactionService`. Commits must be done per grid instance.

## Pivot Grid Data Operations

> **Docs:** [Pivot Grid](https://www.infragistics.com/products/ignite-ui-angular/angular/components/pivotGrid/pivot-grid)

> **IMPORTANT**: The Pivot Grid does NOT use standard sorting, filtering, editing, or paging APIs. All data operations are controlled through `pivotConfiguration`.

### Dimension-Based Filtering

```typescript
import { FilteringExpressionsTree, FilteringLogic, IgxStringFilteringOperand } from 'igniteui-angular/grids/core';

// Create a filter for a dimension
const regionFilter = new FilteringExpressionsTree(FilteringLogic.Or);
regionFilter.filteringOperands = [
  {
    fieldName: 'Region',
    condition: IgxStringFilteringOperand.instance().condition('equals'),
    searchVal: 'North America'
  },
  {
    fieldName: 'Region',
    condition: IgxStringFilteringOperand.instance().condition('equals'),
    searchVal: 'Europe'
  }
];

// Apply the filter to a dimension
this.pivotConfig.filters[0].filter = regionFilter;
// Notify the grid of the change
this.pivotGridRef().pipeTrigger++;
```

### Dimension-Based Sorting

```typescript
// Sort a row dimension
this.pivotConfig.rows[0].sortDirection = SortingDirection.Desc;
this.pivotGridRef().pipeTrigger++;
```

### Key Pivot Grid Limitations

- No cell/row editing, batch editing, or row adding
- No paging
- No column pinning, moving, or hiding (columns are auto-generated)
- No row dragging
- No standard filtering (`allowFiltering` is forced to `false`)
- No GroupBy (grouping is inherent via dimensions)
- State persistence serializes the full `pivotConfiguration`

## Grid Lite Data Operations

**Grid Lite** is a lightweight, open-source (MIT licensed) Web Component grid with an Angular wrapper. It supports **sorting and filtering only** — no editing, grouping, paging, summaries, selection, or export. Its API is **different from** the Flat/Tree/Hierarchical Grid APIs.

> **IMPORTANT**: Grid Lite uses `IgxGridLiteSortingExpression` and `IgxGridLiteFilteringExpression` — NOT `ISortingExpression` or `FilteringExpressionsTree` from the enterprise grids.

### Grid Lite Sorting

```typescript
import {
  IgxGridLiteComponent,
  IgxGridLiteSortingExpression,
  IgxGridLiteSortingOptions
} from 'igniteui-angular/grids/lite';

@Component({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  // ...
})
export class GridLiteSortExample {
  gridRef = viewChild<IgxGridLiteComponent<Product>>('grid');

  // Sorting options: mode can be 'single' or 'multiple'
  sortingOptions: IgxGridLiteSortingOptions = { mode: 'multiple' };

  // Initial sort state
  sortExprs: IgxGridLiteSortingExpression[] = [
    { key: 'name', direction: 'ascending' }
  ];

  sortByPrice() {
    // Sort programmatically (single expression or array)
    this.gridRef().sort({ key: 'price', direction: 'descending' });
  }

  clearAllSorts() {
    this.gridRef().clearSort(); // clear all
    // or: this.gridRef().clearSort('price'); // clear specific column
  }
}
```

```html
<igx-grid-lite #grid
  [data]="data"
  [sortingOptions]="sortingOptions"
  [(sortingExpressions)]="sortExprs"
  (sorting)="onSorting($event)"
  (sorted)="onSorted($event)">
  <igx-grid-lite-column field="name" header="Name" sortable></igx-grid-lite-column>
  <igx-grid-lite-column field="price" header="Price" dataType="number" sortable></igx-grid-lite-column>
</igx-grid-lite>
```

Sort expression shape: `{ key: string, direction: 'ascending' | 'descending' | 'none' }`

Sorting modes:
- `'single'` — only one column sorted at a time
- `'multiple'` — multi-column sorting
- `triState: true` — allows cycling through ascending → descending → none

### Grid Lite Filtering

```typescript
import {
  IgxGridLiteComponent,
  IgxGridLiteFilteringExpression
} from 'igniteui-angular/grids/lite';

// Filter expression shape
const filters: IgxGridLiteFilteringExpression[] = [
  { key: 'price', condition: 'greaterThan', searchTerm: 100 },
  { key: 'name', condition: 'contains', searchTerm: 'Widget' }
];

// Programmatic filtering
this.gridRef().filter({ key: 'price', condition: 'greaterThan', searchTerm: 100 });
this.gridRef().clearFilter('price');
this.gridRef().clearFilter(); // clear all
```

```html
<igx-grid-lite #grid
  [data]="data"
  [(filteringExpressions)]="filterExprs"
  (filtering)="onFiltering($event)"
  (filtered)="onFiltered($event)">
  <igx-grid-lite-column field="name" header="Name" filterable></igx-grid-lite-column>
  <igx-grid-lite-column field="price" header="Price" dataType="number" filterable></igx-grid-lite-column>
</igx-grid-lite>
```

Filter expression shape: `{ key: string, condition: string, searchTerm: any, criteria?: any[], caseSensitive?: boolean }`

Filter conditions depend on `dataType`:
- **string**: `contains`, `startsWith`, `endsWith`, `equals`, `doesNotContain`, `doesNotEqual`, `empty`, `notEmpty`, `null`, `notNull`
- **number**: `equals`, `doesNotEqual`, `greaterThan`, `lessThan`, `greaterThanOrEqualTo`, `lessThanOrEqualTo`, `empty`, `notEmpty`, `null`, `notNull`
- **boolean**: `all`, `true`, `false`, `empty`, `notEmpty`, `null`, `notNull`
- **date**: `equals`, `doesNotEqual`, `before`, `after`, `today`, `yesterday`, `thisMonth`, `lastMonth`, `nextMonth`, `thisYear`, `lastYear`, `nextYear`, `empty`, `notEmpty`, `null`, `notNull`

### Grid Lite Remote Data Operations

Grid Lite uses `dataPipelineConfiguration` — a callback-based approach (NOT noop strategies):

```typescript
import { IgxGridLiteDataPipelineConfiguration } from 'igniteui-angular/grids/lite';

dataPipeline: IgxGridLiteDataPipelineConfiguration<Product> = {
  sort: async (params) => {
    // params.grid — the grid instance
    // params.data — current data array
    // params.type — 'sort'
    const result = await fetch(`/api/products?sort=${JSON.stringify(params.grid.sortingExpressions)}`);
    return await result.json();
  },
  filter: async (params) => {
    const result = await fetch(`/api/products?filter=${JSON.stringify(params.grid.filteringExpressions)}`);
    return await result.json();
  }
};
```

```html
<igx-grid-lite #grid
  [data]="data"
  [dataPipelineConfiguration]="dataPipeline">
</igx-grid-lite>
```

Callbacks can be synchronous (return `T[]`) or asynchronous (return `Promise<T[]>`). When a `dataPipelineConfiguration` callback is provided for a given operation, the client-side pipeline for that operation is bypassed entirely.

### Grid Lite Events

| Event | Cancelable | Payload |
|---|---|---|
| `(sorting)` | Yes (`event.detail.cancel = true`) | Sorting expression about to be applied |
| `(sorted)` | No | Sorting completed |
| `(filtering)` | Yes (`event.detail.cancel = true`) | Filter expression about to be applied |
| `(filtered)` | No | Filtering completed |

### Grid Lite Limitations (No Data Operations)

These data operations are **NOT available** in Grid Lite:
- Editing (cell, row, batch) — no `[editable]`, no `beginEdit()`, no transactions
- Grouping — no `groupBy()`, no `IgxGroupByRow`
- Paging — no `IgxPaginatorComponent`
- Summaries — no `IgxSummaryOperand`
- Selection — no `rowSelection`, `cellSelection`, or `columnSelection`
- State persistence — no `IgxGridStateDirective`
- Export — no `IgxExcelExporterService` or `IgxCsvExporterService`
- Advanced filtering — no `advancedFilteringExpressionsTree`

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

1. **Choose the right editing mode** — cell editing (`[editable]` + `(cellEditDone)`) for immediate per-cell saves; row editing (`[rowEditable]="true"` + `(rowEditDone)`) for confirm/cancel per row (**recommended default for CRUD**); batch editing (`[batchEditing]="true"`) for accumulate-then-commit with undo/redo
2. **`[primaryKey]` is required for all editing** — row editing, batch editing, row adding, and row deletion all depend on it (Flat, Tree, Hierarchical, Pivot grids; NOT Grid Lite)
3. **Always set `[autoGenerate]="false"` when editing** — define columns explicitly and mark each with `[editable]="true"` to control exactly what users can change
4. **Use the correct component type for `viewChild`** — `IgxGridLiteComponent`, `IgxGridComponent`, `IgxTreeGridComponent`, `IgxHierarchicalGridComponent`, or `IgxPivotGridComponent`
5. **Import the correct directives/components** — `IGX_GRID_DIRECTIVES`, `IGX_TREE_GRID_DIRECTIVES`, `IGX_HIERARCHICAL_GRID_DIRECTIVES`, `IGX_PIVOT_GRID_DIRECTIVES`, or individual Grid Lite imports (with `CUSTOM_ELEMENTS_SCHEMA`)
6. **Set `dataType` on every column** — enables correct filtering operands, sorting behavior, and editors
7. **Cancelable events** — use `event.cancel = true` in `(sorting)`, `(filtering)`, `(cellEdit)`, `(rowEdit)`, `(paging)` to prevent the action
8. **Use signals for data** — `[data]="myData()"` with `signal<T[]>([])`
9. **Remote data requires `[totalItemCount]`** — without it, the virtual scrollbar won't size correctly
10. **Remote data requires noop strategies** — apply `NoopSortingStrategy` and `NoopFilteringStrategy` to disable client-side operations when the server handles them
11. **Track sort/filter state for remote operations** — store current expressions and include them in every server request
12. **Batch editing requires `[primaryKey]`** — call `endEdit(true)` before `transactions.undo()`/`redo()`, commit via `transactions.commit(data)`
13. **Virtualization is automatic** — don't wrap grids in virtual scroll containers; just set a fixed `height`
14. **Debounce rapid virtual scroll** — use `debounceTime` on `(dataPreLoad)` to avoid flooding the server
15. **State persistence** — use `IgxGridStateDirective` to save/restore sort, filter, group, and column configuration; functions (formatters, strategies, summaries) must be reapplied via `stateParsed` event
16. **Use `filteringExpressionsTree` for programmatic filtering** — `advancedFilteringExpressionsTree` is only for the advanced filtering dialog
17. **Validation** — use template-driven validators on columns (`required`, `min`, `max`, `email`, `pattern`) or reactive validators via `(formGroupCreated)`
18. **GroupBy is Flat Grid only** — Tree Grid uses hierarchy, Hierarchical Grid uses row islands, Pivot Grid uses dimensions
19. **Tree Grid filtering is recursive** — parents of matching children are always shown and auto-expanded
20. **Hierarchical Grid levels are independent** — sorting/filtering/paging don't cascade; configure on `<igx-row-island>`
21. **Pivot Grid is read-only** — no editing, paging, or standard filtering/sorting; use `pivotConfiguration` for all data operations
22. **Grid Lite has its own API** — uses `IgxGridLiteSortingExpression`/`IgxGridLiteFilteringExpression` (NOT `ISortingExpression`/`FilteringExpressionsTree`), `dataPipelineConfiguration` for remote ops (NOT noop strategies), and has no editing, grouping, paging, summaries, or selection
````
