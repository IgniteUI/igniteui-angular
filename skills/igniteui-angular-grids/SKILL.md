---
name: igniteui-angular-grids
description: Build data-rich Angular apps with Ignite UI Grid, Tree Grid, Hierarchical Grid, and Pivot Grid
user-invokable: true
---

# Ignite UI for Angular — Data Grids Skill

## Description

This skill teaches AI agents how to build rich data grid experiences with Ignite UI for Angular. It covers the four grid types (Grid, Tree Grid, Hierarchical Grid, Pivot Grid), column configuration, sorting, filtering, editing, selection, grouping, summaries, export, and advanced features like batch editing, cell merging, multi-row layouts, and virtualization.

> **Related Skill: Grid Data Operations & State Management**
>
> This skill focuses on **grid structure** — choosing a grid type, configuring columns, templates, layout, selection, toolbar, and export.
> For **data manipulation patterns** — remote data binding, programmatic sorting/filtering/grouping, paging, batch editing workflows, state persistence, and wiring up services — see the dedicated [`igniteui-angular-grid-data-operations`](../igniteui-angular-grid-data-operations/SKILL.md) skill.
>
> If the user's question is about *what* to render, use this skill. If it's about *how data flows*, use the Data Operations skill.

## Prerequisites

- Angular 20+ project
- `igniteui-angular` installed
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

| Grid | Selector | Component | Directives | Entry Point |
|---|---|---|---|---|
| **Grid Lite** | `igx-grid-lite` | `IgxGridLiteComponent` | Individual imports | `igniteui-angular/grids/lite` |
| **Flat Grid** | `igx-grid` | `IgxGridComponent` | `IGX_GRID_DIRECTIVES` | `igniteui-angular/grids/grid` |
| **Tree Grid** | `igx-tree-grid` | `IgxTreeGridComponent` | `IGX_TREE_GRID_DIRECTIVES` | `igniteui-angular/grids/tree-grid` |
| **Hierarchical Grid** | `igx-hierarchical-grid` | `IgxHierarchicalGridComponent` | `IGX_HIERARCHICAL_GRID_DIRECTIVES` | `igniteui-angular/grids/hierarchical-grid` |
| **Pivot Grid** | `igx-pivot-grid` | `IgxPivotGridComponent` | `IGX_PIVOT_GRID_DIRECTIVES` | `igniteui-angular/grids/pivot-grid` |

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

### Imports

```typescript
import { Component, ChangeDetectionStrategy, signal, viewChild } from '@angular/core';
import { IgxGridComponent, IGX_GRID_DIRECTIVES } from 'igniteui-angular/grids/grid';

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

Create complex cell layouts spanning multiple rows/columns:

```html
<igx-column-layout>
  <igx-column field="name" [rowStart]="1" [colStart]="1" [colEnd]="3"></igx-column>
  <igx-column field="email" [rowStart]="2" [colStart]="1"></igx-column>
  <igx-column field="phone" [rowStart]="2" [colStart]="2"></igx-column>
</igx-column-layout>
```

### Column Pinning

```html
<igx-column field="name" [pinned]="true"></igx-column>
```

Or programmatically: `this.gridRef().pinColumn('name')`.

## Sorting

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

```html
<igx-grid [allowFiltering]="true" [filterMode]="'quickFilter'">
  <igx-column field="name" [filterable]="true"></igx-column>
</igx-grid>
```

### Excel-Style Filter

```html
<igx-grid [allowFiltering]="true" [filterMode]="'excelStyleFilter'">
  <igx-column field="name" [filterable]="true"></igx-column>
</igx-grid>
```

### Advanced Filtering Dialog

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

```html
<igx-grid [cellSelection]="'multiple'"></igx-grid>
```

### Column Selection

```html
<igx-grid [columnSelection]="'multiple'">
  <igx-column field="name" [selectable]="true"></igx-column>
</igx-grid>
```

Events: `(rowSelectionChanging)`, `(columnSelectionChanging)`, `(selected)` (cell).

## Editing

### Cell Editing

```html
<igx-column field="name" [editable]="true"></igx-column>
```

Double-click or press Enter to enter edit mode. Events: `(cellEditEnter)`, `(cellEdit)` (cancelable), `(cellEditDone)`, `(cellEditExit)`.

### Row Editing

```html
<igx-grid [rowEditable]="true" [primaryKey]="'id'">
  <!-- Custom row edit overlay text -->
  <ng-template igxRowEditText let-rowChanges>
    {{ rowChanges.size }} fields changed
  </ng-template>
  <ng-template igxRowEditActions>
    <button igxButton="flat" igxRowEditTabStop (click)="rowEditCtx.endRowEdit(false)">Cancel</button>
    <button igxButton="flat" igxRowEditTabStop (click)="rowEditCtx.endRowEdit(true)">Save</button>
  </ng-template>
