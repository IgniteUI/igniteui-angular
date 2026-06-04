---
name: igniteui-angular-figma-to-app
description: >
  Translate Figma app screens designed using the Indigo.Design UI Kits into production
  Angular applications with Ignite UI for Angular. The Indigo.Design UI Kits are Figma
  component libraries available in four design-system variants — Material, Fluent,
  Bootstrap, and Indigo — each with light and dark themes. Designers build their own
  app frames in Figma using these kit libraries, and every kit component instance maps
  1:1 to an Ignite UI Angular control. The active kit variant also determines the
  design system used in the Angular theme. Uses the Figma MCP for design data, the
  Ignite UI CLI MCP for component docs, the Ignite UI Theming MCP for palette and
  component-level styling, and the Playwright MCP for visual validation against the
  original Figma design. Triggers on "implement this Figma design", "build from Figma",
  "translate Figma to Angular", "implement this artboard", "generate app from Figma",
  or when a Figma URL is shared with implementation intent in an Ignite UI Angular context.
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

## MANDATORY AGENT PROTOCOL

You **must** complete all phases in order. Do **not** skip phases or generate component
code from memory. Every component selector, input name, and import path must come from
`get_doc` results — never guessed.

Read [references/figma-component-map.md](references/figma-component-map.md) before Phase 2.
Read [references/design-token-bridge.md](references/design-token-bridge.md) before Phase 3.
Read [references/asset-extraction.md](references/asset-extraction.md) before Phase 1h.
Read [references/validation-patterns.md](references/validation-patterns.md) before Phase 5.

---

## Phase 0 — Prerequisites

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
before continuing. Full setup instructions for all servers are in
[references/mcp-setup.md](references/mcp-setup.md).

### 0b: Detect or Scaffold Angular Project

Check whether the current working directory contains a valid Angular + Ignite UI project:

```
1. Does package.json exist?
2. Does it list "igniteui-angular" OR "@infragistics/igniteui-angular" in dependencies?
3. Is there a src/app/ directory?
```

**If a valid project is found:**

- Note the package layout: `igniteui-angular` (open-source) or `@infragistics/igniteui-angular` (licensed)
- Note the Angular version from `package.json`
- Check whether `.vscode/mcp.json` exists in the project root. If it does not, run
  `npx -y igniteui-cli ai-config` from the project root to auto-generate the Ignite UI
  CLI MCP server configuration and copy the Agent Skills — this ensures `list_components`
  and `get_doc` are wired up before Phase 2.
- Inform the user: "Found existing Ignite UI Angular project. Proceeding with the Figma workflow."

**If no valid project is found:**
Present this message and wait for the user’s choice:

> “No Ignite UI Angular project found in the current directory. Would you like me to
> scaffold a new one using the Ignite UI CLI before implementing the Figma design?
>
> `npx -y igniteui-cli new` creates a project pre-configured with Ignite UI Angular,
> theming already applied in `styles.scss`, and the Ignite UI CLI MCP server auto-wired
> into `.vscode/mcp.json`. No global install required.
>
> Alternatively, point me at an existing project directory.”

If the user confirms scaffolding:

1. Ask for a project name. If the user has already shared a Figma URL, suggest a name
   derived from the Figma file name; otherwise prompt.

2. Choose the project template based on the artboard structure. Because Phase 1 has
   not run yet, use the lightest signal available:

   | Signal                                                               | Template to use                                  |
   | -------------------------------------------------------------------- | ------------------------------------------------ |
   | User mentions a sidebar, navigation drawer, or multiple routed views | `side-nav`                                       |
   | No strong signal — default                                           | `empty` (routing + home page; easiest to extend) |

3. Create the project:

   ```bash
   npx -y igniteui-cli new <project-name> --framework=angular --type=igx-ts --template=<empty|side-nav>
   ```

   This produces a standard Angular workspace fully compatible with `ng` commands,
   and additionally:
   - Installs and configures `igniteui-angular` with a default theme in `styles.scss`
   - Generates `.vscode/mcp.json` with the Ignite UI CLI MCP server entry already set
   - Copies Ignite UI Agent Skills to `.claude/skills/`

