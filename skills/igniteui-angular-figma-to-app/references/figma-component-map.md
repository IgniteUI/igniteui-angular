# Indigo.Design UI Kit → Ignite UI Angular Component Map

> **Part of the [`igniteui-angular-figma-to-app`](../SKILL.md) skill.**
>
> The **Indigo.Design UI Kits** are Figma component libraries (Material, Fluent, Bootstrap,
> Indigo variants) that designers use to build their app screens. Every component instance
> in a design file is drawn from one of these libraries and maps 1:1 to an Ignite UI
> Angular control.
>
> Use this file in Phase 2a to map Figma layer names — as they appear in the kit
> library — to Ignite UI Angular selectors, `get_doc` keys, and key inputs. When a
> layer name is not in this table, call `list_components` then `get_doc` on the closest
> match.

---

## How to Use This File

1. Find the kit component name (as it appears in the Figma layers panel or the
   Indigo.Design kit library) in the **Kit Component Name** column.
2. Read the **Angular Selector** and **IgxXxx Class** for the template.
3. Use the **`get_doc` Key** to call `get_doc({ framework: "angular", name: "<key>" })`
   before writing any code.
4. Consult **Key Inputs / Variants** for the properties most commonly configured from
   Figma variants.

> The component names are identical across all four kit variants (Material, Fluent,
> Bootstrap, Indigo). The kit variant determines the theme style, not the component name.

---

## Button Components

| Kit Component Name                     | Angular Selector                     | IgxXxx Class              | `get_doc` Key  | Key Inputs / Variants                                      |
| -------------------------------------- | ------------------------------------ | ------------------------- | -------------- | ---------------------------------------------------------- |
| `_Button/Flat`                         | `<button igxButton="flat">`          | `IgxButtonDirective`      | `button`       | `igxButton="flat"`, `[disabled]`, size via `igxButtonSize` |
| `_Button/Outlined`                     | `<button igxButton="outlined">`      | `IgxButtonDirective`      | `button`       | `igxButton="outlined"`                                     |
| `_Button/Contained` / `_Button/Raised` | `<button igxButton="contained">`     | `IgxButtonDirective`      | `button`       | `igxButton="contained"`                                    |
| `_Icon Button/Flat`                    | `<button igxIconButton="flat">`      | `IgxIconButtonDirective`  | `icon-button`  | `igxIconButton="flat\|outlined\|contained"`                |
| `_Icon Button/Outlined`                | `<button igxIconButton="outlined">`  | `IgxIconButtonDirective`  | `icon-button`  | —                                                          |
| `_Icon Button/Contained`               | `<button igxIconButton="contained">` | `IgxIconButtonDirective`  | `icon-button`  | —                                                          |
| `_Button Group`                        | `<igx-buttongroup>`                  | `IgxButtonGroupComponent` | `button-group` | `[values]`, `[multiSelection]`, `[alignment]`              |
| `_FAB` / `Fab`                         | `<button igxButton="fab">`           | `IgxButtonDirective`      | `button`       | `igxButton="fab"`                                          |

---

## Form Controls

