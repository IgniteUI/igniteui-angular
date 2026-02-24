---
name: igniteui-angular-grids
description: Grid structure, column configuration, sorting, filtering, and selection for Ignite UI Angular grids
user-invokable: true
---

# Ignite UI for Angular — Data Grids Skill

## Description

This skill teaches AI agents how to set up Ignite UI for Angular data grids, choose the right grid type, configure columns, and implement sorting, filtering, and selection. It covers the five grid types (Grid, Tree Grid, Hierarchical Grid, Grid Lite, Pivot Grid) at a high level with column configuration, data types, templates, and basic data operations.

> **Related Skills**
>
> This skill focuses on **grid structure** — choosing a grid type, configuring columns, templates, layout, sorting, filtering, and selection.
>
> - For **editing, grouping, summaries, toolbar, export**, and other grid features — see [`igniteui-angular-grids-features`](../igniteui-angular-grids-features/SKILL.md).
> - For **Tree Grid, Hierarchical Grid, Grid Lite, and Pivot Grid specifics** — see [`igniteui-angular-grids-types`](../igniteui-angular-grids-types/SKILL.md).
> - For **data manipulation patterns** — remote data binding, programmatic sorting/filtering/grouping, paging, batch editing workflows, state persistence, and wiring up services — see [`igniteui-angular-grid-data-operations`](../igniteui-angular-grid-data-operations/SKILL.md).
>
> If the user's question is about *what* to render, use this skill. If it's about *how data flows*, use the Data Operations skill.

## Prerequisites

- Angular 20+ project
- `igniteui-angular` installed, **or** `@infragistics/igniteui-angular` for licensed users — both packages share the same entry-point structure
- A theme applied (see the Theming skill)

## Choosing the Right Grid

Ignite UI has **five grid types**. Picking the correct one is the most important decision — each has different data structures, features, and constraints.

### Grid Selection Decision Guide

Ask these questions in order:

1. **Does the user need a lightweight, read-only data display** with sorting, filtering, and virtualization but no editing, selection, or paging? → **Grid Lite** (open-source, MIT licensed)
2. **Does the user need pivot-table analytics** (rows/columns/values/aggregations that users can drag-and-drop to reshape)? → **Pivot Grid**
3. **Does the data have parent-child relationships where each level has a DIFFERENT schema** (e.g., Companies → Departments → Employees)? → **Hierarchical Grid**
4. **Does the data have parent-child relationships within a SINGLE schema** (e.g., Employees with a `managerId` field, or nested children arrays)? → **Tree Grid**
5. **Is the data a flat list/table with enterprise features needed** (editing, batch editing, grouping, paging, export, etc.)? → **Flat Grid**

### Grid Types Overview

Entry points below use the `igniteui-angular` prefix. Replace with `@infragistics/igniteui-angular` for the licensed package.

| Grid | Selector | Component | Directives | Entry Point | Docs |
|---|---|---|---|---|---|
| **Grid Lite** | `igx-grid-lite` | `IgxGridLiteComponent` | Individual imports | `igniteui-angular/grids/lite` | — |
| **Flat Grid** | `igx-grid` | `IgxGridComponent` | `IGX_GRID_DIRECTIVES` | `igniteui-angular/grids/grid` | [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/grid/grid) |
| **Tree Grid** | `igx-tree-grid` | `IgxTreeGridComponent` | `IGX_TREE_GRID_DIRECTIVES` | `igniteui-angular/grids/tree-grid` | [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/treegrid/tree-grid) |
| **Hierarchical Grid** | `igx-hierarchical-grid` | `IgxHierarchicalGridComponent` | `IGX_HIERARCHICAL_GRID_DIRECTIVES` | `igniteui-angular/grids/hierarchical-grid` | [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/hierarchicalgrid/hierarchical-grid) |
| **Pivot Grid** | `igx-pivot-grid` | `IgxPivotGridComponent` | `IGX_PIVOT_GRID_DIRECTIVES` | `igniteui-angular/grids/pivot-grid` | [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/pivotGrid/pivot-grid) |

> **AGENT INSTRUCTION — Documentation URL Pattern**: For grid-specific topics (sorting, filtering, editing, paging, etc.), docs URLs follow this naming pattern per grid type:
> - Flat Grid: `.../components/grid/{topic}`
> - Tree Grid: `.../components/treegrid/{topic}`
> - Hierarchical Grid: `.../components/hierarchicalgrid/{topic}`
> - Pivot Grid: `.../components/pivotGrid/{topic}`
>
> Example: the sorting topic is `/grid/sorting`, `/treegrid/sorting`, `/hierarchicalgrid/sorting`, `/pivotGrid/sorting`. Docs links in the sections below use the Flat Grid URL; substitute the prefix above for the other grid types.

