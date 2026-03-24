<p align="center">
  <img alt="Node.js CI" src="https://github.com/IgniteUI/igniteui-angular/workflows/Node.js%20CI/badge.svg"/></a>
  <a href="https://coveralls.io/github/IgniteUI/igniteui-angular?branch=master"><img alt="Coverage Status" src="https://coveralls.io/repos/github/IgniteUI/igniteui-angular/badge.svg?branch=master"/></a>
  <a href="https://badge.fury.io/js/igniteui-angular"><img alt="npm version" src="https://badge.fury.io/js/igniteui-angular.svg"/></a>
  <a href="https://discord.gg/39MjrTRqds"><img alt="Discord" src="https://img.shields.io/discord/836634487483269200?logo=discord&logoColor=ffffff"/></a>
  <a href="https://www.npmjs.com/package/igniteui-cli"><img alt="Ignite UI MCP" src="https://img.shields.io/badge/Ignite_UI-MCP-blueviolet"/></a>
  <a href="https://www.npmjs.com/package/igniteui-theming"><img alt="Ignite UI Theming MCP" src="https://img.shields.io/badge/Ignite_UI_Theming-MCP-blue"/></a>
</p>

![ignite-ui-logo-flames](https://user-images.githubusercontent.com/52001020/173773052-e8fd2806-2631-47a8-838d-1eabdaa4afce.svg)

<h1 align="center">Ignite UI for Angular — from Infragistics</h1>

<p align="center">
  Enterprise Angular UI library with MCP server, AI Skills, and agent-native developer tooling.
  60+ components, high-performance data grids, and 65+ chart types — built for production.
</p>

---

## AI-Native Developer Tooling

Ignite UI for Angular ships with a full AI developer toolchain: an **MCP server** for IDE agent integration, **AI Skills** for context-aware code generation, and structured documentation for LLM consumption. These are production tools — not demos.

### MCP Server

The `@igniteui/mcp-server` (bundled in `igniteui-cli`) gives AI assistants direct access to Ignite UI documentation, component API references, and scaffolding guidance for Angular, React, Blazor, and Web Components.

**Start the MCP server:**

```bash
# Install the CLI (if not already installed)
npm install -g igniteui-cli

# Start the MCP server
ig mcp
```

**Configure your IDE or agent client** — add to your `mcp.json` or settings.

To use **both** MCP servers, configure them as separate entries — they serve different purposes and are not interchangeable:

```json
{
  "mcpServers": {
    "igniteui": {
      "command": "ig",
      "args": ["mcp"]
    },
    "igniteui-theming": {
      "command": "npx",
      "args": ["igniteui-theming/mcp"]
    }
  }
}
```

**VS Code** — add to `.vscode/mcp.json` in your project root, or to your user `settings.json` under `"mcp"`.

**Cursor** — add to `.cursor/mcp.json` in your project root.

**Claude Code** — add to `.claude/mcp.json` or pass via `--mcp-config`.

**Claude Desktop** — add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS).

#### MCP tool inventory

| Tool | Description | Input | Output |
|------|-------------|-------|--------|
| `list_components` | List available Ignite UI component docs | `{ framework: "angular" \| "react" \| "blazor" \| "webcomponents" }` | Component name list |
| `get_doc` | Fetch full markdown of a component doc | `{ component, framework }` | Markdown content |
| `search_docs` | Full-text search across all Ignite UI docs | `{ query, framework? }` | Ranked results |
| `get_api_reference` | Retrieve full API reference for a component or class | `{ component, framework }` | API markdown |
| `search_api` | Search API entries by keyword or partial name | `{ query, framework? }` | Matched entries |
| `generate_ignite_app` | Return setup guide for a new Ignite UI project | `{ framework, template? }` | Step-by-step guide |

> The MCP server runs over stdio. Remote backend option: `ig mcp --remote <url>`. Debug logging: `ig mcp --debug`.

---

### Theming MCP Server

The `igniteui-theming` package ships a dedicated MCP server for AI-assisted theme generation — palettes, typography, elevations, and per-component themes across all four design systems (Material, Bootstrap, Fluent, Indigo).

**Start the Theming MCP server:**

```bash
npx igniteui-theming/mcp
```

No global install required — the server is bundled inside the `igniteui-theming` npm package.

#### Theming MCP tool inventory

