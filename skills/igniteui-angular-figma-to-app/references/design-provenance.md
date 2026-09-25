# Design Provenance — Recognizing Components From Any UI Kit

> **Part of the [`igniteui-angular-figma-to-app`](../SKILL.md) skill.**
>
> Use this file in Phase 1f to decide **where every component in the design came from**
> and to normalize it into a **canonical role** that
> [figma-component-map.md](figma-component-map.md) resolves to an Ignite UI Angular selector. Read it
> in full before building the Phase 1g decomposition table.

---

## Why This Step Exists

Designers build Figma screens from many sources: the Infragistics **Indigo.Design UI
Kits**, public kits (Material 3 Design Kit, Fluent 2, Bootstrap, shadcn/ui, Untitled UI,
Ant Design, iOS/Apple kits), an in-house design system, or plain frames with no components
at all. The Ignite UI kits map to Ignite UI one-to-one by layer name. Other kits do not,
but they describe the same **roles** (a high-emphasis button, an outlined text field, a
tab strip), using different names and variant properties.

Translating any kit directly into Ignite UI tags would need one mapping table per kit.
Instead, this skill uses two steps: **kit → canonical role** (a small vocabulary,
normalized here) and **canonical role → Ignite UI** (one table, in
`figma-component-map.md`). A kit you have never seen still works if its variant names can
be normalized.

---

## Step 1 — Collect the Evidence for Each Instance

For every component-like layer in the target artboard, gather what the design data exposes.
Use the cheapest source first.

| Evidence | Where it comes from | Strength |
| --- | --- | --- |
| **Layer / main-component name** | `data-name` in `figma_get_design_context`; instance names in `figma_get_metadata` XML | Medium. Designers rename layers, and detached instances keep the old name. |
| **Variant properties** (`Variant=Primary`, `Size=md`, `State=Hover`) | The design-context code (component props), or the REST API (below) | Strong. This is the kit's own statement of role and variant. |
| **Component description** | REST `components` map, or design-context annotations | Strong when present. Kits often document intent here. |
| **Code Connect mapping** | `figma_get_code_connect_map` | Strong for **role**, but it may point at a *different* library. See the caveat below. |
| **Library / source file name** | `figma_get_libraries` (the libraries the file subscribes to: name, key, description) and `figma_search_design_system` (returns `libraryName` for a component name). Check the connected server's tool list, because availability varies by Figma MCP version. | Strong for kit identity. Call `get_libraries` **once per file**: it names the kits in play before you look at a single instance. |
| **Structure + visuals** | Auto-layout, children, fills, size, the screenshot | Weak alone. It is the only evidence for un-componentized frames. |

**Reading exact variant properties via the REST API** (use when names are ambiguous and
`FIGMA_TOKEN` + `FILE_KEY` are available. This is the REST API token from `mcp-setup.md § Personal access token`, not
an MCP credential):

```bash
curl -s -H "X-Figma-Token: $FIGMA_TOKEN" \
  "https://api.figma.com/v1/files/$FILE_KEY/nodes?ids=$ARTBOARD_ID" -o /tmp/figma_nodes.json

# Every instance with its variant properties
jq '[.. | objects | select(.type? == "INSTANCE")
     | {id, name, componentId, props: (.componentProperties // {} | with_entries(.value |= .value))}]' \
  /tmp/figma_nodes.json

# Main-component and component-set names/descriptions (remote == came from a library)
jq '.nodes[].components, .nodes[].componentSets' /tmp/figma_nodes.json
```

**Design-context quirks that matter here:**

- `data-name` preserves the main-component name, for example `.Status badge`. Components can
  also appear as local functions with typed props (`Button({ variant = "outline" })`), which
  carry the variant values.
- Nodes inside an instance have IDs like `I9:12;6:3`. Treat those as parts of the parent
  component, not as components of their own.
- If the response is flagged **sparse** (large frames), fetch the visible child nodes in one
  parallel batch instead of guessing from the partial output.
