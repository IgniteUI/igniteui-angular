---
license: MIT
name: igniteui-angular-figma-to-app
description: "Builds Angular views from Figma designs with Ignite UI for Angular, supporting Indigo.Design kits, third-party kits, and plain frames. Uses Figma, Ignite UI CLI, theming, and Playwright MCP servers. WHEN TO USE: implementing a Figma design or artboard in an Ignite UI Angular project. WHEN NOT TO USE: screenshots or wireframes without a Figma file (use igniteui-angular-generate-from-image-design), single-component APIs (use igniteui-angular-components or igniteui-angular-grids), or theme-only changes (use igniteui-angular-theming)."
user-invocable: true
---

# Ignite UI for Angular — Figma to App

Translate Figma app screens into production Angular applications built with Ignite UI for Angular. The skill accepts designs from three kinds of source. A single file often mixes them, so every component is classified individually (Phase 1f):

| Tier | Source | How it maps to Ignite UI |
| --- | --- | --- |
| **A** | The Infragistics **Indigo.Design UI Kits** (Material, Fluent, Bootstrap, Indigo variants, light and dark) | Directly, by kit layer name. The kit variant *is* the Ignite UI design system. |
| **B** | Any other component library: public kits such as Material 3, Fluent 2, Bootstrap, shadcn/ui, Untitled UI, or Ant, and in-house design systems | Variant properties are normalized to a canonical role, then mapped. The theme is fitted to a closest baseline design system. |
| **C** | Plain frames, groups, and detached instances | The role is inferred from structure and visuals, with lower confidence, and the user confirms it. |

Tier A gives the highest fidelity for the least effort. Tiers B and C reach high fidelity through token overrides, and record the remaining **anatomy deltas** (structural differences between the design's components and Ignite UI's) for the user to approve instead of hiding them.

This skill orchestrates four MCP servers: **Figma** (design data), **Ignite UI CLI** (component docs), **Ignite UI Theming** (styles), and **Playwright** (visual validation).

---

## Required Workflow

Complete all phases in order — do not skip phases or generate component code from memory. Every component selector, input name, and import path must come from `get_doc` results or, where no doc exists in the catalog, from the `igniteui-angular-components` / `igniteui-angular-grids` skill reference files — never guessed.

Read [references/project-setup.md](references/project-setup.md) before Phase 0b. Read [references/figma-exploration.md](references/figma-exploration.md) before Phase 1. Read [references/design-provenance.md](references/design-provenance.md) before Phase 1f. Read [references/asset-extraction.md](references/asset-extraction.md) before Phase 1h. Read [references/figma-component-map.md](references/figma-component-map.md) before Phase 2. Read [references/theme-generation.md](references/theme-generation.md) before Phase 3. Read [references/design-token-bridge.md](references/design-token-bridge.md) before Phase 3. Read [references/validation-patterns.md](references/validation-patterns.md) before Phase 5.

---

## Phase 0 — Prerequisites

> **Tool naming:** this skill writes MCP tool names as `<server>_<tool>` (e.g. `figma_get_metadata`, `theming_create_theme`). The exact name depends on the client — Claude Code exposes them as `mcp__<server>__<tool>` (e.g. `mcp__figma__get_metadata`). Match by the tool's base name on whatever server is connected.

### 0a: Verify All Four MCP Servers

Run these checks **silently** in parallel. Each verification call is a no-op if the server is not connected; do not surface raw errors to the user at this point.

| Server                | Verification call                              | Success signal                      |
| --------------------- | ---------------------------------------------- | ----------------------------------- |
| **Figma**             | Inspect `figma_get_metadata` schema (no call)  | Tool is listed. The configured server URL (or `fileKey` in the tool schema) tells remote from desktop |
| **Ignite UI CLI**     | `list_components` with `framework: "angular"`  | Returns component list              |
| **Ignite UI Theming** | `theming_detect_platform`                      | Returns platform info               |
| **Playwright**        | `playwright_browser_navigate` to `about:blank` | Navigates without error             |

If **any server fails**, fix setup **for that server only** before continuing. For `igniteui-cli` and `igniteui-theming`, configure them yourself — run `npx -y igniteui-cli ai-config` (or `ig ai-config`) from the project root, which configures both. Add a missing Playwright entry yourself as well. The Figma servers need the user's action — the desktop server is enabled in the Figma desktop app, and the remote server signs in through Figma OAuth — so guide the user through the Figma setup. Full setup instructions for all servers are in [references/mcp-setup.md](references/mcp-setup.md). Newly configured MCP servers require an editor/session reload before their tools appear — ask the user to reload, then stop.

