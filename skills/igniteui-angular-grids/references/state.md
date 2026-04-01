# Grid State Persistence & Grid-Type-Specific Operations

> **Part of the [`igniteui-angular-grids`](../SKILL.md) skill hub.**
> For grid import patterns and `viewChild` access — see [`data-operations.md`](./data-operations.md).
> For Tree Grid / Hierarchical Grid / Pivot Grid / Grid Lite setup — see [`types.md`](./types.md).
> For paging and remote data — see [`paging-remote.md`](./paging-remote.md).

## Contents

- [State Persistence](#state-persistence)
- [Tree Grid Data Operations](#tree-grid-data-operations)
- [Hierarchical Grid Data Operations](#hierarchical-grid-data-operations)
- [Pivot Grid Data Operations](#pivot-grid-data-operations)
- [Grid Lite Data Operations](#grid-lite-data-operations)
- [Key Rules](#key-rules)

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
import { IgxGridStateDirective } from 'igniteui-angular/grids/core';

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
import { FilteringExpressionsTree, FilteringLogic, IgxStringFilteringOperand } from 'igniteui-angular/core';

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

> **Grid Lite sorting, filtering, remote data, events, and limitations are fully documented in [`types.md`](./types.md#grid-lite).** Refer to that file for all Grid Lite data operations — this section intentionally avoids duplicating that content.
>
> Key differences from Flat/Tree/Hierarchical Grid APIs:
> - Uses `IgxGridLiteSortingExpression` / `IgxGridLiteFilteringExpression` (NOT `ISortingExpression` / `FilteringExpressionsTree`)
> - Uses `dataPipelineConfiguration` for remote ops (NOT noop strategies + events)
> - Has no editing, grouping, paging, summaries, selection, state persistence, or export

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