- When Code Connect maps components to a non-Ignite library, pass `disableCodeConnect: true`
  (where the server supports it) to keep the reference output free of foreign imports. Read
  the mapping separately with `figma_get_code_connect_map`.

`remote: true` on a component means it came from a published library. `componentSetId`
groups the variants of one component. Use the **component-set name** as the main-component
name, because instance layer names are often edited.

---

## Step 2 — Classify Provenance (Per Instance)

Classify **per instance**, not per file. Real files mix sources: an Ignite UI kit navbar
next to a hand-drawn KPI tile and a third-party date picker.

| Tier | What it is | Recognized by | Resolution path |
| --- | --- | --- | --- |
| **A — Ignite UI kit** | Instance of an Indigo.Design UI Kit component | Leading-underscore names (`_Button/Contained`, `_Input/Border`), `Indigo.Design` library names, hidden `size-[0.5px]` variant-indicator nodes, the kit variable collections | Direct lookup in `figma-component-map.md` by kit name. Highest confidence. |
| **B — Other component library** | Instance of any other published or local component (public kit or in-house) | A main component / component set with variant properties, without Tier A fingerprints | **Normalize** (Step 3) to a canonical role, then look it up in the canonical role index of `figma-component-map.md`. |
| **C — Un-componentized** | Plain frames, groups, or detached instances | No main component. Type is `FRAME` / `GROUP`, or a detached copy that still carries a component-like name | **Infer** the role from structure and visuals (Step 4). Lowest confidence. Confirm with the user. |

Record the tier and a confidence (**high / medium / low**) in the Phase 1g Table A.

### Recognizing common public kits (confirmation only)

These fingerprints help name the kit in the plan and choose the theme baseline (Phase 3b).
Normalization does **not** depend on them. Kit files change between versions, so treat
every row as a hint, not a rule.

| Kit | Typical fingerprints | Default icon set |
| --- | --- | --- |
| Material 3 Design Kit (Google) | Variables/styles under `M3/…` or `md.sys.…` / `md.ref.…`; tonal roles (`primary`, `on-primary`, `primary-container`, `surface-container-*`); button styles *Filled / Tonal / Outlined / Text / Elevated*; text fields *Filled / Outlined* | Material Symbols |
| Fluent 2 (Microsoft) | Token names like `colorBrandBackground`, `colorNeutralForeground1`, `borderRadiusMedium`; button appearance *Primary / Secondary / Outline / Subtle / Transparent* | Fluent System Icons |
| Bootstrap kits | Variant names `primary / secondary / success / danger / warning / info / light / dark`; `btn-outline-*`; `form-control` / `form-select` | Bootstrap Icons |
| shadcn/ui kits | Semantic variables `background`, `foreground`, `primary`, `primary-foreground`, `muted`, `accent`, `border`, `input`, `ring`, `radius`; button variants *default / secondary / outline / ghost / link / destructive* | Lucide |
| Untitled UI | `Colors/Brand/600`, `Colors/Gray (light mode)/…`, `bg-primary`, `text-secondary`; button hierarchy *Primary / Secondary / Tertiary / Link* (+ *color / gray*) | Untitled UI Icons (paid Pro tier; check the license) |
| Ant Design kits | Button type *Primary / Default / Dashed / Text / Link*; `colorPrimary`, `colorBgContainer` tokens | Ant Design Icons |
| iOS / Apple kits | SF Pro type, *Filled / Tinted / Gray / Plain* buttons, grouped inset lists, tab bars at the bottom | SF Symbols (not licensed for web; substitute) |

---

## Step 3 — Normalize Tier B Instances Into Canonical Roles

Normalize **role**, **emphasis**, **style**, **size**, and **state** separately. Match
property values case-insensitively and by meaning, not exact spelling.

### Role (from the component or component-set name)

Strip prefixes, sigils, status emoji, numbering, and platform tags (`.Button`,
`Button / Base`, `❖ Button`, `✅ Button`, `[Web] Button`, `Buttons`). A leading `.` usually
marks a private or base component. A leading `_` with a `/` path (`_Button/Contained`) is
the Tier A Indigo.Design fingerprint. Classify it before stripping anything. Ignore the order of variant axes:
`Button (M, Accent)` is the same as `Button (Accent, M)`. Then match against the canonical roles in
`figma-component-map.md § Canonical Role Index`. Common synonyms:

