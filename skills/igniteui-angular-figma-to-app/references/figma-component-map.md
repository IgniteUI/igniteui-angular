# Figma Components → Ignite UI Angular Component Map

> **Part of the [`igniteui-angular-figma-to-app`](../SKILL.md) skill.**
>
> Use this file in Phase 2a to resolve every row of the Phase 1g Table A to an Ignite UI
> Angular selector, `get_doc` key, and key inputs. It has two entry points:
>
> - **Canonical Role Index** (next section). Use it for **Tier B and Tier C** layers:
>   components from any other UI kit, or un-componentized frames, after they are
>   normalized with [design-provenance.md](design-provenance.md).
> - **Kit Component Name** tables (the sections after it). Use them for **Tier A** layers
>   from the Infragistics **Indigo.Design UI Kits** (Material, Fluent, Bootstrap, Indigo
>   variants), whose layer names map to Ignite UI Angular directly.
>
> When a role or layer name is in neither, call `list_components` then `get_doc` on the
> closest match.

---

## Canonical Role Index

Normalized roles from `design-provenance.md` → the Ignite UI Angular selector, and the
section below that holds its full row.

| Canonical role (+ normalized props) | Ignite UI Angular | Section |
| --- | --- | --- |
| `button` · high | `<button igxButton="contained">` | Button Components |
| `button` · medium (outlined) | `<button igxButton="outlined">` | Button Components |
| `button` · medium (tonal / secondary fill) | `<button igxButton="contained">` + `contained-button` tokens set to the **measured** tonal fill and text colors (usually a light shade such as `var(--ig-primary-100)`). Do not use the plain `secondary` palette: on a `material` baseline it holds the brand color, so tonal buttons would look like high-emphasis ones | Button Components |
| `button` · low | `<button igxButton="flat">` | Button Components |
| `button` · link | `<a igxButton="flat" routerLink="…">`, or a plain `<a>` styled as a link | Button Components |
| `button` · elevated | `<button igxButton="contained">` + elevation via tokens | Button Components |
| `button` · danger | Same variant + tokens bound to the `error` palette | Button Components |
| `icon-button` | `<button igxIconButton="flat\|outlined\|contained">` | Button Components |
| `fab` | `<button igxButton="fab">` | Button Components |
| `toggle-group` | `<igx-buttongroup>` | Button Components |
| `text-field` · outlined | `<igx-input-group type="border">` | Form Controls |
| `text-field` · filled | `<igx-input-group type="box">` | Form Controls |
| `text-field` · underlined | `<igx-input-group type="line">` | Form Controls |
| `textarea` | `<igx-input-group>` + `<textarea igxInput>` | Form Controls |
| `select` | `<igx-select>` | Form Controls |
| `combobox` (single, searchable) | `<igx-simple-combo>` | Form Controls |
| `combobox` (multi / tags) | `<igx-combo>` | Form Controls |
| `combobox` (free-text suggestions) | `igxAutocomplete` + `<igx-drop-down>` | Form Controls |
| `checkbox` / `radio` / `switch` | `<igx-checkbox>` / `<igx-radio-group>`+`<igx-radio>` / `<igx-switch>` | Form Controls |
| `slider` / `range-slider` | `<igx-slider>` (`type="slider\|range"`) | Form Controls |
| `rating` | `<igc-rating>` (web component) | Form Controls |
| `file-upload` | `<igx-input-group>` + `<input igxInput type="file">` — confirm with `search_docs` | Form Controls |
| `date-picker` / `date-range-picker` / `time-picker` / `calendar` | `<igx-date-picker>` / `<igx-date-range-picker>` / `<igx-time-picker>` / `<igx-calendar>` | Date & Time Pickers |
| `app-bar` | `<igx-navbar>` | Navigation Components |
| `side-nav` (expanded, always visible) | `<igx-nav-drawer [pin]="true" [isOpen]="true">` | Navigation Components |
| navigation rail (icon-only) | `<igx-nav-drawer [pin]="true" [isOpen]="false">` with an `igxDrawerMini` template. The mini template renders only while the drawer is closed | Navigation Components |
| `tabs` | `<igx-tabs>` | Navigation Components |
| `bottom-nav` | `<igx-bottom-nav>` | Navigation Components |
| `stepper` | `<igx-stepper>` | Navigation Components |
| `menu` | `<igx-drop-down>` + `igxToggleAction` | Form Controls (`_Dropdown Menu` row) |
| `accordion` / `expansion-panel` | `<igx-accordion>` / `<igx-expansion-panel>` | Layout Components |
| `card` | `<igx-card>` (only when header/media/content/actions anatomy fits) | Data Display Components |
| `list` | `<igx-list>` | Data Display Components |
| `tree` | `<igx-tree>` | Data Display Components |
| `data-table` (simple, read-only) | `<igx-grid-lite>` (requires the separate `igniteui-grid-lite` package; obtain approval before installing) — see the `igniteui-angular-grids` skill | Grid Components |
| `data-table` (editing, grouping, paging, summaries…) | `<igx-grid>` and family | Grid Components |
| `pagination` | `<igx-paginator>` | Data Display Components |
| `avatar` | `<igx-avatar>` | Data Display Components |
| `tag` / `count-badge` | `<igx-badge>` | Data Display Components |
| `chip` | `<igx-chip>` | Data Display Components |
| `progress-linear` / `progress-circular` | `<igx-linear-bar>` / `<igx-circular-bar>` | Data Display Components |
| `divider` | `<igx-divider>` | Data Display Components |
| `carousel` | `<igx-carousel>` | Data Display Components |
| `dialog` | `<igx-dialog>` | Feedback / Overlay Components |
| `toast` (text only) / (with action) | `<igx-toast>` / `<igx-snackbar>` | Feedback / Overlay Components |
| `inline-alert` | `<igx-banner>` | Feedback / Overlay Components |
| `tooltip` | `igxTooltip` + `igxTooltipTarget` | Directives |
| `chart-*` / `gauge-*` / `map` | See the DV tables | Chart / Gauge / Map Components |
| `color-picker` / `qr-code` | `<igc-color-picker>` / `<igc-qr-code>` (web components from `igniteui-webcomponents`) | Form Controls (web component setup note) |
| `breadcrumbs`, `sheet`, `skeleton` | No Angular component | Use semantic markup, document the substitution, and record it in the Phase 2d delta ledger |

