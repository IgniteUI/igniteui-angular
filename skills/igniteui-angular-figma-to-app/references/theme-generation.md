# Theme Generation

> **Part of the [`igniteui-angular-figma-to-app`](../SKILL.md) skill.**
>
> Use this file in Phase 3 to generate the global theme and per-component tokens. Read in
> full, together with [`design-token-bridge.md`](design-token-bridge.md), before calling any theming tool.

**Goal:** produce Sass theming code that matches the Figma design's visual language
using the design tokens extracted in Phase 1e (Path A) or the color census and
measurements from Phase 1d (Path B).

## 3a: Inspect Existing Theme (Guard)

Check **both** places a theme can come from:

- `src/styles.scss` (or the project's global stylesheet): `@include theme(...)`,
  `@include palette(...)`, or a named theme mixin such as `light-theme`, `dark-theme`,
  `fluent-light-theme`, `bootstrap-dark-theme`, `indigo-light-theme`.
- The `styles` array in `angular.json`: a prebuilt theme CSS such as
  `node_modules/igniteui-angular/styles/igniteui-angular.css` or
  `…/igniteui-fluent-light.css`.

Then classify what you found:

| Found | Meaning | Action |
| --- | --- | --- |
| Nothing | No theme | Continue with 3b–3c |
| A prebuilt theme CSS in `angular.json` and no Sass theme | The CLI's **Default** scaffold theme | Treat it as no theme. Continue with 3b–3c, and **remove the prebuilt CSS entry** from `angular.json` when you add the generated Sass theme. Otherwise both themes load and override each other |
| The CLI's **Custom** scaffold block: `$primary: #09f`, `$secondary: #4db8ff`, `$surface: #fff` passed to `palette(...)` and `@include theme($app-palette)` | The CLI's placeholder theme, not a choice made for this app | Treat it as no theme. Replace the block with the generated theme in 3c |
| Any other theme | A theme the app's authors chose | Keep it for now. Finish the comparison below after 3b |

**Existing app theme — compare after 3b.** Reuse it, and skip to 3d, only when **all three**
match the design:

1. the light/dark **variant**;
2. the **design system**: the `$schema` argument, or the named mixin (`theme(...)` without
   `$schema` is `material`);
3. the **primary color**: the seed color on the high-emphasis controls, as seen in the
   design (Path A: the kit variables; Path B: the color census).

If any of them differs, **ask the user** before changing the global theme. It affects every
existing view in the app. If the user declines, generate the design's theme scoped to the
new view's host selector instead of `:root`.

Detect the Figma design's variant from Phase 1e: if a `color/mode` variable exists,
use its value. Otherwise, use the artboard background color: near-black (`#121212`,
`#1a1a1a`, `#000`) → `"dark"`; near-white (`#fff`, `#f5f5f5`) → `"light"`.

## 3b: Resolve Design System

You don't need to call `theming_detect_platform` to confirm the Angular package layout. We already did that in Phase 0.

**Choose the path from the dominant Phase 1f tier** (see
`design-token-bridge.md § Two Paths`):

- **Path B (mostly Tier B/C):** the design system is the **closest baseline**, not a match.
  Choose it with `design-token-bridge.md § B1`, in this order: the user's request, then
  the kit's direct counterpart (Material 3 → `material`, Fluent 2 → `fluent`, Bootstrap →
  `bootstrap`), then text-field label placement, then control heights. A design whose
  fields have labels *above* them should not get `material`. Then continue: apply B2–B4 in 3c and B5–B8 in 3d.
- **Path A (mostly Tier A):** use this **strict precedence order**. Stop at the first
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
> in the Indigo.Design UI Kit for Material — it is not exclusive to any single kit variant.

Supported values: `material` (default), `bootstrap`, `fluent`, `indigo`.

## 3c: Generate Global Theme

Extract the following using
[references/design-token-bridge.md](design-token-bridge.md):

```
Path A (Indigo.Design kits) — from Phase 1e variables:
primaryColor    ← from "color/primary/500" or "primary/500"
secondaryColor  ← from "color/secondary/500" or "secondary/500"
surfaceColor    ← from "color/surface" or "surface/default"
fontFamily      ← from "typography/font-family" or "typography/body/font-family"

Path B (any other kit, or none) — from the Phase 1d color census (§ B2):
primaryColor    ← color painted on high-emphasis buttons / active indicators
secondaryColor  ← a second accent actually used, else = primary
                  (material baseline: controls use secondary — seed it with the button color)
surfaceColor    ← page background
fontFamily      ← family of the text styles in use
type overrides  ← kit type ramp by role (§ B3), incl. button text transform (§ B4)
```

