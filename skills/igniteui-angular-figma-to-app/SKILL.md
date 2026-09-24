---
license: MIT
name: igniteui-angular-figma-to-app
description: "Translates Figma app screens built with the Indigo.Design UI Kits (Material, Fluent, Bootstrap, or Indigo; light or dark) into production Angular apps with Ignite UI for Angular. Every kit component instance maps 1:1 to an Ignite UI Angular control, and the kit variant sets the theme's design system. Uses the Figma MCP for design data, the Ignite UI CLI MCP for component docs, the Ignite UI Theming MCP for styling, and the Playwright MCP for visual validation. WHEN TO USE: the user asks to \"implement this Figma design\", \"build from Figma\", \"translate Figma to Angular\", \"implement this artboard\", or \"generate app from Figma\", or shares a Figma URL with implementation intent in an Ignite UI Angular context. WHEN NOT TO USE: the design is only a screenshot, mockup, or wireframe with no Figma file (use igniteui-angular-generate-from-image-design); single-component API questions (use igniteui-angular-components or igniteui-angular-grids); theme-only changes (use igniteui-angular-theming)."
user-invocable: true
---

# Ignite UI for Angular — Figma to App

Translate Figma app screens built with the **Indigo.Design UI Kits** into production
Angular applications. Designers create their own frames in Figma using the Indigo.Design
component libraries as shared libraries — these kits come in four design-system variants
(**Material**, **Fluent**, **Bootstrap**, **Indigo**) with light and dark themes each.
Every component instance in the design maps 1:1 to an Ignite UI Angular control, and
the active kit variant directly determines which design system to use in the Angular
theme.

This skill orchestrates four MCP servers: **Figma** (design data), **Ignite UI CLI**
(component docs), **Ignite UI Theming** (styles), and **Playwright** (visual validation).

---

## Required Workflow

Complete all phases in order — do not skip phases or generate component code from
memory. Every component selector, input name, and import path must come from
`get_doc` results or, where no doc exists in the catalog, from the
`igniteui-angular-components` / `igniteui-angular-grids` skill reference files —
never guessed.

Read [references/project-setup.md](references/project-setup.md) before Phase 0b.
Read [references/figma-exploration.md](references/figma-exploration.md) before Phase 1.
Read [references/figma-component-map.md](references/figma-component-map.md) before Phase 2.
Read [references/theme-generation.md](references/theme-generation.md) before Phase 3.
Read [references/design-token-bridge.md](references/design-token-bridge.md) before Phase 3.
Read [references/asset-extraction.md](references/asset-extraction.md) before Phase 1h.
Read [references/validation-patterns.md](references/validation-patterns.md) before Phase 5.

---

## Phase 0 — Prerequisites

> **Tool naming:** this skill writes MCP tool names as `<server>_<tool>` (e.g.
> `figma_get_metadata`, `theming_create_theme`). The exact name depends on the client —
> Claude Code exposes them as `mcp__<server>__<tool>` (e.g. `mcp__figma__get_metadata`).
> Match by the tool's base name on whatever server is connected.

### 0a: Verify All Four MCP Servers

Run these checks **silently** in parallel. Each verification call is a no-op if the
server is not connected; do not surface raw errors to the user at this point.

| Server                | Verification call                              | Success signal                      |
| --------------------- | ---------------------------------------------- | ----------------------------------- |
| **Figma**             | `figma_get_metadata` with no `nodeId`          | Returns page list or selection info |
| **Ignite UI CLI**     | `list_components` with `framework: "angular"`  | Returns component list              |
| **Ignite UI Theming** | `theming_detect_platform`                      | Returns platform info               |
| **Playwright**        | `playwright_browser_navigate` to `about:blank` | Navigates without error             |

If **any server fails**, stop and guide the user through setup **for that server only**
before continuing. For `igniteui-cli` and `igniteui-theming`, the fastest path is
`npx -y igniteui-cli ai-config`, which configures both. Full setup instructions for all
servers are in [references/mcp-setup.md](references/mcp-setup.md). Newly configured MCP
servers require an editor/session reload before their tools appear.

### 0b: Detect or Scaffold Angular Project

Check whether the working directory contains a `package.json` that lists
`igniteui-angular` or `@infragistics/igniteui-angular`, and a `src/app/` directory.

- **Project found:** note the package (open-source or licensed) and the Angular version,
  and confirm the MCP configuration has all four server entries.
- **No project found:** offer to scaffold one with `npx -y igniteui-cli new`, or to use an
  existing project directory, and wait for the user's choice.

