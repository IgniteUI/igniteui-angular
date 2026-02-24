---
name: igniteui-angular-grids-features
description: "Editing, grouping, summaries, toolbar, export, and other advanced features for Ignite UI Angular grids. Use when users ask to add a toolbar, export grid data to Excel or CSV, group rows by a column, add row drag-and-drop, show an action strip, merge cells, or move and pin columns."
user-invokable: true
---

# Ignite UI for Angular — Grid Features Skill

## Description

This skill covers advanced grid features for Ignite UI for Angular: cell editing, row editing, batch editing, row adding/deleting, validation, grouping, summaries, cell merging, toolbar, export (Excel & CSV), virtualization, row drag, action strip, master-detail, and clipboard.

> **Related Skill: Grid Setup & Configuration**
>
> For grid type selection, column configuration, sorting, filtering, and selection — see the [`igniteui-angular-grids`](../igniteui-angular-grids/SKILL.md) skill.
> For Tree Grid, Hierarchical Grid, Grid Lite, and Pivot Grid specifics — see [`igniteui-angular-grids-types`](../igniteui-angular-grids-types/SKILL.md).

## Editing

> **Full editing coverage is in the [`igniteui-angular-grid-editing`](../igniteui-angular-grid-editing/SKILL.md) skill**, which includes cell editing, row editing, batch editing with transactions, row adding/deleting, validation, and summaries. Use that skill for any editing task.

Quick reference:

| Mode | Key properties |
|---|---|
| **Cell editing** | `[editable]="true"` on columns + `(cellEditDone)` |
| **Row editing** (recommended default) | `[rowEditable]="true"` + `[editable]="true"` on columns + `(rowEditDone)` |
| **Batch editing** | `[batchEditing]="true"` + `[rowEditable]="true"` + `transactions.commit(data)` |

## Grouping (Grid only)

> **Docs:** [Group By](https://www.infragistics.com/products/ignite-ui-angular/angular/components/grid/groupby)

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

> **Full summaries coverage (built-in and custom summary operands) is in the [`igniteui-angular-grid-editing`](../igniteui-angular-grid-editing/SKILL.md) skill.**

Quick reference — enable per-column summaries:

```html
<igx-column field="salary" dataType="number" [hasSummary]="true"></igx-column>
```

Default summaries by type: **number** → Count/Min/Max/Sum/Average; **date** → Count/Earliest/Latest; **string/boolean** → Count.

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

> **Docs:** [Toolbar](https://www.infragistics.com/products/ignite-ui-angular/angular/components/grid/toolbar)

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

> **Docs:** [Excel Export](https://www.infragistics.com/products/ignite-ui-angular/angular/components/exporter-excel)

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

> **Docs:** [CSV Export](https://www.infragistics.com/products/ignite-ui-angular/angular/components/exporter-csv)

```typescript
import { IgxCsvExporterService, IgxCsvExporterOptions, CsvFileTypes } from 'igniteui-angular/grids/core';

export class MyComponent {
  private csvExporter = inject(IgxCsvExporterService);

  exportToCsv() {
    this.csvExporter.export(this.grid, new IgxCsvExporterOptions('export', CsvFileTypes.CSV));
  }
}
```

## Virtualization & Performance

> **Docs:** [Virtualization](https://www.infragistics.com/products/ignite-ui-angular/angular/components/general-changelog-dv)

Grids use virtualization by default for both rows and columns — no setup needed. For remote data/paging:

```html
<igx-grid [data]="data()" [totalItemCount]="totalCount" (dataPreLoad)="onDataPreLoad($event)">
</igx-grid>
```

## Row Drag

> **Docs:** [Row Drag](https://www.infragistics.com/products/ignite-ui-angular/angular/components/grid/row-drag)

```html
<igx-grid [rowDraggable]="true" (rowDragStart)="onDragStart($event)" (rowDragEnd)="onDragEnd($event)">
  <ng-template igxRowDragGhost let-dragData>
    <span>Moving {{ dragData.dragData.name }}</span>
  </ng-template>
</igx-grid>
```

## Action Strip

> **Docs:** [Action Strip](https://www.infragistics.com/products/ignite-ui-angular/angular/components/action-strip)

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

> **Docs:** [Master-Detail](https://www.infragistics.com/products/ignite-ui-angular/angular/components/grid/master-detail)

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

1. **Cancelable events** — use `event.cancel = true` in `(rowEdit)`, `(cellEdit)`, `(sorting)`, `(filtering)` to prevent the action
2. **Use signals** for data binding — `[data]="myData()"` with `signal<T[]>([])`
3. **Virtualization is automatic** — don't wrap grids in virtual scroll containers
4. **GroupBy is Flat Grid only** — Tree Grid uses hierarchy, Hierarchical Grid uses row islands, Pivot Grid uses dimensions
5. **For data operation patterns** — see the [Grid Data Operations skill](../igniteui-angular-grid-data-operations/SKILL.md) (sorting, filtering, grouping), [Grid Paging & Remote skill](../igniteui-angular-grid-paging-remote/SKILL.md) (paging, remote data, virtualization), [Grid Editing skill](../igniteui-angular-grid-editing/SKILL.md) (editing, validation, summaries), and [Grid State skill](../igniteui-angular-grid-state/SKILL.md) (state persistence, grid-type-specific operations)

## Related Skills

- **[Grid Setup & Configuration](../igniteui-angular-grids/SKILL.md)** — Grid type selection, column configuration, sorting, filtering, selection
- **[Grid Types](../igniteui-angular-grids-types/SKILL.md)** — Tree Grid, Hierarchical Grid, Grid Lite, and Pivot Grid specifics
- **[Grid Data Operations](../igniteui-angular-grid-data-operations/SKILL.md)** — Sorting, filtering, grouping, and canonical grid import patterns
- **[Grid Paging & Remote](../igniteui-angular-grid-paging-remote/SKILL.md)** — Paging, remote data operations, virtualization, multi-grid coordination
- **[Grid Editing](../igniteui-angular-grid-editing/SKILL.md)** — Cell editing, row editing, batch editing, validation, summaries
- **[Grid State](../igniteui-angular-grid-state/SKILL.md)** — State persistence, Tree Grid / Hierarchical Grid / Pivot Grid / Grid Lite data operations
- **[Theming](../igniteui-angular-theming/SKILL.md)** — Grid styling and theming
- **[Components](../igniteui-angular-components/SKILL.md)** — Non-grid Ignite UI components
