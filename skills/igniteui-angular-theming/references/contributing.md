# Contributing to Component Themes and SCSS

This reference covers how to contribute to the **in-repo Sass theming source** of Ignite UI for Angular.

> **Scope boundary**: This guide covers the files inside
> `projects/igniteui-angular/core/src/core/styles/`. Schema files (the
> `$light-avatar`, `$dark-avatar`, etc. Sass maps) live in the separate
> `igniteui-theming` npm package and are **not modified here**. If a new
> design token needs to be added to a schema, that work happens in the
> `igniteui-theming` repository and is consumed here as a package update.

---

## Architecture at a Glance

```
projects/igniteui-angular/core/src/core/styles/
  base/                         ← shared functions, mixins, component registry
  components/                   ← per-component theme + structural SCSS (55 dirs)
    _index.scss                 ← @forward barrel for all *-theme files
    <component>/
      _<name>-theme.scss        ← theme mixin: emits CSS custom props + placeholders
      _<name>-component.scss    ← structural mixin: BEM selectors + @extend placeholders
  themes/
    _core.scss                  ← core() mixin: @use + @include every *-component mixin
    generators/
      _base.scss                ← theme() mixin: calls every *-theme() function (defines the material theme)
      _bootstrap.scss           ← bootstrap-light-theme() / bootstrap-dark-theme()
      _fluent.scss              ← fluent-light-theme() / fluent-dark-theme()
      _indigo.scss              ← indigo-light-theme() / indigo-dark-theme()
    presets/                    ← compilable entry-point SCSS files (one per variant)
  spec/                         ← sass-true unit tests
```

The `base/_index.scss` re-exports everything from `igniteui-theming/sass/` that
component files need (`tokens`, `var-get`, `sizable`, `rem`, BEM mixins, etc.),
so every component file only needs one import:

```scss
@use '../../base' as *;
```

---

## The Two-File Pattern

Every component has exactly two SCSS files. **Never merge them.**

| File                     | Mixin name              | Responsibility                                                                                                     |
| ------------------------ | ----------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `_<name>-theme.scss`     | `@mixin <name>($theme)` | Calls `tokens($theme, $mode: 'scoped')`, reads `$variant`, defines `%placeholder` selectors with all visual styles |
| `_<name>-component.scss` | `@mixin component`      | Defines BEM selectors using `b/e/m` mixins, registers the component, extends placeholders                          |

### Why two files?

The theme mixin is called once per palette/schema combination inside `theme()` in
`generators/_base.scss`. The component structural mixin is called once globally
inside `core()` in `themes/_core.scss`. Keeping them separate ensures structural
CSS is emitted only once regardless of how many theme overrides a consumer applies.

---

## Theme File Anatomy (`_<name>-theme.scss`)

```scss
@use 'sass:map';
@use '../../base' as *;
// Import animation easings only if the component uses transitions
@use 'igniteui-theming/sass/animations/easings' as *;

/// @deprecated Use the `tokens` mixin instead.
/// @see {mixin} tokens
/// @param {Map} $theme - The theme used to style the component.
@mixin <name>($theme) {
  // 1. Emit all theme tokens as CSS custom properties on the host element
  @include tokens($theme, $mode: 'scoped');

  // 2. Read variant and theme-variant for conditional styling
  $variant: map.get($theme, '_meta', 'theme'); // 'material' | 'fluent' | 'bootstrap' | 'indigo'
  $theme-variant: map.get($theme, '_meta', 'variant'); // 'light' | 'dark'

  // 3. Define placeholder selectors — one per logical visual state or element
  %<name>-display {
    @include sizable();
    --component-size: var(--ig-size, #{var-get($theme, 'default-size')});

    // All colors come from var-get, never from hard-coded hex values
    color: var-get($theme, 'color');
    background: var-get($theme, 'background');
  }

  // 4. Variant-specific overrides — only when behavior genuinely differs
  @if $variant == 'indigo' {
    %<name>-display {
      // indigo-specific styles
    }
  }
}
```

**Key rules for theme files:**

- Call `@include tokens($theme, $mode: 'scoped')` first — always, without exception. This emits
  all design tokens as `--ig-<name>-*` CSS custom properties.
