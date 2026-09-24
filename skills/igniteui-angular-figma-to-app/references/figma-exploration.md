# Figma Design Exploration

> **Part of the [`igniteui-angular-figma-to-app`](../SKILL.md) skill.**
>
> Use this file in Phase 1 to explore the Figma design and capture everything needed for
> implementation and validation. Read in full before the first Figma MCP call.

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

## 1a: Discover Pages and Artboards

Call `figma_get_metadata` with no `nodeId`. This returns the top-level page list.
Then call `figma_get_metadata` again for each page that looks relevant to get its
artboard tree.

> If the user already shared a Figma URL, extract the `nodeId` from it:
> URL format: `https://figma.com/design/:fileKey/:name?node-id=1-2` → nodeId = `1:2`
> (replace `-` with `:`)

## 1b: Select Target Artboards

If there are multiple pages or artboards, show the user a list:

> "I found these artboards in your Figma file:
>
> - Page 1: [list artboard names + node IDs]
> - Page 2: [list artboard names + node IDs]
>
> Which artboards should I implement? (You can say 'all' or list specific names.)"

Wait for confirmation before proceeding.

## 1c: Capture Reference Screenshots

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

## 1d: Extract Design Context

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
     Phase 1e variable names and [references/design-token-bridge.md](design-token-bridge.md).

4. Record all surface containers in the **Surfaces Spec** (added to Phase 1g).

## 1e: Extract Design Tokens

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

## 1f: Check for Existing Code Connect Mappings

Call `figma_get_code_connect_map` for each artboard. If mappings exist, they confirm
which Ignite UI Angular components correspond to which Figma nodes — use these to
validate or augment your component mapping in Phase 2.

```
figma_get_code_connect_map({ nodeId: "<artboardId>" })
```

## 1g: Build the Decomposition Table

Before writing any code, produce **two tables** for **each artboard**.

### Table A — Ignite UI Components

| Figma Layer Name           | Visual Role        | Ignite UI Component     | Design Tokens Used  | Data Type       |
| -------------------------- | ------------------ | ----------------------- | ------------------- | --------------- |
| _e.g._ `_NavBar`           | Top navigation bar | `IgxNavbarComponent`    | `color/primary/500` | n/a             |
| _e.g._ `_Grid/Default`     | Data table         | `IgxGridComponent`      | `color/surface`     | Tabular records |
| _e.g._ `_Button/Contained` | Primary CTA        | `igxButton="contained"` | `color/primary/500` | n/a             |

Fallback to plain semantic HTML only when no Ignite UI component can match the layer
after consulting `references/figma-component-map.md`. Document the reason inline.

### Table B — Layout Surfaces

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

## 1h: Extract Image Assets

Read [references/asset-extraction.md](asset-extraction.md) in full before
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