---

## How to Use the Kit Tables

1. Find the kit component name (as it appears in the Figma layers panel or the
   Indigo.Design kit library) in the **Kit Component Name** column.
2. Read the **Angular Selector** and **IgxXxx Class** for the template.
3. Try the **`get_doc` Key** with `get_doc({ framework: "angular", name: "<key>" })`.
   **The doc catalog covers only a subset of components** (verify with `list_components`
   once). When no doc exists for a key, use the
   [`igniteui-angular-components`](../../igniteui-angular-components/SKILL.md) /
   [`igniteui-angular-grids`](../../igniteui-angular-grids/SKILL.md) skill reference files
   for usage patterns and `search_api` for member-level API lookups — do not guess.
4. Consult **Key Inputs / Variants** for the properties most commonly configured from
   Figma variants.

> The component names are identical across all four kit variants (Material, Fluent,
> Bootstrap, Indigo). The kit variant determines the theme style, not the component name.

---

## Button Components

| Kit Component Name                     | Angular Selector                     | IgxXxx Class              | `get_doc` Key  | Key Inputs / Variants                                      |
| -------------------------------------- | ------------------------------------ | ------------------------- | -------------- | ---------------------------------------------------------- |
| `_Button/Flat`                         | `<button igxButton="flat">`          | `IgxButtonDirective`      | `button`       | `igxButton="flat"`, `[disabled]`, size via `--ig-size` |
| `_Button/Outlined`                     | `<button igxButton="outlined">`      | `IgxButtonDirective`      | `button`       | `igxButton="outlined"`                                     |
| `_Button/Contained` / `_Button/Raised` | `<button igxButton="contained">`     | `IgxButtonDirective`      | `button`       | `igxButton="contained"`                                    |
| `_Icon Button/Flat`                    | `<button igxIconButton="flat">`      | `IgxIconButtonDirective`  | `icon-button`  | `igxIconButton="flat\|outlined\|contained"`                |
| `_Icon Button/Outlined`                | `<button igxIconButton="outlined">`  | `IgxIconButtonDirective`  | `icon-button`  | —                                                          |
| `_Icon Button/Contained`               | `<button igxIconButton="contained">` | `IgxIconButtonDirective`  | `icon-button`  | —                                                          |
| `_Button Group`                        | `<igx-buttongroup>`                  | `IgxButtonGroupComponent` | `button-group` | `[values]`, `[selectionMode]` (`single\|singleRequired\|multi`), `[alignment]`              |
| `_FAB` / `Fab`                         | `<button igxButton="fab">`           | `IgxButtonDirective`      | `button`       | `igxButton="fab"`                                          |