- Use `var-get($theme, 'token-name')` for every color, size, and spacing value.
  Never write hard-coded hex, RGB, HSL, or pixel values for anything that has a
  corresponding design token.
- Name placeholders `%<block>` for the root, `%<block>__<element>` for
  elements, and `%<block>--<modifier>` for modifiers.
- Use `@if $variant == '<name>'` only when the design genuinely differs across
  design systems. Prefer token differences (handled by the schema) over
  branching in the theme mixin.
- Read both `$variant` (design system name) and `$theme-variant` (light/dark)
  — use the one appropriate to your condition.

---

## Component File Anatomy (`_<name>-component.scss`)

```scss
@use '../../base' as *;
@use 'sass:string';

/// @access private
@mixin component {
  @include b(igx-<name>) {
    // Register this component in the global component registry.
    // Use bem--selector-to-string(&) to extract the block name.
    $this: bem--selector-to-string(&);
    @include register-component(
      $name: string.slice($this, 2, -1),
      $deps: (
        igx-icon,
        // list every component this one visually depends on
      )
    );

    // Extend the root placeholder from the theme file
    @extend %<name>-display !optional;

    // Elements
    @include e(suffix) {
      @extend %<name>__suffix !optional;
    }

    // Modifiers (boolean)
    @include m(disabled) {
      @extend %<name>--disabled !optional;
    }

    // Element with modifier (combined)
    @include e(label, $m: 'focused') {
      @extend %<name>__label--focused !optional;
    }
  }
}
```

**Key rules for component files:**

- Always call `register-component` inside the root `b()` block with the
  component's BEM block name as `$name`. The `$deps` list must include every
  other Ignite UI component whose theme this component visually relies on (e.g.,
  if the component renders `igx-icon` internally, list `igx-icon`).
- Use `!optional` on every `@extend`. Theme mixin placeholders are only defined
  when a theme is applied; without `!optional`, Sass errors in partial builds.
- Never put visual styles (colors, fonts, sizes, box shadows) in the component
  file. Structural layout (`display`, `position`, `width`, `flex`) that is truly
  independent of the theme belongs here; everything else belongs in the theme file.
- Do not import `igniteui-theming` modules directly — all BEM mixins and
  utilities come through `../../base`.

---

## BEM Naming Convention

CSS classes follow BEM Two Dashes style. See
[`css-naming-convention.md`](../../../../css-naming-convention.md) for the full
spec. Quick reference:

| BEM entity         | Pattern                             | Example                    |
| ------------------ | ----------------------------------- | -------------------------- |
| Block              | `igx-<name>`                        | `igx-avatar`               |
| Element            | `igx-<name>__<element>`             | `igx-avatar__image`        |
| Modifier           | `igx-<name>--<modifier>`            | `igx-avatar--circle`       |
| Element + modifier | `igx-<name>__<element>--<modifier>` | `igx-avatar__item--selected` |

BEM mixin usage in component files:

```scss
@include b(igx-avatar) { ... }           // → .igx-avatar
@include e(image) { ... }                // → .igx-avatar__image
@include m(circle) { ... }               // → .igx-avatar--circle
@include e(item, $m: 'selected') { ... } // → .igx-avatar__item--selected
```

Placeholder names must resemble the BEM selectors they represent(if present):

```
%avatar-display         ← root display placeholder (named -display, not bare block)
%avatar__image          ← element placeholder
%avatar--circle         ← modifier placeholder
%avatar__item--selected ← element+modifier placeholder
```

---

## Registration: Where New Components Must Be Wired

Adding a new component requires changes in **three** files beyond the two new SCSS files themselves:

### 1. `components/_index.scss` — expose the theme mixin

```scss
// Add alphabetically:
@forward '<name>/<name>-theme';
```

### 2. `themes/_core.scss` — emit structural CSS

```scss
// At the top, @use the component file:
@use '../components/<name>/<name>-component' as <name>;

// Inside the core() mixin body, call it:
@include <name>.component();
```

### 3. `themes/generators/_base.scss` — wire the theme into the global theme

Inside the `theme-internal` mixin body, follow the existing pattern:

```scss
@if is-used('igx-<name>', $exclude) {
  $<name>-theme-map: <name>-theme(
    $schema: $schema,
  );
  $<name>-theme-map: meta.call($theme-handler, $<name>-theme-map);
  @include <name>($<name>-theme-map);
}
```

Also add the same block to each of the variant-specific generator files
(`_bootstrap.scss`, `_fluent.scss`, `_indigo.scss`) if the component has
variant-specific theme overrides.

> **Order matters**: Add the new `@if is-used(...)` block in the same relative
> position as the corresponding `@include <name>.component()` call in `_core.scss`.
> The two files should stay in the same component order for maintainability.

---

## Adding a New Visual State to an Existing Component

When a feature adds a new modifier, element, or interaction state:

**1. In `_<name>-theme.scss`** — add a new placeholder:

```scss
%<name>--<new-modifier> {
  background: var-get($theme, '<new-token>');
  color: var-get($theme, '<new-token>-contrast');
}
```

If the new state requires a new design token, that token must be added to the
schema in the `igniteui-theming` package first, then consumed here via
`var-get($theme, '<new-token>')`. DO NOT introduce a hard-coded fallback value
for a token that should be schema-driven.

**2. In `_<name>-component.scss`** — add the corresponding BEM structure and
extend the new placeholder:

```scss
@include m(<new-modifier>) {
  @extend %<name>--<new-modifier> !optional;
}
```

---

## Variant Branching: When and How

Use `@if $variant == '...'` only when the structural or behavioral difference
cannot be expressed through design tokens alone.

```scss
// Read both axes if needed
$variant: map.get($theme, '_meta', 'theme'); // design system name
$theme-variant: map.get($theme, '_meta', 'variant'); // 'light' | 'dark'

// Pixel values that differ per design system — acceptable branching
$chip-padding: (
  comfortable: rem(if($variant != 'indigo', 12px, 7px)),
  cosy: rem(if($variant != 'indigo', 6px, 5px)),
  compact: rem(if($variant != 'indigo', 2px, 3px)),
);

// Property that is absent in some variants — acceptable
$box-shadow-focus: map.get(
  (
    'material': null,
    'fluent': null,
    'bootstrap': 0 0 0 rem(4px) var-get($theme, 'focus-outline-color'),
    'indigo': 0 0 0 rem(3px) var-get($theme, 'focus-outline-color'),
  ),
  $variant
);
```

Use a Sass map keyed by variant name when the value differs for all four systems.
Use `if($variant != 'indigo', ...)` for simple binary differences.

Never branch on `$theme-variant` to change structural layout — light/dark
differences must be expressed entirely through token values in the schema.

---

## `var-get` vs CSS `var()`

| Situation                                                | Use                                                              |
| -------------------------------------------------------- | ---------------------------------------------------------------- |
| Consuming a token from the current component's theme     | `var-get($theme, 'token-name')`                                  |
| Consuming a global layout token (not component-specific) | `var(--ig-size)`, `var(--ig-spacing)`, `var(--ig-radius-factor)` |
| Consuming a palette color directly in custom CSS         | `var(--ig-primary-500)`, `var(--ig-gray-200)`                    |

`var-get($theme, 'token-name')` resolves to `var(--ig-<component>-token-name)`
with appropriate fallback chaining. It must only be used inside a theme mixin
where `$theme` is in scope.

---

## Style Linting and Tests

### Linting

When touching only SCSS files, run the style linter first:

```bash
npm run lint:styles
```

Run the full linter before finishing to catch any TypeScript/template issues
introduced alongside the style changes:

```bash
npm run lint:lib
```

### Style Unit Tests

