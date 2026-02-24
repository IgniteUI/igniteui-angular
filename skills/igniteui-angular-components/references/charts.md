# Angular Charts Reference

## Overview

Ignite UI for Angular Charts provides 65+ chart types for data visualization. Charts are packaged separately in `igniteui-angular-charts` (or `@infragistics/igniteui-angular-charts` for licensed users).

### Chart Component packages
- `igniteui-angular-charts` — Category Chart, Financial Chart, Data Chart, and Pie Chart components (NPM)
- `@infragistics/igniteui-angular-charts` — Licensed version with same API (ProGet)

### Main Chart Components

> **IMPORTANT — Not Standalone Components**: Chart components from `igniteui-angular-charts` are **NOT** Angular standalone components (they predate the standalone API). They must always be imported via their **NgModule**. Standalone Angular components (Angular 14+) can still import NgModules directly in their `imports` array — this is fully supported.

| Component | NgModule to import | Description |
|---|---|---|
| `IgxCategoryChartComponent` | `IgxCategoryChartModule` | Simplified API for area, bar, column charts |
| `IgxFinancialChartComponent` | `IgxFinancialChartModule` | Stock/candlestick charts with OHLC data |
| `IgxDataChartComponent` | `IgxDataChartModule` | Advanced: explicit axes, series, >65 chart types |
| `IgxPieChartComponent` | `IgxPieChartModule` | Part-to-whole pie and donut charts |
| `IgxDataPieChartComponent` | `IgxDataPieChartModule` | Simplified API for pie charts |
| `IgxLegendComponent` | `IgxLegendModule` | Shared legend component |

### When to use each:
- **Category Chart** → Use for simple area/bar/column; let framework auto-configure
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

