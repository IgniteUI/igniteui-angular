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
- `igniteui-angular-charts` — Category Chart, Financial Chart, Data Chart, Pie Chart, and Sparkline components (NPM)
- `@infragistics/igniteui-angular-charts` — Licensed version with same API (ProGet)

### Main Chart Components

> **IMPORTANT — Not Standalone Components**: Chart components from `igniteui-angular-charts` are **NOT** Angular standalone components (they predate the standalone API). They must always be imported via their **NgModule**. Standalone Angular components (Angular 14+) can still import NgModules directly in their `imports` array — this is fully supported.

| Component | NgModule to import | Description |
|---|---|---|
| `IgxCategoryChartComponent` | `IgxCategoryChartModule` | Simplified API for column, line, area, spline, StepLine/StepArea, point, waterfall |
| `IgxFinancialChartComponent` | `IgxFinancialChartModule` | Stock/candlestick charts with OHLC data |
| `IgxDataChartComponent` | `IgxDataChartModule` | Advanced: explicit axes, series, >65 chart types |
| `IgxPieChartComponent` | `IgxPieChartModule` | Part-to-whole pie and donut charts |
| `IgxDataPieChartComponent` | `IgxDataPieChartModule` | Simplified API for pie charts |
| `IgxLegendComponent` | `IgxLegendModule` | Shared legend component |
| `IgxSparklineComponent` | `IgxSparklineModule` | Compact inline chart for grid cells or small layouts |

### When to use each:
- **Category Chart** → Use for simple area/column/line/spline/waterfall; let framework auto-configure
- **Financial Chart** → Use for stock data with time-series OHLC, indicators, volume
- **Data Chart** → Use for advanced scenarios: multiple axes, custom series combinations, stacked/scatter
- **Pie Chart** → Use for part-to-whole (segments sum to 100%)
- **Sparkline** → Use for compact inline visualization in grid cells, dashboards, or small-space layouts

---

## General Chart Configuration

### Chart Type Selection
- **Category Chart**: `chartType` property — type: `CategoryChartType` (Auto, Line, Area, Column, Spline, ...)
- **Financial Chart**: `chartType` property — type: `FinancialChartType` (Auto, Bar, Candle, ...)
- **Data Chart**: Configure explicit series (IgxAreaSeriesComponent, IgxBarSeriesComponent, IgxColumnSeriesComponent, etc.)
- **Sparkline**: `displayType` property — type: `SparklineDisplayType` (Line, Area, Column, WinLoss)
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
- Set height/width on chart container (div, flexbox parent). The chart will render with 0px height if the container doesn't have a defined height.

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
- **Best Practices**:
  - Start numeric axis at 0
  - Sort categories by value (ascending/descending)
  - Right-align Y-axis labels
- **Avoid**: Too much data (axis becomes illegible), Time-series detail (use Line instead)

### Column Chart (`IgxCategoryChartComponent`, `chartType: 'Column'`)
- **Use**: Compare categories, show distribution, time-series changes
- **Data**: X-axis categories, Y-axis numeric values
- **Variants**: Column, StackedColumn, Stacked100%Column, RangeColumn, WaterfallColumn
- **Best Practices**:
  - Start Y-axis at 0
  - Order time-series left to right
- **Avoid**: Many series (>10) side-by-side (readability)
- **Related**: Bar Chart (horizontal equivalent, use `IgxDataChartComponent` + `IgxBarSeriesComponent`), Waterfall (show differences between values)

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

### Sparkline (`IgxSparklineComponent`)
- **Use**: Compact inline data visualization in grid cells, dashboards, or small-space layouts
- **Data**: One-dimensional array with at least one numeric field
- **Variants**: Line, Area, Column, WinLoss
- **Features**:
  - Configurable markers (All, Low, High, First, Last, Negative)
  - Normal range — horizontal shaded band (`normalRangeMinimum`, `normalRangeMaximum`)
  - Trendlines via `trendLineType`
  - Unknown value plotting via `unknownValuePlotting`
  - Tooltip support via `tooltipTemplate`
- **Best Practices**:
  - Set explicit `height` and `width` on the component or its container (renders at 0px otherwise)
  - Start Y-axis at 0 for accurate comparisons
  - Use Line or Area type for trend visualization; Column for discrete comparisons; WinLoss for binary positive/negative
  - When embedding in a grid cell, set compact dimensions (e.g. `height="40px"` `width="220px"`)
- **Avoid**: Detailed data analysis (use Category Chart or Data Chart), displaying many data labels (Sparkline only supports first/last X-axis labels and high/low Y-axis values)

---

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

### Category Chart (Area, Column, Line, Point, Spline, StepLine, StepArea, Waterfall)
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

### Sparkline
- Array of data items (one-dimensional)
- At least 1 numeric field mapped via `valueMemberPath`
- Optionally 1 string field mapped via `labelMemberPath` (used for first/last X-axis labels)
- Example: `[{ label: 'Jan', value: 10 }, { label: 'Feb', value: 25 }, { label: 'Mar', value: 15 }]`
