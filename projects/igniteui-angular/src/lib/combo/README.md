# igx-combo
The igx-combo provides a powerful input, combining features of the basic HTML input, select and the IgniteUI for Angular igx-drop-down controls.
Control provides easy filtering and selection of multiple items, grouping and adding custom values to the list.
Templates for different parts of the control can be defined, including items, header and footer, etc.
Control is integrated with Template Driven and Reactive Forms.
The igx-combo exposes intiutive keyboard navigation and it is accessibility compliant.
Drop Down items are virtualized, which guarantees smooth work, even combo is bound to data source with a lot of items.


`igx-combo` is a component.  
A walkthrough of how to get started can be found [here](https://www.infragistics.com/products/ignite-ui-angular/angular/components/combo.html)

# Usage


Basic usage of `igx-combo`

```html
<igx-combo [data]="items" [valueKey]="'field'" [groupKey]="'region'" placeholder="Location(s)">
	<ng-template #dropdownItemTemplate let-display let-key="valueKey">
		<div class="item">
			<span class="state">State: {{ display[key] }}</span>
			<span class="region">Region: {{ display.region }}</span>
		</div>
	</ng-template>
</igx-combo>
```

## API

# API Summary
| Name            | Description                                       | Type                        |
   |-----------------|---------------------------------------------------|-----------------------------|
   |  `data`         | combo data source                                 | any                         |
   |  `value`        | combo value                                       | string                      |
   |  `allowCustomValue`        | enable/disables combo custom value     | boolean                     |
   |  `valueKey`    | combo value data source property                  | string                      |
   |  `displayKey`    | combo text data source property                  | string                      |
   |  `groupKey`        | combo item group                               | string                      |
   |  `width `          | defines combo width                            | string                      |
   |  `heigth`          | defines combo height                           | string                      |
   |  `dropDownHeight ` | defines drop down height                       | string                      |
   |  `dropDownWidth ` | defines drop down width                       | string                      |
   |  `dropDownItemHeight ` | defines drop down item height                  | string                      |
   |  `placeholder `    | defines the "empty value" text                 | string                      |
   |  `collapsed`       | gets drop down state                           | boolean                      |

### Methods

   | Name     | Description                | Return type                                       | Parameters           |
   |----------|----------------------------|---------------------------------------------------|----------------------|
   | `open` | Opens drop down | -- | -- |
   | `close` | Closes drop down | -- | -- |
   | `toggle` | Toggles drop down | -- | -- |
   | `selectedItems` | Get current selection state | `Array<any>`- array with selected items' ID (itemData) | -- |
   | `selectItems` | Select defined items  | |`Array<any>`, clearCurrentSelection: `boolean` |
   | `deselectItems` | Deselect defined items | -- | `Array<any>` |
   | `selectAllItems` | Select all items | -- | -- |
   | `deselectAllItems` | Deselect all items | -- | -- |

   ### Events
|Name|Description|Cancelable|Parameters|
|--|--|--|--|
| `onSelectionChange` | -- | -- | { oldSelection: `Array<any>`, newSelection: `Array<any>`, event: Event }|
| `onSearchInput` | -- | -- | { oldValue: `any`, newValue: `any`, event: Event }|
| `dropDownOpening` | -- | -- | { event: Event }|
| `dropDownOpened` | -- | -- | { event: Event }|
| `dropDownClosing` | -- | -- | { event: Event }|
| `dropDownClosed` | -- | -- | { event: Event }|
| `onAddition` | -- | -- | { oldCollection: `Array<any>`, addedItem: `<any>`, newCollection: `Array<any>` }|