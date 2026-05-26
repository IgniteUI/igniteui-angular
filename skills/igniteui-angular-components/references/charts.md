# Angular Charts Reference

## Contents

- [Overview](#overview)
- [General Chart Configuration](#general-chart-configuration)
- [Key Chart Features](#key-chart-features)
- [Chart Types Reference](#chart-types-reference)
- [Common API Members by Chart Type](#common-api-members-by-chart-type)
- [Import Paths](#import-paths)
- [Styling & Theming](#styling--theming)
- [Data Requirements](#data-requirements)
- [Documentation References](#documentation-references)

## Overview

Ignite UI for Angular Charts provides 65+ chart types for data visualization. Charts are packaged separately in `igniteui-angular-charts` (or `@infragistics/igniteui-angular-charts` for licensed users).
This reference gives high-level guidance on when to use each chart type, their key features, and common API members. For detailed documentation, call `get_doc` and `get_api_reference` from `igniteui-cli` with the specific chart component or feature you're interested in.

### Chart Component packages
- `igniteui-angular-charts` — Category Chart, Financial Chart, Data Chart, and Pie Chart components (NPM)
- `@infragistics/igniteui-angular-charts` — Licensed version with same API (ProGet)

### Main Chart Components

> **IMPORTANT — Not Standalone Components**: Chart components from `igniteui-angular-charts` are **NOT** Angular standalone components (they predate the standalone API). They must always be imported via their **NgModule**. Standalone Angular components (Angular 14+) can still import NgModules directly in their `imports` array — this is fully supported.

| Component | NgModule to import | Description |
|---|---|---|
| `IgxCategoryChartComponent` | `IgxCategoryChartModule` | Simplified API for area, column, line, spline, waterfall charts |
| `IgxFinancialChartComponent` | `IgxFinancialChartModule` | Stock/candlestick charts with OHLC data |
| `IgxDataChartComponent` | `IgxDataChartModule` | Advanced: explicit axes, series, >65 chart types |
| `IgxPieChartComponent` | `IgxPieChartModule` | Part-to-whole pie and donut charts |
| `IgxDataPieChartComponent` | `IgxDataPieChartModule` | Simplified API for pie charts |
| `IgxLegendComponent` | `IgxLegendModule` | Shared legend component |

### When to use each:
- **Category Chart** → Use for simple area/column/line/spline/waterfall; let framework auto-configure
- **Financial Chart** → Use for stock data with time-series OHLC, indicators, volume
- **Data Chart** → Use for advanced scenarios: multiple axes, custom series combinations, stacked/scatter
- **Pie Chart** → Use for part-to-whole (segments sum to 100%)

---

## General Chart Configuration

### Data Binding
```typescript
// Category Chart uses 'dataSource' to bind data (auto-detects numeric fields)
chartComponent.dataSource = [
  { month: 'Jan', revenue: 5000 },
  { month: 'Feb', revenue: 6500 }
];

// Data Chart: data is bound on individual series via 'itemsSource', not on the chart itself
seriesComponent.itemsSource = dataArray;
```

### Chart Type Selection
- **Category Chart**: `chartType` property — type: `CategoryChartType` (Auto, Line, Area, Column, Spline, ...)
- **Financial Chart**: `chartType` property — type: `FinancialChartType` (Auto, Bar, Candle, ...)
- **Data Chart**: Configure explicit series (IgxAreaSeriesComponent, IgxBarSeriesComponent, IgxColumnSeriesComponent, etc.)
- **Pie Chart**: No chartType needed; inherent pie structure

### Required Properties

**IgxCategoryChartComponent** (simplest API; auto-detects numeric & string columns):
- `dataSource` — Data array (required)
- `chartType` — type: `CategoryChartType`
- Component auto-detects: first string column → X-axis labels, numeric columns → Y-axis data

**IgxDataChartComponent** (advanced; requires explicit configuration):
- Data is bound on individual series via `itemsSource`, not on the chart itself
- `valueMemberPath` — Set on the series, not the chart
- Requires explicit axis and series components

**IgxFinancialChartComponent** (stock data):
- `dataSource` — Data array with date + OHLC columns (chart auto-detects columns)
- `chartType` — type: `FinancialChartType`

**IgxPieChartComponent**:
- `dataSource` — Data array
- `labelMemberPath` — Field with category labels
- `valueMemberPath` — Field with numeric values

### Responsive & Sizing
- Charts auto-resize with container
- Set height/width on chart container (div, flexbox parent)
- Use CSS for responsive behavior

---

## Key Chart Features

### Axis Configuration
- **X-Axis**: Category (string/date) or Numeric (scatter/financial)
- **Y-Axis**: Always numeric
- Properties: `xAxisTitle`, `yAxisTitle`, `xAxisInterval`, `yAxisMinimumValue`, `yAxisMaximumValue`
- Gridlines: `xAxisMajorStroke`, `yAxisMajorStroke`, gridline styling

### Tooltips
- **Default tooltips**: Auto-enabled; style with `toolTipType`: `ToolTipType` (Default, Item, Category, None)
- **Custom tooltips**: `tooltipTemplate` for custom content

### Markers & Data Points
- Control marker visibility and style via `markerTypes`, `markerBrushes`, `markerOutlines`
- Properties: `markerThickness`, `markerMaxCount`, `markerFillMode`, `markerOutlineMode`
- `markerTypes` accepts `MarkerType` values

### Animations
- Enable with `transitionInMode` — type: `CategoryTransitionInMode` (Auto, FromZero, SweepFromLeft, ...)
- Control initial load speed via `transitionInDuration` (milliseconds)
- Control data-change animation speed via `transitionDuration` (milliseconds)
- `transitionInSpeedType` — type: `TransitionInSpeedType`

### Highlighting & Selection
- **Highlighting**: Mouse hover effect; `highlightingMode`: `SeriesHighlightingMode` (None, Brighten, FadeOthers, ...), `highlightingBehavior`: `SeriesHighlightingBehavior`
- **Selection**: Click to select data points/series; `selectionMode`: `SeriesSelectionMode`, `selectionBehavior`: `SeriesSelectionBehavior`

### Zooming & Panning
- Mouse wheel to zoom; drag to pan
- Properties: `isHorizontalZoomEnabled`, `isVerticalZoomEnabled`
- Keyboard support: Arrow keys, +/- for zoom

### Trendlines
- Property: `trendLineType`: `TrendLineType` (Category/Financial charts)

### Legend
- Display with `legend` property (assign `IgxLegendComponent`)
- `legendItemTemplate` for custom legend items
- Properties: `legendItemVisibility`, `legendHighlightingMode`, `legendItemBadgeShape`
- `legendOrientation` is set on the `IgxLegendComponent` itself, not on the chart

### Annotations
- **Crosshairs**: `crosshairsDisplayMode`: `CrosshairsDisplayMode`
- **Final Value Layer**: `finalValueAnnotationsVisible` — show ending values on axis
- **Callout Layer**: `calloutsVisible` — custom callouts at specific values
- **Range Annotations**: Highlight data ranges

---

## Chart Types Reference

### Area Chart (`IgxCategoryChartComponent`, `chartType: 'Area'`)
- **Use**: Trends over time, cumulative part-to-whole
- **Data**: X-axis categories, Y-axis numeric values
- **Variants**: Area, StepArea, Stacked Area, Stacked 100% Area
- **API**: `chartType`, `dataSource` (auto-detects numeric columns)
- **Best Practices**:
  - Start Y-axis at 0 for accuracy
  - Use transparent colors for overlaid series
  - Order time-series left to right
- **Avoid**: More than 7-10 series (readability), when data values are similar (overlap)

### Bar Chart (`IgxDataChartComponent`, `IgxBarSeriesComponent`)
- **Use**: Compare categories, show rankings, time-series changes
- **Data**: X-axis numeric, Y-axis categories (reversed from Column)
- **Variants**: Grouped Bar, Stacked Bar, Stacked 100% Bar, Polar Bar
- **API**: `IgxBarSeriesComponent`, `valueMemberPath`, `valueAxis`, `categoryAxis`
- **Best Practices**:
  - Start numeric axis at 0
  - Sort categories by value (ascending/descending)
  - Right-align Y-axis labels
- **Avoid**: Too much data (axis becomes illegible), Time-series detail (use Line instead)

### Column Chart (`IgxCategoryChartComponent`, `chartType: 'Column'`)
- **Use**: Compare categories, show distribution, time-series changes
- **Data**: X-axis categories, Y-axis numeric values
- **Variants**: Column, StackedColumn, Stacked100%Column, RangeColumn, WaterfallColumn
- **API**: `chartType`, `dataSource` (auto-detects numeric columns)
- **Best Practices**:
  - Start Y-axis at 0
  - Order time-series left to right
- **Avoid**: Many series (>10) side-by-side (readability)
- **Related**: Bar Chart (same but horizontal), Waterfall (show differences between values)

### Stock Chart (`IgxFinancialChartComponent`)
- **Use**: Financial/OHLC data analysis, candlestick visualization, technical indicators
- **Data Structure**:
  - **Required**: Date/time column, numeric value column(s)
  - **For Candlestick**: Open, High, Low, Close (4 numeric columns)
  - **With Volume**: Open, High, Low, Close, Volume (5 numeric columns)
- **Display Modes**:
  - **Price Pane**: Show candlestick, OHLC bar, line (configurable via `chartType`)
  - **Volume Pane**: Show trading volume (column, line, or area chart)
  - **Indicator Pane**: Financial indicators (RSI, MACD, Bollinger Bands, etc.)
  - **Zoom Pane**: Navigation slider to zoom/pan
- **API**:
  - `chartType`: `FinancialChartType`
  - `volumeType`: `FinancialChartVolumeType`
  - `indicatorTypes`: `FinancialIndicatorType[]`
  - `zoomSliderType`: `FinancialChartZoomSliderType`
- **Indicators**: RSI, MACD, Bollinger Bands, Force Index, Standard Deviation, and more
- **Features**:
  - Crosshairs with value snapshots
  - Trendlines and overlays
  - Time-based filters (users can select 1M, 3M, 6M, YTD, 1Y, ALL)
- **Data Binding**: 
  - The Financial Chart auto-detects OHLC, Volume, and Date columns from the data source
  - Data items should have properties named like `open`, `high`, `low`, `close`, `volume`, `date` (or similar)
  - No explicit member path properties are needed on the chart component

### Pie Chart (`IgxPieChartComponent` or `IgxDataPieChartComponent`)
- **Use**: Part-to-whole visualization (segments sum to 100%)
- **Data**: Category labels, numeric values
- **Variants**: Pie, Donut (ring), Radial Pie
- **API**:
  - `labelMemberPath` — Data property for slice labels
  - `valueMemberPath` — Data property for numeric values
  - `legend` — Assign IgxLegendComponent for legend display
  - `selectionMode`: `SliceSelectionMode`
  - `othersCategoryThreshold` — Combine small slices into "Others"
  - `othersCategoryType`: `OthersCategoryType`
  - `allowSliceExplosion` — Enable click to expand slice
  - `allowSliceSelection` — Enable click selection highlighting
- **Features**:
  - Slice explosion (separate a slice from pie)
  - Slice selection (single or multiple)
  - Legends with custom item templates
  - Animation on load
  - "Others" category for small segments
- **Best Practices**:
  - Use for small data sets (6-8 segments max)
  - Arrange largest to smallest (clockwise from 12 o'clock)
  - Ensure segments sum to 100%
  - Use distinguishable colors
- **Avoid**: Many segments (>8), change over time (use Bar/Line instead), precise comparisons (Bar is better)

---

## Common API Members by Chart Type

### IgxCategoryChartComponent (Area, Column, Line, etc.)
```typescript
// Required
dataSource: any[];           // Data array (auto-detects numeric fields)
chartType: CategoryChartType;

// Common optional inputs
xAxisTitle: string;          // X-axis label
yAxisTitle: string;          // Y-axis label
xAxisLabelLocation: XAxisLabelLocation;
yAxisLabelLocation: YAxisLabelLocation;
yAxisMinimumValue: number;   // Y-axis minimum
yAxisMaximumValue: number;   // Y-axis maximum
brushes: string[];           // Series colors (fill)
outlines: string[];          // Series colors (outline)
markerTypes: MarkerType[];
markerBrushes: string[];     // Marker fill colors
markerOutlines: string[];    // Marker outline colors
toolTipType: ToolTipType;
highlightingMode: SeriesHighlightingMode;
highlightingBehavior: SeriesHighlightingBehavior;
trendLineType: TrendLineType;
transitionInMode: CategoryTransitionInMode;
transitionInDuration: number;           // Initial load animation duration (milliseconds)
```

### IgxFinancialChartComponent (Stock/Candlestick/OHLC)
```typescript
chartType: FinancialChartType;
dataSource: any[];             // Data array (auto-detects OHLC and date columns)
volumeType: FinancialChartVolumeType;
indicatorTypes: FinancialIndicatorType[];
zoomSliderType: FinancialChartZoomSliderType;
xAxisTitle: string;
yAxisTitle: string;
xAxisMode: FinancialChartXAxisMode;
yAxisMode: FinancialChartYAxisMode;
toolTipType: ToolTipType;
isHorizontalZoomEnabled: boolean;
isVerticalZoomEnabled: boolean;
crosshairsDisplayMode: CrosshairsDisplayMode;
trendLineType: TrendLineType;
isToolbarVisible: boolean;
isLegendVisible: boolean;
```

### IgxPieChartComponent / IgxDataPieChartComponent
```typescript
dataSource: any[];
labelMemberPath: string;
valueMemberPath: string;
legend: IgxLegendComponent;
legendLabelMemberPath: string;
legendItemTemplate: IgDataTemplate;
legendItemBadgeTemplate: IgDataTemplate;
selectionMode: SliceSelectionMode;
allowSliceExplosion: boolean;
allowSliceSelection: boolean;
othersCategoryThreshold: number;
othersCategoryType: OthersCategoryType;
startAngle: number;
radiusFactor: number;
innerExtent: number;          // 0 for pie, >0 for donut (ring)
sweepDirection: SweepDirection;
```

---

## Import Paths

> **Chart components are NOT standalone** — always import via their NgModule, never by component class. Standalone Angular components can import NgModules directly in their `imports` array.

### NgModule imports (required for all project types)

```typescript
// NgModules — import these into your standalone component's 'imports' array
// or into an NgModule's 'imports' array
import {
  IgxCategoryChartModule,    // provides IgxCategoryChartComponent
  IgxFinancialChartModule,   // provides IgxFinancialChartComponent
  IgxPieChartModule,         // provides IgxPieChartComponent
  IgxDataPieChartModule,     // provides IgxDataPieChartComponent
  IgxLegendModule,           // provides IgxLegendComponent
} from 'igniteui-angular-charts';

// Enums and types — these ARE plain TS exports and can be imported directly
import {
  CategoryChartType,
  CategoryTransitionInMode,
  FinancialChartType,
  FinancialChartVolumeType,
  FinancialChartXAxisMode,
  FinancialChartYAxisMode,
  FinancialChartZoomSliderType,
  FinancialIndicatorType,
  MarkerType,
  ToolTipType,
  TrendLineType,
  SeriesHighlightingMode,
  SeriesHighlightingBehavior,
  TransitionInSpeedType,
  CrosshairsDisplayMode,
  SliceSelectionMode,
  SeriesSelectionMode,
  OthersCategoryType,
  IndicatorDisplayType,
  XAxisLabelLocation,
  YAxisLabelLocation,
  LegendOrientation,
  AxisOrientation
} from 'igniteui-angular-charts';
```

### Standalone component example

```typescript
import { Component } from '@angular/core';
import {
  IgxCategoryChartModule,
  CategoryChartType
} from 'igniteui-angular-charts';

@Component({
  selector: 'app-sales-chart',
  imports: [
    IgxCategoryChartModule  // ✅ Import the NgModule, NOT IgxCategoryChartComponent
  ],
  template: `
    <igx-category-chart
      [dataSource]="data"
      chartType="Column"
      xAxisTitle="Month"
      yAxisTitle="Revenue ($)"
      [transitionInMode]="'FromZero'"
      [transitionInDuration]="400">
    </igx-category-chart>
  `
})
export class SalesChartComponent {
  data = [
    { month: 'Jan', revenue: 5000 },
    { month: 'Feb', revenue: 6500 },
    { month: 'Mar', revenue: 7200 }
  ];
}
```

### Common errors and fixes

**Error 1: NG2011 — component not standalone**
```
// ❌ WRONG: importing component directly
import { IgxCategoryChartComponent } from 'igniteui-angular-charts';
@Component({ imports: [IgxCategoryChartComponent] })

// ✅ CORRECT: import the NgModule instead
import { IgxCategoryChartModule } from 'igniteui-angular-charts';
@Component({ imports: [IgxCategoryChartModule] })
```

**Error 2: NG8002 — can't bind to property (incorrect inputs)**
```
// ❌ WRONG: using IgxDataChartComponent or generic property names
<igx-category-chart
  [itemsSource]="data"         <!-- Use 'dataSource' instead -->
  [valueMemberPath]="'value'"  <!-- Auto-detected for Category Chart -->
  [showDefaultTooltip]="true"  <!-- Not a valid input -->
  [transitionDuration]="400">  <!-- Use 'transitionInDuration' -->

// ✅ CORRECT: use Category Chart's actual inputs
<igx-category-chart
  [dataSource]="data"
  chartType="Column"
  [transitionInMode]="'FromZero'"
  [transitionInDuration]="400">
```

**Key difference**: IgxCategoryChartComponent **auto-detects** numeric columns and requires minimal configuration. For fine-grained control over field mapping and series types, use `IgxDataChartComponent` instead (but it requires explicit series and axis components).

---

## Styling & Theming

### Color Customization
- **Series colors**: `brushes` (fill), `outlines` (border)
- **Marker colors**: `markerBrushes`, `markerOutlines`
- **Axis styles**: `xAxisMajorStroke`, `yAxisMajorStroke`, `xAxisLabelTextColor`, `yAxisLabelTextColor`
- **Tooltip**: Controlled via `toolTipType` and custom tooltip templates
- **Highlight**: `highlightingFadeOpacity` (opacity for faded non-highlighted series)

### CSS & Host Binding
- Chart containers inherit CSS flex/grid properties
- Use host element width/height for responsive sizing
- Theme colors via `IgxTheme` palette

---

## Data Requirements

### Category Chart (Area, Bar, Column, Line)
- Array or list of data items
- At least 1 numeric column (values)
- Optionally 1 string/date column (labels)
- Example: `[{ month: 'Jan', value: 100 }, { month: 'Feb', value: 150 }]`

### Financial Chart (Stock)
- Array of data items with date/time column
- For Candlestick: 4 numeric columns (O, H, L, C)
- For Volume: 5 numeric columns (O, H, L, C, Volume)
- Example: `[{ date: '2024-01-01', open: 100, high: 120, low: 95, close: 115, volume: 1000 }]`

### Pie Chart
- Array of data items
- 1 label column (category)
- 1 numeric column (value; segments should sum to 100%)
- Example: `[{ label: 'Category A', value: 30 }, { label: 'Category B', value: 70 }]`

---

## Documentation References

- **Chart Overview**: https://www.infragistics.com/products/ignite-ui-angular/angular/components/charts/chart-overview
- **Chart API**: https://www.infragistics.com/products/ignite-ui-angular/angular/components/charts/chart-api
- **Chart Features**: https://www.infragistics.com/products/ignite-ui-angular/angular/components/charts/chart-features
- **Area Chart**: https://www.infragistics.com/products/ignite-ui-angular/angular/components/charts/types/area-chart
- **Bar Chart**: https://www.infragistics.com/products/ignite-ui-angular/angular/components/charts/types/bar-chart
- **Column Chart**: https://www.infragistics.com/products/ignite-ui-angular/angular/components/charts/types/column-chart
- **Stock Chart**: https://www.infragistics.com/products/ignite-ui-angular/angular/components/charts/types/stock-chart
- **Pie Chart**: https://www.infragistics.com/products/ignite-ui-angular/angular/components/charts/types/pie-chart