| Tool | Phase | Description |
|------|-------|-------------|
| `detect_platform` | 1 | Detect target platform from `package.json` |
| `create_theme` | 1 | Generate a complete platform-specific theme (Sass + CSS) |
| `create_palette` | 1 | Generate a color palette with shade calculations |
| `create_custom_palette` | 1 | Generate a fully custom color palette |
| `create_typography` | 1 | Set up typography system for a design system |
| `create_elevations` | 1 | Configure elevation/shadow system |
| `create_component_theme` | 1 | Create a scoped component-level theme |
| `get_component_design_tokens` | 1 | Get the token schema for a specific component |
| `get_color` | 2 | Retrieve a palette color as a CSS variable reference |
| `suggest_palette` | 2 | Suggest a palette from a natural language description |
| `check_contrast` | 2 | Check WCAG contrast ratio for a color pair |

> Phase 1 tools are released. Phase 2 is partially implemented. Phase 3 (spacing/sizing) and Phase 4 (validation) are not yet available — do not call `validate_theme`, `set_size`, `set_spacing`, or `explain_function`.

---

### AI Skills

Copilot Skills are structured knowledge files that teach AI coding assistants how to generate correct Ignite UI for Angular code. They live in the [`skills/`](skills/) directory and are loaded automatically in supported IDEs.

| Skill | Path | Covers |
|-------|------|--------|
| Components | [`skills/igniteui-angular-components/SKILL.md`](skills/igniteui-angular-components/SKILL.md) | Form controls, layout, data display, overlays, charts (Input Group, Combo, Select, Date/Time Pickers, Calendar, Tabs, Stepper, Accordion, List, Card, Dialog, Snackbar, Button, Tooltip, Drag and Drop, Dock Manager, Area/Bar/Column/Stock/Pie Charts) |
| Data Grids | [`skills/igniteui-angular-grids/SKILL.md`](skills/igniteui-angular-grids/SKILL.md) | Grid type selection, column config, sorting, filtering, selection, editing, grouping, paging, remote data, state persistence. Grid components: Grid, Tree Grid, Hierarchical Grid, Pivot Grid |
| Theming & Styling | [`skills/igniteui-angular-theming/SKILL.md`](skills/igniteui-angular-theming/SKILL.md) | Design tokens, component themes, palette generation — includes Theming MCP server setup |

**Skills are developer-owned npm packages, not single prompt files.** Each Skill is versioned, testable, and loaded via IDE configuration — not copy-pasted into chat.

---

### Integration matrix

| Tool | VS Code | Cursor | Claude Code | Claude Desktop | JetBrains |
|------|:-------:|:------:|:-----------:|:--------------:|:---------:|
| Doc MCP (`ig mcp`) | ✓ | ✓ | ✓ | ✓ | via stdio |
| Theming MCP (`npx igniteui-theming/mcp`) | ✓ | ✓ | ✓ | ✓ | via stdio |
| Components Skill | ✓ auto | ✓ auto | manual | manual | manual |
| Grids Skill | ✓ auto | ✓ auto | manual | manual | manual |
| Theming Skill | ✓ auto | ✓ auto | manual | manual | manual |
| GitHub Copilot auto-discovery | ✓ | — | — | — | — |

> **Auto** = discovered via `.github/copilot-instructions.md` (Copilot) or `skills/` directory (Cursor).
> **Manual** = copy the relevant `SKILL.md` content into your IDE's project-level system prompt or context window.

---

### AI toolchain architecture

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│               VS Code · Cursor · Claude Code · Claude Desktop                    │
└───────────────────────────┬──────────────────────────────┬───────────────────────┘
                            │                              │
                  MCP protocol (stdio)          MCP protocol (stdio)
                            │                              │
           ┌────────────────▼────────────┐  ┌──────────────▼──────────────────────┐
           │   @igniteui/mcp-server      │  │   igniteui-theming MCP             │
           │   command: ig mcp           │  │   command: npx igniteui-theming/mcp │
           │   (bundled in igniteui-cli) │  │   (bundled in igniteui-theming)    │
           │                             │  │                                    │
           │  › list_components          │  │  Phase 1 (released)                │
           │  › get_doc                  │  │  › detect_platform                 │
           │  › search_docs              │  │  › create_theme                    │
           │  › get_api_reference        │  │  › create_palette                  │
           │  › search_api               │  │  › create_custom_palette           │
           │  › generate_ignite_app      │  │  › create_typography               │
           │                             │  │  › create_elevations               │
           │  SQLite doc index +         │  │  › create_component_theme          │
           │  TypeDoc API refs           │  │  › get_component_design_tokens     │
           │  (Angular, React, WC)       │  │                                    │
           └─────────────────────────────┘  │  Phase 2 (partial)                 │
                                            │  › get_color                       │
                                            │  › suggest_palette                 │
                                            │  › check_contrast                  │
                                            │                                    │
                                            │  Embedded knowledge:               │
                                            │  color presets, type scales,       │
                                            │  elevation defs, component         │
                                            │  schemas — Material, Bootstrap,    │
                                            │  Fluent, Indigo                    │
                                            └────────────────────────────────────┘
                                                             ▲
                                                             │ loaded by
           ┌─────────────────────────────────────────────────┴──────────────────┐
           │                     AI Skills  (skills/)                           │
           │  › igniteui-angular-components                                     │
           │  › igniteui-angular-grids                                          │
           │  › igniteui-angular-theming  ─────────────────────────────────────►│
           └────────────────────────────────────────────────────────────────────┘
