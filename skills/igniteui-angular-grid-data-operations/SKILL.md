---
name: igniteui-angular-grid-data-operations
description: "Sorting, filtering, grouping, and canonical grid import patterns for Ignite UI Angular grids. Use when users ask to sort, filter, or group grid data programmatically or via the template, work with sorting/filtering expressions, import a grid component, or access a grid instance with viewChild."
user-invokable: true
---

# Ignite UI for Angular — Grid Sorting, Filtering & Grouping

## Description

This skill teaches AI agents how to implement **sorting, filtering, and grouping** with Ignite UI for Angular grids. It also provides the **canonical grid import patterns** and grid instance access that all sibling grid skills reference.

> **When to use this skill vs. the Data Grids skill**
>
> | Skill | Focus |
> |---|---|
> | **Data Grids** (`igniteui-angular-grids`) | Grid structure — choosing a grid type, column configuration, templates, layout, selection, toolbar, export |
> | **Grid Data Operations** (this skill) | Sorting, filtering, grouping, and canonical grid import patterns |
> | **Grid Paging & Remote** (`igniteui-angular-grid-paging-remote`) | Paging, remote data operations, virtualization, multi-grid coordination |
> | **Grid Editing** (`igniteui-angular-grid-editing`) | Cell editing, row editing, batch editing, validation, summaries |
> | **Grid State** (`igniteui-angular-grid-state`) | State persistence, Tree Grid / Hierarchical Grid / Pivot Grid / Grid Lite data operations |
>
> If the user's question is about *what* to render (columns, templates, grid type), use the Data Grids skill. If it's about *how data flows* (sorting, filtering, remote services, transactions), use this skill and its siblings.

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
  primaryKey="id"
  foreignKey="managerId"
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
  primaryKey="id"
  height="600px">
  <igx-column field="name" [sortable]="true"></igx-column>
  <igx-row-island key="orders" primaryKey="orderId">
    <igx-column field="orderId" [sortable]="true"></igx-column>
  </igx-row-island>
</igx-hierarchical-grid>
```

> **CRITICAL**: Every programmatic example in this skill uses Flat Grid (`IgxGridComponent`) by default. For Tree Grid substitute `IgxTreeGridComponent` and `#treeGrid`. For Hierarchical Grid substitute `IgxHierarchicalGridComponent` and `#hGrid`. The sorting, filtering, and editing APIs are either the same or very similar across all three grid types (Flat, Tree, Hierarchical). **Pivot Grid does NOT support standard sorting/filtering/editing APIs** — see the [Grid State skill](../igniteui-angular-grid-state/SKILL.md). **Grid Lite has its own lightweight sorting/filtering API** — see the [Grid State skill](../igniteui-angular-grid-state/SKILL.md).

## Sorting

> **Docs:** [Sorting](https://www.infragistics.com/products/ignite-ui-angular/angular/components/grid/sorting) · [Tree Grid](https://www.infragistics.com/products/ignite-ui-angular/angular/components/treegrid/sorting) · [Hierarchical Grid](https://www.infragistics.com/products/ignite-ui-angular/angular/components/hierarchicalgrid/sorting)

> **Applies to**: Flat Grid, Tree Grid, and Hierarchical Grid. Pivot Grid uses dimension-level sorting instead (see [Grid State skill](../igniteui-angular-grid-state/SKILL.md)). **Grid Lite** uses a different sorting API — see the [Grid State skill](../igniteui-angular-grid-state/SKILL.md).
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
  [sortingOptions]="{ mode: 'single' }">
  <igx-column field="name" [sortable]="true"></igx-column>
  <igx-column field="date" dataType="date" [sortable]="true"></igx-column>
  <igx-column field="amount" dataType="number" [sortable]="true"></igx-column>
</igx-grid>
```

Sorting modes:
- `'multiple'` — multi-column sorting in order (default)
- `'single'` — only one column sorted at a time

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

> **Applies to**: Flat Grid, Tree Grid, and Hierarchical Grid. Pivot Grid uses dimension-level filtering instead (see [Grid State skill](../igniteui-angular-grid-state/SKILL.md)). **Grid Lite** uses a different filtering API — see the [Grid State skill](../igniteui-angular-grid-state/SKILL.md).
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
| `(filteringDone)` | No | `IFilteringEventArgs` — fires after a **column-level** filter is applied |
| `(filteringExpressionsTreeChange)` | No | `IFilteringExpressionsTree` — fires after the **grid-level** filter tree changes (use this for remote data) |

```typescript
onFilteringDone(event: IFilteringEventArgs) {
  // Trigger remote data fetch with new filter state
  this.loadFilteredData();
}
```

> **Remote data note:** For remote filtering, subscribe to `(filteringExpressionsTreeChange)` instead of `(filteringDone)`. The former reflects the complete grid-level filter tree, including "clear all filters" — `filteringDone` is column-scoped and can miss global state changes.

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

## Key Rules

1. **Use the correct component type for `viewChild`** — `IgxGridLiteComponent`, `IgxGridComponent`, `IgxTreeGridComponent`, `IgxHierarchicalGridComponent`, or `IgxPivotGridComponent`
2. **Import the correct directives/components** — `IGX_GRID_DIRECTIVES`, `IGX_TREE_GRID_DIRECTIVES`, `IGX_HIERARCHICAL_GRID_DIRECTIVES`, `IGX_PIVOT_GRID_DIRECTIVES`, or individual Grid Lite imports (with `CUSTOM_ELEMENTS_SCHEMA`)
3. **Set `dataType` on every column** — enables correct filtering operands, sorting behavior, and editors
4. **Cancelable events** — use `event.cancel = true` in `(sorting)`, `(filtering)` to prevent the action
5. **Use signals for data** — `[data]="myData()"` with `signal<T[]>([])`
6. **GroupBy is Flat Grid only** — Tree Grid uses hierarchy, Hierarchical Grid uses row islands, Pivot Grid uses dimensions
7. **Tree Grid filtering is recursive** — parents of matching children are always shown and auto-expanded
8. **Hierarchical Grid levels are independent** — sorting/filtering don't cascade; configure on `<igx-row-island>`
9. **Use `filteringExpressionsTree` for programmatic filtering** — `advancedFilteringExpressionsTree` is only for the advanced filtering dialog

## Related Skills

- [`igniteui-angular-grid-paging-remote`](../igniteui-angular-grid-paging-remote/SKILL.md) — Paging, remote data operations, virtualization, and multi-grid coordination
- [`igniteui-angular-grid-editing`](../igniteui-angular-grid-editing/SKILL.md) — Cell editing, row editing, batch editing, validation, and summaries
- [`igniteui-angular-grid-state`](../igniteui-angular-grid-state/SKILL.md) — State persistence, Tree Grid / Hierarchical Grid / Pivot Grid / Grid Lite data operations
- [`igniteui-angular-grids`](../igniteui-angular-grids/SKILL.md) — Grid structure, column configuration, templates, layout, selection, toolbar, export
- [`igniteui-angular-components`](../igniteui-angular-components/SKILL.md) — Components & Layout
- [`igniteui-angular-theming`](../igniteui-angular-theming/SKILL.md) — Theming & Styling
