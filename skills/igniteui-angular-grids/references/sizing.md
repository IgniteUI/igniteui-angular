# Grid Sizing — Width, Height, Column Sizing & Spacing

> **Part of the [`igniteui-angular-grids`](../SKILL.md) skill hub.**
> For grid setup, column config, sorting, filtering, selection — see [`structure.md`](./structure.md).
> For virtualization and performance — see [`features.md`](./features.md).

## Contents

- [Overview](#overview)
- [Grid Width](#grid-width)
- [Grid Height](#grid-height)
- [Column Sizing](#column-sizing)
- [Grid Cell Spacing Control](#grid-cell-spacing-control)
- [Key Rules](#key-rules)

## Overview

The grid uses **border-box sizing** — border and padding are included in the width/height calculations. Do **not** override `box-sizing` on the grid element; doing so will break size calculations.

The grid supports both component inputs (`width`/`height`) and regular CSS/layout sizing from the host or wrapping container (including flex/grid layouts). Use the inputs when you need explicit fixed or percentage grid sizing.

## Grid Width

> **Docs:** [Grid Sizing — Width](https://www.infragistics.com/products/ignite-ui-angular/angular/components/grid/sizing#width)

**Default:** `100%` — the grid fills available width of the parent/window.

### Pixel Width

```html
<igx-grid width="1200px" ...></igx-grid>
```

- Grid is fixed at the specified size and does not react to browser/DOM resizing.
- A horizontal scrollbar appears inside the grid when the combined column widths exceed the grid `width`.
- If a parent element is narrower than the grid and has `overflow: auto | scroll`, the parent scrolls — the grid itself remains at its specified width.

### Percentage Width

```html
<igx-grid width="100%" ...></igx-grid>
```

- Grid sizes relative to its parent element (or the browser window if there is no parent with explicit width).
- Resizes responsively when the browser or parent is resized.
- Setting `width` above `100%` (e.g. `150%`) makes the grid wider than the parent; the parent renders a scrollbar only if it has `overflow: auto | scroll`.

## Grid Height

> **Docs:** [Grid Sizing — Height](https://www.infragistics.com/products/ignite-ui-angular/angular/components/grid/sizing#height)

**Default:** `100%` — see the Percentage Height section for how this behaves depending on the DOM structure.

### `null` Height

```html
<igx-grid [height]="null" ...></igx-grid>
```

- All rows are rendered — **row virtualization is disabled**.
- Grid height expands to show every row with no vertical scrollbar inside the grid.
- If rows overflow the viewport, the browser renders a native scrollbar.
- A parent element with `overflow: auto | scroll` will scroll while the grid itself remains unshrunk.
- **Warning:** large data sets with `null` height can significantly impact browser performance due to no virtualization.

### Pixel Height

```html
<igx-grid height="500px" ...></igx-grid>
```

- Grid is fixed at the specified height.
- A vertical scrollbar appears when rows exceed the visible area.
- If the grid is taller than a parent with `overflow: auto | scroll`, the parent scrolls.

### Percentage Height

```html
<igx-grid height="100%" ...></igx-grid>
```

- Grid sizes relative to the **parent element's height**.
- **Parent has explicit height** (px or %): grid sizes to that percentage of the parent's height.
- **Parent has NO explicit height**: the browser cannot resolve a percentage, so the grid falls back to rendering a maximum of **10 rows** with a vertical scrollbar if there are more rows, or fits all rows if there are fewer.
- To fill the entire browser window: set both `body` and the parent container `height: 100%`, then use `height="100%"` on the grid.

```css
/* Full-window grid */
html, body, .grid-container {
  height: 100%;
}
```

```html
<div class="grid-container">
  <igx-grid height="100%" ...></igx-grid>
</div>
```

## Column Sizing

> **Docs:** [Grid Sizing — Column Sizing](https://www.infragistics.com/products/ignite-ui-angular/angular/components/grid/sizing#column-sizing)

### Default (no `width` set — auto-sized)

- Auto-sized columns share the available grid width equally.
- Minimum column width is **`136px`**; if the equal share is less than `136px`, all auto-sized columns default to `136px` and the grid renders a horizontal scrollbar.
- Feature columns (row selector checkbox, etc.) consume space that reduces what is available for auto-sized columns.

```html
<!-- No width on these columns — they auto-fill available space -->
<igx-column field="name" header="Name"></igx-column>
<igx-column field="email" header="Email"></igx-column>
```

### Pixel Width

```html
<igx-column field="name" width="200px"></igx-column>
```

- Column is fixed at the specified width regardless of grid size.
- If the combined column widths are less than the grid width, empty space appears on the right — this is expected.
- If the combined column widths exceed the grid width, a horizontal scrollbar is rendered.

### `auto` Width

```html
<igx-column field="description" width="auto"></igx-column>
```

- Column sizes to fit the longest visible cell value.
- May leave empty space if most values are short but one is very long.

### Percentage Width

```html
<igx-column field="name" width="20%"></igx-column>
```

- Column width is calculated as a percentage of the grid width.
- Responsive — resizes when the grid resizes.
- Combined percentages less than `100%` leave an empty area; greater than `100%` triggers a horizontal scrollbar.

## Grid Cell Spacing Control

> **Docs:** [Grid Sizing — Cell Spacing](https://www.infragistics.com/products/ignite-ui-angular/angular/components/grid/sizing#grid-cell-spacing-control)

The grid automatically adapts internal cell spacing based on the `size` (display density) setting. Fine-grained control is available through CSS custom properties.

### Global Spacing (all grids in the app)

```css
igx-grid {
    --ig-spacing: 0.8; /* multiplier — reduces all grid spacing by 20% */
}
```

### Instance-Specific Spacing

```css
.my-compact-grid {
    --ig-spacing: 0.6;
}
```

### Directional Spacing (horizontal vs vertical independently)

```css
.my-grid {
    --ig-spacing-inline: 0.5;  /* horizontal padding */
    --ig-spacing-block: 1.0;   /* vertical padding */
}
```

### Density-Level Spacing

```css
.my-grid {
    --ig-spacing-small:  0.5;  /* compact density */
    --ig-spacing-medium: 1.0;  /* medium density */
    --ig-spacing-large:  1.3;  /* comfortable density */
}
```

### Header vs Body Cell Spacing

```css
.my-grid igx-grid-header {
    --ig-spacing: 0.7;
}

.my-grid igx-grid-cell {
    --ig-spacing: 0.9;
}
```

## Key Rules

- Grid sizing can come from CSS/layout context (host/container sizing) or from `[width]`/`[height]` inputs.
- **Never** override `box-sizing` on the grid — it uses border-box and relies on this.
- Use `null` for height only when the data set is small; row virtualization is disabled and large data will hurt performance.
- When using percentage height, the parent **must** have an explicit height for the percentage to resolve correctly. Without it, the grid falls back to 10 visible rows.
- A mix of fixed-width and auto-sized columns is valid — auto-sized columns fill the remaining space after fixed-width columns are laid out.