4. `cd <project-name>`

5. Open the auto-generated `.vscode/mcp.json` and **append** the Figma, Ignite UI
   Theming, and Playwright server entries from `references/mcp-setup.md`. The Ignite
   UI CLI entry is already present — do not duplicate it.

6. Confirm the project starts cleanly:
   ```bash
   npm start
   ```
   Then continue to Phase 1.

---

## Phase 1 — Figma Design Exploration

**Goal:** understand the full design structure and capture all data needed for
implementation and validation before writing any code.

> **Rate-limit awareness:** Figma MCP calls count against plan quotas. Use
> `figma_get_metadata` first to discover structure cheaply, then call
> `figma_get_design_context` only for the artboards you will implement.

### 1a: Discover Pages and Artboards

Call `figma_get_metadata` with no `nodeId`. This returns the top-level page list.
Then call `figma_get_metadata` again for each page that looks relevant to get its
artboard tree.

> If the user already shared a Figma URL, extract the `nodeId` from it:
> URL format: `https://figma.com/design/:fileKey/:name?node-id=1-2` → nodeId = `1:2`
> (replace `-` with `:`)

### 1b: Select Target Artboards

If there are multiple pages or artboards, show the user a list:

> "I found these artboards in your Figma file:
>
> - Page 1: [list artboard names + node IDs]
> - Page 2: [list artboard names + node IDs]
>
> Which artboards should I implement? (You can say 'all' or list specific names.)"

Wait for confirmation before proceeding.

### 1c: Capture Reference Screenshots

For each target artboard, call `figma_get_screenshot` and **save the screenshot and its
artboard dimensions** — you will compare against these in Phase 5.

```
figma_get_screenshot({ nodeId: "<artboardId>" })
// Store: { nodeId, screenshot, width: <from metadata>, height: <from metadata> }
```

> Never skip this step. The screenshots are your ground truth for Phase 5 validation.

### 1d: Extract Design Context

For each target artboard, call `figma_get_design_context`:

```
figma_get_design_context({
  nodeId: "<artboardId>",
  clientLanguages: "typescript",
  clientFrameworks: "angular",
  artifactType: "WEB_PAGE_OR_APP_SCREEN",
  taskType: "CREATE_ARTIFACT"
})
```

From the response, extract:

- **Component layer names** — match against `references/figma-component-map.md`
- **Layout structure** — frame type (auto-layout vs fixed), direction, gap, padding
- **Typography** — font family, weights, sizes used in the design
- **Color values** — used fills, strokes, backgrounds in this artboard
- **Active kit variant** — look for library component references whose source file name
  contains "Material", "Fluent", "Bootstrap", or "Indigo". This determines the
  `designSystem` value for Phase 3 theming. If it cannot be determined here, defer
  to Step 1e variable names and the visual heuristics in
  [references/design-token-bridge.md](references/design-token-bridge.md).

### 1e: Extract Design Tokens

For each target artboard, call `figma_get_variable_defs`:

```
figma_get_variable_defs({ nodeId: "<artboardId>" })
```

The response contains a map of variable names to values, e.g.:

```
"color/primary/500": "#6200EE"
"color/surface": "#FFFFFF"
"typography/body/font-family": "Roboto"
```

Use `references/design-token-bridge.md` to map color and typography variables to Ignite
UI theming inputs in Phase 3. Do **not** attempt to map Figma spacing or sizing values
— see `references/design-token-bridge.md § Spacing, Sizing, and Roundness` for why.

### 1f: Check for Existing Code Connect Mappings

Call `figma_get_code_connect_map` for each artboard. If mappings exist, they confirm
which Ignite UI Angular components correspond to which Figma nodes — use these to
validate or augment your component mapping in Phase 2.

```
figma_get_code_connect_map({ nodeId: "<artboardId>" })
```

### 1g: Build the Decomposition Table

Before writing any code, produce a decomposition table for **each artboard**:

