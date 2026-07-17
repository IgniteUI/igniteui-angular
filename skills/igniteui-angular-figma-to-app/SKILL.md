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

## Required Workflow

Complete all phases in order — do not skip phases or generate component code from
memory. Every component selector, input name, and import path must come from
`get_doc` results or, where no doc exists in the catalog, from the
`igniteui-angular-components` / `igniteui-angular-grids` skill reference files —
never guessed.

Read [references/figma-component-map.md](references/figma-component-map.md) before Phase 2.
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

Check whether the current working directory contains a valid Angular + Ignite UI project:

```
1. Does package.json exist?
2. Does it list "igniteui-angular" OR "@infragistics/igniteui-angular" in dependencies?
3. Is there a src/app/ directory?
```

**If a valid project is found:**

- Note the package layout: `igniteui-angular` (open-source) or `@infragistics/igniteui-angular` (licensed)
- Note the Angular version from `package.json`
- **Check the MCP configuration for all four required server entries** — `figma`, `igniteui-cli`,
  `igniteui-theming`, and `playwright` (in `.vscode/mcp.json` or the client's equivalent).
  If `igniteui-cli` or `igniteui-theming` is missing, run `npx -y igniteui-cli ai-config`
  from the project root — it configures both servers and copies the Agent Skills, preserving
  existing entries. Add missing `figma` and `playwright` entries from
  [references/mcp-setup.md](references/mcp-setup.md). Projects scaffolded with
  `npx igniteui-cli new` have `igniteui-cli` pre-wired but typically lack the other three.
  A reload is required before newly configured servers' tools appear.
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

> **Rate-limit awareness:** Figma MCP calls count against plan quotas
> (indicative, subject to change — verify against the user's current Figma plan:
> Starter **6 calls/month**, Organization 200/day, Enterprise 600/day).
>
> Estimated call budget for a 5-artboard design:
> `figma_get_metadata` ×2 + `figma_get_screenshot` ×5 + `figma_get_design_context` ×5 + `figma_get_variable_defs` ×1 + `figma_get_code_connect_map` ×5 = **~18 calls**.
> **Starter plan users will exceed their monthly quota in a single session.** Strategies:
> 1. Call `figma_get_variable_defs` only **once** for the root page (variables are file-scoped, not artboard-scoped — calling it per artboard wastes quota on duplicate data).
> 2. Prioritize `figma_get_design_context` over additional screenshots if quota is tight.
> 3. For large files, consider implementing one artboard per monthly budget cycle.
>
> Use `figma_get_metadata` first to discover structure cheaply, then call
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

> **IMPORTANT — Figma MCP is session-bound.** The `figma_get_screenshot` tool returns a
> screenshot of the **currently selected node in the Figma desktop app**, regardless of any
> `nodeId` parameter passed. To capture each artboard, you must ask the user to navigate
> to it in Figma first.

For each target artboard:

1. Ask the user: *"In Figma, please click the **[Artboard Name]** frame to select it, then confirm."*
2. Wait for confirmation, then call:
   ```
   figma_get_screenshot({})
   // Store: { artboardName, screenshotFile, width: <from metadata>, height: <from metadata> }
   ```
3. Repeat for each artboard — do **not** batch these calls before the user navigates.

After all artboards are captured, confirm the count:
> *"I have N reference screenshots: [list artboard names]. Proceeding to design context extraction."
> If any are missing, navigate to that artboard in Figma and recapture before continuing.*

> Never skip this step. The screenshots are your ground truth for Phase 5 validation.

### 1d: Extract Design Context

> **IMPORTANT — Figma MCP is session-bound.** The `figma_get_design_context` tool returns
> context for the **currently selected node in the Figma desktop app**. You must ask the
> user to navigate to each artboard before calling this tool.
>
> **Output format:** `figma_get_design_context` returns **React + Tailwind CSS code**, not
> structured Angular metadata. The response is explicitly tagged *"SUPER CRITICAL: The
> generated React+Tailwind code MUST be converted to match the target project's technology
> stack."* Do **not** copy the React code into Angular files. Instead, read the JSX to extract
> the information below. Image localhost URLs in the output are session-scoped previews —
> do **not** use them as final assets (see Phase 1h and `references/asset-extraction.md`).

For **each** target artboard:

1. Ask the user: *"In Figma, please click the **[Artboard Name]** frame to select it, then confirm."*
2. Wait for confirmation, then call:
   ```
   figma_get_design_context({
     clientLanguages: "typescript",
     clientFrameworks: "angular",
     artifactType: "WEB_PAGE_OR_APP_SCREEN",
     taskType: "CREATE_ARTIFACT"
   })
   ```
3. From the React+Tailwind output, extract:

   - **Component layer names** (`data-name` attributes in the JSX) — match against `references/figma-component-map.md`
   - **Layout structure** — `flex`, `grid`, `gap-*`, `p-*`, `w-*`, `h-*` Tailwind classes on container divs
   - **Typography** — `font-['...']`, `text-[...]`, `font-weight` classes
   - **Surface colors** — `bg-[#XXXXXX]` classes on container `<div>` elements that wrap major sections
     (these become plain `<div>` wrappers in Angular with `background: #XXXXXX`)
   - **Border/roundness** — `rounded-[...]`, `border`, `border-[...]` classes on containers and cards
   - **Input type variants** — look for hidden zero-size nodes (`size-[0.5px]`) whose `data-name`
     contains a component type (e.g. `"Date Picker Type"`, `"Combo Input"`). These are the
     Indigo.Design kit's **variant indicator nodes** — their name encodes which input variant
     (border/line/box) is active for that component.
   - **Chart series colors** — for any chart layer, note the fill colors on its series paths
   - **Action controls** — list every button, icon button, and toolbar action visible in the artboard;
     this is your authoritative inventory — do not add actions not present in the design
   - **Active kit variant** — look for library component references whose source file name
     contains "Material", "Fluent", "Bootstrap", or "Indigo". If not found here, defer to
     Phase 1e variable names and [references/design-token-bridge.md](references/design-token-bridge.md).

4. Record all surface containers in the **Surfaces Spec** (added to Phase 1g).

### 1e: Extract Design Tokens

> Figma variables are **file-scoped**, not artboard-scoped. Call `figma_get_variable_defs`
> **once** for the root page node — not once per artboard. Calling it multiple times returns
> identical data and wastes plan quota.

Call once:

```
figma_get_variable_defs({})
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

Before writing any code, produce **two tables** for **each artboard**.

#### Table A — Ignite UI Components

| Figma Layer Name           | Visual Role        | Ignite UI Component     | Design Tokens Used  | Data Type       |
| -------------------------- | ------------------ | ----------------------- | ------------------- | --------------- |
| _e.g._ `_NavBar`           | Top navigation bar | `IgxNavbarComponent`    | `color/primary/500` | n/a             |
| _e.g._ `_Grid/Default`     | Data table         | `IgxGridComponent`      | `color/surface`     | Tabular records |
| _e.g._ `_Button/Contained` | Primary CTA        | `igxButton="contained"` | `color/primary/500` | n/a             |

Fallback to plain semantic HTML only when no Ignite UI component can match the layer
after consulting `references/figma-component-map.md`. Document the reason inline.

#### Table B — Layout Surfaces

Record every **non-IgxXxx container** that carries visual properties (background color,
border, padding, shadow). These are plain `<div>` wrappers in Angular — not Ignite UI
components — but they are critical to visual fidelity. Populate this table from the
`bg-[...]`, `rounded-[...]`, `border`, `p-[...]`, and `shadow-[...]` Tailwind classes
observed on container divs in the Phase 1d design context output.

| Figma Frame / Container Name | Background | Border-Radius | Padding | Border | Shadow | Encloses (child sections) |
| ---------------------------- | ---------- | ------------- | ------- | ------ | ------ | ------------------------- |
| _e.g._ `Budget Categories`  | `#222222`  | `4px`         | `24px`  | none   | none   | Categories list, Add button |
| _e.g._ `Friend Card`        | `#222222`  | `8px`         | `24px 16px` | `1px solid #333` | none | Avatar, name, phone, email, buttons |

> **Rule:** if a section appears on a surface in Figma (i.e. its container has a
> non-transparent background), it **must** have that background in the Angular implementation.
> If a section floats on the page background (transparent), do **not** add a surface wrapper.
> Never infer surface structure from another page — always derive it from the design context
> for the specific artboard being implemented.

Present both tables to the user for review before proceeding.

### 1h: Extract Image Assets

Read [references/asset-extraction.md](references/asset-extraction.md) in full before
running any extraction.

**Zero-placeholder policy:** every image visible in the Figma design must be extracted
and committed to `src/assets/` before Phase 4. Gradient placeholders are not acceptable.

**Step 0 — Get the file key first.** Ask the user to share the Figma file URL or key
before attempting any extraction. In Figma desktop: right-click the file tab →
**Copy link**. Without it you fall back to Tier 2 or Tier 3 (see below).

From the decomposition tables, identify every layer that is a **static image asset**
(photo, background, logo, custom icon, illustration) rather than an Ignite UI component.
Do **not** extract Indigo.Design UI Kit component instances.

**Use the four-tier decision tree from `asset-extraction.md`:**

| Tier | Method | When to use |
| ---- | ------ | ----------- |
| **1** | REST API `/v1/files/:key/images` (Method A) or `/v1/images/:key` (Method B) | File key available — always the highest fidelity |
| **2** | Download localhost URLs from `figma_get_design_context` with `curl` | No file key; Figma session is active; design context was already called |
| **3** | `figma_get_screenshot` per node (ask user to select each node) | No file key; no localhost URLs |
| **4** | CSS gradient/color placeholder with `// TODO` comment | Only for confirmed pure-color fills — never as a shortcut |

After extraction, save assets to:
- `src/assets/images/` — raster images (PNG, JPG)
- `src/assets/icons/` — SVG icons and logos

Build a concise asset manifest (see `asset-extraction.md § Build an Asset Manifest`)
so the implementation phase uses consistent paths.

If you used Tier 2 or Tier 3 for any asset, tell the user which ones need re-export
once the file key becomes available.

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

Read [references/design-token-bridge.md](references/design-token-bridge.md) in full
before running any theming tool.

### 3a: Inspect Existing Theme (Guard)

Open `src/styles.scss` (or the project's global stylesheet). Look for an active
`@include theme(...)` or `@include palette(...)` call.

- **Theme found, but variant mismatch** — if the existing theme is **light** and the
  Figma design is **dark** (or vice versa), treat this as a theme change and proceed with
  3b–3c. A light theme applied to a dark design produces wrong background colors on every
  component and will fail every Phase 5 check.
- **Theme found, variant matches** → do **not** call `theming_create_theme` or
  `theming_create_palette` unless the user explicitly asks for a global theme change.
  Reuse the existing palette. Skip to step 3d.
- **No theme found** → proceed with 3b.

Detect the Figma design's variant from Phase 1e: if a `color/mode` variable exists,
use its value. Otherwise, use the artboard background color: near-black (`#121212`,
`#1a1a1a`, `#000`) → `"dark"`; near-white (`#fff`, `#f5f5f5`) → `"light"`.

### 3b: Resolve Design System

You don't need to call `theming_detect_platform` to confirm the Angular package layout. We already did that in Phase 0.

To determine the design system, use this **strict precedence order**. Stop at the first
signal that gives a clear answer:

1. **Explicit user request** — "make it Material", "use Fluent", etc.
2. **Library source name in design context** — the `figma_get_design_context` or
   `figma_get_metadata` response may reference the Figma source library file name
   (e.g. `"Indigo.Design UI Kit for Material"` → `material`).
3. **Variable collection names from Phase 1e** — collection names like
   `Material/color/primary` identify the kit variant directly.
4. **Elevation variable structure** — inspect the `Elevations/*` variables in
   `figma_get_variable_defs` output:
   - **Three-layer DROP_SHADOW** (umbra + penumbra + ambient) → **Material Design**
   - **Single-layer DROP_SHADOW** → Indigo, Fluent, or Bootstrap
5. **Palette shade naming** — variables named `primary/500`, `primary/100`–`primary/900`
   follow the Material 100–900 palette convention → likely **Material**.
6. **Visual heuristics** (use only when all above are inconclusive):
   prominent shadows + ripple effects → `"material"`;
   flat surfaces + sharp corners + Segoe/Inter font → `"fluent"`;
   component borders + Bootstrap grid → `"bootstrap"`;
   rounded purple/indigo accents without Material shadows → `"indigo"`.

> **Never use font name as a primary signal.** "Titillium Web" is the default body font
> in the Indigo.Design UI Kit for Material — it is not exclusive to the Indigo design system.

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

> **Parameter names differ between tools** — `theming_create_palette` uses `primary`,
> `secondary`, `surface` (not `primaryColor` etc.). `theming_create_theme` uses
> `primaryColor`, `secondaryColor`, `surfaceColor`. Do not mix them up.

> **fontFamily double-quote bug** — `theming_create_theme` may double-wrap the fontFamily
> string (e.g. `""'Titillium Web', sans-serif""`) in its Sass output, producing invalid Sass.
> If you see double-quoted strings in the generated output, strip the outer quotes before
> applying to `styles.scss`.

```
theming_create_palette({
  primary: primaryColor,
  secondary: secondaryColor,
  surface: surfaceColor,
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
