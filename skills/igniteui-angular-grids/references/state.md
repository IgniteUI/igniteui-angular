# Grid State Persistence & Grid-Type-Specific Operations

> **Part of the [`igniteui-angular-grids`](../SKILL.md) skill hub.**
> For grid import patterns and `viewChild` access — see [`data-operations.md`](./data-operations.md).
> For Tree Grid / Hierarchical Grid / Pivot Grid / Grid Lite setup — see [`types.md`](./types.md).
> For paging and remote data — see [`paging-remote.md`](./paging-remote.md).

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

## Key Rules

1. **State persistence** — use `IgxGridStateDirective` to save/restore sort, filter, group, and column configuration; functions (formatters, strategies, summaries) must be reapplied via `stateParsed` event
2. **Tree Grid filtering is recursive** — parents of matching children are always shown and auto-expanded
3. **Hierarchical Grid levels are independent** — sorting/filtering/paging don't cascade; configure on `<igx-row-island>`
4. **Pivot Grid is read-only** — no editing, paging, or standard filtering/sorting; use `pivotConfiguration` for all data operations
5. **Grid Lite has its own API** — uses `IgxGridLiteSortingExpression`/`IgxGridLiteFilteringExpression` (NOT `ISortingExpression`/`FilteringExpressionsTree`), `dataPipelineConfiguration` for remote ops (NOT noop strategies), and has no editing, grouping, paging, summaries, or selection
6. **Use the correct component type for `viewChild`** — `IgxGridLiteComponent`, `IgxGridComponent`, `IgxTreeGridComponent`, `IgxHierarchicalGridComponent`, or `IgxPivotGridComponent`
7. **Import the correct directives/components** — `IGX_GRID_DIRECTIVES`, `IGX_TREE_GRID_DIRECTIVES`, `IGX_HIERARCHICAL_GRID_DIRECTIVES`, `IGX_PIVOT_GRID_DIRECTIVES`, or individual Grid Lite imports (with `CUSTOM_ELEMENTS_SCHEMA`)
8. **Use signals for data** — `[data]="myData()"` with `signal<T[]>([])`

## See Also

- [`data-operations.md`](./data-operations.md) — Sorting, filtering, grouping, and canonical grid import patterns
- [`paging-remote.md`](./paging-remote.md) — Paging, remote data operations, virtualization
- [`editing.md`](./editing.md) — Cell editing, row editing, batch editing, validation, summaries
- [`structure.md`](./structure.md) — Grid structure, column configuration, templates, layout, selection
- [`../../igniteui-angular-components/SKILL.md`](../../igniteui-angular-components/SKILL.md) — Non-grid Ignite UI components
- [`../../igniteui-angular-theming/SKILL.md`](../../igniteui-angular-theming/SKILL.md) — Theming & Styling
