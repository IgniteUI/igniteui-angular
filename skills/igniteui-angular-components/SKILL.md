---
license: MIT
name: igniteui-angular-components
description: "Covers all non-grid Ignite UI for Angular UI components: application scaffolding and setup, form controls (inputs, combos, selects, date/time pickers, calendar, checkbox, radio, switch, slider), layout containers (tabs, stepper, accordion, splitter, navigation drawer), data-display components (list, tree, card, chips, carousel, paginator, progress indicators, chat), feedback overlays (dialog, snackbar, toast, banner), directives (button, icon button, button group, ripple, tooltip, drag-and-drop), Dock Manager, Layout Manager, Tile Manager, and Charts. WHEN TO USE: users ask about any Ignite UI Angular component that is NOT a data grid, such as forms, dropdowns, pickers, dialogs, navigation, lists, trees, cards, charts, or initial project setup. WHEN NOT TO USE: data grids, tables, or tabular data (use igniteui-angular-grids); theming or styling (use igniteui-angular-theming)."
user-invocable: true
---

# Ignite UI for Angular — UI Components

## Prerequisites
- An Angular project on the major version matching the installed `igniteui-angular` package (igniteui-angular majors track Angular majors)
- `@angular/cli` installed
- `igniteui-angular` or `@infragistics/igniteui-angular` added to the project via `ng add igniteui-angular` (or the `@infragistics` variant) or `npm install` — see [Package Variants](#package-variants) below.
- A theme applied to the application (see [`igniteui-angular-theming`](../igniteui-angular-theming/SKILL.md)).
- `provideAnimations()` in `app.config.ts` — **required before using any overlay or animated component**

## Ignite UI CLI MCP Server (required)

The `igniteui-cli` MCP server is the version-accurate source for Ignite UI APIs. It provides `list_components`, `get_doc`, `search_docs`, `search_api`, and `get_api_reference`. Its **full component docs cover a subset of components** (the catalog grows over releases — call `list_components` once to see what exists; e.g. Combo, Simple Combo, Chat, Tooltip, and grid toolbar/export docs). Where a `get_doc` doc exists, prefer it over the reference files below. `search_api`/`get_api_reference` cover API members (inputs, outputs, methods) for all components — use them for every member-level lookup. For everything else, the reference files below are the primary guidance.

**Verify the server before any other step** by calling `list_components` with `framework: "angular"`. If the tool is not available:

1. **Configure it yourself — do not just suggest it.** From the project root, run `npx -y igniteui-cli ai-config` (or `ig ai-config` when `igniteui-cli` is installed globally). It configures both the `igniteui-cli` and `igniteui-theming` MCP servers, preserves existing server entries, and copies the Agent Skills. If the client is not covered, add the entries manually from [`references/mcp-setup.md`](./references/mcp-setup.md) — the server command is `npx -y igniteui-cli mcp` (or `ig mcp`).
2. **Ask the user to reload the editor or agent session, then stop.** MCP tools cannot be loaded into a running session.
3. **Continue without the server only if the user explicitly asks to.** In that case, use the reference files and mark every selector, import path, and member name you could not verify through the MCP server as unverified.

## Required Workflow

**This file is a routing hub only. It contains no code examples and no API details.** Component APIs change between releases, so never write component selectors, import paths, input/output names, or directive names from memory — read the relevant reference files first.

1. **Identify every component or feature involved.** Map the user's request to one or more rows in the Task → Reference File table below. A single request often spans multiple categories (e.g., a form inside a Dialog requires both `form-controls.md` and `feedback.md`).
2. **Read every identified reference file in full**, in a single parallel batch of file reads — even if you believe you already know the answer.
3. **Then produce output**, based only on what you read. If something is not covered by the reference files, look it up with `get_doc`/`search_docs`/`search_api`. Never guess — if the MCP server cannot answer it, state explicitly that the detail is unverified.

### Task → Reference File

| Task | Reference file to read |
|---|---|
| App setup, `app.config.ts` providers, `provideAnimations()`, entry-point imports, convenience directive arrays | [`references/setup.md`](./references/setup.md) |
| Input Group, Combo, Simple Combo, Select, Date Picker, Date Range Picker, Time Picker, Calendar, Checkbox, Radio, Switch, Slider, Autocomplete, reactive/template-driven forms | [`references/form-controls.md`](./references/form-controls.md) |
| Tabs, Bottom Navigation, Stepper, Accordion, Expansion Panel, Splitter, Navigation Drawer | [`references/layout.md`](./references/layout.md) |
| List, Tree, Card, Chips, Avatar, Badge, Icon, Carousel, Paginator, Progress Indicators, Chat | [`references/data-display.md`](./references/data-display.md) |
| Dialog, Snackbar, Toast, Banner | [`references/feedback.md`](./references/feedback.md) |
| Button, Icon Button, Button Group, Ripple, Tooltip, Drag and Drop | [`references/directives.md`](./references/directives.md) |
| Layout Manager (`igxLayout`, `igxFlex` directives), Dock Manager (`igc-dockmanager` web component), Tile Manager (`igc-tile-manager` web component) | [`references/layout-manager.md`](./references/layout-manager.md) |
| Charts (Area, Bar, Column, Stock/Financial, Pie), chart configuration, chart features (animation, tooltips, markers, highlighting, zooming), data binding | [`references/charts.md`](./references/charts.md) |

> **When in doubt, read more rather than fewer reference files.** The cost of an unnecessary file read is negligible; the cost of hallucinated API usage is a broken application.

---

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