Read [references/project-setup.md](references/project-setup.md) for the detection
checklist, the exact messages to show the user, template selection, and the scaffolding steps.

---

## Phase 1 — Figma Design Exploration

**Goal:** understand the full design structure and capture all data needed for
implementation and validation before writing any code.

Read [references/figma-exploration.md](references/figma-exploration.md) in full before the
first Figma MCP call. It has the call budget, exact tool arguments, extraction checklists,
and table templates for each step:

| Step | What to do |
| ---- | ---------- |
| **1a** | Discover pages and artboards with `figma_get_metadata` |
| **1b** | List the artboards and wait for the user to choose which to implement |
| **1c** | Capture one reference screenshot per artboard — the ground truth for Phase 5 |
| **1d** | Extract design context per artboard: layers, layout, typography, surfaces, input variants, chart colors, action controls, kit variant |
| **1e** | Extract design tokens with a **single** `figma_get_variable_defs` call |
| **1f** | Check for existing Code Connect mappings |
| **1g** | Build Table A (Ignite UI components) and Table B (layout surfaces), then present both for review |
| **1h** | Extract every image asset to `src/assets/` — zero-placeholder policy |

Key constraints:

- **Rate limits:** Figma MCP calls count against plan quotas, and a Starter plan can run
  out in one session. Discover structure with `figma_get_metadata` first.
- **Session-bound tools:** `figma_get_screenshot` and `figma_get_design_context` act on the
  node currently selected in the Figma desktop app. Ask the user to select each artboard
  first, and do not batch these calls.
- **React + Tailwind output:** `figma_get_design_context` returns React + Tailwind code.
  Read it for information only — never copy it into Angular files, and never use its
  localhost image URLs as final assets.

---

## Phase 2 — Component Discovery (Ignite UI CLI MCP)

**Goal:** look up exact Angular selectors, inputs, outputs, and usage patterns for every
component identified in Phase 1. Never generate component code from memory.

### 2a: Read the Component Map

Read [references/figma-component-map.md](references/figma-component-map.md) in full.
Find the row for each Figma layer name from your Phase 1 decomposition table.
Each row gives you:

- The Ignite UI Angular selector
- The `get_doc` key to call
- Key inputs and variants to configure

### 2b: Fetch Component Docs

Call `list_components({ framework: "angular" })` **once** to discover which component
families have full docs — **the catalog covers only a subset of components**. Then:

- For families **with** a doc: call `get_doc({ framework: "angular", name: "<doc-name>" })`,
  all in a single parallel batch — never sequentially.
- For families **without** a doc: read the matching reference files from the
  [`igniteui-angular-components`](../igniteui-angular-components/SKILL.md) and
  [`igniteui-angular-grids`](../igniteui-angular-grids/SKILL.md) skills, and use
  `search_api` for member-level API lookups.

Do **not** write any component code until you have read its doc or reference file.

### 2c: Search for Feature Docs

Use `search_docs` for feature-level questions raised by the artboard, for example:

```
search_docs({ framework: "angular", query: "row editing" })
search_docs({ framework: "angular", query: "virtual scrolling" })
search_docs({ framework: "angular", query: "column pinning" })
```

Feature docs are mandatory when the artboard shows grid editing, filtering, sorting,
pinning, or other advanced feature states.

### 2d: Document the Final Component Plan

After reading all docs, confirm or revise the decomposition table from Phase 1g with:

- Exact selectors (e.g. `<igx-grid>`, `<igx-navbar>`)
- Exact import paths (never imported from the root barrel)
- Required peer modules or provider functions

Present this updated plan to the user and wait for confirmation before Phase 3.

---

## Phase 3 — Theme Generation (Ignite UI Theming MCP)

**Goal:** produce Sass theming code that matches the Figma design's visual language
using design tokens extracted in Phase 1e.

Read [references/theme-generation.md](references/theme-generation.md) and
[references/design-token-bridge.md](references/design-token-bridge.md) in full before
running any theming tool. The steps are:

| Step | What to do |
| ---- | ---------- |
| **3a** | Inspect `src/styles.scss`. Reuse an existing theme only if its light/dark variant matches the design |
| **3b** | Resolve the design system (`material`, `bootstrap`, `fluent`, `indigo`) using the strict precedence order |
| **3c** | Generate the global theme: palette, elevations, typography, then theme |
| **3d** | Map per-component tokens for every core Ignite UI component in the plan |

Key constraints:

- `theming_create_palette` takes `primary`/`secondary`/`surface`, while
  `theming_create_theme` takes `primaryColor`/`secondaryColor`/`surfaceColor`.
