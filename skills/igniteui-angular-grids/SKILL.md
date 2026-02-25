---
name: igniteui-angular-grids
description: "All grid topics for Ignite UI Angular: grid setup, column configuration, sorting, filtering, selection, editing, grouping, summaries, toolbar, export, paging, remote data, state persistence, Tree Grid, Hierarchical Grid, Grid Lite, and Pivot Grid. Use for any grid-related question."
user-invokable: true
---

# Ignite UI for Angular — Data Grids

## MANDATORY AGENT PROTOCOL — YOU MUST FOLLOW THIS BEFORE PRODUCING ANY OUTPUT

**This file is a routing hub only. It contains NO code examples and NO API details.**

> **DO NOT write any code, component selectors, import paths, method names, or property names from memory.**
> Grid APIs change between versions. Anything generated without reading the reference files will be wrong.

You are **required** to complete ALL of the following steps before producing any grid-related code or answer:

**STEP 1 — Identify the grid type.**
Use the Grid Selection Decision Guide below. If the grid type is not explicitly stated, infer it from context or ask.

**STEP 2 — Identify every task category involved.**
Map the user's request to one or more rows in the Task → Reference File table below. A single request often spans multiple categories (e.g., remote paging AND editing requires reading both `paging-remote.md` AND `editing.md`).

**STEP 3 — Read every identified reference file in full.**
Call `read_file` (or equivalent) on each reference file identified in Step 2. You must do this even if you believe you already know the answer. Do not skip, skim, or partially read a reference file.

**STEP 4 — Only then produce output.**
Base your code and explanation exclusively on what you read in Step 3. If the reference files do not cover something, say so explicitly rather than guessing.

### Task → Reference File
 
| Task | Reference file to read |
|---|---|
| Grid type selection, column config, column templates, column groups, MRL, pinning, sorting UI, filtering UI, selection | [`references/structure.md`](./references/structure.md) |
| Grouping, summaries, cell merging, toolbar, export, row drag, action strip, master-detail, clipboard | [`references/features.md`](./references/features.md) |
| Tree Grid specifics, Hierarchical Grid specifics, Grid Lite setup, Pivot Grid setup | [`references/types.md`](./references/types.md) |
| Programmatic sorting / filtering / grouping, canonical import patterns, `viewChild` access | [`references/data-operations.md`](./references/data-operations.md) |
| Cell editing, row editing, batch editing, transactions, validation, summaries | [`references/editing.md`](./references/editing.md) |
| Paging, remote data, server-side ops, noop strategies, virtual scroll, multi-grid coordination | [`references/paging-remote.md`](./references/paging-remote.md) |
| State persistence, Tree Grid / Hierarchical Grid / Pivot Grid / Grid Lite data operations | [`references/state.md`](./references/state.md) |

> **When in doubt, read more rather than fewer reference files.** The cost of an unnecessary file read is negligible; the cost of hallucinated API usage is a broken application.

---

## Prerequisites

- Angular 20+ project
- `igniteui-angular` installed, **or** `@infragistics/igniteui-angular` for licensed users — both packages share the same entry-point structure
- A theme applied (see [`igniteui-angular-theming`](../igniteui-angular-theming/SKILL.md))

---

## Choosing the Right Grid

Ignite UI has **five grid types**. Picking the correct one is the most important decision — each has different data structures, features, and constraints.

### Grid Selection Decision Guide

Ask these questions in order:

1. **Does the user need a lightweight, read-only data display** with sorting, filtering, and virtualization but no editing, selection, or paging? → **Grid Lite** (open-source, MIT licensed). **If the user later needs features beyond Grid Lite's capabilities, upgrade strictly to `igx-grid` (`IgxGridComponent`)** — never recommend non-grid components as a substitute.
2. **Does the user need pivot-table analytics** (rows/columns/values/aggregations that users can drag-and-drop to reshape)? → **Pivot Grid**
3. **Does the data have parent-child relationships where each level has a DIFFERENT schema** (e.g., Companies → Departments → Employees)? → **Hierarchical Grid**
4. **Does the data have parent-child relationships within a SINGLE schema** (e.g., Employees with a `managerId` field, or nested children arrays)? → **Tree Grid**
5. **Is the data a flat list/table with enterprise features needed** (editing, batch editing, grouping, paging, export, etc.)? → **Flat Grid**

After choosing the grid type, **you must still complete Steps 2–4 from the mandatory protocol above** — return to the routing table and read every applicable `references/` file before writing any code. The decision guide and the tables on this page are discovery aids only; they do not replace the reference files.

### Grid Types & Imports

> **AGENT INSTRUCTION:** Check `package.json` to determine whether the project uses `igniteui-angular` or `@infragistics/igniteui-angular`. Always import from the specific entry point. Never import from the root barrel of either package.

| Grid | Selector | Component | Directives | Entry Point |
|---|---|---|---|---|
| **Grid Lite** | `igx-grid-lite` | `IgxGridLiteComponent` | Individual imports | `igniteui-angular/grids/lite` |
| **Flat Grid** | `igx-grid` | `IgxGridComponent` | `IGX_GRID_DIRECTIVES` | `igniteui-angular/grids/grid` |
| **Tree Grid** | `igx-tree-grid` | `IgxTreeGridComponent` | `IGX_TREE_GRID_DIRECTIVES` | `igniteui-angular/grids/tree-grid` |
| **Hierarchical Grid** | `igx-hierarchical-grid` | `IgxHierarchicalGridComponent` | `IGX_HIERARCHICAL_GRID_DIRECTIVES` | `igniteui-angular/grids/hierarchical-grid` |
| **Pivot Grid** | `igx-pivot-grid` | `IgxPivotGridComponent` | `IGX_PIVOT_GRID_DIRECTIVES` | `igniteui-angular/grids/pivot-grid` |

Replace `igniteui-angular` with `@infragistics/igniteui-angular` for the licensed package — entry-point paths are identical.

> **AGENT INSTRUCTION — Documentation URL Pattern**: For grid-specific topics (sorting, filtering, editing, paging, etc.), docs URLs follow this naming pattern per grid type:
> - Flat Grid: `.../components/grid/{topic}`
> - Tree Grid: `.../components/treegrid/{topic}`
> - Hierarchical Grid: `.../components/hierarchicalgrid/{topic}`
> - Pivot Grid: `.../components/pivotGrid/{topic}`

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