### Feature Availability per Grid Type

| Feature | Grid Lite | Flat Grid | Tree Grid | Hierarchical Grid | Pivot Grid |
|---|---|---|---|---|---|
| Column sorting | Yes | Yes | Yes (per-level) | Yes (per grid level) | Per-dimension only |
| Column filtering | Yes | Yes | Yes (recursive — keeps matching parents) | Yes (per grid level) | Per-dimension only |
| GroupBy | No | **Exclusive** | No (use tree hierarchy) | No | Inherent via dimensions |
| Paging | No | Yes | Yes | Yes (each level independent) | No |
| Batch editing | No | Yes | Yes (hierarchical transactions) | Yes (propagated from root) | No |
| Cell / Row editing | No | Yes | Yes | Yes (per grid level) | No |
| Row adding | No | Yes | Yes (with parent support) | Yes (per grid level) | No |
| Master-Detail | No | **Exclusive** | No | No (use row islands) | No |
| Row selection | No | Yes | Yes + `multipleCascade` | Yes (per grid level) | Limited |
| Load on demand | No | No | **Exclusive** | No | No |
| Column pinning / moving | No | Yes | Yes | Yes | No |
| Column hiding | Yes | Yes | Yes | Yes | No |
| Column resizing | Yes | Yes | Yes | Yes | No |
| Summaries | No | Yes | Yes (per-level) | Yes (per grid level) | Horizontal summaries only |
| State persistence | No | Yes | Yes | Yes + row island state | Pivot config serialization |
| Remote data ops | `dataPipelineConfiguration` | Events + noop strategies | Events + noop strategies | Events + noop strategies | N/A |
| Row virtualization | Yes | Yes (rows + columns) | Yes (rows + columns) | Yes (rows + columns) | Yes |

## Quick Start