</igx-grid>
```

Events: `(rowEditEnter)`, `(rowEdit)` (cancelable), `(rowEditDone)`, `(rowEditExit)`.

### Batch Editing (Transactions)

```html
<igx-grid [batchEditing]="true" [primaryKey]="'id'" [rowEditable]="true"></igx-grid>
```

```typescript
// Commit all changes
this.gridRef().transactions.commit(this.gridRef().data);

// Undo last change
this.gridRef().transactions.undo();

// Redo
this.gridRef().transactions.redo();

// Discard all changes
this.gridRef().transactions.clear();
```

### Adding and Deleting Rows

```typescript
// Add row
this.gridRef().addRow({ id: 999, name: 'New User', email: 'new@example.com' });

// Delete row by primary key
this.gridRef().deleteRow(42);

// Open add-row UI at top or bottom
this.gridRef().beginAddRowByIndex(0); // at top
```

Events: `(rowAdded)`, `(rowDeleted)`, `(rowAdd)` (cancelable), `(rowDelete)` (cancelable).

### Validation

Built-in validators on columns:

```html
<igx-column field="email" [editable]="true" required [validators]="emailValidators">
</igx-column>
```

```typescript
emailValidators = [Validators.required, Validators.email];
```

Events: `(formGroupCreated)`, `(validationStatusChange)`.

## Grouping (Grid only)

```html
<igx-grid [data]="data()" [groupsExpanded]="true">
  <igx-column field="category" [groupable]="true"></igx-column>

  <!-- Custom group row template -->
  <ng-template igxGroupByRow let-groupRow>
    {{ groupRow.expression.fieldName }}: {{ groupRow.value }} ({{ groupRow.records.length }} items)
  </ng-template>
</igx-grid>
```

Programmatic:

```typescript
this.gridRef().groupBy({ fieldName: 'category', dir: SortingDirection.Asc });
this.gridRef().clearGrouping('category');
```

## Summaries

Enable per-column summaries:

```html
<igx-column field="salary" dataType="number" [hasSummary]="true"></igx-column>
```

Default summaries by type:
- **number**: Count, Min, Max, Sum, Average
- **date**: Count, Earliest, Latest
- **string/boolean**: Count

Custom summary class:

```typescript
class SalarySummary extends IgxNumberSummaryOperand {
  operate(data: number[]): IgxSummaryResult[] {
    return [{
      key: 'median',
      label: 'Median',
      summaryResult: this.median(data)
    }];
  }

  private median(data: number[]): number {
    const sorted = [...data].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }
}
```

```html
<igx-column field="salary" [hasSummary]="true" [summaries]="salarySummary">
</igx-column>
```

## Cell Merging

Merge adjacent cells with equal values:

```html
<igx-column field="category" [merge]="true"></igx-column>
```

Or apply a custom merge strategy:

```html
<igx-column field="price" [merge]="true" [mergeStrategy]="priceRangeMerge"></igx-column>
```

```typescript
priceRangeMerge: IgxCellMergeStrategy = {
  shouldMerge(prevCell, curCell) {
    return Math.abs(prevCell.value - curCell.value) < 10;
  }
};
```

## Toolbar

```html
<igx-grid [data]="data()">
  <igx-grid-toolbar>
    <igx-grid-toolbar-title>Products</igx-grid-toolbar-title>
    <igx-grid-toolbar-actions>
      <igx-grid-toolbar-hiding></igx-grid-toolbar-hiding>
      <igx-grid-toolbar-pinning></igx-grid-toolbar-pinning>
      <igx-grid-toolbar-exporter></igx-grid-toolbar-exporter>
      <igx-grid-toolbar-advanced-filtering></igx-grid-toolbar-advanced-filtering>
    </igx-grid-toolbar-actions>
  </igx-grid-toolbar>

  <igx-column field="name"></igx-column>
</igx-grid>
```

## Export

### Excel Export

```typescript
import { IgxExcelExporterService, IgxExcelExporterOptions } from 'igniteui-angular/grids/core';

export class MyComponent {
  private excelExporter = inject(IgxExcelExporterService);

  exportToExcel() {
    this.excelExporter.exportData(this.data(), new IgxExcelExporterOptions('export'));
    // Or export the grid (respects filtering/sorting)
    this.excelExporter.export(this.grid, new IgxExcelExporterOptions('export'));
  }
}
```

### CSV Export

```typescript
import { IgxCsvExporterService, IgxCsvExporterOptions, CsvFileTypes } from 'igniteui-angular/grids/core';