| Kit Component Name             | Angular Selector                  | IgxXxx Class               | `get_doc` Key  | Key Inputs / Variants                                                           |
| ------------------------------ | --------------------------------- | -------------------------- | -------------- | ------------------------------------------------------------------------------- |
| `_Input/Line`                  | `<igx-input-group type="line">`   | `IgxInputGroupComponent`   | `input`        | `type="line\|border\|box\|search"`, `[disabled]`                                |
| `_Input/Border`                | `<igx-input-group type="border">` | `IgxInputGroupComponent`   | `input`        | `type="border"`                                                                 |
| `_Input/Box` / `_Input/Filled` | `<igx-input-group type="box">`    | `IgxInputGroupComponent`   | `input`        | `type="box"`                                                                    |
| `_Input/Search`                | `<igx-input-group type="search">` | `IgxInputGroupComponent`   | `input`        | `type="search"`                                                                 |
| `_Combo` / `_ComboBox`         | `<igx-combo>`                     | `IgxComboComponent`        | `combo`        | `[data]`, `[displayKey]`, `[valueKey]`, `[groupKey]`, `[allowCustomValues]`     |
| `_Simple Combo`                | `<igx-simple-combo>`              | `IgxSimpleComboComponent`  | `simple-combo` | `[data]`, `[displayKey]`, `[valueKey]`                                          |
| `_Select` / `_Dropdown`        | `<igx-select>`                    | `IgxSelectComponent`       | `select`       | `<igx-select-item>` children, `[type]`                                          |
| `_Autocomplete`                | `igxAutocomplete` directive       | `IgxAutocompleteDirective` | `autocomplete` | Used alongside `igx-input-group` + `igx-drop-down`                              |
| `_Checkbox`                    | `<igx-checkbox>`                  | `IgxCheckboxComponent`     | `checkbox`     | `[(ngModel)]`, `[checked]`, `[indeterminate]`, `[disabled]`, `labelPosition`    |
| `_Radio` / `_Radio Button`     | `<igx-radio>`                     | `IgxRadioComponent`        | `radio-button` | `[value]`, `[(ngModel)]`; wrap multiple in `<igx-radio-group>`                  |
| `_Switch` / `_Toggle`          | `<igx-switch>`                    | `IgxSwitchComponent`       | `switch`       | `[(ngModel)]`, `[checked]`, `labelPosition`                                     |
| `_Slider` / `_Range Slider`    | `<igx-slider>`                    | `IgxSliderComponent`       | `slider`       | `[type]` (`SLIDER\|RANGE`), `[minValue]`, `[maxValue]`, `[step]`, `[(ngModel)]` |
| `_Rating`                      | `<igx-rating>`                    | `IgxRatingComponent`       | `rating`       | `[max]`, `[(ngModel)]`, `[disabled]`                                            |

---

## Date & Time Pickers

| Kit Component Name   | Angular Selector          | IgxXxx Class                  | `get_doc` Key       | Key Inputs / Variants                                                                       |
| -------------------- | ------------------------- | ----------------------------- | ------------------- | ------------------------------------------------------------------------------------------- |
| `_Date Picker`       | `<igx-date-picker>`       | `IgxDatePickerComponent`      | `date-picker`       | `[(ngModel)]`, `[minValue]`, `[maxValue]`, `[mode]` (`dropdown\|dialog`), `[displayFormat]` |
| `_Date Range Picker` | `<igx-date-range-picker>` | `IgxDateRangePickerComponent` | `date-range-picker` | `[(ngModel)]`, `[minValue]`, `[maxValue]`, `[mode]`                                         |
| `_Time Picker`       | `<igx-time-picker>`       | `IgxTimePickerComponent`      | `time-picker`       | `[(ngModel)]`, `[mode]` (`dropdown\|dialog`), `[format]`                                    |
| `_Calendar`          | `<igx-calendar>`          | `IgxCalendarComponent`        | `calendar`          | `[selection]` (`single\|multi\|range`), `[(ngModel)]`, `[viewDate]`, `[disabledDates]`      |

---

## Navigation Components

| Kit Component Name                   | Angular Selector   | IgxXxx Class                   | `get_doc` Key | Key Inputs / Variants                                                                          |
| ------------------------------------ | ------------------ | ------------------------------ | ------------- | ---------------------------------------------------------------------------------------------- |
| `_Navbar`                            | `<igx-navbar>`     | `IgxNavbarComponent`           | `navbar`      | `[title]`, `igxNavbarAction` slot, `igxNavbarTitle` slot                                       |
| `_Navigation Drawer` / `_Side Nav`   | `<igx-nav-drawer>` | `IgxNavigationDrawerComponent` | `navdrawer`   | `[pin]`, `[pinThreshold]`, `[miniWidth]`, `[width]`, `igxDrawer` + `igxDrawerMini` templates   |
| `_Tabs`                              | `<igx-tabs>`       | `IgxTabsComponent`             | `tabs`        | `<igx-tab-item>` with `<igx-tab-header>` and `<igx-tab-content>` children, `[tabAlignment]`    |
| `_Bottom Navigation` / `_Bottom Nav` | `<igx-bottom-nav>` | `IgxBottomNavComponent`        | `bottom-nav`  | `<igx-bottom-nav-item>` children with `<igx-bottom-nav-header>` and `<igx-bottom-nav-content>` |
| `_Stepper`                           | `<igx-stepper>`    | `IgxStepperComponent`          | `stepper`     | `[orientation]` (`horizontal\|vertical`), `[stepType]`, `[linear]`; `<igx-step>` children      |