---

## Form Controls

> **The default input type is `box`** (since Ignite UI for Angular 22.0.0) for
> `igx-input-group` and every component that wraps it. When a Figma design uses one
> non-default type everywhere, set the `IGX_INPUT_GROUP_TYPE` injection token once in
> `app.config.ts` rather than adding `type` to every component tag. The token is read by
> `IgxInputGroupComponent`, `IgxComboComponent`, `IgxSimpleComboComponent`,
> `IgxSelectComponent`, `IgxDatePickerComponent`, `IgxDateRangePickerComponent`, and
> `IgxTimePickerComponent`.
>
> ```typescript
> import { IGX_INPUT_GROUP_TYPE } from 'igniteui-angular/input-group';
> // providers: [{ provide: IGX_INPUT_GROUP_TYPE, useValue: 'border' }]
> ```
>
> Detect the intended type from Phase 1d: look for hidden `size-[0.5px]` nodes whose
> `data-name` encodes the variant (e.g. `"Date Picker Type"` → `border`).

| Kit Component Name             | Angular Selector                  | IgxXxx Class                                                                | `get_doc` Key            | Default Type                                                                    | Key Inputs / Variants                                                           |
| ------------------------------ | --------------------------------- | --------------------------------------------------------------------------- | ------------------------ | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `_Input/Line`                  | `<igx-input-group type="line">`   | `IgxInputGroupComponent`                                                    | `input-group`                  | `box`                                                                           | `type="line\|border\|box\|search"`, `[disabled]`                                |
| `_Input/Border`                | `<igx-input-group type="border">` | `IgxInputGroupComponent`                                                    | `input-group`                  | `box`                                                                           | `type="border"`                                                                 |
| `_Input/Box` / `_Input/Filled` | `<igx-input-group type="box">`    | `IgxInputGroupComponent`                                                    | `input-group`                  | `box`                                                                           | `type="box"`                                                                    |
| `_Input/Search`                | `<igx-input-group type="search">` | `IgxInputGroupComponent`                                                    | `input-group`                  | `box`                                                                           | `type="search"`                                                                 |
| `_Combo` / `_ComboBox`         | `<igx-combo>`                     | `IgxComboComponent`                                                         | `combo`                  | `box`                                                                           | `[data]`, `[displayKey]`, `[valueKey]`, `[groupKey]`, `[allowCustomValues]`     |
| `_Simple Combo`                | `<igx-simple-combo>`              | `IgxSimpleComboComponent`                                                   | `simple-combo`           | `box`                                                                           | `[data]`, `[displayKey]`, `[valueKey]`                                          |
| `_Select` / `_Dropdown`        | `<igx-select>`                    | `IgxSelectComponent`                                                        | `select`                 | `box`                                                                           | `<igx-select-item>` children, `[type]`                                          |
| `_Autocomplete`                | `igxAutocomplete` directive       | `IgxAutocompleteDirective`                                                  | `autocomplete`           | n/a                                                                             | Used alongside `igx-input-group` + `igx-drop-down`                              |
| `_Text Area`                  | `<igx-input-group>` + `<textarea igxInput>` | `IgxInputGroupComponent` | `input-group` | `box` | `rows`, `[(ngModel)]` on the `textarea` |
| `_File Upload`                | `<igx-input-group>` + `<input igxInput type="file">` | `IgxInputGroupComponent` | `input-group` | `box` | `multiple`, `accept` on the `input` |
| `_Dropdown Menu` / `_Menu`    | `<igx-drop-down>` + `igxToggleAction` on the trigger | `IgxDropDownComponent` | `drop-down` | n/a | `<igx-drop-down-item>` children, `(selectionChanging)` |
| `_Color Picker`               | `<igc-color-picker>` (**web component**) | `IgcColorPickerComponent` | search `color picker` | n/a | `value`; `[(ngModel)]` / `formControlName` via `IgcFormControlDirective` |
| `_Checkbox`                    | `<igx-checkbox>`                  | `IgxCheckboxComponent`                                                      | `checkbox`               | n/a                                                                             | `[(ngModel)]`, `[checked]`, `[indeterminate]`, `[disabled]`, `labelPosition`    |
| `_Radio` / `_Radio Button`     | `<igx-radio>`                     | `IgxRadioComponent`                                                         | `radio-button`           | n/a                                                                             | `[value]`, `[(ngModel)]`; wrap multiple in `<igx-radio-group>`                  |
| `_Switch` / `_Toggle`          | `<igx-switch>`                    | `IgxSwitchComponent`                                                        | `switch`                 | n/a                                                                             | `[(ngModel)]`, `[checked]`, `labelPosition`                                     |
| `_Slider` / `_Range Slider`    | `<igx-slider>`                    | `IgxSliderComponent`                                                        | `slider-slider`              | n/a                                                                             | `type="slider\|range"` (`IgxSliderType`), `[minValue]`, `[maxValue]`, `[step]`, `[(ngModel)]` |
| `_Rating`                      | `<igc-rating>`                    | `IgcRatingComponent` (**web component** — `igniteui-webcomponents` package) | `rating` | n/a                                                                             | `value`; `[(ngModel)]` / `formControlName` via `IgcFormControlDirective`; `igcChange` event |

