---
name: igniteui-angular-theming
description: "Customize Ignite UI components styling using the igniteui-theming MCP server for AI-assisted theming. Use when users ask to theme or restyle Ignite UI components, change the color palette, switch between light and dark themes, apply or generate a global theme, customize typography or elevations, or configure component-level styles."
user-invokable: true
---

# Ignite UI for Angular — Theming Skill

## Description

This skill teaches AI agents how to theme Ignite UI for Angular applications using the Sass-based theming system and the **Ignite UI Theming MCP server**. It covers global themes, palettes, typography, elevations, component-level theming, layout controls (spacing, sizing, roundness), and how to use the MCP tools for code generation.

## Prerequisites

- An Angular project with `igniteui-angular` installed, **or** `@infragistics/igniteui-angular` for licensed users
- Sass support enabled in the project (default for Angular CLI projects)
- The **Ignite UI Theming MCP server** (`igniteui-theming`) available as a tool provider

> **AGENT INSTRUCTION — MCP Server Setup (REQUIRED)**
>
> Before using any theming tools, you MUST verify the MCP server is available
> by calling `detect_platform`. If the tool is not available or the call fails,
> you MUST automatically configure it by following the setup process steps described below.
>
> After writing the file, inform the user that the MCP server has been
> configured and they may need to reload the editor for the tools to activate.
> Start the MCP server and wait for that MCP server to start before continuing the theming related work.
> Do NOT skip this step or ask the user to do it manually.

## Setting Up the Theming MCP Server

The Ignite UI Theming MCP server enables AI assistants to generate production-ready theming code. It must be configured in your editor before the theming tools become available.

### VS Code

Create or edit `.vscode/mcp.json` in your project:

```json
{
  "servers": {
    "igniteui-theming": {
      "command": "npx",
      "args": ["-y", "igniteui-theming", "igniteui-theming-mcp"]
    }
  }
}
```

This works whether `igniteui-theming` is installed locally in `node_modules` or needs to be pulled from the npm registry — `npx -y` handles both cases.

### Cursor

Create or edit `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "igniteui-theming": {
      "command": "npx",
      "args": ["-y", "igniteui-theming", "igniteui-theming-mcp"]
    }
  }
}
```

### Claude Desktop

Edit the Claude Desktop config file:
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "igniteui-theming": {
      "command": "npx",
      "args": ["-y", "igniteui-theming", "igniteui-theming-mcp"]
    }
  }
}
```

### WebStorm / JetBrains IDEs

1. Go to **Settings → Tools → AI Assistant → MCP Servers**
2. Click **+ Add MCP Server**
3. Set Command to `npx` and Arguments to `igniteui-theming igniteui-theming-mcp`
4. Click OK and restart the AI Assistant

### Verifying the Setup

After configuring the MCP server, ask your AI assistant:

> "Detect which Ignite UI platform my project uses"

If the MCP server is running, the `detect_platform` tool will analyze your `package.json` and return the detected platform (e.g., `angular`).

## Theming Architecture

> **Docs:** [Theming Overview](https://www.infragistics.com/products/ignite-ui-angular/angular/components/themes/index) · [Palette](https://www.infragistics.com/products/ignite-ui-angular/angular/components/themes/palettes) · [Typography](https://www.infragistics.com/products/ignite-ui-angular/angular/components/themes/typography) · [Elevations](https://www.infragistics.com/products/ignite-ui-angular/angular/components/themes/elevations)

The Ignite UI theming system is built on four pillars:

| Concept | Purpose |
|---|---|
| **Palette** | Color system with primary, secondary, surface, gray, info, success, warn, error families, each with shades 50–900 + accents A100–A700 |
| **Typography** | Font family, type scale (h1–h6, subtitle, body, button, caption, overline) |
| **Elevations** | Box-shadow levels 0–24 for visual depth |
| **Schema** | Per-component recipes mapping palette colors to component tokens |

### Design Systems

Four built-in design systems are available:

- **Material** (default) — Material Design 3
- **Bootstrap** — Bootstrap-inspired
- **Fluent** — Microsoft Fluent Design
- **Indigo** — Infragistics Indigo Design

Each has light and dark variants (e.g., `$light-material-schema`, `$dark-fluent-schema`).

## Pre-built Themes

The quickest way to theme an app is to include a pre-built CSS file in `angular.json`:

```json
"styles": ["node_modules/igniteui-angular/styles/igniteui-angular.css"]
```

> **Licensed package users:** replace `igniteui-angular` with `@infragistics/igniteui-angular` in the path:
> ```json
> "styles": ["node_modules/@infragistics/igniteui-angular/styles/igniteui-angular.css"]
> ```

Available pre-built CSS files:

| File | Theme |
|---|---|
| `igniteui-angular.css` | Material Light |
| `igniteui-angular-dark.css` | Material Dark |
| `igniteui-fluent-light.css` | Fluent Light |
| `igniteui-fluent-dark.css` | Fluent Dark |
| `igniteui-bootstrap-light.css` | Bootstrap Light |
| `igniteui-bootstrap-dark.css` | Bootstrap Dark |
| `igniteui-indigo-light.css` | Indigo Light |
| `igniteui-indigo-dark.css` | Indigo Dark |

All files are located under `node_modules/igniteui-angular/styles/` (or `node_modules/@infragistics/igniteui-angular/styles/` for the licensed package).

## Custom Sass Theme (Manual)

> **AGENT INSTRUCTION — Sass Theming Docs**: If the user explicitly asks to build a Sass-based theme or configure Sass, refer to the dedicated Sass documentation:
> - [Sass Theming Overview](https://www.infragistics.com/products/ignite-ui-angular/angular/components/themes/sass/index)
> - [Sass Configuration](https://www.infragistics.com/products/ignite-ui-angular/angular/components/themes/sass/configuration)
> - [Sass Palettes](https://www.infragistics.com/products/ignite-ui-angular/angular/components/themes/sass/palettes)
> - [Sass Component Themes](https://www.infragistics.com/products/ignite-ui-angular/angular/components/themes/sass/component-themes)

Create a `styles.scss` file and include it in `angular.json`:

```scss
// Open-source package
@use 'igniteui-angular/theming' as *;
// Licensed package — same Sass API, different import path
// @use '@infragistics/igniteui-angular/theming' as *;
$my-palette: palette(
  $primary: #1976D2,
  $secondary: #FF9800,
  $surface: #FAFAFA
);