---

## Layout Components

| Kit Component Name | Angular Selector        | IgxXxx Class                 | `get_doc` Key     | Key Inputs / Variants                                                  |
| ------------------ | ----------------------- | ---------------------------- | ----------------- | ---------------------------------------------------------------------- |
| `_Accordion`       | `<igx-accordion>`       | `IgxAccordionComponent`      | `accordion`       | `[singleBranchExpand]`; `<igx-expansion-panel>` children               |
| `_Expansion Panel` | `<igx-expansion-panel>` | `IgxExpansionPanelComponent` | `expansion-panel` | `<igx-expansion-panel-header>` + `<igx-expansion-panel-body>`          |
| `_Splitter`        | `<igx-splitter>`        | `IgxSplitterComponent`       | `splitter`        | `[type]` (`horizontal\|vertical`); `<igx-splitter-pane>` children      |
| `_Tile Manager`    | `<igc-tile-manager>`    | Web component (standalone)   | `tile-manager`    | `<igc-tile>` children; this is a web component — see layout-manager.md |
| `_Dock Manager`    | `<igc-dockmanager>`     | Web component (standalone)   | `dock-manager`    | `[layout]` JSON input; this is a web component — see layout-manager.md |

---

## Data Display Components

| Kit Component Name                   | Angular Selector     | IgxXxx Class                      | `get_doc` Key           | Key Inputs / Variants                                                                                    |
| ------------------------------------ | -------------------- | --------------------------------- | ----------------------- | -------------------------------------------------------------------------------------------------------- |
| `_List`                              | `<igx-list>`         | `IgxListComponent`                | `list`                  | `<igx-list-item>` children; `igxListLine`, `igxListThumbnail`, `igxListAction` slot directives           |
| `_Tree` / `_Tree View`               | `<igx-tree>`         | `IgxTreeComponent`                | `tree`                  | `[selection]`; `<igx-tree-node>` children                                                                |
| `_Card`                              | `<igx-card>`         | `IgxCardComponent`                | `card`                  | `igxCardHeader`, `igxCardThumbnail`, `igxCardContent`, `igxCardActions` slots; `[horizontal]`            |
| `_Chip` / `_Chips`                   | `<igx-chip>`         | `IgxChipComponent`                | `chip`                  | `[removable]`, `[selectable]`, `[selected]`, `[disabled]`; wrap in `<igx-chips-area>`                    |
| `_Avatar`                            | `<igx-avatar>`       | `IgxAvatarComponent`              | `avatar`                | `[src]`, `[initials]`, `[icon]`, `[shape]` (`circle\|rounded\|square`), `[size]`                         |
| `_Badge`                             | `<igx-badge>`        | `IgxBadgeComponent`               | `badge`                 | `[value]`, `[type]` (`primary\|info\|success\|warning\|error`), `[shape]` (`square\|rounded`)            |
| `_Icon`                              | `<igx-icon>`         | `IgxIconComponent`                | `icon`                  | `[family]`, `[name]`; content text (ligature-based)                                                      |
| `_Carousel`                          | `<igx-carousel>`     | `IgxCarouselComponent`            | `carousel`              | `[loop]`, `[navigation]`, `[pause]`; `<igx-slide>` children                                              |
| `_Paginator`                         | `<igx-paginator>`    | `IgxPaginatorComponent`           | `paginator`             | `[totalRecords]`, `[perPage]`, `[selectOptions]`                                                         |
| `_Linear Progress` / `_Progress Bar` | `<igx-linear-bar>`   | `IgxLinearProgressBarComponent`   | `linear-progress-bar`   | `[value]`, `[max]`, `[indeterminate]`, `[type]` (`default\|success\|info\|warning\|danger`), `[striped]` |
| `_Circular Progress`                 | `<igx-circular-bar>` | `IgxCircularProgressBarComponent` | `circular-progress-bar` | `[value]`, `[max]`, `[indeterminate]`, `[animate]`                                                       |
| `_Divider`                           | `<igx-divider>`      | `IgxDividerDirective`             | `divider`               | `[type]` (`solid\|dashed`), `[vertical]`                                                                 |
| `_Chat`                              | `<igx-chat>`         | `IgxChatComponent`                | `chat`                  | `[messages]`, `[user]`, `[sendMessage]` event                                                            |