> **Web component setup (rating, color picker, QR code, chat):** these need the
> `igniteui-webcomponents` package, an **optional** peer dependency of `igniteui-angular`.
> Install the version range `igniteui-angular` declares in its `peerDependencies` (check
> `node_modules/igniteui-angular/package.json`), after the user approves. In the component:
>
> ```typescript
> import { IgcRatingComponent, defineComponents } from 'igniteui-webcomponents';
> import { IgcFormControlDirective } from 'igniteui-angular/directives'; // ngModel / formControlName
> defineComponents(IgcRatingComponent);
> // Add CUSTOM_ELEMENTS_SCHEMA to the component's schemas array
> ```

---

## Date & Time Pickers

| Kit Component Name   | Angular Selector          | IgxXxx Class                  | `get_doc` Key       | Key Inputs / Variants                                                                       |
| -------------------- | ------------------------- | ----------------------------- | ------------------- | ------------------------------------------------------------------------------------------- |
| `_Date Picker`       | `<igx-date-picker>`       | `IgxDatePickerComponent`      | `date-picker`       | `[(ngModel)]`, `[minValue]`, `[maxValue]`, `[mode]` (`dropdown\|dialog`), `[displayFormat]` |
| `_Date Range Picker` | `<igx-date-range-picker>` | `IgxDateRangePickerComponent` | `date-range-picker` | `[(ngModel)]`, `[minValue]`, `[maxValue]`, `[mode]`                                         |
| `_Time Picker`       | `<igx-time-picker>`       | `IgxTimePickerComponent`      | `time-picker`       | `[(ngModel)]`, `[mode]` (`dropdown\|dialog`), `[inputFormat]`, `[displayFormat]`                                    |
| `_Calendar`          | `<igx-calendar>`          | `IgxCalendarComponent`        | `calendar`          | `[selection]` (`single\|multi\|range`), `[(ngModel)]`, `[viewDate]`, `[disabledDates]`      |

---

## Navigation Components

| Kit Component Name                   | Angular Selector   | IgxXxx Class                   | `get_doc` Key | Key Inputs / Variants                                                                          |
| ------------------------------------ | ------------------ | ------------------------------ | ------------- | ---------------------------------------------------------------------------------------------- |
| `_Navbar`                            | `<igx-navbar>`     | `IgxNavbarComponent`           | `navbar`      | `[title]`, `igxNavbarAction` slot, `igxNavbarTitle` slot                                       |
| `_Navigation Drawer` / `_Side Nav`   | `<igx-nav-drawer>` | `IgxNavigationDrawerComponent` | `navdrawer`   | `[pin]`, `[pinThreshold]`, `[miniWidth]`, `[width]`, `igxDrawer` + `igxDrawerMini` templates   |
| `_Tabs`                              | `<igx-tabs>`       | `IgxTabsComponent`             | `tabs`        | `<igx-tab-item>` with `<igx-tab-header>` and `<igx-tab-content>` children, `[tabAlignment]`    |
| `_Bottom Navigation` / `_Bottom Nav` | `<igx-bottom-nav>` | `IgxBottomNavComponent`        | `tabbar`| `<igx-bottom-nav-item>` children with `<igx-bottom-nav-header>` and `<igx-bottom-nav-content>` |
| `_Stepper`                           | `<igx-stepper>`    | `IgxStepperComponent`          | `stepper`     | `[orientation]` (`horizontal\|vertical`), `[stepType]`, `[linear]`; `<igx-step>` children      |

