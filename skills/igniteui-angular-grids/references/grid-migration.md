# Ignite UI for Angular - Grid Lite → Premium Data Grid Migration

> **Part of the [`igniteui-angular-grids`](../SKILL.md) skill hub.**

## Purpose

This skill automates the migration from the **open-source Grid Lite** (`igx-grid-lite`, MIT licensed) to the **Premium Data Grid** (`igx-grid`, commercially licensed). Use it when a project outgrows Grid Lite's read-only capabilities and needs enterprise features such as editing, selection, paging, grouping, summaries, export, or state persistence.

## MANDATORY AGENT PROTOCOL

> **DO NOT write any code from memory.** Grid APIs change between versions.

Before producing migration code:

1. **Identify the current Grid Lite usage** - read the user's existing component files to understand their column configuration, templates, data binding, and any `dataPipelineConfiguration` usage.
2. **Consult the grids skill** - read the relevant reference files from [`igniteui-angular-grids`](../SKILL.md) for the target features the user needs after migration.
3. **Use the MCP server** - call `mcp_igniteui-cli_get_doc` or `mcp_igniteui-cli_search_docs` for Angular to verify current API details when in doubt.
4. **Only then produce output** - base all code on verified references, not memory.

---

## When to Migrate

Migrate from Grid Lite to the Premium Grid when the user needs **any** of these features:

| Required Feature | Grid Lite | Premium Grid |
|---|---|---|
| Cell / Row / Batch editing | No | Yes |
| Row adding / deleting | No | Yes |
| Row / Cell / Column selection | No | Yes |
| Paging (client or remote) | No | Yes |
| GroupBy | No | Yes (exclusive to flat grid) |
| Summaries (built-in & custom) | No | Yes |
| Column pinning | No | Yes |
| Column moving | No | Yes |
| Master-Detail rows | No | Yes (exclusive to flat grid) |
| Export (Excel / CSV) | No | Yes |
| Toolbar | No | Yes |
| State persistence | No | Yes |
| Advanced filtering | No | Yes |
| Action strip | No | Yes |
| Row drag | No | Yes |
| Clipboard support | No | Yes |
| Cell merging | No | Yes |

> **IMPORTANT:** The upgrade path from Grid Lite is **always** to `igx-grid` (`IgxGridComponent`). Never recommend a different component type as a substitute.

---

## Migration Checklist

### Step 1 - Install / Verify the Premium Package

Grid Lite uses the separate `igniteui-grid-lite` npm package. The Premium Grid is part of the main `igniteui-angular` (or `@infragistics/igniteui-angular`) package.

> **AGENT INSTRUCTION:** Check `package.json` to determine which package variant is installed. If only `igniteui-grid-lite` is present, the user needs to install the full package.

```bash
# Open-source package
npm install igniteui-angular

# OR licensed package (requires private registry)
npm install @infragistics/igniteui-angular
```

The `igniteui-grid-lite` package can be removed after migration if no other Grid Lite instances remain:

```bash
npm uninstall igniteui-grid-lite
```

### Step 2 - Update Imports

**Before (Grid Lite):**

```typescript
import {
  IgxGridLiteComponent,
  IgxGridLiteColumnComponent,
  IgxGridLiteCellTemplateDirective,
  IgxGridLiteHeaderTemplateDirective,
} from 'igniteui-angular/grids/lite';
```

**After (Premium Grid):**

```typescript
// Open-source
import { IgxGridComponent, IGX_GRID_DIRECTIVES } from 'igniteui-angular/grids/grid';

// Licensed
// import { IgxGridComponent, IGX_GRID_DIRECTIVES } from '@infragistics/igniteui-angular/grids/grid';
```

> **Key change:** The Premium Grid provides `IGX_GRID_DIRECTIVES` - a single convenience import that includes all grid directives (columns, templates, toolbar, paginator bindings, etc.). You no longer need to import each directive individually.

### Step 3 - Update the Component Decorator

**Before:**

```typescript
@Component({
  selector: 'app-data-view',
  imports: [
    IgxGridLiteComponent,
    IgxGridLiteColumnComponent,
    IgxGridLiteCellTemplateDirective,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // Required by Grid Lite
  templateUrl: './data-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
```

**After:**

```typescript
@Component({
  selector: 'app-data-view',
  imports: [IGX_GRID_DIRECTIVES],
  // No CUSTOM_ELEMENTS_SCHEMA needed - Premium Grid is a native Angular component
  templateUrl: './data-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
```

