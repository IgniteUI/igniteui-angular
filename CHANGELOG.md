# Ignite UI for Angular Change Log

All notable changes for each version of this project will be documented in this file.

## 6.2.0
- `igx-datePicker` selector is deprecated. Use `igx-date-picker` selector instead.
- `igxOverlay`: `OverlaySettings` now also accepts an optional `outlet` to specify the container where the overlay should be attached.
- `igxToggleAction` new `outlet` input controls the target overlay element should be attached. Provides a shortcut for `overlaySettings.outlet`.
- `IgxOverlayOutlet` directive introducedto mark an element as an `igxOverlay` outlet container. [ReadMe](https://github.com/IgniteUI/igniteui-angular/blob/master/projects/igniteui-angular/src/lib/directives/toggle/README.md)
- `igxButtonGroup`
    - Added the ability to define buttons directly in the template
- `igx-time-picker`:
    - `igxTimePickerTemplate` - new directive which should be applied on the child `<ng-template>` element when `IgxTimePickerComponent`'s input group is retemplated. 
- `igx-datePicker`:
    - `igxDatePickerTemplate` - new directive which should be applied on the child `<ng-template>` element when `IgxDatePickerComponent`'s input group is retemplated.
    - Introduced `disabledDates`. This property is exposed from the `igx-calendar` component.
    - Introduced `specialDates`. This property is exposed from the `igx-calendar` component.
- `IgxTextHighlightDirective`: The `highlight` method now has a new optional parameter called `exactMatch` (defaults to false).
    - If its value is false, all occurrences of the search text will be highlighted in the group's value.
    - If its value is true, the entire group's value should equals the search text in order to be highlighted (caseSensitive argument is respected as well).
- `IgxGrid`: The `findNext` and `findPrev` methods now have a new optional parameter called `exactMatch` (defaults to false).
    - If its value is false, all occurrences of the search text will be highlighted in the grid's cells.
    - If its value is true, the entire value of each cell should equals the search text in order to be highlighted (caseSensitive argument is respected as well).
- `IgxChip`
    - Introduced event argument types to all `EventEmitter` `@Output`s.
    - **Breaking change** `onSelection`'s EventEmitter interface property `nextStatus` is renamed to `selected`.
- `IgxChipArea`
    - Introduced event argument types to all `EventEmitter` `@Output`s.
- `IgxCombo`
    - Added the following directives for `TemplateRef` assignment for combo templates (item, footer, etc.):
        - Added `IgxComboItemDirective`. Use `[igxComboItem]` in markup to assing a TemplateRef to `combo.itemTemplate`.
        - Added `IgxComboHeaderDirective`. Use `[igxComboHeader]` in markup to assing a TemplateRef to `combo.headerTemplate`.
        - Added `IgxComboFooterDirective`. Use `[igxComboFooter]` in markup to assing a TemplateRef to `combo.footerTemplate`.
        - Added `IgxComboEmptyDirective`. Use `[igxComboEmpty]` in markup to assing a TemplateRef to `combo.emptyTemplate`.
        - Added `IgxComboAddItemirective`. Use `[igxComboAddItem]` in markup to assing a TemplateRef to `combo.addItemTemplate`.
        - Added `IgxComboHeaderItemDirective`. Use `[igxComboHeaderItem]` in markup to assing a TemplateRef to `combo.headerItemTemplate`.
    - **Breaking change** Assigning templates with the following template ref variables is now deprecated in favor of the new directives:
            `#itemTemplate`, `#headerTemplate`, `#footerTemplate`, `#emptyTemplate`, `#addItemTemplate`, `#headerItemTemplate`.
- `igx-calendar`:
    - Introduced `disabledDates` property which allows a user to disable dates based on various rules: before or after a date, weekends, workdays, specific dates and ranges. The disabled dates cannot be selected and have a distinguishable style.
    - Introduced `specialDates` property which allows a user to mark dates as special. They can be set by using various rules. Their style is distinguishable.
        
## 6.1.3
- **General**
    - Added ES7 polyfill for Object for IE. This should be added to the polyfills in order for the igxGrid to render under IE.
        ```
        import 'core-js/es7/object';
        ```
- `igxTabs`
    - `selectedIndex` property has an `@Input` setter and can be set both in markup and in code behind.
- `igxDropDownItem`
    - `isSelected` has a public setter and is now an `@Input` property that can be used for template binding.
- `igxGrid`
    - **Breaking change** `applyNumberCSSClass` and `columnType` getters are removed.
    - `isUnary` property added to IFilteringOperation
    - `igxColumn`
        - The footerTemplate property is removed.
    - `igxColumnGroup`
        - The footerTemplate property is removed.
    - exposed `autosize()` method on `IgxColumnComponent`. It allows the user to programatically change the size of a column according to it's largest visible cell.
    - Initializing an `igxGrid` component without setting height, inside a container without height defined, now causes the grid to render 10 records from the data view or all of the records if there are fewer than 10 available.
- `igxCombo`
    - **Breaking change** igxCombo default `width` is set to 100%
    - **Breaking change** `itemsMaxWidth` is renamed to `itemsWidth`
- `igxLinearBar` and `igxCircularBar`
    - exposed `step` input which determines the update step of the progress indicator. By default it is one percent of the maximum value.
    - `IgxCircularBar` `text` input property exposed to set the text to be displayed inside the circular bar.
## 6.1.2
- `igxCombo` improvements
    - Remote Data Binding fixes - selection preserving and keyboard navigation.

    For more detailed information see the [official igxCombo documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/combo.html).

**General**
- Added `jsZip` as a Dependency.
## 6.1.1
- `igxTimePicker` changes
    - `onClose` event added.

## 6.1.0
- `igxOverlay` service added. **igxOverlayService** allows you to show any component above all elements in page. For more detailed information see the [official documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/overlay_main.html)
- Added **igxRadioGroup** directive. It allows better control over its child `igxRadio` components and support template-driven and reactive forms.
- Added `column moving` feature to `igxGrid`, enabled on a per-column level. **Column moving** allows you to reorder the `igxGrid` columns via standard drag/drop mouse or touch gestures.
    For more detailed information see the [official documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/grid_column_moving.html).
- `igx-tab-bar` selector removed from `IgxBottomNavComponent`.
- `igxGrid` filtering operands
- `igxGrid`
    - **Breaking change** `filter_multiple` method is removed. `filter` method and `filteringExpressionsTree` property could be used instead.
    - **Breaking change** `filter` method has new signature. It now accepts the following parameters:
        - `name` - the name of the column to be filtered.
        - `value` - the value to be used for filtering.
        - `conditionOrExpressionTree` - (optional) this parameter accepts object of type `IFilteringOperation` or `IFilteringExpressionsTree`. If only a simple filtering is required a filtering operation could be passes (see bellow for more info). In case of advanced filtering an expressions tree containing complex filtering logic could be passed.
        - `ignoreCase` - (optional) - whether the filtering would be case sensitive or not.
    - **Breaking change** `onFilteringDone` event now have only one parameter - `IFilteringExpressionsTree` which contains the filtering state of the filtered column.
    - `filter_global` method clears all existing filters and applies the new filtering condition to all grid's columns.
    - filtering operands:
        - **Breaking change** `IFilteringExpression` condition property is no longer a direct reference to a filtering condition method, instead it's a reference to an `IFilteringOperation`
        - 5 filtering operand classes are now exposed
            - `IgxFilteringOperand` is a base filtering operand, which can be inherited when defining custom filtering conditions
            - `IgxBooleanFilteringOperand` defines all default filtering conditions for `boolean` types
            - `IgxNumberFilteringOperand` defines all default filtering conditions for `numeric` types
            - `IgxStringFilteringOperand` defines all default filtering conditions for `string` types
            - `IgxDateFilteringOperand` defines all default filtering conditions for `Date` types
        - `IgxColumnComponent` now exposes a `filters` property, which takes an `IgxFilteringOperand` class reference
            - Custom filters can now be provided to grid columns by populating the `operations` property of the `IgxFilteringOperand` with operations of `IFilteringOperation` type
```
export class IgxCustomFilteringOperand extends IgxFilteringOperand {
    // Making the implementation singleton
    private static _instance: IgxCustomFilteringOperand = null;

    protected constructor() {
        super();
        this.operations = [{
            name: 'custom',
            logic: (target: string) => {
                return target === 'My custom filter';
            }
        }].concat(this.operations); // Keep the empty and notEmpty conditions from base
    }

    // singleton
    // Must implement this method, because the IgxColumnComponent expects it
    public static instance(): IgxCustomFilteringOperand {
        return this._instance || (this._instance = new this());
    }
}
```

- `igxGrid` now supports grouping of columns enabling users to create criteria for organizing data records. To explore the functionality start off by setting some columns as `groupable`:
    ```html
    <igx-grid [data]="data">
        <igx-column [field]="'ProductName'"></igx-column>
        <igx-column [field]="'ReleaseDate'" [groupable]="true"></igx-column>
    </igx-grid>
    ```
   For more information, please head over to `igxGrid`'s [ReadMe](https://github.com/IgniteUI/igniteui-angular/blob/master/src/grid/README.md) or the [official documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/grid_groupby.html).

- `igxGrid` now supports multi-column headers allowing you to have multiple levels of columns in the header area of the grid.
    For more information, head over to [official documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/grid_multi_column_headers.html)
- `igxGrid` theme now has support for alternating grid row background and text colors.
- `igxGrid` now has a toolbar (shown using the `showToolbar` property) which contains the following features:
  - title (specified using the `toolbarTitle` property)
  - column hiding feature (enabled using the `columnHiding` property)
  - column pinning feature (enabled using the `columnPinning` property)
  - export to excel (enabled using the `exportExcel` property)
  - export to CSV (enabled using the `exportCsv` property)
- `igxColumn` changes:
    - **Breaking change** filteringExpressions property is removed.
- `igxGrid` API is updated
    - **Breaking change** deleteRow(rowSelector: any) method will delete the specified row only if the primary key is defined. The method accept rowSelector as a parameter,  which is the rowID.
    - **Breaking change** updateRow(value: any, rowSelector: any) method will update the specified row only if the primary key is defined. The method accept value and rowSelector as a parameter, which is the rowID.
    - **Breaking change** updateCell(value: any, rowSelector: any, column: string) method will update the specified cell only if the primary key is defined. The method accept  value, rowSelector,which is the rowID and column name.
    - getCellByKey(rowSelector: any, columnField: string) method is added to grid's API. This method retuns a cell or undefined only if primary key is defined and search for the specified cell by the rowID and column name.
    - getCellByColumn(rowIndex: number, columnField: string) method is updated. This method returns a cell or undefined by using rowIndex and column name.
- `IgxGridRow` API is updated:
    - update(value: any) method is added. The method takes as a parameter the new value, which is to be set to the specidied row.
    - delete() method is added. The method removes the specified row from the grid's data source.

- `igxCell` default editing template is changed according column data type. For more information you can read the [specification](https://github.com/IgniteUI/igniteui-angular/wiki/Cell-Editing) or the [official documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/grid_editing.html)
- `igxCombo` component added

    ```html
    <igx-combo #combo [data]="towns" [displayKey]="'townName'" [valueKey]="'postCode'" [groupKey]="'province'"
        [allowCustomValues]="true" placeholder="Town(s)" searchPlaceholder="Search town..."></igx-combo>
    ```

    igxCombo features:

        - Data Binding
        - Value Binding
        - Virtualized list
        - Multiple Selection
        - Filtering
        - Grouping
        - Custom values
        - Templates
        - Integration with Template Driven and Reactive Forms
        - Keyboard Navigation
        - Accessibility compliance

    For more detailed information see the [official igxCombo documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/combo.html).
- `igxDropdown` component added

    ```html
    <igx-drop-down igxDropDownItemNavigation (onSelection)="onSelection($event)" (onOpening)="onOpening($event)">
        <igx-drop-down-item *ngFor="let item of items" disabled={{item.disabled}} isHeader={{item.header}}>
                {{ item.field }}
        </igx-drop-down-item>
    </igx-drop-down>
    ```

    **igxDropDown** displays a scrollable list of items which may be visually grouped and supports selection of a single item. Clicking or tapping an item selects it and closes the Drop Down.

    A walkthrough of how to get started can be found [here](https://www.infragistics.com/products/ignite-ui-angular/angular/components/drop_down.html)

    igxDropdown features:

        - Single Selection
        - Grouping
        - Keyboard Navigation
        - Accessibility compliance

- `igxChip` and `igxChipsArea` components added

    ```html
    <igx-chips-area>
        <igx-chip *ngFor="let chip of chipList" [id]="chip.id">
            <label igxLabel>{{chip.text}}</label>
        </igx-chip>
    </igx-chips-area>
    ```

    For more detailed information see the [official igxChip documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/chip.html).

- `igxToggle` changes
    - `onOpening` event added.
    - `onClosing` event added.
- `igxToggleAction` new `overlaySettings` input controls how applicable targets display content. Provides defaults with positioning based on the host element. The `closeOnOutsideClick` input is deprecated in favor of the new settings and will be removed in the future.

- `igxList` now supports a 'loading' template which is shown when the list is empty and its new `isLoading` property is set to `true`. You can redefine the default loading template by adding an `ng-template` with the `igxDataLoading` directive:

    ```html
    <igx-list [isLoading]="true">
        <ng-template igxDataLoading>
            <p>Please wait, data is loading...</p>
        </ng-template>
    </igx-list>
    ```

- **Breaking changes**:
    - Removed submodule imports. All imports are now resolved from the top level `igniteui-angular` package.
    - `igxGrid` changes:
        - sort API now accepts params of type `ISortingExpression` or `Array<ISortingExpression>`.
    - `igxToggle` changes
        - `collapsed` now read-only, markup input is removed.
        - `onOpen` event renamed to `onOpened`.
        - `onClose` event renamed to `onClosed`.
        - `open` method does not accept fireEvents optional boolean parameter. Now it accepts only overlaySettings optional parameter of type `OverlaySettings`.
        - `close` method does not accept fireEvents optional boolean parameter.
        - `toggle` method does not accept fireEvents optional boolean parameter. Now it accepts only overlaySettings optional parameter of type `OverlaySettings`.
    - `igxDialog` changes
        - `open` method does not accept fireEvents boolean parameter. Now it accepts only overlaySettings optional parameter of type `OverlaySettings`.
- **Breaking change** All properties that were named `isDisabled` have been renamed to `disabled` in order to acheive consistency across our component suite. This affects: date-picker, input directive, input-group, dropdown-item, tabbar and time-picker.
- The **deprecated** `igxForRemote` input for the `igxFor` directive is now removed. Setting the required `totalItemCount` property after receiving the first data chunk is enough to trigger the required functionality.

## 6.0.4
- **igxRadioGroup** directive introduced. It allows better control over its child `igxRadio` components and support template-driven and reactive forms.
- Fixed ReactiveForms validations support for IgxInputGroup. Related [issue](https://github.com/IgniteUI/igniteui-angular/issues/1144).

## 6.0.3
- **igxGrid** exposing the `filteredSortedData` method publicly - returns the grid data with current filtering and sorting applied.

## 6.0.2
- **igxGrid** Improve scrolling on mac [#1563](https://github.com/IgniteUI/igniteui-angular/pull/1563)
- The `ng update igniteui-angular` migration schematics now also update the theme import path in SASS files. [#1582](https://github.com/IgniteUI/igniteui-angular/issues/1582)

## 6.0.1
- Introduced migration schematics to integrate with the Angular CLI update command. You can now run

  `ng update igniteui-angular`

  in existing projects to both update the package and apply any migrations needed to your project. Make sure to commit project state before proceeding.
  Currently these cover converting submodule imports as well as the deprecation of `igxForRemote` and rename of `igx-tab-bar` to `igx-bottom-nav` from 6.0.0.
- **Breaking changes**:
    - Removed submodule imports. All imports are now resolved from the top level `igniteui-angular` package. You can use `ng update igniteui-angular` when updating to automatically convert existing submodule imports in the project.
    - Summary functions for each IgxSummaryOperand class has been made `static`. So now you can use them in the following way:
    ```typescript
    import { IgxNumberSummaryOperand, IgxSummaryOperand } from "igniteui-angular";
    class CustomSummary extends IgxSummaryOperand {
    constructor() {
      super();
    }
    public operate(data?: any[]) {
      const result = super.operate(data);
      result.push({
        key: "Min",
        label: "Min",
        summaryResult: IgxNumberSummaryOperand.min(data)
      });
      return result;
    }
  }
    ```


## 6.0.0
- Theming - You can now use css variables to style the component instances you include in your project.
- Added `onDoubleClick` output to `igxGrid` to emit the double clicked cell.
- Added `findNext`, `findPrev` and `clearSearch` methods to the IgxGridComponent which allow easy search of the grid data, even when the grid is virtualized.
- Added `IgxTextHighlightDirective` which highlights parts of a DOM element and keeps and updates "active" highlight.
- Added `All` option to the filter UI select for boolean columns
- Update to Angular 6

## 5.3.1
- igx-dialog changes
    - Dialog title as well as dialog actions (buttons) can be customized. For more information navigate to the [ReadMe](https://github.com/IgniteUI/igniteui-angular/blob/master/src/dialog/README.md).
- Filtering a boolean column by `false` condition will return only the real `false` values, excluding `null` and `undefined`. Filtering by `Null` will return the `null` values and filtering by `Empty` will return the `undefined`.
- The `Filter` button in the filtering UI is replaced with a `Close` button that is always active and closes the UI.
- Filtering UI input displays a `X` icon that clears the input.

## 5.3.0
- Added `rowSelectable` property to `igxGrid`
    - Setting `rowSelectable` to `true` enables multiple row selection for the `igx-grid` component. Adds a checkbox column that allows (de)selection of one, multiple or all (via header checkbox) rows.
    - For more information about the `rowSelectable` property and working with grid row, please read the `igxGrid`'s [ReadMe](https://github.com/IgniteUI/igniteui-angular/blob/master/src/grid/README.md) about selection or see the [official documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/grid-selection.html)
- Added `onContextMenu` output to `igxGrid` to emit the clicked cell.
- `igx-datePicker`: Added `onClose` event.
- `igxTextSelection` directive added
    - `igxTextSelection` directive allows you to select the whole text range for every element with text content it is applied.
- `igxFocus` directive added
    - `igxFocus` directive allows you to force focus for every element it is applied.
- `igx-time-picker` component added
    - `igx-time-picker` allows user to select time, from a dialog with spinners, which is presented into input field.
    - For more information navigate to the [ReadMe](https://github.com/IgniteUI/igniteui-angular/blob/master/src/time-piker/README.md).
- `igx-tab-bar` changes
    - **Breaking changes**: `IgxTabBarComponent` is renamed to `IgxBottomNavComponent` and `IgxTabBarModule` is renamed to `IgxBottomNavModule`.
    - `igx-tab-bar` selector is deprecated. Use `igx-bottom-nav` selector instead.
- `igx-tabs` component added
    - `igx-tabs` allows users to switch between different views. The `igx-tabs` component places the tabs headers at the top and allows scrolling when there are multiple tab items outside the visible area. Tabs are ordered in a single row above their associated content.
    - For more information navigate to [ReadMe](https://github.com/IgniteUI/igniteui-angular/blob/master/src/tabs/README.md).
- Added column pinning in the list of features available for `igxGrid`. Pinning is available though the API. Try the following:
   ```typescript
   const column = this.grid.getColumnByName(name);
   column.pin();
   ```
   For more information, please head over to `igxGrid`'s [ReadMe](https://github.com/IgniteUI/igniteui-angular/blob/master/src/grid/README.md) or the [official documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/grid_column_pinning.html).
- Added `summaries` feature to `igxGrid`, enabled on a per-column level. **Grid summaries** gives you a predefined set of default summaries, depending on the type of data in the column.
    For more detailed information read `igxGrid`'s [ReadMe](https://github.com/IgniteUI/igniteui-angular/blob/master/src/grid/README.md) or see the [official documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/grid_summaries.html).
- Added `columnWidth` option to `igxGrid`. The option sets the default width that will be applied to columns that have no explicit width set. For more detailed information read `igxGrid`'s [ReadMe](https://github.com/IgniteUI/igniteui-angular/blob/master/src/grid/README.md)
- Added API to `igxGrid` that allows for vertical remote virtualization. For guidance on how to implement such in your application, please refer to the [official documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/grid_virtualization.html)
- Added smooth scrolling for the `igxForOf` directive making the scrolling experience both vertically and horizontally much more natural and similar to a native scroll.
- Added `onCellClick` event.
- `igxForOf` now requires that its parent container's `overflow` is set to `hidden` and `position` to `relative`. It is recommended that its height is set as well so that the display container of the virtualized content can be positioned with an offset inside without visually affecting other elements on the page.
    ```html
    <div style='position: relative; height: 500px; overflow: hidden'>
        <ng-template igxFor let-item [igxForOf]="data" #virtDirVertical
                [igxForScrollOrientation]="'vertical'"
                [igxForContainerSize]='"500px"'
                [igxForItemSize]='"50px"'
                let-rowIndex="index">
                <div style='height:50px;'>{{rowIndex}} : {{item.text}}</div>
        </ng-template>
    </div>
    ```
- Removed the `dirty` local template variable previously exposed by the `igxFor` directive.
- The `igxForRemote` input for the `igxFor` directive is now **deprecated**. Setting the required `totalItemCount` property after receiving the first data chunk is enough to trigger the required functionality.
- the `igx-icon` component can now work with both glyph and ligature-based icon font sets. We've also included a brand new Icon Service, which helps you create aliases for the icon fonts you've included in your project. The service also allows you to define the default icon set used throughout your app.
- Added the option to conditionally disable the `igx-ripple` directive through the `igxRippleDisabled` property.
- Updated styling and interaction animations of the `igx-checkbox`, `igx-switch`, and `igx-radio` components.
- Added `indeterminate` property and styling to the `igx-checkbox` component.
- Added `required` property to the `igx-checkbox`, `igx-radio`, and `igx-switch` components.
- Added `igx-ripple` effect to the `igx-checkbox`, `igx-switch`, and `igx-radio` components. The effect can be disabled through the `disableRipple` property.
- Added the ability to specify the label location in the `igx-checkbox`, `igx-switch`, and `igx-radio` components through the `labelPosition` property. It can either be `before` or `after`.
- You can now use any element as label on the `igx-checkbox`, `igx-switch`, and `igx-radio` components via the aria-labelledby property.
- You can now have invisible label on the `igx-checkbox`, `igx-switch`, and `igx-radio` components via the aria-label property.
- Added the ability to toggle the `igx-checkbox` and `igx-switch` checked state programmatically via `toggle` method on the component instance.
- Added the ability to select an `igx-radio` programmatically via `select` method on the component instance.
- Fixed a bug on the `igx-checkbox` and `igx-radio` components where the click event was being triggered twice on click.
- Fixed a bug where the `igx-checkbox`, `igx-switch`, and `igx-radio` change event was not being triggered on label click.
- `igxМask` directive added
    - `igxМask` provide means for controlling user input and formatting the visible value based on a configurable mask rules. For more detailed information see [`igxMask README file`](https://github.com/IgniteUI/igniteui-angular/blob/master/src/directives/mask/README.md)
- `igxInputGroup` component added - used as a container for the `igxLabel`, `igxInput`, `igxPrefix`, `igxSuffix` and `igxHint` directives.
- `igxPrefix` directive added - used for input prefixes.
- `igxSuffix` directive added - used for input suffixes.
- `igxHint` directive added - used for input hints.
- `igxInput` directive breaking changes:
    - the directive should be wrapped by `igxInputGroup` component
    - `IgxInputGroupModule` should be imported instead of `IgxInputModule`
- `igxExcelExportService` and `igxCSVExportService` added. They add export capabilities to the `igxGrid`. For more information, please visit the [igxExcelExportService specification](https://github.com/IgniteUI/igniteui-angular/wiki/IgxExcelExporterService-Specification) and the [igxCSVExportService specification](https://github.com/IgniteUI/igniteui-angular/wiki/CSV-Exporter-Service-Specification).
- **General**
    - Added event argument types to all `EventEmitter` `@Output`s. #798 #740
    - Reviewed and added missing argument types to the following `EventEmitter`s
        - The `igxGrid` `onEditDone` now exposes arguments of type `IGridEditEventArgs`. The arguments expose `row` and `cell` objects where if the editing is performed on a cell, the edited `cell` and the `row` the cell belongs to are exposed. If row editing is performed, the `cell` object is null. In addition the `currentValue` and `newValue` arguments are exposed. If you assign a value to the `newValue` in your handler, then the editing will conclude with the value you've supplied.
        - The `igxGrid` `onSelection` now correctly propagates the original `event` in the `IGridCellEventArgs`.
    - Added `jsZip` as a Peer Dependency.
- `primaryKey` attribute added to `igxGrid`
    - `primaryKey` allows for a property name from the data source to be specified. If specified, `primaryKey` can be used instead of `index` to indentify grid rows from the `igxGrid.rowList`. As such, `primaryKey` can be used for selecting rows for the following `igxGrid` methods - `deleteRow`, `updateRow`, `updateCell`, `getCellByColumn`, `getRowByKey`
    - `primaryKey` requires all of the data for the specified property name to have unique values in order to function as expected.
    - as it provides a unique identifier for each data member (and therefore row), `primaryKey` is best suited for addressing grid row entries. If DOM virtualization is in place for the grid data, the row `index` property can be reused (for instance, when filtering/sorting the data), whereas `primaryKey` remains unique. Ideally, when a persistent reference to a row has to be established, `primaryKey` should be used.
- **Theming**
    - Added a `utilities` module to the theming engine to allow for easier import of theming functions and mixins, such as igx-color, igx-palette, igx-elevation, etc. To import the utilities do ```@import '~igniteui-angular/core/styles/themes/utilities';```

## 5.2.1
- `hammerjs` and `@types/hammerjs` are removed from `peerDependencies` and were added as `dependencies`. So if you are using Igniteui-Angular version 5.2.1 or above it is enough to run `npm install igniteui-angular` in your project for getting started. For more detailed information see [`Ignite UI for Angular Getting Started`](https://www.infragistics.com/products/ignite-ui-angular/getting-started)
- `web-animations-js` is added as Peer Dependency.
- `Theming` bug fixes and improvements.
- Use the following command to generate `Ignite UI for Angular Themes` documentation - `npm run build:docs`. Navigate to `dist/docs/sass` and open `index.html` file.

## 5.2.0
- `igxForOf` directive added
    - `igxForOf` is now available as an alternative to `ngForOf` for templating large amounts of data. The `igxForOf` uses virtualization technology behind the scenes to optimize DOM rendering and memory consumption. Virtualization technology works similar to Paging by slicing the data into smaller chucks which are swapped from a container viewport while the user scrolls the data horizontally/vertically. The difference with the Paging is that virtualization mimics the natural behavior of the scrollbar.
- `igxToggle` and `igxToggleAction` directives added
    - `igxToggle` allows users to implement toggleable components/views (eg. dropdowns), while `igxToggleAction` can control the
      `igxToggle` directive. Refer to the official documentation for more information.
    - `igxToggle` requires `BrowserAnimationsModule` to be imported in your application.
- [`Ignite UI for Angular Theming`](https://www.infragistics.com/products/ignite-ui-angular/angular/components/themes.html) - comprehensive set of **Sass** functions and mixins will give the ability to easily style your entire application or only certain parts of it.
    - Previously bundled fonts, are now listed as external dependencies. You should supply both the [Material Icons](http://google.github.io/material-design-icons/) and [Titillium Web](https://fonts.google.com/selection?selection.family=Titillium+Web:300,400,600,700) fonts yourself by either hosting or using CDN.
- `igx-grid` changes
    - The component now uses the new `igxForOf` directive to virtualize its content both vertically and horizontally dramatically improving performance for applications displaying large amounts of data.
    - Data-bound Input property `filtering` changed to `filterable`:

    ```html
    <igx-grid [data]="data">
        <igx-column [field]="'ReleaseDate'" [header]="'ReleaseDate'"
            [filterable]="true" dataType="date">
        </igx-column>
    </igx-grid>
    ```

    - @HostBinding `min-width` added to `IgxGridCellComponent` and `IgxGridHeaderCell`
    - The IgxGridCellComponent no longer has a value setter, but instead has an `update` modifier.

    ```html
    <ng-template igxCell let-cell="cell">
        {{ cell.update("newValue") }}
    </ng-template>
    ```
    - Class `IgxGridFiltering` renamed to `IgxGridFilteringComponent `
    - The grid filtering UI dropdowns are now controlled by the `igxToggle` directive.
      - Make sure to import `BrowserAnimationsModule` inside your application module as `igxToggle` uses animations for state transition.
    - `state` input
        - filtering expressions and sorting expressions provided
    - Removed `onCellSelection` and `onRowSelection` event emitters, `onSelection` added instead.
    - Removed `onBeforeProcess` event emitter.
    - Removed `onMovingDone` event emitter.
    - Removed methods `focusCell` and `focusRow`.
    - Renamed method `filterData` to `filter`.
    - New methods `filterGlobal` and `clearFilter`.
    - New method `clearSort`.
    - Renamed method `sortColumn` to `sort`.
    - New Input `sortingIgnoreCase` - Ignore capitalization of words.
- `igx-navigation-drawer` changes
    - `NavigationDrawer` renamed to `IgxNavigationDrawerComponent`
    - `NavigationDrawerModule` renamed to `IgxNavigationDrawerModule`
    - `IgxNavigationDirectives` renamed to `IgxNavigationModule`
    - `NavigationService` renamed to `IgxNavigationService`
    - `NavigationToggle` renamed to `IgxNavigationToggleDirective`
    - `NavigationClose` renamed to `IgxNavigationCloseDirective`
    - Content selector `ig-drawer-content` replaced with `<ng-template igxDrawer>`
    - Content selector `ig-drawer-mini-content` replaced with `<ng-template igxDrawerMini>`
    - CSS class `ig-nav-drawer-overlay` renamed to `igx-nav-drawer__overlay`
    - CSS class `ig-nav-drawer` renamed to `igx-nav-drawer`
- `igxInput` changes
    - CSS class `ig-form-group` to `igx-form-group`
- `igxBadge` changes
    - From now on, the Badge position is set by css class, which specifies an absolute position as well as top/bottom/left/right properties. The Badge position input should not be used.
- `igx-avatar` changes
    - [Initials type avatar is using SVG element from now on](https://github.com/IgniteUI/igniteui-angular/issues/136)
- `igx-calendar` changes
    - `formatViews` - Controls whether the date parts in the different calendar views should be formatted according to the provided `locale` and `formatOptions`.
    - `templating` - The **igxCalendar** supports now templating of its header and subheader parts.
    - `vertical` input - Controls the layout of the calendar component. When vertical is set to `true` the calendar header will be rendered to the side of the calendar body.

- `igx-nav-bar` changes
    -   Currently `isActionButtonVisible` resolves to `false` if actionButtonIcon is not defined.
- `igx-tab-bar` changes
    - custom content can be added for tabs

    ```html
    <igx-bottom-nav>
        <igx-tab-panel>
            <ng-template igxTab>
                <igx-avatar initials="T1">
                </igx-avatar>
            </ng-template>
            <h1>Tab 1 Content</h1>
        </igx-tab-panel>
    </igx-bottom-nav>
    ```

- `igx-scroll` component deleted
    - `igx-scroll` component is not available anymore due newly implemented `igxForOf` directive.

- [`igx-list` changes](https://github.com/IgniteUI/igniteui-angular/issues/528)
    - `igxEmptyList` directive added
        The list no longer has `emptyListImage`, `emptyListMessage`, `emptyListButtonText`, `emptyListButtonClick` and `hasNoItemsTemplate` members.
        Instead of them, the `igxEmptyListTemplateDirective` can be used for templating the list when it is empty (or use the default empty template).
        ```html
        <igx-list>
            <ng-template igxEmptyList>
                <p>My custom empty list template</p>
            </ng-template>
        </igx-list>
        ```
    - `onItemClicked` event emitter added
        ```html
        <igx-list (onItemClicked)="itemClicked()">
            <igx-list-item>Item 1</igx-list-item>
            <igx-list-item>Item 2</igx-list-item>
            <igx-list-item>Item 3</igx-list-item>
        </igx-list>
        ```
    - Removed `emptyListImage` property from `IgxListComponent`.
    - Removed `emptyListMessage` property from `IgxListComponent`.
    - Removed `emptyListButtonText` property from `IgxListComponent`.
    - Removed `emptyListButtonClick` event emitter from `IgxListComponent`.
    - Removed `hasNoItemsTemplate` property from `IgxListComponent`.
    - Removed `options` property from `IgxListItemComponent`.
    - Removed `left` property from `IgxListItemComponent`.
    - Removed `href` property from `IgxListItemComponent`.
    - New `emptyListTemplate` input for `IgxListComponent`.
    - New `onItemClicked` event emitter for `IgxListComponent`.
    - New `role` property for `IgxListComponent`.
    - New `innerStyle` property for `IgxListComponent`.
    - New `role` property for `IgxListItemComponent`.
    - New `element` property for `IgxListItemComponent`.
    - New `list` property for `IgxListItemComponent`.
    - New `headerStyle` property for `IgxListItemComponent`.
    - New `innerStyle` property for `IgxListItemComponent`.

- [Renaming and restructuring directives and components](https://github.com/IgniteUI/igniteui-angular/issues/536) based on the [General Angular Naming Guidelines](https://angular.io/guide/styleguide#naming):
    - `IgxAvatar` renamed to `IgxAvatarComponent`
    - `IgxBadge` renamed to `IgxBadgeComponent`
    - `IgxButton` renamed to `IgxButtonDirective`
    - `IgxButtonGroup` renamed to `IgxButtonGroupComponent`
    - `IgxCardHeader` renamed to `IgxCardHeaderDirective`
    - `IgxCardContent` renamed to `IgxCardContentDirective`
    - `IgxCardActions` renamed to `IgxCardActionsDirective`
    - `IgxCardFooter` renamed to `IgxCardFooterDirective`
    - `IgxCarousel` renamed to `IgxCarouselComponent`
    - `IgxInput` renamed to `IgxInputModule`
    - `IgxInputClass` renamed to `IgxInputDirective`
    - `IgxCheckbox` renamed to `IgxCheckboxComponent`
    - `IgxLabel` renamed to `IgxLabelDirective`
    - `IgxIcon` renamed to `IgxIconComponent`
    - `IgxList` renamed to `IgxListComponent`
    - `IgxListItem` renamed to `IgxListItemComponent`
    - `IgxSlide` renamed to `IgxSlideComponent`
    - `IgxDialog` renamed to `IgxDialogComponent`
    - `IgxLayout` renamed to `IgxLayoutModule`
    - `IgxNavbar` renamed to `IgxNavbarComponent`
    - `IgxCircularProgressBar` renamed to `IgxCircularProgressBarComponent`
    - `IgxLinearProgressBar ` renamed to `IgxLinearProgressBarComponent`
    - `IgxRadio` renamed to `IgxRadioComponent`
    - `IgxSlider` renamed to `IgxSliderComponent`
    - `IgxSnackbar` renamed to `IgxSnackbarComponent`
    - `IgxSwitch ` renamed to `IgxSwitchComponent`
    - `IgxTabBar` renamed to `IgxBottomNavComponent`
    - `IgxTabPanel` renamed to `IgxTabPanelComponent`
    - `IgxTab` renamed to `IgxTabComponent`
    - `IgxToast` renamed to `IgxToastComponent`
    - `IgxLabelDirective` moved inside `../directives/label/` folder
    - `IgxInputDirective` moved inside `../directives/input/` folder
    - `IgxButtonDirective` moved inside `../directives/button/` folder
    - `IgxLayoutDirective` moved inside `../directives/layout/` folder
    - `IgxFilterDirective` moved inside `../directives/filter/` folder
    - `IgxDraggableDirective` moved inside `../directives/dragdrop/` folder
    - `IgxRippleDirective` moved inside `../directives/ripple/` folder
    - Folder `"./navigation/nav-service"` renamed to `"./navigation/nav.service"`

