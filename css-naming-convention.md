# Ignite UI for Angular CSS Naming Convention

## Going forward: CUBE CSS

New and actively-migrated components follow a [CUBE CSS](https://cube.fyi)-inspired strategy instead of BEM. CUBE splits styles into four concerns:

- **Composition** — layout-only rules that arrange a component's own internal structure (e.g. the wrapper elements a component renders around projected content). These stay component-scoped for now; the library does not yet have a shared, cross-component composition/layout utility layer.
- **Utility** — single-purpose, reusable classes for one CSS concern at a time. Introduce these only where a genuine cross-component need exists; don't invent component-scoped "utility" classes as a substitute for Block/Exception naming.
- **Block** — a component's own root class and any other independently addressable "thing" it renders (e.g. a directive-backed item wrapper). Blocks are flat class names: no `--`-style modifier chains. Where an element is purely an internal part of another block (not independently meaningful on its own), name it with the block as a prefix followed by `__` (e.g. `igx-virtual-scroll__track`) so its ownership is clear at a glance — this is a plain naming convention, not an invocation of BEM's element/modifier tooling (no `bem` Sass mixins, no `--` modifiers).
- **Exception** — state and variants. Prefer `data-*` attributes reflecting a component's own input/state (e.g. `[data-orientation="horizontal"]`) over boolean modifier classes kept in sync by the component. Attributes are also naturally queryable and stylable without extra host-binding wiring.

Rules for CUBE-based components:

- Class names are lower-case, hyphen-separated words, prefixed with `igx-` (unchanged from before).
- No `--` modifier classes for state that varies at runtime — use a `data-*` attribute instead.
- No dependency on the `igniteui-theming/sass/bem` mixins (`b()`/`e()`/`m()`) — write plain selectors.
- If the component has no design tokens (no color/typography/elevation surface of its own), it does not need a schema entry in `igniteui-theming` — only the structural `themes/_base.scss` file, wrapped in the shared `layer(base)` mixin so it still participates in the library's `ig.base` cascade layer.

This does not retroactively apply to existing components — see below.

## Existing components: BEM (Two Dashes style)

The rest of the library (everything not explicitly migrated) uses the [BEM naming convention](https://en.bem.info/methodology/naming-convention/), Two Dashes style, generated via the `igniteui-theming/sass/bem` mixins (`b()`, `e()`, `m()`):

Naming Convention:

ex.: `block-name__elem-name--mod-name`

 - Names are written in lower case.
 - Words within the names of BEM entities are separated by a hyphen (-).
 - An element name is separated from a block name by a double underscore (__).
 - Boolean modifiers are delimited by double hyphens (--).
 - Key-value type modifiers are not used.

**Important!** Double hyphen within the comment (--) is perceived as part of the comment and therefore its presence lead to error during document validation. [HTML5 Specification](http://www.w3.org/TR/html5/syntax.html#comments)

Existing BEM-based components are not required to migrate to CUBE. Only migrate a component's naming when you are already doing substantial, deliberate work on its styles — don't rename classes as a drive-by change.