### 0b: Detect or Scaffold Angular Project

Check whether the working directory contains a `package.json` that lists `igniteui-angular` or `@infragistics/igniteui-angular`, and a `src/app/` directory.

- **Project found:** note the package (open-source or licensed) and the Angular version, and confirm the MCP configuration has all four server entries.
- **No project found:** offer to scaffold one with `npx -y igniteui-cli new`, or to use an existing project directory, and wait for the user's choice.

Read [references/project-setup.md](references/project-setup.md) for the detection checklist, the exact messages to show the user, template selection, and the scaffolding steps.

---

## Phase 1 — Figma Design Exploration

**Goal:** understand the full design structure and capture all data needed for implementation and validation before writing any code.

Read [references/figma-exploration.md](references/figma-exploration.md) in full before the first Figma MCP call. It has the call budget, exact tool arguments, extraction checklists, and table templates for each step:

| Step | What to do |
| ---- | ---------- |
| **1a** | Discover pages and artboards with `figma_get_metadata` |
| **1b** | List the artboards and wait for the user to choose which to implement |
| **1c** | Capture one reference screenshot per artboard — the ground truth for Phase 5 |
| **1d** | Extract design context per artboard: layers and variant props, layout, typography, surfaces, input variants, chart colors, color census, control heights, action controls, provenance signals |
| **1e** | Extract design tokens with `figma_get_variable_defs`, once per target page |
| **1f** | Classify every component's provenance (Tier A Indigo.Design kit / B other library / C plain frames) and normalize it to a canonical role; check Code Connect mappings |
| **1g** | Build Table A (Ignite UI components, with tier, confidence, and anatomy deltas) and Table B (layout surfaces), then present both for review — low-confidence mappings first |
| **1h** | Extract every image asset to `src/assets/` — zero-placeholder policy |

Key constraints:

- **Rate limits:** limits depend on the Figma **seat**. A View/Collab seat allows about 6 calls a month, which may not cover one artboard. Compare the call estimate with the user's quota before starting, and discover structure with `figma_get_metadata` first.
- **Two Figma MCP servers:** the **remote** server (`mcp.figma.com`) takes `fileKey` and `nodeId`, so you can move between artboards yourself. The **desktop** server (`127.0.0.1:3845`) works only on the file open in the Figma desktop app. Pass the node ID from a frame link and check the response, or ask the user to select each artboard and do not batch those calls. Detect the server before the first call (see `figma-exploration.md`).
- **Any UI kit:** do not assume the Indigo.Design kits. Classify each component in 1f. A third-party kit's names, variables, and Code Connect mappings are evidence of the component's role. Never copy them into the code.
- **React + Tailwind output:** `figma_get_design_context` returns React + Tailwind code. Read it for information only — never copy it into Angular files, and never use its localhost image URLs as final assets.

---

## Phase 2 — Component Discovery (Ignite UI CLI MCP)

**Goal:** look up exact Angular selectors, inputs, outputs, and usage patterns for every component identified in Phase 1. Never generate component code from memory.

### 2a: Read the Component Map

Read [references/figma-component-map.md](references/figma-component-map.md) in full. For each row of the Phase 1g Table A:

- **Tier A:** find the Indigo.Design kit name in the kit tables.
- **Tier B/C:** find the canonical role in the **Canonical Role Index**, then the row it points to in the named section.

That row gives you:

- The Ignite UI Angular selector
- The `get_doc` key to call
- Key inputs and variants to configure

### 2b: Fetch Component Docs

Call `list_components({ framework: "angular" })` **once** to discover which component families have full docs — **the catalog covers only a subset of components**. Then:

- For families **with** a doc: call `get_doc({ framework: "angular", name: "<doc-name>" })`, all in a single parallel batch — never sequentially.
- For families **without** a doc: read the matching reference files from the [`igniteui-angular-components`](../igniteui-angular-components/SKILL.md) and [`igniteui-angular-grids`](../igniteui-angular-grids/SKILL.md) skills, and use `search_api` for member-level API lookups.

Do **not** write any component code until you have read its doc or reference file.

