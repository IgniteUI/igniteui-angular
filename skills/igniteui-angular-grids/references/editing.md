# Grid Editing — Cell Editing, Row Editing, Batch Editing & Validation

> **Part of the [`igniteui-angular-grids`](../SKILL.md) skill hub.**
> For grid import patterns and `viewChild` access — see [`data-operations.md`](./data-operations.md).
> For state persistence — see [`state.md`](./state.md).
> For paging and remote data — see [`paging-remote.md`](./paging-remote.md).

## Editing Data Through the Grid

> **AGENT INSTRUCTION:** When a user says they want to "edit data through the grid", "make the grid editable", or "allow CRUD in the grid", use this section to pick the right editing mode before writing any code.

### Choosing an Editing Mode

| Mode | When to use | Key properties |
|---|---|---|
| **Cell editing** | Each cell saves immediately when the user confirms or leaves it. Good for quick single-field corrections. | `[editable]="true"` on columns + `(cellEditDone)` |
| **Row editing** | User edits multiple cells in a row and confirms/cancels the whole row at once. **Best for most CRUD UIs.** | `[rowEditable]="true"` + `[editable]="true"` on columns + `(rowEditDone)` |
| **Batch editing** | Accumulate many changes across multiple rows with undo/redo, then commit or discard all at once. | `[batchEditing]="true"` + `[rowEditable]="true"` |

> **Default recommendation:** use **row editing** for most data management UIs (e.g., "edit available cars"). It prevents half-edited data from being visible and gives users a clear Done/Cancel flow per row.

### Cell Editing (Immediate)

