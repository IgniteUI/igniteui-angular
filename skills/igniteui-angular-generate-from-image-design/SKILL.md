---
name: igniteui-angular-generate-from-image-design
description: Implement Angular application views from design images using Ignite UI Angular components. Uses MCP servers (igniteui-cli, igniteui-theming, angular-cli) to discover components, generate themes, and follow best practices. Triggers when the user provides a design image (screenshot, mockup, wireframe) and wants it built as a working Angular view with igniteui-angular components. Also triggers when the user asks to "implement this design", "build this UI", "convert this mockup", or "create a page from this image" in an Ignite UI Angular project.
user-invocable: true
---

# Implementing Ignite UI Angular Views from Design Images

## MANDATORY AGENT PROTOCOL

Before writing any implementation code, you must complete these steps in order:

1. Analyze the image and identify all visible regions and UI patterns.
2. Read [references/component-mapping.md](references/component-mapping.md) and [references/gotchas.md](references/gotchas.md).
3. This skill is Angular-only. Check package layout or licensing only when imports, packages, or theming depend on it.
4. To apply a theme, use the theming workflow from this skill and the dedicated `igniteui-angular-theming` skill; use the `igniteui-theming` MCP tools instead of styling from memory.
5. Call `get_doc` for every chosen component family before using it.
6. Only then start coding.

## Workflow

1. **Analyze the design image** - Read the image, identify every UI section, component, layout structure.
2. **Confirm package layout if needed** - this skill is Angular-only; check package layout or licensing only when imports, packages, or theming depend on it
3. **Discover components** - Call `list_components` with targeted filters to find matching components for each UI pattern
4. **Look up component docs** - Call `get_doc` for every chosen component family before coding
5. **Generate theme** - (a) To generate a theme, first extract colors and create a color palette using `create_palette` or `create_custom_palette` depending on the scenario. Then extract elevations and call `create_elevations`. Then extract typography and call `create_typography`. Then call `create_theme` with the palette, elevations, and typography. (b) After a theme exists, prefer using design tokens or scoped semantic CSS variables over raw literals. (c) For every Ignite UI component, call `get_component_design_tokens`, map extracted image tokens to token roles, then call `create_component_theme` with the tokens differing from the global theme for the specific component.
6. **Implement** - Build the screenshot-first layout, data, and view components
7. **Refine** - Use the `set_size`, `set_spacing`, `set_roundness` tools to refine the view's visual fidelity against the image, then iterate on implementation and theming until the view matches the design closely
8. **Validate** - Build, test, run, compare against the image, and fix differences

## Step 1: Analyze the Design Image

Read the input image carefully. For each visual section, identify:

- **Layout structure**: grid rows/columns, sidebar, navbar, content area proportions, and estimated fixed widths or percentages for major regions.
> Note: Do not guess the exact CSS properties at this stage; just identify the high-level structure and relative proportions. Do not try to fit the view into exact breakpoints or pixel values. Try to generate a flexible layout that preserves the observed proportions and can adapt to different screen sizes. You will refine the exact CSS rules in Step 8 after building a first version of the view.
- **Component type**: chart, list, card, map, gauge, table, form, etc.
- **Color palette**: primary, secondary, surface/background, accent, text colors
- **Typography**: font sizes, weights, letter-spacing patterns
- **Surface styling**: borders, border-radius, shadows, elevation, divider treatments
- **Data patterns**: what mock data is needed (time series, lists, KPIs, geographic)
- **Spacing system**: translate observed padding and gaps into a small reusable scale derived from the design

Before writing code, create a decomposition table with one row per visible region containing:

| Region | Visual role | Candidate component | Custom CSS required | Data type |
|---|---|---|---|---|
| Example: sidebar item list | repeated rows with icon + label | `IgxListComponent` | yes - item height, icon size | domain-appropriate mock data |
| Example: top bar | brand + tabs + search | `IgxNavbarComponent` | yes - multi-zone flex layout | n/a |
| Example: side panel | always-visible navigation | `IgxNavigationDrawerComponent` | yes - width, item styling | n/a |

Start every region with the most appropriate Ignite UI component from [references/component-mapping.md](references/component-mapping.md). Only fall back to plain semantic HTML when the component DOM structure is fundamentally incompatible with the design after CSS overrides are considered. Document the reason for any plain-HTML fallback in a code comment.

Before writing code, produce a compact implementation brief that captures:

- chosen components per region
- fallback HTML regions
- theme strategy
- package needs
- major assumptions

After the table, translate the image into CSS Grid rows and columns first. Preserve desktop proportions before adding responsive behavior, then define explicit breakpoint stacking rules for smaller screens.

## Step 2-3: Use MCP Tools for Discovery