// 2. Typography (optional)
@include typography(
  $font-family: $material-typeface,
  $type-scale: $material-type-scale
);

// 3. Core reset & base styles
@include core();

// 4. Apply theme
@include theme(
  $palette: $my-palette,
  $schema: $light-material-schema
);
```

For dark themes, use a dark surface color and a dark schema:

```scss
$dark-palette: palette(
  $primary: #90CAF9,
  $secondary: #FFB74D,
  $surface: #121212
);

@include theme(
  $palette: $dark-palette,
  $schema: $dark-material-schema
);
```

## Component-Level Theming

> **Docs:** [Component Themes](https://www.infragistics.com/products/ignite-ui-angular/angular/components/themes/sass/component-themes)

Override individual component appearance using component theme functions and the `tokens` mixin.

> **AGENT INSTRUCTION — No Hardcoded Colors (CRITICAL)**
>
> Once a palette has been generated (via `palette()` in Sass or `create_palette` / `create_theme` via MCP),
> **every color reference MUST come from the generated palette tokens** — never hardcode hex/RGB/HSL values.
>
> Use `var(--ig-primary-500)`, `var(--ig-secondary-300)`, `var(--ig-surface-500)`, etc. in CSS,
> or the `get_color` MCP tool to obtain the correct token reference.
>
> **WRONG** (hardcoded hex — breaks theme switching, ignores the palette):
> ```scss
> $custom-avatar: avatar-theme(
>   $background: #E91E63,
>   $color: #FFFFFF
> );
> ```
>
> **RIGHT** (palette token — stays in sync with the theme):
> ```scss
> $custom-avatar: avatar-theme(
>   $schema: $light-material-schema,
>   $background: var(--ig-primary-500),
>   $color: var(--ig-primary-500-contrast)
> );
> ```
>
> This applies to **all** style code: component themes, custom CSS rules, Sass variables used
> for borders/backgrounds/text, Angular `host` bindings, and inline styles.
> The only place raw hex values belong is the **initial `palette()` call** that seeds the color system.
> Everything downstream must reference the palette.

```scss
@use 'igniteui-angular/theming' as *;

$custom-avatar: avatar-theme(
  $schema: $light-material-schema,
  $background: var(--ig-primary-500),
  $color: var(--ig-primary-500-contrast)
);

igx-avatar {
  @include tokens($custom-avatar);
}
```

### Discovering Available Tokens

Each component has its own set of design tokens (themeable CSS custom properties). Before theming a component, you must know which tokens exist. Use the **MCP tool** `get_component_design_tokens` to discover them.

### Compound Components

Some components (e.g., `combo`, `grid`, `date-picker`, `select`) are **compound** — they contain internal child components, each requiring their own theme. For example, `date-picker` uses `calendar`, `flat-button`, and `input-group` internally.

Workflow for compound components:
1. Call `get_component_design_tokens` for the parent (e.g., `date-picker`)
2. The response lists related themes and scope selectors
3. Call `create_component_theme` for each child, using the parent's selector as the wrapper

## Layout Controls

### Sizing

> **Docs:** [Display Density / Sizing](https://www.infragistics.com/products/ignite-ui-angular/angular/components/display-density)

Controls the size of components via `--ig-size` (values: 1 = small, 2 = medium, 3 = large):

```css
/* Global */
:root { --ig-size: 2; }

