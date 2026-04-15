# Ignite UI Angular Component Mapping Reference

## Table of Contents
- [Dashboard & Layout Components](#dashboard--layout-components)
- [Chart Components](#chart-components)
- [Data Display Components](#data-display-components)
- [Map Components](#map-components)
- [Gauge Components](#gauge-components)
- [Package Requirements](#package-requirements)
- [Import Patterns](#import-patterns)

## Dashboard & Layout Components

| UI Pattern | Ignite UI Component | Key Properties |
|---|---|---|
| Top navigation bar | `IgxNavbarComponent` | `igxNavbarAction`, `igxNavbarTitle` |
| Side navigation | `IgxNavigationDrawerComponent` | `[pin]`, `[pinThreshold]`, `igxDrawer` template, `igxDrawerMini` template |
| Content cards/panels | `IgxCardComponent` | `igxCardHeader`, `igxCardContent`, `igxCardActions` |
| Tabbed content | `IgxBottomNavComponent` or `IgxTabsComponent` | Panel-based or router-based |
| Accordion sections | `IgxAccordionComponent` | `IgxExpansionPanelComponent` children |
| Split layouts | `IgxSplitterComponent` | Horizontal/vertical panes |
| Tile dashboard | `IgxTileManagerComponent` | Drag/resize tiles (Premium) |

## Chart Components

| UI Pattern | Ignite UI Component | Key Properties |
|---|---|---|
| Area chart | `IgxCategoryChartComponent` | `chartType="area"`, `[markerTypes]="'none'"`, `[areaFillOpacity]` |
| Line chart | `IgxCategoryChartComponent` | `chartType="line"` |
| Column/bar chart | `IgxCategoryChartComponent` | `chartType="column"` |
| Sparkline (mini chart) | `IgxSparklineComponent` | `displayType="area"/"line"`, `valueMemberPath` |
| Pie/donut chart | `IgxPieChartComponent` / `IgxDoughnutChartComponent` | `valueMemberPath`, `labelMemberPath` |
| Financial chart | `IgxFinancialChartComponent` | OHLC/candlestick data |
| Complex multi-series | `IgxDataChartComponent` | Multiple series + axes |

## Data Display Components

| UI Pattern | Ignite UI Component | Key Properties |
|---|---|---|
| Item list | `IgxListComponent` + `IgxListItemComponent` | `igxListLine`, `igxListThumbnail`, `igxListAction` |
| User avatar | `IgxAvatarComponent` | `[initials]`, `shape="circle"`, `size` |
| Status badge | `IgxBadgeComponent` | `[value]`, `type` |
| Icons | `IgxIconComponent` | Material Icons by default |
| Progress bar | `IgxLinearProgressBarComponent` | `[value]`, `[max]` |
| Circular progress | `IgxCircularProgressBarComponent` | `[value]`, `[max]` |
| Data grid | `IgxGridComponent` | Full-featured data grid (Premium) |

## Map Components

| UI Pattern | Ignite UI Component | Key Properties |
|---|---|---|
| World map | `IgxGeographicMapComponent` | `[zoomable]`, `backgroundContent` |
| Map markers | `IgxGeographicSymbolSeriesComponent` | `latitudeMemberPath`, `longitudeMemberPath`, `markerType`, `markerBrush` |
| Bubble overlay | `IgxGeographicProportionalSymbolSeriesComponent` | Sized markers |
| Shape regions | `IgxGeographicShapeSeriesComponent` | Polygon rendering |

## Gauge Components

| UI Pattern | Ignite UI Component | Key Properties |
|---|---|---|
| Linear gauge | `IgxLinearGaugeComponent` | `[value]`, `[minimumValue]`, `[maximumValue]`, `[needleBrush]` |
| Radial gauge | `IgxRadialGaugeComponent` | `[value]`, `[minimumValue]`, `[maximumValue]` |
| Bullet graph | `IgxBulletGraphComponent` | Performance vs target |

## Package Requirements

The main `@infragistics/igniteui-angular` package contains core UI components (list, avatar, navbar, drawer, card, badge, progress, icon, etc.).

Premium data visualization components require **additional packages**:

```
npm install --save igniteui-angular-core igniteui-angular-charts igniteui-angular-maps igniteui-angular-gauges
```

These are bare-name packages (not `@infragistics/` scoped). They resolve from the public npm registry.

## Import Patterns

**Core UI components** - import as standalone components:
```typescript
import { IgxNavbarComponent, IgxAvatarComponent } from '@infragistics/igniteui-angular';
```

**DV components** - import as NgModules (they work in standalone `imports` arrays):
```typescript
import { IgxCategoryChartModule } from 'igniteui-angular-charts';
import { IgxSparklineModule } from 'igniteui-angular-charts';
import { IgxGeographicMapModule } from 'igniteui-angular-maps';
import { IgxLinearGaugeModule } from 'igniteui-angular-gauges';
```

**Map series** - import component classes for programmatic use:
```typescript
import { IgxGeographicSymbolSeriesComponent } from 'igniteui-angular-maps';
import { MarkerType } from 'igniteui-angular-charts';
```