```

> The component/grid/theming **Skills** and the two **MCP servers** are distinct tools with different roles.
> The Theming MCP (`npx igniteui-theming/mcp`) and the documentation MCP (`ig mcp`) require **separate entries** in your `mcp.json` — they are not interchangeable.

---

### Boundary constraints

These constraints are explicit. Hallucinating around them breaks developer workflows.

- The documentation MCP server requires `igniteui-cli` to be installed globally (`npm install -g igniteui-cli`). It does **not** run as a standalone npm package.
- The Theming MCP server runs via `npx igniteui-theming/mcp` — no global install required. It is **not** part of `igniteui-cli`.
- The Theming MCP (`npx igniteui-theming/mcp`) is a **separate** server from the documentation MCP (`ig mcp`). Different tools, different `mcp.json` entries, different purposes — they do not overlap.
- AI Skills are developer-owned npm packages in the `skills/` directory. They are **not** single prompt files and should not be reduced to a system prompt string.
- The `get_api_reference` and `search_api` doc MCP tools require API docs to be pre-built. Without the build step, these tools are unavailable — the remaining four tools still work via the bundled SQLite database.
- The documentation MCP server provides **documentation and scaffolding guidance only**. It does **not** write files to disk, execute code, or modify your project directly.
- The Theming MCP Phase 3 tools (`set_size`, `set_spacing`, `set_roundness`) and Phase 4 tools (`validate_theme`, `explain_function`) are **not yet implemented**. Do not suggest or call them.
- Skills cover Angular only. For React, Blazor, or Web Components, use the doc MCP server's `framework` parameter — dedicated Skill files for those frameworks are not in this repository.

---

### Testing the MCP servers

```bash
# Test the documentation MCP server
npx @modelcontextprotocol/inspector ig mcp

