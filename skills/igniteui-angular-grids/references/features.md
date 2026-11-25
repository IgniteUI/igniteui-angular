# Grid Features — Grouping, Summaries, Toolbar, Export, Row Drag & More

> **Part of the [`igniteui-angular-grids`](../SKILL.md) skill hub.**
> For grid setup, column config, sorting, filtering, selection — see [`structure.md`](./structure.md).
> For Tree Grid, Hierarchical Grid, Grid Lite, Pivot Grid specifics — see [`types.md`](./types.md).
> For full editing coverage (cell/row/batch) — see [`editing.md`](./editing.md).

## Contents

- [Editing](#editing)
- [Grouping (Grid only)](#grouping-grid-only)
- [Summaries](#summaries)
- [Cell Merging](#cell-merging)
- [Toolbar](#toolbar)
- [Export](#export)
- [Virtualization & Performance](#virtualization--performance)
- [Row Drag](#row-drag)
- [Action Strip](#action-strip)
- [Master-Detail (Grid only)](#master-detail-grid-only)
- [Clipboard](#clipboard)
- [Key Rules](#key-rules)

## Editing

> **Full editing coverage is in [`editing.md`](./editing.md)**, which includes cell editing, row editing, batch editing with transactions, row adding/deleting, validation, and summaries. Use that reference for any editing task.

Quick reference:

| Mode | Key properties |
|---|---|
| **Cell editing** | `[editable]="true"` on columns + `(cellEditDone)` |
| **Row editing** (recommended default) | `[rowEditable]="true"` + `[editable]="true"` on columns + `(rowEditDone)` |
| **Batch editing** | `[batchEditing]="true"` + `[rowEditable]="true"` + `transactions.commit(data)` |

## Grouping (Grid and Tree Grid only)

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

For advanced programmatic grouping patterns — see [`data-operations.md`](./data-operations.md).

## Summaries

> **Full summaries coverage — built-in summaries, custom summary operands, and summaries with grouping — is in [`editing.md`](./editing.md#summaries).**
>
> Quick reference: enable per-column summaries with `[hasSummary]="true"` on an `igx-column`. Default operands: **number** → Count/Min/Max/Sum/Average; **date** → Count/Earliest/Latest; **string/boolean** → Count.

## Cell Merging

Merge adjacent cells with equal values:

```html
<igx-grid [data]="data()" [cellMergeMode]="'always'">
  <igx-column field="category" [merge]="true"></igx-column>
</igx-grid>
```

Grid merge modes (`cellMergeMode`):
- `'onSort'` — merge only when the column is sorted **(default)**
- `'always'` — merge regardless of sort state

Or apply a custom merge strategy at the **grid level** (not column):

```html
<igx-grid [data]="data()" [mergeStrategy]="customMerge" [cellMergeMode]="'always'">
  <igx-column field="price" [merge]="true"></igx-column>
</igx-grid>
```

```typescript
import { DefaultMergeStrategy } from 'igniteui-angular/core';
// import { DefaultMergeStrategy } from '@infragistics/igniteui-angular/core'; for licensed package

// Extend DefaultMergeStrategy and override comparer
class PriceRangeMergeStrategy extends DefaultMergeStrategy {
  public override comparer(prevRecord: any, record: any, field: string): boolean {
    return Math.abs(prevRecord[field] - record[field]) < 10;
  }
}

customMerge = new PriceRangeMergeStrategy();
```

## Toolbar

```typescript
import { IgxGridToolbarComponent } from 'igniteui-angular/grids/core';
```

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

## Virtualization & Performance

Grids use virtualization by default for both rows and columns — no setup needed. For remote data/paging:

```html
<igx-grid [data]="data()" [totalItemCount]="totalCount" (dataPreLoad)="onDataPreLoad($event)">
</igx-grid>
```

For full remote virtualization patterns — see [`paging-remote.md`](./paging-remote.md).

## Row Drag

```html
<igx-grid [rowDraggable]="true" (rowDragStart)="onDragStart($event)" (rowDragEnd)="onDragEnd($event)">
  <!-- Custom ghost template (purely visual; row data is accessed in event handlers, not in the ghost template) -->
  <ng-template igxRowDragGhost>
    <igx-icon>arrow_right_alt</igx-icon>
  </ng-template>
</igx-grid>
```

Handle drops via `igxDrop` on the target:

```typescript
import { IDropDroppedEventArgs } from 'igniteui-angular/directives';

onDropAllowed(args: IDropDroppedEventArgs) {
  this.targetGrid.addRow(args.dragData.data);    // row data
  this.sourceGrid.deleteRow(args.dragData.key);  // primary key
}
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

1. **Cancelable events** — use `event.cancel = true` in `(rowEdit)`, `(cellEdit)`, `(sorting)`, `(filtering)` to prevent the action
2. **Use signals** for data binding — `[data]="myData()"` with `signal<T[]>([])`
3. **Virtualization is automatic** — don't wrap grids in virtual scroll containers
4. **GroupBy is Flat Grid only** — Tree Grid uses hierarchy, Hierarchical Grid uses row islands, Pivot Grid uses dimensions

## See Also

- [`structure.md`](./structure.md) — Column config, sorting UI, filtering UI, selection
- [`types.md`](./types.md) — Tree Grid, Hierarchical Grid, Grid Lite, Pivot Grid specifics
- [`data-operations.md`](./data-operations.md) — Programmatic sorting, filtering, grouping
- [`paging-remote.md`](./paging-remote.md) — Paging, remote data operations, virtualization
- [`editing.md`](./editing.md) — Cell editing, row editing, batch editing, validation, summaries
- [`state.md`](./state.md) — State persistence
- [`../../igniteui-angular-theming/SKILL.md`](../../igniteui-angular-theming/SKILL.md) — Grid styling and theming
