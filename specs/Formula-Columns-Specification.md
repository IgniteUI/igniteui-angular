# Formula (Calculated) Columns Specification

### Contents

1. [Overview](#overview)
2. [User Stories](#user-stories)
3. [Functionality](#functionality)

    3.1. [End-User Experience](#end-user-xp)

    3.2. [Developer Experience](#dev-xp)

    3.3. [Expression Language](#expression-language)

    3.4. [Architecture](#architecture)

    3.5. [Feature Integration](#feature-integration)

    3.6. [Globalization/Localization](#globalization)

    3.7. [Keyboard Navigation](#keyboard)

    3.8. [API](#api)
4. [Test Scenarios](#test-scenarios)

    4.1. [Automation](#automation)

    4.2. [Manual](#manual)
5. [Accessibility](#accessibility)
6. [Assumptions and Limitations](#assumptions-and-limitations)
7. [References](#references)

### Owned by

**Team Name**

**Developer Name**

### Requires approval from

- [ ] Peer Developer Name | Date:
- [ ] Platform Architect Name | Date:

### Signed off by

- [ ] Product Owner Name | Date:
- [ ] Platform Architect Name | Date:

## Revision History

| Version | User | Date | Notes |
|--------:|------|------|-------|
| 0.1 | | | Initial draft — engine, UI, API surface, test plan, resolved design questions |

## <a name='overview'>1. Overview</a>

A **formula column** (also called a *calculated column*) is a grid column whose value is **derived from an
expression evaluated against the row** instead of being read from a stored field. The derived value is produced
*before* the data pipeline runs, so the column behaves like a stored field for every other grid feature —
sorting, filtering, grouping, summaries, search, clipboard and export.

Crucially, formula columns are **authorable at run time by the end user**: the grid ships a toolbar action that
opens a formula editor dialog, in which the user types `=[Price] * [Quantity]`, names the column, picks a result
data type, previews the result and commits. The new column is then indistinguishable from a developer-declared
one.

Today the grid has no concept of a derived value. Every value path resolves a column against the record by field
path — `resolveNestedPath(record, columnFieldPath(field))` — in
[`filtering-strategy.ts:270`](../projects/igniteui-angular/core/src/data-operations/filtering-strategy.ts#L270),
[`grid-sorting-strategy.ts:103`](../projects/igniteui-angular/core/src/data-operations/grid-sorting-strategy.ts#L103),
[`merge-strategy.ts:120`](../projects/igniteui-angular/core/src/data-operations/merge-strategy.ts#L120),
[`tree-grid-filtering-strategy.ts:34`](../projects/igniteui-angular/core/src/data-operations/tree-grid-filtering-strategy.ts#L34)
and [`pipes.ts:336`](../projects/igniteui-angular/grids/core/src/common/pipes.ts#L336).
Derived columns are therefore faked in one of two lossy ways:

1. **`formatter`** ([`column.component.ts:735`](../projects/igniteui-angular/grids/core/src/columns/column.component.ts#L735))
   changes only what is *rendered*. Sorting, filtering, grouping, summaries, search and export still see the
   underlying (usually `undefined`) field value. It is declared `/* blazorOnlyScript */`, so it does not cross
   over to the Web Components / Blazor wrappers.
2. **Pre-computing the value into the data source.** This works, but it forces the app to re-derive on every
   edit, breaks down with remote data and batch editing, bloats the row model, and makes the set of derived
   columns something only a *developer* can change, at build time.

The documented escape hatch — an unbound column plus custom strategies — requires a matched set of
`sortStrategy`, `filters`, `groupingComparer`, `mergingComparer` and `summaries` per column just to make one
derived column behave like a real one, and it cannot be driven from a dialog at all.

### Objectives

The feature includes the following:

- A safe, serializable, `eval`-free expression language with cross-column references and a function library.
- A single **value-resolution hook** so that sorting, filtering, grouping, merging, summaries, search, clipboard
  and export see the computed value with no per-feature strategy code.
- A dependency graph with incremental recalculation on cell edit, row edit, transactions and `data`
  reassignment.
- Read-only cells by default — `editable` on a formula column means "edit the *formula*", not the value.
- Contained, Excel-shaped error values (`#DIV/0!`, `#VALUE!`, …) that never throw through the pipeline.
- A **formula editor dialog** with inline validation, autocomplete, a function list and a live preview.
- A **toolbar entry point** mirroring `igx-grid-toolbar-advanced-filtering`, plus edit/delete from the column's
  Excel-style-filtering menu.
- Round-tripping of user-created columns through `IgxGridStateDirective`.
- Full keyboard, screen reader, theming and localization parity with the rest of the grid UI.

### Acceptance criteria

> **Must-have before we can consider the feature a sprint candidate**

1. A column can declare a formula instead of (or in addition to) a `field`, and the result is what the whole
   pipeline sees — not just the renderer.
2. Formulas may reference other columns, including other formula columns, by header or by field name.
3. Formula columns are sortable, filterable, groupable and summarizable with **no extra strategy code**.
4. The result has a `dataType` (inferred, overridable) so date/number/currency `pipeArgs`, editors and filtering
   operands work unchanged.
5. Cells are read-only by default; editing a dependency recalculates dependents through cell edit, row edit,
   batch editing/transactions and `data` reassignment.
6. Evaluation errors are contained to the offending cell; circular dependencies are detected at definition time.
7. Formula definitions — including ones created at run time by the user — round-trip through
   `IgxGridStateDirective`.
8. Excel and CSV export contain the computed values.
9. The primary authoring form is a **string**, so it marshals to the Web Components and Blazor wrappers.
10. The grid exposes a toolbar action that opens the editor and adds a calculated column on commit; existing
    formula columns can be edited and deleted without losing grid state.
11. The editor validates as the user types and blocks commit with a message pointing at the offending token.
12. The whole feature can be switched off, or restricted to a set of columns, by the developer.
13. No `eval` and no `new Function` anywhere in the evaluation path.

### Scope of the MVP

The MVP is deliberately end-to-end — engine *and* UI — because a developer-only API does not solve the problem
that motivates the request. It ships on **`igx-grid` only**, with values-only export and a deliberately small
function library.

**Explicitly out of scope for the MVP:**

- Cross-row / cross-sheet references (`SUM(A1:A10)`, references to *other* rows). The MVP is strictly
  **row-scoped**.
- Column-level aggregates inside row formulas (`[Price] / SUM([Price])`) — see [Q4](#q4).
- Circular reference *resolution* beyond detection and clear error reporting.
- Server-side formula evaluation for remote data — see [R3](#r3).
- Export of live `=` worksheet formulas to Excel (values only in the MVP).
- Tree Grid aggregate references, Hierarchical Grid per-island formulas, Pivot calculated measures, Grid Lite —
  see [Q5](#q5).

### Delivery phases

| Phase | Content |
|-------|---------|
| **MVP (v1)** | Engine, full pipeline participation, recalculation on edit, state persistence, formula editor UI with toolbar entry point, validation, autocomplete, error presentation, theming, a11y and localization. `igx-grid` only. |
| **v1.next** | Real `=` worksheet formula export from `IgxExcelExporterService` (AST → A1/R1C1 translation), expanded function library, richer editor affordances (signature help, formula history/reuse), conditional formatting over formula columns. |
| **v2** | Tree Grid (formulas over hierarchical records, including references to aggregated children), Hierarchical Grid (per-island formulas), Pivot Grid calculated *measures* (a related but distinct feature — likely its own issue), Grid Lite scope decision. |

## <a name='user-stories'>2. User Stories</a>

**End-user stories:**

- Story 1: As an end user, I want to create a new column from an expression over existing columns, so that I can
  see derived data without asking a developer to change the application.
- Story 2: As an end user, I want to reference columns by the header text I can see, so that I do not have to
  know the underlying field names.
- Story 3: As an end user, I want the editor to tell me *while I type* that a column or function name is wrong
  and where, so that I can fix it before committing.
- Story 4: As an end user, I want to pick from a list of available columns and functions, so that I do not have
  to memorise names or spelling.
- Story 5: As an end user, I want to preview the result over the first few rows before creating the column, so
  that I can confirm the formula does what I meant.
- Story 6: As an end user, I want to give the new column a header, a result data type and a display format, so
  that it reads like the rest of the grid.
- Story 7: As an end user, I want to sort, filter, group and summarize a calculated column exactly like any
  other column.
- Story 8: As an end user, I want the calculated values to update when I edit a cell they depend on, so that the
  grid stays consistent.
- Story 9: As an end user, I want a clear error in the cell (and an indicator on the header) when a formula
  cannot be evaluated for a row, so that I can tell a bad row from a blank one.
- Story 10: As an end user, I want to edit or delete a calculated column I created, without losing my sorting,
  filtering and grouping.
- Story 11: As an end user, I want my calculated columns to still be there after I reload the app.
- Story 12: As an end user, I want to copy calculated cells to the clipboard and export them to Excel/CSV and
  get the computed values.
- Story 13: As an end user, I want the editor to be fully operable from the keyboard and announced by my screen
  reader.

**Developer stories:**

- Story 1: As a developer, I want to declare a formula column in markup with a string expression, so that it
  works in the Angular, Web Components and Blazor wrappers alike.
- Story 2: As a developer, I want a TypeScript escape hatch for formulas that the expression language cannot
  express.
- Story 3: As a developer, I want formula columns to participate in sorting, filtering, grouping and summaries
  without writing a strategy per column.
- Story 4: As a developer, I want to override the inferred result data type and supply `pipeArgs`, so that
  currency/date/percent formatting works unchanged.
- Story 5: As a developer, I want to add, edit and remove formula columns programmatically, so that I can build
  my own authoring UI.
- Story 6: As a developer, I want to validate an expression standalone and get a structured, positioned error,
  so that I can drive my own editor.
- Story 7: As a developer, I want to register custom functions and have them show up in the editor's function
  list and autocomplete with no extra work.
- Story 8: As a developer, I want to switch end-user authoring off entirely, or restrict which columns can be
  referenced, so that apps that must not let users derive new data can comply.
- Story 9: As a developer, I want formula definitions to be part of the grid state so that I can persist and
  restore them.
- Story 10: As a developer, I want to be notified when a column is added, edited or removed and when a formula
  errors, so that I can log and react.
- Story 11: As a developer, I want to be sure the evaluator never uses `eval`/`new Function`, so that the grid
  works under a strict Content Security Policy.
- Story 12: As a developer, I want apps that never use a formula column to pay for neither the parser nor the
  editor UI.

## <a name='functionality'>3. Functionality</a>

### <a name='end-user-xp'>3.1. End-User Experience</a>

#### Creating a calculated column

The entry point is a toolbar action, placed alongside the existing ones and behaving the same way:

```html
<igx-grid [data]="data" [allowFormulaColumns]="true">
    <igx-grid-toolbar>
        <igx-grid-toolbar-actions>
            <igx-grid-toolbar-formula-column></igx-grid-toolbar-formula-column>
        </igx-grid-toolbar-actions>
    </igx-grid-toolbar>
</igx-grid>
```

Activating it opens the **formula editor dialog** in a modal overlay, following the anatomy of the advanced
filtering dialog ([`advanced-filtering-dialog.component.ts`](../projects/igniteui-angular/grids/core/src/filtering/advanced-filtering/advanced-filtering-dialog.component.ts)):
a draggable header, a body, and an apply/cancel footer.

```text
┌─ Add calculated column ────────────────────────────────────────────── [drag] ─┐
│                                                                               │
│  Column name          Result type            Format                           │
│  ┌─────────────────┐  ┌──────────────────┐   ┌──────────────────────────────┐ │
│  │ Total           │  │ Currency      ▾  │   │ 1.2-2, EUR                   │ │
│  └─────────────────┘  └──────────────────┘   └──────────────────────────────┘ │
│                                                                               │
│  Formula                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────┐  │
│  │ = [Price] * [Quantity] * (1 - [Discount])                               │  │
│  └─────────────────────────────────────────────────────────────────────────┘  │
│  ⚠ Unknown column 'Qty' at position 10.                                       │
│                                                                               │
│  ┌── Columns ──────────────┐  ┌── Functions ──────────────────────────────┐   │
│  │ Price          number   │  │ ▾ Math    ABS ROUND ROUNDUP ROUNDDOWN …   │   │
│  │ Quantity       number   │  │ ▾ Logic   IF IFS AND OR NOT ISBLANK …     │   │
│  │ Discount       percent  │  │ ▾ Text    CONCAT LEFT RIGHT MID LEN …     │   │
│  │ Cost           currency │  │ ▾ Date    TODAY NOW YEAR MONTH DAY …      │   │
│  └─────────────────────────┘  │ IF(condition, value_if_true, value_if_… ) │   │
│                               └───────────────────────────────────────────┘   │
│  Preview                                                                      │
│  ┌───────────┬────────────┬────────────┬───────────────────────────────────┐  │
│  │ Price     │ Quantity   │ Discount   │ Total                             │  │
│  │ 18.00     │ 12         │ 0.10       │ €194.40                           │  │
│  │ 19.00     │ 40         │ 0.00       │ €760.00                           │  │
│  │ 10.00     │ 0          │ 0.05       │ €0.00                             │  │
│  └───────────┴────────────┴────────────┴───────────────────────────────────┘  │
│                                                                               │
│                                              [ Cancel ]   [ Add column ]      │
└───────────────────────────────────────────────────────────────────────────────┘
```

Behaviour:

- The **formula input** is validated on every keystroke (debounced). The validation message names the error and
  points at the offending token and position. **Apply is disabled while the expression is invalid or empty.**
- The **Columns** list shows every referenceable column by header, with its data type. Double-click, `Enter`, or
  drag inserts `[Header]` at the caret.
- The **Functions** list is generated from the public function registry and grouped by category. Selecting a
  function shows its signature and description; double-click/`Enter` inserts `NAME()` and places the caret
  inside the parentheses.
- **Autocomplete** is offered inline: typing `[` opens the column list filtered as the user types; typing two or
  more identifier characters at a position where a function is legal opens the function list. Implemented with
  [`IgxAutocompleteDirective`](../projects/igniteui-angular/drop-down/src/drop-down/autocomplete/autocomplete.directive.ts).
- The **result type** defaults to the type inferred from the expression and can be overridden. The **format**
  editor is type-aware and produces `pipeArgs`.
- The **preview** evaluates the formula over the first `previewRowCount` (default `5`) rows of
  `filteredSortedData` and renders the referenced columns plus the result, formatted with the chosen type and
  format. Preview cells that error render the error value.
- **Apply** creates the column and appends it after the last visible column; **Cancel** discards.

#### Editing and deleting

For a column that already has a formula, the Excel-style filtering menu gains two entries — *Edit formula* and
*Delete column* — rendered only when end-user authoring is enabled and an editor host is present. *Edit formula*
opens the same dialog pre-filled and in "edit" mode (the apply button reads *Save*). *Delete column* is only
offered for **user-created** columns; a developer-declared formula column can be edited but not deleted from the
UI.

Editing or deleting a formula column **must not reset unrelated grid state**: sorting, filtering, grouping,
pinning, hiding, row selection and expansion are preserved. Sorting/filtering/grouping expressions that
reference a *deleted* column are dropped, consistent with how `updateColumns` recreates the filtering trees
([`grid-base.directive.ts` → `updateColumns`](../projects/igniteui-angular/grids/grid/src/grid-base.directive.ts)).

#### Cells and errors

- Formula cells render like any other cell of their `dataType`, using the column's `pipeArgs`.
- Formula cells are **read-only**: they are skipped by cell/row edit entry, cannot be entered with `Enter`/`F2`,
  and are excluded from the row-edit form. They remain navigable, selectable, copyable and searchable.
- A cell whose evaluation failed renders a themed error state showing the Excel-shaped error value
  (`#DIV/0!`, `#VALUE!`, `#REF!`, `#NAME?`, `#NUM!`, `#CIRCULAR!`) with a tooltip carrying the message. The
  cell is decorated with `aria-invalid="true"` and an `aria-describedby` pointing at a visually hidden
  description.
- When **any** row in the column errored, the header shows an error indicator with an accessible label and a
  tooltip stating how many rows failed.
- `formulaErrorTemplate` on the column overrides the error cell rendering.

### <a name='dev-xp'>3.2. Developer Experience</a>

#### Declarative

```html
<igx-column header="Total"
            formula="[Price] * [Quantity] * (1 - [Discount])"
            dataType="currency"
            [pipeArgs]="{ digitsInfo: '1.2-2', currencyCode: 'EUR' }">
</igx-column>

<igx-column header="Status" [formula]="statusFormula" dataType="string"></igx-column>
```

```typescript
public statusFormula = `IF([Stock] = 0, 'Out of stock', IF([Stock] < 10, 'Low', 'OK'))`;
```

A formula column does not need a `field`. When `field` is omitted the grid generates a stable synthetic key from
the header (`formula_total`, deduplicated with a numeric suffix) and assigns it, so that every existing
field-keyed mechanism — selection, state, export, summaries cache — keeps working unchanged.

When both `field` and `formula` are set, the formula wins for value resolution and the stored field value is
ignored; this is the supported way to *shadow* an existing field.

#### Column definition objects

```typescript
grid.columns = [
    { field: 'Price', dataType: 'number' },
    { field: 'Quantity', dataType: 'number' },
    {
        header: 'Total',
        // string form: serializable, works in WC/Blazor, round-trips through grid state,
        // and is the same shape the UI produces
        formula: '[Price] * [Quantity]',
        dataType: 'currency'
    },
    {
        header: 'Margin %',
        // escape hatch: full TS, Angular-only, /* blazorOnlyScript */, not authorable from the UI
        formulaFn: (rowData: any) => (rowData.Total - rowData.Cost) / rowData.Total,
        dependsOn: ['Total', 'Cost'],   // explicit deps, since they cannot be parsed
        dataType: 'percent'
    }
];
```

#### Runtime authoring — what the UI calls under the hood

```typescript
grid.addFormulaColumn({ header: 'Total', formula: '[Price] * [Quantity]', dataType: 'currency' });

// recalculates dependents
grid.getColumnByName('formula_total').formula = '[Price] * [Quantity] * 1.2';

grid.removeFormulaColumn('formula_total');
```

#### Validation, usable standalone by an app building its own editor

```typescript
const result = grid.formulaEngine.validate('[Price] * [Qty]');
// {
//   valid: false,
//   errors: [{ code: 'UNKNOWN_COLUMN', message: "Unknown column 'Qty'.", token: 'Qty', position: 10, length: 3 }],
//   dataType: undefined,
//   references: ['Price']
// }
```

#### Custom functions

```typescript
grid.formulaEngine.registerFunction({
    name: 'VATINCL',
    category: 'Math',
    minArgs: 1,
    maxArgs: 2,
    returnType: 'number',
    description: 'Adds VAT to a net amount. VATINCL(amount, [rate=0.2])',
    evaluate: (args) => Number(args[0]) * (1 + (args[1] === undefined ? 0.2 : Number(args[1])))
});
```

Registering a function surfaces it in the editor's function list, its autocomplete and its signature help with
no extra work — the UI is generated from the registry.

#### Turning the feature off / restricting it

```html
<!-- no end-user authoring at all; developer-declared formula columns still work -->
<igx-grid [allowFormulaColumns]="false"></igx-grid>

<!-- authoring allowed, but only these columns may be referenced -->
<igx-grid [allowFormulaColumns]="true" [formulaColumnFields]="['Price', 'Quantity', 'Discount']"></igx-grid>
```

`allowFormulaColumns` defaults to `false`. It gates only **end-user authoring** — the toolbar action renders
disabled and the Excel-style menu entries are hidden. Developer-declared `formula` columns are unaffected, so
turning the switch on is never required to use the engine.

#### Events

```typescript
grid.formulaColumnAdded.subscribe((e: IFormulaColumnEventArgs) => { /* ... */ });
grid.formulaColumnEdited.subscribe((e: IFormulaColumnEventArgs) => { /* ... */ });
grid.formulaColumnRemoved.subscribe((e: IFormulaColumnEventArgs) => { /* ... */ });
grid.formulaError.subscribe((e: IFormulaErrorEventArgs) => { /* ... */ });
```

### <a name='expression-language'>3.3. Expression Language</a>

The language is **row-scoped**: an expression sees exactly one record and produces exactly one value. It is
locale-independent in its stored form (see [Q3](#q3)).

#### Grammar

```ebnf
expression   = logical_or ;
logical_or   = logical_and , { "OR" , logical_and } ;
logical_and  = comparison , { "AND" , comparison } ;
comparison   = concat , { ( "=" | "<>" | "<" | "<=" | ">" | ">=" ) , concat } ;
concat       = additive , { "&" , additive } ;
additive     = multiplicative , { ( "+" | "-" ) , multiplicative } ;
multiplicative = power , { ( "*" | "/" | "%" ) , power } ;
power        = unary , { "^" , unary } ;                (* right associative *)
unary        = [ "-" | "+" | "NOT" ] , primary ;
primary      = number | string | boolean | "NULL"
             | reference | function_call | "(" , expression , ")" ;
reference    = "[" , { ? any char except "]" ? } , "]" ;
function_call = identifier , "(" , [ expression , { "," , expression } ] , ")" ;
```

A leading `=` is accepted and stripped, so users may type either `[Price] * 2` or `=[Price] * 2`. The canonical
stored form has no leading `=`.

#### Operator precedence

From lowest to highest binding:

| Precedence | Operators | Associativity | Notes |
|-----------:|-----------|---------------|-------|
| 1 | `OR` | left | Logical or |
| 2 | `AND` | left | Logical and |
| 3 | `=` `<>` `<` `<=` `>` `>=` | left | Comparison; `=` is equality, not assignment |
| 4 | `&` | left | String concatenation |
| 5 | `+` `-` | left | Addition / subtraction |
| 6 | `*` `/` `%` | left | `%` is modulo |
| 7 | `^` | **right** | Exponentiation |
| 8 | unary `-` `+` `NOT` | right | |
| 9 | `(` `)`, function call, reference | — | Primary |

#### References

`[Column Header]` or `[field.nested.path]`. Resolution order when parsing:

1. Exact, case-insensitive match on a column `header`.
2. Exact, case-sensitive match on a column `field`, including dotted nested paths.

References are **canonicalized to `field` when stored**, so renaming a header never breaks a saved formula
(see [Q1](#q1)). The editor renders the canonical form back as headers for display.

A reference to a column that does not exist yields `#REF!` at *definition* time, reported as an
`UNKNOWN_COLUMN` validation error before commit.

#### Literals

| Literal | Syntax | Example |
|---------|--------|---------|
| Number | Decimal, `.` as decimal separator, optional exponent | `12`, `3.5`, `1.2e3` |
| String | Single-quoted; `''` escapes a quote | `'Low'`, `'it''s'` |
| Boolean | `TRUE` / `FALSE`, case-insensitive | `TRUE` |
| Null | `NULL`, case-insensitive | `NULL` |

#### Type coercion

| Situation | Rule |
|-----------|------|
| Arithmetic on a non-numeric string | Numeric-looking strings coerce; otherwise `#VALUE!` |
| Arithmetic on `null` / `undefined` / `''` | Treated as `0` |
| `&` on any value | Coerced to string; `null` becomes `''` |
| Comparison of mixed types | The operands are coerced to a common type first: number vs. numeric string → number; boolean vs. number → number (`TRUE` = 1); anything vs. non-numeric string → string. `NULL` equals only `NULL`, and is less than every other value. Types that cannot be brought to a common type yield `#VALUE!` |
| `Date` in arithmetic | Coerced to epoch milliseconds |
| Division by zero | `#DIV/0!` |
| Any operand already an error | Propagates unchanged (except inside `IFERROR`/`ISERROR`) |

#### Result data type inference

The parser infers a `GridColumnDataType` from the AST root: arithmetic and math functions → `number`;
comparison, logical functions and `ISBLANK`/`ISERROR` → `boolean`; `&` and text functions → `string`;
`TODAY`/`NOW`/`EDATE` → `date`. `IF`/`IFS` infer the common type of their branches, falling back to `string`.
An explicit `dataType` on the column always wins.

#### Function library (MVP)

| Category | Functions |
|----------|-----------|
| Math | `ABS` `ROUND` `ROUNDUP` `ROUNDDOWN` `CEILING` `FLOOR` `MIN` `MAX` `SUM` `POWER` `SQRT` `MOD` |
| Logic | `IF` `IFS` `AND` `OR` `NOT` `ISBLANK` `ISERROR` `IFERROR` |
| Text | `CONCAT` `LEFT` `RIGHT` `MID` `LEN` `UPPER` `LOWER` `TRIM` `SUBSTITUTE` `TEXT` |
| Date | `TODAY` `NOW` `YEAR` `MONTH` `DAY` `DATEDIF` `EDATE` |

`MIN`, `MAX` and `SUM` are **row-scoped variadic** functions over their arguments (`SUM([A], [B], [C])`), *not*
column aggregates. Function names are always English in the stored expression (see [Q6](#q6)).

#### Error values

| Value | Raised when |
|-------|-------------|
| `#DIV/0!` | Division or modulo by zero |
| `#VALUE!` | An operand cannot be coerced to the required type |
| `#REF!` | A referenced column no longer exists at evaluation time |
| `#NAME?` | An unknown function name survived to evaluation |
| `#NUM!` | A numeric result is not finite (overflow, `SQRT` of a negative number) |
| `#CIRCULAR!` | The column participates in a dependency cycle |

Errors are values, not exceptions. They flow through the pipeline: Excel-style filtering lists them as a
distinct value, summaries skip them, and export writes the error string.

Ordering deserves a note. `DefaultSortingStrategy.compareValues`
([sorting-strategy.ts](../projects/igniteui-angular/core/src/data-operations/sorting-strategy.ts#L77))
today handles only the nullish case explicitly and otherwise falls through to the JavaScript relational
operators, which return `false` in both directions for an object operand — an error value would compare
*equal* to everything and land in an arbitrary position. `compareValues` therefore gains one more guard, ahead
of the existing nullish checks, that orders `FormulaError` after every non-error value in ascending order.
That is the only change the sorting strategy needs, and it is covered by a dedicated regression test.

### <a name='architecture'>3.4. Architecture</a>

#### Package layout

| Artifact | Location | Entry point | Rationale |
|----------|----------|-------------|-----------|
| Tokenizer, parser, AST, evaluator, function registry, error types | `projects/igniteui-angular/core/src/data-operations/formula/` | `igniteui-angular/core` | Zero Angular dependencies; unit-testable in isolation; reusable by Grid Lite / Pivot later. |
| Value resolver + memoization + dependency graph | `projects/igniteui-angular/core/src/data-operations/formula/` | `igniteui-angular/core` | Sits on the data-operations hot path; must be reachable from the strategies. |
| `formula` / `formulaFn` / `dependsOn` / `isFormulaColumn` on the column | `grids/core/src/columns/column.component.ts`, `core/src/data-operations/grid-types.ts` | existing | |
| `IgxFormulaEditorComponent`, `IgxGridToolbarFormulaColumnComponent`, formula column actions | `projects/igniteui-angular/grids/formula-editor/` | **new**: `igniteui-angular/grids/formula-editor` | Opt-in, keeps overlay/drop-down/dialog cost out of `grids/core` (see [Q7](#q7)). |

The new entry point follows the existing convention exactly — a directory with an empty `ng-package.json`, an
`index.ts` re-exporting `./src/public_api`, and a `src/public_api.ts` — the same shape as
`projects/igniteui-angular/query-builder/` and `projects/igniteui-angular/grids/core/`. No `angular.json` or
`tsconfig.json` change is needed; the `"igniteui-angular/*"` path mapping already covers it.

`grids/core` must have **no static import** of the editor. The editor entry point provides an
`IGX_FORMULA_EDITOR_HOST` injection token; `grids/core` renders the Excel-style menu entries and the toolbar
action only when that token resolves, so an app that never imports the editor pays for neither the dialog nor
its dependencies.

#### Evaluation pipeline

```text
formula string
   │
   ├── tokenize()  ──► Token[]  { kind, value, position, length }
   │                   errors: UNTERMINATED_STRING, UNTERMINATED_REFERENCE, UNEXPECTED_CHARACTER
   │
   ├── parse()     ──► FormulaNode (AST)
   │                   errors: UNEXPECTED_TOKEN, UNEXPECTED_END, UNBALANCED_PARENS, MAX_DEPTH_EXCEEDED
   │
   ├── bind()      ──► resolves references to column fields, functions to registry entries,
   │                   infers the result data type
   │                   errors: UNKNOWN_COLUMN, UNKNOWN_FUNCTION, ARITY_MISMATCH, CIRCULAR_REFERENCE
   │
   └── evaluate(record) ──► value | FormulaError
```

`tokenize` and `parse` are a hand-written scanner and a precedence-climbing (Pratt) parser; `evaluate` is a
tree-walking interpreter over the bound AST. **There is no `eval` and no `new Function` anywhere in this path**
(see [R2](#r2)).

#### Structured errors

The error contract is the *first* thing to land, because the editor's inline validation depends on it and the
engine and UI work streams cannot proceed in parallel until it is stable (see [R5](#r5)).

```typescript
export interface IFormulaParseError {
    code: FormulaErrorCode;   // 'UNKNOWN_COLUMN' | 'UNKNOWN_FUNCTION' | 'ARITY_MISMATCH' | 'UNEXPECTED_TOKEN' | ...
    message: string;          // localized, from the grid resource strings
    token?: string;           // the offending source text
    position: number;         // 0-based index into the expression string
    length: number;           // length of the offending token
}

export interface IFormulaValidationResult {
    valid: boolean;
    errors: IFormulaParseError[];
    references: string[];             // canonical column fields referenced, in source order
    dataType?: GridColumnDataType;    // inferred result type
}
```

#### The value-resolution hook

This is the single most important change and the one that makes sorting, filtering, grouping and merging work
for free. Every existing `resolveNestedPath(record, columnFieldPath(field))` call site routes through one
resolver that first asks whether the field belongs to a formula column:

```typescript
// core/src/data-operations/formula/formula-value-resolver.ts
export function resolveColumnValue(record: unknown, field: string, grid?: GridTypeBase): any {
    const column = grid?.getColumnByName(field);
    if (column?.isFormulaColumn) {
        return grid.formulaEngine.evaluate(column, record);
    }
    return resolveNestedPath(record, columnFieldPath(field));
}
```

Call sites, and how each is reached:

| Feature | Call site | Change |
|---------|-----------|--------|
| Filtering | [`filtering-strategy.ts:270`](../projects/igniteui-angular/core/src/data-operations/filtering-strategy.ts#L270) `FilteringStrategy.getFieldValue` | Already receives `grid`; swap `resolveNestedPath` for `resolveColumnValue`. |
| Excel-style filter value list | [`filtering-strategy.ts` `getFilterItems`](../projects/igniteui-angular/core/src/data-operations/filtering-strategy.ts) | Same swap; the unique-values list then enumerates computed values. |
| Tree Grid filtering | [`tree-grid-filtering-strategy.ts:34`](../projects/igniteui-angular/core/src/data-operations/tree-grid-filtering-strategy.ts#L34) | Same swap (resolves against `record.data`). |
| Sorting | [`grid-sorting-strategy.ts:103`](../projects/igniteui-angular/core/src/data-operations/grid-sorting-strategy.ts#L103) `IgxSorting.getFieldValue` | Extend the signature with `grid?` and thread it through. See the compatibility note below. |
| Grouping | `IgxGrouping` extends `IgxSorting`; group key at `grid-sorting-strategy.ts` (`getFieldValue(group[0], …)`) | Inherited for free once `IgxSorting` is updated. |
| Merging | [`merge-strategy.ts:120`](../projects/igniteui-angular/core/src/data-operations/merge-strategy.ts#L120) | Same swap. |
| Rendering | [`pipes.ts:336`](../projects/igniteui-angular/grids/core/src/common/pipes.ts#L336) `IgxGridDataMapperPipe` | Formula columns always take the resolver branch (they are treated as "nested path" columns for mapping purposes). |
| Cell value | [`grid-public-cell.ts:132`](../projects/igniteui-angular/grids/core/src/grid-public-cell.ts#L132) | Same swap, so `cell.value` is the computed value. |
| Summaries | [`grid-summary.service.ts` `calculateSummaries`](../projects/igniteui-angular/grids/core/src/summaries/grid-summary.service.ts) — `data.map(r => resolveNestedPath(r, columnPathParts[idx]))` | Same swap. `IgxSummaryOperand.operate(data, allData, fieldName, groupRecord)` then works unchanged, including group-level summaries. |
| Search / highlight | `rebuildMatchCache()` in [`grid-base.directive.ts`](../projects/igniteui-angular/grids/grid/src/grid-base.directive.ts) | Same swap; gated by `column.searchable` as today. |
| Clipboard / `getSelectedData` | `extractDataFromSelection()` in [`grid-base.directive.ts:7531`](../projects/igniteui-angular/grids/grid/src/grid-base.directive.ts#L7531) | Same swap. |
| Export (Excel/CSV) | [`base-export-service.ts:460`](../projects/igniteui-angular/grids/core/src/services/exporter-common/base-export-service.ts#L460) `exportRow` | Same swap; computed values are exported, `formatter` still applied where configured. |
| Validation | [`grid-validation.service.ts:61`](../projects/igniteui-angular/grids/core/src/grid-validation.service.ts#L61) `addFormControl` | **Skip** formula columns — no form control is created, so field validators never run against a derived value. |

**Compatibility note for sorting.** `IgxSorting.sortData` currently passes `this.getFieldValue` as an unbound
callback and `DefaultSortingStrategy.sort` re-binds it with `valueResolver.bind(this)`. To thread the grid
through, `sortData` passes an arrow closure that captures `grid` and forwards to `this.getFieldValue(obj, key,
isDate, isTime, grid)`. `Function.prototype.bind` on an arrow function is a no-op, so existing custom
`ISortingStrategy` implementations that call `valueResolver.bind(this)` keep working; the only observable change
is that `this` inside `getFieldValue` becomes the sorting *strategy owner* rather than the
`DefaultSortingStrategy` instance, which is what the overrides (e.g. `IgxDataRecordSorting.getFieldValue`)
already assume. A regression test covers a custom strategy that binds the resolver.

#### Dependency graph and invalidation

At definition time the engine builds a directed graph over column fields from each formula's parsed references
(or from `dependsOn` for `formulaFn`). The graph is used for three things:

1. **Cycle detection.** A depth-first search on insert reports `CIRCULAR_REFERENCE` before the column is
   committed. The offending column is not added (or, for an edit, the previous formula is kept) and the editor
   surfaces the cycle path (`Total → Margin → Total`).
2. **Evaluation order.** Formula-on-formula references are evaluated in topological order, so `[Margin]`
   referencing `[Total]` sees `Total`'s computed value.
3. **Incremental invalidation.** On `update_cell`
   ([`api.service.ts:148`](../projects/igniteui-angular/grids/core/src/api.service.ts#L148)) and `update_row`,
   the engine invalidates only *that record* × the transitive dependents of the edited field. On transaction
   commit/undo/redo, on `data` reassignment and on `pipeTrigger` bumps caused by a formula edit, the affected
   scope is widened accordingly.

| Trigger | Invalidation scope |
|---------|--------------------|
| `update_cell(field)` | one record × transitive dependents of `field` |
| `update_row` | one record × all formula columns |
| Transaction commit / undo / redo / clear | records touched by the transaction × their dependents |
| `data` setter, `IterableDiffer` change | whole cache |
| `column.formula` setter | that column and its transitive dependents, all records (formula version bump) |
| Column added / removed | dependents of the affected field; removal marks dependents `#REF!` |

#### Memoization

Evaluation must never run over the whole data set on every change-detection cycle. The cache is:

```typescript
WeakMap<object /* record */, Map<string /* column field */, { version: number; value: unknown }>>
```

- Keyed by **record identity**, so it is garbage-collected with the data and needs no manual eviction on
  `data` replacement.
- Each entry carries the **formula version** of the column; a version bump invalidates lazily on next read
  rather than eagerly walking the data.
- Visible rows are evaluated eagerly by the render path; everything else is evaluated lazily on first demand
  (sort, filter, group, summary, export).
- Primitive/frozen records that cannot be `WeakMap` keys fall back to evaluation without caching.

#### Zoneless safety

Recalculation must not mutate bound state during a render pass, or `NG0100`
(`ExpressionChangedAfterItHasBeenCheckedError`) appears in dev mode. Therefore:

- `evaluate()` is **pure** — it reads the record and writes only to the cache; it never touches grid state,
  never emits events and never bumps `pipeTrigger`.
- `formulaError` is emitted from the invalidation pass (an explicit, non-render-time step), not from
  `evaluate()`. Errors encountered during rendering are recorded on the cache entry and coalesced into a single
  emission scheduled outside the render pass.
- The header error indicator is derived from a signal that is written only during invalidation.

### <a name='feature-integration'>3.5. Feature Integration</a>

| Feature | Behaviour for a formula column |
|---------|--------------------------------|
| Sorting | Works. Sorts on the computed value; the only strategy change is the `FormulaError` guard in `compareValues` that orders errors after all other values. |
| Filtering (quick / row) | Works. Operands are chosen from the resolved `dataType`. |
| Excel-style filtering | Works. The unique-values list enumerates computed values; error values appear as a distinct entry. |
| Advanced filtering / Query Builder | Works. Formula columns appear as fields in the generated entity, like any other filterable column. |
| Grouping | Works. Group keys are computed values; `groupingComparer` still honoured if supplied. |
| Summaries | Works, including group-level summaries. Error values are skipped by the operands. |
| Merging | Works via `merge-strategy.ts`. |
| Search / highlight | Works when `searchable`. |
| Cell / row editing | Cells are read-only; the column is skipped by the editing pipeline and by `IgxGridValidationService`. `editable = true` means "the formula may be edited from the UI". |
| Batch editing / transactions | Recalculates on commit, undo, redo and clear. Formula cells produce no transactions of their own. |
| Row adding | New rows evaluate their formulas as soon as the row exists. |
| Paging | Works. Only the current page is evaluated eagerly. |
| Pinning / hiding / moving / resizing | Work unchanged — a formula column is an ordinary column for layout purposes. |
| Column selection / cell selection | Work unchanged. |
| Clipboard copy | Copies computed values (and formatted values when `formatter` is applied). |
| Excel / CSV export | Exports computed values. Live `=` worksheet formulas are v1.next. |
| Grid state | `formula`, `formulaResultType`, `formulaFormat` and `userDefined` are added to `IColumnState`; user-created columns are recreated on restore. |
| Multi-row layout | Supported — a formula column may be placed in an MRL block like any other. |
| Remote data (`noop` strategies) | Degraded, see [R3](#r3). |
| Tree Grid / Hierarchical Grid / Pivot / Grid Lite | Out of scope for the MVP. |

#### Grid state persistence

`IColumnState` ([`state-base.directive.ts:61`](../projects/igniteui-angular/grids/core/src/state-base.directive.ts#L61))
gains four serializable members. The existing restore path already creates an `IgxColumnComponent` via
`createComponent(...)` when no matching column is found and then calls `updateColumns(newColumns)`, so
user-created formula columns are recreated by the same mechanism, in dependency order. Restoring a formula whose
references no longer resolve keeps the column and marks every cell `#REF!`, rather than dropping the column
silently.

Note that `formatter`, `summaries`, `sortStrategy`, `filters`, `groupingComparer` and `mergingComparer` are
deliberately **not** serialized today because they are functions; `formula` is a plain string and serializes
cleanly, which is precisely why the string form is the primary API (see [F12](#api) and [Q1](#q1)).
`formulaFn` is **not** persisted and is never produced by the UI.

### <a name='globalization'>3.6. Globalization/Localization</a>

All editor and error strings come from the grid resource strings. In this repository the strings are re-exported
from the shared `igniteui-i18n-resources` package and prefixed —
[`grid-resources.ts`](../projects/igniteui-angular/core/src/core/i18n/grid-resources.ts) applies
`prefixResource(IGX_PREFIX, …)` — so new keys are added upstream in `igniteui-i18n-resources` and translated for
every locale under
[`projects/igniteui-angular-i18n/src/i18n/`](../projects/igniteui-angular-i18n/src/i18n/)
(`BG CS DA DE ES FR HU IT JA KO NB NL PL PT RO SV TR ZH-HANS ZH-HANT`), whose per-locale
`grid-resources.ts` files re-export the prefixed resource.

| Key | Default (EN) |
|-----|--------------|
| `igx_grid_toolbar_formula_column_button_label` | `Calculated column` |
| `igx_grid_toolbar_formula_column_button_tooltip` | `Add a calculated column` |
| `igx_grid_formula_editor_title_add` | `Add calculated column` |
| `igx_grid_formula_editor_title_edit` | `Edit calculated column` |
| `igx_grid_formula_editor_name_label` | `Column name` |
| `igx_grid_formula_editor_name_placeholder` | `Enter a column name` |
| `igx_grid_formula_editor_expression_label` | `Formula` |
| `igx_grid_formula_editor_expression_placeholder` | `e.g. [Price] * [Quantity]` |
| `igx_grid_formula_editor_result_type_label` | `Result type` |
| `igx_grid_formula_editor_format_label` | `Format` |
| `igx_grid_formula_editor_columns_label` | `Columns` |
| `igx_grid_formula_editor_functions_label` | `Functions` |
| `igx_grid_formula_editor_preview_label` | `Preview` |
| `igx_grid_formula_editor_apply` | `Add column` |
| `igx_grid_formula_editor_save` | `Save` |
| `igx_grid_formula_editor_cancel` | `Cancel` |
| `igx_grid_formula_editor_delete` | `Delete column` |
| `igx_grid_formula_editor_delete_confirm` | `Delete the calculated column '{0}'?` |
| `igx_grid_formula_column_edit` | `Edit formula` |
| `igx_grid_formula_error_unknown_column` | `Unknown column '{0}'.` |
| `igx_grid_formula_error_unknown_function` | `Unknown function '{0}'.` |
| `igx_grid_formula_error_arity` | `'{0}' expects between {1} and {2} arguments.` |
| `igx_grid_formula_error_syntax` | `Unexpected '{0}'.` |
| `igx_grid_formula_error_unexpected_end` | `Unexpected end of formula.` |
| `igx_grid_formula_error_unbalanced_parens` | `Unbalanced parentheses.` |
| `igx_grid_formula_error_unterminated_string` | `Unterminated text value.` |
| `igx_grid_formula_error_unterminated_reference` | `Unterminated column reference.` |
| `igx_grid_formula_error_circular` | `Circular reference: {0}.` |
| `igx_grid_formula_error_max_depth` | `The formula is too complex.` |
| `igx_grid_formula_error_name_required` | `Enter a column name.` |
| `igx_grid_formula_error_name_duplicate` | `A column named '{0}' already exists.` |
| `igx_grid_formula_cell_error_label` | `Formula error: {0}` |
| `igx_grid_formula_column_error_indicator` | `{0} rows could not be calculated.` |

Notes:

- Error *values* (`#DIV/0!`, `#VALUE!`, `#REF!`, `#NAME?`, `#NUM!`, `#CIRCULAR!`) are **not** localized — they
  are stable, Excel-compatible sentinels. The accompanying message is localized.
- **Function names are always English** in the stored expression; only their descriptions and category labels in
  the editor are localized (see [Q6](#q6)).
- The stored expression is **locale-independent**: `.` decimal separator and `,` argument separator regardless
  of the application locale (see [Q3](#q3)).
- Number and date *results* are formatted by the existing `grid.i18nFormatter` using the column's `dataType`
  and `pipeArgs`, so they follow `grid.locale` like every other column.

### <a name='keyboard'>3.7. Keyboard Navigation</a>

#### Formula editor dialog

| Keys | Description |
|------|-------------|
| <kbd>Tab</kbd> / <kbd>Shift</kbd> + <kbd>Tab</kbd> | Move between the dialog's controls. Focus is trapped inside the dialog. |
| <kbd>Esc</kbd> | Closes the dialog without applying. If an autocomplete list is open, the first <kbd>Esc</kbd> closes only the list. |
| <kbd>Enter</kbd> | In the name/format inputs, applies the dialog when the expression is valid. In the columns/functions lists, inserts the highlighted item. |
| <kbd>Ctrl</kbd> + <kbd>Enter</kbd> | Applies the dialog from anywhere, when the expression is valid. |
| <kbd>&darr;</kbd> / <kbd>&uarr;</kbd> | In the expression input with an open autocomplete list, moves the active item. In the columns/functions lists, moves focus. |
| <kbd>Alt</kbd> + <kbd>&darr;</kbd> | In the expression input, opens the autocomplete list for the current token. |
| <kbd>[</kbd> | In the expression input, opens the column autocomplete list. |
| <kbd>Home</kbd> / <kbd>End</kbd> | In the columns/functions lists, moves to the first/last item. |

#### Grid

| Keys | Description |
|------|-------------|
| <kbd>Enter</kbd> / <kbd>F2</kbd> (on a formula cell) | Does nothing — formula cells are read-only. No edit mode is entered and no `cellEditEnter` is emitted. |
| <kbd>Ctrl</kbd> + <kbd>C</kbd> (on a formula cell/range) | Copies the computed value(s). |
| Arrow keys, <kbd>Tab</kbd>, <kbd>Home</kbd>/<kbd>End</kbd>, <kbd>Page&nbsp;Up</kbd>/<kbd>Page&nbsp;Down</kbd> | Navigate through formula cells exactly like ordinary cells. |
| <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>L</kbd> (on a formula column header, ESF mode) | Opens the Excel-style menu, from which *Edit formula* / *Delete column* are reachable. |

### <a name='api'>3.8. API</a>

#### IgxColumnComponent — Options

| Name | Description | Type | Default value | Valid values |
|------|-------------|------|---------------|--------------|
| `formula` | The expression that produces the column's value. Primary, serializable form; this is what the UI writes. Setting it re-parses, re-validates and invalidates dependents. | `string` | `undefined` | `'[Price] * [Quantity]'` |
| `formulaFn` | Angular-only escape hatch for formulas the expression language cannot express. `/* blazorOnlyScript */`. Not authorable from the UI and not persisted. | `(rowData: any) => any` | `undefined` | any function |
| `dependsOn` | Explicit dependencies for `formulaFn`, since they cannot be parsed. Ignored when `formula` is set. | `string[]` | `[]` | `['Total', 'Cost']` |
| `isFormulaColumn` | **Read-only.** `true` when `formula` or `formulaFn` is set. Consumed by editing, export, state and the column menu. | `boolean` | `false` | — |
| `formulaResultType` | Overrides the inferred result type. Equivalent to setting `dataType`; kept separate so state can distinguish "inferred" from "explicit". | `GridColumnDataType` | inferred | `'number'`, `'currency'`, `'date'`, … |
| `userDefined` | **Read-only.** `true` when the column was created at run time through `addFormulaColumn`. Only user-defined columns can be deleted from the UI. | `boolean` | `false` | — |
| `formulaErrorTemplate` | Template used to render a cell whose evaluation failed. Context: `{ $implicit: FormulaError, cell: CellType }`. | `TemplateRef<IgxFormulaErrorTemplateContext>` | `undefined` | — |

#### Grid — Options

| Name | Description | Type | Default value | Valid values |
|------|-------------|------|---------------|--------------|
| `allowFormulaColumns` | Master switch for **end-user authoring**. Does not affect developer-declared formula columns. | `boolean` | `false` | `true`, `false` |
| `formulaColumnFields` | Restricts which column fields may be referenced by user-authored formulas. Empty means "all referenceable columns". | `string[]` | `[]` | `['Price', 'Quantity']` |
| `formulaEngine` | The parse/validate/evaluate service. Injectable and swappable; assign a subclass to customise coercion or the registry. | `IgxFormulaEngine` | default instance | — |
| `remoteFormulaBehavior` | What formula columns do when the grid uses `noop` sorting/filtering strategies. See [R3](#r3). | `'disabled' \| 'clientPage'` | `'disabled'` | — |

#### Grid — Methods

| Name | Description | Return type | Parameters |
|------|-------------|-------------|------------|
| `addFormulaColumn` | Creates and appends a formula column. Validates first; throws `IgxFormulaDefinitionError` on an invalid definition. Emits `formulaColumnAdded`. | `ColumnType` | `definition: IFormulaColumnDefinition` |
| `removeFormulaColumn` | Removes a formula column by field. Dependent formula columns become `#REF!`. Emits `formulaColumnRemoved`. | `boolean` | `field: string` |
| `updateFormulaColumn` | Applies a new definition to an existing formula column in one pass, so dependents are invalidated once. Emits `formulaColumnEdited`. | `ColumnType` | `field: string, definition: Partial<IFormulaColumnDefinition>` |
| `openFormulaEditorDialog` | Opens the formula editor. Mirrors `openAdvancedFilteringDialog`. No-op when the editor entry point is not imported. | `void` | `overlaySettings?: OverlaySettings, column?: ColumnType` |
| `closeFormulaEditorDialog` | Closes the formula editor, optionally applying the pending changes. | `void` | `applyChanges: boolean` |

#### Grid — Events

| Name | Description | Cancelable | Parameters |
|------|-------------|------------|------------|
| `formulaColumnAdded` | Fires after a formula column has been created and added to the grid. | no | `IFormulaColumnEventArgs` |
| `formulaColumnEdited` | Fires after an existing formula column's definition has changed. | no | `IFormulaColumnEventArgs` |
| `formulaColumnRemoved` | Fires after a formula column has been removed. | no | `IFormulaColumnEventArgs` |
| `formulaError` | Fires, coalesced per invalidation pass, when one or more records failed to evaluate. | no | `IFormulaErrorEventArgs` |

#### IgxFormulaEngine

| Name | Description | Return type | Parameters |
|------|-------------|-------------|------------|
| `parse` | Tokenizes and parses an expression into an AST without binding it to a grid. | `IFormulaParseResult` | `expression: string` |
| `validate` | Parses **and** binds against the grid's columns and the function registry. The editor calls this on every keystroke. | `IFormulaValidationResult` | `expression: string, options?: IFormulaValidationOptions` |
| `evaluate` | Evaluates a bound column against one record, using the memoization cache. | `any \| FormulaError` | `column: ColumnType, record: unknown` |
| `registerFunction` | Adds a function to the registry. Surfaces automatically in the editor's list, autocomplete and signature help. | `void` | `definition: IFormulaFunctionDefinition` |
| `unregisterFunction` | Removes a function from the registry. | `boolean` | `name: string` |
| `getFunctions` | Returns the registry, grouped by category. Backs the editor's function list. | `IFormulaFunctionDefinition[]` | none |
| `getDependencies` | Returns the transitive dependencies of a column field. | `string[]` | `field: string` |
| `getDependents` | Returns the transitive dependents of a column field. | `string[]` | `field: string` |
| `invalidate` | Invalidates the cache for a record/field pair, a whole record, or everything. | `void` | `record?: unknown, field?: string` |
| `toDisplayForm` | Converts a canonical (field-referencing) expression to the header-referencing form shown in the editor. | `string` | `expression: string` |
| `toCanonicalForm` | Converts a header-referencing expression to the canonical field-referencing form for storage. | `string` | `expression: string` |

#### IgxFormulaEditorComponent

Selector `igx-formula-editor`. Usable standalone, outside the grid, by an app that wants the editor in its own
dialog.

| Name | Description | Type |
|------|-------------|------|
| `columns` (input) | The columns that may be referenced. | `FieldType[]` |
| `definition` (input) | The definition being edited. `undefined` puts the editor in "add" mode. | `IFormulaColumnDefinition` |
| `engine` (input) | The engine used for validation and preview. | `IgxFormulaEngine` |
| `previewData` (input) | Records used for the live preview. | `any[]` |
| `previewRowCount` (input) | How many rows the preview renders. | `number` (default `5`) |
| `resourceStrings` (input) | Localized strings. | `IGridResourceStrings` |
| `definitionChange` (output) | Emits on every valid change of the definition. | `EventEmitter<IFormulaColumnDefinition>` |
| `validationChange` (output) | Emits the validation result on every keystroke. | `EventEmitter<IFormulaValidationResult>` |
| `apply` (output) | Emits the committed definition. | `EventEmitter<IFormulaColumnDefinition>` |
| `cancel` (output) | Emits when the user cancels. | `EventEmitter<void>` |

#### IgxGridToolbarFormulaColumnComponent

Selector `igx-grid-toolbar-formula-column`. Mirrors `IgxGridToolbarAdvancedFilteringComponent`: injects
`IgxToolbarToken`, exposes `@Input() overlaySettings`, renders an `igxButton="outlined"` with an
`igx-icon`, and carries the wrapper code-generation annotations `/* blazorElement */`,
`/* wcElementTag: igc-grid-toolbar-formula-column */`, `/* blazorIndirectRender */`,
`/* blazorAlternateBaseType: GridToolbarBaseAction */`, `/* jsonAPIManageItemInMarkup */` and
`/* singleInstanceIdentifier */`. It renders **disabled** when `allowFormulaColumns` is `false`, and shows a
badge with the number of formula columns, mirroring the advanced-filtering column-count badge.

#### Interfaces

```typescript
/* marshalByValue */
/* tsPlainInterface */
export interface IFormulaColumnDefinition {
    /** Column header shown to the user. Required for user-created columns. */
    header: string;
    /** The expression, in canonical (field-referencing) form. */
    formula: string;
    /** Optional explicit field key. Generated from the header when omitted. */
    field?: string;
    /** Result data type. Inferred from the expression when omitted. */
    dataType?: GridColumnDataType;
    /** Display format for the result. */
    pipeArgs?: IColumnPipeArgs;
}

export interface IFormulaColumnEventArgs extends IBaseEventArgs {
    column: ColumnType;
    definition: IFormulaColumnDefinition;
    /** The previous definition; set only for `formulaColumnEdited`. */
    oldDefinition?: IFormulaColumnDefinition;
}

export interface IFormulaErrorEventArgs extends IBaseEventArgs {
    column: ColumnType;
    /** One entry per failing record, capped by `maxReportedFormulaErrors` (default 100). */
    errors: { rowData: any; rowKey: any; error: FormulaError }[];
    /** Total number of failing records, even when `errors` was capped. */
    errorCount: number;
}

export interface IFormulaFunctionDefinition {
    name: string;                       // always upper-case, English
    category: 'Math' | 'Logic' | 'Text' | 'Date' | string;
    minArgs: number;
    maxArgs: number;                    // Number.POSITIVE_INFINITY for variadic
    returnType: GridColumnDataType | 'any';
    description?: string;               // localized in the editor only
    evaluate: (args: unknown[]) => unknown;
}

export class FormulaError {
    public readonly kind: FormulaErrorKind;   // '#DIV/0!' | '#VALUE!' | '#REF!' | '#NAME?' | '#NUM!' | '#CIRCULAR!'
    public readonly message: string;
    public toString(): string;                // returns `kind`, so string coercion and export behave
}
```

`IColumnState` gains:

```typescript
export interface IColumnState {
    // ...existing members...
    formula?: string;
    formulaResultType?: GridColumnDataType;
    formulaFormat?: IColumnPipeArgs;
    userDefined?: boolean;
}
```

## <a name='test-scenarios'>4. Test Scenarios</a>

### <a name='automation'>4.1. Automation</a>

#### Tokenizer and parser (no Angular, `core/src/data-operations/formula/`)

- Should tokenize numbers, single-quoted strings with escaped quotes, booleans, `NULL`, identifiers and references
- Should accept and strip a leading `=`
- Should parse all operators with the documented precedence and associativity, including right-associative `^`
- Should parse unary `-`, `+` and `NOT`
- Should parse nested function calls and parenthesised sub-expressions
- Should parse references containing spaces and dots (`[user.name.first]`, `[Unit Price]`)
- Should report `UNTERMINATED_STRING` with the correct position
- Should report `UNTERMINATED_REFERENCE` with the correct position
- Should report `UNEXPECTED_TOKEN` with the offending token text, position and length
- Should report `UNEXPECTED_END` for a truncated expression
- Should report `UNBALANCED_PARENS` for `((1 + 2)`
- Should report `MAX_DEPTH_EXCEEDED` beyond the configured nesting limit and not overflow the stack
- Should return **all** errors, not just the first, so the editor can underline every one
- Should be pure — parsing the same expression twice produces structurally equal ASTs

#### Binder and validator

- Should resolve `[Header]` case-insensitively to the column's field
- Should resolve `[field]` and dotted nested paths case-sensitively
- Should prefer a header match over a field match when both exist
- Should report `UNKNOWN_COLUMN` with the token and position
- Should report `UNKNOWN_FUNCTION` with the token and position
- Should report `ARITY_MISMATCH` with the expected minimum and maximum
- Should infer `number`, `string`, `boolean` and `date` result types from the AST root
- Should infer the common branch type for `IF`/`IFS` and fall back to `string`
- Should let an explicit `dataType` win over inference
- Should return `references` in source order, canonicalized to fields
- Should honour `formulaColumnFields` and reject references to columns outside it
- Should detect a direct cycle (`A → A`) and report `CIRCULAR_REFERENCE`
- Should detect an indirect cycle (`A → B → C → A`) and report the cycle path
- Should not report a cycle for a diamond dependency (`A → B`, `A → C`, `B → D`, `C → D`)

#### Evaluator

- Should evaluate arithmetic, comparison, logical and concatenation operators
- Should treat `null`, `undefined` and `''` as `0` in arithmetic
- Should coerce numeric-looking strings and return `#VALUE!` otherwise
- Should return `#DIV/0!` for division and modulo by zero
- Should return `#NUM!` for a non-finite result and for `SQRT` of a negative number
- Should return `#REF!` when a referenced column has been removed
- Should propagate an error operand unchanged through operators
- Should **not** propagate through `IFERROR` and `ISERROR`
- Should evaluate every function in the MVP library, including edge cases for empty and `null` arguments
- Should short-circuit `AND`, `OR` and `IF` so an erroring branch that is not taken does not poison the result
- Should never throw — a function that throws is contained and yields `#VALUE!`
- Should evaluate a formula that references another formula column in topological order
- Should return `#CIRCULAR!` for every cell of a column in a cycle
- Should coerce `Date` operands to epoch milliseconds in arithmetic
- Should not call `eval` or `new Function` (asserted by spying on the globals)

#### Registry

- Should register a custom function and evaluate it
- Should unregister a function and then report `UNKNOWN_FUNCTION`
- Should reject a registration whose name collides with a built-in
- Should expose functions grouped by category through `getFunctions`

#### Memoization and invalidation

- Should evaluate a record/column pair only once for repeated reads
- Should not re-evaluate on a change-detection cycle that changed nothing
- Should invalidate only the edited record and the transitive dependents of the edited field on `update_cell`
- Should invalidate the whole record on `update_row`
- Should invalidate everything on `data` reassignment
- Should invalidate a column and its dependents when `column.formula` is reassigned
- Should not retain records after they leave the data source (`WeakMap` semantics)
- Should evaluate visible rows eagerly and off-screen rows lazily

#### Column integration

- Should expose `isFormulaColumn === true` when `formula` or `formulaFn` is set
- Should generate a unique synthetic `field` when only `header` and `formula` are supplied
- Should deduplicate a generated field against an existing column
- Should let `formula` shadow a stored `field` value when both are set
- Should use `dependsOn` for `formulaFn` and warn when it is empty
- Should render the computed value with the column's `dataType` and `pipeArgs`
- Should render `formulaErrorTemplate` for a failing cell

#### Data pipeline

- Should sort ascending and descending on computed values
- Should order error values after all non-error values when sorting ascending, and before them when descending
- Should sort a formula column that references another formula column
- Should filter a formula column with the operands of its resolved `dataType`
- Should list computed values in the Excel-style filter value list, including a single entry for errors
- Should filter a formula column from advanced filtering / query builder
- Should group by a formula column and produce correct group keys and record counts
- Should compute group-level and grid-level summaries over a formula column
- Should honour `disabledSummaries` on a formula column
- Should merge rows on a formula column via `merge-strategy`
- Should find and highlight matches in a formula column when `searchable`
- Should exclude a formula column from search when `searchable === false`
- Should not create a form control for a formula column in `IgxGridValidationService`
- **Should require no custom `sortStrategy`, `filters`, `groupingComparer`, `mergingComparer` or `summaries`**
  for any of the above (the regression guard for acceptance criterion 3)

#### Editing

- Should not enter edit mode on a formula cell via double click, <kbd>Enter</kbd> or <kbd>F2</kbd>
- Should not emit `cellEditEnter` / `cellEdit` / `cellEditDone` for a formula cell
- Should exclude formula columns from the row-edit form
- Should recalculate dependents after a cell edit
- Should recalculate dependents after a row edit
- Should recalculate after transaction `commit`, `undo`, `redo` and `clear`
- Should recalculate for a newly added row
- Should recalculate after `data` reassignment
- Should keep formula cells read-only while a row is in edit mode

#### Runtime API

- Should add a formula column with `addFormulaColumn` and emit `formulaColumnAdded`
- Should reject an invalid definition and not add a column
- Should reject a definition that would introduce a cycle
- Should reject a duplicate header/field
- Should update a formula column with `updateFormulaColumn`, emit `formulaColumnEdited` and invalidate once
- Should remove a formula column with `removeFormulaColumn` and emit `formulaColumnRemoved`
- Should mark dependents `#REF!` after their dependency is removed
- Should preserve sorting, filtering, grouping, pinning, hiding and selection across add/edit/remove
- Should drop sorting/filtering/grouping expressions that reference a removed column
- Should emit `formulaError` once per invalidation pass with an accurate `errorCount`
- Should cap `errors` at `maxReportedFormulaErrors` while keeping `errorCount` exact

#### Grid state

- Should serialize `formula`, `formulaResultType`, `formulaFormat` and `userDefined` into `IColumnState`
- Should restore a developer-declared formula column onto the existing column
- Should recreate a user-created formula column that does not exist in markup
- Should restore several inter-dependent formula columns in dependency order
- Should keep a restored column whose references no longer resolve and mark its cells `#REF!`
- Should not serialize `formulaFn`
- Should round-trip through `getState()` / `setState()` with no loss

#### Export and clipboard

- Should export computed values to Excel
- Should export computed values to CSV
- Should export the error string for a failing cell
- Should apply `formatter` on export when configured, as for any other column
- Should copy computed values to the clipboard, with and without headers

#### Toolbar action

- Should render the action and open the editor on click
- Should render disabled when `allowFormulaColumns === false`
- Should show the count of formula columns and update it as columns are added and removed
- Should accept custom content as its label
- Should honour a custom `overlaySettings`

#### Formula editor dialog

- Should open in "add" mode with empty fields
- Should open in "edit" mode pre-filled from an existing column
- Should validate on every keystroke and render the message with the token and position
- Should keep the apply button disabled while the expression is invalid or empty
- Should keep the apply button disabled while the column name is empty or duplicated
- Should open the column autocomplete on `[` and filter it as the user types
- Should open the function autocomplete after two identifier characters
- Should insert `[Header]` at the caret when a column is chosen from the list
- Should insert `NAME()` and place the caret inside the parentheses when a function is chosen
- Should list only the columns allowed by `formulaColumnFields`
- Should list custom registered functions
- Should default the result type to the inferred one and let the user override it
- Should render a preview over the first `previewRowCount` rows and update it as the expression changes
- Should render error values in the preview without breaking it
- Should not create a column on cancel or on <kbd>Esc</kbd>
- Should create the column on apply and emit `formulaColumnAdded`
- Should update the column on save in edit mode without resetting grid state
- Should be draggable and restore the grid's active node on close, like the advanced filtering dialog

#### Error presentation

- Should render the error value and a tooltip in a failing cell
- Should set `aria-invalid` and `aria-describedby` on a failing cell
- Should render the header error indicator when at least one row failed
- Should remove the header indicator when the last failing row is filtered out or fixed
- Should announce the error state to screen readers

#### Accessibility and keyboard

- Should trap focus inside the dialog and restore focus to the toolbar button on close
- Should close only the autocomplete list on the first <kbd>Esc</kbd> and the dialog on the second
- Should apply on <kbd>Ctrl</kbd> + <kbd>Enter</kbd>
- Should navigate the columns and functions lists with the arrow keys, <kbd>Home</kbd> and <kbd>End</kbd>
- Should label every control and associate validation messages via `aria-describedby`

#### Localization

- Should use the grid's `resourceStrings` for every editor and error string
- Should update the UI when `resourceStrings` is reassigned at run time
- Should format results with `grid.locale` and the column's `pipeArgs`
- Should keep the stored expression locale-independent under a comma-decimal locale

#### Security and robustness

- Should not call `eval` or `new Function` for any input
- Should reject a deeply nested expression with `MAX_DEPTH_EXCEEDED` rather than overflowing the stack
- Should parse a very long expression within the configured limits without hanging
- Should not resolve `__proto__`, `constructor` or `prototype` through a reference path
- Should treat a persisted formula from `setState` as untrusted and validate it before use
- Should be fuzz-tested with random and adversarial inputs and never throw

#### Performance

- Should not evaluate off-screen rows during initial render
- Should not re-evaluate cached records during scrolling
- Benchmark in `projects/igniteui-angular-performance/`: initial render, sort, filter and group over
  100 000 records with 3 formula columns, compared against the same grid with the values pre-computed into the
  data. Regression budget agreed before merge (see [R1](#r1)).

### <a name='manual'>4.2. Manual</a>

- Create a calculated column from the toolbar on a 100 000-record grid; confirm the grid stays responsive while
  typing and previewing.
- Create a column referencing another calculated column; sort, filter and group by both.
- Try to create a cycle; confirm the message names the cycle path and the column is not created.
- Edit a formula on a column that is currently sorted, filtered and grouped; confirm the grid state survives.
- Delete a calculated column that another calculated column depends on; confirm the dependent shows `#REF!`.
- With batch editing enabled, edit several dependency cells, then undo and redo; confirm values track correctly.
- Save the grid state, reload the page, restore; confirm user-created columns come back with their formulas.
- Export to Excel and CSV; confirm computed values and error strings.
- Operate the whole editor with the keyboard only, then with a screen reader (NVDA/JAWS/VoiceOver); confirm
  labels, validation announcements and cell error announcements.
- Switch through all four design systems, light and dark; confirm the editor and the error cell/header states.
- Switch `grid.locale` and `resourceStrings` to a right-to-left and a comma-decimal locale; confirm the editor
  layout, the formatted results and that the stored expression is unchanged.
- Run the app under a strict CSP with `script-src 'self'`; confirm formulas still evaluate.
- Set `allowFormulaColumns` to `false`; confirm the toolbar action is disabled and the column menu entries are
  gone, while developer-declared formula columns still work.

## <a name='accessibility'>5. Accessibility</a>

The formula editor is held to the same bar as the advanced filtering dialog.

**Dialog**

- The overlay host has `role="dialog"` and `aria-modal="true"`, and is labelled by its title via
  `aria-labelledby`.
- Focus is trapped inside the dialog while it is open, moves to the expression input on open, and returns to
  the invoking element (toolbar button or column menu item) on close.
- Every control has a visible label associated through `for`/`id`; the expression input additionally carries
  `aria-describedby` pointing at the validation message element.
- The validation message container is an `aria-live="polite"` region, so a newly appearing error is announced
  without stealing focus. The container also carries `role="alert"` when the message changes from empty to
  non-empty.
- The expression input is marked `aria-invalid="true"` while the expression is invalid.
- The autocomplete list follows the existing `IgxAutocompleteDirective` contract: `role="combobox"` on the
  input, `aria-expanded`, `aria-owns`, `aria-activedescendant` and `aria-autocomplete`, with `role="listbox"` /
  `role="option"` on the list.
- The columns and functions lists are `role="listbox"` with `role="option"` items, each exposing the item name
  and its data type / signature as its accessible name.
- The preview is a `role="table"` with a caption naming it as a preview, and is `aria-live="off"` so that
  keystroke-by-keystroke recomputation is not announced.

**Grid**

- A formula cell keeps its `gridcell` role and is exposed as `aria-readonly="true"`.
- A cell whose evaluation failed carries `aria-invalid="true"` and `aria-describedby` pointing at a visually
  hidden element containing the localized message (`igx_grid_formula_cell_error_label`), so the error kind and
  reason are announced rather than the bare `#DIV/0!` glyph.
- The column header's error indicator is a non-focusable element with an `aria-label` built from
  `igx_grid_formula_column_error_indicator`, and the header is `aria-describedby` it.
- Colour is never the only carrier of the error state — the error value text and the indicator icon are always
  present.
- Contrast for the error cell and header indicator meets WCAG 2.1 AA in all four design systems, light and
  dark.

**Theming**

Theme files follow the query builder layout
([`projects/igniteui-angular/query-builder/src/query-builder/themes/`](../projects/igniteui-angular/query-builder/src/query-builder/themes/)):
`_base.scss`, `_derived.scss`, and `light/`, `dark/` and `shared/` folders each containing `_material.scss`,
`_bootstrap.scss`, `_fluent.scss`, `_indigo.scss` and `_index.scss`. The grid's
[`_derived.scss`](../projects/igniteui-angular/grids/themes/_derived.scss) wires the editor's tokens from the
grid's own `--_grid-background` / `--_grid-foreground` / `--_grid-accent-color`, exactly as it already does for
`query-builder-theme`, so the dialog inherits a grid-level theme override with no extra work. The error cell and
header indicator add tokens to the grid theme itself (`$formula-error-background`,
`$formula-error-foreground`), defaulting to the palette's `error` colour.

## <a name='assumptions-and-limitations'>6. Assumptions and Limitations</a>

| Assumptions | Limitation Notes |
|-------------|------------------|
| Formulas are row-scoped | No cross-row or cross-sheet references (`SUM(A1:A10)`, references to other rows). Ignite UI already ships a spreadsheet component for that; see [R4](#r4). |
| The grid owns sorting and filtering | With `noop` strategies (remote data) the grid does not sort or filter, so a formula column cannot be sorted or filtered server-side; see [R3](#r3). |
| Records are objects | Evaluation caching uses a `WeakMap` keyed by record identity. Primitive or frozen-primitive records are evaluated without caching. |
| The MVP targets `igx-grid` | Tree Grid, Hierarchical Grid, Pivot Grid and Grid Lite are explicitly out of scope. Grid Lite in particular is a thin wrapper over the `igniteui-grid-lite` web component and shares no pipeline code with `grids/core`. |
| Export writes values | Excel export contains computed values, not live `=` worksheet formulas. AST → A1/R1C1 translation is v1.next. |
| `formulaFn` is Angular-only | It is `/* blazorOnlyScript */`, is not serialized into grid state, and cannot be authored or edited from the UI. Its dependencies must be declared with `dependsOn`. |
| Circular references are detected, not resolved | There is no iterative-calculation mode. A cycle yields `#CIRCULAR!` for the whole column and is blocked at definition time. |
| The editor is opt-in | Apps that do not import `igniteui-angular/grids/formula-editor` get no dialog; `openFormulaEditorDialog` is a no-op and the column menu entries do not render. |
| Formula cells are read-only | There is no `writeBack` of computed values into the data record in the MVP; see [Q2](#q2). |

### Design decisions

| # | Question | Decision |
|---|----------|----------|
| <a name='q1'>Q1</a> | Reference columns by `header` (user-friendly, unstable) or `field` (stable, opaque)? | **Both are accepted on input; the canonical stored form uses `field`.** The editor displays and inserts headers via `toDisplayForm`/`toCanonicalForm`. Renaming a header therefore cannot break a saved formula, and users still type what they see. |
| <a name='q2'>Q2</a> | Should a formula column optionally persist its computed value back into the record (`writeBack`)? | **No for the MVP.** It mutates user data, makes the derived/stored distinction ambiguous, and is not needed once export and clipboard resolve computed values. Revisit if a concrete round-tripping requirement appears. |
| <a name='q3'>Q3</a> | Is the argument separator `,` or `;`, and are decimal separators locale-aware? | **The stored expression is locale-independent**: `.` decimal separator, `,` argument separator, always. Localization is confined to the editor's display and input handling, so an expression authored in one locale is valid in every other. |
| <a name='q4'>Q4</a> | Expose column-level aggregates inside row formulas (`[Price] / SUM([Price])`)? | **No for the MVP.** It requires two-pass evaluation over the full data set, which conflicts with virtualization, paging and remote data. `SUM`/`MIN`/`MAX` remain row-scoped variadic functions. A future `AGG()` namespace can add it without a breaking change. |
| <a name='q5'>Q5</a> | Does this land in Grid Lite? | **No.** Grid Lite is a thin Angular wrapper over the `igniteui-grid-lite` web component with its own pipeline and none of `grids/core`. The engine is dependency-free enough to be reused there later, but the editor's overlay/drop-down/dialog dependencies are exactly what Lite avoids. |
| <a name='q6'>Q6</a> | Are function names localized in the editor? | **No — always English in the stored expression.** The editor may show localized descriptions and category labels, but never localized names, so expressions stay portable between locales. |
| <a name='q7'>Q7</a> | Where does the editor live in the package graph? | **A separate secondary entry point, `igniteui-angular/grids/formula-editor`.** The engine lives in `igniteui-angular/core` because the pipeline needs it; the UI is opt-in so apps that never author formulas pay for neither the dialog nor its dependencies. `grids/core` reaches the editor only through the `IGX_FORMULA_EDITOR_HOST` token. |

### Risks and mitigations

| # | Risk | Mitigation |
|---|------|------------|
| <a name='r1'>R1</a> | **Performance.** Formula resolution sits on the hot path of every data operation and taxes every row. | Memoize by record identity and formula version; evaluate visible rows eagerly and everything else lazily; keep the non-formula path a single `column?.isFormulaColumn` check ahead of the existing `resolveNestedPath`. A benchmark in `projects/igniteui-angular-performance/` with an agreed regression budget is a merge gate. |
| <a name='r2'>R2</a> | **Security.** Expressions are untrusted input arriving from the UI *and* from persisted state. | No `eval`, no `new Function`, no property access into `__proto__`/`constructor`/`prototype`. A hand-written tokenizer plus AST walker only. Nesting-depth and expression-length limits guard against DoS. The parser is fuzz-tested. `allowFormulaColumns` lets an app switch authoring off entirely, and `formulaColumnFields` narrows the referenceable surface. Formulas restored from state are re-validated before use. |
| <a name='r3'>R3</a> | **Remote data.** With `noop` strategies the grid does not own sorting or filtering, so a formula column cannot be sorted or filtered server-side — and a user can now create a column the backend has never heard of. | `remoteFormulaBehavior` makes the choice explicit. Default `'disabled'`: under `noop` strategies a formula column reports `sortable`/`filterable`/`groupable` as `false`, the UI affordances are hidden, and end-user authoring is refused with a localized message. Opt-in `'clientPage'`: the grid sorts/filters/groups formula columns **within the loaded page only**, and documents that plainly. In both modes the canonical expression and its `references` are exposed on `formulaColumnAdded`/`formulaColumnEdited` so an app can translate it for its backend. |
| <a name='r4'>R4</a> | **Scope creep toward a spreadsheet.** Users who get a formula bar will ask for cell references next. | The grammar has no range or cell-reference production at all — adding one is a deliberate, breaking-shaped change rather than an oversight. The spec states the row-scoped boundary in the Overview, in Assumptions and in [Q4](#q4), and points at the existing spreadsheet component. |
| <a name='r5'>R5</a> | **MVP size.** Including the UI roughly doubles the MVP, and the UI work is not parallelizable with the engine until the parser's error API is stable. | Land the structured-error contract (`IFormulaParseError`, `IFormulaValidationResult`, `IgxFormulaEngine.validate`) **first**, as its own reviewed change with unit tests, so the UI and engine streams proceed in parallel behind a stable interface. |
| R6 | **Zoneless regressions.** Recalculation during a render pass causes `NG0100`. | `evaluate()` is pure and never mutates bound state or emits; `formulaError` is coalesced and emitted from the invalidation pass. Covered by dev-mode tests that fail on `ExpressionChangedAfterItHasBeenCheckedError`. |
| R7 | **Wrapper coverage.** The feature must marshal to Web Components and Blazor. | `formula` is a plain `string` and `IFormulaColumnDefinition` is `/* marshalByValue */ /* tsPlainInterface */`. `formulaFn` is `/* blazorOnlyScript */`. The toolbar action and editor carry the same code-generation annotation block as the existing toolbar actions, and wrapper code-gen output is verified before merge. |

## <a name='references'>7. References</a>

> [Formula (calculated) columns for the data grids — issue #17550](https://github.com/IgniteUI/igniteui-angular/issues/17550)
> [Group By Specification](https://github.com/IgniteUI/igniteui-angular/wiki/Group-By-Specification)
> [Summaries Specification](https://github.com/IgniteUI/igniteui-angular/wiki/Summaries-Specification)
> [Excel Style Filtering](https://github.com/IgniteUI/igniteui-angular/wiki/Excel-Style-Filtering)
> [Tree Specification](https://github.com/IgniteUI/igniteui-angular/wiki/Tree-Specification)
> [Update Migrations](https://github.com/IgniteUI/igniteui-angular/wiki/Update-Migrations)
> [Test implementation guidelines](https://github.com/IgniteUI/igniteui-angular/wiki/Test-implementation-guidelines-for-Ignite-UI-for-Angular)
> [Excel — Overview of formulas](https://support.microsoft.com/en-us/office/overview-of-formulas-in-excel-ecfdc708-9162-49e8-b993-c311f47ca173)
> [ODF OpenFormula specification](https://docs.oasis-open.org/office/OpenDocument/v1.3/os/part4-formula/OpenDocument-v1.3-os-part4-formula.html)
> [WAI-ARIA Authoring Practices — Dialog (Modal)](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
> [WAI-ARIA Authoring Practices — Combobox](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/)