### 2c: Search for Feature Docs

Use `search_docs` for feature-level questions raised by the artboard, for example:

```
search_docs({ framework: "angular", query: "row editing" })
search_docs({ framework: "angular", query: "virtual scrolling" })
search_docs({ framework: "angular", query: "column pinning" })
```

Feature docs are mandatory when the artboard shows grid editing, filtering, sorting, pinning, or other advanced feature states.

### 2d: Document the Final Component Plan

After reading all docs, confirm or revise the decomposition table from Phase 1g with:

- Exact selectors (e.g. `<igx-grid>`, `<igx-navbar>`)
- Exact import paths (never imported from the root barrel)
- Required peer modules or provider functions

**Anatomy delta ledger (Tier B and C).** For every mapped component whose anatomy differs from the design in a way that tokens or content projection **cannot** close, add a ledger entry:

| Component | Design shows | Ignite UI renders | Options | Decision |
| --- | --- | --- | --- | --- |
| _e.g._ M3 segmented button | Check icon on the selected segment | `igx-buttongroup`, no check icon | Project an `igx-icon` into the selected button / accept | ask |
| _e.g._ Breadcrumbs | Breadcrumb trail | No Angular breadcrumb component | Semantic `<nav><ol>` with router links | ask |

Do not ledger differences that tokens *can* close: color, radius, border, casing, height, and spacing are implementation work, not deltas. For every interactive control, prefer the Ignite UI component with a recorded delta over hand-built markup. The component's keyboard, focus, ARIA, and form behavior are worth more than a pixel-exact but inert copy. Approved entries are classified **Accepted** in Phase 5.

If new packages are required (including an icon package for a third-party kit), identify exact packages and versions and ask for approval before installing. Present this updated plan, with the ledger, to the user and wait for confirmation before Phase 3.

---

## Phase 3 — Theme Generation (Ignite UI Theming MCP)

**Goal:** produce Sass theming code that matches the Figma design's visual language using the kit variables from Phase 1e (Path A) or the color census and measurements from Phase 1d (Path B).

Read [references/theme-generation.md](references/theme-generation.md) and [references/design-token-bridge.md](references/design-token-bridge.md) in full before running any theming tool. The steps are:

| Step | What to do |
| ---- | ---------- |
| **3a** | Inspect `src/styles.scss` **and** the `styles` array in `angular.json`. A CLI scaffold theme counts as no theme. Reuse an app's own theme only if its variant, design system, and primary color all match the design; otherwise ask before changing it |
| **3b** | Choose the path from the dominant Phase 1f tier. **Path A** (Indigo.Design kits): resolve the design system with the strict precedence order. **Path B** (other kits or none): pick the closest baseline — the user's request, then the kit's direct counterpart, then input label placement, then control heights. In a mixed file, count only rows that map to a component |
| **3c** | Generate the global theme with one `theming_create_theme` call. **Path B:** seed it from the color census, then override the type styles that differ (including button casing) with `--ig-<style>-<property>` CSS variables after the theme. Do not rely on `customScale`: `theming_create_typography` accepts it, but its generators ignore it |
| **3d** | Map per-component tokens for every core Ignite UI component in the plan. Path B also sets radius, border, shadow, and state tokens, and picks `--ig-size` from measured heights |

Key constraints:

- `theming_create_palette` takes `primary`/`secondary`/`surface`/`gray`/`success`/`warn`/`error`/`info` and `variant`, while `theming_create_theme` takes `primaryColor`/`secondaryColor`/`surfaceColor` (no `gray`).
- `theming_create_elevations` takes `designSystem` (`material` or `indigo`); there is no `preset` parameter.
- Never use the font name as the primary design-system signal.
- Never convert Figma pixel values into `theming_set_spacing` or `theming_set_roundness` multipliers. `--ig-size` is different: it is a size step (`small` / `medium` / `large`), not a multiplier. Path A keeps the default; Path B picks the nearest step to the measured control heights (3d).
- **Path B:** seed the palette with the color painted on the component, not the variable named `…/500`. On a `material` baseline, buttons, checkboxes, and switches use `secondary`, so seed it with the button color.

---

## Phase 4 — Implementation

**Goal:** build the Angular view(s) that match the artboard decomposition from Phase 2.

### Implementation Rules