> **Parameter names differ between tools** — `theming_create_palette` uses `primary`,
> `secondary`, `surface`, `gray`, `success`, `warn`, `error`, `info`, and `variant`.
> `theming_create_theme` uses `primaryColor`, `secondaryColor`, `surfaceColor`, and has no
> `gray`. Do not mix them up.

> **fontFamily double-quote bug** — `theming_create_theme` may double-wrap the fontFamily
> string (e.g. `""'Titillium Web', sans-serif""`) in its Sass output, producing invalid Sass.
> If you see double-quoted strings in the generated output, strip the outer quotes before
> applying to `styles.scss`.

Generate the global theme in **one** call. `theming_create_theme` takes seed colors and
emits the palette, typography, elevations, and spacing together:

```
theming_create_theme({
  platform: "angular",
  designSystem: "<resolved design system>",
  primaryColor, secondaryColor, surfaceColor,
  variant: "<light|dark>",
  fontFamily,
  includeTypography: true,
  includeElevations: true,
  includeSpacing: true,
  licensed: <true if @infragistics package>
})
```

Call the individual generators only when you need one piece on its own:

- `theming_create_palette({ primary, secondary, surface, gray?, success?, warn?, error?, info?, variant, platform: "angular" })`,
  or `theming_create_custom_palette` for explicit shades (Path B full ramps).
  `create_custom_palette` emits its own `@include palette(...)`. Place it **after** the
  `create_theme` output, so its `:root` palette variables override the ones generated from
  the seed colors, and keep only one `@use "igniteui-angular/theming"` line. Check
  `--ig-primary-500` in Phase 5.
- `theming_create_typography({ fontFamily, designSystem, platform: "angular" })`. Do not
  pass `customScale`: the tool accepts it but its generators ignore it.
- `theming_create_elevations({ designSystem: "material" | "indigo" })`. The parameter is
  `designSystem`; there is no `preset` parameter.

**Path B type overrides.** After the theme output in `styles.scss`, add a `:root` block that
sets the `--ig-<style>-<property>` variables for the type styles that differ from the
baseline, including the button's text transform. See `design-token-bridge.md § B4`.

Apply the generated output to `src/styles.scss` as instructed in the tool's response.

## 3d: Per-Component Token Mapping

> **Scope:** applies only to core Ignite UI Angular components (grid, navbar, card,
> inputs, chips, list, etc.). Charts, maps, and gauges have no Sass tokens — configure
> those via component inputs only.

For **every** Ignite UI core component in your plan, run this loop:

1. `theming_get_component_design_tokens({ component: "<theme name>" })` — review all
   token names, types, and descriptions. Use the tool's component names (`input-group`,
   `navbar`, `grid`), and the variant name for buttons (`contained-button`,
   `flat-icon-button`, …). See `design-token-bridge.md § Per-Component Token Resolution`.
2. Find the values for this component's surfaces (background, text, border, hover state).
   **Path A:** from the Phase 1e kit variables. **Path B:** from the Phase 1d color census
   and measurements. Variables, when they exist, only confirm them.
3. `theming_create_component_theme({ component: "<theme name>", platform: "angular", designSystem: "<3b result>", variant: "<light|dark>", licensed: <true if @infragistics>, tokens: { <only differing tokens> } })`.
   Always pass `designSystem` and `variant`: the tool defaults to Material light and would
   compute the theme against the wrong schema.
4. Apply the generated `@include tokens(<theme>)` block to the component's SCSS or to a
   scoped block in `styles.scss`

**Path B additions to this loop** (see `design-token-bridge.md § B5–B8`): include the
component's **radius** tokens at the measured px value, its **border** and
**shadow/elevation** tokens as the design shows them, and its hover/focus/disabled **state**
tokens from the kit's state variants, in the same `theming_create_component_theme` call.
Choose `--ig-size` from the measured control heights (§ B7) before tuning individual
components.

When a specific component needs a different density or spacing from the global default,
use `theming_set_size` or `theming_set_spacing` with the `component` parameter — this
scopes `--ig-size` or `--ig-spacing` to that component’s selector rather than applying
globally. For compound components, use `scope` with a sub-component selector. Only
apply these globally (`:root`) when the entire app has a clearly distinct density (Path B:
when every component family moves the same way, see `design-token-bridge.md § B7`).
Leave `theming_set_roundness` at its default unless the user explicitly requests a
change. For Path B, express radius through per-component tokens instead, because one global
factor cannot reproduce a kit's radii. Never derive multiplier values from Figma pixel
values.
See `references/design-token-bridge.md § Spacing, Sizing, and Roundness`.