// Data Chart uses 'itemsSource' and explicit series configuration
chartComponent.itemsSource = dataArray;
```

### Chart Type Selection
- **Category Chart**: `chartType` property (Area, Bar, Column, Line, etc.)
- **Financial Chart**: `chartType` property (Line, Candlestick, OHLC Bar)
- **Data Chart**: Configure explicit series (IgxAreaSeriesComponent, IgxBarSeriesComponent, etc.)
- **Pie Chart**: No chartType needed; inherent pie structure

### Required Properties

**IgxCategoryChartComponent** (simplest API; auto-detects numeric & string columns):
- `dataSource` — Data array (required)
- `chartType` — Chart type (Area, Bar, Column, Line, etc.)
- Component auto-detects: first string column → X-axis labels, numeric columns → Y-axis data

**IgxDataChartComponent** (advanced; requires explicit configuration):
- `itemsSource` — Data array (required)
- `valueMemberPath` — Which property contains numeric values (for series)
- Requires explicit axis and series components

**IgxFinancialChartComponent** (stock data):
- `dataSource` — Data array with date + OHLC columns
- `openMemberPath`, `highMemberPath`, `lowMemberPath`, `closeMemberPath` — OHLC field names

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
- **Default tooltips**: Auto-enabled; style with `toolTipType` (Category, Item, etc.)
- **Custom tooltips**: `tooltipTemplate` directive for custom content
- Properties: `showDefaultTooltip`, `toolTipBrush` (color)

### Markers & Data Points
- Control marker visibility and style via `markerTypes`, `markerBrushes`, `markerOutlines`
- Properties: `markerSize`, `markerShape` (Circle, Square, Triangle, etc.)
- Use marker templates for custom marker appearance

### Animations
- Enable with `transitionInMode` (Auto, None, FromZero, FromSeries, etc.)
- Control speed via `transitionDuration` (milliseconds)
- Works on initial load and data updates

### Highlighting & Selection
- **Highlighting**: Mouse hover effect; set `highlightingMode`, `highlightingBehavior`
- **Selection**: Click to select data points/series; properties vary by chart type

### Zooming & Panning
- Mouse wheel to zoom; drag to pan
- Properties: `isHorizontalZoomEnabled`, `isVerticalZoomEnabled`
- Keyboard support: Arrow keys, +/- for zoom

### Trendlines
- Visualize data trends with trendline types (Linear, Logarithmic, Exponential, etc.)
- Property: `trendLineType` (Category/Financial charts)

### Legend
- Display with `legend` property (assign `IgxLegendComponent`)
- `legendItemTemplate` for custom legend items
- Properties: `showLegend`, `legendOrientation`, `legendPosition`

### Annotations
- **Crosshairs**: `crosshairsDisplayMode` (None, Vertical, Horizontal, Both)
- **Final Value Layer**: Show ending values on axis
- **Callout Layer**: Custom callouts at specific values
- **Range Annotations**: Highlight data ranges

---

## Chart Types Reference

### Area Chart (`IgxCategoryChartComponent`, `chartType: 'Area'`)
- **Use**: Trends over time, cumulative part-to-whole
- **Data**: X-axis categories, Y-axis numeric values
- **Variants**: Area, StepArea, Stacked Area, Stacked 100% Area
- **API**: `chartType`, `valueMemberPath`, `categoryXAxis`
- **Best Practices**:
  - Start Y-axis at 0 for accuracy
  - Use transparent colors for overlaid series
  - Order time-series left to right
- **Avoid**: More than 7-10 series (readability), when data values are similar (overlap)

### Bar Chart (`IgxDataChartComponent`, `IgxBarSeriesComponent`)
- **Use**: Compare categories, show rankings, time-series changes
- **Data**: X-axis numeric, Y-axis categories (reversed from Column)
- **Variants**: Grouped Bar, Stacked Bar, Stacked 100% Bar, Polar Bar
- **API**: `IgxBarSeriesComponent`, `valueMemberPath`, `argumentMemberPath`
- **Best Practices**:
  - Start numeric axis at 0
  - Sort categories by value (ascending/descending)
  - Right-align Y-axis labels
- **Avoid**: Too much data (axis becomes illegible), Time-series detail (use Line instead)

### Column Chart (`IgxCategoryChartComponent`, `chartType: 'Column'`)
- **Use**: Compare categories, show distribution, time-series changes
- **Data**: X-axis categories, Y-axis numeric values
- **Variants**: Column, StackedColumn, Stacked100%Column, RangeColumn, WaterfallColumn
- **API**: `chartType`, `valueMemberPath`, `categoryXAxis`
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
- **Chart Types**: `Line`, `Candlestick` (default), `OHLC Bar`, `Column`
- **API**:
  - `chartType` — Price display type (Line, Candlestick, OHLC, Column — default Auto)
  - `volumeType` — Volume display (None, Column, Line, Area)
  - `indicatorTypes` — Array of indicators (0 or more)
  - `zoomSliderType` — Zoom pane display (defaults to match chartType)
- **Indicators**: RSI, MACD, Bollinger Bands, Force Index, Standard Deviation, and more
- **Features**:
  - Crosshairs with value snapshots
  - Trendlines and overlays
  - Time-based filters (users can select 1M, 3M, 6M, YTD, 1Y, ALL)
- **Data Binding**: 
  - `openMemberPath`, `highMemberPath`, `lowMemberPath`, `closeMemberPath`, `volumeMemberPath`
  - `dateMemberPath` — Date/time column

### Pie Chart (`IgxPieChartComponent` or `IgxDataPieChartComponent`)
- **Use**: Part-to-whole visualization (segments sum to 100%)
- **Data**: Category labels, numeric values
- **Variants**: Pie, Donut (ring), Radial Pie
- **API**:
  - `labelMemberPath` — Data property for slice labels
  - `valueMemberPath` — Data property for numeric values
  - `legend` — Assign IgxLegendComponent for legend display
  - `selectionMode` — Single, Multiple, Manual (default Single)
  - `othersCategoryThreshold` — Combine small slices into "Others"
  - `othersCategoryType` — Threshold as Number or Percent
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

### IgxCategoryChartComponent (Area, Bar, Column, Line, etc.)
```typescript
// Required
dataSource: any[];           // Data array (auto-detects numeric fields)
chartType: ChartType;        // Area, Bar, Column, Line, Waterfall, etc.