- Never use the font name as the primary design-system signal.
- Never derive size, spacing, or roundness multipliers from Figma pixel values.

---

## Phase 4 — Implementation

**Goal:** build the Angular view(s) that match the artboard decomposition from Phase 2.

### Implementation Rules

1. **Never generate component code without reading its `get_doc` result first** (Phase 2b)
2. **Section by section** — layout → navigation → primary content → secondary → data
3. Follow Angular standalone component conventions and AGENTS.md coding standards
4. Import components from their specific entry points, never from the root barrel
5. Use CSS Grid first to match Figma frame proportions; add Flexbox for sub-regions
6. Apply theming via the SCSS classes and tokens generated in Phase 3
7. Use typed mock data that matches the design's density and domain
8. Keep layout, spacing, and typography in SCSS files — not inline styles
9. For DV components (charts, maps, gauges), set visual properties via component inputs
   as described in [references/figma-component-map.md](references/figma-component-map.md)
10. After implementing each major section, save and check in the browser (if dev server is running)
11. **Global input type:** if the Figma design uses `border`-type inputs globally (detected
    via variant indicator nodes in Phase 1d), set the `IGX_INPUT_GROUP_TYPE` injection token
    once in `app.config.ts` rather than `type="border"` on every component. This covers all
    compound components that wrap `IgxInputGroup` internally (`IgxSimpleCombo`,
    `IgxDatePickerComponent`, `IgxDateRangePickerComponent`, `IgxTimePickerComponent`,
    `IgxSelectComponent`):
    ```typescript
    // app.config.ts
    import { IGX_INPUT_GROUP_TYPE } from 'igniteui-angular/input-group';
    // in providers array:
    { provide: IGX_INPUT_GROUP_TYPE, useValue: 'border' }
    ```
12. **Layout surfaces:** for every entry in the Phase 1g Surfaces table, add a CSS class
    with the recorded `background`, `border-radius`, `padding`, `border`, and `box-shadow`.
    Never leave a section transparent if the Figma surface has a background. Never add a
    background to a section that floats on the page background in the Figma design.
13. **Implement only controls that appear in the Figma artboard.** Do not add toolbar
    buttons, actions, or UI elements that look useful but are not visible in the design
    context output for that artboard.

### Layout Strategy

Translate Figma frame dimensions into CSS Grid first:

```scss
// Artboard: 1440×900px, sidebar 280px, content 1160px
.app-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  grid-template-rows: 64px 1fr;
  min-height: 100vh;
}
```

Match desktop proportions before adding responsive breakpoints.

### Angular Project Structure

For a new view or page generated from a Figma artboard, create:

```
src/app/
  <artboard-name>/
    <artboard-name>.component.ts      ← standalone component
    <artboard-name>.component.html    ← template
    <artboard-name>.component.scss    ← styles + component theme overrides
```

Register the route in `app.routes.ts` when the project uses routing.

---

## Phase 5 — Visual Validation (Playwright MCP)

**Goal:** measure and compare the running app against the Figma reference screenshots
from Phase 1c. Use the measurement-driven loop — compare numbers, not impressions.

Read [references/validation-patterns.md](references/validation-patterns.md) in full
before running any Playwright tool.

### 5a: Ensure the Dev Server Is Running

Ask the user for the local dev URL if not already known (default: `http://localhost:4200`).
Navigate to confirm the app is running:

```
playwright_browser_navigate({ url: "http://localhost:4200" })
playwright_browser_console_messages()   // check for startup errors
```

### 5b: Match Viewport to Artboard Dimensions

Resize the browser to match the Figma artboard dimensions captured in Phase 1c:

```
playwright_browser_resize({ width: <artboard.width>, height: <artboard.height> })
playwright_browser_navigate({ url: "<target route>" })  // re-navigate after resize
```

> **Always re-navigate after resize.** The browser may reset to `about:blank` on
> viewport change. This is a known Playwright MCP pitfall.

### 5c: Capture and Compare Screenshots

> **IMPORTANT — Figma MCP is session-bound.** To get a fresh Figma reference screenshot
> for comparison, ask the user to select the artboard in Figma, then call
> `figma_get_screenshot({})`. Alternatively, use the Phase 1c reference screenshots
> already saved to disk.

For **each target artboard** (run the full 5c–5f loop once per page):

1. Ask the user: *"In Figma, please click the **[Artboard Name]** frame to select it, then confirm."*
2. Navigate the browser to the corresponding route.
3. Take a browser screenshot:
   ```
   playwright_browser_take_screenshot({ type: "png" })
   ```
