---
name: igniteui-angular-components
description: "All Ignite UI Angular UI components: application setup and architecture, form controls (Input Group, Combo, Select, Date/Time Pickers, Calendar, Checkbox, Radio, Switch, Slider, reactive forms), layout (Tabs, Bottom Navigation, Stepper, Accordion, Splitter, Navigation Drawer, Layout Manager), data display (List, Tree, Card, Chips, Avatar, Badge, Icon, Carousel, Paginator, Progress bar, Linear Progress Bar, Circular Progress Bar, Chat), feedback/overlays (Dialog, Snackbar, Toast, Banner), directives (Button, Ripple, Tooltip, Drag and Drop), Dock Manager, and Charts (Area Chart, Bar Chart, Column Chart, Stock/Financial Chart, Pie Chart, IgxCategoryChart, IgxFinancialChart, IgxDataChart, IgxPieChart). Use for any non-grid Ignite UI Angular UI question."
user-invokable: true
---

# Ignite UI for Angular — UI Components

## MANDATORY AGENT PROTOCOL — YOU MUST FOLLOW THIS BEFORE PRODUCING ANY OUTPUT

**This file is a routing hub only. It contains NO code examples and NO API details.**

> **DO NOT write any component selectors, import paths, input names, output names, or directive names from memory.**
> Component APIs change between versions. Anything generated without reading the reference files will be incorrect.

You are **required** to complete ALL of the following steps before producing any component-related code or answer:

**STEP 1 — Identify every component or feature involved.**
Map the user's request to one or more rows in the Task → Reference File table below. A single request often spans multiple categories (e.g., a form inside a Dialog requires reading both `form-controls.md` AND `feedback.md`).

**STEP 2 — Read every identified reference file in full.**
Call `read_file` (or equivalent) on each reference file identified in Step 1. You must do this even if you believe you already know the answer. Do not skip, skim, or partially read a reference file.

**STEP 3 — Check app setup.**
If the component is new to the project (or you're scaffolding a new feature), also read [`references/setup.md`](./references/setup.md) to verify the correct providers and entry-point import patterns. Missing `provideAnimations()` is the most common source of runtime failures.

**STEP 4 — Only then produce output.**
Base your code and explanation exclusively on what you read. If the reference files do not cover something, say so explicitly rather than guessing.

### Task → Reference File

| Task | Reference file to read |
|---|---|
| App setup, `app.config.ts` providers, `provideAnimations()`, entry-point imports, convenience directive arrays | [`references/setup.md`](./references/setup.md) |
| Input Group, Combo, Simple Combo, Select, Date Picker, Date Range Picker, Time Picker, Calendar, Checkbox, Radio, Switch, Slider, reactive/template-driven forms | [`references/form-controls.md`](./references/form-controls.md) |
| Tabs, Bottom Navigation, Stepper, Accordion, Expansion Panel, Splitter, Navigation Drawer | [`references/layout.md`](./references/layout.md) |
| List, Tree, Card, Chips, Avatar, Badge, Icon, Carousel, Paginator, Progress Indicators, Chat | [`references/data-display.md`](./references/data-display.md) |
| Dialog, Snackbar, Toast, Banner | [`references/feedback.md`](./references/feedback.md) |
| Button, Icon Button, Ripple, Tooltip, Drag and Drop | [`references/directives.md`](./references/directives.md) |
| Layout Manager (`igxLayout`, `igxFlex` directives), Dock Manager (`igc-dockmanager` web component) | [`references/layout-manager.md`](./references/layout-manager.md) |
| Charts (Area, Bar, Column, Stock/Financial, Pie), chart configuration, chart features (animation, tooltips, markers, highlighting, zooming), data binding | [`references/charts.md`](./references/charts.md) |

> **When in doubt, read more rather than fewer reference files.** The cost of an unnecessary file read is negligible; the cost of hallucinated API usage is a broken application.

---

## Prerequisites

- Angular 20+ project
- `@angular/cli` installed
- `igniteui-angular` or `@infragistics/igniteui-angular` added to the project via `ng add igniteui-angular` (or the `@infragistics` variant) or `npm install` — see [Package Variants](#package-variants) below.
- A theme applied to the application (see [`igniteui-angular-theming`](../igniteui-angular-theming/SKILL.md)).
- `provideAnimations()` in `app.config.ts` — **required before using any overlay or animated component**


## Package Variants

| Package | Install | Who uses it |
|---|---|---|
| `igniteui-angular` | `npm install igniteui-angular` | Open-source / community |
| `@infragistics/igniteui-angular` | Requires private `@infragistics` registry | Licensed / enterprise users |

Both packages share **identical entry-point paths**. Check `package.json` and use that package name as the prefix for every import. Never import from the root barrel of either package.
Both packages can be added to the project using `@angular/cli` with the following commands: `ng add igniteui-angular` or `ng add @infragistics/igniteui-angular`.

---

## Related Skills

- [`igniteui-angular-grids`](../igniteui-angular-grids/SKILL.md) — Data Grids (Flat Grid, Tree Grid, Hierarchical Grid, Pivot Grid, Grid Lite)
- [`igniteui-angular-theming`](../igniteui-angular-theming/SKILL.md) — Theming & Styling