// Common optional inputs
xAxisTitle: string;          // X-axis label
yAxisTitle: string;          // Y-axis label
xAxisLabelLocation: AxisLabelLocation;  // Axis label alignment
yAxisLabelLocation: AxisLabelLocation;
yAxisMinimumValue: number;   // Y-axis minimum
yAxisMaximumValue: number;   // Y-axis maximum
brushes: string[];           // Series colors (fill)
outlines: string[];          // Series colors (outline)
markerTypes: MarkerType[];   // Marker shapes (Circle, Square, etc.)
markerBrushes: string[];     // Marker fill colors
markerOutlines: string[];    // Marker outline colors
toolTipType: ToolTipType;    // Tooltip display mode
highlightingMode: HighlightingMode;     // Hover highlight behavior
highlightingBehavior: HighlightingBehavior;
trendLineType: TrendLineType;           // Trendline visualization
transitionInMode: TransitionInMode;     // Animation on load
transitionInDuration: number;           // Animation duration (milliseconds)
```

### IgxFinancialChartComponent (Stock/Candlestick/OHLC)
```typescript
chartType: FinancialChartType; // Line, Candlestick, OHLC, Column
itemsSource: any[];
openMemberPath: string;
highMemberPath: string;
lowMemberPath: string;
closeMemberPath: string;
volumeMemberPath: string;
dateMemberPath: string;
volumeType: VolumeType; // None, Column, Line, Area
indicatorTypes: IndicatorType[]; // RSI, MACD, etc.
zoomSliderType: FinancialChartType; // Should match chartType
xAxisTitle: string;
yAxisTitle: string;
xAxisMode: AxisMode; // OrdinalTimeX, DateTimeX
yAxisMode: AxisMode;
showDefaultTooltip: boolean;
isHorizontalZoomEnabled: boolean;
isVerticalZoomEnabled: boolean;
crosshairsDisplayMode: CrosshairsDisplayMode;
trendLineType: TrendLineType;
```

### IgxPieChartComponent / IgxDataPieChartComponent
```typescript
itemsSource: any[];
labelMemberPath: string;
valueMemberPath: string;
legend: IgxLegendComponent;
legendLabelMemberPath: string;
legendItemTemplate: TemplateRef;
legendItemBadgeTemplate: TemplateRef;
selectionMode: SelectionMode; // Single, Multiple, Manual
selectionBehavior: SelectionBehavior;
allowSliceExplosion: boolean;
allowSliceSelection: boolean;
othersCategoryThreshold: number;
othersCategoryType: OthersCategoryType; // Number, Percent
startAngle: number;
radiusFactor: number;
showDefaultTooltip: boolean;
toolTipType: ToolTipType;
highlightingMode: HighlightingMode;
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
  IgxDataChartModule,        // provides IgxDataChartComponent + all series/axes
  IgxPieChartModule,         // provides IgxPieChartComponent
  IgxDataPieChartModule,     // provides IgxDataPieChartComponent
  IgxLegendModule,           // provides IgxLegendComponent
} from 'igniteui-angular-charts';

// Enums and types — these ARE plain TS exports and can be imported directly
import {
  ChartType,
  FinancialChartType,
  MarkerType,
  ToolTipType,
  TrendLineType,
  HighlightingMode,
  TransitionInMode,
  AxisLabelLocation,
  CrosshairsDisplayMode,
  LegendOrientation,
  OthersCategoryType,
  SelectionMode,
  IndicatorType,
  VolumeType,
  AxisMode
} from 'igniteui-angular-charts';
```

### Standalone component example

```typescript
import { Component } from '@angular/core';
import {
  IgxCategoryChartModule,
  ChartType
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
- **Axis styles**: `xAxisMajorStroke`, `yAxisMajorStroke`, `xAxisLabelBrush`, `yAxisLabelBrush`
- **Tooltip**: `toolTipBrush`, `toolTipTextColor`
- **Highlight**: `highlightedSeriesOpacity`, `highlightedItemsOpacity`

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