**Changes:**
- Replace individual Grid Lite imports with `IGX_GRID_DIRECTIVES`
- Remove `CUSTOM_ELEMENTS_SCHEMA` from `schemas` (Grid Lite is a Web Component wrapper; the Premium Grid is a native Angular component)
- Remove the `schemas` array entirely if it only contained `CUSTOM_ELEMENTS_SCHEMA`

### Step 4 - Update the Component Class

**Before:**

```typescript
export class DataViewComponent {
  gridRef = viewChild<IgxGridLiteComponent<Product>>('grid');
  data: Product[] = [];
}
```

**After:**

```typescript
export class DataViewComponent {
  gridRef = viewChild.required<IgxGridComponent>('grid');
  protected data = signal<Product[]>([]);
}
```

**Changes:**
- Replace `IgxGridLiteComponent` with `IgxGridComponent`
- Add `[primaryKey]` support - strongly recommended for editing, selection, and any row-targeted API (`getRowByKey`, transactions, row pinning, etc.). Without it the grid falls back to row indexes/object identity, which breaks across virtualization and remote data.
- Use `signal()` for reactive data (recommended but not required)

### Step 5 - Update the Template

#### Selector & Grid Element

| Grid Lite | Premium Grid |
|---|---|
| `<igx-grid-lite>` | `<igx-grid>` (needs an explicit `height` - or a parent with a fixed height - for row virtualization) |
| `<igx-grid-lite-column>` | `<igx-column>` |
| No `[primaryKey]` | `[primaryKey]="'id'"` (strongly recommended for editing/selection/row APIs) |
| `[sortingOptions]="{ mode: 'multiple' }"` | `[sortingOptions]="{ mode: 'multiple' }"` or per-column `[sortable]="true"` |

**Before:**

```html
<igx-grid-lite #grid [data]="data" [autoGenerate]="false">
  <igx-grid-lite-column field="name" header="Name" sortable filterable resizable>
  </igx-grid-lite-column>
  <igx-grid-lite-column field="price" header="Price" dataType="number" sortable>
  </igx-grid-lite-column>
</igx-grid-lite>
```

**After:**

```html
<!-- height is required for row virtualization (or set it on the parent container) -->
<igx-grid
  #grid
  [data]="data()"
  [primaryKey]="'id'"
  [autoGenerate]="false"
  height="600px"
>
  <igx-column field="name" header="Name" [sortable]="true" [filterable]="true" [resizable]="true">
  </igx-column>
  <igx-column field="price" header="Price" dataType="number" [sortable]="true">
  </igx-column>
</igx-grid>
```

#### Column Attribute Differences

| Grid Lite attribute | Premium Grid equivalent | Notes |
|---|---|---|
| `sortable` (boolean HTML attr) | `[sortable]="true"` or bare `sortable` | Both styles work on `igx-column`; bracketed binding is preferred for clarity |
| `filterable` (boolean HTML attr) | `[filterable]="true"` or bare `filterable` | Same pattern |
| `resizable` (boolean HTML attr) | `[resizable]="true"` or bare `resizable` | Same pattern |
| `hidden` (boolean HTML attr) | `[hidden]="true"` | Use binding - bare `hidden` collides with the native HTML attribute |
| `field` | `field` | Identical |
| `header` | `header` | Identical |
| `dataType` | `dataType` | Premium supports additional types: `dateTime`, `time`, `currency`, `percent`, `image` |
| `width` | `width` | Identical (CSS value, e.g., `'250px'`) |

#### Cell Template Migration

**Before (Grid Lite):**

```html
<igx-grid-lite-column field="status" header="Status">
  <ng-template igxGridLiteCell let-value let-row="row" let-column="column">
    <span [class]="value">{{ value }}</span>
  </ng-template>
</igx-grid-lite-column>
```

**After (Premium Grid):**

```html
<igx-column field="status" header="Status">
  <ng-template igxCell let-cell="cell">
    <span [class]="cell.value">{{ cell.value }}</span>
  </ng-template>
</igx-column>
```

**Key differences:**
- Template directive: `igxGridLiteCell` → `igxCell`
- Context object: Grid Lite exposes `let-value` directly; Premium exposes `let-cell="cell"` where you access `cell.value`, `cell.row`, `cell.column`
- Premium also supports `igxCellEditor` for edit templates (not available in Grid Lite)