---

## Layout Components

| Kit Component Name | Angular Selector        | IgxXxx Class                 | `get_doc` Key     | Key Inputs / Variants                                                  |
| ------------------ | ----------------------- | ---------------------------- | ----------------- | ---------------------------------------------------------------------- |
| `_Accordion`       | `<igx-accordion>`       | `IgxAccordionComponent`      | `accordion`       | `[singleBranchExpand]`; `<igx-expansion-panel>` children               |
| `_Expansion Panel` | `<igx-expansion-panel>` | `IgxExpansionPanelComponent` | `expansion-panel` | `<igx-expansion-panel-header>` + `<igx-expansion-panel-body>`          |
| `_Splitter`        | `<igx-splitter>`        | `IgxSplitterComponent`       | `splitter`        | `[type]="SplitterType.Vertical"` (numeric enum); `<igx-splitter-pane>` children      |
| `_Tile Manager`    | `<igc-tile-manager>`    | Web component (standalone)   | `tile-manager`    | `<igc-tile>` children; web component — see [`layout-manager.md`](../../igniteui-angular-components/references/layout-manager.md) |
| `_Dock Manager`    | `<igc-dockmanager>`     | Web component (standalone)   | `dock-manager`    | `[layout]` JSON input; web component — see [`layout-manager.md`](../../igniteui-angular-components/references/layout-manager.md) |

---

## Data Display Components

| Kit Component Name                   | Angular Selector     | IgxXxx Class                      | `get_doc` Key           | Key Inputs / Variants                                                                                    |
| ------------------------------------ | -------------------- | --------------------------------- | ----------------------- | -------------------------------------------------------------------------------------------------------- |
| `_List`                              | `<igx-list>`         | `IgxListComponent`                | `list`                  | `<igx-list-item>` children; `igxListLine`, `igxListThumbnail`, `igxListAction` slot directives           |
| `_Tree` / `_Tree View`               | `<igx-tree>`         | `IgxTreeComponent`                | `tree`                  | `[selection]`; `<igx-tree-node>` children                                                                |
| `_Card`                              | `<igx-card>`         | `IgxCardComponent`                | `card`                  | `<igx-card-header>`, `<igx-card-media>`, `<igx-card-content>`, `<igx-card-actions>` elements; `igxCardThumbnail` attribute; `[horizontal]`            |
| `_Chip` / `_Chips`                   | `<igx-chip>`         | `IgxChipComponent`                | `chip`                  | `[removable]`, `[selectable]`, `[selected]`, `[disabled]`; wrap in `<igx-chips-area>`                    |
| `_Avatar`                            | `<igx-avatar>`       | `IgxAvatarComponent`              | `avatar`                | `[src]`, `[initials]`, `[icon]`, `[shape]` (`circle\|rounded\|square`), `[size]`                         |
| `_Badge`                             | `<igx-badge>`        | `IgxBadgeComponent`               | `badge`                 | `[value]`, `[type]` (`primary\|info\|success\|warning\|error`), `[shape]` (`square\|rounded`)            |
| `_Icon`                              | `<igx-icon>`         | `IgxIconComponent`                | `icon`                  | `[family]`, `[name]`; content text (ligature-based)                                                      |
| `_Carousel`                          | `<igx-carousel>`     | `IgxCarouselComponent`            | `carousel`              | `[loop]`, `[navigation]`, `[pause]`; `<igx-slide>` children                                              |
| `_Paginator`                         | `<igx-paginator>`    | `IgxPaginatorComponent`           | `paginator`             | `[totalRecords]`, `[perPage]`, `[selectOptions]`                                                         |
| `_Linear Progress` / `_Progress Bar` | `<igx-linear-bar>`   | `IgxLinearProgressBarComponent`   | `linear-progress`   | `[value]`, `[max]`, `[indeterminate]`, `[type]` (`default\|success\|info\|warning\|error`), `[striped]` |
| `_Circular Progress`                 | `<igx-circular-bar>` | `IgxCircularProgressBarComponent` | `circular-progress` | `[value]`, `[max]`, `[indeterminate]`, `[animate]`                                                       |
| `_Divider`                           | `<igx-divider>`      | `IgxDividerComponent`             | `divider`               | `[type]` (`solid\|dashed`), `[vertical]`                                                                 |
| `_Chat`                              | `<igx-chat>`         | `IgxChatComponent`                | `chat`                  | `[messages]`, `[draftMessage]`, `[options]`, `[templates]`, `(messageCreated)`; needs `igniteui-webcomponents` (see the web component setup note)                                                            |