This skill is Angular-only. Check package layout or licensing only when imports, packages, or theming depend on it.

If you need to confirm package layout or licensing state, act on the result immediately:

- If the project uses Open Source package layout, use `igniteui-angular` for all core imports.
- If the project is unlicensed or uses Open Source package layout, do not mark any core UI components as blocked or premium-only during implementation.
- If the result indicates a licensed package layout, follow the licensed import paths shown in the component reference when needed.

Then call `list_components` with `framework: "angular"` and relevant filters to find components matching each UI pattern. Common filters:

- `chart`, `sparkline` - for data visualization
- `list view`, `card`, `avatar`, `badge` - for data display
- `nav`, `navbar`, `drawer` - for navigation
- `progress`, `gauge` - for metrics
- `map` - for geographic displays
- `grid` - for tabular data

Use narrow search terms to reduce noisy MCP results. Search for the specific UI pattern you need, such as `list view` instead of `list`.

For component-to-Ignite-UI mapping, see [references/component-mapping.md](references/component-mapping.md).

## Step 4: Look Up Component API

For every chosen component category, call `get_doc` with the doc name from `list_components` results (e.g., `name: "card"`, `framework: "angular"`). Use the doc `name` field from the MCP results, not the result title shown in the list. This is mandatory before coding and gives exact usage patterns, inputs, and template structure.

Call `search_docs` for feature-based questions (e.g., "how to configure [component] for [specific behavior or styling need]").

## Step 5: Generate Theme with MCP

Use this skill for the image-to-view theming workflow only. The dedicated [`igniteui-angular-theming`](../igniteui-angular-theming/SKILL.md) skill remains the source of truth for palette-token behavior, global theme rules, and broader theming-system guidance.

### 5a - Existing app guard (always run first)

Before generating any theme code, inspect the project's global stylesheet (typically `styles.scss`). Look for an active `@include theme(...)` or `@include palette(...)` call that already references a palette variable.

- **Existing theme found** -> the global palette is already set. Do **not** call `create_theme` or `create_palette` unless the user explicitly wants a global theme change. Instead:
  1. Inspect the existing theme definition and any exposed palette tokens or semantic CSS variables
  2. Reuse the current design system, variant, and palette tokens wherever they already match the design image
  3. Skip to **5c** and apply only minimal scoped overrides for the new view's components
- **No theme found / blank/default palette** -> proceed with **5b** to generate a fresh global theme.

### 5b - Global theme generation (new projects only)

Follow this order - MCP guidance first, image extraction second:

1. **Read MCP guidance first** - call `theming://guidance/colors/rules` (or `get_theming_guidance`) before looking at the image. This tells you the available theme inputs and any luminance or variant constraints.
2. **Resolve the design system** - infer it from the existing workspace, explicit user request, or the closest visual match in the design. Do not assume one if a stronger signal exists.
3. **Extract from the image** - now that you know the available slots, extract values only for the inputs you actually need.
4. **Call `create_theme` or `create_palette`** with the extracted seed values:

```
create_theme({
  primaryColor: "<color extracted from image for primary slot>",
  secondaryColor: "<color extracted from image for secondary slot>",
  surfaceColor: "<color extracted from image for surface/background slot>",
  variant: "<resolved theme variant>",
  platform: "angular",
  licensed: <detected licensing state>,
  fontFamily: "<font extracted from image or existing app>",
  designSystem: "<resolved design system>"
})
```

Read and act on any luminance warnings returned. If the design needs multiple surface depths that a single generated surface color does not cover, use `create_custom_palette` or define semantic CSS variables for the additional depths in `styles.scss`.

Use `create_palette` for straightforward designs with a small, coherent color system. Use `create_custom_palette` when the design has multiple distinct surface depths, several accent families, or when the generated palette cannot reliably match the screenshot.

### 5c - Per-component token discovery and mapping (always run)

> **Scope:** this step applies only to **core Ignite UI Angular components** (grid, list, navbar, drawer, card, inputs, chips, etc.). DV components - charts, maps, gauges, and sparklines - have no Sass design tokens. Skip this step for them and set their visual properties exclusively via component inputs as described in [references/gotchas.md](references/gotchas.md) and in Step 7.

For **every** core Ignite UI component chosen in Steps 3-4, follow this MCP-first loop - query MCP before touching the image:

1. **Discover (MCP first)** - call `get_component_design_tokens(component)` before looking at the image for that component. Read the full token list with names, types, and descriptions. Identify which tokens correspond to visible surfaces, text, borders, icons, and interaction states.
2. **Extract (image second)** - now that you know the exact token names, go to the image region for that component and read the exact token value for each relevant token slot. Do not guess; zoom into the component region.
3. **Generate** - call `create_component_theme(component, platform, licensed, tokens)` passing only the tokens whose resolved value differs from the global theme. This produces scoped SCSS with the minimal override set.