#### Header Template Migration

**Before:**

```html
<ng-template igxGridLiteHeader let-column>
  <strong>{{ column.header }}</strong>
</ng-template>
```

**After:**

```html
<ng-template igxHeader let-column>
  <strong>{{ column.header }}</strong>
</ng-template>
```

**Change:** `igxGridLiteHeader` → `igxHeader`

### Step 6 - Migrate Remote Data Operations

Grid Lite uses `dataPipelineConfiguration` (async callbacks). The Premium Grid uses **noop data operation strategies + events**.

**Before (Grid Lite - `dataPipelineConfiguration`):**

```typescript
dataPipeline: IgxGridLiteDataPipelineConfiguration<Product> = {
  sort: async (params) => {
    return await this.dataService.sortRemote(params.grid.sortingExpressions);
  },
  filter: async (params) => {
    return await this.dataService.filterRemote(params.grid.filteringExpressions);
  },
};
```

```html
<igx-grid-lite [data]="data" [dataPipelineConfiguration]="dataPipeline">
</igx-grid-lite>
```

**After (Premium Grid - noop strategies + events):**

```typescript
import {
  NoopSortingStrategy,
  NoopFilteringStrategy,
} from 'igniteui-angular/core';
import { ISortingEventArgs } from 'igniteui-angular/grids/core';

export class DataViewComponent {
  gridRef = viewChild.required<IgxGridComponent>('grid');
  noopSort = NoopSortingStrategy.instance();
  noopFilter = NoopFilteringStrategy.instance();

  onSortingDone(event: ISortingEventArgs) {
    this.dataService.sortRemote(this.gridRef().sortingExpressions).subscribe(data => this.data.set(data));
  }

  onFilteringDone() {
    this.dataService.filterRemote(this.gridRef().filteringExpressionsTree).subscribe(data => this.data.set(data));
  }
}
```

```html
<igx-grid
  [data]="data()"
  [sortStrategy]="noopSort"
  [filterStrategy]="noopFilter"
  (sortingDone)="onSortingDone($event)"
  (filteringExpressionsTreeChange)="onFilteringDone()"
>
</igx-grid>
```

### Step 7 - Migrate Sort/Filter Events

| Grid Lite Event | Premium Grid Event | Notes |
|---|---|---|
| `(sorting)` | `(sorting)` | Both cancelable |
| `(sorted)` | `(sortingDone)` | Name changed |
| `(filtering)` | `(filtering)` | Both cancelable |
| `(filtered)` | `(filteringDone)` | Name changed |

### Step 8 - Migrate Programmatic Sort/Filter API

**Grid Lite API:**

```typescript
this.gridRef().sort({ key: 'name', direction: 'ascending' });
this.gridRef().filter({ key: 'age', condition: 'greaterThan', searchTerm: 21 });
this.gridRef().clearSort();
this.gridRef().clearFilter();
```

**Premium Grid API:**

```typescript
import { SortingDirection, IgxNumberFilteringOperand } from 'igniteui-angular/core';

// Sorting
this.gridRef().sort({ fieldName: 'name', dir: SortingDirection.Asc, ignoreCase: true });
this.gridRef().clearSort('name');

// Filtering
this.gridRef().filter('age', 21, IgxNumberFilteringOperand.instance().condition('greaterThan'));
this.gridRef().clearFilter('age');
```

**Key differences:**
- Sort expression: `key` → `fieldName`, `direction: 'ascending'` → `dir: SortingDirection.Asc`
- Filter: object-based → positional arguments with typed operand instances

### Step 9 - Remove Grid Lite Artifacts

After migration, clean up:

1. Remove `CUSTOM_ELEMENTS_SCHEMA` from any component that only used it for Grid Lite
2. Remove `import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'` if no longer needed
3. Remove `igniteui-grid-lite` from `package.json` if no Grid Lite instances remain
4. Remove any `IgxGridLiteDataPipelineConfiguration` types and replace with noop strategies

---

## Adding Enterprise Features Post-Migration

Once on the Premium Grid, enable the features that motivated the migration:

### Editing

```html
<igx-grid [data]="data()" [primaryKey]="'id'" [rowEditable]="true" (rowEditDone)="onRowEditDone($event)">
  <igx-column field="name" [editable]="true"></igx-column>
  <igx-column field="price" dataType="number" [editable]="true"></igx-column>
</igx-grid>
```