/* Component-scoped */
igx-grid { --ig-size: 1; }
```

### Spacing

> **Docs:** [Spacing](https://www.infragistics.com/products/ignite-ui-angular/angular/components/themes/spacing)

Controls internal padding via `--ig-spacing` (1 = default, 0.5 = compact, 2 = spacious):

```css
:root { --ig-spacing: 1; }
.compact-section { --ig-spacing: 0.75; }
```

### Roundness

Controls border-radius via `--ig-radius-factor` (0 = square, 1 = maximum radius):

```css
:root { --ig-radius-factor: 1; }
igx-avatar { --ig-radius-factor: 0.5; }
```

## Using the Theming MCP Server

The Ignite UI Theming MCP server provides tools for AI-assisted theme code generation.

> **IMPORTANT — File Safety Rule**: When generating or updating theme code, **never overwrite existing style files directly**. Instead, always **propose the changes as an update** and let the user review and approve before writing to disk. If a `styles.scss` (or any target file) already exists, show the generated code as a diff or suggestion rather than replacing the file contents. This prevents accidental loss of custom styles the user has already written.

Always follow this workflow:

### Step 1 — Detect Platform

```
Tool: detect_platform
```
This auto-detects `angular` from `package.json` and sets the correct import paths.

### Step 2 — Generate a Full Theme

```
Tool: create_theme
Params: {
  platform: "angular",
  designSystem: "material",
  primaryColor: "#1976D2",
  secondaryColor: "#FF9800",
  surfaceColor: "#FAFAFA",
  variant: "light",
  fontFamily: "'Roboto', sans-serif",
  includeTypography: true,
  includeElevations: true
}
```

Generates a complete Sass file with palette, typography, elevations, and the `theme()` mixin call.

### Step 3 — Customize Individual Components

```
Tool: get_component_design_tokens
Params: { component: "grid" }
```

Then use **palette token references** (not hardcoded hex values) for every color:

```
Tool: create_component_theme
Params: {
  platform: "angular",
  designSystem: "material",
  variant: "light",
  component: "grid",
  tokens: {
    "header-background": "var(--ig-primary-50)",
    "header-text-color": "var(--ig-primary-800)"
  }
}
```

> **Reminder**: After a palette is generated, all token values passed to
> `create_component_theme` must reference palette CSS custom properties
> (e.g., `var(--ig-primary-500)`, `var(--ig-secondary-A200)`,
> `var(--ig-gray-100)`). Never pass raw hex values like `"#E3F2FD"`.

### Step 4 — Generate a Palette

For simple mid-luminance base colors:

```
Tool: create_palette
Params: {
  platform: "angular",
  primary: "#1976D2",
  secondary: "#FF9800",
  surface: "#FAFAFA",
  variant: "light"
}
```

For brand-specific exact shade values, use `create_custom_palette` with `mode: "explicit"` for full control over each shade.

### Step 5 — Adjust Layout

```
Tool: set_size     → { size: "medium" }
Tool: set_spacing  → { spacing: 0.75, component: "grid" }
Tool: set_roundness → { radiusFactor: 0.8 }
```

### Step 6 — Reference Palette Colors (MANDATORY for All Color Usage)

After a palette is generated, **always** use the `get_color` tool to obtain the correct CSS custom property reference. Never hardcode hex/RGB/HSL values in component themes, custom CSS, or Sass variables.

```
Tool: get_color
Params: { color: "primary", variant: "600" }
→ var(--ig-primary-600)

Params: { color: "primary", variant: "600", contrast: true }
→ var(--ig-primary-600-contrast)

Params: { color: "primary", opacity: 0.5 }
→ hsl(from var(--ig-primary-500) h s l / 0.5)
```

Use these token references everywhere:
- Component theme `tokens` values
- Custom CSS rules (`color`, `background`, `border-color`, `fill`, `stroke`, etc.)
- Sass variables for derived values (`$sidebar-bg: var(--ig-surface-500);`)
- Angular `host` style bindings

The **only** place raw hex values are acceptable is in the initial `palette()` call or the `create_palette` / `create_theme` MCP tool inputs that seed the color system.

### Loading Reference Data

Use `read_resource` with these URIs for preset values and documentation:

| URI | Content |
|---|---|
| `theming://presets/palettes` | Preset palette colors |
| `theming://presets/typography` | Typography presets |
| `theming://presets/elevations` | Elevation shadow presets |
| `theming://guidance/colors/usage` | Which shades for which purpose |
| `theming://guidance/colors/roles` | Semantic color roles |
| `theming://guidance/colors/rules` | Light/dark theme rules |
| `theming://platforms/angular` | Angular platform specifics |