SCSS functions and mixins in `base/` have unit tests using
[sass-true](https://www.oddbird.net/true/). Tests live in:

```
projects/igniteui-angular/core/src/core/styles/spec/
  _index.scss           ← barrel: @use the spec files
  _functions.spec.scss  ← tests for functions (is-used, is-component, list-diff)
  _mixins.spec.scss     ← tests for mixins (register-component, gen-color-class)
  tests.mjs             ← Jasmine runner (do not modify)
```

Run style tests:

```bash
npm run test:styles
```

**When to add a style test:**

- You add a new Sass function to `base/_functions.scss`
- You add a new utility mixin to `base/_mixins.scss`
- You modify the component registry logic in `register-component` or `is-used`

You do **not** need to write style tests for new component theme or component
structural mixins — those are covered by visual/Karma tests on the Angular
component side.

**Test structure** (sass-true):

```scss
@use 'sass-true' as *;
@use '../base' as *;

@include describe('My Mixin') {
  @include it('should do X') {
    @include assert() {
      @include output() {
        @include my-mixin(args);
      }

      @include expect() {
        // expected CSS output
      }
    }
  }
}
```

---

## Presets: Compilable Theme Entry Points

The `themes/presets/` directory contains one SCSS file per design-system/variant
combination. Each file is compiled to a standalone CSS file by the build script.

If you add a new design system variant (rare, if ever), add a preset file following this
structure:

```scss
@use '../../themes' as *;
@include core();
@include typography($font-family: $<variant>-typeface, $type-scale: $<variant>-type-scale);
@include theme($schema: $<light|dark>-<variant>-schema, $palette: $<light|dark>-<variant>-palette);
```

Compile with:

```bash
npm run build:lib
```

The build script at `scripts/build-styles.mjs` compiles all presets and copies
the raw SCSS source tree to `dist/igniteui-angular/lib/core/styles/`.

---

## `igniteui-theming` Package: What Lives There

The following are **not** in this repository. They live in the `igniteui-theming`
package and are consumed as a versioned npm dependency:

| Area                      | What it provides                                                     |
| ------------------------- | -------------------------------------------------------------------- |
| `sass/bem/`               | `b()`, `e()`, `m()`, `mx()`, `bem--selector-to-string()` mixins      |
| `sass/color/`             | `palette()`, `color()` functions, palette presets                    |
| `sass/elevations/`        | `elevations()` mixin, elevation presets                              |
| `sass/themes/schemas/`    | `$light-avatar`, `$dark-avatar`, etc. — per-component token maps     |
| `sass/themes/components/` | `avatar-theme()`, `button-theme()`, etc. — component theme functions |
| `sass/utils/`             | `tokens()`, `var-get()`, `sizable()`, `rem()`, `pad()`               |
| `sass/typography/`        | `type-style()`, `typography()` mixin, type scale presets             |
| `sass/animations/`        | Easing variables (`$ease-in-out-quad`, etc.)                         |

When a component's visual change requires a **new design token** (new color,
new size dimension, new border radius), the token must be added to the
relevant schema in `igniteui-theming` first and released as a package update.
Only then can it be consumed here via `var-get($theme, 'new-token')`.

If a task calls for adding a new token without a corresponding `igniteui-theming` update available,
flag this dependency clearly rather than introducing a hard-coded value as a stopgap.

---

## Quick Checklist: New Component Theme

- [ ] `_<name>-theme.scss` created with `@mixin <name>($theme)`, calls `tokens($theme)`, defines all placeholders using `var-get`
- [ ] `_<name>-component.scss` created with `@mixin component`, calls `register-component` inside the root `b()` block, extends all placeholders with `!optional`
- [ ] `components/_index.scss` — `@forward '<name>/<name>-theme'` added
- [ ] `themes/_core.scss` — `@use` added at top, `@include <name>.component()` added in mixin body
- [ ] `themes/generators/_base.scss` — `@if is-used('igx-<name>', $exclude)` block added
- [ ] BEM class names follow the Two Dashes convention (`css-naming-convention.md`), covered by the appropriate `b()`, `e()`, and `m()` mixins
- [ ] No hardcoded hex/RGB/HSL values — all colors come from `var-get($theme, '...')`
- [ ] `npm run lint:styles` passes
- [ ] `npm run test:styles` passes (if base functions/mixins were modified)

## Quick Checklist: New Visual State on Existing Component

- [ ] New placeholder added to `_<name>-theme.scss` using `var-get` for all token references
- [ ] New `@include m(...)` or `@include e(...)` block added to `_<name>-component.scss` extending the new placeholder with `!optional`
- [ ] If a new design token is needed, flagged that `igniteui-theming` package must be updated first
- [ ] `npm run lint:styles` passes