| Figma Layer Name           | Visual Role        | Ignite UI Component     | Design Tokens Used  | Data Type       |
| -------------------------- | ------------------ | ----------------------- | ------------------- | --------------- |
| _e.g._ `_NavBar`           | Top navigation bar | `IgxNavbarComponent`    | `color/primary/500` | n/a             |
| _e.g._ `_Grid/Default`     | Data table         | `IgxGridComponent`      | `color/surface`     | Tabular records |
| _e.g._ `_Button/Contained` | Primary CTA        | `igxButton="contained"` | `color/primary/500` | n/a             |

Fallback to plain semantic HTML only when no Ignite UI component can match the layer
after consulting `references/figma-component-map.md`. Document the reason inline.

Present the decomposition table to the user for review before proceeding.

### 1h: Extract Image Assets

Read [references/asset-extraction.md](references/asset-extraction.md) in full before
running any extraction.

From the decomposition table, identify every layer that is a **static image asset**
(photo, background image, logo, custom icon, illustration) rather than an Ignite UI
component. Do **not** extract Indigo.Design UI Kit component instances — those become
Angular components.

**Detection signals:** layer names containing `image`, `photo`, `hero`, `banner`,
`thumbnail`, `logo`, `illustration`, `bg`, `background`; large RECTANGLE nodes in
hero/banner positions; VECTOR/GROUP nodes for logos and custom icons.

**Choose the extraction method based on asset type — always at the highest fidelity.**
Speed is not a criterion here; asset extraction is a one-time operation per build.

| Asset type                                                         | Method                                                       | Reference section                |
| ------------------------------------------------------------------ | ------------------------------------------------------------ | -------------------------------- |
| Image fill — photo, texture, raster uploaded to Figma              | REST API `/v1/files/:key/images` → original source file      | `asset-extraction.md § Method A` |
| Vector asset — logo, icon, illustration drawn in Figma             | REST API `/v1/images/:key?format=svg&svg_outline_text=false` | `asset-extraction.md § Method B` |
| Raster node export — complex composition with no single `imageRef` | REST API `/v1/images/:key?format=png&scale=2`                | `asset-extraction.md § Method B` |

> **Do not use `figma_get_screenshot` or localhost URLs from `figma_get_design_context`
> as final assets.** Both produce lower-quality output (1× screen captures or
> session-scoped renderer URLs). See `asset-extraction.md § What NOT to use`.

The Figma access token used for the MCP server is the same token required for all REST
API calls (`X-Figma-Token` header). Extract the file key from the Figma URL:
`https://figma.com/design/:fileKey/...` → `fileKey`.

After downloading, save assets to:

- `src/assets/images/` — raster images (PNG, JPG)
- `src/assets/icons/` — SVG icons and logos

Build a concise asset manifest (see `asset-extraction.md § Build an Asset Manifest`)
so the implementation phase uses consistent paths.

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

For every component family you will use, call `get_doc`:

```
list_components({ framework: "angular" })   // once, to discover doc names
get_doc({ framework: "angular", name: "<doc-name>" })  // per component family
```

Call all `get_doc` requests **in a single parallel batch** — never sequentially.
Do **not** write any component code until you have read its doc.

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

Read [references/design-token-bridge.md](references/design-token-bridge.md) in full
before running any theming tool.

### 3a: Inspect Existing Theme (Guard)

