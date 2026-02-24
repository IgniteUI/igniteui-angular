# Grid Structure — Column Configuration, Sorting, Filtering & Selection

> **Part of the [`igniteui-angular-grids`](../SKILL.md) skill hub.**
> For grid type selection, imports, and feature availability — see the hub.
> For editing, grouping, summaries, toolbar, export — see [`features.md`](./features.md).
> For Tree Grid, Hierarchical Grid, Grid Lite, Pivot Grid specifics — see [`types.md`](./types.md).
> For programmatic data operations — see [`data-operations.md`](./data-operations.md).

## Quick Start

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

> **Docs:** [Sorting](https://www.infragistics.com/products/ignite-ui-angular/angular/components/grid/sorting) (substitute URL prefix per grid type — see hub instruction)

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

For advanced programmatic sorting patterns, custom sort strategies, and sorting events — see [`data-operations.md`](./data-operations.md).

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
<igx-grid [allowFiltering]="true" [filterMode]="'excelStyleFilter'">
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

For advanced programmatic filtering, complex AND/OR trees, and remote filtering patterns — see [`data-operations.md`](./data-operations.md).

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

1. **Pick the right grid type first** — see the [hub](../SKILL.md) for the decision guide
2. **Always set `[primaryKey]`** — required for editing, selection, row operations (Flat, Tree, Hierarchical, Pivot grids; NOT Grid Lite)
3. **Import the correct directives/components** — `IGX_GRID_DIRECTIVES`, `IGX_TREE_GRID_DIRECTIVES`, `IGX_HIERARCHICAL_GRID_DIRECTIVES`, `IGX_PIVOT_GRID_DIRECTIVES`, or individual Grid Lite imports
4. **Use the right component type for `viewChild`** — `IgxGridLiteComponent`, `IgxGridComponent`, `IgxTreeGridComponent`, `IgxHierarchicalGridComponent`, or `IgxPivotGridComponent`
5. **Set `[autoGenerate]="false"`** and define columns explicitly for production grids (except Pivot Grid where columns are auto-generated)
6. **Set `dataType` on every column** for correct filtering, sorting, editing, and summaries
7. **Use signals** for data binding — `[data]="myData()"` with `signal<T[]>([])`
8. **Virtualization is automatic** — don't wrap grids in virtual scroll containers

## See Also

- [`features.md`](./features.md) — Editing, grouping, summaries, toolbar, export, row drag, action strip, master-detail
- [`types.md`](./types.md) — Tree Grid, Hierarchical Grid, Grid Lite, Pivot Grid specifics
- [`data-operations.md`](./data-operations.md) — Programmatic sorting, filtering, grouping, canonical import patterns
- [`paging-remote.md`](./paging-remote.md) — Paging, remote data operations, virtualization
- [`editing.md`](./editing.md) — Cell editing, row editing, batch editing, validation, summaries
- [`state.md`](./state.md) — State persistence, grid-type-specific operations
- [`../../igniteui-angular-theming/SKILL.md`](../../igniteui-angular-theming/SKILL.md) — Grid styling and theming