1. **Never generate component code without reading its doc first** — the `get_doc` result, or the skill reference file when the catalog has no doc for that family (Phase 2b)
2. **Section by section** — layout → navigation → primary content → secondary → data
3. Follow Angular standalone component conventions and AGENTS.md coding standards
4. Import components from their specific entry points, never from the root barrel
5. Use CSS Grid first to match Figma frame proportions; add Flexbox for sub-regions
6. Apply theming via the SCSS classes and tokens generated in Phase 3
7. Use typed mock data that matches the design's density and domain
8. Keep layout, spacing, and typography in SCSS files — not inline styles
9. For DV components (charts, maps, gauges), set visual properties via component inputs as described in [references/figma-component-map.md](references/figma-component-map.md)
10. After implementing each major section, save and check in the browser (if dev server is running)
11. **Global input type:** the default type is `box`. If the Figma design uses one other type everywhere (for example `border`, detected via variant indicator nodes in Phase 1d), set the `IGX_INPUT_GROUP_TYPE` injection token once in `app.config.ts` rather than `type="border"` on every component. The token is read by `IgxInputGroupComponent`, `IgxComboComponent`, `IgxSimpleComboComponent`, `IgxSelectComponent`, `IgxDatePickerComponent`, `IgxDateRangePickerComponent`, and `IgxTimePickerComponent`:
    ```typescript
    // app.config.ts
    import { IGX_INPUT_GROUP_TYPE } from 'igniteui-angular/input-group';
    // in providers array:
    { provide: IGX_INPUT_GROUP_TYPE, useValue: 'border' }
    ```
    For other kits, map the normalized field style from Phase 1f: **outlined** → `border`, **filled** → `box`, **underlined** → `line`. Label placement comes from the baseline design system (3b), not from the input type.
12. **Layout surfaces:** for every entry in the Phase 1g Table B (Layout Surfaces), add a CSS class with the recorded `background`, `border-radius`, `padding`, `border`, and `box-shadow`. Never leave a section transparent if the Figma surface has a background. Never add a background to a section that floats on the page background in the Figma design.
13. **Implement only controls that appear in the Figma artboard.** Do not add toolbar buttons, actions, or UI elements that look useful but are not visible in the design context output for that artboard.

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

**Goal:** measure and compare the running app against the Figma reference screenshots from Phase 1c. Use the measurement-driven loop — compare numbers, not impressions.

Read [references/validation-patterns.md](references/validation-patterns.md) in full before running any Playwright tool.

### 5a: Ensure the Dev Server Is Running

Ask the user for the local dev URL if not already known (default: `http://localhost:4200`). Navigate to confirm the app is running:

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

> **Always re-navigate after resize.** The browser may reset to `about:blank` on viewport change. This is a known Playwright MCP pitfall.

### 5c: Capture and Compare Screenshots

Compare against the Phase 1c reference screenshots saved to disk. They are the ground truth. Do not spend Figma quota re-capturing them.

For **each target artboard** (run the full 5c–5f loop once per page):

1. Open the Phase 1c reference file for the artboard.
2. Navigate the browser to the corresponding route.
3. Take a browser screenshot:
   ```
   playwright_browser_take_screenshot({ type: "png" })
   ```
4. Do a **section-by-section** visual comparison against the Phase 1c reference:
   - top bar → sidebar → **every section in the Phase 1g Table B (Layout Surfaces)** → footer
5. Do **not** advance to the next artboard until only Cosmetic and Accepted items remain on the current one.

### 5d: Measure Computed Styles

For each section with visible differences — and **mandatorily for every entry in the Phase 1g Table B (Layout Surfaces)** — use `playwright_browser_evaluate` to extract exact values. Pass code as a **plain JavaScript function string** using the `function` parameter (see [references/validation-patterns.md](references/validation-patterns.md)):

```
playwright_browser_evaluate({
  function: "() => { var el = document.querySelector('<selector>'); if (!el) return { error: 'not found' }; var s = getComputedStyle(el); var r = el.getBoundingClientRect(); return { fontSize: s.fontSize, backgroundColor: s.backgroundColor, padding: s.padding, borderRadius: s.borderRadius, border: s.border, gap: s.gap, height: Math.round(r.height), width: Math.round(r.width) }; }"
})
```

