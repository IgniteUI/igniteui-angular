---
name: igniteui-angular-components
description: "Covers all non-grid Ignite UI for Angular UI components: application scaffolding and setup, form controls (inputs, combos, selects, date/time pickers, calendar, checkbox, radio, switch, slider), layout containers (tabs, stepper, accordion, splitter, navigation drawer), data-display components (list, tree, card, chips, carousel, paginator, progress indicators, chat), feedback overlays (dialog, snackbar, toast, banner), directives (button, icon button, button group, ripple, tooltip, drag-and-drop), Dock Manager, Layout Manager, Tile Manager, and Charts. Use when users ask about any Ignite UI Angular component that is NOT a data grid — such as forms, dropdowns, pickers, dialogs, navigation, lists, trees, cards, charts, or initial project setup. Do NOT use for data grids, tables, or tabular data — use igniteui-angular-grids instead. Do NOT use for theming or styling — use igniteui-angular-theming instead."
user-invocable: true
---

# Ignite UI for Angular — UI Components

## Prerequisites
- An Angular project on the major version matching the installed `igniteui-angular` package (igniteui-angular majors track Angular majors)
- `@angular/cli` installed
- `igniteui-angular` or `@infragistics/igniteui-angular` added to the project via `ng add igniteui-angular` (or the `@infragistics` variant) or `npm install` — see [Package Variants](#package-variants) below.
- A theme applied to the application (see [`igniteui-angular-theming`](../igniteui-angular-theming/SKILL.md)).
- `provideAnimations()` in `app.config.ts` — **required before using any overlay or animated component**

## Ignite UI CLI MCP Server (recommended, not required)

The `igniteui-cli` MCP server provides `list_components`, `get_doc`, `search_docs`, and `search_api` for version-accurate component documentation. When these tools are available, prefer them for any API detail the reference files below do not cover.

If the tools are not available, do not block the task — the bundled reference files are self-sufficient for the components they cover. Suggest that the user run `npx -y igniteui-cli ai-config` from the project root (it configures both the `igniteui-cli` and `igniteui-theming` MCP servers and copies the agent skill files) and reload the editor. MCP servers cannot be started mid-session; the configuration takes effect on the next session. Editor-specific details are in [`references/mcp-setup.md`](./references/mcp-setup.md).

## Required Workflow

**This file is a routing hub only. It contains no code examples and no API details.** Component APIs change between releases, so never write component selectors, import paths, input/output names, or directive names from memory — read the relevant reference files first.

1. **Identify every component or feature involved.** Map the user's request to one or more rows in the Task → Reference File table below. A single request often spans multiple categories (e.g., a form inside a Dialog requires both `form-controls.md` and `feedback.md`).
2. **Read every identified reference file in full**, in a single parallel batch of file reads — even if you believe you already know the answer.
3. **Then produce output**, based only on what you read. If something is not covered by the reference files, look it up with `get_doc`/`search_docs` when the MCP tools are available; otherwise state explicitly that the detail is unverified instead of guessing.

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