**Example - theming a grid:**
- `get_component_design_tokens("grid")` returns `header-background`, `content-background`, `row-hover-background` among many others
- Look at the grid region in the image -> extract the color intent for header, row background, and hover state
- Resolve each value to a palette token or local semantic CSS variable
- Call `create_component_theme("grid", ...)` with only `{ "header-background": "<resolved token>", "content-background": "<resolved token>", "row-hover-background": "<resolved token>" }`

Apply the generated theme blocks inside `::ng-deep` scoped to the component selector as shown in the `create_component_theme` output.

Do not run `create_component_theme` for regions built with custom HTML/CSS only.

### 5d - Theming sequence summary

Apply in this exact order:

1. Inspect `styles.scss` -> existing theme or blank?
2. Create or update a theme: `create_theme` (Step 5b)
3. For each Ignite UI component: `get_component_design_tokens` -> map image design tokens -> resolve values to design tokens or semantic CSS variables -> `create_component_theme` (Step 5c)
4. Use `get_color` after palette generation whenever a palette token can represent the final color intent

If you use typography mixins with a comma-separated font family list, wrap the font families in parentheses as described in [references/gotchas.md](references/gotchas.md).

## Step 6: Install DV Packages

Core UI components ship with `igniteui-angular` in Open Source projects and may use `@infragistics/igniteui-angular` in licensed setups. Charts, maps, gauges, and sparklines require additional DV packages. These packages are version-sensitive: determine the installed Ignite UI version, resolve the compatible published DV package version, and install only the package set required by the selected components. See [references/component-mapping.md](references/component-mapping.md) for package names and import patterns.

If DV packages are missing, identify the exact packages and versions required first, then ask for approval before installing packages or changing dependency manifests.

In standalone Angular apps, DV chart, map, and gauge packages are imported via modules in the component `imports` array, not as standalone components.

## Step 7: Implement

### Structure

- **Layout**: use Ignite UI layout and data-display components as the starting point for standard regions, then apply CSS Grid/Flexbox and component overrides to match the screenshot. Only substitute plain semantic HTML when an Ignite UI component remains structurally incompatible after a genuine attempt
- **Data**: use typed mock data that matches the design's density and domain; add models/services only when they help the implementation
- **View**: keep layout, spacing, typography, and surface styling in SCSS rather than inline attributes
- **Theming**: apply the resolved design system and theme variant from Step 5, and keep color usage aligned with palette tokens or local semantic CSS variables

### Implementation Checks

- Follow Angular and repo conventions from `AGENTS.md` and `.github/copilot-instructions.md`
- Use [references/component-mapping.md](references/component-mapping.md) for component-choice and semantic-fallback rules
- Use [references/gotchas.md](references/gotchas.md) for components, theming, and API edge cases instead of re-encoding those rules inline
- Favor Ignite UI components over custom HTML when both approaches can reach similar visual fidelity
- Import standalone pipes explicitly when their template syntax requires them
- Preserve spacing, hierarchy, and data density before adding extra interactivity
- Avoid generic placeholders when the image shows domain-specific content
- Document brief assumptions when the image is ambiguous instead of silently guessing

## Step 8: Refine

After the first implementation pass, use the `set_size`, `set_spacing`, and `set_roundness` tools to adjust the view's visual properties and close the gap with the image. Focus on the most visually distinctive elements first (e.g., panel proportions, chart shape, button prominence) before tuning smaller details (e.g., row heights, spacing between regions).

## Step 9: Validate

Use this validation loop explicitly:

1. Build
2. Test
3. Run the app
4. Visually compare against the image
5. Adjust and repeat

In terminal-only environments, the user performs the visual comparison and provides feedback on any mismatches. Only perform the visual check directly when the environment has browser and screenshot capabilities available to the agent.

Use this checklist during the first visual comparison:

- panel proportions
- control density
- chart shape
- legend placement
- button prominence
- row heights
- spacing between regions

Fix TypeScript or template errors immediately during the build/test steps. Use the build output, component docs, [references/gotchas.md](references/gotchas.md), and the user's visual feedback to close the remaining gaps. Typical adjustments include:

- revisiting chart data density, smoothing, or marker visibility
- adjusting layout ratios, region spacing, or row heights
- correcting navigation mode, panel chrome, or component choice
- tuning map/filter treatment and dark-surface hierarchy
- re-examining the original design for overlooked sections or missing imports

After the build succeeds with zero errors, refine layout proportions, color values, missing sections, and typography until the view matches closely.