## Referencing Colors in Custom Styles

After a theme is applied, the palette is available as CSS custom properties on `:root`. Use these tokens in all custom CSS — never introduce standalone hex/RGB variables for colors that the palette already provides.

### Correct: Palette Tokens

```scss
// All colors come from the theme — respects palette changes and dark/light switching
.sidebar {
  background: var(--ig-surface-500);
  color: var(--ig-gray-900);
  border-right: 1px solid var(--ig-gray-200);
}

.accent-badge {
  background: var(--ig-secondary-500);
  color: var(--ig-secondary-500-contrast);
}

.hero-section {
  // Semi-transparent primary overlay
  background: hsl(from var(--ig-primary-500) h s l / 0.12);
}
```

### Incorrect: Hardcoded Values

```scss
// WRONG — these break when the palette changes and ignore dark/light mode
$primary-color: #00838F;      // ✗ hardcoded
$secondary-color: #3D5AFE;    // ✗ hardcoded
$surface-color: #F0F5FA;      // ✗ hardcoded

.sidebar {
  background: $surface-color;  // ✗ not a palette token
  color: #333;                 // ✗ not a palette token
}
```

### When Raw Hex Values Are OK

Raw hex values are acceptable **only** in these contexts:

1. **`palette()` call** — the initial seed colors that generate the full palette
2. **`create_palette` / `create_theme` MCP tool inputs** — the base colors passed to the tool
3. **Non-palette decorative values** — e.g., a one-off SVG illustration color that intentionally stays fixed regardless of theme

Everything else must use `var(--ig-<family>-<shade>)` tokens.

## Common Patterns

### Switching Between Light and Dark Themes

```scss
@use 'igniteui-angular/theming' as *;

$light-palette: palette($primary: #1976D2, $secondary: #FF9800, $surface: #FAFAFA);
$dark-palette: palette($primary: #90CAF9, $secondary: #FFB74D, $surface: #121212);

@include core();
@include typography($font-family: $material-typeface, $type-scale: $material-type-scale);

// Light is default
@include theme($palette: $light-palette, $schema: $light-material-schema);

// Dark via class on <body> or <html>
.dark-theme {
  @include theme($palette: $dark-palette, $schema: $dark-material-schema);
}
```

### Scoping a Theme to a Container

```scss
.admin-panel {
  @include theme($palette: $admin-palette, $schema: $light-indigo-schema);
}
```

### Licensed Package Users

If using the licensed `@infragistics/igniteui-angular` package, set `licensed: true` on MCP tool calls and change the Sass import:

```scss
@use '@infragistics/igniteui-angular/theming' as *;
```

## Key Rules

1. **Never overwrite existing files directly** — always propose theme code as an update for user review; do not replace existing style files without confirmation
2. **Always call `detect_platform` first** when using MCP tools
3. **Always call `get_component_design_tokens` before `create_component_theme`** to discover valid token names
4. **Palette shades 50 = lightest, 900 = darkest** for all chromatic colors — never invert for dark themes (only gray inverts)
5. **Surface color must match the variant** — light color for `light`, dark color for `dark`
6. **Use `@include core()` once** before `@include theme()` in your global styles
7. **Component themes use `@include tokens($theme)`** inside a selector to emit CSS custom properties
8. **For compound components**, follow the full checklist returned by `get_component_design_tokens` — theme each child component with its scoped selector
9. **Never hardcode colors after palette generation** — once a palette is created, every color in component themes, custom CSS, and Sass variables must use `var(--ig-<family>-<shade>)` palette tokens (e.g., `var(--ig-primary-500)`, `var(--ig-gray-200)`). Raw hex/RGB/HSL values are only acceptable in the initial `palette()` seed call. This ensures themes remain consistent, switchable (light/dark), and maintainable

## Related Skills

- [`igniteui-angular-components`](../igniteui-angular-components/SKILL.md) — Form controls, application setup, architecture, and import patterns
- [`igniteui-angular-components-layout`](../igniteui-angular-components-layout/SKILL.md) — Layout, data display, feedback/overlay components, and directives
- [`igniteui-angular-grids`](../igniteui-angular-grids/SKILL.md) — Data Grid structure, column configuration, sorting, filtering, selection
- [`igniteui-angular-grids-types`](../igniteui-angular-grids-types/SKILL.md) — Tree Grid, Hierarchical Grid, Grid Lite, Pivot Grid specifics
