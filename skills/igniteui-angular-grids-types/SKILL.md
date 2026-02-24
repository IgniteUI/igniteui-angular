---
name: igniteui-angular-grids-types
description: Tree Grid, Hierarchical Grid, Grid Lite, and Pivot Grid specifics for Ignite UI Angular
user-invokable: true
---

# Ignite UI for Angular — Grid Types Skill

## Description

This skill covers the specifics of each specialized Ignite UI for Angular grid type: Tree Grid (single-schema parent-child data), Hierarchical Grid (multi-schema master-detail data), Grid Lite (lightweight read-only display), and Pivot Grid (pivot table analytics).

> **Related Skill: Grid Setup & Configuration**
>
> For the grid type selection guide, shared column configuration, sorting, filtering, and selection — see the [`igniteui-angular-grids`](../igniteui-angular-grids/SKILL.md) skill.
> For editing, grouping, summaries, toolbar, export, and other features — see [`igniteui-angular-grids-features`](../igniteui-angular-grids-features/SKILL.md).

## Tree Grid

> **Docs:** [Tree Grid](https://www.infragistics.com/products/ignite-ui-angular/angular/components/treegrid/tree-grid)

For data with parent-child relationships **within a single schema** (e.g., org charts, file systems, categories).

### Two Data Binding Modes

**Mode 1: Flat data with foreign key** — rows reference their parent via a foreign key:

```typescript
import { Component, ChangeDetectionStrategy, signal, viewChild } from '@angular/core';
import { IgxTreeGridComponent, IGX_TREE_GRID_DIRECTIVES } from 'igniteui-angular/grids/tree-grid';

@Component({
  selector: 'app-org-tree',
  imports: [IGX_TREE_GRID_DIRECTIVES],
  templateUrl: './org-tree.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrgTreeComponent {
  treeGridRef = viewChild.required<IgxTreeGridComponent>('treeGrid');
  employees = signal<Employee[]>([
    { id: 1, name: 'CEO', managerId: -1, title: 'CEO' },
    { id: 2, name: 'VP Engineering', managerId: 1, title: 'VP' },
    { id: 3, name: 'Developer', managerId: 2, title: 'Dev' },
  ]);
}
```

```html
<igx-tree-grid #treeGrid
  [data]="employees()"
  [primaryKey]="'id'"
  [foreignKey]="'managerId'"
  [autoGenerate]="false"
  [rowSelection]="'multipleCascade'"
  height="600px">
  <igx-column field="name" header="Name" [sortable]="true"></igx-column>
  <igx-column field="title" header="Title"></igx-column>
</igx-tree-grid>
```

**Mode 2: Nested object data** — each row contains its children in an array property:

```html
<igx-tree-grid #treeGrid
  [data]="departments()"
  [primaryKey]="'id'"
  [childDataKey]="'children'"
  [autoGenerate]="false"
  height="600px">
  <igx-column field="name" header="Name"></igx-column>
  <igx-column field="headCount" header="Employees" dataType="number"></igx-column>
</igx-tree-grid>
```

### Tree Grid Unique Features

- **Cascade selection**: `[rowSelection]="'multipleCascade'"` — selecting a parent selects all children; indeterminate state propagates up
- **Cascade delete**: `[cascadeOnDelete]="true"` (default) — deleting a parent removes all descendants
- **Load on demand**: `[loadChildrenOnDemand]="loadChildren"` — lazy-load children when a row is expanded
- **Expansion depth**: `[expansionDepth]="2"` — control initial expansion level (`Infinity` by default)
- **Add child row**: `treeGridRef().addRow(data, parentRowID)` — add a row as a child of a specific parent

### Tree Grid Data Operation Behavior

- **Filtering is recursive**: when a child matches, its parent is always shown (even if the parent doesn't match). Matched parents are auto-expanded.
- **Sorting is per-level**: children are sorted within their parent, not globally flattened
- **Batch editing** uses `HierarchicalTransactionService` — transactions carry a `path` array tracing the parent hierarchy for proper undo/redo
- **Summaries** are computed per tree level

## Hierarchical Grid

> **Docs:** [Hierarchical Grid](https://www.infragistics.com/products/ignite-ui-angular/angular/components/hierarchicalgrid/hierarchical-grid)

For master-detail data where **each level has a different schema** (e.g., Companies → Departments → Employees). Each level is defined by a **Row Island** blueprint.

```typescript
import { Component, ChangeDetectionStrategy, signal, viewChild } from '@angular/core';
import { IgxHierarchicalGridComponent, IGX_HIERARCHICAL_GRID_DIRECTIVES } from 'igniteui-angular/grids/hierarchical-grid';

@Component({
  selector: 'app-company-grid',
  imports: [IGX_HIERARCHICAL_GRID_DIRECTIVES],
  templateUrl: './company-grid.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompanyGridComponent {
  hGridRef = viewChild.required<IgxHierarchicalGridComponent>('hGrid');
  companies = signal<Company[]>([]);
}
```

```html
<igx-hierarchical-grid #hGrid
  [data]="companies()"
  [primaryKey]="'id'"
  [autoGenerate]="false"
  height="600px">

  <igx-column field="name" header="Company"></igx-column>
  <igx-column field="industry" header="Industry"></igx-column>

  <igx-row-island [key]="'departments'" [autoGenerate]="false" [primaryKey]="'deptId'">
    <igx-column field="name" header="Department"></igx-column>
    <igx-column field="headCount" header="Employees" dataType="number"></igx-column>

    <igx-row-island [key]="'employees'" [autoGenerate]="false" [primaryKey]="'empId'">
      <igx-column field="name" header="Name"></igx-column>
      <igx-column field="role" header="Role"></igx-column>
    </igx-row-island>
  </igx-row-island>

</igx-hierarchical-grid>
```

### How Row Islands Work

- A `<igx-row-island>` defines the **blueprint** (columns, features, templates) for all child grids at that level
- The `[key]` property specifies which property of the parent row's data holds the child array
- Row islands can be **nested** — an `igx-row-island` can contain another for deeper levels
- Each expanded row creates a **full grid instance** — be aware of memory usage with very deep/wide hierarchies

### Accessing Child Grid Instances

Use the `(gridCreated)` event on the row island:

```html
<igx-row-island [key]="'orders'" (gridCreated)="onChildGridCreated($event)">
  <igx-column field="orderId" header="Order"></igx-column>
</igx-row-island>
```

```typescript
onChildGridCreated(event: IGridCreatedEventArgs) {
  const childGrid = event.grid;
  // Configure the child grid instance, load data, etc.
}
```

### Hierarchical Grid Data Operation Behavior

- **Sorting and filtering do NOT cascade** — each grid level is independent with its own state
- **Configure features on the row island** and all child grids at that level inherit them
- **Batch editing propagates**: setting `[batchEditing]="true"` on the root automatically enables it on all child grids
- **State persistence** recursively saves/restores state for each child grid instance, keyed by row island ID + parent row ID

## Grid Lite

The **lightest grid option** — an open-source (MIT licensed) Web Component with an Angular wrapper. Use it for **read-only data display** with sorting, filtering, column hiding/resizing, and row virtualization. It has **no editing, no selection, no paging, no grouping, no summaries, no export**.

> **When to recommend Grid Lite vs. Flat Grid**: If the user only needs to display data with basic sorting/filtering and doesn't need editing, batch operations, paging, grouping, summaries, or export, Grid Lite is the lighter, faster choice. If any of those enterprise features are needed, use the Flat Grid.

### Installation

Grid Lite requires a **separate npm package**:

```bash
npm install igniteui-grid-lite
```

### Setup

```typescript
import { Component, CUSTOM_ELEMENTS_SCHEMA, viewChild } from '@angular/core';
import {
  IgxGridLiteComponent,
  IgxGridLiteColumnComponent,
  IgxGridLiteCellTemplateDirective,
  IgxGridLiteHeaderTemplateDirective
} from 'igniteui-angular/grids/lite';

@Component({
  selector: 'app-users-lite',
  imports: [
    IgxGridLiteComponent,
    IgxGridLiteColumnComponent,
    IgxGridLiteCellTemplateDirective,
    IgxGridLiteHeaderTemplateDirective
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],  // Required — Grid Lite is a Web Component
  templateUrl: './users-lite.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsersLiteComponent {
  gridRef = viewChild<IgxGridLiteComponent<User>>('grid');
  data: User[] = [];
}
```

### Template

```html
<igx-grid-lite #grid
  [data]="data"
  [autoGenerate]="false"
  [sortingOptions]="{ mode: 'multiple' }">

  <igx-grid-lite-column
    field="name"
    dataType="string"
    header="Name"
    sortable
    filterable
    resizable>
  </igx-grid-lite-column>

  <igx-grid-lite-column
    field="age"
    dataType="number"
    header="Age"
    sortable
    filterable>
  </igx-grid-lite-column>

  <igx-grid-lite-column field="active" dataType="boolean" header="Active">
    <ng-template igxGridLiteCell let-value>
      <span>{{ value ? 'Yes' : 'No' }}</span>
    </ng-template>
  </igx-grid-lite-column>
</igx-grid-lite>
```

### Column Configuration

Columns use `<igx-grid-lite-column>` with these inputs:

| Input | Type | Description |
|---|---|---|
| `field` | `string` | Data property key (required) |
| `dataType` | `'string' \| 'number' \| 'boolean' \| 'date'` | Column data type |
| `header` | `string` | Header text |
| `width` | `string` | CSS width (e.g., `'250px'`) |
| `hidden` | `boolean` | Hide the column |
| `resizable` | `boolean` | Allow column resizing |
| `sortable` | `boolean` | Enable sorting |
| `filterable` | `boolean` | Enable filtering |
| `sortingCaseSensitive` | `boolean` | Case-sensitive sorting |
| `filteringCaseSensitive` | `boolean` | Case-sensitive filtering |

### Templates

Cell and header templates use dedicated directives:

```html
<igx-grid-lite-column field="status" header="Status">
  <!-- Custom cell template -->
  <ng-template igxGridLiteCell let-value let-row="row" let-column="column">
    <span [class]="value">{{ value }}</span>
  </ng-template>

  <!-- Custom header template -->
  <ng-template igxGridLiteHeader let-column>
    <strong>{{ column.header }}</strong>
  </ng-template>
</igx-grid-lite-column>
```

### Sorting & Filtering API

```typescript
// Sort programmatically
this.gridRef().sort({ key: 'name', direction: 'ascending' });
this.gridRef().sort([
  { key: 'name', direction: 'ascending' },
  { key: 'age', direction: 'descending' }
]);
this.gridRef().clearSort('name');
this.gridRef().clearSort(); // clear all

// Filter programmatically
this.gridRef().filter({ key: 'age', condition: 'greaterThan', searchTerm: 21 });
this.gridRef().clearFilter('age');
this.gridRef().clearFilter(); // clear all
```

### Two-Way Binding for Sort/Filter State

```html
<igx-grid-lite #grid
  [data]="data"
  [(sortingExpressions)]="sortExprs"
  [(filteringExpressions)]="filterExprs"
  (sorting)="onSorting($event)"
  (sorted)="onSorted($event)"
  (filtering)="onFiltering($event)"
  (filtered)="onFiltered($event)">
</igx-grid-lite>
```

Events: `(sorting)` (cancelable), `(sorted)`, `(filtering)` (cancelable), `(filtered)`.

### Remote Data Operations

Use `dataPipelineConfiguration` to intercept sort/filter and delegate to the server:

```typescript
import { IgxGridLiteDataPipelineConfiguration } from 'igniteui-angular/grids/lite';

dataPipeline: IgxGridLiteDataPipelineConfiguration<Product> = {
  sort: async (params) => {
    // params.grid — the grid instance
    // params.data — current data
    // params.type — 'sort'
    const sorted = await this.dataService.sortRemote(params.grid.sortingExpressions);
    return sorted;
  },
  filter: async (params) => {
    const filtered = await this.dataService.filterRemote(params.grid.filteringExpressions);
    return filtered;
  }
};
```

```html
<igx-grid-lite #grid
  [data]="data"
  [dataPipelineConfiguration]="dataPipeline">
</igx-grid-lite>
```

### Grid Lite Key Differences from Flat Grid

- **Separate package**: `npm install igniteui-grid-lite`
- **Requires `CUSTOM_ELEMENTS_SCHEMA`** in the component's `schemas`
- **No directives bundle** — import `IgxGridLiteComponent`, `IgxGridLiteColumnComponent`, and template directives individually
- **No `[primaryKey]`** — not needed (no editing, selection, or row operations)
- **No editing** of any kind (cell, row, batch)
- **No selection** (row, cell, column)
- **No paging, grouping, summaries, pinning, moving, export**
- **Column config differs**: uses `field` (not `field` on `<igx-column>`), `sortable`/`filterable` are boolean attributes
- **Remote data**: uses `dataPipelineConfiguration` (async callback) instead of noop strategies + events

## Pivot Grid

> **Docs:** [Pivot Grid](https://www.infragistics.com/products/ignite-ui-angular/angular/components/pivotGrid/pivot-grid)

For **pivot table analytics** where users reshape data by dragging dimensions between rows, columns, filters, and values.

> **IMPORTANT**: The Pivot Grid is fundamentally different from the other three grids. Standard grid features like cell editing, row editing, batch editing, paging, column pinning, column moving, row dragging, and standard filtering/sorting are **disabled**. All data operations are driven by the `pivotConfiguration`.

```typescript
import { Component, ChangeDetectionStrategy, signal, viewChild } from '@angular/core';
import { IgxPivotGridComponent, IGX_PIVOT_GRID_DIRECTIVES } from 'igniteui-angular/grids/pivot-grid';
import { IPivotConfiguration, IgxPivotNumericAggregate } from 'igniteui-angular/grids/pivot-grid';

@Component({
  selector: 'app-sales-pivot',
  imports: [IGX_PIVOT_GRID_DIRECTIVES],
  templateUrl: './sales-pivot.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SalesPivotComponent {
  pivotGridRef = viewChild.required<IgxPivotGridComponent>('pivotGrid');
  salesData = signal<Sale[]>([]);

  pivotConfig: IPivotConfiguration = {
    columns: [{ memberName: 'Quarter', enabled: true }],
    rows: [{ memberName: 'Region', enabled: true }],
    values: [{
      member: 'Revenue',
      aggregate: { aggregator: IgxPivotNumericAggregate.sum, key: 'SUM', label: 'Sum' },
      enabled: true
    }],
    filters: [{ memberName: 'Year', enabled: true }]
  };
}
```

```html
<igx-pivot-grid #pivotGrid
  [data]="salesData()"
  [pivotConfiguration]="pivotConfig"
  height="600px">
</igx-pivot-grid>
```

### Pivot Data Selector

Provide a drag-and-drop UI for users to reshape the pivot interactively:

```html
<igx-pivot-data-selector [grid]="pivotGridRef()"></igx-pivot-data-selector>
<igx-pivot-grid #pivotGrid [data]="salesData()" [pivotConfiguration]="pivotConfig"></igx-pivot-grid>
```

### Pivot Grid Data Operations

- **Filtering**: Per-dimension only — set the `filter` property on an `IPivotDimension`, NOT `[allowFiltering]`
- **Sorting**: Per-dimension only — set `sortable: true` and `sortDirection` on an `IPivotDimension`
- **Aggregation**: Configured via `IPivotValue.aggregate` (e.g., `IgxPivotNumericAggregate.sum`, `.average`, `.min`, `.max`, `.count`)
- **Columns are auto-generated** from the pivot configuration — do not define `<igx-column>` manually
- **State persistence**: Serializes the entire `pivotConfiguration` (dimensions, values, filters)

## Key Rules

1. **Tree Grid**: use `[primaryKey]` + `[foreignKey]` for flat data or `[childDataKey]` for nested objects; filtering is recursive (parents of matching children are always shown)
2. **Hierarchical Grid**: sorting/filtering/paging are independent per level; configure features on the `<igx-row-island>` blueprint
3. **Pivot Grid is read-only** — editing, paging, pinning, column moving, row dragging are all disabled; use `pivotConfiguration` for all data operations
4. **Grid Lite requires `CUSTOM_ELEMENTS_SCHEMA`** and `igniteui-grid-lite` npm package — it has no editing, selection, paging, or export

## Related Skills

- **[Grid Setup & Configuration](../igniteui-angular-grids/SKILL.md)** — Grid type selection guide, column config, sorting, filtering, selection
- **[Grid Features](../igniteui-angular-grids-features/SKILL.md)** — Editing, grouping, summaries, toolbar, export
- **[Grid Data Operations](../igniteui-angular-grid-data-operations/SKILL.md)** — Sorting/filtering/grouping patterns per grid type
- **[Grid State](../igniteui-angular-grid-state/SKILL.md)** — State persistence and grid-type-specific data operations
- **[Theming](../igniteui-angular-theming/SKILL.md)** — Grid styling and theming
- **[Components](../igniteui-angular-components/SKILL.md)** — Non-grid Ignite UI components
