# Task: Create a Custom Branded Theme

You are working in an Angular 20+ project that already has `igniteui-angular` installed with Sass support enabled.

## Requirements

Create a custom Ignite UI for Angular theme with a blue primary color and orange secondary color.

1. **Theme file location**: `src/styles.scss` (or update the existing global styles file)

2. **Palette**:
   - Primary color: `#1976D2` (Material Blue)
   - Secondary color: `#FF9800` (Material Orange)
   - Surface color appropriate for a light theme

3. **Theme application**:
   - Generate a complete theme using the Ignite UI theming functions
   - Apply the theme globally

4. **Typography**: Include typography configuration with a sans-serif font family

## Constraints

- Use the Ignite UI Sass theming API (`palette()`, `theme()`) — do NOT hardcode individual CSS custom properties or use plain CSS variables to replicate the palette.
- Import from `igniteui-angular/theming` (or `@infragistics/igniteui-angular/theming` for licensed packages).
- The theme must include both `palette()` and `theme()` function calls.
- Include `core()` mixin invocation before the `theme()` mixin.
