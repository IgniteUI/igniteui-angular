# Figma Design Exploration

> **Part of the [`igniteui-angular-figma-to-app`](../SKILL.md) skill.**
>
> Use this file in Phase 1 to explore the Figma design and capture everything needed for implementation and validation. Read in full before the first Figma MCP call.

**Goal:** understand the full design structure and capture all data needed for implementation and validation before writing any code.

> **Rate-limit awareness:** Figma MCP limits depend on the **seat**, not only the plan (as published in September 2026; verify at https://developers.figma.com/docs/figma-mcp-server/rate-limits-access/): **View/Collab seats** get up to 6 calls/month (20 on Starter). **Dev/Full seats** get 200/day (Starter, Professional) or 600/day (Organization, Enterprise), with 10–20/min.
>
> Estimated call budget for a 5-artboard design: `figma_get_metadata` ×2 + `figma_get_screenshot` ×5 + `figma_get_design_context` ×5 + `figma_get_variable_defs` ×1 per target page + `figma_get_code_connect_map` ×5 + `figma_get_libraries` ×1 = **~19 calls**. Retries and sparse-response follow-ups add to this. **Compare the estimate with the user's remaining quota before starting.** On a View/Collab seat (6/month on Professional and above) even one artboard may not fit. The Starter View/Collab limit (20/month) covers a small design with no retries. When the estimate does not fit, say so and suggest a Dev/Full seat, or the REST API with a personal access token for metadata and assets. Strategies:
> 1. Call `figma_get_variable_defs` once per **target page**, not once per artboard. It returns the variables used inside the node you pass, so one page-level call covers every artboard on that page.
> 2. Prioritize `figma_get_design_context` over additional screenshots if quota is tight.
> 3. For large files, consider implementing one artboard per monthly budget cycle.
>
> Use `figma_get_metadata` first to discover structure cheaply, then call `figma_get_design_context` only for the artboards you will implement.

## Before the First Call: Determine the Figma MCP Variant

Figma has two official MCP servers (setup: `mcp-setup.md § 1. Figma MCP`). Establish which one is connected **before** Phase 1, because it decides how you address artboards.

| Variant | How to recognize it | How you drive it |
| --- | --- | --- |
| **Remote** | Configured URL `https://mcp.figma.com/mcp`; the tools take `fileKey` | Pass `fileKey` and a `nodeId` (page or artboard) on **every** call. You can iterate artboards without the user. |
| **Desktop** | Configured URL `http://127.0.0.1:3845/mcp`; the tools take no `fileKey` | Works only on the file **open in the Figma desktop app**. Pass the `nodeId` from a frame link, or act on the current selection. |

Prefer the remote variant, and ask the user once for the file URL:

```
https://figma.com/design/:fileKey/:fileName?node-id=1-2   →   fileKey = ":fileKey", nodeId = "1:2"
```

On the remote variant, treat both `fileKey` and `nodeId` as required, even if the schema marks `nodeId` optional. Calls without a node are not reliably supported.

On the desktop variant:

1. Make sure the user has the design file **open** in the desktop app.
2. When the user can share frame links (right-click → **Copy link to selection**), pass each frame's `nodeId` and **check that the response describes the requested frame** (same name and size as in the Phase 1a metadata).
3. If the response describes a different node, or the user cannot share links, fall back to selection: ask *"In Figma, please click the **[Artboard Name]** frame to select it, then confirm."*, wait for confirmation, and call the tool with no node. Never batch selection-based calls: each one depends on what the user has selected at that moment.

## 1a: Discover Pages and Artboards

The goal is to list the pages, then get each relevant page's artboard tree. The calls differ by variant:

```
// Remote variant: fileKey and nodeId are both required
figma_get_metadata({ fileKey: "<fileKey>", nodeId: "<pageId>" })

// Desktop variant: a nodeId from a page or frame link, or no arguments to use the current selection
figma_get_metadata({ nodeId: "<pageId>" })
figma_get_metadata({})
```

**Remote variant.** Choose the starting `nodeId` like this:

1. If the shared URL has a `node-id`, use it (replace `-` with `:`, e.g. `1-2` → `1:2`). URL format: `https://figma.com/design/:fileKey/:name?node-id=1-2`.
2. Otherwise, list the pages with the REST API when a token is available. It costs no MCP quota: `GET https://api.figma.com/v1/files/:fileKey?depth=1` returns `document.children[]` with each page's `id` and `name`.
3. Otherwise, ask the user to copy the link to the page or a frame (right-click → **Copy link to selection**) and take its `node-id`.

If that node is a single frame rather than a page, the response covers only that frame's subtree. To see its sibling artboards, get the page's `id` (step 2 or 3) and call `figma_get_metadata` again with it. Repeat for every page that looks relevant.

**Desktop variant.** The user must have the file open in the desktop app. With a link to the page or a frame, pass its `nodeId` and check the response. Otherwise ask the user to open the relevant page and select its top-level frames (or the page in the Layers panel), then call `figma_get_metadata({})`. Repeat for each relevant page, waiting for confirmation each time.

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

1. **Remote variant:** call `figma_get_screenshot({ fileKey: "<fileKey>", nodeId: "<artboardId>", maxDimension: 2048 })`. **Desktop variant:** call `figma_get_screenshot({ nodeId: "<artboardId>" })` and check that the image shows the requested artboard. If it does not, or you have no node ID, ask the user to select the artboard, wait for confirmation, then call `figma_get_screenshot({})`. Do **not** batch selection-based calls.
2. **Save each screenshot to disk** (e.g. `.figma-reference/<artboard-name>.png`). Phase 5 compares against these files. If the tool returns a URL, download it right away (it is short-lived). If it returns the image inline and you cannot write it to disk, export the node through the REST API instead (`GET /v1/images/:fileKey?ids=<nodeId>&format=png&scale=2`, see `asset-extraction.md`) when a token is available. Otherwise keep the image in context for Phase 5. Record `{ artboardName, nodeId, file, width, height }`.

After all artboards are captured, confirm the count:

> *"I have N reference screenshots: [list artboard names]. Proceeding to design context extraction."*

If any are missing, recapture them: by `nodeId` on the remote server, or by asking the user to select the artboard on the desktop server.

> Never skip this step. The screenshots are your ground truth for Phase 5 validation.

## 1d: Extract Design Context

> **Output format:** `figma_get_design_context` returns **React + Tailwind CSS code**, not structured Angular metadata. The response is explicitly tagged *"SUPER CRITICAL: The generated React+Tailwind code MUST be converted to match the target project's technology stack."* Do **not** copy the React code into Angular files. Instead, read the JSX to extract the information below. Asset URLs in the output (localhost on the desktop server, https on the remote server) are short-lived previews — do **not** use them as final assets (see Phase 1h and `references/asset-extraction.md`).

For **each** target artboard:

1. On the remote variant, pass `fileKey` and `nodeId`. On the desktop variant, pass the `nodeId` and check the response, or fall back to selection (see [Before the First Call](#before-the-first-call-determine-the-figma-mcp-variant)).
2. Call:
   ```
   figma_get_design_context({
     fileKey: "<fileKey>",     // remote variant only
     nodeId: "<artboardId>",   // both variants (desktop: check the response)
     clientLanguages: "typescript",
     clientFrameworks: "angular",
     artifactType: "WEB_PAGE_OR_APP_SCREEN",
     taskType: "CREATE_ARTIFACT"
   })
   ```
3. From the React+Tailwind output, extract:

   - **Component layer names and props** — the `data-name` attributes and any component props or variant values in the JSX. Phase 1f classifies and normalizes them.
   - **Layout structure** — `flex`, `grid`, `gap-*`, `p-*`, `w-*`, `h-*` Tailwind classes on container divs
   - **Typography** — `font-['...']`, `text-[...]`, `font-weight` classes
   - **Surface colors** — `bg-[#XXXXXX]` classes on container `<div>` elements that wrap major sections (these become plain `<div>` wrappers in Angular with `background: #XXXXXX`)
   - **Border/roundness** — `rounded-[...]`, `border`, `border-[...]` classes on containers and cards
   - **Input type variants** *(Tier A only)* — look for hidden zero-size nodes (`size-[0.5px]`) whose `data-name` contains a component type (e.g. `"Date Picker Type"`, `"Combo Input"`). These are the Indigo.Design kit's **variant indicator nodes**, and their name encodes which input variant (border/line/box) is active for that component. For other kits, read the field style from its variant property or visuals (outlined / filled / underlined, label floating or above).
   - **Chart series colors** — for any chart layer, note the fill colors on its series paths
   - **Color census** — which colors appear on which kinds of element: high-emphasis button fills, page and card backgrounds, borders, primary and secondary text, error states. For Tier B/C designs, Phase 3 seeds the palette from this (see `design-token-bridge.md § B2`), not from variable names.
   - **Measured control heights** — button, input, and list-row heights. Phase 3 uses them to pick `--ig-size`.
   - **Action controls** — list every button, icon button, and toolbar action visible in the artboard; this is your authoritative inventory — do not add actions not present in the design
   - **Provenance signals** — library/source file names (e.g. `Indigo.Design UI Kit for Material`, `Material 3 Design Kit`, `shadcn/ui`), naming conventions (`_Button/…` vs `Button` with `Variant=…`), and un-componentized frames. Phase 1f turns them into a tier for each instance.

4. Record all surface containers for **Table B — Layout Surfaces** (Phase 1g).

## 1e: Extract Design Tokens

> `figma_get_variable_defs` returns the variables and styles **used inside the node you pass** (or the current selection), not every variable in the file. Call it **once per target page**, with the page's node ID. That covers every target artboard on the page without spending a call per artboard. If the targets span two pages, call it twice.

```
// Remote variant
figma_get_variable_defs({ fileKey: "<fileKey>", nodeId: "<pageId>" })

// Desktop variant: the page's nodeId (check the response), or select the page and pass nothing
figma_get_variable_defs({ nodeId: "<pageId>" })
figma_get_variable_defs({})
```

The response contains a map of variable names to values, e.g.:

```
"color/primary/500": "#6200EE"
"color/surface": "#FFFFFF"
"typography/body/font-family": "Roboto"
```

Use `references/design-token-bridge.md` to map color and typography variables to Ignite UI theming inputs in Phase 3. Third-party kits name variables differently (`md.sys.color.primary`, `Colors/Brand/600`, `colorBrandBackground`, `primary-foreground`, …). Record them as-is. Phase 3 matches them to roles by **usage** (the Phase 1d color census), not by name. Files without variables are normal for Tier C designs. The color census then provides every seed. Do **not** attempt to map Figma spacing or sizing values — see `references/design-token-bridge.md § Spacing, Sizing, and Roundness` for why.

## 1f: Classify Provenance and Normalize Components

Read [design-provenance.md](design-provenance.md) in full.

1. Call `figma_get_libraries` **once per file**, if the connected server exposes it. The subscribed library names (`Indigo.Design UI Kit for Material`, `Material 3 Design Kit`, `shadcn/ui`, an in-house library) are the fastest provenance signal.
2. Check for Code Connect mappings:

   ```
   figma_get_code_connect_map({ fileKey: "<fileKey>", nodeId: "<artboardId>" })      // remote variant
   figma_get_code_connect_map({ nodeId: "<artboardId>" })                            // desktop variant
   ```

   Mappings are strong evidence of a component's **role and props**. They may point at **another library** (e.g. a shadcn kit connected to `@/components/ui/button`). Never copy their imports or selectors: the target is always Ignite UI for Angular.

3. Classify **every** component-like layer as **Tier A** (Indigo.Design kit), **Tier B** (any other component library), or **Tier C** (un-componentized). Classify per instance, not per file.
4. Normalize Tier B instances to a canonical role + emphasis/style + measured height, using their variant properties. When names are ambiguous and a file key and token are available, read exact `componentProperties` from the REST API (`design-provenance.md § Step 1`).
5. Infer Tier C roles from structure and visuals. Mark them **low confidence**.
6. Record the dominant tier. It selects the Phase 3 theming path (A or B).

## 1g: Build the Decomposition Table

Before writing any code, produce **two tables** for **each artboard**.

### Table A — Ignite UI Components

| Figma Layer Name | Tier | Kit / Source | Canonical Role + Props | Ignite UI Component | Confidence | Token Work | Suspected Anatomy Deltas | Data Type |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| _e.g._ `_NavBar` | A | Indigo.Design (Material) | `app-bar` | `IgxNavbarComponent` | high | — | — | n/a |
| _e.g._ `_Grid/Default` | A | Indigo.Design (Material) | `data-table` | `IgxGridComponent` | high | — | — | Tabular records |
| _e.g._ `Button` (`Variant=outline, Size=sm`) | B | shadcn/ui | `button` · medium · 32px | `igxButton="outlined"` | high | radius, casing, size | — | n/a |
| _e.g._ `Text field` (`Style=Filled`) | B | M3 Design Kit | `text-field` · filled · label-floating · 56px | `igx-input-group type="box"` | high | height, fill color | — | n/a |
| _e.g._ `Segmented button` | B | M3 Design Kit | `toggle-group` · 40px | `IgxButtonGroupComponent` | high | radius, colors | check icon on the selected segment | n/a |
| _e.g._ `Frame 427` | C | — | `tag` · pill · 24px | `IgxBadgeComponent` | low | radius, colors | — (confirm the role) | n/a |

- **Token Work** lists what Phase 3 must set: colors, radius, borders, casing, size. These are implementation work. They are **never** anatomy deltas and never become Accepted.
- **Suspected Anatomy Deltas** lists only structural differences that tokens, documented parts, and projected content cannot close. They are suspicions at this point: you only know what Ignite UI renders after reading its doc in Phase 2b. Confirm them in the Phase 2d ledger.

Fallback to plain semantic HTML only when no Ignite UI component can match the layer after consulting `references/figma-component-map.md`. Document the reason inline.

### Table B — Layout Surfaces

Record every **non-IgxXxx container** that carries visual properties (background color, border, padding, shadow). These are plain `<div>` wrappers in Angular — not Ignite UI components — but they are critical to visual fidelity. Populate this table from the `bg-[...]`, `rounded-[...]`, `border`, `p-[...]`, and `shadow-[...]` Tailwind classes observed on container divs in the Phase 1d design context output.

| Figma Frame / Container Name | Background | Border-Radius | Padding | Border | Shadow | Encloses (child sections) |
| ---------------------------- | ---------- | ------------- | ------- | ------ | ------ | ------------------------- |
| _e.g._ `Budget Categories`  | `#222222`  | `4px`         | `24px`  | none   | none   | Categories list, Add button |
| _e.g._ `Friend Card`        | `#222222`  | `8px`         | `24px 16px` | `1px solid #333` | none | Avatar, name, phone, email, buttons |

> **Rule:** if a section appears on a surface in Figma (i.e. its container has a non-transparent background), it **must** have that background in the Angular implementation. If a section floats on the page background (transparent), do **not** add a surface wrapper. Never infer surface structure from another page — always derive it from the design context for the specific artboard being implemented.

Present both tables to the user for review before proceeding. List **low-confidence** mappings first and ask the user to confirm or correct them. A wrong role is the most expensive mistake to fix after Phase 4.

## 1h: Extract Image Assets

Read [references/asset-extraction.md](asset-extraction.md) in full before running any extraction.

**Zero-placeholder policy:** every image visible in the Figma design must be extracted and committed to `src/assets/` before Phase 4. Gradient placeholders are not acceptable.

**Step 0 — File key and token.** Reuse the file key from Phase 1 (the remote server always has one). On the desktop server without one, ask the user for the file URL (Figma desktop: right-click the file tab → **Copy link**). Tier 1 also needs a REST API token (`mcp-setup.md § Personal access token`). Without both you fall back to Tier 2 or 3.

From the decomposition tables, identify every layer that is a **static image asset** (photo, background, logo, custom icon, illustration) rather than an Ignite UI component. Do **not** extract component instances that Table A maps to a component, whatever kit they come from, or icons available from a registerable icon package (`figma-component-map.md § Icons from other kits`).

**Use the four-tier decision tree from `asset-extraction.md`** (these asset tiers 1–4 are unrelated to the provenance Tiers A–C):

| Tier | Method | When to use |
| ---- | ------ | ----------- |
| **1** | REST API `/v1/files/:key/images` (Method A) or `/v1/images/:key` (Method B) | `FILE_KEY` **and** `FIGMA_TOKEN` available — always the highest fidelity |
| **2** | Download the asset URLs from `figma_get_design_context` (localhost on desktop, https on remote), or `figma_download_assets` on remote | No REST access; the design context returned asset URLs |
| **3** | `figma_get_screenshot` per node (`nodeId`, or the selection on desktop) | No REST access and no asset URL for this node |
| **4** | CSS gradient/color placeholder with `// TODO` comment | Only for confirmed pure-color fills — never as a shortcut |

After extraction, save assets to:
- `src/assets/images/` — raster images (PNG, JPG)
- `src/assets/icons/` — SVG icons and logos

Build a concise asset manifest (see `asset-extraction.md § Build an Asset Manifest`) so the implementation phase uses consistent paths.

If you used Tier 2 or Tier 3 for any asset, tell the user which ones need re-export once the file key and a REST API token are available.
