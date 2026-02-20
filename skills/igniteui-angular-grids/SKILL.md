---
name: igniteui-angular-grids
description: Build data-rich Angular apps with Ignite UI Grid, Tree Grid, Hierarchical Grid, and Pivot Grid
user-invokable: true
---

# Ignite UI for Angular — Data Grids Skill

## Description

This skill teaches AI agents how to build rich data grid experiences with Ignite UI for Angular. It covers the four grid types (Grid, Tree Grid, Hierarchical Grid, Pivot Grid), column configuration, sorting, filtering, editing, selection, grouping, summaries, export, and advanced features like batch editing, cell merging, multi-row layouts, and virtualization.

## Prerequisites

- Angular 20+ project
- `igniteui-angular` installed
- A theme applied (see the Theming skill)

## Grid Types Overview

| Grid | Selector | Use Case | Entry Point |
|---|---|---|---|
| **Grid** | `igx-grid` | Flat tabular data | `igniteui-angular/grids/grid` |
| **Tree Grid** | `igx-tree-grid` | Hierarchical parent-child data in one flat array | `igniteui-angular/grids/tree-grid` |
| **Hierarchical Grid** | `igx-hierarchical-grid` | Master-detail data with different schemas per level | `igniteui-angular/grids/hierarchical-grid` |
| **Pivot Grid** | `igx-pivot-grid` | Pivot table analytics | `igniteui-angular/grids/pivot-grid` |

## Quick Start

### Imports

```typescript
import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { IGX_GRID_DIRECTIVES } from 'igniteui-angular/grids/grid';

@Component({
  selector: 'app-users-grid',
  imports: [IGX_GRID_DIRECTIVES],
  templateUrl: './users-grid.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsersGridComponent {
  protected users = signal<User[]>([]);
}
```

### Basic Grid

```html
<igx-grid
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

Or programmatically: `grid.pinColumn('name')`.

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
grid.sort({ fieldName: 'name', dir: SortingDirection.Asc, ignoreCase: true });
grid.clearSort();
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
grid.filter('name', 'John', IgxStringFilteringOperand.instance().condition('contains'), true);
grid.clearFilter('name');
grid.clearFilter(); // clear all
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
grid.transactions.commit(grid.data);

// Undo last change
grid.transactions.undo();

// Redo
grid.transactions.redo();

// Discard all changes
grid.transactions.clear();
```

### Adding and Deleting Rows

```typescript
// Add row
grid.addRow({ id: 999, name: 'New User', email: 'new@example.com' });

// Delete row by primary key
grid.deleteRow(42);

// Open add-row UI at top or bottom
grid.beginAddRowByIndex(0); // at top
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
grid.groupBy({ fieldName: 'category', dir: SortingDirection.Asc });
grid.clearGrouping('category');
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

For data with parent-child relationships:

```html
<igx-tree-grid
  [data]="employees()"
  [primaryKey]="'id'"
  [foreignKey]="'managerId'"
  [autoGenerate]="false"
  [rowSelection]="'multipleCascade'"
  height="600px">

  <igx-column field="name" header="Name" [sortable]="true"></igx-column>
  <igx-column field="title" header="Title"></igx-column>
  <igx-column field="department" header="Department" [groupable]="true"></igx-column>

</igx-tree-grid>
```

Key properties:
- `[primaryKey]` + `[foreignKey]` — flat data with foreign key relation
- `[primaryKey]` + `[childDataKey]` — nested object data

```typescript
import { IGX_TREE_GRID_DIRECTIVES } from 'igniteui-angular/grids/tree-grid';
```

## Hierarchical Grid

For master-detail data with different schemas at each level:

```html
<igx-hierarchical-grid
  [data]="companies()"
  [primaryKey]="'id'"
  [autoGenerate]="false"
  height="600px">

  <igx-column field="name" header="Company"></igx-column>
  <igx-column field="industry" header="Industry"></igx-column>

  <igx-row-island [key]="'departments'" [autoGenerate]="false">
    <igx-column field="name" header="Department"></igx-column>
    <igx-column field="headCount" header="Employees" dataType="number"></igx-column>

    <igx-row-island [key]="'employees'" [autoGenerate]="false">
      <igx-column field="name" header="Name"></igx-column>
      <igx-column field="role" header="Role"></igx-column>
    </igx-row-island>
  </igx-row-island>

</igx-hierarchical-grid>
```

```typescript
import { IGX_HIERARCHICAL_GRID_DIRECTIVES } from 'igniteui-angular/grids/hierarchical-grid';
```

## Pivot Grid

For pivot table analytics:

```html
<igx-pivot-grid
  [data]="salesData()"
  [pivotConfiguration]="pivotConfig"
  [autoGenerate]="false"
  height="600px">
</igx-pivot-grid>
```

```typescript
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
```

```typescript
import { IGX_PIVOT_GRID_DIRECTIVES } from 'igniteui-angular/grids/pivot-grid';
```

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

1. **Always set `[primaryKey]`** — required for editing, selection, row operations
2. **Use `IGX_GRID_DIRECTIVES`** (or tree/hierarchical/pivot variants) for convenience imports
3. **Set `[autoGenerate]="false"`** and define columns explicitly for production grids
4. **Set `dataType` on every column** for correct filtering, sorting, editing, and summaries
5. **Cancelable events** — use `event.cancel = true` in `(rowEdit)`, `(cellEdit)`, `(sorting)`, `(filtering)` to prevent the action
6. **Use signals** for data binding — `[data]="myData()"` with `signal<T[]>([])`
7. **Virtualization is automatic** — don't wrap grids in virtual scroll containers
8. **For large datasets** use remote operations: listen to `(dataPreLoad)`, `(sortingDone)`, `(filteringDone)` and fetch server-side
9. **Batch editing** requires `[primaryKey]` — call `grid.transactions.commit(grid.data)` to persist changes
10. **Tree Grid**: use `[primaryKey]` + `[foreignKey]` for flat data or `[childDataKey]` for nested objects