export class MyComponent {
  private csvExporter = inject(IgxCsvExporterService);

  exportToCsv() {
    this.csvExporter.export(this.grid, new IgxCsvExporterOptions('export', CsvFileTypes.CSV));
  }
}
```

## Tree Grid

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

## Virtualization & Performance

Grids use virtualization by default for both rows and columns — no setup needed. For remote data/paging:

```html
<igx-grid [data]="data()" [totalItemCount]="totalCount" (dataPreLoad)="onDataPreLoad($event)">
</igx-grid>
```

## Row Drag

```html
<igx-grid [rowDraggable]="true" (rowDragStart)="onDragStart($event)" (rowDragEnd)="onDragEnd($event)">
  <ng-template igxRowDragGhost let-dragData>
    <span>Moving {{ dragData.dragData.name }}</span>
  </ng-template>
</igx-grid>
```

## Action Strip

Overlay actions on a row:

```html
<igx-grid [data]="data()">
  <igx-action-strip>
    <igx-grid-editing-actions [addRow]="true"></igx-grid-editing-actions>
    <igx-grid-pinning-actions></igx-grid-pinning-actions>
  </igx-action-strip>
  <igx-column field="name"></igx-column>
</igx-grid>
```

## Master-Detail (Grid only)

Expand rows to show arbitrary detail content:

```html
<igx-grid [data]="orders()" [primaryKey]="'orderId'">
  <igx-column field="orderId"></igx-column>
  <igx-column field="customer"></igx-column>

  <ng-template igxGridDetail let-dataItem>
    <div class="detail-container">
      <h4>Order Items for {{ dataItem.customer }}</h4>
      <igx-grid [data]="dataItem.items" [autoGenerate]="true" height="200px">
      </igx-grid>
    </div>
  </ng-template>
</igx-grid>
```

## Clipboard

Grids support copy to clipboard by default. Configure via:

```html
<igx-grid [clipboardOptions]="{ enabled: true, copyHeaders: true, copyFormatters: true, separator: '\t' }">
</igx-grid>
```

## Key Rules

1. **Pick the right grid type first** — Grid Lite for lightweight read-only display, Flat Grid for enterprise tabular data, Tree Grid for single-schema parent-child, Hierarchical Grid for multi-schema levels, Pivot Grid for analytics reshaping
2. **Always set `[primaryKey]`** — required for editing, selection, row operations (Flat, Tree, Hierarchical, Pivot grids; NOT Grid Lite)
3. **Import the correct directives/components** — `IGX_GRID_DIRECTIVES`, `IGX_TREE_GRID_DIRECTIVES`, `IGX_HIERARCHICAL_GRID_DIRECTIVES`, `IGX_PIVOT_GRID_DIRECTIVES`, or individual Grid Lite imports
4. **Use the right component type for `viewChild`** — `IgxGridLiteComponent`, `IgxGridComponent`, `IgxTreeGridComponent`, `IgxHierarchicalGridComponent`, or `IgxPivotGridComponent`
5. **Set `[autoGenerate]="false"`** and define columns explicitly for production grids (except Pivot Grid where columns are auto-generated)
6. **Set `dataType` on every column** for correct filtering, sorting, editing, and summaries
7. **Cancelable events** — use `event.cancel = true` in `(rowEdit)`, `(cellEdit)`, `(sorting)`, `(filtering)` to prevent the action
8. **Use signals** for data binding — `[data]="myData()"` with `signal<T[]>([])`
9. **Virtualization is automatic** — don't wrap grids in virtual scroll containers
10. **Grid Lite requires `CUSTOM_ELEMENTS_SCHEMA`** and `igniteui-grid-lite` npm package — it has no editing, selection, paging, or export
11. **Tree Grid**: use `[primaryKey]` + `[foreignKey]` for flat data or `[childDataKey]` for nested objects; filtering is recursive (parents of matching children are always shown)
12. **Hierarchical Grid**: sorting/filtering/paging are independent per level; configure features on the `<igx-row-island>` blueprint
13. **Pivot Grid is read-only** — editing, paging, pinning, column moving, row dragging are all disabled; use `pivotConfiguration` for all data operations
14. **GroupBy is Flat Grid only** — Tree Grid uses hierarchy, Hierarchical Grid uses row islands, Pivot Grid uses dimensions
15. **For data operation patterns** (remote data, paging, state persistence, batch editing workflows) — see the [Grid Data Operations skill](../igniteui-angular-grid-data-operations/SKILL.md)