> **Docs:** [Flat Grid](https://www.infragistics.com/products/ignite-ui-angular/angular/components/grid/grid) · [Tree Grid](https://www.infragistics.com/products/ignite-ui-angular/angular/components/treegrid/tree-grid) · [Hierarchical Grid](https://www.infragistics.com/products/ignite-ui-angular/angular/components/hierarchicalgrid/hierarchical-grid) · [Pivot Grid](https://www.infragistics.com/products/ignite-ui-angular/angular/components/pivotGrid/pivot-grid)

### Imports

> **AGENT INSTRUCTION:** Check `package.json` to determine whether the project uses `igniteui-angular` or `@infragistics/igniteui-angular`. Always import from the specific entry point of whichever package is installed. Never import from the root barrel of either package.

```typescript
// Open-source package — import from specific entry points
import { IgxGridComponent, IGX_GRID_DIRECTIVES } from 'igniteui-angular/grids/grid';

// Licensed package — same entry-point structure, different prefix
// import { IgxGridComponent, IGX_GRID_DIRECTIVES } from '@infragistics/igniteui-angular/grids/grid';

// AVOID — never import from the root barrel (wrong for BOTH variants)
// import { IgxGridComponent } from 'igniteui-angular';
// import { IgxGridComponent } from '@infragistics/igniteui-angular';

import { Component, ChangeDetectionStrategy, signal, viewChild } from '@angular/core';

@Component({
  selector: 'app-users-grid',
  imports: [IGX_GRID_DIRECTIVES],
  templateUrl: './users-grid.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsersGridComponent {
  // Signal-based view child — use #grid on the template element
  gridRef = viewChild.required<IgxGridComponent>('grid');

  protected users = signal<User[]>([]);
}
```

### Basic Grid

```html
<igx-grid #grid
  [data]="users()"
  [primaryKey]="'id'"
  [autoGenerate]="false"
  height="600px"
  width="100%">

  <igx-column field="id" header="ID" [hidden]="true"></igx-column>
  <igx-column field="name" header="Name" [sortable]="true" [filterable]="true" [resizable]="true"></igx-column>
  <igx-column field="email" header="Email" [sortable]="true" [filterable]="true"></igx-column>
  <igx-column field="role" header="Role" [groupable]="true" [filterable]="true"></igx-column>
  <igx-column field="salary" header="Salary" dataType="number" [hasSummary]="true"></igx-column>
  <igx-column field="hireDate" header="Hire Date" dataType="date" [sortable]="true"></igx-column>
  <igx-column field="active" header="Active" dataType="boolean"></igx-column>

</igx-grid>
```

## Column Configuration

> **Docs:** [Column Types](https://www.infragistics.com/products/ignite-ui-angular/angular/components/grid/column-types)

### Data Types

Set `dataType` to enable proper formatting, filtering, sorting, and editing:

| dataType | Behavior |
|---|---|
| `string` | Text input, string filtering |
| `number` | Numeric input, number filtering, number summaries |
| `boolean` | Checkbox editor, boolean filtering |
| `date` | Date picker editor, date filtering |
| `dateTime` | Date+time editor |
| `time` | Time picker editor |
| `currency` | Currency formatting, number filtering |
| `percent` | Percentage formatting |
| `image` | Image rendering (read-only) |

### Column Templates

> **Docs:** [Column Configuration](https://www.infragistics.com/products/ignite-ui-angular/angular/components/grid/grid#angular-grid-column-configuration)

Override default rendering with template directives:

```html
<igx-column field="status" header="Status">
  <!-- Custom cell template -->
  <ng-template igxCell let-cell="cell">
    <igx-badge [type]="cell.value === 'Active' ? 'success' : 'error'">
      {{ cell.value }}
    </igx-badge>
  </ng-template>

  <!-- Custom header template -->
  <ng-template igxHeader let-column>
    <igx-icon>verified</igx-icon> {{ column.header }}
  </ng-template>

  <!-- Custom editor template -->
  <ng-template igxCellEditor let-cell="cell">
    <igx-select [(ngModel)]="cell.editValue">
      <igx-select-item value="Active">Active</igx-select-item>
      <igx-select-item value="Inactive">Inactive</igx-select-item>
    </igx-select>
  </ng-template>

  <!-- Custom filter cell template -->
  <ng-template igxFilterCellTemplate let-column="column">
    <input (input)="onCustomFilter($event, column)" />
  </ng-template>

  <!-- Custom summary template -->
  <ng-template igxSummary let-summaryResults>
    Active: {{ getActiveCount(summaryResults) }}
  </ng-template>
</igx-column>
```

### Column Groups

> **Docs:** [Collapsible Column Groups](https://www.infragistics.com/products/ignite-ui-angular/angular/components/grid/collapsible-column-groups)

Group columns under a shared header:

```html
<igx-column-group header="Personal Info">
  <igx-column field="firstName" header="First Name"></igx-column>
  <igx-column field="lastName" header="Last Name"></igx-column>
</igx-column-group>

<igx-column-group header="Contact">
  <igx-column field="email" header="Email"></igx-column>
  <igx-column field="phone" header="Phone"></igx-column>
</igx-column-group>
```

### Multi-Row Layout (MRL)

> **Docs:** [Multi-Row Layout](https://www.infragistics.com/products/ignite-ui-angular/angular/components/grid/multi-row-layout)

Create complex cell layouts spanning multiple rows/columns:

```html
<igx-column-layout>
  <igx-column field="name" [rowStart]="1" [colStart]="1" [colEnd]="3"></igx-column>
  <igx-column field="email" [rowStart]="2" [colStart]="1"></igx-column>
  <igx-column field="phone" [rowStart]="2" [colStart]="2"></igx-column>
</igx-column-layout>
```

### Column Pinning

> **Docs:** [Column Pinning](https://www.infragistics.com/products/ignite-ui-angular/angular/components/grid/column-pinning)

```html
<igx-column field="name" [pinned]="true"></igx-column>
```

Or programmatically: `this.gridRef().pinColumn('name')`.

## Sorting

> **Docs:** [Sorting](https://www.infragistics.com/products/ignite-ui-angular/angular/components/grid/sorting) (substitute URL prefix per grid type — see instruction above)

```html
<igx-grid
  [data]="data()"
  [(sortingExpressions)]="sortExprs"
  [sortingOptions]="{ mode: 'multiple' }">
  <igx-column field="name" [sortable]="true"></igx-column>
</igx-grid>
```

Programmatic sorting:

```typescript
this.gridRef().sort({ fieldName: 'name', dir: SortingDirection.Asc, ignoreCase: true });
this.gridRef().clearSort();
```

Events: `(sorting)` (cancelable), `(sortingDone)`.

## Filtering

### Quick Filter (Row Filter)

> **Docs:** [Filtering](https://www.infragistics.com/products/ignite-ui-angular/angular/components/grid/filtering)

```html
<igx-grid [allowFiltering]="true" [filterMode]="'quickFilter'">
  <igx-column field="name" [filterable]="true"></igx-column>
</igx-grid>
```

### Excel-Style Filter

> **Docs:** [Excel-Style Filtering](https://www.infragistics.com/products/ignite-ui-angular/angular/components/grid/excel-style-filtering)

```html
<igx-grid [allowFiltering]="true" [filterMode]="'excelStyleFilter']">
  <igx-column field="name" [filterable]="true"></igx-column>
</igx-grid>
```

### Advanced Filtering Dialog

> **Docs:** [Advanced Filtering](https://www.infragistics.com/products/ignite-ui-angular/angular/components/grid/advanced-filtering)

```html
<igx-grid [allowAdvancedFiltering]="true">
  <!-- Advanced filtering UI is shown via toolbar or API -->
</igx-grid>
```

### Programmatic Filtering

```typescript
this.gridRef().filter('name', 'John', IgxStringFilteringOperand.instance().condition('contains'), true);
this.gridRef().clearFilter('name');
this.gridRef().clearFilter(); // clear all
```

Events: `(filtering)` (cancelable), `(filteringDone)`.

## Selection

### Row Selection

> **Docs:** [Row Selection](https://www.infragistics.com/products/ignite-ui-angular/angular/components/grid/row-selection)

```html
<igx-grid [rowSelection]="'multiple'" [primaryKey]="'id'" [(selectedRows)]="selectedIds">
  <!-- Optional: Custom row selector checkbox -->
  <ng-template igxRowSelector let-rowContext>
    <igx-checkbox [checked]="rowContext.selected" (change)="rowContext.select(!rowContext.selected)">
    </igx-checkbox>
  </ng-template>
</igx-grid>
```

Modes: `'none'`, `'single'`, `'multiple'`, `'multipleCascade'` (tree grids).

### Cell Selection

> **Docs:** [Cell Selection](https://www.infragistics.com/products/ignite-ui-angular/angular/components/grid/cell-selection)

```html
<igx-grid [cellSelection]="'multiple'"></igx-grid>
```

### Column Selection

> **Docs:** [Column Selection](https://www.infragistics.com/products/ignite-ui-angular/angular/components/grid/column-selection)

```html
<igx-grid [columnSelection]="'multiple'">
  <igx-column field="name" [selectable]="true"></igx-column>
</igx-grid>
```

Events: `(rowSelectionChanging)`, `(columnSelectionChanging)`, `(selected)` (cell).

## Key Rules

1. **Pick the right grid type first** — Grid Lite for lightweight read-only display, Flat Grid for enterprise tabular data, Tree Grid for single-schema parent-child, Hierarchical Grid for multi-schema levels, Pivot Grid for analytics reshaping
2. **Always set `[primaryKey]`** — required for editing, selection, row operations (Flat, Tree, Hierarchical, Pivot grids; NOT Grid Lite)
3. **Import the correct directives/components** — `IGX_GRID_DIRECTIVES`, `IGX_TREE_GRID_DIRECTIVES`, `IGX_HIERARCHICAL_GRID_DIRECTIVES`, `IGX_PIVOT_GRID_DIRECTIVES`, or individual Grid Lite imports
4. **Use the right component type for `viewChild`** — `IgxGridLiteComponent`, `IgxGridComponent`, `IgxTreeGridComponent`, `IgxHierarchicalGridComponent`, or `IgxPivotGridComponent`
5. **Set `[autoGenerate]="false"`** and define columns explicitly for production grids (except Pivot Grid where columns are auto-generated)
6. **Set `dataType` on every column** for correct filtering, sorting, editing, and summaries
7. **Use signals** for data binding — `[data]="myData()"` with `signal<T[]>([])`
8. **Virtualization is automatic** — don't wrap grids in virtual scroll containers

## Related Skills

- **[Grid Features](../igniteui-angular-grids-features/SKILL.md)** — Editing, grouping, summaries, cell merging, toolbar, export, virtualization, row drag, action strip, master-detail, clipboard
- **[Grid Types](../igniteui-angular-grids-types/SKILL.md)** — Tree Grid, Hierarchical Grid, Grid Lite, and Pivot Grid specifics
- **[Grid Data Operations](../igniteui-angular-grid-data-operations/SKILL.md)** — Remote data, paging, state persistence, batch editing workflows, programmatic sorting/filtering/grouping
- **[Grid Editing](../igniteui-angular-grid-editing/SKILL.md)** — Detailed editing implementation patterns
- **[Theming](../igniteui-angular-theming/SKILL.md)** — Grid styling and theming
- **[Components](../igniteui-angular-components/SKILL.md)** — Non-grid Ignite UI components