---

## Feedback / Overlay Components

| Kit Component Name | Angular Selector | IgxXxx Class           | `get_doc` Key | Key Inputs / Variants                                                                       |
| ------------------ | ---------------- | ---------------------- | ------------- | ------------------------------------------------------------------------------------------- |
| `_Dialog`          | `<igx-dialog>`   | `IgxDialogComponent`   | `dialog`      | `[title]`, `[leftButtonLabel]`, `[rightButtonLabel]`, `[closeOnOutsideSelect]`, `[isModal]` |
| `_Toast`           | `<igx-toast>`    | `IgxToastComponent`    | `toast`       | `[displayTime]`, `[autoHide]`; opened via `toast.open()`                                    |
| `_Snackbar`        | `<igx-snackbar>` | `IgxSnackbarComponent` | `snackbar`    | `[displayTime]`, `[autoHide]`, `[actionText]`; opened via `snackbar.open(message)`          |
| `_Banner`          | `<igx-banner>`   | `IgxBannerComponent`   | `banner`      | `<igx-icon>` projected; `<igx-banner-actions>` for action buttons                               |

---

## Grid Components

| Kit Component Name     | Angular Selector          | IgxXxx Class                   | `get_doc` Key       | Key Inputs / Variants                                                                |
| ---------------------- | ------------------------- | ------------------------------ | ------------------- | ------------------------------------------------------------------------------------ |
| `_Grid` / `_Data Grid` | `<igx-grid>`              | `IgxGridComponent`             | `grid-grid`            | `[data]`, `[primaryKey]`, `[rowEditable]`, `<igx-column>` children |
| Lightweight table      | `<igx-grid-lite>`         | `IgxGridLiteComponent`         | `grid-lite-overview` | Read-only display with sorting/filtering/virtualization; import from `igniteui-angular/grids/lite`. Needs the `igniteui-grid-lite` package (an optional peer dependency of `igniteui-angular`, `~0.10.0`): check `package.json` and ask for approval before installing. Upgrade to `igx-grid` when editing, selection, or paging is shown |
| `_Tree Grid`           | `<igx-tree-grid>`         | `IgxTreeGridComponent`         | `treegrid-tree-grid`         | `[data]`, `[primaryKey]`, `[foreignKey]` or `[childDataKey]`                         |
| `_Hierarchical Grid`   | `<igx-hierarchical-grid>` | `IgxHierarchicalGridComponent` | `hierarchicalgrid-hierarchical-grid` | `[data]`, `[primaryKey]`; nested `<igx-row-island>` for child grids                  |
| `_Pivot Grid`          | `<igx-pivot-grid>`        | `IgxPivotGridComponent`        | `pivotGrid-pivot-grid`        | `[data]`, `[pivotConfiguration]`                                                     |

> **Grid features:** search for feature-specific docs using `search_docs`. Examples:
> `"grid filtering"`, `"grid sorting"`, `"grid paging"`, `"grid row selection"`,
> `"grid cell editing"`, `"grid column pinning"`, `"grid virtualization"`.

---

## Chart & Data Visualization Components

> DV components have **no Sass design tokens**. All visual configuration is done via
> component inputs. Do **not** call `theming_get_component_design_tokens` for these.
>
> **`get_doc`:** chart docs are `charts-chart-overview` plus one `types-<type>-chart` page
> per chart type (keys below). The
> [`charts.md`](../../igniteui-angular-components/references/charts.md) reference in the
> components skill covers setup, and `search_api` covers member lookups.
>
> **Series colors:** chart components use their own default brush palette. Always
> explicitly set `[brushes]` and `[outlines]` with space-separated hex colors extracted
> from the Phase 1d design context to match the Figma series colors:
> `[brushes]="'#9DE772 #6DB1FF'"`