---

## Feedback / Overlay Components

| Kit Component Name | Angular Selector | IgxXxx Class           | `get_doc` Key | Key Inputs / Variants                                                                       |
| ------------------ | ---------------- | ---------------------- | ------------- | ------------------------------------------------------------------------------------------- |
| `_Dialog`          | `<igx-dialog>`   | `IgxDialogComponent`   | `dialog`      | `[title]`, `[leftButtonLabel]`, `[rightButtonLabel]`, `[closeOnOutsideSelect]`, `[isModal]` |
| `_Toast`           | `<igx-toast>`    | `IgxToastComponent`    | `toast`       | `[displayTime]`, `[autoHide]`; opened via `toast.open()`                                    |
| `_Snackbar`        | `<igx-snackbar>` | `IgxSnackbarComponent` | `snackbar`    | `[displayTime]`, `[autoHide]`, `[actionText]`; opened via `snackbar.open(message)`          |
| `_Banner`          | `<igx-banner>`   | `IgxBannerComponent`   | `banner`      | `<igx-icon>` projected; `igxBannerActions` for action buttons                               |

---

## Grid Components

| Kit Component Name     | Angular Selector          | IgxXxx Class                   | `get_doc` Key       | Key Inputs / Variants                                                                |
| ---------------------- | ------------------------- | ------------------------------ | ------------------- | ------------------------------------------------------------------------------------ |
| `_Grid` / `_Data Grid` | `<igx-grid>`              | `IgxGridComponent`             | `grid`              | `[data]`, `[primaryKey]`, `[rowEditable]`, `[columnHiding]`; `<igx-column>` children |
| `_Tree Grid`           | `<igx-tree-grid>`         | `IgxTreeGridComponent`         | `tree-grid`         | `[data]`, `[primaryKey]`, `[foreignKey]` or `[childDataKey]`                         |
| `_Hierarchical Grid`   | `<igx-hierarchical-grid>` | `IgxHierarchicalGridComponent` | `hierarchical-grid` | `[data]`, `[primaryKey]`; nested `<igx-row-island>` for child grids                  |
| `_Pivot Grid`          | `<igx-pivot-grid>`        | `IgxPivotGridComponent`        | `pivot-grid`        | `[data]`, `[pivotConfiguration]`                                                     |

> **Grid features:** search for feature-specific docs using `search_docs`. Examples:
> `"grid filtering"`, `"grid sorting"`, `"grid paging"`, `"grid row selection"`,
> `"grid cell editing"`, `"grid column pinning"`, `"grid virtualization"`.

---

## Chart & Data Visualization Components

> DV components have **no Sass design tokens**. All visual configuration is done via
> component inputs. Do **not** call `theming_get_component_design_tokens` for these.

| Kit Component Name                                               | Angular Selector                       | IgxXxx Class                 | `get_doc` Key     | Key Inputs / Variants                                                                         |
| ---------------------------------------------------------------- | -------------------------------------- | ---------------------------- | ----------------- | --------------------------------------------------------------------------------------------- |
| `_Category Chart` / `_Line Chart` / `_Area Chart` / `_Bar Chart` | `<igx-category-chart>`                 | `IgxCategoryChartComponent`  | `category-chart`  | `[dataSource]`, `[chartType]` (`Line\|Area\|Column\|Bar\|Point`), `[legend]`, `[markerTypes]` |
| `_Pie Chart` / `_Donut Chart`                                    | `<igx-pie-chart>`                      | `IgxPieChartComponent`       | `pie-chart`       | `[dataSource]`, `[valueMemberPath]`, `[labelMemberPath]`                                      |
| `_Financial Chart` / `_Stock Chart`                              | `<igx-financial-chart>`                | `IgxFinancialChartComponent` | `financial-chart` | `[dataSource]`, `[chartType]` (`Candle\|Bar\|Line`), `[volumeType]`                           |
| `_Sparkline`                                                     | `<igx-sparkline>`                      | `IgxSparklineComponent`      | `sparkline`       | `[dataSource]`, `[valueMemberPath]`, `[displayType]` (`Line\|Area\|Column\|WinLoss`)          |
| `_Data Chart`                                                    | `<igx-data-chart>`                     | `IgxDataChartComponent`      | `data-chart`      | `[dataSource]`; series added as child elements                                                |
| `_Doughnut Chart`                                                | `<igx-doughnut-chart>`                 | `IgxDoughnutChartComponent`  | `doughnut-chart`  | `[dataSource]`; `<igx-ring-series>` children                                                  |
| `_Treemap`                                                       | `<igx-treemap>`                        | `IgxTreemapComponent`        | `treemap`         | `[dataSource]`, `[valueMemberPath]`, `[labelMemberPath]`                                      |
| `_Funnel Chart`                                                  | `<igx-funnel-chart>`                   | `IgxFunnelChartComponent`    | `funnel-chart`    | `[dataSource]`, `[valueMemberPath]`, `[labelMemberPath]`                                      |
| `_Scatter Chart` / `_Bubble Chart`                               | `<igx-data-chart>` with scatter series | `IgxDataChartComponent`      | `data-chart`      | Use `<igx-scatter-series>` or `<igx-bubble-series>`                                           |