> **Docs:** [Cell Editing](https://www.infragistics.com/products/ignite-ui-angular/angular/components/grid/cell-editing)

The simplest mode. Each cell saves the moment the user tabs away or presses Enter.

```typescript
import { Component, ChangeDetectionStrategy, signal, viewChild, inject } from '@angular/core';
import { IgxGridComponent, IGX_GRID_DIRECTIVES } from 'igniteui-angular/grids/grid';
import { IGridEditDoneEventArgs } from 'igniteui-angular/grids/core';

@Component({
  selector: 'app-cars-grid',
  imports: [IGX_GRID_DIRECTIVES],
  templateUrl: './cars-grid.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CarsGridComponent {
  gridRef = viewChild.required<IgxGridComponent>('grid');
  private carService = inject(CarService);
  protected cars = signal<Car[]>([]);

  constructor() {
    this.carService.getCars().subscribe(data => this.cars.set(data));
  }

  onCellEditDone(event: IGridEditDoneEventArgs) {
    // Persist the single-cell change immediately
    const updatedCar = { ...event.rowData, [event.column.field]: event.newValue };
    this.carService.updateCar(updatedCar).subscribe();
  }
}
```

```html
<igx-grid #grid
  [data]="cars()"
  [primaryKey]="'id'"
  [autoGenerate]="false"
  (cellEditDone)="onCellEditDone($event)"
  height="600px">
  <igx-column field="make" header="Make" [editable]="true" [sortable]="true"></igx-column>
  <igx-column field="model" header="Model" [editable]="true" [sortable]="true"></igx-column>
  <igx-column field="year" header="Year" dataType="number" [editable]="true" [sortable]="true"></igx-column>
  <igx-column field="price" header="Price" dataType="number" [editable]="true" [sortable]="true"></igx-column>
  <igx-column field="available" header="Available" dataType="boolean" [editable]="true"></igx-column>
</igx-grid>
```

### Row Editing (Recommended for CRUD)

> **Docs:** [Row Editing](https://www.infragistics.com/products/ignite-ui-angular/angular/components/grid/row-editing)

Users click into a row, edit cells, then click **Done** or **Cancel** — changes only apply when Done is pressed. An overlay toolbar appears automatically.

```typescript
import { Component, ChangeDetectionStrategy, signal, viewChild, inject } from '@angular/core';
import { IgxGridComponent, IGX_GRID_DIRECTIVES } from 'igniteui-angular/grids/grid';
import { IGridEditDoneEventArgs, IGridEditEventArgs, IRowDataEventArgs } from 'igniteui-angular/grids/core';

@Component({
  selector: 'app-cars-grid',
  imports: [IGX_GRID_DIRECTIVES],
  templateUrl: './cars-grid.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CarsGridComponent {
  gridRef = viewChild.required<IgxGridComponent>('grid');
  private carService = inject(CarService);
  protected cars = signal<Car[]>([]);

  constructor() {
    this.carService.getCars().subscribe(data => this.cars.set(data));
  }

  onRowEditDone(event: IGridEditDoneEventArgs) {
    // event.newValue contains the full updated row object
    this.carService.updateCar(event.newValue).subscribe();
  }

  onRowAdded(event: IRowDataEventArgs) {
    // Persist the newly added row; optionally replace local data with server response
    this.carService.createCar(event.data).subscribe(created => {
      this.cars.update(cars => cars.map(c => c === event.data ? created : c));
    });
  }

  onRowDeleted(event: IRowDataEventArgs) {
    this.carService.deleteCar(event.data.id).subscribe();
  }

  addCar() {
    // Programmatically start a new row at the end
    this.gridRef().beginAddRowByIndex(this.cars().length);
  }

  deleteCar(carId: number) {
    this.gridRef().deleteRow(carId);
  }
}
```

```html
<igx-grid #grid
  [data]="cars()"
  [primaryKey]="'id'"
  [autoGenerate]="false"
  [rowEditable]="true"
  (rowEditDone)="onRowEditDone($event)"
  (rowAdded)="onRowAdded($event)"
  (rowDeleted)="onRowDeleted($event)"
  height="600px">

  <igx-column field="make" header="Make" [editable]="true" [sortable]="true"></igx-column>
  <igx-column field="model" header="Model" [editable]="true" [sortable]="true"></igx-column>
  <igx-column field="year" header="Year" dataType="number" [editable]="true" [sortable]="true"></igx-column>
  <igx-column field="price" header="Price" dataType="number" [editable]="true" [sortable]="true"></igx-column>
  <igx-column field="available" header="Available" dataType="boolean" [editable]="true"></igx-column>

  <!-- Action strip: shows Edit and Delete buttons on row hover; Add Row button in toolbar -->
  <igx-action-strip>
    <igx-grid-editing-actions [addRow]="true"></igx-grid-editing-actions>
  </igx-action-strip>
</igx-grid>

<button (click)="addCar()">Add Car</button>
```

> **Key inputs summary:**
> - `[rowEditable]="true"` — enables the Done/Cancel overlay per row
> - `[editable]="true"` on each `igx-column` — marks which fields the user can change
> - `[primaryKey]` — **required** for editing to work
> - `[autoGenerate]="false"` — always define columns explicitly when editing is enabled so you control which fields are editable
> - `<igx-action-strip>` with `<igx-grid-editing-actions>` — adds hover Edit/Delete buttons and an optional Add Row button automatically

### Programmatic Row Adding with Default Values

When starting a new row programmatically, pre-populate fields using `(cellEditEnter)` on the new row:

```typescript
onCellEditEnter(event: IGridEditEventArgs) {
  if (event.isAddRow && event.column.field === 'available') {
    event.cellEditArgs.newValue = true; // default new cars to available
  }
  if (event.isAddRow && event.column.field === 'year') {
    event.cellEditArgs.newValue = new Date().getFullYear();
  }
}
```

```html
<igx-grid #grid ... (cellEditEnter)="onCellEditEnter($event)">
```

---

## Batch Editing & Transactions

> **Docs:** [Batch Editing](https://www.infragistics.com/products/ignite-ui-angular/angular/components/grid/batch-editing) (substitute URL prefix per grid type)

> **Applies to**: Flat Grid, Tree Grid, and Hierarchical Grid. **Pivot Grid does NOT support batch editing.**
> Use batch editing when users need to **edit many rows at once** and commit or discard all changes together, with undo/redo support.

### Enabling Batch Editing

```html
<igx-grid #grid
  [data]="data()"
  [primaryKey]="'id'"
  [batchEditing]="true"
  [rowEditable]="true"
  height="600px">
  <igx-column field="name" [editable]="true"></igx-column>
  <igx-column field="price" dataType="number" [editable]="true"></igx-column>
  <igx-column field="quantity" dataType="number" [editable]="true"></igx-column>
</igx-grid>

<button (click)="commitChanges()">Save All</button>
<button (click)="undoLast()">Undo</button>
<button (click)="redoLast()">Redo</button>
<button (click)="discardAll()">Discard</button>
```

### Managing Transactions

```typescript
commitChanges() {
  // Exit any active edit before committing
  this.gridRef().endEdit(true);
  this.gridRef().transactions.commit(this.gridRef().data);
}

undoLast() {
  // Must exit edit mode before undo/redo
  this.gridRef().endEdit(true);
  this.gridRef().transactions.undo();
}

redoLast() {
  this.gridRef().endEdit(true);
  this.gridRef().transactions.redo();
}

discardAll() {
  this.gridRef().endEdit(false);
  this.gridRef().transactions.clear();
}
```

Use `canUndo` and `canRedo` to control button state:

```html
<button (click)="commitChanges()" [disabled]="gridRef().transactions.getAggregatedChanges(false).length < 1">Save All</button>
<button (click)="undoLast()" [disabled]="!gridRef().transactions.canUndo">Undo</button>
<button (click)="redoLast()" [disabled]="!gridRef().transactions.canRedo">Redo</button>
<button (click)="discardAll()">Discard</button>
```

### Transaction State

```typescript
// Check if there are pending changes
const hasPendingChanges = this.gridRef().transactions.getAggregatedChanges(false).length > 0;

// Get all pending transactions
const pending = this.gridRef().transactions.getAggregatedChanges(true);
// Each transaction has: { id, type ('add'|'update'|'delete'), newValue }
```

### Sending Batch Changes to Server

```typescript
saveToServer() {
  const changes = this.gridRef().transactions.getAggregatedChanges(true);

  const adds = changes.filter(t => t.type === 'add').map(t => t.newValue);
  const updates = changes.filter(t => t.type === 'update').map(t => ({ id: t.id, ...t.newValue }));
  const deletes = changes.filter(t => t.type === 'delete').map(t => t.id);

  this.dataService.saveBatch({ adds, updates, deletes }).subscribe(() => {
    this.gridRef().transactions.commit(this.gridRef().data);
    this.gridRef().transactions.clear();
  });
}
```

## Excel-Style Editing Workflows

### Inline Cell Editing with Validation

```html
<igx-grid #grid
  [data]="data()"
  [primaryKey]="'id'"
  [batchEditing]="true"
  (cellEditDone)="onCellEditDone($event)">

  <igx-column field="name" [editable]="true" required></igx-column>
  <igx-column field="email" [editable]="true" [validators]="emailValidators"></igx-column>
  <igx-column field="quantity" dataType="number" [editable]="true" [validators]="quantityValidators"></igx-column>
</igx-grid>
```

```typescript
import { Validators } from '@angular/forms';

emailValidators = [Validators.required, Validators.email];
quantityValidators = [Validators.required, Validators.min(0), Validators.max(9999)];

onCellEditDone(event: IGridEditDoneEventArgs) {
  // React to edits — e.g., recalculate totals
  if (event.column.field === 'quantity' || event.column.field === 'unitPrice') {
    this.recalculateRowTotal(event.rowID);
  }
}
```

### Clipboard Paste for Bulk Edit

Grids support paste from Excel/spreadsheets by default. Configure clipboard behavior:

```html
<igx-grid #grid
  [data]="data()"
  [primaryKey]="'id'"
  [batchEditing]="true"
  [clipboardOptions]="{ enabled: true, copyHeaders: true, copyFormatters: true, separator: '\t' }">
</igx-grid>
```

### Row Adding via UI

```typescript
// Flat Grid / Hierarchical Grid:
this.gridRef().beginAddRowByIndex(0);                // at top
this.gridRef().beginAddRowById('ALFKI');             // under a specific row
this.gridRef().beginAddRowByIndex(this.gridRef().data.length); // at end

// Tree Grid — add as child of a parent:
this.treeGridRef().addRow(newRowData, parentRowID);  // add row as child of parentRowID
this.treeGridRef().beginAddRowByIndex(3, true);      // add as child of row at index 3
```

Use with Action Strip for visual add/edit actions:

```html
<igx-grid #grid [data]="data()" [primaryKey]="'id'" [rowEditable]="true">
  <igx-action-strip>
    <igx-grid-editing-actions [addRow]="true"></igx-grid-editing-actions>
  </igx-action-strip>
  <igx-column field="name" [editable]="true"></igx-column>
</igx-grid>
```

## Editing Events Reference

All grids fire a consistent sequence of events during cell and row editing:

| Event | Fires When | Cancelable |
|---|---|---|
| `(rowEditEnter)` | Row enters edit mode | Yes |
| `(cellEditEnter)` | Cell enters edit mode (after `rowEditEnter`) | Yes |
| `(cellEdit)` | Cell value is about to be committed | Yes |
| `(cellEditDone)` | Cell value has been committed | No |
| `(cellEditExit)` | Cell exits edit mode | No |
| `(rowEdit)` | Row edit is about to be committed (Done button) | Yes |
| `(rowEditDone)` | Row edit has been committed | No |
| `(rowEditExit)` | Row exits edit mode | No |

Canceling `(cellEdit)` keeps the cell in edit mode — the value won't commit until Cancel is clicked:

```typescript
onCellEdit(event: IGridEditEventArgs) {
  if (!event.valid) {
    event.cancel = true; // prevent committing invalid values
  }
}
```

## Validation

> **Docs:** [Validation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/grid/validation)

### Template-Driven Validation

Apply Angular validators directly on columns:

```html
<igx-column field="email" [editable]="true" required email></igx-column>
<igx-column field="age" dataType="number" [editable]="true" required [min]="18" [max]="120"></igx-column>
```

Supported built-in validators: `required`, `min`, `max`, `email`, `minlength`, `maxlength`, `pattern`.

### Reactive Form Validation

Use the `formGroupCreated` event to add custom validators when a row enters edit mode:

```html
<igx-grid #grid [data]="data()" [rowEditable]="true" [primaryKey]="'id'"
  (formGroupCreated)="onFormGroupCreated($event)">
</igx-grid>
```

```typescript
onFormGroupCreated(event: IGridFormGroupCreatedEventArgs) {
  const { formGroup } = event;
  formGroup.get('endDate')?.addValidators(this.dateAfterValidator('startDate'));
}
```

### Validation Service

The grid exposes a `validation` service:

```typescript
// Check if the grid is in a valid state
const isValid = this.gridRef().validation.valid;

// Get all records with validation errors
const invalid = this.gridRef().validation.getInvalid();

// Clear validation state for a specific record (or all if no id)
this.gridRef().validation.clear(recordId);
```

## Summaries

> **Docs:** [Summaries](https://www.infragistics.com/products/ignite-ui-angular/angular/components/grid/summaries) (substitute URL prefix per grid type)

### Built-In Summaries

```html
<igx-column field="amount" dataType="number" [hasSummary]="true"></igx-column>
```

Default summaries by type:
- **number**: Count, Min, Max, Sum, Average
- **date**: Count, Earliest, Latest
- **string/boolean**: Count

### Custom Summary Operand

```typescript
import { IgxNumberSummaryOperand, IgxSummaryResult } from 'igniteui-angular/grids/core';

class RevenueSummary extends IgxNumberSummaryOperand {
  operate(data: number[]): IgxSummaryResult[] {
    const result = super.operate(data);
    result.push({
      key: 'margin',
      label: 'Avg Margin',
      summaryResult: data.length ? data.reduce((a, b) => a + b, 0) / data.length * 0.15 : 0
    });
    return result;
  }
}

// Use in component
revenueSummary = RevenueSummary;
```

```html
<igx-column field="revenue" dataType="number" [hasSummary]="true" [summaries]="revenueSummary"></igx-column>
```

### Summaries with Grouping

When grouping is enabled, summaries appear for each group. Control this with:

```html
<igx-grid #grid
  [data]="data()"
  [showSummaryOnCollapse]="true"
  [summaryCalculationMode]="'childLevelsOnly'"
  [summaryPosition]="'bottom'">
</igx-grid>
```

## Key Rules

1. **Choose the right editing mode** — cell editing (`[editable]` + `(cellEditDone)`) for immediate per-cell saves; row editing (`[rowEditable]="true"` + `(rowEditDone)`) for confirm/cancel per row (**recommended default for CRUD**); batch editing (`[batchEditing]="true"`) for accumulate-then-commit with undo/redo
2. **`[primaryKey]` is required for all editing** — row editing, batch editing, row adding, and row deletion all depend on it (Flat, Tree, Hierarchical, Pivot grids; NOT Grid Lite)
3. **Always set `[autoGenerate]="false"` when editing** — define columns explicitly and mark each with `[editable]="true"` to control exactly what users can change
4. **Batch editing requires `[primaryKey]`** — call `endEdit(true)` before `transactions.undo()`/`redo()`, commit via `transactions.commit(data)`
5. **Cancelable events** — use `event.cancel = true` in `(cellEdit)`, `(rowEdit)`, `(paging)` to prevent the action
6. **Validation** — use template-driven validators on columns (`required`, `min`, `max`, `email`, `pattern`) or reactive validators via `(formGroupCreated)`
7. **Use the correct component type for `viewChild`** — `IgxGridComponent`, `IgxTreeGridComponent`, `IgxHierarchicalGridComponent`, or `IgxPivotGridComponent`
8. **Import the correct directives/components** — `IGX_GRID_DIRECTIVES`, `IGX_TREE_GRID_DIRECTIVES`, `IGX_HIERARCHICAL_GRID_DIRECTIVES`, or `IGX_PIVOT_GRID_DIRECTIVES`
9. **Use signals for data** — `[data]="myData()"` with `signal<T[]>([])`

## See Also

- [`data-operations.md`](./data-operations.md) — Sorting, filtering, grouping, and canonical grid import patterns
- [`paging-remote.md`](./paging-remote.md) — Paging, remote data operations, virtualization
- [`state.md`](./state.md) — State persistence, Tree Grid / Hierarchical Grid / Pivot Grid / Grid Lite data operations
- [`structure.md`](./structure.md) — Grid structure, column configuration, templates, layout, selection
- [`../../igniteui-angular-components/SKILL.md`](../../igniteui-angular-components/SKILL.md) — Non-grid Ignite UI components
- [`../../igniteui-angular-theming/SKILL.md`](../../igniteui-angular-theming/SKILL.md) — Theming & Styling