**Surfaces audit (mandatory for every page):** For every section in the Phase 1g Table B (Layout Surfaces), assert:
- `backgroundColor` is **not** `rgba(0, 0, 0, 0)` when the surface has a background color
- `backgroundColor` **is** `rgba(0, 0, 0, 0)` when the design shows the section floating on the page background (no card wrapper)
- All child elements shown inside the surface card in Figma are enclosed within the card's bounding rect in the DOM

**Action controls audit (mandatory for every page):** Count and name all visible action buttons and toolbar controls. Compare against the Phase 1d inventory — any button not recorded in the Figma design context is fabricated and must be removed.

Compare all returned values against the Figma spec (from Phase 1d design context).

### 5e: Classify and Report Mismatches

| Severity     | Category        | Example                                   | Action                      |
| ------------ | --------------- | ----------------------------------------- | --------------------------- |
| **Critical** | Missing element | Button in Figma, absent in code           | Fix                         |
| **Major**    | Wrong component | Figma shows dropdown, code has text input | Fix                         |
| **Major**    | Token-fixable   | Wrong color shade, radius, border, casing, or height | Fix              |
| **Minor**    | Spacing off     | 24px gap in Figma, 16px in code           | Fix                         |
| **Cosmetic** | Rounding only   | `rgb(51, 51, 51)` vs `#333333`; ≤ 4px size | Report only                |
| **Accepted** | Approved delta  | A ledger entry the user approved          | Report only; not a retry    |

The full table and the definitions are in `validation-patterns.md § Mismatch Severity Classification`. A visibly different color is Major, not Cosmetic. **Accepted** needs the user's approval of a ledger entry, from Phase 2d or added during Phase 5.

For each mismatch, produce:

```
ISSUE: <description>
LOCATION: <section or component>
FIGMA: <spec value>
RENDERED: <measured value>
SEVERITY: <Critical / Major / Minor / Cosmetic / Accepted>
FIX: <specific code change>
```

### 5f: Apply Corrections

Fix Critical, Major, and Minor issues. After applying fixes, re-navigate and take a fresh screenshot to confirm:

```
playwright_browser_navigate({ url: "<target route>" })
playwright_browser_take_screenshot({ type: "png" })
```

Repeat the measure → fix → re-verify loop until only Cosmetic and Accepted items remain.

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

- **Phase 0 is not optional.** Never skip MCP verification, and establish which Figma MCP variant is connected before Phase 1.
- **Classify provenance per instance (Phase 1f).** Do not assume the Indigo.Design kits. A third-party kit's names and variables are evidence to normalize, not to copy.
- **Never import from Code Connect of another library.** Code Connect snippets that point at shadcn, MUI, or an in-house package confirm the role only. The code is always Ignite UI.
- **Seed the palette from usage on Path B.** Use the color painted on the component, not the variable named `…/500`. On a `material` baseline, controls use `secondary`.
- **Ledger what tokens cannot fix; fix what they can.** Structural anatomy deltas go to the user in Phase 2d. Color, radius, casing, and height mismatches get fixed.
- **Phase 2b before code.** Never write a selector you have not read from a doc (the `get_doc` result, or the skill reference file when no doc exists).
- **Phase 1c screenshots are immutable ground truth.** Never overwrite them; always compare against the original Figma state.
- **Re-navigate after resize** in Phase 5 to avoid Playwright's browser reset bug.
- **Rate-limit Figma MCP calls.** Use `figma_get_metadata` for discovery, then targeted `figma_get_design_context` per artboard, and `figma_get_variable_defs` once per target page. On the desktop server, check that each response describes the requested artboard. When you rely on the selection, ask the user to select each artboard first and do not batch those calls.
- **Fail fast on 3 retries.** If the same correction fails three times, stop, report the issue to the user, and ask for guidance.
- **Do not modify dependency manifests or lock files without asking.** Identify the exact packages and versions required, then get approval before installing.

---

## Related Skills

- [`igniteui-angular-components`](../igniteui-angular-components/SKILL.md) — deep reference for non-grid components
- [`igniteui-angular-grids`](../igniteui-angular-grids/SKILL.md) — deep reference for grid, tree-grid, hierarchical-grid, pivot-grid
- [`igniteui-angular-theming`](../igniteui-angular-theming/SKILL.md) — theming system architecture and advanced palette patterns
- [`igniteui-angular-generate-from-image-design`](../igniteui-angular-generate-from-image-design/SKILL.md) — fallback when no Figma file is available (static image input)
