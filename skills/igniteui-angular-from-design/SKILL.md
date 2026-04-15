---
name: igniteui-from-design
description: >
  Implement Angular application views from design images using Ignite UI Angular components.
  Uses MCP servers (igniteui, igniteui-theming, angular-cli) to discover components, generate
  themes, and follow best practices. Triggers when the user provides a design image (screenshot,
  mockup, wireframe) and wants it built as a working Angular view with igniteui-angular components.
  Also triggers when the user asks to "implement this design", "build this UI", "convert this
  mockup", or "create a page from this image" in an Ignite UI Angular project.
---

# Implementing Ignite UI Angular Views from Design Images

## Workflow

1. **Analyze the design image** - Read the image, identify every UI section, component, layout structure, colors, and data patterns
2. **Detect platform** - Call `mcp__igniteui-theming__detect_platform` to confirm Angular + licensed status
3. **Discover components** - Call `mcp__igniteui__list_components` with targeted filters to find matching components for each UI pattern
4. **Look up component docs** - Call `mcp__igniteui__get_doc` for unfamiliar components to learn their API
5. **Get best practices** - Call `mcp__angular-cli__get_best_practices` with the workspace path
6. **Generate theme** - Call `mcp__igniteui-theming__create_theme` (or `create_palette`) with colors extracted from the design
7. **Install packages** - Install any additional DV packages needed (charts, maps, gauges)
8. **Implement** - Build the app shell, data layer, and view components
9. **Iterate** - Compare output vs design image, fix visual differences

## Step 1: Analyze the Design Image

Read the input image carefully. For each visual section, identify:

- **Layout structure**: grid rows/columns, sidebar, navbar, content area proportions
- **Component type**: chart, list, card, map, gauge, table, form, etc.
- **Color palette**: primary, secondary, surface/background, accent, text colors
- **Typography**: font sizes, weights, letter-spacing patterns
- **Data patterns**: what mock data is needed (time series, lists, KPIs, geographic)

## Step 2-3: Use MCP Tools for Discovery

Call `mcp__igniteui-theming__detect_platform` first to confirm the project setup.

Then call `mcp__igniteui__list_components` with `framework: "angular"` and relevant filters to find components matching each UI pattern. Common filters:

- `chart`, `sparkline` - for data visualization
- `list`, `card`, `avatar`, `badge` - for data display
- `nav`, `navbar`, `drawer` - for navigation
- `progress`, `gauge` - for metrics
- `map` - for geographic displays
- `grid` - for tabular data

For component-to-Ignite-UI mapping, see [references/component-mapping.md](references/component-mapping.md).

## Step 4: Look Up Component API

For any component you haven't used before, call `mcp__igniteui__get_doc` with the doc name from `list_components` results (e.g., `name: "card"`, `framework: "angular"`). This gives exact usage patterns, inputs, and template structure.

Call `mcp__igniteui__search_docs` for feature-based questions (e.g., "how to style area chart dark theme").

## Step 5: Generate Theme with MCP

Extract colors from the design image, then call:

```
mcp__igniteui-theming__create_theme({
  primaryColor: "<extracted primary>",
  secondaryColor: "<extracted secondary>",
  surfaceColor: "<extracted background>",
  variant: "dark" or "light",
  platform: "angular",
  licensed: true/false,
  fontFamily: "<extracted font>",
  designSystem: "material"
})
```

Use `create_palette` instead if only the palette needs customization. Use `create_component_theme` for per-component overrides (navbar, drawer, list backgrounds).

## Step 6: Install DV Packages

Core UI components ship with `@infragistics/igniteui-angular`. Charts, maps, gauges, and sparklines require additional packages. See [references/component-mapping.md](references/component-mapping.md) for package names and import patterns.

## Step 7: Implement

### Structure

- **App shell**: navbar + nav drawer + router-outlet in root component
- **Data layer**: interfaces in `models/`, injectable service with mock data in `services/`
- **View**: CSS Grid layout with panel sections in the routed component

### Key Implementation Rules

- Use Angular project conventions from `CLAUDE.md` / `AGENTS.md` (standalone components, OnPush, signals, `@if`/`@for`, `inject()`)
- Set all DV component colors explicitly via inputs — they do NOT inherit the Sass theme
- For dark themes, use `$dark-material-schema` and define CSS custom properties for panel styling
- Use `::ng-deep` with component theme mixins (`navbar-theme`, `navdrawer-theme`, `list-theme`) for core UI dark styling

### Common Pitfalls

Consult [references/gotchas.md](references/gotchas.md) for known issues including:
- Sass function name collisions (`contrast()`)
- Font family syntax in typography mixin
- Chart marker visibility, missing properties
- Avatar/component property mismatches
- Map dark styling and programmatic series setup

## Step 8: Iterate on Visual Fidelity

After the first build, compare the output screenshot against the original design. Common fixes:

- **Chart too spiky**: increase data points (300-500), use exponential smoothing, set `[markerTypes]="'none'"`
- **Map too dark/light**: adjust CSS filter values (`grayscale`, `brightness`, `saturate`)
- **Panel proportions wrong**: adjust CSS Grid `grid-template-columns` ratios
- **Missing content sections**: re-examine the original design for overlooked elements
- **Nav drawer in wrong mode**: remove `igxDrawerMini` template if full mode is needed, or vice versa

Rebuild, take a new screenshot, and compare again until satisfied.
