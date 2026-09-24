# Figma Design Exploration

> **Part of the [`igniteui-angular-figma-to-app`](../SKILL.md) skill.**
>
> Use this file in Phase 1 to explore the Figma design and capture everything needed for
> implementation and validation. Read in full before the first Figma MCP call.

**Goal:** understand the full design structure and capture all data needed for
implementation and validation before writing any code.

> **Rate-limit awareness:** Figma MCP limits depend on the **seat**, not only the plan
> (as published in September 2026; verify at
> https://developers.figma.com/docs/figma-mcp-server/rate-limits-access/):
> **View/Collab seats** get up to 6 calls/month (20 on Starter). **Dev/Full seats** get
> 200/day (Starter, Professional) or 600/day (Organization, Enterprise), with 10–20/min.
>
> Estimated call budget for a 5-artboard design:
> `figma_get_metadata` ×2 + `figma_get_screenshot` ×5 + `figma_get_design_context` ×5 + `figma_get_variable_defs` ×1 + `figma_get_code_connect_map` ×5 + `figma_get_libraries` ×1 = **~19 calls**.
> Retries and sparse-response follow-ups add to this. **Compare the estimate with the
> user's remaining quota before starting.** On a View/Collab seat (6/month on Professional
> and above) even one artboard may not fit. The Starter View/Collab limit (20/month) covers
> a small design with no retries. When the estimate does not fit, say so and suggest a
> Dev/Full seat, or the REST API with a personal access token for metadata and assets.
> Strategies:
> 1. Call `figma_get_variable_defs` only **once** for the root page (variables are file-scoped, not artboard-scoped — calling it per artboard wastes quota on duplicate data).
> 2. Prioritize `figma_get_design_context` over additional screenshots if quota is tight.
> 3. For large files, consider implementing one artboard per monthly budget cycle.
>
> Use `figma_get_metadata` first to discover structure cheaply, then call
> `figma_get_design_context` only for the artboards you will implement.

## Before the First Call: Determine the Figma MCP Variant

Two Figma MCP variants exist and they are driven differently. Establish which one you
have **before** Phase 1, because it decides whether you can navigate artboards yourself.

| Variant                     | Signal                                                             | How you drive it                                                                     |
| --------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| **Remote / addressable**    | `get_design_context` / `get_metadata` require `fileKey` + `nodeId` | Pass `fileKey` and `nodeId` explicitly. You can iterate artboards without the user.   |
| **Desktop / session-bound** | Tools take no required params and act on the current selection     | Ask the user to click each frame in Figma before every call. Any `nodeId` is ignored. |

Check the tool signature of `figma_get_metadata`. If `fileKey` is required, you have the
addressable variant — **prefer it**, and ask the user once for the file URL:

```
https://figma.com/design/:fileKey/:fileName?node-id=1-2   →   fileKey = ":fileKey", nodeId = "1:2"
```

When only the session-bound variant is available, drop `fileKey`/`nodeId` and insert this
step before each call:

> *"In Figma, please click the **[Artboard Name]** frame to select it, then confirm."*

Wait for confirmation before calling. Never batch session-bound calls.

## 1a: Discover Pages and Artboards

Call `figma_get_metadata` with no `nodeId` (and pass `fileKey` on the addressable variant). This returns the top-level page list.
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

For each target artboard:

1. **Addressable variant:** call
   `figma_get_screenshot({ fileKey: "<fileKey>", nodeId: "<artboardId>", maxDimension: 2048 })`.
   **Session-bound variant:** ask the user to select the artboard in Figma, wait for
   confirmation, then call `figma_get_screenshot({})`. Do **not** batch these calls before
   the user navigates.
2. **Download each screenshot to disk** (e.g. `.figma-reference/<artboard-name>.png`) —
   returned URLs are short-lived, and Phase 5 compares against these files. Record
   `{ artboardName, nodeId, file, width, height }`.

After all artboards are captured, confirm the count:
> *"I have N reference screenshots: [list artboard names]. Proceeding to design context extraction."
> If any are missing, navigate to that artboard in Figma and recapture before continuing.*

> Never skip this step. The screenshots are your ground truth for Phase 5 validation.

## 1d: Extract Design Context

> **Output format:** `figma_get_design_context` returns **React + Tailwind CSS code**, not
> structured Angular metadata. The response is explicitly tagged *"SUPER CRITICAL: The
> generated React+Tailwind code MUST be converted to match the target project's technology
> stack."* Do **not** copy the React code into Angular files. Instead, read the JSX to extract
> the information below. Image localhost URLs in the output are session-scoped previews —
> do **not** use them as final assets (see Phase 1h and `references/asset-extraction.md`).

For **each** target artboard:

1. On the session-bound variant, ask the user to select the artboard and wait for
   confirmation. On the addressable variant, pass `fileKey` and `nodeId` instead.
2. Call:
   ```
   figma_get_design_context({
     fileKey: "<fileKey>", nodeId: "<artboardId>",   // addressable variant only
     clientLanguages: "typescript",
     clientFrameworks: "angular",
     artifactType: "WEB_PAGE_OR_APP_SCREEN",
     taskType: "CREATE_ARTIFACT"
   })
   ```