Open `src/styles.scss` (or the project's global stylesheet). Look for an active
`@include theme(...)` or `@include palette(...)` call.

- **Theme found** → do **not** call `theming_create_theme` or `theming_create_palette`
  unless the user explicitly asks for a global theme change. Reuse the existing palette.
  Skip to step 3d.
- **No theme found** → proceed with 3b.

### 3b: Resolve Design System

You don't need to call `theming_detect_platform` to confirm the Angular package layout. We already did that in Phase 0.

To determine the design system, use this precedence order:

1. An explicit user request ("make it Material", "use Fluent")
2. An existing theme variant in the project
3. The Figma file's metadata and/or visual language (Material-like shadows → Material; sharp corners + flat surfaces → Bootstrap or Fluent; rounded cards → Indigo)

Supported values: `material` (default), `bootstrap`, `fluent`, `indigo`.

### 3c: Generate Global Theme

Extract the following from Phase 1e variables using
[references/design-token-bridge.md](references/design-token-bridge.md):

```
primaryColor    ← from "color/primary/500" or "primary/500"
secondaryColor  ← from "color/secondary/500" or "secondary/500"
surfaceColor    ← from "color/surface" or "surface/default"
fontFamily      ← from "typography/font-family" or "typography/body/font-family"
```

Then call in order:

```
theming_create_palette({
  primaryColor, secondaryColor, surfaceColor,
  platform: "angular",
  licensed: <true if @infragistics package>
})

theming_create_elevations({
  preset: "material"   // or "indigo" if design system is Indigo
})

theming_create_typography({
  fontFamily,
  platform: "angular"
})

theming_create_theme({
  palette: <from create_palette>,
  elevations: <from create_elevations>,
  typography: <from create_typography>,
  variant: "<light|dark>",
  designSystem: "<resolved design system>",
  platform: "angular",
  licensed: <true if @infragistics package>
})
```

Apply the generated output to `src/styles.scss` as instructed in the tool's response.

### 3d: Per-Component Token Mapping

> **Scope:** applies only to core Ignite UI Angular components (grid, navbar, card,
> inputs, chips, list, etc.). Charts, maps, and gauges have no Sass tokens — configure
> those via component inputs only.

For **every** Ignite UI core component in your plan, run this loop:

1. `theming_get_component_design_tokens({ component: "<igx-component-name>" })`
   — review all token names, types, and descriptions
2. Go back to the Phase 1e variable map and find Figma variables that correspond to
   this component's surfaces (background, text, border, hover state)
3. `theming_create_component_theme({ component: "<igx-component-name>", platform: "angular", tokens: { <only differing tokens> } })`
4. Apply the generated `@include tokens(<theme>)` block to the component's SCSS or to a
   scoped block in `styles.scss`

When a specific component needs a different density or spacing from the global default,
use `theming_set_size` or `theming_set_spacing` with the `component` parameter — this
scopes `--ig-size` or `--ig-spacing` to that component’s selector rather than applying
globally. For compound components, use `scope` with a sub-component selector. Only
apply these globally (`:root`) when the entire app has a clearly distinct density.
Leave `theming_set_roundness` at its default unless the user explicitly requests a
change. Never derive multiplier values from Figma pixel values.
See `references/design-token-bridge.md § Spacing, Sizing, and Roundness`.

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

Take a browser screenshot and compare it visually against the Phase 1c Figma screenshot:

```
playwright_browser_take_screenshot({ type: "png" })
```

Do a section-by-section visual comparison: top bar → sidebar → content → footer.

### 5d: Measure Computed Styles

For each section with visible differences, use `playwright_browser_evaluate` to extract
exact values. Pass code as a **plain JavaScript string**, not a TypeScript function
reference (see [references/validation-patterns.md](references/validation-patterns.md)
for why and for reusable measurement snippets):

```
playwright_browser_evaluate({
  script: `
    const el = document.querySelector('<selector>');
    if (!el) return { error: 'not found' };
    const s = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return {
      fontSize: s.fontSize,
      backgroundColor: s.backgroundColor,
      padding: s.padding,
      gap: s.gap,
      height: r.height,
      width: r.width
    };
  `
})
```

Compare the returned values against the Figma spec (from Phase 1d design context).

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
- **Never commit `package-lock.json`** or other lock files unintentionally. Ask before
  changing any dependency manifest.

---

## Related Skills

- [`igniteui-angular-components`](../igniteui-angular-components/SKILL.md) — deep reference for non-grid components
- [`igniteui-angular-grids`](../igniteui-angular-grids/SKILL.md) — deep reference for grid, tree-grid, hierarchical-grid, pivot-grid
- [`igniteui-angular-theming`](../igniteui-angular-theming/SKILL.md) — theming system architecture and advanced palette patterns
- [`igniteui-angular-generate-from-image-design`](../igniteui-angular-generate-from-image-design/SKILL.md) — fallback when no Figma file is available (static image input)