| Canonical role | Also called |
| --- | --- |
| `button` | Btn, CTA, Action |
| `icon-button` | Button with `Icon only=true`, Icon Btn, Square button |
| `fab` | Floating action button, Extended FAB |
| `toggle-group` | Segmented button, Segmented control, Button group (selectable), Radio buttons (button style) |
| `text-field` | Input, Text input, Field, Form control, Textbox |
| `textarea` | Text area, Multiline input |
| `select` | Dropdown (as a form field), Picker, Listbox trigger |
| `combobox` | Autocomplete, Searchable select, Typeahead, Multi-select, Tag input |
| `menu` | Dropdown menu, Context menu, Overflow menu, Action sheet (desktop) |
| `app-bar` | Navbar, Top bar, Header, Toolbar (page-level) |
| `side-nav` | Sidebar, Drawer, Navigation rail, Rail |
| `tabs` | Tab bar, Tab list, Segmented tabs |
| `breadcrumbs` | Breadcrumb, Path |
| `dialog` | Modal, Alert dialog |
| `sheet` | Side sheet, Drawer (overlay), Bottom sheet |
| `toast` | Snackbar, Notification, Sonner |
| `inline-alert` | Alert, Banner, Callout, Message bar |
| `tag` | Badge (text pill), Label, Pill, Status |
| `count-badge` | Badge (dot or number on another element), Indicator |
| `chip` | Filter chip, Input chip, Assist chip, Removable tag |
| `data-table` | Table, Data grid, Grid |
| `list` | List, List group, Menu list (non-overlay) |
| `progress-linear` / `progress-circular` | Progress bar, Loader / Spinner (determinate or not) |

### Emphasis (buttons, icon buttons, links)

| Normalized | Kit values that mean it |
| --- | --- |
| **high** | Primary, Filled, Solid, Contained, Default (shadcn), Brand, Accent, Hierarchy=Primary |
| **medium** | Secondary, Tonal, Soft, Outline(d), Stroke, Bordered, Default (Ant/Fluent), Gray |
| **low** | Tertiary, Ghost, Subtle, Text, Plain, Transparent, Flat, Borderless |
| **link** | Link, Hyperlink, Link color / Link gray |
| **elevated** | Elevated, Raised |
| **danger** (modifier) | Destructive, Danger, Error, Critical |

"Secondary" means *outlined* in some kits and *a filled button in the secondary color* in
others. Read the visuals of that instance (fill vs stroke) before choosing.

### Style (form fields)

| Normalized | Kit values / visuals |
| --- | --- |
| **outlined** | Outlined, Bordered, Border, Default with a full 1px stroke |
| **filled** | Filled, Box, Solid, Flushed-with-background, Tonal |
| **underlined** | Line, Underline, Flushed, Standard |
| **label-floating** | Label inside the field that moves to the top edge |
| **label-above** | Label as separate text above the field |

### Size and state

- **Size:** record the measured control **height** in px (from the design context), not the
  kit's size name. Kits disagree on what `md` means. Phase 3d turns heights into
  `--ig-size`.
- **State:** `Hover`, `Focused`, `Pressed`, `Disabled`, `Error`, `Selected` variants are
  **states**, not different components. Implement the default state, and use state values
  only as token inputs (hover color, focus ring) in Phase 3d. A screen showing a
  `State=Error` field means the design wants validation styling. It does not mean the field
  is permanently invalid.

---

## Step 4 — Infer Tier C (Un-componentized) Layers

Use the exact values from the design context and the screenshot together:

