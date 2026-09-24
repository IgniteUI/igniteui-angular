# Theme Generation

> **Part of the [`igniteui-angular-figma-to-app`](../SKILL.md) skill.**
>
> Use this file in Phase 3 to generate the global theme and per-component tokens. Read in
> full, together with [`design-token-bridge.md`](design-token-bridge.md), before calling any theming tool.

**Goal:** produce Sass theming code that matches the Figma design's visual language
using design tokens extracted in Phase 1e.

Read [references/design-token-bridge.md](design-token-bridge.md) in full
before running any theming tool.

## 3a: Inspect Existing Theme (Guard)

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

## 3b: Resolve Design System

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

## 3c: Generate Global Theme

Extract the following from Phase 1e variables using
[references/design-token-bridge.md](design-token-bridge.md):

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

## 3d: Per-Component Token Mapping

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