---

## Gauge & Indicator Components

> These are DV components — configure via component inputs only, no Sass tokens.

| Kit Component Name | Angular Selector     | IgxXxx Class              | `get_doc` Key  | Key Inputs / Variants                                                                              |
| ------------------ | -------------------- | ------------------------- | -------------- | -------------------------------------------------------------------------------------------------- |
| `_Linear Gauge`    | `<igx-linear-gauge>` | `IgxLinearGaugeComponent` | `linear-gauge` | `[value]`, `[minimumValue]`, `[maximumValue]`, `[interval]`; `<igx-linear-graph-range>` for ranges |
| `_Radial Gauge`    | `<igx-radial-gauge>` | `IgxRadialGaugeComponent` | `radial-gauge` | `[value]`, `[minimumValue]`, `[maximumValue]`, `[interval]`; `<igx-radial-graph-range>` for ranges |
| `_Bullet Graph`    | `<igx-bullet-graph>` | `IgxBulletGraphComponent` | `bullet-graph` | `[value]`, `[targetValue]`, `[minimumValue]`, `[maximumValue]`                                     |

---

## Map Components

> DV component — configure via component inputs only, no Sass tokens.

| Kit Component Name | Angular Selector       | IgxXxx Class                | `get_doc` Key | Key Inputs / Variants                                                                              |
| ------------------ | ---------------------- | --------------------------- | ------------- | -------------------------------------------------------------------------------------------------- |
| `_Geographic Map`  | `<igx-geographic-map>` | `IgxGeographicMapComponent` | `map`         | `[zoomable]`; `<igx-geographic-symbol-series>` or `<igx-geographic-shape-series>` for data overlay |

---

## Directives

| Kit Component Name | Angular Selector                             | Directive Class       | `get_doc` Key | Notes                                                                       |
| ------------------ | -------------------------------------------- | --------------------- | ------------- | --------------------------------------------------------------------------- |
| `_Tooltip`         | `igxTooltip` on trigger + `igxTooltipTarget` | `IgxTooltipDirective` | `tooltip`     | Pair `igxTooltipTarget` on the host and `igxTooltip` on the tooltip element |
| `_Ripple`          | `igxRipple` attribute                        | `IgxRippleDirective`  | `ripple`      | Add to any interactive element                                              |

---

## Package Notes

| Pattern                                     | Import path                                                                                                |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Open-source package                         | `import { Igx... } from 'igniteui-angular'`                                                                |
| Licensed package                            | `import { Igx... } from '@infragistics/igniteui-angular'`                                                  |
| Web components (Tile Manager, Dock Manager) | `import 'igniteui-dockmanager'` / see `layout-manager.md` in the components skill                          |
| DV charts/gauges/maps                       | Require separate `igniteui-angular-charts`, `igniteui-angular-gauges`, or `igniteui-angular-maps` packages |

> **DV package install:** determine the installed Ignite UI version first, then resolve the
> compatible DV package version. Ask for approval before installing any new package.

---

## Unmapped Layers

When you encounter a Figma layer that is **not in this table**:

1. Extract the visual pattern (is it a list? a form field? a card?)
2. Call `list_components({ framework: "angular" })` and scan for the closest match
3. Call `get_doc` on the closest match before generating code
4. If no Ignite UI component matches after a genuine attempt, use plain semantic HTML and document the reason in a code comment