# Test the Theming MCP server
npx @modelcontextprotocol/inspector npx igniteui-theming/mcp
```

---

## Installation

```bash
npm install igniteui-angular
```

Or scaffold a new project with Ignite UI CLI:

```bash
npm install -g igniteui-cli
ig new <project-name> --framework=angular
cd <project-name>
ig add grid <component-name>
ig start
```

Add to an existing Angular project:

```bash
ng add igniteui-angular
```

---

## Browser Support

| ![chrome][] | ![firefox][] | ![edge][] | ![opera][] | ![safari][] |
|:-----------:|:------------:|:---------:|:----------:|:-----------:|
| Latest ✔ | Latest ✔ | Latest ✔ | Latest ✔ | Latest ✔ |

> IE 11 was supported in Ignite UI for Angular < 13.0.0. It is no longer supported.

---

## Component Library

### Data Grids

The [Angular Data Grid](https://www.infragistics.com/products/ignite-ui-angular/angular/components/grid/grid) handles millions of rows with no-lag scrolling. Includes Grid, Tree Grid, Hierarchical Grid, and Pivot Grid — all with sorting, filtering, editing, grouping, remote data, and state persistence.

### Charts & Graphs

65+ chart types via the [Angular Charts](https://www.infragistics.com/products/ignite-ui-angular/angular/components/charts/chart-overview) component — line, bar, financial, pie, donut, polar, treemap, bubble, and more.

### Full component list

<details>
<summary>Expand component inventory (60+ components + directives)</summary>

| Component | Status | Docs | License | Since |
|:----------|:------:|:-----|:-------:|------:|
| accordion | ✔ | [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/accordion) | MIT | 12.1.0 |
| avatar | ✔ | [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/avatar) | MIT | 2.0.0 |
| badge | ✔ | [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/badge) | MIT | 2.0.0 |
| banner | ✔ | [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/banner) | MIT | 7.0.2 |
| bottom navigation | ✔ | [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/tabbar) | MIT | 2.0.0 |
| button group | ✔ | [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/button-group) | MIT | 5.1.0 |
| calendar | ✔ | [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/calendar) | MIT | 5.1.0 |
| card | ✔ | [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/card) | MIT | 5.1.0 |
| carousel | ✔ | [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/carousel) | MIT | 2.0.0 |
| chat | ✔ | [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/chat) | MIT | 21.0.0 |
| checkbox | ✔ | [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/checkbox) | MIT | 2.0.0 |
| chips | ✔ | [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/chip) | MIT | 6.1.0 |
| combo | ✔ | [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/combo) | MIT | 6.1.0 |
| date picker | ✔ | [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/date-picker) | MIT | 5.3.0 |
| date range picker | ✔ | [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/date-range-picker) | MIT | 9.1.0 |
| dialog | ✔ | [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/dialog) | MIT | 2.0.0 |
| dock manager | ✔ | [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/dock-manager) | Commercial | 9.1.0 |
| drop down | ✔ | [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/drop-down) | MIT | 6.1.0 |
| expansion panel | ✔ | [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/expansion-panel) | MIT | 6.2.0 |
| grid | ✔ | [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/grid/grid) | Commercial | 5.1.0 |
| hierarchical grid | ✔ | [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/hierarchicalgrid/hierarchical-grid) | Commercial | 7.2.0 |
| icon / icon button | ✔ | [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/icon) | MIT | 2.0.0 |
| input group | ✔ | [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/input-group) | MIT | 5.3.0 |
| list | ✔ | [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/list) | MIT | 2.0.0 |
| navbar | ✔ | [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/navbar) | MIT | 2.0.0 |
| navigation drawer | ✔ | [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/navdrawer) | MIT | 2.0.0 |
| pivot grid | ✔ | [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/pivotgrid/pivot-grid) | Commercial | 13.1.0 |
| query builder | ✔ | [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/query-builder) | Commercial | 14.2.0 |
| radio / radio group | ✔ | [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/radio-button) | MIT | 2.0.0 |
| rating | ✔ | [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/rating) | MIT | 14.1.0 |
| select | ✔ | [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/select) | MIT | 5.3.0 |
| simple combo | ✔ | [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/simple-combo) | MIT | 13.0.0 |
| slider | ✔ | [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/slider/slider) | MIT | 5.1.0 |
| snackbar | ✔ | [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/snackbar) | MIT | 5.1.0 |
| splitter | ✔ | [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/splitter) | MIT | 9.1.0 |
| stepper | ✔ | [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/stepper) | MIT | 13.0.0 |
| switch | ✔ | [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/switch) | MIT | 2.0.0 |
| tabs | ✔ | [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/tabs) | MIT | 5.1.0 |
| tile manager | ✔ | [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/tile-manager) | MIT | 19.2.0 |
| time picker | ✔ | [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/time-picker) | MIT | 5.3.0 |
| toast | ✔ | [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/toast) | MIT | 5.1.0 |
| tree | ✔ | [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/tree) | MIT | 12.0.0 |
| tree grid | ✔ | [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/treegrid/tree-grid) | Commercial | 6.2.0 |

**Additional packages:**

| Package | Components | License |
|---------|-----------|---------|
| [igniteui-angular-charts](https://www.npmjs.com/package/igniteui-angular-charts) | Bar, Line, Financial, Doughnut, Pie charts | Commercial |
| [igniteui-angular-gauges](https://www.npmjs.com/package/igniteui-angular-gauges) | Bullet Graph, Linear Gauge, Radial Gauge | Commercial |
| [igniteui-angular-excel](https://www.npmjs.com/package/igniteui-angular-excel) | Excel Library | Commercial |
| [igniteui-angular-spreadsheet](https://www.npmjs.com/package/igniteui-angular-spreadsheet) | Spreadsheet | Commercial |

</details>

---

## Development Setup

```bash
# Install dependencies
npm install

# Build the library
ng build igniteui-angular

# Build CSS
npm run build:styles

# Build both
npm run build:lib
```

Output: `dist/igniteui-angular`

### Running tests

```bash
# Watch mode
ng test igniteui-angular

