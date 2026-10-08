# Contributing to Component Styles

This guide is for anyone writing or changing component styles in Ignite UI for Angular, people and AI agents alike. It covers where styles live, how they reach the page, and the conventions we write them in.

> **Scope.** This guide covers the Sass source in this repository. Design-token schemas (`$light-avatar`, `$dark-grid`, …), palettes and the core theming functions live in the [`igniteui-theming`](https://github.com/IgniteUI/igniteui-theming) package. A change that needs a new design token starts there.

---

## How styles reach the page

A component's styling comes from two places:

- **Tokens.** The global `theme()` mixin emits each component's design tokens as CSS custom properties, scoped to the component's root class, for the active design system (Material, Bootstrap, Fluent, Indigo) and variant (light, dark). Apps compile this once, as part of their theme.
- **Structure.** Each component ships its own stylesheet with layout, states and the rules that consume those tokens. It lives next to the component and is compiled with it.

```text
projects/igniteui-angular/
  <component>/src/<component>/
    <name>.component.scss        ← entry point: @use the theme files below
    <name>.component.css         ← build output (gitignored)
    themes/
      _base.scss                 ← structural rules, shared by every design system
      shared/_<ds>.scss          ← per-design-system differences (+ _index.scss)
      dark/_<ds>.scss            ← dark-variant differences, when needed
      _derived.scss              ← tokens this component sets on its sub-components, when needed
  core/src/core/styles/
    themes/
      _scoping.scss              ← layer(), themed(), block(), component-tokens()
      _core.scss                 ← core(): global base rules + legacy components
      generators/_base.scss      ← theme(): palette, elevations, component tokens
      presets/                   ← compiled theme entry points (one per design system/variant)
    components/                  ← legacy two-file components (see "Legacy components")
    spec/                        ← sass-true tests
```

### Building

| What | Command | Output |
|---|---|---|
| Component stylesheets (`**/*.component.scss`) | `npm run build:styles:components` | `*.component.css` next to the source, loaded through `styleUrl` |
| Shared base sheets (`**/*.styles.scss`, e.g. the grid) | same command | a generated `*.styles.ts` exporting the CSS, registered at runtime with `IgxStylesRegistrar` |
| Theme presets | `npm run build:styles` | `dist/igniteui-angular/styles/*.css` |

The `.component.css` and `.styles.ts` files are gitignored. Editing `.scss` has no effect until you rebuild; `npm start` watches and rebuilds for you.

Components use `ViewEncapsulation.None`, so component CSS is global. That is why the scoping rules below matter.

### Cascade layers

All library CSS lives in cascade layers, in this order:

```css
@layer ig.reset, ig.compositions, ig.base, ig.<theme>, ig.derived, ig.utilities;
```

| Layer | Holds |
|---|---|
| `ig.reset` | Global resets |
| `ig.compositions` | Shared layout helpers |
| `ig.base` | Every component's structural rules |
| `ig.material`, `ig.bootstrap`, `ig.fluent`, `ig.indigo` | Design-system tokens and differences |
| `ig.derived` | Tokens a component sets on its sub-components (e.g. the grid on its chips and inputs) |
| `ig.utilities` | Shared single-purpose helpers |

Customer CSS is unlayered, so it always wins over library CSS without needing specificity tricks. Keep it that way: never emit library CSS outside a layer.

### Runtime design-system switching

The theme sets `--ig-theme` (`material | bootstrap | fluent | indigo`) and `--ig-theme-variant` (`light | dark`). Design-system rules are gated with container style queries on those properties, through the `themed()` mixin. An app can therefore switch design systems at runtime, or use different ones in different parts of the page, without recompiling.

---

## The authoring model

We follow a component-library adaptation of [CUBE CSS](https://cube.fyi). Every rule you write belongs to one of these concerns:

| Concern | What it is | How it's written |
|---|---|---|
| **Tokens** | Every visual value: color, size, radius, font, shadow. Design systems differ in token values, not in rules. | Custom properties, from the schema (`var-get()`) or private to the component (`--_name`) |
| **Block** | A component: its root and its internal parts | `@include block(name) { … }`, with `:scope` for the root and `[data-part~='…']` for parts |
| **Exception** | A state or variant of a block | Native pseudo-classes, ARIA the component already sets, or `data-*` attributes, nested in the block |

### Rules

1. **Values in tokens, structure in base.** `themes/_base.scss` holds the rules. Theme files (`shared/`, `dark/`) set values. A theme file may hold a rule only for a genuine structural difference between design systems, never to repeat a rule with a different value.
2. **Each theme file is one `block()`.** Don't write scoping or layer wrappers by hand.
3. **Selectors are plain CSS.** Inside a block, use `:scope`, `[data-part~='…']`, `[data-…='…']`, pseudo-classes and `:has()`. Don't use selector-generating mixins (`b()`, `e()`, `m()`, `mx()`) in new or converted code.
4. **Use the state the platform already has.** Use `:disabled`, `:checked`, `:focus-visible`, `:placeholder-shown`, `:empty`, `:focus-within`, or an ARIA attribute the component already sets. Only add a `data-*` attribute when none of these exists.
5. **Prefer enumerated attributes to booleans.** Write `data-variant="flat | outlined | contained | fab"`, not one class or attribute per variant that could contradict another.
6. **A component styles only itself.** It may set a nested component's host layout (size, margin, alignment) and public tokens, nothing inside it. `block()` enforces this.
7. **No `!important`, no `@extend`, no `[dir=…]`.** Layers resolve precedence. Mixins or `:is()` replace `@extend`. Logical properties, then `:dir(rtl)`, replace direction selectors. The one `!important` we keep is `[hidden] { display: none !important; }`.
8. **Name custom properties by visibility.** `--_name` is private to the component. `--ig-*` is global or public. Schema tokens come through `var-get()`. Don't introduce new unprefixed names.
9. **Use the shared helpers** for typography (`type-style()`), sizing (`sizable()`, `pad-*()`) and spacing. Where a sized value is used more than once, compute it once into a private custom property on `:scope` and reuse it.

---

## Writing a component's styles

### `block()`

`block()` (defined in `themes/_scoping.scss`) wraps a component's rules in its cascade layer and in a native `@scope` that stops at nested components:

```scss
@include block(combo) { … }
// @layer ig.base {
//     @scope (.igx-combo) to (:scope [ig-scope] > *) { … }
// }

@include block(combo, $theme: indigo) { … }
// the same scope, inside @layer ig.indigo and @container style(--ig-theme: indigo)

@include block(combo, $theme: indigo, $variant: dark) { … }
// …and style(--ig-theme-variant: dark)
```

Inside the block:

- `:scope` is the component root (`.igx-combo`). Use `:scope` rather than `&` at the top level.
- Bare selectors (`[data-part~='toggle']`) match only inside this component. They keep their own specificity, because `@scope` adds none.
- The scope ends at any nested element carrying `ig-scope`, which every component host has. The nested component's **host** is still in scope, so you can size or position it and set its tokens; **its insides are not**.

```text
<igx-combo class="igx-combo" ig-scope>              ← :scope
  <div data-part="toggle">                          ← in scope
  <igx-input-group class="igx-input-group" ig-scope> ← in scope (host only)
    <div data-part="bundle">                        ← NOT in scope
```

One caveat: content a consumer projects through `ng-content` is inside our scope. It is only affected if it happens to carry a matching `data-part`, which is unlikely, but avoid bare element selectors (`span`, `p`) that would match projected content.

### Parts: `data-part`

Mark internal elements that need styling with `data-part`, in the template:

```html
<div data-part="toggle">…</div>
<span data-part="label hint">…</span>
```

Select them with `[data-part~='toggle']`. The `~=` form allows an element to carry more than one part name.

Part names are short, lowercase and hyphenated (`toggle`, `clear-icon`, `empty-message`), and describe *what* the element is, not how it looks. There's no prefix or separator, since `block()` already scopes them to the component.

**Why not the native `part` attribute?** `part` belongs to Shadow DOM: its only effect is to expose an element to `::part()` from outside a shadow root. In our light-DOM components, `.igx-combo::part(toggle)` silently matches nothing. Worse, when an app renders our components inside its own shadow root (`ViewEncapsulation.ShadowDom`, or a custom element), every `part` we render becomes styleable from outside, in one flat namespace shared by all components. `data-part` has no platform behavior, so it can't leak. Ignite UI for Web Components uses the native `part` in its shadow DOM, and we use the same part *names* where a component exists in both libraries.

### State and variants

Choose the hook in this order:

1. **Native state**, lifted to the root with `:has()` or `:focus-within` when the state lives on an inner element:

   ```scss
   @include block(checkbox) {
       :scope:has(> input:checked) { … }
       :scope:has(> input:focus-visible) [data-part~='ripple'] { … }
   }
   ```

2. **ARIA the component already sets**, on the element that carries it:

   ```scss
   :scope[aria-selected='true'] { … }
   :scope:is(:disabled, [aria-disabled='true']) { … }
   ```

   Only use ARIA that is always set for that role. Never add ARIA just to get a styling hook, and don't chain `:has()` across elements to reach ARIA that lives elsewhere; use a `data-*` attribute on the styled element instead.

3. **`data-*` attributes** for everything else, bound on the host:

   ```ts
   host: {
       '[attr.data-variant]': 'variant()',
       '[attr.data-orientation]': 'orientation()',
   }
   ```

   ```scss
   :scope[data-variant='flat'] { --_background: transparent; }
   ```

   Use the shared names where they fit: `data-variant`, `data-type`, `data-orientation`, `data-state`, `data-pinned`. Set them only on elements the library renders.

Two pitfalls:

- **Angular forms don't set native validity.** A control that is invalid through Angular validators doesn't match `:invalid` or `:user-invalid`. Use the `aria-invalid` the component sets.
- **`:placeholder-shown` needs a placeholder.** It can't detect "filled" on an input without one, or on components that aren't plain inputs. Use a `data-state` for those.

### Tokens

In `themes/_base.scss`, digest the component's schema once and read tokens with `var-get()`:

```scss
@use 'igniteui-theming/sass/themes/schemas/components/light/list' as *;

$theme: digest-schema($light-list);

@include block(list) {
    :scope {
        background: var-get($theme, 'background');
    }
}
```

`var-get()` emits a reference to the token (`var(--background)`). The value itself comes from the global theme, which emits it on `.igx-list` for the active design system. Structural files never hold color values.

- Need a **new token**? Add it to the schema in `igniteui-theming` first and consume it here once released. Don't hardcode a stop-gap value.
- Need a **private value** derived from tokens, or one that differs per design system without being a public token? Use a `--_name` custom property on `:scope`, set it in the theme files, and read it in base.
- **Global values** (`--ig-size`, `--ig-spacing`, `--ig-radius-factor`, palette colors such as `--ig-primary-500`) are read with plain `var()`.

### Design-system and dark-variant differences

Theme files only set what differs:

```scss
// stepper/src/stepper/step/themes/shared/_bootstrap.scss
@include block(step, $theme: bootstrap) {
    :scope {
        --_indicator-size: #{rem(24px)};
        --_separator-size: #{rem(1px)};
    }
}
```

When a difference is genuinely structural (for example, Material's input group lays out its label differently), keep the rule in the theme file, inside the same `block()`, and add a short comment saying why it can't be a value.

Light and dark differ only in token values. Don't change layout based on the variant.

### Styling nested components

A component must not restyle another component's internals. That breaks silently whenever the other component changes. Instead:

- Set the nested component's **public tokens** or **host layout** from inside your block. Its host is in scope.
- When a parent has to recolor many sub-components (like the grid does), emit their tokens from a `_derived.scss` file into the `ig.derived` layer, using the `scope()` mixin and `tokens()` with the sub-component's theme function. See `grids/themes/_derived.scss`.
- If the nested component needs a look it doesn't offer (an input that blends into a grid cell, say), add a supported variant to *that* component, with a `data-variant` and tokens, rather than overriding it from outside.

---

## Adding a new component

1. Create `themes/_base.scss` with one `@include block(<name>)`, and `themes/shared/_<ds>.scss` plus `shared/_index.scss` only for the design systems that differ.
2. Create `<name>.component.scss`, which `@use`s `themes/base` and `themes/shared` (and `themes/dark` if present).
3. In the component, set `styleUrl: '<name>.component.css'` and `encapsulation: ViewEncapsulation.None`, and bind the root class and `ig-scope` on the host:

   ```ts
   host: {
       class: 'igx-<name>',
       'ig-scope': '',
   }
   ```

4. If the component has design tokens, its schema must exist in `igniteui-theming`. Wire the tokens into the global theme in `core/src/core/styles/themes/generators/_base.scss`:

   ```scss
   @if is-used('igx-<name>', $exclude) {
       @include std.component-tokens('igx-<name>', '<name>', $schema);
   }
   ```

   A component without tokens needs no schema and no generator entry.
5. Mark internal elements with `data-part`, and list the parts in the component README's "Styling" section.

**Directives and services** have no `styleUrl`. Give them a `<name>.styles.scss` instead, laid out the same way (`@use`ing `themes/base` and `themes/shared`). The build compiles it to a generated `<name>.styles.ts`. Register that once per document from the constructor, the way `IgxGridBaseDirective` does:

```ts
import { MY_DIRECTIVE_CSS } from './my-directive.styles';

const STYLES_ID = Symbol('igx-my-directive');

constructor() {
    inject(IgxStylesRegistrar).register(STYLES_ID, MY_DIRECTIVE_CSS);
}
```

The export name comes from the file name: `my-directive.styles.scss` exports `MY_DIRECTIVE_CSS`. The registrar uses `adoptedStyleSheets` in the browser and a `<style>` element during SSR, and ignores repeat registrations.

## Converting an existing component

Most components still use BEM classes generated with `b()`, `e()` and `m()`. When converting one:

1. **Template.** Add `data-part="…"` next to each existing element class, and `ig-scope` to the host. Add `data-*` bindings only for states and variants that have no native or ARIA equivalent. **Keep the existing class bindings**: customers' CSS may target them.
2. **Styles.** Rewrite `themes/_base.scss` and the theme files as one `block()` each, following the rules above. Update specs that assert old classes.
3. **Deprecate.** The old `__element` and `--modifier` classes stay in the markup but are no longer used by library styles. List them as deprecated in the component README and the CHANGELOG. They are removed in a later major, with an `ng update` migration.

Convert a component in one PR. Include the before/after CSS size, and check all four design systems in light and dark.

## Legacy components

Some styles still use the older two-file layout under `core/src/core/styles/components/`:

- `_<name>-theme.scss`: a mixin called from `theme()` that emits tokens and visual placeholders;
- `_<name>-component.scss`: a mixin called from `core()` that emits BEM selectors and `@extend`s those placeholders.

They are there for different reasons:

| Styles | Why they live in `core/styles/components/` |
|---|---|
| button, icon-button, ripple, label, tooltip, highlight | Owned by directives, which have no `styleUrl`. They can move to the directive layout described in "Adding a new component". |
| overlay | Owned by a service; the same applies. |
| scrollbar | Global styles shared by every component, so they belong in `core()`. |
| chart wrappers, watermark | Components from other packages (`igniteui-angular-charts`, the trial watermark). These files only register the names (for `$exclude`) and emit tokens. |

For a small fix, follow the file's existing pattern. Moving a directive's or the overlay's styles is a conversion in its own right; do it in a dedicated PR.

---

## Linting and tests

```bash
npm run lint:styles   # Stylelint on all SCSS
npm run test:styles   # sass-true tests in core/src/core/styles/spec/
npm run lint:lib      # full lint, before finishing
```

Add a sass-true test (`core/src/core/styles/spec/`) when you add or change a shared function or mixin, such as anything in `base/` or `themes/_scoping.scss`. Component stylesheets are covered by the component's Karma tests and by visual checks.

```scss
@use 'sass-true' as *;

@include describe('block()') {
    @include it('scopes rules to the component') {
        @include assert() {
            @include output() { /* … */ }
            @include expect() { /* … */ }
        }
    }
}
```

## What lives in `igniteui-theming`

| Area | Provides |
|---|---|
| `sass/themes/schemas/` | Per-component token maps (`$light-avatar`, `$dark-grid`, …) |
| `sass/themes/components/` | Component theme functions (`avatar-theme()`, …) |
| `sass/themes/` | `tokens()`, `var-get()`, `digest-schema()`, `sizable()`, `pad-*()` |
| `sass/typography/` | `type-style()`, `rem()`, type scales |
| `sass/color/`, `sass/elevations/` | Palettes, `color()`, elevations |
| `sass/animations/` | Easing variables |
| `sass/bem/` | `b()`, `e()`, `m()`, `mx()`. Legacy only; don't use in new code. |

---

## Checklists

**New or converted component**

- [ ] Each theme file is one `block()`; no hand-written `@scope` or `@layer`.
- [ ] Theme files only set values, or carry a commented structural difference.
- [ ] Internal elements use `data-part`; the host binds its root class and `ig-scope`.
- [ ] State uses native pseudo-classes, existing ARIA, or `data-*`, not modifier classes.
- [ ] No selectors reach into other components; nested components are styled through tokens or host layout only.
- [ ] No `!important`, `@extend`, `[dir=…]`, or new unprefixed custom properties.
- [ ] Tokens wired in `generators/_base.scss` (if the component has a schema).
- [ ] Parts listed in the component README; deprecated classes in README and CHANGELOG (conversions).
- [ ] `npm run build:styles:components`, `npm run lint:styles`, and the component's tests pass; checked in all four design systems, light and dark.

**New state or variant**

- [ ] Uses a native pseudo-class or existing ARIA if one exists; otherwise a `data-*` attribute bound on the host.
- [ ] Values come from tokens; a new public token was added to `igniteui-theming` first.
- [ ] `npm run lint:styles` passes.