4. Do a **section-by-section** visual comparison against the Phase 1c reference:
   - top bar → sidebar → **every section in the Phase 1g Surfaces table** → footer
5. Do **not** advance to the next artboard until no Critical/Major issues remain on the current one.

### 5d: Measure Computed Styles

For each section with visible differences — and **mandatorily for every entry in the
Phase 1g Surfaces table** — use `playwright_browser_evaluate` to extract exact values.
Pass code as a **plain JavaScript function string** using the `function` parameter
(see [references/validation-patterns.md](references/validation-patterns.md)):

```
playwright_browser_evaluate({
  function: "() => { var el = document.querySelector('<selector>'); if (!el) return { error: 'not found' }; var s = getComputedStyle(el); var r = el.getBoundingClientRect(); return { fontSize: s.fontSize, backgroundColor: s.backgroundColor, padding: s.padding, borderRadius: s.borderRadius, border: s.border, gap: s.gap, height: Math.round(r.height), width: Math.round(r.width) }; }"
})
```

**Surfaces audit (mandatory for every page):** For every section in the Phase 1g Surfaces
table, assert:
- `backgroundColor` is **not** `rgba(0, 0, 0, 0)` when the surface has a background color
- `backgroundColor` **is** `rgba(0, 0, 0, 0)` when the design shows the section floating
  on the page background (no card wrapper)
- All child elements shown inside the surface card in Figma are enclosed within the card's
  bounding rect in the DOM

**Action controls audit (mandatory for every page):** Count and name all visible action
buttons and toolbar controls. Compare against the Phase 1d inventory — any button not
recorded in the Figma design context is fabricated and must be removed.

Compare all returned values against the Figma spec (from Phase 1d design context).

### 5e: Classify and Report Mismatches

| Severity     | Category        | Example                                   | Action                      |
| ------------ | --------------- | ----------------------------------------- | --------------------------- |
| **Critical** | Missing element | Button in Figma, absent in code           | Auto-fix                    |
| **Major**    | Wrong component | Figma shows dropdown, code has text input | Auto-fix                    |
| **Minor**    | Spacing off     | 24px gap in Figma, 16px in code           | Auto-fix if straightforward |
| **Cosmetic** | Color shade     | `#333` vs `#2d2d2d`                       | Report only                 |

For each mismatch, produce:

```
ISSUE: <description>
LOCATION: <section or component>
FIGMA: <spec value>
RENDERED: <measured value>
SEVERITY: <Critical / Major / Minor / Cosmetic>
FIX: <specific code change>
```

### 5f: Apply Corrections

Fix Critical and Major issues immediately. After applying fixes, re-navigate and take a
fresh screenshot to confirm:

```
playwright_browser_navigate({ url: "<target route>" })
playwright_browser_take_screenshot({ type: "png" })
```

Repeat the measure → fix → re-verify loop until no Critical or Major issues remain.

### 5g: Accessibility Snapshot

Take an accessibility snapshot to verify the structural integrity of the view:

```
playwright_browser_snapshot()
```

Check that:

- Interactive elements have accessible labels
- Headings follow a logical hierarchy
- Navigation landmarks are present

---

## Critical Rules

- **Phase 0 is not optional.** Never skip MCP verification.
- **Phase 2b before code.** Never write a selector you have not read from a doc.
- **Phase 1c screenshots are immutable ground truth.** Never overwrite them; always
  compare against the original Figma state.
- **Re-navigate after resize** in Phase 5 to avoid Playwright's browser reset bug.
- **Rate-limit Figma MCP calls.** Use `figma_get_metadata` for discovery, then targeted
  `figma_get_design_context` per artboard. Batch screenshot calls.
- **Fail fast on 3 retries.** If the same correction fails three times, stop, report
  the issue to the user, and ask for guidance.
- **Do not modify dependency manifests or lock files without asking.** Identify the exact
  packages and versions required, then get approval before installing.

---

## Related Skills

- [`igniteui-angular-components`](../igniteui-angular-components/SKILL.md) — deep reference for non-grid components
- [`igniteui-angular-grids`](../igniteui-angular-grids/SKILL.md) — deep reference for grid, tree-grid, hierarchical-grid, pivot-grid
- [`igniteui-angular-theming`](../igniteui-angular-theming/SKILL.md) — theming system architecture and advanced palette patterns
- [`igniteui-angular-generate-from-image-design`](../igniteui-angular-generate-from-image-design/SKILL.md) — fallback when no Figma file is available (static image input)
