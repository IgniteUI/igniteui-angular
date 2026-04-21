# Ignite UI Angular Component Mapping Reference

## Table of Contents
- [Dashboard & Layout Components](#dashboard--layout-components)
- [Chart Components](#chart-components)
- [Data Display Components](#data-display-components)
- [Form & Input Components](#form--input-components)
- [Calendar & Scheduling Components](#calendar--scheduling-components)
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

Decision rule:

- Use `IgxNavbarComponent` for a top horizontal bar when its slot structure and behavior match the screenshot. Use custom projected content and CSS flex overrides to achieve multi-zone layouts inside it. Use a plain `<header>` when that is a closer structural fit.
- Use `IgxNavigationDrawerComponent` for a sidebar or side-navigation panel when drawer structure and behavior match the screenshot. Configure pinning and mini mode according to whether the design shows fixed, collapsible, or icon-only navigation. Use a plain `<aside>` when a static custom sidebar matches the screenshot better.
- Use `IgxTabsComponent` for a horizontal tab strip when the screenshot clearly shows tabbed state switching.

Component decision matrix (by visual pattern, domain-neutral):

| Visual Pattern | Recommended Component | Notes |
|---|---|---|
| Repeated rows with icon/text/action | `IgxListComponent` + `IgxListItemComponent` | Use when the row anatomy and interaction model match; use `igxListLine`, `igxListThumbnail`, `igxListAction` slots. Use native `<ul>/<li>` or custom containers when that is a closer visual fit |
| Spreadsheet-like editable or sortable table | `IgxGridComponent` | Use only when content is truly tabular |
| Hierarchical or tree-structured table | `IgxTreeGridComponent` | Use when rows have parent-child relationships |
| Content blocks / summary cards | `IgxCardComponent` | Use when card chrome helps match the panel shape and structure. Use `igxCardHeader`, `igxCardContent`, `igxCardActions` slots with custom projected content. Use plain `<div>` containers for flat or highly custom tiles |
| Any text input field | `IgxInputGroupComponent` + `IgxInputDirective` | Use when the input anatomy matches the screenshot, including search fields and inline editors. Apply CSS to match the screenshot's border/radius style |
| Dropdown or select | `IgxSelectComponent` | Use when the screenshot clearly shows select/dropdown behavior |
| Form fields with labels and inputs | `IgxInputGroupComponent`, `IgxSelectComponent`, `IgxComboComponent` | Cover text, select, combo, and date inputs |
| Multi-step form / wizard | `IgxStepperComponent` | Use when a sequence of steps is visually present |
| Filter chips / tag inputs | `IgxChipComponent` | Use when chip anatomy matches status badges, filter tags, or removable labels in the screenshot |
| Calendar or date picker as a primary view element | `IgxCalendarComponent`, `IgxDatePickerComponent` | Use when scheduling or date selection is the core UI |
| Top icon/action bar | `IgxNavbarComponent` with projected icon buttons | Use when a navbar structure matches the screenshot; use plain icon buttons or custom containers when that is a closer fit |

## Chart Components

| UI Pattern | Ignite UI Component | Key Properties |
|---|---|---|
| Area chart | `IgxCategoryChartComponent` | `chartType`, `markerTypes`, `areaFillOpacity` |
| Line chart | `IgxCategoryChartComponent` | `chartType`, `markerTypes` |
| Column/bar chart | `IgxCategoryChartComponent` | `chartType`, `markerTypes` |
| Sparkline (mini chart) | `IgxSparklineComponent` | `displayType`, `valueMemberPath` |
| Pie/donut chart | `IgxPieChartComponent` / `IgxDoughnutChartComponent` | `valueMemberPath`, `labelMemberPath` |
| Financial chart | `IgxFinancialChartComponent` | OHLC/candlestick data |
| Complex multi-series | `IgxDataChartComponent` | Multiple series + axes |

Decision rule:

- Financial or OHLC screenshot: prefer `IgxFinancialChartComponent`
- Simple or moderate trend panel: prefer `IgxCategoryChartComponent`; move to `IgxDataChartComponent` when you need lower-level per-series control
- Highly custom sparkline or microchart: use `IgxSparklineComponent` or a custom fallback if the built-in anatomy is not a close visual match

## Data Display Components

| UI Pattern | Ignite UI Component | Key Properties |
|---|---|---|
| Item list | `IgxListComponent` + `IgxListItemComponent` | `igxListLine`, `igxListThumbnail`, `igxListAction` |
| User avatar | `IgxAvatarComponent` | `[initials]`, `shape`, `size` |
| Status badge | `IgxBadgeComponent` | `[value]`, `type` |
| Icons | `IgxIconComponent` | icon name, family, styling |
| Progress bar | `IgxLinearProgressBarComponent` | `[value]`, `[max]` |
| Circular progress | `IgxCircularProgressBarComponent` | `[value]`, `[max]` |
| Flat data grid | `IgxGridComponent` | Full-featured data grid |
| Hierarchical/tree data grid | `IgxTreeGridComponent` | `primaryKey`, `foreignKey`, `childDataKey` |
| Filter/tag chips | `IgxChipComponent` | `[removable]`, `[selectable]`, `chipClick` |

Decision rule:

- Use `IgxListComponent` for repeated-row content lists when its row structure and interaction model match the screenshot. The component adds accessible keyboard navigation, item structure, and theming when those benefits fit the design. Use native `<ul>/<li>` or custom containers when they are a closer visual fit.
- Choose `IgxGridComponent` only when the image is truly tabular (flat rows and columns, spreadsheet-style).
- Choose `IgxTreeGridComponent` when rows have parent-child or hierarchical structure.
- Use `IgxChipComponent` when chip anatomy matches the screenshot's status badges, tags, or label pills. Use custom badge or pill markup when a simpler or more exact visual match is needed.

## Form & Input Components

| UI Pattern | Ignite UI Component | Key Properties |
|---|---|---|
| Text input | `IgxInputGroupComponent` + `IgxInputDirective` | `igxInput`, `igxLabel`, `igxHint` |
| Dropdown select | `IgxSelectComponent` | `<igx-select-item>` children |
| Searchable multi-select | `IgxComboComponent` | `[data]`, `displayKey`, `valueKey` |
| Date picker | `IgxDatePickerComponent` | `[value]`, `(valueChange)` |
| Time picker | `IgxTimePickerComponent` | `[value]`, `(valueChange)` |
| Toggle switch | `IgxSwitchComponent` | value binding, change events |
| Checkbox | `IgxCheckboxComponent` | value binding, `[indeterminate]` |
| Radio button group | `IgxRadioGroupDirective` + `IgxRadioComponent` | `name` |
| Slider | `IgxSliderComponent` | `[minValue]`, `[maxValue]`, `[type]` |
| Multi-step wizard | `IgxStepperComponent` + `IgxStepComponent` | `orientation`, `[linear]` |
| Chip filter bar | `IgxChipsAreaComponent` + `IgxChipComponent` | `(reorder)`, `(remove)` |

## Calendar & Scheduling Components

| UI Pattern | Ignite UI Component | Key Properties |
|---|---|---|
| Calendar view | `IgxCalendarComponent` | `selection`, `[value]`, `(selected)` |
| Date range picker | `IgxDateRangePickerComponent` | `[value]`, `(rangeSelected)` |
| Month/year picker | `IgxCalendarComponent` | `view="decade"` or `view="year"` |

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

The main `igniteui-angular` package contains core UI components in Open Source projects (list, avatar, navbar, drawer, card, badge, progress, icon, etc.). Licensed projects may use `@infragistics/igniteui-angular` instead.

Data visualization components may require **additional packages** beyond the main Angular package:

| Capability | Additional packages |
|---|---|
| Charts / sparklines | `igniteui-angular-core`, `igniteui-angular-charts` |
| Maps | `igniteui-angular-core`, `igniteui-angular-maps` |
| Gauges / bullet graphs | `igniteui-angular-core`, `igniteui-angular-gauges` |

Install only the packages required by the components you actually selected. These are bare-name packages (not `@infragistics/` scoped). Resolve the exact package version against the installed Ignite UI major and the actual published DV package versions before installing.

## Import Patterns

Treat this file as a component selection reference, not as authoritative import guidance for a specific repo. Confirm exact imports from `detect_platform`, the current workspace, Angular best practices, and `get_doc` results.
