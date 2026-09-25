# Figma Variables → Ignite UI Angular Theming Bridge

> **Part of the [`igniteui-angular-figma-to-app`](../SKILL.md) skill.**
>
> Use this file in Phase 3 to translate Figma variable values (from `figma_get_variable_defs`) into Ignite UI Theming MCP inputs. Read this file in full before calling any theming tool.

---

## Two Paths

Which path you take depends on the provenance tiers recorded in Phase 1f ([design-provenance.md](design-provenance.md)):

| Path | When | What sets the look |
| --- | --- | --- |
| **A — Indigo.Design UI Kit** | Most components are Tier A | The kit variant **is** an Ignite UI design system. Palette and font come from the kit variables. Component proportions are already calibrated, so leave size, spacing, and roundness at their defaults. |
| **B — Any other kit, or no kit** | Most components are Tier B or C | The design system is only the **closest baseline**. Fidelity comes from palette seeds inferred from usage, type-style overrides, per-component radius tokens, and a measured `--ig-size`. See [Path B](#path-b--any-other-kit-or-no-kit). |

**Mixed files.** Count only the Table A rows that map to an Ignite UI component. Decorative Tier C frames that stay plain HTML do not count. The larger group chooses the path for the global theme; on a tie, ask the user. Then style the other group through component themes scoped to **those instances only**:

- Put a class on the minority instances (for example `class="kit-b"`), and pass it as `selector` to `theming_create_component_theme`. Do not scope by the component selector alone: a Tier A and a Tier B button both render `[igxButton]`, so that would restyle both.
- Tier B/C instances in a Path A app get the Path B token work (B2, B5–B8) in those scoped component themes.
- Tier A instances in a Path B app get their **kit's** design system: pass that kit's `designSystem` to their scoped component themes. Do not give them Path B treatment.

---

## Path A — How the Indigo.Design UI Kits Organize Variables

The **Indigo.Design UI Kits** are Figma component libraries published by Infragistics. Designers build their own app frames in Figma using these kits as shared libraries. The kits come in four design-system variants, each with light and dark themes:

| Kit variant            | Figma library name pattern                      | Ignite UI `designSystem` |
| ---------------------- | ----------------------------------------------- | ------------------------ |
| Material (most common) | `Indigo.Design UI Kit for Material`             | `"material"`             |
| Fluent                 | `Indigo.Design UI Kit for Fluent`               | `"fluent"`               |
| Bootstrap              | `Indigo.Design UI Kit for Bootstrap`            | `"bootstrap"`            |
| Indigo                 | `Indigo.Design UI Kit` / `Indigo.Design System` | `"indigo"`               |

**Identifying the active kit variant** is the first task in Phase 3 because it sets the `designSystem` parameter for `theming_create_theme`. Use these signals in **strict precedence order** — stop at the first clear match:

1. **Explicit user request** — "make it Material", "use Fluent", etc.
2. **Library source name** — `figma_get_design_context` and `figma_get_metadata` responses may reference the source library file name (e.g. `"Indigo.Design UI Kit for Material"`).
3. **Variable collection name** — `figma_get_variable_defs` may return collection names that include the design system (e.g. `Material/color/primary`).
4. **Elevation variable structure** — inspect the `Elevations/*` variables from `figma_get_variable_defs`:
   - **Three-layer DROP_SHADOW** (umbra + penumbra + ambient, `Elevations/Shadow 01-03`) → **Material**
   - **Single-layer DROP_SHADOW** → Indigo, Fluent, or Bootstrap
5. **Palette shade naming** — variables named `primary/500`, `primary/100`–`primary/900` follow the Material 100–900 convention → likely **Material**.
6. **Visual heuristics** (use only when all above are inconclusive) — see the [Design System Detection table](#design-system-detection-from-figma) below.

> **Never use font name as a primary signal.** "Titillium Web" is the default body font in the Indigo.Design UI Kit for Material — it is not exclusive to any single kit variant.

All four kit variants share the same variable naming conventions described below. The Ignite UI theming system uses Figma variable collections that mirror its own token structure:

```
Primitives collection  → raw palette values (e.g. blue/500 = #6200EE)
Semantic collection    → role-based aliases (e.g. color/primary = alias → blue/500)
Component collection   → per-component overrides (e.g. button/background = alias → color/primary)
```

The `figma_get_variable_defs` response returns a flat map of resolved variable names to values. Use the sections below to identify which variables map to which theming inputs.

---

## Path B — Any Other Kit (or No Kit)

A third-party kit was not built for Ignite UI. Its variable names do not follow Ignite UI conventions, and its component proportions, radii, and type ramp differ from every Ignite UI design system. Treat theming as **fitting a baseline**: choose the closest design system, then override what the design measurably does differently.

### B1 — Choose the Baseline Design System by Anatomy

Use the first rule that gives a clear answer:

1. **Explicit user request.**
2. **Kit with a direct counterpart:** Material 3 / Material kits → `material`; Fluent 2 → `fluent`; Bootstrap kits → `bootstrap`.
3. **Otherwise, score the anatomy.** These are properties of the Ignite UI themes that you cannot fully override with tokens, so they decide the baseline:

| Observable in the design | `material` | `fluent` | `bootstrap` | `indigo` |
| --- | --- | --- | --- | --- |
| Text-field label | **Floating inside the field** (notched outline) | Above the field | Above the field | Above the field |
| Default button height | 36px | 32px | 38px | 28px |
| Default input height | 48px | 40px | 38px | 28px |
| Button label casing in the type preset | UPPERCASE | Capitalize | none | UPPERCASE |

The label position is the strongest signal. A design with labels above its fields (shadcn, Untitled UI, Ant, Tailwind-style kits, most in-house kits) should **not** use `material`, however "Material-like" its colors look. Among the label-above systems, choose the one whose default heights are closest to the measured controls. When heights are close to 36–40px buttons and 36–44px inputs, `bootstrap` or `fluent` is usually the better starting point. Casing is overridable (B4), so it only breaks ties.

These numbers come from the `igniteui-theming` component schemas and type presets at the default `--ig-size`. If a result looks off, confirm it with `theming_get_component_design_tokens`.

### B2 — Infer Color Roles From Usage, Not Names

Third-party variable names do not tell you which Ignite UI palette slot they fill. Kits call the brand color `primary`, `brand/600`, `colorBrandBackground`, `md.sys.color.primary`, or nothing at all. Build a **color census** from the design context of the target artboards, and take each seed from where it is **used**:

| Ignite UI palette input | Take the color from |
| --- | --- |
| `primary` | The fill of high-emphasis buttons. If there are none, the active tab indicator, checked checkbox/switch, or focused-field accent. |
| `secondary` | A second accent actually used on components: tonal/secondary buttons, selected chips, FAB. If none exists, reuse `primary`. Do not invent one. |
| `surface` | The page / artboard background. Additional depths (cards, sidebars) → B6. |
| `gray` | Omit at first. Pass it only if the generated grays visibly diverge from the design's borders and secondary text. |
| `error` / `warn` / `success` / `info` | Destructive buttons, error-state fields, alert and status colors |

`theming_create_theme` takes only `primaryColor`, `secondaryColor`, and `surfaceColor`. To set `gray` or the status colors, also call `theming_create_palette` with all the seeds (plus `variant`), or `theming_create_custom_palette`, and place its output **after** the theme output. Its `:root` palette variables then override the ones the theme generated.

**Seed-shade rule.** Ignite UI components paint their main fills with the **500** shade of a palette color. Pass the color that is *visible on the component* as the seed, whatever the kit calls it. Examples: Untitled UI buttons use `Brand/600`, Tailwind-style kits use `blue-600`, and Material 3 uses the tone-40 `primary`. Passing the kit's own `…/500` variable when the buttons are painted with `…/600` makes every component one step too light.

**Material baseline trap.** In the Ignite UI `material` schema, **control accents use the `secondary` palette**: contained-button fill, flat-button text, checkbox fill, and switch thumb. The navbar and tab indicators use `primary`. `fluent`, `bootstrap`, and `indigo` use `primary` for those controls. Most third-party kits, Material 3 included, paint buttons and checkboxes with their primary color. On a `material` baseline, therefore, seed `secondary` with the brand color seen on the buttons as well. Seed `primary` with the color used on app bars and tab indicators, which is often the same color. Otherwise every button comes out in an unrelated accent. Check the resolved roles with `theming_read_resource({ uri: "theming://guidance/colors/roles" })`.

When the variables are available, resolve their alias chains and use them to *name* and *confirm* what the census found. When the variables and the census disagree, the census wins: it describes what the designer actually drew.

**Full ramps.** If the design visibly uses several shades of one color (hover, pressed, tinted backgrounds), use `theming_create_custom_palette` with `mode: "explicit"` for that color. The explicit mode needs **all 14 shades** (`50`–`900` plus `A100`, `A200`, `A400`, `A700`). Align the kit's stops by lightness, not by label (Tailwind and Untitled UI have `25` and `950` stops that Ignite UI does not). Derive the accent shades from the neighboring stops. Use `mode: "shades"` for every color whose ramp the design does not show.

**Dark variant.** Decide it from the page background, as in [Light vs Dark Mode Detection](#light-vs-dark-mode-detection). Material 3 tonal surfaces (`surface-container-low` … `-highest`) are multiple surface depths. Handle them with B6, not with a lighter `surface` seed.

### B3 — Typography

1. **Family:** take it from the text styles actually used (the design context `font-['…']` classes). Load it in the app. Kits often use Inter, Geist, Roboto Flex, or SF Pro. SF Pro is licensed for Apple platforms only, so substitute a web font and say so.
2. **Scale:** map the kit's ramp to Ignite UI type styles **by role and size ranking**, not by name. Override only the styles that differ (see [B4](#b4--button-casing-and-other-type-driven-anatomy) for how):

| Kit role (examples) | Ignite UI type style |
| --- | --- |
| Display / Hero / Heading XL | `h1`–`h3` (largest three) |
| Headline / Heading L–M / Title L | `h4`–`h6` |
| Title M–S / Subtitle / Label L (emphasized body) | `subtitle-1`, `subtitle-2` |
| Body L / Body M / Text md | `body-1`, `body-2` |
| Label M on buttons | `button` |
| Body S / Caption / Text xs | `caption` |
| Label S / Overline / Eyebrow | `overline` |

### B4 — Button Casing and Other Type-Driven Anatomy

The `material` and `indigo` type presets set `button` to `text-transform: uppercase`. `fluent` uses `capitalize`. Nearly every current third-party kit, Material 3 included, uses sentence case. Unless the design shows uppercase labels, set the button's text transform to `none`, together with its measured size and weight.

**How to override type styles.** The theme's `typography` output writes every property of every type style to a CSS variable on `:root`, named `--ig-<style>-<property>`, and the components read those variables. Add a `:root` block **after** the theme output that sets only the values that differ:

```scss
// After @include theme(...) / typography(...) in styles.scss
:root {
  --ig-button-text-transform: none;
  --ig-button-font-size: 0.875rem;
  --ig-button-font-weight: 500;
  --ig-h1-font-size: 2.25rem;
  --ig-body-1-line-height: 1.5rem;
}
```

Property names are `font-family`, `font-size`, `font-weight`, `font-style`, `line-height`, `letter-spacing`, `text-transform`, `margin-top`, and `margin-bottom`.

> **Do not rely on `customScale`.** `theming_create_typography` accepts a `customScale` argument, but `igniteui-theming` 29.0.0 drops it from the generated code without a warning. Use the variable overrides above, and measure the result in Phase 5.

### B5 — Radius: Per-Component Tokens, Not a Global Factor

`theming_set_roundness` sets a single `radiusFactor` (0–1) that interpolates each component between **its own** minimum and maximum radius, and those ranges differ. For example, the button range is 0–20px, the card 0–24px, the dialog 0–36px, and the chip 0–16px. One factor therefore cannot reproduce a kit's radius language, such as "everything is 8px" or "pill buttons, 12px cards".

Instead, set the radius tokens that `theming_get_component_design_tokens` returns for each component (`border-radius`, or variants such as `box-border-radius` / `border-border-radius` on `input-group`) to the **measured px value**, in the same `theming_create_component_theme` call as the component's colors. A pill shape is half the control height, or a large value such as `9999px`.

### B6 — Surfaces and Elevation

- **Depths:** kits built on borders instead of shadows (shadcn, Untitled UI, Fluent 2) use 2–4 surface tones. Express them with `theming_create_custom_palette` surface shades, or with semantic CSS variables (`--surface-1`, `--surface-2`) bound to palette shades.
- **Shadows:** `theming_create_elevations` only has the `material` and `indigo` presets. When the design is flat or border-first, keep the global elevations and set the components' shadow/elevation tokens to `none` or the measured `box-shadow` value. When the design uses shadows, pick the closer preset and verify the depth of cards, menus, and dialogs in Phase 5.
- **Borders:** a 1px neutral border on cards, inputs, and menus is part of the anatomy of most modern kits. Set it through the components' border tokens, bound to a gray or surface palette variable.

### B7 — Density

Choose `--ig-size` **per component family**. Compare the measured height of each family (buttons, inputs, list rows, …) with that family's size steps in the baseline. Each component has its **own default step**. For example, on `material` the button default is large (36px) while the input default is medium (48px). So a design with 36px buttons and 48px inputs already matches both defaults and needs no change. The steps (default in bold):

| Design system | Button small / medium / large | Input small / medium / large |
| --- | --- | --- |
| `material` | 24 / 30 / **36px** | 40 / **48** / 56px |
| `fluent` | 24 / **32** / 38px | 32 / **40** / 48px |
| `bootstrap` | 32 / **38** / 48px | 32 / **38** / 48px |
| `indigo` | 24 / **28** / 32px | 24 / **28** / 32px |

For other families, read the steps and the default from `theming_get_component_design_tokens`. For each family whose nearest step differs from its default, call `theming_set_size` with that `component`. Set `--ig-size` globally only when **every** family moves in the same direction. Close a remaining 2–4px mismatch with the component's padding or height tokens, if it has them. Otherwise leave it: Phase 5 rates a difference of 4px or less as Cosmetic. It is never an anatomy delta. The `theming_set_spacing` rule is unchanged: never convert a Figma pixel value into a multiplier.

### B8 — States and Focus

Hover, pressed, disabled, and error variants in the kit are **token inputs**. Map their colors onto the matching state tokens (`hover-background`, `focus-*`, `disabled-*`, …) in the same component theme. Focus rings differ strongly between kits (a 2–3px offset ring in shadcn and Untitled UI, a bottom accent in Fluent). If the design specifies one, it belongs in the component tokens. Keep focus visible whatever the design shows: accessibility is not optional.

---

## Global Palette Mapping

> Path A name patterns. For Path B, use these tables only to *label* a variable after the color census (B2) has decided the role.

### Primary Color

| Figma Variable Pattern | Theming Input                         | Notes                                   |
| ---------------------- | ------------------------------------- | --------------------------------------- |
| `color/primary`        | `primary` in `theming_create_palette` | Use the resolved hex value              |
| `primary/500`          | `primary`                             | The 500 shade is the seed color         |
| `Primary/Default`      | `primary`                             | Alternative naming in some kit versions |
| `palette/primary/500`  | `primary`                             | Prefixed naming pattern                 |

> **Parameter names:** `theming_create_palette` uses `primary`, `secondary`, `surface` (short names). `theming_create_theme` uses `primaryColor`, `secondaryColor`, `surfaceColor` (long names). Do **not** mix them up.

### Secondary / Accent Color

| Figma Variable Pattern | Theming Input                           | Notes                              |
| ---------------------- | --------------------------------------- | ---------------------------------- |
| `color/secondary`      | `secondary` in `theming_create_palette` | —                                  |
| `secondary/500`        | `secondary`                             | —                                  |
| `Secondary/Default`    | `secondary`                             | —                                  |
| `color/accent`         | `secondary`                             | Some kit variants call it "accent" |

### Surface / Background Color

| Figma Variable Pattern | Theming Input                         | Notes               |
| ---------------------- | ------------------------------------- | ------------------- |
| `color/surface`        | `surface` in `theming_create_palette` | The main background |
| `surface/default`      | `surface`                             | —                   |
| `Surface`              | `surface`                             | —                   |
| `color/background`     | `surface`                             | Alternative naming  |

### Gray / Neutral Palette

The Ignite UI theming system derives the gray scale automatically from the surface color. You do **not** need to pass gray values to `theming_create_palette` explicitly unless you need a custom gray family. If the Figma file has explicit gray variables, compare them against the auto-generated palette after calling `theming_create_palette` and only add a custom gray override if they differ significantly.

### Semantic Status Colors

| Figma Variable Pattern           | Theming Input                              | Notes    |
| -------------------------------- | ------------------------------------------ | -------- |
| `color/success` or `success/500` | `success` in `theming_create_palette` | Optional |
| `color/warning` or `warning/500` | `warn` in `theming_create_palette` | Optional — the parameter is `warn`, not `warning` |
| `color/error` or `error/500`     | `error` in `theming_create_palette`   | Optional |
| `color/info` or `info/500`       | `info` in `theming_create_palette`    | Optional |

---

## Typography Mapping

| Figma Variable Pattern           | Theming Input                                       | Notes                                 |
| -------------------------------- | --------------------------------------------------- | ------------------------------------- |
| `typography/font-family`         | `fontFamily` in `theming_create_typography`         | Primary font                          |
| `typography/body/font-family`    | `fontFamily`                                        | Body font family                      |
| `typography/heading/font-family` | `fontFamily`                                        | Use if heading font differs from body |
| `font/primary`                   | `fontFamily`                                        | Alternative naming                    |
| `font/display`                   | No separate parameter — set `--ig-h1-font-family` … `--ig-h6-font-family` (see B4) | Display/headline font |

> **fontFamily double-quote bug:** `theming_create_theme` may double-wrap the fontFamily string in its Sass output, producing invalid Sass such as `""'Titillium Web', sans-serif""`. If you see this pattern, strip the outer quotes before applying to `styles.scss`:
>
> ```scss
> // BAD (generated with bug)
> $font-family:
>   '' 'Titillium Web',
>   sans-serif '';
> // GOOD (manually corrected)
> $font-family: 'Titillium Web', sans-serif;
> ```

> **Comma-separated font families** must be wrapped in parentheses when used in Sass typography mixins:
>
> ```scss
> // BAD — parsed as multiple Sass arguments
> @include typography($font-family: 'Roboto', 'Arial', sans-serif);
> // GOOD
> @include typography(
>   $font-family: (
>     'Roboto',
>     'Arial',
>     sans-serif,
>   )
> );
> ```

---

## Spacing, Sizing, and Roundness — Do Not Map Directly

> **These Ignite UI theming tools are NOT equivalent to Figma spacing values.** Do not create a mapping between Figma pixel values and these tools.

`theming_set_spacing` and `theming_set_roundness` accept **multipliers**, not pixel values. Passing a Figma `spacing/md = 16` as `theming_set_spacing({ spacing: 16 })` would produce a 1600% increase over the default — a catastrophic result.

`theming_set_size` accepts a **density enum** (`small`, `medium`, `large`) — it controls how tightly packed components render, not a pixel measurement.

### When to touch these tools (sparingly)

| Tool                    | Use only when                                                                                                                                                                            | Never use because                                                      |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `theming_set_size`      | Path A: the Figma design clearly and consistently uses a noticeably tighter or looser component density than the design system default — e.g. a data-dense admin UI vs a spacious marketing page. Path B: per family, as described in B7 | A Figma spacing variable happens to match the name "compact"           |
| `theming_set_spacing`   | Explicitly requested by the user or required to match a very specific density contract; default (1.0) should be the starting point                                                       | A Figma `spacing/*` pixel value looks similar to the multiplier number |
| `theming_set_roundness` | The user explicitly asks for it. For Path B, use per-component radius tokens instead (B5)                                                                                               | A Figma `border-radius/md = 8` maps numerically to the multiplier      |

### The correct adjustment path

When a specific component needs tighter or looser density or spacing, scope `--ig-size` and `--ig-spacing` to that component’s selector — not raw CSS overrides, not `::ng-deep`. Both `theming_set_size` and `theming_set_spacing` accept a `component` parameter that generates exactly this scoped output:

```
// Scoped size for one component type
theming_set_size({ component: "calendar", size: "small", platform: "angular" })
// → igx-calendar { --ig-size: var(--ig-size-small); }

// Scoped spacing: 0.75 = 75% of default
theming_set_spacing({ component: "calendar", spacing: 0.75, platform: "angular" })
// → igx-calendar { --ig-spacing: 0.75; }
```

For compound components, scope to a sub-component selector via the `scope` parameter:

```
theming_set_size({ scope: "igx-grid-toolbar", size: "small", platform: "angular" })
```

Or set the CSS custom properties directly in SCSS:

```scss
igx-calendar {
  --ig-size: var(--ig-size-small);
  --ig-spacing: 0.75;
}
```

The Indigo.Design kit’s component proportions are already calibrated for each design system; start from the defaults and only adjust when there is a clear visual reason.

**Path B differs.** A third-party kit's proportions are *not* calibrated to Ignite UI, so the defaults are not a safe resting point. The prohibition still holds: never convert a px value into a multiplier. But do make the **categorical** choices from measurements: pick `--ig-size` from the nearest height step (B7), and set each component's radius token to the measured px value (B5). These are not multiplier conversions. They use each tool the way it was designed.


---

## Light vs Dark Mode Detection

Detect from the Figma artboard:

| Figma Signal                                             | Action                                                                 |
| -------------------------------------------------------- | ---------------------------------------------------------------------- |
| Dark artboard background (`#121212`, `#1a1a1a`, similar) | Use `variant: "dark"` in `theming_create_theme`                        |
| Light artboard background (`#fff`, `#f5f5f5`, similar)   | Use `variant: "light"` in `theming_create_theme`                       |
| Multiple artboards — one light, one dark                 | Ask the user which variant is primary. Generate it as the global theme and run Phase 5 against it. Then call `theming_create_theme` again for the other variant and apply it under a class (e.g. `.dark-theme`) or a `prefers-color-scheme` media query. Validate the second variant against its own artboard |
| `color/mode` variable present                            | Its value (`light` or `dark`) is the authoritative signal              |

---

## Design System Detection from Figma

> Path A (Indigo.Design kits) only. For any other kit, choose the baseline with the anatomy rubric in [B1](#b1--choose-the-baseline-design-system-by-anatomy).

| Figma Visual Signal                                                | Likely Design System       | `designSystem` Value    |
| ------------------------------------------------------------------ | -------------------------- | ----------------------- |
| Three-layer `DROP_SHADOW` on elevation variables (`Shadow 01-03`)  | Material Design            | `"material"`            |
| Prominent layered shadows, rounded cards, ripple effects           | Material Design            | `"material"`            |
| Flat surfaces, sharp corners, Segoe/Inter font                     | Microsoft Fluent           | `"fluent"`              |
| Component borders, Bootstrap-like grid                             | Bootstrap                  | `"bootstrap"`           |
| Heavy use of purple/indigo accents, rounded corners, single shadow | Infragistics Indigo        | `"indigo"`              |
| `primary/500`, `primary/900` palette shade naming                  | Material (100–900 palette) | `"material"`            |
| Explicit `$light-material-schema` or similar in Figma descriptions | Match the schema name      | Use corresponding value |

---

## Per-Component Token Resolution

For each Ignite UI Angular component you use, follow this lookup order:

### Step 1: Discover component tokens

```
theming_get_component_design_tokens({ component: "<component-name>" })
```

Use the **theming tool's component names**, not Angular selectors: `input-group`, `navbar`, `grid`, `card`. Components with variants need the variant name — `contained-button`, `flat-button`, `outlined-button`, `fab-button` (and the same for icon buttons). Passing plain `button` returns an error that lists the valid variant names.

The result lists every available token with its name, type, and description.

### Step 2: Match Figma variables to token names

> **Path B:** third-party kits rarely have component variables in this form, and Tier C files usually have none. Take the component's colors, radius, borders, and state colors from the Phase 1d color census and measurements (B2, B5–B8). Use variables, when they exist, only to confirm them.

The **Indigo.Design UI Kits** use component-level variables that follow the pattern:

```
<component>/<role>/<state>
```

Examples:

- `button/background` → token `background` in the button component
- `button/foreground` or `button/text-color` → token `foreground-color`
- `chip/background/selected` → token `selected-chip-color`
- `grid/header-background` → token `header-background`
- `navbar/background` → token `background`

**Lookup process:**

1. Take the Figma variable name (e.g. `button/background`)
2. Strip the component prefix (`background`)
3. Match it against the token list from `theming_get_component_design_tokens`
4. If no exact match, find the token whose description mentions the same visual role

### Step 3: Common component token patterns

| Component | Figma Variable             | Likely Token Name       | Notes                   |
| --------- | -------------------------- | ----------------------- | ----------------------- |
| Button    | `button/background`        | `background`            | For `contained` variant |
| Button    | `button/foreground`        | `foreground-color`      | Text color              |
| Button    | `button/border`            | `border-color`          | For `outlined` variant  |
| Chip      | `chip/background`          | `background`            | Default state           |
| Chip      | `chip/selected-background` | `selected-chip-color`   | —                       |
| Grid      | `grid/header/background`   | `header-background`     | —                       |
| Grid      | `grid/row/background`      | `content-background`    | —                       |
| Grid      | `grid/row/hover`           | `row-hover-background`  | —                       |
| Navbar    | `navbar/background`        | `background`            | —                       |
| Input     | `input/background`         | `box-background`        | Box/filled variant      |
| Input     | `input/border`             | `border-color`          | Line/border variant     |
| Card      | `card/background`          | `background`            | —                       |
| Card      | `card/border`              | `border-color`          | —                       |
| List      | `list/item/background`     | `item-background`       | —                       |
| List      | `list/item/hover`          | `item-hover-background` | —                       |
| Dialog    | `dialog/background`        | `background`            | —                       |

### Step 4: Generate component theme

Pass **only tokens that differ from the global theme** to avoid over-specification:

```
theming_create_component_theme({
  component: "<component-name>",
  platform: "angular",
  designSystem: "<resolved in 3b>",   // required in practice: the tool defaults to "material"
  variant: "<light|dark>",            // the tool defaults to "light"
  licensed: <true if @infragistics>,
  selector: "<optional: scope to a class, e.g. .kit-b>",
  tokens: {
    "background": "<resolved color>",
    "foreground-color": "<resolved color>"
    // only include tokens whose value differs from the generated global palette
  }
})
```

Apply the result using the `@include tokens(<theme>)` call returned by the tool.

---

## Variable Resolution Priority

When multiple Figma variables could map to the same theming input, use this priority:

1. **Component-scoped variable** (e.g. `button/background`) → per-component token
2. **Semantic role variable** (e.g. `color/primary`) → global palette input
3. **Primitive variable** (e.g. `primary/500`) → global palette seed color
4. **Raw hex/rgb value** (no variable) → extract directly from the design context

---

## What to Skip

Do **not** call theming tools for:

- Chart, gauge, and map DV components → configure via component `[input]` bindings only
- Tile Manager → a web component with its own CSS custom properties. (Dock Manager does have a theme key, `dock-manager`, selector `igc-dockmanager`; it also exposes its own CSS custom properties.)
- Pure layout CSS (margins, grid columns, flex gaps) → write directly in SCSS
- Icon SVG fill colors → use `color` CSS property or the custom `--foreground` CSS property on the `igx-icon` host or its parent