| Structure observed | Likely role |
| --- | --- |
| Auto-layout row, 28–56px tall, one short text (± icon), solid fill or 1px stroke, radius | `button` (emphasis from fill vs stroke vs none) |
| Square 24–48px frame with only an icon | `icon-button` |
| 32–56px frame with a stroke or bottom border, placeholder-grey text, optional chevron/icon | `text-field` (chevron → `select`) |
| Repeated equal-height rows with leading icon/avatar + 1–2 text lines + trailing element | `list` |
| Header row of labels over repeated rows aligned in columns | `data-table` |
| Horizontal labels with one underlined or pill-highlighted item | `tabs` |
| Small rounded pill with short text | `tag` or `chip` (`chip` when it has a close or select affordance) |
| Circle 24–64px with an image or initials | `avatar` |

Rules for Tier C:

- **Confidence is low by default.** List Tier C mappings separately in the Phase 1g review
  so the user can correct them.
- **Purely decorative or bespoke layouts** (hero sections, marketing tiles, KPI cards) stay
  plain semantic HTML plus CSS. Do not force them into a component because a name
  suggests one.
- **Interactive controls stay components.** If a Tier C frame is clearly an input, select,
  date field, table, or tab strip, use the Ignite UI component even when its anatomy
  differs. The component brings keyboard, focus, ARIA, and form behavior that a custom
  frame lacks.

---

## Code Connect Caveat

`figma_get_code_connect_map` may return mappings to **another** library, for example a
shadcn kit connected to `@/components/ui/button`, or an in-house kit connected to the
company's React package. Use these mappings as **strong evidence of the role and props**
(a Code Connect snippet `<Button variant="outline" size="sm">` confirms *button / medium
emphasis / small*). **Never** copy their imports, tags, or props into the implementation.
The target is always Ignite UI.

---

## False Friends — Same Name, Different Ignite UI Component

| Name in the kit | Usually means | Ignite UI Angular choice |
| --- | --- | --- |
| **Badge** (shadcn, Untitled UI, Bootstrap) | A text pill / status label | `igx-badge` with `[value]` for short status; `igx-chip` when removable or selectable |
| **Badge** (Material, Fluent) | Dot or count on another element | `igx-badge` positioned over the host |
| **Dropdown** | A form field in some kits, a menu in others | `igx-select` (field) vs `igx-drop-down` + `igxToggleAction` (menu) |
| **Select** with search (shadcn Combobox, Ant Select `showSearch`) | Filterable single select | `igx-simple-combo` |
| **Autocomplete** / free-text typeahead | Suggestions under a text input | `igxAutocomplete` on an `igx-input-group` input + `igx-drop-down` |
| **Tabs** styled as a pill track (shadcn, Fluent "segmented") | Either view switching or a value toggle | `igx-tabs` if it switches panels; `igx-buttongroup` if it sets a value |
| **Sheet** / **Drawer** (overlay) | Temporary side panel | `igx-nav-drawer` for navigation. There is no dedicated sheet component: for content panels use `igx-dialog` or custom markup, and record it as an anatomy delta |
| **Alert** | Inline message (not modal) | `igx-banner`, or semantic HTML for static callouts |
| **Toast** vs **Snackbar** | Transient message | `igx-toast` (text only) or `igx-snackbar` (with action) |
| **Card** with complex internal layout | A surface container | `igx-card` only if header/content/actions anatomy fits; otherwise a Table B surface |
| **Navigation rail** | Icon-only side nav | Pinned `igx-nav-drawer` with an `igxDrawerMini` template, kept **closed**. The mini template renders only while the drawer is closed |
| **Tab bar** at the bottom (iOS, M3 navigation bar) | App-level navigation | `igx-bottom-nav` |
| **Breadcrumb** | Navigation trail | No Angular breadcrumb component. Use semantic `<nav><ol>` markup with router links |

---

## Output of This Step

Fill the **Tier**, **Kit / Source**, **Canonical Role + Props**, **Confidence**, **Token
Work**, and **Suspected Anatomy Deltas** columns of the Phase 1g **Table A**. The table and
its column rules are defined once, in `figma-exploration.md § 1g`.

Only the **Suspected Anatomy Deltas** column feeds the Phase 2d delta ledger. Token Work is
never a delta.