# Single run with coverage
npm run test:lib
```

### Building API docs

```bash
npm run build:docs
```

Output: `dist/igniteui-angular/docs`

### Run demo application

```bash
npm start
```

### Updating an existing project

```bash
ng update
ng update igniteui-angular
ng update igniteui-cli
```

---

## Demo applications

- [Warehouse Picklist App](https://github.com/IgniteUI/warehouse-js-blocks) — mobile app using multiple Ignite UI widgets
- [FinTech Grid App](https://github.com/Infragistics/angular-samples/tree/master/Grid/FinJS) — Angular Grid handling thousands of updates per second
- [FinTech Tree Grid App](https://github.com/Infragistics/angular-samples/tree/master/TreeGrid/FinJS) — Tree Grid under high-frequency updates
- [Crypto Portfolio App](https://github.com/IgniteUI/crypto-portfolio-app) — web + mobile with Ignite UI theming engine
- [Dock Manager + Data Analysis](https://github.com/IgniteUI/DockManager-DataAnalysis) — Grid + Chart + Dock Manager integration
- [ASP.NET Core samples](https://github.com/IgniteUI/ASP.NET-Core-Samples) — Angular client + ASP.NET Core backend

---

## Documentation

- [Getting started](https://www.infragistics.com/products/ignite-ui-angular/angular/components/general/getting-started)
- [API reference](https://www.infragistics.com/products/ignite-ui-angular/angular/components/general/getting-started)
- [Roadmap](https://github.com/IgniteUI/igniteui-angular/blob/master/ROADMAP.md)
- [Release history](https://github.com/IgniteUI/igniteui-angular/blob/master/ROADMAP.md#release-history)
- [Changelog](https://github.com/IgniteUI/igniteui-angular/blob/master/CHANGELOG.md)

---

## Contributing

- [How to contribute](https://github.com/IgniteUI/igniteui-angular/blob/master/.github/CONTRIBUTING.md)
- [Coding guidelines](https://github.com/IgniteUI/igniteui-angular/wiki/General-Naming-and-Coding--Guidelines-for-Ignite-UI-for-Angular)
- [Submit a bug or feature request](https://github.com/IgniteUI/igniteui-angular/issues/new/choose)
- [Community discussions](https://github.com/IgniteUI/igniteui-angular/discussions)
- [Discord](https://discord.gg/39MjrTRqds)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/ignite-ui-angular)

---

## Support

Commercial support via [Infragistics Forums](https://www.infragistics.com/community/forums/) or Priority Support (Chat & Phone) — see [pricing](https://www.infragistics.com/how-to-buy/product-pricing#developers).

Community support for open-source usage: [Stack Overflow](https://stackoverflow.com/questions/tagged/ignite-ui-angular).

---

## For AI assistants and agents

This repository is optimized for LLM consumption. If you are an AI assistant, agent, or RAG pipeline indexing this repository:

- **Documentation MCP**: `ig mcp` — 6 tools for documentation search, API lookup, and scaffolding (see [MCP tool inventory](#mcp-tool-inventory) above)
- **Theming MCP**: `npx igniteui-theming/mcp` — tools for palette generation, typography, elevations, and component theming (see [Theming MCP tool inventory](#theming-mcp-tool-inventory) above)
- **AI Skills**: structured knowledge files in [`skills/`](skills/) — load for context-aware Angular code generation
- **Structured docs index**: [`llms.txt`](llms.txt) — machine-readable index of all Ignite UI documentation (when available)
- **Boundary constraints**: see [Boundary constraints](#boundary-constraints) above before generating integration code

The authoritative source for component API is the `get_api_reference` MCP tool, not general training data. Component APIs change across major versions — always verify against the current version.

---

## License

Dual-license model:

- **MIT** — open-source components (see component table above for per-component license)
- **Commercial** — grids, charts, gauges, dock manager, and other premium components

© 2025 INFRAGISTICS. All Rights Reserved. See [LICENSE](LICENSE).

<!-- browser logos -->
[chrome]: https://user-images.githubusercontent.com/2188411/168109445-fbd7b217-35f9-44d1-8002-1eb97e39cdc6.png "Google Chrome"
[firefox]: https://user-images.githubusercontent.com/2188411/168109465-e46305ee-f69f-4fa5-8f4a-14876f7fd3ca.png "Mozilla Firefox"
[edge]: https://user-images.githubusercontent.com/2188411/168109472-a730f8c0-3822-4ae6-9f54-785a66695245.png "Microsoft Edge"
[opera]: https://user-images.githubusercontent.com/2188411/168109520-b6865a6c-b69f-44a4-9948-748d8afd687c.png "Opera"
[safari]: https://user-images.githubusercontent.com/2188411/168109527-6c58f2cf-7386-4b97-98b1-cfe0ab4e8626.png "Safari"