| Kit Component Name                                               | Angular Selector                       | IgxXxx Class                 | `get_doc` Key           | Key Inputs / Variants                                                                 |
| ---------------------------------------------------------------- | -------------------------------------- | ---------------------------- | ----------------------- | ------------------------------------------------------------------------------------- |
| `_Category Chart` / `_Line Chart` / `_Area Chart` / `_Bar Chart` | `<igx-category-chart>`                 | `IgxCategoryChartComponent`  | `types-line-chart` / `types-area-chart` / `types-column-chart` / `types-bar-chart` | `[dataSource]`, `[chartType]`, `[brushes]`, `[outlines]`, `[legend]`, `[markerTypes]` |
| `_Pie Chart`                                                     | `<igx-pie-chart>`                      | `IgxPieChartComponent`       | `types-pie-chart` | `[dataSource]`, `[valueMemberPath]`, `[labelMemberPath]`                              |
| `_Financial Chart` / `_Stock Chart`                              | `<igx-financial-chart>`                | `IgxFinancialChartComponent` | `types-stock-chart` | `[dataSource]`, `[chartType]` (`Candle\|Bar\|Line`), `[volumeType]`                   |
| `_Sparkline`                                                     | `<igx-sparkline>`                      | `IgxSparklineComponent`      | `types-sparkline-chart` | `[dataSource]`, `[valueMemberPath]`, `[displayType]` (`Line\|Area\|Column\|WinLoss`)  |
| `_Data Chart`                                                    | `<igx-data-chart>`                     | `IgxDataChartComponent`      | `charts-chart-overview` | `[dataSource]`; series added as child elements                                        |
| `_Doughnut Chart` / `_Donut Chart`                               | `<igx-doughnut-chart>`                 | `IgxDoughnutChartComponent`  | `types-donut-chart` | `[dataSource]`; `<igx-ring-series>` children                                          |
| `_Treemap`                                                       | `<igx-treemap>`                        | `IgxTreemapComponent`        | `types-treemap-chart` | `[dataSource]`, `[valueMemberPath]`, `[labelMemberPath]`                              |
| `_Funnel Chart`                                                  | `<igx-funnel-chart>`                   | `IgxFunnelChartComponent`    | search `funnel chart` | `[dataSource]`, `[valueMemberPath]`, `[innerLabelMemberPath]`, `[outerLabelMemberPath]`                              |
| `_Scatter Chart` / `_Bubble Chart`                               | `<igx-data-chart>` with scatter series | `IgxDataChartComponent`      | `types-scatter-chart` / `types-bubble-chart` | Use `<igx-scatter-series>` or `<igx-bubble-series>`                                   |

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
| `_Geographic Map`  | `<igx-geographic-map>` | `IgxGeographicMapComponent` | `geo-map`       | `[zoomable]`; `<igx-geographic-symbol-series>` or `<igx-geographic-shape-series>` for data overlay |

---

## Directives

| Kit Component Name | Angular Selector                             | Directive Class       | `get_doc` Key | Notes                                                                       |
| ------------------ | -------------------------------------------- | --------------------- | ------------- | --------------------------------------------------------------------------- |
| `_Tooltip`         | `igxTooltipTarget` on the trigger + `igxTooltip` on the tooltip element | `IgxTooltipDirective` | `tooltip`     | Pair `igxTooltipTarget` on the host and `igxTooltip` on the tooltip element |
| `_Ripple`          | `igxRipple` attribute                        | `IgxRippleDirective`  | `ripple`      | Add to any interactive element                                              |

---

## Package Notes

| Pattern                                     | Import path                                                                                                |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Open-source package                         | `import { Igx... } from 'igniteui-angular/<entry-point>'`                                                  |
| Licensed package                            | `import { Igx... } from '@infragistics/igniteui-angular/<entry-point>'`                                    |
| Web components (Tile Manager, Dock Manager) | Dock Manager: `defineComponents(IgcDockManagerComponent)` from `igniteui-dockmanager` (`defineCustomElements()` is deprecated since 2.0.0) / see [`layout-manager.md`](../../igniteui-angular-components/references/layout-manager.md) in the components skill |
| Rating web component                        | `import { IgcRatingComponent, defineComponents } from 'igniteui-webcomponents'` + `CUSTOM_ELEMENTS_SCHEMA` |
| DV charts/gauges/maps                       | Require separate `igniteui-angular-charts`, `igniteui-angular-gauges`, or `igniteui-angular-maps` packages |