### Selection

```html
<igx-grid [data]="data()" [primaryKey]="'id'" [rowSelection]="'multiple'">
  <!-- columns -->
</igx-grid>
```

### Paging

```html
<igx-grid [data]="data()" [primaryKey]="'id'">
  <!-- columns -->
  <igx-paginator [perPage]="15" [selectOptions]="[10, 15, 25, 50]"></igx-paginator>
</igx-grid>
```

### GroupBy

```html
<igx-grid [data]="data()" [primaryKey]="'id'">
  <igx-column field="category" [groupable]="true"></igx-column>
</igx-grid>
```

### Export

```typescript
import { IgxExcelExporterService, IgxExcelExporterOptions } from 'igniteui-angular/grids/core';

export class DataViewComponent {
  private excelExporter = inject(IgxExcelExporterService);

  exportToExcel() {
    this.excelExporter.exportData(this.data(), new IgxExcelExporterOptions('export'));
  }
}
```

### Toolbar

```html
<igx-grid [data]="data()" [primaryKey]="'id'">
  <igx-grid-toolbar>
    <igx-grid-toolbar-title>Products</igx-grid-toolbar-title>
    <igx-grid-toolbar-actions>
      <igx-grid-toolbar-hiding></igx-grid-toolbar-hiding>
      <igx-grid-toolbar-pinning></igx-grid-toolbar-pinning>
      <igx-grid-toolbar-exporter></igx-grid-toolbar-exporter>
    </igx-grid-toolbar-actions>
  </igx-grid-toolbar>
  <!-- columns -->
</igx-grid>
```

### Summaries

```html
<igx-column field="price" dataType="number" [hasSummary]="true"></igx-column>
```

### Batch Editing

```html
<igx-grid [data]="data()" [primaryKey]="'id'" [batchEditing]="true" [rowEditable]="true">
  <igx-column field="name" [editable]="true"></igx-column>
</igx-grid>
```

```typescript
// Commit or discard all pending changes
this.gridRef().transactions.commit(this.data());
this.gridRef().transactions.clear();
```

---

## Quick Reference - Full Migration Map

| Aspect | Grid Lite | Premium Grid |
|---|---|---|
| **Package** | `igniteui-grid-lite` (separate) | `igniteui-angular` or `@infragistics/igniteui-angular` |
| **Entry point** | `igniteui-angular/grids/lite` | `igniteui-angular/grids/grid` |
| **Component** | `IgxGridLiteComponent` | `IgxGridComponent` |
| **Selector** | `<igx-grid-lite>` | `<igx-grid>` |
| **Column selector** | `<igx-grid-lite-column>` | `<igx-column>` |
| **Imports style** | Individual (`IgxGridLiteComponent`, `IgxGridLiteColumnComponent`, ...) | Bundle (`IGX_GRID_DIRECTIVES`) |
| **Schema** | `CUSTOM_ELEMENTS_SCHEMA` required | Not needed |
| **Primary key** | Not supported | `[primaryKey]="'id'"` (required for editing/selection) |
| **Cell template** | `igxGridLiteCell` (exposes `let-value`) | `igxCell` (exposes `let-cell="cell"`, access `cell.value`) |
| **Header template** | `igxGridLiteHeader` | `igxHeader` |
| **Editor template** | Not available | `igxCellEditor` |
| **Column attributes** | Boolean HTML attrs (`sortable`, `filterable`) | Angular inputs (`[sortable]="true"`, `[filterable]="true"`) |
| **Remote data** | `dataPipelineConfiguration` (async callbacks) | Noop strategies + events |
| **Sort event (done)** | `(sorted)` | `(sortingDone)` |
| **Filter event (done)** | `(filtered)` | `(filteringDone)` |
| **Sort expression** | `{ key, direction }` | `{ fieldName, dir: SortingDirection }` |
| **License** | MIT (free) | Commercial (trial with watermark) |

---

## Related Skills

- **[`igniteui-angular-grids`](../SKILL.md)** - Full grid reference for all grid types (use after migration for feature details)
- **[`igniteui-angular-theming`](../../igniteui-angular-theming/SKILL.md)** - Theming and styling (works with both Grid Lite and Premium Grid)
- **[`igniteui-angular-components`](../../igniteui-angular-components/SKILL.md)** - Non-grid UI components
