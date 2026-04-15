# Ignite UI Angular Gotchas & Pitfalls

## Table of Contents
- [Sass Conflicts](#sass-conflicts)
- [Chart Properties](#chart-properties)
- [Component Properties](#component-properties)
- [Theming Pitfalls](#theming-pitfalls)
- [Map Component](#map-component)
- [Dark Theme Specifics](#dark-theme-specifics)

## Sass Conflicts

### `contrast()` function collision
The CSS `contrast()` filter function collides with `igniteui-theming`'s `contrast()` Sass function. Workaround:
```scss
// BAD - Sass intercepts this
filter: contrast(1.2);

// GOOD - escape to CSS
filter: #{unquote("contrast(1.2)")};
```

### Font family in typography mixin
Comma-separated font families are parsed as multiple Sass arguments. Wrap in parentheses:
```scss
// BAD
@include typography($font-family: "Titillium Web", "Segoe UI", sans-serif);

// GOOD
@include typography($font-family: ("Titillium Web", "Segoe UI", sans-serif));
```

## Chart Properties

### Markers shown by default
Category charts show markers at every data point by default. Hide them:
```html
[markerTypes]="'none'"
```

### `plotAreaBackground` does NOT exist on `igx-category-chart`
Use CSS to style the chart container background instead.

### `areaFillOpacity` exists on `IgxCategoryChartComponent` (via domain chart parent)
It does NOT exist on `IgxSparklineComponent`.

### Smooth area charts
For smooth-looking area charts like dense dashboards:
- Use 300-500+ data points
- Use exponential smoothing in data generation: `prev = prev * 0.95 + target * 0.05`
- Set `[markerTypes]="'none'"` to hide dots
- Set `[areaFillOpacity]` between 0.3-0.5
- Use `[xAxisInterval]` to reduce label density

## Component Properties

### `roundShape` does NOT exist on `IgxAvatarComponent`
Use `shape="circle"` alone. Do not add `[roundShape]="true"`.

### `IgxListLineDirective` is the directive for `igxListLine`
Must be imported for list item text content:
```typescript
import { IgxListLineDirective } from '@infragistics/igniteui-angular';
```

### Avatar background color via CSS variable
```html
<igx-avatar [style.--ig-avatar-background]="color"></igx-avatar>
```

## Theming Pitfalls

### DV components do NOT inherit Sass theme colors
Charts, maps, gauges, and sparklines ignore the global Sass dark theme. Set all visual properties explicitly via component inputs:
```html
[brushes]="'rgba(0, 188, 212, 0.6)'"
[outlines]="'#00bcd4'"
[xAxisLabelTextColor]="'#8892a4'"
[yAxisMajorStroke]="'rgba(0, 188, 212, 0.08)'"
```

### Component theme functions
Use the component-specific theme functions for core UI:
```scss
$custom-navbar: navbar-theme($background: #0d1b33);
$custom-drawer: navdrawer-theme($background: #0d1b33);
$custom-list: list-theme($background: transparent);
```
Apply with the corresponding mixin inside `::ng-deep`:
```scss
:host ::ng-deep igx-navbar {
  @include navbar($custom-navbar);
}
```

### Nav drawer width
Override the drawer aside width via its internal class:
```scss
:host ::ng-deep igx-nav-drawer {
  .igx-nav-drawer__aside {
    width: 200px;
  }
}
```

## Map Component

### Adding markers programmatically
The geographic map requires programmatic series setup in `ngAfterViewInit`:
```typescript
const symbolSeries = new IgxGeographicSymbolSeriesComponent();
symbolSeries.dataSource = locations;
symbolSeries.latitudeMemberPath = 'lat';
symbolSeries.longitudeMemberPath = 'lon';
symbolSeries.markerType = MarkerType.Circle;
symbolSeries.markerBrush = '#00bcd4';
symbolSeries.markerOutline = '#00bcd4';
map.series.add(symbolSeries);
map.zoomToGeographic({ left: -130, top: -50, width: 310, height: 130 });
```

### Dark map styling
OpenStreetMap tiles are light by default. For dark themes, apply a CSS filter to the container:
```scss
.map-container {
  filter: grayscale(0.6) brightness(0.7);
}
```

## Dark Theme Specifics

### Use `$dark-material-schema` for dark themes
```scss
@include theme(
  $palette: $my-palette,
  $schema: $dark-material-schema
);
```

### CSS custom properties for cyberpunk/dark panels
Define reusable panel tokens:
```scss
:root {
  --panel-bg: rgba(13, 27, 51, 0.85);
  --panel-border: rgba(0, 188, 212, 0.15);
  --accent: #00bcd4;
  --text: #e0e6ed;
  --text-muted: #8892a4;
}
```

### Glow border effect
```scss
.panel::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--accent-dim), transparent);
}
```