> **DV package install:** determine the installed Ignite UI version first
> (`npm list igniteui-angular`), then install the closest matching DV package version.
> If no exact version match exists, install the closest lower version with
> `--legacy-peer-deps`. Always ask for approval before installing any new package.

---

## Material Icons Extended (`@igniteui/material-icons-extended`)

The Indigo.Design UI Kit for Material includes domain and navigation icons from
`@igniteui/material-icons-extended`. These appear in Figma component descriptions with
the suffix **"material extended"**.

**Detection in Phase 1d:** scan all `data-name` or component description strings for
"material extended".

**Setup:** the package is already a dependency of `igniteui-angular`, so it is installed.
Add it to the app's own `package.json` (with the user's approval) only when a strict
package manager (pnpm, Yarn PnP) refuses the direct import.

```typescript
// In the root component (e.g. app.ts)
import { Component, OnInit, inject } from '@angular/core';
import { IgxIconService } from 'igniteui-angular/icon';
import { all } from '@igniteui/material-icons-extended';
// To register fewer, import individual icons instead:
// import { creditCards, piggyBank } from '@igniteui/material-icons-extended';

@Component({ selector: 'app-root', templateUrl: './app.html' })
export class App implements OnInit {
  private iconService = inject(IgxIconService);
  ngOnInit() {
    for (const icon of all) {
      this.iconService.addSvgIconFromText(icon.name, icon.value, 'imx-icons');
    }
  }
}
```

```html
<!-- Use family="imx-icons", name = kebab-case layer name -->
<igx-icon family="imx-icons" name="credit-cards"></igx-icon>
<igx-icon family="imx-icons" name="wire-transfer"></igx-icon>
```

| Figma description keyword | `imx-icons` name |
| ------------------------- | ---------------- |
| credit, card, bank        | `credit-cards`   |
| wire transfer, payment    | `wire-transfer`  |
| budget, savings           | `piggy-bank`     |
| loan, borrow              | `loan`           |
| crypto, bitcoin           | `bitcoin`        |
| calculator, math          | `calculator`     |

### Icons from other kits

Third-party kits come with their own icon sets. Identify the set from the icon instance
names (`lucide/chevron-down`, `ic_fluent_…`, `Icon / arrow-right`, `Symbols/…`), from the
component descriptions, or from the kit fingerprint in `design-provenance.md`. Then register
the glyphs the design uses **from that set's SVG package** with
`IgxIconService.addSvgIconFromText(name, svgText, family)`:

| Icon set | SVG source package (confirm name, version, and license before installing) |
| --- | --- |
| Material Symbols | `@material-symbols/svg-400` (pick the weight/fill the design uses) |
| Fluent System Icons | `@fluentui/svg-icons` |
| Lucide (shadcn/ui kits) | `lucide-static` |
| Bootstrap Icons | `bootstrap-icons` |
| Heroicons | `heroicons` |
| Phosphor | `@phosphor-icons/core` |
| Ant Design Icons | `@ant-design/icons-svg` |

```html
<igx-icon family="lucide" name="chevron-down"></igx-icon>
```

Register only the glyphs the design uses. When the set is paid (for example Untitled UI
Icons Pro) or unknown, or is not licensed for the web (SF Symbols), extract the used glyphs
as SVG with Tier 1 Method B from `asset-extraction.md` and register those instead. Tell the
user which icons came from a licensed set.

---

## Unmapped Layers

When you encounter a Figma layer that is **not in this table**:

1. Normalize it with [design-provenance.md](design-provenance.md) (Tier B variant
   properties, or Tier C structure) and retry the Canonical Role Index. Otherwise, extract
   the visual pattern (is it a list? a form field? a card?)
2. Call `list_components({ framework: "angular" })` and scan for the closest match
3. Call `get_doc` on the closest match before generating code
4. If no Ignite UI component matches after a genuine attempt, use plain semantic HTML and document the reason in a code comment