3. From the React+Tailwind output, extract:

   - **Component layer names and props** — the `data-name` attributes and any component
     props or variant values in the JSX. Phase 1f classifies and normalizes them.
   - **Layout structure** — `flex`, `grid`, `gap-*`, `p-*`, `w-*`, `h-*` Tailwind classes on container divs
   - **Typography** — `font-['...']`, `text-[...]`, `font-weight` classes
   - **Surface colors** — `bg-[#XXXXXX]` classes on container `<div>` elements that wrap major sections
     (these become plain `<div>` wrappers in Angular with `background: #XXXXXX`)
   - **Border/roundness** — `rounded-[...]`, `border`, `border-[...]` classes on containers and cards
   - **Input type variants** *(Tier A only)* — look for hidden zero-size nodes (`size-[0.5px]`)
     whose `data-name` contains a component type (e.g. `"Date Picker Type"`, `"Combo Input"`).
     These are the Indigo.Design kit's **variant indicator nodes**, and their name encodes
     which input variant (border/line/box) is active for that component. For other kits,
     read the field style from its variant property or visuals (outlined / filled /
     underlined, label floating or above).
   - **Chart series colors** — for any chart layer, note the fill colors on its series paths
   - **Color census** — which colors appear on which kinds of element: high-emphasis button
     fills, page and card backgrounds, borders, primary and secondary text, error states.
     For Tier B/C designs, Phase 3 seeds the palette from this (see
     `design-token-bridge.md § B2`), not from variable names.
   - **Measured control heights** — button, input, and list-row heights. Phase 3 uses them
     to pick `--ig-size`.
   - **Action controls** — list every button, icon button, and toolbar action visible in the artboard;
     this is your authoritative inventory — do not add actions not present in the design
   - **Provenance signals** — library/source file names (e.g. `Indigo.Design UI Kit for
     Material`, `Material 3 Design Kit`, `shadcn/ui`), naming conventions (`_Button/…` vs
     `Button` with `Variant=…`), and un-componentized frames. Phase 1f turns them into a
     tier for each instance.

4. Record all surface containers in the **Surfaces Spec** (added to Phase 1g).

## 1e: Extract Design Tokens

> Figma variables are **file-scoped**, not artboard-scoped. Call `figma_get_variable_defs`
> **once** for the root page node — not once per artboard. Calling it multiple times returns
> identical data and wastes plan quota.

Call once:

```
figma_get_variable_defs({})                                        // session-bound variant
figma_get_variable_defs({ fileKey: "<fileKey>", nodeId: "<pageId>" }) // addressable variant
```

The response contains a map of variable names to values, e.g.:

```
"color/primary/500": "#6200EE"
"color/surface": "#FFFFFF"
"typography/body/font-family": "Roboto"
```

Use `references/design-token-bridge.md` to map color and typography variables to Ignite
UI theming inputs in Phase 3. Third-party kits name variables differently
(`md.sys.color.primary`, `Colors/Brand/600`, `colorBrandBackground`, `primary-foreground`,
…). Record them as-is. Phase 3 matches them to roles by **usage** (the Phase 1d color
census), not by name. Files without variables are normal for Tier C designs. The color
census then provides every seed. Do **not** attempt to map Figma spacing or sizing values
— see `references/design-token-bridge.md § Spacing, Sizing, and Roundness` for why.

## 1f: Classify Provenance and Normalize Components

Read [design-provenance.md](design-provenance.md) in full.

1. Call `figma_get_libraries` **once per file**, if the connected server exposes it. The
   subscribed library names (`Indigo.Design UI Kit for Material`, `Material 3 Design Kit`,
   `shadcn/ui`, an in-house library) are the fastest provenance signal.
2. Check for Code Connect mappings:

   ```
   figma_get_code_connect_map({ nodeId: "<artboardId>" })   // + fileKey on the addressable variant
   ```

   Mappings are strong evidence of a component's **role and props**. They may point at
   **another library** (e.g. a shadcn kit connected to `@/components/ui/button`). Never copy
   their imports or selectors: the target is always Ignite UI for Angular.

3. Classify **every** component-like layer as **Tier A** (Indigo.Design kit), **Tier B**
   (any other component library), or **Tier C** (un-componentized). Classify per instance,
   not per file.
4. Normalize Tier B instances to a canonical role + emphasis/style + measured height, using
   their variant properties. When names are ambiguous and a file key and token are
   available, read exact `componentProperties` from the REST API
   (`design-provenance.md § Step 1`).
5. Infer Tier C roles from structure and visuals. Mark them **low confidence**.
6. Record the dominant tier. It selects the Phase 3 theming path (A or B).

## 1g: Build the Decomposition Table

Before writing any code, produce **two tables** for **each artboard**.

### Table A — Ignite UI Components

| Figma Layer Name | Tier | Canonical Role + Props | Ignite UI Component | Confidence | Anatomy Deltas | Data Type |
| --- | --- | --- | --- | --- | --- | --- |
| _e.g._ `_NavBar` | A | `app-bar` | `IgxNavbarComponent` | high | — | n/a |
| _e.g._ `_Grid/Default` | A | `data-table` | `IgxGridComponent` | high | — | Tabular records |
| _e.g._ `Button` (`Variant=outline, Size=sm`) | B | `button` · medium · 32px | `igxButton="outlined"` | high | casing, radius → tokens | n/a |
| _e.g._ `Frame 427` | C | `tag` · pill · 24px | `IgxBadgeComponent` | low | confirm with user | n/a |

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

Present both tables to the user for review before proceeding. List **low-confidence**
mappings first and ask the user to confirm or correct them. A wrong role is the most
expensive mistake to fix after Phase 4.

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
Do **not** extract component instances that Table A maps to a component, whatever kit
they come from, or icons available from a registerable icon package
(`figma-component-map.md § Icons from other kits`).

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
