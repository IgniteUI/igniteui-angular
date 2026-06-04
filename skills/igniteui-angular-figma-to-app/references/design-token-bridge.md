# Figma Variables → Ignite UI Angular Theming Bridge

> **Part of the [`igniteui-angular-figma-to-app`](../SKILL.md) skill.**
>
> Use this file in Phase 3 to translate Figma variable values (from `figma_get_variable_defs`)
> into Ignite UI Theming MCP inputs. Read this file in full before calling any theming tool.

---

## How the Indigo.Design UI Kits Organize Variables

The **Indigo.Design UI Kits** are Figma component libraries published by Infragistics.
Designers build their own app frames in Figma using these kits as shared libraries.
The kits come in four design-system variants, each with light and dark themes:

| Kit variant            | Figma library name pattern                      | Ignite UI `designSystem` |
| ---------------------- | ----------------------------------------------- | ------------------------ |
| Material (most common) | `Indigo.Design UI Kit for Material`             | `"material"`             |
| Fluent                 | `Indigo.Design UI Kit for Fluent`               | `"fluent"`               |
| Bootstrap              | `Indigo.Design UI Kit for Bootstrap`            | `"bootstrap"`            |
| Indigo                 | `Indigo.Design UI Kit` / `Indigo.Design System` | `"indigo"`               |

**Identifying the active kit variant** is the first task in Phase 3 because it sets
the `designSystem` parameter for `theming_create_theme`. Use these signals in order:

1. **Library source name** — `figma_get_design_context` and `figma_get_metadata` responses include references to the source library. Look for the library file name in the component instance data (e.g. `"Indigo.Design UI Kit for Material"`).
2. **Variable collection name** — `figma_get_variable_defs` may return collection names that include the design system (e.g. `Material/color/primary`).
3. **Visual heuristics** — see the [Design System Detection table](#design-system-detection-from-figma) below when no library name is available.

All four kit variants share the same variable naming conventions described below. The Ignite UI theming system uses Figma variable collections that mirror its own token structure:

```
Primitives collection  → raw palette values (e.g. blue/500 = #6200EE)
Semantic collection    → role-based aliases (e.g. color/primary = alias → blue/500)
Component collection   → per-component overrides (e.g. button/background = alias → color/primary)
```

The `figma_get_variable_defs` response returns a flat map of resolved variable names to values. Use the sections below to identify which variables map to which theming inputs.

---

## Global Palette Mapping

### Primary Color

| Figma Variable Pattern | Theming Input                              | Notes                                   |
| ---------------------- | ------------------------------------------ | --------------------------------------- |
| `color/primary`        | `primaryColor` in `theming_create_palette` | Use the resolved hex value              |
| `primary/500`          | `primaryColor`                             | The 500 shade is the seed color         |
| `Primary/Default`      | `primaryColor`                             | Alternative naming in some kit versions |
| `palette/primary/500`  | `primaryColor`                             | Prefixed naming pattern                 |

### Secondary / Accent Color

| Figma Variable Pattern | Theming Input                                | Notes                              |
| ---------------------- | -------------------------------------------- | ---------------------------------- |
| `color/secondary`      | `secondaryColor` in `theming_create_palette` | —                                  |
| `secondary/500`        | `secondaryColor`                             | —                                  |
| `Secondary/Default`    | `secondaryColor`                             | —                                  |
| `color/accent`         | `secondaryColor`                             | Some kit variants call it "accent" |

### Surface / Background Color

| Figma Variable Pattern | Theming Input                              | Notes               |
| ---------------------- | ------------------------------------------ | ------------------- |
| `color/surface`        | `surfaceColor` in `theming_create_palette` | The main background |
| `surface/default`      | `surfaceColor`                             | —                   |
| `Surface`              | `surfaceColor`                             | —                   |
| `color/background`     | `surfaceColor`                             | Alternative naming  |

### Gray / Neutral Palette

The Ignite UI theming system derives the gray scale automatically from the surface color.
You do **not** need to pass gray values to `theming_create_palette` explicitly unless you
need a custom gray family. If the Figma file has explicit gray variables, compare them
against the auto-generated palette after calling `theming_create_palette` and only add
a custom gray override if they differ significantly.

### Semantic Status Colors

| Figma Variable Pattern           | Theming Input                              | Notes    |
| -------------------------------- | ------------------------------------------ | -------- |
| `color/success` or `success/500` | `successColor` in `theming_create_palette` | Optional |
| `color/warning` or `warning/500` | `warningColor` in `theming_create_palette` | Optional |
| `color/error` or `error/500`     | `errorColor` in `theming_create_palette`   | Optional |
| `color/info` or `info/500`       | `infoColor` in `theming_create_palette`    | Optional |

---

## Typography Mapping

| Figma Variable Pattern           | Theming Input                                       | Notes                                 |
| -------------------------------- | --------------------------------------------------- | ------------------------------------- |
| `typography/font-family`         | `fontFamily` in `theming_create_typography`         | Primary font                          |
| `typography/body/font-family`    | `fontFamily`                                        | Body font family                      |
| `typography/heading/font-family` | `fontFamily`                                        | Use if heading font differs from body |
| `font/primary`                   | `fontFamily`                                        | Alternative naming                    |
| `font/display`                   | Pass as `displayFontFamily` if the tool supports it | Display/headline font                 |

> **Comma-separated font families** must be wrapped in parentheses when used in Sass
> typography mixins:
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

> **These Ignite UI theming tools are NOT equivalent to Figma spacing values.**
> Do not create a mapping between Figma pixel values and these tools.

`theming_set_spacing` and `theming_set_roundness` accept **multipliers**, not pixel values. Passing a Figma `spacing/md = 16` as `theming_set_spacing({ spacing: 16 })` would produce a 1600% increase over the default — a catastrophic result.

`theming_set_size` accepts a **density enum** (`small`, `medium`, `large`) — it controls how tightly packed components render, not a pixel measurement.

### When to touch these tools (sparingly)

| Tool                    | Use only when                                                                                                                                                                            | Never use because                                                      |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `theming_set_size`      | The Figma design clearly and consistently uses a noticeably tighter or looser component density than the design system default — e.g. a data-dense admin UI vs a spacious marketing page | A Figma spacing variable happens to match the name "compact"           |
| `theming_set_spacing`   | Explicitly requested by the user or required to match a very specific density contract; default (1.0) should be the starting point                                                       | A Figma `spacing/*` pixel value looks similar to the multiplier number |
| `theming_set_roundness` | The entire app has a clearly distinct border-radius language from the design system default (e.g. fully squared off vs fully rounded)                                                    | A Figma `border-radius/md = 8` maps numerically to the multiplier      |

### The correct adjustment path

When a specific component needs tighter or looser density or spacing, scope `--ig-size`
and `--ig-spacing` to that component’s selector — not raw CSS overrides, not
`::ng-deep`. Both `theming_set_size` and `theming_set_spacing` accept a `component`
parameter that generates exactly this scoped output:

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

The Indigo.Design kit’s component proportions are already calibrated for each design
system; start from the defaults and only adjust when there is a clear visual reason.

---

## Light vs Dark Mode Detection

Detect from the Figma artboard:

| Figma Signal                                             | Action                                                                 |
| -------------------------------------------------------- | ---------------------------------------------------------------------- |
| Dark artboard background (`#121212`, `#1a1a1a`, similar) | Use `variant: "dark"` in `theming_create_theme`                        |
| Light artboard background (`#fff`, `#f5f5f5`, similar)   | Use `variant: "light"` in `theming_create_theme`                       |
| Multiple artboards — one light, one dark                 | Generate both theme variants with a `prefers-color-scheme` media query |
| `color/mode` variable present                            | Its value (`light` or `dark`) is the authoritative signal              |

---

## Design System Detection from Figma

| Figma Visual Signal                                                | Likely Design System  | `designSystem` Value    |
| ------------------------------------------------------------------ | --------------------- | ----------------------- |
| Prominent shadows, rounded cards, ripple effects                   | Material Design       | `"material"`            |
| Flat surfaces, sharp corners, Segoe/Inter font                     | Microsoft Fluent      | `"fluent"`              |
| Component borders, Bootstrap-like grid                             | Bootstrap             | `"bootstrap"`           |
| Heavy use of purple/indigo accents, rounded corners                | Infragistics Indigo   | `"indigo"`              |
| Explicit `$light-material-schema` or similar in Figma descriptions | Match the schema name | Use corresponding value |

---

## Per-Component Token Resolution

For each Ignite UI Angular component you use, follow this lookup order:

### Step 1: Discover component tokens

```
theming_get_component_design_tokens({ component: "<component-name>" })
```

The result lists every available token with its name, type, and description.

### Step 2: Match Figma variables to token names

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
  licensed: <true if @infragistics>,
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
- Tile Manager and Dock Manager → these are web components with their own CSS custom properties
- Pure layout CSS (margins, grid columns, flex gaps) → write directly in SCSS
- Icon SVG fill colors → use `color` CSS property or the custom `--foreground` CSS property on the `igx-icon` host or its parent
